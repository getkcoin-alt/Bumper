# 📸 Visual Guide: Add Multiple Expenses in Supabase

## Step-by-Step Instructions with Examples

---

## 🎯 Method 1: Simple Bulk Insert (Recommended for Beginners)

### Step 1: Open Supabase SQL Editor
1. Go to https://supabase.com/dashboard
2. Select your project: `afedbnmsltwifwrcvnrn`
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**

### Step 2: Get Your Firm ID
Copy and paste this query:
```sql
SELECT id, name FROM firms;
```
Click **Run** (or press Cmd/Ctrl + Enter)

**Result will look like:**
```
id                                      name
────────────────────────────────────────────────────────────
f1000000-0000-0000-0000-000000000001   Sharma Transport Co.
f2000000-0000-0000-0000-000000000002   Rajasthan Dumpers Ltd.
```

Copy the `id` of your firm (the long UUID string).

### Step 3: Insert Multiple Expenses
Replace `YOUR_FIRM_ID_HERE` with the ID you copied:

```sql
INSERT INTO expenses (firm_id, label, amount, per_trip) VALUES
  ('YOUR_FIRM_ID_HERE'::uuid, 'Diesel', 120, true),
  ('YOUR_FIRM_ID_HERE'::uuid, 'Driver Wages', 80, true),
  ('YOUR_FIRM_ID_HERE'::uuid, 'Helper Wages', 30, true),
  ('YOUR_FIRM_ID_HERE'::uuid, 'Maintenance', 30, false),
  ('YOUR_FIRM_ID_HERE'::uuid, 'Toll Tax', 50, true),
  ('YOUR_FIRM_ID_HERE'::uuid, 'Loading Charges', 40, true),
  ('YOUR_FIRM_ID_HERE'::uuid, 'Unloading Charges', 40, true),
  ('YOUR_FIRM_ID_HERE'::uuid, 'Parking Charges', 20, true),
  ('YOUR_FIRM_ID_HERE'::uuid, 'Permit Fees', 25, true),
  ('YOUR_FIRM_ID_HERE'::uuid, 'Vehicle Cleaning', 15, true);
```

**Example with actual ID:**
```sql
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

Click **Run**.

### Step 4: Verify Expenses Were Added
```sql
SELECT label, amount, per_trip 
FROM expenses 
WHERE firm_id = 'YOUR_FIRM_ID_HERE'::uuid
ORDER BY label;
```

**Success! You should see:**
```
label                amount    per_trip
─────────────────────────────────────────
Diesel               120       true
Driver Wages         80        true
Helper Wages         30        true
Loading Charges      40        true
Maintenance          30        false
Parking Charges      20        true
Permit Fees          25        true
Toll Tax             50        true
Unloading Charges    40        true
Vehicle Cleaning     15        true
```

---

## 🎯 Method 2: Add by Firm Name (Easier)

### No Need to Copy UUIDs!

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
    ('Helper Wages', 30, true),
    ('Maintenance', 30, false),
    ('Toll Tax', 50, true),
    ('Loading Charges', 40, true),
    ('Unloading Charges', 40, true),
    ('Parking Charges', 20, true),
    ('Permit Fees', 25, true),
    ('Vehicle Cleaning', 15, true)
) AS e(label, amount, per_trip)
WHERE f.name = 'Sharma Transport Co.';
```

Just change `'Sharma Transport Co.'` to your firm name!

---

## 🎯 Method 3: Add to ALL Firms at Once

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
) AS e(label, amount, per_trip);
```

This adds the same 5 expenses to every firm in your database!

---

## 📋 Common Expense Templates

### Template 1: Minimal (5 expenses)
```sql
('Diesel', 120, true),
('Driver Wages', 80, true),
('Maintenance', 30, false),
('Toll Tax', 50, true),
('Loading Charges', 40, true)
```

### Template 2: Standard (10 expenses)
```sql
('Diesel', 120, true),
('Driver Wages', 80, true),
('Helper Wages', 30, true),
('Maintenance', 30, false),
('Toll Tax', 50, true),
('Loading Charges', 40, true),
('Unloading Charges', 40, true),
('Parking Charges', 20, true),
('Permit Fees', 25, true),
('Vehicle Cleaning', 15, true)
```

### Template 3: Complete (15 expenses)
```sql
('Diesel', 120, true),
('Fuel Surcharge', 20, true),
('Driver Wages', 80, true),
('Helper Wages', 30, true),
('Loading Labor', 40, true),
('Unloading Labor', 40, true),
('Maintenance', 50, false),
('Tire Replacement', 100, false),
('Oil Change', 30, false),
('Toll Tax', 50, true),
('Permit Fees', 25, true),
('Parking Charges', 20, true),
('Vehicle Insurance', 150, false),
('Road Tax', 200, false),
('Miscellaneous', 0, true)
```

---

## 🔍 Verification Queries

### Check How Many Expenses Each Firm Has
```sql
SELECT 
  f.name as firm_name,
  COUNT(e.id) as total_expenses
