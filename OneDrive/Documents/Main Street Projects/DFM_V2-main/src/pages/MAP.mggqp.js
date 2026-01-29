// In Velo Page Code for your MAP DISPLAY page
import wixData from 'wix-data';

// ----- Constants for your Collection IDs -----
const VENDORS_COLLECTION = "Vendors";
const MARKET_ATTENDANCE_COLLECTION = "MarketAttendance";
const STALL_LAYOUTS_COLLECTION = "StallLayouts";
const POIS_COLLECTION = "POIs";

// ----- HTML Component and UI Element IDs -----
const HTML_COMPONENT_ID = "#mapFrame";
const DATE_PICKER_ID = "#datepicker1";
const SEARCH_INPUT_ID = "#searchInput";
const CLEAR_ALL_BUTTON_ID = "#clearAllButton";

// Filter Button Configuration (Modern Agrarian - Deep Green Active State)
const FILTER_BUTTONS = [
    { id: "#readyToEatButton", type: "vendorType", val: "On-site Prepared Food Vendor" },
    { id: "#farmFreshProduceButton", type: "vendorType", val: "Grower/Producer/Processor" },
    { id: "#bakedGoodsSweetsButton", type: "keyword", val: "bakery bread cookie pie cake sweet pastry donut muffin scone" },
    { id: "#coffeeButton", type: "keyword", val: "coffee espresso latte cappuccino cold brew roaster bean tea chai" },
    { id: "#snapEBTButton", type: "keyword", val: "snap ebt dufb double up food bucks" },
    { id: "#informationButton", type: "poiType", val: "Information" },
    { id: "#specialEventButton", type: "poiType", val: "Special Event" },
    { id: "#marketMerchButton", type: "poiType", val: "Market Merchandise" },
    { id: "#restroomButton", type: "poiType", val: "Restroom"},
    { id: "#seatingButton", type: "poiType", val: "SeatingArea"},
    { id: "#parkingButton", type: "poiType", val: "PublicParkingArea"},
    { id: "#vendorParkingButton", type: "poiType", val: "VendorParkingArea" },
    { id: "#marketTokensButton", type: "poiType", val: "Market Tokens"}
];

// --- Global variables for state management ---
let htmlComponent;
let searchTimeoutId = null;
let activeHighlightButtonId = null;
let isMapIframeReady = false;
let currentlyLoadingDate = null;
let staticDataCache = null; // Caches non-date-specific data like stalls and POIs

// --- Modern Agrarian Styling for Active/Inactive Buttons ---
const ACTIVE_BUTTON_BG_COLOR = "#2D5016"; // Deep forest green (Modern Agrarian)
const INACTIVE_BUTTON_BG_COLOR = "#FFFFFF"; // Clean white
const ACTIVE_BUTTON_TEXT_COLOR = "#FFFFFF"; // White text on dark green for high contrast
const INACTIVE_BUTTON_TEXT_COLOR = "#2C2C2C"; // Charcoal text on white


