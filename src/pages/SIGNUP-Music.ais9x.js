import wixData from 'wix-data';
import { submitSpecialtyProfile } from 'backend/formSubmissions.jsw';
import { getDateAvailability } from 'backend/availabilityStatus.jsw';

// Track selected dates (since we're using a repeater instead of selection tags)
let selectedDateIds = [];

// Track if onItemReady has been set up
let repeaterSetupComplete = false;

// Track which items have handlers registered (to prevent duplicate handlers)
const registeredHandlers = new Set();

$w.onReady(function () {
	populateMusicianTypeDropdown();
	populateLocationDropdown();
	populateDurationDropdown();
	populateGenreDropdown();
	setupRepeaterHandlers();
	populateDateRepeater();
	setupSubmitHandler();
	
	// Update date availability when location changes
	$w('#inputLocation').onChange(() => {
		populateDateRepeater();
	});
});

// Set up repeater handlers once (not every time data is updated)
function setupRepeaterHandlers() {
	if (repeaterSetupComplete) return;
	
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
			
			// Apply styling function
			applyDateItemStyling(container, itemData, selectedDateIds);
			
			// Only register onClick handler if not already registered for this item
			const dateId = itemData._id;
			if (!registeredHandlers.has(dateId)) {
				registeredHandlers.add(dateId);
				
				$item('#itemContainer').onClick(() => {
					// Prevent clicking on full dates
					if (itemData.status === 'full') {
						return;
					}
					
					const container = $item('#itemContainer');
					const isSelected = selectedDateIds.includes(dateId);
					
					if (isSelected) {
						// Deselect: remove from array
						selectedDateIds = selectedDateIds.filter(id => id !== dateId);
					} else {
						// Select: add to array
						selectedDateIds.push(dateId);
					}
					
					// Reapply styling to reflect new selection state
					applyDateItemStyling(container, itemData, selectedDateIds);
					
					console.log('Selected dates:', [...selectedDateIds]);
				});
			}
		} catch (error) {
			console.error('Error setting up repeater item:', error);
		}
	});
	
	repeaterSetupComplete = true;
}

async function populateDateRepeater() {
	// Preserve selected dates before any operations
	const preservedSelections = [...selectedDateIds];
	console.log('populateDateRepeater called. Preserving selections:', preservedSelections);
	
	try {
		const results = await wixData.query('MarketDates2026')
			.find();
		
		// Get availability data for all dates
		let availability = {};
		try {
			console.log('🔍 Musician Portal - Calling getDateAvailability()...');
			console.log('📝 Note: Backend logs appear in Wix Editor → Dev Tools → Backend Logs, not browser console');
			
			const startTime = Date.now();
			
			if (typeof getDateAvailability !== 'function') {
				throw new Error('getDateAvailability is not a function! Check import.');
			}
			
			availability = await getDateAvailability();
			const endTime = Date.now();
			
			console.log(`⏱️ getDateAvailability() took ${endTime - startTime}ms`);
			console.log('📅 Musician Portal - Availability data received:', availability);
			console.log('📊 Availability keys count:', Object.keys(availability).length);
			
			if (!availability || typeof availability !== 'object') {
				console.error('❌ Invalid availability response:', availability);
				availability = {};
			} else if (Object.keys(availability).length === 0) {
				console.warn('⚠️ WARNING: Availability data is empty! Check backend logs for details.');
			} else {
				console.log('✅ Availability data received successfully with', Object.keys(availability).length, 'dates');
			}
		} catch (error) {
			console.error('❌ ERROR calling getDateAvailability():', error);
			console.error('Error details:', {
				message: error.message,
				name: error.name,
				stack: error.stack
			});
			console.error('⚠️ This might be a permissions issue. Check collection permissions in Wix Content Manager.');
			availability = {}; // Fallback to empty object
		}
		
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
					monthName: dateObj.toLocaleDateString('en-US', { month: 'short' })
				};
			})
			.sort((a, b) => a.date - b.date);
		
		// Get selected location (if any)
		const selectedLocation = $w('#inputLocation').value;
		
		// Build repeater data with availability status based on location bookings
		const repeaterData = dateItems.map(item => {
			const daySuffix = getDaySuffix(item.day);
			const dateAvailability = availability[item._id];
			
			// Check if this date is currently selected (preserve selection state)
			const isCurrentlySelected = selectedDateIds.includes(item._id);
			
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
				isSelected: isCurrentlySelected
			};
		});
		
		// Ensure selectedDateIds hasn't been cleared
		if (selectedDateIds.length === 0 && preservedSelections.length > 0) {
			console.warn('⚠️ selectedDateIds was cleared! Restoring from preserved selections.');
			selectedDateIds = [...preservedSelections];
		}
		
		// Populate repeater with data (this will trigger onItemReady handlers)
		$w('#dateRepeater').data = repeaterData;
		
		// Double-check after setting data
		if (selectedDateIds.length === 0 && preservedSelections.length > 0) {
			console.warn('⚠️ selectedDateIds was cleared after setting data! Restoring.');
			selectedDateIds = [...preservedSelections];
		}
		
		// Update styling for all items after data is set
		setTimeout(() => {
			$w('#dateRepeater').forEachItem(($item, itemData, index) => {
				try {
					applyDateItemStyling($item('#itemContainer'), itemData, selectedDateIds);
				} catch (e) {
					console.warn('Failed to update item styling:', e);
				}
			});
		}, 100);
		
		console.log('Repeater data updated. Selected dates preserved:', selectedDateIds);
		
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
		const contactName = $w('#inputContactName').value?.trim() || null;
		const contactEmail = $w('#inputEmail').value?.trim();
		const contactPhone = $w('#inputPhone').value?.trim();
		const musicianType = $w('#inputMusicianType').value?.trim();
		const techNeeds = $w('#inputNeedsElectric').checked || false;
		const preferredLocation = $w('#inputLocation').value?.trim();
		const bio = $w('#inputBio').value?.trim();
		// Optional fields
		const website = $w('#inputWebsite').value?.trim() || null;
		const duration = $w('#inputDuration').value?.trim() || null;
		const genre = $w('#inputGenre').value?.trim() || null;
		
		// Get selected dates from our tracked array (instead of selection tags)
		const dateIds = [...selectedDateIds];
		
		console.log('Selected dates for submission:', dateIds);
		console.log('Number of dates selected:', dateIds.length);
		
		// Validate required fields (website is optional)
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
			contactName: contactName, // Optional - actual contact person name
			contactEmail: contactEmail,
			contactPhone: contactPhone,
			musicianType: musicianType,
			techNeeds: techNeeds,
			preferredLocation: preferredLocation,
			bio: bio,
			website: website, // Optional
			duration: duration, // Optional
			genre: genre // Optional
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
	$w('#inputContactName').value = '';
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
			applyDateItemStyling($item('#itemContainer'), itemData, selectedDateIds);
		} catch (e) {
			console.warn('Failed to reset item styling:', e);
		}
	});
}

