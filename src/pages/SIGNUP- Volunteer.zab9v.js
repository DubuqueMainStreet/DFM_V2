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
		let availability = {};
		try {
			console.log('🔍 Volunteer Portal - Calling getDateAvailability()...');
			console.log('📝 Note: Backend logs appear in Wix Editor → Dev Tools → Backend Logs, not browser console');
			
			const startTime = Date.now();
			
			if (typeof getDateAvailability !== 'function') {
				throw new Error('getDateAvailability is not a function! Check import.');
			}
			
			availability = await getDateAvailability();
			const endTime = Date.now();
			
			console.log(`⏱️ getDateAvailability() took ${endTime - startTime}ms`);
			console.log('📅 Volunteer Portal - Availability data received:', availability);
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
					monthName: dateObj.toLocaleDateString('en-US', { month: 'short' })
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
				
				// Apply styling function
				applyDateItemStyling(container, itemData, selectedDateIds);
				
				// Make entire container clickable to toggle selection
				$item('#itemContainer').onClick(() => {
					// Prevent clicking on full dates
					if (itemData.status === 'full') {
						return;
					}
					
					const container = $item('#itemContainer');
					const isSelected = selectedDateIds.includes(itemData._id);
					
					if (isSelected) {
						// Deselect: remove from array
						selectedDateIds = selectedDateIds.filter(id => id !== itemData._id);
					} else {
						// Select: add to array
						if (!selectedDateIds.includes(itemData._id)) {
							selectedDateIds.push(itemData._id);
						}
					}
					
					// Reapply styling to reflect new selection state
					applyDateItemStyling(container, itemData, selectedDateIds);
					
					console.log('Selected dates:', selectedDateIds);
				});
			} catch (error) {
				console.error('Error styling repeater item:', error, itemData);
			}
		});
		
		// Populate repeater with data
		$w('#dateRepeater').data = repeaterData;
		
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
