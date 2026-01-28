# Musician Signup Form - Handoff Document

**Date:** January 27, 2026  
**Status:** ✅ Code Complete, CMS Configuration In Progress  
**Next Phase:** Testing & Final CMS Setup

---

## 🎯 Project Overview

A production-ready Wix Velo form for musician signups at Dubuque Farmers Market. The form implements a One-to-Many data structure where one musician profile creates multiple weekly assignment records (one per selected market date).

---

## ✅ Completed Components

### 1. Frontend Form Code
**File:** `src/pages/SIGNUP-MUSICIAN.ais9x.js`

**Features:**
- ✅ All form fields implemented and validated
- ✅ Date selection tags (sorted chronologically, formatted with day suffixes)
- ✅ File upload handling
- ✅ One-to-Many submission logic (Parent → Children)
- ✅ Success/Error messaging
- ✅ Form reset after submission
- ✅ Unified schema field mapping (works for all signup types)

**Form Fields:**
- `#inputName` → `organizationName` (required)
- `#inputEmail` → `contactEmail` (required)
- `#inputPhone` → `contactPhone` (required)
- `#inputMusicianType` → `musicianType` (required, dropdown)
- `#inputNeedsElectric` → `techNeeds` (boolean checkbox)
- `#inputLocation` → `preferredLocation` (required, dropdown)
- `#inputBio` → `bio` (required, textarea)
- `#inputWebsite` → `website` (optional, URL)
- `#inputDuration` → `duration` (optional, dropdown)
- `#inputGenre` → `genre` (optional, dropdown)
- `#dateSelectionTags` → Creates `WeeklyAssignments` records (required, at least one)
- `#uploadButton` → `fileUrl` (optional, file upload)
- `#btnSubmit` → Submit button
- `#msgSuccess` → Success message element
- `#msgError` → Error message element

### 2. Backend Utilities
**File:** `src/backend/formUtils.web.js`

**Functions:**
- `validateEmail(email)` - Email format validation
- `emailExists(email)` - Duplicate email check
- `getAvailableDates()` - Fetch market dates for selection

### 3. Date Population Script
**File:** `src/backend/populateDateTitles.web.js`

**Purpose:** Populates `title` field in `MarketDates2026` for reference field display.

**Status:** ✅ Created, needs to be run once

**Test Page:** `src/pages/TEST-POPULATE-DATES.ais9x.js` (auto-runs on page load)

### 4. Git Integration
**Status:** ✅ Fully Operational
- Repository: `https://github.com/DubuqueMainStreet/DFM_V2.git`
- Auto-sync: ✅ Working (commit → push → Wix syncs automatically)
- Site ID: `b8f4ee52-de89-4690-9bca-ea948bbea938`

---

## 🗄️ CMS Collections Configuration

### SpecialtyProfiles Collection

**Field IDs (Unified Schema):**
- `type` (Text) - Required - Value: "Musician"
- `title` (Text) - Optional - For reference display (populated from `organizationName`)
- `organizationName` (Text) - Required - Name/band name
- `contactEmail` (Email/Text) - Required
- `contactPhone` (Text) - Required
- `musicianType` (Text) - Required - **Must be Text field, NOT Tag**
- `techNeeds` (Boolean) - Optional - Electric hookup needs
- `preferredLocation` (Text) - Required - **Must be Text field, NOT Tag**
- `bio` (Text/Long Text) - Required
- `website` (URL/Text) - Optional
- `duration` (Text) - Optional
- `genre` (Text) - Optional
- `volunteerRole` (Text) - Optional - For future volunteer forms
- `eventType` (Text) - Optional - For future event forms
- `nonProfitType` (Text) - Optional - For future non-profit forms

**⚠️ Important:** `musicianType` and `preferredLocation` must be **Text** fields, not Tag fields.

### WeeklyAssignments Collection

**Field IDs:**
- `profileRef` (Reference) - Required - References `SpecialtyProfiles`
- `dateRef` (Reference) - Required - References `MarketDates2026`

