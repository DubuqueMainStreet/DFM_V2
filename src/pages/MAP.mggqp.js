// Velo Page Code for MAP page - Full Iframe Architecture
// All UI controls (date, search, filters) are inside vendor-map-full-ui.html
// This code only fetches data and communicates with the iframe via postMessage
import wixData from 'wix-data';
import wixLocation from 'wix-location-frontend';
import wixWindowFrontend from 'wix-window-frontend';
import { getTestStallLayouts, getTestPOIs, getTestVendorsForDate, getTestMarketDates } from 'public/marketTestData';

// Set to true to use mock data when CMS is empty. Set to false when you have real data.
// You can also use ?testData=1 in the URL to force test mode regardless of this setting.
const USE_TEST_DATA_DEFAULT = true;

function isTestDataMode() {
    const urlParam = wixLocation.query && (wixLocation.query.testData === "1" || wixLocation.query.testData === "true");
    return urlParam || USE_TEST_DATA_DEFAULT;
}

const MARKET_DATES_COLLECTION = "MarketDates2026";
const MARKET_ATTENDANCE_COLLECTION = "MarketAttendance";
const STALL_LAYOUTS_COLLECTION = "StallLayouts";
const POIS_COLLECTION = "POIs";

const HTML_COMPONENT_ID = "#mapFrame";

let htmlComponent;
let isMapIframeReady = false;
let currentlyLoadingDate = null;
let staticDataCache = null;

$w.onReady(function () {
    htmlComponent = $w(HTML_COMPONENT_ID);

    htmlComponent.onMessage(async (event) => {
        if (!event.data || !event.data.type) return;

        const { type, payload } = event.data;

        switch (type) {
            case "iframeReady":
                isMapIframeReady = true;
                await sendMarketDatesToIframe();
                await sendInitialDataToIframe();
                break;
            case "requestDateData":
                if (payload && payload.date) {
                    await loadAndSendDataToMap(payload.date);
                }
                break;
            case "requestLocation":
                handleLocationRequest();
                break;
        }
    });
});

// Geolocation runs in the parent (Wix) context so the permission prompt is allowed.
// The iframe cannot use navigator.geolocation due to Permissions Policy when embedded.
// In Wix Editor/Preview, navigator.geolocation is often undefined; use Wix's API.
function handleLocationRequest() {
    if (!htmlComponent) return;

    wixWindowFrontend.getCurrentGeolocation()
        .then((obj) => {
            const { latitude, longitude, accuracy } = obj.coords || {};
            if (typeof latitude !== 'number' || typeof longitude !== 'number') {
                htmlComponent.postMessage({ type: "locationError", payload: { message: "Could not get location" } });
                return;
            }
            htmlComponent.postMessage({
                type: "locationResult",
                payload: {
                    latitude,
                    longitude,
                    accuracy: typeof accuracy === 'number' ? accuracy : 50
                }
            });
        })
        .catch(() => {
            htmlComponent.postMessage({ type: "locationError", payload: { message: "Could not get location" } });
        });
}

function formatDateToYYYYMMDD(dateObject) {
    if (!dateObject) return null;
    const date = new Date(dateObject);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
}

async function findNextSaturdayWithData(startDate) {
    let currentDate = new Date(startDate.getTime());
    currentDate.setUTCHours(0, 0, 0, 0);

    for (let i = 0; i < 8; i++) {
        let potentialMarketDate = new Date(currentDate.valueOf());
        const dayOfWeek = potentialMarketDate.getUTCDay();
        const daysUntilSaturday = (6 - dayOfWeek + 7) % 7;
        potentialMarketDate.setUTCDate(potentialMarketDate.getUTCDate() + daysUntilSaturday);

        const queryStart = new Date(Date.UTC(potentialMarketDate.getUTCFullYear(), potentialMarketDate.getUTCMonth(), potentialMarketDate.getUTCDate()));
        const queryEnd = new Date(queryStart.getTime() + (24 * 60 * 60 * 1000));

        const attendanceCheck = await wixData.query(MARKET_ATTENDANCE_COLLECTION)
            .between("marketDate", queryStart, queryEnd).limit(1).find();

        if (attendanceCheck.items.length > 0) {
            return potentialMarketDate;
        }
        currentDate.setUTCDate(potentialMarketDate.getUTCDate() + 1);
    }
    return null;
}

