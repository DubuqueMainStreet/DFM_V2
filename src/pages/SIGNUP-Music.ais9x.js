import wixData from 'wix-data';
import { submitSpecialtyProfile } from 'backend/formSubmissions.jsw';
import { getDateAvailability } from 'backend/availabilityStatus.jsw';

// Track selected dates (since we're using a repeater instead of selection tags)
let selectedDateIds = [];

$w.onReady(function () {
	populateMusicianTypeDropdown();
	populateLocationDropdown();
	populateDurationDropdown();
	populateGenreDropdown();
	populateDateRepeater();
	setupSubmitHandler();
	
	// Update date availability when location changes
	$w('#inputLocation').onChange(() => {
		populateDateRepeater();
	});
});

async function populateDateRepeater() {
	try {
		const results = await wixData.query('MarketDates2026')
			.find();
		
		// Get availability data for all dates
		const availability = await getDateAvailability();
		
		// Process dates: parse, sort chronologically
		// Fix timezone issue: parse date strings as local time, not UTC
		const dateItems = results.items
			.map(item => {
				// Handle date parsing to avoid timezone issues
				let dateObj;
				if (typeof item.date === 'string') {
					// If it's a date string like "2026-05-02", parse it as local time
					const dateStr = item.date.split('T')[0]; // Get YYYY-MM-DD part
					const [year, month, day] = dateStr.split('-').map(Number);
					dateObj = new Date(year, month - 1, day, 12, 0, 0, 0); // Use noon local time
				} else {
					// If it's already a Date object
					dateObj = new Date(item.date);
					// Set to noon local time to avoid timezone edge cases
					dateObj.setHours(12, 0, 0, 0);
				}
				
				return {
					_id: item._id,
					date: dateObj,
					month: dateObj.getMonth(),
					year: dateObj.getFullYear(),
					day: dateObj.getDate(),
					monthName: dateObj.toLocaleDateString('en-US', { month: 'long' })
				};
			})
			.sort((a, b) => a.date - b.date);
		
		// Get selected location (if any)
		const selectedLocation = $w('#inputLocation').value;
		
		// Build repeater data with availability status based on location bookings
		const repeaterData = dateItems.map(item => {
			const daySuffix = getDaySuffix(item.day);
			const dateAvailability = availability[item._id];
			
			// If a location is selected, check availability for that specific location
			let status = 'available';
			let borderColor = '#4CAF50'; // Green
			
			if (selectedLocation && dateAvailability && dateAvailability.musiciansByLocation) {
				// Check if the selected location is already booked
				const locationBooked = dateAvailability.musiciansByLocation[selectedLocation] >= 1;
				
				if (locationBooked) {
					// Selected location is already taken - show as full/red
					status = 'full';
					borderColor = '#F44336'; // Red
				} else {
					// Selected location is available - check overall availability
					const locations = dateAvailability.musiciansByLocation;
					let bookedLocations = 0;
					if (locations['Location A'] >= 1) bookedLocations++;
					if (locations['Location B'] >= 1) bookedLocations++;
					if (locations['Location C'] >= 1) bookedLocations++;
					
					// Determine status based on other locations
					if (bookedLocations >= 2) {
						status = 'limited';
						borderColor = '#FF9800'; // Orange - other locations getting full
					}
					// Otherwise available (green)
				}
			} else {
				// No location selected - show overall availability
				let bookedLocations = 0;
				if (dateAvailability && dateAvailability.musiciansByLocation) {
					const locations = dateAvailability.musiciansByLocation;
					if (locations['Location A'] >= 1) bookedLocations++;
					if (locations['Location B'] >= 1) bookedLocations++;
					if (locations['Location C'] >= 1) bookedLocations++;
				}
				
				if (bookedLocations >= 3) {
					status = 'full';
					borderColor = '#F44336'; // Red - all locations booked
				} else if (bookedLocations === 2) {
					status = 'limited';
					borderColor = '#FF9800'; // Orange - only 1 location available
				}
			}
			
			return {
				_id: item._id,
				label: `${item.monthName} ${item.day}${daySuffix}`,
				status: status,
				borderColor: borderColor,
				isSelected: false
			};
		});
		
		// Reset selected dates
		selectedDateIds = [];
		
		// Set up repeater
		$w('#dateRepeater').onItemReady(($item, itemData, index) => {
			try {
				// Set label text
				$item('#itemLabel').text = itemData.label;
				
				// Get container element
				const container = $item('#itemContainer');
				
				if (!container) {
					console.error('Container element not found for item:', itemData.label);
					return;
				}
				
				// Style the container border based on availability status
				if (container.style) {
					try {
						// Ensure borderColor is in correct format (#RRGGBB)
						const borderColor = itemData.borderColor.startsWith('#') 
							? itemData.borderColor 
							: `#${itemData.borderColor}`;
						
						// Set border color
						container.style.borderColor = borderColor;
						container.style.borderWidth = '3px';
						container.style.borderStyle = 'solid';
						
						// Apply opacity for full dates
						if (itemData.status === 'full') {
							container.style.opacity = '0.6';
						} else {
							container.style.opacity = '1';
						}
						
						console.log(`✅ Applied border color ${borderColor} (${itemData.status}) to ${itemData.label}`);
					} catch (e) {
						console.warn('Failed to set container border:', e);
					}
				}
				
				// Set initial selection state (not selected)
				const isCurrentlySelected = selectedDateIds.includes(itemData._id);
				if (isCurrentlySelected) {
					container.style.backgroundColor = '#E3F2FD';
				}
				
				// Make entire container clickable to toggle selection
				$item('#itemContainer').onClick(() => {
					const isSelected = selectedDateIds.includes(itemData._id);
					
					if (isSelected) {
						// Deselect: remove from array and clear background
						selectedDateIds = selectedDateIds.filter(id => id !== itemData._id);
						try {
							container.style.backgroundColor = '';
						} catch (e) {
							// Ignore if can't clear background
						}
					} else {
						// Select: add to array and highlight
						if (!selectedDateIds.includes(itemData._id)) {
							selectedDateIds.push(itemData._id);
						}
						container.style.backgroundColor = '#E3F2FD';
					}
					
					console.log('Selected dates:', selectedDateIds);
				});
			} catch (error) {
				console.error('Error setting up repeater item:', error);
			}
		});
		
		// Populate repeater with data
		$w('#dateRepeater').data = repeaterData;
		
	} catch (error) {
		console.error('Failed to load dates:', error);
		$w('#msgError').text = 'Failed to load available dates. Please refresh.';
		$w('#msgError').show();
	}
}

