# Market Calendar & Planning Dashboard

**Status:** Code complete  
**File:** `src/pages/Market Calendar.rhmek.js` (686 lines)

---

## Overview

Monthly calendar showing per-date coverage for musicians, volunteers, and non-profits. Helps admins identify gaps in scheduling.

## Required UI Elements

### Month Navigation Tabs
- `#tabMay` — May tab
- `#tabJune` — June tab
- `#tabJuly` — July tab
- `#tabAugust` — August tab
- `#tabSeptember` — September tab
- `#tabOctober` — October tab

### Statistics Display
- `#statTotalDates` — Total market dates count
- `#statCoveredDates` — Fully covered dates count
- `#statNeedAttention` — Dates needing attention count

### Content Area
- `#calendarRepeater` — Repeater for date items
- `#loadingIndicator` — Loading spinner (initially hidden)
- `#msgError` — Error messages (initially hidden)

### Repeater Item Elements
- `#dateTitle` — Text, date display ("May 2nd")
- `#dateStatus` — Text/Icon, overall coverage status
- `#musicianCount` — Text, approved musician count
- `#volunteerCount` — Text, approved volunteer count
- `#nfpCount` — Text, approved non-profit count
- `#dateDetails` — Container, expandable details (initially collapsed)
- `#btnExpand` — Button, toggle details

### Expandable Detail Elements (inside `#dateDetails`)
- `#musicianList` — Text, list of approved musicians
- `#volunteerList` — Text, list of approved volunteers
- `#nfpList` — Text, list of approved non-profits

---

## Coverage Logic

### Coverage Status Per Date
- **Full Coverage** (green): At least 1 musician + 1 volunteer + 1 non-profit approved
- **Partial Coverage** (yellow): Some but not all types covered
- **No Coverage** (red): No approved assignments

### Coverage Requirements
- **Musicians:** Target 3 per date (one per location)
- **Volunteers:** Target varies by role
- **Non-Profits:** Target 1 per date

---

## Layout Structure

```
┌──────────────────────────────────────────────┐
│  Month Tabs: [May] [Jun] [Jul] [Aug] [Sep] [Oct]  │
├──────────────────────────────────────────────┤
│  Stats: Total: 27 | Covered: 15 | Need Attention: 12  │
├──────────────────────────────────────────────┤
│  Calendar Repeater                              │
│  ┌────────────────────────────────────────┐   │
│  │ May 2nd  🟢  Musicians: 3  Vol: 4  NFP: 1 │   │
│  │   [Expand ▼]                           │   │
│  ├────────────────────────────────────────┤   │
│  │ May 9th  🟡  Musicians: 1  Vol: 2  NFP: 0 │   │
│  │   [Expand ▼]                           │   │
│  └────────────────────────────────────────┘   │
└──────────────────────────────────────────────┘
```

---

## Styling

### Status Colors
- **Full coverage:** Green background (#E8F5E9), green border (#4CAF50)
- **Partial coverage:** Yellow background (#FFF8E1), orange border (#FF9800)
- **No coverage:** Red background (#FFEBEE), red border (#F44336)

### Month Tab Active State
- Active tab: Bold text, colored underline
- Inactive tab: Normal weight, no underline

---

## Testing Checklist

- [ ] All 27 dates display correctly
- [ ] Month tabs filter dates correctly
- [ ] Coverage counts match WeeklyAssignments data
- [ ] Status colors reflect actual coverage
- [ ] Expand/collapse works for each date
- [ ] Statistics update when switching months
- [ ] Loading indicator shows during data fetch
- [ ] Empty months show appropriate message
- [ ] Edge case: dates with only pending (not approved) assignments show as uncovered
