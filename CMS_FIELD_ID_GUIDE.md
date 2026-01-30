# Finding Wix CMS Field IDs

## The Problem
Wix CMS uses **Field IDs** (internal identifiers) for saving data, not display names. If the Field IDs don't match what's in the code, data goes into "undefined" fields.

## How to Find Field IDs in Wix CMS

### Method 1: Check Field Settings
1. Go to **Wix Editor** → **CMS** → **Collections**
2. Select **SpecialtyProfiles** collection
3. Click on a field (e.g., the new "phone" field)
4. Look at the **Field ID** or **Field Key** - this is what the code needs to use
5. It's usually shown at the bottom of the field settings panel

### Method 2: Check Existing Records
1. In your CMS, look at a record that was saved
2. Check what field names appear in the data
3. Those are the Field IDs being used

### Method 3: Use Wix Data API (in Dev Tools)
The Field IDs are what appear when you query the collection. They might be:
- Exactly as typed: `phone`, `website`, `duration`, `genre`
- With prefixes: `phoneNumber`, `websiteUrl`, etc.
- Different casing: `Phone`, `Website`, etc.

## Common Issues

### Issue 1: Field ID vs Display Name
- **Display Name:** "Phone Number" (what users see)
- **Field ID:** `phone` or `phoneNumber` (what code uses)

### Issue 2: Auto-Generated Field IDs
Wix sometimes auto-generates Field IDs when you create fields:
- You type: "Phone"
- Wix creates Field ID: `phone` or `phoneNumber` or `Phone`

### Issue 3: Case Sensitivity
Field IDs are case-sensitive:
- `phone` ≠ `Phone` ≠ `PHONE`

## Solution Steps

1. **Check your CMS:**
   - Open SpecialtyProfiles collection
   - Look at the Field IDs for: `phone`, `website`, `duration`, `genre`
   - Note the EXACT Field IDs (case-sensitive)

2. **Share the Field IDs:**
   - Tell me what Field IDs Wix created for these fields
   - I'll update the code to match

3. **Or rename fields in CMS:**
   - In Wix CMS, you can edit Field IDs
   - Change them to match: `phone`, `website`, `duration`, `genre` (lowercase)

## Quick Check: What Field IDs Are Currently Being Used?

Look at a recently saved record in your CMS. The field names you see there are the Field IDs. Compare them to what the code is using:
- Code uses: `phone`, `website`, `duration`, `genre`
- CMS might have: `Phone`, `Website`, `Duration`, `Genre` or something else

## Next Steps

Once you share the exact Field IDs from your CMS, I'll update the code to match them exactly.
