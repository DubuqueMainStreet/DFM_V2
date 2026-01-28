import wixData from 'wix-data';

// Global state
let marketDates = [];
let coverageData = [];
let currentMonth = null; // Current selected month (0-11, where 0 = January)

$w.onReady(function () {
	initializeCalendar();
});

async function initializeCalendar() {
	try {
		showLoading(true);
		
		// Set up month tab handlers
		setupMonthTabs();
		
		// Load all market dates
		await loadMarketDates();
		
		// Calculate coverage for each date
		await calculateCoverage();
		
		// Set default month to May (first market month)
		const firstDate = marketDates[0];
		if (firstDate) {
			currentMonth = firstDate.date.getMonth();
			selectMonth(currentMonth);
		}
		
		// Display calendar
		displayCalendar();
		
	} catch (error) {
		console.error('Error initializing calendar:', error);
		showError('Failed to load calendar. Please refresh.');
	} finally {
		showLoading(false);
	}
}

function setupMonthTabs() {
	// Month tabs: May (4), June (5), July (6), August (7), September (8), October (9)
	const monthTabs = [
		{ month: 4, id: '#tabMay', label: 'May' },
		{ month: 5, id: '#tabJune', label: 'June' },
		{ month: 6, id: '#tabJuly', label: 'July' },
		{ month: 7, id: '#tabAugust', label: 'August' },
		{ month: 8, id: '#tabSeptember', label: 'September' },
		{ month: 9, id: '#tabOctober', label: 'October' }
	];
	
	monthTabs.forEach(({ month, id, label }) => {
		const tab = $w(id);
		if (tab && typeof tab.onClick === 'function') {
			tab.onClick(() => {
				selectMonth(month);
			});
		}
	});
}

function selectMonth(month) {
	currentMonth = month;
	updateActiveMonthTab(month);
	displayCalendar();
}

function updateActiveMonthTab(activeMonth) {
	// Update tab styling - you can customize this
	const monthTabs = [
		{ month: 4, id: '#tabMay' },
		{ month: 5, id: '#tabJune' },
		{ month: 6, id: '#tabJuly' },
		{ month: 7, id: '#tabAugust' },
		{ month: 8, id: '#tabSeptember' },
		{ month: 9, id: '#tabOctober' }
	];
	
	monthTabs.forEach(({ month, id }) => {
		const tab = $w(id);
		if (tab) {
			// Ensure all tabs are visible
			tab.show();
			// You can add custom styling here for active/inactive states
			// For example: tab.style.borderBottom = (month === activeMonth) ? '2px solid blue' : 'none';
		}
	});
}

async function loadMarketDates() {
	try {
		const results = await wixData.query('MarketDates2026')
			.ascending('date')
			.find();
		
		marketDates = results.items.map(item => ({
			_id: item._id,
			date: new Date(item.date),
			title: item.title || formatDate(new Date(item.date))
		}));
		
		console.log(`Loaded ${marketDates.length} market dates`);
	} catch (error) {
		console.error('Error loading market dates:', error);
		throw error;
	}
}

async function calculateCoverage() {
	try {
		// Load all assignments with references
		const assignments = await wixData.query('WeeklyAssignments')
			.include('profileRef')
			.include('dateRef')
			.find();
		
		// Group assignments by date
		const assignmentsByDate = {};
		
		for (const assignment of assignments.items) {
			if (!assignment.dateRef || !assignment.profileRef) continue;
			
			const dateId = assignment.dateRef._id;
			if (!assignmentsByDate[dateId]) {
				assignmentsByDate[dateId] = {
					musicians: { approved: [], pending: [] },
					nonProfits: { approved: [], pending: [] },
					volunteers: { approved: [], pending: [] }
				};
			}
			
			const status = (assignment.applicationStatus || 'Pending').toString().trim();
			const profile = assignment.profileRef;
			const assignmentData = {
				_id: assignment._id,
				name: profile.organizationName || 'Unknown',
				status: status,
				location: assignment.assignedMapId || null,
				profileId: profile._id
			};
			
			// Add type-specific data
			if (profile.type === 'Musician') {
				assignmentData.musicianType = profile.musicianType;
				assignmentData.genre = profile.genre;
				if (status === 'Approved') {
					assignmentsByDate[dateId].musicians.approved.push(assignmentData);
				} else if (status === 'Pending') {
					assignmentsByDate[dateId].musicians.pending.push(assignmentData);
				}
			} else if (profile.type === 'NonProfit') {
				assignmentData.nonProfitType = profile.nonProfitType;
				if (status === 'Approved') {
					assignmentsByDate[dateId].nonProfits.approved.push(assignmentData);
				} else if (status === 'Pending') {
					assignmentsByDate[dateId].nonProfits.pending.push(assignmentData);
				}
			} else if (profile.type === 'Volunteer') {
				assignmentData.role = profile.volunteerRole;
				assignmentData.shift = profile.shiftPreference;
				if (status === 'Approved') {
					assignmentsByDate[dateId].volunteers.approved.push(assignmentData);
				} else if (status === 'Pending') {
					assignmentsByDate[dateId].volunteers.pending.push(assignmentData);
				}
			}
		}
		
		// Calculate coverage for each date
		coverageData = marketDates.map(date => {
			const dateAssignments = assignmentsByDate[date._id] || {
				musicians: { approved: [], pending: [] },
				nonProfits: { approved: [], pending: [] },
				volunteers: { approved: [], pending: [] }
			};
			
			return {
				dateId: date._id,
				date: date.date,
				title: date.title,
				musicians: calculateMusicianCoverage(dateAssignments.musicians),
				nonProfits: calculateNonProfitCoverage(dateAssignments.nonProfits),
				volunteers: calculateVolunteerCoverage(dateAssignments.volunteers),
				assignments: dateAssignments
			};
		});
		
		console.log('Coverage calculated for all dates');
	} catch (error) {
		console.error('Error calculating coverage:', error);
		throw error;
	}
}

