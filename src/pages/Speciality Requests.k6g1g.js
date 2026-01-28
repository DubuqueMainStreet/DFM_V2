import wixData from 'wix-data';

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
			{ value: 'Rejected', label: 'Rejected' },
			{ value: 'Confirmed', label: 'Confirmed' }
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
		for (const assignment of results.items) {
			if (assignment.profileRef && assignment.profileRef.type === type) {
				// Filter by status if not "all"
				const assignmentStatus = assignment.applicationStatus || 'Pending';
				if (selectedStatus === 'all' || assignmentStatus === selectedStatus) {
					repeaterData.push(prepareRepeaterItem(assignment));
				}
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
	
	// Set up action buttons - check if they exist and are buttons before setting onClick
	const btnApprove = $item('#btnApprove');
	if (btnApprove && typeof btnApprove.onClick === 'function') {
		btnApprove.onClick(() => {
			updateAssignmentStatus(itemData._id, 'Approved');
		});
		// Hide button if already approved/confirmed
		if (itemData.status === 'Approved' || itemData.status === 'Confirmed') {
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
	
	const btnConfirm = $item('#btnConfirm');
	if (btnConfirm && typeof btnConfirm.onClick === 'function') {
		btnConfirm.onClick(() => {
			updateAssignmentStatus(itemData._id, 'Confirmed');
		});
		// Only show if approved
		if (itemData.status === 'Approved') {
			btnConfirm.show();
		} else {
			btnConfirm.hide();
		}
	}
	
	const btnAssignLocation = $item('#btnAssignLocation');
	if (btnAssignLocation && typeof btnAssignLocation.onClick === 'function') {
		btnAssignLocation.onClick(() => {
			// Focus the location dropdown if it exists
			const locationDropdown = $item('#itemLocation');
			if (locationDropdown && locationDropdown.options) {
				locationDropdown.focus();
			}
		});
	}
}

async function updateAssignmentStatus(assignmentId, newStatus) {
	try {
		await wixData.update('WeeklyAssignments', {
			_id: assignmentId,
			applicationStatus: newStatus
		});
		
		// Reload current view
		await loadAssignments(currentType);
		
		showSuccess(`Status updated to ${newStatus}`);
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
