// In your Admin Page's Velo Code (e.g., dataParse.js)
import { 
    importVendorRoster, 
    updateVendorDetailsFromRequests, 
    importStallAssignments,
    importGeoJsonFeatures,
    clearAttendanceForDateRange, 
    testVendorsCollectionQuery 
} from 'backend/importData'; 

$w.onReady(function () {
    console.log("Admin page ready.");

    // --- Vendor Roster Import ---
    $w("#importVendorRosterButton").onClick(async () => {
        const csvUrl = $w("#importVendorRosterInput").value; 
        const statusElement = $w("#vendorRosterStatusText");
        if (!csvUrl) { statusElement.html = "Please enter Vendor Roster CSV URL."; return; }
        statusElement.html = "<i>Importing Vendor Roster... please wait.</i>";
        $w("#importVendorRosterButton").disable();
        try {
            const result = await importVendorRoster(csvUrl);
            statusElement.html = formatReportToHtml(result, "Vendor Roster Import");
            if (result.errors && result.errors.length > 0) console.error("Vendor Roster Import Errors:", result.errors);
        } catch (e) { statusElement.html = `<b>Roster Page Error:</b> ${e.message || e.toString()}`; }
        finally { $w("#importVendorRosterButton").enable(); }
    });

    // --- Update Vendor Details from Requests CSV ---
    $w("#updateVendorDetailsButton").onClick(async () => { 
        const csvUrl = $w("#vendorRequestsCsvUrlInput").value; 
        const statusElement = $w("#vendorRequestsStatusText"); 
        if (!csvUrl) { statusElement.html = "Please enter Vendor Requests CSV URL."; return; } 
        statusElement.html = "<i>Updating Vendor Details... please wait.</i>";
        $w("#updateVendorDetailsButton").disable();
        try {
            const result = await updateVendorDetailsFromRequests(csvUrl);
            statusElement.html = formatReportToHtml(result, "Vendor Details Update");
            if (result.errors && result.errors.length > 0) console.error("Vendor Details Update Errors:", result.errors);
        } catch (e) { statusElement.html = `<b>Vendor Update Page Error:</b> ${e.message || e.toString()}`; }
        finally { $w("#updateVendorDetailsButton").enable(); }
    });

    // --- GeoJSON Features (Stalls & POIs) Import ---
    $w("#geojsonButton").onClick(async () => {
        const geoJsonUrl = $w("#geojsonInput").value;
        const statusElement = $w("#geojsonText");
        if (!geoJsonUrl) { statusElement.html = "Please enter GeoJSON URL."; return; }
        statusElement.html = "<i>Importing GeoJSON features (Stalls & POIs)... please wait.</i>";
        $w("#geojsonButton").disable();
        try {
            const result = await importGeoJsonFeatures(geoJsonUrl);
            statusElement.html = formatReportToHtml(result, "GeoJSON Features Import");
            if (result.errors && result.errors.length > 0) console.error("GeoJSON Import Errors:", result.errors);
        } catch (e) { statusElement.html = `<b>GeoJSON Import Page Error:</b> ${e.message || e.toString()}`; }
        finally { $w("#geojsonButton").enable(); }
    });

    // --- Clear Attendance Section ---
    $w("#clearAttendanceButton").onClick(async () => {
        const startDate = $w("#clearStartDate").value;
        const endDate = $w("#clearEndDate").value;
        const statusElement = $w("#clearAttendanceStatusText");
        if (!startDate || !endDate) {
            statusElement.html = "Please select both a start and end date.";
            return;
        }
        statusElement.html = "<i>Clearing attendance records... please wait.</i>";
        $w("#clearAttendanceButton").disable();
        try {
            const startDateStr = startDate.toISOString().slice(0,10);
            const endDateStr = endDate.toISOString().slice(0,10);
            const result = await clearAttendanceForDateRange(startDateStr, endDateStr);
            statusElement.html = formatReportToHtml(result, "Clear Attendance");
        } catch (e) {
            statusElement.html = `<b>Clear Attendance Page Error:</b> ${e.message || e.toString()}`;
        } finally {
            $w("#clearAttendanceButton").enable();
        }
    });

    // --- Stall Assignments Import ---
    $w("#importStallAssignmentsButton").onClick(async () => { 
        const csvUrl = $w("#stallAssignmentsCsvUrlInput").value; 
        const statusElement = $w("#stallAssignmentsStatusText"); 
        if (!csvUrl) { statusElement.html = "Please enter Stall Assignments CSV URL."; return; } 
        statusElement.html = "<i>Importing Stall Assignments... please wait.</i>";
        $w("#importStallAssignmentsButton").disable();
        try {
            const result = await importStallAssignments(csvUrl);
            statusElement.html = formatReportToHtml(result, "Stall Assignments Import");
            if (result.errors && result.errors.length > 0) console.error("Stall Assignment Import Errors:", result.errors);
        } catch (e) { statusElement.html = `<b>Stall Assign Page Error:</b> ${e.message || e.toString()}`; }
        finally { $w("#importStallAssignmentsButton").enable(); }
    });

    // --- Test Vendor Collection Query Button ---
    $w("#testVendorQueryButton").onClick(async () => { 
        const statusElement = $w("#testVendorQueryStatusText"); 
        statusElement.html = "<i>Testing Vendors query... please wait.</i>";
        $w("#testVendorQueryButton").disable();
        try {
            const result = await testVendorsCollectionQuery();
            if (result.success) {
                statusElement.html = `<b>Test Query Success!</b><br>Items found: ${result.count}<br>First item (sample): ${JSON.stringify(result.firstItem, null, 2)?.substring(0, 400) || 'N/A'}...`;
            } else {
                statusElement.html = `<b>Test Query FAILED:</b><br>${result.message || 'Unknown error'}<br>See browser and site logs.`;
                 if(result.errorObj) console.error("Test Query Full Error Object:", result.errorObj);
            }
        } catch (e) {
            console.error("Error calling testVendorsCollectionQuery from page:", e);
            statusElement.html = `<b>Test Query Page Error:</b> ${e.message || e.toString()}`;
        } finally {
            $w("#testVendorQueryButton").enable();
        }
    });
});