function calculateMusicianCoverage(musicians) {
	const approved = musicians.approved || [];
	const pending = musicians.pending || [];
	
	// Goal: 1 musician at each location (A, B, C, Default)
	const locations = ['Location A', 'Location B', 'Location C', 'Default'];
	const locationCounts = {};
	
	approved.forEach(m => {
		const loc = m.location || 'Unassigned';
		locationCounts[loc] = (locationCounts[loc] || 0) + 1;
	});
	
	// Count how many locations have coverage
	const coveredLocations = locations.filter(loc => locationCounts[loc] > 0).length;
	const totalApproved = approved.length;
	
	let status = 'complete';
	if (totalApproved === 0) {
		status = 'missing';
	} else if (coveredLocations < 3 || totalApproved < 3) {
		status = 'partial';
	}
	
	return {
		approved: totalApproved,
		pending: pending.length,
		goal: 3, // Goal: 3 locations covered
		coveredLocations: coveredLocations,
		status: status,
		assignments: approved,
		pendingAssignments: pending
	};
}

function calculateNonProfitCoverage(nonProfits) {
	const approved = nonProfits.approved || [];
	const pending = nonProfits.pending || [];
	
	const status = approved.length >= 1 ? 'complete' : (pending.length > 0 ? 'partial' : 'missing');
	
	return {
		approved: approved.length,
		pending: pending.length,
		required: 1,
		status: status,
		assignments: approved,
		pendingAssignments: pending
	};
}

function calculateVolunteerCoverage(volunteers) {
	const approved = volunteers.approved || [];
	const pending = volunteers.pending || [];
	
	// Required roles: 2 token sales, 1-2 merch sales, 2 setup, 2 teardown, 2 hospitality
	const requirements = {
		'Token Sales': { min: 2, max: 2 },
		'Merch Sales': { min: 1, max: 2 },
		'Setup': { min: 2, max: 2 },
		'Teardown': { min: 2, max: 2 },
		'Hospitality Support': { min: 2, max: 2 }
	};
	
	const roleCounts = {};
	approved.forEach(v => {
		const role = v.role || 'Unknown';
		roleCounts[role] = (roleCounts[role] || 0) + 1;
	});
	
	let totalRequired = 0;
	let totalCovered = 0;
	const roleStatus = {};
	
	Object.keys(requirements).forEach(role => {
		const req = requirements[role];
		const count = roleCounts[role] || 0;
		totalRequired += req.min;
		totalCovered += Math.min(count, req.max);
		
		if (count >= req.min) {
			roleStatus[role] = 'complete';
		} else if (count > 0) {
			roleStatus[role] = 'partial';
		} else {
			roleStatus[role] = 'missing';
		}
	});
	
	const overallStatus = totalCovered >= totalRequired * 0.8 ? 'complete' : 
	                      totalCovered >= totalRequired * 0.5 ? 'partial' : 'missing';
	
	return {
		approved: approved.length,
		pending: pending.length,
		required: totalRequired,
		covered: totalCovered,
		status: overallStatus,
		roleStatus: roleStatus,
		assignments: approved,
		pendingAssignments: pending
	};
}

