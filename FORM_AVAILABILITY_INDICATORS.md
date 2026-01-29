# Form Availability Indicators

## Overview
Color-coded availability indicators help users see which dates are available, limited, or full before submitting their application. This reduces rejections and improves the user experience.

## Visual Design

### Status Indicators
Each date tag displays:
- **Icon prefix**: Visual indicator (✓, ⚠, ✕)
- **Color-coded left border**: 4px accent border
- **Status label**: Text suffix in parentheses (when limited/full)

### Status Types

#### ✓ Available (Green)
- **Musicians**: 0-1 approved musicians
- **Non-Profits**: 0 approved non-profits
- **Volunteers**: Below 70% of role capacity
- **Visual**: Green left border, ✓ icon
- **Label**: No suffix

#### ⚠ Limited (Yellow/Orange)
- **Musicians**: 2 approved musicians
- **Non-Profits**: N/A (binary: available or full)
- **Volunteers**: 70%+ of role capacity
- **Visual**: Orange left border, ⚠ icon
- **Label**: " (Limited)" suffix

#### ✕ Full (Red)
- **Musicians**: 3+ approved musicians
- **Non-Profits**: 1+ approved non-profits
- **Volunteers**: At role capacity
- **Visual**: Red left border, ✕ icon, 60% opacity
- **Label**: " (Full)" suffix

## Implementation Details

### Backend Function
**File**: `src/backend/availabilityStatus.jsw`

#### `getDateAvailability()`
Returns availability data for all market dates:
```javascript
{
  [dateId]: {
    musicians: number,
    nonProfits: number,
    volunteers: {
      'Token Sales': number,
      'Merch Sales': number,
      'Setup': number,
      'Teardown': number,
      'Hospitality Support': number,
      'No Preference': number
    }
  }
}
```

#### `getDateStatus(dateId, type, volunteerRole)`
Returns status for a specific date and type: `'available'`, `'limited'`, or `'full'`

### Frontend Implementation

#### Musician Form (`SIGNUP-Music.ais9x.js`)
- Queries availability on page load
- Displays status based on approved musician count
- Updates date labels with status suffix

#### Volunteer Form (`SIGNUP- Volunteer.zab9v.js`)
- **Dynamic availability**: Updates when volunteer role changes
- Role-specific capacity limits:
  - Token Sales: 2
  - Merch Sales: 2
  - Setup: 2
  - Teardown: 2
  - Hospitality Support: 2
  - No Preference: 1
- Calculates status based on selected role

#### Non-Profit Form (`SIGNUP- NFP.owt61.js`)
- Binary status (available or full)
- Only 1 non-profit per week allowed
- Displays full status if any approved non-profit exists

### CSS Styling
**File**: `src/styles/global.css`

Key classes:
- `.availability-available`: Green border + ✓ icon
- `.availability-limited`: Orange border + ⚠ icon
- `.availability-full`: Red border + ✕ icon + reduced opacity

## Capacity Limits

### Musicians
- **Target**: 3 per week (one at each location)
- **Available**: 0-1 approved
- **Limited**: 2 approved
- **Full**: 3+ approved

### Non-Profits
- **Target**: 1 per week
- **Available**: 0 approved
- **Full**: 1+ approved

### Volunteers (by role)
- **Token Sales**: 2 needed
- **Merch Sales**: 2 needed
- **Setup**: 2 needed
- **Teardown**: 2 needed
- **Hospitality Support**: 2 needed
- **No Preference**: 1 needed
- **Limited threshold**: 70% of capacity
- **Full**: At capacity

## User Experience

### Benefits
1. **Informed decisions**: Users see availability before selecting dates
2. **Reduced rejections**: Users avoid full dates
3. **Better planning**: Admin team gets more balanced submissions
4. **Dynamic feedback**: Volunteer form updates based on role selection

### Behavior
- Status calculated from **approved** assignments only
- Pending/rejected submissions don't affect availability
- Volunteer availability changes when role is selected
- Status updates automatically when form loads

## Testing

### Test Scenarios
1. **No approved assignments**: All dates show as available
2. **Partial bookings**: Some dates limited, some available
3. **Full dates**: Dates show as full with reduced opacity
4. **Volunteer role change**: Availability updates dynamically
5. **Multiple submissions**: Status reflects cumulative approvals

### Validation
- Check date labels include status suffix
- Verify color-coded borders appear
- Test volunteer role dropdown triggers update
- Confirm only approved assignments affect status

## Future Enhancements

### Potential Improvements
- Tooltip with detailed breakdown on hover
- Real-time updates (websocket/polling)
- Admin override to mark dates as "closed"
- Capacity warnings in admin dashboard
- Historical availability trends

## Related Files
- `src/backend/availabilityStatus.jsw` - Backend availability logic
- `src/backend/formSubmissions.jsw` - Form submission handler
- `src/pages/SIGNUP-Music.ais9x.js` - Musician form
- `src/pages/SIGNUP- Volunteer.zab9v.js` - Volunteer form
- `src/pages/SIGNUP- NFP.owt61.js` - Non-profit form
- `src/styles/global.css` - Availability styling