// Helper function to display report object nicely
function formatReportToHtml(report, title) {
    console.log("formatReportToHtml called with title:", title, "and report:", report); 
    if (!report) { 
        console.error("formatReportToHtml received undefined/null report for title:", title);
        return `<strong>${title} Error:</strong><br>No report data received from backend function. Check browser and site logs.`;
    }
    let html = `<strong>${title}:</strong><br>`;
    html += `Status: ${report.success ? "<span style='color:green;'>Success</span>" : "<span style='color:red;'>Failed</span>"}<br>`;
    html += `Message: ${report.message || "No message."}<br>`;
    if (report.clearedCount !== undefined) html += `Records Cleared: ${report.clearedCount}<br>`;
    if (report.totalRows !== undefined) html += `Total CSV Rows: ${report.totalRows}<br>`;
    if (report.totalFeatures !== undefined) html += `Total GeoJSON Features: ${report.totalFeatures}<br>`;
    if (report.processed !== undefined && (title.includes("Roster") || title.includes("Vendor Details Update"))) html += `Rows Processed (from CSV): ${report.processed}<br>`;
    if (report.processedStallRows !== undefined) html += `Stall Rows Processed (Assignments CSV): ${report.processedStallRows}<br>`;
    if (report.stallsProcessed !== undefined) html += `Stalls Processed (GeoJSON): ${report.stallsProcessed}<br>`;
    if (report.stallsSaved !== undefined) html += `Stalls Saved (Inserted/Updated): ${report.stallsSaved}<br>`;
    if (report.poisProcessed !== undefined) html += `POIs Processed (GeoJSON): ${report.poisProcessed}<br>`;
    if (report.poisSaved !== undefined) html += `POIs Saved (Inserted/Updated): ${report.poisSaved}<br>`;
    if (report.inserted !== undefined && title.includes("Roster")) html += `Vendors Inserted: ${report.inserted}<br>`;
    if (report.updated !== undefined && title.includes("Roster")) html += `Vendors Updated (Roster): ${report.updated}<br>`;
    else if (report.updated !== undefined && title.includes("Vendor Details Update")) html += `Vendor Details Updated: ${report.updated}<br>`;
    if (report.skippedByScript !== undefined) html += `Vendors Skipped (Roster): ${report.skippedByScript}<br>`;
    if (report.skippedByApi !== undefined) html += `Vendors Skipped by API (Roster): ${report.skippedByApi}<br>`;
    if (report.noChangesNeeded !== undefined) html += `Vendor Details No Changes Needed: ${report.noChangesNeeded}<br>`;
    if (report.notFound !== undefined) html += `Vendors Not Found (for details update): ${report.notFound}<br>`;
    if (report.attendanceRecordsToInsert !== undefined) html += `Attendance Records Identified: ${report.attendanceRecordsToInsert}<br>`;
    if (report.successfullyInserted !== undefined && title.includes("Stall Assignments")) { 
         html += `Attendance Successfully Inserted: ${report.successfullyInserted}<br>`;
    }
    if (report.vendorLookupFailed !== undefined) html += `Vendors Not Found (for attendance creation): ${report.vendorLookupFailed}<br>`;
    if (report.invalidDateHeaderCount !== undefined) html += `Invalid Date Headers (in stall assignments): ${report.invalidDateHeaderCount}<br>`;
    html += `Errors Logged: ${report.errors ? report.errors.length : 0}`;
    if (report.errors && report.errors.length > 0) {
        html += "<br><span style='color:red;'>First 3 errors (see browser console for all details):</span><br>";
        report.errors.slice(0, 3).forEach(err => {
            html += `<small>- ${String(err).substring(0, 250)}...</small><br>`;
        });
    }
    return html;
}