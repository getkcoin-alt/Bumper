# Quick Guide: Add Multiple Expenses in Supabase

## 🚀 Quick Start (3 Steps)

### Step 1: Get Your Firm ID
```sql
SELECT id, name FROM firms;
```
Copy the UUID of your firm.

### Step 2: Replace Firm ID and Run
```sql
INSERT INTO expenses (firm_id, label, amount, per_trip) VALUES
  ('YOUR_FIRM_ID_HERE'::uuid, 'Diesel', 120, true),
  ('YOUR_FIRM_ID_HERE'::uuid, 'Driver Wages', 80, true),
  ('YOUR_FIRM_ID_HERE'::uuid, 'Maintenance', 30, false),
  ('YOUR_FIRM_ID_HERE'::uuid, 'Toll Tax', 50, true),
  ('YOUR_FIRM_ID_HERE'::uuid, 'Loading Charges', 40, true);
```

### Step 3: Verify
```sql
SELECT * FROM expenses WHERE firm_id = 'YOUR_FIRM_ID_HERE'::uuid;
```

---

## 📋 Common Scenarios

### Scenario 1: Add 10 Standard Expenses
```sql
-- Replace the firm ID below
INSERT INTO expenses (firm_id, label, amount, per_trip) VALUES
  ('f1000000-0000-0000-0000-000000000001'::uuid, 'Diesel', 120, true),
  ('f1000000-0000-0000-0000-000000000001'::uuid, 'Driver Wages', 80, true),
  ('f1000000-0000-0000-0000-000000000001'::uuid, 'Helper Wages', 30, true),
  ('f1000000-0000-0000-0000-000000000001'::uuid, 'Maintenance', 30, false),
  ('f1000000-0000-0000-0000-000000000001'::uuid, 'Toll Tax', 50, true),
  ('f1000000-0000-0000-0000-000000000001'::uuid, 'Loading Charges', 40, true),
  ('f1000000-0000-0000-0000-000000000001'::uuid, 'Unloading Charges', 40, true),
  ('f1000000-0000-0000-0000-000000000001'::uuid, 'Parking Charges', 20, true),
  ('f1000000-0000-0000-0000-000000000001'::uuid, 'Permit Fees', 25, true),
  ('f1000000-0000-0000-0000-000000000001'::uuid, 'Vehicle Cleaning', 15, true);
```

### Scenario 2: Add Expenses by Firm Name
```sql
INSERT INTO expenses (firm_id, label, amount, per_trip)
SELECT 
  f.id,
  e.label,
  e.amount,
  e.per_trip
FROM firms f
CROSS JOIN (
  VALUES 
    ('Diesel', 120, true),
    ('Driver Wages', 80, true),
    ('Maintenance', 30, false),
    ('Toll Tax', 50, true),
    ('Loading Charges', 40, true)
) AS e(label, amount, per_trip)
WHERE f.name = 'Sharma Transport Co.';
```

### Scenario 3: Add Same Expenses to All Firms
```sql
INSERT INTO expenses (firm_id, label, amount, per_trip)
SELECT 
  f.id,
  e.label,
  e.amount,
  e.per_trip
FROM firms f
CROSS JOIN (
  VALUES 
    ('Diesel', 120, true),
    ('Driver Wages', 80, true),
    ('Maintenance', 30, false)
) AS e(label, amount, per_trip);
```

### Scenario 4: Add Only If Not Exists (Prevent Duplicates)
```sql
INSERT INTO expenses (firm_id, label, amount, per_trip)
SELECT 
  f.id,
  e.label,
  e.amount,
  e.per_trip
FROM firms f
CROSS JOIN (
  VALUES 
    ('Diesel', 120, true),
    ('Driver Wages', 80, true)
) AS e(label, amount, per_trip)
WHERE f.name = 'Sharma Transport Co.'
  AND NOT EXISTS (
    SELECT 1 FROM expenses ex 
    WHERE ex.firm_id = f.id AND ex.label = e.label
  );
```

---

## 📦 Pre-made Expense Sets

### Basic Set (5 expenses)
```sql
INSERT INTO expenses (firm_id, label, amount, per_trip) VALUES
  ('YOUR_FIRM_ID'::uuid, 'Diesel', 120, true),
  ('YOUR_FIRM_ID'::uuid, 'Driver Wages', 80, true),
  ('YOUR_FIRM_ID'::uuid, 'Maintenance', 30, false),
  ('YOUR_FIRM_ID'::uuid, 'Toll Tax', 50, true),
  ('YOUR_FIRM_ID'::uuid, 'Loading Charges', 40, true);
```

