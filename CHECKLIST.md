# ✅ Database Setup Checklist

## 🎯 Goal
Set up Supabase database for DumperTrack application

---

## Phase 1: Database Setup (5 minutes)

### Step 1: Open Supabase Dashboard
- [ ] Go to https://supabase.com/dashboard
- [ ] Login to your account
- [ ] Select project: `afedbnmsltwifwrcvnrn`

### Step 2: Run SQL Schema
- [ ] Click **SQL Editor** in left sidebar
- [ ] Click **New Query** button
- [ ] Open `supabase-schema.sql` file
- [ ] Copy ALL contents (Cmd/Ctrl + A, then Cmd/Ctrl + C)
- [ ] Paste into SQL Editor
- [ ] Click **Run** button (or press Cmd/Ctrl + Enter)
- [ ] Wait for "Success" message

### Step 3: Verify Tables Created
- [ ] Click **Table Editor** in left sidebar
- [ ] Confirm you see these tables:
  - [ ] `firms` (2 rows)
  - [ ] `users` (4 rows)
  - [ ] `vehicles` (3 rows)
  - [ ] `expenses` (5 rows)
  - [ ] `trips` (3 rows)

### Step 4: Check Sample Data
- [ ] Click on `firms` table
- [ ] Verify you see "Sharma Transport Co." and "Rajasthan Dumpers Ltd."
- [ ] Click on `trips` table
- [ ] Verify you see 3 sample trips

---

## Phase 2: Test Connection (5 minutes)

### Step 5: Start Development Server
```bash
cd /Users/karnveersingh/Documents/Bumper
npm run dev
```
- [ ] Server starts successfully
- [ ] No errors in terminal
- [ ] App opens at http://localhost:5173

### Step 6: Add Test Component
- [ ] Open `src/App.jsx`
- [ ] Add at the top:
  ```javascript
  import SupabaseTest from './SupabaseTest.jsx';
  ```
- [ ] Add in the return statement (before existing content):
  ```javascript
  <SupabaseTest />
  ```
- [ ] Save file

### Step 7: Verify Connection
- [ ] Check browser (should auto-refresh)
- [ ] Look for "Supabase Connection Test" section
- [ ] Verify status shows: "✓ Successfully connected to database!"
- [ ] Confirm it lists 2 firms
- [ ] Check browser console (F12) for any errors

### Step 8: Remove Test Component (Optional)
- [ ] Remove `<SupabaseTest />` from App.jsx
- [ ] Remove import statement
- [ ] Save file

---

## Phase 3: Integration (Optional - 30 minutes)

### Step 9: Review Integration Guide
- [ ] Read `INTEGRATION_EXAMPLE.js`
- [ ] Understand camelCase ↔ snake_case conversion
- [ ] Review `utils/dataConverter.js`

### Step 10: Update useStore Hook
- [ ] Open `src/dumper-management-app.jsx`
- [ ] Find `useStore()` function
- [ ] Import Supabase hooks:
  ```javascript
  import { useFirms, useUsers, useVehicles, useExpenses, useTrips } from '../utils/supabaseHooks';
  ```
- [ ] Replace local state with Supabase hooks
- [ ] Test each feature:
  - [ ] Login works
  - [ ] Dashboard shows data
  - [ ] Can add new trip
  - [ ] Can add new vehicle
  - [ ] Can add new expense type

---

## Phase 4: Verification (5 minutes)

### Step 11: Test Core Features
- [ ] **Login**: Can select firm and user
- [ ] **Dashboard**: Shows statistics
- [ ] **Add Trip**: Form works, calculates profit
- [ ] **Trips List**: Shows all trips
- [ ] **Vehicles**: Shows vehicle list
- [ ] **Expenses**: Shows expense types
- [ ] **Balance**: Shows financial summary

### Step 12: Check Database Updates
- [ ] Go back to Supabase Dashboard
- [ ] Open Table Editor
- [ ] Add a test trip in the app
- [ ] Refresh `trips` table in Supabase
- [ ] Verify new trip appears

---

## 🎉 Success Criteria

You're done when:
- ✅ All 5 tables exist in Supabase
- ✅ Sample data is visible in tables
- ✅ App connects to database successfully
- ✅ Can view existing data
- ✅ (Optional) Can add new records

---

## 🐛 Troubleshooting

### SQL Schema Fails
**Problem**: Error when running schema
**Solution**: 
- Check if tables already exist (drop them first)
- Run schema in smaller chunks
- Check Supabase project permissions

### Connection Test Fails
**Problem**: "Connection failed" message
**Solution**:
- Verify `.env` file has correct values
- Check Supabase project is not paused
- Restart dev server (`npm run dev`)
- Clear browser cache

### No Data Showing
**Problem**: Tables exist but app shows no data
**Solution**:
- Check browser console for errors
- Verify RLS policies are set
- Test query in Supabase SQL Editor:
  ```sql
  SELECT * FROM firms;
  ```

### Import Errors
**Problem**: Can't import Supabase hooks
**Solution**:
- Check file path is correct
- Verify `utils/supabaseHooks.js` exists
- Restart dev server

---

## 📞 Need Help?

1. **Check Documentation**
   - `DATABASE_SETUP.md` - Detailed setup guide
   - `README.md` - Project overview
   - `DATABASE_DIAGRAM.md` - Schema visualization

2. **Debug Tools**
   - Browser Console (F12)
   - Supabase SQL Editor
   - `SupabaseTest` component

3. **Common Files**
   - Schema: `supabase-schema.sql`
   - Hooks: `utils/supabaseHooks.js`
   - Config: `utils/supabase.ts`
   - Env: `.env`

---

## 📝 Notes

- Database uses `snake_case` (e.g., `firm_id`)
- App uses `camelCase` (e.g., `firmId`)
- Use `dataConverter.js` for conversions
- Trips are locked after creation (immutable)
- All financial calculations happen in the app

---

## ⏭️ Next Steps After Setup

1. **Add Authentication**
   - Enable Supabase Auth
   - Add login/signup flows
   - Update RLS policies

2. **Deploy to Production**
   - Build: `npm run build`
   - Deploy to Vercel/Netlify
   - Set environment variables

3. **Enhance Features**
   - PDF report generation
   - Real-time updates
   - Mobile responsive improvements
   - Data export functionality

---

**Current Status**: ⬜ Not Started

**Update this as you progress:**
- ⬜ Not Started
- 🔄 In Progress  
- ✅ Completed
- ❌ Blocked

---

**Last Updated**: 2025-01-XX
**Estimated Time**: 15-45 minutes (depending on integration)
