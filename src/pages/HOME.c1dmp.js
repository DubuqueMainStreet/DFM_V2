// API Reference: https://www.wix.com/velo/reference/api-overview/introduction
// "Hello, World!" Example: https://learn-code.wix.com/en/article/hello-world

import wixData from 'wix-data';

$w.onReady(async function () {
    // FIX: Correct all MarketDates2026 dates to be Saturdays
    // REMOVE THIS CODE AFTER RUNNING ONCE
    
    console.log('🔧 Fixing MarketDates2026 dates to be Saturdays...');
    
    try {
        // Get all existing records
        const results = await wixData.query('MarketDates2026')
            .find();
        
        console.log(`Found ${results.items.length} records to fix.`);
        
        // Calculate all Saturdays from May 2, 2026 to October 31, 2026
        const marketDates = [];
        
        // Start from May 2, 2026 (which is a Saturday)
        const firstSaturday = new Date(2026, 4, 2); // Month is 0-indexed, so 4 = May
        
        // Verify it's actually a Saturday
        if (firstSaturday.getDay() !== 6) {
            console.warn('⚠️  May 2, 2026 is not a Saturday. Finding first Saturday...');
            while (firstSaturday.getDay() !== 6) {
                firstSaturday.setDate(firstSaturday.getDate() + 1);
            }
        }
        
        const endDate = new Date(2026, 9, 31); // October 31, 2026
        
        // Collect all Saturdays from first Saturday until October 31
        let currentDate = new Date(firstSaturday);
        while (currentDate <= endDate) {
            marketDates.push(new Date(currentDate));
            // Move to next Saturday (add 7 days)
            currentDate.setDate(currentDate.getDate() + 7);
        }
        
        console.log(`Calculated ${marketDates.length} Saturdays from ${firstSaturday.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`);
        
        function getDaySuffix(day) {
            if (day > 3 && day < 21) return 'th';
            switch (day % 10) {
                case 1: return 'st';
                case 2: return 'nd';
                case 3: return 'rd';
                default: return 'th';
            }
        }
        
        // Update all records with correct Saturday dates
        if (results.items.length === marketDates.length) {
            console.log(`✅ Perfect match! Updating all ${marketDates.length} records with Saturday dates...`);
            
            const updatePromises = results.items.map(async (item, index) => {
                const saturdayDate = marketDates[index];
                const dateObj = new Date(saturdayDate);
                
                // Format title with day suffix
                const monthName = dateObj.toLocaleDateString('en-US', { month: 'long' });
                const day = dateObj.getDate();
                const year = dateObj.getFullYear();
                const daySuffix = getDaySuffix(day);
                const title = `${monthName} ${day}${daySuffix}, ${year}`;
                
                const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
                console.log(`Updating record ${index + 1}: ${title} (${dayName})`);
                
                // IMPORTANT: Update BOTH date and title fields
                return wixData.update('MarketDates2026', {
                    _id: item._id,
                    date: saturdayDate,  // Update the actual date field to Saturday
                    title: title         // Update the title field
                });
            });
            
            await Promise.all(updatePromises);
            
            console.log(`✅ Successfully fixed all ${marketDates.length} records to be Saturdays!`);
            console.log('✅ Check the MarketDates2026 collection in CMS to verify.');
            
        } else {
            console.log(`⚠️  Record count (${results.items.length}) doesn't match date count (${marketDates.length})`);
            console.log('Updating available records...');
            
            const updatePromises = results.items.slice(0, marketDates.length).map(async (item, index) => {
                const saturdayDate = marketDates[index];
                const dateObj = new Date(saturdayDate);
                
                const monthName = dateObj.toLocaleDateString('en-US', { month: 'long' });
                const day = dateObj.getDate();
                const year = dateObj.getFullYear();
                const daySuffix = getDaySuffix(day);
                const title = `${monthName} ${day}${daySuffix}, ${year}`;
                
                console.log(`Updating record ${index + 1}: ${title}`);
                
                return wixData.update('MarketDates2026', {
                    _id: item._id,
                    date: saturdayDate,
                    title: title
                });
            });
            
            await Promise.all(updatePromises);
            console.log(`✅ Updated ${marketDates.length} records.`);
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
        console.error('Full error:', JSON.stringify(error, null, 2));
    }
});
