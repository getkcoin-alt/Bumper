# 📊 Database Schema Diagram

## Entity Relationship Diagram

```
┌─────────────────┐
│     FIRMS       │
├─────────────────┤
│ id (PK)         │
│ name            │
│ created_at      │
└────────┬────────┘
         │
         │ 1:N
         │
    ┌────┴────────────────────────────────────┐
    │                                          │
    │                                          │
┌───▼──────────┐  ┌──────────────┐  ┌────────▼──────┐
│    USERS     │  │   VEHICLES   │  │   EXPENSES    │
├──────────────┤  ├──────────────┤  ├───────────────┤
│ id (PK)      │  │ id (PK)      │  │ id (PK)       │
│ name         │  │ firm_id (FK) │  │ firm_id (FK)  │
│ mobile       │  │ number       │  │ label         │
│ firm_id (FK) │  │ type         │  │ amount        │
│ role         │  │ created_at   │  │ per_trip      │
│ created_at   │  └──────┬───────┘  │ created_at    │
└──────┬───────┘         │          └───────────────┘
       │                 │
       │ 1:N             │ 1:N
       │                 │
       │         ┌───────▼────────┐
       └────────►│     TRIPS      │
                 ├────────────────┤
                 │ id (PK)        │
                 │ firm_id (FK)   │
                 │ client_name    │
                 │ partner_id (FK)│
                 │ driver_name    │
                 │ vehicle_id (FK)│
                 │ place          │
                 │ item           │
                 │ trip_count     │
                 │ rate_per_trip  │
                 │ date           │
                 │ note           │
                 │ expenses (JSON)│
                 │ locked         │
                 │ created_at     │
                 └────────────────┘
```

## Relationships

### FIRMS (Parent Table)
- **1:N with USERS**: One firm has many users/partners
- **1:N with VEHICLES**: One firm has many vehicles
- **1:N with EXPENSES**: One firm has many expense types
- **1:N with TRIPS**: One firm has many trips

### USERS
- **N:1 with FIRMS**: Many users belong to one firm
- **1:N with TRIPS**: One user can create many trips

### VEHICLES
- **N:1 with FIRMS**: Many vehicles belong to one firm
- **1:N with TRIPS**: One vehicle can be used in many trips

### EXPENSES
- **N:1 with FIRMS**: Many expense types belong to one firm
- Referenced in TRIPS via JSONB field

### TRIPS (Central Table)
- **N:1 with FIRMS**: Many trips belong to one firm
- **N:1 with USERS**: Many trips created by one user
- **N:1 with VEHICLES**: Many trips use one vehicle
- **Stores expenses as JSONB**: `{ "expense_id": amount, ... }`

## Data Flow

```
1. Create FIRM
   ↓
2. Add USERS to firm
   ↓
3. Add VEHICLES to firm
   ↓
4. Define EXPENSE types for firm
   ↓
5. Create TRIPS
   - Select USER (partner)
   - Select VEHICLE
   - Enter expense amounts
   - Calculate profit automatically
```

## Key Features

### Cascade Deletes
- Delete FIRM → Deletes all related USERS, VEHICLES, EXPENSES, TRIPS
- Delete USER → Sets TRIPS.partner_id to NULL
- Delete VEHICLE → Sets TRIPS.vehicle_id to NULL

### JSONB Expenses
The `trips.expenses` field stores per-trip expense amounts:
```json
{
  "expense_id_1": 480,
  "expense_id_2": 320,
  "expense_id_3": 150
}
```

This allows:
- Flexible expense amounts per trip
- Historical data preservation
- Easy calculation of total expenses

### Indexes
Performance optimized with indexes on:
- `users.firm_id`
- `vehicles.firm_id`
- `expenses.firm_id`
- `trips.firm_id`
- `trips.date`
- `trips.partner_id`

## Sample Queries

### Get all trips with details
```sql
SELECT 
  t.*,
  f.name as firm_name,
  u.name as partner_name,
  v.number as vehicle_number
FROM trips t
LEFT JOIN firms f ON t.firm_id = f.id
LEFT JOIN users u ON t.partner_id = u.id
LEFT JOIN vehicles v ON t.vehicle_id = v.id
ORDER BY t.date DESC;
```

### Calculate firm income
```sql
SELECT 
  f.name,
  COUNT(t.id) as total_trips,
  SUM(t.trip_count) as total_trip_count,
  SUM(t.trip_count * t.rate_per_trip) as total_income
FROM firms f
LEFT JOIN trips t ON f.id = t.firm_id
GROUP BY f.id, f.name;
```

### Get partner statistics
```sql
SELECT 
  u.name,
  COUNT(t.id) as trips_logged,
  SUM(t.trip_count) as total_trips,
  SUM(t.trip_count * t.rate_per_trip) as income_generated
FROM users u
LEFT JOIN trips t ON u.id = t.partner_id
GROUP BY u.id, u.name
ORDER BY income_generated DESC;
```

## Security (RLS)

All tables have Row Level Security enabled with permissive policies for development.

**Production recommendations:**
1. Enable Supabase Auth
2. Add user authentication
3. Update policies to restrict access:
   - Users can only see their firm's data
   - Admin role can see all data
   - Partners can't delete trips (already locked)

Example policy:
```sql
-- Users can only see their firm's trips
CREATE POLICY "Users see own firm trips" ON trips
  FOR SELECT
  USING (
    firm_id IN (
      SELECT firm_id FROM users 
      WHERE id = auth.uid()
    )
  );
```
