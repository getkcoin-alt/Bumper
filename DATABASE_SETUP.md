# DumperTrack Database Setup Guide

## 🚀 Quick Setup

### Step 1: Create Database Tables

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: `afedbnmsltwifwrcvnrn`
3. Navigate to **SQL Editor** (left sidebar)
4. Click **New Query**
5. Copy the entire contents of `supabase-schema.sql`
6. Paste into the SQL Editor
7. Click **Run** (or press Cmd/Ctrl + Enter)

This will create:
- ✅ 5 tables: firms, users, vehicles, expenses, trips
- ✅ Indexes for performance
- ✅ Sample seed data (2 firms, 4 users, 3 vehicles, 5 expenses, 3 trips)
- ✅ Row Level Security policies

### Step 2: Verify Tables

1. Go to **Table Editor** in Supabase Dashboard
2. You should see these tables:
   - `firms` (2 rows)
   - `users` (4 rows)
   - `vehicles` (3 rows)
   - `expenses` (5 rows)
   - `trips` (3 rows)

### Step 3: Install Dependencies (if needed)

```bash
npm install
```

### Step 4: Run the Application

```bash
npm run dev
```

## 📊 Database Schema

### Tables Overview

**firms**
- id (UUID, Primary Key)
- name (Text)
- created_at (Timestamp)

**users**
- id (UUID, Primary Key)
- name (Text)
- mobile (Text)
- firm_id (UUID, Foreign Key → firms)
- role (Text, default: 'partner')
- created_at (Timestamp)

**vehicles**
- id (UUID, Primary Key)
- firm_id (UUID, Foreign Key → firms)
- number (Text)
- type (Text, default: 'Dumper')
- created_at (Timestamp)

**expenses**
- id (UUID, Primary Key)
- firm_id (UUID, Foreign Key → firms)
- label (Text)
- amount (Numeric)
- per_trip (Boolean)
- created_at (Timestamp)

**trips**
- id (UUID, Primary Key)
- firm_id (UUID, Foreign Key → firms)
- client_name (Text)
- partner_id (UUID, Foreign Key → users)
- driver_name (Text)
- vehicle_id (UUID, Foreign Key → vehicles)
- place (Text)
- item (Text)
- trip_count (Integer)
- rate_per_trip (Numeric)
- date (Date)
- note (Text)
- expenses (JSONB) - stores per-trip expense amounts
- locked (Boolean)
- created_at (Timestamp)

## 🔐 Security

Row Level Security (RLS) is enabled on all tables with permissive policies for development. 

**For production**, you should:
1. Set up Supabase Auth
2. Update RLS policies to restrict access based on user authentication
3. Add firm-level access controls

## 🔄 Next Steps

### Option A: Use Seed Data (Current Setup)
The app currently uses local seed data. To switch to Supabase:

1. Update `dumper-management-app.jsx` to use the Supabase hooks from `utils/supabaseHooks.js`
2. Replace local state with database queries

### Option B: Keep Local Development
Continue using seed data for development and switch to Supabase for production.

## 🛠️ Useful Supabase Commands

### View all firms
```sql
SELECT * FROM firms;
```

### View all trips with details
```sql
SELECT 
  t.*,
  u.name as partner_name,
  v.number as vehicle_number,
  f.name as firm_name
FROM trips t
LEFT JOIN users u ON t.partner_id = u.id
LEFT JOIN vehicles v ON t.vehicle_id = v.id
LEFT JOIN firms f ON t.firm_id = f.id
ORDER BY t.date DESC;
```

### Calculate total income by firm
```sql
SELECT 
  f.name as firm_name,
  SUM(t.trip_count * t.rate_per_trip) as total_income,
  COUNT(t.id) as total_trips
FROM firms f
LEFT JOIN trips t ON f.id = t.firm_id
GROUP BY f.id, f.name;
```

## 📝 Environment Variables

Your `.env` file should have:
```
VITE_SUPABASE_URL=https://afedbnmsltwifwrcvnrn.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_KTagvRQ4Pto2Q1rj9i1xBg_TISHFLms
DATABASE_URL=postgresql://postgres:5#FfR74fj-m5X@w@db.afedbnmsltwifwrcvnrn.supabase.co:5432/postgres
```

## 🐛 Troubleshooting

### Tables not created?
- Check SQL Editor for error messages
- Ensure you have proper permissions
- Try running the schema in smaller chunks

### Connection issues?
- Verify your Supabase URL and keys in `.env`
- Check if your project is paused (free tier)
- Ensure you're using the correct database credentials

### Data not showing?
- Check browser console for errors
- Verify RLS policies are set correctly
- Test queries in Supabase SQL Editor

## 📚 Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
