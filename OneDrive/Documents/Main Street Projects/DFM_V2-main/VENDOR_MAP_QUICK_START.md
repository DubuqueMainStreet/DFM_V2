# Vendor Map Quick Start Checklist

## Pre-Deployment Checklist

### ✅ Code Files Ready
- [x] `src/pages/MAP.mggqp.js` - Optimized Velo code
- [x] `src/public/vendor-map-enhanced.html` - Enhanced HTML map component
- [x] `src/public/vendors.json` - Sample vendor data (for reference)

### ✅ Git Repository
- [x] Code committed to repository
- [x] Pushed to GitHub: `https://github.com/DubuqueMainStreet/DFM_V2.git`
- [x] Branch: `main` (tracked by Wix)

## Wix Site Setup

### Step 1: Verify Collections Exist
Open Wix Editor → Database → Collections

**Required Collections:**
- [ ] `Vendors` - Has fields: title, vendorType, description, url, arraystring
- [ ] `MarketAttendance` - Has fields: marketDate, vendorRef, stallId
- [ ] `StallLayouts` - Has fields: title, geoJsonFeature
- [ ] `POIs` - Has fields: title, poiType, description, geoJsonFeature

### Step 2: Update Page Code
1. [ ] Navigate to Map page in Wix Editor
2. [ ] Open Velo sidebar → Page Code
3. [ ] Copy contents of `src/pages/MAP.mggqp.js`
4. [ ] Paste and save

### Step 3: Update HTML Component
1. [ ] Find HTML component with ID `mapFrame` (or create new one)
2. [ ] Set component ID to `mapFrame`
3. [ ] Copy entire contents of `src/public/vendor-map-enhanced.html`
4. [ ] Paste into HTML component code
5. [ ] Save

### Step 4: Verify UI Elements
Check that these elements exist on the Map page:

**Required:**
- [ ] Date Picker (`#datepicker1`)
- [ ] Search Input (`#searchInput`)
- [ ] Clear Button (`#clearAllButton`)

**Filter Buttons (recommended):**
- [ ] Ready to Eat (`#readyToEatButton`)
- [ ] Farm Fresh Produce (`#farmFreshProduceButton`)
- [ ] Baked Goods (`#bakedGoodsSweetsButton`)
- [ ] Coffee (`#coffeeButton`)
- [ ] SNAP/EBT (`#snapEBTButton`)
- [ ] Information (`#informationButton`)
- [ ] Special Event (`#specialEventButton`)
- [ ] Market Merch (`#marketMerchButton`)
- [ ] Restroom (`#restroomButton`)
- [ ] Seating (`#seatingButton`)
- [ ] Parking (`#parkingButton`)
- [ ] Vendor Parking (`#vendorParkingButton`)
- [ ] Market Tokens (`#marketTokensButton`)

## Testing

### Local Testing (Recommended)
```bash
# In project directory
npm install
wix dev
```

### Production Testing
1. [ ] Publish site
2. [ ] Test on desktop browser
3. [ ] Test on mobile device (preferably in bright sunlight)
4. [ ] Verify all features:
   - [ ] Map loads
   - [ ] Date picker works
   - [ ] Search works
   - [ ] Filters work
   - [ ] Popups display
   - [ ] Geolocation works (HTTPS required)

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Map doesn't load | Check HTML component ID is `mapFrame` |
| No vendors showing | Verify MarketAttendance has data for selected date |
| Filters don't work | Check button IDs match exactly (case-sensitive) |
| Geolocation fails | Requires HTTPS or localhost |
| Styling looks wrong | Clear browser cache, check CSS loading |

## Performance Notes

- First load: ~2-3 seconds (fetches all data)
- Subsequent loads: <1 second (uses cache)
- Mobile optimized: 48px+ touch targets
- High contrast: Designed for bright sunlight visibility

## Color Reference

**Modern Agrarian Palette:**
- Deep Green: `#2D5016` (active buttons, primary vendor type)
- Terracotta: `#8B4513` (prepared food vendors)
- Sage Green: `#5F7A3D` (artisan vendors)
- Clean White: `#FFFFFF` (backgrounds)
- Charcoal: `#2C2C2C` (text)

## Next Steps After Deployment

1. **Monitor Performance**
   - Check page load times
   - Monitor mobile usage
   - Track user interactions

2. **Gather Feedback**
   - User testing sessions
   - Analytics review
   - Accessibility audit

3. **Future Enhancements**
   - Offline mode
   - Favorites/bookmarks
   - Push notifications
   - Social sharing

## Support Resources

- **Wix Velo Docs:** https://www.wix.com/velo/reference
- **Leaflet.js Docs:** https://leafletjs.com/reference.html
- **GitHub Repo:** https://github.com/DubuqueMainStreet/DFM_V2

---

**Ready to deploy?** Follow the steps above, then test thoroughly before going live!
