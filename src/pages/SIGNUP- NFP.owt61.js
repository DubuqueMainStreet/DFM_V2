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
	console.log('🚀🚀🚀 POPULATE DATE REPEATER CALLED - VERSION 2.0');
	try {
		const results = await wixData.query('MarketDates2026')
			.find();
		
		// Get availability data for all dates
		let availability = {};
		try {
			console.log('🔍 Calling getDateAvailability()...');
			console.log('📝 Note: Backend logs appear in Wix Editor → Dev Tools → Backend Logs, not browser console');
			
			const startTime = Date.now();
			
			// Try to call the backend function
			if (typeof getDateAvailability !== 'function') {
				throw new Error('getDateAvailability is not a function! Check import.');
			}
			
			availability = await getDateAvailability();
			const endTime = Date.now();
			
			console.log(`⏱️ getDateAvailability() took ${endTime - startTime}ms`);
			console.log('📅 Non-Profit Portal - Availability data received:', availability);
			console.log('📊 Availability type:', typeof availability);
			console.log('📊 Availability keys count:', Object.keys(availability).length);
			console.log('📊 Availability keys:', Object.keys(availability));
			
			// Validate the response
			if (!availability || typeof availability !== 'object') {
				console.error('❌ Invalid availability response:', availability);
				availability = {};
			} else if (Object.keys(availability).length === 0) {
				console.warn('⚠️ WARNING: Availability data is empty! Possible causes:');
				console.warn('   1. No approved assignments exist in WeeklyAssignments collection');
				console.warn('   2. Backend function returned empty object (check backend logs)');
				console.warn('   3. Date IDs in WeeklyAssignments don\'t match MarketDates2026 IDs');
				console.warn('   → Check Wix Editor → Dev Tools → Backend Logs for getDateAvailability()');
			} else {
				console.log('✅ Availability data received successfully with', Object.keys(availability).length, 'dates');
			}
		} catch (error) {
			console.error('❌ ERROR calling getDateAvailability():', error);
			console.error('Error details:', {
				message: error.message,
				name: error.name,
				stack: error.stack,
				toString: error.toString()
			});
			console.error('⚠️ This might be a permissions issue. Check:');
			console.error('   1. Backend function exists: src/backend/availabilityStatus.jsw');
			console.error('   2. Function is exported: export async function getDateAvailability()');
			console.error('   3. Permissions allow anonymous access (check permissions.json)');
			console.error('   4. WeeklyAssignments collection exists and is readable');
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
		
		// Debug: Log date IDs we're looking for vs what's in availability
		const marketDateIds = dateItems.map(item => item._id);
		const availabilityDateIds = Object.keys(availability);
		console.log('🔍 Date ID Comparison:');
		console.log('  MarketDates2026 IDs (first 3):', marketDateIds.slice(0, 3));
		console.log('  Availability object keys (first 3):', availabilityDateIds.slice(0, 3));
		console.log('  Any matches?', marketDateIds.some(id => availabilityDateIds.includes(id)));
		
		// Build repeater data with availability status
		const repeaterData = dateItems.map(item => {
			const daySuffix = getDaySuffix(item.day);
			const dateAvailability = availability[item._id];
			const nonProfitCount = dateAvailability ? dateAvailability.nonProfits : 0;
			
			// Debug logging for each date (only log first few and any with non-profits)
			if (dateItems.indexOf(item) < 3 || nonProfitCount > 0) {
				console.log(`📅 Date ${item.label} (ID: ${item._id}):`, {
					hasAvailabilityData: !!dateAvailability,
					nonProfitCount: nonProfitCount,
					dateIdInAvailability: item._id in availability,
					allAvailabilityKeys: availabilityDateIds
				});
			}
			
			// Debug logging for dates with non-profits
			if (nonProfitCount > 0) {
				console.log(`🔴 Date ${item.label} (ID: ${item._id}) has ${nonProfitCount} approved non-profit(s) - marking as FULL`);
			}
			
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
				
				// IMPORTANT: Set initial white background to prevent beige default
				if (container.style) {
					container.style.backgroundColor = '#FFFFFF';
				}
				
				// Apply styling function
				applyDateItemStyling(container, itemData, selectedDateIds);
				
				// Make entire container clickable to toggle selection
				const dateId = itemData._id;
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
						if (!selectedDateIds.includes(dateId)) {
							selectedDateIds.push(dateId);
						}
					}
					
					// Reapply styling to reflect new selection state
					applyDateItemStyling(container, itemData, selectedDateIds);
					
					console.log('Selected dates:', [...selectedDateIds]);
				});
			} catch (error) {
				console.error('Error setting up repeater item:', error);
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
	
	console.log(`🎨 STYLING: ${itemData.label} - status: ${itemData.status}, selected: ${isSelected}, full: ${isFull}`);
	
	try {
		// Ensure borderColor is in correct format
		const borderColor = itemData.borderColor.startsWith('#') 
			? itemData.borderColor 
			: `#${itemData.borderColor}`;
		
		// Set border color and width
		container.style.borderColor = borderColor;
		container.style.borderStyle = 'solid';
		container.style.borderWidth = isSelected ? '4px' : '3px';
		
		// IMPORTANT: Always use white background for unselected dates (no beige!)
		// Background color based on selection and availability
		if (isFull) {
			container.style.backgroundColor = '#F5F5F5'; // Light gray for full dates
			container.style.opacity = '0.5';
			container.style.cursor = 'not-allowed';
		} else if (isSelected) {
			container.style.backgroundColor = '#E3F2FD'; // Light blue for selected
			container.style.opacity = '1';
			container.style.cursor = 'pointer';
			container.style.fontWeight = '600';
			container.style.boxShadow = '0 4px 12px rgba(33, 150, 243, 0.4)';
		} else {
			// UNSELECTED dates - always white, never beige
			container.style.backgroundColor = '#FFFFFF'; // Pure white
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
			applyDateItemStyling($item('#itemContainer'), itemData, selectedDateIds);
		} catch (e) {
			console.warn('Failed to reset item styling:', e);
		}
	});
}
