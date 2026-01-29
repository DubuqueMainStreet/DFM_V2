# Email Notifications Setup - Wix Triggered Emails

## Overview

The email notification system automatically sends emails to submitters when their applications for music, volunteers, or non-profits are approved or rejected through the admin dashboard. This system uses **Wix Triggered Emails**, Wix's native email marketing solution.

## How It Works

### Automatic Email Sending

When you update an application status to **"Approved"** or **"Rejected"** in the Admin Schedule Management dashboard, an email is automatically sent to the submitter's contact email address using a pre-configured Wix Triggered Email template.

### Email Triggers

- ✅ **Approved** - Sends approval confirmation email
- ✅ **Rejected** - Sends rejection notification email
- ⏭️ **Pending** - No email sent (initial status)
- ⏭️ **Confirmed** - No email sent (assumes already approved)

### Email Content

#### Approval Email Includes:
- Confirmation of approval
- Market date information
- Assigned location (for musicians)
- Application details (type, role, shift, etc.)
- Professional formatting configured in Wix email template

#### Rejection Email Includes:
- Polite rejection notification
- Market date information
- Encouragement to apply for other dates
- Professional formatting configured in Wix email template

## Technical Implementation

### Backend Function

**File:** `src/backend/emailNotifications.jsw`

**Function:** `sendStatusNotificationEmail(assignmentId, newStatus)`

- Fetches assignment, profile, and date information
- Gets or creates a Wix CRM contact for the recipient
- Prepares email variables for the template
- Sends email using Wix Triggered Emails (`wix-crm-backend.triggeredEmails.emailContact()`)
- Returns success/error status

### Frontend Integration

**File:** `src/pages/ADMIN-Schedule-Management.ais9x.js`

The `updateAssignmentStatus()` function automatically calls the email notification function when status changes to Approved or Rejected.

## Email Sending Behavior

