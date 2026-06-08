CREATE TABLE IF NOT EXISTS clients (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  firm_id    UUID REFERENCES firms(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  mobile     TEXT DEFAULT '',
  address    TEXT DEFAULT '',
  notes      TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_clients_firm_id ON clients(firm_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON clients TO anon, authenticated;

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on clients" ON clients FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
