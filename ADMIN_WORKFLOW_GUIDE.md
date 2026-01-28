# Admin Dashboard - Workflow Guide

## 🔄 Complete Workflow Overview

### Step 1: Submission (Automatic)
- **Musicians/Volunteers/Non-Profits** submit forms
- Creates `SpecialtyProfiles` record
- Creates `WeeklyAssignments` records (one per selected date)
- **Status:** `Pending` (default)

### Step 2: Review (Admin Dashboard)
- Admin views submissions in dashboard
- Filters by type (Musicians/Volunteers/Non-Profits)
- Filters by date or status
- Reviews each submission

### Step 3: Decision (Approve/Reject)
- **Approve:** Click "Approve" button → Status changes to `Approved`
  - For **Musicians only:** Assign location using dropdown (if needed)
  - For **Volunteers/Non-Profits:** No location needed (location is implied by role/booth type)
- **Reject:** Click "Reject" button → Status changes to `Rejected`

---

## 📊 Status Flow

```
Pending → Approved (final)
   ↓
Rejected (end of workflow)
```

### Status Meanings:
- **Pending:** New submission, awaiting review
- **Approved:** Admin approved the request (final status - assignment is confirmed)
- **Rejected:** Admin rejected the request (workflow ends)

---

## 🎯 Location Assignment

### For Musicians:
- **Location dropdown is visible** in the admin dashboard
- **Multiple performance locations** available (Location A, B, C, Default)
- Assign specific location based on:
  - Musician preference (if they selected one)
  - Sound/equipment needs
  - Schedule conflicts
  - Space availability
- Location can be assigned when approving or after approval

### For Volunteers:
- **Location dropdown is hidden** (not needed)
- **Role determines location:**
  - Token Booth Sales → Token booth location
  - Merch Sales → Merch booth location
  - Setup/Teardown → Various locations
  - Hospitality Support → Throughout market
- Location is implied by the volunteer role selected

### For Non-Profits:
- **Location dropdown is hidden** (not needed)
- **Single non-profit booth space** per week
- Location is always the same (non-profit booth area)
- Only one organization can be approved per date

---

## 💡 Current Workflow

1. **Review** submissions (filter by type, date, or status)
2. **Approve** or **Reject** using action buttons
3. **Assign Location** (Musicians only) - use dropdown if needed
   - Location dropdown is automatically hidden for Volunteers and Non-Profits
   - Can assign location when approving or after approval

---

## 🔧 Current Implementation

### Status Buttons:
- **Approve Button:** Changes status to `Approved` (hides after approval)
- **Reject Button:** Changes status to `Rejected` (hides after rejection)

### Location Assignment:
- **Location Dropdown:** Only visible for Musicians
  - Options: Unassigned, Default, Location A, B, C
  - Changes `assignedMapId` field
  - Automatically hidden for Volunteers and Non-Profits

---

## 🚀 Potential Enhancements

### Location Assignment Improvements:
1. **Visual Map:** Click button to see map and select location visually
2. **Conflict Detection:** Warn if location already assigned to another person/date
3. **Bulk Assignment:** Assign multiple assignments to same location
4. **Quick Actions:** "Assign to Default" button

### Workflow Enhancements:
1. **Email Notifications:** Auto-send when status changes
2. **Notes Field:** Add admin notes to each assignment
3. **Calendar View:** See all assignments on calendar
4. **Export:** Export final schedule to CSV/PDF

---

## 🚀 Potential Enhancements

### Workflow Enhancements:
1. **Email Notifications:** Auto-send when approved/rejected
2. **Notes Field:** Add admin notes to each assignment
3. **Calendar View:** See all assignments on calendar
4. **Export:** Export final schedule to CSV/PDF
5. **Conflict Detection:** Warn if location already assigned to another musician/date
6. **Bulk Operations:** Bulk approve/reject, bulk location assignment

---

**Current workflow is simplified: Pending → Approved/Rejected. Location assignment only for Musicians.**
