# Date Repeater Setup Guide

## Overview
This guide explains how to set up the Date Repeater component that replaces Selection Tags for date selection. The Repeater allows per-item styling with color-coded availability indicators.

## Why Repeater Instead of Selection Tags?
Wix Selection Tags doesn't support individual item styling. The Repeater gives us full control over each date item's appearance, allowing color-coded borders for availability status.

## Setup Instructions (All 3 Forms)

### Step 1: Remove/Hide Selection Tags
1. In Wix Editor, find the existing `#dateSelectionTags` component
2. Either delete it or hide it (you can keep it hidden as a backup)

### Step 2: Add Repeater
1. Add a **Repeater** component to the form
2. Set ID: `dateRepeater`
3. Set layout to **Grid** with 3-4 columns (adjust for responsiveness)
4. Set item spacing: 8px horizontal, 8px vertical

### Step 3: Design Repeater Item Template
Inside the repeater item, add these elements:

#### Container Box
- **ID**: `itemContainer`
- **Type**: Box/Container
- **Styling**:
  - Background: transparent (will change to #E3F2FD when selected)
  - Border: 3px solid (color set dynamically)
  - Border radius: 8px
  - Padding: 10px 15px
  - Cursor: pointer
  - Min-width: 120px

#### Emoji Text
- **ID**: `itemEmoji`
- **Type**: Text
- **Position**: Left side of container
- **Styling**:
  - Font size: 16px
  - Font weight: Bold
  - Margin-right: 8px

#### Date Label Text
- **ID**: `itemLabel`
- **Type**: Text
- **Position**: Center/right of emoji
- **Styling**:
  - Font size: 14px
  - Color: #333

#### Checkbox
- **ID**: `itemCheckbox`
- **Type**: Checkbox
- **Position**: Right side or overlay (can be hidden visually)
- **Note**: Can be made invisible if you want click-anywhere selection

### Step 4: Element Hierarchy
```
#dateRepeater (Repeater)
  └── Repeater Item
      └── #itemContainer (Box)
          ├── #itemEmoji (Text)
          ├── #itemLabel (Text)
          └── #itemCheckbox (Checkbox)
```

## Visual Design

### Color Coding (Applied Dynamically)
| Status | Border Color | Emoji | Opacity |
|--------|-------------|-------|---------|
| Available | #4CAF50 (Green) | ✓ | 100% |
| Limited | #FF9800 (Orange) | ⚠ | 100% |
| Full | #F44336 (Red) | ✕ | 60% |

### Selection State
- **Unselected**: Transparent background
- **Selected**: Light blue background (#E3F2FD)

## Form-Specific Notes

### Musician Form (`SIGNUP-Music.ais9x.js`)
- Availability based on approved musician count
- 0-1: Available, 2: Limited, 3+: Full

### Volunteer Form (`SIGNUP- Volunteer.zab9v.js`)
- Availability updates when role is selected
- Role-specific capacity limits

### Non-Profit Form (`SIGNUP- NFP.owt61.js`)
- Binary availability (0: Available, 1+: Full)

## Code Elements Reference

### Repeater Data Structure
```javascript
{
  _id: 'date-id-here',           // Market date ID
  label: 'May 2nd',              // Display text
  emoji: '✓',                    // Status emoji
  status: 'available',           // 'available', 'limited', 'full'
  borderColor: '#4CAF50',        // Dynamic border color
  isSelected: false              // Selection state
}
```

### Selection Tracking
Selected dates are tracked in a global array:
```javascript
let selectedDateIds = [];
```

### Event Handlers
- `$item('#itemCheckbox').onChange()` - Checkbox change
- `$item('#itemContainer').onClick()` - Container click (toggles checkbox)

## Testing Checklist

- [ ] Repeater displays all market dates
- [ ] Dates sorted chronologically
- [ ] Green border for available dates (✓)
- [ ] Orange border for limited dates (⚠)
- [ ] Red border with opacity for full dates (✕)
- [ ] Clicking container toggles selection
- [ ] Clicking checkbox toggles selection
- [ ] Selected items have blue background
- [ ] Form submission includes selected dates
- [ ] Form reset clears selections
- [ ] Volunteer form updates on role change

## Troubleshooting

### Repeater Not Displaying
- Check ID is exactly `dateRepeater`
- Check that `onItemReady` is set before `data` is assigned

### Styles Not Applying
- Verify element IDs match exactly
- Check that Box component supports `.style` property
- Try using `$item('#itemContainer').style.backgroundColor` syntax

### Selection Not Working
- Check checkbox onChange handler
- Verify selectedDateIds array is module-scoped
- Check console for errors

## Alternative: Simplified Layout

If the full repeater is complex, a simpler alternative:

```
#dateRepeater
  └── #itemContainer (Box with onClick)
      └── #itemLabel (Text: "✓ May 2nd")
```

Style the entire container based on emoji content, use container click for selection, and track selection visually with background color change.