function displayCalendar() {
	const repeater = $w('#calendarRepeater');
	if (!repeater) {
		console.warn('calendarRepeater not found');
		return;
	}
	
	// Filter coverage data by selected month
	let filteredData = coverageData;
	if (currentMonth !== null) {
		filteredData = coverageData.filter(coverage => {
			const date = new Date(coverage.date);
			return date.getMonth() === currentMonth;
		});
	}
	
	// Prepare data for repeater
	const repeaterData = filteredData.map(coverage => ({
		_id: coverage.dateId,
		dateTitle: coverage.title,
		dateValue: coverage.date,
		musicians: coverage.musicians,
		nonProfits: coverage.nonProfits,
		volunteers: coverage.volunteers,
		overallStatus: getOverallStatus(coverage),
		assignments: coverage.assignments
	}));
	
	repeater.data = repeaterData;
	
	// Set up repeater item ready handler
	repeater.onItemReady(($item, itemData) => {
		setupCalendarItem($item, itemData);
	});
	
	console.log(`Displaying ${repeaterData.length} dates for selected month`);
}

function getOverallStatus(coverage) {
	// Overall status based on critical requirements
	if (coverage.nonProfits.status === 'missing') {
		return 'critical'; // Missing non-profit is critical
	}
	if (coverage.musicians.status === 'missing') {
		return 'critical'; // Missing all musicians is critical
	}
	if (coverage.nonProfits.status === 'partial' || 
	    coverage.musicians.status === 'partial' || 
	    coverage.volunteers.status === 'partial') {
		return 'needs_attention';
	}
	return 'complete';
}

function setupCalendarItem($item, itemData) {
	// Date title
	if ($item('#itemDate')) {
		$item('#itemDate').text = itemData.dateTitle;
	}
	
	// Overall status indicator
	const overallStatus = itemData.overallStatus;
	if ($item('#itemStatus')) {
		let statusText = '';
		let statusColor = '';
		
		if (overallStatus === 'complete') {
			statusText = '✅ Complete';
			statusColor = '#28a745'; // Green
		} else if (overallStatus === 'needs_attention') {
			statusText = '⚠️ Needs Attention';
			statusColor = '#ffc107'; // Yellow
		} else {
			statusText = '❌ Critical Gaps';
			statusColor = '#dc3545'; // Red
		}
		
		$item('#itemStatus').text = statusText;
		if ($item('#itemStatus').style) {
			$item('#itemStatus').style.color = statusColor;
		}
	}
	
	// Musicians coverage
	if ($item('#itemMusicians')) {
		const m = itemData.musicians;
		const text = `🎵 Musicians: ${m.approved}/${m.goal} approved`;
		const pendingText = m.pending > 0 ? ` (${m.pending} pending)` : '';
		$item('#itemMusicians').text = text + pendingText;
	}
	
	// Non-profit coverage
	if ($item('#itemNonProfit')) {
		const np = itemData.nonProfits;
		const text = `🏢 Non-Profit: ${np.approved}/${np.required} approved`;
		const pendingText = np.pending > 0 ? ` (${np.pending} pending)` : '';
		$item('#itemNonProfit').text = text + pendingText;
	}
	
	// Volunteers coverage
	if ($item('#itemVolunteers')) {
		const v = itemData.volunteers;
		const text = `👥 Volunteers: ${v.covered}/${v.required} covered`;
		const pendingText = v.pending > 0 ? ` (${v.pending} pending)` : '';
		$item('#itemVolunteers').text = text + pendingText;
	}
	
	// Expandable details section
	const detailsContainer = $item('#detailsContainer');
	const detailsContent = $item('#detailsContent');
	const toggleButton = $item('#btnToggleDetails');
	
	if (detailsContainer && detailsContent && toggleButton) {
		// Initially hide details
		detailsContainer.collapse();
		
		// Set up toggle button
		if (toggleButton && typeof toggleButton.onClick === 'function') {
			toggleButton.onClick(() => {
				if (detailsContainer.isCollapsed) {
					populateDetails(detailsContent, itemData);
					detailsContainer.expand();
					toggleButton.text = 'Hide Details';
				} else {
					detailsContainer.collapse();
					toggleButton.text = 'Show Details';
				}
			});
		}
		
		toggleButton.text = 'Show Details';
	}
}

