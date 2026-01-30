# Volunteer & Non-Profit Forms - UI Elements Required

## 🎨 Form UI Elements Checklist

Both forms follow the same pattern as the musician form. You'll need to create these elements in the Wix Editor for each form.

---

## 📋 Volunteer Form (`SIGNUP- Volunteer.zab9v.js`)

### Required UI Elements:

#### Input Fields
- `#inputName` - **Text Input** - Volunteer name (required)
- `#inputEmail` - **Text Input** (Email type recommended) - Contact email (required)
- `#inputPhone` - **Text Input** - Contact phone (required)
- `#inputVolunteerRole` - **Dropdown** - Volunteer role selection (required)
  - Options are populated by code (Token Booth Sales, Merch Sales, Setup, Teardown, Hospitality Support)
- `#inputShiftPreference` - **Dropdown** - Shift preference (required)
  - Options are populated by code (Early Shift: 7:00 AM - 9:30 AM, Late Shift: 9:30 AM - 12:00 PM, Both Shifts)
- `#inputBio` - **Textarea/Multiline Input** - Experience/background (required)

#### Selection
- `#dateSelectionTags` - **Selection Tags** component - Date selection (required, at least one)

#### Action & Feedback
- `#btnSubmit` - **Button** - Submit button
- `#msgSuccess` - **Text element** - Success message (initially hidden)
- `#msgError` - **Text element** - Error message (initially hidden)

---

## 📋 Non-Profit Form (`SIGNUP- NFP.owt61.js`)

### Required UI Elements:

#### Input Fields
- `#inputName` - **Text Input** - Organization name (required)
- `#inputEmail` - **Text Input** (Email type recommended) - Contact email (required)
- `#inputPhone` - **Text Input** - Contact phone (required)
- `#inputNonProfitType` - **Dropdown** - Non-profit type selection (required)
  - Options are populated by code (Community Organization, Charity, Educational, etc.)
- `#inputBio` - **Textarea/Multiline Input** - Organization description (required)
- `#inputWebsite` - **Text Input** (URL type recommended) - Website (optional)

#### Selection
- `#dateSelectionTags` - **Selection Tags** component - Date selection (required, at least one)

#### Action & Feedback
- `#btnSubmit` - **Button** - Submit button
- `#msgSuccess` - **Text element** - Success message (initially hidden)
- `#msgError` - **Text element** - Error message (initially hidden)

---

## ✅ Form Field Mappings

### Volunteer Form → SpecialtyProfiles
- `#inputName` → `organizationName` (volunteer name)
- `#inputEmail` → `contactEmail`
- `#inputPhone` → `contactPhone`
- `#inputVolunteerRole` → `volunteerRole`
- `#inputShiftPreference` → `shiftPreference` (Early Shift, Late Shift, or Both)
- `#inputBio` → `bio`
- `type` → **"Volunteer"** (hardcoded)
- `title` → `organizationName` (for reference display)

### Non-Profit Form → SpecialtyProfiles
- `#inputName` → `organizationName` (org name)
- `#inputEmail` → `contactEmail`
- `#inputPhone` → `contactPhone`
- `#inputNonProfitType` → `nonProfitType`
- `#inputBio` → `bio`
- `#inputWebsite` → `website` (optional)
- `type` → **"NonProfit"** (hardcoded)
- `title` → `organizationName` (for reference display)

### Both Forms → WeeklyAssignments
- Selected dates from `#dateSelectionTags` → Creates multiple `WeeklyAssignments` records
- Each selected date creates one record with:
  - `profileRef` → References the `SpecialtyProfiles` record
  - `dateRef` → References the selected `MarketDates2026` date

---

## 🎯 Next Steps

1. **Create UI Elements in Wix Editor:**
   - For Volunteer form page
   - For Non-Profit form page
   - Use exact element IDs listed above

2. **Test Forms:**
   - Submit test volunteer application
   - Submit test non-profit application
   - Verify data saves correctly to `SpecialtyProfiles`
   - Verify `WeeklyAssignments` records are created

3. **Verify in CMS:**
   - Check `SpecialtyProfiles` - should see records with `type: "Volunteer"` and `type: "NonProfit"`
   - Check `WeeklyAssignments` - should see records linked to volunteer/non-profit profiles
   - Verify reference fields display correctly

4. **Customize Non-Profit Types (if needed):**
   - The non-profit type dropdown currently has generic categories
   - You can customize the options in `populateNonProfitTypeDropdown()` function
   - Update the array in `SIGNUP- NFP.owt61.js`

---

## 📝 Notes

- Both forms use the same date selection logic as the musician form
- Both forms create multiple `WeeklyAssignments` records (one per selected date)
- Both forms use the unified `SpecialtyProfiles` schema
- The `type` field distinguishes between Musician, Volunteer, and NonProfit
- All forms will work with the same admin dashboard (filtered by `type`)

---

## 🔧 Customization Options

### Non-Profit Types
If you want to customize the non-profit type options, edit the `populateNonProfitTypeDropdown()` function in `SIGNUP- NFP.owt61.js`:

```javascript
const nonProfitTypeOptions = [
	{ value: 'Your Category', label: 'Your Category Label' },
	// Add more options as needed
];
```

### Volunteer Roles
If you need to add/modify volunteer roles, edit the `populateVolunteerRoleDropdown()` function in `SIGNUP- Volunteer.zab9v.js`:

```javascript
const volunteerRoleOptions = [
	{ value: 'Your Role', label: 'Your Role Label' },
	// Add more options as needed
];
```

---

**Forms are ready to use once UI elements are created in Wix Editor!**
