# Signup Forms — Musician, Volunteer, Non-Profit

**Status:** All three forms code complete  
**Architecture:** One-to-Many (Parent `SpecialtyProfiles` → Children `WeeklyAssignments`)

---

## Form Files

| Form | File | Type Field |
|------|------|------------|
| Musician | `src/pages/SIGNUP-Music.ais9x.js` | `"Musician"` |
| Volunteer | `src/pages/SIGNUP- Volunteer.zab9v.js` | `"Volunteer"` |
| Non-Profit | `src/pages/SIGNUP- NFP.owt61.js` | `"NonProfit"` |
| Backend | `src/backend/formSubmissions.jsw` | — |
| Utilities | `src/backend/formUtils.web.js` | — |
| Availability | `src/backend/availabilityStatus.jsw` | — |

## Data Flow

1. User fills form → Validation
2. File upload (if provided) → Get URL
3. Insert `SpecialtyProfiles` record (parent) → Get `_id`
4. Loop selected dates → Insert `WeeklyAssignments` (one per date, with `profileRef` and `dateRef`)
5. `elevate()` → `createContact()` in Wix CRM
6. Success feedback → Reset form

---

## Common UI Elements (All Forms)

| Element ID | Type | Maps To | Required |
|------------|------|---------|----------|
| `#inputName` | Text Input | `organizationName` | Yes |
| `#inputContactName` | Text Input | `contactName` | No |
| `#inputEmail` | Text Input | `contactEmail` | Yes |
| `#inputPhone` | Text Input | `contactPhone` | Yes |
| `#inputBio` | Textarea | `bio` | Yes |
| `#dateRepeater` | Repeater | Creates `WeeklyAssignments` | Yes (1+ date) |
| `#btnSubmit` | Button | Triggers submission | — |
| `#msgSuccess` | Text | Success message (hidden) | — |
| `#msgError` | Text | Error message (hidden) | — |

### Date Repeater Item Elements
- `#itemContainer` — Box, clickable (MUST have 3px solid border set in Editor)
- `#itemLabel` — Text, displays date ("May 2nd")
- `#itemEmoji` — Text, status icon (✓/⚠/✕)
- `#itemCheckbox` — Checkbox (can be hidden visually)

## Musician-Specific Elements

| Element ID | Type | Maps To |
|------------|------|---------|
| `#inputMusicianType` | Dropdown | `musicianType` |
| `#inputNeedsElectric` | Checkbox | `techNeeds` (boolean) |
| `#inputLocation` | Dropdown | `preferredLocation` |
| `#inputDuration` | Dropdown | `duration` |
| `#inputGenre` | Dropdown | `genre` |
| `#inputWebsite` | Text Input | `website` |
| `#uploadButton` | File Upload | `fileUrl` |

### Dropdown Options (auto-populated by code)
- **Musician Type:** Solo Acoustic, Solo Electric, Duo Acoustic, Duo Electric, Small Band (3-4), Large Band (5+), Other
- **Location:** Default (No Preference), Location A (13th Street), Location B (Food Court), Location C (10th & Iowa St)
- **Duration:** 1 hour, 2 hours, 3 hours, 4 hours, 5 hours
- **Genre:** Acoustic/Folk, Country, Jazz, Blues, Rock, Pop, Classical, Bluegrass, World Music, Other

## Volunteer-Specific Elements

| Element ID | Type | Maps To |
|------------|------|---------|
| `#inputVolunteerRole` | Dropdown | `volunteerRole` |
| `#inputShiftPreference` | Dropdown | `shiftPreference` |

### Dropdown Options
- **Role:** Token Booth Sales, Merch Sales, Setup, Teardown, Hospitality Support, No Preference
- **Shift:** Early Shift (7:00 AM–9:30 AM), Late Shift (9:30 AM–12:00 PM), Both Shifts

## Non-Profit-Specific Elements

