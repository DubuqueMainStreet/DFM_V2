# Fixing "Untitled" in WeeklyAssignments Collection

## The Problem

In `WeeklyAssignments` CMS, both reference fields show "Untitled":
- `profileRef` (references `SpecialtyProfiles`) → Shows "Untitled"
- `dateRef` (references `MarketDates2026`) → Shows "Untitled"

## Root Cause

Wix reference fields display the **`title`** field of the referenced collection. If the referenced collection doesn't have a `title` field, it shows "Untitled".

## Solutions

### Fix 1: profileRef (SpecialtyProfiles)

**Status:** ✅ Code already saves `title: organizationName`

**Action Required:**
1. In `SpecialtyProfiles` collection, add a **`title`** field (Text, Optional)
2. The code already populates it, so existing records may need manual update OR new submissions will work
3. `profileRef` will display the organization name

**Alternative:** Configure `profileRef` in `WeeklyAssignments` to display `organizationName` instead of `title`.

### Fix 2: dateRef (MarketDates2026)

**Recommended Solution: Configure Reference Display Field**

1. Go to `WeeklyAssignments` collection in Wix CMS
2. Click on the `dateRef` field
3. Look for **"Display Field"** or **"Title Field"** setting
4. Change it from `title` to `date`
5. Save

This will make `dateRef` display the date value instead of "Untitled".

**Alternative:** Add `title` field to `MarketDates2026` and populate it with formatted dates.

## Quick Fix Steps

1. **Add `title` field to `SpecialtyProfiles`:**
   - Field ID: `title`
   - Type: Text
   - Required: No
   - Code already saves this field ✅

2. **Configure `dateRef` display field:**
   - In `WeeklyAssignments` → `dateRef` field settings
   - Change display field from `title` → `date`
   - Save

3. **Test:**
   - Submit a new form
   - Check `WeeklyAssignments` - both references should show proper values

## Notes

- The code already saves `title: organizationName` for new `SpecialtyProfiles` records
- Existing `SpecialtyProfiles` records without `title` may still show "Untitled" until updated
- For `dateRef`, configuring the display field is easier than adding a `title` field to `MarketDates2026`
