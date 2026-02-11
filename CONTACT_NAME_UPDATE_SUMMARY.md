# Contact Name Field Update - Summary

## Overview
Added support for collecting both the **band/organization name** AND the **actual contact person name** in specialty request forms for musicians and non-profits.

## Changes Made

### 1. Form Pages Updated ✅
- **`src/pages/SIGNUP-Music.ais9x.js`**
  - Now collects `#inputContactName` field value
  - Includes `contactName` in profile data submission
  - Resets `contactName` field on form reset

- **`src/pages/SIGNUP- NFP.owt61.js`**
  - Now collects `#inputContactName` field value
  - Includes `contactName` in profile data submission
  - Resets `contactName` field on form reset

### 2. Backend Updated ✅
- **`src/backend/formSubmissions.jsw`**
  - Saves `contactName` field to `SpecialtyProfiles` collection
  - Uses `contactName` when creating CRM contacts (falls back to `organizationName` if not provided)
  - Updated both `submitSpecialtyProfile()` and `manualEntrySpecialtyProfile()` functions

### 3. Email Notifications Updated ✅
- **`src/backend/emailNotifications.jsw`**
  - Uses `contactName` when creating CRM contacts (prefers `contactName` over `organizationName`)
  - Falls back to `organizationName` if `contactName` is not available

### 4. Admin Dashboard Updated ✅
- **`src/pages/Specialty Requests.k6g1g.js`**
  - Displays contact name in format: `"Contact Name (Organization Name)"` when both are available
  - Falls back to just `"Organization Name"` if `contactName` is not provided
  - Manual entry form now includes `#manualEntryContactName` field
  - Manual entry form resets `contactName` field

## CMS Setup Required

### Add `contactName` Field to SpecialtyProfiles Collection

**IMPORTANT:** You need to add the `contactName` field to your `SpecialtyProfiles` collection in Wix CMS.

#### Steps:
1. Go to **Wix Editor** → **Content Manager** → **Collections**
2. Select **`SpecialtyProfiles`** collection
3. Click **"Add Field"** or **"Manage Fields"**
4. Add a new field with these settings:
   - **Field Name:** `contactName`
   - **Field Type:** **Text**
   - **Required:** **No** (Optional field)
   - **Description:** "Actual contact person name (separate from organization/band name)"

5. **Save** the collection changes

## UI Elements Required

### Public Forms (Musician & Non-Profit)
You've already added `#inputContactName` to your forms. Make sure:
- Element ID is exactly: `#inputContactName`
- Field type: Text Input
- Label: "Contact Name" or "Contact Person Name"
- Position: After `#inputName` (organization/band name field)
- Optional field (not required)

### Manual Entry Form (Admin Dashboard)
Add a new field to your manual entry form:
- **Element ID:** `#manualEntryContactName`
- **Field Type:** Text Input
- **Label:** "Contact Name" or "Contact Person Name"
- **Position:** After `#manualEntryName` field
- **Optional field** (not required)

## How It Works

### Data Flow:
1. **Form Submission:**
   - User enters band/organization name in `#inputName` → saved as `organizationName`
   - User enters contact person name in `#inputContactName` → saved as `contactName` (optional)

2. **Data Storage:**
   - Both fields saved to `SpecialtyProfiles` collection
   - `organizationName` is required (band/organization name)
   - `contactName` is optional (actual contact person)

3. **CRM Contact Creation:**
   - When creating CRM contacts, system uses `contactName` if available
   - Falls back to `organizationName` if `contactName` is not provided
   - Format: `{contactName || organizationName} Participant`

4. **Admin Display:**
   - Shows: `"Contact Name (Organization Name)"` when both available
   - Shows: `"Organization Name"` when only organization name provided

## Testing Checklist

- [ ] Add `contactName` field to `SpecialtyProfiles` collection in CMS
- [ ] Verify `#inputContactName` exists on musician form
- [ ] Verify `#inputContactName` exists on non-profit form
- [ ] Add `#manualEntryContactName` to manual entry form (if using manual entry)
- [ ] Test form submission with both fields filled
- [ ] Test form submission with only organization name (contactName empty)
- [ ] Verify data saves correctly in `SpecialtyProfiles` collection
- [ ] Verify CRM contact uses contactName when available
- [ ] Verify admin dashboard displays contact name correctly

## Notes

- **Backward Compatible:** Existing records without `contactName` will continue to work
- **Optional Field:** `contactName` is optional - forms work with or without it
- **Display Format:** Admin dashboard shows both names when available: `"John Doe (The Band Name)"`
- **CRM Integration:** CRM contacts will use the contact person name when creating contacts for email notifications

## Example Data Structure

```javascript
{
  type: "Musician",
  organizationName: "The Rock Band",      // Required - band name
  contactName: "John Doe",                // Optional - contact person name
  contactEmail: "john@example.com",
  contactPhone: "555-1234",
  // ... other fields
}
```

## Support

If you encounter any issues:
1. Verify `contactName` field exists in `SpecialtyProfiles` collection
2. Check browser console for any JavaScript errors
3. Verify element IDs match exactly: `#inputContactName` and `#manualEntryContactName`
4. Check backend logs in Wix Editor → Dev Tools → Backend Logs
