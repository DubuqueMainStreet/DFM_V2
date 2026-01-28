import wixData from 'wix-data';

$w.onReady(function () {
	populateVolunteerRoleDropdown();
	populateShiftPreferenceDropdown();
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

function populateVolunteerRoleDropdown() {
	// Set volunteer role options
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
	// Set shift preference options for volunteers
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
		// Reset feedback
		$w('#msgSuccess').hide();
		$w('#msgError').hide();
		$w('#btnSubmit').disable();
		
		// Validation - get form values
		const organizationName = $w('#inputName').value?.trim(); // Volunteer name
		const contactEmail = $w('#inputEmail').value?.trim();
		const contactPhone = $w('#inputPhone').value?.trim();
		const volunteerRole = $w('#inputVolunteerRole').value?.trim();
		const shiftPreference = $w('#inputShiftPreference').value?.trim();
		const bio = $w('#inputBio').value?.trim();
		
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
		if (!organizationName || !contactEmail || !contactPhone || !volunteerRole || !shiftPreference || !bio) {
			throw new Error('Name, email, phone, volunteer role, shift preference, and bio/experience are required.');
		}
		
		if (!dateIds || dateIds.length === 0) {
			throw new Error('Please select at least one market date.');
		}
		
		// Insert parent record using unified schema
		const profileData = {
			type: 'Volunteer', // Set type to Volunteer
			title: organizationName, // Title field for reference display
			organizationName: organizationName, // Volunteer name
			contactEmail: contactEmail,
			contactPhone: contactPhone,
			volunteerRole: volunteerRole, // Volunteer-specific field
			shiftPreference: shiftPreference, // Shift preference: Early Shift, Late Shift, or Both
			bio: bio // Experience/background
		};
		
		// Log the data being saved for debugging
		console.log('Saving volunteer profile data:', profileData);
		
		const profileResult = await wixData.save('SpecialtyProfiles', profileData);
		const profileId = profileResult._id;
		
		// Insert child records - one WeeklyAssignments record per selected date
		console.log('Creating WeeklyAssignments records for dates:', dateIds);
		const assignmentPromises = dateIds.map(async (dateId, index) => {
			console.log(`Creating assignment ${index + 1} with dateRef: ${dateId}`);
			const result = await wixData.save('WeeklyAssignments', {
				profileRef: profileId,
				dateRef: dateId
			});
			console.log(`Created assignment ${index + 1} with ID: ${result._id}`);
			return result;
		});
		
		await Promise.all(assignmentPromises);
		console.log(`Successfully created ${dateIds.length} WeeklyAssignments records`);
		
		// Success feedback
		$w('#msgSuccess').text = 'Volunteer application submitted successfully!';
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
	$w('#inputVolunteerRole').value = '';
	$w('#inputShiftPreference').value = '';
	$w('#inputBio').value = '';
	$w('#dateSelectionTags').selected = [];
}