function populateMusicianTypeDropdown() {
	const musicianTypeOptions = [
		{ value: 'Solo Acoustic', label: 'Solo Acoustic' },
		{ value: 'Solo Electric', label: 'Solo Electric' },
		{ value: 'Duo Acoustic', label: 'Duo Acoustic' },
		{ value: 'Duo Electric', label: 'Duo Electric' },
		{ value: 'Small Band (3-4 members)', label: 'Small Band (3-4 members)' },
		{ value: 'Large Band (5+ members)', label: 'Large Band (5+ members)' },
		{ value: 'Other', label: 'Other' }
	];
	$w('#inputMusicianType').options = musicianTypeOptions;
}

function populateLocationDropdown() {
	const locationOptions = [
		{ value: 'Location A', label: '13th Street' },
		{ value: 'Location B', label: 'Food Court' },
		{ value: 'Location C', label: '10th & Iowa St' }
	];
	$w('#inputLocation').options = locationOptions;
}

function populateDurationDropdown() {
	const durationOptions = [
		{ value: '5 hours', label: '5 hours' },
		{ value: '4 hours', label: '4 hours' },
		{ value: '3 hours', label: '3 hours' },
		{ value: '2 hours', label: '2 hours' },
		{ value: '1 hour', label: '1 hour' }
	];
	$w('#inputDuration').options = durationOptions;
}

