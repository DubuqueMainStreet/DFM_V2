# Fixing CMS Reference Fields and Tag Fields

## Issue 1: Tag Fields Not Saving Correctly

**Problem:** `musicianType` and `preferredLocation` are Tag fields but code saves single strings.

**Solution Options:**

### Option A: Change Fields to Text/Dropdown (Recommended)
If these should be single-select fields:
1. In Wix CMS, change `musicianType` from Tag → **Text** field
2. In Wix CMS, change `preferredLocation` from Tag → **Text** field
3. Code will work as-is (no changes needed)

### Option B: Keep Tag Fields, Update Code
If you want to allow multiple selections:
1. Keep fields as Tag type
2. Update code to save as arrays: `[musicianType]` instead of `musicianType`
3. Update form to allow multiple selections

**Recommendation:** Use Option A (Text fields) since these are single-select dropdowns.

## Issue 2: Reference Fields Showing "Untitled" in WeeklyAssignments

**Problem:** In `WeeklyAssignments` collection, `profileRef` and `dateRef` show "Untitled" instead of record names.

**Root Cause:** Wix reference fields display the **`title`** field of the referenced collection. If there's no `title` field, it shows "Untitled".

### Fix for profileRef (SpecialtyProfiles → WeeklyAssignments)

**Option 1: Add Title Field to SpecialtyProfiles (Recommended)**
1. In `SpecialtyProfiles` collection, add a **`title`** field (Text)
2. Code already saves `title: organizationName` (already implemented)
3. `profileRef` in `WeeklyAssignments` will now display the name

**Option 2: Configure Reference Display Field**
1. In `WeeklyAssignments` collection
2. Click on `profileRef` field
3. Look for "Display Field" or "Title Field" setting
4. Change from `title` to `organizationName`
5. Save

### Fix for dateRef (MarketDates2026 → WeeklyAssignments)

**Option 1: Configure Reference Display Field (Easiest)**
1. In `WeeklyAssignments` collection
2. Click on `dateRef` field
3. Look for "Display Field" or "Title Field" setting
4. Change from `title` to `date` (the date field that exists)
5. Save
6. This will display the date value instead of "Untitled"

**Option 2: Add Title Field to MarketDates2026**
1. In `MarketDates2026` collection, add a **`title`** field (Text)
2. Populate existing records with formatted dates (e.g., "May 2nd, 2026")
3. Update code to populate `title` when creating new date records
4. Reference fields will display the title

**Recommendation:** Use Option 1 for `dateRef` (configure to display `date` field) - no code changes needed.

## Recommended Solution

### Step 1: Fix Tag Fields
Change `musicianType` and `preferredLocation` to **Text** fields (not Tag).

### Step 2: Add Title Fields
1. **SpecialtyProfiles:** Add `title` field (Text)
2. **MarketDates2026:** Add `title` field (Text) OR configure reference to use `date` field

### Step 3: Update Code
Update code to populate `title` fields when saving records.

## Quick Fix Checklist

- [ ] Change `musicianType` from Tag → Text field
- [ ] Change `preferredLocation` from Tag → Text field
- [ ] Add `title` field to `SpecialtyProfiles` collection
- [ ] Add `title` field to `MarketDates2026` collection (or configure reference)
- [ ] Update code to save `title` field
- [ ] Test reference fields display correctly
