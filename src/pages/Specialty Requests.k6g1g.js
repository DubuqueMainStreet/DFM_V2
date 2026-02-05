import wixData from 'wix-data';
import wixWindow from 'wix-window';
import { sendStatusNotificationEmail } from 'backend/emailNotifications.jsw';
import { manualEntrySpecialtyProfile } from 'backend/formSubmissions.jsw';
import { getDateAvailability } from 'backend/availabilityStatus.jsw';
import { checkAssignmentsStatus } from 'backend/diagnosticCheck.jsw';

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
		// 🔍 RUN DIAGNOSTIC CHECK - Check for approved assignments
		console.log('🔍🔍🔍 RUNNING DIAGNOSTIC CHECK 🔍🔍🔍');
		try {
			const diagnosticResult = await checkAssignmentsStatus();
			console.log('📊 DIAGNOSTIC RESULT:', diagnosticResult);
			if (diagnosticResult.approvedCount === 0) {
				console.error('⚠️⚠️⚠️ WARNING: NO APPROVED ASSIGNMENTS FOUND IN DATABASE ⚠️⚠️⚠️');
				console.error('This suggests data loss or corruption. Check the logs above for details.');
			} else {
				console.log(`✅ Found ${diagnosticResult.approvedCount} approved assignments in database.`);
				console.log('💡 TIP: Make sure Status filter is set to "Approved" or "All Statuses" to see them!');
			}
		} catch (diagError) {
			console.error('❌ Diagnostic check failed:', diagError);
		}
		console.log('🔍🔍🔍 DIAGNOSTIC CHECK COMPLETE 🔍🔍🔍\n');
		
		// Ensure manual entry container is hidden by default
		const manualEntryContainer = $w('#manualEntryContainer');
		if (manualEntryContainer && typeof manualEntryContainer.hide === 'function') {
			manualEntryContainer.hide();
		} else if (manualEntryContainer && manualEntryContainer.style) {
			manualEntryContainer.style.display = 'none';
			manualEntryContainer.style.visibility = 'hidden';
		}
		
		// Ensure assignments container is visible by default (don't hide it - let Wix Editor handle default state)
		const assignmentsContainer = $w('#assignmentsContainer');
		if (assignmentsContainer && typeof assignmentsContainer.show === 'function') {
			assignmentsContainer.show();
		} else if (assignmentsContainer && assignmentsContainer.style) {
			assignmentsContainer.style.display = 'block';
			assignmentsContainer.style.visibility = 'visible';
		}
		
		// Set up tab handlers
		setupTabHandlers();
		
		// Set up search handler
		setupSearchHandler();
		
		// Set up clear filters button
		setupClearFiltersButton();
		
		// Set up refresh button
		setupRefreshButton();
		
		// Set up manual entry button
		setupManualEntryButton();
		
		// Set initial active tab styling (Musicians is default)
		updateActiveTab('Musician');
		
		// Load filter options
		await populateDateFilter();
		await populateStatusFilter();
		
		// Load default view (Musicians) - will use 'Pending' filter by default
		await loadAssignments('Musician');
		
	} catch (error) {
		console.error('Error initializing dashboard:', error);
		showError('Failed to load dashboard. Please refresh.');
	}
}

function setupClearFiltersButton() {
	const clearFiltersBtn = $w('#btnClearFilters');
	if (clearFiltersBtn && typeof clearFiltersBtn.onClick === 'function') {
		clearFiltersBtn.onClick(async () => {
			// Reset all filters to defaults
			const filterDate = $w('#filterDate');
			if (filterDate && filterDate.value !== undefined) {
				filterDate.value = 'all';
			}
			
			const filterStatus = $w('#filterStatus');
			if (filterStatus && filterStatus.value !== undefined) {
				filterStatus.value = 'Pending'; // Keep default to Pending
			}
			
			const searchInput = $w('#searchName');
			if (searchInput && searchInput.value !== undefined) {
				searchInput.value = '';
			}
			
			// Reload with cleared filters
			await loadAssignments(currentType);
			showSuccess('Filters cleared');
		});
		
		// Style the button to match UI
		if (clearFiltersBtn.style) {
			clearFiltersBtn.style.borderRadius = '12px';
			clearFiltersBtn.style.backgroundColor = '#F5F5F5';
			clearFiltersBtn.style.color = '#666666';
			clearFiltersBtn.style.fontWeight = '500';
			clearFiltersBtn.style.padding = '10px 20px';
			clearFiltersBtn.style.border = '1px solid #E0E0E0';
			clearFiltersBtn.style.transition = 'all 0.3s ease';
		}
	}
}

function setupRefreshButton() {
	const refreshBtn = $w('#btnRefresh');
	if (refreshBtn && typeof refreshBtn.onClick === 'function') {
		refreshBtn.onClick(async () => {
			showLoading(true, 'Refreshing...');
			await loadAssignments(currentType);
			showSuccess('Refreshed');
		});
		
		// Style the button to match UI
		if (refreshBtn.style) {
			refreshBtn.style.borderRadius = '12px';
			refreshBtn.style.backgroundColor = '#2196F3';
			refreshBtn.style.color = '#FFFFFF';
			refreshBtn.style.fontWeight = '500';
			refreshBtn.style.padding = '10px 20px';
			refreshBtn.style.border = 'none';
			refreshBtn.style.transition = 'all 0.3s ease';
		}
	}
}

function setupManualEntryButton() {
	const manualEntryBtn = $w('#btnManualEntry');
	if (manualEntryBtn && typeof manualEntryBtn.onClick === 'function') {
		manualEntryBtn.onClick(() => {
			console.log('Manual entry button clicked');
			openManualEntryForm();
		});
		
		// Style the button
		if (manualEntryBtn.style) {
			manualEntryBtn.style.borderRadius = '12px';
			manualEntryBtn.style.backgroundColor = '#4CAF50';
			manualEntryBtn.style.color = '#FFFFFF';
			manualEntryBtn.style.fontWeight = '500';
			manualEntryBtn.style.padding = '10px 20px';
			manualEntryBtn.style.border = 'none';
			manualEntryBtn.style.transition = 'all 0.3s ease';
		}
		console.log('Manual entry button set up successfully');
	} else {
		console.warn('Manual entry button (#btnManualEntry) not found or onClick not available');
	}
	
	// Set up manual entry form handlers
	setupManualEntryForm();
}

function setupSearchHandler() {
	// Set up search input handler if it exists
	const searchInput = $w('#searchName');
	if (searchInput && typeof searchInput.onInput === 'function') {
		searchInput.onInput(() => {
			loadAssignments(currentType);
		});
	}
	
	// Add clear button handler if it exists and is clickable
	const clearButton = $w('#btnClearSearch');
	if (clearButton && typeof clearButton.onClick === 'function') {
		clearButton.onClick(() => {
			if (searchInput) {
				searchInput.value = '';
			}
			loadAssignments(currentType);
		});
	}
}

function setupTabHandlers() {
	// Tab buttons - check if they exist and have onClick method
	const tabMusicians = $w('#tabMusicians');
	if (tabMusicians && typeof tabMusicians.onClick === 'function') {
		tabMusicians.onClick(() => switchTab('Musician'));
	}
	
	const tabVolunteers = $w('#tabVolunteers');
	if (tabVolunteers && typeof tabVolunteers.onClick === 'function') {
		tabVolunteers.onClick(() => switchTab('Volunteer'));
	}
	
	const tabNonProfits = $w('#tabNonProfits');
	if (tabNonProfits && typeof tabNonProfits.onClick === 'function') {
		tabNonProfits.onClick(() => switchTab('NonProfit'));
	}
	
	// Special Events tab - gracefully handle when not yet set up
	const tabSpecialEvents = $w('#tabSpecialEvents');
	if (tabSpecialEvents && typeof tabSpecialEvents.onClick === 'function') {
		tabSpecialEvents.onClick(() => {
			// For now, show a message that this feature is coming soon
			// When ready, switch to: switchTab('SpecialEvent');
			showSuccess('Special Events feature coming soon!');
			// Keep it styled as inactive for now
			updateActiveTab('Musician'); // Keep current active tab
		});
	}
}

async function switchTab(type) {
	currentType = type;
	
	// Ensure manual entry form is closed and assignments container is visible
	const manualEntryContainer = $w('#manualEntryContainer');
	if (manualEntryContainer && typeof manualEntryContainer.hide === 'function') {
		manualEntryContainer.hide();
	}
	if (manualEntryContainer && manualEntryContainer.style) {
		manualEntryContainer.style.display = 'none';
		manualEntryContainer.style.visibility = 'hidden';
	}
	
	// Ensure assignments container is visible
	const assignmentsContainer = $w('#assignmentsContainer');
	if (assignmentsContainer) {
		if (typeof assignmentsContainer.show === 'function') {
			assignmentsContainer.show();
		}
		if (assignmentsContainer.style) {
			assignmentsContainer.style.display = 'block';
			assignmentsContainer.style.visibility = 'visible';
		}
		console.log('Assignments container shown when switching to', type, 'tab');
	}
	
	// Update active tab styling
	updateActiveTab(type);
	
	// Load assignments for selected type
	await loadAssignments(type);
}

