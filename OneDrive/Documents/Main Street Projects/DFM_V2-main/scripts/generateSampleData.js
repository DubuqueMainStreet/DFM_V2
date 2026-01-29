/**
 * Sample Data Generator for Dubuque Farmers' Market Map
 * Generates ~120 vendors, market attendance records, stall layouts, and POIs
 * 
 * Usage: node scripts/generateSampleData.js
 * Output: Creates CSV/JSON files in scripts/output/ directory
 */

// Dubuque Farmers Market approximate center coordinates
const MARKET_CENTER = { lat: 42.5000, lng: -90.6644 };

// Vendor types from the code
const VENDOR_TYPES = [
    "Grower/Producer/Processor",
    "On-site Prepared Food Vendor",
    "Crafter/Artisan",
    "Occasional Vendor"
];

// Product categories and keywords
const PRODUCT_CATEGORIES = {
    "Produce": {
        keywords: ["vegetables", "fruits", "organic", "fresh", "local", "snap ebt", "dufb double up food bucks"],
        vendorType: "Grower/Producer/Processor"
    },
    "Bakery": {
        keywords: ["bakery", "bread", "cookie", "pie", "cake", "sweet", "pastry", "donut", "muffin", "scone"],
        vendorType: "Grower/Producer/Processor"
    },
    "Coffee": {
        keywords: ["coffee", "espresso", "latte", "cappuccino", "cold brew", "roaster", "bean", "tea", "chai"],
        vendorType: "Grower/Producer/Processor"
    },
    "Meat": {
        keywords: ["meat", "beef", "pork", "chicken", "turkey", "lamb", "eggs", "poultry"],
        vendorType: "Grower/Producer/Processor"
    },
    "Dairy": {
        keywords: ["cheese", "dairy", "milk", "yogurt", "butter"],
        vendorType: "Grower/Producer/Processor"
    },
    "Prepared Food": {
        keywords: ["tacos", "burritos", "sandwich", "burger", "pizza", "crepe", "waffle", "ice cream"],
        vendorType: "On-site Prepared Food Vendor"
    },
    "Artisan": {
        keywords: ["pottery", "jewelry", "crafts", "artisan", "handmade", "textile", "wood", "glass"],
        vendorType: "Crafter/Artisan"
    },
    "Specialty": {
        keywords: ["honey", "beeswax", "jam", "jelly", "syrup", "salsa", "soap", "candle", "lotion"],
        vendorType: "Grower/Producer/Processor"
    }
};

// Farm/business name components
const FARM_PREFIXES = ["Green", "River", "Prairie", "Valley", "Meadow", "Hill", "Sunset", "Sunrise", "Cedar", "Oak", "Maple", "Willow", "Pine", "Birch", "Wild", "Happy", "Lucky", "Golden", "Silver", "Blue"];
const FARM_SUFFIXES = ["Farm", "Acres", "Gardens", "Fields", "Orchards", "Farmstead", "Ranch", "Homestead", "Grove", "Meadows"];
const BUSINESS_TYPES = ["Bakery", "Bakery Co.", "Coffee", "Coffee Co.", "Roasters", "Kitchen", "Kitchen Co.", "Crafts", "Crafts Co.", "Specialties", "Goods", "Market", "Stand", "Shop"];

// First names for artisan vendors
const FIRST_NAMES = ["Sarah", "Emily", "Michael", "David", "Jennifer", "Jessica", "Robert", "James", "Mary", "Patricia", "John", "William", "Linda", "Elizabeth", "Barbara", "Susan", "Joseph", "Thomas", "Nancy", "Karen"];

// Generate vendor names
function generateVendorName(index, category) {
    if (category === "Artisan") {
        const name = FIRST_NAMES[index % FIRST_NAMES.length];
        const business = BUSINESS_TYPES[Math.floor(Math.random() * BUSINESS_TYPES.length)];
        return `${name}'s ${business}`;
    } else if (category === "Prepared Food") {
        const prefixes = ["The", "Big", "Little", "Grandma's", "Aunt", "Uncle"];
        const foods = ["Taco Stand", "Burrito Bar", "Pizza Place", "Sandwich Shop", "Crepe Corner", "Waffle House", "Ice Cream Parlor", "BBQ Pit", "Burger Joint"];
        return `${prefixes[Math.floor(Math.random() * prefixes.length)]} ${foods[Math.floor(Math.random() * foods.length)]}`;
    } else {
        const prefix = FARM_PREFIXES[index % FARM_PREFIXES.length];
        const suffix = FARM_SUFFIXES[Math.floor(Math.random() * FARM_SUFFIXES.length)];
        return `${prefix} ${suffix}`;
    }
}

