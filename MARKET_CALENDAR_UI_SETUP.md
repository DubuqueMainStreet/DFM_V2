# Market Calendar - UI Elements Setup Guide

## 📋 Complete List of Required UI Elements

### **Page-Level Elements** (Outside Repeater)

1. **Month Navigation Tabs:**
   - **`#tabMay`** - Button/Tab - Filter to May dates
   - **`#tabJune`** - Button/Tab - Filter to June dates
   - **`#tabJuly`** - Button/Tab - Filter to July dates
   - **`#tabAugust`** - Button/Tab - Filter to August dates
   - **`#tabSeptember`** - Button/Tab - Filter to September dates
   - **`#tabOctober`** - Button/Tab - Filter to October dates
   - **Purpose:** Navigate between months (shows only dates for selected month)
   - **Location:** Top of page, above calendar
   - **Note:** Defaults to May (first market month)

2. **`#loadingIndicator`**
   - **Type:** Any element (Text, Image, Spinner)
   - **Purpose:** Shows loading state while data loads
   - **Initial State:** Hidden
   - **Location:** Top of page, below month tabs

3. **`#msgError`**
   - **Type:** Text element
   - **Purpose:** Displays error messages
   - **Initial State:** Hidden
   - **Location:** Top of page, below loading indicator

4. **`#calendarRepeater`**
   - **Type:** Repeater
   - **Purpose:** Displays dates for selected month (filtered by month tab)
   - **Location:** Main content area
   - **Note:** Shows only dates for the currently selected month

---

### **Repeater Item Elements** (Inside Each Repeater Item)

These elements go **inside** the repeater item design. Each date will have its own set of these elements.

#### **Main Display Elements:**

4. **`#itemDate`**
   - **Type:** Text element
   - **Purpose:** Shows the date (e.g., "May 2nd, 2026")
   - **Example Text:** "📅 May 2nd, 2026"
   - **Styling:** Can be larger/bold for emphasis

5. **`#itemStatus`**
   - **Type:** Text element
   - **Purpose:** Shows overall status indicator
   - **Possible Values:**
     - "✅ Complete" (green)
     - "⚠️ Needs Attention" (yellow)
     - "❌ Critical Gaps" (red)
   - **Styling:** Right-aligned, colored text
   - **Location:** Same row as `#itemDate`, right-aligned

6. **`#itemMusicians`**
   - **Type:** Text element
   - **Purpose:** Shows musician coverage
   - **Example Text:** "🎵 Musicians: 3/3 approved (2 pending)"
   - **Location:** Below date/status row

7. **`#itemNonProfit`**
   - **Type:** Text element
   - **Purpose:** Shows non-profit coverage
   - **Example Text:** "🏢 Non-Profit: 1/1 approved"
   - **Location:** Below musicians

8. **`#itemVolunteers`**
   - **Type:** Text element
   - **Purpose:** Shows volunteer coverage
   - **Example Text:** "👥 Volunteers: 11/11 covered (1 pending)"
   - **Location:** Below non-profit

#### **Expandable Details Section:**

9. **`#btnToggleDetails`**
   - **Type:** Button
   - **Purpose:** Toggles the expandable details section
   - **Initial Text:** "Show Details"
   - **Changes To:** "Hide Details" when expanded
   - **Location:** Below coverage text elements

10. **`#detailsContainer`**
    - **Type:** Collapsible Container (or Box with collapse/expand)
    - **Purpose:** Container for the expandable details
    - **Initial State:** Collapsed/Hidden
    - **Location:** Below toggle button
    - **Important:** Must support `.collapse()` and `.expand()` methods

11. **`#detailsContent`**
    - **Type:** HTML Component (preferred) OR Embed Code/Iframe OR Text element
    - **Purpose:** Displays detailed assignment information
    - **Location:** Inside `#detailsContainer`
    - **Options:**
      - **HTML Component** (best): Has `.html` property - just add it and set ID
      - **Embed Code/Iframe**: Code will use `.src` with data URI - should work
      - **Text element** (fallback): Will strip HTML tags, shows plain text only
    - **Note:** The code tries multiple methods, so any of these should work

---

