# Admin Dashboard & Schedule Management

**Status:** Code complete and production-ready  
**Primary File:** `src/pages/Specialty Requests.k6g1g.js` (~2,857 lines)  
**Secondary File:** `src/pages/ADMIN-Schedule-Management.ais9x.js` (438 lines)

---

## Overview

Unified admin dashboard for managing musician, volunteer, and non-profit schedules. Supports filtering, status management, manual entry, location assignment, and email diagnostics.

## Status Flow

```
Pending → Approved (final)
   ↓
Rejected (end of workflow)
```

- **Pending** — New submission, awaiting review
- **Approved** — Admin approved (triggers email notification)
- **Rejected** — Admin rejected (triggers email notification)

## Required UI Elements

### Navigation Tabs
- `#tabMusicians` — Switch to Musicians view
- `#tabVolunteers` — Switch to Volunteers view
- `#tabNonProfits` — Switch to Non-Profits view

### Filters
- `#filterDate` — Dropdown, filter by market date (auto-populated)
- `#filterStatus` — Dropdown, filter by status (Pending, Approved, Rejected, All)
- `#filterLocation` — Dropdown, filter by assigned location (All Locations, Unassigned, Default, 13th Street, Food Court, 10th & Iowa St). Options are populated by code; add a **Dropdown** in the Wix Editor and set its ID to `filterLocation`.

### Statistics (Optional)
- `#statsBar` — **Quick stats** text: "Pending: 12  |  Approved: 5  |  Rejected: 3" for the current filtered view (recommended)
- `#statTotal` — Total count (optional; also updated by code)
- `#statPending` — Pending count (optional)
- `#statApproved` — Approved count (optional)
- `#statRejected` — Rejected count (optional)

### Content Area
- `#assignmentsContainer` — Container for assignment list
- `#assignmentsRepeater` — Repeater displaying assignments
- `#loadingIndicator` — Loading spinner (initially hidden)

### Messages
- `#msgSuccess` — Success messages (initially hidden)
- `#msgError` — Error messages (initially hidden)

### Repeater Item Elements
- `#itemName` — Text, organization/person name
- `#itemDate` — Text, market date
- `#itemContact` — Text, contact info (email/phone)
- `#itemDetails` — Text, type-specific details
- `#itemStatus` — Dropdown/Text, current status
- `#itemLocation` — Dropdown/Text, assigned location (musicians only, auto-hidden for others)
- `#btnApprove` — Button, approve assignment
- `#btnReject` — Button, reject assignment

## Admin Workflow

1. **Review** — Filter by type (tab), date, status, **location**, or search (name/org/contact)
2. **Approve/Reject** — Click action buttons or use status dropdown
3. **Assign Location** — Musicians only, via dropdown (Location A/B/C, Default, Unassigned)
4. **Email Sent** — Automatically on approve/reject (see EMAIL_AND_CRM.md)

### Location Assignment
- **Musicians:** Location dropdown visible (Location A = 13th Street, Location B = Food Court, Location C = 10th & Iowa St)
- **Volunteers:** Hidden — role determines location
- **Non-Profits:** Hidden — single booth area

## Type-Specific Display
- **Musicians:** Type, genre, duration, tech needs, preferred location
- **Volunteers:** Role, shift preference
- **Non-Profits:** Type, website

---

## Manual Entry (Hard Copy Submissions)

Allows admins to enter paper form submissions. All manual entries start as "Pending."

### Manual Entry UI Elements

#### Toggle
- `#btnManualEntry` — Button, opens form (label: "Manual Entry")

#### Container (hidden by default)
- `#manualEntryContainer` — Container, set height to "Auto" or "Fit to Content"

#### Common Fields
- `#manualEntryType` — Dropdown (Musician, Volunteer, Non-Profit)
- `#manualEntryName` — Text Input (required)
- `#manualEntryContactName` — Text Input (optional, contact person name)
- `#manualEntryEmail` — Text Input (required)
- `#manualEntryPhone` — Text Input (required)
- `#manualEntryBio` — Text Area (optional)
- `#manualEntryWebsite` — Text Input (optional)

#### Section Titles (shown/hidden based on type)
- `#manualEntryMusicianTitle` — Heading for musician fields
- `#manualEntryVolunteerTitle` — Heading for volunteer fields
- `#manualEntryNonprofitTitle` — Heading for non-profit fields
- `#manualEntryDateTitle` — Heading for date selection

#### Musician Fields (shown when type = Musician)
- `#manualEntryMusicianType` — Dropdown
- `#manualEntryLocation` — Dropdown
- `#manualEntryDuration` — Dropdown
- `#manualEntryGenre` — Dropdown
- `#manualEntryTechNeeds` — Checkbox

#### Volunteer Fields (shown when type = Volunteer)
- `#manualEntryVolunteerRole` — Dropdown
- `#manualEntryShiftPreference` — Dropdown

#### Non-Profit Fields (shown when type = NonProfit)
- `#manualEntryNonProfitType` — Dropdown

#### Date Selection
- `#manualEntryDateRepeater` — Repeater with clickable date boxes
  - `#itemLabel` — Text, displays date
  - `#itemContainer` — Box, clickable (MUST have border enabled, 3px solid, in Wix Editor)

#### Actions
- `#btnManualEntrySubmit` — Submit button
- `#btnManualEntryCancel` — Cancel button

### Manual Entry Behavior
- Type selection shows/hides relevant fields dynamically
- Date repeater shows availability colors (green/orange/red) matching public forms
- Does NOT create CRM contact (avoids duplicates from hard copy entries)
- Can still receive email notifications on later approve/reject

---

## Data Structure

### WeeklyAssignments Fields Used
- `profileRef` → SpecialtyProfiles (includes type, name, contact)
- `dateRef` → MarketDates2026 (includes date, title)
- `applicationStatus` — "Pending", "Approved", "Rejected"
- `assignedMapId` — Location assignment (musicians only)
- `emailSent` — Boolean, tracks if notification was sent
- `contactId` — CRM contact ID

### Key Code Patterns
- Always `.limit(1000)` on queries (Wix default is 50)
- Always fetch full record before `wixData.update()` to prevent field loss
- `isUpdating` flag prevents recursive onChange loops
- Status comparison is case-insensitive via `.trim().toLowerCase()`

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Repeater empty | Verify `#assignmentsRepeater` ID, check console, verify data in WeeklyAssignments |
| Status not updating | Check `applicationStatus` and `assignedMapId` fields exist |
| Tabs not working | Check tab IDs: `#tabMusicians`, `#tabVolunteers`, `#tabNonProfits` |
| Items disappear after update | Ensure full record is fetched before `wixData.update()` |
| Location shows for non-musicians | Check auto-hide logic for `#itemLocation` |

## Future Enhancements (Backlog)
- Bulk approve/reject operations
- Calendar view for visual scheduling
- Conflict detection for location assignments
- Export schedule to CSV/PDF
- Admin notes field per assignment
- **Sort dropdown** — Sort by date, name, status, or location (currently fixed: date then name)
- **Quick stats bar** — e.g. "Pending: 12 | Approved: 5" so staff see counts at a glance
- **Filter by preferred location** — Show applicants who requested a specific location (e.g. "wanted 13th Street") before assigning
- **Submitted-date filter** — Filter by when the request was created (if `_createdDate` is exposed)
