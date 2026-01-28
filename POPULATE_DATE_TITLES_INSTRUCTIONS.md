# Populate Date Titles - Instructions

## What This Script Does

The script `populateDateTitles.web.js` will:
1. Query all records from `MarketDates2026` collection
2. Format each date into a readable title (e.g., "May 2nd, 2026")
3. Update each record with the formatted `title` field

## Prerequisites

1. **Add `title` field to `MarketDates2026` collection:**
   - Go to `MarketDates2026` collection in Wix CMS
   - Add Field → Field ID: `title`, Type: Text, Required: No
   - Save

## How to Run the Script

### Option 1: Use the Auto-Run Test Page (Easiest - Autonomous)

I've created a test page file `TEST-POPULATE-DATES.ais9x.js` that **automatically runs** when the page loads.

**Steps:**
1. The code file is already created: `src/pages/TEST-POPULATE-DATES.ais9x.js`
2. In Wix Editor, find or create a page that uses this code file
3. Optionally add a **Text** element with ID: `#resultText` (to see results on screen)
4. **Just visit/preview the page** - the script runs automatically on page load
5. Check browser console (F12) or the result text element for confirmation
6. The script will update all `MarketDates2026` records with `title` fields

**After running, you can delete this test page or keep it for future use.**

### Option 2: Via Wix Dev Tools

1. Open your Wix site in **Dev Mode**
2. Go to **Backend** → **Web Modules**
3. Find `populateDateTitles.web.js`
4. Some Wix versions have a "Test" or "Run" button in the Functions panel
5. If available, click it to run the function

### Option 3: Call from Browser Console (Advanced)

1. Open your site in preview mode
2. Open browser DevTools (F12)
3. In Console, paste:
```javascript
import { populateDateTitles } from 'backend/populateDateTitles';
populateDateTitles().then(console.log);
```
4. Press Enter to run

## Expected Result

After running:
- All `MarketDates2026` records will have a `title` field populated
- Format: "May 2nd, 2026", "June 6th, 2026", etc.
- `dateRef` in `WeeklyAssignments` will now display dates instead of UUIDs

## Verification

1. Check `MarketDates2026` collection - all records should have `title` field filled
2. Check `WeeklyAssignments` collection - `dateRef` should show dates instead of UUIDs
3. Submit a new form - new `WeeklyAssignments` records should show dates correctly

## Troubleshooting

**If script fails:**
- Verify `title` field exists in `MarketDates2026`
- Check that `date` field exists and has valid dates
- Check console for error messages

**If dates still show UUIDs:**
- Refresh the `WeeklyAssignments` collection view
- The reference should automatically use `title` field once it exists

## After Running

Once titles are populated, you can:
- Remove the temporary test page (if created)
- Keep the script for future use if you add more dates
- The script is safe to run multiple times (it will update existing titles)
