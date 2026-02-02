# Manual Entry Setup Guide

## Overview
This feature allows admins to manually enter hard copy form submissions into the system. All manual entries are created with "Pending" status and appear in the Specialty Requests admin dashboard.

## Required UI Elements

### Main Button
- **Element ID:** `#btnManualEntry`
- **Type:** Button
- **Location:** Specialty Requests admin page (near Refresh/Clear Filters buttons)
- **Label:** "Manual Entry" or "Add Hard Copy Submission"

### Manual Entry Container (Hidden by default)
- **Element ID:** `#manualEntryContainer`
- **Type:** Container/Box
- **Initial State:** Hidden
- **Purpose:** Contains all manual entry form elements
- **Responsive Behavior:** 
  - Set container height to "Auto" or "Fit to Content" in Wix Editor
  - Container will automatically resize as sections show/hide
  - Only visible elements take up space, keeping the form compact

### Form Fields (Inside `#manualEntryContainer`)

#### Common Fields (All Types)
- `#manualEntryType` - **Dropdown** - Options: Musician, Volunteer, Non-Profit
- `#manualEntryName` - **Text Input** - Organization/Person name (required)
- `#manualEntryEmail` - **Text Input** - Email address (required)
- `#manualEntryPhone` - **Text Input** - Phone number (required)
- `#manualEntryBio` - **Text Area** - Biography/description (optional)
- `#manualEntryWebsite` - **Text Input** - Website URL (optional)

#### Section Titles (Dynamically shown/hidden based on type selection)
- `#manualEntryMusicianTitle` - **Text/Heading** - Section title for Musician fields (shown when type = Musician)
- `#manualEntryVolunteerTitle` - **Text/Heading** - Section title for Volunteer fields (shown when type = Volunteer)
- `#manualEntryNonprofitTitle` - **Text/Heading** - Section title for Non-Profit fields (shown when type = NonProfit)
- `#manualEntryDateTitle` - **Text/Heading** - Section title for Date selection (shown when any type is selected)

#### Musician-Specific Fields (Hidden by default, shown when type = Musician)
- `#manualEntryMusicianType` - **Dropdown** - Solo Acoustic, Solo Electric, Duo Acoustic, etc.
- `#manualEntryLocation` - **Dropdown** - Location A (13th Street), Location B (Food Court), Location C (10th & Iowa St)
- `#manualEntryDuration` - **Dropdown** - 1 hour, 2 hours, 3 hours, 4 hours, 5 hours
- `#manualEntryGenre` - **Dropdown** - Acoustic/Folk, Country, Jazz, Blues, Rock, Pop, Classical, Bluegrass, World Music, Other
- `#manualEntryTechNeeds` - **Checkbox** - Electric hookup needed

#### Volunteer-Specific Fields (Hidden by default, shown when type = Volunteer)
- `#manualEntryVolunteerRole` - **Dropdown** - Token Sales, Merch Sales, Setup, Teardown, Hospitality Support, No Preference
- `#manualEntryShiftPreference` - **Dropdown** - Early Shift, Late Shift, Both

#### Non-Profit-Specific Fields (Hidden by default, shown when type = NonProfit)
- `#manualEntryNonProfitType` - **Dropdown** - Community Outreach, Health & Wellness, Arts & Culture, Education, Environment, Social Services, Other

#### Date Selection
- `#manualEntryDateRepeater` - **Repeater** - Market dates selection (required, at least one)
  - **Repeater Item Elements:**
    - `#itemLabel` - **Text** - Displays the date label (e.g., "May 2nd")
    - `#itemContainer` - **Container/Box** - Clickable container for date selection

### Action Buttons (Inside `#manualEntryContainer`)
- `#btnManualEntrySubmit` - **Button** - Submit the manual entry
- `#btnManualEntryCancel` - **Button** - Close the form without saving

## Setup Instructions

