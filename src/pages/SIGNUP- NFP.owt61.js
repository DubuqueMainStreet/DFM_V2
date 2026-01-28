import wixData from 'wix-data';
import { submitSpecialtyProfile } from 'backend/formSubmissions.jsw';

$w.onReady(function () {
	populateNonProfitTypeDropdown();
	populateDateTags();
	setupSubmitHandler();
});

async function populateDateTags() {
	try {
		const results = await wixData.query('MarketDates2026')
			.find();
		
		// Process dates: parse, sort chronologically, group by month
		const dateItems = results.items
			.map(item => {
				const dateObj = new Date(item.date);
				return {
					_id: item._id,
					date: dateObj,
					month: dateObj.getMonth(),
					year: dateObj.getFullYear(),
					day: dateObj.getDate(),
					monthName: dateObj.toLocaleDateString('en-US', { month: 'long' })
				};
			})
			.sort((a, b) => a.date - b.date); // Sort chronologically
		
		// Group by month for organization
		const groupedByMonth = {};
		dateItems.forEach(item => {
			const monthKey = `${item.year}-${String(item.month).padStart(2, '0')}`;
			if (!groupedByMonth[monthKey]) {
				groupedByMonth[monthKey] = [];
			}
			groupedByMonth[monthKey].push(item);
		});
		
		// Build options with month-grouped labels and styling
		const options = [];
		const monthColors = {
			'May': '#4CAF50',      // Green (spring)
			'June': '#2196F3',     // Blue (summer)
			'July': '#2196F3',     // Blue (summer)
			'August': '#2196F3',   // Blue (summer)
			'September': '#FF9800', // Orange (fall)
			'October': '#FF9800'    // Orange (fall)
		};
		
		Object.keys(groupedByMonth).sort().forEach(monthKey => {
			const dates = groupedByMonth[monthKey];
			const monthName = dates[0].monthName;
			const monthColor = monthColors[monthName] || '#757575'; // Default gray
			
			dates.forEach(item => {
				const daySuffix = getDaySuffix(item.day);
				const label = `${item.monthName} ${item.day}${daySuffix}`;
				
				options.push({
					value: item._id,
					label: label,
					// Store month info for potential styling
					month: monthName,
					color: monthColor
				});
			});
		});
		
		$w('#dateSelectionTags').options = options;
	} catch (error) {
		console.error('Failed to load dates:', error);
		$w('#msgError').text = 'Failed to load available dates. Please refresh.';
		$w('#msgError').show();
	}
}

function populateNonProfitTypeDropdown() {
	// Set non-profit type options
	// Note: These are generic categories - customize as needed
	const nonProfitTypeOptions = [
		{ value: 'Community Organization', label: 'Community Organization' },
		{ value: 'Charity', label: 'Charity' },
		{ value: 'Educational', label: 'Educational' },
		{ value: 'Religious', label: 'Religious' },
		{ value: 'Environmental', label: 'Environmental' },
		{ value: 'Health & Wellness', label: 'Health & Wellness' },
		{ value: 'Arts & Culture', label: 'Arts & Culture' },
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

function setupSubmitHandler() {
	$w('#btnSubmit').onClick(async () => {
		await handleSubmit();
	});
}

async function handleSubmit() {
	try {
		// Reset feedback
		$w('#msgSuccess').hide();
		$w('#msgError').hide();
		$w('#btnSubmit').disable();
		
		// Validation - get form values
		const organizationName = $w('#inputName').value?.trim(); // Organization name
		const contactEmail = $w('#inputEmail').value?.trim();
		const contactPhone = $w('#inputPhone').value?.trim();
		const nonProfitType = $w('#inputNonProfitType').value?.trim();
		const bio = $w('#inputBio').value?.trim(); // Organization description
		const website = $w('#inputWebsite').value?.trim() || null; // Optional
		
		// Get selected dates from selection tags component
		const selectionTags = $w('#dateSelectionTags');
		let selectedDates = selectionTags.value || selectionTags.selected || selectionTags.selectedValues;
		
		// Handle different return formats
		let dateIds = [];
		if (Array.isArray(selectedDates)) {
			dateIds = selectedDates;
		} else if (selectedDates && typeof selectedDates === 'object') {
			dateIds = selectedDates.values || Object.values(selectedDates);
		} else if (selectedDates) {
			dateIds = [selectedDates];
		}
		
		// Debug logging for date selection
		console.log('Selected dates from component:', selectedDates);
		console.log('Extracted dateIds:', dateIds);
		console.log('Number of dates selected:', dateIds.length);
		
		// Validate required fields
		if (!organizationName || !contactEmail || !contactPhone || !nonProfitType || !bio) {
			throw new Error('Organization name, email, phone, non-profit type, and description are required.');
		}
		
		if (!dateIds || dateIds.length === 0) {
			throw new Error('Please select at least one market date.');
		}
		
		// Insert parent record using unified schema
		const profileData = {
			type: 'NonProfit', // Set type to NonProfit
			title: organizationName, // Title field for reference display
			organizationName: organizationName, // Organization name
			contactEmail: contactEmail,
			contactPhone: contactPhone,
			nonProfitType: nonProfitType, // Non-profit-specific field
			bio: bio, // Organization description
			website: website || null // Optional
		};
		
		// Log the data being saved for debugging
		console.log('Saving non-profit profile data:', profileData);
		
		// Use backend function with elevated permissions
		const result = await submitSpecialtyProfile(profileData, dateIds);
		console.log(`Successfully created profile and ${result.assignmentsCreated} WeeklyAssignments records`);
		
		// Success feedback
		$w('#msgSuccess').text = 'Non-profit application submitted successfully!';
		$w('#msgSuccess').show();
		
		// Reset form
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
	$w('#dateSelectionTags').selected = [];
}
