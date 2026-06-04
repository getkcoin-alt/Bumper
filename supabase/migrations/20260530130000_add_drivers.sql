-- Drivers table
CREATE TABLE IF NOT EXISTS drivers (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  firm_id       UUID REFERENCES firms(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  mobile        TEXT DEFAULT '',
  salary_type   TEXT NOT NULL DEFAULT 'per_trip',
  salary_amount NUMERIC DEFAULT 0,
  created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Driver payments (partial salary tracking)
CREATE TABLE IF NOT EXISTS driver_payments (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  driver_id  UUID REFERENCES drivers(id) ON DELETE CASCADE,
  firm_id    UUID REFERENCES firms(id) ON DELETE CASCADE,
  amount     NUMERIC NOT NULL,
  note       TEXT DEFAULT '',
  date       DATE NOT NULL,
  month      TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Link trips to a driver record
ALTER TABLE trips ADD COLUMN IF NOT EXISTS driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_drivers_firm_id          ON drivers(firm_id);
CREATE INDEX IF NOT EXISTS idx_driver_payments_driver   ON driver_payments(driver_id);
CREATE INDEX IF NOT EXISTS idx_driver_payments_month    ON driver_payments(month);

-- Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON drivers         TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON driver_payments TO anon, authenticated;

-- RLS
ALTER TABLE drivers         ENABLE ROW LEVEL SECURITY;
ALTER TABLE driver_payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on drivers"         ON drivers         FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on driver_payments" ON driver_payments FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
