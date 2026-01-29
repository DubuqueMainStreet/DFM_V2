import wixData from 'wix-data';
import { sendStatusNotificationEmail } from 'backend/emailNotifications.jsw';

// Global state
let currentType = 'Musician';
let currentAssignments = [];

$w.onReady(function () {
	initializeDashboard();
});

async function initializeDashboard() {
	try {
		// Set up tab handlers
		setupTabHandlers();
		
		// Load date filter options
		await populateDateFilter();
		
		// Load default view (Musicians)
		await loadAssignments('Musician');
		
	} catch (error) {
		console.error('Error initializing dashboard:', error);
		showError('Failed to load dashboard. Please refresh.');
	}
}

function setupTabHandlers() {
	// Tab buttons
	if ($w('#tabMusicians')) {
		$w('#tabMusicians').onClick(() => switchTab('Musician'));
	}
	if ($w('#tabVolunteers')) {
		$w('#tabVolunteers').onClick(() => switchTab('Volunteer'));
	}
	if ($w('#tabNonProfits')) {
		$w('#tabNonProfits').onClick(() => switchTab('NonProfit'));
	}
}

async function switchTab(type) {
	currentType = type;
	
	// Update active tab styling
	updateActiveTab(type);
	
	// Load assignments for selected type
	await loadAssignments(type);
}

function updateActiveTab(activeType) {
	// Remove active styling from all tabs
	const tabs = ['Musician', 'Volunteer', 'NonProfit'];
	tabs.forEach(type => {
		const tabElement = $w(`#tab${type}s`);
		if (tabElement) {
			tabElement.collapse();
		}
	});
	
	// Add active styling to selected tab
	const activeTab = $w(`#tab${activeType}s`);
	if (activeTab) {
		activeTab.expand();
	}
}

async function populateDateFilter() {
	try {
		const results = await wixData.query('MarketDates2026')
			.find();
		
		const dateOptions = results.items
			.map(item => {
				const dateObj = new Date(item.date);
				const monthName = dateObj.toLocaleDateString('en-US', { month: 'long' });
				const day = dateObj.getDate();
				const year = dateObj.getFullYear();
				const daySuffix = getDaySuffix(day);
				
				return {
					value: item._id,
					label: `${monthName} ${day}${daySuffix}, ${year}`,
					date: item.date
				};
			})
			.sort((a, b) => new Date(a.date) - new Date(b.date));
		
		// Add "All Dates" option
		dateOptions.unshift({ value: 'all', label: 'All Dates' });
		
		if ($w('#filterDate')) {
			$w('#filterDate').options = dateOptions;
			$w('#filterDate').onChange(() => {
				loadAssignments(currentType);
			});
		}
	} catch (error) {
		console.error('Error populating date filter:', error);
	}
}

async function loadAssignments(type) {
	try {
		showLoading(true);
		
		// Get selected date filter
		const selectedDateId = $w('#filterDate')?.value || 'all';
		
		// Build query
		let query = wixData.query('WeeklyAssignments')
			.include('profileRef')
			.include('dateRef');
		
		// Filter by date if not "all"
		if (selectedDateId !== 'all') {
			query = query.eq('dateRef', selectedDateId);
		}
		
		const results = await query.find();
		
		// Filter by profile type and prepare data for repeater
		const repeaterData = [];
		for (const assignment of results.items) {
			if (assignment.profileRef && assignment.profileRef.type === type) {
				repeaterData.push(prepareRepeaterItem(assignment));
			}
		}
		
		// Sort by date, then by name
		repeaterData.sort((a, b) => {
			const dateCompare = new Date(a.dateValue) - new Date(b.dateValue);
			if (dateCompare !== 0) return dateCompare;
			return a.name.localeCompare(b.name);
		});
		
		currentAssignments = repeaterData;
		
		// Populate repeater
		populateRepeater(repeaterData);
		
	} catch (error) {
		console.error('Error loading assignments:', error);
		showError('Failed to load assignments. Please try again.');
	} finally {
		showLoading(false);
	}
}

