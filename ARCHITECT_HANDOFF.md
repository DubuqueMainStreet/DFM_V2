# DFM_V2 — Architect Handoff Document

**Generated:** February 24, 2026  
**Last Revised:** April 23, 2026  
**Repository:** `https://github.com/DubuqueMainStreet/DFM_V2.git`  
**Workspace:** `c:\Users\david\Documents\DFM_V2-main`

---

## 1. Executive Summary

**Project:** Dubuque Farmers Market 2026 Website  
**Platform:** Wix Studio + Velo (JavaScript, React 16.14.0)  
**Season:** May 2 – Oct 31, 2026 (27 Saturdays) | Upper Main District (Iowa St, 11th–13th)  
**Site ID:** `b8f4ee52-de89-4690-9bca-ea948bbea938`

**Status:** Core backend and signup infrastructure is **code-complete**. Three signup forms (Musician, Volunteer, NFP) are functional with CRM integration, email notifications, and an admin dashboard. The interactive Leaflet map and data-import pipeline are operational. 25+ public pages remain as templates awaiting content. CMS configuration items (title field on MarketDates2026, field-type verification) are outstanding.

**Key Capabilities Delivered:**
- Unified specialty signup flow (Musician / Volunteer / NFP) → CMS + CRM + Email
- Admin dashboard with filtering, status management, manual entry, and email diagnostics
- Market calendar with per-date coverage tracking (musicians, volunteers, NFP)
- Interactive Leaflet.js vendor/POI map in HTML iFrame with postMessage API
- CSV/GeoJSON import pipeline for vendor rosters, stall layouts, and attendance
- Availability-status engine with color-coded indicators

---

## 2. Architecture Map

```
┌─────────────────────────────────────────────────────────────┐
│                     WIX STUDIO EDITOR                       │
│  Pages (.js) ←→ $w('#element') ←→ Visual Components         │
└──────────────┬──────────────────────────────┬───────────────┘
               │ import                        │ postMessage
               ▼                               ▼
┌──────────────────────────┐     ┌─────────────────────────────┐
│   Backend (.jsw/.web.js) │     │  Leaflet Map (HTML iFrame)  │
│                          │     │  vendor-map-full-ui.html     │
│  formSubmissions.jsw     │     │  (canonical ~2,494 lines)    │
│  emailNotifications.jsw  │     └─────────────────────────────┘
│  availabilityStatus.jsw  │
│  importData.jsw          │
│  diagnosticCheck.jsw     │
│  emailDiagnostic.jsw     │
└──────┬──────────┬────────┘
       │          │
       ▼          ▼
┌────────────┐  ┌────────────────────┐
│  Wix CMS   │  │  Wix CRM Backend   │
│ Collections│  │  + Triggered Emails │
└────────────┘  └────────────────────┘
```

### Data Flow: Signup Submission
```
User fills form → Page validates → submitSpecialtyProfile()
  → Insert SpecialtyProfiles record (parent)
  → Batch-insert WeeklyAssignments (one per selected date)
  → elevate() → createContact() in Wix CRM
  → Return success to page
```

### Data Flow: Admin Status Change
```
Admin clicks Approve/Reject → wixData.update() on WeeklyAssignment
  → sendStatusNotificationEmail()
    → Lookup/create CRM contact (with fallback strategies)
    → Send Triggered Email (V9e2eMj=Approved, V9e3Agb=Rejected)
```

### Data Flow: Map Rendering
```
MAP.mggqp.js → queries Vendors, StallLayouts, POIs, MarketAttendance
  → postMessage → Leaflet iFrame → renders markers/stalls/POIs
  → Filter buttons in Wix → postMessage → iFrame updates markers
```

---

## 3. File Inventory

### 3A. Backend Modules (`src/backend/`)

