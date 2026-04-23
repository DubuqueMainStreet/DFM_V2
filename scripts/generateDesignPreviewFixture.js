/**
 * Generates src/public/designPreviewData.js — a curated showcase fixture for
 * the DFM interactive map design preview mode (?designPreview=1).
 *
 * Unlike scripts/generateMarketTestData.js (which fakes vendor names on top of
 * real attendance dates), this file produces a *deliberately curated* dataset
 * intended for design review. Every vendor type, every POI type, and every
 * edge-case label (long name, no description, multi-stall, featured, SNAP)
 * is represented against real stall geometry.
 *
 * Run: node scripts/generateDesignPreviewFixture.js
 * Also wired to npm run generate-design-preview (see package.json).
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const STALLS_PATH = path.join(ROOT, 'scripts', 'output', 'stall_layouts_REAL.geojson');
const POIS_PATH = path.join(ROOT, 'scripts', 'output', 'pois_REAL.geojson');
const OUTPUT_PATH = path.join(ROOT, 'src', 'public', 'designPreviewData.js');

// ---------------------------------------------------------------------------
// Curated showcase date — this is the one all design review happens against.
// Two extra dates exist in the dropdown so designers can smoke-test filtered
// + empty states without reloading.
// ---------------------------------------------------------------------------
const SHOWCASE_DATE = '2026-05-02';
const REDUCED_DATE = '2026-05-09';
const EMPTY_DATE = '2026-05-16';

const MARKET_DATES = [
    { value: SHOWCASE_DATE, label: 'Sat, May 2, 2026 — showcase' },
    { value: REDUCED_DATE, label: 'Sat, May 9, 2026 — reduced' },
    { value: EMPTY_DATE, label: 'Sat, May 16, 2026 — empty' },
];

// ---------------------------------------------------------------------------
// Curated vendor roster — 40 assignments covering every design edge case.
// Names prefixed with "[Sample]" so designers cannot mistake them for real
// 2026 assignments.
// ---------------------------------------------------------------------------
const CURATED_VENDORS = [
    // ---------- Grower / Producer / Processor (green markers) ----------
    { id: 'DP-001', title: '[Sample] Bluffside Orchard',         stalls: ['A12'],       type: 'Grower/Producer/Processor', keywords: 'apples pears peaches orchard fruit',      description: 'Apples, pears, peaches from our family orchard on the bluff.' },
    { id: 'DP-002', title: '[Sample] Prairie Bloom Farm',        stalls: ['A13', 'A14'],type: 'Grower/Producer/Processor', keywords: 'flowers herbs microgreens bouquet',       description: 'Seasonal flowers, herbs, and microgreens grown six miles west.' },
    { id: 'DP-003', title: '[Sample] River Valley Gardens',      stalls: ['A15'],       type: 'Grower/Producer/Processor', keywords: 'tomatoes peppers squash vegetables',      description: 'Heirloom tomatoes, peppers, and summer squash.' },
    { id: 'DP-004', title: '[Sample] Three Oaks Egg Co.',        stalls: ['B2'],        type: 'Grower/Producer/Processor', keywords: 'eggs pasture poultry',                    description: 'Pasture-raised eggs, laid this week.' },
    { id: 'DP-005', title: '[Sample] Heartland Honey Apiary',    stalls: ['B3'],        type: 'Grower/Producer/Processor', keywords: 'honey bees beeswax pantry',               description: 'Raw wildflower and buckwheat honey from our apiary in Bellevue.' },
    { id: 'DP-006', title: '[Sample] Dry Creek Dairy',           stalls: ['B4'],        type: 'Grower/Producer/Processor', keywords: 'cheese milk butter yogurt dairy',         description: 'Grass-fed raw-milk cheeses and cultured butter.' },
    { id: 'DP-007', title: '[Sample] Oakridge Beef',             stalls: ['B5'],        type: 'Grower/Producer/Processor', keywords: 'beef steak cattle grass-fed',             description: 'Grass-finished beef from our herd near Dyersville.' },
    { id: 'DP-008', title: '[Sample] Meadowlark Mushrooms',      stalls: ['B6'],        type: 'Grower/Producer/Processor', keywords: 'mushrooms oyster shiitake morel',         description: 'Oyster, shiitake, and seasonal wild-foraged mushrooms.' },

    // ---------- On-site Prepared Food (gold markers) ----------
    { id: 'DP-101', title: '[Sample] Bluffside Bakery',          stalls: ['B7', 'B8'],  type: 'On-site Prepared Food Vendor', keywords: 'bakery bread sourdough focaccia bagel', description: 'Sourdough, focaccia, and everything-bagels. Saturday drop arrives at 7am.', featured: true },
    { id: 'DP-102', title: '[Sample] Copper Kettle Kitchen',     stalls: ['B9'],        type: 'On-site Prepared Food Vendor', keywords: 'preserves salsa jam pickles',           description: 'Small-batch preserves, salsa, and garlicky dill pickles.' },
    { id: 'DP-103', title: '[Sample] Town Clock Coffee',         stalls: ['B10'],       type: 'On-site Prepared Food Vendor', keywords: 'coffee espresso latte chai',            description: 'Espresso, pour-overs, and house-made cold brew — roasted in Dubuque.' },
    { id: 'DP-104', title: '[Sample] Wise Donut Co.',            stalls: ['B11'],       type: 'On-site Prepared Food Vendor', keywords: 'donuts doughnut cake pastry',           description: 'Cake donuts. Get here early or get in line.' },
    { id: 'DP-105', title: '[Sample] Iowa Street Tacos',         stalls: ['B12', 'B13'],type: 'On-site Prepared Food Vendor', keywords: 'tacos burrito salsa',                   description: 'Al pastor, carnitas, and nopales tacos. Gluten-free options.' },
    { id: 'DP-106', title: '[Sample] Mississippi Pie Shop',      stalls: ['B14'],       type: 'On-site Prepared Food Vendor', keywords: 'pie pies cobbler',                      description: 'Hand pies: strawberry-rhubarb, blueberry, Dutch apple.' },
    { id: 'DP-107', title: '[Sample] Driftless Creamery',        stalls: ['B15'],       type: 'On-site Prepared Food Vendor', keywords: 'ice cream gelato dessert',              description: 'Small-batch ice cream churned with local cream.' },
    { id: 'DP-108', title: '[Sample] Hickory Hill BBQ',          stalls: ['B16'],       type: 'On-site Prepared Food Vendor', keywords: 'bbq barbecue smoked pork brisket',      description: 'Slow-smoked brisket and pulled pork sandwiches.', snap: true },
    { id: 'DP-109', title: '[Sample] Sunrise Kombucha',          stalls: ['B17'],       type: 'On-site Prepared Food Vendor', keywords: 'kombucha fermented drink tea',          description: 'Ginger-lemon and hibiscus kombucha on tap.' },
    { id: 'DP-110', title: '[Sample] Cornerstone Lemonade',      stalls: ['B18'],       type: 'On-site Prepared Food Vendor', keywords: 'lemonade juice drink',                  description: 'Fresh-squeezed lemonade and seasonal fruit sparklers.' },

    // ---------- Crafter / Artisan (teal markers) ----------
    { id: 'DP-201', title: '[Sample] Clay & Kiln Pottery',       stalls: ['C1'],        type: 'Crafter/Artisan', keywords: 'pottery ceramic mugs bowls',                       description: 'Hand-thrown stoneware mugs, bowls, and planters.' },
    { id: 'DP-202', title: '[Sample] Bent Spruce Woodworks',     stalls: ['C2'],        type: 'Crafter/Artisan', keywords: 'wood cutting board bowl turning',                   description: 'Turned maple and walnut cutting boards, bowls, spoons.' },
    { id: 'DP-203', title: '[Sample] Iowa Goldsmith Collective', stalls: ['G1'],        type: 'Crafter/Artisan', keywords: 'jewelry earrings necklace bracelet',                description: 'Minimalist gold and silver jewelry, made by three Iowa artists.', featured: true },
    { id: 'DP-204', title: '[Sample] Sixth Street Soap',         stalls: ['G2'],        type: 'Crafter/Artisan', keywords: 'soap lotion bath body care',                        description: 'Cold-process soap, lotion bars, and unscented body butter.' },
    { id: 'DP-205', title: '[Sample] Riverlight Candles',        stalls: ['G3'],        type: 'Crafter/Artisan', keywords: 'candles wax melt essential oil',                    description: 'Hand-poured soy candles in small reusable jars.' },
    { id: 'DP-206', title: '[Sample] Stitch & Stripe',           stalls: ['G4'],        type: 'Crafter/Artisan', keywords: 'knit crochet yarn fiber',                           description: 'Hand-knit hats, mittens, and baby blankets.' },
    { id: 'DP-207', title: '[Sample] Dubuque Print Press',       stalls: ['G5'],        type: 'Crafter/Artisan', keywords: 'art print illustration card',                       description: 'Original linocut prints and letterpress greeting cards.' },
    { id: 'DP-208', title: '[Sample] Old Oak Leatherworks — Handmade Wallets, Belts, Portfolios, and Custom Dog Collars from Driftless Iowa', stalls: ['G6'], type: 'Crafter/Artisan', keywords: 'leather wallet belt purse', description: 'Hand-cut and saddle-stitched leather goods — wallets, belts, portfolios, and custom dog collars. Every piece is made from a single hide so the grain runs clean across the whole item.' }, // long-name edge case
    { id: 'DP-209', title: '[Sample] Backyard Forge',            stalls: ['G7'],        type: 'Crafter/Artisan', keywords: 'metal blacksmith iron',                             description: '' }, // no-description edge case

    // ---------- Occasional Vendor (muted sage markers) ----------
    { id: 'DP-301', title: '[Sample] Blue Heron Herbal',         stalls: ['G8'],        type: 'Occasional Vendor', keywords: 'herbal tincture wellness',                      description: 'Herbal tinctures and salves, first Saturday of the month.' },
    { id: 'DP-302', title: '[Sample] Tri-State Cider Press',     stalls: ['G9'],        type: 'Occasional Vendor', keywords: 'cider apple',                                    description: 'Pressed apple cider — here when the season permits.', url: 'https://example.com/tristate-cider' },

    // ---------- Multi-stall vendor (non-contiguous) ----------
    { id: 'DP-401', title: '[Sample] Westside Growers Co-op',    stalls: ['K1', 'K4'],  type: 'Grower/Producer/Processor', keywords: 'vegetables produce fruit csa',             description: 'A five-farm co-op sharing two stalls across the Farmer Row.' }, // non-contiguous block

    // ---------- SNAP / EBT edge case ----------
    { id: 'DP-501', title: '[Sample] DUFB Double Up Stand',      stalls: ['K2'],        type: 'Grower/Producer/Processor', keywords: 'snap ebt dufb double up food bucks vouchers', description: 'Match your SNAP / EBT dollars on fresh produce, up to $20 per visit.', snap: true, featured: true },
];

// ---------------------------------------------------------------------------
// Curated POI roster — covers all 8 POI types, including ones that don't
// appear in the real pois_REAL.geojson (Parking, Tokens, Market Merch).
// Coordinates are hand-placed near the real market footprint.
// ---------------------------------------------------------------------------
const CURATED_POIS = [
    // From the real file (selected)
    { title: 'Information Booth', poiType: 'Information',    description: 'Market info, stall map, lost-and-found.', lng: -90.66760734776521, lat: 42.50432669962233 },
    { title: 'Restrooms',         poiType: 'Restroom',       description: 'Public restrooms inside the Town Clock building.', lng: -90.6669, lat: 42.5043 },
    { title: 'Seating — Jubeck',  poiType: 'SeatingArea',    description: 'Picnic tables under the awning.',         lng: -90.66750276001707, lat: 42.50369417227883 },
    { title: 'Live Music Stage',  poiType: 'Special Event',  description: 'Saturday music, 9am–11am.',                lng: -90.66721927595437, lat: 42.50488055281747 },
    // Added for category coverage
    { title: 'Market Tokens',     poiType: 'Market Tokens',  description: 'Buy tokens here. Use them at any SNAP-accepting vendor.', lng: -90.6672, lat: 42.5041 },
    { title: 'Public Parking',    poiType: 'PublicParkingArea', description: 'Free weekend parking, Iowa Street ramp.', lng: -90.6685, lat: 42.5049 },
    { title: 'Market Merch',      poiType: 'Market Merchandise', description: 'DFM tote bags, enamel pins, posters.',   lng: -90.6673, lat: 42.5044 },
    { title: 'Vendor Parking',    poiType: 'VendorParkingArea', description: 'Vendors only — please leave this lot for market staff.', lng: -90.6690, lat: 42.5046 },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function buildStallLayouts(stallsGeo) {
    const seen = new Set();
    return stallsGeo.features
        .filter(f => {
            const id = (f.properties?.title || f.properties?.stallId || '').trim().toUpperCase();
            if (!id || seen.has(id)) return false;
            seen.add(id);
            return true;
        })
        .map(f => ({
            title: (f.properties?.title || f.properties?.stallId || '').trim(),
            geoJsonFeature: JSON.stringify(f),
        }));
}

function buildPOIs(curatedPois) {
    return curatedPois.map(p => ({
        title: p.title,
        poiType: p.poiType,
        description: p.description,
        geoJsonFeature: JSON.stringify({
            type: 'Feature',
            properties: {
                title: p.title,
                poiType: p.poiType,
                description: p.description,
            },
            geometry: {
                type: 'Point',
                coordinates: [p.lng, p.lat],
            },
        }),
    }));
}

function vendorObject(v) {
    return {
        _id: v.id,
        title: v.title,
        description: v.description || '',
        vendorType: v.type,
        arraystring: v.keywords || '',
        url: v.url || '',
        StallList: v.stalls,
        featured: !!v.featured,
        snap: !!v.snap,
    };
}

function buildVendorsByDate() {
    return {
        // Showcase: full roster
        [SHOWCASE_DATE]: CURATED_VENDORS.map(vendorObject),
        // Reduced: only 5 vendors — lets designer see a sparse map
        [REDUCED_DATE]: CURATED_VENDORS.slice(0, 5).map(vendorObject),
        // Empty: intentional no-vendors state
        [EMPTY_DATE]: [],
    };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
function main() {
    const stallsGeo = JSON.parse(fs.readFileSync(STALLS_PATH, 'utf8'));
    const stallLayouts = buildStallLayouts(stallsGeo);
    const pois = buildPOIs(CURATED_POIS);
    const vendorsByDate = buildVendorsByDate();

    // Sanity — every curated vendor references a stall that exists in the layout.
    const knownStalls = new Set(stallLayouts.map(s => s.title.toUpperCase()));
    const orphanStalls = new Set();
    for (const v of CURATED_VENDORS) {
        for (const s of v.stalls) {
            if (!knownStalls.has(s.toUpperCase())) orphanStalls.add(s);
        }
    }
    if (orphanStalls.size > 0) {
        console.warn(`Warning: curated vendor roster references ${orphanStalls.size} stall IDs not present in ${STALLS_PATH}:`, Array.from(orphanStalls).join(', '));
        console.warn('Those vendors will render without a marker until the stall is added to the layout or the curated list is updated.');
    }

    // This file is loaded in the iframe as a classic <script>, so we expose
    // the fixture as a window global rather than via ES module exports. The
    // iframe's design-preview bootstrap reads window.__DFM_DESIGN_PREVIEW.
    const js = `// AUTO-GENERATED by scripts/generateDesignPreviewFixture.js. Do not edit by hand.
// Regenerate with: npm run generate-design-preview
//
// This is the curated showcase fixture loaded by the design preview mode
// (?designPreview=1). It intentionally covers every vendor type, POI type,
// and edge-case label against real stall geometry.
//
// If you see "[Sample]" prefixed vendor names in production, something is
// very wrong — only ?designPreview=1 should ever load this file.
(function (root) {
    var STALL_LAYOUTS = ${JSON.stringify(stallLayouts)};
    var POIS = ${JSON.stringify(pois)};
    var VENDORS_BY_DATE = ${JSON.stringify(vendorsByDate)};
    var MARKET_DATES = ${JSON.stringify(MARKET_DATES)};
    var SHOWCASE_DATE = ${JSON.stringify(SHOWCASE_DATE)};

    root.__DFM_DESIGN_PREVIEW = {
        stallLayouts: STALL_LAYOUTS,
        pois: POIS,
        vendorsByDate: VENDORS_BY_DATE,
        marketDates: MARKET_DATES,
        defaultDate: SHOWCASE_DATE,
        vendorsForDate: function (dateStr) {
            return VENDORS_BY_DATE[dateStr] || [];
        }
    };
})(typeof window !== 'undefined' ? window : this);
`;

    fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
    fs.writeFileSync(OUTPUT_PATH, js, 'utf8');
    const vendorCount = CURATED_VENDORS.length;
    console.log(`Generated ${OUTPUT_PATH}`);
    console.log(`  Stalls: ${stallLayouts.length} (from real geometry)`);
    console.log(`  POIs:   ${pois.length} (curated)`);
    console.log(`  Dates:  ${MARKET_DATES.length} (showcase / reduced / empty)`);
    console.log(`  Vendors on showcase date: ${vendorCount}`);
}

main();
