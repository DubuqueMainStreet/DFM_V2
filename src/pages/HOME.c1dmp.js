import { fixSaturdayDates } from 'backend/fixSaturdayDates.jsw';

$w.onReady(function () {
    // TEMPORARY: Run Saturday date fix script
    // Remove this after dates are fixed
    console.log('Running Saturday date fix script...');
    fixSaturdayDates()
        .then(result => {
            console.log('✅ Date fix completed:', result);
            console.log(`Successfully fixed dates!`);
            console.log(`- Updated/Created: ${result.updated} records`);
            console.log(`- Deleted: ${result.deleted} non-Saturday records`);
            console.log(`- Total Saturdays: ${result.totalSaturdays}`);
        })
        .catch(error => {
            console.error('❌ Date fix failed:', error);
            console.error('Error details:', error.message);
        });
});
