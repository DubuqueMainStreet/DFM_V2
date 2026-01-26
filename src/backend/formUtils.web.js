import wixData from 'wix-data';

/**
 * Validates email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid email format
 */
export function validateEmail(email) {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
}

/**
 * Checks if applicant email already exists in SpecialtyProfiles
 * @param {string} email - Email to check
 * @returns {Promise<boolean>} - True if email exists
 */
export async function emailExists(email) {
	try {
		const results = await wixData.query('SpecialtyProfiles')
			.eq('email', email)
			.find();
		return results.items.length > 0;
	} catch (error) {
		console.error('Error checking email:', error);
		return false;
	}
}

/**
 * Gets available market dates for selection
 * @returns {Promise<Array>} - Array of date objects with _id and formatted date label
 */
export async function getAvailableDates() {
	try {
		const results = await wixData.query('MarketDates2026')
			.find();
		return results.items.map(item => {
			const dateObj = item.date;
			const label = dateObj ? formatDate(dateObj) : 'Date';
			return {
				value: item._id,
				label: label
			};
		});
	} catch (error) {
		console.error('Error fetching dates:', error);
		throw error;
	}
}

function formatDate(dateObj) {
	// Format Date object to readable string (e.g., "May 2, 2026")
	const date = new Date(dateObj);
	const options = { year: 'numeric', month: 'long', day: 'numeric' };
	return date.toLocaleDateString('en-US', options);
}
