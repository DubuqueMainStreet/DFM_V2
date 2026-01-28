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
- **Reject:** Click "Reject" button → Status changes to `Rejected`

### Step 4: Location Assignment (After Approval)
- Once `Approved`, you can assign a location
- Use location dropdown or "Assign Location" button
- Assigns `assignedMapId` field
- **Status can then move to:** `Confirmed` (optional)

### Step 5: Confirmation (Final Step)
- After location is assigned, click "Confirm" button
- Status changes to `Confirmed`
- Assignment is finalized

---

## 📊 Status Flow

```
Pending → Approved → Confirmed
   ↓
Rejected (end of workflow)
```

### Status Meanings:
- **Pending:** New submission, awaiting review
- **Approved:** Admin approved the request
- **Rejected:** Admin rejected the request (workflow ends)
- **Confirmed:** Final confirmation after location assignment

---

## 🎯 Location Assignment Use Cases

### For Musicians:
- **Multiple performance locations** available (Location A, B, C, Default)
- Assign specific location based on:
  - Musician preference (if they selected one)
  - Sound/equipment needs
  - Schedule conflicts
  - Space availability

### For Volunteers:
- **Role determines location:**
  - Token Booth Sales → Token booth location
  - Merch Sales → Merch booth location
  - Setup/Teardown → Various locations
  - Hospitality Support → Throughout market
- Location assignment may be less critical, but useful for:
  - Tracking which volunteers are where
  - Coordinating shifts
  - Managing coverage

### For Non-Profits:
- **One booth space per week** (same location each week)
- Location assignment may be:
  - Always the same (non-profit booth area)
  - Or used to track which org gets the space each week
- Useful for:
  - Ensuring only one org per date
  - Tracking which orgs have been assigned
  - Managing the rotation

---

## 💡 Recommended Workflow

### Option A: Simple Workflow (Current)
1. **Review** submissions
2. **Approve** or **Reject**
3. **Assign Location** (if approved)
4. **Confirm** (optional - marks as final)

### Option B: Enhanced Workflow (Future)
1. **Review** submissions
2. **Approve** or **Reject**
3. **Assign Location** (if approved)
4. **Send Confirmation Email** (automated)
5. **Confirm** (after email sent)

---

## 🔧 Current Implementation

### Status Buttons:
- **Approve Button:** Changes status to `Approved`
- **Reject Button:** Changes status to `Rejected`
- **Confirm Button:** Only shows when `Approved`, changes to `Confirmed`

### Location Assignment:
- **Location Dropdown:** Directly in repeater item
  - Options: Unassigned, Default, Location A, B, C
  - Changes `assignedMapId` field
- **Assign Location Button:** Helper button
  - Currently focuses the dropdown
  - Could be enhanced to open a modal or provide quick actions

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

## ❓ Questions to Consider

1. **Do you need the "Confirm" step?**
   - Could simplify to: Pending → Approved → Done
   - Or: Pending → Approved → Confirmed (current)

2. **When do you assign locations?**
   - Immediately after approval?
   - Later, after reviewing all submissions for a date?
   - In batches?

3. **Do you need conflict detection?**
   - Prevent double-booking same location/time?
   - Warn about conflicts?

4. **Do you need email notifications?**
   - Auto-send when approved?
   - Send confirmation with location details?

---

**Current workflow is functional. Let me know if you want to adjust the status flow or enhance location assignment!**
