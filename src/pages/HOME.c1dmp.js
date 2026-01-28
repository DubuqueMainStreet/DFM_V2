// API Reference: https://www.wix.com/velo/reference/api-overview/introduction
// "Hello, World!" Example: https://learn-code.wix.com/en/article/hello-world

import wixData from 'wix-data';

$w.onReady(async function () {
    // DIAGNOSTIC: Check WeeklyAssignments to see what dateRef values are stored
    // REMOVE THIS CODE AFTER RUNNING ONCE
    
    console.log('🔍 Diagnosing WeeklyAssignments dateRef values...');
    
    try {
        // Get all WeeklyAssignments records
        const assignments = await wixData.query('WeeklyAssignments')
            .find();
        
        console.log(`Found ${assignments.items.length} WeeklyAssignments records.`);
        
        // Get all MarketDates2026 records for reference
        const dates = await wixData.query('MarketDates2026')
            .find();
        
        // Create a map of date IDs to date titles for easy lookup
        const dateMap = {};
        dates.items.forEach(date => {
            dateMap[date._id] = {
                title: date.title,
                date: date.date,
                dateString: new Date(date.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
            };
        });
        
        console.log('\n--- WeeklyAssignments Records ---');
        
        let recordsWithValidDates = 0;
        let recordsWithInvalidDates = 0;
        let recordsWithMissingDates = 0;
        
        assignments.items.forEach((assignment, index) => {
            console.log(`\nRecord ${index + 1} (ID: ${assignment._id}):`);
            console.log('  - profileRef:', assignment.profileRef);
            console.log('  - dateRef:', assignment.dateRef);
            console.log('  - dateRef type:', typeof assignment.dateRef);
            
            if (!assignment.dateRef) {
                recordsWithMissingDates++;
                console.log('  ⚠️  MISSING dateRef');
            } else if (dateMap[assignment.dateRef]) {
                recordsWithValidDates++;
                console.log('  ✅ Valid dateRef:', dateMap[assignment.dateRef].title);
                console.log('     Date:', dateMap[assignment.dateRef].dateString);
            } else {
                recordsWithInvalidDates++;
                console.log('  ❌ INVALID dateRef - ID not found in MarketDates2026');
                console.log('     Stored ID:', assignment.dateRef);
            }
        });
        
        console.log('\n--- Summary ---');
        console.log(`Records with valid dates: ${recordsWithValidDates}`);
        console.log(`Records with missing dates: ${recordsWithMissingDates}`);
        console.log(`Records with invalid dates: ${recordsWithInvalidDates}`);
        
        if (recordsWithMissingDates > 0 || recordsWithInvalidDates > 0) {
            console.log('\n⚠️  Some records have missing or invalid dateRef values.');
            console.log('These records need to be fixed or deleted.');
        } else {
            console.log('\n✅ All records have valid dateRef values.');
            console.log('The dropdown showing all dates is normal - check what is actually SELECTED in each row.');
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
        console.error('Full error:', JSON.stringify(error, null, 2));
    }
});
