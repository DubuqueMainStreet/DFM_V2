# SpecialtyProfiles Collection - Required Fields

## New Fields to Add

Add these 4 new fields to your `SpecialtyProfiles` collection in Wix CMS:

### 1. `phone` (Text)
- **Field Type:** Text
- **Required:** ✅ Yes
- **Description:** Contact phone number for day-of coordination
- **Example:** "(563) 555-1234"

### 2. `website` (URL/Text)
- **Field Type:** URL (or Text if URL type not available)
- **Required:** ❌ No (Optional)
- **Description:** Website or social media URL (consolidated field)
- **Example:** "https://www.example.com" or "https://instagram.com/artistname"

### 3. `duration` (Text)
- **Field Type:** Text
- **Required:** ❌ No (Optional)
- **Description:** Preferred performance duration
- **Possible Values:**
  - "30 minutes"
  - "1 hour"
  - "1.5 hours"
  - "2 hours"
  - "Flexible"

### 4. `genre` (Text)
- **Field Type:** Text
- **Required:** ❌ No (Optional)
- **Description:** Music genre/style
- **Possible Values:**
  - "Acoustic/Folk"
  - "Country"
  - "Jazz"
  - "Blues"
  - "Rock"
  - "Pop"
  - "Classical"
  - "Bluegrass"
  - "World Music"
  - "Other"

## Existing Fields (Should Already Exist)

These fields should already be in your collection:
- `type` (Text) - "Musician"
- `name` (Text)
- `email` (Email/Text)
- `musicianType` (Text)
- `needsElectric` (Boolean/Checkbox)
- `preferredLocation` (Text)
- `bio` (Text/Long Text)
- `fileUrl` (URL/Text) - For uploaded files

## How to Add Fields in Wix CMS

1. Go to **Wix Editor** → **CMS** → **Collections**
2. Select **SpecialtyProfiles** collection
3. Click **Add Field** for each new field above
4. Set the field name exactly as shown (case-sensitive: `phone`, `website`, `duration`, `genre`)
5. Set the field type and required status as specified
6. Save the collection

## Verification

After adding fields, test the form submission to ensure all data saves correctly.
