# Volunteer & Non-Profit Signup Forms - Implementation Plan

## 🎯 Goal
Build volunteer and non-profit signup forms similar to the musician form, using the unified `SpecialtyProfiles` + `WeeklyAssignments` schema.

---

## 📋 Forms to Build

### 1. Volunteer Signup Form (`SIGNUP- Volunteer.zab9v.js`)
### 2. Non-Profit Signup Form (`SIGNUP- NFP.owt61.js`)
### 3. Special Event Signup Form (`SIGNUP - Special Event.holpu.js`) - Optional/Future

---

## 🏗️ Architecture (Same as Musician Form)

### Data Structure
- **Parent Collection:** `SpecialtyProfiles`
  - `type`: "Volunteer" or "NonProfit"
  - Shared fields: `organizationName`, `contactEmail`, `contactPhone`, `bio`, `website`, `preferredLocation`
  - Type-specific fields: `volunteerRole` (Volunteers), `nonProfitType` (Non-Profits)

- **Child Collection:** `WeeklyAssignments`
  - `profileRef` → References `SpecialtyProfiles`
  - `dateRef` → References `MarketDates2026`
  - `applicationStatus` → Status tracking
  - `assignedMapId` → Location assignment

---

## 📝 Volunteer Form Fields

### Required Fields
- **Name** (`#inputName`) → `organizationName` (individual name)
- **Email** (`#inputEmail`) → `contactEmail`
- **Phone** (`#inputPhone`) → `contactPhone`
- **Volunteer Role** (`#inputVolunteerRole`) → `volunteerRole` (dropdown)
  - Options: TBD (e.g., "Setup/Cleanup", "Information Booth", "Parking", "Event Support", etc.)
- **Bio/Experience** (`#inputBio`) → `bio` (textarea)
- **Date Selection** (`#dateSelectionTags`) → Creates `WeeklyAssignments` records

### Optional Fields
- **Website** (`#inputWebsite`) → `website` (URL)
- **Preferred Location** (`#inputLocation`) → `preferredLocation` (dropdown)
- **File Upload** (`#uploadButton`) → `fileUrl` (optional)

### Form Elements Needed
- `#inputName` - Text Input
- `#inputEmail` - Text Input (Email type)
- `#inputPhone` - Text Input
- `#inputVolunteerRole` - Dropdown
- `#inputBio` - Textarea
- `#inputWebsite` - Text Input (URL type)
- `#inputLocation` - Dropdown
- `#dateSelectionTags` - Selection Tags component
- `#uploadButton` - File Upload button
- `#btnSubmit` - Submit button
- `#msgSuccess` - Success message element
- `#msgError` - Error message element

---

## 📝 Non-Profit Form Fields

### Required Fields
- **Organization Name** (`#inputName`) → `organizationName`
- **Contact Email** (`#inputEmail`) → `contactEmail`
- **Contact Phone** (`#inputPhone`) → `contactPhone`
- **Non-Profit Type** (`#inputNonProfitType`) → `nonProfitType` (dropdown)
  - Options: TBD (e.g., "Community Organization", "Charity", "Educational", "Religious", etc.)
- **Organization Description** (`#inputBio`) → `bio` (textarea)
- **Date Selection** (`#dateSelectionTags`) → Creates `WeeklyAssignments` records

### Optional Fields
- **Website** (`#inputWebsite`) → `website` (URL)
- **Preferred Location** (`#inputLocation`) → `preferredLocation` (dropdown)
- **Tech Needs** (`#inputTechNeeds`) → `techNeeds` (checkbox or textarea)
- **File Upload** (`#uploadButton`) → `fileUrl` (optional)

### Form Elements Needed
- `#inputName` - Text Input
- `#inputEmail` - Text Input (Email type)
- `#inputPhone` - Text Input
- `#inputNonProfitType` - Dropdown
- `#inputBio` - Textarea
- `#inputWebsite` - Text Input (URL type)
- `#inputLocation` - Dropdown
- `#inputTechNeeds` - Checkbox or Textarea
- `#dateSelectionTags` - Selection Tags component
- `#uploadButton` - File Upload button
- `#btnSubmit` - Submit button
- `#msgSuccess` - Success message element
- `#msgError` - Error message element