// Generate realistic descriptions
function generateDescription(name, category, keywords) {
    const descriptions = {
        "Produce": `Fresh ${keywords[0]} and seasonal produce grown locally. Specializing in organic and heirloom varieties.`,
        "Bakery": `Artisan ${keywords[0]} and sweet treats. Fresh baked daily using traditional methods and local ingredients.`,
        "Coffee": `Locally roasted ${keywords[0]} beans and specialty drinks. Fair trade and organic options available.`,
        "Meat": `Farm-fresh ${keywords[0]} and ${keywords[1] || 'poultry'}. All from our family farm just outside Dubuque.`,
        "Dairy": `Fresh ${keywords[0]} and dairy products from local farms. Supporting sustainable agriculture.`,
        "Prepared Food": `Fresh ${keywords[0]} made to order. Using locally sourced ingredients whenever possible.`,
        "Artisan": `Handmade ${keywords[0]} and unique gifts. Supporting local artists and craftspeople.`,
        "Specialty": `Local ${keywords[0]} and specialty products. Made with care and attention to quality.`
    };
    
    return descriptions[category] || `Quality products from ${name}. Supporting the local community.`;
}

// Generate stall IDs (A1-A50, B1-B50, etc.)
function generateStallId(index) {
    const row = String.fromCharCode(65 + Math.floor(index / 50)); // A, B, C, etc.
    const col = (index % 50) + 1;
    return `${row}${col}`;
}

// Generate GeoJSON Point for a stall (distributed around market center)
function generateStallGeoJSON(stallId, index) {
    // Create a grid pattern around the market center
    const row = Math.floor(index / 50);
    const col = index % 50;
    const latOffset = (row - 25) * 0.0001; // ~11 meters per unit
    const lngOffset = (col - 25) * 0.0001;
    
    const lat = MARKET_CENTER.lat + latOffset;
    const lng = MARKET_CENTER.lng + lngOffset;
    
    return {
        type: "Feature",
        properties: {
            title: stallId,
            stallId: stallId
        },
        geometry: {
            type: "Point",
            coordinates: [lng, lat]
        }
    };
}

// Generate vendors
function generateVendors(count = 120) {
    const vendors = [];
    const categories = Object.keys(PRODUCT_CATEGORIES);
    
    for (let i = 0; i < count; i++) {
        const category = categories[i % categories.length];
        const categoryData = PRODUCT_CATEGORIES[category];
        const name = generateVendorName(i, category);
        const keywords = categoryData.keywords.slice(0, Math.floor(Math.random() * 4) + 2);
        
        vendors.push({
            VendorID: `VENDOR-${String(i + 1).padStart(3, '0')}`,
            Vendor: name,
            VendorType: categoryData.vendorType,
            Description: generateDescription(name, category, keywords),
            Website: Math.random() > 0.7 ? `https://${name.toLowerCase().replace(/\s+/g, '')}.com` : null,
            Tags: keywords.join(", "),
            DefaultStall: generateStallId(i)
        });
    }
    
    return vendors;
}

// Generate MarketAttendance records
function generateMarketAttendance(vendors, startDate, numWeeks = 12) {
    const attendance = [];
    const start = new Date(startDate);
    
    for (let week = 0; week < numWeeks; week++) {
        const marketDate = new Date(start);
        marketDate.setUTCDate(marketDate.getUTCDate() + (week * 7));
        
        // Each week, assign ~80% of vendors (some vendors don't attend every week)
        const vendorsThisWeek = vendors.filter(() => Math.random() > 0.2);
        
        vendorsThisWeek.forEach((vendor, index) => {
            // Some vendors have multiple stalls
            const numStalls = Math.random() > 0.9 ? 2 : 1;
            const baseStallIndex = vendors.indexOf(vendor);
            
            for (let s = 0; s < numStalls; s++) {
                const stallId = generateStallId(baseStallIndex + s);
                attendance.push({
                    VendorID: vendor.VendorID,
                    Vendor: vendor.Vendor,
                    StartDate: marketDate.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }),
                    Stall: stallId,
                    NumberOfAssignedDays: 1
                });
            }
        });
    }
    
    return attendance;
}

// Generate StallLayouts GeoJSON
function generateStallLayouts(count = 200) {
    const features = [];
    
    for (let i = 0; i < count; i++) {
        const stallId = generateStallId(i);
        features.push(generateStallGeoJSON(stallId, i));
    }
    
    return {
        type: "FeatureCollection",
        features: features
    };
}

