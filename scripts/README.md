# scripts/

Helper scripts for the DFM_V2 project. Two domains:

1. **Map test-data generation** (Node) — feeds `src/public/marketTestData.js`
2. **Analysis utilities** (Python) — survey + token-booth exploration for 2026 planning

---

## Map test data (Node)

### `generateMarketTestData.js`

Reads real GeoJSON and attendance data from `scripts/output/` and writes
`src/public/marketTestData.js`, which the map uses when
`USE_TEST_DATA_DEFAULT === true` in `src/pages/MAP.mggqp.js` or when the URL
contains `?testData=1`.

**Inputs** (tracked in git):
- `scripts/output/stall_layouts_REAL.geojson` — stall positions
- `scripts/output/pois_REAL.geojson` — POI positions
- `scripts/output/market_attendance.csv` — vendor assignments by date

**Output** (tracked in git, consumed by the browser):
- `src/public/marketTestData.js`

**Run:**

```bash
npm run generate-map-test-data
```

Re-run whenever any of the three input files change. The resulting
`marketTestData.js` is committed so the map can load without a build step
on the Wix side.

---

## Analysis (Python)

These scripts were used to produce the 2025 season summaries that inform
the 2026 roadmap and `docs/DFM_2025_SURVEY_TRENDS.md`. They are **not part
of the Wix runtime** — nothing on the live site depends on them.

### `analyze_surveys.py`

Analyzes the 2025 public + vendor surveys. Referenced in
`docs/DFM_2025_SURVEY_TRENDS.md`.

### `analyze_token_booth.py`

Reconciles 2025 token-booth transactions with attendance observations to
produce weekly metrics (see `scripts/output/token_booth_*`).

**Dependencies:**

```bash
pip install -r scripts/requirements-token-booth.txt
```

**Inputs** (tracked in git):
- `scripts/data/dubuque_events_2025.csv`

**Outputs** (NOT tracked in git — regeneratable):
- `scripts/output/token_booth_*.csv`
- `scripts/output/token_booth_event_week_summary.txt`
- `scripts/output/token_booth_weekly_Neff.png`
- `scripts/output/zip_observations.csv`

Regenerate by re-running the Python script. Leave the real GeoJSON and
`market_attendance.csv` alone — those are curated inputs for the map test
data, not Python outputs.
