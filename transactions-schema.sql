-- ============================================================================
-- CREDIT/DEBIT TRANSACTIONS MODULE
-- ============================================================================
-- This adds a new module for tracking credit and debit transactions
-- that affect partner's total income

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  firm_id UUID REFERENCES firms(id) ON DELETE CASCADE NOT NULL,
  partner_id UUID REFERENCES users(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('credit', 'debit')),
  amount NUMERIC NOT NULL CHECK (amount > 0),
  category TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  reference_number TEXT,
  payment_method TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_transactions_firm_id ON transactions(firm_id);
CREATE INDEX idx_transactions_partner_id ON transactions(partner_id);
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_transactions_type ON transactions(type);

-- Enable Row Level Security
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Create policy (allow all for now - adjust based on your auth requirements)
CREATE POLICY "Allow all on transactions" ON transactions FOR ALL USING (true);

-- ============================================================================
-- SAMPLE DATA
-- ============================================================================

-- Insert sample transactions for Sharma Transport Co.
INSERT INTO transactions (firm_id, partner_id, type, amount, category, description, date, reference_number, payment_method) VALUES
  -- Credits (Money In)
  ('f1000000-0000-0000-0000-000000000001'::uuid, 'u1000000-0000-0000-0000-000000000001'::uuid, 'credit', 5000, 'Client Payment', 'Payment received from Anand Builders', '2025-01-15', 'PAY-001', 'Bank Transfer'),
  ('f1000000-0000-0000-0000-000000000001'::uuid, 'u1000000-0000-0000-0000-000000000001'::uuid, 'credit', 3500, 'Advance Payment', 'Advance for upcoming project', '2025-01-18', 'ADV-002', 'Cash'),
  ('f1000000-0000-0000-0000-000000000001'::uuid, 'u2000000-0000-0000-0000-000000000002'::uuid, 'credit', 4200, 'Client Payment', 'Payment from Sharma Constructions', '2025-01-20', 'PAY-003', 'Cheque'),
  
  -- Debits (Money Out)
  ('f1000000-0000-0000-0000-000000000001'::uuid, 'u1000000-0000-0000-0000-000000000001'::uuid, 'debit', 2000, 'Fuel Purchase', 'Bulk diesel purchase', '2025-01-16', 'EXP-001', 'Cash'),
  ('f1000000-0000-0000-0000-000000000001'::uuid, 'u1000000-0000-0000-0000-000000000001'::uuid, 'debit', 1500, 'Vehicle Repair', 'Emergency brake repair', '2025-01-17', 'EXP-002', 'Bank Transfer'),
  ('f1000000-0000-0000-0000-000000000001'::uuid, 'u2000000-0000-0000-0000-000000000002'::uuid, 'debit', 800, 'Driver Salary', 'Monthly salary payment', '2025-01-19', 'SAL-001', 'Cash');

-- Insert sample transactions for Rajasthan Dumpers Ltd.
INSERT INTO transactions (firm_id, partner_id, type, amount, category, description, date, reference_number, payment_method) VALUES
  ('f2000000-0000-0000-0000-000000000002'::uuid, 'u3000000-0000-0000-0000-000000000003'::uuid, 'credit', 6000, 'Client Payment', 'Payment from City Infra', '2025-01-14', 'PAY-101', 'Bank Transfer'),
  ('f2000000-0000-0000-0000-000000000002'::uuid, 'u3000000-0000-0000-0000-000000000003'::uuid, 'debit', 1200, 'Fuel Purchase', 'Diesel for vehicles', '2025-01-15', 'EXP-101', 'Cash');

-- ============================================================================
-- HELPER QUERIES
-- ============================================================================

-- 1. Get all transactions for a firm
SELECT 
  t.*,
  u.name as partner_name,
  CASE 
    WHEN t.type = 'credit' THEN t.amount 
    ELSE 0 
  END as credit_amount,
  CASE 
    WHEN t.type = 'debit' THEN t.amount 
    ELSE 0 
  END as debit_amount
FROM transactions t
LEFT JOIN users u ON t.partner_id = u.id
WHERE t.firm_id = 'YOUR_FIRM_ID'::uuid
ORDER BY t.date DESC;

-- 2. Calculate net balance for a firm
SELECT 
  f.name as firm_name,
  SUM(CASE WHEN t.type = 'credit' THEN t.amount ELSE 0 END) as total_credits,
  SUM(CASE WHEN t.type = 'debit' THEN t.amount ELSE 0 END) as total_debits,
  SUM(CASE WHEN t.type = 'credit' THEN t.amount ELSE -t.amount END) as net_balance