// Generate POIs
function generatePOIs() {
    const pois = [
        {
            title: "Public Parking Area",
            poiType: "PublicParkingArea",
            description: "Main public parking area for market visitors",
            coordinates: [MARKET_CENTER.lng - 0.0005, MARKET_CENTER.lat - 0.0005]
        },
        {
            title: "Vendor Parking",
            poiType: "VendorParkingArea",
            description: "Designated parking area for vendors",
            coordinates: [MARKET_CENTER.lng + 0.0005, MARKET_CENTER.lat - 0.0005]
        },
        {
            title: "Restroom",
            poiType: "Restroom",
            description: "Public restroom facilities",
            coordinates: [MARKET_CENTER.lng, MARKET_CENTER.lat + 0.0003]
        },
        {
            title: "Seating Area",
            poiType: "SeatingArea",
            description: "Public seating area for visitors",
            coordinates: [MARKET_CENTER.lng - 0.0002, MARKET_CENTER.lat]
        },
        {
            title: "Market Information",
            poiType: "Information",
            description: "Market information booth",
            coordinates: [MARKET_CENTER.lng, MARKET_CENTER.lat]
        },
        {
            title: "Market Tokens",
            poiType: "Market Tokens",
            description: "Purchase market tokens here",
            coordinates: [MARKET_CENTER.lng + 0.0002, MARKET_CENTER.lat]
        }
    ];
    
    return {
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
                coordinates: poi.coordinates
            }
        }))
    };
}

// Convert array to CSV
function arrayToCSV(data, headers) {
    const csvRows = [headers.join(',')];
    
    data.forEach(row => {
        const values = headers.map(header => {
            const value = row[header] || '';
            // Escape quotes and wrap in quotes if contains comma
            if (value.toString().includes(',') || value.toString().includes('"')) {
                return `"${value.toString().replace(/"/g, '""')}"`;
            }
            return value;
        });
        csvRows.push(values.join(','));
    });
    
    return csvRows.join('\n');
}

// Main execution
function main() {
    const fs = require('fs');
    const path = require('path');
    
    // Create output directory
    const outputDir = path.join(__dirname, 'output');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    
    console.log('Generating sample data...');
    
    // Generate vendors
    const vendors = generateVendors(120);
    console.log(`Generated ${vendors.length} vendors`);
    
    // Generate market attendance (starting from next Saturday)
    const today = new Date();
    const nextSaturday = new Date(today);
    nextSaturday.setUTCDate(today.getUTCDate() + (6 - today.getUTCDay() + 7) % 7);
    nextSaturday.setUTCHours(0, 0, 0, 0);
    
    const attendance = generateMarketAttendance(vendors, nextSaturday, 12);
    console.log(`Generated ${attendance.length} attendance records`);
    
    // Generate stall layouts
    const stallLayouts = generateStallLayouts(200);
    console.log(`Generated ${stallLayouts.features.length} stall layouts`);
    
    // Generate POIs
    const pois = generatePOIs();
    console.log(`Generated ${pois.features.length} POIs`);
    
    // Write CSV files
    const vendorCSV = arrayToCSV(vendors, ['VendorID', 'Vendor', 'VendorType', 'Description', 'Website', 'Tags', 'DefaultStall']);
    fs.writeFileSync(path.join(outputDir, 'vendors.csv'), vendorCSV);
    console.log('✓ Written vendors.csv');
    
    const attendanceCSV = arrayToCSV(attendance, ['VendorID', 'Vendor', 'StartDate', 'Stall', 'NumberOfAssignedDays']);
    fs.writeFileSync(path.join(outputDir, 'market_attendance.csv'), attendanceCSV);
    console.log('✓ Written market_attendance.csv');
    
    // Write JSON files
    fs.writeFileSync(path.join(outputDir, 'stall_layouts.geojson'), JSON.stringify(stallLayouts, null, 2));
    console.log('✓ Written stall_layouts.geojson');
    
    fs.writeFileSync(path.join(outputDir, 'pois.geojson'), JSON.stringify(pois, null, 2));
    console.log('✓ Written pois.geojson');
    
    // Write vendors as JSON for reference
    fs.writeFileSync(path.join(outputDir, 'vendors.json'), JSON.stringify(vendors, null, 2));
    console.log('✓ Written vendors.json');
    
    console.log('\n✅ Sample data generation complete!');
    console.log(`\nFiles created in: ${outputDir}`);
    console.log('\nNext steps:');
    console.log('1. Upload vendors.csv to importVendorRoster()');
    console.log('2. Upload market_attendance.csv to importStallAssignments()');
    console.log('3. Upload stall_layouts.geojson to importGeoJsonFeatures("StallLayouts")');
    console.log('4. Upload pois.geojson to importGeoJsonFeatures("POIs")');
}

if (require.main === module) {
    main();
}

module.exports = { generateVendors, generateMarketAttendance, generateStallLayouts, generatePOIs };
