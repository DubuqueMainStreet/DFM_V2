# File Storage Recommendation for Sample Data Import

## 🎯 **Recommended: Wix Site Files** (Best Performance)

### Why Wix Site Files?

1. **CDN Performance:**
   - Files are served from Wix's global CDN
   - Optimized for static asset delivery
   - Fast access from anywhere in the world

2. **Purpose-Built:**
   - Designed specifically for static files (CSV, JSON, GeoJSON)
   - No unnecessary processing or transformations
   - Direct file access

3. **Easy Updates:**
   - Replace files easily when data changes
   - Version control friendly
   - No need to republish site

4. **Reliable URLs:**
   - Stable URLs that don't change
   - Direct download links
   - Works perfectly with `fetch()` in backend functions

5. **No CMS Overhead:**
   - Not stored in database collections
   - No query overhead
   - Pure file serving

---

## Comparison: Site Files vs Media Manager

| Feature | **Wix Site Files** ✅ | Wix Media Manager |
|---------|---------------------|-------------------|
| **Performance** | ⚡ Fastest (CDN optimized) | Fast (CDN) |
| **Purpose** | Static files | Images/media |
| **File Types** | CSV, JSON, GeoJSON, etc. | Images, videos |
| **URL Stability** | ✅ Stable | ✅ Stable |
| **Ease of Update** | ✅ Easy replace | ✅ Easy replace |
| **Access Method** | Direct URL | Direct URL |
| **Best For** | **Data files** | Media files |

**Verdict:** Both work, but **Site Files are better suited** for CSV/GeoJSON data files.

---

## How to Use Wix Site Files

### Step 1: Upload Files to Site Files

1. **In Wix Editor:**
   - Go to **Settings** → **Site Files** (or **Media** → **Site Files**)
   - Click **"Upload Files"**
   - Upload all 4 files:
     - `vendors.csv`
     - `market_attendance.csv`
     - `stall_layouts.json` (GeoJSON format, renamed to .json for Wix compatibility)
     - `pois.json` (GeoJSON format, renamed to .json for Wix compatibility)
   
   **Note:** Wix Media Manager doesn't support `.geojson` files, but GeoJSON is valid JSON. Use the `.json` versions of these files.

2. **Get the URLs:**
   - Click on each uploaded file
   - Copy the **"File URL"** or **"Direct Link"**
   - URLs will look like: `https://static.wixstatic.com/media/[hash]/vendors.csv`

### Step 2: Use URLs in Backend Functions

```javascript
import { importVendorRoster, importStallAssignments, importGeoJsonFeatures } from 'backend/importData';

export async function importAllSampleData() {
    // Use your Site Files URLs here
    const VENDORS_URL = "https://static.wixstatic.com/media/[your-hash]/vendors.csv";
    const ATTENDANCE_URL = "https://static.wixstatic.com/media/[your-hash]/market_attendance.csv";
    const STALLS_URL = "https://static.wixstatic.com/media/[your-hash]/stall_layouts.geojson";
    const POIS_URL = "https://static.wixstatic.com/media/[your-hash]/pois.geojson";
    
    const results = {};
    
    // Import vendors first
    results.vendors = await importVendorRoster(VENDORS_URL);
    
    // Import stalls and POIs (can be done in parallel)
    results.stalls = await importGeoJsonFeatures(STALLS_URL, "StallLayouts");
    results.pois = await importGeoJsonFeatures(POIS_URL, "POIs");
    
    // Import attendance last (requires vendors to exist)
    results.attendance = await importStallAssignments(ATTENDANCE_URL);
    
    return results;
}
```

---

## Alternative: Wix Media Manager

If you can't access Site Files, **Media Manager works too**:

### Steps:

1. **Upload to Media Manager:**
   - Go to **Media** → **My Uploads**
   - Upload the CSV/GeoJSON files
   - Click on each file → **"Get Link"** → **"Direct Link"**

2. **Use the URLs:**
   - Same process as Site Files
   - URLs will be similar: `https://static.wixstatic.com/media/...`

**Performance:** Nearly identical to Site Files (both use Wix CDN)

---

## ❌ NOT Recommended: Storing in CMS Collections

**Why NOT to store import files in CMS:**

1. **Performance Issues:**
   - Files stored as text fields in database
   - Requires database queries to access
   - Slower than direct file serving

2. **Complex Access:**
   - Need to query collection
   - Extract text from field
   - Parse the data
   - More error-prone

3. **Not Designed For:**
   - CMS collections are for structured data
   - Import files are static assets
   - Wrong tool for the job

4. **Size Limitations:**
   - Database fields have size limits
   - Large CSV/GeoJSON files may exceed limits
   - Site Files have much larger limits

---

## Performance Comparison

### Import Process Performance:

| Method | Fetch Time | Parse Time | Total |
|--------|-----------|------------|-------|
| **Site Files** | ~50-200ms | ~100-500ms | **Fastest** ⚡ |
| Media Manager | ~50-200ms | ~100-500ms | Fast |
| External CDN | ~100-500ms | ~100-500ms | Medium |
| CMS Collection | ~200-1000ms | ~100-500ms | **Slowest** 🐌 |

**Note:** Import is a one-time/occasional operation, so absolute performance isn't critical. But Site Files are still the best choice for:
- Cleaner code
- Easier maintenance
- Better organization
- Purpose-built for this use case

---

## Best Practice Workflow

1. ✅ **Upload files to Wix Site Files**
2. ✅ **Copy the direct URLs**
3. ✅ **Use URLs in backend import functions**
4. ✅ **Run import once (or when data updates)**
5. ✅ **Replace files in Site Files when data changes**

---

## Summary

**Use Wix Site Files** - It's the best option for:
- ✅ Best performance (CDN-optimized)
- ✅ Purpose-built for static files
- ✅ Easy to update
- ✅ Clean, simple URLs
- ✅ No database overhead

**Avoid CMS Collections** - Wrong tool for static files.
