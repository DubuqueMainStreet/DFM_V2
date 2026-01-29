// API Reference: https://www.wix.com/velo/reference/api-overview/introduction
// "Hello, World!" Example: https://learn-code.wix.com/en/article/hello-world

import { importAllSampleData } from 'backend/importSampleData';

$w.onReady(function () {
    // TEMPORARY: Sample Data Import
    // Remove this code after importing data
    
    console.log("🏠 Homepage loaded - Import function ready!");
    console.log("📋 To import sample data, run this in the console:");
    console.log("   await importAllSampleData()");
    console.log("");
    console.log("Or uncomment the line below to auto-run on page load:");
    
    // Uncomment the line below to automatically run import when homepage loads:
    // runImport();
    
    // Function to run the import
    async function runImport() {
        console.log("🚀 Starting sample data import from homepage...");
        try {
            const result = await importAllSampleData();
            console.log("✅ Import complete!");
            console.log("📊 Results:", result);
            
            if (result.success) {
                console.log("🎉 " + result.message);
                alert("✅ Import successful!\n\n" + result.message + "\n\nCheck the console for details.");
            } else {
                console.error("❌ Import failed:", result.message);
                alert("❌ Import failed:\n\n" + result.message + "\n\nCheck the console for details.");
            }
        } catch (error) {
            console.error("❌ Import error:", error);
            alert("❌ Import error:\n\n" + error.message + "\n\nCheck the console for details.");
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
