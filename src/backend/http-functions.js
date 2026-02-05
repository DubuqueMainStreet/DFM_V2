import { ok, badRequest } from 'wix-http-functions';
import { sendMissingApprovalEmails } from './emailDiagnostic.jsw';

/**
 * HTTP function to send missing approval emails
 * Called via POST to: /_functions/sendMissingApprovalEmailsBackend
 * 
 * @param {WixHttpFunctionRequest} request - HTTP request object
 * @returns {Promise<WixHttpFunctionResponse>} HTTP response with email sending results
 */
export async function post_sendMissingApprovalEmailsBackend(request) {
	try {
		// Parse request body if provided
		let assignmentIds = null;
		if (request && request.body) {
			try {
				const body = typeof request.body === 'string' ? JSON.parse(request.body) : request.body;
				assignmentIds = body.assignmentIds || null;
			} catch (e) {
				// Body parsing failed, use default
				console.warn('Failed to parse request body:', e);
			}
		}
		
		// Call the email sending function
		const result = await sendMissingApprovalEmails(assignmentIds);
		
		// Return success response using Wix HTTP function helper
		return ok({
			headers: {
				'Content-Type': 'application/json'
			},
			body: result
		});
		
	} catch (error) {
		console.error('Error in post_sendMissingApprovalEmailsBackend:', error);
		
		// Return error response using Wix HTTP function helper
		return badRequest({
			headers: {
				'Content-Type': 'application/json'
			},
			body: {
				error: error.message,
				stack: error.stack
			}
		});
	}
}
