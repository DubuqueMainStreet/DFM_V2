# Debugging Availability Issue - Local vs Production

## The Problem
Availability data works in local editor but returns empty `{}` on production site.

## Possible Causes

### 1. Collection Permissions (Most Likely)
**Check:** Wix Editor → CMS → WeeklyAssignments → Settings → Permissions

**Required:**
- Backend functions need to be able to READ from WeeklyAssignments
- Even though backend functions run with elevated permissions, verify collection settings

**How to Check:**
1. Go to Wix Editor
2. Open CMS → WeeklyAssignments collection
3. Click Settings → Permissions
4. Ensure backend functions can read the collection

### 2. Backend Function Permissions
**Check:** `src/backend/permissions.json`

**Current Status:** ✅ Correctly configured
- Anonymous users CAN invoke backend functions
- This is set correctly

### 3. Data Mismatch
**Possible Issues:**
- Approved assignments exist in local database but not production
- Date IDs in WeeklyAssignments don't match MarketDates2026 IDs
- Status field values differ (e.g., "Approved" vs "approved")

**How to Check:**
1. Go to Wix Editor → CMS → WeeklyAssignments
2. Filter by `applicationStatus = "Approved"`
3. Verify approved assignments exist
4. Check if `dateRef` values match `_id` values in MarketDates2026

### 4. Backend Logs Not Visible
**Important:** Backend `console.log()` statements appear in:
- Wix Editor → Dev Tools → Backend Logs
- NOT in browser console

**How to Check Backend Logs:**
1. Open Wix Editor
2. Go to Dev Tools (or press F12)
3. Click "Backend Logs" tab
4. Look for logs starting with 🚀, 📦, 🔍, etc.

### 5. Function Not Being Called
**Check Browser Console for:**
- `🔍 Calling getDateAvailability()...`
- `⏱️ getDateAvailability() took Xms`
- Any error messages

## Diagnostic Steps

### Step 1: Check Browser Console
Open production site → F12 → Console tab
Look for:
- ✅ `🔍 Calling getDateAvailability()...` (function is called)
- ✅ `📅 Non-Profit Portal - Availability data received:` (data received)
- ❌ Any error messages

### Step 2: Check Backend Logs
Wix Editor → Dev Tools → Backend Logs
Look for:
- ✅ `🚀 getDateAvailability() called`
- ✅ `📦 Query returned X total assignments`
- ✅ `🔍 Found X approved assignments`
- ❌ Any error messages

### Step 3: Verify Data Exists
Wix Editor → CMS → WeeklyAssignments
1. Filter: `applicationStatus = "Approved"`
2. Count how many records exist
3. Check if `dateRef` is populated
4. Verify `profileRef.type = "NonProfit"` for some records

### Step 4: Verify Collection Permissions
Wix Editor → CMS → WeeklyAssignments → Settings → Permissions
- Ensure backend functions can read
- Check if there are any restrictions

## Quick Test

Add this to your page code temporarily to test backend access:

```javascript
import { getDateAvailability } from 'backend/availabilityStatus.jsw';

$w.onReady(async () => {
    try {
        console.log('Testing backend function...');
        const result = await getDateAvailability();
        console.log('Test result:', result);
        console.log('Keys:', Object.keys(result));
    } catch (error) {
        console.error('Test error:', error);
    }
});
```

## Expected Behavior

### If Working Correctly:
- Backend logs show: `🔍 Found X approved assignments`
- Browser console shows: `📅 Availability data received: { dateId: {...}, ... }`
- Dates with approved non-profits show red border

### If Not Working:
- Backend logs show: `🔍 Found 0 approved assignments` OR error
- Browser console shows: `📅 Availability data received: {}`
- All dates show green border

## Next Steps Based on Findings

1. **If backend logs show 0 approved assignments:**
   - Check if approved assignments exist in production CMS
   - Verify status field values match exactly

2. **If backend logs show error:**
   - Check collection permissions
   - Verify WeeklyAssignments collection exists
   - Check if profileRef and dateRef are properly set up

3. **If backend function not called:**
   - Check import path: `import { getDateAvailability } from 'backend/availabilityStatus.jsw';`
   - Verify function is exported: `export async function getDateAvailability()`
   - Check browser console for import errors

4. **If data structure mismatch:**
   - Compare date IDs between MarketDates2026 and WeeklyAssignments.dateRef
   - Check if dateRef is included properly in query
