// API Reference: https://www.wix.com/velo/reference/api-overview/introduction
// “Hello, World!” Example: https://learn-code.wix.com/en/article/hello-world

import wixData from 'wix-data';

$w.onReady(async function () {
    // RESTORATION SCRIPT: Restore dates to MarketDates2026 collection
    // This script will populate dates for all Saturdays from May 2 to October 31, 2026
    // REMOVE THIS CODE AFTER RUNNING ONCE
    
    console.log('🔄 Starting date restoration...');
    
    try {
        // Get all existing records
        const results = await wixData.query('MarketDates2026')
            .find();
        
        console.log(`Found ${results.items.length} existing records.`);
        
        // Calculate all Saturdays from May 2, 2026 to October 31, 2026
        // May 2, 2026 is a Saturday, and we need to find all 27 Saturdays through October 31
        const marketDates = [];
        
        // Start from May 2, 2026 (which should be a Saturday)
        // Using local date constructor to avoid timezone issues
        const firstSaturday = new Date(2026, 4, 2); // Month is 0-indexed, so 4 = May
        const endDate = new Date(2026, 9, 31); // Month is 0-indexed, so 9 = October
        
        // Verify it's actually a Saturday
        if (firstSaturday.getDay() !== 6) {
            console.warn('⚠️  May 2, 2026 is not a Saturday. Finding first Saturday...');
            // Find the first Saturday in May
            while (firstSaturday.getDay() !== 6) {
                firstSaturday.setDate(firstSaturday.getDate() + 1);
            }
        }
        
        // Collect all Saturdays from first Saturday until October 31
        let currentDate = new Date(firstSaturday);
        while (currentDate <= endDate) {
            marketDates.push(new Date(currentDate));
            // Move to next Saturday (add 7 days)
            currentDate.setDate(currentDate.getDate() + 7);
        }
        
        console.log(`Found ${marketDates.length} Saturdays starting from ${firstSaturday.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`);
        console.log(`First date: ${marketDates[0].toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`);
        console.log(`Last date: ${marketDates[marketDates.length - 1].toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`);
        
        console.log(`Calculated ${marketDates.length} market dates (Saturdays)`);
        console.log('Dates:', marketDates.map(d => d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })));
        
        // Update all records - should match exactly 27
        if (results.items.length === marketDates.length) {
            console.log(`✅ Perfect match! Updating all ${marketDates.length} records with calculated dates...`);
            
            const updatePromises = results.items.map(async (item, index) => {
                const date = marketDates[index];
                const dateObj = new Date(date);
                
                // Format title with day suffix
                const monthName = dateObj.toLocaleDateString('en-US', { month: 'long' });
                const day = dateObj.getDate();
                const year = dateObj.getFullYear();
                const daySuffix = getDaySuffix(day);
                const title = `${monthName} ${day}${daySuffix}, ${year}`;
                
                console.log(`Updating record ${index + 1}: ${title} (${date.toISOString().split('T')[0]})`);
                
                return wixData.update('MarketDates2026', {
                    _id: item._id,
                    date: date,
                    title: title
                });
            });
            
            await Promise.all(updatePromises);
            
            console.log(`✅ Successfully restored all ${marketDates.length} records with dates and titles!`);
            console.log('✅ Check the MarketDates2026 collection in CMS to verify.');
            
        } else if (results.items.length > marketDates.length) {
            console.log(`⚠️  More records (${results.items.length}) than dates (${marketDates.length})`);
            console.log(`Updating first ${marketDates.length} records...`);
            
            const updatePromises = results.items.slice(0, marketDates.length).map(async (item, index) => {
                const date = marketDates[index];
                const dateObj = new Date(date);
                
                const monthName = dateObj.toLocaleDateString('en-US', { month: 'long' });
                const day = dateObj.getDate();
                const year = dateObj.getFullYear();
                const daySuffix = getDaySuffix(day);
                const title = `${monthName} ${day}${daySuffix}, ${year}`;
                
                console.log(`Updating record ${index + 1}: ${title} (${date.toISOString().split('T')[0]})`);
                
                return wixData.update('MarketDates2026', {
                    _id: item._id,
                    date: date,
                    title: title
                });
            });
            
            await Promise.all(updatePromises);
            console.log(`✅ Updated ${marketDates.length} records. ${results.items.length - marketDates.length} record(s) need manual date entry.`);
            
        } else {
            console.log(`⚠️  More dates (${marketDates.length}) than records (${results.items.length})`);
            console.log('Updating all available records...');
            
            const updatePromises = results.items.map(async (item, index) => {
                const date = marketDates[index];
                const dateObj = new Date(date);
                
                const monthName = dateObj.toLocaleDateString('en-US', { month: 'long' });
                const day = dateObj.getDate();
                const year = dateObj.getFullYear();
                const daySuffix = getDaySuffix(day);
                const title = `${monthName} ${day}${daySuffix}, ${year}`;
                
                console.log(`Updating record ${index + 1}: ${title} (${date.toISOString().split('T')[0]})`);
                
                return wixData.update('MarketDates2026', {
                    _id: item._id,
                    date: date,
                    title: title
                });
            });
            
            await Promise.all(updatePromises);
            console.log(`✅ Updated ${results.items.length} records. You may need to create ${marketDates.length - results.items.length} more records.`);
        }
        
    } catch (error) {
        console.error('❌ Error restoring dates:', error);
        console.error('Full error:', JSON.stringify(error, null, 2));
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
    
    // Write your JavaScript here

    // To select an element by ID use: $w('#elementID')

    // Click 'Preview' to run your code
});
