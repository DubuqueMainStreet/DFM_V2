# WIX CRM Integration - Quick Reference Guide

**For:** dubquuemainstreet.org Project  
**Source:** DFM_V2 Implementation

---

## 🚀 Quick Start Checklist

- [ ] Copy `formSubmissions.jsw` → Adapt contact creation logic
- [ ] Copy `emailNotifications.jsw` → Update template IDs and variables
- [ ] Create email templates in WIX Dashboard
- [ ] Test contact creation
- [ ] Test email sending
- [ ] Verify email verification checks are in place

---

## 📋 Critical Code Patterns

### 1. Contact Creation (Primary Method)

```javascript
await wixCrmBackend.contacts.createContact({
    primaryInfo: { email: email },
    name: { first: name, last: 'Participant' },
    subscriptionStatus: 'NOT_SET'
}, {
    allowDuplicates: true  // CRITICAL: Prevents reconciliation
});
```

### 2. Contact Search

```javascript
const contacts = await wixCrmBackend.contacts.queryContacts()
    .eq('primaryInfo.email', email)
    .limit(1)
    .find();
```

### 3. Email Field Access (Always Use Fallback)

```javascript
const email = contact.info?.primaryEmail || 
              contact.primaryInfo?.email ||
              contact.email ||
              'unknown';
```

### 4. Subscription Status Check

```javascript
const status = contact.info?.extendedFields?.emailSubscriptions?.subscriptionStatus ||
               contact.subscriptionStatus ||
               contact.emailSubscriptions?.subscriptionStatus ||
               'UNKNOWN';
```

### 5. Email Verification (CRITICAL)

```javascript
if (contactEmail.toLowerCase() !== expectedEmail.toLowerCase()) {
    throw new Error('Email mismatch - cannot send to wrong recipient');
}
```

### 6. Send Triggered Email

```javascript
import { triggeredEmails } from 'wix-crm-backend';

await triggeredEmails.emailContact(
    templateId,  // From WIX Dashboard
    contactId,   // WIX CRM contact ID
    { variables: { /* all strings */ } }
);
```

---

## ⚠️ Critical Gotchas

1. **NEVER use `appendOrCreateContact()` as primary** - May reconcile with admin's contact
2. **ALWAYS verify email matches** - Prevents sending to wrong recipient
3. **ALWAYS check all email field locations** - WIX API inconsistencies
4. **ALWAYS set `subscriptionStatus: 'NOT_SET'`** - Required for emails to send
5. **ALWAYS use `allowDuplicates: true`** - Prevents unintended reconciliation

---

## 🔧 Required WIX Setup

1. **Email Templates** (Dashboard → Marketing → Email Marketing → Triggered Emails)
   - Create templates
   - Note Template IDs
   - Configure variables

2. **Email Marketing Plan** (Check WIX plan includes Triggered Emails)

3. **CRM Permissions** (Backend code needs CRM access)

---

## 📁 Files to Copy/Adapt

### Must Copy:
- `src/backend/formSubmissions.jsw` - Contact creation on form submit
- `src/backend/emailNotifications.jsw` - Email notification system

### Key Functions:
- `getOrCreateContact()` - Robust contact retrieval
- `sendStatusNotificationEmail()` - Main email function
- Contact creation pattern from `formSubmissions.jsw`

### Adapt:
- `prepareEmailVariables()` - Your data structure
- Template IDs - Your template IDs
- Contact naming - Your naming convention

---

## 🐛 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Email sent to wrong person | Add email verification check |
| Contact not found | Use multi-strategy search (primaryInfo.email + emails array) |
| Email not sending | Check subscription status (must be NOT_SET or SUBSCRIBED) |
| Template not found | Verify template ID matches WIX Dashboard |
| Contact reconciliation | Use `createContact()` with `allowDuplicates: true` |

---

## 📊 Subscription Status Values

- `SUBSCRIBED` ✅ - Emails allowed
- `NOT_SET` ✅ - Emails allowed (default for new contacts)
- `UNSUBSCRIBED` ❌ - Emails blocked
- `UNKNOWN` ⚠️ - Update to `NOT_SET`

---

## 🔍 Debugging Tips

1. Check console for `[EMAIL-BACKEND]` logs
2. Verify contact in WIX Dashboard → Contacts
3. Check subscription status
4. Test email template in WIX Dashboard
5. Check WIX email logs

---

## 📚 Full Documentation

See `WIX_CRM_INTEGRATION_REPORT.md` for complete details.

---

**Last Updated:** January 30, 2026