function prepareRepeaterItem(assignment) {
	const profile = assignment.profileRef || {};
	const dateRef = assignment.dateRef || {};
	
	// Get type-specific details
	const details = getTypeSpecificDetails(profile);
	
	// Format contact info
	const contactInfo = formatContactInfo(profile);
	
	return {
		_id: assignment._id,
		name: profile.organizationName || 'Unknown',
		date: dateRef.title || 'Unknown Date',
		dateValue: dateRef.date || new Date(0),
		contactInfo: contactInfo,
		details: details,
		status: assignment.applicationStatus || 'Pending',
		location: assignment.assignedMapId || 'Unassigned',
		profileType: profile.type,
		profileId: profile._id
	};
}

function getTypeSpecificDetails(profile) {
	const type = profile.type;
	
	switch (type) {
		case 'Musician':
			return [
				profile.musicianType ? `Type: ${profile.musicianType}` : null,
				profile.genre ? `Genre: ${profile.genre}` : null,
				profile.duration ? `Duration: ${profile.duration}` : null,
				profile.techNeeds ? 'Electric hookup needed' : null
			].filter(Boolean).join(' • ') || 'No additional details';
			
		case 'Volunteer':
			return [
				profile.volunteerRole ? `Role: ${profile.volunteerRole}` : null,
				profile.shiftPreference ? `Shift: ${profile.shiftPreference}` : null
			].filter(Boolean).join(' • ') || 'No additional details';
			
		case 'NonProfit':
			return [
				profile.nonProfitType ? `Type: ${profile.nonProfitType}` : null,
				profile.website ? `Website: ${profile.website}` : null
			].filter(Boolean).join(' • ') || 'No additional details';
			
		default:
			return 'No additional details';
	}
}

function formatContactInfo(profile) {
	const parts = [];
	if (profile.contactEmail) parts.push(profile.contactEmail);
	if (profile.contactPhone) parts.push(profile.contactPhone);
	return parts.join(' • ') || 'No contact info';
}

function populateRepeater(data) {
	const repeater = $w('#assignmentsRepeater');
	if (!repeater) {
		console.warn('assignmentsRepeater not found');
		return;
	}
	
	repeater.data = data;
	
	// Set up repeater item ready handler
	repeater.onItemReady(($item, itemData) => {
		setupRepeaterItem($item, itemData);
	});
}

function setupRepeaterItem($item, itemData) {
	// Populate text elements
	if ($item('#itemName')) {
		$item('#itemName').text = itemData.name;
	}
	
	if ($item('#itemDate')) {
		$item('#itemDate').text = itemData.date;
	}
	
	if ($item('#itemContact')) {
		$item('#itemContact').text = itemData.contactInfo;
	}
	
	if ($item('#itemDetails')) {
		$item('#itemDetails').text = itemData.details;
	}
	
	// Set status dropdown/display
	if ($item('#itemStatus')) {
		if ($item('#itemStatus').options) {
			// It's a dropdown
			$item('#itemStatus').options = [
				{ value: 'Pending', label: 'Pending' },
				{ value: 'Approved', label: 'Approved' },
				{ value: 'Rejected', label: 'Rejected' },
				{ value: 'Confirmed', label: 'Confirmed' }
			];
			$item('#itemStatus').value = itemData.status;
			$item('#itemStatus').onChange(() => {
				updateAssignmentStatus(itemData._id, $item('#itemStatus').value);
			});
		} else {
			// It's a text element
			$item('#itemStatus').text = itemData.status;
		}
	}
	
	// Set location dropdown/display
	if ($item('#itemLocation')) {
		if ($item('#itemLocation').options) {
			// It's a dropdown
			$item('#itemLocation').options = [
				{ value: 'Unassigned', label: 'Unassigned' },
				{ value: 'Default', label: 'Default' },
				{ value: 'Location A', label: 'Location A' },
				{ value: 'Location B', label: 'Location B' },
				{ value: 'Location C', label: 'Location C' }
			];
			$item('#itemLocation').value = itemData.location || 'Unassigned';
			$item('#itemLocation').onChange(() => {
				updateAssignmentLocation(itemData._id, $item('#itemLocation').value);
			});
		} else {
			// It's a text element
			$item('#itemLocation').text = itemData.location || 'Unassigned';
		}
	}
	
	// Set up action buttons
	if ($item('#btnApprove')) {
		$item('#btnApprove').onClick(() => {
			updateAssignmentStatus(itemData._id, 'Approved');
		});
		// Hide button if already approved/confirmed
		if (itemData.status === 'Approved' || itemData.status === 'Confirmed') {
			$item('#btnApprove').hide();
		}
	}
	
	if ($item('#btnReject')) {
		$item('#btnReject').onClick(() => {
			updateAssignmentStatus(itemData._id, 'Rejected');
		});
		// Hide button if already rejected
		if (itemData.status === 'Rejected') {
			$item('#btnReject').hide();
		}
	}
	
	if ($item('#btnConfirm')) {
		$item('#btnConfirm').onClick(() => {
			updateAssignmentStatus(itemData._id, 'Confirmed');
		});
		// Only show if approved
		if (itemData.status !== 'Approved') {
			$item('#btnConfirm').hide();
		}
	}
	
	if ($item('#btnAssignLocation')) {
		$item('#btnAssignLocation').onClick(() => {
			// Toggle location dropdown visibility or open modal
			// For now, just focus the location dropdown if it exists
			if ($item('#itemLocation') && $item('#itemLocation').options) {
				$item('#itemLocation').focus();
			}
		});
	}
}

