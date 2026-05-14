-- Drop existing policies and recreate with explicit WITH CHECK for INSERT support
DROP POLICY IF EXISTS "Allow all on firms" ON firms;
DROP POLICY IF EXISTS "Allow all on users" ON users;
DROP POLICY IF EXISTS "Allow all on vehicles" ON vehicles;
DROP POLICY IF EXISTS "Allow all on expenses" ON expenses;
DROP POLICY IF EXISTS "Allow all on trips" ON trips;
DROP POLICY IF EXISTS "Allow all on transactions" ON transactions;

CREATE POLICY "Allow all on firms" ON firms FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on users" ON users FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on vehicles" ON vehicles FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on expenses" ON expenses FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on trips" ON trips FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on transactions" ON transactions FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
