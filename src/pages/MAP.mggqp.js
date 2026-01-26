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

// Filter Button IDs
const READY_TO_EAT_BUTTON_ID = "#readyToEatButton";
const FARM_FRESH_PRODUCE_BUTTON_ID = "#farmFreshProduceButton";
const BAKED_GOODS_SWEETS_BUTTON_ID = "#bakedGoodsSweetsButton";
const COFFEE_BUTTON_ID = "#coffeeButton";
const SNAP_EBT_BUTTON_ID = "#snapEBTButton";
const INFORMATION_BUTTON_ID = "#informationButton";
const SPECIAL_EVENT_BUTTON_ID = "#specialEventButton";
const MARKET_MERCH_BUTTON_ID = "#marketMerchButton";
const RESTROOM_BUTTON_ID = "#restroomButton";
const PARKING_BUTTON_ID = "#parkingButton";
const SEATING_BUTTON_ID = "#seatingButton";
const VENDOR_PARKING_BUTTON_ID = "#vendorParkingButton";
const MARKET_TOKENS_BUTTON_ID = "#marketTokensButton";

// --- Global variables for state management ---
let htmlComponent;
let searchTimeoutId = null;
let activeHighlightButtonId = null;
let isMapIframeReady = false;
let currentlyLoadingDate = null;
let staticDataCache = null; // Caches non-date-specific data like stalls and POIs

// --- Styling for Active/Inactive Buttons ---
const ACTIVE_BUTTON_BG_COLOR = "#A0DCA0"; // A light green for active
const INACTIVE_BUTTON_BG_COLOR = "#FFFFFF"; // Default white
const ACTIVE_BUTTON_TEXT_COLOR = "#000000";
const INACTIVE_BUTTON_TEXT_COLOR = "#000000";


