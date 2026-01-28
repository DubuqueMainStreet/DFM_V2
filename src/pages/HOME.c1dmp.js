// API Reference: https://www.wix.com/velo/reference/api-overview/introduction
// “Hello, World!” Example: https://learn-code.wix.com/en/article/hello-world

import wixData from 'wix-data';

$w.onReady(async function () {
    // DIAGNOSTIC: Check what's actually in the database
    console.log('🔍 Diagnosing MarketDates2026 collection...');
    
    try {
        // Query all date records
        const results = await wixData.query('MarketDates2026')
            .find();
        
        if (!results.items || results.items.length === 0) {
            console.log('❌ No records found in MarketDates2026.');
            return;
        }
        
        console.log(`Found ${results.items.length} records.`);
        console.log('--- Record Details ---');
        
        // Check each record
        let recordsWithDates = 0;
        let recordsWithoutDates = 0;
        let recordsWithInvalidDates = 0;
        
        results.items.forEach((item, index) => {
            console.log(`\nRecord ${index + 1} (ID: ${item._id}):`);
            console.log('  - date field:', item.date);
            console.log('  - date type:', typeof item.date);
            console.log('  - title field:', item.title);
            
            if (!item.date) {
                recordsWithoutDates++;
                console.log('  ⚠️  MISSING DATE');
            } else {
                const dateObj = new Date(item.date);
                if (isNaN(dateObj.getTime())) {
                    recordsWithInvalidDates++;
                    console.log('  ⚠️  INVALID DATE');
                } else {
                    recordsWithDates++;
                    console.log('  ✅ Valid date:', dateObj.toISOString());
                }
            }
        });
        
        console.log('\n--- Summary ---');
        console.log(`Records with valid dates: ${recordsWithDates}`);
        console.log(`Records without dates: ${recordsWithoutDates}`);
        console.log(`Records with invalid dates: ${recordsWithInvalidDates}`);
        
        if (recordsWithoutDates > 0 || recordsWithInvalidDates > 0) {
            console.log('\n❌ WARNING: Some records are missing or have invalid dates!');
            console.log('The dates may need to be restored manually in the CMS.');
        } else {
            console.log('\n✅ All records have valid dates. The issue may be a display problem in CMS.');
        }
        
    } catch (error) {
        console.error('Error diagnosing collection:', error);
        console.error('Full error:', JSON.stringify(error, null, 2));
    }
    
    // Write your JavaScript here

    // To select an element by ID use: $w('#elementID')

    // Click 'Preview' to run your code
});
