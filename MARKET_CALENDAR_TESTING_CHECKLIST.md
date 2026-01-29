# Market Calendar - Testing Checklist

## 🧪 Quick Testing Checklist

### **Initial Load**
- [ ] Page loads without errors
- [ ] Loading indicator appears briefly, then disappears
- [ ] No console errors in browser dev tools

### **Month Navigation Tabs**
- [ ] All 6 month tabs appear (May, June, July, August, September, October)
- [ ] Clicking each tab filters to show only dates for that month
- [ ] Default month is May (first market month)
- [ ] Tab switching is smooth and responsive

### **Date Display**
- [ ] Dates appear in chronological order
- [ ] Each date shows:
  - [ ] Date title (e.g., "May 2nd, 2026")
  - [ ] Status indicator with emoji + word (✅ Complete, ⚠️ Attention, ❌ Critical)
  - [ ] Status text is colored (green/yellow/red)
  - [ ] Musicians coverage (e.g., "🎵 Musicians: 3/3 approved")
  - [ ] Non-profit coverage (e.g., "🏢 Non-Profit: 1/1 approved")
  - [ ] Volunteers coverage (e.g., "👥 Volunteers: 11/11 covered")
  - [ ] Pending counts shown in parentheses when applicable

### **Status Indicators**
- [ ] ✅ Complete appears in green for fully covered dates
- [ ] ⚠️ Attention appears in yellow/orange for partial coverage
- [ ] ❌ Critical appears in red for missing critical items
- [ ] Status colors match emoji colors

### **Expandable Details**
- [ ] "Show Details" button appears for each date
- [ ] Clicking "Show Details" expands the details section
- [ ] Button text changes to "Hide Details" when expanded
- [ ] Clicking "Hide Details" collapses the section
- [ ] Details section shows:
  - [ ] Musicians section with approved and pending lists
  - [ ] Non-profit section with approved and pending lists
  - [ ] Volunteers section with approved and pending lists
  - [ ] Volunteer role breakdown with coverage status (✅/⚠️/❌)

### **Coverage Calculations**
- [ ] Musician coverage counts correctly (approved vs goal of 3)
- [ ] Non-profit coverage counts correctly (approved vs required of 1)
- [ ] Volunteer coverage counts correctly (covered vs required of 11)
- [ ] Pending submissions are shown but NOT counted toward coverage
- [ ] Only "Approved" status counts toward coverage

### **Data Accuracy**
- [ ] All 27 market dates appear (May 2 - October 31, 2026)
- [ ] Each month shows correct number of dates:
  - [ ] May: 5 dates
  - [ ] June: 4 dates
  - [ ] July: 5 dates
  - [ ] August: 4 dates
  - [ ] September: 5 dates
  - [ ] October: 4 dates
- [ ] Assignment data matches what's in CMS
- [ ] Location information shows for musicians
- [ ] Role and shift information shows for volunteers

### **Edge Cases**
- [ ] Dates with no assignments show "0/3", "0/1", "0/11" correctly
- [ ] Dates with only pending submissions show pending counts
- [ ] Empty sections show "No musicians assigned", etc.
- [ ] Volunteer role breakdown shows correct counts per role

### **UI/UX**
- [ ] Layout is clean and readable
- [ ] Text is not cut off or overlapping
- [ ] Colors are visible and match emoji colors
- [ ] Expandable sections work smoothly
- [ ] Page is responsive (if testing on mobile)

### **Performance**
- [ ] Page loads within reasonable time (< 3 seconds)
- [ ] Month tab switching is instant
- [ ] Details expansion/collapse is smooth
- [ ] No lag when scrolling through dates

---

## 🐛 If Something Doesn't Work

### **No Dates Showing:**
- Check browser console for errors
- Verify `MarketDates2026` collection has all 27 dates
- Check that `#calendarRepeater` ID matches exactly

### **Status Indicators Not Showing:**
- Verify `#itemStatus` element exists in repeater item
- Check that element supports `.text` and `.style.color` properties
- Look for console errors

### **Details Not Expanding:**
- Verify `#detailsContainer` is a Collapsible Container
- Check that `#btnToggleDetails` button exists
- Ensure `#detailsContent` element exists inside container
- Check console for errors

### **Coverage Counts Wrong:**
- Verify `WeeklyAssignments` has proper `profileRef` and `dateRef` references
- Check that `applicationStatus` field values are exactly "Approved", "Pending", or "Rejected"
- Verify data in CMS matches what's displayed

### **Month Tabs Not Working:**
- Verify all 6 tab IDs exist: `#tabMay`, `#tabJune`, `#tabJuly`, `#tabAugust`, `#tabSeptember`, `#tabOctober`
- Check that tabs are buttons with `onClick` handlers
- Look for console errors when clicking tabs

---

## ✅ Success Criteria

The calendar is working correctly if:
1. ✅ All 27 dates load and display
2. ✅ Month tabs filter dates correctly
3. ✅ Coverage calculations are accurate
4. ✅ Status indicators show correct colors
5. ✅ Details expand/collapse properly
6. ✅ No console errors
7. ✅ Data matches CMS

---

**Ready to test! Go through this checklist and mark items as you verify them.**
