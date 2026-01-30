# Fixing dateRef Display in WeeklyAssignments

## The Problem

`dateRef` column shows UUIDs like `c7b6c2e5-32d9-4e13-ab02-7fcda7bc8925` instead of actual dates.

## Root Cause

Wix reference fields automatically display the `title` field of the referenced collection. Since `MarketDates2026` doesn't have a `title` field, it shows the `_id` (UUID) instead.

## Solution: Add Title Field to MarketDates2026

Since Wix doesn't expose the display field setting, we need to add a `title` field to `MarketDates2026`:

### Step 1: Add Title Field

1. Go to `MarketDates2026` collection in Wix CMS
2. Click **Add Field**
3. Field ID: `title`
4. Field Type: **Text**
5. Required: No (or Yes, your choice)
6. Save

### Step 2: Populate Title Field for Existing Records

You have two options:

**Option A: Manual Entry**
- Edit each date record in `MarketDates2026`
- Add a formatted date to the `title` field (e.g., "May 2nd, 2026" or "2026-05-02")
- Save each record

**Option B: Use a Script (if you have many records)**
- I can create a backend script to populate all existing records
- It will format dates from the `date` field into the `title` field

### Step 3: Verify

After adding `title` fields:
- `dateRef` in `WeeklyAssignments` will automatically display the `title` value
- New form submissions will work correctly
- Existing `WeeklyAssignments` records will update to show dates

## Format Recommendation

For the `title` field, use a readable format like:
- "May 2nd, 2026"
- "May 2, 2026"
- "2026-05-02" (if you prefer ISO format)

Choose whatever format is most readable for your use case.

## Next Steps

1. Add `title` field to `MarketDates2026`
2. Populate existing records (manual or script)
3. Test - `dateRef` should now show dates instead of UUIDs

Would you like me to create a script to populate the `title` field for all existing records?
