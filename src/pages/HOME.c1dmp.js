// API Reference: https://www.wix.com/velo/reference/api-overview/introduction
// “Hello, World!” Example: https://learn-code.wix.com/en/article/hello-world

import { populateDateTitles } from 'backend/populateDateTitles.web.js';

$w.onReady(async function () {
    // TEMPORARY: Run date titles population script
    // Remove this code after running once
    console.log('Running date titles population script...');
    const result = await populateDateTitles();
    
    if (result.success) {
        console.log(`✅ ${result.message}`);
        console.log(`Updated ${result.updated} records.`);
        alert(`✅ Date titles populated successfully!\n\n${result.message}\nUpdated ${result.updated} records.\n\nCheck the console (F12) for details.`);
    } else {
        console.error(`❌ ${result.message}`);
        if (result.error) {
            console.error('Error details:', result.error);
        }
        alert(`❌ Error: ${result.message}\n\nCheck the console (F12) for details.`);
    }
    
    // Write your JavaScript here

    // To select an element by ID use: $w('#elementID')

    // Click 'Preview' to run your code
});
