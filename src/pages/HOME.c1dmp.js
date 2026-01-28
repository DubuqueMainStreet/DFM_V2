import { fixSaturdayDates } from 'backend/fixSaturdayDates.jsw';

$w.onReady(function () {
    // TEMPORARY: Run Saturday date fix script
    // Remove this after dates are fixed
    console.log('Running Saturday date fix script...');
    fixSaturdayDates()
        .then(result => {
            console.log('✅ Date fix completed:', result);
            alert(`Successfully fixed dates!\n- Updated/Created: ${result.updated} records\n- Deleted: ${result.deleted} non-Saturday records\n- Total Saturdays: ${result.totalSaturdays}`);
        })
        .catch(error => {
            console.error('❌ Date fix failed:', error);
            alert('Error fixing dates: ' + error.message);
        });
});
