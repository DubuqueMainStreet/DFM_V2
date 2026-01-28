// API Reference: https://www.wix.com/velo/reference/api-overview/introduction
// "Hello, World!" Example: https://learn-code.wix.com/en/article/hello-world

import wixData from 'wix-data';

$w.onReady(async function () {
    // DIAGNOSTIC: Check MarketDates2026 field structure and fix display field
    // REMOVE THIS CODE AFTER RUNNING ONCE
    
    console.log('🔍 Diagnosing MarketDates2026 fields...');
    
    try {
        // Query records to see what fields exist
        const results = await wixData.query('MarketDates2026')
            .limit(3)
            .find();
        
        if (results.items.length > 0) {
            console.log('Sample record fields:');
            const sampleRecord = results.items[0];
            console.log('All fields:', Object.keys(sampleRecord));
            console.log('Full record:', JSON.stringify(sampleRecord, null, 2));
            
            // Check for common display field names
            console.log('\n--- Checking display fields ---');
            console.log('title (lowercase):', sampleRecord.title);
            console.log('Title (capitalized):', sampleRecord.Title);
            console.log('name:', sampleRecord.name);
            console.log('date:', sampleRecord.date);
        }
        
        // Now update ALL records to ensure BOTH 'title' and 'Title' fields are set
        console.log('\n🔄 Updating all records with display titles...');
        
        const allResults = await wixData.query('MarketDates2026')
            .find();
        
        function getDaySuffix(day) {
            if (day > 3 && day < 21) return 'th';
            switch (day % 10) {
                case 1: return 'st';
                case 2: return 'nd';
                case 3: return 'rd';
                default: return 'th';
            }
        }
        
        const updatePromises = allResults.items.map(async (item) => {
            const dateObj = new Date(item.date);
            
            if (isNaN(dateObj.getTime())) {
                console.warn(`Record ${item._id} has invalid date, skipping`);
                return null;
            }
            
            const monthName = dateObj.toLocaleDateString('en-US', { month: 'long' });
            const day = dateObj.getDate();
            const year = dateObj.getFullYear();
            const daySuffix = getDaySuffix(day);
            const displayTitle = `${monthName} ${day}${daySuffix}, ${year}`;
            
            console.log(`Setting display title: ${displayTitle}`);
            
            // Update with BOTH possible display field names
            // Wix might use 'title' or 'Title' depending on configuration
            return wixData.update('MarketDates2026', {
                ...item,  // Preserve all existing fields including date
                title: displayTitle,
                Title: displayTitle  // Also try capital T
            });
        });
        
        await Promise.all(updatePromises.filter(p => p !== null));
        
        console.log(`✅ Updated ${allResults.items.length} records with display titles.`);
        console.log('Check MarketDates2026 and WeeklyAssignments collections now.');
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
});