function setAllTabsInactive() {
	// Set all tabs to inactive/neutral state (used when manual entry form is open)
	const tabs = ['Musician', 'Volunteer', 'NonProfit'];
	
	tabs.forEach(type => {
		const tabElement = $w(`#tab${type}s`);
		if (!tabElement) return;
		
		if (tabElement.style) {
			tabElement.style.borderRadius = '12px';
			// Neutral/inactive styling - all tabs look the same
			tabElement.style.backgroundColor = '#F5F5F5'; // Light gray background
			tabElement.style.color = '#999999'; // Lighter gray text (more muted than normal inactive)
			tabElement.style.fontWeight = '400'; // Normal weight
			tabElement.style.borderBottom = '3px solid transparent'; // No underline
			tabElement.style.opacity = '0.6'; // More muted than normal inactive
		}
		
		// Remove active classes if they exist
		if (tabElement.classes) {
			tabElement.classes.remove('tab-active');
			tabElement.classes.add('tab-inactive');
		}
	});
}

function updateActiveTab(activeType) {
	// Update tab styling - apply visual indicators for active/inactive states
	const tabs = ['Musician', 'Volunteer', 'NonProfit'];
	
	tabs.forEach(type => {
		const tabElement = $w(`#tab${type}s`);
		if (!tabElement) return;
		
		// Ensure tab is visible
		if (typeof tabElement.show === 'function') {
			tabElement.show();
		}
		
		const isActive = type === activeType;
		
		// Apply styling based on active state
		if (tabElement.style) {
			// Apply 12px border radius to all tabs
			tabElement.style.borderRadius = '12px';
			
			if (isActive) {
				// Active tab styling - prominent and highlighted
				tabElement.style.backgroundColor = '#2196F3'; // Blue background
				tabElement.style.color = '#FFFFFF'; // White text
				tabElement.style.fontWeight = '600'; // Bold
				tabElement.style.borderBottom = '3px solid #1976D2'; // Darker blue underline
				tabElement.style.opacity = '1';
			} else {
				// Inactive tab styling - subtle and muted
				tabElement.style.backgroundColor = '#F5F5F5'; // Light gray background
				tabElement.style.color = '#666666'; // Gray text
				tabElement.style.fontWeight = '400'; // Normal weight
				tabElement.style.borderBottom = '3px solid transparent'; // No underline
				tabElement.style.opacity = '0.8';
			}
		}
		
		// Also apply CSS classes if classes property exists
		if (tabElement.classes) {
			if (isActive) {
				tabElement.classes.add('tab-active');
				tabElement.classes.remove('tab-inactive');
			} else {
				tabElement.classes.add('tab-inactive');
				tabElement.classes.remove('tab-active');
			}
		}
	});
	
	// Handle Special Events tab - always show as inactive (coming soon)
	const tabSpecialEvents = $w('#tabSpecialEvents');
	if (tabSpecialEvents) {
		if (typeof tabSpecialEvents.show === 'function') {
			tabSpecialEvents.show();
		}
		
		// Style as inactive (coming soon state)
		if (tabSpecialEvents.style) {
			tabSpecialEvents.style.borderRadius = '12px';
			tabSpecialEvents.style.backgroundColor = '#F5F5F5';
			tabSpecialEvents.style.color = '#999999'; // Even more muted for "coming soon"
			tabSpecialEvents.style.fontWeight = '400';
			tabSpecialEvents.style.borderBottom = '3px solid transparent';
			tabSpecialEvents.style.opacity = '0.6'; // More transparent to indicate disabled
		}
		
		if (tabSpecialEvents.classes) {
			tabSpecialEvents.classes.add('tab-inactive');
			tabSpecialEvents.classes.remove('tab-active');
		}
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
		
		const filterDate = $w('#filterDate');
		if (filterDate) {
			if (filterDate.options) {
				filterDate.options = dateOptions;
			}
			if (typeof filterDate.onChange === 'function') {
				filterDate.onChange(() => {
					loadAssignments(currentType);
				});
			}
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
		
		const filterStatus = $w('#filterStatus');
		if (filterStatus) {
			if (filterStatus.options) {
				filterStatus.options = statusOptions;
			}
			// Set default to 'Pending' to show actionable items immediately
			if (filterStatus.value !== undefined) {
				filterStatus.value = 'Pending';
			}
			if (typeof filterStatus.onChange === 'function') {
				filterStatus.onChange(() => {
					loadAssignments(currentType);
				});
			}
		}
	} catch (error) {
		console.error('Error populating status filter:', error);
	}
}

async function loadAssignments(type) {
	try {
		showLoading(true, 'Loading requests...');
		
		// Get selected filters
		const selectedDateId = $w('#filterDate')?.value || 'all';
		const selectedStatus = $w('#filterStatus')?.value || 'Pending'; // Default to 'Pending'
		const searchQuery = ($w('#searchName')?.value || '').toLowerCase().trim();
		
		// Build query
		// Use limit(1000) to ensure we get all records (Wix default is 50)
		let query = wixData.query('WeeklyAssignments')
			.include('profileRef')
			.include('dateRef')
			.limit(1000);
		
		// Filter by date if not "all"
		if (selectedDateId !== 'all') {
			query = query.eq('dateRef', selectedDateId);
		}
		
		const results = await query.find();
		
		// Log if we hit the limit
		if (results.hasMore) {
			console.warn(`⚠️ WARNING: Query returned ${results.items.length} items but hasMore=true. Some assignments may be missing!`);
		}
		
		// Filter by profile type, status, and search query, then prepare data for repeater
		const repeaterData = [];
		let totalChecked = 0;
		let typeMatched = 0;
		let statusFiltered = 0;
		let searchFiltered = 0;
		let missingProfileRef = 0;
		const statusCounts = {}; // Track actual status values found
		const brokenRefs = []; // Track assignments with broken references
		
		for (const assignment of results.items) {
			totalChecked++;
			
			// Check if profile type matches
			if (!assignment.profileRef) {
				missingProfileRef++;
				brokenRefs.push({
					id: assignment._id,
					status: assignment.applicationStatus,
					issue: 'profileRef is null/undefined after include()',
					dateTitle: assignment.dateRef?.title || 'Unknown date'
				});
				continue;
			}
			if (assignment.profileRef.type !== type) {
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
			
			// Prepare item data for search filtering
			const itemData = prepareRepeaterItem(assignment);
			
			// Filter by search query (search in organization name)
			if (searchQuery && !itemData.name.toLowerCase().includes(searchQuery)) {
				searchFiltered++;
				continue;
			}
			
			repeaterData.push(itemData);
		}
		
		console.log(`Assignment loading summary:`);
		console.log(`  - Total assignments checked: ${totalChecked}`);
		console.log(`  - Matched type "${type}": ${typeMatched}`);
		console.log(`  - Status breakdown:`, statusCounts);
		console.log(`  - Filtered out by status: ${statusFiltered}`);
		console.log(`  - Filtered out by search: ${searchFiltered}`);
		console.log(`  - Missing/broken profileRef: ${missingProfileRef}`);
		console.log(`  - Final count displayed: ${repeaterData.length}`);
		console.log(`  - Filters: status="${selectedStatus}", date="${selectedDateId}", search="${searchQuery}"`);
		
		if (brokenRefs.length > 0) {
			console.warn(`⚠️ WARNING: ${brokenRefs.length} assignments have broken profileRef references!`);
			console.warn('These assignments exist in the database but cannot be displayed:');
			brokenRefs.forEach(ref => {
				console.warn(`  - Assignment ID: ${ref.id}, Status: ${ref.status}, Date: ${ref.dateTitle}`);
				console.warn(`    Issue: ${ref.issue}`);
			});
			console.warn('👉 This means the SpecialtyProfile record was deleted or the reference is corrupted.');
		}
		
		// Sort by date, then by name
		repeaterData.sort((a, b) => {
			const dateCompare = new Date(a.dateValue) - new Date(b.dateValue);
			if (dateCompare !== 0) return dateCompare;
			return a.name.localeCompare(b.name);
		});
		
		currentAssignments = repeaterData;
		
		// Update results count display
		updateResultsCount(repeaterData.length, typeMatched, selectedStatus, searchQuery);
		
		// Show empty state message in loading indicator if no results
		if (repeaterData.length === 0) {
			const emptyMessage = getEmptyStateMessage(selectedStatus, searchQuery);
			showLoading(true, emptyMessage);
		} else {
			// Hide loading indicator if we have results
			showLoading(false);
			// Also hide empty state element if it exists
			const emptyStateElement = $w('#emptyState');
			if (emptyStateElement && typeof emptyStateElement.hide === 'function') {
				emptyStateElement.hide();
			}
		}
		
		// Populate repeater
		populateRepeater(repeaterData);
		
	} catch (error) {
		console.error('Error loading assignments:', error);
		showError('Failed to load assignments. Please try again.');
		showLoading(false);
	} finally {
		// Only hide loading if we have results (otherwise keep showing empty message)
		if (currentAssignments.length > 0) {
			showLoading(false);
		}
	}
}

function getEmptyStateMessage(selectedStatus, searchQuery) {
	if (searchQuery) {
		return `No requests found matching "${searchQuery}". Try clearing your search or adjusting filters.`;
	} else if (selectedStatus === 'Pending') {
		return 'No pending requests. Great job staying on top of things!';
	} else if (selectedStatus === 'Approved') {
		return 'No approved requests found. Try selecting a different status or date.';
	} else if (selectedStatus === 'Rejected') {
		return 'No rejected requests found.';
	} else {
		return 'No requests found matching your filters. Try adjusting your filters or checking other tabs.';
	}
}

function updateResultsCount(displayedCount, totalForType, selectedStatus, searchQuery) {
	const resultsCountElement = $w('#resultsCount');
	if (!resultsCountElement) return;
	
	let message = '';
	if (displayedCount === 0) {
		message = 'No requests found';
	} else if (searchQuery) {
		message = `Showing ${displayedCount} request${displayedCount !== 1 ? 's' : ''} matching "${searchQuery}"`;
	} else if (selectedStatus === 'all') {
		message = `Showing ${displayedCount} request${displayedCount !== 1 ? 's' : ''}`;
	} else {
		message = `Showing ${displayedCount} ${selectedStatus.toLowerCase()} request${displayedCount !== 1 ? 's' : ''}`;
	}
	
	if (resultsCountElement.text !== undefined) {
		resultsCountElement.text = message;
	}
	if (typeof resultsCountElement.show === 'function') {
		resultsCountElement.show();
	}
	
	// Update filter summary display
	updateFilterSummary(selectedStatus, searchQuery);
}

function updateFilterSummary(selectedStatus, searchQuery) {
	const filterSummaryElement = $w('#filterSummary');
	if (!filterSummaryElement) return;
	
	const filters = [];
	
	// Add status filter
	if (selectedStatus && selectedStatus !== 'all') {
		filters.push(selectedStatus);
	}
	
	// Add search filter
	if (searchQuery && searchQuery.trim()) {
		filters.push(`Search: "${searchQuery}"`);
	}
	
	// Add date filter if not "all"
	const selectedDateId = $w('#filterDate')?.value || 'all';
	if (selectedDateId !== 'all') {
		// Try to get the date label from the dropdown
		const filterDate = $w('#filterDate');
		if (filterDate && filterDate.options) {
			const selectedOption = filterDate.options.find(opt => opt.value === selectedDateId);
			if (selectedOption) {
				filters.push(selectedOption.label);
			} else {
				filters.push('Specific Date');
			}
		} else {
			filters.push('Specific Date');
		}
	}
	
	let summaryText = '';
	if (filters.length === 0) {
		summaryText = 'All filters cleared';
	} else {
		summaryText = `Active filters: ${filters.join(' • ')}`;
	}
	
	if (filterSummaryElement.text !== undefined) {
		filterSummaryElement.text = summaryText;
	}
	if (typeof filterSummaryElement.show === 'function') {
		filterSummaryElement.show();
	}
}

// Empty state is now handled by showLoading() with message
// This function is kept for backward compatibility but may not be needed
function showEmptyState(isEmpty, selectedStatus, searchQuery) {
	const emptyStateElement = $w('#emptyState');
	if (!emptyStateElement) return;
	
	if (isEmpty) {
		const message = getEmptyStateMessage(selectedStatus, searchQuery);
		if (emptyStateElement.text !== undefined) {
			emptyStateElement.text = message;
		}
		if (typeof emptyStateElement.show === 'function') {
			emptyStateElement.show();
		}
	} else {
		if (typeof emptyStateElement.hide === 'function') {
			emptyStateElement.hide();
		}
	}
}

// Map location codes to display names
function getLocationDisplayName(locationCode) {
	if (!locationCode) return 'Unassigned';
	
	const locationMap = {
		'Location A': '13th Street',
		'Location B': 'Food Court',
		'Location C': '10th & Iowa St',
		'13th Street': '13th Street',
		'Food Court': 'Food Court',
		'10th & Iowa St': '10th & Iowa St',
		'Unassigned': 'Unassigned'
	};
	
	// Return mapped name if exists, otherwise return the original value
	return locationMap[locationCode] || locationCode;
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
	
	// Format date for display
	const dateValue = dateRef.date || new Date(0);
	const formattedDate = formatDateForDisplay(dateValue, dateRef.title);
	
	// Get location: prefer admin-assigned location, fall back to user's preferred location
	// For display, use the actual location name (not the code)
	let locationCode = assignment.assignedMapId || profile.preferredLocation || 'Unassigned';
	const locationDisplay = getLocationDisplayName(locationCode);
	
	return {
		_id: assignment._id,
		name: profile.organizationName || 'Unknown',
		date: formattedDate.display, // Formatted date string
		dateValue: dateValue, // Original date for sorting
		dateRelative: formattedDate.relative, // Relative date (e.g., "Next Saturday")
		contactInfo: contactInfo,
		details: details,
		status: status,
		location: locationCode, // Store the code for dropdown value matching
		locationDisplay: locationDisplay, // Store display name for showing in cards
		preferredLocation: profile.preferredLocation || null, // User's original preference
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
	if (profile.contactEmail) {
		// Return email as-is - will be made clickable in repeater item setup
		parts.push(profile.contactEmail);
	}
	if (profile.contactPhone) parts.push(profile.contactPhone);
	return parts.join(' • ') || 'No contact info';
}

function formatDateForDisplay(dateValue, titleFallback) {
	if (!dateValue || dateValue instanceof Date === false) {
		return {
			display: titleFallback || 'Unknown Date',
			relative: null
		};
	}
	
	const date = new Date(dateValue);
	const now = new Date();
	const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
	const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
	
	// Calculate days difference
	const daysDiff = Math.floor((dateOnly - today) / (1000 * 60 * 60 * 24));
	
	let relative = null;
	if (daysDiff === 0) {
		relative = 'Today';
	} else if (daysDiff === 1) {
		relative = 'Tomorrow';
	} else if (daysDiff === -1) {
		relative = 'Yesterday';
	} else if (daysDiff > 1 && daysDiff <= 7) {
		relative = `In ${daysDiff} days`;
	} else if (daysDiff < -1 && daysDiff >= -7) {
		relative = `${Math.abs(daysDiff)} days ago`;
	} else if (daysDiff > 7 && daysDiff <= 30) {
		const weeks = Math.floor(daysDiff / 7);
		relative = `In ${weeks} week${weeks !== 1 ? 's' : ''}`;
	}
	
	// Format display date: "May 2nd" or "May 2nd, 2026"
	const day = date.getDate();
	const daySuffix = getDaySuffix(day);
	const month = date.toLocaleDateString('en-US', { month: 'short' });
	const year = date.getFullYear();
	const currentYear = now.getFullYear();
	
	const display = year === currentYear 
		? `${month} ${day}${daySuffix}` 
		: `${month} ${day}${daySuffix}, ${year}`;
	
	return {
		display: display,
		relative: relative
	};
}

function getDaySuffix(day) {
	// Handle 11th, 12th, 13th (special cases)
	if (day >= 11 && day <= 13) {
		return 'th';
	}
	switch (day % 10) {
		case 1: return 'st';
		case 2: return 'nd';
		case 3: return 'rd';
		default: return 'th';
	}
}

function buildLocationOptions(assignments, currentLocation) {
	// Standard location options - using actual location names as labels, but codes as values
	// This allows us to store "Location A/B/C" codes but display friendly names
	const standardLocations = [
		{ value: 'Unassigned', label: 'Unassigned' },
		{ value: 'Location A', label: '13th Street' },
		{ value: 'Location B', label: 'Food Court' },
		{ value: 'Location C', label: '10th & Iowa St' }
	];
	
	// Also support direct location names (in case some data uses them)
	const locationNameMap = {
		'13th Street': 'Location A',
		'Food Court': 'Location B',
		'10th & Iowa St': 'Location C'
	};
	
	// Collect all unique location values from assignments (both codes and names)
	const actualLocations = new Set();
	
	if (assignments && Array.isArray(assignments)) {
		assignments.forEach(assignment => {
			if (assignment.profileType === 'Musician') {
				// Check both location and preferredLocation
				const loc = (assignment.location || assignment.preferredLocation || '').toString().trim();
				if (loc && loc !== 'Unassigned') {
					actualLocations.add(loc);
				}
			}
		});
	}
	
	// Add current location if it exists and isn't already in the set
	if (currentLocation && currentLocation !== 'Unassigned') {
		actualLocations.add(currentLocation.toString().trim());
	}
	
	// Build final options list: standard locations first
	const options = [...standardLocations];
	
	// Add any actual locations that aren't in the standard list
	// Convert location names to codes if needed
	actualLocations.forEach(loc => {
		// Check if it's already in standard locations (by value)
		const existsInStandard = standardLocations.some(opt => opt.value === loc);
		
		// Check if it's a location name that maps to a code
		const mappedCode = locationNameMap[loc];
		const existsAsMapped = mappedCode && standardLocations.some(opt => opt.value === mappedCode);
		
		if (!existsInStandard && !existsAsMapped) {
			// Add with display name
			const displayName = getLocationDisplayName(loc);
			options.push({ value: loc, label: displayName });
		}
	});
	
	return options;
}

function populateRepeater(data) {
	const repeater = $w('#assignmentsRepeater');
	if (!repeater) {
		console.warn('assignmentsRepeater not found');
		return;
	}
	
	repeater.data = data;
	
	// Set up repeater item ready handler
	if (typeof repeater.onItemReady === 'function') {
		repeater.onItemReady(($item, itemData) => {
			setupRepeaterItem($item, itemData);
		});
	}
	
	// Hide empty state if we have data
	if (data.length > 0) {
		const emptyStateElement = $w('#emptyState');
		if (emptyStateElement && typeof emptyStateElement.hide === 'function') {
			emptyStateElement.hide();
		}
	}
}

function setupRepeaterItem($item, itemData) {
	// Populate text elements
	if ($item('#itemName')) {
		$item('#itemName').text = itemData.name;
	}
	
	// Set date display with relative date if available
	if ($item('#itemDate')) {
		// Show formatted date with relative indicator if available
		let dateText = itemData.date;
		if (itemData.dateRelative) {
			dateText = `${itemData.date} (${itemData.dateRelative})`;
		}
		if ($item('#itemDate').text !== undefined) {
			$item('#itemDate').text = dateText;
		}
	}
	
	// Set up contact info display with clickable email
	if ($item('#itemContact')) {
		// Format contact info with clickable email
		const contactText = itemData.contactInfo;
		
		if ($item('#itemContact').html) {
			// If HTML is supported, make email clickable
			const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi;
			const htmlContact = contactText.replace(emailRegex, '<a href="mailto:$1" style="color: #2196F3; text-decoration: underline;">$1</a>');
			$item('#itemContact').html = htmlContact;
		} else {
			// Fallback to plain text
			$item('#itemContact').text = contactText;
		}
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
						// Show confirmation for status changes to Approved or Rejected
						if ((normalizedNewValue === 'Approved' || normalizedNewValue === 'Rejected') &&
						    (normalizedCurrent === 'Pending' || normalizedCurrent === 'Approved' || normalizedCurrent === 'Rejected')) {
							// Use browser confirm (fallback if lightbox not available)
							let confirmed = false;
							try {
								const result = await wixWindow.openLightbox('StatusChangeConfirmation', {
									currentStatus: normalizedCurrent,
									newStatus: normalizedNewValue,
									assignmentName: itemData.name
								});
								confirmed = result === true || result?.confirmed === true;
							} catch (lightboxError) {
								// Lightbox doesn't exist - use browser confirm as fallback
								// Note: In Wix, we can't use browser confirm, so proceed with change
								// For better UX, create a StatusChangeConfirmation lightbox
								console.log(`[STATUS-CHANGE] Lightbox not available, proceeding with status change`);
								confirmed = true; // Proceed with change
							}
							
							if (!confirmed) {
								// User cancelled - reset dropdown to original value
								$item('#itemStatus').value = normalizedCurrent;
								return;
							}
						}
						
						isUpdating = true;
						try {
							await updateAssignmentStatus(assignmentId, normalizedNewValue);
						} finally {
							isUpdating = false;
						}
					}
				});
				
				// Apply subtle styling to status dropdown based on value
				applyStatusDropdownStyling($item('#itemStatus'), currentStatus);
			} else {
				// It's a text element
				$item('#itemStatus').text = itemData.status;
			}
		}
	
		// Set location dropdown/display - ONLY for Musicians
		// Volunteers and Non-Profits don't need location assignment
		const locationElement = $item('#itemLocation');
		if (itemData.profileType === 'Musician' && locationElement) {
			if (locationElement.options) {
				// It's a dropdown
				// Build location options dynamically to include all actual locations
				const locationOptions = buildLocationOptions(currentAssignments, itemData.location);
				
				locationElement.options = locationOptions;
				
				// Set the current location value - use the code for matching
				// If admin has assigned a location, use that; otherwise use preferred location
				let currentLocation = itemData.location || 'Unassigned';
				
				// Normalize location codes - handle both "Location A" and "13th Street" formats
				const locationNameMap = {
					'13th Street': 'Location A',
					'Food Court': 'Location B',
					'10th & Iowa St': 'Location C'
				};
				
				// If current location is a display name, convert to code
				if (locationNameMap[currentLocation]) {
					currentLocation = locationNameMap[currentLocation];
				}
				
				// Check if current location exists in options, if not add it
				const locationExists = locationOptions.some(opt => opt.value === currentLocation);
				if (!locationExists && currentLocation !== 'Unassigned') {
					// Add the actual location to options if it's not in the list
					const displayName = getLocationDisplayName(currentLocation);
					locationElement.options = [
						...locationOptions,
						{ value: currentLocation, label: displayName }
					];
				}
				
				locationElement.value = currentLocation;
				
				// Show the location dropdown for musicians
				if (typeof locationElement.show === 'function') {
					locationElement.show();
				}
				
				// Prevent multiple onChange handlers
				const assignmentId = itemData._id;
				let isUpdating = false; // Flag to prevent recursive updates
				
				if (typeof locationElement.onChange === 'function') {
					locationElement.onChange(async () => {
						if (isUpdating) return; // Prevent recursive calls
						
						const newLocation = locationElement.value || 'Unassigned';
						
						if (newLocation !== currentLocation) {
							isUpdating = true;
							try {
								await updateAssignmentLocation(assignmentId, newLocation);
							} finally {
								isUpdating = false;
							}
						}
					});
				}
			} else {
				// It's a text element - show the display name, not the code
				if (locationElement.text !== undefined) {
					const displayName = itemData.locationDisplay || getLocationDisplayName(itemData.location) || 'Unassigned';
					locationElement.text = displayName;
				}
				if (typeof locationElement.show === 'function') {
					locationElement.show();
				}
			}
		} else if (locationElement) {
			// Hide location dropdown for Volunteers and Non-Profits
			if (typeof locationElement.hide === 'function') {
				locationElement.hide();
			}
		}
	
	// Remove approve/reject buttons - using dropdown as primary selector
	// Hide these buttons if they exist in the UI
	const btnApprove = $item('#btnApprove');
	if (btnApprove && typeof btnApprove.hide === 'function') {
		btnApprove.hide();
	}
	
	const btnReject = $item('#btnReject');
	if (btnReject && typeof btnReject.hide === 'function') {
		btnReject.hide();
	}
	
	// Hide Confirm button (removed from workflow)
	const btnConfirm = $item('#btnConfirm');
	if (btnConfirm && typeof btnConfirm.hide === 'function') {
		btnConfirm.hide();
	}
	
	// Set up delete button
	const btnDelete = $item('#btnDelete');
	if (btnDelete && typeof btnDelete.onClick === 'function') {
		btnDelete.onClick(() => {
			deleteAssignment(itemData._id, itemData.name);
		});
		// Style delete button as destructive (red) with rounded corners
		if (btnDelete.style) {
			btnDelete.style.backgroundColor = '#D32F2F';
			btnDelete.style.color = '#FFFFFF';
			btnDelete.style.borderRadius = '12px';
		}
	}
	
	// Add subtle visual status indicators
	applyStatusStyling($item, itemData.status);
}

