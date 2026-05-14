// Example: How to integrate Supabase into your DumperTrack app
// This shows how to replace the local SEED data with real database queries

import { useFirms, useUsers, useVehicles, useExpenses, useTrips } from '../utils/supabaseHooks';

// BEFORE (using local state):
function useStore() {
  const [firms, setFirms] = useState(SEED.firms);
  const [users, setUsers] = useState(SEED.users);
  // ... etc
}

// AFTER (using Supabase):
function useStore() {
  // Load data from Supabase
  const { firms, addFirm: addFirmDB } = useFirms();
  const { users, addUser: addUserDB } = useUsers();
  const { vehicles, addVehicle: addVehicleDB } = useVehicles();
  const { expenses, addExpense: addExpenseDB } = useExpenses();
  const { trips, addTrip: addTripDB } = useTrips();

  const [currentUser, setCurrentUser] = useState(null);

  // Helper functions remain the same
  const firmUsers = (firmId) => users.filter(u => u.firm_id === firmId);
  const firmVehicles = (firmId) => vehicles.filter(v => v.firm_id === firmId);
  const firmExpenses = (firmId) => expenses.filter(e => e.firm_id === firmId);
  const firmTrips = (firmId) => trips.filter(t => t.firm_id === firmId);

  // Wrapper functions to match your existing API
  const addFirm = async (name) => {
    return await addFirmDB(name);
  };

  const addUser = async (data) => {
    return await addUserDB(data);
  };

  const addVehicle = async (data) => {
    return await addVehicleDB(data);
  };

  const addExpense = async (data) => {
    return await addExpenseDB(data);
  };

  const addTrip = async (data) => {
    // Convert camelCase to snake_case for database
    const dbData = {
      firm_id: data.firmId,
      client_name: data.clientName,
      partner_id: data.partnerId,
      driver_name: data.driverName,
      vehicle_id: data.vehicleId,
      place: data.place,
      item: data.item,
      trip_count: data.tripCount,
      rate_per_trip: data.ratePerTrip,
      date: data.date,
      note: data.note,
      expenses: data.expenses,
    };
    return await addTripDB(dbData);
  };

  // Calculate totals for a trip
  const calcTrip = (trip) => {
    const fexp = firmExpenses(trip.firm_id || trip.firmId);
    const income = (trip.rate_per_trip || trip.ratePerTrip) * (trip.trip_count || trip.tripCount);

    const perTripExpenses = trip.expenses || {};
    const totalExp = fexp.reduce((s, e) => {
      const amt = Number(perTripExpenses[e.id] || 0);
      return s + amt;
    }, 0);

    const profit = income - totalExp;
    return { income, totalExp, profit };
  };

  // Firm summary
  const firmSummary = (firmId) => {
    const ftrips = firmTrips(firmId);
    return ftrips.reduce((acc, t) => {
      const c = calcTrip(t);
      acc.income += c.income;
      acc.expense += c.totalExp;
      acc.profit += c.profit;
      acc.trips += (t.trip_count || t.tripCount);
      return acc;
    }, { income: 0, expense: 0, profit: 0, trips: 0 });
  };

  return {
    firms, users, vehicles, expenses, trips, currentUser, setCurrentUser,
    firmUsers, firmVehicles, firmExpenses, firmTrips,
    addFirm, addUser, addVehicle, addExpense, addTrip,
    calcTrip, firmSummary,
  };
}

// IMPORTANT: Database uses snake_case, but your app uses camelCase
// You'll need to convert between them:

// Database → App (snake_case → camelCase)
function dbToApp(dbTrip) {
  return {
    id: dbTrip.id,
    firmId: dbTrip.firm_id,
    clientName: dbTrip.client_name,
    partnerId: dbTrip.partner_id,
    driverName: dbTrip.driver_name,
    vehicleId: dbTrip.vehicle_id,
    place: dbTrip.place,
    item: dbTrip.item,
    tripCount: dbTrip.trip_count,
    ratePerTrip: dbTrip.rate_per_trip,
    date: dbTrip.date,
    note: dbTrip.note,
    expenses: dbTrip.expenses,
    locked: dbTrip.locked,
  };
}

// App → Database (camelCase → snake_case)
function appToDb(appTrip) {
  return {
    firm_id: appTrip.firmId,
    client_name: appTrip.clientName,
    partner_id: appTrip.partnerId,
    driver_name: appTrip.driverName,
    vehicle_id: appTrip.vehicleId,
    place: appTrip.place,
    item: appTrip.item,
    trip_count: appTrip.tripCount,
    rate_per_trip: appTrip.ratePerTrip,
    date: appTrip.date,
    note: appTrip.note,
    expenses: appTrip.expenses,
  };
}

// You can create a utility file for these conversions:
export const dbUtils = {
  toApp: {
    trip: dbToApp,
    user: (u) => ({ ...u, firmId: u.firm_id }),
    vehicle: (v) => ({ ...v, firmId: v.firm_id }),
    expense: (e) => ({ ...e, firmId: e.firm_id, perTrip: e.per_trip }),
  },
  toDb: {
    trip: appToDb,
    user: (u) => ({ ...u, firm_id: u.firmId }),
    vehicle: (v) => ({ ...v, firm_id: v.firmId }),
    expense: (e) => ({ ...e, firm_id: e.firmId, per_trip: e.perTrip }),
  },
};