## 🎨 Visual Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│  Market Calendar - 2026 Season                             │
│                                                              │
│  [Month Tabs: May | June | July | August | September | Oct]│
│                                                              │
│  [#loadingIndicator] (hidden initially)                     │
│  [#msgError] (hidden initially)                             │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ [#calendarRepeater]                                    │ │
│  │ (Shows only dates for selected month)                  │ │
│  │                                                         │ │
│  │  ┌─ Repeater Item 1 ────────────────────────────────┐ │ │
│  │  │ [#itemDate]              [#itemStatus]           │ │ │
│  │  │ "May 2nd, 2026"          "✅ Complete"            │ │ │
│  │  │                                                      │ │ │
│  │  │ [#itemMusicians]                                   │ │ │
│  │  │ "🎵 Musicians: 3/3 approved"                      │ │ │
│  │  │                                                      │ │ │
│  │  │ [#itemNonProfit]                                   │ │ │
│  │  │ "🏢 Non-Profit: 1/1 approved"                     │ │ │
│  │  │                                                      │ │ │
│  │  │ [#itemVolunteers]                                  │ │ │
│  │  │ "👥 Volunteers: 11/11 covered"                   │ │ │
│  │  │                                                      │ │ │
│  │  │ [#btnToggleDetails]                                │ │ │
│  │  │ "Show Details"                                      │ │ │
│  │  │                                                      │ │ │
│  │  │ [#detailsContainer] (collapsed)                    │ │ │
│  │  │   └─ [#detailsContent]                             │ │ │
│  │  │       (HTML content with assignments)               │ │ │
│  │  └──────────────────────────────────────────────────┘ │ │
│  │                                                         │ │
│  │  ┌─ Repeater Item 2 ────────────────────────────────┐ │ │
│  │  │ (Same structure for next date)                    │ │ │
│  │  └──────────────────────────────────────────────────┘ │ │
│  │                                                         │ │
│  │  ... (all 27 dates)                                    │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔧 Step-by-Step Setup Instructions

### **Step 1: Add Month Navigation Tabs**

1. **Add Month Tab Buttons:**
   - Add 6 buttons/tabs for: May, June, July, August, September, October
   - Set IDs to: `tabMay`, `tabJune`, `tabJuly`, `tabAugust`, `tabSeptember`, `tabOctober`
   - Position them horizontally at the top of the page
   - Style them as tabs (you can add active/inactive styling)
   - **Note:** The code will handle clicking and filtering automatically

### **Step 2: Add Page-Level Elements**

1. **Add Loading Indicator:**
   - Add any element (text, image, or spinner)
   - Set ID to: `loadingIndicator`
   - Initially hide it (or it will auto-hide when data loads)

2. **Add Error Message:**
   - Add a text element
   - Set ID to: `msgError`
   - Initially hide it

### **Step 3: Add Main Repeater**

1. **Add Repeater:**
   - Add a Repeater element
   - Set ID to: `calendarRepeater`
   - This will display all 27 dates

### **Step 4: Design Repeater Item**

**Inside the repeater item design, add these elements:**

1. **Date and Status Row:**
   - Add a text element → Set ID to: `itemDate`
   - Add another text element → Set ID to: `itemStatus`
   - Position them on the same row (date left, status right)

2. **Coverage Text Elements:**
   - Add text element → Set ID to: `itemMusicians`
   - Add text element → Set ID to: `itemNonProfit`
   - Add text element → Set ID to: `itemVolunteers`
   - Stack them vertically below the date/status row

3. **Toggle Button:**
   - Add a button → Set ID to: `btnToggleDetails`
   - Set initial text to: "Show Details"

4. **Expandable Details:**
   - Add a Collapsible Container (or Box) → Set ID to: `detailsContainer`
   - **Important:** Make sure it's a collapsible container that supports `.collapse()` and `.expand()`
   - Initially collapse it
   - Inside the container, add:
     - HTML Component (preferred) OR Text element → Set ID to: `detailsContent`

---

## ✅ ID Checklist

Use this checklist to verify all IDs are set correctly:

### **Page Level:**
- [ ] `#tabMay` - May month tab button
- [ ] `#tabJune` - June month tab button
- [ ] `#tabJuly` - July month tab button
- [ ] `#tabAugust` - August month tab button
- [ ] `#tabSeptember` - September month tab button
- [ ] `#tabOctober` - October month tab button
- [ ] `#loadingIndicator` - Loading indicator element
- [ ] `#msgError` - Error message text element
- [ ] `#calendarRepeater` - Main repeater

### **Repeater Item Level:**
- [ ] `#itemDate` - Date text element
- [ ] `#itemStatus` - Status text element
- [ ] `#itemMusicians` - Musicians coverage text
- [ ] `#itemNonProfit` - Non-profit coverage text
- [ ] `#itemVolunteers` - Volunteers coverage text
- [ ] `#btnToggleDetails` - Toggle details button
- [ ] `#detailsContainer` - Collapsible container
- [ ] `#detailsContent` - HTML/text component inside container

---

## 🎨 Styling Recommendations

### **Status Colors:**
The code will automatically set colors, but you can also style in Wix:
- **Complete:** Green (#28a745)
- **Needs Attention:** Yellow (#ffc107)
- **Critical Gaps:** Red (#dc3545)

### **Layout Tips:**
- Use cards/boxes for each repeater item for better visual separation
- Add padding/spacing between elements
- Make the date text larger/bold for emphasis
- Right-align the status indicator
- Style the toggle button to be prominent but not overwhelming

---

## 🐛 Common Issues & Solutions

### **Issue: Details not expanding**
- **Solution:** Make sure `#detailsContainer` is a Collapsible Container, not a regular Box
- Verify the container supports `.collapse()` and `.expand()` methods

### **Issue: HTML not rendering in details**
- **Solution:** Use an HTML Component for `#detailsContent`, not a regular Text element
- If HTML Component isn't available, the code will fall back to plain text

### **Issue: Status colors not showing**
- **Solution:** The code sets colors via JavaScript. If colors don't appear, check that the element supports `.style.color`
- You can also add CSS classes in Wix for styling

### **Issue: Repeater not showing data**
- **Solution:** 
  - Verify `#calendarRepeater` ID matches exactly
  - Check browser console for errors
  - Ensure `MarketDates2026` collection has data

---

## 📝 Quick Reference

**Minimum Required Elements:**
1. `#tabMay`, `#tabJune`, `#tabJuly`, `#tabAugust`, `#tabSeptember`, `#tabOctober` - Month tab buttons (REQUIRED)
2. `#calendarRepeater` - Repeater (REQUIRED)
3. `#itemDate` - Text in repeater item (REQUIRED)
4. `#itemStatus` - Text in repeater item (REQUIRED)
5. `#itemMusicians` - Text in repeater item (REQUIRED)
6. `#itemNonProfit` - Text in repeater item (REQUIRED)
7. `#itemVolunteers` - Text in repeater item (REQUIRED)
8. `#btnToggleDetails` - Button in repeater item (REQUIRED)
9. `#detailsContainer` - Collapsible container in repeater item (REQUIRED)
10. `#detailsContent` - HTML/text component inside container (REQUIRED)

**Optional but Recommended:**
- `#loadingIndicator` - Loading indicator
- `#msgError` - Error messages

---

**Once all IDs are set, copy the code from `src/pages/Market Calendar.rhmek.js` into your page's code section!**
