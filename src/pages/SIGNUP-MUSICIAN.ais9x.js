import wixData from 'wix-data';

$w.onReady(function () {
	populateMusicianTypeDropdown();
	populateLocationDropdown();
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
		
		// Build options with month-grouped labels (shorter format: "May 2nd")
		const options = [];
		Object.keys(groupedByMonth).sort().forEach(monthKey => {
			const dates = groupedByMonth[monthKey];
			dates.forEach(item => {
				const daySuffix = getDaySuffix(item.day);
				const label = `${item.monthName} ${item.day}${daySuffix}`;
				
				options.push({
					value: item._id,
					label: label
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

function populateMusicianTypeDropdown() {
	// Set musician type options
	const musicianTypeOptions = [
		{ value: 'Solo Acoustic', label: 'Solo Acoustic' },
		{ value: 'Solo Electric', label: 'Solo Electric' },
		{ value: 'Duo Acoustic', label: 'Duo Acoustic' },
		{ value: 'Duo Electric', label: 'Duo Electric' },
		{ value: 'Small Band (3-4 members)', label: 'Small Band (3-4 members)' },
		{ value: 'Large Band (5+ members)', label: 'Large Band (5+ members)' },
		{ value: 'Other', label: 'Other' }
	];
	
	$w('#inputMusicianType').options = musicianTypeOptions;
}

function populateLocationDropdown() {
	// Set performance location options
	const locationOptions = [
		{ value: 'Default', label: 'Default (No Preference)' },
		{ value: 'Location A', label: 'Location A' },
		{ value: 'Location B', label: 'Location B' },
		{ value: 'Location C', label: 'Location C' }
	];
	
	$w('#inputLocation').options = locationOptions;
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

function formatDate(dateObj) {
	// Format Date object to readable string (e.g., "May 2, 2026")
	const date = new Date(dateObj);
	const options = { year: 'numeric', month: 'long', day: 'numeric' };
	return date.toLocaleDateString('en-US', options);
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
		
		// Validation
		const name = $w('#inputName').value?.trim();
		const email = $w('#inputEmail').value?.trim();
		const musicianType = $w('#inputMusicianType').value?.trim();
		const needsElectric = $w('#inputNeedsElectric').checked || false;
		const preferredLocation = $w('#inputLocation').value?.trim();
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
		
		if (!name || !email || !musicianType || !preferredLocation || !bio) {
			throw new Error('All fields are required.');
		}
		
		if (!dateIds || dateIds.length === 0) {
			throw new Error('Please select at least one market date.');
		}
		
		// Upload file
		let fileUrl = null;
		if ($w('#uploadButton').files && $w('#uploadButton').files.length > 0) {
			const uploadResult = await $w('#uploadButton').startUpload();
			if (uploadResult && uploadResult.length > 0) {
				fileUrl = uploadResult[0].url;
			}
		}
		
		// Insert parent record
		const profileData = {
			type: 'Musician', // Hardcoded since this is musician-only form
			name: name,
			email: email,
			musicianType: musicianType,
			needsElectric: needsElectric,
			preferredLocation: preferredLocation,
			bio: bio,
			fileUrl: fileUrl
		};
		
		const profileResult = await wixData.save('SpecialtyProfiles', profileData);
		const profileId = profileResult._id;
		
		// Insert child records
		const assignmentPromises = dateIds.map(dateId => 
			wixData.save('WeeklyAssignments', {
				profileRef: profileId,
				dateRef: dateId
			})
		);
		
		await Promise.all(assignmentPromises);
		
		// Success feedback
		$w('#msgSuccess').text = 'Application submitted successfully!';
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
	$w('#inputMusicianType').value = '';
	$w('#inputNeedsElectric').checked = false;
	$w('#inputLocation').value = '';
	$w('#inputBio').value = '';
	$w('#dateSelectionTags').selected = [];
	$w('#uploadButton').reset();
}