1. **Add the Manual Entry Button**
   - Add a button to your Specialty Requests admin page
   - Set element ID to `btnManualEntry`
   - Style it with green background (#4CAF50) to distinguish from other buttons

2. **Create the Manual Entry Container**
   - Add a container/box element
   - Set element ID to `manualEntryContainer`
   - Initially hide it (set visibility to hidden)
   - Position it as a modal/overlay (centered, with backdrop if desired)

3. **Add Form Fields**
   - Add all the form fields listed above inside the container
   - Use appropriate input types (text inputs, dropdowns, checkboxes, text areas)
   - Set element IDs exactly as specified
   - **Important:** For `#manualEntryDateRepeater`, create a repeater with:
     - A text element inside each item with ID `#itemLabel` (for the date display)
     - A container/box element inside each item with ID `#itemContainer` (clickable area)
     - **CRITICAL:** In the Wix Editor, the `#itemContainer` Box element MUST have:
       - Border enabled (any color, will be overridden by code)
       - Border width set to 3px
       - Border style set to "Solid"
       - This is required for JavaScript to be able to change border colors dynamically

4. **Style the Form**
   - Make it look like a modal/lightbox
   - Add labels for each field
   - **Section Titles:** Add text/heading elements for each section:
     - `#manualEntryMusicianTitle` - e.g., "Musician Details" or "Musician Information"
     - `#manualEntryVolunteerTitle` - e.g., "Volunteer Details" or "Volunteer Information"
     - `#manualEntryNonprofitTitle` - e.g., "Non-Profit Details" or "Organization Information"
     - `#manualEntryDateTitle` - e.g., "Select Market Dates" or "Available Dates"
   - **Container Responsiveness:** 
     - Set container height to "Auto" or "Fit to Content" so it resizes based on visible elements
     - Container will automatically adjust when sections show/hide
     - Ensure container has proper padding and spacing
   - **Date Repeater Styling:** Style the `#itemContainer` elements similar to the submission forms:
     - **Available (Green):** White background, green border (#4CAF50), 3px border
     - **Limited (Orange/Yellow):** Light amber background (#FFF8E1), orange border (#FF9800), 3px border
     - **Full (Red):** Gray background (#F5F5F5), red border (#F44336), 3px border, reduced opacity (0.5), not clickable
     - **Selected:** Blue background (#E3F2FD), border color matches status, 4px border, prominent shadow, bold text
     - Border width increases from 3px to 4px when selected
     - Smooth transitions for hover/selection states
     - **Note:** Availability status is calculated based on selected type (Musician/Volunteer/NonProfit) and updates dynamically

5. **Test the Feature**
   - Click "Manual Entry" button - form should appear
   - Select different types - relevant section title and fields should show/hide
   - Container should resize automatically as sections appear/disappear
   - Date section should appear when any type is selected
   - Fill out form and submit - should create entry and refresh the list
   - Cancel button should close form without saving
   - When form opens, all section titles should be hidden until a type is selected

## How It Works

1. **Opening the Form**
   - Admin clicks "Manual Entry" button
   - Form container becomes visible
   - Form defaults to current tab's type (Musician/Volunteer/NonProfit)
   - Date dropdown populates with all available market dates

2. **Type Selection & Dynamic Sections**
   - When type changes, form dynamically shows/hides relevant sections:
     - **Musician selected:** Shows `#manualEntryMusicianTitle` and all musician-specific fields
     - **Volunteer selected:** Shows `#manualEntryVolunteerTitle` and all volunteer-specific fields
     - **NonProfit selected:** Shows `#manualEntryNonprofitTitle` and all nonprofit-specific fields
   - Date section (`#manualEntryDateTitle` and `#manualEntryDateRepeater`) appears when any type is selected
   - Container automatically resizes to fit visible content (responsive layout)
   - Only one type-specific section is visible at a time

3. **Date Selection (Repeater) with Availability Status**
   - Date repeater populates with all available market dates from `MarketDates2026` collection
   - Dates display as clickable boxes (e.g., "May 2nd", "May 9th")
   - **Availability colors indicate booking status:**
     - **Green border:** Available - plenty of spots open
     - **Orange/Yellow border:** Limited - getting full but still available
     - **Red border:** Full - all spots taken (but admins can still select for manual entry override)
   - Availability is calculated based on selected type:
     - **Musicians:** Based on location bookings (Location A, B, C)
     - **Volunteers:** Based on role-specific limits (Token Sales, Setup, etc.)
     - **Non-Profits:** Based on overall non-profit count
   - Click a date box to select/deselect it
   - Selected dates show with blue background and thicker border (4px instead of 3px)
   - Admin can select multiple dates
   - Each selected date creates a separate WeeklyAssignments record
   - All assignments link to the same SpecialtyProfile
   - **Dynamic updates:** When type or volunteer role changes, availability refreshes automatically
   - Same visual styling and interaction as the public submission forms

4. **Submission**
   - Validates required fields (type, name, email, phone, at least one date)
   - Creates SpecialtyProfile with all provided data
   - Creates WeeklyAssignments for each selected date (status: Pending)
   - Does NOT create CRM contact (to avoid duplicates from hard copy entries)
   - Refreshes the admin dashboard to show new entry
   - Closes the form

5. **Data Flow**
   - Uses `manualEntrySpecialtyProfile()` backend function
   - Same data structure as digital form submissions
   - Entries appear in admin dashboard immediately
   - Can be approved/rejected/location-assigned like digital submissions

## Notes

- **CRM Contacts:** Manual entries do NOT automatically create CRM contacts (unlike digital submissions). This prevents duplicate contacts from hard copy forms that may already exist in your CRM.
- **Email Notifications:** Manual entries can still receive email notifications if you later approve/reject them, as long as the email address is valid.
- **Validation:** Form validates required fields before submission
- **Error Handling:** Shows error messages if submission fails
- **Success Feedback:** Shows success message and refreshes the list after successful submission
- **Availability Status:** 
  - Dates show real-time availability based on existing bookings
  - Colors match the public submission forms (green/orange/red)
  - Admins can still select "full" dates if needed (manual override)
  - Availability updates automatically when type or volunteer role changes
  - Uses the same `getDateAvailability()` backend function as submission forms

## Date Repeater Setup Details

The date repeater uses the same pattern as the submission forms. Follow these steps to set it up:

### Step-by-Step Repeater Setup

1. **Add Repeater Element**
   - Add a Repeater element to your `#manualEntryContainer`
   - Set element ID to `manualEntryDateRepeater`
   - Set it to display items horizontally or in a grid (your preference)

2. **Design Repeater Item Template**
   - Inside the repeater, you'll design one item template that repeats for each date
   - Add a Container/Box element - set ID to `itemContainer`
     - This will be the clickable area
     - Set initial styling: white background, border, padding
   - Inside the container, add a Text element - set ID to `itemLabel`
     - This will display the date (e.g., "May 2nd")
     - Center the text or align as desired

3. **Styling the Container**
   - Initial state (unselected):
     - Background: White (#FFFFFF)
     - Border: 3px solid, color #4CAF50 (green)
     - Border radius: 8px (or your preference)
     - Padding: 12px 16px
     - Box shadow: subtle (0 1px 3px rgba(0, 0, 0, 0.1))
   - Selected state (handled by code):
     - Background: Light blue (#E3F2FD)
     - Border: 4px solid, color #4CAF50
     - Box shadow: more prominent (0 4px 12px rgba(33, 150, 243, 0.4))
     - Font weight: 600 (bold)

4. **Code Handles the Rest**
   - The code automatically populates the repeater with dates
   - Click handlers are set up automatically
   - Styling updates automatically on selection
   - No manual data binding needed

### Visual Reference

The date repeater should look similar to the date selection in your public submission forms:
- Dates displayed as bordered boxes
- Click to select (box turns blue)
- Click again to deselect (box returns to white)
- Multiple dates can be selected at once
- Dates are sorted chronologically

The date repeater uses the same pattern as the submission forms:

### Repeater Structure
- **Repeater ID:** `#manualEntryDateRepeater`
- **Item Template:** Each repeater item contains:
  1. `#itemLabel` - Text element showing the date (e.g., "May 2nd")
  2. `#itemContainer` - Container/box that's clickable

### How It Works
1. Repeater loads all dates from `MarketDates2026` collection
2. Each date is formatted as "Month Day" (e.g., "May 2nd")
3. Dates are sorted chronologically
4. Clicking `#itemContainer` toggles selection
5. Selected dates are tracked in `manualEntrySelectedDates` array
6. Visual feedback: selected dates have blue background and thicker border

### Styling Reference
The `applyManualEntryDateStyling()` function handles:
- **Unselected:** White background, 3px green border, subtle shadow
- **Selected:** Light blue background (#E3F2FD), 4px green border, prominent shadow, bold text
- **Full (if implemented):** Gray background, reduced opacity, not clickable

### Matching Submission Forms
The manual entry date repeater matches the styling and behavior of:
- `SIGNUP-Music.ais9x.js` date repeater
- `SIGNUP- Volunteer.zab9v.js` date repeater
- `SIGNUP- NFP.owt61.js` date repeater

This ensures a consistent user experience across all forms.