$w.onReady(function () {
    console.log("Velo (Map Page): Page Ready.");

    // --- Element Initialization ---
    htmlComponent = $w(HTML_COMPONENT_ID);
    const datePicker = $w(DATE_PICKER_ID);
    const searchInput = $w(SEARCH_INPUT_ID);
    const clearAllButton = $w(CLEAR_ALL_BUTTON_ID);

    // --- Message Handling from HTML Component ---
    htmlComponent.onMessage(async (event) => {
        if (event.data && event.data.type === "iframeReady" && event.data.payload.status === "htmlComponentLoaded") {
            console.log("Velo (Map Page): Leaflet map iframe is ready.");
            isMapIframeReady = true;

            const dateToLoad = datePicker.value ? new Date(datePicker.value) : await findNextSaturdayWithData(new Date());

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
    setupHighlightButtons();
});


// Helper function to format a Date object to 'YYYY-MM-DD' string
function formatDateToYYYYMMDD(dateObject) {
    if (!dateObject) return null;
    const date = new Date(dateObject);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
}


// Finds the next upcoming Saturday that has attendance data
async function findNextSaturdayWithData(startDate) {
    console.log("Velo (Map Page - findNext): Searching for next Saturday with data...");
    let currentDate = new Date(startDate.getTime());
    currentDate.setUTCHours(0, 0, 0, 0);

    for (let i = 0; i < 12; i++) { // Search up to 12 weeks ahead
        let potentialMarketDate = new Date(currentDate.valueOf());
        const dayOfWeek = potentialMarketDate.getUTCDay();
        const daysUntilSaturday = (6 - dayOfWeek + 7) % 7;
        potentialMarketDate.setUTCDate(potentialMarketDate.getUTCDate() + daysUntilSaturday);

        const queryStart = new Date(Date.UTC(potentialMarketDate.getUTCFullYear(), potentialMarketDate.getUTCMonth(), potentialMarketDate.getUTCDate()));
        const queryEnd = new Date(queryStart.getTime() + (24 * 60 * 60 * 1000));
        
        console.log(`Velo (Map Page - findNext): Checking for data on ${queryStart.toISOString().slice(0,10)}`);
        const attendanceCheck = await wixData.query(MARKET_ATTENDANCE_COLLECTION)
            .between("marketDate", queryStart, queryEnd).limit(1).find();

        if (attendanceCheck.items.length > 0) {
            console.log(`Velo (Map Page - findNext): Found data for ${queryStart.toISOString().slice(0,10)}`);
            return potentialMarketDate;
        }
        currentDate.setUTCDate(potentialMarketDate.getUTCDate() + 1); // Move to next day to start search for next week
    }
    console.warn("Velo (Map Page - findNext): No Saturday with data found in the next 12 attempts.");
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
        if (!staticDataCache) {
            console.log("Velo (Map Page): Fetching and caching static data (Stalls, POIs)...");
            const stallsResult = await wixData.query(STALL_LAYOUTS_COLLECTION).limit(1000).find();
            const poisResult = await wixData.query(POIS_COLLECTION).limit(1000).find();
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
            
            const vendorsForDateMap = new Map();
            for (const attendance of attendanceResult.items) {
                if (attendance.vendorRef && attendance.stallId) {
                    const vendorDetails = attendance.vendorRef;
                    const cleanedStall = attendance.stallId.trim().toUpperCase(); // Clean stall ID from attendance
                    if (!cleanedStall) continue;

                    if (!vendorsForDateMap.has(vendorDetails._id)) {
                        vendorsForDateMap.set(vendorDetails._id, { ...vendorDetails, StallList: [] });
                    }
                    vendorsForDateMap.get(vendorDetails._id).StallList.push(cleanedStall);
                }
            }
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
        console.log("Velo (Map Page): Sent 'loadMapData' to iframe.");

    } catch (error) {
        console.error(`Velo (Map Page): Error in loadAndSendDataToMap for date ${dateStringYYYYMMDD}:`, error);
        htmlComponent.postMessage({ type: "mapDataError", payload: { message: error.toString()} });
    } finally {
        currentlyLoadingDate = null;
    }
}


// --- Functions to manage filter buttons ---
function setupHighlightButtons() {
    const highlightButtonConfigs = [
        { idSelector: READY_TO_EAT_BUTTON_ID, typeForIframe: "vendorType", valueForIframe: "On-site Prepared Food Vendor" },
        { idSelector: FARM_FRESH_PRODUCE_BUTTON_ID, typeForIframe: "vendorType", valueForIframe: "Grower/Producer/Processor" },
        { idSelector: BAKED_GOODS_SWEETS_BUTTON_ID, typeForIframe: "keyword", valueForIframe: "bakery bread cookie pie cake sweet pastry donut muffin scone" },
        { idSelector: COFFEE_BUTTON_ID, typeForIframe: "keyword", valueForIframe: "coffee espresso latte cappuccino cold brew roaster bean tea chai" },
        { idSelector: SNAP_EBT_BUTTON_ID, typeForIframe: "keyword", valueForIframe: "snap ebt dufb double up food bucks" },
        { idSelector: INFORMATION_BUTTON_ID, typeForIframe: "poiType", valueForIframe: "Information" },
        { idSelector: SPECIAL_EVENT_BUTTON_ID, typeForIframe: "poiType", valueForIframe: "Special Event" },
        { idSelector: MARKET_MERCH_BUTTON_ID, typeForIframe: "poiType", valueForIframe: "Market Merchandise" },
        { idSelector: RESTROOM_BUTTON_ID, typeForIframe: "poiType", valueForIframe: "Restroom"},
        { idSelector: SEATING_BUTTON_ID, typeForIframe: "poiType", valueForIframe: "SeatingArea"},
        { idSelector: PARKING_BUTTON_ID, typeForIframe: "poiType", valueForIframe: "PublicParkingArea"},
        { idSelector: VENDOR_PARKING_BUTTON_ID, typeForIframe: "poiType", valueForIframe: "VendorParkingArea" },
        { idSelector: MARKET_TOKENS_BUTTON_ID, typeForIframe: "poiType", valueForIframe: "Market Tokens"}
    ];

    highlightButtonConfigs.forEach(config => {
        const button = $w(config.idSelector);
        if (button && button.onClick) {
            button.onClick(() => handleHighlightButtonClick(button, config.typeForIframe, config.valueForIframe));
        } else {
             console.warn(`Velo: Button with ID '${config.idSelector}' not found or does not have onClick property.`);
        }
    });
}

function handleHighlightButtonClick(clickedButtonElement, criteriaType, valueToHighlight) {
    if (!isMapIframeReady) { console.warn("Velo: Iframe not ready, highlight click ignored."); return; }
    
    const clickedButtonIdSelector = `#${clickedButtonElement.id}`;
    const searchInput = $w(SEARCH_INPUT_ID);

    if (activeHighlightButtonId === clickedButtonIdSelector) { 
        htmlComponent.postMessage({ type: "clearHighlight" });
        console.log(`Velo: Sent 'clearHighlight' from toggling OFF ${clickedButtonIdSelector}`);
        updateButtonActiveStyles(null); 
    } else { 
        htmlComponent.postMessage({ type: "setHighlight", payload: { type: criteriaType, id: valueToHighlight } });
        console.log(`Velo: Sent 'setHighlight': {type: "${criteriaType}", id: "${valueToHighlight}"} from ${clickedButtonIdSelector}`);
        updateButtonActiveStyles(clickedButtonIdSelector); 
        if (searchInput.value) { 
             searchInput.value = ""; 
        }
    }
}

function updateButtonActiveStyles(newlyActivatedButtonIdSelector) {
    const allHighlightableButtonIds = [
        READY_TO_EAT_BUTTON_ID, FARM_FRESH_PRODUCE_BUTTON_ID, BAKED_GOODS_SWEETS_BUTTON_ID, COFFEE_BUTTON_ID, 
        SNAP_EBT_BUTTON_ID, INFORMATION_BUTTON_ID, SPECIAL_EVENT_BUTTON_ID, MARKET_MERCH_BUTTON_ID, RESTROOM_BUTTON_ID, 
        PARKING_BUTTON_ID, SEATING_BUTTON_ID, VENDOR_PARKING_BUTTON_ID, MARKET_TOKENS_BUTTON_ID
    ];

    allHighlightableButtonIds.forEach(buttonIdSelector => {
        const button = $w(buttonIdSelector);
        if (button && button.style) { 
            const isActive = buttonIdSelector === newlyActivatedButtonIdSelector;
            button.style.backgroundColor = isActive ? ACTIVE_BUTTON_BG_COLOR : INACTIVE_BUTTON_BG_COLOR;
            button.style.color = isActive ? ACTIVE_BUTTON_TEXT_COLOR : INACTIVE_BUTTON_TEXT_COLOR;
        }
    });
    activeHighlightButtonId = newlyActivatedButtonIdSelector;
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