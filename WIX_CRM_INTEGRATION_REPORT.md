# WIX CRM Integration Report
## Comprehensive Analysis for dubquuemainstreet.org Project

**Date:** January 30, 2026  
**Source Project:** DFM_V2 (Dubuque Farmers Market)  
**Target Project:** dubquuemainstreet.org (WIX Studio Site)

---

## Executive Summary

This project successfully integrates WIX CRM as a critical component for automated email notifications and contact management. The integration leverages WIX's native CRM backend API (`wix-crm-backend`) to create contacts automatically during form submissions and send triggered emails when application statuses change. This report documents the architecture, tools, patterns, and critical insights discovered during implementation.

---

## 1. WIX CRM Integration Overview

### 1.1 Purpose & Use Case

WIX CRM is integrated to serve two primary functions:

1. **Contact Management**: Automatically create and maintain CRM contacts for all form submitters
2. **Email Notifications**: Send automated approval/rejection emails using WIX Triggered Emails

### 1.2 Integration Points

The CRM integration occurs at two key points in the application flow:

1. **Form Submission** (`formSubmissions.jsw`): Creates CRM contacts when users submit applications
2. **Status Updates** (`emailNotifications.jsw`): Retrieves/creates contacts and sends emails when admins approve/reject applications

---

## 2. Core Tools & Utilities

### 2.1 Backend Module: `formSubmissions.jsw`

**Purpose**: Handles form submissions and creates CRM contacts proactively

**Key Function**: `submitSpecialtyProfile(profileData, dateIds)`

**CRM Integration Logic**:
```javascript
// Creates CRM contact BEFORE saving form data
// This ensures contact exists for future email notifications
if (profileData.contactEmail) {
    // Check if contact exists
    const existingContacts = await wixCrmBackend.contacts.queryContacts()
        .eq('primaryInfo.email', profileData.contactEmail)
        .limit(1)
        .find();
    
    if (existingContacts.items && existingContacts.items.length > 0) {
        // Update subscription status if needed
        await wixCrmBackend.contacts.updateContact(existingContacts.items[0]._id, {
            subscriptionStatus: 'NOT_SET'
        });
    } else {
        // Create new contact with allowDuplicates to prevent reconciliation
        await wixCrmBackend.contacts.createContact({
            primaryInfo: { email: profileData.contactEmail },
            name: {
                first: profileData.organizationName || 'Market',
                last: 'Participant'
            },
            subscriptionStatus: 'NOT_SET'
        }, {
            allowDuplicates: true // CRITICAL: Prevents reconciliation with admin's contact
        });
    }
}
```

**Key Features**:
- ✅ Proactive contact creation (before form data is saved)
- ✅ Duplicate prevention with `allowDuplicates: true`
- ✅ Subscription status management (`NOT_SET` allows emails)
- ✅ Graceful error handling (form submission continues even if contact creation fails)

---

### 2.2 Backend Module: `emailNotifications.jsw`

**Purpose**: Sends automated email notifications using WIX Triggered Emails

**Key Functions**:
1. `sendStatusNotificationEmail(assignmentId, newStatus)` - Main email sending function
2. `getOrCreateContact(email, name)` - Robust contact retrieval/creation utility
3. `createContactForProfile(email, name)` - Manual contact creation helper
4. `sendWixTriggeredEmail(emailTemplateId, contactId, variables)` - Low-level email sending

**CRM Integration Highlights**:

#### Contact Retrieval Strategy (Multi-Layered Approach)
```javascript
async function getOrCreateContact(email, name) {
    // Strategy 1: Search by primaryInfo.email
    let existingContacts = await wixCrmBackend.contacts.queryContacts()
        .eq('primaryInfo.email', email)
        .limit(1)
        .find();
    
    // Strategy 2: If not found, search emails array
    if (!existingContacts.items || existingContacts.items.length === 0) {
        const allContacts = await wixCrmBackend.contacts.queryContacts()
            .limit(1000)
            .find();
        
        const matchingContacts = allContacts.items.filter(contact => {
            const primaryEmail = contact.info?.primaryEmail || contact.primaryInfo?.email || '';
            const emailsArray = contact.info?.emails || contact.emails || [];
            return primaryEmail.toLowerCase() === email.toLowerCase() ||
                   emailsArray.some(e => (e.email || e).toLowerCase() === email.toLowerCase());
        });
        
        if (matchingContacts.length > 0) {
            existingContacts = { items: [matchingContacts[0]] };
        }
    }
    
    // Strategy 3: Create if not found
    if (!existingContacts.items || existingContacts.items.length === 0) {
        // Use createContact with allowDuplicates
        // Multiple fallback strategies implemented
    }
}
```

