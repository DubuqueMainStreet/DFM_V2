# Testing Checklist - Date Availability & Styling

## Site Published ✅
**Live Site**: https://www.dubuquefarmersmarket.org/  
**Preview**: https://wix.to/LweqEO7  
**UI Version**: 542

## What to Test

### 1. Non-Profit Signup Portal
**URL**: Navigate to the Non-Profit signup page

#### Test Availability Display
- [ ] **Open browser console** (F12 → Console tab)
- [ ] **Look for new logs**:
  - `🚀🚀🚀 POPULATE DATE REPEATER CALLED - VERSION 2.0`
  - `🔍 Calling getDateAvailability()...`
  - `📅 Non-Profit Portal - Availability data received:`
- [ ] **Check if dates with approved non-profits show as RED/FULL**:
  - Dates with `nonProfits >= 1` should have:
    - Red border (`#F44336`)
    - Reduced opacity (0.5)
    - "Not allowed" cursor
    - Should NOT be clickable
- [ ] **Verify styling**:
  - Unselected dates should have **WHITE background** (not beige)
  - Selected dates should have **LIGHT BLUE background** (`#E3F2FD`)
  - Full dates should be grayed out and non-clickable

#### Test Date Selection
- [ ] Click an **available** date (green border) → Should turn blue
- [ ] Click again → Should turn white (deselected)
- [ ] Try clicking a **full** date (red border) → Should NOT respond to clicks

### 2. Musician Signup Portal
**URL**: Navigate to the Musician signup page

- [ ] **Check console logs** for availability data
- [ ] **Verify dates show correct availability**:
  - 0-1 musicians = Green (available)
  - 2 musicians = Orange (limited)
  - 3+ musicians = Red (full)
- [ ] **Test styling**: White background for unselected, blue for selected

### 3. Volunteer Signup Portal
**URL**: Navigate to the Volunteer signup page

- [ ] **Check console logs** for availability data
- [ ] **Select a volunteer role** from dropdown
- [ ] **Verify dates update** based on role-specific limits:
  - Token Sales: 2 max
  - Merch Sales: 2 max
  - Setup: 2 max
  - Teardown: 2 max
  - Hospitality Support: 2 max
  - No Preference: 1 max
- [ ] **Test styling**: Consistent white/blue styling

### 4. Backend Logs (Important!)
**Location**: Wix Editor → Dev Tools → Backend Logs

- [ ] **Open Wix Editor** (online)
- [ ] **Go to**: Dev Tools → Backend Logs
- [ ] **Look for logs from `getDateAvailability()`**:
  - `🚀 getDateAvailability() called`
  - `📦 Query returned X total assignments`
  - `🔍 Found X approved assignments`
  - `📋 Status breakdown:` (shows all statuses)
  - `📊 Availability summary:` (shows dates with availability)
  - `✅ Returning availability object with X dates`

### 5. Expected Behavior

#### If Availability is Working:
- ✅ Console shows availability data with date IDs
- ✅ Dates with approved assignments show as RED/FULL
- ✅ Dates are NOT clickable when full
- ✅ Backend logs show assignments being processed
- ✅ Styling is consistent (white → blue → white)

#### If Availability is NOT Working:
- ❌ Console shows empty availability object `{}`
- ❌ All dates show as available (green) even when they should be full
- ❌ Backend logs show errors or empty results

### 6. Troubleshooting

#### If dates aren't showing as full:
1. **Check backend logs** - Are assignments being found?
2. **Check date IDs** - Do IDs in `WeeklyAssignments.dateRef` match `MarketDates2026._id`?
3. **Check application status** - Are assignments marked as "Approved" (case-sensitive)?
4. **Check profile type** - Are profiles correctly typed as "NonProfit", "Musician", or "Volunteer"?

#### If styling is wrong:
1. **Clear browser cache** (Ctrl+Shift+Delete)
2. **Hard refresh** (Ctrl+F5)
3. **Check console for CSS errors**

## Test Data Needed

To properly test, you should have:
- ✅ At least 2 approved non-profit assignments
- ✅ At least 3 approved musician assignments (to test "full" state)
- ✅ At least 2 approved volunteer assignments for a specific role

## What to Report

After testing, please report:
1. ✅/❌ Are dates with approved assignments showing as RED/FULL?
2. ✅/❌ Is the styling correct (white background, no beige)?
3. ✅/❌ Are the console logs showing availability data?
4. ✅/❌ Are the backend logs showing assignments being processed?
5. Any errors or unexpected behavior?

## Quick Test Commands

**In Browser Console** (on signup page):
```javascript
// Check if availability function exists
console.log(typeof getDateAvailability);

// Manually call it (if accessible)
getDateAvailability().then(data => console.log('Availability:', data));
```
