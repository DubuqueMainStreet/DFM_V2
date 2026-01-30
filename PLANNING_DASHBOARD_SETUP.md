# Planning Dashboard - Setup Guide

## 🎯 Overview

A calendar/planning dashboard that shows all 27 market dates with coverage indicators, helping you quickly identify which dates need attention.

---

## 📋 Required UI Elements

### Main Container:
- `#calendarContainer` - Container/Box - Main container for the calendar list

### Repeater:
- `#calendarRepeater` - Repeater - Displays all 27 market dates

### Repeater Item Elements:
- `#itemDate` - Text - Date title (e.g., "May 2nd, 2026")
- `#itemStatus` - Text - Overall status indicator (✅ Complete, ⚠️ Needs Attention, ❌ Critical Gaps)
- `#itemMusicians` - Text - Musician coverage (e.g., "🎵 Musicians: 3/3 approved (2 pending)")
- `#itemNonProfit` - Text - Non-profit coverage (e.g., "🏢 Non-Profit: 1/1 approved")
- `#itemVolunteers` - Text - Volunteer coverage (e.g., "👥 Volunteers: 8/11 covered (1 pending)")
- `#btnToggleDetails` - Button - Toggle expandable details section
- `#detailsContainer` - Collapsible Container - Expandable section for detailed view
- `#detailsContent` - HTML Component or Text - Content area for detailed assignments

### Messages:
- `#loadingIndicator` - Element - Loading spinner/text (initially hidden)
- `#msgError` - Text element - Error messages (initially hidden)

---

## 🎨 Layout Structure

```
┌─────────────────────────────────────────────────────────┐
│  Market Calendar - 2026 Season                          │
│  [Loading Indicator]                                    │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  📅 May 2nd, 2026                    [✅ Complete]      │
│  🎵 Musicians: 3/3 approved                            │
│  🏢 Non-Profit: 1/1 approved                            │
│  👥 Volunteers: 11/11 covered                          │
│  [Show Details]                                         │
│                                                           │
│  📅 May 9th, 2026              [⚠️ Needs Attention]      │
│  🎵 Musicians: 2/3 approved (1 pending)                │
│  🏢 Non-Profit: 1/1 approved                            │
│  👥 Volunteers: 8/11 covered (1 pending)              │
│  [Show Details]                                         │
│                                                           │
│  📅 May 16th, 2026                 [❌ Critical Gaps]  │
│  🎵 Musicians: 3/3 approved                            │
│  🏢 Non-Profit: 0/1 approved (2 pending)              │
│  👥 Volunteers: 11/11 covered                          │
│  [Show Details]                                         │
│                                                           │
│  ... (all 27 dates)                                     │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

---

## 📊 Coverage Logic

### Musicians:
- **Goal:** 3 approved musicians (ideally at different locations: A, B, C, Default)
- **Complete:** 3+ approved, covering 3+ locations
- **Partial:** 1-2 approved, or not covering enough locations
- **Missing:** 0 approved
- **Pending:** Shown in parentheses but not counted toward coverage

### Non-Profits:
- **Required:** 1 approved per date
- **Complete:** 1+ approved
- **Missing:** 0 approved
- **Pending:** Shown in parentheses but not counted toward coverage

### Volunteers:
- **Full Staff Requirements:**
  - Token Sales: 2 volunteers
  - Merch Sales: 1-2 volunteers
  - Setup: 2 volunteers
  - Teardown: 2 volunteers
  - Hospitality Support: 2 volunteers
  - **Total:** 11 volunteers minimum
- **Complete:** 80%+ coverage (9+ volunteers)
- **Partial:** 50-79% coverage (6-8 volunteers)
- **Missing:** <50% coverage (<6 volunteers)
- **Pending:** Shown in parentheses but not counted toward coverage

### Overall Status:
- **✅ Complete:** All critical requirements met (non-profit + musicians)
- **⚠️ Needs Attention:** Some gaps but not critical
- **❌ Critical Gaps:** Missing non-profit or all musicians

---

## 🔧 Setup Steps

### Step 1: Create Page in Wix Editor
1. Create a new page called "Market Calendar" or "Planning Dashboard"
2. Add a container (`#calendarContainer`) for the calendar list
3. Add a repeater (`#calendarRepeater`) inside the container