| File | Lines | Purpose |
|------|-------|---------|
| `formSubmissions.jsw` | 400 | Form submission + CRM contact creation (regular & manual entry) |
| `emailNotifications.jsw` | 1,612 | Status-change emails via Triggered Emails; CRM contact create/update with `elevate()` |
| `availabilityStatus.jsw` | 212 | Per-date availability calculation by type (musician/volunteer/NFP) |
| `importData.jsw` | 495 | CSV/GeoJSON import for vendors, stalls, POIs, attendance; bulk operations |
| `diagnosticCheck.jsw` | 439 | Data integrity checks on WeeklyAssignments; broken-reference detection |
| `emailDiagnostic.jsw` | 264 | Email delivery audit; resend missing approval emails |
| `fixSaturdayDates.jsw` | 159 | Ensures MarketDates2026 contains exactly the 27 Saturdays |
| `populateDateTitles.web.js` | 65 | Populates `title` field on MarketDates2026 ("May 2nd, 2026" format) |
| `formUtils.web.js` | 58 | Email validation, duplicate check, available-dates query |
| `http-functions.js` | 51 | HTTP POST endpoint wrapper for email diagnostic |
| `permissions.json` | 17 | Permissions config — all functions open to owner/member/anonymous |

**Root-level duplicate:** `backend/formUtils.web.js` — **deleted** (Feb 24, 2026). Was stale with wrong collection names.

### 3B. Pages (`src/pages/`) — Functional Code

| File | Lines | Category | Purpose |
|------|-------|----------|---------|
| `Specialty Requests.k6g1g.js` | ~2,857 | Admin Dashboard | Primary admin: filter/search/approve/reject/manual-entry/email diagnostics |
| `Market Calendar.rhmek.js` | 686 | Calendar | Per-date coverage dashboard (musicians, volunteers, NFP) |
| `SIGNUP-Music.ais9x.js` | 504 | Signup Form | Musician registration with date selection & availability |
| `ADMIN-Schedule-Management.ais9x.js` | 438 | Admin Dashboard | Schedule management with status updates & email triggers |
| `SIGNUP- NFP.owt61.js` | 413 | Signup Form | Non-profit registration with date selection & availability |
| `SIGNUP- Volunteer.zab9v.js` | 394 | Signup Form | Volunteer registration with role/shift selection |
| `MAP.mggqp.js` | 288 | Public Page | Interactive Leaflet map with filter/search via postMessage |
| `dataParse.gtlkj.js` | 159 | Utility | Admin data import (vendors, stalls, GeoJSON, attendance) |

**Template pages (11 lines each, no logic):** HOME, ABOUT US, EVENTS, GET INVOLVED, CONTACT, DONATE, PRIVACY POLICY, ACCESSIBILITY STATEMENT, OUR TEAM, Team List/Item, Member Page, Schedule, Product/Category/Cart/Checkout/Thank You pages, Special Event signup, masterPage, Fullscreen, Instagram Feed, New Page — **28 total**.

### 3C. Public Assets (`src/public/`)

| File | Purpose |
|------|---------|
| `vendor-map-full-ui.html` (~2,494 lines) | Canonical Leaflet map — full-UI with integrated controls, postMessage API, parent-handled geolocation, vendor/POI rendering, test-data badge |
| `marketTestData.js` | Auto-generated test data bundle (stalls, POIs, attendance); used when `USE_TEST_DATA_DEFAULT = true` or `?testData=1` |
| `fonts/` | Local brand fonts (`TAY Milkbar`, `TAY Dreamboat`, `Outdoors Inks`) referenced by `@font-face` in the map HTML |
| `dfm-logo-horizontal.png` | DFM brand logo used in the map header |

### 3D. Scripts (`scripts/`)

| File | Purpose |
|------|---------|
| `generateMarketTestData.js` | Node generator that reads `scripts/output/*_REAL.geojson` + `market_attendance.csv` and writes `src/public/marketTestData.js`. Run via `npm run generate-map-test-data`. |
| `analyze_surveys.py` | Python analysis of 2025 public + vendor surveys; source for `docs/DFM_2025_SURVEY_TRENDS.md` |
| `analyze_token_booth.py` | Python analysis of 2025 token-booth / attendance data |
| `requirements-token-booth.txt` | Python deps for the token-booth analysis |
| `data/dubuque_events_2025.csv` | 2025 season event data used by the token-booth analyzer |
| `output/` | Real GeoJSON inputs (`*_REAL.geojson`, `market_attendance.csv`) that feed the map test-data generator, plus regeneratable token-booth artifacts |

---

## 4. Documentation Index

All documentation lives in `docs/` with a master index at `docs/INDEX.md`.  
Consolidated from 46 files to 12 on March 2, 2026.