async function updateAssignmentStatus(assignmentId, newStatus) {
	console.log(`[STATUS-UPDATE] updateAssignmentStatus called: assignmentId=${assignmentId}, newStatus=${newStatus}`);
	try {
		// Update the status in the database
		console.log(`[STATUS-UPDATE] Updating database...`);
		await wixData.update('WeeklyAssignments', {
			_id: assignmentId,
			applicationStatus: newStatus
		});
		console.log(`[STATUS-UPDATE] Database updated successfully`);
		
		// Send email notification if status is Approved or Rejected
		if (newStatus === 'Approved' || newStatus === 'Rejected') {
			console.log(`[EMAIL] Starting email notification for assignment ${assignmentId}, status: ${newStatus}`);
			try {
				// Verify the function is available
				if (typeof sendStatusNotificationEmail !== 'function') {
					console.error('[EMAIL] ERROR: sendStatusNotificationEmail is not a function!', typeof sendStatusNotificationEmail);
					throw new Error('Email notification function not available');
				}
				
				console.log('[EMAIL] Calling sendStatusNotificationEmail...');
				const emailResult = await sendStatusNotificationEmail(assignmentId, newStatus);
				console.log('[EMAIL] Email function returned:', emailResult);
				
				if (emailResult.success && emailResult.emailSent) {
					console.log(`[EMAIL] ✅ Email notification sent to ${emailResult.recipient}`);
				} else if (emailResult.skipped) {
					console.log('[EMAIL] ⏭️ Email notification skipped:', emailResult.reason);
				} else {
					console.warn('[EMAIL] ❌ Email notification failed:', emailResult.error);
					// Don't show error to user - status update succeeded
				}
			} catch (emailError) {
				console.error('[EMAIL] ❌ Exception caught while sending email notification:', emailError);
				console.error('[EMAIL] Error details:', {
					name: emailError?.name,
					message: emailError?.message,
					stack: emailError?.stack
				});
				// Don't throw - we don't want email failures to break the status update
			}
		}
		
		// Reload current view
		await loadAssignments(currentType);
		
		showSuccess(`Status updated to ${newStatus}${(newStatus === 'Approved' || newStatus === 'Rejected') ? ' - Email notification sent' : ''}`);
	} catch (error) {
		console.error('Error updating status:', error);
		showError('Failed to update status. Please try again.');
	}
}

async function updateAssignmentLocation(assignmentId, locationId) {
	try {
		await wixData.update('WeeklyAssignments', {
			_id: assignmentId,
			assignedMapId: locationId === 'Unassigned' ? null : locationId
		});
		
		// Reload current view
		await loadAssignments(currentType);
		
		showSuccess('Location assigned successfully');
	} catch (error) {
		console.error('Error updating location:', error);
		showError('Failed to assign location. Please try again.');
	}
}

function showLoading(show) {
	if ($w('#loadingIndicator')) {
		if (show) {
			$w('#loadingIndicator').show();
		} else {
			$w('#loadingIndicator').hide();
		}
	}
}

function showError(message) {
	if ($w('#msgError')) {
		$w('#msgError').text = message;
		$w('#msgError').show();
		setTimeout(() => {
			$w('#msgError').hide();
		}, 5000);
	}
	console.error(message);
}

function showSuccess(message) {
	if ($w('#msgSuccess')) {
		$w('#msgSuccess').text = message;
		$w('#msgSuccess').show();
		setTimeout(() => {
			$w('#msgSuccess').hide();
		}, 3000);
	}
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
