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
			statusText = '⚠️ Attention';
			statusColor = '#ffc107'; // Yellow/Orange
		} else {
			statusText = '❌ Critical';
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
		// Track expanded state
		let isExpanded = false;
		
		// Initially collapse details
		try {
			if (typeof detailsContainer.collapse === 'function') {
				detailsContainer.collapse();
			} else if (typeof detailsContainer.hide === 'function') {
				detailsContainer.hide();
			}
		} catch (error) {
			console.warn('Could not collapse detailsContainer:', error);
		}
		
		// Set up toggle button
		if (typeof toggleButton.onClick === 'function') {
			toggleButton.onClick(async () => {
				try {
					if (!isExpanded) {
						// Expand: populate content first, then show
						console.log('Expanding details, populating content...');
						populateDetails(detailsContent, itemData);
						
						// Ensure content element is visible BEFORE expanding container
						if (typeof detailsContent.show === 'function') {
							detailsContent.show();
							console.log('Content element shown');
						}
						
						// Set content element visibility via style if available
						if (detailsContent.style) {
							try {
								detailsContent.style.display = 'block';
								detailsContent.style.visibility = 'visible';
								detailsContent.style.opacity = '1';
								console.log('Content element styled for visibility');
							} catch (e) {
								console.warn('Could not style content element:', e);
							}
						}
						
						// Small delay to ensure content is set before expanding container
						await new Promise(resolve => setTimeout(resolve, 50));
						
						// Try multiple methods to expand/show container
						if (typeof detailsContainer.expand === 'function') {
							detailsContainer.expand();
							console.log('Container expanded via expand()');
						} else if (typeof detailsContainer.show === 'function') {
							detailsContainer.show();
							console.log('Container shown via show()');
						} else if (detailsContainer.style) {
							detailsContainer.style.display = 'block';
							console.log('Container shown via style.display');
						}
						
						// Wait a moment for container to finish expanding
						await new Promise(resolve => setTimeout(resolve, 100));
						
						// Ensure content is visible AFTER container expansion (container might reset child visibility)
						if (typeof detailsContent.show === 'function') {
							detailsContent.show();
							console.log('Content element shown again after container expansion');
						}
						
						// Force visibility via style after expansion
						if (detailsContent.style) {
							try {
								detailsContent.style.display = 'block';
								detailsContent.style.visibility = 'visible';
								detailsContent.style.opacity = '1';
								console.log('Content element styled again after expansion');
							} catch (e) {
								console.warn('Could not style content after expansion:', e);
							}
						}
						
						// Double-check content is visible after container expansion
						if (detailsContent.text && detailsContent.text.length > 0) {
							console.log('Content verified after expansion, length:', detailsContent.text.length);
						} else {
							console.warn('WARNING: Content appears empty after expansion!');
						}
						
						isExpanded = true;
						if (typeof toggleButton.text !== 'undefined') {
							toggleButton.text = 'Hide Details';
						}
					} else {
						// Collapse: hide container
						console.log('Collapsing details...');
						
						if (typeof detailsContainer.collapse === 'function') {
							detailsContainer.collapse();
						} else if (typeof detailsContainer.hide === 'function') {
							detailsContainer.hide();
						} else if (detailsContainer.style) {
							detailsContainer.style.display = 'none';
						}
						
						isExpanded = false;
						if (typeof toggleButton.text !== 'undefined') {
							toggleButton.text = 'Show Details';
						}
					}
				} catch (error) {
					console.error('Error toggling details:', error);
					console.error('Error details:', error.message, error.stack);
				}
			});
		} else {
			console.warn('toggleButton.onClick is not a function. Element:', toggleButton);
		}
		
		// Set initial button text
		if (typeof toggleButton.text !== 'undefined') {
			toggleButton.text = 'Show Details';
		}
	} else {
		console.warn('Missing elements:', {
			detailsContainer: !!detailsContainer,
			detailsContent: !!detailsContent,
			toggleButton: !!toggleButton
		});
	}
}

