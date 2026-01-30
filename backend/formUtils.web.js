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
 * Checks if applicant email already exists in Specialty_Profiles
 * @param {string} email - Email to check
 * @returns {Promise<boolean>} - True if email exists
 */
export async function emailExists(email) {
	try {
		const results = await wixData.query('Specialty_Profiles')
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
 * @returns {Promise<Array>} - Array of date objects with _id and title
 */
export async function getAvailableDates() {
	try {
		const results = await wixData.query('Market_Dates_2026')
			.find();
		return results.items.map(item => ({
			value: item._id,
			label: item.title
		}));
	} catch (error) {
		console.error('Error fetching dates:', error);
		throw error;
	}
}
