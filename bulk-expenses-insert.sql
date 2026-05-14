-- ============================================================================
-- BULK EXPENSE INSERTION SCRIPT FOR SUPABASE
-- ============================================================================
-- This script provides multiple ways to add expenses in bulk to your database
-- Run this in Supabase SQL Editor

-- ============================================================================
-- METHOD 1: Insert Multiple Expenses for a Single Firm
-- ============================================================================
-- Replace 'YOUR_FIRM_ID' with actual firm UUID

INSERT INTO expenses (firm_id, label, amount, per_trip) VALUES
  ('YOUR_FIRM_ID'::uuid, 'Diesel', 120, true),
  ('YOUR_FIRM_ID'::uuid, 'Driver Wages', 80, true),
  ('YOUR_FIRM_ID'::uuid, 'Maintenance', 30, false),
  ('YOUR_FIRM_ID'::uuid, 'Toll Tax', 50, true),
  ('YOUR_FIRM_ID'::uuid, 'Loading Charges', 40, true),
  ('YOUR_FIRM_ID'::uuid, 'Unloading Charges', 40, true),
  ('YOUR_FIRM_ID'::uuid, 'Vehicle Insurance', 100, false),
  ('YOUR_FIRM_ID'::uuid, 'Permit Fees', 25, true),
  ('YOUR_FIRM_ID'::uuid, 'Parking Charges', 20, true),
  ('YOUR_FIRM_ID'::uuid, 'Helper Wages', 30, true);

-- ============================================================================
-- METHOD 2: Insert Expenses for Multiple Firms at Once
-- ============================================================================
-- This adds the same expense types to multiple firms

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

-- ============================================================================
-- METHOD 3: Insert Expenses for Specific Firms by Name
-- ============================================================================
-- Add expenses to firms by their names

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
    ('Loading Charges', 40, true),
    ('Unloading Charges', 40, true)
) AS e(label, amount, per_trip)
WHERE f.name IN ('Sharma Transport Co.', 'Rajasthan Dumpers Ltd.');

-- ============================================================================
-- METHOD 4: Insert Different Expenses for Different Firms
-- ============================================================================
-- Custom expenses per firm

-- For Sharma Transport Co.
INSERT INTO expenses (firm_id, label, amount, per_trip)
SELECT 
  f.id,
  e.label,
  e.amount,
  e.per_trip
FROM firms f
CROSS JOIN (
  VALUES 
    ('Premium Diesel', 130, true),
    ('Senior Driver Wages', 100, true),
    ('Monthly Maintenance', 500, false),
    ('Highway Toll', 60, true)
) AS e(label, amount, per_trip)
WHERE f.name = 'Sharma Transport Co.';

-- For Rajasthan Dumpers Ltd.
INSERT INTO expenses (firm_id, label, amount, per_trip)
SELECT 
  f.id,
  e.label,
  e.amount,
  e.per_trip
FROM firms f
CROSS JOIN (
  VALUES 
    ('Regular Diesel', 110, true),
    ('Driver Wages', 75, true),
    ('Weekly Maintenance', 200, false),
    ('Local Toll', 40, true)
) AS e(label, amount, per_trip)
WHERE f.name = 'Rajasthan Dumpers Ltd.';

-- ============================================================================
-- METHOD 5: Standard Expense Template (Recommended for New Firms)
-- ============================================================================
-- A comprehensive list of common dumper/truck expenses

INSERT INTO expenses (firm_id, label, amount, per_trip)
SELECT 
  f.id,
  e.label,
  e.amount,
  e.per_trip
FROM firms f
CROSS JOIN (
  VALUES 
    -- Fuel Related
    ('Diesel', 120, true),
    ('Fuel Surcharge', 20, true),
    
    -- Labor Costs
    ('Driver Wages', 80, true),
    ('Helper Wages', 30, true),
    ('Loading Labor', 40, true),
    ('Unloading Labor', 40, true),
    
    -- Vehicle Costs
    ('Maintenance', 50, false),
    ('Tire Replacement', 100, false),
    ('Oil Change', 30, false),
    ('Vehicle Cleaning', 15, true),
    
    -- Fees & Charges
    ('Toll Tax', 50, true),
    ('Permit Fees', 25, true),
    ('Parking Charges', 20, true),
    ('Weighbridge Charges', 15, true),
    
    -- Insurance & Legal
    ('Vehicle Insurance', 150, false),
    ('Road Tax', 200, false),
    ('Fitness Certificate', 50, false),
    
    -- Miscellaneous
    ('Communication Charges', 10, true),
    ('Emergency Repairs', 0, false),
    ('Miscellaneous', 0, true)
) AS e(label, amount, per_trip)
WHERE f.name = 'YOUR_FIRM_NAME';

-- ============================================================================
-- METHOD 6: Using a Function for Reusable Bulk Insert
-- ============================================================================
-- Create a function to add standard expenses to any firm

