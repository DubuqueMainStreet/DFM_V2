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

### Filter Summary Display
When filters are active, show a summary bar below the filter controls:
```
Showing: Musicians | May 2nd | Pending (12 results)  [Clear All]
```

---

## Interactive Map

### High Priority
- [ ] Keyboard + screen reader support (ARIA roles, focus trap)
- [ ] Vendor list/sidebar view toggle
- [ ] Distinguish tap vs scroll on mobile

### Medium Priority
- [ ] Share/copy link to specific vendor
- [ ] Offline cache for market day (low signal areas)
- [ ] Print-friendly view
- [ ] Stall numbers on markers at high zoom

### Lower Priority
- [ ] Clustering at low zoom
- [ ] Light/dark theme toggle
- [ ] Multi-date comparison ("New this week")
- [ ] Favorites/starred vendors
- [ ] Full accessibility audit (axe/WAVE)

---

## Signup Forms
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
