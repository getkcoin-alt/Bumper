# 🚛 DumperTrack

**Dumper Trip & Finance Management System**

A comprehensive web application for managing dumper/truck operations, tracking trips, expenses, and financial records for transport firms and their partners.

## ✨ Features

### 👥 Multi-User System
- **Admin Panel**: Manage firms and partners
- **Partner Portal**: Track trips, vehicles, and finances
- **Firm-based Access**: Each partner sees their firm's data

### 📊 Core Functionality
- **Trip Management**: Record trips with client, driver, vehicle, and location details
- **Expense Tracking**: Define expense types and track per-trip costs
- **Vehicle Registry**: Manage fleet of dumpers/trucks
- **Financial Reports**: Real-time income, expense, and profit calculations
- **Balance Sheet**: Comprehensive financial overview by firm and partner

### 🎨 Modern UI
- Dark theme with professional design
- Responsive layout (desktop & mobile)
- Real-time calculations
- Locked entries for data integrity

## 🛠️ Tech Stack

- **Frontend**: React 18 + Vite
- **Database**: Supabase (PostgreSQL)
- **Styling**: Custom CSS with modern design system
- **State Management**: React Hooks

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ installed
- Supabase account (free tier works)

### 1. Clone & Install
```bash
cd Bumper
npm install
```

### 2. Setup Database
1. Open [Supabase Dashboard](https://supabase.com/dashboard)
2. Go to SQL Editor
3. Run the SQL from `supabase-schema.sql`
4. Verify tables are created in Table Editor

### 3. Configure Environment
Your `.env` file should have:
```env
VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<your-publishable-key>
```

Only the project URL and publishable key belong in frontend configuration. Never put a database password, connection string, or service-role key in a `VITE_*` variable: these variables are included in the browser bundle. Keep any `DATABASE_URL` needed by trusted database tooling in an untracked local environment or a server-side secret store.

**Security remediation:** A database credential was previously committed to this repository. Removing it here does not revoke it or remove it from Git history. Rotate the exposed database password in Supabase, update legitimate server-side consumers, and coordinate historical secret removal separately.

### 4. Run Development Server
```bash
npm run dev
```

Visit `http://localhost:5173`

## 📁 Project Structure

```
Bumper/
├── src/
│   ├── App.jsx                      # Main app entry
│   ├── dumper-management-app.jsx    # Core application logic
│   ├── main.jsx                     # React root
│   └── SupabaseTest.jsx            # Connection test component
├── utils/
│   ├── supabase.ts                 # Supabase client
│   └── supabaseHooks.js            # Database hooks
├── .env                            # Environment variables
├── supabase-schema.sql             # Database schema
├── DATABASE_SETUP.md               # Setup guide
├── INTEGRATION_EXAMPLE.js          # Integration examples
└── package.json
```

## 🗄️ Database Schema

### Tables
- **firms**: Transport companies
- **users**: Partners/users associated with firms
- **vehicles**: Dumpers/trucks in the fleet
- **expenses**: Expense type definitions
- **trips**: Trip records with financial data

See `DATABASE_SETUP.md` for detailed schema information.

## 🎯 Usage

### Login
1. Select a firm (or "All firms")
2. Choose your partner account or Admin Panel

### Admin Functions
- Add new firms
- Add partners to firms
- View all firms and partners

### Partner Functions
- **Dashboard**: Overview of income, expenses, and profit
- **Add Trip**: Record new trip with automatic profit calculation
- **Expenses**: Define expense types for your firm
- **Vehicles**: Manage your fleet
- **Partners**: View all partners in your firm
- **Balance**: Detailed financial reports

### Adding a Trip
1. Click "Add Trip" button
2. Fill in:
   - Client name
   - Date
   - Partner (who's recording)
   - Driver name
   - Vehicle
   - Location/place
   - Item type (Stone, Sand, Gravel, etc.)
   - Number of trips
   - Rate per trip
3. Enter expense amounts for each expense type
4. Review auto-calculated profit
5. Click "Lock & Save" (entries are immutable)

## 🔐 Security

- Row Level Security (RLS) enabled on all tables
- Currently set to permissive for development
- **Production**: Implement proper auth and access controls

## 📊 Sample Data

The schema includes seed data:
- 2 firms (Sharma Transport Co., Rajasthan Dumpers Ltd.)
- 4 partners
- 3 vehicles
- 5 expense types
- 3 sample trips

## 🧪 Testing Connection

Add the test component to verify Supabase connection:

```jsx
import SupabaseTest from './SupabaseTest';

// In your App.jsx
<SupabaseTest />
```

## 🔄 Migration from Seed Data

Currently, the app uses local seed data. To switch to Supabase:

1. Review `INTEGRATION_EXAMPLE.js`
2. Update `useStore()` in `dumper-management-app.jsx`
3. Replace local state with Supabase hooks
4. Handle camelCase ↔ snake_case conversions

## 📝 Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```

## 🐛 Troubleshooting

### Database Connection Issues
- Verify `.env` variables are correct
- Check Supabase project is not paused
- Test connection with `SupabaseTest` component

### Tables Not Created
- Run SQL schema in Supabase SQL Editor
- Check for error messages
- Verify you have proper permissions

### Data Not Showing
- Check browser console for errors
- Verify RLS policies in Supabase
- Test queries directly in Supabase SQL Editor

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy Options
- **Vercel**: Connect GitHub repo, auto-deploy
- **Netlify**: Drag & drop `dist` folder
- **Cloudflare Pages**: Connect repo
- **AWS Amplify**: Connect repo

Don't forget to set environment variables in your hosting platform!

## 📚 Resources

- [Supabase Docs](https://supabase.com/docs)
- [React Docs](https://react.dev)
- [Vite Docs](https://vitejs.dev)

## 🤝 Contributing

This is a private project. For questions or issues, contact the development team.

## 📄 License

Private - All rights reserved

---

**Built with ❤️ for efficient dumper fleet management**
