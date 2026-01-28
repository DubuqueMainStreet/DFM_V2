// API Reference: https://www.wix.com/velo/reference/api-overview/introduction
// "Hello, World!" Example: https://learn-code.wix.com/en/article/hello-world

import wixData from 'wix-data';

$w.onReady(async function () {
    // DIAGNOSTIC: Check MarketDates2026 to verify all dates are Saturdays
    // REMOVE THIS CODE AFTER RUNNING ONCE
    
    console.log('🔍 Checking MarketDates2026 dates...');
    
    try {
        // Get all MarketDates2026 records
        const dates = await wixData.query('MarketDates2026')
            .find();
        
        console.log(`Found ${dates.items.length} MarketDates2026 records.`);
        console.log('\n--- All Market Dates ---');
        
        let saturdayCount = 0;
        let nonSaturdayCount = 0;
        const nonSaturdays = [];
        
        dates.items.forEach((date, index) => {
            const dateObj = new Date(date.date);
            const dayOfWeek = dateObj.getDay(); // 0 = Sunday, 6 = Saturday
            const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek];
            const dateString = dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
            
            console.log(`\nRecord ${index + 1}:`);
            console.log(`  - Title: ${date.title}`);
            console.log(`  - Date: ${dateString}`);
            console.log(`  - Day of week: ${dayName} (${dayOfWeek})`);
            console.log(`  - ID: ${date._id}`);
            
            if (dayOfWeek === 6) {
                saturdayCount++;
                console.log('  ✅ Saturday');
            } else {
                nonSaturdayCount++;
                nonSaturdays.push({
                    id: date._id,
                    title: date.title,
                    date: dateString,
                    day: dayName
                });
                console.log('  ⚠️  NOT a Saturday!');
            }
        });
        
        console.log('\n--- Summary ---');
        console.log(`Total records: ${dates.items.length}`);
        console.log(`Saturdays: ${saturdayCount}`);
        console.log(`Non-Saturdays: ${nonSaturdayCount}`);
        
        if (nonSaturdayCount > 0) {
            console.log('\n⚠️  Found non-Saturday dates:');
            nonSaturdays.forEach(item => {
                console.log(`  - ${item.title} (${item.day})`);
            });
            console.log('\nThese dates should be removed or corrected if the market only runs on Saturdays.');
        } else {
            console.log('\n✅ All dates are Saturdays!');
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
        console.error('Full error:', JSON.stringify(error, null, 2));
    }
});
