# Email Notifications & CRM Integration

**Status:** Production-ready  
**Files:** `src/backend/emailNotifications.jsw` (1,612 lines), `src/backend/formSubmissions.jsw` (400 lines)

---

## Quick Reference

### Template IDs
- **Approved:** `V9e2eMj`
- **Rejected:** `V9e3Agb`

### Critical Code Patterns

```javascript
// Contact creation (MUST use elevate + allowDuplicates)
import { elevate } from 'wix-auth';
import wixCrmBackend from 'wix-crm-backend';

const elevatedCreateContact = elevate(wixCrmBackend.contacts.createContact);
await elevatedCreateContact({
    name: { first: name, last: 'Participant' },
    emails: { items: [{ email: email, primary: true }] }
}, { allowDuplicates: true });

// Email field access (always use fallback chain)
const email = contact.info?.primaryEmail ||
              contact.primaryInfo?.email ||
              contact.email || 'unknown';

// Send triggered email (all variable values MUST be strings)
import { triggeredEmails } from 'wix-crm-backend';
await triggeredEmails.emailContact(templateId, contactId, {
    variables: { applicantName: String(name), profileType: String(type), ... }
});
```

---

## How It Works

### Trigger Points
1. **Form Submission** (`formSubmissions.jsw`) — Creates CRM contact proactively
2. **Status Change** (`emailNotifications.jsw`) — Sends email on Approved/Rejected

### Email Sending Flow
```
Admin clicks Approve/Reject
  → For musicians: auto-set assignedMapId = profile.preferredLocation (no extra admin step)
  → wixData.update() on WeeklyAssignment
  → sendStatusNotificationEmail(assignmentId, newStatus)
    → Fetch assignment + profile + date data
    → getOrCreateContact(email, name) — multi-strategy search
    → Verify email matches expected recipient (CRITICAL)
    → Prepare variables (all strings)
    → triggeredEmails.emailContact(templateId, contactId, variables)
  → Return success (email failure doesn't break status update)
```

### Statuses That Trigger Email
- **Approved** → Sends approval template (`V9e2eMj`)
- **Rejected** → Sends rejection template (`V9e3Agb`)
- **Pending** → No email (initial status)

---

## Gotchas (Hard-Won Knowledge)

| # | Rule | Why |
|---|------|-----|
| 1 | Use `elevate()` for all CRM operations | `createContact()` returns FORBIDDEN without elevation |
| 2 | Use `createContact()` with `allowDuplicates: true` | `appendOrCreateContact()` may reconcile with admin's contact, sending emails to wrong person |
| 3 | Use `emails.items` array, NOT `primaryInfo.email` | `primaryInfo` is read-only; setting it is silently ignored |
| 4 | Always verify email before sending | Prevents sending to wrong recipient after reconciliation |
| 5 | Set `subscriptionStatus: 'NOT_SET'` | Emails won't send to `UNSUBSCRIBED` or `UNKNOWN` contacts |
| 6 | Check all email field locations | Wix API stores email in different places by version |
| 7 | All template variables must be strings | Non-strings cause silent failures |
| 8 | Email errors must not block status updates | Wrap in try/catch, log but don't throw |

### Subscription Status

| Status | Emails Allowed? |
|--------|----------------|
| `SUBSCRIBED` | Yes |
| `NOT_SET` | Yes (default for new contacts) |
| `UNSUBSCRIBED` | No |
| `UNKNOWN` | Update to `NOT_SET` first |

### Email Deduplication
In-memory cache prevents duplicate sends within a 5-minute window per assignment+status combination.

---

## Template Setup (Wix Dashboard)

1. Go to **Wix Dashboard → Marketing → Email Marketing → Triggered Emails**
2. Create two templates:

**Approval Template** — Variables available (names must match exactly in template):
| Variable | Example | Notes |
|----------|---------|--------|
| `applicantName` | "John's Band" | |
| `profileType` | "Musician" | |
| `marketDateFull` | "Saturday, May 2, 2026" | |
| `status` | "Approved" | |
| `SITE_URL` | "https://dubuquefarmersmarket.com" | |
| `assignedLocation` | "13th Street" or "Food Court" | **Musicians only.** When admin clicks Approve, the musician's requested location (`preferredLocation`) is auto-assigned to `assignedMapId`, so the email shows it without an extra admin step. In the Wix template use **${assignedLocation}** (e.g. "Assigned Location: ${assignedLocation}"). When empty it will show as "Assigned Location: " unless the editor supports conditionals. |

**Rejection Template** — Same variables, different copy.

3. Copy Template IDs from the URL or settings and update code if different from current IDs.

### Template ID Configuration

Currently hardcoded in `emailNotifications.jsw`. To use Wix Secrets Manager instead:
```javascript
import { getSecret } from 'wix-secrets-backend';
const templateId = await getSecret('WIX_APPROVED_EMAIL_TEMPLATE_ID');
```

---

## Contact Name (`contactName` Field)

Forms collect both names:
- `organizationName` — Band/org name (required)
- `contactName` — Actual contact person (optional, for musicians and NFPs)

CRM contact creation prefers `contactName`, falls back to `organizationName`. Admin dashboard displays: `"Contact Name (Organization Name)"` when both exist.

**CMS setup required:** Add `contactName` (Text, optional) to `SpecialtyProfiles` collection.

**UI elements:**
- Public forms: `#inputContactName` (Text Input)
- Manual entry: `#manualEntryContactName` (Text Input)

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| "Email template ID not configured" | Set template IDs in code or Secrets Manager |
| "Failed to get or create contact" | Check email format, verify CRM permissions, check `elevate()` |
| No email received | Check spam, verify email address, check Wix email logs |
| "Contact email mismatch" | Contact reconciliation bug — ensure `allowDuplicates: true` |
| Emails going to admin | Using `appendOrCreateContact` instead of `createContact` |

### Debugging Steps
1. Check browser console for `[EMAIL-BACKEND]` logs
2. Verify contact exists in Wix Dashboard → Contacts
3. Check contact subscription status
4. Test template in Wix Dashboard (Send Test Email)
5. Check Wix plan supports Triggered Emails
