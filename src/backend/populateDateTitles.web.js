import wixData from 'wix-data';

/**
 * Populates the 'title' field for all records in MarketDates2026
 * Formats dates as "May 2nd, 2026" for readable display in reference fields
 */
export async function populateDateTitles() {
	try {
		// Query all date records
		const results = await wixData.query('MarketDates2026')
			.find();
		
		if (!results.items || results.items.length === 0) {
			return { success: true, message: 'No records found to update.', updated: 0 };
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
		
		return {
			success: true,
			message: `Successfully updated ${results.items.length} date records.`,
			updated: results.items.length
		};
		
	} catch (error) {
		console.error('Error populating date titles:', error);
		return {
			success: false,
			message: error.message || 'Failed to populate date titles.',
			error: error.toString()
		};
	}
}

/**
 * Helper function to get day suffix (st, nd, rd, th)
 */
function getDaySuffix(day) {
	if (day > 3 && day < 21) return 'th';
	switch (day % 10) {
		case 1: return 'st';
		case 2: return 'nd';
		case 3: return 'rd';
		default: return 'th';
	}
}
