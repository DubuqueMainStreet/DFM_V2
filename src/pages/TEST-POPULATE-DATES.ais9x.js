import { populateDateTitles } from 'backend/populateDateTitles.web.js';

$w.onReady(async function () {
	// Auto-run the population script on page load
	const result = await populateDateTitles();
	
	// Display results
	if (result.success) {
		console.log(`✅ ${result.message}`);
		console.log(`Updated ${result.updated} records.`);
		
		// If there's a text element on the page, show the result
		try {
			const resultElement = $w('#resultText');
			if (resultElement) {
				resultElement.text = `✅ ${result.message}\nUpdated ${result.updated} records.`;
				resultElement.show();
			}
		} catch (e) {
			// Element doesn't exist, that's okay - just log to console
		}
	} else {
		console.error(`❌ ${result.message}`);
		if (result.error) {
			console.error('Error details:', result.error);
		}
		
		// If there's a text element on the page, show the error
		try {
			const resultElement = $w('#resultText');
			if (resultElement) {
				resultElement.text = `❌ ${result.message}`;
				resultElement.show();
			}
		} catch (e) {
			// Element doesn't exist, that's okay - just log to console
		}
	}
});
