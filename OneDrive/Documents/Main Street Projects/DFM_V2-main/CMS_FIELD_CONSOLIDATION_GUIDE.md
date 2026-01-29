# CMS Field Consolidation Guide

## Current Situation

**Existing Fields (Keep These):**
- `organizationName` ✅
- `type` ✅
- `contactEmail` ✅
- `contactPhone` ✅
- `techNeeds` ✅
- `volunteerRole` ✅

**New Fields Created (Currently "Undefined"):**
- `name` ❌ → **DELETE** (use `organizationName` instead)
- `email` ❌ → **DELETE** (use `contactEmail` instead)
- `phone` ❌ → **DELETE** (use `contactPhone` instead)
- `musicianType` ✅ → **KEEP**
- `bio` ✅ → **KEEP**
- `preferredLocation` ✅ → **KEEP**
- `needsElectric` ⚠️ → **DECIDE** (see options below)

## Action Plan

### Step 1: Delete Duplicate Fields

In Wix CMS, delete these fields (they're duplicates):
1. **`name`** → Use `organizationName` instead
2. **`email`** → Use `contactEmail` instead
3. **`phone`** → Use `contactPhone` instead

### Step 2: Handle `needsElectric` Field

**Option A: Keep `needsElectric` (Boolean)**
- Pros: Simple boolean, clear for musicians
- Cons: Less flexible for other signup types
- **Action:** Keep the field, code already uses it

**Option B: Migrate to `techNeeds` (Text)**
- Pros: More flexible, works for all signup types
- Cons: Need to migrate existing data
- **Action:** Delete `needsElectric`, use `techNeeds` with text values

**Recommendation:** Keep `needsElectric` for now (simpler), can migrate later if needed.

### Step 3: Add Missing Fields

Add these new fields to your CMS:

1. **`duration`** (Text, Optional)
   - Field ID: `duration`
   - Type: Text
   - Required: No
   - Used by: Musicians, Special Events

2. **`genre`** (Text, Optional)
   - Field ID: `genre`
   - Type: Text
   - Required: No
   - Used by: Musicians only

3. **`website`** (URL/Text, Optional)
   - Field ID: `website`
   - Type: URL (or Text if URL not available)
   - Required: No
   - Used by: All signup types

### Step 4: Future Fields (Add Later)

For future signup forms, you'll also need:

4. **`eventType`** (Text, Optional)
   - Field ID: `eventType`
   - Type: Text
   - Required: No
   - Used by: Special Events only

5. **`nonProfitType`** (Text, Optional)
   - Field ID: `nonProfitType`
   - Type: Text
   - Required: No
   - Used by: Non-Profits only

## Final Field List

### Core Fields (All Types)
- `type` (Text) - Required
- `organizationName` (Text) - Required
- `contactEmail` (Email) - Required
- `contactPhone` (Text) - Required
- `bio` (Text) - Optional
- `website` (URL/Text) - Optional
- `preferredLocation` (Text) - Optional
- `techNeeds` (Text) - Optional

### Type-Specific Fields
- `musicianType` (Text) - Musicians only
- `duration` (Text) - Musicians, Events
- `genre` (Text) - Musicians only
- `needsElectric` (Boolean) - Musicians (optional, or use techNeeds)
- `volunteerRole` (Text) - Volunteers only
- `eventType` (Text) - Special Events (future)
- `nonProfitType` (Text) - Non-Profits (future)

## Quick Checklist

- [ ] Delete `name` field
- [ ] Delete `email` field
- [ ] Delete `phone` field
- [ ] Keep `musicianType`
- [ ] Keep `bio`
- [ ] Keep `preferredLocation`
- [ ] Decide: Keep `needsElectric` OR delete and use `techNeeds`
- [ ] Add `duration` field
- [ ] Add `genre` field
- [ ] Add `website` field

## Code Update

The code has been updated to use:
- `organizationName` instead of `name`
- `contactEmail` instead of `email`
- `contactPhone` instead of `phone`
- `techNeeds` for electric needs (or keep `needsElectric` if you prefer)

If you want to keep `needsElectric` instead of `techNeeds`, let me know and I'll update the code accordingly.