### Standard Set (10 expenses)
```sql
INSERT INTO expenses (firm_id, label, amount, per_trip) VALUES
  ('YOUR_FIRM_ID'::uuid, 'Diesel', 120, true),
  ('YOUR_FIRM_ID'::uuid, 'Driver Wages', 80, true),
  ('YOUR_FIRM_ID'::uuid, 'Helper Wages', 30, true),
  ('YOUR_FIRM_ID'::uuid, 'Maintenance', 30, false),
  ('YOUR_FIRM_ID'::uuid, 'Toll Tax', 50, true),
  ('YOUR_FIRM_ID'::uuid, 'Loading Charges', 40, true),
  ('YOUR_FIRM_ID'::uuid, 'Unloading Charges', 40, true),
  ('YOUR_FIRM_ID'::uuid, 'Parking Charges', 20, true),
  ('YOUR_FIRM_ID'::uuid, 'Permit Fees', 25, true),
  ('YOUR_FIRM_ID'::uuid, 'Vehicle Cleaning', 15, true);
```

### Complete Set (20 expenses)
```sql
INSERT INTO expenses (firm_id, label, amount, per_trip) VALUES
  -- Fuel
  ('YOUR_FIRM_ID'::uuid, 'Diesel', 120, true),
  ('YOUR_FIRM_ID'::uuid, 'Fuel Surcharge', 20, true),
  
  -- Labor
  ('YOUR_FIRM_ID'::uuid, 'Driver Wages', 80, true),
  ('YOUR_FIRM_ID'::uuid, 'Helper Wages', 30, true),
  ('YOUR_FIRM_ID'::uuid, 'Loading Labor', 40, true),
  ('YOUR_FIRM_ID'::uuid, 'Unloading Labor', 40, true),
  
  -- Vehicle
  ('YOUR_FIRM_ID'::uuid, 'Maintenance', 50, false),
  ('YOUR_FIRM_ID'::uuid, 'Tire Replacement', 100, false),
  ('YOUR_FIRM_ID'::uuid, 'Oil Change', 30, false),
  ('YOUR_FIRM_ID'::uuid, 'Vehicle Cleaning', 15, true),
  
  -- Fees
  ('YOUR_FIRM_ID'::uuid, 'Toll Tax', 50, true),
  ('YOUR_FIRM_ID'::uuid, 'Permit Fees', 25, true),
  ('YOUR_FIRM_ID'::uuid, 'Parking Charges', 20, true),
  ('YOUR_FIRM_ID'::uuid, 'Weighbridge Charges', 15, true),
  
  -- Insurance
  ('YOUR_FIRM_ID'::uuid, 'Vehicle Insurance', 150, false),
  ('YOUR_FIRM_ID'::uuid, 'Road Tax', 200, false),
  ('YOUR_FIRM_ID'::uuid, 'Fitness Certificate', 50, false),
  
  -- Misc
  ('YOUR_FIRM_ID'::uuid, 'Communication Charges', 10, true),
  ('YOUR_FIRM_ID'::uuid, 'Emergency Repairs', 0, false),
  ('YOUR_FIRM_ID'::uuid, 'Miscellaneous', 0, true);
```

---

## 🔧 Useful Commands

### View All Expenses for a Firm
```sql
SELECT label, amount, per_trip 
FROM expenses 
WHERE firm_id = 'YOUR_FIRM_ID'::uuid
ORDER BY label;
```

### Count Expenses per Firm
```sql
SELECT f.name, COUNT(e.id) as total_expenses
FROM firms f
LEFT JOIN expenses e ON f.id = e.firm_id
GROUP BY f.name;
```

### Delete All Expenses for a Firm
```sql
DELETE FROM expenses WHERE firm_id = 'YOUR_FIRM_ID'::uuid;
```

### Update Multiple Expense Amounts
```sql
UPDATE expenses 
SET amount = CASE label
  WHEN 'Diesel' THEN 130
  WHEN 'Driver Wages' THEN 90
  WHEN 'Toll Tax' THEN 55
  ELSE amount
END
WHERE firm_id = 'YOUR_FIRM_ID'::uuid;
```

---

## 💡 Tips

1. **per_trip = true**: Expense charged per trip (Diesel, Wages)
2. **per_trip = false**: Fixed expense (Insurance, Maintenance)
3. **amount = 0**: Define expense type, enter amount per trip
4. Always get firm ID first before inserting
5. Use transactions for large inserts
6. Check for duplicates before inserting

---

## ⚠️ Important Notes

- Replace `YOUR_FIRM_ID` with actual UUID from your database
- Run `SELECT id, name FROM firms;` to get firm IDs
- Test with one expense first, then bulk insert
- Backup data before running DELETE commands
- Use the "prevent duplicates" query if unsure

---

## 📞 Need Help?

See `bulk-expenses-insert.sql` for more advanced examples and methods.