FROM firms f
LEFT JOIN transactions t ON f.id = t.firm_id
GROUP BY f.id, f.name;

-- 3. Partner-wise transaction summary
SELECT 
  u.name as partner_name,
  COUNT(t.id) as total_transactions,
  SUM(CASE WHEN t.type = 'credit' THEN t.amount ELSE 0 END) as total_credits,
  SUM(CASE WHEN t.type = 'debit' THEN t.amount ELSE 0 END) as total_debits,
  SUM(CASE WHEN t.type = 'credit' THEN t.amount ELSE -t.amount END) as net_balance
FROM users u
LEFT JOIN transactions t ON u.id = t.partner_id
WHERE u.firm_id = 'YOUR_FIRM_ID'::uuid
GROUP BY u.id, u.name
ORDER BY u.name;

-- 4. Monthly transaction summary
SELECT 
  TO_CHAR(date, 'YYYY-MM') as month,
  SUM(CASE WHEN type = 'credit' THEN amount ELSE 0 END) as credits,
  SUM(CASE WHEN type = 'debit' THEN amount ELSE 0 END) as debits,
  SUM(CASE WHEN type = 'credit' THEN amount ELSE -amount END) as net
FROM transactions
WHERE firm_id = 'YOUR_FIRM_ID'::uuid
GROUP BY TO_CHAR(date, 'YYYY-MM')
ORDER BY month DESC;

-- 5. Category-wise breakdown
SELECT 
  category,
  type,
  COUNT(*) as transaction_count,
  SUM(amount) as total_amount
FROM transactions
WHERE firm_id = 'YOUR_FIRM_ID'::uuid
GROUP BY category, type
ORDER BY total_amount DESC;

-- 6. Recent transactions (last 30 days)
SELECT 
  t.date,
  t.type,
  t.amount,
  t.category,
  t.description,
  u.name as partner_name
FROM transactions t
LEFT JOIN users u ON t.partner_id = u.id
WHERE t.firm_id = 'YOUR_FIRM_ID'::uuid
  AND t.date >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY t.date DESC, t.created_at DESC;

-- ============================================================================
-- COMMON TRANSACTION CATEGORIES
-- ============================================================================

/*
CREDIT CATEGORIES (Money In):
- Client Payment
- Advance Payment
- Refund Received
- Loan Received
- Investment
- Other Income

DEBIT CATEGORIES (Money Out):
- Fuel Purchase
- Vehicle Repair
- Driver Salary
- Helper Salary
- Maintenance
- Insurance Payment
- Loan Repayment
- Office Expenses
- Other Expenses
*/

-- ============================================================================
-- BULK INSERT EXAMPLES
-- ============================================================================

-- Add multiple credit transactions
INSERT INTO transactions (firm_id, partner_id, type, amount, category, description, date, payment_method) VALUES
  ('YOUR_FIRM_ID'::uuid, 'YOUR_PARTNER_ID'::uuid, 'credit', 5000, 'Client Payment', 'Payment from ABC Company', '2025-01-20', 'Bank Transfer'),
  ('YOUR_FIRM_ID'::uuid, 'YOUR_PARTNER_ID'::uuid, 'credit', 3000, 'Advance Payment', 'Advance for next month', '2025-01-21', 'Cash'),
  ('YOUR_FIRM_ID'::uuid, 'YOUR_PARTNER_ID'::uuid, 'credit', 2500, 'Client Payment', 'Payment from XYZ Builders', '2025-01-22', 'Cheque');

-- Add multiple debit transactions
INSERT INTO transactions (firm_id, partner_id, type, amount, category, description, date, payment_method) VALUES
  ('YOUR_FIRM_ID'::uuid, 'YOUR_PARTNER_ID'::uuid, 'debit', 2000, 'Fuel Purchase', 'Diesel for all vehicles', '2025-01-20', 'Cash'),
  ('YOUR_FIRM_ID'::uuid, 'YOUR_PARTNER_ID'::uuid, 'debit', 1500, 'Vehicle Repair', 'Tire replacement', '2025-01-21', 'Bank Transfer'),
  ('YOUR_FIRM_ID'::uuid, 'YOUR_PARTNER_ID'::uuid, 'debit', 3000, 'Driver Salary', 'Monthly salaries', '2025-01-22', 'Cash');

-- ============================================================================
-- UPDATE EXISTING SCHEMA FILE
-- ============================================================================
-- Add this to your supabase-schema.sql file after the trips table