function populateDetails(container, itemData) {
	const assignments = itemData.assignments;
	
	// Build formatted text content (works with Text elements in repeaters)
	let textContent = '';
	
	// Musicians section
	textContent += '🎵 MUSICIANS\n';
	textContent += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';
	
	if (assignments.musicians.approved.length > 0) {
		textContent += 'APPROVED:\n';
		assignments.musicians.approved.forEach(m => {
			const location = m.location || 'Unassigned';
			textContent += `  • ${m.name} - ${location}`;
			if (m.genre) textContent += ` (${m.genre})`;
			textContent += '\n';
		});
		textContent += '\n';
	}
	
	if (assignments.musicians.pending.length > 0) {
		textContent += 'PENDING:\n';
		assignments.musicians.pending.forEach(m => {
			textContent += `  • ${m.name}`;
			if (m.genre) textContent += ` (${m.genre})`;
			textContent += '\n';
		});
		textContent += '\n';
	}
	
	if (assignments.musicians.approved.length === 0 && assignments.musicians.pending.length === 0) {
		textContent += '  No musicians assigned\n\n';
	}
	
	// Non-profit section
	textContent += '🏢 NON-PROFIT\n';
	textContent += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';
	
	if (assignments.nonProfits.approved.length > 0) {
		textContent += 'APPROVED:\n';
		assignments.nonProfits.approved.forEach(np => {
			textContent += `  • ${np.name}`;
			if (np.nonProfitType) textContent += ` (${np.nonProfitType})`;
			textContent += '\n';
		});
		textContent += '\n';
	}
	
	if (assignments.nonProfits.pending.length > 0) {
		textContent += 'PENDING:\n';
		assignments.nonProfits.pending.forEach(np => {
			textContent += `  • ${np.name}`;
			if (np.nonProfitType) textContent += ` (${np.nonProfitType})`;
			textContent += '\n';
		});
		textContent += '\n';
	}
	
	if (assignments.nonProfits.approved.length === 0 && assignments.nonProfits.pending.length === 0) {
		textContent += '  No non-profit assigned\n\n';
	}
	
	// Volunteers section
	textContent += '👥 VOLUNTEERS\n';
	textContent += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';
	
	if (assignments.volunteers.approved.length > 0) {
		textContent += 'APPROVED:\n';
		assignments.volunteers.approved.forEach(v => {
			textContent += `  • ${v.name} - ${v.role}`;
			if (v.shift) textContent += ` (${v.shift})`;
			textContent += '\n';
		});
		textContent += '\n';
	}
	
	if (assignments.volunteers.pending.length > 0) {
		textContent += 'PENDING:\n';
		assignments.volunteers.pending.forEach(v => {
			textContent += `  • ${v.name} - ${v.role}`;
			if (v.shift) textContent += ` (${v.shift})`;
			textContent += '\n';
		});
		textContent += '\n';
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
	
	textContent += 'COVERAGE BY ROLE:\n';
	Object.keys(requirements).forEach(role => {
		const required = requirements[role];
		const current = roleCounts[role] || 0;
		const status = current >= required ? '✅' : current > 0 ? '⚠️' : '❌';
		textContent += `  ${status} ${role}: ${current}/${required}\n`;
	});
	
	if (assignments.volunteers.approved.length === 0 && assignments.volunteers.pending.length === 0) {
		textContent += '\n  No volunteers assigned\n';
	}
	
	// Set content - try multiple methods for compatibility
	console.log('Populating details content, length:', textContent.length);
	
	if (container.text !== undefined) {
		// Text element (works in repeaters) - preferred method
		container.text = textContent;
		console.log('Content set via .text property');
		
		// Ensure element is visible and styled
		if (typeof container.show === 'function') {
			container.show();
		}
		
		// Try to set styling to ensure visibility
		if (container.style) {
			try {
				container.style.display = 'block';
				container.style.visibility = 'visible';
				container.style.opacity = '1';
				container.style.height = 'auto';
				container.style.minHeight = '50px';
			} catch (e) {
				console.warn('Could not set style properties:', e);
			}
		}
		
		// Log element state for debugging
		console.log('Content element state:', {
			text: container.text ? container.text.substring(0, 50) : 'no text',
			visible: container.visible !== undefined ? container.visible : 'unknown',
			style: container.style ? 'has style' : 'no style'
		});
	} else if (container.html !== undefined) {
		// HTML Component - convert text to HTML
		const htmlContent = textContent
			.replace(/\n/g, '<br>')
			.replace(/━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━/g, '<hr>')
			.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
			.replace(/^([A-Z\s]+)$/gm, '<strong>$1</strong>');
		container.html = `<div style="padding: 20px; font-family: monospace; white-space: pre-wrap;">${htmlContent}</div>`;
		console.log('Content set via .html property');
		
		// Ensure element is visible
		if (typeof container.show === 'function') {
			container.show();
		}
	} else if (container.src !== undefined) {
		// Iframe/Embed Code - create data URI
		const htmlContent = `<div style="padding: 20px; font-family: monospace; white-space: pre-wrap;">${textContent.replace(/\n/g, '<br>')}</div>`;
		const dataUri = `data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`;
		container.src = dataUri;
		console.log('Content set via .src property (iframe)');
	} else {
		console.warn('detailsContent element type not recognized. Element:', container);
		console.warn('Available properties:', Object.keys(container));
		console.warn('Element type:', typeof container);
	}
	
	// Verify content was set
	if (container.text) {
		console.log('Content verified, first 50 chars:', container.text.substring(0, 50));
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
