import wixData from 'wix-data';
import { submitSpecialtyProfile } from 'backend/formSubmissions.jsw';
import { getDateAvailability } from 'backend/availabilityStatus.jsw';

$w.onReady(function () {
	populateMusicianTypeDropdown();
	populateLocationDropdown();
	populateDurationDropdown();
	populateGenreDropdown();
	populateDateTags();
	setupSubmitHandler();
});

async function populateDateTags() {
	try {
		const results = await wixData.query('MarketDates2026')
			.find();
		
		// Get availability data for all dates
		const availability = await getDateAvailability();
		
		// Process dates: parse, sort chronologically, group by month
		const dateItems = results.items
			.map(item => {
				const dateObj = new Date(item.date);
				return {
					_id: item._id,
					date: dateObj,
					month: dateObj.getMonth(),
					year: dateObj.getFullYear(),
					day: dateObj.getDate(),
					monthName: dateObj.toLocaleDateString('en-US', { month: 'long' })
				};
			})
			.sort((a, b) => a.date - b.date); // Sort chronologically
		
		// Group by month for organization
		const groupedByMonth = {};
		dateItems.forEach(item => {
			const monthKey = `${item.year}-${String(item.month).padStart(2, '0')}`;
			if (!groupedByMonth[monthKey]) {
				groupedByMonth[monthKey] = [];
			}
			groupedByMonth[monthKey].push(item);
		});
		
		// Build options with month-grouped labels and availability status
		const options = [];
		const monthColors = {
			'May': '#4CAF50',      // Green (spring)
			'June': '#2196F3',     // Blue (summer)
			'July': '#2196F3',     // Blue (summer)
			'August': '#2196F3',   // Blue (summer)
			'September': '#FF9800', // Orange (fall)
			'October': '#FF9800'    // Orange (fall)
		};
		
		Object.keys(groupedByMonth).sort().forEach(monthKey => {
			const dates = groupedByMonth[monthKey];
			const monthName = dates[0].monthName;
			const monthColor = monthColors[monthName] || '#757575'; // Default gray
			
			dates.forEach(item => {
				const daySuffix = getDaySuffix(item.day);
				const dateAvailability = availability[item._id];
				const musicianCount = dateAvailability ? dateAvailability.musicians : 0;
				
				// Determine status for musicians (0-1 = available, 2 = limited, 3+ = full)
				let status = 'available';
				let statusEmoji = '✓';
				if (musicianCount >= 3) {
					status = 'full';
					statusEmoji = '✕';
				} else if (musicianCount === 2) {
					status = 'limited';
					statusEmoji = '⚠';
				}
				
				const label = `${statusEmoji} ${item.monthName} ${item.day}${daySuffix}`;
				
				options.push({
					value: item._id,
					label: label,
					// Store month and availability info for styling
					month: monthName,
					color: monthColor,
					availabilityStatus: status
				});
			});
		});
		
		$w('#dateSelectionTags').options = options;
		
		// Apply custom styling based on availability after a short delay
		setTimeout(() => {
			applyAvailabilityStyling(options);
		}, 200);
	} catch (error) {
		console.error('Failed to load dates:', error);
		$w('#msgError').text = 'Failed to load available dates. Please refresh.';
		$w('#msgError').show();
	}
}

function applyAvailabilityStyling(options) {
	// Apply styling by finding elements with emoji content and adding inline styles
	setTimeout(() => {
		try {
			// Use document.querySelector to find tag elements and apply styles directly
			if (typeof document !== 'undefined') {
				// Find all clickable elements in the tag component
				const tagContainer = document.querySelector('[data-testid*="dateSelectionTags"], #dateSelectionTags, [id*="dateSelectionTags"]');
				if (tagContainer) {
					const allButtons = tagContainer.querySelectorAll('button, [role="button"], .tag-item, [class*="tag"]');
					
					allButtons.forEach(button => {
						const text = button.textContent || button.innerText || button.getAttribute('aria-label') || '';
						
						if (text.includes('✓')) {
							button.style.borderLeft = '4px solid #4CAF50';
							button.style.borderLeftWidth = '4px';
						} else if (text.includes('⚠')) {
							button.style.borderLeft = '4px solid #FF9800';
							button.style.borderLeftWidth = '4px';
						} else if (text.includes('✕')) {
							button.style.borderLeft = '4px solid #F44336';
							button.style.borderLeftWidth = '4px';
							button.style.opacity = '0.7';
						}
					});
				}
				
				// Also try a broader search
				const allPossibleTags = document.querySelectorAll('button, [role="button"]');
				allPossibleTags.forEach(el => {
					const text = el.textContent || el.innerText || '';
					const parent = el.closest('[id*="dateSelection"], [class*="dateSelection"]');
					if (parent && (text.includes('✓') || text.includes('⚠') || text.includes('✕'))) {
						if (text.includes('✓')) {
							el.style.borderLeft = '4px solid #4CAF50';
							el.style.borderLeftWidth = '4px';
						} else if (text.includes('⚠')) {
							el.style.borderLeft = '4px solid #FF9800';
							el.style.borderLeftWidth = '4px';
						} else if (text.includes('✕')) {
							el.style.borderLeft = '4px solid #F44336';
							el.style.borderLeftWidth = '4px';
							el.style.opacity = '0.7';
						}
					}
				});
			}
		} catch (error) {
			console.error('Error applying availability styling:', error);
		}
	}, 500);
}

