# ⚠️ CRITICAL: Wix Data Query Default Limit

## Issue Summary
**Date:** February 2, 2026  
**Severity:** CRITICAL - Data Loss Bug  
**Status:** ✅ RESOLVED

## Problem
Wix Data queries have a **default limit of 50 items**. When collections exceed 50 records, queries will silently return only the first 50, causing:
- Missing records in admin interfaces
- Incorrect availability calculations
- Data appearing "lost" when it's actually just beyond the limit

## Impact
- Approved assignments "She Unites" and "Natalie Finley" were not appearing in admin page
- Dates were showing as available when they should have been reserved
- Total assignments: 61, but only 50 were being queried

## Solution
**ALWAYS add `.limit(1000)` to Wix Data queries** when you need all records:

```javascript
// ❌ WRONG - Will only return 50 items max
const results = await wixData.query('WeeklyAssignments')
    .include('profileRef')
    .include('dateRef')
    .find();

// ✅ CORRECT - Returns up to 1000 items
const results = await wixData.query('WeeklyAssignments')
    .include('profileRef')
    .include('dateRef')
    .limit(1000)  // ← CRITICAL: Always add this!
    .find();
```

## Files Fixed
1. `src/pages/Specialty Requests.k6g1g.js` - Admin page query
2. `src/backend/availabilityStatus.jsw` - Availability calculation
3. `src/backend/diagnosticCheck.jsw` - Diagnostic queries

## Future Considerations
- **Dubuque Farmers Market is growing** - anticipate more than 1000 records in the future
- Consider pagination for very large datasets (1000+ records)
- Monitor collection sizes and adjust limits accordingly
- Add `.limit()` to ALL queries that need complete data sets

## Best Practice
**Rule:** If you need ALL records from a collection, ALWAYS add `.limit(1000)` or implement pagination.

## Related Collections
- `WeeklyAssignments` - Currently 61 records (will grow)
- `SpecialtyProfiles` - Monitor for growth
- `MarketDates2026` - Fixed set, but check other date collections

## Notes
- Wix Data maximum limit is 1000 items per query
- For collections exceeding 1000 items, implement pagination using `.skip()` and `.limit()`
- Always check `results.hasMore` to detect if pagination is needed