$w.onReady(async function () {
    console.log("Velo (Map Page): Page Ready.");

    // --- Element Initialization ---
    htmlComponent = $w(HTML_COMPONENT_ID);
    const datePicker = $w(DATE_PICKER_ID);
    const searchInput = $w(SEARCH_INPUT_ID);
    const clearAllButton = $w(CLEAR_ALL_BUTTON_ID);

    // --- Configure Date Picker to only allow market dates ---
    try {
        const marketDatesResult = await wixData.query("MarketDates2026")
            .limit(1000)
            .find();
        
        const allowedDates = marketDatesResult.items
            .map(item => {
                const date = item.date;
                if (!date) return null;
                // Ensure date is a Date object
                const dateObj = date instanceof Date ? date : new Date(date);
                // Return date in YYYY-MM-DD format for allowedDates
                return dateObj.toISOString().split('T')[0];
            })
            .filter(date => date !== null);
        
        console.log(`Velo (Map Page): Configuring date picker with ${allowedDates.length} allowed dates.`);
        datePicker.allowedDates = allowedDates;
    } catch (error) {
        console.error("Velo (Map Page): Error loading market dates for date picker:", error);
        // Continue without restriction if there's an error
    }

    // --- Message Handling from HTML Component ---
    htmlComponent.onMessage(async (event) => {
        if (event.data && event.data.type === "iframeReady") {
            console.log("Velo (Map Page): Leaflet map iframe is ready.");
            isMapIframeReady = true;

            // Optimized date finding - use single query instead of loop
            let dateToLoad;
            if (datePicker.value) {
                dateToLoad = new Date(datePicker.value);
            } else {
                dateToLoad = await findNextMarketDate(new Date());
            }

            if (dateToLoad) {
                console.log("Velo (Map Page): Setting initial date to:", dateToLoad.toISOString().slice(0, 10));
                const originalOnChange = datePicker.onChange;
                datePicker.onChange(() => {});
                datePicker.value = dateToLoad;
                datePicker.onChange(originalOnChange);
                await loadAndSendDataToMap(formatDateToYYYYMMDD(dateToLoad));
            } else {
                console.warn("Velo (Map Page): No upcoming market data found. Loading empty map.");
                await loadAndSendDataToMap(null);
            }
        }
    });

    // --- UI Element Event Handlers ---
    datePicker.onChange(() => {
        if (datePicker.value && isMapIframeReady) {
            clearSearchAndHighlights(false); // Clear filters when date changes
            loadAndSendDataToMap(formatDateToYYYYMMDD(datePicker.value));
        }
    });

    searchInput.onInput(() => {
        if (searchTimeoutId) { clearTimeout(searchTimeoutId); }
        searchTimeoutId = setTimeout(() => {
            if (isMapIframeReady) {
                htmlComponent.postMessage({ type: "searchText", payload: { term: searchInput.value } });
                console.log(`Velo (Map Page): Sent 'searchText': ${searchInput.value}`);
            }
            if (searchInput.value && activeHighlightButtonId) {
                updateButtonActiveStyles(null);
            }
        }, 400); // Debounce for 400ms
    });

    clearAllButton.onClick(() => {
        clearSearchAndHighlights(true);
    });

    // --- Setup for all filter buttons ---
    FILTER_BUTTONS.forEach(config => {
        const btn = $w(config.id);
        if(btn && btn.onClick) {
            btn.onClick(() => handleHighlightButtonClick(config.id, config.type, config.val));
        } else if(btn) {
            console.warn(`Velo: Button with ID '${config.id}' found but onClick not available.`);
        }
    });
});


// Helper function to format a Date object to 'YYYY-MM-DD' string (UTC to avoid timezone issues)
function formatDateToYYYYMMDD(dateObject) {
    if (!dateObject) return null;
    const date = new Date(dateObject);
    // Use UTC methods to avoid timezone conversion issues
    const year = date.getUTCFullYear();
    const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
    const day = date.getUTCDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
}