FROM firms f
LEFT JOIN expenses e ON f.id = e.firm_id
GROUP BY f.name
ORDER BY f.name;
```

**Result:**
```
firm_name                  total_expenses
────────────────────────────────────────
Sharma Transport Co.       10
Rajasthan Dumpers Ltd.     5
```

### View All Expenses Across All Firms
```sql
SELECT 
  f.name as firm,
  e.label,
  e.amount,
  e.per_trip
FROM expenses e
JOIN firms f ON e.firm_id = f.id
ORDER BY f.name, e.label;
```

---

## ⚠️ Troubleshooting

### Error: "invalid input syntax for type uuid"
**Problem:** Forgot to add `::uuid` after the firm ID

**Fix:**
```sql
-- ❌ Wrong
'f1000000-0000-0000-0000-000000000001'

-- ✅ Correct
'f1000000-0000-0000-0000-000000000001'::uuid
```

### Error: "duplicate key value violates unique constraint"
**Problem:** Expense with same label already exists for this firm

**Fix:** Use the "prevent duplicates" query:
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
WHERE f.name = 'YOUR_FIRM_NAME'
  AND NOT EXISTS (
    SELECT 1 FROM expenses ex 
    WHERE ex.firm_id = f.id AND ex.label = e.label
  );
```

### No Rows Returned
**Problem:** Firm name doesn't match exactly

**Fix:** Check exact firm name:
```sql
SELECT name FROM firms;
```
Copy the exact name (case-sensitive, spaces matter!)

---

## 🎓 Understanding the Fields

### firm_id
- The UUID of the firm
- Links expense to a specific firm
- Get from: `SELECT id FROM firms`

### label
- Name of the expense (e.g., "Diesel", "Driver Wages")
- Must be unique per firm
- Shows in trip entry form

### amount
- Default amount for this expense
- Can be 0 if you want to enter per trip
- In rupees (₹)

### per_trip
- `true`: Charged per trip (Diesel, Wages)
- `false`: Fixed cost (Insurance, Maintenance)
- Affects how it's calculated in trips

---

## 📊 Real-World Example

**Scenario:** You have "Sharma Transport Co." and want to add 10 standard expenses.

**Step 1:** Open SQL Editor

**Step 2:** Run this query:
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
    ('Helper Wages', 30, true),
    ('Maintenance', 30, false),
    ('Toll Tax', 50, true),
    ('Loading Charges', 40, true),
    ('Unloading Charges', 40, true),
    ('Parking Charges', 20, true),
    ('Permit Fees', 25, true),
    ('Vehicle Cleaning', 15, true)
) AS e(label, amount, per_trip)
WHERE f.name = 'Sharma Transport Co.';
```

**Step 3:** Verify:
```sql
SELECT COUNT(*) FROM expenses 
WHERE firm_id = (SELECT id FROM firms WHERE name = 'Sharma Transport Co.');
```

**Result:** `10` ✅

**Done!** Now when you add a trip in the app, all 10 expenses will appear!

---

## 🚀 Quick Copy-Paste Commands

### For Sharma Transport Co.
```sql
INSERT INTO expenses (firm_id, label, amount, per_trip)
SELECT f.id, e.label, e.amount, e.per_trip
FROM firms f
CROSS JOIN (VALUES 
  ('Diesel', 120, true),
  ('Driver Wages', 80, true),
  ('Helper Wages', 30, true),
  ('Maintenance', 30, false),
  ('Toll Tax', 50, true),
  ('Loading Charges', 40, true),
  ('Unloading Charges', 40, true),
  ('Parking Charges', 20, true),
  ('Permit Fees', 25, true),
  ('Vehicle Cleaning', 15, true)
) AS e(label, amount, per_trip)
WHERE f.name = 'Sharma Transport Co.';
```

### For Rajasthan Dumpers Ltd.
```sql
INSERT INTO expenses (firm_id, label, amount, per_trip)
SELECT f.id, e.label, e.amount, e.per_trip
FROM firms f
CROSS JOIN (VALUES 
  ('Diesel', 110, true),
  ('Driver Wages', 75, true),
  ('Helper Wages', 25, true),
  ('Maintenance', 25, false),
  ('Toll Tax', 40, true),
  ('Loading Charges', 35, true),
  ('Unloading Charges', 35, true),
  ('Parking Charges', 15, true),
  ('Permit Fees', 20, true),
  ('Vehicle Cleaning', 10, true)
) AS e(label, amount, per_trip)
WHERE f.name = 'Rajasthan Dumpers Ltd.';
```

---

## ✅ Checklist

- [ ] Opened Supabase SQL Editor
- [ ] Got firm ID or name
- [ ] Copied expense template
- [ ] Replaced firm ID/name
- [ ] Ran the query
- [ ] Verified expenses were added
- [ ] Tested in the app

---

**Need more help?** See `bulk-expenses-insert.sql` for advanced methods!