### Step 2: Set Up Repeater Item
1. Design the repeater item with:
   - Date text element (`#itemDate`)
   - Status text element (`#itemStatus`)
   - Musicians text element (`#itemMusicians`)
   - Non-profit text element (`#itemNonProfit`)
   - Volunteers text element (`#itemVolunteers`)
   - Toggle button (`#btnToggleDetails`)
   - Collapsible container (`#detailsContainer`)
   - HTML/text component inside collapsible (`#detailsContent`)

2. Style the repeater item as needed (cards, spacing, etc.)

### Step 3: Add Code
1. Copy the code from `src/pages/Market Calendar.rhmek.js`
2. Paste it into your page's code section in Wix Editor

### Step 4: Add Loading/Error Messages
1. Add loading indicator (`#loadingIndicator`) - initially hidden
2. Add error message element (`#msgError`) - initially hidden

### Step 5: Test
1. Preview the page
2. Verify all 27 dates load
3. Check that coverage calculations are correct
4. Test expandable details section

---

## 📝 Repeater Item Layout Example

**Recommended Layout:**
```
┌─────────────────────────────────────────────────────────┐
│  #itemDate (Text)                                        │
│  #itemStatus (Text) - Right aligned                      │
├─────────────────────────────────────────────────────────┤
│  #itemMusicians (Text)                                   │
│  #itemNonProfit (Text)                                   │
│  #itemVolunteers (Text)                                  │
│  #btnToggleDetails (Button)                             │
├─────────────────────────────────────────────────────────┤
│  #detailsContainer (Collapsible - Initially Collapsed)   │
│    └─ #detailsContent (HTML Component)                  │
└─────────────────────────────────────────────────────────┘
```

---

## 🎨 Styling Recommendations

### Status Colors:
- **✅ Complete:** Green (#28a745)
- **⚠️ Needs Attention:** Yellow (#ffc107)
- **❌ Critical Gaps:** Red (#dc3545)

### Layout:
- Use cards or boxes for each date item
- Add spacing between items
- Make the toggle button prominent
- Style the collapsible section with padding

---

## 🔍 How It Works

1. **On Page Load:**
   - Loads all 27 market dates from `MarketDates2026`
   - Queries all `WeeklyAssignments` with references
   - Groups assignments by date
   - Calculates coverage for each date

2. **Coverage Calculation:**
   - Counts approved vs pending submissions
   - Only approved count toward coverage
   - Pending shown but not counted

3. **Display:**
   - Shows all dates in list format
   - Color-coded status indicators
   - Expandable details for each date

4. **Details View:**
   - Shows all approved assignments
   - Shows all pending assignments
   - Shows volunteer role breakdown
   - Click "Show Details" to expand

---

## ✅ Testing Checklist

- [ ] All 27 dates load correctly
- [ ] Coverage calculations are accurate
- [ ] Status indicators show correct colors
- [ ] Pending submissions are shown but not counted
- [ ] Expandable details work correctly
- [ ] Details show all assignments (approved and pending)
- [ ] Volunteer role breakdown is accurate
- [ ] Loading indicator shows/hides correctly
- [ ] Error messages display if something fails

---

## 🐛 Troubleshooting

**No dates showing:**
- Check that `MarketDates2026` collection has data
- Check console for errors
- Verify repeater ID matches `#calendarRepeater`

**Coverage not calculating:**
- Check that `WeeklyAssignments` has data
- Verify references (`profileRef`, `dateRef`) are set up correctly
- Check console logs for calculation details

**Details not expanding:**
- Verify `#detailsContainer` is a collapsible container
- Check that `#btnToggleDetails` has onClick handler
- Verify `#detailsContent` exists

---

## 📚 Related Files

- **Code:** `src/pages/Market Calendar.rhmek.js`
- **Proposal:** `PLANNING_DASHBOARD_PROPOSAL.md`
- **Admin Dashboard:** `src/pages/Speciality Requests.k6g1g.js`

---

**Ready to set up! Follow the steps above and you'll have a working planning dashboard.**