// OPTIMIZED: Finds the next market date from MarketDates2026 collection
// Uses the same collection that musician/volunteer signups use
async function findNextMarketDate(startDate) {
    console.log("Velo (Map Page): Searching for next market date from MarketDates2026...");
    let today = new Date(startDate);
    today.setUTCHours(0, 0, 0, 0);
    console.log(`Velo (Map Page): Today's date for query: ${today.toISOString()}`);

    try {
        // Query MarketDates2026 collection (same as musician/volunteer forms use)
        const futureResult = await wixData.query('MarketDates2026')
            .ge("date", today)
            .ascending("date")
            .limit(1)
            .find();
            
        console.log(`Velo (Map Page): Future date query returned ${futureResult.items.length} items`);
        if (futureResult.items.length > 0) {
            // Parse date similar to how other forms do it
            let dateObj = futureResult.items[0].date;
            if (typeof dateObj === 'string') {
                const dateStr = dateObj.split('T')[0];
                const [year, month, day] = dateStr.split('-').map(Number);
                dateObj = new Date(year, month - 1, day, 12, 0, 0, 0);
            } else {
                dateObj = new Date(dateObj);
                dateObj.setHours(12, 0, 0, 0);
            }
            // Convert to UTC for consistency with MarketAttendance queries
            const utcDate = new Date(Date.UTC(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate()));
            console.log(`Velo (Map Page): Found next market date: ${utcDate.toISOString().slice(0,10)}`);
            return utcDate;
        }
        
        // Fallback: If no future dates, get the most recent past date
        console.log("Velo (Map Page): No future dates found, checking for most recent past date...");
        const pastResult = await wixData.query('MarketDates2026')
            .lt("date", today)
            .descending("date")
            .limit(1)
            .find();
            
        console.log(`Velo (Map Page): Past date query returned ${pastResult.items.length} items`);
        if (pastResult.items.length > 0) {
            let dateObj = pastResult.items[0].date;
            if (typeof dateObj === 'string') {
                const dateStr = dateObj.split('T')[0];
                const [year, month, day] = dateStr.split('-').map(Number);
                dateObj = new Date(year, month - 1, day, 12, 0, 0, 0);
            } else {
                dateObj = new Date(dateObj);
                dateObj.setHours(12, 0, 0, 0);
            }
            const utcDate = new Date(Date.UTC(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate()));
            console.log(`Velo (Map Page): Found most recent past date: ${utcDate.toISOString().slice(0,10)} (using for testing)`);
            return utcDate;
        }
        
        // Debug: Check if MarketDates2026 has ANY data at all
        const allDataCheck = await wixData.query('MarketDates2026')
            .ascending("date")
            .limit(10)
            .find();
        console.log(`Velo (Map Page): MarketDates2026 has ${allDataCheck.items.length} total records (checking first 10)`);
        if (allDataCheck.items.length > 0) {
            console.log(`Velo (Map Page): Sample dates from MarketDates2026:`, allDataCheck.items.map(item => {
                const d = typeof item.date === 'string' ? new Date(item.date.split('T')[0]) : new Date(item.date);
                return d.toISOString().slice(0,10);
            }));
            
            // Return the earliest date found
            let earliestDate = allDataCheck.items[0].date;
            if (typeof earliestDate === 'string') {
                const dateStr = earliestDate.split('T')[0];
                const [year, month, day] = dateStr.split('-').map(Number);
                earliestDate = new Date(year, month - 1, day, 12, 0, 0, 0);
            } else {
                earliestDate = new Date(earliestDate);
                earliestDate.setHours(12, 0, 0, 0);
            }
            const utcDate = new Date(Date.UTC(earliestDate.getFullYear(), earliestDate.getMonth(), earliestDate.getDate()));
            console.log(`Velo (Map Page): Using earliest date found: ${utcDate.toISOString().slice(0,10)}`);
            return utcDate;
        }
    } catch (e) {
        console.error("Velo (Map Page): Error finding date", e);
    }
    console.warn("Velo (Map Page): No market dates found (future or past).");
    return null;
}