| Document | Contents |
|----------|----------|
| `docs/ADMIN_DASHBOARD.md` | Admin dashboard UI, workflow, manual entry, troubleshooting |
| `docs/SIGNUP_FORMS.md` | All 3 signup forms, UI elements, availability indicators, date repeater |
| `docs/CMS_DATA_MODEL.md` | All collections, field schemas, reference display fixes, setup checklist |
| `docs/EMAIL_AND_CRM.md` | Email notifications, CRM integration, template setup, gotchas |
| `docs/MAP_GUIDE.md` | Interactive map architecture, geolocation, performance, UX backlog |
| `docs/MARKET_CALENDAR.md` | Calendar dashboard UI, coverage logic, setup |
| `docs/TESTING.md` | Consolidated testing checklists for all features |
| `docs/WIX_PLATFORM_NOTES.md` | Wix Velo rules, repo structure, git workflow, MCP plugins |
| `docs/BACKLOG.md` | Future improvements for admin, map, forms, infrastructure |

**Root-level docs (3):** `README.md`, `ARCHITECT_HANDOFF.md`, `2026-Roadmap.md`

---

## 5. Data Model (Wix CMS Collections)

| Collection | Purpose | Key Fields |
|------------|---------|------------|
| **SpecialtyProfiles** | Unified signup parent record | `type` (Musician/Volunteer/Non-Profit), `organizationName`, `contactName`, `contactEmail`, `contactPhone`, `musicianType`, `volunteerRole`, `techNeeds`, `preferredLocation`, `duration`, `genre`, `bio`, `website` |
| **WeeklyAssignments** | One-per-date child of SpecialtyProfile | `profileRef` (→ SpecialtyProfiles), `dateRef` (→ MarketDates2026), `applicationStatus` (Pending/Approved/Rejected), `assignedMapId`, `emailSent`, `contactId` |
| **MarketDates2026** | 27 Saturday market dates | `date`, `title` ("May 2nd, 2026") |
| **Vendors** | Vendor information | `name`, `stall_number`, `category`, `vendorType`, `tags` |
| **StallLayouts** | GeoJSON stall positions | `stallId`, `geometry`, `properties` |
| **POIs** | Points of interest | `name`, `type`, `geometry` |
| **MarketAttendance** | Vendor attendance per date | `vendorRef`, `dateRef`, `present` |

### Relationship Pattern
```
SpecialtyProfiles (1) ──→ (N) WeeklyAssignments ──→ MarketDates2026
```
One profile submits for many dates. Each WeeklyAssignment tracks status independently.

### Critical Patterns
- **Always** `.limit(1000)` — Wix default is 50; omitting truncates results silently
- **Always** fetch full record before `wixData.update()` to prevent field loss
- Status values: `"Pending"` → `"Approved"` | `"Rejected"` (case-sensitive in CMS, case-insensitive in queries via `.trim().toLowerCase()`)
- Reference display: collections need a `title` field or references show "Untitled"

---

## 6. Risk Register

| # | Risk | Severity | Mitigation |
|---|------|----------|------------|
| 1 | **Wix Data default limit = 50** | HIGH | Always add `.limit(1000)` to every query expecting full datasets |
| 2 | **No DOM access in Velo** | HIGH | Use `$w('#id')`, `wix-storage`; never `window`/`document`/`alert()` |
| 3 | **Visual elements cannot be created via code** | MEDIUM | Instruct user to add elements in Editor; reference by `#id` |
| 4 | **Serverless — no persistent state** | MEDIUM | `.jsw` variables reset per invocation; use `wix-data` or `wix-storage` |
| 5 | **CRM requires `elevate()`** | MEDIUM | All CRM operations must use `elevate()` from `wix-auth`; without it → silent permission failure |
| 6 | **Reference fields show "Untitled"** | MEDIUM | Referenced collections must have a `title` field populated |
| 7 | **`wixData.update()` overwrites missing fields** | MEDIUM | Always `get()` the full record first, merge changes, then `update()` |
| 8 | **Stale root-level `backend/formUtils.web.js`** | LOW | Uses old collection names with underscores; only `src/backend/` is active |
| 9 | **Email deduplication window = 5 min** | LOW | `emailNotifications.jsw` caches sent emails; rapid re-approvals within 5 min won't re-send |
| 10 | ~~OneDrive sync artifacts~~ | DONE | Tree removed from repo on Apr 23, 2026; `OneDrive/` remains in `.gitignore` |
| 11 | **Anonymous-callable HTTP endpoint** | HIGH | `post_sendMissingApprovalEmailsBackend` needs secret-header auth before launch |
| 12 | **Wildcard `permissions.json`** | HIGH | Anonymous can currently invoke all web methods; tighten per-file before launch |

