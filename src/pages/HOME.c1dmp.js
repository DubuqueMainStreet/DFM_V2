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
        const marketDates = [];
        // Use UTC to avoid timezone issues
        const startDate = new Date('2026-05-02T00:00:00Z'); // May 2, 2026
        const endDate = new Date('2026-10-31T23:59:59Z'); // October 31, 2026
        
        let currentDate = new Date(startDate);
        let saturdayCount = 0;
        
        while (currentDate <= endDate) {
            // Check if it's a Saturday (day 6, where 0=Sunday, 6=Saturday)
            if (currentDate.getDay() === 6) {
                marketDates.push(new Date(currentDate));
                saturdayCount++;
            }
            // Move to next day
            currentDate.setDate(currentDate.getDate() + 1);
        }
        
        console.log(`Found ${saturdayCount} Saturdays between ${startDate.toISOString().split('T')[0]} and ${endDate.toISOString().split('T')[0]}`);
        
        console.log(`Calculated ${marketDates.length} market dates (Saturdays)`);
        console.log('Dates:', marketDates.map(d => d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })));
        
        // Update records - handle mismatch by updating what we can
        if (results.items.length >= marketDates.length) {
            console.log(`Updating ${marketDates.length} records with calculated dates...`);
            console.log(`(${results.items.length - marketDates.length} extra record(s) will be skipped)`);
            
            const updatePromises = results.items.slice(0, marketDates.length).map(async (item, index) => {
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
            
            console.log(`✅ Successfully restored ${marketDates.length} records with dates and titles.`);
            
            if (results.items.length > marketDates.length) {
                console.log(`⚠️  Note: ${results.items.length - marketDates.length} record(s) were not updated.`);
                console.log('You may need to manually set the date for the extra record(s) in CMS.');
            }
            
            console.log('✅ Check the MarketDates2026 collection in CMS to verify.');
            
        } else {
            console.log(`⚠️  More dates (${marketDates.length}) than records (${results.items.length})`);
            console.log('This is unusual - you may need to create more records in CMS.');
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
