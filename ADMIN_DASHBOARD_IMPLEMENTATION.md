# Admin Dashboard - Schedule Management Implementation Guide

## 🎯 Overview

A unified admin dashboard for managing musician, volunteer, and non-profit schedules. Allows admins to view submissions, approve/reject requests, and assign locations.

---

## 📋 Required UI Elements

### Navigation Tabs
- `#tabMusicians` - Button/Tab - Switch to Musicians view
- `#tabVolunteers` - Button/Tab - Switch to Volunteers view  
- `#tabNonProfits` - Button/Tab - Switch to Non-Profits view

### Filters
- `#filterDate` - Dropdown - Filter by market date (populated automatically)
- `#filterStatus` - Dropdown (optional) - Filter by status (Pending, Approved, Rejected)

### Statistics Display (Optional but Recommended)
- `#statTotal` - Text element - Total assignments count
- `#statPending` - Text element - Pending count
- `#statApproved` - Text element - Approved count
- `#statConfirmed` - Text element - Confirmed count

### Content Area
- `#assignmentsContainer` - Container/Box - Container for assignment list
- `#assignmentsRepeater` - Repeater - Display assignments (recommended approach)
- `#loadingIndicator` - Element - Loading spinner/text (initially hidden)

### Messages
- `#msgSuccess` - Text element - Success messages (initially hidden)
- `#msgError` - Text element - Error messages (initially hidden)

---

## 🏗️ Recommended Implementation Approaches

### Option 1: Wix CMS Table View (Simplest)

**Pros:**
- No custom code needed
- Built-in filtering and sorting
- Easy to use

**Cons:**
- Less customization
- Can't easily filter by profile type

**Steps:**
1. Add a CMS table element to your admin page
2. Connect to `WeeklyAssignments` collection
3. Use CMS filters to view by date
4. Manually update status and location in table

### Option 2: Custom Velo Page with Repeater (Recommended)

**Pros:**
- Full control over display
- Better filtering and organization
- Custom workflows

**Cons:**
- Requires more setup
- More code to maintain

**Steps:**
1. Create admin page with tabs
2. Add repeater for assignments
3. Use the provided code to populate repeater
4. Add action buttons in repeater items

### Option 3: Hybrid (Best of Both)

**Pros:**
- Quick start with CMS
- Custom features where needed

**Cons:**
- Requires both approaches

**Steps:**
1. Use CMS table for quick viewing
2. Add custom Velo page for advanced features
3. Link between them

---

## 📊 Data Structure

### WeeklyAssignments Collection Fields Used:
- `profileRef` - References SpecialtyProfiles (includes type, name, contact info)
- `dateRef` - References MarketDates2026 (includes date, title)
- `applicationStatus` - Status: "Pending", "Approved", "Rejected"
- `assignedMapId` - Location assignment (Musicians only - hidden for Volunteers/Non-Profits)

### SpecialtyProfiles Collection Fields Used:
- `type` - "Musician", "Volunteer", or "NonProfit"
- `organizationName` - Name/band name
- `contactEmail` - Contact email
- `contactPhone` - Contact phone
- `volunteerRole` - Volunteer role (for volunteers)
- `shiftPreference` - Shift preference (for volunteers)
- `musicianType` - Musician type (for musicians)
- `nonProfitType` - Non-profit type (for non-profits)

---

## 🎨 Repeater Implementation (If Using Option 2)

### Repeater Item Elements:
- `#repeaterItem` - Repeater item container
- `#itemName` - Text - Organization/Person name
- `#itemDate` - Text - Market date
- `#itemContact` - Text - Contact info (email/phone)
- `#itemDetails` - Text - Type-specific details (role, shift, etc.)
- `#itemStatus` - Dropdown/Text - Current status (Pending, Approved, Rejected)
- `#itemLocation` - Dropdown/Text - Assigned location (Musicians only - automatically hidden for Volunteers/Non-Profits)
- `#btnApprove` - Button - Approve assignment
- `#btnReject` - Button - Reject assignment

### Repeater Data Structure:
```javascript
{
  _id: assignment._id,
  name: profile.organizationName,
  date: dateRef.title,
  contactEmail: profile.contactEmail,
  contactPhone: profile.contactPhone,
  status: assignment.applicationStatus || 'Pending',
  location: assignment.assignedMapId || 'Unassigned',
  details: getTypeSpecificDetails(profile), // Role, shift, etc.
  profileType: profile.type
}
```

---

## 🔄 Workflow Functions

### Status Updates
- `updateAssignmentStatus(assignmentId, newStatus)` - Updates application status
- Statuses: "Pending", "Approved", "Rejected"

### Location Assignment
- `updateAssignmentLocation(assignmentId, locationId)` - Assigns location
- Location IDs: Based on your location system

### Bulk Operations (Future Enhancement)
- Bulk approve/reject
- Bulk location assignment
- Export to CSV

---

## 📝 Next Steps

1. **Create Admin Page in Wix Editor:**
   - Add tabs for Musicians, Volunteers, Non-Profits
   - Add date filter dropdown
   - Add statistics display (optional)
   - Add content area for assignments

2. **Choose Implementation Approach:**
   - Option 1: Use CMS table (quickest)
   - Option 2: Build custom repeater (most flexible)
   - Option 3: Hybrid approach

3. **Test Dashboard:**
   - Switch between tabs
   - Filter by date
   - Update statuses
   - Assign locations

4. **Enhancements (Future):**
   - Calendar view
   - Conflict detection
   - Email notifications
   - Schedule export

---

## 💡 Quick Start: CMS Table Approach

If you want to get started quickly:

1. **Create Admin Page:**
   - Add CMS table element
   - Connect to `WeeklyAssignments` collection
   - Enable inline editing

2. **Add Filters:**
   - Use CMS table filters
   - Filter by `dateRef` to see assignments for specific dates
   - Manually filter by checking `profileRef.type` in related collection

3. **Update Records:**
   - Click on `applicationStatus` cell to update status
   - Click on `assignedMapId` cell to assign location
   - Changes save automatically

4. **View Related Data:**
   - Click on `profileRef` to see full profile details
   - Click on `dateRef` to see date information

This gives you a working admin interface immediately, then you can enhance with custom Velo code later!

---

**The code file `ADMIN-Schedule-Management.ais9x.js` is ready to use. You'll need to create the UI elements listed above in your Wix Editor.**
