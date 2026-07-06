/**
 * Utility functions to convert between app format (camelCase) 
 * and database format (snake_case)
 */

// Convert database record to app format
export const dbToApp = {
  firm: (db) => ({
    id: db.id,
    name: db.name,
    createdAt: db.created_at,
  }),

  user: (db) => ({
    id: db.id,
    name: db.name,
    mobile: db.mobile,
    firmId: db.firm_id,
    role: db.role,
    pin: db.pin || '',
    createdAt: db.created_at,
  }),

  vehicle: (db) => ({
    id: db.id,
    firmId: db.firm_id,
    number: db.number,
    type: db.type,
    emiAmount: Number(db.emi_amount || 0),
    emiStartDate: db.emi_start_date || null,
    emiTenureMonths: Number(db.emi_tenure_months || 0),
    emiDescription: db.emi_description || '',
    createdAt: db.created_at,
  }),

  expense: (db) => ({
    id: db.id,
    firmId: db.firm_id,
    label: db.label,
    amount: Number(db.amount),
    perTrip: db.per_trip,
    createdAt: db.created_at,
  }),

  trip: (db) => ({
    id: db.id,
    firmId: db.firm_id,
    clientName: db.client_name,
    partnerId: db.partner_id,
    driverId: db.driver_id || null,
    driverName: db.driver_name,
    driverTripRate: Number(db.driver_trip_rate || 0),
    vehicleId: db.vehicle_id,
    place: db.place,
    item: db.item,
    tripCount: db.trip_count,
    ratePerTrip: Number(db.rate_per_trip),
    date: db.date,
    note: db.note,
    expenses: db.expenses || {},
    editedProfit: db.edited_profit !== null && db.edited_profit !== undefined ? Number(db.edited_profit) : undefined,
    clientPaid: Number(db.client_paid || 0),
    locked: db.locked,
    createdAt: db.created_at,
  }),

  driver: (db) => ({
    id: db.id,
    firmId: db.firm_id,
    name: db.name,
    mobile: db.mobile || '',
    salaryType: db.salary_type,
    salaryAmount: Number(db.salary_amount || 0),
    createdAt: db.created_at,
  }),

  driverPayment: (db) => ({
    id: db.id,
    driverId: db.driver_id,
    firmId: db.firm_id,
    amount: Number(db.amount),
    note: db.note || '',
    date: db.date,
    month: db.month,
    recordedBy: db.recorded_by || null,
    createdAt: db.created_at,
  }),

  client: (db) => ({
    id: db.id,
    firmId: db.firm_id,
    name: db.name,
    mobile: db.mobile || '',
    address: db.address || '',
    notes: db.notes || '',
    createdAt: db.created_at,
  }),
};

// Convert app record to database format
export const appToDb = {
  firm: (app) => ({
    name: app.name,
  }),

  user: (app) => ({
    name: app.name,
    mobile: app.mobile,
    firm_id: app.firmId,
    role: app.role || 'partner',
  }),

  vehicle: (app) => ({
    firm_id: app.firmId,
    number: app.number,
    type: app.type || 'Dumper',
    emi_amount: app.emiAmount || 0,
    emi_start_date: app.emiStartDate || null,
    emi_tenure_months: app.emiTenureMonths || 0,
    emi_description: app.emiDescription || '',
  }),

  expense: (app) => ({
    firm_id: app.firmId,
    label: app.label,
    amount: app.amount || 0,
    per_trip: app.perTrip !== undefined ? app.perTrip : true,
  }),

  trip: (app) => ({
    firm_id: app.firmId,
    client_name: app.clientName,
    partner_id: app.partnerId,
    driver_id: app.driverId || null,
    driver_name: app.driverName,
    driver_trip_rate: app.driverTripRate || 0,
    vehicle_id: app.vehicleId,
    place: app.place,
    item: app.item,
    trip_count: app.tripCount,
    rate_per_trip: app.ratePerTrip,
    date: app.date,
    note: app.note || '',
    expenses: app.expenses || {},
    client_paid: app.clientPaid || 0,
    locked: app.locked !== undefined ? app.locked : true,
  }),

  driver: (app) => ({
    firm_id: app.firmId,
    name: app.name,
    mobile: app.mobile || '',
    salary_type: app.salaryType || 'per_trip',
    salary_amount: app.salaryAmount || 0,
  }),

  driverPayment: (app) => ({
    driver_id: app.driverId,
    firm_id: app.firmId,
    amount: app.amount,
    note: app.note || '',
    date: app.date,
    month: app.month,
    recorded_by: app.recordedBy || null,
  }),

  client: (app) => ({
    firm_id: app.firmId,
    name: app.name,
    mobile: app.mobile || '',
    address: app.address || '',
    notes: app.notes || '',
  }),
};

// Batch convert arrays
export const convertArray = {
  dbToApp: (type, dbArray) => dbArray.map(item => dbToApp[type](item)),
  appToDb: (type, appArray) => appArray.map(item => appToDb[type](item)),
};

// Example usage:
// const appTrips = convertArray.dbToApp('trip', dbTrips);
// const dbTrip = appToDb.trip(appTrip);

export default {
  dbToApp,
  appToDb,
  convertArray,
};
