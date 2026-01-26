import wixData from 'wix-data';

$w.onReady(function () {
	populateDateTags();
	setupSubmitHandler();
});

async function populateDateTags() {
	try {
		const results = await wixData.query('MarketDates2026')
			.find();
		
		const options = results.items.map(item => ({
			value: item._id,
			label: item.title
		}));
		
		$w('#dateSelectionTags').options = options;
	} catch (error) {
		console.error('Failed to load dates:', error);
		$w('#msgError').text = 'Failed to load available dates. Please refresh.';
		$w('#msgError').show();
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
		
		// Validation
		const name = $w('#inputName').value?.trim();
		const email = $w('#inputEmail').value?.trim();
		const type = $w('#inputType').value?.trim();
		const bio = $w('#inputBio').value?.trim();
		const selectedDates = $w('#dateSelectionTags').selected;
		
		if (!name || !email || !type || !bio) {
			throw new Error('All fields are required.');
		}
		
		if (!selectedDates || selectedDates.length === 0) {
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
			name: name,
			email: email,
			type: type,
			bio: bio,
			fileUrl: fileUrl
		};
		
		const profileResult = await wixData.save('Specialty_Profiles', profileData);
		const profileId = profileResult._id;
		
		// Insert child records
		const assignmentPromises = selectedDates.map(dateId => 
			wixData.save('Weekly_Assignments', {
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
	$w('#inputType').value = '';
	$w('#inputBio').value = '';
	$w('#dateSelectionTags').selected = [];
	$w('#uploadButton').reset();
}