function populateDetails(container, itemData) {
	// Clear existing content
	if (container.html) {
		container.html = '';
	}
	
	const assignments = itemData.assignments;
	let html = '<div style="padding: 20px;">';
	
	// Musicians section
	html += '<h3 style="margin-top: 0;">🎵 Musicians</h3>';
	if (assignments.musicians.approved.length > 0) {
		html += '<h4>Approved:</h4><ul>';
		assignments.musicians.approved.forEach(m => {
			const location = m.location || 'Unassigned';
			html += `<li><strong>${m.name}</strong> - ${location}${m.genre ? ` (${m.genre})` : ''}</li>`;
		});
		html += '</ul>';
	}
	if (assignments.musicians.pending.length > 0) {
		html += '<h4>Pending:</h4><ul>';
		assignments.musicians.pending.forEach(m => {
			html += `<li><strong>${m.name}</strong>${m.genre ? ` (${m.genre})` : ''}</li>`;
		});
		html += '</ul>';
	}
	if (assignments.musicians.approved.length === 0 && assignments.musicians.pending.length === 0) {
		html += '<p>No musicians assigned</p>';
	}
	
	// Non-profit section
	html += '<h3>🏢 Non-Profit</h3>';
	if (assignments.nonProfits.approved.length > 0) {
		html += '<h4>Approved:</h4><ul>';
		assignments.nonProfits.approved.forEach(np => {
			html += `<li><strong>${np.name}</strong>${np.nonProfitType ? ` (${np.nonProfitType})` : ''}</li>`;
		});
		html += '</ul>';
	}
	if (assignments.nonProfits.pending.length > 0) {
		html += '<h4>Pending:</h4><ul>';
		assignments.nonProfits.pending.forEach(np => {
			html += `<li><strong>${np.name}</strong>${np.nonProfitType ? ` (${np.nonProfitType})` : ''}</li>`;
		});
		html += '</ul>';
	}
	if (assignments.nonProfits.approved.length === 0 && assignments.nonProfits.pending.length === 0) {
		html += '<p>No non-profit assigned</p>';
	}
	
	// Volunteers section
	html += '<h3>👥 Volunteers</h3>';
	if (assignments.volunteers.approved.length > 0) {
		html += '<h4>Approved:</h4><ul>';
		assignments.volunteers.approved.forEach(v => {
			const shift = v.shift ? ` (${v.shift})` : '';
			html += `<li><strong>${v.name}</strong> - ${v.role}${shift}</li>`;
		});
		html += '</ul>';
	}
	if (assignments.volunteers.pending.length > 0) {
		html += '<h4>Pending:</h4><ul>';
		assignments.volunteers.pending.forEach(v => {
			const shift = v.shift ? ` (${v.shift})` : '';
			html += `<li><strong>${v.name}</strong> - ${v.role}${shift}</li>`;
		});
		html += '</ul>';
	}
	
	// Volunteer role breakdown
	const roleCounts = {};
	assignments.volunteers.approved.forEach(v => {
		const role = v.role || 'Unknown';
		roleCounts[role] = (roleCounts[role] || 0) + 1;
	});
	
	const requirements = {
		'Token Sales': 2,
		'Merch Sales': 2,
		'Setup': 2,
		'Teardown': 2,
		'Hospitality Support': 2
	};
	
	html += '<h4>Coverage by Role:</h4><ul>';
	Object.keys(requirements).forEach(role => {
		const required = requirements[role];
		const current = roleCounts[role] || 0;
		const status = current >= required ? '✅' : current > 0 ? '⚠️' : '❌';
		html += `<li>${status} ${role}: ${current}/${required}</li>`;
	});
	html += '</ul>';
	
	if (assignments.volunteers.approved.length === 0 && assignments.volunteers.pending.length === 0) {
		html += '<p>No volunteers assigned</p>';
	}
	
	html += '</div>';
	
	// Try different methods to set HTML content
	if (container.html !== undefined) {
		// HTML Component - has .html property
		container.html = html;
	} else if (container.text !== undefined) {
		// Text element - strip HTML tags for plain text fallback
		container.text = html.replace(/<[^>]*>/g, '');
	} else if (container.src !== undefined) {
		// Iframe/Embed Code - create data URI
		const dataUri = `data:text/html;charset=utf-8,${encodeURIComponent(html)}`;
		container.src = dataUri;
	} else {
		// Last resort: try innerHTML if available
		console.warn('detailsContent element type not recognized. Trying innerHTML...');
		if (container.innerHTML !== undefined) {
			container.innerHTML = html;
		} else {
			console.error('Could not set HTML content. Element type:', container);
		}
	}
}

function formatDate(date) {
	const monthName = date.toLocaleDateString('en-US', { month: 'long' });
	const day = date.getDate();
	const year = date.getFullYear();
	const daySuffix = getDaySuffix(day);
	return `${monthName} ${day}${daySuffix}, ${year}`;
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
