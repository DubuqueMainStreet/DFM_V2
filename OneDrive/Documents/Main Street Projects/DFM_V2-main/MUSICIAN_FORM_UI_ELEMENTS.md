# Musician Signup Form - Required UI Elements

**Page:** SIGNUP-MUSICIAN  
**Status:** Code ready, awaiting UI element creation

## Required UI Elements

### Input Fields
- `#inputName` - Text input for applicant/band name
- `#inputEmail` - Text input for email address
- `#inputMusicianType` - **Dropdown** (populated with musician types)
- `#inputNeedsElectric` - **Checkbox** (for electric hookup requirement)
- `#inputLocation` - **Dropdown** (populated with location options)
- `#inputBio` - Text area for biography/description

### File Upload
- `#uploadButton` - File upload button (supports `.startUpload()`)

### Selection
- `#dateSelectionTags` - Selection tags component (populated from `MarketDates2026`)

### Action Button
- `#btnSubmit` - Submit button (triggers form submission)

### Feedback Messages
- `#msgSuccess` - Success message text element
- `#msgError` - Error message text element

## Dropdown Options

### Musician Type (`#inputMusicianType`)
Populated automatically with:
- Solo Acoustic
- Solo Electric
- Duo Acoustic
- Duo Electric
- Small Band (3-4 members)
- Large Band (5+ members)
- Other

### Performance Location (`#inputLocation`)
Populated automatically with:
- Default (No Preference)
- Location A
- Location B
- Location C

## Data Structure

### SpecialtyProfiles Collection Fields
- `type` - "Musician" (hardcoded)
- `name` - Applicant/band name
- `email` - Email address
- `musicianType` - Selected musician type
- `needsElectric` - Boolean (true/false)
- `preferredLocation` - Selected location preference
- `bio` - Biography/description
- `fileUrl` - Uploaded file URL (optional)

### WeeklyAssignments Collection
- `profileRef` - Reference to SpecialtyProfiles
- `dateRef` - Reference to MarketDates2026

## Notes

- Form is musician-specific (type hardcoded to "Musician")
- Electric hookup is a checkbox (optional but recommended)
- Location dropdown includes "Default" option for no preference
- All fields except electric hookup are required