function populateMusicianTypeDropdown() {
	// Set musician type options
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
	// Set performance location options
	const locationOptions = [
		{ value: 'Default', label: 'Default (No Preference)' },
		{ value: 'Location A', label: 'Location A' },
		{ value: 'Location B', label: 'Location B' },
		{ value: 'Location C', label: 'Location C' }
	];
	
	$w('#inputLocation').options = locationOptions;
}

function populateDurationDropdown() {
	// Set performance duration options
	const durationOptions = [
		{ value: '30 minutes', label: '30 minutes' },
		{ value: '1 hour', label: '1 hour' },
		{ value: '1.5 hours', label: '1.5 hours' },
		{ value: '2 hours', label: '2 hours' },
		{ value: 'Flexible', label: 'Flexible' }
	];
	
	$w('#inputDuration').options = durationOptions;
}

function populateGenreDropdown() {
	// Set music genre options
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

function formatDate(dateObj) {
	// Format Date object to readable string (e.g., "May 2, 2026")
	const date = new Date(dateObj);
	const options = { year: 'numeric', month: 'long', day: 'numeric' };
	return date.toLocaleDateString('en-US', options);
}

function setupSubmitHandler() {
	$w('#btnSubmit').onClick(async () => {
		await handleSubmit();
	});
}

async function handleSubmit() {
	try {
		// Reset feedback
		$w('#msgSuccess').hide();
		$w('#msgError').hide();
		$w('#btnSubmit').disable();
		
		// Validation
		const organizationName = $w('#inputName').value?.trim(); // Maps to organizationName field
		const contactEmail = $w('#inputEmail').value?.trim(); // Maps to contactEmail field
		const contactPhone = $w('#inputPhone').value?.trim(); // Maps to contactPhone field
		const musicianType = $w('#inputMusicianType').value?.trim();
		const techNeeds = $w('#inputNeedsElectric').checked || false; // Boolean field
		const preferredLocation = $w('#inputLocation').value?.trim();
		const bio = $w('#inputBio').value?.trim();
		const website = $w('#inputWebsite').value?.trim();
		const duration = $w('#inputDuration').value?.trim();
		const genre = $w('#inputGenre').value?.trim();
		
		// Get selected dates from selection tags component
		const selectionTags = $w('#dateSelectionTags');
		let selectedDates = selectionTags.value || selectionTags.selected || selectionTags.selectedValues;
		
		// Handle different return formats
		let dateIds = [];
		if (Array.isArray(selectedDates)) {
			dateIds = selectedDates;
		} else if (selectedDates && typeof selectedDates === 'object') {
			dateIds = selectedDates.values || Object.values(selectedDates);
		} else if (selectedDates) {
			dateIds = [selectedDates];
		}
		
		// Debug logging for date selection
		console.log('Selected dates from component:', selectedDates);
		console.log('Extracted dateIds:', dateIds);
		console.log('Number of dates selected:', dateIds.length);
		
		if (!organizationName || !contactEmail || !contactPhone || !musicianType || !preferredLocation || !bio) {
			throw new Error('Name, email, phone, musician type, location, and bio are required.');
		}
		
		if (!dateIds || dateIds.length === 0) {
			throw new Error('Please select at least one market date.');
		}
		
		// Upload file
		let fileUrl = null;
		if ($w('#uploadButton').files && $w('#uploadButton').files.length > 0) {
			const uploadResult = await $w('#uploadButton').startUpload();
			if (uploadResult && uploadResult.length > 0) {
				fileUrl = uploadResult[0].url;
			}
		}
		
		// Insert parent record
		// Using unified schema Field IDs that work for all signup types
		const profileData = {
			type: 'Musician', // Hardcoded since this is musician-only form
			title: organizationName, // Title field for reference display (fixes "Untitled" issue)
			organizationName: organizationName, // Unified field (name/org name)
			contactEmail: contactEmail, // Unified email field
			contactPhone: contactPhone, // Unified phone field
			musicianType: musicianType, // Musician-specific (should be Text field, not Tag)
			techNeeds: techNeeds, // Boolean field (true/false)
			preferredLocation: preferredLocation, // Works for all types (should be Text field, not Tag)
			bio: bio, // Works for all types
			website: website || null, // Works for all types
			duration: duration || null, // Musicians and events
			genre: genre || null // Musician-specific
		};
		
		// Use backend function with elevated permissions
		const result = await submitSpecialtyProfile(profileData, dateIds);
		console.log(`Successfully created profile and ${result.assignmentsCreated} WeeklyAssignments records`);
		
		// Success feedback
		$w('#msgSuccess').text = 'Application submitted successfully!';
		$w('#msgSuccess').show();
		
		// Reset form
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
	$w('#dateSelectionTags').selected = [];
	$w('#uploadButton').reset();
}
