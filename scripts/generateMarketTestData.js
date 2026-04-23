/**
 * Generates src/data/marketTestData.js from real market layout and attendance data.
 * Run: node scripts/generateMarketTestData.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const STALLS_PATH = path.join(ROOT, 'scripts', 'output', 'stall_layouts_REAL.geojson');
const POIS_PATH = path.join(ROOT, 'scripts', 'output', 'pois_REAL.geojson');
const ATTENDANCE_PATH = path.join(ROOT, 'scripts', 'output', 'market_attendance.csv');
const OUTPUT_PATH = path.join(ROOT, 'src', 'public', 'marketTestData.js');

function inferVendorType(name) {
    const n = (name || '').toLowerCase();
    if (/\b(crafts?|shop|artisan|jewelry|pottery|textile)\b/.test(n)) return 'Crafter/Artisan';
    if (/\b(burger|coffee|waffle|pizza|crepe|taco|sandwich|ice cream|burrito|bakery|bbq|kitchen|parlor|stand|place)\b/.test(n)) return 'On-site Prepared Food Vendor';
    if (/\b(farm|gardens?|ranch|acres?|grove|homestead|fields?|meadows?|orchards?|market)\b/.test(n)) return 'Grower/Producer/Processor';
    return 'Grower/Producer/Processor';
}

function parseCSV(text) {
    const lines = text.trim().split(/\r?\n/);
    const header = lines[0].split(',');
    return lines.slice(1).map(line => {
        const values = [];
        let current = '';
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
            const c = line[i];
            if (c === '"') inQuotes = !inQuotes;
            else if ((c === ',' && !inQuotes) || c === '\n') {
                values.push(current.trim());
                current = '';
            } else current += c;
        }
        values.push(current.trim());
        const row = {};
        header.forEach((h, i) => { row[h.trim()] = values[i] || ''; });
        return row;
    });
}

function mmddyyyyToYYYYMMDD(s) {
    if (!s) return null;
    const [mm, dd, yyyy] = s.split('/');
    if (!mm || !dd || !yyyy) return null;
    return `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
}

// Build attendance index: dateStr -> Map<vendorId, { name, stalls[] }>
function buildAttendanceIndex(rows) {
    const byDate = {};
    for (const row of rows) {
        const dateStr = mmddyyyyToYYYYMMDD(row.StartDate);
        if (!dateStr) continue;
        if (!byDate[dateStr]) byDate[dateStr] = new Map();
        const vendorId = row.VendorID;
        const vendorName = row.Vendor || '';
        if (!byDate[dateStr].has(vendorId)) {
            byDate[dateStr].set(vendorId, { name: vendorName, stalls: [] });
        }
        const stall = (row.Stall || '').trim().toUpperCase();
        if (stall && !byDate[dateStr].get(vendorId).stalls.includes(stall)) {
            byDate[dateStr].get(vendorId).stalls.push(stall);
        }
    }
    return byDate;
}

// Convert to vendor objects for map
function toVendorObjects(byDate) {
    const result = {};
    for (const [dateStr, vendorMap] of Object.entries(byDate)) {
        result[dateStr] = Array.from(vendorMap.entries()).map(([id, v]) => ({
            _id: id,
            title: v.name,
            description: `Vendor at Dubuque Farmers' Market.`,
            vendorType: inferVendorType(v.name),
            arraystring: v.name.toLowerCase().replace(/\s+/g, ', '),
            url: '',
            StallList: v.stalls
        }));
    }
    return result;
}

function main() {
    const stallsGeo = JSON.parse(fs.readFileSync(STALLS_PATH, 'utf8'));
    const poisGeo = JSON.parse(fs.readFileSync(POIS_PATH, 'utf8'));
    const csvText = fs.readFileSync(ATTENDANCE_PATH, 'utf8');
    const rows = parseCSV(csvText);
    const attendanceByDate = buildAttendanceIndex(rows);
    const vendorsByDate = toVendorObjects(attendanceByDate);

    // Deduplicate stalls by title (keep first)
    const seenStalls = new Set();
    const stallLayouts = stallsGeo.features
        .filter(f => {
            const id = (f.properties?.title || f.properties?.stallId || '').trim().toUpperCase();
            if (!id || seenStalls.has(id)) return false;
            seenStalls.add(id);
            return true;
        })
        .map(f => ({
            title: (f.properties?.title || f.properties?.stallId || '').trim(),
            geoJsonFeature: JSON.stringify(f)
        }));

    const pois = poisGeo.features.map(f => ({
        title: f.properties?.title || 'POI',
        poiType: f.properties?.poiType || 'Information',
        description: f.properties?.description || f.properties?.title || '',
        geoJsonFeature: JSON.stringify(f)
    }));

    const dateStrings = Object.keys(vendorsByDate).sort();
    const marketDates = dateStrings.map(d => {
        const [y, m, day] = d.split('-').map(Number);
        const date = new Date(y, m - 1, day);
        return {
            value: d,
            label: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
        };
    });

    const js = `// AUTO-GENERATED from real market layout and attendance data. Do not edit directly.
// Regenerate with: node scripts/generateMarketTestData.js

const STALL_LAYOUTS = ${JSON.stringify(stallLayouts)};
const POIS = ${JSON.stringify(pois)};
const VENDORS_BY_DATE = ${JSON.stringify(vendorsByDate)};
const MARKET_DATES = ${JSON.stringify(marketDates)};

export function getTestStallLayouts() {
    return STALL_LAYOUTS;
}

export function getTestPOIs() {
    return POIS;
}

export function getTestVendorsForDate(dateStr) {
    return VENDORS_BY_DATE[dateStr] || [];
}

export function getTestMarketDates() {
    return MARKET_DATES;
}
`;

    fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
    fs.writeFileSync(OUTPUT_PATH, js, 'utf8');
    console.log(`Generated ${OUTPUT_PATH}`);
    console.log(`  Stalls: ${stallLayouts.length}, POIs: ${pois.length}, Dates: ${marketDates.length}`);
}

main();
