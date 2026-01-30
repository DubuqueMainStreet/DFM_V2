/**
 * Convert Real Stall Layout JSON to Wix Collection Format
 * Processes the Farmers Market Pins JSON file to extract:
 * - Stalls (with real coordinates)
 * - POIs (restrooms, parking, seating, etc.)
 */

const fs = require('fs');
const path = require('path');

// Read the real stall layout JSON
const realLayoutPath = path.join('C:', 'Users', 'daveb', 'Downloads', 'Farmers Market Pins (1).json');
const realLayout = JSON.parse(fs.readFileSync(realLayoutPath, 'utf8'));

// Categorize features
const stalls = [];
const pois = [];
const parkingBoundaries = [];
const seatingBoundaries = [];

realLayout.features.forEach(feature => {
    const name = feature.properties.name || '';
    const coords = feature.geometry.coordinates;
    
    // Extract stall ID (e.g., "A1", "B12", "K10")
    const stallMatch = name.match(/^([A-Z])(\d+)(\s|$|Tables|$)/);
    
    if (stallMatch) {
        // It's a stall
        const stallId = stallMatch[1] + stallMatch[2];
        stalls.push({
            title: stallId,
            coordinates: coords,
            name: name
        });
    } else if (name.toLowerCase().includes('parking') && name.toLowerCase().includes('boundary')) {
        // Parking boundary point
        parkingBoundaries.push({
            name: name,
            coordinates: coords
        });
    } else if (name.toLowerCase().includes('seating') && name.toLowerCase().includes('boundary')) {
        // Seating boundary point
        seatingBoundaries.push({
            name: name,
            coordinates: coords
        });
    } else {
        // POI (restrooms, ATM, music, tables, etc.)
        let poiType = 'Information';
        if (name.toLowerCase().includes('restroom')) poiType = 'Restroom';
        else if (name.toLowerCase().includes('parking')) poiType = name.toLowerCase().includes('vendor') ? 'VendorParkingArea' : 'PublicParkingArea';
        else if (name.toLowerCase().includes('seating')) poiType = 'SeatingArea';
        else if (name.toLowerCase().includes('atm')) poiType = 'Information';
        else if (name.toLowerCase().includes('music')) poiType = 'Special Event';
        else if (name.toLowerCase().includes('money') || name.toLowerCase().includes('market booth')) poiType = 'Market Tokens';
        else if (name.toLowerCase().includes('tables')) poiType = 'SeatingArea';
        else if (name.toLowerCase().includes('copper kettle') || name.toLowerCase().includes('nfp')) poiType = 'Information';
        
        pois.push({
            title: name,
            poiType: poiType,
            description: name,
            coordinates: coords
        });
    }
});

// Generate GeoJSON for stalls
const stallGeoJSON = {
    type: "FeatureCollection",
    features: stalls.map(stall => ({
        type: "Feature",
        properties: {
            title: stall.title,
            stallId: stall.title
        },
        geometry: {
            type: "Point",
            coordinates: [stall.coordinates[0], stall.coordinates[1]] // [lng, lat]
        }
    }))
};

// Generate GeoJSON for POIs
const poiGeoJSON = {
    type: "FeatureCollection",
    features: pois.map(poi => ({
        type: "Feature",
        properties: {
            title: poi.title,
            poiType: poi.poiType,
            description: poi.description
        },
        geometry: {
            type: "Point",
            coordinates: [poi.coordinates[0], poi.coordinates[1]] // [lng, lat]
        }
    }))
};

// Create output directory
const outputDir = path.join(__dirname, 'output');
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

// Write files
fs.writeFileSync(
    path.join(outputDir, 'stall_layouts_REAL.geojson'),
    JSON.stringify(stallGeoJSON, null, 2)
);

fs.writeFileSync(
    path.join(outputDir, 'pois_REAL.geojson'),
    JSON.stringify(poiGeoJSON, null, 2)
);

// Write stall list for reference
fs.writeFileSync(
    path.join(outputDir, 'stall_list_REAL.json'),
    JSON.stringify(stalls.map(s => ({ id: s.title, name: s.name, coords: s.coordinates })), null, 2)
);

console.log(`✅ Converted real stall layout:`);
console.log(`   - ${stalls.length} stalls`);
console.log(`   - ${pois.length} POIs`);
console.log(`   - ${parkingBoundaries.length} parking boundary points`);
console.log(`   - ${seatingBoundaries.length} seating boundary points`);
console.log(`\nFiles written to: ${outputDir}`);