| Element ID | Type | Maps To |
|------------|------|---------|
| `#inputNonProfitType` | Dropdown | `nonProfitType` |
| `#inputWebsite` | Text Input | `website` |

### Dropdown Options
- **Type:** Community Outreach, Health & Wellness, Arts & Culture, Education, Environment, Social Services, Other

---

## Availability Indicators

Color-coded date availability helps users avoid full dates. Backend: `availabilityStatus.jsw`.

### Status Types

| Status | Border | Icon | When |
|--------|--------|------|------|
| Available | Green (#4CAF50) | ✓ | Below threshold |
| Limited | Orange (#FF9800) | ⚠ | Approaching capacity |
| Full | Red (#F44336) | ✕ | At capacity (60% opacity) |

### Capacity Rules

| Type | Available | Limited | Full |
|------|-----------|---------|------|
| Musicians | 0–1 approved | 2 approved | 3+ approved |
| Non-Profits | 0 approved | N/A | 1+ approved |
| Volunteers | Below 70% of role capacity | 70%+ | At capacity |

**Volunteer role capacities:** Token Sales: 2, Merch Sales: 2, Setup: 2, Teardown: 2, Hospitality Support: 2, No Preference: 1

### Behavior
- Calculated from **approved** assignments only (pending/rejected don't count)
- Volunteer form updates dynamically when role dropdown changes
- Selected dates show blue background (#E3F2FD) with thicker border (4px)

---

## Date Repeater Setup (Replaced Selection Tags)

Wix Selection Tags don't support per-item styling. The Repeater gives full control over each date's appearance.

### Editor Setup
1. Add a Repeater, ID: `dateRepeater`, layout: Grid (3-4 columns), spacing: 8px
2. Inside the item template, add:
   - Box (`#itemContainer`): border 3px solid, radius 8px, padding 10px 15px
   - Text (`#itemLabel`): font 14px, color #333
   - Text (`#itemEmoji`): font 16px bold (optional, left side)
3. Code handles population, click handlers, and styling automatically

### Selection Tracking
```javascript
let selectedDateIds = [];  // Module-scoped array
```
Container click toggles selection. Selected: blue background + 4px border. Unselected: white + 3px border.

---

## CRM & Contact Name

Forms collect both organization name and contact person name:
- `organizationName` — Band name, org name, or individual name (required)
- `contactName` — Actual contact person (optional, for musicians and NFPs)

CRM contact creation uses `contactName` when available, falls back to `organizationName`.

Admin dashboard displays: `"Contact Name (Organization Name)"` when both are present.

---

## Repeater handler registration

All three signup forms register `onItemReady` **exactly once** at page
load, then populate the repeater with `data = ...` on every refresh.
Re-registering inside the data-refresh path stacks duplicate click
handlers (selecting a date fires N times). The shared pattern:

- A module-level `repeaterSetupComplete` flag.
- A `setupRepeaterHandlers()` function that early-returns if already set up.
- A `registeredHandlers` Set keyed by `itemData._id` so per-item `onClick`
  handlers register only once per unique row.

Implementations:
- `src/pages/SIGNUP-Music.ais9x.js` — original reference implementation.
- `src/pages/SIGNUP- Volunteer.zab9v.js` — uses `dateRepeaterReady` + `setupDateRepeaterOnce()`.
- `src/pages/SIGNUP- NFP.owt61.js` — ported to this pattern (2026-04-23).

## Testing Checklist

- [ ] Submit each form with all required fields → verify `SpecialtyProfiles` record created
- [ ] Verify `WeeklyAssignments` records created (one per selected date)
- [ ] Verify reference fields show names/dates, not UUIDs or "Untitled"
- [ ] Test with optional fields empty
- [ ] Submit without selecting dates → should show error
- [ ] Verify availability colors update correctly
- [ ] Volunteer form: change role → availability should refresh
- [ ] Verify form resets after successful submission
- [ ] Test CRM contact creation (check Wix Dashboard → Contacts)
- [ ] Test on mobile devices
