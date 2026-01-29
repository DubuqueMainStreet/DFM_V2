// API Reference: https://www.wix.com/velo/reference/api-overview/introduction
// "Hello, World!" Example: https://learn-code.wix.com/en/article/hello-world

import { importAllSampleData } from 'backend/importSampleData';

$w.onReady(function () {
    // TEMPORARY: Sample Data Import
    // Remove this code after importing data
    
    console.log("🏠 Homepage loaded - Starting automatic import...");
    
    // Auto-run import on page load (remove this code after import is complete)
    runImport();
    
    // Function to run the import
    async function runImport() {
        console.log("🚀 Starting sample data import from homepage...");
        try {
            const result = await importAllSampleData();
            console.log("✅ Import complete!");
            console.log("📊 Results:", result);
            
            if (result.success) {
                console.log("🎉 " + result.message);
                console.log("✅ SUCCESS: All data imported successfully!");
            } else {
                console.error("❌ Import failed:", result.message);
            }
        } catch (error) {
            console.error("❌ Import error:", error);
        }
    }
    
    // Make function available globally for console access (Wix-safe way)
    try {
        if (typeof window !== 'undefined') {
            window.runImport = runImport;
            window.importAllSampleData = importAllSampleData;
        }
    } catch (e) {
        // window not available, that's okay - functions are still accessible via import
    }
    
    console.log("💡 Tip: You can call importAllSampleData() directly from the console");
    console.log("💡 Or use: await import { importAllSampleData } from 'backend/importSampleData'; importAllSampleData()");
});
