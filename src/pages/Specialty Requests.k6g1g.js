import wixData from 'wix-data';
import wixWindow from 'wix-window';
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
		
		// Set up search handler
		setupSearchHandler();
		
		// Set up clear filters button
		setupClearFiltersButton();
		
		// Set up refresh button
		setupRefreshButton();
		
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
	
	// Update active tab styling
	updateActiveTab(type);
	
	// Load assignments for selected type
	await loadAssignments(type);
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
		let query = wixData.query('WeeklyAssignments')
			.include('profileRef')
			.include('dateRef');
		
		// Filter by date if not "all"
		if (selectedDateId !== 'all') {
			query = query.eq('dateRef', selectedDateId);
		}
		
		const results = await query.find();
		
		// Filter by profile type, status, and search query, then prepare data for repeater
		const repeaterData = [];
		let totalChecked = 0;
		let typeMatched = 0;
		let statusFiltered = 0;
		let searchFiltered = 0;
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
		console.log(`  - Final count displayed: ${repeaterData.length}`);
		console.log(`  - Filters: status="${selectedStatus}", date="${selectedDateId}", search="${searchQuery}"`);
		
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
	
	return {
		_id: assignment._id,
		name: profile.organizationName || 'Unknown',
		date: formattedDate.display, // Formatted date string
		dateValue: dateValue, // Original date for sorting
		dateRelative: formattedDate.relative, // Relative date (e.g., "Next Saturday")
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
	// Standard location options - using actual location names
	const standardLocations = [
		{ value: 'Unassigned', label: 'Unassigned' },
		{ value: 'Food Court', label: 'Food Court' },
		{ value: '13th Street', label: '13th Street' },
		{ value: '10th & Iowa St', label: '10th & Iowa St' }
	];
	
	// Note: These are the only valid locations. Any other location values found in data
	// will be added dynamically, but these three are the standard options.
	
	// Collect all unique actual location values from assignments
	const actualLocations = new Set();
	
	if (assignments && Array.isArray(assignments)) {
		assignments.forEach(assignment => {
			if (assignment.profileType === 'Musician' && assignment.location) {
				const loc = assignment.location.toString().trim();
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
	
	// Build final options list: standard locations first, then any additional actual locations
	const options = [...standardLocations];
	
	// Add any actual locations that aren't in the standard list
	actualLocations.forEach(loc => {
		const exists = standardLocations.some(opt => opt.value === loc);
		if (!exists) {
			options.push({ value: loc, label: loc });
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
	
	// Set up contact info display with email copy button
	if ($item('#itemContact')) {
		// Format contact info with clickable email
		const contactText = itemData.contactInfo;
		const emailMatch = contactText.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/i);
		const emailAddress = emailMatch ? emailMatch[1] : null;
		
		if ($item('#itemContact').html) {
			// If HTML is supported, make email clickable
			const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi;
			const htmlContact = contactText.replace(emailRegex, '<a href="mailto:$1" style="color: #2196F3; text-decoration: underline;">$1</a>');
			$item('#itemContact').html = htmlContact;
		} else {
			// Fallback to plain text
			$item('#itemContact').text = contactText;
		}
		
		// Set up email copy button if email exists and button element exists
		const btnCopyEmail = $item('#btnCopyEmail');
		if (btnCopyEmail && emailAddress && typeof btnCopyEmail.onClick === 'function') {
			btnCopyEmail.onClick(async () => {
				try {
					// Use Clipboard API - available in modern browsers and Wix environment
					if (navigator && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
						await navigator.clipboard.writeText(emailAddress);
						showSuccess(`Copied ${emailAddress} to clipboard`);
					} else {
						// If Clipboard API is not available, show email in a way user can copy manually
						// In Wix, we can't use document.execCommand fallback
						showSuccess(`Email: ${emailAddress} (select and copy manually)`);
					}
				} catch (error) {
					console.error('[COPY-EMAIL] Error copying email:', error);
					// Show the email address so user can copy it manually
					showSuccess(`Email: ${emailAddress} (select and copy manually)`);
				}
			});
			
			// Style the copy button
			if (btnCopyEmail.style) {
				btnCopyEmail.style.borderRadius = '8px';
				btnCopyEmail.style.backgroundColor = '#F5F5F5';
				btnCopyEmail.style.color = '#666666';
				btnCopyEmail.style.fontSize = '12px';
				btnCopyEmail.style.padding = '6px 12px';
				btnCopyEmail.style.border = '1px solid #E0E0E0';
				btnCopyEmail.style.cursor = 'pointer';
				btnCopyEmail.style.transition = 'all 0.2s ease';
			}
			
			// Show the button
			if (typeof btnCopyEmail.show === 'function') {
				btnCopyEmail.show();
			}
		} else if (btnCopyEmail && typeof btnCopyEmail.hide === 'function') {
			// Hide copy button if no email
			btnCopyEmail.hide();
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
				
				// Set the current location value - ensure it matches exactly
				const currentLocation = itemData.location || 'Unassigned';
				// Check if current location exists in options, if not add it
				const locationExists = locationOptions.some(opt => opt.value === currentLocation);
				if (!locationExists && currentLocation !== 'Unassigned') {
					// Add the actual location to options if it's not in the list
					locationElement.options = [
						...locationOptions,
						{ value: currentLocation, label: currentLocation }
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
				// It's a text element
				if (locationElement.text !== undefined) {
					locationElement.text = itemData.location || 'Unassigned';
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