**Reference Display Configuration:**
- `profileRef` displays `title` field from `SpecialtyProfiles` (or `organizationName` if configured)
- `dateRef` displays `title` field from `MarketDates2026` (needs to be populated)

### MarketDates2026 Collection

**Field IDs:**
- `date` (Date) - Required - The market date
- `title` (Text) - Optional - **Needs to be added and populated** for reference display

**⚠️ Action Required:** Add `title` field and run `populateDateTitles` script to populate it.

---

## 🔧 Pending CMS Tasks

### Critical (Must Complete)

1. **Add `title` field to `MarketDates2026`:**
   - Field ID: `title`
   - Type: Text
   - Required: No
   - Then run `populateDateTitles` script (see below)

2. **Verify field types:**
   - `musicianType` in `SpecialtyProfiles` → Must be **Text** (not Tag)
   - `preferredLocation` in `SpecialtyProfiles` → Must be **Text** (not Tag)

3. **Run Date Titles Population Script:**
   - Visit the test page: `TEST-POPULATE-DATES.ais9x.js`
   - Script auto-runs on page load
   - Updates all `MarketDates2026` records with formatted `title` fields
   - Format: "May 2nd, 2026"

### Optional (For Better UX)

4. **Verify reference field displays:**
   - Check `WeeklyAssignments` → `profileRef` shows names (not "Untitled")
   - Check `WeeklyAssignments` → `dateRef` shows dates (not UUIDs)

---

## 📋 Testing Checklist

### Basic Functionality
- [ ] Fill out all required fields and submit
- [ ] Verify data saves to `SpecialtyProfiles` collection correctly
- [ ] Verify child records created in `WeeklyAssignments` (one per selected date)
- [ ] Test with optional fields empty
- [ ] Test file upload (if applicable)
- [ ] Verify form resets after successful submission

### Validation Testing
- [ ] Submit with empty required fields (should show error)
- [ ] Submit without selecting dates (should show error)
- [ ] Test with special characters in text fields

### Date Selection
- [ ] Verify dates load correctly
- [ ] Select multiple dates and verify all save
- [ ] Verify dates are sorted chronologically
- [ ] Verify date labels show correctly ("May 2nd" format)

### CMS Verification
- [ ] Check `SpecialtyProfiles` - all fields save correctly
- [ ] Check `WeeklyAssignments` - `profileRef` shows names (not "Untitled")
- [ ] Check `WeeklyAssignments` - `dateRef` shows dates (not UUIDs)
- [ ] Verify multiple `WeeklyAssignments` records created per submission

---

## 🎨 UI Elements Required

All elements must exist in Wix Editor with exact IDs:

### Input Fields
- `#inputName` - Text Input
- `#inputEmail` - Text Input (Email type recommended)
- `#inputPhone` - Text Input
- `#inputMusicianType` - Dropdown
- `#inputNeedsElectric` - Checkbox
- `#inputLocation` - Dropdown
- `#inputBio` - Textarea/Multiline Input
- `#inputWebsite` - Text Input (URL type recommended)
- `#inputDuration` - Dropdown
- `#inputGenre` - Dropdown

### Selection & Upload
- `#dateSelectionTags` - Selection Tags component
- `#uploadButton` - File Upload button

### Action & Feedback
- `#btnSubmit` - Button
- `#msgSuccess` - Text element (initially hidden)
- `#msgError` - Text element (initially hidden)

---

## 📁 File Structure

```
dubuque-market-2026-planning/
├── src/
│   ├── pages/
│   │   ├── SIGNUP-MUSICIAN.ais9x.js  ✅ Main form code
│   │   └── TEST-POPULATE-DATES.ais9x.js  ✅ Date titles script runner
│   ├── backend/
│   │   ├── formUtils.web.js  ✅ Validation utilities
│   │   └── populateDateTitles.web.js  ✅ Date title population script
│   └── styles/
│       └── global.css  ✅ Date tag styling
├── .cursor/
│   ├── PROJECT_STATE.md.txt  📝 Project tracking
│   └── rules/
│       ├── global.mdc.txt  📋 Global coding rules
│       └── wix-velo.mdc.txt  📋 Velo-specific rules
└── [Documentation files]
```

