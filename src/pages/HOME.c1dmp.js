// API Reference: https://www.wix.com/velo/reference/api-overview/introduction
// “Hello, World!” Example: https://learn-code.wix.com/en/article/hello-world

import wixData from 'wix-data';

$w.onReady(async function () {
    // TEMPORARY: Run date titles population script
    // Remove this code after running once
    console.log('Running date titles population script...');
    
    try {
        // Query all date records
        const results = await wixData.query('MarketDates2026')
            .find();
        
        if (!results.items || results.items.length === 0) {
            alert('No records found to update.');
            return;
        }
        
        // Helper function to get day suffix (st, nd, rd, th)
        function getDaySuffix(day) {
            if (day > 3 && day < 21) return 'th';
            switch (day % 10) {
                case 1: return 'st';
                case 2: return 'nd';
                case 3: return 'rd';
                default: return 'th';
            }
        }
        
        const updatePromises = results.items.map(async (item) => {
            const dateObj = new Date(item.date);
            
            // Format date with day suffix (e.g., "May 2nd, 2026")
            const monthName = dateObj.toLocaleDateString('en-US', { month: 'long' });
            const day = dateObj.getDate();
            const year = dateObj.getFullYear();
            const daySuffix = getDaySuffix(day);
            
            const title = `${monthName} ${day}${daySuffix}, ${year}`;
            
            // Update record with title
            return wixData.update('MarketDates2026', {
                _id: item._id,
                title: title
            });
        });
        
        await Promise.all(updatePromises);
        
        const message = `Successfully updated ${results.items.length} date records.`;
        console.log(`✅ ${message}`);
        console.log(`Updated ${results.items.length} records.`);
        alert(`✅ Date titles populated successfully!\n\n${message}\nUpdated ${results.items.length} records.\n\nCheck the console (F12) for details.`);
        
    } catch (error) {
        console.error('Error populating date titles:', error);
        const errorMessage = error.message || 'Failed to populate date titles.';
        console.error(`❌ ${errorMessage}`);
        alert(`❌ Error: ${errorMessage}\n\nCheck the console (F12) for details.`);
    }
    
    // Write your JavaScript here

    // To select an element by ID use: $w('#elementID')

    // Click 'Preview' to run your code
});