### Success Handling
- ✅ Status update succeeds → Email sent → Success message shown
- ✅ Status update succeeds → Email fails → Status still updated (email failure doesn't break workflow)

### Error Handling
- Email failures are logged but don't prevent status updates
- If email sending fails, the status update still completes successfully
- Errors are logged to console for debugging

## Email Recipients

Emails are sent to the `contactEmail` field from the `SpecialtyProfiles` collection. The system automatically:
1. Searches for an existing Wix CRM contact by email
2. Creates a new contact if one doesn't exist
3. Sets subscription status to 'NOT_SET' (required for sending emails)

## Setup Instructions

### Step 1: Create Email Templates in Wix Dashboard

You need to create two email templates in your Wix Dashboard:

1. **Navigate to Email Templates:**
   - Go to **Wix Dashboard** → **Marketing** → **Email Marketing** → **Triggered Emails**
   - Click **"Create Template"** or **"New Template"**

2. **Create "Application Approved" Template:**
   - Name: `Application Approved` (or similar)
   - Subject: `Your {{profileType}} Application Has Been Approved - Dubuque Farmers Market`
   - Design your email template with the following variables:
     - `{{applicantName}}` - Organization/Applicant name
     - `{{profileType}}` - Type of application (Musician, Volunteer, NonProfit)
     - `{{marketDate}}` - Market date title (e.g., "Saturday, May 2nd")
     - `{{marketDateFull}}` - Full formatted date (e.g., "Saturday, May 2, 2026")
     - `{{location}}` - Assigned location (for musicians, may be empty)
     - `{{details}}` - Application details (type, genre, role, etc., may be empty)
     - `{{status}}` - Status (will be "Approved")

3. **Create "Application Rejected" Template:**
   - Name: `Application Rejected` (or similar)
   - Subject: `Update on Your {{profileType}} Application - Dubuque Farmers Market`
   - Design your email template with the following variables:
     - `{{applicantName}}` - Organization/Applicant name
     - `{{profileType}}` - Type of application (Musician, Volunteer, NonProfit)
     - `{{marketDate}}` - Market date title
     - `{{marketDateFull}}` - Full formatted date
     - `{{status}}` - Status (will be "Rejected")

4. **Get Template IDs:**
   - After creating each template, click on it to view details
   - The Template ID is visible in the URL or template settings
   - Copy both Template IDs (you'll need them in Step 2)

### Step 2: Configure Template IDs in Code

You have two options for storing the template IDs:

#### Option A: Hardcode Template IDs (Quick Setup)

1. Open `src/backend/emailNotifications.jsw`
2. Find the `getApprovedEmailTemplateId()` function (around line 100)
3. Replace `null` with your approved template ID:
   ```javascript
   function getApprovedEmailTemplateId() {
       const TEMPLATE_ID = 'your-approved-template-id-here';
       return TEMPLATE_ID;
   }
   ```
4. Find the `getRejectedEmailTemplateId()` function
5. Replace `null` with your rejected template ID:
   ```javascript
   function getRejectedEmailTemplateId() {
       const TEMPLATE_ID = 'your-rejected-template-id-here';
       return TEMPLATE_ID;
   }
   ```

#### Option B: Use Wix Secrets Manager (Recommended for Production)

1. **Add Secrets to Wix Dashboard:**
   - Go to **Wix Editor** → **Settings** → **Secrets Manager**
   - Click **"Add Secret"**
   - Add two secrets:
     - Name: `WIX_APPROVED_EMAIL_TEMPLATE_ID`, Value: `your-approved-template-id`
     - Name: `WIX_REJECTED_EMAIL_TEMPLATE_ID`, Value: `your-rejected-template-id`

2. **Update Code to Use Secrets:**
   - Open `src/backend/emailNotifications.jsw`
   - In `getApprovedEmailTemplateId()`, uncomment and update:
     ```javascript
     import { getSecret } from 'wix-secrets-backend';
     
     async function getApprovedEmailTemplateId() {
         const TEMPLATE_ID = await getSecret('WIX_APPROVED_EMAIL_TEMPLATE_ID');
         return TEMPLATE_ID;
     }
     ```
   - Do the same for `getRejectedEmailTemplateId()`:
     ```javascript
     async function getRejectedEmailTemplateId() {
         const TEMPLATE_ID = await getSecret('WIX_REJECTED_EMAIL_TEMPLATE_ID');
         return TEMPLATE_ID;
     }
     ```
   - **Note:** If you use async functions, you'll need to update the calls to these functions to use `await`

### Step 3: Test Email Notifications

1. **Create a Test Submission:**
   - Submit a form (Music, Volunteer, or NFP) with a real email address you can access
   - Note the contact email used

2. **Approve/Reject in Admin Dashboard:**
   - Go to Admin Schedule Management page
   - Find the test submission
   - Click "Approve" or "Reject" button
   - Or change status dropdown to "Approved" or "Rejected"

3. **Check Email:**
   - Check the submitter's email inbox
   - Verify email content is correct
   - Check spam folder if not received

## Email Template Variables Reference

The following variables are available in your Wix Triggered Email templates. All values are strings.

| Variable | Description | Example Value |
|----------|-------------|---------------|
| `applicantName` | Organization or applicant name | "John's Band" |
| `profileType` | Type of application | "Musician", "Volunteer", "NonProfit" |
| `marketDate` | Market date title | "Saturday, May 2nd" |
| `marketDateFull` | Full formatted date | "Saturday, May 2, 2026" |
| `location` | Assigned location (musicians only) | "Assigned Location: Stage A" or "" |
| `details` | Application details | "Type: Solo, Genre: Folk, Duration: 2 hours" or "" |
| `status` | Application status | "Approved" or "Rejected" |

### Variable Usage in Templates

In your Wix email template editor, use variables like this:

```
Dear {{applicantName}},

We're excited to inform you that your {{profileType}} application for the Dubuque Farmers Market has been {{status}}!

Market Date: {{marketDate}} ({{marketDateFull}})

{{#if location}}
{{location}}
{{/if}}

{{#if details}}
Details: {{details}}
{{/if}}
```

**Note:** Wix Triggered Emails support conditional blocks. Use `{{#if variableName}}...{{/if}}` to conditionally show content when a variable has a value.

## Customization

### Email Templates

Email templates are designed and customized in the **Wix Dashboard** → **Marketing** → **Email Marketing** → **Triggered Emails**. You can:

- Customize email subject lines
- Design HTML email body with Wix's email editor
- Add images, buttons, and styled content
- Use conditional blocks for optional content
- Preview emails before sending

### Email Variables

The variables sent to templates are prepared in the `prepareEmailVariables()` function in `emailNotifications.jsw`. You can customize:

- Which fields are included in the `details` variable
- How dates are formatted
- How location information is displayed
- Additional variables (if you add them to the template)

## Troubleshooting

### Emails Not Sending?

1. **Check Console Logs:**
   - Open browser console (F12)
   - Look for email-related errors or warnings
   - Check for "Email template ID not configured" message

2. **Verify Template IDs:**
   - Ensure template IDs are set in `getApprovedEmailTemplateId()` and `getRejectedEmailTemplateId()`
   - Verify template IDs match the IDs from Wix Dashboard
   - Check that templates are published/active in Wix Dashboard

3. **Verify Contact Creation:**
   - Check Wix Dashboard → Contacts to see if contacts are being created
   - Ensure contacts have email addresses
   - Verify contact subscription status (should be 'NOT_SET' or 'SUBSCRIBED')

4. **Check Template Variables:**
   - Ensure all variables used in templates match the variable names in `prepareEmailVariables()`
   - Variables are case-sensitive
   - All variable values are strings (handled automatically)

5. **Verify Email Permissions:**
   - Check that your Wix site has email marketing permissions enabled
   - Verify you're on a Wix plan that supports Triggered Emails
   - Check Wix Dashboard → Settings → Email Marketing for any restrictions

6. **Test Template in Wix Dashboard:**
   - Go to Wix Dashboard → Marketing → Email Marketing → Triggered Emails
   - Click on your template
   - Use "Send Test Email" to verify template works
   - Check that variables are displaying correctly

### Common Issues

- **"Email template ID not configured"** - Template IDs not set in code. See Step 2.
- **"Email notification skipped"** - Status doesn't require email (Pending/Confirmed)
- **"Email notification failed"** - Check console logs for specific error
- **"Contact not found"** - Contact creation failed. Check console logs.
- **No email received** - Check spam folder, verify email address, check Wix email logs
- **Variables not displaying** - Check variable names match exactly (case-sensitive)

### Error Messages

| Error Message | Solution |
|---------------|----------|
| "Email template ID not configured" | Set template IDs in `getApprovedEmailTemplateId()` or `getRejectedEmailTemplateId()` |
| "Failed to get or create contact" | Check email address format, verify Wix CRM permissions |
| "Email template not found" | Verify template ID is correct, check template is published |
| "Contact not found or not subscribed" | Check contact exists in Wix CRM, verify subscription status |

## Wix Triggered Emails Requirements

### Prerequisites

- Wix site with Email Marketing enabled
- Wix plan that supports Triggered Emails (most paid plans)
- Email templates created in Wix Dashboard
- Contacts in Wix CRM (created automatically by the code)

### Contact Subscription Status

For Wix Triggered Emails to work, contacts must have one of these subscription statuses:
- `SUBSCRIBED` - Contact has explicitly subscribed
- `NOT_SET` - Subscription status not set (default for new contacts)

The code automatically sets new contacts to `NOT_SET` status, which allows emails to be sent.

### Email Limits

Check your Wix plan for email sending limits:
- Free plans: Limited or no email marketing
- Basic plans: Usually 3,000 emails/month
- Business plans: Usually 10,000+ emails/month

## Future Enhancements

Potential improvements:

- [ ] Email templates customization UI
- [ ] Bulk email notifications
- [ ] Email delivery status tracking
- [ ] Custom rejection reasons
- [ ] Reminder emails before market dates
- [ ] Confirmation email when status changes to "Confirmed"
- [ ] Email preferences/unsubscribe links

## Files Modified

- ✅ `src/backend/emailNotifications.jsw` - Email notification backend using Wix Triggered Emails
- ✅ `src/pages/ADMIN-Schedule-Management.ais9x.js` - Integrated email calls

## Support

If you encounter issues with email notifications:

1. Check browser console for errors
2. Verify email addresses in SpecialtyProfiles collection
3. Test with a known good email address
4. Check Wix Dashboard → Marketing → Email Marketing for email logs
5. Verify template IDs are correct
6. Check Wix site email settings and limits
7. Review Wix documentation: https://www.wix.com/velo/reference/wix-crm-backend/triggeredemails/emailcontact

## Additional Resources

- [Wix Triggered Emails Documentation](https://support.wix.com/en/article/triggered-emails-overview)
- [Wix CRM Backend API Reference](https://www.wix.com/velo/reference/wix-crm-backend)
- [Wix Email Marketing Guide](https://support.wix.com/en/article/email-marketing-overview)