/**
 * Apply comprehensive styling to a date repeater item
 * @param {Object} container - The container element
 * @param {Object} itemData - The item data with status, borderColor, _id
 * @param {Array} selectedDateIds - Array of selected date IDs
 */
function applyDateItemStyling(container, itemData, selectedDateIds) {
	if (!container || !container.style) return;
	
	const isSelected = selectedDateIds.includes(itemData._id);
	const isFull = itemData.status === 'full';
	const isLimited = itemData.status === 'limited';
	
	try {
		// Ensure borderColor is in correct format
		const borderColor = itemData.borderColor.startsWith('#') 
			? itemData.borderColor 
			: `#${itemData.borderColor}`;
		
		// Set border color and width
		container.style.borderColor = borderColor;
		container.style.borderStyle = 'solid';
		container.style.borderWidth = isSelected ? '4px' : '3px';
		
		// Background color based on selection and availability
		if (isFull) {
			container.style.backgroundColor = '#F5F5F5';
			container.style.opacity = '0.5';
			container.style.cursor = 'not-allowed';
		} else if (isSelected) {
			container.style.backgroundColor = '#E3F2FD';
			container.style.opacity = '1';
			container.style.cursor = 'pointer';
			container.style.fontWeight = '600';
			container.style.boxShadow = '0 4px 12px rgba(33, 150, 243, 0.4)';
		} else {
			container.style.backgroundColor = '#FFFFFF';
			container.style.opacity = '1';
			container.style.cursor = 'pointer';
			container.style.fontWeight = 'normal';
			container.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
		}
		
		// Add/remove CSS classes for advanced styling
		try {
			if (container.classList) {
				container.classList.remove('date-selected', 'date-full', 'date-limited', 'date-available');
				if (isSelected) container.classList.add('date-selected');
				if (isFull) container.classList.add('date-full');
				if (isLimited) container.classList.add('date-limited');
				if (!isFull && !isLimited) container.classList.add('date-available');
			}
		} catch (e) {
			// ClassList not available, continue without it
		}
		
		// Set data attributes for CSS targeting
		try {
			if (container.setAttribute) {
				container.setAttribute('data-selected', isSelected ? 'true' : 'false');
				container.setAttribute('data-status', itemData.status);
			}
		} catch (e) {
			// setAttribute not available
		}
		
		// Ensure proper mobile touch handling
		container.style.touchAction = 'manipulation';
		container.style.userSelect = 'none';
		container.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
		
	} catch (e) {
		console.warn('Failed to apply styling:', e);
	}
}
