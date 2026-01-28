# Planning Dashboard - Calendar View Proposal

## 🎯 Overview

A calendar/planning dashboard that provides a week-by-week view of market coverage, helping planning staff quickly identify gaps and ensure all requirements are met for each market date.

---

## 📋 Requirements

### Coverage Targets Per Market Date:
- **Musicians:** 3 approved musicians (at different locations: Location A, B, C, or Default)
- **Non-Profits:** 1 approved non-profit
- **Volunteers:** Coverage for all required roles/shifts

### Key Features Needed:
1. **Weekly Calendar View:** See all 27 market dates at a glance
2. **Coverage Indicators:** Visual indicators showing what's covered/missing
3. **Quick Gap Identification:** Highlight dates that need attention
4. **Drill-Down:** Click a date to see details and make assignments
5. **Filtering:** Filter by status (show only approved, or include pending)

---

## 🎨 Proposed UI Design

### Option 1: Calendar Grid View (Recommended)

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│  Market Calendar - 2026 Season                            │
│  [Show: All Statuses ▼] [Show: Approved Only ▼]         │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  May 2, 2026          May 9, 2026          May 16, 2026 │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐│
│  │ ✅ Musicians│     │ ⚠️ Musicians│     │ ✅ Musicians││
│  │    3/3      │     │    2/3      │     │    3/3      ││
│  │ ✅ Non-Profit│     │ ✅ Non-Profit│     │ ❌ Non-Profit││
│  │    1/1      │     │    1/1      │     │    0/1      ││
│  │ ✅ Volunteers│     │ ⚠️ Volunteers│     │ ✅ Volunteers││
│  │    Covered  │     │    Partial  │     │    Covered  ││
│  │ [View Details]│     │ [View Details]│     │ [View Details]││
│  └─────────────┘     └─────────────┘     └─────────────┘│
│                                                           │
│  May 23, 2026         May 30, 2026         June 6, 2026  │
│  ...                                                   │
└─────────────────────────────────────────────────────────┘
```

**Status Indicators:**
- ✅ **Green:** Fully covered (meets all requirements)
- ⚠️ **Yellow:** Partially covered (some gaps)
- ❌ **Red:** Missing critical coverage (no non-profit, < 3 musicians)

### Option 2: List View (Alternative)

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│  Market Schedule - 2026 Season                           │
│  [Filter: All Dates ▼] [Status: Approved Only ▼]       │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  📅 May 2, 2026                              [✅ Complete]│
│  ├─ 🎵 Musicians: 3/3 (Location A, B, C)                 │
│  ├─ 🏢 Non-Profit: 1/1 (Community Food Bank)            │
│  └─ 👥 Volunteers: Covered (Token, Merch, Setup)       │
│                                                           │
│  📅 May 9, 2026                              [⚠️ Needs Attention]│
│  ├─ 🎵 Musicians: 2/3 (Location A, B) - Missing 1       │
│  ├─ 🏢 Non-Profit: 1/1 (Local Arts Council)             │
│  └─ 👥 Volunteers: Partial (Missing: Token Booth)        │
│                                                           │
│  📅 May 16, 2026                             [❌ Critical Gaps]│
│  ├─ 🎵 Musicians: 3/3 (Location A, B, C)                │
│  ├─ 🏢 Non-Profit: 0/1 - MISSING                        │
│  └─ 👥 Volunteers: Covered                              │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

---

## 🔧 Technical Implementation

### Data Structure

**Weekly Coverage Summary:**
```javascript
{
  dateId: "91713bc6-6136-43c6-8b6d-4a2489d69b02",
  date: "2026-05-02",
  dateTitle: "May 2nd, 2026",
  musicians: {
    approved: 3,
    required: 3,
    assignments: [
      { name: "Band A", location: "Location A", status: "Approved" },
      { name: "Band B", location: "Location B", status: "Approved" },
      { name: "Band C", location: "Location C", status: "Approved" }
    ],
    pending: 2,
    status: "complete" // "complete", "partial", "missing"
  },
  nonProfit: {
    approved: 1,
    required: 1,
    assignment: { name: "Community Food Bank", status: "Approved" },
    pending: 0,
    status: "complete"
  },
  volunteers: {
    roles: {
      "Token Sales": { early: 1, late: 1, required: 2 },
      "Merch Sales": { early: 1, late: 0, required: 2 },
      "Setup": { early: 1, late: 0, required: 1 },
      "Teardown": { early: 0, late: 1, required: 1 },
      "Hospitality": { early: 0, late: 1, required: 1 }
    },
    status: "complete" // "complete", "partial", "missing"
  },
  overallStatus: "complete" // "complete", "needs_attention", "critical"
}
```

### Key Functions Needed

1. **`loadMarketCalendar()`** - Load all 27 dates with coverage summaries
2. **`calculateCoverage(dateId)`** - Calculate coverage for a specific date
3. **`getMusicianCoverage(dateId)`** - Count approved musicians per date
4. **`getNonProfitCoverage(dateId)`** - Check if non-profit is assigned
5. **`getVolunteerCoverage(dateId)`** - Check volunteer role coverage
6. **`getOverallStatus(coverage)`** - Determine overall status (complete/partial/missing)

---

## 📊 Coverage Logic

### Musicians (3 required per date):
- **Complete:** 3+ approved musicians
- **Partial:** 1-2 approved musicians
- **Missing:** 0 approved musicians
- **Note:** Should ideally have musicians at different locations (A, B, C)

### Non-Profits (1 required per date):
- **Complete:** 1 approved non-profit
- **Missing:** 0 approved non-profits

### Volunteers (Role-based coverage):
- **Complete:** All required roles covered for both shifts (if applicable)
- **Partial:** Some roles covered, some missing
- **Missing:** Critical roles missing (e.g., Token Sales, Setup)

**Volunteer Role Requirements:**
- Token Sales: 2 volunteers (1 early, 1 late)
- Merch Sales: 2 volunteers (1 early, 1 late)
- Setup: 1 volunteer (early shift)
- Teardown: 1 volunteer (late shift)
- Hospitality Support: 1 volunteer (flexible shift)

---

## 🎨 UI Components Needed

### Calendar View Page:
- `#calendarContainer` - Container for calendar grid/list
- `#dateCards` - Repeater for date cards
- `#filterStatus` - Dropdown (All Statuses, Approved Only, Pending Only)
- `#viewToggle` - Toggle between Grid/List view (optional)