function applyStatusStyling($item, status) {
	// Apply subtle visual indicators based on status
	// Target the repeater item container (repeaterItem)
	const itemContainer = $item('#repeaterItem') || $item;
	
	if (!itemContainer) return;
	
	const normalizedStatus = (status || 'Pending').toString().trim().toLowerCase();
	
	// Remove any existing status classes
	if (itemContainer.classes) {
		itemContainer.classes.remove('status-pending', 'status-approved', 'status-rejected');
	}
	
	// Apply subtle styling based on status
	if (normalizedStatus === 'pending') {
		// Amber/orange border or background tint
		if (itemContainer.style) {
			itemContainer.style.borderLeft = '4px solid #FFA726'; // Orange border
			itemContainer.style.backgroundColor = '#FFF8E1'; // Very light amber background
		}
		if (itemContainer.classes) {
			itemContainer.classes.add('status-pending');
		}
	} else if (normalizedStatus === 'approved') {
		// Green border or background tint
		if (itemContainer.style) {
			itemContainer.style.borderLeft = '4px solid #66BB6A'; // Light green border
			itemContainer.style.backgroundColor = '#E8F5E9'; // Very light green background
		}
		if (itemContainer.classes) {
			itemContainer.classes.add('status-approved');
		}
	} else if (normalizedStatus === 'rejected') {
		// Red border or background tint
		if (itemContainer.style) {
			itemContainer.style.borderLeft = '4px solid #EF5350'; // Light red border
			itemContainer.style.backgroundColor = '#FFEBEE'; // Very light red background
		}
		if (itemContainer.classes) {
			itemContainer.classes.add('status-rejected');
		}
	}
}