---

## 🔄 Implementation Steps

### Step 1: Define Field Options
**Questions to Answer:**
1. **Volunteer Roles:** What volunteer roles are available?
   - Setup/Cleanup?
   - Information Booth?
   - Parking?
   - Event Support?
   - Other?

2. **Non-Profit Types:** What categories of non-profits?
   - Community Organization?
   - Charity?
   - Educational?
   - Religious?
   - Other?

3. **Locations:** Same as musician locations?
   - Default, Location A, Location B, Location C?

### Step 2: Build Volunteer Form
1. Copy musician form structure
2. Replace musician-specific fields with volunteer fields
3. Update field mappings
4. Set `type: "Volunteer"`
5. Test form submission

### Step 3: Build Non-Profit Form
1. Copy musician form structure
2. Replace musician-specific fields with non-profit fields
3. Update field mappings
4. Set `type: "NonProfit"`
5. Test form submission

### Step 4: Verify Data Structure
1. Test all three forms
2. Verify data saves correctly to `SpecialtyProfiles`
3. Verify `WeeklyAssignments` records created correctly
4. Verify reference fields display correctly

### Step 5: Build Unified Admin Dashboard
1. Create admin page with tabs for each type
2. Filter by `type` field
3. Manage all three types in one interface

---

## 📋 Code Template Structure

Both forms will follow this pattern (same as musician form):

```javascript
import wixData from 'wix-data';

$w.onReady(function () {
    populateDropdowns();
    populateDateTags();
    setupSubmitHandler();
});

// Populate dropdowns (role/type, location, etc.)
function populateDropdowns() { ... }

// Populate date selection tags (same as musician form)
async function populateDateTags() { ... }

// Handle form submission
async function handleSubmit() {
    // 1. Validate fields
    // 2. Upload file (if provided)
    // 3. Insert SpecialtyProfiles record (type: "Volunteer" or "NonProfit")
    // 4. Insert WeeklyAssignments records (one per selected date)
    // 5. Show success message
    // 6. Reset form
}

// Reset form
function resetForm() { ... }
```

---

## ✅ Checklist

### Volunteer Form
- [ ] Define volunteer role options
- [ ] Create form UI elements in Wix Editor
- [ ] Build form code (`SIGNUP- Volunteer.zab9v.js`)
- [ ] Test form submission
- [ ] Verify data saves correctly
- [ ] Verify WeeklyAssignments created
- [ ] Test with multiple date selections

### Non-Profit Form
- [ ] Define non-profit type options
- [ ] Create form UI elements in Wix Editor
- [ ] Build form code (`SIGNUP- NFP.owt61.js`)
- [ ] Test form submission
- [ ] Verify data saves correctly
- [ ] Verify WeeklyAssignments created
- [ ] Test with multiple date selections

### Both Forms
- [ ] Verify unified schema works for all types
- [ ] Test reference field displays
- [ ] Document form fields and mappings
- [ ] Create handoff documentation

---

## 🚀 Next Steps

1. **Answer field questions:**
   - What are the volunteer role options?
   - What are the non-profit type options?
   - Any other type-specific fields needed?

2. **Build Volunteer Form:**
   - I'll create the code based on musician form template
   - You'll need to create UI elements in Wix Editor

3. **Build Non-Profit Form:**
   - Same process as volunteer form

4. **Test & Verify:**
   - Test all three forms
   - Verify data structure
   - Fix any issues

5. **Build Admin Dashboard:**
   - Once all forms are working
   - Create unified admin interface

---

## 💡 Questions for You

1. **Volunteer Roles:** What volunteer roles/positions are available?
2. **Non-Profit Types:** What categories of non-profits sign up?
3. **Locations:** Same location options as musicians? (Default, Location A, B, C)
4. **Special Fields:** Any other fields needed for volunteers or non-profits?
5. **Date Selection:** Same date selection process? (Select multiple Saturdays)

Once you provide these details, I can build both forms quickly using the musician form as a template!