CREATE OR REPLACE FUNCTION add_standard_expenses(target_firm_id UUID)
RETURNS void AS $$
BEGIN
  INSERT INTO expenses (firm_id, label, amount, per_trip) VALUES
    (target_firm_id, 'Diesel', 120, true),
    (target_firm_id, 'Driver Wages', 80, true),
    (target_firm_id, 'Maintenance', 30, false),
    (target_firm_id, 'Toll Tax', 50, true),
    (target_firm_id, 'Loading Charges', 40, true),
    (target_firm_id, 'Unloading Charges', 40, true),
    (target_firm_id, 'Helper Wages', 30, true),
    (target_firm_id, 'Parking Charges', 20, true),
    (target_firm_id, 'Permit Fees', 25, true),
    (target_firm_id, 'Vehicle Cleaning', 15, true);
END;
$$ LANGUAGE plpgsql;

-- Usage: Call the function with a firm ID
-- SELECT add_standard_expenses('YOUR_FIRM_ID'::uuid);

-- ============================================================================
-- METHOD 7: Conditional Insert (Only if Expense Doesn't Exist)
-- ============================================================================
-- Prevents duplicate expenses for the same firm

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
    ('Toll Tax', 50, true)
) AS e(label, amount, per_trip)
WHERE f.name = 'YOUR_FIRM_NAME'
  AND NOT EXISTS (
    SELECT 1 FROM expenses ex 
    WHERE ex.firm_id = f.id 
    AND ex.label = e.label
  );

-- ============================================================================
-- HELPER QUERIES
-- ============================================================================

-- 1. Get all firm IDs and names (to find your firm ID)
SELECT id, name FROM firms ORDER BY name;

-- 2. Check existing expenses for a firm
SELECT label, amount, per_trip 
FROM expenses 
WHERE firm_id = 'YOUR_FIRM_ID'::uuid
ORDER BY label;

-- 3. Count expenses per firm
SELECT 
  f.name,
  COUNT(e.id) as expense_count
FROM firms f
LEFT JOIN expenses e ON f.id = e.firm_id
GROUP BY f.id, f.name
ORDER BY f.name;

-- 4. Delete all expenses for a firm (if you need to start over)
-- DELETE FROM expenses WHERE firm_id = 'YOUR_FIRM_ID'::uuid;

-- 5. Update expense amounts in bulk
UPDATE expenses 
SET amount = CASE label
  WHEN 'Diesel' THEN 130
  WHEN 'Driver Wages' THEN 90
  WHEN 'Toll Tax' THEN 55
  ELSE amount
END
WHERE firm_id = 'YOUR_FIRM_ID'::uuid;

-- ============================================================================
-- EXAMPLE: Complete Setup for a New Firm
-- ============================================================================

-- Step 1: Get the firm ID
DO $$
DECLARE
  v_firm_id UUID;
BEGIN
  -- Get firm ID by name
  SELECT id INTO v_firm_id FROM firms WHERE name = 'Sharma Transport Co.';
  
  -- Insert all standard expenses
  INSERT INTO expenses (firm_id, label, amount, per_trip) VALUES
    (v_firm_id, 'Diesel', 120, true),
    (v_firm_id, 'Driver Wages', 80, true),
    (v_firm_id, 'Maintenance', 30, false),
    (v_firm_id, 'Toll Tax', 50, true),
    (v_firm_id, 'Loading Charges', 40, true),
    (v_firm_id, 'Unloading Charges', 40, true),
    (v_firm_id, 'Helper Wages', 30, true),
    (v_firm_id, 'Parking Charges', 20, true),
    (v_firm_id, 'Permit Fees', 25, true),
    (v_firm_id, 'Vehicle Cleaning', 15, true);
  
  RAISE NOTICE 'Added 10 expenses for firm: %', v_firm_id;
END $$;

-- ============================================================================
-- COMMON EXPENSE CATEGORIES FOR DUMPER/TRUCK BUSINESS
-- ============================================================================

/*
FUEL EXPENSES (per_trip = true):
- Diesel
- Fuel Surcharge
- AdBlue/DEF

LABOR COSTS (per_trip = true):
- Driver Wages
- Helper Wages
- Loading Labor
- Unloading Labor
- Overtime Charges

VEHICLE MAINTENANCE (per_trip = false):
- Regular Maintenance
- Tire Replacement
- Oil Change
- Brake Service
- Battery Replacement
- Vehicle Washing

FEES & CHARGES (per_trip = true):
- Toll Tax
- Permit Fees
- Parking Charges
- Weighbridge Charges
- Entry Fees

INSURANCE & LEGAL (per_trip = false):
- Vehicle Insurance
- Road Tax
- Fitness Certificate
- Pollution Certificate
- Commercial Tax

MISCELLANEOUS (varies):
- Communication Charges
- Emergency Repairs
- Accommodation (for long trips)
- Food Allowance
- Miscellaneous
*/

-- ============================================================================
-- NOTES
-- ============================================================================
/*
1. per_trip = true: Expense is charged per trip (e.g., Diesel, Driver Wages)
2. per_trip = false: Fixed expense not per trip (e.g., Insurance, Maintenance)
3. amount = 0: Use when you want to define the expense type but enter amount per trip
4. Always replace 'YOUR_FIRM_ID' and 'YOUR_FIRM_NAME' with actual values
5. Run SELECT queries first to verify firm IDs before inserting
6. Use transactions for large bulk inserts to ensure data consistency
*/