function applyStatusDropdownStyling(dropdownElement, status) {
	// Apply subtle color styling to status dropdown based on value
	if (!dropdownElement || !dropdownElement.style) return;
	
	const normalizedStatus = (status || 'Pending').toString().trim().toLowerCase();
	
	if (normalizedStatus === 'pending') {
		dropdownElement.style.borderColor = '#FFA726'; // Orange border
	} else if (normalizedStatus === 'approved') {
		dropdownElement.style.borderColor = '#66BB6A'; // Green border
	} else if (normalizedStatus === 'rejected') {
		dropdownElement.style.borderColor = '#EF5350'; // Red border
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

async function deleteAssignment(assignmentId, assignmentName) {
	try {
		// Use Wix's lightbox for confirmation if available, otherwise proceed with deletion
		// Note: For better UX, create a confirmation lightbox component in Wix Editor
		let confirmed = false;
		
		try {
			// Try to use Wix lightbox for confirmation
			const result = await wixWindow.openLightbox('DeleteConfirmation', {
				assignmentName: assignmentName || 'this request'
			});
			confirmed = result === true || result?.confirmed === true;
		} catch (lightboxError) {
			// Lightbox doesn't exist or failed - use a simple approach
			// Show a warning message and proceed (user can undo by changing status if needed)
			console.log(`[DELETE] Lightbox not available, proceeding with deletion for: ${assignmentName}`);
			// For now, proceed with deletion - user can undo by changing status if needed
			confirmed = true;
		}
		
		if (!confirmed) {
			console.log(`[DELETE] User cancelled deletion`);
			return; // User cancelled
		}
		
		console.log(`[DELETE] Deleting assignment ${assignmentId}`);
		
		// First verify the item exists before attempting deletion
		try {
			const existingRecord = await wixData.get('WeeklyAssignments', assignmentId);
			if (!existingRecord) {
				console.log(`[DELETE] Assignment ${assignmentId} does not exist - may have already been deleted`);
				showSuccess('Request has already been removed.');
				// Reload to refresh the view
				await loadAssignments(currentType);
				return;
			}
		} catch (getError) {
			// If get fails, item likely doesn't exist
			console.log(`[DELETE] Could not find assignment ${assignmentId} - may have already been deleted`);
			showSuccess('Request has already been removed.');
			// Reload to refresh the view
			await loadAssignments(currentType);
			return;
		}
		
		// Delete only the WeeklyAssignments record
		// Profile is kept for contact catalog
		try {
			await wixData.remove('WeeklyAssignments', assignmentId);
			console.log(`[DELETE] Successfully deleted assignment ${assignmentId}`);
			showSuccess('Request deleted successfully. Contact profile has been preserved.');
		} catch (removeError) {
			// Handle case where item doesn't exist (may have been deleted by another process)
			if (removeError.errorCode === 'WDE0073' || removeError.message?.includes('does not exist')) {
				console.log(`[DELETE] Assignment ${assignmentId} was already deleted`);
				showSuccess('Request has already been removed.');
			} else {
				// Re-throw other errors
				throw removeError;
			}
		}
		
		// Small delay to ensure database is updated
		await new Promise(resolve => setTimeout(resolve, 100));
		
		// Reload current view (will respect current filters)
		await loadAssignments(currentType);
		
	} catch (error) {
		console.error('[DELETE] Error deleting assignment:', error);
		console.error('[DELETE] Full error:', JSON.stringify(error, null, 2));
		showError('Failed to delete request. Please try again.');
	}
}

function showLoading(show, message) {
	const loadingIndicator = $w('#loadingIndicator');
	if (loadingIndicator) {
		if (show) {
			// Set message if provided
			if (message && loadingIndicator.text !== undefined) {
				loadingIndicator.text = message;
			}
			if (typeof loadingIndicator.show === 'function') {
				loadingIndicator.show();
			}
		} else {
			if (typeof loadingIndicator.hide === 'function') {
				loadingIndicator.hide();
			}
		}
	}
}

function showError(message) {
	const errorElement = $w('#msgError');
	if (errorElement) {
		if (errorElement.text !== undefined) {
			errorElement.text = message;
		}
		if (typeof errorElement.show === 'function') {
			errorElement.show();
			setTimeout(() => {
				if (typeof errorElement.hide === 'function') {
					errorElement.hide();
				}
			}, 5000);
		}
	}
	console.error(message);
}

function showSuccess(message) {
	const successElement = $w('#msgSuccess');
	if (successElement) {
		if (successElement.text !== undefined) {
			successElement.text = message;
		}
		if (typeof successElement.show === 'function') {
			successElement.show();
			setTimeout(() => {
				if (typeof successElement.hide === 'function') {
					successElement.hide();
				}
			}, 3000);
		}
	}
}

// ============================================
// MANUAL ENTRY FORM FUNCTIONS
// ============================================

let manualEntrySelectedDates = [];
let manualEntryRepeaterInitialized = false;
const manualEntryRegisteredHandlers = new Set();
const manualEntryDateStatus = new Map(); // Track current status of each date

function openManualEntryForm() {
	console.log('Opening manual entry form...');
	const manualEntryContainer = $w('#manualEntryContainer');
	if (!manualEntryContainer) {
		console.error('❌ Manual entry container (#manualEntryContainer) not found!');
		showError('Manual entry form container not found. Please check that #manualEntryContainer exists.');
		return;
	}
	
	// Set all tabs to inactive/neutral state (manual entry form is open)
	setAllTabsInactive();
	
	// Hide assignments container to prevent interference
	const assignmentsContainer = $w('#assignmentsContainer');
	if (assignmentsContainer) {
		if (typeof assignmentsContainer.hide === 'function') {
			assignmentsContainer.hide();
		}
		if (assignmentsContainer.style) {
			assignmentsContainer.style.display = 'none';
			assignmentsContainer.style.visibility = 'hidden';
		}
		console.log('Assignments container hidden');
	} else {
		console.warn('Assignments container (#assignmentsContainer) not found');
	}
	
	console.log('Manual entry container found, showing...');
	
	// Show the manual entry container
	if (typeof manualEntryContainer.show === 'function') {
		manualEntryContainer.show();
		console.log('Container shown');
		
		// Also ensure it's visible (in case show() doesn't work)
		if (manualEntryContainer.style) {
			manualEntryContainer.style.display = 'block';
			manualEntryContainer.style.visibility = 'visible';
		}
	} else {
		console.warn('Container show() method not available, trying style approach');
		if (manualEntryContainer.style) {
			manualEntryContainer.style.display = 'block';
			manualEntryContainer.style.visibility = 'visible';
		}
	}
	
	// Reset form
	resetManualEntryForm();
	console.log('Form reset');
	
	// Hide all section titles initially
	const sectionTitles = ['manualEntryMusicianTitle', 'manualEntryVolunteerTitle', 'manualEntryNonprofitTitle', 'manualEntryDateTitle'];
	sectionTitles.forEach(titleId => {
		const title = $w(`#${titleId}`);
		if (title && typeof title.hide === 'function') {
			title.hide();
		}
	});
	
	// Set default type based on current tab
	const typeDropdown = $w('#manualEntryType');
	if (typeDropdown) {
		if (typeDropdown.value !== undefined) {
			typeDropdown.value = currentType;
			onManualEntryTypeChange();
		} else {
			// Load dates even if no type selected (will show general availability)
			populateManualEntryDates();
			updateManualEntryContainerLayout();
		}
	} else {
		// Try to load dates anyway
		populateManualEntryDates();
		updateManualEntryContainerLayout();
	}
}

function closeManualEntryForm() {
	const manualEntryContainer = $w('#manualEntryContainer');
	if (manualEntryContainer && typeof manualEntryContainer.hide === 'function') {
		manualEntryContainer.hide();
	}
	if (manualEntryContainer && manualEntryContainer.style) {
		manualEntryContainer.style.display = 'none';
		manualEntryContainer.style.visibility = 'hidden';
	}
	
	// Reset form and clear repeater
	resetManualEntryForm();
	const repeater = $w('#manualEntryDateRepeater');
	if (repeater && repeater.data !== undefined) {
		repeater.data = [];
	}
	
	// Reset repeater initialization flags and handlers
	manualEntryRepeaterInitialized = false;
	manualEntryRegisteredHandlers.clear();
	manualEntryDateStatus.clear();
	
	// Restore proper tab styling (show which tab is currently active)
	updateActiveTab(currentType);
	
	// Show assignments container again
	const assignmentsContainer = $w('#assignmentsContainer');
	if (assignmentsContainer) {
		if (typeof assignmentsContainer.show === 'function') {
			assignmentsContainer.show();
		}
		if (assignmentsContainer.style) {
			assignmentsContainer.style.display = 'block';
			assignmentsContainer.style.visibility = 'visible';
		}
		console.log('Assignments container shown');
	} else {
		console.warn('Assignments container (#assignmentsContainer) not found');
	}
}

function setupManualEntryForm() {
	console.log('Setting up manual entry form handlers...');
	
	// Type dropdown change handler
	const typeDropdown = $w('#manualEntryType');
	if (typeDropdown) {
		if (typeof typeDropdown.onChange === 'function') {
			typeDropdown.onChange(() => {
				console.log('Manual entry type changed');
				onManualEntryTypeChange();
			});
		}
		
		// Populate type dropdown
		if (typeDropdown.options) {
			typeDropdown.options = [
				{ value: 'Musician', label: 'Musician' },
				{ value: 'Volunteer', label: 'Volunteer' },
				{ value: 'NonProfit', label: 'Non-Profit' }
			];
			console.log('Type dropdown populated');
		}
	} else {
		console.warn('Type dropdown (#manualEntryType) not found');
	}
	
	// Submit button
	const submitBtn = $w('#btnManualEntrySubmit');
	if (submitBtn && typeof submitBtn.onClick === 'function') {
		submitBtn.onClick(async () => {
			console.log('Manual entry submit clicked');
			await handleManualEntrySubmit();
		});
		console.log('Submit button handler set');
	} else {
		console.warn('Submit button (#btnManualEntrySubmit) not found or onClick not available');
	}
	
	// Cancel button
	const cancelBtn = $w('#btnManualEntryCancel');
	if (cancelBtn && typeof cancelBtn.onClick === 'function') {
		cancelBtn.onClick(() => {
			console.log('Manual entry cancel clicked');
			closeManualEntryForm();
		});
		console.log('Cancel button handler set');
	} else {
		console.warn('Cancel button (#btnManualEntryCancel) not found or onClick not available');
	}
	
	// Populate dropdowns
	try {
		populateManualEntryDropdowns();
		console.log('Manual entry dropdowns populated');
	} catch (error) {
		console.error('Error populating manual entry dropdowns:', error);
	}
	
	console.log('Manual entry form setup complete');
}

function onManualEntryTypeChange() {
	const type = $w('#manualEntryType')?.value || 'Musician';
	
	// Define type-specific fields and titles
	const musicianFields = ['manualEntryMusicianType', 'manualEntryLocation', 'manualEntryDuration', 'manualEntryGenre', 'manualEntryTechNeeds'];
	const musicianTitle = 'manualEntryMusicianTitle';
	
	const volunteerFields = ['manualEntryVolunteerRole', 'manualEntryShiftPreference'];
	const volunteerTitle = 'manualEntryVolunteerTitle';
	
	const nonprofitFields = ['manualEntryNonProfitType'];
	const nonprofitTitle = 'manualEntryNonprofitTitle';
	
	const dateTitle = 'manualEntryDateTitle';
	
	// Hide all fields and titles first
	const allFields = [...musicianFields, ...volunteerFields, ...nonprofitFields];
	const allTitles = [musicianTitle, volunteerTitle, nonprofitTitle];
	
	allFields.forEach(fieldId => {
		const field = $w(`#${fieldId}`);
		if (field && typeof field.hide === 'function') {
			field.hide();
		}
	});
	
	allTitles.forEach(titleId => {
		const title = $w(`#${titleId}`);
		if (title && typeof title.hide === 'function') {
			title.hide();
		}
	});
	
	// Show date title (always visible once type is selected)
	if (dateTitle) {
		const dateTitleElement = $w(`#${dateTitle}`);
		if (dateTitleElement && typeof dateTitleElement.show === 'function') {
			dateTitleElement.show();
		}
	}
	
	// Show relevant fields and title based on type
	if (type === 'Musician') {
		// Show musician title
		const musicianTitleElement = $w(`#${musicianTitle}`);
		if (musicianTitleElement && typeof musicianTitleElement.show === 'function') {
			musicianTitleElement.show();
		}
		
		// Show musician fields
		musicianFields.forEach(fieldId => {
			const field = $w(`#${fieldId}`);
			if (field && typeof field.show === 'function') {
				field.show();
			}
		});
	} else if (type === 'Volunteer') {
		// Show volunteer title
		const volunteerTitleElement = $w(`#${volunteerTitle}`);
		if (volunteerTitleElement && typeof volunteerTitleElement.show === 'function') {
			volunteerTitleElement.show();
		}
		
		// Show volunteer fields
		volunteerFields.forEach(fieldId => {
			const field = $w(`#${fieldId}`);
			if (field && typeof field.show === 'function') {
				field.show();
			}
		});
	} else if (type === 'NonProfit') {
		// Show nonprofit title
		const nonprofitTitleElement = $w(`#${nonprofitTitle}`);
		if (nonprofitTitleElement && typeof nonprofitTitleElement.show === 'function') {
			nonprofitTitleElement.show();
		}
		
		// Show nonprofit fields
		nonprofitFields.forEach(fieldId => {
			const field = $w(`#${fieldId}`);
			if (field && typeof field.show === 'function') {
				field.show();
			}
		});
	}
	
	// Reload dates with availability based on selected type
	populateManualEntryDates();
	
	// Ensure container is responsive by triggering a layout update
	// The container should automatically resize based on visible elements
	updateManualEntryContainerLayout();
}

function populateManualEntryDropdowns() {
	// Musician type
	const musicianType = $w('#manualEntryMusicianType');
	if (musicianType && musicianType.options) {
		musicianType.options = [
			{ value: 'Solo Acoustic', label: 'Solo Acoustic' },
			{ value: 'Solo Electric', label: 'Solo Electric' },
			{ value: 'Duo Acoustic', label: 'Duo Acoustic' },
			{ value: 'Duo Electric', label: 'Duo Electric' },
			{ value: 'Small Band (3-4 members)', label: 'Small Band (3-4 members)' },
			{ value: 'Large Band (5+ members)', label: 'Large Band (5+ members)' },
			{ value: 'Other', label: 'Other' }
		];
	}
	
	// Location
	const location = $w('#manualEntryLocation');
	if (location && location.options) {
		location.options = [
			{ value: 'Location A', label: '13th Street' },
			{ value: 'Location B', label: 'Food Court' },
			{ value: 'Location C', label: '10th & Iowa St' }
		];
		
		// Refresh dates when location changes (affects availability for musicians)
		if (typeof location.onChange === 'function') {
			location.onChange(() => {
				const selectedType = $w('#manualEntryType')?.value;
				if (selectedType === 'Musician') {
					populateManualEntryDates();
				}
			});
		}
	}
	
	// Duration
	const duration = $w('#manualEntryDuration');
	if (duration && duration.options) {
		duration.options = [
			{ value: '5 hours', label: '5 hours' },
			{ value: '4 hours', label: '4 hours' },
			{ value: '3 hours', label: '3 hours' },
			{ value: '2 hours', label: '2 hours' },
			{ value: '1 hour', label: '1 hour' }
		];
	}
	
	// Genre
	const genre = $w('#manualEntryGenre');
	if (genre && genre.options) {
		genre.options = [
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
	}
	
	// Volunteer role
	const volunteerRole = $w('#manualEntryVolunteerRole');
	if (volunteerRole && volunteerRole.options) {
		volunteerRole.options = [
			{ value: 'Token Sales', label: 'Token Sales' },
			{ value: 'Merch Sales', label: 'Merch Sales' },
			{ value: 'Setup', label: 'Setup' },
			{ value: 'Teardown', label: 'Teardown' },
			{ value: 'Hospitality Support', label: 'Hospitality Support' },
			{ value: 'No Preference', label: 'No Preference' }
		];
		
		// Refresh dates when volunteer role changes (affects availability)
		if (typeof volunteerRole.onChange === 'function') {
			volunteerRole.onChange(() => {
				const selectedType = $w('#manualEntryType')?.value;
				if (selectedType === 'Volunteer') {
					populateManualEntryDates();
				}
			});
		}
	}
	
	// Shift preference
	const shiftPreference = $w('#manualEntryShiftPreference');
	if (shiftPreference && shiftPreference.options) {
		shiftPreference.options = [
			{ value: 'Early Shift', label: 'Early Shift (7:00 AM - 9:30 AM)' },
			{ value: 'Late Shift', label: 'Late Shift (9:30 AM - 12:00 PM)' },
			{ value: 'Both', label: 'Both Shifts' }
		];
	}
	
	// Non-profit type
	const nonProfitType = $w('#manualEntryNonProfitType');
	if (nonProfitType && nonProfitType.options) {
		nonProfitType.options = [
			{ value: 'Community Outreach', label: 'Community Outreach' },
			{ value: 'Health & Wellness', label: 'Health & Wellness' },
			{ value: 'Arts & Culture', label: 'Arts & Culture' },
			{ value: 'Education', label: 'Education' },
			{ value: 'Environment', label: 'Environment' },
			{ value: 'Social Services', label: 'Social Services' },
			{ value: 'Other', label: 'Other' }
		];
	}
}


async function populateManualEntryDates() {
	try {
		const results = await wixData.query('MarketDates2026')
			.find();
		
		// Get availability data for all dates
		let availability = {};
		try {
			if (typeof getDateAvailability === 'function') {
				availability = await getDateAvailability();
			} else {
				console.warn('getDateAvailability not available, showing all dates as available');
			}
		} catch (error) {
			console.error('Error fetching availability for manual entry:', error);
			availability = {}; // Fallback to empty object
		}
		
		// Get selected type to determine availability logic
		const selectedType = $w('#manualEntryType')?.value || 'Musician';
		
		// Process dates: parse, sort chronologically
		const dateItems = results.items
			.map(item => {
				// Handle date parsing to avoid timezone issues
				let dateObj;
				if (typeof item.date === 'string') {
					const dateStr = item.date.split('T')[0]; // Get YYYY-MM-DD part
					const [year, month, day] = dateStr.split('-').map(Number);
					dateObj = new Date(year, month - 1, day, 12, 0, 0, 0); // Use noon local time
				} else {
					dateObj = new Date(item.date);
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
		
		console.log('📅 Manual Entry - Building repeater data for type:', selectedType);
		const nonProfitDates = Object.keys(availability).filter(id => availability[id]?.nonProfits > 0);
		if (nonProfitDates.length > 0) {
			console.log('📊 Non-profit dates in availability:', nonProfitDates.map(id => ({ id, count: availability[id].nonProfits })));
		}
		
		// Build repeater data with availability status based on type
		const repeaterData = dateItems.map(item => {
			const daySuffix = getDaySuffix(item.day);
			const dateAvailability = availability[item._id];
			const isCurrentlySelected = manualEntrySelectedDates.includes(item._id);
			
			// Determine status and border color based on type
			let status = 'available';
			let borderColor = '#4CAF50'; // Green
			
			if (selectedType === 'Musician') {
				// Check musician availability by location
				const selectedLocation = $w('#manualEntryLocation')?.value;
				
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
			} else if (selectedType === 'Volunteer') {
				// Check volunteer availability by role - ONLY use volunteer data, not non-profit data
				const selectedRole = $w('#manualEntryVolunteerRole')?.value || 'No Preference';
				const roleLimits = {
					'Token Sales': 2,
					'Merch Sales': 2,
					'Setup': 2,
					'Teardown': 2,
					'Hospitality Support': 2,
					'No Preference': 1
				};
				
				// Only check volunteer data structure, ignore nonProfits field completely
				if (dateAvailability && dateAvailability.volunteers && typeof dateAvailability.volunteers === 'object') {
					// Get count for the specific role (default to 0 if role doesn't exist in volunteers object)
					// IMPORTANT: Only access volunteers object, never touch nonProfits
					const roleCount = dateAvailability.volunteers[selectedRole] || 0;
					const limit = roleLimits[selectedRole] || 2;
					
					// Calculate status based ONLY on volunteer role count, never on non-profit data
					if (roleCount >= limit) {
						status = 'full';
						borderColor = '#F44336'; // Red
					} else if (limit > 1 && roleCount >= Math.floor(limit * 0.7)) {
						// Only show as limited if limit > 1 (for 'No Preference' with limit=1, any count means full)
						status = 'limited';
						borderColor = '#FF9800'; // Orange
					}
					// Otherwise available (green) - roleCount < Math.floor(limit * 0.7)
				}
			} else if (selectedType === 'NonProfit') {
				// Non-profits: only 1 per week, so 0 = available, 1+ = full
				const nonProfitCount = dateAvailability ? dateAvailability.nonProfits : 0;
				
				if (nonProfitCount >= 1) {
					status = 'full';
					borderColor = '#F44336'; // Red
				}
			}
			
			// Store status in the Map for dynamic lookup in click handlers
			manualEntryDateStatus.set(item._id, { status, borderColor });
			
			return {
				_id: item._id,
				label: `${item.monthName} ${item.day}${daySuffix}`,
				status: status,
				borderColor: borderColor,
				isSelected: isCurrentlySelected
			};
		});
		
		// Log summary of repeater data
		const fullDates = repeaterData.filter(d => d.status === 'full').map(d => d.label);
		const limitedDates = repeaterData.filter(d => d.status === 'limited').map(d => d.label);
		if (fullDates.length > 0 || limitedDates.length > 0) {
			console.log('📋 Manual Entry - Repeater data built:', {
				totalDates: repeaterData.length,
				fullDates: fullDates,
				limitedDates: limitedDates
			});
		}
		
		const repeater = $w('#manualEntryDateRepeater');
		if (!repeater) {
			console.error('Manual entry date repeater not found');
			return;
		}
		
		// Set up repeater onItemReady ONLY ONCE (to prevent multiple click handlers)
		if (!manualEntryRepeaterInitialized && typeof repeater.onItemReady === 'function') {
			repeater.onItemReady(($item, itemData, index) => {
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
					applyManualEntryDateStyling(container, itemData, manualEntrySelectedDates);
					
					// Only register onClick handler if not already registered for this item
					const dateId = itemData._id;
					if (!manualEntryRegisteredHandlers.has(dateId)) {
						manualEntryRegisteredHandlers.add(dateId);
						
						$item('#itemContainer').onClick(() => {
							// Get current status from Map (may have changed if type changed)
							const currentStatus = manualEntryDateStatus.get(dateId);
							
							// Prevent clicking on full dates
							if (currentStatus && currentStatus.status === 'full') {
								return;
							}
							
							const container = $item('#itemContainer');
							const isSelected = manualEntrySelectedDates.includes(dateId);
							
							if (isSelected) {
								// Deselect: remove from array
								manualEntrySelectedDates = manualEntrySelectedDates.filter(id => id !== dateId);
							} else {
								// Select: add to array
								manualEntrySelectedDates.push(dateId);
							}
							
							// Get current item data from repeater for styling
							const currentItemData = {
								_id: dateId,
								status: currentStatus?.status || 'available',
								borderColor: currentStatus?.borderColor || '#4CAF50'
							};
							
							// Reapply styling to reflect new selection state
							applyManualEntryDateStyling(container, currentItemData, manualEntrySelectedDates);
							
							console.log('Selected dates:', [...manualEntrySelectedDates]);
						});
					}
				} catch (error) {
					console.error('Error setting up repeater item:', error);
				}
			});
			manualEntryRepeaterInitialized = true;
		}
		
		// Populate repeater with data
		repeater.data = repeaterData;
		
		// Update styling for all items after data is set
		const applyAllStyling = () => {
			repeater.forEachItem(($item, itemData, index) => {
				try {
					const container = $item('#itemContainer');
					if (container) {
						// Use the status from our Map if available (more up-to-date)
						const currentStatus = manualEntryDateStatus.get(itemData._id);
						const effectiveItemData = currentStatus ? {
							...itemData,
							status: currentStatus.status,
							borderColor: currentStatus.borderColor
						} : itemData;
						
						applyManualEntryDateStyling(container, effectiveItemData, manualEntrySelectedDates);
					}
				} catch (e) {
					console.warn('Failed to update item styling at index', index, ':', e);
				}
			});
		};
		
		// Apply styling multiple times to ensure it takes effect
		setTimeout(applyAllStyling, 100);
		setTimeout(applyAllStyling, 500);
		
	} catch (error) {
		console.error('Error populating manual entry dates:', error);
		showError('Failed to load dates. Please refresh.');
	}
}

function applyManualEntryDateStyling(container, itemData, selectedDateIds) {
	if (!container) {
		console.warn('applyManualEntryDateStyling: container is null', { itemData });
		return;
	}
	
	const isSelected = selectedDateIds.includes(itemData._id);
	const isFull = itemData.status === 'full';
	const isLimited = itemData.status === 'limited';
	
	// Ensure borderColor is in correct format (with safety check)
	let borderColor = '#4CAF50'; // Default green
	if (itemData.borderColor) {
		borderColor = itemData.borderColor.startsWith('#') 
			? itemData.borderColor 
			: `#${itemData.borderColor}`;
	}
	
	// Only log styling for full/limited dates to reduce noise (optional - can be removed in production)
	// if (isFull || isLimited) {
	// 	console.log(`🎨 Manual Entry STYLING: ${itemData.label || itemData._id} - status: ${itemData.status}, borderColor: ${borderColor}`);
	// }
	
	try {
		if (!container.style) {
			console.warn('⚠️ Container has no style property');
			return;
		}
		
		// Note: Wix Box elements don't support classList or setAttribute
		// We must use inline styles with !important flags only
		
		// Apply inline styles - use setProperty with !important for border color
		if (container.style) {
			const borderWidth = isSelected ? '4px' : '3px';
			
			// Try Wix design API first if available (for Box elements)
			if (container.design && typeof container.design.setBorder === 'function') {
				try {
					container.design.setBorder({
						width: parseInt(borderWidth),
						style: 'solid',
						color: borderColor
					});
				} catch (designErr) {
					console.warn('Design API not available, using style property');
				}
			}
			
			// Set border color using setProperty with !important (more reliable)
			try {
				container.style.setProperty('border-color', borderColor, 'important');
				container.style.setProperty('border-width', borderWidth, 'important');
				container.style.setProperty('border-style', 'solid', 'important');
				
				// Also set as CSS string (sometimes works better)
				container.style.setProperty('border', `${borderWidth} solid ${borderColor}`, 'important');
			} catch (e) {
				// Fallback to regular assignment
				container.style.borderColor = borderColor;
				container.style.borderWidth = borderWidth;
				container.style.borderStyle = 'solid';
				container.style.border = `${borderWidth} solid ${borderColor}`;
			}
			
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
			
			container.style.userSelect = 'none';
			container.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
			
			// Force re-apply border after a short delay to override Wix's conversion
			setTimeout(() => {
				if (container && container.style) {
					try {
						container.style.setProperty('border-color', borderColor, 'important');
						container.style.setProperty('border-width', borderWidth, 'important');
						container.style.setProperty('border-style', 'solid', 'important');
						
						// Log final state for debugging
						if (isFull || isLimited) {
							const computedBorder = container.style.borderColor || window.getComputedStyle?.(container)?.borderColor;
							const actualBorderWidth = container.style.borderWidth;
							console.log(`   ✅ After timeout - borderColor set to: ${borderColor}, computed: ${computedBorder}`);
							console.log(`   Border width: ${actualBorderWidth}`);
							console.log(`   Classes:`, container.classList ? Array.from(container.classList) : 'none');
							console.log(`   Data attributes:`, {
								status: container.getAttribute?.('data-status'),
								availability: container.getAttribute?.('data-availability-status')
							});
							
							// Warn if border isn't visible
							if (!actualBorderWidth || actualBorderWidth === '0px') {
								console.warn(`   ⚠️ WARNING: Border width is ${actualBorderWidth}. Make sure #itemContainer Box elements have borders enabled in Wix Editor!`);
							}
						}
					} catch (e) {
						container.style.borderColor = borderColor;
						container.style.borderWidth = borderWidth;
						container.style.borderStyle = 'solid';
					}
				}
			}, 50);
		}
		
	} catch (e) {
		console.warn('Failed to apply styling:', e);
	}
}

function resetManualEntryForm() {
	manualEntrySelectedDates = [];
	
	// Reset all inputs
	const fields = [
		'manualEntryType', 'manualEntryName', 'manualEntryEmail', 'manualEntryPhone',
		'manualEntryBio', 'manualEntryWebsite', 'manualEntryMusicianType',
		'manualEntryLocation', 'manualEntryDuration', 'manualEntryGenre',
		'manualEntryTechNeeds', 'manualEntryVolunteerRole', 'manualEntryShiftPreference',
		'manualEntryNonProfitType'
	];
	
	fields.forEach(fieldId => {
		const field = $w(`#${fieldId}`);
		if (field) {
			if (field.value !== undefined) {
				field.value = '';
			}
			if (field.text !== undefined) {
				field.text = '';
			}
			if (field.checked !== undefined) {
				field.checked = false;
			}
		}
	});
	
	// Hide all section titles
	const sectionTitles = ['manualEntryMusicianTitle', 'manualEntryVolunteerTitle', 'manualEntryNonprofitTitle', 'manualEntryDateTitle'];
	sectionTitles.forEach(titleId => {
		const title = $w(`#${titleId}`);
		if (title && typeof title.hide === 'function') {
			title.hide();
		}
	});
}

async function handleManualEntrySubmit() {
	try {
		// Get field values with better error handling
		// Helper function to get value from Wix element (handles both value and text properties)
		const getFieldValue = (field) => {
			if (!field) return '';
			// Try value property first (most common)
			if (field.value !== undefined && field.value !== null) {
				const val = String(field.value).trim();
				if (val) return val;
			}
			// Try text property
			if (field.text !== undefined && field.text !== null) {
				const val = String(field.text).trim();
				if (val) return val;
			}
			// Try phone property (for phone input elements)
			if (field.phone !== undefined && field.phone !== null) {
				const val = String(field.phone).trim();
				if (val) return val;
			}
			return '';
		};
		
		const typeField = $w('#manualEntryType');
		const nameField = $w('#manualEntryName');
		const emailField = $w('#manualEntryEmail');
		const phoneField = $w('#manualEntryPhone');
		
		const type = getFieldValue(typeField);
		const organizationName = getFieldValue(nameField);
		const contactEmail = getFieldValue(emailField);
		
		// Special handling for phone field - try multiple approaches
		let contactPhone = getFieldValue(phoneField);
		
		// If phone is still empty, try direct access methods
		if (!contactPhone && phoneField) {
			// Try accessing value directly
			if (phoneField.value !== undefined && phoneField.value !== null && phoneField.value !== '') {
				contactPhone = String(phoneField.value).trim();
			}
			// Try phone property
			if (!contactPhone && phoneField.phone !== undefined && phoneField.phone !== null) {
				contactPhone = String(phoneField.phone).trim();
			}
			// Try calling getValue() if it exists
			if (!contactPhone && typeof phoneField.getValue === 'function') {
				try {
					const phoneVal = phoneField.getValue();
					if (phoneVal) contactPhone = String(phoneVal).trim();
				} catch (e) {
					console.warn('getValue() failed for phone field:', e);
				}
			}
		}
		
		const bio = getFieldValue($w('#manualEntryBio')) || null;
		const website = getFieldValue($w('#manualEntryWebsite')) || null;
		
		// Debug logging to see what values we're getting, with special focus on phone field
		console.log('Manual entry form values:', {
			type: type,
			organizationName: organizationName,
			contactEmail: contactEmail,
			contactPhone: contactPhone,
			typeFieldExists: !!typeField,
			nameFieldExists: !!nameField,
			emailFieldExists: !!emailField,
			phoneFieldExists: !!phoneField,
			phoneFieldType: phoneField?.type,
			phoneFieldValue: phoneField?.value,
			phoneFieldText: phoneField?.text,
			phoneFieldPhone: phoneField?.phone,
			phoneFieldKeys: phoneField ? Object.keys(phoneField).filter(k => !k.startsWith('_')).slice(0, 15) : [],
			phoneFieldHasGetValue: typeof phoneField?.getValue === 'function'
		});
		
		// Get selected dates from the tracked array (same as submission forms)
		const dateIds = [...manualEntrySelectedDates];
		
		// Validate required fields with specific error messages
		const missingFields = [];
		if (!type) missingFields.push('Type');
		if (!organizationName) missingFields.push('Name');
		if (!contactEmail) missingFields.push('Email');
		if (!contactPhone) missingFields.push('Phone');
		
		if (missingFields.length > 0) {
			throw new Error(`Please fill in the following required fields: ${missingFields.join(', ')}`);
		}
		
		if (!dateIds || dateIds.length === 0) {
			throw new Error('Please select at least one market date.');
		}
		
		// Build profile data based on type
		const profileData = {
			type: type,
			title: organizationName,
			organizationName: organizationName,
			contactEmail: contactEmail,
			contactPhone: contactPhone,
			bio: bio,
			website: website
		};
		
		// Add type-specific fields
		if (type === 'Musician') {
			const musicianType = $w('#manualEntryMusicianType')?.value?.trim();
			const preferredLocation = $w('#manualEntryLocation')?.value?.trim();
			const duration = $w('#manualEntryDuration')?.value?.trim() || null;
			const genre = $w('#manualEntryGenre')?.value?.trim() || null;
			const techNeeds = $w('#manualEntryTechNeeds')?.checked || false;
			
			if (musicianType) profileData.musicianType = musicianType;
			if (preferredLocation) profileData.preferredLocation = preferredLocation;
			if (duration) profileData.duration = duration;
			if (genre) profileData.genre = genre;
			if (techNeeds) profileData.techNeeds = techNeeds;
		} else if (type === 'Volunteer') {
			const volunteerRole = $w('#manualEntryVolunteerRole')?.value?.trim();
			const shiftPreference = $w('#manualEntryShiftPreference')?.value?.trim();
			
			if (volunteerRole) profileData.volunteerRole = volunteerRole;
			if (shiftPreference) profileData.shiftPreference = shiftPreference;
		} else if (type === 'NonProfit') {
			const nonProfitType = $w('#manualEntryNonProfitType')?.value?.trim();
			if (nonProfitType) profileData.nonProfitType = nonProfitType;
		}
		
		// Disable submit button
		const submitBtn = $w('#btnManualEntrySubmit');
		if (submitBtn && typeof submitBtn.disable === 'function') {
			submitBtn.disable();
		}
		
		// Submit using manual entry function (skip CRM contact creation by default)
		const result = await manualEntrySpecialtyProfile(profileData, dateIds, false);
		
		showSuccess(`Manual entry created successfully! ${result.assignmentsCreated} assignment(s) created.`);
		
		// Close form first
		closeManualEntryForm();
		
		// Ensure assignments container is visible (in case closeManualEntryForm didn't show it)
		const assignmentsContainer = $w('#assignmentsContainer');
		if (assignmentsContainer) {
			if (typeof assignmentsContainer.show === 'function') {
				assignmentsContainer.show();
			}
			if (assignmentsContainer.style) {
				assignmentsContainer.style.display = 'block';
				assignmentsContainer.style.visibility = 'visible';
			}
			console.log('Assignments container shown after manual entry submission');
		}
		
		// Restore proper tab styling (closeManualEntryForm should do this, but ensure it's done)
		updateActiveTab(currentType);
		
		// Reload assignments for the current tab type (not necessarily the submitted type)
		await loadAssignments(currentType);
		
	} catch (error) {
		console.error('Manual entry error:', error);
		showError(error.message || 'Failed to create manual entry. Please try again.');
	} finally {
		// Re-enable submit button
		const submitBtn = $w('#btnManualEntrySubmit');
		if (submitBtn && typeof submitBtn.enable === 'function') {
			submitBtn.enable();
		}
	}
}

function updateManualEntryContainerLayout() {
	// This function ensures the container layout updates when fields are shown/hidden
	// Wix should handle this automatically, but we can force a refresh if needed
	const container = $w('#manualEntryContainer');
	if (!container) return;
	
	// Trigger a small delay to allow DOM to update, then ensure container is properly sized
	setTimeout(() => {
		// If container has a resize or layout method, call it
		// Otherwise, Wix will handle it automatically based on visible elements
		if (container.style) {
			// Ensure container uses auto height to accommodate content
			// This is typically handled by Wix automatically, but we can ensure it
			if (container.style.height === 'fixed') {
				// If height was fixed, we might want to change it, but usually Wix handles this
				// Just ensure the container can grow/shrink with content
			}
		}
	}, 100);
}
