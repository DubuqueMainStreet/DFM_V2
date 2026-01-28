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
						
						console.log(`✅ Applied border color ${borderColor} (${itemData.status}) to ${itemData.label}`);
					} catch (e) {
						console.warn('Failed to set container border:', e);
					}
				}
				
				// Set initial checkbox state
				$item('#itemCheckbox').checked = false;
				
				// Handle checkbox changes
				$item('#itemCheckbox').onChange((event) => {
					const isChecked = event.target.checked;
					if (isChecked) {
						if (!selectedDateIds.includes(itemData._id)) {
							selectedDateIds.push(itemData._id);
						}
						container.style.backgroundColor = '#E3F2FD';
					} else {
						selectedDateIds = selectedDateIds.filter(id => id !== itemData._id);
						try {
							container.style.backgroundColor = '';
						} catch (e) {
							// Ignore if can't clear background
						}
					}
					console.log('Selected dates:', selectedDateIds);
				});
				
				// Also allow clicking the container to toggle
				$item('#itemContainer').onClick(() => {
					const checkbox = $item('#itemCheckbox');
					checkbox.checked = !checkbox.checked;
					const isChecked = checkbox.checked;
					if (isChecked) {
						if (!selectedDateIds.includes(itemData._id)) {
							selectedDateIds.push(itemData._id);
						}
						container.style.backgroundColor = '#E3F2FD';
					} else {
						selectedDateIds = selectedDateIds.filter(id => id !== itemData._id);
						try {
							container.style.backgroundColor = '';
						} catch (e) {
							// Ignore if can't clear background
						}
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
		const website = $w('#inputWebsite').value?.trim();
		
		// Get selected dates from our tracked array
		const dateIds = [...selectedDateIds];
		
		console.log('Selected dates for submission:', dateIds);
		console.log('Number of dates selected:', dateIds.length);
		
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
			website: website || null
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
	
	// Reset repeater checkboxes and styling
	$w('#dateRepeater').forEachItem(($item, itemData, index) => {
		$item('#itemCheckbox').checked = false;
		try {
			$item('#itemContainer').style.backgroundColor = '';
		} catch (e) {
			// Ignore if can't clear background
		}
	});
}