// Main function to fetch all data from Wix Collections and send to the map
async function loadAndSendDataToMap(dateStringYYYYMMDD) {
    if (currentlyLoadingDate === dateStringYYYYMMDD) return;
    currentlyLoadingDate = dateStringYYYYMMDD;

    if (!isMapIframeReady) { console.warn("Velo (Map Page): Map iframe not ready, deferring data load."); return; }
    console.log(`Velo (Map Page): Loading data for date: ${dateStringYYYYMMDD || 'Empty Date (showing base map)'}`);
    htmlComponent.postMessage({ type: "mapLoading" });

    try {
        // Cache Static Data (Stalls/POIs) - Only fetch once per session using Promise.all for parallel loading
        if (!staticDataCache) {
            console.log("Velo (Map Page): Fetching and caching static data (Stalls, POIs)...");
            const [stallsResult, poisResult] = await Promise.all([
                wixData.query(STALL_LAYOUTS_COLLECTION).limit(1000).find(),
                wixData.query(POIS_COLLECTION).limit(1000).find()
            ]);
            staticDataCache = { allStallLayouts: stallsResult.items, allPOIs: poisResult.items };
            console.log(`Velo (Map Page): Cached ${staticDataCache.allStallLayouts.length} stalls and ${staticDataCache.allPOIs.length} POIs.`);
        }

        let vendorsForDateArray = [];
        if (dateStringYYYYMMDD) {
            const parts = dateStringYYYYMMDD.split('-').map(part => parseInt(part, 10));
            const queryDate = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
            const queryEndDate = new Date(queryDate.getTime() + (24 * 60 * 60 * 1000));

            const attendanceResult = await wixData.query(MARKET_ATTENDANCE_COLLECTION)
                .between("marketDate", queryDate, queryEndDate)
                .include("vendorRef").limit(1000).find();
            
            console.log(`Velo (Map Page): Found ${attendanceResult.items.length} attendance records for ${dateStringYYYYMMDD}.`);
            
            // Process attendance records into vendor map
            const vendorsForDateMap = new Map();
            attendanceResult.items.forEach(att => {
                if (att.vendorRef && att.stallId) {
                    const vid = att.vendorRef._id;
                    if (!vendorsForDateMap.has(vid)) {
                        vendorsForDateMap.set(vid, { ...att.vendorRef, StallList: [] });
                    }
                    // Clean Stall ID for consistency
                    const cleanedStall = att.stallId.trim().toUpperCase();
                    if (cleanedStall) {
                        vendorsForDateMap.get(vid).StallList.push(cleanedStall);
                    }
                }
            });
            vendorsForDateArray = Array.from(vendorsForDateMap.values());
            console.log(`Velo (Map Page): Processed ${vendorsForDateArray.length} unique vendors for this date.`);
        }

        const payload = {
            vendorsOnDate: vendorsForDateArray,
            allStallLayouts: staticDataCache.allStallLayouts,
            allPois: staticDataCache.allPOIs,
            currentDate: dateStringYYYYMMDD
        };

        htmlComponent.postMessage({ type: "loadMapData", payload });
        console.log(`Velo (Map Page): Data loaded for ${dateStringYYYYMMDD} (${vendorsForDateArray.length} vendors)`);

    } catch (error) {
        console.error(`Velo (Map Page): Error in loadAndSendDataToMap for date ${dateStringYYYYMMDD}:`, error);
        htmlComponent.postMessage({ type: "mapDataError", payload: { message: error.toString()} });
    } finally {
        currentlyLoadingDate = null;
    }
}


// --- Functions to manage filter buttons ---
function handleHighlightButtonClick(btnId, type, val) {
    if (!isMapIframeReady) { 
        console.warn("Velo: Iframe not ready, highlight click ignored."); 
        return; 
    }
    
    const searchInput = $w(SEARCH_INPUT_ID);

    if (activeHighlightButtonId === btnId) {
        // Toggle Off
        htmlComponent.postMessage({ type: "clearHighlight" });
        updateButtonActiveStyles(null);
    } else {
        // Toggle On
        htmlComponent.postMessage({ type: "setHighlight", payload: { type: type, id: val } });
        updateButtonActiveStyles(btnId);
        if (searchInput.value) {
            searchInput.value = "";
        }
    }
}

function updateButtonActiveStyles(activeId) {
    FILTER_BUTTONS.forEach(cfg => {
        const btn = $w(cfg.id);
        if(btn && btn.style) {
            const isActive = cfg.id === activeId;
            btn.style.backgroundColor = isActive ? ACTIVE_BUTTON_BG_COLOR : INACTIVE_BUTTON_BG_COLOR;
            btn.style.color = isActive ? ACTIVE_BUTTON_TEXT_COLOR : INACTIVE_BUTTON_TEXT_COLOR;
        }
    });
    activeHighlightButtonId = activeId;
}

function clearSearchAndHighlights(sendMessageToIframe = true) {
    if (sendMessageToIframe && isMapIframeReady) {
        htmlComponent.postMessage({ type: "clearHighlight" });
        console.log("Velo: Sent 'clearHighlight' from Clear All function");
    }
    const searchInput = $w(SEARCH_INPUT_ID);
    if (searchInput) searchInput.value = ""; 
    updateButtonActiveStyles(null); 
}