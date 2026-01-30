# Admin Dashboard Proposal - Musician Schedule Management

## 🎯 Overview

An admin dashboard for managing musician performance schedules, confirming dates, and assigning locations for each market date.

---

## 📊 Current Data Structure

### WeeklyAssignments Collection
- `profileRef` - References musician profile
- `dateRef` - References market date
- `Assigned Map ID` - Location assignment (from your screenshot)
- `Application Status` - Status tracking (from your screenshot)

### SpecialtyProfiles Collection
- `organizationName` - Musician/band name
- `contactEmail` - Contact info
- `contactPhone` - Phone number
- `preferredLocation` - Musician's preferred location
- `musicianType` - Type of performance
- `techNeeds` - Electric hookup needs
- `bio` - Musician bio

### MarketDates2026 Collection
- `date` - Market date (Saturday)
- `title` - Formatted display (e.g., "May 2nd, 2026")

---

## 🏗️ Proposed Admin Dashboard Architecture

### Option 1: Wix CMS-Based Admin (Recommended for Quick Start)

**Pros:**
- Built into existing Wix site
- Uses existing CMS collections
- No external dependencies
- Team can access via Wix login

**Cons:**
- Limited customization compared to custom dashboard
- Wix CMS UI constraints

**Implementation:**
1. **Admin-Only Page** (`/admin/musician-schedule`)
   - Protected by Wix Member Login
   - Only site owners/admins can access
   - Uses Wix CMS tables with custom Velo code

2. **Key Features:**
   - View all submissions grouped by date
   - Filter by date, status, location
   - Bulk approve/reject actions
   - Assign locations to confirmed musicians
   - Export schedule data

### Option 2: Custom Velo Admin Dashboard (More Flexible)

**Pros:**
- Full control over UI/UX
- Custom workflows
- Better filtering and search
- Can integrate with other tools

**Cons:**
- More development time
- Requires Velo coding

**Implementation:**
1. **Custom Admin Pages** with Velo
   - Dashboard overview page
   - Date-by-date schedule view
   - Musician management page
   - Bulk operations page

2. **Key Features:**
   - Calendar view of all dates
   - Drag-and-drop scheduling
   - Conflict detection
   - Email notifications
   - Schedule export (CSV/PDF)

### Option 3: Hybrid Approach (Best of Both Worlds)

**Pros:**
- Quick start with CMS
- Custom features where needed
- Scalable

**Cons:**
- Requires both CMS and Velo development

**Implementation:**
- Use Wix CMS for data entry/editing
- Custom Velo pages for advanced views and workflows
- Integrate with Wix Member Login for access control

---

## 🎨 Recommended Dashboard Features

### 1. **Schedule Overview Dashboard**
```
┌─────────────────────────────────────────────────┐
│  Musician Schedule Management                    │
├─────────────────────────────────────────────────┤
│  [Calendar View]  [List View]  [Export]         │
│                                                  │
│  Filter: [All Dates ▼] [Status ▼] [Location ▼] │
│                                                  │
│  May 2nd, 2026                                   │
│  ├─ ✅ Confirmed: 3 musicians                   │
│  ├─ ⏳ Pending: 5 musicians                     │
│  └─ ❌ Rejected: 2 musicians                     │
│                                                  │
│  June 6th, 2026                                  │
│  ├─ ✅ Confirmed: 2 musicians                   │
│  └─ ⏳ Pending: 8 musicians                      │
└─────────────────────────────────────────────────┘
```

### 2. **Date Detail View**
For each market date, show:
- All musician requests for that date
- Status of each request
- Location assignments
- Time slots (if applicable)
- Actions: Approve/Reject/Assign Location

### 3. **Musician Management**
- View all musicians
- See all their requested dates
- Contact information
- Performance history
- Bulk actions

### 4. **Location Assignment**
- View available locations per date
- Assign musicians to locations
- Check conflicts (same location, same time)
- Visual map/layout view

---

## 📋 Required CMS Field Additions

### WeeklyAssignments Collection - Additional Fields Needed:

1. **`applicationStatus`** (Text/Dropdown)
   - Values: "Pending", "Approved", "Rejected", "Confirmed"
   - Default: "Pending"

2. **`assignedLocation`** (Text/Dropdown)
   - Values: "Default", "Location A", "Location B", "Location C"
   - Default: null (unassigned)

3. **`assignedTimeSlot`** (Text/Dropdown) - Optional
   - Values: "9:00 AM", "10:00 AM", "11:00 AM", etc.
   - For time-based scheduling