### Date Card Elements (in Repeater):
- `#cardDate` - Text - Date title
- `#musicianStatus` - Text/Icon - Musician coverage (3/3)
- `#nonProfitStatus` - Text/Icon - Non-profit coverage (1/1)
- `#volunteerStatus` - Text/Icon - Volunteer coverage
- `#overallStatus` - Badge/Icon - Overall status indicator
- `#btnViewDetails` - Button - View/edit assignments for this date

### Detail Modal/Page (when clicking a date):
- Shows all assignments for that date
- Allows quick approve/reject
- Shows pending submissions
- Allows location assignment for musicians

---

## 🔄 Workflow Integration

### Current Flow:
1. Submissions come in → Status: Pending
2. Admin reviews in "Specialty Requests" dashboard
3. Admin approves/rejects individual submissions

### New Planning Flow:
1. **Planning Dashboard:** View calendar to see coverage
2. **Identify Gaps:** See which dates need attention
3. **Review Submissions:** Click date → See pending/approved for that date
4. **Make Assignments:** Approve submissions or assign locations
5. **Verify Coverage:** Return to calendar view to confirm coverage

---

## 💡 Features to Consider

### Phase 1 (MVP):
- ✅ Calendar grid/list view
- ✅ Coverage indicators (complete/partial/missing)
- ✅ Click date to see details
- ✅ Filter by status (approved only vs all)

### Phase 2 (Enhancements):
- 📧 Email notifications for gaps
- 📊 Coverage statistics (overall season coverage)
- 🔍 Search/filter by name
- 📥 Export calendar to PDF/CSV
- 🎨 Color coding by status
- 📱 Mobile-responsive design

### Phase 3 (Advanced):
- 🤖 Auto-suggest assignments based on preferences
- ⚠️ Conflict detection (same musician multiple dates)
- 📅 Drag-and-drop assignment
- 📈 Coverage trends/analytics

---

## 🚀 Implementation Plan

### Step 1: Create Planning Dashboard Page
- New Wix page: "Market Calendar" or "Planning Dashboard"
- Add calendar container and filters

### Step 2: Build Coverage Calculation Functions
- Query `WeeklyAssignments` grouped by `dateRef`
- Calculate coverage for each date
- Determine status (complete/partial/missing)

### Step 3: Create Calendar View
- Display dates in grid or list format
- Show coverage indicators
- Add click handlers to view details

### Step 4: Create Date Detail View
- Modal or separate section showing all assignments for a date
- Allow quick approve/reject
- Show pending submissions

### Step 5: Testing & Refinement
- Test with real data
- Verify coverage calculations
- Ensure performance with 27 dates

---

## ❓ Questions to Clarify

1. **Musician Locations:** Do you need exactly 3 musicians at 3 different locations, or just 3 total?
2. **Volunteer Requirements:** What are the exact volunteer requirements per week? (roles and shifts)
3. **Pending Submissions:** Should pending submissions count toward coverage, or only approved?
4. **View Preference:** Grid view vs list view - which is more useful for your team?
5. **Detail View:** Modal popup vs separate page vs expandable section?

---

## 📝 Next Steps

1. **Review this proposal** and provide feedback
2. **Clarify requirements** (volunteer needs, musician location requirements)
3. **Choose UI approach** (grid vs list, modal vs page)
4. **Start implementation** with MVP features
5. **Iterate** based on user feedback

---

**Ready to build this planning dashboard! Let me know your preferences and we can start implementation.**
