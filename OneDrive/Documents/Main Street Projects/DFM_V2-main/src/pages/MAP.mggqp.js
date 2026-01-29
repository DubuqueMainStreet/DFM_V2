// Velo Page Code for MAP page - Full Iframe Architecture
// All UI controls (date, search, filters) are handled within the iframe
// This code only manages data fetching and communication with the iframe

import wixData from 'wix-data';

// ----- Constants for Collection IDs -----
const VENDORS_COLLECTION = "Vendors";
const MARKET_ATTENDANCE_COLLECTION = "MarketAttendance";
const STALL_LAYOUTS_COLLECTION = "StallLayouts";
const POIS_COLLECTION = "POIs";
const MARKET_DATES_COLLECTION = "MarketDates2026";

// ----- HTML Component ID -----
const HTML_COMPONENT_ID = "#mapFrame";

// --- Global State ---
let htmlComponent;
let isMapIframeReady = false;
let currentlyLoadingDate = null;
let staticDataCache = null;

$w.onReady(async function () {
    console.log("Velo (Map Page): Page Ready.");
    
    htmlComponent = $w(HTML_COMPONENT_ID);
    
    // --- Message Handling from HTML Component ---
    htmlComponent.onMessage(async (event) => {
        if (!event.data || !event.data.type) return;
        
        const { type, payload } = event.data;
        console.log(`Velo (Map Page): Received message: ${type}`);
        
        switch (type) {
            case "iframeReady":
                console.log("Velo (Map Page): Iframe is ready.");
                isMapIframeReady = true;
                await sendMarketDatesToIframe();
                await sendInitialDataToIframe();
                break;
                
            case "requestDateData":
                if (payload?.date) {
                    console.log(`Velo (Map Page): Iframe requested data for: ${payload.date}`);
                    await loadAndSendDataToMap(payload.date);
                }
                break;
        }
    });
});


// Send all market dates to the iframe for the dropdown
async function sendMarketDatesToIframe() {
    console.log("Velo (Map Page): Fetching market dates...");
    
    try {
        const marketDatesResult = await wixData.query(MARKET_DATES_COLLECTION)
            .ascending("date")
            .limit(1000)
            .find();
        
        const dateOptions = marketDatesResult.items
            .map(item => {
                if (!item.date) return null;
                
                // Parse date properly to avoid timezone issues
                let dateObj;
                if (typeof item.date === 'string') {
                    const dateStr = item.date.split('T')[0];
                    const [year, month, day] = dateStr.split('-').map(Number);
                    dateObj = new Date(year, month - 1, day, 12, 0, 0, 0);
                } else {
                    dateObj = new Date(item.date);
                    dateObj.setHours(12, 0, 0, 0);
                }
                
                return {
                    label: dateObj.toLocaleDateString('en-US', { 
                        weekday: 'short',
                        month: 'short', 
                        day: 'numeric',
                        year: 'numeric'
                    }),
                    value: dateObj.toISOString().split('T')[0] // YYYY-MM-DD format
                };
            })
            .filter(item => item !== null);
        
        console.log(`Velo (Map Page): Sending ${dateOptions.length} market dates to iframe.`);
        htmlComponent.postMessage({ 
            type: "setMarketDates", 
            payload: { dates: dateOptions } 
        });
        
        return dateOptions;
        
    } catch (error) {
        console.error("Velo (Map Page): Error fetching market dates:", error);
        return [];
    }
}


// Send initial data (first available date) to the iframe
async function sendInitialDataToIframe() {
    const firstDate = await findNextMarketDate(new Date());
    
    if (firstDate) {
        const dateStr = formatDateToYYYYMMDD(firstDate);
        console.log(`Velo (Map Page): Loading initial data for: ${dateStr}`);
        await loadAndSendDataToMap(dateStr);
    } else {
        console.warn("Velo (Map Page): No market dates found. Loading empty map.");
        await loadAndSendDataToMap(null);
    }
}


// Format a Date object to 'YYYY-MM-DD' string
function formatDateToYYYYMMDD(dateObject) {
    if (!dateObject) return null;
    const date = new Date(dateObject);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
}


