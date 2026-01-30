# Dubuque Farmers Market 2026 Website Roadmap

Strategic project plan for polishing the Wix site and integrating with ManageMyMarket (MMM).

## Immediate Updates (Jan - Feb)

**Focus:** Updating dates (May 2 opener), Hero text, and checking MMM links.

- [ ] Update season dates throughout site: May 2, 2026 – Oct 31, 2026
- [ ] Update market opener date (May 2, 2026) in hero section and key pages
- [ ] Refresh hero text with community-focused, welcoming tone
- [ ] Verify all MMM links are current and functional
- [ ] Test MMM login links for vendors
- [ ] Check MMM application links for vendors, musicians, and non-profits
- [ ] Update location references to Upper Main District (Iowa St, 11th, 12th, 13th)
- [ ] Review and fix any broken external links

## Content Refresh (March)

**Focus:** Vendor Handbook summary, Musician application routing, FAQ updates.

- [ ] Create Vendor Handbook summary page with key highlights
- [ ] Add direct link to full Vendor Handbook (MMM or external)
- [ ] Set up musician application routing/funnel
- [ ] Set up non-profit application routing/funnel
- [ ] Update FAQ section with 2026 season information
- [ ] Add FAQ entries for common vendor questions
- [ ] Add FAQ entries for guest/market-goer questions
- [ ] Review and update all copy for community-focused, welcoming tone
- [ ] Ensure navigation clearly separates Guest, Vendor, and Musician/Non-Profit paths

## Technical Integration (April)

**Focus:** Finalize Custom Leaflet Map & Mobile Optimization, testing the "Market Status" Velo script.

- [ ] Finalize Custom Leaflet Map & Mobile Optimization
- [ ] Test map functionality and mobile responsiveness
- [ ] Implement touch event handling and "Find My Location" feature
- [ ] Ensure large tap targets for mobile users
- [ ] Develop and test "Market Status" Velo script
- [ ] Integrate Market Status display on homepage/key pages
- [ ] Test vendor grouping logic for contiguous stalls (pill markers)
- [ ] Implement category filtering with postMessage communication
- [ ] Test CSV import process for MarketAttendance collection
- [ ] Test cross-browser compatibility
- [ ] Perform accessibility check on embedded elements
- [ ] Optimize page load times with embedded content

## Live Launch (May 2)

**Focus:** Final mobile check, social links.

- [ ] Complete mobile responsiveness audit
- [ ] Test all functionality on mobile devices (iOS and Android)
- [ ] Verify touch interactions work properly
- [ ] Check mobile navigation menu functionality
- [ ] Update and verify all social media links
- [ ] Test social sharing functionality
- [ ] Final content review for typos and accuracy
- [ ] Verify all dates and times are correct
- [ ] Test all forms and application links one final time
- [ ] Confirm MMM integration is fully operational
- [ ] Set up analytics tracking (if applicable)
- [ ] Prepare launch announcement materials

---

## Pre-Season Testing (Before 2026 Data)

**Focus:** Test map functionality before vendor applications are complete.

### Standalone Test Mode
- [ ] Open `test-data/map-standalone-test.html` directly in browser (no Wix needed)
- [ ] Click "Load Sample Data" to verify map rendering
- [ ] Test filter buttons (Produce, Ready to Eat, Coffee)
- [ ] Test search functionality
- [ ] Test "Find My Location" geolocation button
- [ ] Verify vendor popups display correctly
- [ ] Test on mobile device (responsive design)

### Wix Collection Setup (Required for Live Map)
- [ ] Create `StallLayouts` collection in Wix CMS
- [ ] Create `POIs` collection in Wix CMS
- [ ] Import sample stall layouts from `test-data/sample-stall-layouts.json`
- [ ] Import sample POIs from `test-data/sample-pois.json`
- [ ] Create sample vendors in `Vendors` collection
- [ ] Create sample attendance records for test date

### Test Data Files Available
- `test-data/sample-stall-layouts.json` - 15 sample stall positions
- `test-data/sample-pois.json` - Parking, restrooms, info booth, seating
- `test-data/sample-vendors.json` - 8 sample vendors with types/descriptions
- `test-data/sample-attendance.json` - Sample attendance for May 2, 2026
- `test-data/map-standalone-test.html` - Standalone test page (no Wix)

---

## Notes

- **Season:** May 2, 2026 – Oct 31, 2026
- **Location:** Upper Main District (Iowa St, 11th, 12th, 13th)
- **Key Principle:** Wix site serves as a "concierge" that frames MMM tools and provides information
- **Technical Stack:** Wix Studio + Velo (Frontend) + Node.js (Backend JSW)
- **Map Strategy:** Custom Leaflet.js implementation in HTML iFrame (`#mapFrame`) with mobile-first design
- **Data Flow:** CSV Exports from MMM → Processed by backend → Stored in Wix Collections → Fetched by Velo → Sent to iFrame via postMessage
