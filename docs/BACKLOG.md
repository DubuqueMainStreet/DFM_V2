# Backlog — Future Improvements

Items not blocking the 2026 season launch but worth tracking.

---

## Admin Dashboard (Specialty Requests)

### Quick Wins
- [ ] Show results count ("Showing 12 of 28 assignments")
- [ ] Add "Clear All Filters" button
- [ ] Make email addresses clickable (`mailto:`)
- [ ] Add "Copy Email" button in repeater items
- [ ] Default status filter to "Pending" on page load
- [ ] Add visual confirmation (color flash) on status change

### Larger Improvements
- [ ] Delete functionality for individual assignments
- [ ] Bulk approve/reject operations
- [ ] Calendar view for visual scheduling
- [ ] Conflict detection for location assignments
- [ ] Export schedule to CSV/PDF
- [ ] Admin notes field per assignment
- [ ] Search by name/email/organization

### Consolidation (post-2026 launch)
- [ ] Deprecate `src/pages/ADMIN-Schedule-Management.ais9x.js` — duplicates a subset of the richer `Specialty Requests.k6g1g.js` admin. Remove the page from the Wix Editor (or redirect it), then delete the file. Marked as DEPRECATED in its header comment; do not add features there.

### Filter Summary Display
When filters are active, show a summary bar below the filter controls:
```
Showing: Musicians | May 2nd | Pending (12 results)  [Clear All]
```

---

## Interactive Map

### C8 — Post-launch polish (tracked from 2026 repo audit plan)

#### Accessibility (High Priority)
- [ ] Add `role="application"` + `aria-roledescription="map"` on the Leaflet container
- [ ] Keyboard nav: Tab through vendor markers in reading order; Enter/Space opens popup; Esc closes
- [ ] Focus trap inside popup while open; return focus to marker on close
- [ ] Screen reader-friendly vendor list sidebar (toggle-able, announces via `aria-live="polite"`)
- [ ] Pass an axe-core / WAVE scan with zero critical violations
- [ ] Ensure popup colors meet WCAG AA contrast (some vendor-type colors are borderline)

#### Marker Clustering (Medium Priority)
- [ ] Integrate `leaflet.markercluster` for zoom levels < 17
- [ ] Cluster only vendors (leave POIs always visible)
- [ ] Disable clustering on initial fit-to-market view

#### Shareable URL State (Medium Priority)
- [ ] Reflect selected date, filter, and open vendor in the iframe URL as query params
- [ ] Parent reads params on load and postMessages the initial state to the iframe
- [ ] "Share this vendor" button in popup copies a deep link

#### Mobile / UX
- [ ] Distinguish tap vs scroll on mobile (handle `touchmove` threshold before opening popups)
- [ ] Stall numbers on vendor markers at high zoom
- [ ] Print-friendly view
- [ ] Offline cache for market day (low-signal areas — Service Worker)

#### Lower Priority
- [ ] Light/dark theme toggle
- [ ] Multi-date comparison ("New this week")
- [ ] Favorites / starred vendors
- [ ] Vendor list/sidebar view toggle (complements the a11y sidebar above)

---

## Signup Forms
- [ ] Remove the unused "SIGNUP - Special Event" page from the Wix Editor. The Velo file `src/pages/SIGNUP - Special Event.holpu.js` is a no-op stub with a deprecation marker — once the page itself is deleted in the Editor, re-pull the site and the file will disappear.
- [ ] Fix NFP form duplicate `onItemReady` handler registration
- [ ] Email format validation
- [ ] Phone number format validation
- [ ] Duplicate email detection before submission
- [ ] Loading spinner during submission
- [ ] Confirmation dialog before submission

---

## Infrastructure
- [ ] Service Worker for map tile caching
- [ ] Analytics tracking (filter usage, search terms, popular vendors)
- [ ] Pagination for collections exceeding 1000 records
- [ ] Split `Specialty Requests.k6g1g.js` (~2,857 lines) into smaller modules
