// Velo Page Code for MAP page - Full Iframe Architecture
// All UI controls (date, search, filters) are inside vendor-map-full-ui.html
// This code only fetches data and communicates with the iframe via postMessage
import wixData from 'wix-data';
import wixLocation from 'wix-location-frontend';
import wixWindowFrontend from 'wix-window-frontend';
import { getTestStallLayouts, getTestPOIs, getTestVendorsForDate, getTestMarketDates } from 'public/marketTestData';

// Production: CMS-backed. Test mode can still be forced via `?testData=1` in
// the URL. Before flipping this in a deploy, run `await window.checkMapData()`
// on the dataParse admin page to verify the four map collections are
// populated (see docs/MAP_GUIDE.md → "Pre-flip checklist").
const USE_TEST_DATA_DEFAULT = false;

function isTestDataMode() {
    const urlParam = wixLocation.query && (wixLocation.query.testData === "1" || wixLocation.query.testData === "true");
    return urlParam || USE_TEST_DATA_DEFAULT;
}

// Design preview mode: self-contained fixture-only render for UI/UX review
// before real 2026 rosters are finalized. Activated via `?designPreview=1` on
// the PARENT page URL (not the iframe URL — Wix HtmlComponent doesn't inherit
// query params). When active, we skip every CMS query and every `loadMapData`
// postMessage, and just tell the iframe to bootstrap its own
// src/public/designPreviewData.js fixture. The state query param is forwarded
// so testers can share links like `?designPreview=1&state=empty`.
// See docs/MAP_DESIGN_SPEC.md for what this mode is expected to render.
function isDesignPreviewMode() {
    return !!(wixLocation.query && wixLocation.query.designPreview === "1");
}

function getDesignPreviewState() {
    if (!wixLocation.query) return "default";
    const raw = wixLocation.query.state;
    if (!raw) return "default";
    const allowed = ["default", "loading", "empty", "error", "offline", "locdenied", "longtext"];
    return allowed.indexOf(String(raw).toLowerCase()) >= 0 ? String(raw).toLowerCase() : "default";
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

// Pagination helper — Wix queries return max 1000 rows per page. At 2026
// season scale (~27 market dates × ~50 vendors + growth) single-page queries
// can silently truncate. This walks every page via hasNext/next.
async function fetchAllItems(queryBuilder, { pageSize = 1000, maxPages = 20 } = {}) {
    const items = [];
    let page = await queryBuilder.limit(pageSize).find();
    items.push(...(page.items || []));
    let pages = 1;
    while (page.hasNext && page.hasNext() && pages < maxPages) {
        page = await page.next();
        items.push(...(page.items || []));
        pages++;
    }
    return items;
}

// NOTE on postMessage origin: the Velo `$w('#HtmlComponent').postMessage(...)`
// and `.onMessage(...)` APIs are Wix-managed wrappers, not raw
// window.postMessage. Wix handles the cross-origin hop (parent ↔ iframe)
// internally, so we don't pass a targetOrigin here. Origin hardening for
// messages in the other direction (iframe → parent) lives in
// src/public/vendor-map-full-ui.html via an origin allowlist.
$w.onReady(function () {
    htmlComponent = $w(HTML_COMPONENT_ID);

    htmlComponent.onMessage(async (event) => {
        if (!event.data || !event.data.type) return;

        const { type, payload } = event.data;

        switch (type) {
            case "iframeReady":
                isMapIframeReady = true;
                if (isDesignPreviewMode()) {
                    htmlComponent.postMessage({
                        type: "enableDesignPreview",
                        payload: {
                            state: getDesignPreviewState(),
                            devToolbar: true
                        }
                    });
                    return;
                }
                await sendMarketDatesToIframe();
                await sendInitialDataToIframe();
                break;
            case "requestDateData":
                if (isDesignPreviewMode()) return;
                if (payload && payload.date) {
                    await loadAndSendDataToMap(payload.date);
                }
                break;
            case "requestLocation":
                if (isDesignPreviewMode()) return;
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
        const dateItems = await fetchAllItems(
            wixData.query(MARKET_DATES_COLLECTION).ascending("date")
        );

        const dateOptions = dateItems.map(item => {
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
            const [allStallLayouts, allPOIs] = await Promise.all([
                fetchAllItems(wixData.query(STALL_LAYOUTS_COLLECTION)),
                fetchAllItems(wixData.query(POIS_COLLECTION))
            ]);
            staticDataCache = { allStallLayouts, allPOIs };
        }

        let vendorsForDateArray = [];
        if (dateStringYYYYMMDD) {
            const parts = dateStringYYYYMMDD.split('-').map(part => parseInt(part, 10));
            const queryDate = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
            const queryEndDate = new Date(queryDate.getTime() + (24 * 60 * 60 * 1000));

            const attendanceItems = await fetchAllItems(
                wixData.query(MARKET_ATTENDANCE_COLLECTION)
                    .between("marketDate", queryDate, queryEndDate)
                    .include("vendorRef")
            );

            const vendorsForDateMap = new Map();
            for (const attendance of attendanceItems) {
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
