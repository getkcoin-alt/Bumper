-- DumperTrack Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Firms table
CREATE TABLE firms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users/Partners table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  mobile TEXT NOT NULL,
  firm_id UUID REFERENCES firms(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'partner',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vehicles table
CREATE TABLE vehicles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  firm_id UUID REFERENCES firms(id) ON DELETE CASCADE,
  number TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'Dumper',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Expense types table
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  firm_id UUID REFERENCES firms(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  amount NUMERIC DEFAULT 0,
  per_trip BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trips table
CREATE TABLE trips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  firm_id UUID REFERENCES firms(id) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  partner_id UUID REFERENCES users(id) ON DELETE SET NULL,
  driver_name TEXT NOT NULL,
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
  place TEXT NOT NULL,
  item TEXT NOT NULL,
  trip_count INTEGER NOT NULL,
  rate_per_trip NUMERIC NOT NULL,
  date DATE NOT NULL,
  note TEXT,
  expenses JSONB DEFAULT '{}',
  locked BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transactions table (Credit/Debit)
CREATE TABLE transactions (
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
CREATE INDEX idx_users_firm_id ON users(firm_id);
CREATE INDEX idx_vehicles_firm_id ON vehicles(firm_id);
CREATE INDEX idx_expenses_firm_id ON expenses(firm_id);
CREATE INDEX idx_trips_firm_id ON trips(firm_id);
CREATE INDEX idx_trips_date ON trips(date);
CREATE INDEX idx_trips_partner_id ON trips(partner_id);
CREATE INDEX idx_transactions_firm_id ON transactions(firm_id);
CREATE INDEX idx_transactions_partner_id ON transactions(partner_id);
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_transactions_type ON transactions(type);

-- Insert seed data
INSERT INTO firms (id, name, created_at) VALUES
  ('f1000000-0000-0000-0000-000000000001'::uuid, 'Sharma Transport Co.', '2024-01-10'),
  ('f2000000-0000-0000-0000-000000000002'::uuid, 'Rajasthan Dumpers Ltd.', '2024-02-15');

INSERT INTO users (id, name, mobile, firm_id, role) VALUES
  ('u1000000-0000-0000-0000-000000000001'::uuid, 'Ramesh Sharma', '9876543210', 'f1000000-0000-0000-0000-000000000001'::uuid, 'partner'),
  ('u2000000-0000-0000-0000-000000000002'::uuid, 'Suresh Patel', '9812345678', 'f1000000-0000-0000-0000-000000000001'::uuid, 'partner'),
  ('u3000000-0000-0000-0000-000000000003'::uuid, 'Dinesh Gupta', '9898989898', 'f2000000-0000-0000-0000-000000000002'::uuid, 'partner'),
  ('u4000000-0000-0000-0000-000000000004'::uuid, 'Mahesh Kumar', '9001234567', 'f2000000-0000-0000-0000-000000000002'::uuid, 'partner');

INSERT INTO vehicles (id, firm_id, number, type) VALUES
  ('v1000000-0000-0000-0000-000000000001'::uuid, 'f1000000-0000-0000-0000-000000000001'::uuid, 'RJ-14-GA-4521', 'Dumper'),
  ('v2000000-0000-0000-0000-000000000002'::uuid, 'f1000000-0000-0000-0000-000000000001'::uuid, 'RJ-14-GB-1102', 'Dumper'),
  ('v3000000-0000-0000-0000-000000000003'::uuid, 'f2000000-0000-0000-0000-000000000002'::uuid, 'RJ-22-CA-8877', 'Dumper');

INSERT INTO expenses (id, firm_id, label, amount, per_trip) VALUES
  ('e1000000-0000-0000-0000-000000000001'::uuid, 'f1000000-0000-0000-0000-000000000001'::uuid, 'Diesel', 120, true),
  ('e2000000-0000-0000-0000-000000000002'::uuid, 'f1000000-0000-0000-0000-000000000001'::uuid, 'Driver Wages', 80, true),
  ('e3000000-0000-0000-0000-000000000003'::uuid, 'f1000000-0000-0000-0000-000000000001'::uuid, 'Maintenance', 30, false),
  ('e4000000-0000-0000-0000-000000000004'::uuid, 'f2000000-0000-0000-0000-000000000002'::uuid, 'Diesel', 110, true),
  ('e5000000-0000-0000-0000-000000000005'::uuid, 'f2000000-0000-0000-0000-000000000002'::uuid, 'Driver Wages', 75, true);

INSERT INTO trips (id, firm_id, client_name, partner_id, driver_name, vehicle_id, place, item, trip_count, rate_per_trip, date, note, expenses, locked) VALUES
  ('t1000000-0000-0000-0000-000000000001'::uuid, 'f1000000-0000-0000-0000-000000000001'::uuid, 'Anand Builders', 'u1000000-0000-0000-0000-000000000001'::uuid, 'Balu Singh', 'v1000000-0000-0000-0000-000000000001'::uuid, 'Kota Stone Quarry', 'Stone', 4, 800, '2025-05-10', '', '{"e1000000-0000-0000-0000-000000000001": 480, "e2000000-0000-0000-0000-000000000002": 320}', true),
  ('t2000000-0000-0000-0000-000000000002'::uuid, 'f1000000-0000-0000-0000-000000000001'::uuid, 'Sharma Constructions', 'u2000000-0000-0000-0000-000000000002'::uuid, 'Ramu Lal', 'v2000000-0000-0000-0000-000000000002'::uuid, 'Ramganj Mandi', 'Sand (plain)', 6, 650, '2025-05-11', '', '{"e1000000-0000-0000-0000-000000000001": 720, "e2000000-0000-0000-0000-000000000002": 480}', true),
  ('t3000000-0000-0000-0000-000000000003'::uuid, 'f2000000-0000-0000-0000-000000000002'::uuid, 'City Infra', 'u3000000-0000-0000-0000-000000000003'::uuid, 'Gopal Das', 'v3000000-0000-0000-0000-000000000003'::uuid, 'Bundi Road', 'Gravel', 3, 700, '2025-05-12', '', '{"e4000000-0000-0000-0000-000000000004": 330, "e5000000-0000-0000-0000-000000000005": 225}', true);

-- Enable Row Level Security (RLS)
ALTER TABLE firms ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Create policies (allow all for now - adjust based on your auth requirements)
CREATE POLICY "Allow all on firms" ON firms FOR ALL USING (true);
CREATE POLICY "Allow all on users" ON users FOR ALL USING (true);
CREATE POLICY "Allow all on vehicles" ON vehicles FOR ALL USING (true);
CREATE POLICY "Allow all on expenses" ON expenses FOR ALL USING (true);
CREATE POLICY "Allow all on trips" ON trips FOR ALL USING (true);
CREATE POLICY "Allow all on transactions" ON transactions FOR ALL USING (true);
