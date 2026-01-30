import wixData from 'wix-data';
import { sendStatusNotificationEmail } from 'backend/emailNotifications.jsw';

// ============================================
// EMAIL NOTIFICATIONS ENABLED - VERSION 2.0
// ============================================
console.log('📧📧📧 EMAIL NOTIFICATION CODE LOADED 📧📧📧');
console.log('📧 sendStatusNotificationEmail imported:', typeof sendStatusNotificationEmail);

// Global state
let currentType = 'Musician';
let currentAssignments = [];

// Track recent status updates to prevent duplicate email sends
// Key: `${assignmentId}-${status}`, Value: timestamp
const recentStatusUpdates = new Map();
const STATUS_UPDATE_DEDUP_WINDOW_MS = 10 * 1000; // 10 seconds

// Clean up old entries from the cache periodically
function cleanupStatusUpdateCache() {
	const now = Date.now();
	for (const [key, timestamp] of recentStatusUpdates.entries()) {
		if (now - timestamp > STATUS_UPDATE_DEDUP_WINDOW_MS) {
			recentStatusUpdates.delete(key);
		}
	}
}

// Clean up cache every 30 seconds
setInterval(cleanupStatusUpdateCache, 30 * 1000);

$w.onReady(function () {
	console.log('📧 Page ready - Email notifications are active');
	initializeDashboard();
});

