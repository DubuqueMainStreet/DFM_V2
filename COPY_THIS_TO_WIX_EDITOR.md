# Copy These Changes to Wix Online Editor

## How to Apply

1. Open Wix Editor (online)
2. Dev Mode → Code Files
3. Find: `SIGNUP- NFP (owt61)` page code
4. Make these changes:

## Change 1: Add version log at the start of populateDateRepeater()

Find:
```javascript
async function populateDateRepeater() {
	try {
		const results = await wixData.query('MarketDates2026')
```

Replace with:
```javascript
async function populateDateRepeater() {
	console.log('🚀🚀🚀 POPULATE DATE REPEATER CALLED - VERSION 2.0');
	try {
		const results = await wixData.query('MarketDates2026')
```

## Change 2: Add logging to getDateAvailability call

Find:
```javascript
		// Get availability data for all dates
		const availability = await getDateAvailability();
		console.log('📅 Non-Profit Portal - Availability data received:', availability);
```

Replace with:
```javascript
		// Get availability data for all dates
		let availability = {};
		try {
			console.log('🔍 Calling getDateAvailability()...');
			console.log('📝 Note: Backend logs appear in Wix Editor → Dev Tools → Backend Logs, not browser console');
			
			const startTime = Date.now();
			
			// Try to call the backend function
			if (typeof getDateAvailability !== 'function') {
				throw new Error('getDateAvailability is not a function! Check import.');
			}
			
			availability = await getDateAvailability();
			const endTime = Date.now();
			
			console.log(`⏱️ getDateAvailability() took ${endTime - startTime}ms`);
			console.log('📅 Non-Profit Portal - Availability data received:', availability);
			console.log('📊 Availability type:', typeof availability);
			console.log('📊 Availability keys count:', Object.keys(availability).length);
			console.log('📊 Availability keys:', Object.keys(availability));
			
			// Validate the response
			if (!availability || typeof availability !== 'object') {
				console.error('❌ Invalid availability response:', availability);
				availability = {};
			} else if (Object.keys(availability).length === 0) {
				console.warn('⚠️ WARNING: Availability data is empty! Possible causes:');
				console.warn('   1. No approved assignments exist in WeeklyAssignments collection');
				console.warn('   2. Backend function returned empty object (check backend logs)');
				console.warn('   3. Date IDs in WeeklyAssignments don\'t match MarketDates2026 IDs');
				console.warn('   → Check Wix Editor → Dev Tools → Backend Logs for getDateAvailability()');
			} else {
				console.log('✅ Availability data received successfully with', Object.keys(availability).length, 'dates');
			}
		} catch (error) {
			console.error('❌ ERROR calling getDateAvailability():', error);
			console.error('Error details:', {
				message: error.message,
				name: error.name,
				stack: error.stack,
				toString: error.toString()
			});
			console.error('⚠️ This might be a permissions issue. Check:');
			console.error('   1. Backend function exists: src/backend/availabilityStatus.jsw');
			console.error('   2. Function is exported: export async function getDateAvailability()');
			console.error('   3. Permissions allow anonymous access (check permissions.json)');
			console.error('   4. WeeklyAssignments collection exists and is readable');
			availability = {}; // Fallback to empty object
		}
```

## Change 3: Fix applyDateItemStyling function - Add white background initialization

Find this in applyDateItemStyling function:
```javascript
		// Background color based on selection and availability
		if (isFull) {
```

Add BEFORE it:
```javascript
		console.log(`🎨 STYLING: ${itemData.label} - status: ${itemData.status}, selected: ${isSelected}, full: ${isFull}`);
		
		// Background color based on selection and availability
		if (isFull) {
```

And change the "else" block to add comment:
```javascript
		} else {
			// UNSELECTED dates - always white, never beige
			container.style.backgroundColor = '#FFFFFF'; // Pure white
```

## Change 4: Set initial white background in onItemReady

Find:
```javascript
				// Get container element
				const container = $item('#itemContainer');
				
				if (!container) {
					console.error('Container element not found for item:', itemData.label);
					return;
				}
				
				// Apply styling function
```

Replace with:
```javascript
				// Get container element
				const container = $item('#itemContainer');
				
				if (!container) {
					console.error('Container element not found for item:', itemData.label);
					return;
				}
				
				// IMPORTANT: Set initial white background to prevent beige default
				if (container.style) {
					container.style.backgroundColor = '#FFFFFF';
				}
				
				// Apply styling function
```

## After Making Changes

1. Save in Wix Editor
2. Test in Editor Preview - you should see new logs like `🚀🚀🚀 POPULATE DATE REPEATER CALLED - VERSION 2.0`
3. If it works in preview, click **Publish** in the Editor
4. Test published site

## What to Look For

New logs should appear:
- `🚀🚀🚀 POPULATE DATE REPEATER CALLED - VERSION 2.0`
- `🔍 Calling getDateAvailability()...`
- `📅 Availability data received:`
- `🎨 STYLING:` logs

This will tell us if the availability data is empty and why dates aren't showing as full/red.
