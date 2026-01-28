import wixData from 'wix-data';
import { submitSpecialtyProfile } from 'backend/formSubmissions.jsw';
import { getDateAvailability } from 'backend/availabilityStatus.jsw';

// Track selected dates
let selectedDateIds = [];

$w.onReady(function () {
	populateVolunteerRoleDropdown();
	populateShiftPreferenceDropdown();
	populateDateRepeater();
	setupSubmitHandler();
	
	// Update date availability when volunteer role changes
	$w('#inputVolunteerRole').onChange(() => {
		populateDateRepeater();
	});
});

async function populateDateRepeater() {
	try {
		const results = await wixData.query('MarketDates2026')
			.find();
		
		// Get availability data for all dates
		const availability = await getDateAvailability();
		
		// Get selected volunteer role (if any)
		const selectedRole = $w('#inputVolunteerRole').value || 'No Preference';
		
		// Role-specific limits
		const roleLimits = {
			'Token Sales': 2,
			'Merch Sales': 2,
			'Setup': 2,
			'Teardown': 2,
			'Hospitality Support': 2,
			'No Preference': 1
		};
		
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
			const roleCount = dateAvailability && dateAvailability.volunteers[selectedRole] 
				? dateAvailability.volunteers[selectedRole] 
				: 0;
			
			// Determine status based on role-specific limits
			const limit = roleLimits[selectedRole] || 2;
			let status = 'available';
			let borderColor = '#4CAF50'; // Green
			
			if (roleCount >= limit) {
				status = 'full';
				borderColor = '#F44336'; // Red
			} else if (roleCount >= Math.floor(limit * 0.7)) {
				status = 'limited';
				borderColor = '#FF9800'; // Orange
			}
			
			// Preserve selection state if date was previously selected
			const wasSelected = selectedDateIds.includes(item._id);
			
			return {
				_id: item._id,
				label: `${item.monthName} ${item.day}${daySuffix}`,
				status: status,
				borderColor: borderColor,
				isSelected: wasSelected
			};
		});
		
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
				
				// Remove any existing availability classes
				container.removeClass('availability-available');
				container.removeClass('availability-limited');
				container.removeClass('availability-full');
				
				// Add status class for CSS fallback
				container.addClass(`availability-${itemData.status}`);
				
				// Apply border styling - try multiple approaches for compatibility
				if (container.style) {
					// Method 1: Set border as single property (most reliable)
					container.style.border = `3px solid ${itemData.borderColor}`;
					
					// Method 2: Also set individual properties
					container.style.borderColor = itemData.borderColor;
					container.style.borderWidth = '3px';
					container.style.borderStyle = 'solid';
					
					// Apply opacity for full dates
					if (itemData.status === 'full') {
						container.style.opacity = '0.6';
					} else {
						container.style.opacity = '1';
					}
					
					console.log(`Applied border color ${itemData.borderColor} (${itemData.status}) to date ${itemData.label}`);
				} else {
					console.warn('Container style property not available');
				}
				
				// Set initial checkbox state (preserve selection across role changes)
				$item('#itemCheckbox').checked = itemData.isSelected;
				if (itemData.isSelected) {
					container.style.backgroundColor = '#E3F2FD';
				} else {
					container.style.backgroundColor = 'transparent';
				}
			} catch (error) {
				console.error('Error styling repeater item:', error, itemData);
			}
			
			// Handle checkbox changes
			$item('#itemCheckbox').onChange((event) => {
				const container = $item('#itemContainer');
				const isChecked = event.target.checked;
				if (isChecked) {
					if (!selectedDateIds.includes(itemData._id)) {
						selectedDateIds.push(itemData._id);
					}
					container.style.backgroundColor = '#E3F2FD';
				} else {
					selectedDateIds = selectedDateIds.filter(id => id !== itemData._id);
					container.style.backgroundColor = 'transparent';
				}
				console.log('Selected dates:', selectedDateIds);
			});
			
			// Also allow clicking the container to toggle
			$item('#itemContainer').onClick(() => {
				const container = $item('#itemContainer');
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
					container.style.backgroundColor = 'transparent';
				}
				console.log('Selected dates:', selectedDateIds);
			});
		});
		
		// Populate repeater with data
		$w('#dateRepeater').data = repeaterData;
		
	} catch (error) {
		console.error('Failed to load dates:', error);
		$w('#msgError').text = 'Failed to load available dates. Please refresh.';
		$w('#msgError').show();
	}
}

function populateVolunteerRoleDropdown() {
	const volunteerRoleOptions = [
		{ value: 'Token Sales', label: 'Token Sales' },
		{ value: 'Merch Sales', label: 'Merch Sales' },
		{ value: 'Setup', label: 'Setup' },
		{ value: 'Teardown', label: 'Teardown' },
		{ value: 'Hospitality Support', label: 'Hospitality Support' },
		{ value: 'No Preference', label: 'No Preference' }
	];
	$w('#inputVolunteerRole').options = volunteerRoleOptions;
}

function populateShiftPreferenceDropdown() {
	const shiftOptions = [
		{ value: 'Early Shift', label: 'Early Shift (7:00 AM - 9:30 AM)' },
		{ value: 'Late Shift', label: 'Late Shift (9:30 AM - 12:00 PM)' },
		{ value: 'Both', label: 'Both Shifts' }
	];
	$w('#inputShiftPreference').options = shiftOptions;
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
		const volunteerRole = $w('#inputVolunteerRole').value?.trim();
		const shiftPreference = $w('#inputShiftPreference').value?.trim();
		const bio = $w('#inputBio').value?.trim();
		
		// Get selected dates from our tracked array
		const dateIds = [...selectedDateIds];
		
		console.log('Selected dates for submission:', dateIds);
		console.log('Number of dates selected:', dateIds.length);
		
		if (!organizationName || !contactEmail || !contactPhone || !volunteerRole || !shiftPreference) {
			throw new Error('Name, email, phone, volunteer role, and shift preference are required.');
		}
		
		if (!dateIds || dateIds.length === 0) {
			throw new Error('Please select at least one market date.');
		}
		
		const profileData = {
			type: 'Volunteer',
			title: organizationName,
			organizationName: organizationName,
			contactEmail: contactEmail,
			contactPhone: contactPhone,
			volunteerRole: volunteerRole,
			shiftPreference: shiftPreference,
			bio: bio || null
		};
		
		const result = await submitSpecialtyProfile(profileData, dateIds);
		console.log(`Successfully created profile and ${result.assignmentsCreated} WeeklyAssignments records`);
		
		$w('#msgSuccess').text = 'Volunteer application submitted successfully!';
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
	$w('#inputVolunteerRole').value = '';
	$w('#inputShiftPreference').value = '';
	$w('#inputBio').value = '';
	
	// Reset selected dates
	selectedDateIds = [];
	
	// Reset repeater checkboxes and styling
	$w('#dateRepeater').forEachItem(($item, itemData, index) => {
		$item('#itemCheckbox').checked = false;
		$item('#itemContainer').style.backgroundColor = 'transparent';
	});
}
