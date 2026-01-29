# Sample Data Import Guide - Dubuque Farmers' Market Map

This guide walks you through importing the sample data (120 vendors, 1,254 attendance records, 134 stalls, 7 POIs) into your Wix Collections.

## 📋 Prerequisites

- Access to Wix Editor (Local Editor or online)
- Access to Wix Velo backend functions
- The sample data files from `scripts/output/` directory

## 📁 Files to Import

1. **vendors.csv** - 120 vendors
2. **market_attendance.csv** - 1,254 market attendance records
3. **stall_layouts.geojson** - 134 stall locations
4. **pois.geojson** - 7 Points of Interest

---

## Method 1: Using Backend Functions (Recommended)

This method uses the existing `importData.jsw` backend functions. The functions need **publicly accessible URLs** to the CSV/GeoJSON files.

### Step 1: Upload Files to a Public URL

You need to host the files somewhere publicly accessible. Here are your options:

#### Option A: Upload to Wix Media Manager (Easiest)

1. **In Wix Editor:**
   - Go to **Media** → **My Uploads**
   - Click **Upload Media**
   - Upload all 4 files:
     - `vendors.csv`
     - `market_attendance.csv`
     - `stall_layouts.geojson`
     - `pois.geojson`

2. **Get the URLs:**
   - Click on each uploaded file
   - Copy the **Direct Link** URL
   - You'll get URLs like: `https://static.wixstatic.com/media/.../vendors.csv`

#### Option B: Upload to GitHub (If you have a repo)

1. Create a new branch or use an existing repo
2. Upload files to a `public/` or `data/` folder
3. Use GitHub's raw file URLs:
   - `https://raw.githubusercontent.com/your-username/repo-name/main/data/vendors.csv`

#### Option C: Use a File Hosting Service