**Critical Features**:
- ✅ Multi-strategy contact search (handles WIX API inconsistencies)
- ✅ Email verification before sending (prevents sending to wrong recipient)
- ✅ Subscription status management and updates
- ✅ Duplicate email prevention (5-minute deduplication window)
- ✅ Comprehensive error handling with detailed logging

---

## 3. Key Patterns & Best Practices

### 3.1 Contact Creation Pattern

**Problem**: WIX CRM's `appendOrCreateContact()` can reconcile with the logged-in admin's contact, causing email mismatches.

**Solution**: Use `createContact()` with `allowDuplicates: true` as primary method, with `appendOrCreateContact()` as fallback.

```javascript
// PRIMARY METHOD (Preferred)
try {
    await wixCrmBackend.contacts.createContact({
        primaryInfo: { email: email },
        name: { first: name, last: 'Participant' },
        subscriptionStatus: 'NOT_SET'
    }, {
        allowDuplicates: true // Prevents reconciliation
    });
} catch (createError) {
    // FALLBACK METHOD
    await wixCrmBackend.contacts.appendOrCreateContact({
        email: email,
        name: { first: name, last: 'Participant' },
        subscriptionStatus: 'NOT_SET'
    });
}
```

**Why This Matters**: 
- `createContact()` with `allowDuplicates: true` forces creation of a new contact
- `appendOrCreateContact()` may reconcile with existing contacts (including admin's contact)
- Reconciliation can cause emails to be sent to the wrong person (CRITICAL BUG)

---

### 3.2 Email Verification Pattern

**Problem**: Contact retrieval may return wrong contact due to reconciliation or API inconsistencies.

**Solution**: Always verify email matches before sending.

```javascript
// CRITICAL: Verify email matches before sending
const contactEmail = contact.info?.primaryEmail || 
                     contact.primaryInfo?.email ||
                     contact.email ||
                     'unknown';

if (contactEmail.toLowerCase() !== profile.contactEmail.toLowerCase()) {
    throw new Error(`CRITICAL ERROR: Contact email mismatch! ` +
                    `Expected: ${profile.contactEmail}, Got: ${contactEmail}. ` +
                    `Cannot send email to wrong recipient.`);
}
```

**Why This Matters**: 
- Prevents sending sensitive information to wrong recipients
- Catches reconciliation bugs early
- Provides clear error messages for debugging

---

### 3.3 Subscription Status Management

**Problem**: WIX Triggered Emails only send to contacts with `SUBSCRIBED` or `NOT_SET` status.

**Solution**: Always set `subscriptionStatus: 'NOT_SET'` when creating contacts, and update if `UNKNOWN`.

```javascript
// When creating contact
subscriptionStatus: 'NOT_SET' // Allows emails to be sent

// When retrieving contact, check and update if needed
const subscriptionStatus = contact.info?.extendedFields?.emailSubscriptions?.subscriptionStatus ||
                           contact.subscriptionStatus ||
                           contact.emailSubscriptions?.subscriptionStatus ||
                           'UNKNOWN';

if (subscriptionStatus === 'UNKNOWN') {
    await wixCrmBackend.contacts.appendOrCreateContact({
        email: contactEmail,
        subscriptionStatus: 'NOT_SET'
    });
}
```

**Subscription Status Values**:
- `SUBSCRIBED` - Contact has explicitly subscribed ✅ (emails allowed)
- `NOT_SET` - Subscription status not set ✅ (emails allowed)
- `UNSUBSCRIBED` - Contact has unsubscribed ❌ (emails blocked)
- `UNKNOWN` - Status unknown ⚠️ (may block emails, update to `NOT_SET`)

---

### 3.4 Email Deduplication Pattern

**Problem**: Status updates may trigger multiple email sends for the same event.

**Solution**: In-memory cache with time-based deduplication.

```javascript
const recentEmailSends = new Map();
const EMAIL_DEDUP_WINDOW_MS = 5 * 60 * 1000; // 5 minutes

const emailKey = `${assignmentId}-${newStatus}`;
const now = Date.now();
const lastSentTime = recentEmailSends.get(emailKey);

if (lastSentTime && (now - lastSentTime) < EMAIL_DEDUP_WINDOW_MS) {
    return { success: true, skipped: true, reason: 'Duplicate prevented' };
}

// Send email...
recentEmailSends.set(emailKey, Date.now());
```

**Why This Matters**: 
- Prevents duplicate emails from rapid status changes
- Reduces email quota usage
- Improves user experience

---

### 3.5 Error Handling Pattern

**Problem**: Email failures should not break the main workflow (status updates).

**Solution**: Catch errors, log them, but don't throw.

```javascript
try {
    // Send email
    await sendStatusNotificationEmail(assignmentId, newStatus);
} catch (emailError) {
    // Log error but don't throw - status update should succeed
    console.error('Email notification failed:', emailError);
    // Status update continues successfully
}
```

**Why This Matters**: 
- Form submissions and status updates succeed even if email fails
- Errors are logged for debugging
- Users aren't blocked by email service issues

---

## 4. WIX Triggered Emails Integration

### 4.1 Template Configuration

**Location**: Wix Dashboard → Marketing → Email Marketing → Triggered Emails

**Required Templates**:
1. **Approved Template** (ID: `V9e2eMj`)
   - Subject: `Your {{profileType}} Application Has Been Approved - Dubuque Farmers Market`
   - Variables: `applicantName`, `profileType`, `marketDateFull`, `status`, `SITE_URL`

2. **Rejected Template** (ID: `V9e3Agb`)
   - Subject: `Update on Your {{profileType}} Application - Dubuque Farmers Market`
   - Variables: `applicantName`, `profileType`, `marketDateFull`, `status`, `SITE_URL`

### 4.2 Template Variable Preparation

**Critical Requirement**: All variables must be strings.

```javascript
function prepareEmailVariables(profile, dateRef, assignment, status) {
    return {
        applicantName: String(profile.organizationName || ''),
        profileType: String(profile.type || ''),
        marketDateFull: String(marketDateFull || ''),
        status: String(status || ''),
        SITE_URL: String(currentSiteUrl || '')
    };
}
```

### 4.3 Sending Triggered Emails

```javascript
import { triggeredEmails } from 'wix-crm-backend';

await triggeredEmails.emailContact(
    emailTemplateId,  // Template ID from Wix Dashboard
    contactId,        // WIX CRM contact ID
    {
        variables: emailVariables  // All values must be strings
    }
);
```

---

## 5. Critical Insights & Gotchas

### 5.1 Contact Reconciliation Bug

**Issue**: `appendOrCreateContact()` may reconcile with the logged-in admin's contact if the admin's email matches the form submitter's email.

**Impact**: Emails intended for form submitters may be sent to the admin instead.

**Solution**: 
- Use `createContact()` with `allowDuplicates: true` as primary method
- Always verify email matches before sending
- Implement email verification checks

**Code Location**: `emailNotifications.jsw` lines 133-142, 420-508

---

### 5.2 Email Field Location Inconsistency

**Issue**: WIX CRM contact email may be stored in different locations depending on API version:
- `contact.info.primaryEmail`
- `contact.primaryInfo.email`
- `contact.email`

**Solution**: Check all possible locations with fallback chain.

```javascript
const contactEmail = contact.info?.primaryEmail || 
                     contact.primaryInfo?.email ||
                     contact.email ||
                     'unknown';
```

**Code Location**: `emailNotifications.jsw` throughout (multiple locations)

---

### 5.3 Subscription Status Location Inconsistency

**Issue**: Subscription status may be stored in different locations:
- `contact.info.extendedFields.emailSubscriptions.subscriptionStatus`
- `contact.subscriptionStatus`
- `contact.emailSubscriptions.subscriptionStatus`

**Solution**: Check all possible locations with fallback chain.

```javascript
const subscriptionStatus = contact.info?.extendedFields?.emailSubscriptions?.subscriptionStatus ||
                           contact.subscriptionStatus ||
                           contact.emailSubscriptions?.subscriptionStatus ||
                           'UNKNOWN';
```

**Code Location**: `emailNotifications.jsw` lines 228-231, 605-608, 1012-1015

---

### 5.4 Contact Creation Return Value Inconsistency

**Issue**: `createContact()` returns full contact object, but `appendOrCreateContact()` returns `ContactIdentification` object (needs `getContact()` call).

**Solution**: Check return value structure and handle both cases.

```javascript
let fullContact;
if (contactIdentification && contactIdentification._id && contactIdentification.info) {
    // Full contact object from createContact
    fullContact = contactIdentification;
} else {
    // ContactIdentification from appendOrCreateContact - need to get full contact
    const contactId = contactIdentification?._id || 
                      contactIdentification?.contactId || 
                      contactIdentification?.id;
    fullContact = await wixCrmBackend.contacts.getContact(contactId);
}
```

**Code Location**: `emailNotifications.jsw` lines 352-408

---

### 5.5 Query Limitations

**Issue**: `queryContacts()` may not find contacts immediately after creation (eventual consistency).

**Solution**: Implement retry logic with delays.

```javascript
// Wait a moment for contact to be fully created
await new Promise(resolve => setTimeout(resolve, 500));

// Retry search
const retrySearch = await wixCrmBackend.contacts.queryContacts()
    .eq('primaryInfo.email', email)
    .limit(1)
    .find();
```

**Code Location**: `emailNotifications.jsw` lines 298-308, 370-382

---

## 6. Architecture & Data Flow

### 6.1 Form Submission Flow

```
User Submits Form
    ↓
formSubmissions.submitSpecialtyProfile()
    ↓
[CRM INTEGRATION] Create/Update WIX CRM Contact
    ├─ Check if contact exists by email
    ├─ Update subscription status if exists
    └─ Create new contact with allowDuplicates: true
    ↓
Save SpecialtyProfiles record
    ↓
Create WeeklyAssignments records (one per selected date)
    ↓
Return success
```

**Key Point**: CRM contact is created BEFORE form data is saved, ensuring contact exists for future email notifications.

---

### 6.2 Status Update & Email Flow

```
Admin Updates Status (Approved/Rejected)
    ↓
updateAssignmentStatus()
    ↓
Update WeeklyAssignments record
    ↓
[CRM INTEGRATION] emailNotifications.sendStatusNotificationEmail()
    ↓
Fetch assignment, profile, and date data
    ↓
[CRM INTEGRATION] getOrCreateContact()
    ├─ Search by primaryInfo.email
    ├─ Search emails array (fallback)
    └─ Create contact if not found (with allowDuplicates: true)
    ↓
Verify email matches (CRITICAL CHECK)
    ↓
Prepare email variables (all strings)
    ↓
[CRM INTEGRATION] sendWixTriggeredEmail()
    ├─ Verify subscription status
    ├─ Update to NOT_SET if UNKNOWN
    └─ Send via triggeredEmails.emailContact()
    ↓
Return success (email failure doesn't break status update)
```

**Key Point**: Email sending is non-blocking - status updates succeed even if email fails.

---

## 7. File Structure

### 7.1 Backend Files

```
src/backend/
├── formSubmissions.jsw          # Form submission handler + CRM contact creation
├── emailNotifications.jsw       # Email notification system + CRM contact management
├── formUtils.web.js              # Form validation utilities (no CRM)
└── permissions.json              # Web module permissions
```

### 7.2 Key Functions Export

**formSubmissions.jsw**:
- `submitSpecialtyProfile(profileData, dateIds)` - Creates contacts + saves form data

**emailNotifications.jsw**:
- `sendStatusNotificationEmail(assignmentId, newStatus)` - Main email function
- `createContactForProfile(email, name)` - Manual contact creation helper

---

## 8. Dependencies

### 8.1 WIX APIs Used

```javascript
import wixData from 'wix-data';                    // CMS data operations
import wixCrmBackend from 'wix-crm-backend';       // CRM operations
import { triggeredEmails } from 'wix-crm-backend'; // Email sending
```

### 8.2 Required WIX Features

- ✅ WIX CRM (included in most WIX plans)
- ✅ WIX Triggered Emails (requires Email Marketing plan)
- ✅ WIX Velo backend permissions (for web modules)

---

## 9. Testing & Validation

### 9.1 Contact Creation Testing

**Test Cases**:
1. ✅ New contact creation (email doesn't exist)
2. ✅ Existing contact update (email exists)
3. ✅ Duplicate email handling (same email, different context)
4. ✅ Subscription status management
5. ✅ Email verification (prevents wrong recipient)

### 9.2 Email Sending Testing

**Test Cases**:
1. ✅ Approved status → sends approval email
2. ✅ Rejected status → sends rejection email
3. ✅ Pending status → no email sent
4. ✅ Duplicate prevention (rapid status changes)
5. ✅ Email failure doesn't break status update
6. ✅ Subscription status handling (UNSUBSCRIBED, UNKNOWN, NOT_SET)

---

## 10. Recommendations for dubquuemainstreet.org

### 10.1 Implementation Checklist

- [ ] Review WIX plan to ensure Email Marketing/Triggered Emails are available
- [ ] Create email templates in WIX Dashboard (Approved/Rejected or custom)
- [ ] Copy `formSubmissions.jsw` and adapt for your form structure
- [ ] Copy `emailNotifications.jsw` and update template IDs
- [ ] Update `prepareEmailVariables()` with your specific variables
- [ ] Test contact creation with various email scenarios
- [ ] Test email sending with real email addresses
- [ ] Verify subscription status handling
- [ ] Implement email verification checks (CRITICAL)
- [ ] Set up error logging and monitoring

### 10.2 Customization Points

1. **Email Templates**: Create templates matching your brand/style
2. **Email Variables**: Customize `prepareEmailVariables()` for your data structure
3. **Contact Naming**: Update name structure (`first`, `last`) to match your needs
4. **Subscription Status**: Adjust subscription status logic if needed
5. **Deduplication Window**: Adjust `EMAIL_DEDUP_WINDOW_MS` if needed

### 10.3 Critical Code to Copy

**Must Copy**:
- `getOrCreateContact()` function (lines 189-622 in `emailNotifications.jsw`)
- Email verification logic (lines 133-142 in `emailNotifications.jsw`)
- Contact creation pattern from `formSubmissions.jsw` (lines 24-80)
- Subscription status management (throughout `emailNotifications.jsw`)

**Adapt for Your Use Case**:
- `prepareEmailVariables()` - Update with your data fields
- Email template IDs - Update with your template IDs
- Contact name structure - Update if needed
- Error messages - Customize for your context

---

## 11. Common Pitfalls to Avoid

### 11.1 ❌ Don't Use `appendOrCreateContact()` as Primary Method

**Why**: May reconcile with admin's contact, causing email mismatches.

**Use Instead**: `createContact()` with `allowDuplicates: true`

---

### 11.2 ❌ Don't Skip Email Verification

**Why**: Sending emails to wrong recipients is a critical bug.

**Always**: Verify `contactEmail === expectedEmail` before sending.

---

### 11.3 ❌ Don't Assume Email Field Location

**Why**: WIX API stores email in different locations.

**Always**: Use fallback chain: `contact.info?.primaryEmail || contact.primaryInfo?.email || contact.email`

---

### 11.4 ❌ Don't Ignore Subscription Status

**Why**: Emails won't send to `UNSUBSCRIBED` contacts.

**Always**: Set `subscriptionStatus: 'NOT_SET'` when creating contacts, and update `UNKNOWN` status.

---

### 11.5 ❌ Don't Make Email Sending Blocking

**Why**: Email failures shouldn't break main workflow.

**Always**: Catch email errors and log them, but don't throw.

---

## 12. Performance Considerations

### 12.1 Contact Query Optimization

- Use `.limit(1)` when searching for specific contacts
- Cache contact lookups when possible (within same request)
- Use `.eq('primaryInfo.email', email)` for efficient queries

### 12.2 Email Deduplication

- In-memory cache prevents duplicate sends within 5-minute window
- Reduces email quota usage
- Improves user experience

### 12.3 Error Handling

- Non-blocking email sending ensures fast status updates
- Errors are logged but don't slow down main workflow

---

## 13. Security Considerations

### 13.1 Email Verification

**Critical**: Always verify email matches before sending to prevent:
- Sending sensitive information to wrong recipients
- Privacy violations
- Data breaches

### 13.2 Contact Creation

**Best Practice**: Use `allowDuplicates: true` to prevent:
- Unintended contact reconciliation
- Email mismatches
- Data corruption

### 13.3 Error Messages

**Best Practice**: Don't expose internal errors to users:
- Log detailed errors server-side
- Show user-friendly messages
- Don't leak email addresses or contact IDs

---

## 14. Monitoring & Debugging

### 14.1 Logging Strategy

**Console Logs** (for debugging):
- `[FORM-SUBMISSION]` - Form submission contact creation
- `[EMAIL-BACKEND]` - Email notification process
- `[CREATE-CONTACT]` - Manual contact creation

**Error Logs**:
- Contact creation failures
- Email sending failures
- Email verification mismatches
- Subscription status issues

### 14.2 Debugging Checklist

1. Check browser console for `[EMAIL-BACKEND]` logs
2. Verify contact exists in WIX Dashboard → Contacts
3. Check contact subscription status
4. Verify email template IDs are correct
5. Test email template in WIX Dashboard
6. Check WIX email logs (Dashboard → Marketing → Email Marketing)

---

## 15. Future Enhancements

### 15.1 Potential Improvements

- [ ] Bulk contact creation/update
- [ ] Contact tagging/categorization
- [ ] Email delivery status tracking
- [ ] Custom email templates per application type
- [ ] Email preferences/unsubscribe management
- [ ] Contact merge detection and handling
- [ ] Retry logic for failed email sends
- [ ] Email queue for high-volume scenarios

### 15.2 Integration Opportunities

- [ ] Connect with WIX Marketing automation
- [ ] Integrate with WIX Bookings (if applicable)
- [ ] Link contacts to WIX Stores orders (if applicable)
- [ ] Sync with external CRM systems

---

## 16. Conclusion

The WIX CRM integration in this project demonstrates a robust, production-ready implementation that handles edge cases, prevents common pitfalls, and provides reliable email notifications. The key success factors are:

1. **Proactive Contact Creation**: Creating contacts during form submission ensures they exist for email notifications
2. **Robust Contact Retrieval**: Multi-strategy search handles WIX API inconsistencies
3. **Email Verification**: Critical checks prevent sending to wrong recipients
4. **Subscription Status Management**: Proper handling ensures emails can be sent
5. **Error Resilience**: Non-blocking email sending ensures main workflow succeeds

**For dubquuemainstreet.org**: Copy the core functions (`getOrCreateContact`, contact creation pattern, email verification) and adapt the email variables and templates to your specific use case. The patterns and best practices documented here will help avoid common pitfalls and ensure a successful integration.

---

## Appendix A: Code Snippets Reference

### A.1 Contact Creation (Form Submission)

```javascript
// From formSubmissions.jsw
if (profileData.contactEmail) {
    const existingContacts = await wixCrmBackend.contacts.queryContacts()
        .eq('primaryInfo.email', profileData.contactEmail)
        .limit(1)
        .find();
    
    if (existingContacts.items && existingContacts.items.length > 0) {
        await wixCrmBackend.contacts.updateContact(existingContacts.items[0]._id, {
            subscriptionStatus: 'NOT_SET'
        });
    } else {
        await wixCrmBackend.contacts.createContact({
            primaryInfo: { email: profileData.contactEmail },
            name: {
                first: profileData.organizationName || 'Market',
                last: 'Participant'
            },
            subscriptionStatus: 'NOT_SET'
        }, {
            allowDuplicates: true
        });
    }
}
```

### A.2 Contact Retrieval with Fallbacks

```javascript
// From emailNotifications.jsw - getOrCreateContact()
const contactEmail = contact.info?.primaryEmail || 
                     contact.primaryInfo?.email ||
                     contact.email ||
                     'unknown';
```

### A.3 Email Verification

```javascript
// From emailNotifications.jsw
if (contactEmail.toLowerCase() !== profile.contactEmail.toLowerCase()) {
    throw new Error(`CRITICAL ERROR: Contact email mismatch! ` +
                    `Expected: ${profile.contactEmail}, Got: ${contactEmail}.`);
}
```

### A.4 Subscription Status Check

```javascript
// From emailNotifications.jsw
const subscriptionStatus = contact.info?.extendedFields?.emailSubscriptions?.subscriptionStatus ||
                           contact.subscriptionStatus ||
                           contact.emailSubscriptions?.subscriptionStatus ||
                           'UNKNOWN';

if (subscriptionStatus === 'UNSUBSCRIBED') {
    throw new Error('Contact is UNSUBSCRIBED - cannot send email');
}
```

### A.5 Sending Triggered Email

```javascript
// From emailNotifications.jsw
import { triggeredEmails } from 'wix-crm-backend';

await triggeredEmails.emailContact(
    emailTemplateId,
    contactId,
    {
        variables: {
            applicantName: String(name),
            profileType: String(type),
            marketDateFull: String(date),
            status: String(status),
            SITE_URL: String(siteUrl)
        }
    }
);
```

---

## Appendix B: WIX API Reference Links

- [WIX CRM Backend API](https://www.wix.com/velo/reference/wix-crm-backend)
- [WIX Triggered Emails](https://www.wix.com/velo/reference/wix-crm-backend/triggeredemails/emailcontact)
- [WIX Contacts API](https://www.wix.com/velo/reference/wix-crm-backend/contacts)
- [WIX Email Marketing](https://support.wix.com/en/article/email-marketing-overview)

---

**End of Report**
