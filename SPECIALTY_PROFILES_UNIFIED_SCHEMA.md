# SpecialtyProfiles Collection - Unified Schema

## Overview
This collection handles multiple signup types: Musicians, Volunteers, Non-Profits, and Special Events.

## Field Consolidation Strategy

### ✅ Keep Existing Fields (Standardized)
- `type` - Signup type: "Musician", "Volunteer", "NonProfit", "SpecialEvent"
- `organizationName` - Organization name (null for individuals)
- `contactEmail` - Standardized email field (use instead of `email`)
- `contactPhone` - Standardized phone field (use instead of `phone`)
- `bio` - Description/bio (works for all types)
- `techNeeds` - Technical needs (works for musicians and non-profits)
- `volunteerRole` - Volunteer role (null for non-volunteers)

### 🔄 Consolidate These Fields

**Current:** `name` + `organizationName`
**Solution:** Use `organizationName` for all (null for individuals, name for orgs)
- For musicians: `organizationName` = artist/band name or individual name
- For volunteers: `organizationName` = individual name (or null)
- For non-profits: `organizationName` = organization name

**Current:** `email` + `contactEmail`
**Solution:** Use `contactEmail` (standardized)
- Remove `email` field, use `contactPhone` everywhere

**Current:** `phone` + `contactPhone`
**Solution:** Use `contactPhone` (standardized)
- Remove `phone` field, use `contactPhone` everywhere

**Current:** `needsElectric` + `techNeeds`
**Solution:** Use `techNeeds` (text field, more flexible)
- For musicians: `techNeeds` = "Electric hookup needed" or "None"
- More flexible for other signup types

### ➕ Add New Fields

1. **`preferredLocation`** (Text) - Already exists, keep it
   - Works for: Musicians, Non-Profits, Special Events
   - Values: "Default", "Location A", "Location B", "Location C"

2. **`musicianType`** (Text) - Already exists, keep it
   - Works for: Musicians only
   - Values: "Solo Acoustic", "Solo Electric", etc.

3. **`duration`** (Text) - NEW
   - Works for: Musicians, Special Events
   - Values: "30 minutes", "1 hour", "1.5 hours", "2 hours", "Flexible"

4. **`genre`** (Text) - NEW
   - Works for: Musicians only
   - Values: "Acoustic/Folk", "Country", "Jazz", etc.

5. **`website`** (URL/Text) - NEW
   - Works for: All types
   - Website or social media URL

6. **`eventType`** (Text) - NEW (for Special Events)
   - Works for: Special Events only
   - Values: TBD based on your event types

7. **`nonProfitType`** (Text) - NEW (for Non-Profits)
   - Works for: Non-Profits only
   - Values: TBD based on your non-profit categories

## Final Field List

### Core Fields (All Types)
- `type` (Text) - Required
- `organizationName` (Text) - Required (name of person/org)
- `contactEmail` (Email) - Required
- `contactPhone` (Text) - Required
- `bio` (Text/Long Text) - Optional
- `website` (URL/Text) - Optional
- `preferredLocation` (Text) - Optional

### Type-Specific Fields
- `musicianType` (Text) - Musicians only
- `duration` (Text) - Musicians, Special Events
- `genre` (Text) - Musicians only
- `techNeeds` (Text) - Musicians, Non-Profits, Special Events
- `volunteerRole` (Text) - Volunteers only
- `eventType` (Text) - Special Events only
- `nonProfitType` (Text) - Non-Profits only

## Migration Steps

1. **Rename/Consolidate:**
   - Delete `name` field (use `organizationName` instead)
   - Delete `email` field (use `contactEmail` instead)
   - Delete `phone` field (use `contactPhone` instead)
   - Keep `needsElectric` OR migrate to `techNeeds` (your choice)

2. **Add New Fields:**
   - `duration` (Text, Optional)
   - `genre` (Text, Optional)
   - `website` (URL/Text, Optional)
   - `eventType` (Text, Optional) - for future
   - `nonProfitType` (Text, Optional) - for future

3. **Update Code:**
   - Change `name` → `organizationName`
   - Change `email` → `contactEmail`
   - Change `phone` → `contactPhone`
   - Change `needsElectric` → `techNeeds` (or keep both)

## Field ID Summary

**Required Fields:**
- `type`
- `organizationName`
- `contactEmail`
- `contactPhone`

**Optional Fields:**
- `bio`
- `website`
- `preferredLocation`
- `musicianType` (Musicians)
- `duration` (Musicians, Events)
- `genre` (Musicians)
- `techNeeds` (All)
- `volunteerRole` (Volunteers)
- `eventType` (Events - future)
- `nonProfitType` (Non-Profits - future)