---

## 7. Roadmap Snapshot (2026)

| Phase | Window | Focus | Status |
|-------|--------|-------|--------|
| **Immediate** | Jan–Feb | Update dates, hero text, MMM links, location references | NOT STARTED |
| **Content Refresh** | March | Vendor Handbook, musician/NFP routing, FAQ updates | NOT STARTED |
| **Technical Integration** | April | Finalize Leaflet map, mobile optimization, Market Status script, CSV import testing | PARTIALLY DONE (map built, import pipeline built) |
| **Live Launch** | May 2 | Mobile audit, social links, final testing, analytics | NOT STARTED |
| **Pre-Season Testing** | Before May | Standalone map test, Wix collection setup, sample data import | PARTIALLY DONE (scripts built, collections need setup) |

---

## 8. Agent Context Summary

### Cursor Rules

| Rule | Scope | Key Directives |
|------|-------|----------------|
| `global.mdc` | All files (alwaysApply) | Principal Architect role; Complexity Thermometer (GREEN/YELLOW/RED model selection); Two-Strike anti-loop rule; Vibe Translation Matrix; `PROJECT_STATE.md` as session memory anchor |
| `wix-velo.mdc` | `**/*.js, **/*.jsw, **/*.web.js` | No DOM access; visual immutability; `$w.onReady()` wrapping; serverless = no persistent state; `suppressAuth: true` only when required |

### Skills Available

| Skill | Purpose |
|-------|---------|
| `create-rule` | Create new `.cursor/rules/` files |
| `create-skill` | Author new Agent Skills (SKILL.md format) |
| `update-cursor-settings` | Modify `settings.json` (editor config) |

### MCP Servers

| Server | Tools | Use Case |
|--------|-------|----------|
| `context7` (user + plugin) | `resolve-library-id`, `query-docs` | Fetch up-to-date docs for Wix Velo, wix-data, wix-crm-backend, Leaflet.js (max 3 calls/question) |
| `supabase` (plugin) | `list_projects`, `execute_sql`, etc. | Available but **not used** — this project uses Wix CMS |

### Subagents

| Type | Use Case |
|------|----------|
| `explore` | Codebase exploration (quick/medium/very thorough) |
| `generalPurpose` | Research, multi-step tasks |
| `shell` | Git operations, terminal commands |

---

## 9. Outstanding Action Items

| # | Item | Priority | Context |
|---|------|----------|---------|
| 1 | Add `title` field to `MarketDates2026` collection in Wix CMS | HIGH | Required for reference display; run `populateDateTitles.web.js` after |
| 2 | Test full form submission flow (Musician → CRM → Email) | HIGH | Code complete but untested end-to-end |
| 3 | Verify `musicianType` and `preferredLocation` are Text fields (not Tag) | MEDIUM | Wrong field type causes silent failures |
| 4 | Verify reference field displays show names/dates, not UUIDs | MEDIUM | Depends on item #1 |
| 5 | Populate 27 Saturday dates via `fixSaturdayDates.jsw` | MEDIUM | May already be done; verify |
| 6 | Content for 28 template pages (HOME, ABOUT, EVENTS, etc.) | LOW | Placeholder only; roadmap says March |
| 7 | ~~Resolve stale `backend/formUtils.web.js` at root level~~ | DONE | Deleted on Feb 24, 2026 |

---

## 10. Quick Reference: Collection Names

All backend code uses **camelCase** collection names:

```
SpecialtyProfiles    WeeklyAssignments    MarketDates2026
Vendors              StallLayouts         POIs
MarketAttendance
```

**Do not use** underscore variants (`Specialty_Profiles`, `Market_Dates_2026`) — those exist only in the stale root-level `backend/formUtils.web.js`.

---

*End of Architect Handoff Document*
