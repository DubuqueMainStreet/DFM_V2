# Vendor Map Deployment Guide

## Overview
This guide walks you through deploying the Modern Agrarian vendor map to your Wix site. The map provides an interactive, mobile-first experience for visitors to navigate the Dubuque Farmers' Market.

## Prerequisites

✅ **Wix Collections Required:**
- `Vendors` - Vendor information (title, vendorType, description, url, arraystring)
- `MarketAttendance` - Links vendors to dates and stalls (marketDate, vendorRef, stallId)
- `StallLayouts` - Stall geometry data (title, geoJsonFeature)
- `POIs` - Points of Interest (title, poiType, description, geoJsonFeature)

✅ **Wix Page Elements Required:**
- HTML Component with ID: `mapFrame` (for the Leaflet map)
- Date Picker with ID: `datepicker1`
- Text Input with ID: `searchInput`
- Button with ID: `clearAllButton`
- Filter Buttons (see list below)

## Step-by-Step Deployment

### 1. Update Velo Page Code

The optimized Velo code is already in `src/pages/MAP.mggqp.js`. 

**In Wix Editor:**
1. Navigate to your Map page
2. Open the **Page Code** panel (Velo sidebar)
3. Copy the contents of `src/pages/MAP.mggqp.js`
4. Paste into the page code editor
5. Save

### 2. Set Up HTML Component

**In Wix Editor:**
1. On your Map page, add an **HTML Component** (if not already present)
2. Set the component ID to `mapFrame`
3. Open the HTML component settings
4. Copy the entire contents of `src/public/vendor-map-enhanced.html`
5. Paste into the HTML component code editor
6. Save

**Important:** The HTML component must be set to allow iframe communication. In Wix, HTML components automatically support postMessage communication.

### 3. Verify UI Elements

Ensure these elements exist on your Map page with the correct IDs:

**Required Elements:**
- `#datepicker1` - Date picker for selecting market dates
- `#searchInput` - Text input for vendor search
- `#clearAllButton` - Button to clear filters/search

**Filter Buttons (all optional but recommended):**
- `#readyToEatButton` - On-site Prepared Food Vendor filter
- `#farmFreshProduceButton` - Grower/Producer/Processor filter
- `#bakedGoodsSweetsButton` - Bakery keyword filter
- `#coffeeButton` - Coffee keyword filter
- `#snapEBTButton` - SNAP/EBT keyword filter
- `#informationButton` - Information POI filter
- `#specialEventButton` - Special Event POI filter
- `#marketMerchButton` - Market Merchandise POI filter
- `#restroomButton` - Restroom POI filter
- `#seatingButton` - Seating Area POI filter
- `#parkingButton` - Public Parking POI filter
- `#vendorParkingButton` - Vendor Parking POI filter
- `#marketTokensButton` - Market Tokens POI filter

### 4. Test Locally (Optional but Recommended)

```bash
# Install dependencies
npm install

# Start local Wix development server
wix dev
```

This allows you to test changes before deploying to production.

### 5. Verify Data Structure

**Vendors Collection Fields:**
- `title` (text) - Vendor name
- `vendorType` (text) - e.g., "Grower/Producer/Processor", "On-site Prepared Food Vendor"
- `description` (text) - Vendor description
- `url` (text) - Website URL (optional)
- `arraystring` (text) - Comma-separated tags/keywords

**MarketAttendance Collection Fields:**
- `marketDate` (date) - Market date
- `vendorRef` (reference to Vendors collection)
- `stallId` (text) - Stall identifier (e.g., "A1", "B3")

**StallLayouts Collection Fields:**
- `title` (text) - Stall ID (must match stallId from MarketAttendance)
- `geoJsonFeature` (text) - GeoJSON string with stall geometry

**POIs Collection Fields:**
- `title` (text) - POI name
- `poiType` (text) - Type (e.g., "Restroom", "PublicParkingArea", "SeatingArea")
- `description` (text) - POI description
- `geoJsonFeature` (text) - GeoJSON string with POI location/geometry

## Testing Checklist

- [ ] Map loads without errors
- [ ] Date picker updates map data
- [ ] Search functionality works
- [ ] Filter buttons highlight matching vendors/POIs
- [ ] Vendor popups display correctly
- [ ] Geolocation button works (requires HTTPS)
- [ ] Map is responsive on mobile devices
- [ ] Touch targets are easily tappable (48px+)
- [ ] Colors meet contrast requirements for bright sunlight

## Troubleshooting

### Map Not Loading
- Check browser console for errors
- Verify HTML component ID is `mapFrame`
- Ensure Leaflet.js CDN is accessible
- Check that postMessage communication is working

### No Vendors Showing
- Verify MarketAttendance collection has data
- Check that vendorRef relationships are properly set
- Ensure stallId values match StallLayouts titles
- Verify date picker is selecting valid market dates

### Styling Issues
- Clear browser cache
- Verify CSS is loading correctly
- Check for conflicting styles in global.css

### Geolocation Not Working
- Requires HTTPS (or localhost for development)
- User must grant location permissions
- Check browser console for permission errors

## Performance Optimization

The map is optimized for mobile performance:
- Static data (stalls, POIs) cached after first load
- Single-query date finding (replaces 12-week loop)
- Parallel data fetching with Promise.all
- Debounced search (400ms)
- Progressive rendering

## Modern Agrarian Color Palette

**Active States:**
- Background: `#2D5016` (Deep forest green)
- Text: `#FFFFFF` (White)

**Inactive States:**
- Background: `#FFFFFF` (Clean white)
- Text: `#2C2C2C` (Charcoal)

**Vendor Type Colors:**
- Grower/Producer/Processor: `#2D5016` (Forest green)
- On-site Prepared Food Vendor: `#8B4513` (Terracotta)
- Crafter/Artisan: `#5F7A3D` (Sage green)

## Support

For issues or questions:
1. Check browser console for errors
2. Review Wix Velo documentation
3. Verify data structure matches requirements
4. Test in Local Editor with `wix dev`

## Next Steps

After deployment:
1. Test on actual mobile devices in bright sunlight
2. Gather user feedback
3. Monitor performance metrics
4. Consider adding analytics tracking
5. Plan for future enhancements (offline mode, favorites, etc.)