function populateGenreDropdown() {
	const genreOptions = [
		{ value: 'Acoustic/Folk', label: 'Acoustic/Folk' },
		{ value: 'Country', label: 'Country' },
		{ value: 'Jazz', label: 'Jazz' },
		{ value: 'Blues', label: 'Blues' },
		{ value: 'Rock', label: 'Rock' },
		{ value: 'Pop', label: 'Pop' },
		{ value: 'Classical', label: 'Classical' },
		{ value: 'Bluegrass', label: 'Bluegrass' },
		{ value: 'World Music', label: 'World Music' },
		{ value: 'Other', label: 'Other' }
	];
	$w('#inputGenre').options = genreOptions;
}

function getDaySuffix(day) {
	if (day > 3 && day < 21) return 'th';
	switch (day % 10) {
		case 1: return 'st';
		case 2: return 'nd';
		case 3: return 'rd';
		default: return 'th';
	}
}

function setupSubmitHandler() {
	$w('#btnSubmit').onClick(async () => {
		await handleSubmit();
	});
}

async function handleSubmit() {
	try {
		$w('#msgSuccess').hide();
		$w('#msgError').hide();
		$w('#btnSubmit').disable();
		
		const organizationName = $w('#inputName').value?.trim();
		const contactEmail = $w('#inputEmail').value?.trim();
		const contactPhone = $w('#inputPhone').value?.trim();
		const musicianType = $w('#inputMusicianType').value?.trim();
		const techNeeds = $w('#inputNeedsElectric').checked || false;
		const preferredLocation = $w('#inputLocation').value?.trim();
		const bio = $w('#inputBio').value?.trim();
		const website = $w('#inputWebsite').value?.trim();
		const duration = $w('#inputDuration').value?.trim();
		const genre = $w('#inputGenre').value?.trim();
		
		// Get selected dates from our tracked array (instead of selection tags)
		const dateIds = [...selectedDateIds];
		
		console.log('Selected dates for submission:', dateIds);
		console.log('Number of dates selected:', dateIds.length);
		
		if (!organizationName || !contactEmail || !contactPhone || !musicianType || !preferredLocation || !bio) {
			throw new Error('Name, email, phone, musician type, location, and bio are required.');
		}
		
		if (!dateIds || dateIds.length === 0) {
			throw new Error('Please select at least one market date.');
		}
		
		let fileUrl = null;
		if ($w('#uploadButton').files && $w('#uploadButton').files.length > 0) {
			const uploadResult = await $w('#uploadButton').startUpload();
			if (uploadResult && uploadResult.length > 0) {
				fileUrl = uploadResult[0].url;
			}
		}
		
		const profileData = {
			type: 'Musician',
			title: organizationName,
			organizationName: organizationName,
			contactEmail: contactEmail,
			contactPhone: contactPhone,
			musicianType: musicianType,
			techNeeds: techNeeds,
			preferredLocation: preferredLocation,
			bio: bio,
			website: website || null,
			duration: duration || null,
			genre: genre || null
		};
		
		const result = await submitSpecialtyProfile(profileData, dateIds);
		console.log(`Successfully created profile and ${result.assignmentsCreated} WeeklyAssignments records`);
		
		$w('#msgSuccess').text = 'Application submitted successfully!';
		$w('#msgSuccess').show();
		
		resetForm();
		
	} catch (error) {
		console.error('Submit error:', error);
		$w('#msgError').text = error.message || 'Submission failed. Please try again.';
		$w('#msgError').show();
	} finally {
		$w('#btnSubmit').enable();
	}
}

function resetForm() {
	$w('#inputName').value = '';
	$w('#inputEmail').value = '';
	$w('#inputPhone').value = '';
	$w('#inputMusicianType').value = '';
	$w('#inputNeedsElectric').checked = false;
	$w('#inputLocation').value = '';
	$w('#inputBio').value = '';
	$w('#inputWebsite').value = '';
	$w('#inputDuration').value = '';
	$w('#inputGenre').value = '';
	$w('#uploadButton').reset();
	
	// Reset selected dates
	selectedDateIds = [];
	
	// Reset repeater selection styling
	$w('#dateRepeater').forEachItem(($item, itemData, index) => {
		try {
			$item('#itemContainer').style.backgroundColor = '';
		} catch (e) {
			// Ignore if can't clear background
		}
	});
}
