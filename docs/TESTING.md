# Testing Checklists

Consolidated testing checklists for all features.

---

## Signup Forms (All Three)

### Basic Flow
- [ ] Fill all required fields and submit
- [ ] Verify `SpecialtyProfiles` record created with correct data
- [ ] Verify `WeeklyAssignments` records created (one per selected date)
- [ ] Verify reference fields show names/dates (not UUIDs or "Untitled")
- [ ] Test with optional fields empty
- [ ] Test file upload (musician form)
- [ ] Verify form resets after successful submission

### Validation
- [ ] Submit with empty required fields → error message
- [ ] Submit without selecting dates → error message
- [ ] Test with special characters in text fields

### Date Selection
- [ ] Dates load correctly and sorted chronologically
- [ ] Availability colors display (green/orange/red)
- [ ] Select multiple dates → all save correctly
- [ ] Volunteer form: change role → availability refreshes

### CRM & Email
- [ ] CRM contact created in Wix Dashboard → Contacts
- [ ] Approve a submission → approval email received
- [ ] Reject a submission → rejection email received
- [ ] Email contains correct variables (name, date, type)

---

## Admin Dashboard

### Navigation & Filtering
- [ ] Tab switching works (Musicians, Volunteers, Non-Profits)
- [ ] Date filter populates with all market dates
- [ ] Status filter works (Pending, Approved, Rejected, All)
- [ ] Filters can be combined

### Status Management
- [ ] Approve button works → status changes, email sent
- [ ] Reject button works → status changes, email sent
- [ ] Status update preserves all data fields (no field loss)
- [ ] Buttons hide when status already matches

### Location Assignment
- [ ] Location dropdown visible for musicians only
- [ ] Location updates preserve all other fields
- [ ] Location hidden for volunteers and non-profits

### Manual Entry
- [ ] Manual Entry button opens form
- [ ] Type selection shows/hides relevant fields
- [ ] Date repeater shows availability colors
- [ ] Submit creates SpecialtyProfile + WeeklyAssignments
- [ ] Cancel closes form without saving
- [ ] New entry appears in dashboard after submit

---

## Market Calendar

### Display
- [ ] All 27 dates display correctly
- [ ] Month tabs filter dates correctly (May–October)
- [ ] Coverage counts match actual approved assignments
- [ ] Status colors reflect coverage (green/yellow/red)

### Interaction
- [ ] Expand/collapse works per date
- [ ] Statistics update when switching months
- [ ] Loading indicator shows during fetch

### Data Accuracy
- [ ] Musician count matches approved musician assignments
- [ ] Volunteer count matches approved volunteer assignments
- [ ] NFP count matches approved NFP assignments
- [ ] Only approved assignments counted (not pending/rejected)

---

## Interactive Map

### Data Loading
- [ ] Map loads with date selector populated
- [ ] Vendor markers appear for selected date
- [ ] Stall polygons render correctly
- [ ] POIs display with correct icons
- [ ] Date change loads new vendor data

### Interaction
- [ ] Search filters vendors by name/description
- [ ] Category filters work (Ready to Eat, Farm Fresh, etc.)
- [ ] Vendor popup opens on click with correct info
- [ ] Directions link works in popup
- [ ] Prev/Next navigation in popups
- [ ] Focus mode dims other markers when popup open
- [ ] "Fit market" button works

### Geolocation
- [ ] "Locate me" button triggers browser permission
- [ ] User location marker appears
- [ ] Accuracy circle displays (capped at 45m)
- [ ] Error message on denied/unavailable

### Mobile
- [ ] Touch interactions work properly
- [ ] Tap targets are large enough (44px min)
- [ ] Map doesn't accidentally open popups while scrolling
- [ ] Controls are accessible on small screens

### Cross-Browser
- [ ] Chrome (desktop + mobile)
- [ ] Safari (desktop + iOS)
- [ ] Firefox
- [ ] Edge

### Pre-launch Cross-Browser QA Matrix (2026 season)

Run this checklist end-to-end on every listed browser/device before
flipping the site to production. Record tester name, date, and "PASS /
FAIL / SKIPPED" in the rightmost column. Any FAIL blocks launch.

| # | Check | iOS Safari (latest) | Android Chrome (latest) | Desktop Safari (macOS) | Desktop Firefox | Desktop Chrome | Desktop Edge |
|---|---|---|---|---|---|---|---|
| 1 | Map iframe loads without console errors |   |   |   |   |   |   |
| 2 | Date dropdown populates with 2026 Saturdays |   |   |   |   |   |   |
| 3 | Switching dates updates vendor markers |   |   |   |   |   |   |
| 4 | Vendor popup title/description render without HTML artifacts |   |   |   |   |   |   |
| 5 | Category filter buttons highlight selected state |   |   |   |   |   |   |
| 6 | Search box filters vendors live |   |   |   |   |   |   |
| 7 | "Locate me" works (permission prompt → blue dot + accuracy ring) |   |   |   |   |   |   |
| 8 | Denying location shows friendly error (no silent failure) |   |   |   |   |   |   |
| 9 | Tap on marker opens popup (no accidental scroll-to-popup on mobile) |   |   |   |   |   |   |
| 10 | Prev/Next vendor navigation in popup |   |   |   |   |   |   |
| 11 | Directions link opens Google Maps in a new tab |   |   |   |   |   |   |
| 12 | `?testData=1` URL override still shows the red "Test Data" badge |   |   |   |   |   |   |
| 13 | Pinch-zoom and two-finger pan work (mobile only) |   |   |   |   |   |   |
| 14 | Fit-market button re-frames the market bounds |   |   |   |   |   |   |
| 15 | Reduced-motion: animations respect `prefers-reduced-motion` |   |   |   |   |   |   |
| 16 | No mixed-content warnings in DevTools |   |   |   |   |   |   |

Coverage goals per the [2026-Roadmap.md](../2026-Roadmap.md): primary
audience is mobile Safari + Chrome. Desktop Firefox/Edge are secondary
but must not throw console errors.

### Known browser-specific gotchas

- **iOS Safari:** historically blocks `navigator.geolocation` inside
  iframes. Parent-handled geolocation via `wixWindowFrontend` mitigates
  this — verify the blue dot actually appears (see
  `docs/MAP_GUIDE.md → Geolocation Workaround`).
- **Firefox:** does not allow `L.marker` CSS to inherit `will-change`;
  flag any jitter on marker hover.
- **Desktop Safari:** occasional 1px rendering glitch on the map legend
  backdrop — cosmetic, not a blocker.

---

## Backend / CMS

### Data Integrity
- [ ] All queries use `.limit(1000)` or paginate via `hasNext()/next()` (not default 50)
- [ ] `wixData.update()` fetches full record first
- [ ] Status values are consistent ("Pending", "Approved", "Rejected")
- [ ] `MarketDates2026` has `title` field populated (27 records)
- [ ] `musicianType` and `preferredLocation` are Text fields (not Tag)

### Email Notifications
- [ ] Template IDs correct (`V9e2eMj` approved, `V9e3Agb` rejected)
- [ ] Contact created with `allowDuplicates: true`
- [ ] Email verification prevents sending to wrong recipient
- [ ] Subscription status set to `NOT_SET`
- [ ] Deduplication prevents rapid duplicate sends

### Import Pipeline
- [ ] Vendor roster CSV import works
- [ ] GeoJSON stall layout import works
- [ ] GeoJSON POI import works
- [ ] Market attendance CSV import works
