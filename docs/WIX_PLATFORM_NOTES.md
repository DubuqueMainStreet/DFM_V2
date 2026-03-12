# Wix Platform Notes & Repository Guide

Essential Wix Velo rules, repository structure, and tooling reference.

---

## Critical Wix Velo Rules

### Query Limit (CRITICAL)
Wix Data queries return **max 50 items by default**. Always add `.limit(1000)`:

```javascript
// WRONG — silently truncates at 50
const results = await wixData.query('WeeklyAssignments').find();

// CORRECT
const results = await wixData.query('WeeklyAssignments').limit(1000).find();
```

For collections exceeding 1000 items, implement pagination with `.skip()` and check `results.hasMore`.

### No DOM Access
Wix Velo has no `window`, `document`, or `alert()`. Use:
- `$w('#elementID')` for element selection
- `wix-storage` for client-side storage
- `wixWindowFrontend` for page-level APIs

### Visual Immutability
You cannot create or delete visual elements via code. All elements must exist in the Wix Editor. Code references them by `#id`.

### Serverless Backend
`.jsw` and `.web.js` files run in a serverless context. Variables reset per invocation — no persistent state. Use `wix-data` or `wix-storage` for persistence.

### CRM Requires `elevate()`
All `wix-crm-backend` operations need `elevate()` from `wix-auth`. Without it, calls return FORBIDDEN silently.

### Reference Fields
Referenced collections need a `title` field, or references display "Untitled" in the CMS.

### `wixData.update()` Overwrites
Always `get()` the full record, merge your changes, then `update()`. Updating with a partial object sets missing fields to null.

---

## Repository Structure

```
DFM_V2-main/
├── .cursor/                    # Cursor IDE config
│   ├── PROJECT_STATE.md.txt    # Session memory (read at start of every session)
│   └── rules/
│       ├── global.mdc.txt      # Global agent rules
│       └── wix-velo.mdc.txt    # Wix/Velo-specific rules
├── src/
│   ├── backend/                # Wix backend modules (11 files)
│   ├── pages/                  # Wix page code (35 files)
│   ├── public/                 # Public assets (map HTML, fonts, test data)
│   └── styles/                 # Global CSS
├── scripts/                    # Node.js utilities (test data generation)
├── docs/                       # Documentation (you are here)
├── ARCHITECT_HANDOFF.md        # Full system context
├── 2026-Roadmap.md             # Strategic roadmap
├── package.json                # Dependencies (@wix/cli, eslint, react)
└── wix.config.json             # Wix site config
```

### Key Backend Files
| File | Purpose |
|------|---------|
| `formSubmissions.jsw` | Form submission + CRM contact creation |
| `emailNotifications.jsw` | Status emails + CRM management |
| `availabilityStatus.jsw` | Per-date availability by type |
| `importData.jsw` | CSV/GeoJSON import pipeline |
| `diagnosticCheck.jsw` | Data integrity checks |
| `emailDiagnostic.jsw` | Email delivery audit |
| `fixSaturdayDates.jsw` | Ensure 27 Saturdays in MarketDates2026 |
| `populateDateTitles.web.js` | Populate title field on dates |
| `formUtils.web.js` | Email validation, duplicate check |
| `http-functions.js` | HTTP endpoint for email diagnostic |

### Key Page Files
| File | Purpose |
|------|---------|
| `Specialty Requests.k6g1g.js` | Primary admin dashboard (~2,857 lines) |
| `ADMIN-Schedule-Management.ais9x.js` | Schedule management |
| `Market Calendar.rhmek.js` | Coverage calendar |
| `SIGNUP-Music.ais9x.js` | Musician signup |
| `SIGNUP- Volunteer.zab9v.js` | Volunteer signup |
| `SIGNUP- NFP.owt61.js` | Non-profit signup |
| `MAP.mggqp.js` | Interactive Leaflet map |
| `dataParse.gtlkj.js` | Admin data import |

---

## Git & Wix Publish Workflow

**Commit then publish (full process in docs/PUBLISHING.md):**

```powershell
git add src/pages/*.js wix.config.json   # or whatever changed
git commit -m "Description; ui version 578"
npx wix publish --source local -y
```

- **Publish command:** `npx wix publish --source local -y` (non-interactive; uses UI version from `wix.config.json`).
- **Repository:** `https://github.com/DubuqueMainStreet/DFM_V2.git`

---

## MCP Plugins

### Context7 (Primary — use for Wix API questions)
**Server:** `plugin-context7-plugin-context7`

Two-step flow:
1. `resolve-library-id` — Pass library name (e.g., "wix-data") to get Context7 ID
2. `query-docs` — Pass ID + specific question to get docs and examples

**Relevant libraries:** `wix-data`, `wix-crm-backend`, `wix-auth`, `wix-storage`, `wix-window`, `leaflet`

Max 3 calls per question.

### Vercel (Available, needs auth)
**Server:** `user-vercel` — Call `mcp_auth` to authenticate before using.

### Supabase (Available, NOT used)
**Server:** `plugin-supabase-supabase` — This project uses Wix CMS. Ignore unless explicitly asked.

---

## Agent Best Practices

- Read `.cursor/PROJECT_STATE.md.txt` at session start
- Read `ARCHITECT_HANDOFF.md` for full architecture context
- Use `explore` subagent for codebase questions (fastest)
- Use `generalPurpose` subagent for multi-file research
- Use `shell` subagent for git/npm operations
- Launch up to 4 subagents in parallel
- Use Context7 MCP when unsure about Wix API signatures