4. **`notes`** (Text/Long Text) - Optional
   - Admin notes about assignment
   - Special requests, conflicts, etc.

5. **`confirmedDate`** (Date) - Optional
   - When admin confirmed the assignment

6. **`rejectionReason`** (Text) - Optional
   - If rejected, why

---

## 🔄 Recommended Workflow

### Step 1: Submission (Current - ✅ Working)
- Musician submits form
- Creates `SpecialtyProfiles` record
- Creates `WeeklyAssignments` records (one per selected date)
- Status: "Pending"

### Step 2: Review (Admin Dashboard Needed)
- Admin views all pending requests
- Reviews musician profiles
- Checks date availability
- Makes initial decisions

### Step 3: Approval/Rejection
- Admin approves or rejects each request
- Updates `applicationStatus` field
- If rejected, can add `rejectionReason`
- If approved, moves to assignment phase

### Step 4: Location Assignment
- Admin assigns `assignedLocation` to approved musicians
- Checks for conflicts (location/time)
- Can assign time slots if needed
- Updates status to "Confirmed"

### Step 5: Notification (Optional)
- Email musician with confirmation
- Include date, time, location details
- Send calendar invite (if integrated)

### Step 6: Schedule Export
- Export final schedule per date
- Export full season schedule
- Share with team/vendors

---

## 🛠️ Implementation Recommendations

### Phase 1: Basic Admin View (Quick Start - 1-2 days)
1. Create admin-only page
2. Display `WeeklyAssignments` in table format
3. Add status filter dropdown
4. Allow manual status updates in CMS
5. **Use Wix CMS table view with filters**

### Phase 2: Enhanced Dashboard (1 week)
1. Custom Velo page with better UI
2. Date-based grouping
3. Bulk approve/reject actions
4. Location assignment interface
5. **Custom Velo admin pages**

### Phase 3: Advanced Features (2-3 weeks)
1. Calendar view
2. Conflict detection
3. Email notifications
4. Schedule export
5. **Full custom dashboard**

---

## 💡 Quick Start: Basic Admin View

### Immediate Solution (Using Existing Wix CMS):

1. **Add Status Field to WeeklyAssignments:**
   - Field ID: `applicationStatus`
   - Type: Dropdown
   - Options: "Pending", "Approved", "Rejected", "Confirmed"
   - Default: "Pending"

2. **Add Location Field:**
   - Field ID: `assignedLocation`
   - Type: Dropdown
   - Options: "Default", "Location A", "Location B", "Location C"
   - Default: (empty)

3. **Use Wix CMS Table View:**
   - Filter by `dateRef` to see all requests for a date
   - Filter by `applicationStatus` to see pending/approved
   - Manually update status and location in CMS
   - Export to CSV for schedule sharing

4. **Create Admin-Only Page:**
   - Use Wix Member Login
   - Restrict to site owners/admins
   - Link to CMS collections
   - Add instructions for team

---

## 🎯 Recommended Next Steps

1. **Immediate (This Week):**
   - Add `applicationStatus` and `assignedLocation` fields to `WeeklyAssignments`
   - Test manual updates in CMS
   - Create admin-only page with links to collections

2. **Short Term (Next 2 Weeks):**
   - Build custom Velo admin dashboard page
   - Implement date-based filtering
   - Add bulk approve/reject functionality

3. **Medium Term (Next Month):**
   - Add location assignment interface
   - Implement conflict detection
   - Add email notifications

4. **Long Term (Future):**
   - Calendar view
   - Drag-and-drop scheduling
   - Integration with other tools
   - Mobile admin app

---

## 📝 Questions to Consider

1. **How many locations are there?** (You mentioned Location A, B, C)
2. **Do you need time slots?** (Multiple musicians per location per day?)
3. **Who needs access?** (Just admins, or also coordinators?)
4. **Do you need email notifications?** (Auto-send confirmations?)
5. **Do you need to export schedules?** (CSV, PDF, calendar format?)
6. **Do you need conflict detection?** (Prevent double-booking?)

---

## 🚀 Let's Start Building

I recommend starting with **Phase 1: Basic Admin View** using Wix CMS, then enhancing with custom Velo pages as needed.

Would you like me to:
1. Add the required fields to `WeeklyAssignments`?
2. Create a basic admin dashboard page?
3. Build a custom Velo admin interface?
4. Something else?

Let me know your priorities and I'll help you build the admin dashboard!