async function sendMarketDatesToIframe() {
    if (!isMapIframeReady) return;

    if (isTestDataMode()) {
        const dateOptions = getTestMarketDates();
        htmlComponent.postMessage({
            type: "setMarketDates",
            payload: { dates: dateOptions }
        });
        return;
    }

    try {
        const datesResult = await wixData.query(MARKET_DATES_COLLECTION)
            .ascending("date")
            .limit(1000)
            .find();

        const dateOptions = (datesResult.items || []).map(item => {
            const d = item.date ? new Date(item.date) : null;
            if (!d) return null;
            const value = formatDateToYYYYMMDD(d);
            const label = item.title || d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
            return { value, label };
        }).filter(Boolean);

        htmlComponent.postMessage({
            type: "setMarketDates",
            payload: { dates: dateOptions }
        });
    } catch (error) {
        htmlComponent.postMessage({
            type: "setMarketDates",
            payload: { dates: getTestMarketDates() }
        });
    }
}

async function sendInitialDataToIframe() {
    if (isTestDataMode()) {
        const testDates = getTestMarketDates();
        const dateToLoad = testDates.length > 0 ? testDates[0].value : null;
        await loadAndSendDataToMap(dateToLoad);
        return;
    }
    const nextSaturday = await findNextSaturdayWithData(new Date());
    const dateToLoad = nextSaturday ? formatDateToYYYYMMDD(nextSaturday) : null;
    await loadAndSendDataToMap(dateToLoad);
}

async function loadAndSendDataToMap(dateStringYYYYMMDD) {
    if (currentlyLoadingDate === dateStringYYYYMMDD) return;
    currentlyLoadingDate = dateStringYYYYMMDD;

    if (!isMapIframeReady) return;

    htmlComponent.postMessage({ type: "mapLoading" });

    try {
        if (isTestDataMode()) {
            const allStallLayouts = getTestStallLayouts();
            const allPOIs = getTestPOIs();
            const vendorsOnDate = dateStringYYYYMMDD ? getTestVendorsForDate(dateStringYYYYMMDD) : [];
            htmlComponent.postMessage({
                type: "loadMapData",
                payload: {
                    vendorsOnDate,
                    allStallLayouts,
                    allPois: allPOIs,
                    currentDate: dateStringYYYYMMDD,
                    isTestData: true
                }
            });
            return;
        }

        if (!staticDataCache) {
            const stallsResult = await wixData.query(STALL_LAYOUTS_COLLECTION).limit(1000).find();
            const poisResult = await wixData.query(POIS_COLLECTION).limit(1000).find();
            staticDataCache = { allStallLayouts: stallsResult.items, allPOIs: poisResult.items };
        }

        let vendorsForDateArray = [];
        if (dateStringYYYYMMDD) {
            const parts = dateStringYYYYMMDD.split('-').map(part => parseInt(part, 10));
            const queryDate = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
            const queryEndDate = new Date(queryDate.getTime() + (24 * 60 * 60 * 1000));

            const attendanceResult = await wixData.query(MARKET_ATTENDANCE_COLLECTION)
                .between("marketDate", queryDate, queryEndDate)
                .include("vendorRef").limit(1000).find();

            const vendorsForDateMap = new Map();
            for (const attendance of attendanceResult.items) {
                if (attendance.vendorRef && attendance.stallId) {
                    const vendorDetails = attendance.vendorRef;
                    const cleanedStall = attendance.stallId.trim().toUpperCase();
                    if (!cleanedStall) continue;

                    if (!vendorsForDateMap.has(vendorDetails._id)) {
                        vendorsForDateMap.set(vendorDetails._id, { ...vendorDetails, StallList: [] });
                    }
                    vendorsForDateMap.get(vendorDetails._id).StallList.push(cleanedStall);
                }
            }
            vendorsForDateArray = Array.from(vendorsForDateMap.values());
        }

        htmlComponent.postMessage({
            type: "loadMapData",
            payload: {
                vendorsOnDate: vendorsForDateArray,
                allStallLayouts: staticDataCache.allStallLayouts,
                allPois: staticDataCache.allPOIs,
                currentDate: dateStringYYYYMMDD
            }
        });
    } catch (error) {
        htmlComponent.postMessage({
            type: "mapDataError",
            payload: { message: error.toString() }
        });
    } finally {
        currentlyLoadingDate = null;
    }
}
