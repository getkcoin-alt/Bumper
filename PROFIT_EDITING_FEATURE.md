# Profit Editing Feature

## Overview
After a trip is locked, partners can edit the **Profit** field to adjust the final profit amount. This allows for manual corrections or adjustments after the trip has been recorded.

## How It Works

### 1. Creating a Trip
- When you create a trip using "Add Trip", all fields are filled in
- Profit is automatically calculated: `Income - Total Expenses`
- Once saved, the trip is **locked** (immutable)

### 2. Viewing Trip Details
- Click on any trip row in the dashboard or trips list
- The trip detail modal opens showing all information
- The profit field shows the current profit value

### 3. Editing Profit
1. In the trip detail modal, click the **"Edit"** button next to Net Profit
2. An input field appears with the current profit value
3. Enter the new profit amount
4. Click **"Save"** to confirm or **"Cancel"** to discard changes
5. The updated profit is immediately visible

### 4. Visual Indicators
- **Pencil Icon (✎)**: Shows in the trips table when profit has been edited
- **"(Edited)" Badge**: Appears next to "Net Profit" in the detail modal
- **Original Value**: The original calculated profit is shown below the edited value

## Features

### ✅ What Can Be Edited
- **Profit field only** - All other fields remain locked

### 🔒 What Cannot Be Edited
- Client name
- Date
- Driver name
- Vehicle
- Location
- Item type
- Number of trips
- Rate per trip
- Expense amounts

### 📊 Calculations
- **Original Profit**: `Income - Total Expenses` (always calculated)
- **Edited Profit**: Manual value entered by partner
- **Displayed Profit**: Shows edited value if available, otherwise shows calculated value

### 👥 Permissions
- **Any partner** in the firm can edit the profit
- All partners see the same edited value
- Edit history is preserved (original value shown)

## Use Cases

### When to Edit Profit
1. **Additional Costs**: Unexpected expenses not captured in expense types
2. **Discounts Given**: Client discounts or adjustments
3. **Bonus Payments**: Driver bonuses or incentives
4. **Corrections**: Fix calculation errors or missing data
5. **Adjustments**: Any post-trip financial adjustments

### Example Scenario
```
Original Trip:
- Income: ₹3,200 (4 trips × ₹800)
- Expenses: ₹800 (Diesel + Wages)
- Calculated Profit: ₹2,400

After Trip:
- Driver needed extra fuel: -₹200
- Client gave tip: +₹100
- Edited Profit: ₹2,300

Result:
- Displayed: ₹2,300 (Edited) ✎
- Original: ₹2,400 (shown in detail)
```

## UI Elements

### Dashboard - Recent Trips
```
Date    Client          Item    Trips  Income    Profit      By
────────────────────────────────────────────────────────────────
05-10   Anand Builders  Stone   4      ₹3,200    ₹2,300 ✎   Ramesh
```

### Trip Detail Modal
```
┌─────────────────────────────────────┐
│ Trip Detail                      × │
├─────────────────────────────────────┤
│ [Client] [Date] [Driver] [Vehicle] │
│                                     │
│ Financial Breakdown                 │
│ Income              ₹3,200          │
│ - Diesel            -₹480           │
│ - Driver Wages      -₹320           │
│ ─────────────────────────────────── │
│ Net Profit (Edited)                 │
│ ₹2,300              [Edit]          │
│ Original calculated: ₹2,400         │
│                                     │
│ 🔒 Entry locked. Only profit can    │
│    be edited by partners.           │
└─────────────────────────────────────┘
```

### Edit Mode
```
┌─────────────────────────────────────┐
│ Net Profit (Edited)                 │
│ [2300____] [Save] [Cancel]          │
└─────────────────────────────────────┘
```

## Technical Details

### Data Structure
```javascript
trip = {
  id: "t1",
  clientName: "Anand Builders",
  // ... other fields
  expenses: { e1: 480, e2: 320 },
  locked: true,
  editedProfit: 2300  // Optional: only present if edited
}
```

### Calculation Logic
```javascript
const calcTrip = (trip) => {
  const income = trip.ratePerTrip * trip.tripCount;
  const totalExp = calculateExpenses(trip);
  const calculatedProfit = income - totalExp;
  
  // Use edited profit if available
  const profit = trip.editedProfit !== undefined 
    ? trip.editedProfit 
    : calculatedProfit;
    
  return { income, totalExp, profit, calculatedProfit };
};
```

### Update Function
```javascript
const updateTripProfit = (tripId, newProfit) => {
  setTrips(trips => 
    trips.map(t => 
      t.id === tripId 
        ? { ...t, editedProfit: newProfit } 
        : t
    )
  );
};
```

## Benefits

1. **Flexibility**: Handle real-world scenarios not captured in initial entry
2. **Accuracy**: Correct mistakes without recreating trips
3. **Transparency**: Original values preserved for audit trail
4. **Simplicity**: Only one field editable, reducing complexity
5. **Collaboration**: Any partner can make adjustments

## Best Practices

### ✅ Do
- Edit profit for legitimate adjustments
- Document reason in trip notes if possible
- Verify calculations before saving
- Communicate changes with team

### ❌ Don't
- Use as a workaround for incorrect initial entry
- Make arbitrary changes without reason
- Edit frequently without documentation
- Use for hiding expenses

## Future Enhancements

Potential improvements:
- [ ] Edit history log (who edited, when, previous value)
- [ ] Reason field for profit adjustments
- [ ] Approval workflow for large adjustments
- [ ] Notification to other partners on edit
- [ ] Revert to original calculation option
- [ ] Audit trail in database

---

**Version**: 1.2
**Last Updated**: 2025-01-XX
**Feature Status**: ✅ Active
