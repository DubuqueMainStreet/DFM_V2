import { ok, badRequest, forbidden, serverError } from 'wix-http-functions';
import { getSecret } from 'wix-secrets-backend';
import { sendMissingApprovalEmails } from './emailDiagnostic.jsw';

// Secret stored in Wix Secrets Manager. Set via:
//   wix secrets set ADMIN_BACKFILL_TOKEN <long-random-value>
// or via the Wix Dashboard → Secrets Manager.
const SECRET_KEY = 'ADMIN_BACKFILL_TOKEN';
const TOKEN_HEADER = 'x-admin-token';

/**
 * HTTP function to send missing approval emails.
 * Called via POST to: /_functions/sendMissingApprovalEmailsBackend
 *
 * Requires an `x-admin-token` header whose value matches the secret
 * `ADMIN_BACKFILL_TOKEN` in Wix Secrets Manager. Without the correct
 * token the endpoint returns 403 so that an unauthenticated caller
 * cannot trigger a bulk email send.
 *
 * Intended for manual/curl admin use. The in-site admin dashboard
 * calls `sendMissingApprovalEmails` directly via the backend web
 * module (gated by `permissions.json`) rather than hitting this
 * endpoint.
 */
export async function post_sendMissingApprovalEmailsBackend(request) {
	try {
		const provided = extractHeader(request, TOKEN_HEADER);
		if (!provided) {
			return forbidden({
				headers: { 'Content-Type': 'application/json' },
				body: { error: 'missing_token' }
			});
		}

		let expected;
		try {
			expected = await getSecret(SECRET_KEY);
		} catch (err) {
			console.error('sendMissingApprovalEmailsBackend: secret lookup failed', err && err.message);
			return serverError({
				headers: { 'Content-Type': 'application/json' },
				body: { error: 'secret_unavailable' }
			});
		}

		if (!expected || provided !== expected) {
			return forbidden({
				headers: { 'Content-Type': 'application/json' },
				body: { error: 'unauthorized' }
			});
		}

		let assignmentIds = null;
		if (request && request.body) {
			try {
				const body = typeof request.body === 'string' ? JSON.parse(request.body) : request.body;
				assignmentIds = (body && body.assignmentIds) || null;
			} catch (e) {
				console.warn('sendMissingApprovalEmailsBackend: body parse failed', e && e.message);
			}
		}

		const result = await sendMissingApprovalEmails(assignmentIds);

		return ok({
			headers: { 'Content-Type': 'application/json' },
			body: result
		});
	} catch (error) {
		console.error('sendMissingApprovalEmailsBackend error:', error && error.message, error && error.stack);
		return badRequest({
			headers: { 'Content-Type': 'application/json' },
			body: { error: 'request_failed' }
		});
	}
}

function extractHeader(request, name) {
	if (!request || !request.headers) return null;
	const lower = name.toLowerCase();
	const headers = request.headers;
	if (typeof headers.get === 'function') {
		return headers.get(name) || headers.get(lower) || null;
	}
	return headers[name] || headers[lower] || null;
}