async function initializeDashboard() {
	try {
		// Set up tab handlers
		setupTabHandlers();
		
		// Load filter options
		await populateDateFilter();
		await populateStatusFilter();
		
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
	// Update tab styling - keep all tabs visible, just change active state
	// Note: You may want to add custom CSS classes for active/inactive states
	// For now, we'll just ensure all tabs remain visible
	const tabs = ['Musician', 'Volunteer', 'NonProfit'];
	tabs.forEach(type => {
		const tabElement = $w(`#tab${type}s`);
		if (tabElement) {
			// Ensure tab is visible (don't collapse)
			tabElement.show();
			// You can add custom styling here if needed
		}
	});
	
	// Mark active tab (you can add custom styling)
	const activeTab = $w(`#tab${activeType}s`);
	if (activeTab) {
		activeTab.show();
		// Add any active state styling here if needed
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

async function populateStatusFilter() {
	try {
		const statusOptions = [
			{ value: 'all', label: 'All Statuses' },
			{ value: 'Pending', label: 'Pending' },
			{ value: 'Approved', label: 'Approved' },
			{ value: 'Rejected', label: 'Rejected' }
		];
		
		if ($w('#filterStatus')) {
			$w('#filterStatus').options = statusOptions;
			$w('#filterStatus').onChange(() => {
				loadAssignments(currentType);
			});
		}
	} catch (error) {
		console.error('Error populating status filter:', error);
	}
}

async function loadAssignments(type) {
	try {
		showLoading(true);
		
		// Get selected filters
		const selectedDateId = $w('#filterDate')?.value || 'all';
		const selectedStatus = $w('#filterStatus')?.value || 'all';
		
		// Build query
		let query = wixData.query('WeeklyAssignments')
			.include('profileRef')
			.include('dateRef');
		
		// Filter by date if not "all"
		if (selectedDateId !== 'all') {
			query = query.eq('dateRef', selectedDateId);
		}
		
		const results = await query.find();
		
		// Filter by profile type and status, then prepare data for repeater
		const repeaterData = [];
		let totalChecked = 0;
		let typeMatched = 0;
		let statusFiltered = 0;
		const statusCounts = {}; // Track actual status values found
		
		for (const assignment of results.items) {
			totalChecked++;
			
			// Check if profile type matches
			if (!assignment.profileRef || assignment.profileRef.type !== type) {
				continue;
			}
			typeMatched++;
			
			// Get status (default to 'Pending' if not set)
			// Normalize: trim whitespace and handle null/undefined
			const assignmentStatus = (assignment.applicationStatus || 'Pending').toString().trim();
			
			// Track status counts for debugging
			statusCounts[assignmentStatus] = (statusCounts[assignmentStatus] || 0) + 1;
			
			// Filter by status if not "all" (case-insensitive comparison)
			if (selectedStatus !== 'all') {
				const normalizedSelectedStatus = selectedStatus.toString().trim();
				if (assignmentStatus.toLowerCase() !== normalizedSelectedStatus.toLowerCase()) {
					statusFiltered++;
					continue;
				}
			}
			
			repeaterData.push(prepareRepeaterItem(assignment));
		}
		
		console.log(`Assignment loading summary:`);
		console.log(`  - Total assignments checked: ${totalChecked}`);
		console.log(`  - Matched type "${type}": ${typeMatched}`);
		console.log(`  - Status breakdown:`, statusCounts);
		console.log(`  - Filtered out by status: ${statusFiltered}`);
		console.log(`  - Final count displayed: ${repeaterData.length}`);
		console.log(`  - Filters: status="${selectedStatus}", date="${selectedDateId}"`);
		
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
	
	// Normalize status (trim and default to Pending)
	const status = (assignment.applicationStatus || 'Pending').toString().trim();
	
	return {
		_id: assignment._id,
		name: profile.organizationName || 'Unknown',
		date: dateRef.title || 'Unknown Date',
		dateValue: dateRef.date || new Date(0),
		contactInfo: contactInfo,
		details: details,
		status: status,
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
					{ value: 'Rejected', label: 'Rejected' }
				];
				
				// Normalize and set current value
				const currentStatus = (itemData.status || 'Pending').toString().trim();
				$item('#itemStatus').value = currentStatus;
				
				// Prevent multiple onChange handlers by removing existing ones first
				// Store assignment ID for the handler
				const assignmentId = itemData._id;
				let isUpdating = false; // Flag to prevent recursive updates
				
				$item('#itemStatus').onChange(async () => {
					if (isUpdating) return; // Prevent recursive calls
					
					const newValue = $item('#itemStatus').value;
					const normalizedNewValue = (newValue || 'Pending').toString().trim();
					const normalizedCurrent = currentStatus;
					
					if (normalizedNewValue !== normalizedCurrent) {
						isUpdating = true;
						try {
							await updateAssignmentStatus(assignmentId, normalizedNewValue);
						} finally {
							isUpdating = false;
						}
					}
				});
			} else {
				// It's a text element
				$item('#itemStatus').text = itemData.status;
			}
		}
	
		// Set location dropdown/display - ONLY for Musicians
		// Volunteers and Non-Profits don't need location assignment
		if (itemData.profileType === 'Musician' && $item('#itemLocation')) {
			if ($item('#itemLocation').options) {
				// It's a dropdown
				$item('#itemLocation').options = [
					{ value: 'Unassigned', label: 'Unassigned' },
					{ value: 'Default', label: 'Default' },
					{ value: 'Location A', label: 'Location A' },
					{ value: 'Location B', label: 'Location B' },
					{ value: 'Location C', label: 'Location C' }
				];
				
				const currentLocation = itemData.location || 'Unassigned';
				$item('#itemLocation').value = currentLocation;
				
				// Show the location dropdown for musicians
				$item('#itemLocation').show();
				
				// Prevent multiple onChange handlers
				const assignmentId = itemData._id;
				let isUpdating = false; // Flag to prevent recursive updates
				
				$item('#itemLocation').onChange(async () => {
					if (isUpdating) return; // Prevent recursive calls
					
					const newLocation = $item('#itemLocation').value || 'Unassigned';
					
					if (newLocation !== currentLocation) {
						isUpdating = true;
						try {
							await updateAssignmentLocation(assignmentId, newLocation);
						} finally {
							isUpdating = false;
						}
					}
				});
			} else {
				// It's a text element
				$item('#itemLocation').text = itemData.location || 'Unassigned';
				$item('#itemLocation').show();
			}
		} else if ($item('#itemLocation')) {
			// Hide location dropdown for Volunteers and Non-Profits
			const locationElement = $item('#itemLocation');
			if (locationElement && typeof locationElement.hide === 'function') {
				locationElement.hide();
			}
		}
	
	// Set up action buttons - check if they exist and are buttons before setting onClick
	const btnApprove = $item('#btnApprove');
	if (btnApprove && typeof btnApprove.onClick === 'function') {
		btnApprove.onClick(() => {
			updateAssignmentStatus(itemData._id, 'Approved');
		});
		// Hide button if already approved
		if (itemData.status === 'Approved') {
			btnApprove.hide();
		} else {
			btnApprove.show();
		}
	}
	
	const btnReject = $item('#btnReject');
	if (btnReject && typeof btnReject.onClick === 'function') {
		btnReject.onClick(() => {
			updateAssignmentStatus(itemData._id, 'Rejected');
		});
		// Hide button if already rejected
		if (itemData.status === 'Rejected') {
			btnReject.hide();
		} else {
			btnReject.show();
		}
	}
	
	// Hide Confirm button (removed from workflow)
	const btnConfirm = $item('#btnConfirm');
	if (btnConfirm && typeof btnConfirm.hide === 'function') {
		btnConfirm.hide();
	}
}

async function updateAssignmentStatus(assignmentId, newStatus) {
	console.log(`[UPDATE-STATUS] ===== FUNCTION CALLED ===== assignmentId=${assignmentId}, newStatus=${newStatus}`);
	try {
		// Normalize status
		const normalizedStatus = (newStatus || 'Pending').toString().trim();
		console.log(`[UPDATE-STATUS] Updating assignment ${assignmentId} to status: "${normalizedStatus}"`);
		
		// EARLY DEDUPLICATION CHECK: If this is an Approved/Rejected status update, check for duplicates BEFORE any async operations
		// This prevents race conditions where multiple calls happen before the first one completes
		if (normalizedStatus === 'Approved' || normalizedStatus === 'Rejected') {
			const updateKey = `${assignmentId}-${normalizedStatus}`;
			const now = Date.now();
			const lastUpdateTime = recentStatusUpdates.get(updateKey);
			
			if (lastUpdateTime && (now - lastUpdateTime) < STATUS_UPDATE_DEDUP_WINDOW_MS) {
				const timeSinceLastUpdate = Math.round((now - lastUpdateTime) / 1000);
				console.log(`[UPDATE-STATUS] ⏭️ EARLY DUPLICATE PREVENTION: ${assignmentId} to ${normalizedStatus} was updated ${timeSinceLastUpdate} seconds ago. Skipping entire function to prevent duplicate.`);
				return; // Exit early - don't update status or send email
			}
			
			// Set cache IMMEDIATELY to prevent other parallel calls from proceeding
			recentStatusUpdates.set(updateKey, now);
			console.log(`[UPDATE-STATUS] 🔒 Lock acquired for ${assignmentId}-${normalizedStatus} - preventing duplicates`);
		}
		
		// Get current status filter before update
		const currentStatusFilter = ($w('#filterStatus')?.value || 'all').toString().trim();
		
		// IMPORTANT: Fetch the FULL record first, then update only the status field
		// wixData.update() replaces the entire record - any missing fields get cleared!
		const existingRecord = await wixData.get('WeeklyAssignments', assignmentId);
		if (!existingRecord) {
			throw new Error(`Assignment ${assignmentId} not found`);
		}
		
		// Update only the status field on the complete record
		existingRecord.applicationStatus = normalizedStatus;
		
		const result = await wixData.update('WeeklyAssignments', existingRecord);
		
		console.log('[UPDATE-STATUS] Update result:', result);
		console.log('[UPDATE-STATUS] Updated assignment status:', result.applicationStatus);
		console.log('[UPDATE-STATUS] dateRef preserved:', result.dateRef);
		console.log('[UPDATE-STATUS] profileRef preserved:', result.profileRef);
		
		console.log(`[UPDATE-STATUS] Checking if email needed. normalizedStatus="${normalizedStatus}", isApproved=${normalizedStatus === 'Approved'}, isRejected=${normalizedStatus === 'Rejected'}`);
		
		// Send email notification if status is Approved or Rejected
		// Note: Deduplication check already happened at the start of the function
		if (normalizedStatus === 'Approved' || normalizedStatus === 'Rejected') {
			console.log(`[UPDATE-STATUS] ✅ Status requires email! Proceeding with email notification...`);
			console.log(`[EMAIL] Starting email notification for assignment ${assignmentId}, status: ${normalizedStatus}`);
			try {
				// Verify the function is available
				if (typeof sendStatusNotificationEmail !== 'function') {
					console.error('[EMAIL] ERROR: sendStatusNotificationEmail is not a function!', typeof sendStatusNotificationEmail);
					throw new Error('Email notification function not available');
				}
				
				console.log('[EMAIL] Calling sendStatusNotificationEmail...');
				const emailResult = await sendStatusNotificationEmail(assignmentId, normalizedStatus);
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
		
		// If filter is set to a specific status and item changed to different status,
		// automatically adjust filter to show the new status
		if (currentStatusFilter !== 'all' && currentStatusFilter.toLowerCase() !== normalizedStatus.toLowerCase()) {
			// Update filter to show the new status
			if ($w('#filterStatus')) {
				$w('#filterStatus').value = normalizedStatus;
			}
			const emailNote = (normalizedStatus === 'Approved' || normalizedStatus === 'Rejected') ? ' - Email notification sent' : '';
			showSuccess(`Status updated to ${normalizedStatus}${emailNote}. Filter adjusted to show ${normalizedStatus} items.`);
		} else {
			const emailNote = (normalizedStatus === 'Approved' || normalizedStatus === 'Rejected') ? ' - Email notification sent' : '';
			showSuccess(`Status updated to ${normalizedStatus}${emailNote}`);
		}
		
		// Small delay to ensure database is updated
		await new Promise(resolve => setTimeout(resolve, 100));
		
		// Reload current view (will use updated filter if changed)
		await loadAssignments(currentType);
		
	} catch (error) {
		console.error('Error updating status:', error);
		console.error('Full error:', JSON.stringify(error, null, 2));
		showError('Failed to update status. Please try again.');
	}
}

async function updateAssignmentLocation(assignmentId, locationId) {
	try {
		const normalizedLocation = (locationId || 'Unassigned').toString().trim();
		console.log(`Updating assignment ${assignmentId} location to: "${normalizedLocation}"`);
		
		// IMPORTANT: Fetch the FULL record first, then update only the location field
		// wixData.update() replaces the entire record - any missing fields get cleared!
		const existingRecord = await wixData.get('WeeklyAssignments', assignmentId);
		if (!existingRecord) {
			throw new Error(`Assignment ${assignmentId} not found`);
		}
		
		// Update only the location field on the complete record
		existingRecord.assignedMapId = normalizedLocation === 'Unassigned' ? null : normalizedLocation;
		
		const result = await wixData.update('WeeklyAssignments', existingRecord);
		
		console.log('Location update result:', result);
		console.log('Updated assignedMapId:', result.assignedMapId);
		console.log('dateRef preserved:', result.dateRef);
		console.log('profileRef preserved:', result.profileRef);
		
		// Small delay to ensure database is updated
		await new Promise(resolve => setTimeout(resolve, 100));
		
		// Reload current view (will respect current filters)
		await loadAssignments(currentType);
		
		showSuccess('Location assigned successfully');
	} catch (error) {
		console.error('Error updating location:', error);
		console.error('Full error:', JSON.stringify(error, null, 2));
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
