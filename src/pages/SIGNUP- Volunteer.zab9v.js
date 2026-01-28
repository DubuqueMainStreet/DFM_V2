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
					console.error('❌ Container element not found for item:', itemData.label);
					return;
				}
				
				// Debug: Log container properties
				console.log(`📦 Container found for ${itemData.label}:`, {
					id: container.id,
					type: container.type,
					hasStyle: !!container.style,
					borderColor: itemData.borderColor,
					status: itemData.status
				});
				
				// Set data attribute for CSS targeting
				try {
					if (container.setAttribute) {
						container.setAttribute('data-availability-status', itemData.status);
						container.setAttribute('data-border-color', itemData.borderColor);
					}
				} catch (e) {
					console.warn('setAttribute not available:', e);
				}
				
				// Try to add CSS class (if supported)
				try {
					if (typeof container.addClass === 'function') {
						container.removeClass('availability-available');
						container.removeClass('availability-limited');
						container.removeClass('availability-full');
						container.addClass(`availability-${itemData.status}`);
						console.log(`✅ Added CSS class: availability-${itemData.status}`);
					}
				} catch (e) {
					console.warn('Class methods not available:', e);
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
				
				// Set initial selection state (preserve selection across role changes)
				const isCurrentlySelected = selectedDateIds.includes(itemData._id);
				if (isCurrentlySelected) {
					container.style.backgroundColor = '#E3F2FD';
				}
			} catch (error) {
				console.error('Error styling repeater item:', error, itemData);
			}
			
			// Make entire container clickable to toggle selection
			$item('#itemContainer').onClick(() => {
				const container = $item('#itemContainer');
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
	
	// Reset repeater selection styling
	$w('#dateRepeater').forEachItem(($item, itemData, index) => {
		try {
			$item('#itemContainer').style.backgroundColor = '';
		} catch (e) {
			// Ignore if can't clear background
		}
	});
}
