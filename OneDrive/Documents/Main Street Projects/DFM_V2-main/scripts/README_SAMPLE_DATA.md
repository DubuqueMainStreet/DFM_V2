# Sample Data Generator for Dubuque Farmers' Market Map

This script generates realistic sample data for testing the vendor map feature.

## Generated Data

- **120 Vendors** - Diverse mix of produce, bakery, coffee, prepared food, artisan, and specialty vendors
- **Market Attendance Records** - 12 weeks of market dates with vendor assignments
- **200 Stall Layouts** - GeoJSON features for stall locations
- **6 POIs** - Points of Interest (parking, restrooms, seating, information, tokens)

## Usage

```bash
# Run the generator
node scripts/generateSampleData.js

# Output files will be created in scripts/output/
```

## Output Files

1. **vendors.csv** - Vendor roster for import
   - Columns: VendorID, Vendor, VendorType, Description, Website, Tags, DefaultStall
   - Use with `importVendorRoster()` function

2. **market_attendance.csv** - Market attendance records
   - Columns: VendorID, Vendor, StartDate, Stall, NumberOfAssignedDays
   - Use with `importStallAssignments()` function

3. **stall_layouts.geojson** - Stall geometry data
   - GeoJSON FeatureCollection with stall locations
   - Use with `importGeoJsonFeatures(geoJsonUrl, "StallLayouts")`

4. **pois.geojson** - Points of Interest
   - GeoJSON FeatureCollection with POI locations
   - Use with `importGeoJsonFeatures(geoJsonUrl, "POIs")`

5. **vendors.json** - JSON reference file (for manual import if needed)

## Importing into Wix

### Option 1: Using Backend Functions (Recommended)

1. **Upload CSV/GeoJSON files** to a publicly accessible URL (e.g., GitHub Gist, Google Drive, or Wix Media Manager)

2. **Call backend functions** from Wix Velo:
   ```javascript
   import { importVendorRoster, importStallAssignments, importGeoJsonFeatures } from 'backend/importData';
   
   // Import vendors
   await importVendorRoster('https://your-url.com/vendors.csv');
   
   // Import attendance (after vendors are imported)
   await importStallAssignments('https://your-url.com/market_attendance.csv');
   
   // Import stall layouts
   await importGeoJsonFeatures('https://your-url.com/stall_layouts.geojson', 'StallLayouts');
   
   // Import POIs
   await importGeoJsonFeatures('https://your-url.com/pois.geojson', 'POIs');
   ```

### Option 2: Manual Import via Wix Editor

1. **Vendors Collection:**
   - Open Wix Editor → Database → Collections → Vendors
   - Click "Import" → Upload `vendors.csv`
   - Map columns: Vendor → title, VendorType → vendorType, Description → description, Website → url, Tags → arraystring

2. **MarketAttendance Collection:**
   - Open MarketAttendance collection
   - Import `market_attendance.csv`
   - Map columns: StartDate → marketDate, Vendor → vendorRef (reference), Stall → stallId

3. **StallLayouts Collection:**
   - Open StallLayouts collection
   - Import `stall_layouts.geojson` manually or use the import function

4. **POIs Collection:**
   - Open POIs collection
   - Import `pois.geojson` manually or use the import function

## Data Structure

### Vendors Collection Fields
- `title` (text) - Vendor name
- `vendorType` (text) - One of: "Grower/Producer/Processor", "On-site Prepared Food Vendor", "Crafter/Artisan", "Occasional Vendor"
- `description` (text) - Vendor description
- `url` (text, optional) - Website URL
- `arraystring` (text) - Comma-separated keywords/tags

### MarketAttendance Collection Fields
- `marketDate` (date) - Market date
- `vendorRef` (reference) - Reference to Vendors collection
- `stallId` (text) - Stall identifier (e.g., "A1", "B3")

### StallLayouts Collection Fields
- `title` (text) - Stall ID (must match stallId from MarketAttendance)
- `geoJsonFeature` (text) - GeoJSON string with stall geometry

### POIs Collection Fields
- `title` (text) - POI name
- `poiType` (text) - Type: "PublicParkingArea", "VendorParkingArea", "Restroom", "SeatingArea", "Information", "Market Tokens"
- `description` (text) - POI description
- `geoJsonFeature` (text) - GeoJSON string with POI location

## Notes

- Market dates start from the next Saturday after today
- ~80% of vendors attend each week (simulating real attendance patterns)
- Some vendors have multiple stalls (10% chance)
- Stall IDs follow pattern: A1-A50, B1-B50, C1-C50, etc.
- All coordinates are centered around Dubuque Farmers Market location (42.5000, -90.6644)

## Customization

Edit `scripts/generateSampleData.js` to:
- Change number of vendors (default: 120)
- Adjust number of weeks (default: 12)
- Modify vendor types or categories
- Change stall layout pattern
- Add more POIs
