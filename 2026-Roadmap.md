# Dubuque Farmers Market 2026 Website Roadmap

Strategic project plan for polishing the Wix site and integrating with ManageMyMarket (MMM).

**Last Updated:** April 23, 2026  
**Season Opens:** May 2, 2026  
**Days Until Launch:** 9

---

## Phase 1: Critical Updates (March 1–15) — URGENT

**Focus:** Fix everything a visitor sees TODAY. The live site still says "2025."

- [ ] **Update all 2025 references to 2026** (hero section, body copy, any date mentions)
- [ ] Update market opener date to **May 2, 2026** in hero section and key pages
- [ ] Update hero text — remove 2025 "new seating fixtures" announcement, replace with 2026 season messaging
- [ ] Refresh hero copy with community-focused, welcoming tone + clear "Every Saturday 7am–12pm, May–October" CTA
- [ ] Verify all existing external links are not broken
- [ ] Update location references to **Upper Main District (Iowa St, 11th–13th)**
- [ ] Add ManageMyMarket (MMM) vendor application links to GET INVOLVED page
- [ ] Add MMM application links to a prominent homepage section
- [ ] Test all MMM links work correctly (vendor login, new applications, musician/NFP)

## Phase 2: Content & Vendor Resources (March 15–31)

**Focus:** Vendor Handbook, application checklist, and content that drives visitors to MMM.

### Vendor Application Flow
- [ ] Create "Become a Vendor" section/page with step-by-step application checklist:
  1. Visit ManageMyMarket.com
  2. Create an account / Log in
  3. Complete your vendor profile
  4. Select your market dates
  5. Upload required documents (insurance, licenses)
  6. Submit and await approval
- [ ] Add clear CTAs: "Apply Now" buttons linking to MMM
- [ ] Add separate paths for: Vendors, Musicians, Non-Profits, Volunteers

### Vendor Handbook
- [ ] Upload Vendor Handbook PDF to Wix Media Manager
- [ ] Add download button on GET INVOLVED or dedicated page
- [ ] Add 3–5 key callout highlights from the handbook (market hours, rules, setup/teardown, etc.)

### Content Refresh
- [ ] HOME page — update hero, sections, CTAs for 2026
- [ ] ABOUT US — refresh story, add 2026 season info
- [ ] GET INVOLVED — comprehensive rewrite with MMM links, handbook, checklist
- [ ] EVENTS — update with 2026 event schedule or "Coming Soon"
- [ ] CONTACT — verify contact info is current
- [ ] DONATE — refresh donation messaging for 2026
- [ ] FAQ section — add vendor questions, market-goer questions, 2026 specifics
- [ ] Ensure navigation clearly separates Guest, Vendor, and Musician/NFP/Volunteer paths

## Phase 3: Technical & Map (April 1–20)

**Focus:** Finalize map for production, fix bugs, mobile optimization.

### Map Launch Prep
- [ ] Switch `USE_TEST_DATA_DEFAULT` from `true` to `false` in `MAP.mggqp.js`
- [ ] Import real stall layouts into `StallLayouts` collection
- [ ] Import real POIs into `POIs` collection
- [ ] Test map with real CMS data end-to-end
- [ ] Test mobile responsiveness and touch interactions
- [ ] Test "Find My Location" geolocation feature
- [ ] Verify vendor popups display correctly with real data
- [ ] Cross-browser testing (Chrome, Safari, Firefox, Edge)

### CMS Configuration
- [ ] Add `title` field to `MarketDates2026` collection in Wix CMS
- [ ] Run `populateDateTitles.web.js` to populate title fields
- [ ] Run `fixSaturdayDates.jsw` to ensure 27 Saturdays are present
- [ ] Verify `musicianType` and `preferredLocation` are Text fields (not Tag)
- [ ] Test reference field displays show names/dates, not UUIDs

### Form Testing
- [ ] Test Musician signup → CRM → Email end-to-end
- [ ] Test Volunteer signup → CRM → Email end-to-end
- [ ] Test NFP signup → CRM → Email end-to-end
- [ ] Test Admin dashboard approve/reject workflow
- [ ] Verify email notifications send correctly

### Bug Fixes (Done in Code)
- [x] Fix `diagnosticCheck.jsw` line 403: `approved.items.length` → `approved.length` (verified Apr 23, 2026)
- [x] Fix `importData.jsw` / `dataParse.gtlkj.js` field-name mismatch — page now uses `result.totalCount` (Apr 23, 2026)

## Phase 4: Launch Readiness (April 20–May 1)

**Focus:** Final polish, mobile audit, social links, security.

### Security Hardening (P0, launch-blocking)
- [ ] Secure `post_sendMissingApprovalEmailsBackend` with secret-header auth (Wix Secrets Manager)
- [ ] Replace wildcard `permissions.json` with per-file owner-only overrides on imports, diagnostics, manual entry
- [ ] Strip stack traces from HTTP error responses
- [ ] Restrict map iframe `postMessage` target to production Wix origin instead of `"*"`
- [ ] Add `escapeHtml()` to vendor/POI popup strings in `vendor-map-full-ui.html`

### Mobile + Cross-browser
- [ ] Complete mobile responsiveness audit (all pages)
- [ ] Test all functionality on mobile devices (iOS and Android)
- [ ] Verify touch interactions on map work properly
- [ ] Check mobile navigation menu functionality
- [ ] Desktop Firefox + Safari map test (never verified)

### Content + integration
- [ ] Update and verify all social media links
- [ ] Test social sharing functionality
- [ ] Final content review for typos and accuracy
- [ ] Verify all dates and times are correct
- [ ] Test all forms and application links one final time
- [ ] Confirm MMM integration is fully operational
- [ ] Set up analytics tracking (if applicable)
- [ ] Prepare launch announcement materials

---

## Notes

- **Season:** May 2, 2026 – Oct 31, 2026 (27 Saturdays)
- **Location:** Upper Main District (Iowa St, 11th, 12th, 13th)
- **Key Principle:** Wix site serves as a "concierge" that frames MMM tools and provides information
- **Technical Stack:** Wix Studio + Velo (Frontend) + Node.js (Backend JSW)
- **Map Strategy:** Custom Leaflet.js implementation in HTML iFrame (`#mapFrame`) with mobile-first design
- **Data Flow:** CSV Exports from MMM → Processed by backend → Stored in Wix Collections → Fetched by Velo → Sent to iFrame via postMessage
- **Vendor Applications:** All handled through ManageMyMarket.com — site directs visitors there