---

## 🔍 Known Issues & Resolutions

### ✅ Resolved
1. **Collection ID mismatches** - Fixed (using `SpecialtyProfiles`, `WeeklyAssignments`, `MarketDates2026`)
2. **Date field formatting** - Fixed (using `date` field, formatted with day suffixes)
3. **Date selection retrieval** - Fixed (robust value retrieval from selection tags)
4. **Field consolidation** - Fixed (unified schema: `organizationName`, `contactEmail`, `contactPhone`)

### ⚠️ In Progress
1. **Tag fields** - `musicianType` and `preferredLocation` need to be Text fields (not Tag)
2. **Reference field displays** - `dateRef` shows UUIDs until `title` field is populated in `MarketDates2026`

---

## 🚀 Immediate Next Steps

### Step 1: Complete CMS Configuration
1. Add `title` field to `MarketDates2026` collection
2. Verify `musicianType` and `preferredLocation` are Text fields (not Tag)
3. Run `populateDateTitles` script (visit test page or run manually)

### Step 2: Test Form Submission
1. Submit a test form with all fields
2. Verify data saves correctly to `SpecialtyProfiles`
3. Verify `WeeklyAssignments` records are created
4. Verify reference fields display correctly (names and dates, not UUIDs)

### Step 3: UI Polish (If Needed)
1. Style form elements appropriately
2. Test on mobile devices
3. Add any helper text or labels
4. Verify form layout and spacing

### Step 4: Production Readiness
1. Complete all testing checklist items
2. Remove test page (`TEST-POPULATE-DATES.ais9x.js`) or keep for future use
3. Review form labels and instructions
4. Set up any email notifications (if needed)

---

## 📚 Key Documentation Files

- `MUSICIAN_FORM_COMPLETION_CHECKLIST.md` - Detailed testing checklist
- `CMS_FIELD_CONSOLIDATION_GUIDE.md` - Field mapping reference
- `WEEKLY_ASSIGNMENTS_UNTITLED_FIX.md` - Reference field display fix
- `DATAREF_DISPLAY_FIX.md` - Date reference display solution
- `POPULATE_DATE_TITLES_INSTRUCTIONS.md` - Script execution guide
- `SPECIALTY_PROFILES_UNIFIED_SCHEMA.md` - Complete field schema

---

## 💡 Technical Notes

### Code Architecture
- **Pattern:** One-to-Many (Parent → Children)
- **Parent:** `SpecialtyProfiles` (one record per submission)
- **Children:** `WeeklyAssignments` (one record per selected date)
- **Reference:** `MarketDates2026` (source for date selection)

### Velo Compliance
- ✅ No DOM access (`window`/`document`)
- ✅ Visual Immutability (assumes elements exist)
- ✅ Strict selectors (`$w('#id')`)
- ✅ Error handling (Anti-Loop Protocol)

### Data Flow
1. User fills form → Validation
2. File upload (if provided) → Get URL
3. Insert `SpecialtyProfiles` → Get `_id`
4. Loop selected dates → Insert `WeeklyAssignments` with `profileRef` and `dateRef`
5. Success feedback → Reset form

---

## 🎯 Success Criteria

The form is complete when:
- ✅ All form fields save correctly to CMS
- ✅ `WeeklyAssignments` records created for each selected date
- ✅ Reference fields display names and dates (not UUIDs or "Untitled")
- ✅ Form validation works correctly
- ✅ Success/error messaging displays properly
- ✅ Form resets after submission

---

## 📞 Support Context

**Current State:** Code is production-ready. CMS configuration needs completion (add `title` field, run population script, verify field types).

**Blockers:** None - all code is complete and synced.

**Next Developer Should:** Complete CMS setup, run tests, verify reference field displays.

---

**Last Updated:** January 27, 2026  
**Code Status:** ✅ Complete  
**CMS Status:** ⚠️ Configuration In Progress
