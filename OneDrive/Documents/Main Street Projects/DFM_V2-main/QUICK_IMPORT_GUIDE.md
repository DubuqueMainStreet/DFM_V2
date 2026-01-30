# Quick Import Guide - Sample Data

All files are uploaded to Wix Site Files and ready to import!

## 🚀 Quick Start

### Option 1: Import Everything at Once (Recommended)

1. **Open Wix Editor → Dev Mode → Backend**
2. **Open the Velo Console** (or create a test page)
3. **Run this code:**

```javascript
import { importAllSampleData } from 'backend/importSampleData';

// Run the import
const result = await importAllSampleData();
console.log(result);
```

4. **Watch the console** - You'll see progress logs for each step:
   - ✅ Step 1/4: Importing vendors...
   - ✅ Step 2/4: Importing stall layouts...
   - ✅ Step 3/4: Importing POIs...
   - ✅ Step 4/4: Importing market attendance...

5. **Check the results** - The function returns a summary:
   ```javascript
   {
     success: true,
     message: "✅ Import complete! 120 vendors, 134 stalls, 7 POIs, 1254 attendance records.",
     vendors: { inserted: 120, updated: 0, ... },
     stalls: { inserted: 134, updated: 0, ... },
     pois: { inserted: 7, updated: 0, ... },
     attendance: { successfullyInserted: 1254, ... }
   }
   ```

### Option 2: Import Individual Collections

If you want to import one at a time:

```javascript
import { 
    importVendorsOnly, 
    importStallsOnly, 
    importPOIsOnly, 
    importAttendanceOnly 
} from 'backend/importSampleData';

// Import vendors first
await importVendorsOnly();

// Then stalls and POIs (can be done in any order)
await importStallsOnly();
await importPOIsOnly();

// Finally, attendance (requires vendors to exist)
await importAttendanceOnly();
```

## 📋 Import Order (Important!)

**Must follow this order:**

1. ✅ **Vendors** (first - attendance references vendors)
2. ✅ **Stall Layouts** (can be done anytime)
3. ✅ **POIs** (can be done anytime)
4. ✅ **Market Attendance** (last - requires vendors to exist)

## 🔍 Verify Import

After importing, check your collections:

1. **Vendors Collection:**
   - Should have 120 vendors
   - Check a few records to verify data

2. **StallLayouts Collection:**
   - Should have 134 stalls
   - Each should have a `geoJsonFeature` field

3. **POIs Collection:**
   - Should have 7 POIs
   - Check POI types (Restroom, Information, etc.)

4. **MarketAttendance Collection:**
   - Should have 1,254 attendance records
   - Each should reference a vendor

## 🗺️ Test the Map

After importing:

1. Navigate to your **Map page**
2. Select a date from the date picker
3. You should see:
   - ✅ Vendors on stalls with colored icons
   - ✅ Empty stalls with grey pins showing stall IDs
   - ✅ POIs (restrooms, ATM, etc.) at their locations
   - ✅ Filtering and search working

## ⚠️ Troubleshooting

### "Vendor not found" errors during attendance import
- **Solution:** Make sure vendors are imported FIRST
- Re-run `importVendorsOnly()` then `importAttendanceOnly()`

### Import is slow
- **Normal:** Large imports (1,254 records) take 1-3 minutes
- Watch the console for progress logs
- Don't refresh the page during import

### Duplicate entries
- **Normal:** The functions check for existing items
- Duplicates will be **updated**, not inserted
- Check the results - `updated` count shows how many were updated

### Need to re-import?
- The functions are **idempotent** - safe to run multiple times
- Existing items will be updated, new items will be inserted
- To start fresh, delete items from collections first

## 📊 Expected Results

After successful import:

- ✅ **120 vendors** in Vendors collection
- ✅ **134 stalls** in StallLayouts collection (A1-A22, B2-B22, C1-C2, D1-D23, G1-G18, H1-H13, J1-J20, K1-K10, L1-L8)
- ✅ **7 POIs** in POIs collection (Restrooms, ATM, Music Area, Market Booth, Tables)
- ✅ **1,254 attendance records** in MarketAttendance collection (12 weeks of market dates)

## 🎯 Next Steps

1. ✅ Run the import
2. ✅ Verify data in collections
3. ✅ Test the map page
4. ✅ Customize vendor data as needed
5. ✅ Add more market dates if needed

---

**Ready to import?** Just run `importAllSampleData()` in your Velo console! 🚀
