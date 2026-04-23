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

## Tooling / dependencies (post-launch)

- [ ] **React 16 devDep**: `package.json` pins `react@16.14.0` as a
      devDependency. No direct import from repo source uses React;
      `npm ls react` shows only this top-level entry. Historically this
      was required as a peer by an older `@wix/cli` version. Verify
      whether `@wix/cli@^1.1.165` still needs it by (a) removing the
      entry, (b) running `npm install && npx wix dev && npm run lint`,
      (c) checking for peer-dep warnings. If clean, drop it. Otherwise
      keep it and add a `// required by @wix/cli peer` annotation via a
      `README` bullet (strict JSON can't carry inline comments).
- [ ] **ESLint 9 + flat config**: currently on `eslint@^8.25.0`. ESLint
      8 is end-of-life. Migration:
      1. Replace `.eslintrc*` with a single `eslint.config.js` flat
         config.
      2. Update `@wix/eslint-plugin-cli` to a version compatible with
         ESLint 9 (check the plugin's changelog first — if it doesn't
         support flat config yet, delay).
      3. Run `npx @eslint/migrate-config .eslintrc*` as a starting
         point, then fix any plugin-specific diffs.
      4. Verify `npm run lint` still passes on every Velo page.

## Testing (post-launch)

Velo page code can't run under Jest (Wix runtime-only), but pure helpers
and Node scripts can. Proposed first iteration:

- [ ] Add Vitest to devDependencies (modern, ESM-friendly, no config
      overhead) and a `npm run test` script.
- [ ] Unit-test pure helpers in `src/backend/formUtils.web.js`:
      - `validateEmail('foo@bar.com')` → `true`
      - `validateEmail('not-an-email')` → `false`
      - `validateEmail('')` / `null` / `undefined` → `false`
      - `formatDate(new Date('2026-05-02'))` matches `"May 2, 2026"`.
- [ ] Unit-test pure helpers extracted from
      `scripts/generateMarketTestData.js`:
      - Date label formatting ("May 2nd").
      - Vendor-to-stall assignment mapping round-trips.
- [ ] Unit-test the `featureToLatLng` helper (post-launch: lift it out
      of the iframe HTML into a shared `src/public/mapGeometry.js` so
      it's importable from tests).
- [ ] Convert `docs/TESTING.md` manual checklists into a dated
      pre-release QA spreadsheet with pass/fail columns.
