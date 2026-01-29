# Full Iframe Map Deployment Guide

## Overview

This guide covers the new **Full Iframe Architecture** for the Dubuque Farmers' Market interactive map. All UI controls (date selector, search bar, filter buttons) are now embedded directly in the HTML iframe, eliminating the need for separate Wix UI elements.

## Architecture Benefits

| Aspect | Before (Wix UI) | After (Full Iframe) |
|--------|-----------------|---------------------|
| **Initial Load** | ~550KB | ~300KB |
| **Design Labor** | 2-3 hours | 15-20 min |
| **Mobile Performance** | Good | Better |
| **Iteration Speed** | Slow (Wix Studio) | Fast (Code) |
| **Consistency** | Varies | Cohesive |

## Files

### New Files
- `src/public/vendor-map-full-ui.html` - Complete map with integrated UI

### Updated Files
- `src/pages/MAP.mggqp.js` - Simplified Velo code (data only)

## Deployment Steps

### Step 1: Add the HTML Component

1. Open your Wix site in the Editor
2. Navigate to the **MAP** page
3. **Delete all existing filter buttons** (if any):
   - `#readyToEatButton`
   - `#farmFreshProduceButton`
   - `#bakedGoodsSweetsButton`
   - etc.
4. **Delete the date picker/dropdown** (`#datepicker1`)
5. **Delete the search input** (`#searchInput`)
6. **Delete the clear all button** (`#clearAllButton`)

### Step 2: Configure the HTML Component

1. Select the HTML component (`#mapFrame`)
2. In the Properties panel, set the **Source** to:
   ```
   /vendor-map-full-ui.html
   ```
   (The file should be in your site's public folder)

3. Set the HTML component to **fill the entire content area**:
   - Width: 100%
   - Height: 100% (or use stretch to fill)
   - Margins: 0

### Step 3: Update Wix Studio File Structure

In your Wix Studio project:

1. Ensure `vendor-map-full-ui.html` is in the `public` folder
2. Sync the changes using `wix dev` or publish

### Step 4: Sync Code

The Velo page code (`MAP.mggqp.js`) is already simplified and will work with the new iframe.

## Testing Checklist

- [ ] Map loads on page open
- [ ] Date dropdown populates with market dates
- [ ] Date selection changes vendor display
- [ ] Search filters vendors in real-time
- [ ] Filter buttons highlight matching vendors
- [ ] Clear button resets all filters
- [ ] Find My Location button works
- [ ] Mobile touch interactions work smoothly
- [ ] Map zooms/pans correctly
- [ ] Vendor popups display correctly

## Design Customization

### Changing Colors

Edit the CSS variables in `vendor-map-full-ui.html`:

```css
:root {
    /* Primary Greens */
    --forest: #1a3d0c;      /* Deep forest */
    --sage: #4a6741;        /* Medium green */
    --moss: #7a9b6d;        /* Light green */
    
    /* Earthy Neutrals */
    --cream: #faf8f5;       /* Background */
    --sand: #e8e4dc;        /* Borders */
    --clay: #b8a88a;        /* Accents */
    
    /* Change these to match your brand */
}
```

### Adding/Removing Filter Buttons

Edit the filter buttons in the HTML:

```html
<div class="filters-grid" id="filters-grid">
    <!-- Add new button -->
    <button class="filter-btn" data-type="keyword" data-value="organic natural" data-category="produce">
        <i class="fa-solid fa-leaf"></i> Organic
    </button>
    
    <!-- Remove unwanted buttons by deleting their HTML -->
</div>
```

### Filter Button Types

| `data-type` | Description | Example `data-value` |
|-------------|-------------|---------------------|
| `vendorType` | Match vendor type exactly | `"Grower/Producer/Processor"` |
| `keyword` | Search multiple keywords | `"coffee espresso latte tea"` |
| `poiType` | Match POI type | `"Restroom"` |

## Troubleshooting

### Map Not Loading

1. Check browser console for errors
2. Verify the HTML file path is correct
3. Ensure the iframe ID matches (`#mapFrame`)

### Dates Not Populating

1. Check that `MarketDates2026` collection exists
2. Verify collection has date entries
3. Check Velo console for errors

### Vendors Not Showing

1. Verify `MarketAttendance` collection has records for selected date
2. Check that vendor references are properly linked
3. Confirm stall IDs match between collections

## Performance Tips

1. **Static Data Caching**: Stall layouts and POIs are cached after first load
2. **Debounced Search**: Search waits 300ms before filtering
3. **Lazy Marker Updates**: Only visible markers are updated on zoom
4. **Local Storage**: Map view is saved between sessions

## Mobile Optimization

The UI is designed mobile-first with:
- **Touch-optimized buttons**: Minimum 44px touch targets
- **Horizontal scroll filters**: Swipe through filter buttons
- **High contrast text**: Readable in bright sunlight
- **Responsive layout**: Adapts to screen size
- **Optimized loading**: ~45% smaller than Wix UI approach

## Support

For issues or questions:
1. Check browser console for error messages
2. Verify all collection data is properly formatted
3. Test with a simple date that has known vendor assignments