// Find the next upcoming market date (or most recent if none upcoming)
async function findNextMarketDate(startDate) {
    const today = new Date(startDate);
    today.setHours(0, 0, 0, 0);
    
    try {
        // Try to find a future date first
        const futureResult = await wixData.query(MARKET_DATES_COLLECTION)
            .ge("date", today)
            .ascending("date")
            .limit(1)
            .find();
        
        if (futureResult.items.length > 0) {
            return parseCollectionDate(futureResult.items[0].date);
        }
        
        // Fallback: Get most recent past date (for testing)
        const pastResult = await wixData.query(MARKET_DATES_COLLECTION)
            .lt("date", today)
            .descending("date")
            .limit(1)
            .find();
        
        if (pastResult.items.length > 0) {
            return parseCollectionDate(pastResult.items[0].date);
        }
        
        // Last resort: Get any date from the collection
        const anyResult = await wixData.query(MARKET_DATES_COLLECTION)
            .ascending("date")
            .limit(1)
            .find();
        
        if (anyResult.items.length > 0) {
            return parseCollectionDate(anyResult.items[0].date);
        }
        
    } catch (error) {
        console.error("Velo (Map Page): Error finding market date:", error);
    }
    
    return null;
}


// Parse a date from Wix collection (handles both string and Date object)
function parseCollectionDate(dateValue) {
    if (!dateValue) return null;
    
    let dateObj;
    if (typeof dateValue === 'string') {
        const dateStr = dateValue.split('T')[0];
        const [year, month, day] = dateStr.split('-').map(Number);
        dateObj = new Date(year, month - 1, day, 12, 0, 0, 0);
    } else {
        dateObj = new Date(dateValue);
        dateObj.setHours(12, 0, 0, 0);
    }
    
    return dateObj;
}


// Main data loading function - fetches all data and sends to iframe
async function loadAndSendDataToMap(dateStringYYYYMMDD) {
    // Prevent duplicate loads
    if (currentlyLoadingDate === dateStringYYYYMMDD) return;
    currentlyLoadingDate = dateStringYYYYMMDD;
    
    if (!isMapIframeReady) {
        console.warn("Velo (Map Page): Iframe not ready, deferring data load.");
        currentlyLoadingDate = null;
        return;
    }
    
    console.log(`Velo (Map Page): Loading data for: ${dateStringYYYYMMDD || '(no date)'}`);
    
    try {
        // Cache static data (stalls/POIs) - only fetch once per session
        if (!staticDataCache) {
            console.log("Velo (Map Page): Fetching static data (stalls, POIs)...");
            
            const [stallsResult, poisResult] = await Promise.all([
                wixData.query(STALL_LAYOUTS_COLLECTION).limit(1000).find(),
                wixData.query(POIS_COLLECTION).limit(1000).find()
            ]);
            
            staticDataCache = {
                allStallLayouts: stallsResult.items,
                allPOIs: poisResult.items
            };
            
            console.log(`Velo (Map Page): Cached ${staticDataCache.allStallLayouts.length} stalls, ${staticDataCache.allPOIs.length} POIs.`);
        }
        
        // Fetch vendors for the selected date
        let vendorsForDate = [];
        
        if (dateStringYYYYMMDD) {
            const [year, month, day] = dateStringYYYYMMDD.split('-').map(Number);
            const queryDate = new Date(Date.UTC(year, month - 1, day));
            const queryEndDate = new Date(queryDate.getTime() + 24 * 60 * 60 * 1000);
            
            const attendanceResult = await wixData.query(MARKET_ATTENDANCE_COLLECTION)
                .between("marketDate", queryDate, queryEndDate)
                .include("vendorRef")
                .limit(1000)
                .find();
            
            console.log(`Velo (Map Page): Found ${attendanceResult.items.length} attendance records.`);
            
            // Group by vendor and collect stall IDs
            const vendorMap = new Map();
            
            attendanceResult.items.forEach(record => {
                if (!record.vendorRef || !record.stallId) return;
                
                const vendorId = record.vendorRef._id;
                
                if (!vendorMap.has(vendorId)) {
                    vendorMap.set(vendorId, {
                        ...record.vendorRef,
                        StallList: []
                    });
                }
                
                const cleanStallId = record.stallId.trim().toUpperCase();
                if (cleanStallId) {
                    vendorMap.get(vendorId).StallList.push(cleanStallId);
                }
            });
            
            vendorsForDate = Array.from(vendorMap.values());
            console.log(`Velo (Map Page): Processed ${vendorsForDate.length} vendors.`);
        }
        
        // Send data to iframe
        htmlComponent.postMessage({
            type: "loadMapData",
            payload: {
                vendorsOnDate: vendorsForDate,
                allStallLayouts: staticDataCache.allStallLayouts,
                allPois: staticDataCache.allPOIs,
                currentDate: dateStringYYYYMMDD
            }
        });
        
        console.log(`Velo (Map Page): Data sent to iframe for ${dateStringYYYYMMDD}.`);
        
    } catch (error) {
        console.error(`Velo (Map Page): Error loading data:`, error);
    } finally {
        currentlyLoadingDate = null;
    }
}
