# CMS Collections & Data Model

**Platform:** Wix CMS (native collections)  
**Collection names are camelCase. Do NOT use underscore variants.**

---

## Collections

### SpecialtyProfiles (Parent)
Unified signup record for all types.

| Field | Type | Required | Used By |
|-------|------|----------|---------|
| `type` | Text | Yes | All — "Musician", "Volunteer", "NonProfit" |
| `title` | Text | No | Reference display (auto-set to `organizationName`) |
| `organizationName` | Text | Yes | All — person or org name |
| `contactName` | Text | No | Musicians, NFPs — actual contact person |
| `contactEmail` | Email/Text | Yes | All |
| `contactPhone` | Text | Yes | All |
| `bio` | Long Text | No | All |
| `website` | URL/Text | No | All |
| `preferredLocation` | Text | No | Musicians — **must be Text, NOT Tag** |
| `musicianType` | Text | No | Musicians — **must be Text, NOT Tag** |
| `duration` | Text | No | Musicians |
| `genre` | Text | No | Musicians |
| `techNeeds` | Boolean | No | Musicians — electric hookup |
| `volunteerRole` | Text | No | Volunteers |
| `shiftPreference` | Text | No | Volunteers |
| `nonProfitType` | Text | No | Non-Profits |
| `fileUrl` | URL/Text | No | Musicians — uploaded file |

### WeeklyAssignments (Child, one per date)

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `profileRef` | Reference → SpecialtyProfiles | Yes | Displays `title` field |
| `dateRef` | Reference → MarketDates2026 | Yes | Displays `title` field |
| `applicationStatus` | Text | Yes | "Pending", "Approved", "Rejected" |
| `assignedMapId` | Text | No | Musicians only — location assignment |
| `emailSent` | Boolean | No | Tracks notification status |
| `contactId` | Text | No | CRM contact ID |

### MarketDates2026

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `date` | Date | Yes | The Saturday market date |
| `title` | Text | Yes | "May 2nd, 2026" — needed for reference display |

### Vendors

| Field | Type | Notes |
|-------|------|-------|
| `name` | Text | Vendor name |
| `stall_number` | Text | Assigned stall |
| `category` | Text | Vendor category |
| `vendorType` | Text | Type classification |
| `tags` | Text | Searchable tags |

### StallLayouts, POIs, MarketAttendance
Map-related collections. See `src/backend/importData.jsw` for field details and import logic.

---

## Relationship Pattern

```
SpecialtyProfiles (1) ──→ (N) WeeklyAssignments ──→ MarketDates2026
```
One profile submission creates multiple weekly assignments (one per selected date). Each assignment tracks status independently.

---

## Critical Rules

1. **Always `.limit(1000)`** — Wix default is 50. Omitting silently truncates results.
2. **Always fetch before update** — `wixData.get(id)` then merge changes, then `wixData.update()`. Direct update overwrites missing fields with null.
3. **Status values are case-sensitive** in CMS — code normalizes via `.trim().toLowerCase()` for comparisons.
4. **Reference display** — Collections need a `title` field or references show "Untitled."
5. **`musicianType` and `preferredLocation` MUST be Text fields** — If they're Tag fields, single-string saves silently fail.

---

## Title Field Setup (Reference Display Fix)

Without `title` fields, reference columns show UUIDs or "Untitled."

### MarketDates2026 — Add `title` field
1. In Wix CMS → MarketDates2026 → Add Field: `title` (Text, not required)
2. Run `populateDateTitles.web.js` to populate all 27 records with "May 2nd, 2026" format
3. How to run: Create a test page that calls the function on load, or use Dev Tools

### SpecialtyProfiles — `title` already set by code
The `submitSpecialtyProfile()` function sets `title: organizationName` automatically.

### Populating 27 Saturday Dates
Run `fixSaturdayDates.jsw` to ensure MarketDates2026 contains exactly the 27 Saturdays from May 2 – Oct 31, 2026.

---

## Finding Field IDs

Field IDs are case-sensitive internal identifiers (not display names).

**Method 1:** CMS → Collections → Click field → Field ID shown at bottom of settings  
**Method 2:** Query the collection in code — returned field names are the IDs  
**Method 3:** Check existing records in CMS — column names = Field IDs

Common mismatch: Display "Phone Number" but Field ID is `contactPhone`. Code must use the Field ID.

---

## CMS Setup Checklist

- [ ] `MarketDates2026` has `title` field (Text) — populated via script
- [ ] `SpecialtyProfiles` has `contactName` field (Text, optional)
- [ ] `musicianType` is Text field (not Tag)
- [ ] `preferredLocation` is Text field (not Tag)
- [ ] 27 Saturday dates present (May 2 – Oct 31, 2026)
- [ ] Reference fields display names/dates, not UUIDs
- [ ] Delete any leftover duplicate fields: `name`, `email`, `phone` (use `organizationName`, `contactEmail`, `contactPhone`)