- Upload to Dropbox, Google Drive, or similar
- Get shareable links (make sure they're publicly accessible)
- Convert to direct download links if needed

### Step 2: Call Backend Functions from Velo

1. **Open Wix Editor → Dev Mode → Backend**

2. **Create a new backend file** (or use an existing one) called `importSampleData.jsw`:

```javascript
import { importVendorRoster, importStallAssignments, importGeoJsonFeatures } from 'backend/importData';

/**
 * Import all sample data
 * Replace the URLs below with your actual file URLs from Step 1
 */
export async function importAllSampleData() {
    const results = {
        vendors: null,
        attendance: null,
        stalls: null,
        pois: null
    };
    
    try {
        // Step 1: Import Vendors (must be done first)
        console.log("Starting vendor import...");
        results.vendors = await importVendorRoster(
            "YOUR_VENDORS_CSV_URL_HERE" // Replace with your vendors.csv URL
        );
        console.log("Vendor import result:", results.vendors);
        
        // Step 2: Import Stall Layouts (can be done anytime)
        console.log("Starting stall layouts import...");
        results.stalls = await importGeoJsonFeatures(
            "YOUR_STALL_LAYOUTS_GEOJSON_URL_HERE", // Replace with your stall_layouts.geojson URL
            "StallLayouts"
        );
        console.log("Stall layouts import result:", results.stalls);
        
        // Step 3: Import POIs (can be done anytime)
        console.log("Starting POIs import...");
        results.pois = await importGeoJsonFeatures(
            "YOUR_POIS_GEOJSON_URL_HERE", // Replace with your pois.geojson URL
            "POIs"
        );
        console.log("POIs import result:", results.pois);
        
        // Step 4: Import Market Attendance (must be done AFTER vendors)
        console.log("Starting market attendance import...");
        results.attendance = await importStallAssignments(
            "YOUR_MARKET_ATTENDANCE_CSV_URL_HERE" // Replace with your market_attendance.csv URL
        );
        console.log("Market attendance import result:", results.attendance);
        
        return {
            success: true,
            message: "All imports completed. Check individual results for details.",
            results: results
        };
        
    } catch (error) {
        console.error("Import error:", error);
        return {
            success: false,
            message: `Import failed: ${error.message}`,
            results: results
        };
    }
}
```

3. **Replace the placeholder URLs** with your actual file URLs from Step 1

4. **Call the function** from the Wix Velo console or create a test page:

```javascript
// In a page's code or Velo console
import { importAllSampleData } from 'backend/importSampleData';

$w.onReady(async function () {
    // Uncomment to run import
    // const result = await importAllSampleData();
    // console.log("Import complete:", result);
});
```

5. **Run the import:**
   - Open your browser's Developer Console (F12)
   - Uncomment the import code
   - Refresh the page
   - Watch the console for progress and results

### Step 3: Verify the Import

Check each collection in Wix Editor:

1. **Vendors Collection:**
   - Should have 120 vendors
   - Check a few records to ensure data is correct

2. **StallLayouts Collection:**
   - Should have 134 stalls (A1-A22, B2-B22, C1-C2, D1-D23, G1-G18, H1-H13, J1-J20, K1-K10, L1-L8)
   - Each should have a `geoJsonFeature` field with coordinates

3. **POIs Collection:**
   - Should have 7 POIs
   - Check that POI types are correct (Restroom, Information, etc.)

4. **MarketAttendance Collection:**
   - Should have 1,254 attendance records
   - Each should reference a vendor and have a stall ID

---

## Method 2: Manual Import via Wix Editor

If you prefer to import manually or the backend functions aren't working:

### Step 1: Import Vendors

1. **Open Wix Editor → Database → Collections → Vendors**
2. Click **"Import"** button (top right)
3. Upload `vendors.csv`
4. **Map columns:**
   - `Vendor` → `title`
   - `VendorType` → `vendorType`
   - `Description` → `description`
   - `Website` → `url` (optional)
   - `Tags` → `arraystring`
   - `VendorID` → `managemymarketVendorId` (optional, for reference)
   - `DefaultStall` → `defaultStall` (optional)
5. Click **"Import"**

### Step 2: Import Stall Layouts

**Option A: Using Backend Function (Easier)**
- Use `importGeoJsonFeatures()` as described in Method 1

**Option B: Manual Import**
1. Open **StallLayouts** collection
2. For each stall in `stall_layouts.geojson`:
   - Create a new item
   - Set `title` to the stall ID (e.g., "A1", "B12")
   - Set `geoJsonFeature` to the JSON string from the GeoJSON file
   - Save

**Note:** Manual import of 134 stalls is tedious. Use the backend function if possible.

### Step 3: Import POIs

**Option A: Using Backend Function (Easier)**
- Use `importGeoJsonFeatures()` with `"POIs"` as the second parameter

**Option B: Manual Import**
1. Open **POIs** collection
2. For each POI in `pois.geojson`:
   - Create a new item
   - Set `title` to the POI name
   - Set `poiType` to the type (Restroom, Information, etc.)
   - Set `description` to the description
   - Set `geoJsonFeature` to the JSON string
   - Save

### Step 4: Import Market Attendance

**Important:** This must be done AFTER vendors are imported, as it references vendor records.

1. Open **MarketAttendance** collection
2. Click **"Import"**
3. Upload `market_attendance.csv`
4. **Map columns:**
   - `StartDate` → `marketDate` (format: MM/DD/YYYY)
   - `Vendor` → `vendorRef` (reference to Vendors collection - you may need to match by name)
   - `Stall` → `stallId`
   - Set `status` to "Present" (default)
   - Set `title` to a combination of vendor name, stall, and date
5. Click **"Import"**

**Note:** The CSV has `VendorID` which can help match vendors. The backend function handles this automatically.

---

## Method 3: Import Individual Functions

If you want to import one collection at a time:

### Import Vendors Only

```javascript
import { importVendorRoster } from 'backend/importData';

const result = await importVendorRoster("YOUR_VENDORS_CSV_URL");
console.log(result);
// Returns: { success: true, inserted: 120, updated: 0, ... }
```

### Import Stall Layouts Only

```javascript
import { importGeoJsonFeatures } from 'backend/importData';

const result = await importGeoJsonFeatures(
    "YOUR_STALL_LAYOUTS_GEOJSON_URL",
    "StallLayouts"
);
console.log(result);
// Returns: { success: true, inserted: 134, updated: 0, ... }
```

### Import POIs Only

```javascript
import { importGeoJsonFeatures } from 'backend/importData';

const result = await importGeoJsonFeatures(
    "YOUR_POIS_GEOJSON_URL",
    "POIs"
);
console.log(result);
// Returns: { success: true, inserted: 7, updated: 0, ... }
```

### Import Market Attendance Only

```javascript
import { importStallAssignments } from 'backend/importData';

const result = await importStallAssignments("YOUR_MARKET_ATTENDANCE_CSV_URL");
console.log(result);
// Returns: { success: true, attendanceRecordsCreated: 1254, ... }
```

---

## Troubleshooting

### Issue: "Fetch failed" or "URL not accessible"

**Solution:**
- Make sure your file URLs are publicly accessible
- Test the URL in a browser - it should download the file directly
- For Wix Media Manager, use the "Direct Link" not the "Share Link"

### Issue: "Vendor not found" during attendance import

**Solution:**
- Make sure vendors are imported FIRST
- Check that vendor names in the CSV match exactly (case-insensitive)
- The function matches by `VendorID` first, then by normalized vendor name

### Issue: "Invalid GeoJSON" error

**Solution:**
- Verify the GeoJSON file is valid JSON
- Check that it has a `features` array
- Make sure the file URL returns JSON, not HTML

### Issue: Import is slow or times out

**Solution:**
- The functions import in chunks of 50 items
- Large imports (like 1,254 attendance records) may take a few minutes
- Check the browser console for progress logs
- If it times out, try importing in smaller batches

### Issue: Duplicate entries

**Solution:**
- The functions check for existing items by title/ID
- If duplicates appear, they will be updated, not inserted
- Check the import results - `updated` count shows how many were updated vs inserted

---

## Expected Results

After successful import:

- ✅ **Vendors Collection:** 120 vendors
- ✅ **StallLayouts Collection:** 134 stalls with GeoJSON coordinates
- ✅ **POIs Collection:** 7 POIs (Restrooms, ATM, Music Area, Market Booth, Tables)
- ✅ **MarketAttendance Collection:** 1,254 attendance records across 12 weeks

---

## Next Steps

After importing:

1. **Test the Map:**
   - Navigate to your Map page
   - Select a date from the date picker
   - You should see vendors on stalls with colored icons
   - Empty stalls should show grey pins with stall IDs

2. **Verify Data:**
   - Check that vendors appear in the correct stalls
   - Verify POIs are in the right locations
   - Test filtering and search functionality

3. **Customize:**
   - Update vendor descriptions, websites, tags
   - Add more market dates
   - Adjust stall assignments as needed

---

## Need Help?

If you encounter issues:

1. Check the browser console for error messages
2. Review the import function return values - they include detailed error messages
3. Verify your collection field names match the expected schema
4. Ensure all required fields are present in your collections

---

## Collection Schema Reference

### Vendors Collection Required Fields:
- `title` (text) - Vendor name
- `vendorType` (text) - Vendor type
- `description` (text) - Optional
- `url` (text) - Optional
- `arraystring` (text) - Optional, comma-separated tags

### StallLayouts Collection Required Fields:
- `title` (text) - Stall ID (e.g., "A1", "B12")
- `geoJsonFeature` (text) - JSON string of GeoJSON feature

### POIs Collection Required Fields:
- `title` (text) - POI name
- `poiType` (text) - POI type
- `description` (text) - Optional
- `geoJsonFeature` (text) - JSON string of GeoJSON feature

### MarketAttendance Collection Required Fields:
- `marketDate` (date) - Market date
- `vendorRef` (reference) - Reference to Vendors collection
- `stallId` (text) - Stall identifier
- `status` (text) - Default: "Present"
- `title` (text) - Display title
