import wixData from 'wix-data';
import { submitSpecialtyProfile } from 'backend/formSubmissions.jsw';
import { getDateAvailability } from 'backend/availabilityStatus.jsw';

// Track selected dates
let selectedDateIds = [];

$w.onReady(function () {
	populateNonProfitTypeDropdown();
	populateDateRepeater();
	setupSubmitHandler();
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
					monthName: dateObj.toLocaleDateString('en-US', { month: 'short' })
				};
			})
			.sort((a, b) => a.date - b.date);
		
		// Build repeater data with availability status
		const repeaterData = dateItems.map(item => {
			const daySuffix = getDaySuffix(item.day);
			const dateAvailability = availability[item._id];
			const nonProfitCount = dateAvailability ? dateAvailability.nonProfits : 0;
			
			// Non-profits: only 1 per week, so 0 = available, 1+ = full
			let status = 'available';
			let borderColor = '#4CAF50'; // Green
			
			if (nonProfitCount >= 1) {
				status = 'full';
				borderColor = '#F44336'; // Red
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
						
						// Ensure proper mobile touch handling
						container.style.touchAction = 'manipulation';
						container.style.cursor = 'pointer';
						container.style.userSelect = 'none';
						
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
				// Use explicit dateId to avoid closure issues
				const dateId = itemData._id;
				$item('#itemContainer').onClick(() => {
					const container = $item('#itemContainer');
					const isSelected = selectedDateIds.includes(dateId);
					
					console.log('Date clicked:', itemData.label, 'ID:', dateId, 'Currently selected:', isSelected);
					
					if (isSelected) {
						// Deselect: remove from array and clear background
						selectedDateIds = selectedDateIds.filter(id => id !== dateId);
						try {
							// Use explicit white color instead of empty string for better mobile compatibility
							container.style.backgroundColor = '#FFFFFF';
						} catch (e) {
							console.warn('Failed to clear background:', e);
						}
					} else {
						// Select: add to array and highlight
						if (!selectedDateIds.includes(dateId)) {
							selectedDateIds.push(dateId);
						}
						try {
							container.style.backgroundColor = '#E3F2FD';
						} catch (e) {
							console.warn('Failed to set selection background:', e);
						}
					}
					
					console.log('Selected dates:', [...selectedDateIds]);
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

function populateNonProfitTypeDropdown() {
	const nonProfitTypeOptions = [
		{ value: 'Community Outreach', label: 'Community Outreach' },
		{ value: 'Health & Wellness', label: 'Health & Wellness' },
		{ value: 'Arts & Culture', label: 'Arts & Culture' },
		{ value: 'Education', label: 'Education' },
		{ value: 'Environment', label: 'Environment' },
		{ value: 'Social Services', label: 'Social Services' },
		{ value: 'Other', label: 'Other' }
	];
	$w('#inputNonProfitType').options = nonProfitTypeOptions;
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
		const nonProfitType = $w('#inputNonProfitType').value?.trim();
		const bio = $w('#inputBio').value?.trim();
		// Optional field
		const website = $w('#inputWebsite').value?.trim() || null;
		
		// Get selected dates from our tracked array
		const dateIds = [...selectedDateIds];
		
		console.log('Selected dates for submission:', dateIds);
		console.log('Number of dates selected:', dateIds.length);
		
		// Validate required fields (website is optional)
		if (!organizationName || !contactEmail || !contactPhone || !nonProfitType || !bio) {
			throw new Error('Organization name, email, phone, non-profit type, and description are required.');
		}
		
		if (!dateIds || dateIds.length === 0) {
			throw new Error('Please select at least one market date.');
		}
		
		const profileData = {
			type: 'NonProfit',
			title: organizationName,
			organizationName: organizationName,
			contactEmail: contactEmail,
			contactPhone: contactPhone,
			nonProfitType: nonProfitType,
			bio: bio,
			website: website // Optional
		};
		
		const result = await submitSpecialtyProfile(profileData, dateIds);
		console.log(`Successfully created profile and ${result.assignmentsCreated} WeeklyAssignments records`);
		
		$w('#msgSuccess').text = 'Non-profit application submitted successfully!';
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
	$w('#inputNonProfitType').value = '';
	$w('#inputBio').value = '';
	$w('#inputWebsite').value = '';
	
	// Reset selected dates
	selectedDateIds = [];
	
	// Reset repeater selection styling
	$w('#dateRepeater').forEachItem(($item, itemData, index) => {
		try {
			// Use explicit white color instead of empty string for better mobile compatibility
			$item('#itemContainer').style.backgroundColor = '#FFFFFF';
		} catch (e) {
			// Ignore if can't clear background
		}
	});
}
