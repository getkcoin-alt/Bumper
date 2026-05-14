import { useState, useEffect, useMemo } from "react";
import { supabase } from "../utils/supabase";

// ── Seed Data ─────────────────────────────────────────────────────────────────
const SEED = {
  firms: [
    { id: "f1", name: "Sharma Transport Co.", createdAt: "2024-01-10" },
    { id: "f2", name: "Rajasthan Dumpers Ltd.", createdAt: "2024-02-15" },
  ],
  users: [
    { id: "u1", name: "Ramesh Sharma", mobile: "9876543210", firmId: "f1", role: "partner" },
    { id: "u2", name: "Suresh Patel", mobile: "9812345678", firmId: "f1", role: "partner" },
    { id: "u3", name: "Dinesh Gupta", mobile: "9898989898", firmId: "f2", role: "partner" },
    { id: "u4", name: "Mahesh Kumar", mobile: "9001234567", firmId: "f2", role: "partner" },
  ],
  vehicles: [
    { id: "v1", firmId: "f1", number: "RJ-14-GA-4521", type: "Dumper" },
    { id: "v2", firmId: "f1", number: "RJ-14-GB-1102", type: "Dumper" },
    { id: "v3", firmId: "f2", number: "RJ-22-CA-8877", type: "Dumper" },
  ],
  expenses: [
    { id: "e1", firmId: "f1", label: "Diesel", amount: 120, perTrip: true },
    { id: "e2", firmId: "f1", label: "Driver Wages", amount: 80, perTrip: true },
    { id: "e3", firmId: "f1", label: "Maintenance", amount: 30, perTrip: false },
    { id: "e4", firmId: "f2", label: "Diesel", amount: 110, perTrip: true },
    { id: "e5", firmId: "f2", label: "Driver Wages", amount: 75, perTrip: true },
  ],
  trips: [
    {
      id: "t1", firmId: "f1", clientName: "Anand Builders", partnerId: "u1",
      driverName: "Balu Singh", vehicleId: "v1", place: "Kota Stone Quarry",
      item: "Stone", tripCount: 4, ratePerTrip: 800,
      date: "2025-05-10", note: "", locked: true,
    },
    {
      id: "t2", firmId: "f1", clientName: "Sharma Constructions", partnerId: "u2",
      driverName: "Ramu Lal", vehicleId: "v2", place: "Ramganj Mandi",
      item: "Sand (plain)", tripCount: 6, ratePerTrip: 650,
      date: "2025-05-11", note: "", locked: true,
    },
    {
      id: "t3", firmId: "f2", clientName: "City Infra", partnerId: "u3",
      driverName: "Gopal Das", vehicleId: "v3", place: "Bundi Road",
      item: "Gravel", tripCount: 3, ratePerTrip: 700,
      date: "2025-05-12", note: "", locked: true,
    },
  ],
};

const ITEMS = ["Stone", "Concrete", "Pubba", "Bricks", "Soil", "Gravel", "Sand (plain)", "Sand (unplain)"];

function useSupabaseTodos() {
  const [todos, setTodos] = useState([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const { data, error } = await supabase
          .from('todos')
          .select('*');

        if (error) {
          console.error('Supabase error loading todos:', error);
          return;
        }

        if (!cancelled) setTodos(data ?? []);
      } catch (e) {
        console.error('Supabase exception loading todos:', e);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return todos;
}


function uid() { return Math.random().toString(36).slice(2, 10); }
function today() { return new Date().toISOString().slice(0, 10); }

// ── Styles ────────────────────────────────────────────────────────────────────
const style = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root {
  --bg:#0d1117;--bg2:#161b22;--bg3:#21262d;--bg4:#30363d;
  --border:#30363d;--border2:#484f58;
  --text:#e6edf3;--text2:#8b949e;--text3:#6e7681;
  --accent:#f0a500;--accent2:#ffcc47;--accent-dim:#f0a50022;
  --teal:#1abc9c;--teal-dim:#1abc9c18;
  --red:#ff6b6b;--red-dim:#ff6b6b18;
  --blue:#58a6ff;--blue-dim:#58a6ff18;
  --purple:#bc8cff;--purple-dim:#bc8cff18;
  --radius:10px;--radius-lg:16px;
  --shadow:0 4px 24px #0008;
}
body{font-family:'DM Sans',sans-serif;background:var(--bg);color:var(--text);min-height:100vh;line-height:1.5}
h1,h2,h3,h4{font-family:'Syne',sans-serif;font-weight:700}

/* scrollbar */
::-webkit-scrollbar{width:6px;height:6px}
::-webkit-scrollbar-track{background:var(--bg2)}
::-webkit-scrollbar-thumb{background:var(--bg4);border-radius:3px}

/* layout */
.app{display:flex;height:100vh;overflow:hidden}
.sidebar{width:240px;background:var(--bg2);border-right:1px solid var(--border);display:flex;flex-direction:column;flex-shrink:0;overflow-y:auto}
.main{flex:1;overflow-y:auto;background:var(--bg)}

/* sidebar */
.sidebar-logo{padding:16px 16px 12px;border-bottom:1px solid var(--border)}
.sidebar-logo .logo-icon{width:28px;height:28px;background:var(--accent);border-radius:6px;display:flex;align-items:center;justify-content:center;margin-bottom:6px}
.sidebar-logo .logo-icon svg{width:16px;height:16px;fill:#0d1117}
.sidebar-logo h2{font-size:14px;color:var(--text);letter-spacing:-.3px;font-weight:600}
.sidebar-logo p{font-size:10px;color:var(--text3);margin-top:2px}
.firm-badge{margin:10px 12px;background:var(--bg3);border:1px solid var(--border);border-radius:var(--radius);padding:8px 10px;font-size:11px}
.firm-badge .fb-label{color:var(--text3);font-size:9px;text-transform:uppercase;letter-spacing:.8px}
.firm-badge .fb-name{color:var(--accent);font-family:'Syne',sans-serif;font-size:12px;font-weight:600;margin-top:2px}
.nav-section{padding:6px 10px 3px;font-size:9px;text-transform:uppercase;letter-spacing:.8px;color:var(--text3);margin-top:6px}
.nav-item{display:flex;align-items:center;gap:8px;padding:8px 12px;margin:2px 8px;border-radius:var(--radius);cursor:pointer;font-size:13px;color:var(--text2);transition:all .15s;border:none;background:none;width:calc(100% - 16px);text-align:left}
.nav-item:hover{background:var(--bg3);color:var(--text)}
.nav-item.active{background:var(--accent-dim);color:var(--accent);font-weight:500}
.nav-item svg{width:16px;height:16px;flex-shrink:0;opacity:.7}
.nav-item.active svg{opacity:1}
.sidebar-footer{margin-top:auto;padding:12px;border-top:1px solid var(--border)}
.logout-btn{width:100%;padding:7px;background:var(--bg3);border:1px solid var(--border);border-radius:var(--radius);color:var(--text2);font-size:12px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;transition:all .15s}
.logout-btn:hover{background:var(--red-dim);color:var(--red);border-color:var(--red)}

/* topbar */
.topbar{padding:20px 28px 0;display:flex;align-items:center;justify-content:space-between}
.page-title{font-size:22px;color:var(--text);letter-spacing:-.4px}
.page-sub{font-size:13px;color:var(--text3);margin-top:2px}

/* content */
.content{padding:20px 28px 40px}

/* cards */
.card{background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius-lg);padding:20px}
.card-sm{background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius);padding:16px}
.grid{display:grid;gap:16px}
.g2{grid-template-columns:repeat(2,1fr)}
.g3{grid-template-columns:repeat(3,1fr)}
.g4{grid-template-columns:repeat(4,1fr)}

/* stat card */
.stat-card{background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius-lg);padding:20px;position:relative;overflow:hidden}
.stat-card::before{content:'';position:absolute;top:0;right:0;width:80px;height:80px;border-radius:0 var(--radius-lg) 0 80px;opacity:.08}
.stat-card.accent::before{background:var(--accent)}
.stat-card.teal::before{background:var(--teal)}
.stat-card.red::before{background:var(--red)}
.stat-card.blue::before{background:var(--blue)}
.stat-label{font-size:11px;text-transform:uppercase;letter-spacing:.8px;color:var(--text3)}
.stat-value{font-family:'Syne',sans-serif;font-size:28px;font-weight:800;margin:6px 0 4px;letter-spacing:-1px}
.stat-card.accent .stat-value{color:var(--accent)}
.stat-card.teal .stat-value{color:var(--teal)}
.stat-card.red .stat-value{color:var(--red)}
.stat-card.blue .stat-value{color:var(--blue)}
.stat-sub{font-size:11px;color:var(--text3)}

/* table */
.table-wrap{overflow-x:auto;border-radius:var(--radius)}
table{width:100%;border-collapse:collapse;font-size:13px}
th{text-align:left;padding:10px 14px;font-size:10px;text-transform:uppercase;letter-spacing:.8px;color:var(--text3);border-bottom:1px solid var(--border);font-weight:500;background:var(--bg3);white-space:nowrap}
td{padding:11px 14px;border-bottom:1px solid var(--border);color:var(--text2);vertical-align:middle}
tr:last-child td{border-bottom:none}
tr:hover td{background:var(--bg3);color:var(--text)}
.td-bold{font-weight:500;color:var(--text)!important}
.td-accent{color:var(--accent)!important;font-family:'Syne',sans-serif;font-weight:600}
.td-teal{color:var(--teal)!important;font-weight:500}
.td-red{color:var(--red)!important;font-weight:500}

/* badge */
.badge{display:inline-flex;align-items:center;gap:4px;padding:2px 8px;border-radius:20px;font-size:11px;font-weight:500}
.badge-accent{background:var(--accent-dim);color:var(--accent)}
.badge-teal{background:var(--teal-dim);color:var(--teal)}
.badge-red{background:var(--red-dim);color:var(--red)}
.badge-blue{background:var(--blue-dim);color:var(--blue)}
.badge-purple{background:var(--purple-dim);color:var(--purple)}
.badge-gray{background:var(--bg4);color:var(--text2)}

/* buttons */
.btn{display:inline-flex;align-items:center;gap:6px;padding:8px 16px;border-radius:var(--radius);font-size:13px;font-weight:500;cursor:pointer;border:none;transition:all .15s;font-family:'DM Sans',sans-serif}
.btn-primary{background:var(--accent);color:#0d1117}
.btn-primary:hover{background:var(--accent2)}
.btn-outline{background:transparent;color:var(--text2);border:1px solid var(--border)}
.btn-outline:hover{background:var(--bg3);color:var(--text);border-color:var(--border2)}
.btn-danger{background:var(--red-dim);color:var(--red);border:1px solid transparent}
.btn-danger:hover{border-color:var(--red)}
.btn-sm{padding:5px 10px;font-size:12px}
.btn svg{width:14px;height:14px}

/* forms */
.form-grid{display:grid;gap:14px}
.fg2{grid-template-columns:1fr 1fr}
.fg3{grid-template-columns:1fr 1fr 1fr}
label{font-size:12px;color:var(--text3);display:block;margin-bottom:5px;text-transform:uppercase;letter-spacing:.5px}
input,select,textarea{width:100%;padding:9px 12px;background:var(--bg3);border:1px solid var(--border);border-radius:var(--radius);color:var(--text);font-size:13.5px;font-family:'DM Sans',sans-serif;outline:none;transition:border .15s}
input:focus,select:focus,textarea:focus{border-color:var(--accent)}
input::placeholder{color:var(--text3)}
select option{background:var(--bg3)}

/* modal */
.overlay{position:fixed;inset:0;background:#000a;display:flex;align-items:center;justify-content:center;z-index:100;padding:20px}
.modal{background:var(--bg2);border:1px solid var(--border2);border-radius:var(--radius-lg);width:100%;max-width:560px;max-height:90vh;overflow-y:auto;box-shadow:var(--shadow)}
.modal-header{padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between}
.modal-header h3{font-size:16px;color:var(--text)}
.modal-body{padding:20px 24px}
.modal-footer{padding:14px 24px;border-top:1px solid var(--border);display:flex;justify-content:flex-end;gap:10px}
.close-btn{background:none;border:none;color:var(--text3);cursor:pointer;font-size:20px;line-height:1;padding:2px 6px}
.close-btn:hover{color:var(--text)}

/* login */
.login-wrap{min-height:100vh;display:flex;align-items:center;justify-content:center;background:var(--bg);padding:20px}
.login-card{width:100%;max-width:400px;background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius-lg);padding:32px;box-shadow:var(--shadow)}
.login-logo{text-align:center;margin-bottom:24px}
.login-logo .icon{width:48px;height:48px;background:var(--accent);border-radius:10px;display:flex;align-items:center;justify-content:center;margin:0 auto 10px}
.login-logo .icon svg{width:26px;height:26px}
.login-logo h1{font-size:20px;letter-spacing:-.4px;font-weight:700}
.login-logo p{font-size:12px;color:var(--text3);margin-top:4px}
.user-list{display:flex;flex-direction:column;gap:8px;margin-top:16px}
.user-btn{width:100%;padding:12px 14px;background:var(--bg3);border:1px solid var(--border);border-radius:var(--radius);cursor:pointer;display:flex;align-items:center;gap:12px;transition:all .15s;text-align:left;font-family:'DM Sans',sans-serif}
.user-btn:hover{border-color:var(--accent);background:var(--accent-dim);transform:translateY(-1px)}
.user-btn-icon{width:40px;height:40px;background:var(--bg4);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:700;font-family:'Syne',sans-serif;color:var(--text);flex-shrink:0}
.user-btn-content{flex:1;min-width:0}
.user-btn-name{font-size:14px;font-weight:600;color:var(--text);margin-bottom:2px}
.user-btn-meta{font-size:11px;color:var(--text3)}
.admin-btn{border-color:var(--accent);background:var(--accent-dim)}
.admin-btn:hover{background:var(--accent);border-color:var(--accent2)}
.admin-btn .user-btn-name{color:var(--accent)}
.admin-btn:hover .user-btn-name{color:#0d1117}
.admin-btn:hover .user-btn-meta{color:#0d1117;opacity:.7}
.admin-icon{background:var(--accent);color:#0d1117}
.admin-btn:hover .admin-icon{background:#0d1117;color:var(--accent)}

/* divider */
.divider{border:none;border-top:1px solid var(--border);margin:16px 0}

/* empty */
.empty{text-align:center;padding:48px 20px;color:var(--text3)}
.empty svg{width:40px;height:40px;margin:0 auto 12px;display:block;opacity:.3}
.empty p{font-size:13px}

/* expense calc row */
.exp-row{display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border);font-size:13px}
.exp-row:last-child{border-bottom:none}
.exp-row .er-label{color:var(--text2)}
.exp-row .er-val{color:var(--accent);font-weight:500}

/* profit pill */
.profit-pill{display:inline-flex;align-items:center;gap:6px;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:600;font-family:'Syne',sans-serif}

/* mobile */
@media(max-width:768px){
  .app{flex-direction:column}
  .sidebar{width:100%;height:auto;flex-direction:row;overflow-x:auto;border-right:none;border-bottom:1px solid var(--border);flex-shrink:0}
  .sidebar-logo{display:none}
  .firm-badge{display:none}
  .nav-section{display:none}
  .nav-item{flex-direction:column;gap:3px;padding:8px 12px;font-size:10px;min-width:64px}
  .nav-item svg{width:18px;height:18px}
  .sidebar-footer{display:none}
  .main{overflow-y:auto}
  .g2,.g3,.g4{grid-template-columns:1fr}
  .fg2,.fg3{grid-template-columns:1fr}
  .topbar{padding:14px 16px 0}
  .content{padding:14px 16px 40px}
}
`;

// ── Icons ─────────────────────────────────────────────────────────────────────
const Icon = {
  truck: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>,
  dashboard: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>,
  trips: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
  expense: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>,
  balance: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>,
  vehicle: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v9a2 2 0 01-2 2H5z"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg>,
  people: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>,
  firms: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  plus: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  logout: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  lock: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>,
  admin: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
};

// ── App State ─────────────────────────────────────────────────────────────────
function useStore() {
  const [firms, setFirms] = useState(SEED.firms);
  const [users, setUsers] = useState(SEED.users);
  const [vehicles, setVehicles] = useState(SEED.vehicles);
  const [expenses, setExpenses] = useState(SEED.expenses);
  const [trips, setTrips] = useState(SEED.trips);
  const [currentUser, setCurrentUser] = useState(null);

  const firmUsers = (firmId) => users.filter(u => u.firmId === firmId);
  const firmVehicles = (firmId) => vehicles.filter(v => v.firmId === firmId);
  const firmExpenses = (firmId) => expenses.filter(e => e.firmId === firmId);
  const firmTrips = (firmId) => trips.filter(t => t.firmId === firmId);

  const addFirm = (name) => {
    const f = { id: uid(), name, createdAt: today() };
    setFirms(p => [...p, f]);
    return f;
  };
  const addUser = (data) => {
    const u = { id: uid(), ...data, role: "partner" };
    setUsers(p => [...p, u]);
    return u;
  };
  const addVehicle = (data) => {
    const v = { id: uid(), ...data };
    setVehicles(p => [...p, v]);
  };
  const addExpense = (data) => {
    const e = { id: uid(), ...data };
    setExpenses(p => [...p, e]);
  };
  const addTrip = (data) => {
    const t = { id: uid(), ...data, locked: true };
    setTrips(p => [...p, t]);
  };

  // Calculate totals for a trip
  const calcTrip = (trip) => {
    const fexp = firmExpenses(trip.firmId);
    const income = trip.ratePerTrip * trip.tripCount;

    // New model: expense types only define labels.
    // Actual expense amounts are entered per trip and stored in trip.expenses.
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
      acc.trips += t.tripCount;
      return acc;
    }, { income: 0, expense: 0, profit: 0, trips: 0 });
  };

  const todos = useSupabaseTodos();

  return {
    firms, users, vehicles, expenses, trips, todos, currentUser, setCurrentUser,

    firmUsers, firmVehicles, firmExpenses, firmTrips,
    addFirm, addUser, addVehicle, addExpense, addTrip,
    calcTrip, firmSummary,
  };
}

// ── Components ────────────────────────────────────────────────────────────────
function Modal({ title, onClose, children, footer }) {
  return (
    <div className="overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

function fmt(n) { return "₹" + Number(n).toLocaleString("en-IN"); }

// ── Login Screen ──────────────────────────────────────────────────────────────
function LoginScreen({ users, firms, onLogin }) {
  const [firmFilter, setFirmFilter] = useState("all");

  const visible = firmFilter === "all" ? users : users.filter(u => u.firmId === firmFilter);

  return (
    <div className="login-wrap">
      <div className="login-card">
        <div className="login-logo">
          <div className="icon">{Icon.truck}</div>
          <h1>DumperTrack</h1>
          <p>Dumper Trip & Finance Management</p>
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>Select firm</label>
          <select value={firmFilter} onChange={e => setFirmFilter(e.target.value)}>
            <option value="all">All firms</option>
            {firms.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <label style={{ margin: 0 }}>Select your account</label>
          <span style={{ fontSize: 11, color: 'var(--text3)', background: 'var(--bg3)', padding: '2px 8px', borderRadius: '12px' }}>
            {visible.length + 1} {visible.length + 1 === 1 ? 'user' : 'users'}
          </span>
        </div>
        <div className="user-list">
          <button className="user-btn admin-btn" onClick={() => onLogin({ id: "admin", name: "Admin", role: "admin" })}>
            <div className="user-btn-icon admin-icon">{Icon.admin}</div>
            <div className="user-btn-content">
              <div className="user-btn-name">Admin Panel</div>
              <div className="user-btn-meta">Manage firms & partners</div>
            </div>
          </button>
          {visible.map(u => {
            const firm = firms.find(f => f.id === u.firmId);
            return (
              <button key={u.id} className="user-btn" onClick={() => onLogin(u)}>
                <div className="user-btn-icon">{u.name[0]}</div>
                <div className="user-btn-content">
                  <div className="user-btn-name">{u.name}</div>
                  <div className="user-btn-meta">{firm?.name} · {u.mobile}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Admin Panel ───────────────────────────────────────────────────────────────
function AdminPanel({ store }) {
  const [tab, setTab] = useState("firms");
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});

  const navItems = [
    { id: "firms", label: "Firms", icon: Icon.firms },
    { id: "users", label: "Partners", icon: Icon.people },
  ];

  const submitFirm = () => {
    if (!form.name?.trim()) return;
    store.addFirm(form.name.trim());
    setModal(null); setForm({});
  };

  const submitUser = () => {
    if (!form.name?.trim() || !form.mobile?.trim() || !form.firmId) return;
    store.addUser({ name: form.name.trim(), mobile: form.mobile.trim(), firmId: form.firmId });
    setModal(null); setForm({});
  };

  return (
    <div className="app">
      <style>{style}</style>
      <div className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">{Icon.truck}</div>
          <h2>DumperTrack</h2>
          <p>Admin Console</p>
        </div>
        <div className="nav-section">Management</div>
        {navItems.map(n => (
          <button key={n.id} className={`nav-item${tab === n.id ? " active" : ""}`} onClick={() => setTab(n.id)}>
            {n.icon}{n.label}
          </button>
        ))}
        <div className="sidebar-footer">
          <button className="logout-btn" onClick={() => store.setCurrentUser(null)}>
            {Icon.logout} Sign out
          </button>
        </div>
      </div>

      <div className="main">
        <div className="topbar">
          <div>
            <h1 className="page-title">{tab === "firms" ? "Firms" : "Partners"}</h1>
            <p className="page-sub">{tab === "firms" ? `${store.firms.length} registered firms` : `${store.users.length} total partners`}</p>
          </div>
          <button className="btn btn-primary" onClick={() => { setModal(tab); setForm({}); }}>
            {Icon.plus} {tab === "firms" ? "Add Firm" : "Add Partner"}
          </button>
        </div>

        <div className="content">
          {tab === "firms" && (
            <div className="card">
              <div className="table-wrap">
                <table>
                  <thead><tr><th>#</th><th>Firm Name</th><th>Partners</th><th>Created</th></tr></thead>
                  <tbody>
                    {store.firms.map((f, i) => (
                      <tr key={f.id}>
                        <td className="td-bold">{i + 1}</td>
                        <td className="td-bold">{f.name}</td>
                        <td><span className="badge badge-teal">{store.firmUsers(f.id).length} partners</span></td>
                        <td>{f.createdAt}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === "users" && (
            <div className="card">
              <div className="table-wrap">
                <table>
                  <thead><tr><th>#</th><th>Name</th><th>Mobile</th><th>Firm</th></tr></thead>
                  <tbody>
                    {store.users.map((u, i) => {
                      const firm = store.firms.find(f => f.id === u.firmId);
                      return (
                        <tr key={u.id}>
                          <td className="td-bold">{i + 1}</td>
                          <td className="td-bold">{u.name}</td>
                          <td>{u.mobile}</td>
                          <td><span className="badge badge-accent">{firm?.name}</span></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {modal === "firms" && (
        <Modal title="Add New Firm" onClose={() => setModal(null)}
          footer={<><button className="btn btn-outline" onClick={() => setModal(null)}>Cancel</button><button className="btn btn-primary" onClick={submitFirm}>Create Firm</button></>}>
          <div className="form-grid">
            <div><label>Firm Name</label><input placeholder="e.g. Sharma Transport Co." value={form.name || ""} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
          </div>
        </Modal>
      )}

      {modal === "users" && (
        <Modal title="Add Partner" onClose={() => setModal(null)}
          footer={<><button className="btn btn-outline" onClick={() => setModal(null)}>Cancel</button><button className="btn btn-primary" onClick={submitUser}>Add Partner</button></>}>
          <div className="form-grid">
            <div><label>Full Name</label><input placeholder="Partner name" value={form.name || ""} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
            <div><label>Mobile Number</label><input placeholder="10-digit mobile" value={form.mobile || ""} onChange={e => setForm(p => ({ ...p, mobile: e.target.value }))} /></div>
            <div><label>Assign to Firm</label>
              <select value={form.firmId || ""} onChange={e => setForm(p => ({ ...p, firmId: e.target.value }))}>
                <option value="">— Select Firm —</option>
                {store.firms.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── User Panel ────────────────────────────────────────────────────────────────
function UserPanel({ store, user }) {
  const [tab, setTab] = useState("dashboard");
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [tripDetail, setTripDetail] = useState(null);

  const todos = store.todos || [];


  const firm = store.firms.find(f => f.id === user.firmId);
  const partners = store.firmUsers(user.firmId);
  const vehicles = store.firmVehicles(user.firmId);
  const expenses = store.firmExpenses(user.firmId);
  const trips = store.firmTrips(user.firmId);
  const summary = store.firmSummary(user.firmId);

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: Icon.dashboard },
    { id: "trips", label: "Trips", icon: Icon.trips },
    { id: "expenses", label: "Expenses", icon: Icon.expense },
    { id: "vehicles", label: "Vehicles", icon: Icon.vehicle },
    { id: "partners", label: "Partners", icon: Icon.people },
    { id: "balance", label: "Balance", icon: Icon.balance },
  ];

  // Trip form auto-calculation
  const tripIncome = (form.ratePerTrip || 0) * (form.tripCount || 0);
  const tripExpenses = expenses.reduce((s, e) => {
    const raw = form.expenseAmounts?.[e.id];
    const amt = raw === "" || raw === undefined || raw === null ? 0 : Number(raw);
    return s + (Number.isFinite(amt) ? amt : 0);
  }, 0);
  const tripProfit = tripIncome - tripExpenses;

  const submitTrip = () => {
    if (
      !form.clientName?.trim() ||
      !form.partnerId ||
      !form.vehicleId ||
      !form.driverName?.trim() ||
      !form.place?.trim() ||
      !form.item ||
      !form.tripCount ||
      !form.ratePerTrip
    ) return alert("Fill all required fields.");

    // Collect per-expense amounts entered in the trip form.
    const tripExpenses = {};
    expenses.forEach(e => {
      const raw = form.expenseAmounts?.[e.id];
      const amt = raw === "" || raw === undefined || raw === null ? 0 : Number(raw);
      tripExpenses[e.id] = Number.isFinite(amt) ? amt : 0;
    });

    store.addTrip({
      firmId: user.firmId,
      clientName: form.clientName,
      partnerId: form.partnerId,
      driverName: form.driverName,
      vehicleId: form.vehicleId,
      place: form.place,
      item: form.item,
      tripCount: Number(form.tripCount),
      ratePerTrip: Number(form.ratePerTrip),
      date: form.date || today(),
      note: form.note || "",
      expenses: tripExpenses,
    });
    setModal(null);
    setForm({});
  };

  const submitVehicle = () => {
    if (!form.number?.trim()) return;
    store.addVehicle({ firmId: user.firmId, number: form.number.trim(), type: form.type || "Dumper" });
    setModal(null); setForm({});
  };

  const submitExpense = () => {
    if (!form.label?.trim()) return;
    // Store only label; amounts are entered per trip.
    store.addExpense({ firmId: user.firmId, label: form.label.trim(), amount: 0, perTrip: true });
    setModal(null);
    setForm({});
  };

  return (
    <div className="app">
      <style>{style}</style>
      <div className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">{Icon.truck}</div>
          <h2>DumperTrack</h2>
          <p>Partner Portal</p>
        </div>
        <div className="firm-badge">
          <div className="fb-label">Current Firm</div>
          <div className="fb-name">{firm?.name}</div>
        </div>
        <div className="nav-section">Menu</div>
        {navItems.map(n => (
          <button key={n.id} className={`nav-item${tab === n.id ? " active" : ""}`} onClick={() => setTab(n.id)}>
            {n.icon}{n.label}
          </button>
        ))}
        <div className="sidebar-footer">
          <div style={{ fontSize: 11, color: "var(--text3)", marginBottom: 8 }}>
            Signed in as<br /><span style={{ color: "var(--text)", fontWeight: 500 }}>{user.name}</span>
          </div>
          <button className="logout-btn" onClick={() => store.setCurrentUser(null)}>
            {Icon.logout} Sign out
          </button>
        </div>
      </div>

      <div className="main">
        {/* ── DASHBOARD ── */}
        {tab === "dashboard" && (
          <>
            <div className="topbar">
              <div>
                <h1 className="page-title">Good day, {user.name.split(" ")[0]} 👋</h1>
                <p className="page-sub">{firm?.name} · All figures are firm-wide</p>
              </div>
              <button className="btn btn-primary" onClick={() => { setModal("trip"); setForm({ partnerId: user.id, date: today() }); }}>
                {Icon.plus} Add Trip
              </button>
            </div>
            <div className="content">
              <div className="grid g4" style={{ marginBottom: 20 }}>
                <div className="stat-card" style={{ borderColor: "var(--border)", background: "var(--bg2)" }}>
                  <div className="stat-label">Supabase Todos</div>
                  <div className="stat-value">{todos.length}</div>
                  <div className="stat-sub">Fetched from table</div>
                </div>

                <div className="stat-card accent">
                  <div className="stat-label">Total Income</div>
                  <div className="stat-value">{fmt(summary.income)}</div>
                  <div className="stat-sub">{trips.length} trip entries</div>
                </div>
                <div className="stat-card red">
                  <div className="stat-label">Total Expenses</div>
                  <div className="stat-value">{fmt(summary.expense)}</div>
                  <div className="stat-sub">All firm expenses</div>
                </div>
                <div className="stat-card teal">
                  <div className="stat-label">Net Profit</div>
                  <div className="stat-value">{fmt(summary.profit)}</div>
                  <div className="stat-sub">{summary.profit >= 0 ? "✓ Profitable" : "⚠ Loss"}</div>
                </div>
                <div className="stat-card blue">
                  <div className="stat-label">Total Trips</div>
                  <div className="stat-value">{summary.trips}</div>
                  <div className="stat-sub">{trips.length} entries logged</div>
                </div>
              </div>

              <div className="card">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                  <h3 style={{ fontSize: 14 }}>Recent Trip Entries</h3>
                  <button className="btn btn-outline btn-sm" onClick={() => setTab("trips")}>View all</button>
                </div>
                <div className="table-wrap">
                  <table>
                    <thead><tr><th>Date</th><th>Client</th><th>Item</th><th>Trips</th><th>Income</th><th>Profit</th><th>By</th></tr></thead>
                    <tbody>
                      {[...trips].reverse().slice(0, 6).map(t => {
                        const c = store.calcTrip(t);
                        const by = partners.find(p => p.id === t.partnerId);
                        return (
                          <tr key={t.id} style={{ cursor: "pointer" }} onClick={() => setTripDetail(t)}>
                            <td>{t.date}</td>
                            <td className="td-bold">{t.clientName}</td>
                            <td><span className="badge badge-purple">{t.item}</span></td>
                            <td>{t.tripCount}</td>
                            <td className="td-accent">{fmt(c.income)}</td>
                            <td className={c.profit >= 0 ? "td-teal" : "td-red"}>{fmt(c.profit)}</td>
                            <td><span className="badge badge-gray">{by?.name?.split(" ")[0]}</span></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}

        {/* (Rest of UI unchanged; copied from original file) */}
        {tab === "trips" && (
          <>
            <div className="topbar">
              <div>
                <h1 className="page-title">All Trips</h1>
                <p className="page-sub">{trips.length} entries · All partners · Locked after entry</p>
              </div>
              <button className="btn btn-primary" onClick={() => { setModal("trip"); setForm({ partnerId: user.id, date: today() }); }}>
                {Icon.plus} Add Trip
              </button>
            </div>
            <div className="content">
              <div className="card">
                <div className="table-wrap">
                  <table>
                    <thead><tr><th>Date</th><th>Client</th><th>Place</th><th>Item</th><th>Driver</th><th>Vehicle</th><th>Trips</th><th>Rate</th><th>Income</th><th>Expenses</th><th>Profit</th><th>Partner</th><th></th></tr></thead>
                    <tbody>
                      {trips.length === 0 && <tr><td colSpan={13}><div className="empty"><p>No trips yet. Add the first trip.</p></div></td></tr>}
                      {[...trips].reverse().map(t => {
                        const c = store.calcTrip(t);
                        const by = partners.find(p => p.id === t.partnerId);
                        const veh = vehicles.find(v => v.id === t.vehicleId);
                        return (
                          <tr key={t.id}>
                            <td>{t.date}</td>
                            <td className="td-bold">{t.clientName}</td>
                            <td>{t.place}</td>
                            <td><span className="badge badge-purple">{t.item}</span></td>
                            <td>{t.driverName}</td>
                            <td style={{ fontSize: 11 }}>{veh?.number}</td>
                            <td className="td-bold">{t.tripCount}</td>
                            <td>{fmt(t.ratePerTrip)}</td>
                            <td className="td-accent">{fmt(c.income)}</td>
                            <td className="td-red">{fmt(c.totalExp)}</td>
                            <td className={c.profit >= 0 ? "td-teal" : "td-red"}>{fmt(c.profit)}</td>
                            <td><span className="badge badge-gray">{by?.name?.split(" ")[0]}</span></td>
                            <td><button className="btn btn-outline btn-sm" onClick={() => setTripDetail(t)}>Detail</button></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}

        {tab === "expenses" && (
          <>
            <div className="topbar">
              <div>
                <h1 className="page-title">Expense Types</h1>
                <p className="page-sub">Auto-applied to every trip for calculation</p>
              </div>
              <button className="btn btn-primary" onClick={() => { setModal("expense"); setForm({ perTrip: "true" }); }}>
                {Icon.plus} Add Expense
              </button>
            </div>
            <div className="content">
              <div className="card">
                <div className="table-wrap">
                  <table>
                    <thead><tr><th>#</th><th>Expense Label</th></tr></thead>
                    <tbody>
                      {expenses.length === 0 && <tr><td colSpan={2}><div className="empty"><p>No expenses defined yet.</p></div></td></tr>}
                      {expenses.map((e, i) => (
                        <tr key={e.id}>
                          <td className="td-bold">{i + 1}</td>
                          <td className="td-bold">{e.label}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}

        {tab === "vehicles" && (
          <>
            <div className="topbar">
              <div>
                <h1 className="page-title">Vehicles</h1>
                <p className="page-sub">{vehicles.length} registered vehicles</p>
              </div>
              <button className="btn btn-primary" onClick={() => { setModal("vehicle"); setForm({ type: "Dumper" }); }}>
                {Icon.plus} Add Vehicle
              </button>
            </div>
            <div className="content">
              <div className="grid g3">
                {vehicles.length === 0 && <div className="card"><div className="empty"><p>No vehicles yet.</p></div></div>}
                {vehicles.map(v => (
                  <div key={v.id} className="card">
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                      <div style={{ width: 36, height: 36, background: "var(--accent-dim)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent)" }}>{Icon.vehicle}</div>
                      <div>
                        <div style={{ fontWeight: 600, fontFamily: "Syne", fontSize: 14 }}>{v.number}</div>
                        <div style={{ fontSize: 11, color: "var(--text3)" }}>{v.type}</div>
                      </div>
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text3)" }}>
                      Trips: <span style={{ color: "var(--teal)", fontWeight: 500 }}>{trips.filter(t => t.vehicleId === v.id).reduce((s, t) => s + t.tripCount, 0)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {tab === "partners" && (
          <>
            <div className="topbar">
              <div>
                <h1 className="page-title">Partners</h1>
                <p className="page-sub">All partners can see all trip data</p>
              </div>
            </div>
            <div className="content">
              <div className="grid g3">
                {partners.map(p => {
                  const ptrips = trips.filter(t => t.partnerId === p.id);
                  const ptotal = ptrips.reduce((s, t) => s + store.calcTrip(t).income, 0);
                  return (
                    <div key={p.id} className="card" style={{ borderColor: p.id === user.id ? "var(--accent)" : "var(--border)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                        <div style={{ width: 40, height: 40, background: "var(--bg3)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontFamily: "Syne", fontWeight: 700, color: "var(--accent)" }}>
                          {p.name[0]}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontFamily: "Syne", fontSize: 14 }}>{p.name} {p.id === user.id && <span style={{ fontSize: 10, color: "var(--accent)" }}>(You)</span>}</div>
                          <div style={{ fontSize: 11, color: "var(--text3)" }}>{p.mobile}</div>
                        </div>
                      </div>
                      <hr className="divider" />
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                        <div><div style={{ color: "var(--text3)" }}>Entries</div><div style={{ color: "var(--text)", fontWeight: 500 }}>{ptrips.length}</div></div>
                        <div><div style={{ color: "var(--text3)" }}>Trips</div><div style={{ color: "var(--text)", fontWeight: 500 }}>{ptrips.reduce((s, t) => s + t.tripCount, 0)}</div></div>
                        <div><div style={{ color: "var(--text3)" }}>Income</div><div style={{ color: "var(--accent)", fontWeight: 600 }}>{fmt(ptotal)}</div></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {tab === "balance" && (
          <>
            <div className="topbar">
              <div>
                <h1 className="page-title">Balance Sheet</h1>
                <p className="page-sub">Firm-wide financial summary · {firm?.name}</p>
              </div>
            </div>
            <div className="content">
              <div className="grid g3" style={{ marginBottom: 20 }}>
                <div className="stat-card accent">
                  <div className="stat-label">Gross Income</div>
                  <div className="stat-value">{fmt(summary.income)}</div>
                  <div className="stat-sub">From {summary.trips} total trips</div>
                </div>
                <div className="stat-card red">
                  <div className="stat-label">Total Expenses</div>
                  <div className="stat-value">{fmt(summary.expense)}</div>
                  <div className="stat-sub">{expenses.length} expense types applied</div>
                </div>
                <div className="stat-card teal">
                  <div className="stat-label">Net Profit</div>
                  <div className="stat-value">{fmt(summary.profit)}</div>
                  <div className="stat-sub">{summary.income > 0 ? ((summary.profit / summary.income) * 100).toFixed(1) : 0}% margin</div>
                </div>
              </div>

              <div className="grid g2">
                <div className="card">
                  <h3 style={{ fontSize: 14, marginBottom: 14 }}>Income by Client</h3>
                  {(() => {
                    const byClient = {};
                    trips.forEach(t => {
                      const c = store.calcTrip(t);
                      byClient[t.clientName] = (byClient[t.clientName] || 0) + c.income;
                    });
                    return Object.entries(byClient).sort((a, b) => b[1] - a[1]).map(([name, amt]) => (
                      <div key={name} className="exp-row">
                        <span className="er-label">{name}</span>
                        <span className="er-val">{fmt(amt)}</span>
                      </div>
                    ));
                  })()}
                </div>

                <div className="card">
                  <h3 style={{ fontSize: 14, marginBottom: 14 }}>Expense Breakdown</h3>
                  {expenses.map(e => {
                    const total = trips.reduce((s, t) => s + (e.perTrip ? e.amount * t.tripCount : e.amount), 0);
                    return (
                      <div key={e.id} className="exp-row">
                        <span className="er-label">{e.label} <span style={{ fontSize: 10, color: "var(--text3)" }}>({e.perTrip ? "per trip" : "fixed"})</span></span>
                        <span className="er-val" style={{ color: "var(--red)" }}>{fmt(total)}</span>
                      </div>
                    );
                  })}
                  <div className="exp-row" style={{ borderTop: "1px solid var(--border2)", marginTop: 6, paddingTop: 12 }}>
                    <span style={{ fontWeight: 600, color: "var(--text)" }}>Total Expenses</span>
                    <span style={{ color: "var(--red)", fontWeight: 700, fontFamily: "Syne" }}>{fmt(summary.expense)}</span>
                  </div>
                </div>
              </div>

              <div className="card" style={{ marginTop: 16 }}>
                <h3 style={{ fontSize: 14, marginBottom: 14 }}>Partner-wise Contribution</h3>
                <div className="table-wrap">
                  <table>
                    <thead><tr><th>Partner</th><th>Entries</th><th>Trips</th><th>Income Logged</th><th>Expenses</th><th>Profit</th></tr></thead>
                    <tbody>
                      {partners.map(p => {
                        const ptrips = trips.filter(t => t.partnerId === p.id);
                        const inc = ptrips.reduce((s, t) => s + store.calcTrip(t).income, 0);
                        const exp = ptrips.reduce((s, t) => s + store.calcTrip(t).totalExp, 0);
                        const prf = inc - exp;
                        return (
                          <tr key={p.id}>
                            <td className="td-bold">{p.name} {p.id === user.id && <span style={{ fontSize: 10, color: "var(--accent)" }}>(You)</span>}</td>
                            <td>{ptrips.length}</td>
                            <td>{ptrips.reduce((s, t) => s + t.tripCount, 0)}</td>
                            <td className="td-accent">{fmt(inc)}</td>
                            <td className="td-red">{fmt(exp)}</td>
                            <td className={prf >= 0 ? "td-teal" : "td-red"}>{fmt(prf)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── MODALS ── */}
      {modal === "trip" && (
        <Modal title="Add Trip Entry" onClose={() => setModal(null)}
          footer={<><button className="btn btn-outline" onClick={() => setModal(null)}>Cancel</button><button className="btn btn-primary" onClick={submitTrip}>{Icon.lock} Lock & Save</button></>}>
          <div className="form-grid">
            <div className="fg2" style={{ display: "grid", gap: 14, gridTemplateColumns: "1fr 1fr" }}>
              <div><label>Client Name *</label><input placeholder="Client / builder name" value={form.clientName || ""} onChange={e => setForm(p => ({ ...p, clientName: e.target.value }))} /></div>
              <div><label>Date *</label><input type="date" value={form.date || today()} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} /></div>
            </div>
            <div className="fg2" style={{ display: "grid", gap: 14, gridTemplateColumns: "1fr 1fr" }}>
              <div><label>Partner (Entry by) *</label>
                <select value={form.partnerId || ""} onChange={e => setForm(p => ({ ...p, partnerId: e.target.value }))}>
                  <option value="">— Select —</option>
                  {partners.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div><label>Driver Name *</label><input placeholder="Driver's name" value={form.driverName || ""} onChange={e => setForm(p => ({ ...p, driverName: e.target.value }))} /></div>
            </div>
            <div className="fg2" style={{ display: "grid", gap: 14, gridTemplateColumns: "1fr 1fr" }}>
              <div><label>Vehicle *</label>
                <select value={form.vehicleId || ""} onChange={e => setForm(p => ({ ...p, vehicleId: e.target.value }))}>
                  <option value="">— Select Vehicle —</option>
                  {vehicles.map(v => <option key={v.id} value={v.id}>{v.number}</option>)}
                </select>
              </div>
              <div><label>Place / Location *</label><input placeholder="Site or quarry location" value={form.place || ""} onChange={e => setForm(p => ({ ...p, place: e.target.value }))} /></div>
            </div>
            <div className="fg3" style={{ display: "grid", gap: 14, gridTemplateColumns: "1fr 1fr 1fr" }}>
              <div><label>Item *</label>
                <select value={form.item || ""} onChange={e => setForm(p => ({ ...p, item: e.target.value }))}>
                  <option value="">— Select —</option>
                  {ITEMS.map(i => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>
              <div><label>No. of Trips *</label><input type="number" min="1" placeholder="e.g. 4" value={form.tripCount || ""} onChange={e => setForm(p => ({ ...p, tripCount: e.target.value }))} /></div>
              <div><label>Rate per Trip (₹) *</label><input type="number" min="0" placeholder="e.g. 800" value={form.ratePerTrip || ""} onChange={e => setForm(p => ({ ...p, ratePerTrip: e.target.value }))} /></div>
            </div>
            <div><label>Note (optional)</label><input placeholder="Any note for this trip" value={form.note || ""} onChange={e => setForm(p => ({ ...p, note: e.target.value }))} /></div>

            {/* Auto calculation */}
            {(form.tripCount > 0 && form.ratePerTrip > 0) && (
              <div style={{ background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 14 }}>
                <div style={{ fontSize: 11, color: "var(--text3)", textTransform: "uppercase", letterSpacing: ".8px", marginBottom: 10 }}>Auto Calculation</div>
                <div className="exp-row"><span className="er-label">Income ({form.tripCount} trips × {fmt(form.ratePerTrip)})</span><span className="er-val">{fmt(tripIncome)}</span></div>
                {expenses.map(e => (
                  <div key={e.id} className="exp-row" style={{ alignItems: "flex-end" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4, width: "60%" }}>
                      <span className="er-label">– {e.label}</span>
                      <input
                        type="number"
                        min="0"
                        placeholder="Amount"
                        value={form.expenseAmounts?.[e.id] ?? ""}
                        onChange={(ev) => {
                          const val = ev.target.value;
                          setForm(p => ({
                            ...p,
                            expenseAmounts: {
                              ...(p.expenseAmounts || {}),
                              [e.id]: val,
                            },
                          }));
                        }}
                        style={{ padding: '6px 10px' }}
                      />
                    </div>
                    <span style={{ color: "var(--red)", fontSize: 13, fontWeight: 600 }}>
                      {fmt(Number(form.expenseAmounts?.[e.id] || 0))}
                    </span>
                  </div>
                ))}
                <div style={{ borderTop: "1px solid var(--border2)", marginTop: 8, paddingTop: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontWeight: 600, fontSize: 13 }}>Net Profit</span>
                  <span style={{ fontFamily: "Syne", fontWeight: 700, fontSize: 16, color: tripProfit >= 0 ? "var(--teal)" : "var(--red)" }}>{fmt(tripProfit)}</span>
                </div>
                <div style={{ marginTop: 8, fontSize: 11, color: "var(--text3)", display: "flex", alignItems: "center", gap: 4 }}>
                  {Icon.lock} Entries cannot be edited or deleted after saving
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}

      {modal === "vehicle" && (
        <Modal title="Add Vehicle" onClose={() => setModal(null)}
          footer={<><button className="btn btn-outline" onClick={() => setModal(null)}>Cancel</button><button className="btn btn-primary" onClick={submitVehicle}>Add Vehicle</button></>}>
          <div className="form-grid">
            <div><label>Vehicle Number *</label><input placeholder="e.g. RJ-14-GA-1234" value={form.number || ""} onChange={e => setForm(p => ({ ...p, number: e.target.value }))} /></div>
            <div><label>Type</label>
              <select value={form.type || "Dumper"} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
                <option>Dumper</option><option>Truck</option><option>Tipper</option>
              </select>
            </div>
          </div>
        </Modal>
      )}

      {modal === "expense" && (
        <Modal title="Add Expense Type" onClose={() => setModal(null)}
          footer={<><button className="btn btn-outline" onClick={() => setModal(null)}>Cancel</button><button className="btn btn-primary" onClick={submitExpense}>Add Expense</button></>}>
          <div className="form-grid">
            <div><label>Expense Label *</label><input placeholder="e.g. Diesel, Driver Wages" value={form.label || ""} onChange={e => setForm(p => ({ ...p, label: e.target.value }))} /></div>
            <div style={{ fontSize: 11, color: "var(--text3)" }}>
              Expense types are labels only. Amounts are entered per trip.
            </div>
          </div>
        </Modal>
      )}

      {/* Trip Detail Modal */}
      {tripDetail && (() => {
        const c = store.calcTrip(tripDetail);
        const by = partners.find(p => p.id === tripDetail.partnerId);
        const veh = vehicles.find(v => v.id === tripDetail.vehicleId);
        return (
          <Modal title="Trip Detail" onClose={() => setTripDetail(null)}>
            <div style={{ display: "grid", gap: 12 }}>
              <div className="grid g2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {[['Client', tripDetail.clientName], ['Date', tripDetail.date], ['Driver', tripDetail.driverName], ['Vehicle', veh?.number], ['Place', tripDetail.place], ['Item', tripDetail.item], ['No. of Trips', tripDetail.tripCount], ['Rate/Trip', fmt(tripDetail.ratePerTrip)], ['Entered by', by?.name]].map(([k, v]) => (
                  <div key={k} className="card-sm">
                    <div style={{ fontSize: 10, color: "var(--text3)", textTransform: "uppercase", letterSpacing: ".7px" }}>{k}</div>
                    <div style={{ fontWeight: 500, marginTop: 2 }}>{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-sm" style={{ background: "var(--bg3)" }}>
                <div style={{ fontSize: 11, color: "var(--text3)", textTransform: "uppercase", letterSpacing: ".8px", marginBottom: 10 }}>Financial Breakdown</div>
                <div className="exp-row"><span className="er-label">Income</span><span className="er-val">{fmt(c.income)}</span></div>
                {expenses.map(e => (
                  <div key={e.id} className="exp-row">
                    <span className="er-label">– {e.label}</span>
                    <span style={{ color: "var(--red)", fontSize: 13 }}>– {fmt(e.perTrip ? e.amount * tripDetail.tripCount : e.amount)}</span>
                  </div>
                ))}
                <div style={{ borderTop: "1px solid var(--border2)", marginTop: 8, paddingTop: 10, display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontWeight: 600 }}>Net Profit</span>
                  <span style={{ fontFamily: "Syne", fontWeight: 700, color: c.profit >= 0 ? "var(--teal)" : "var(--red)" }}>{fmt(c.profit)}</span>
                </div>
              </div>
              {tripDetail.note && <div className="card-sm"><div style={{ fontSize: 11, color: "var(--text3)" }}>Note</div><div style={{ marginTop: 2 }}>{tripDetail.note}</div></div>}
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text3)", padding: "6px 0" }}>
                {Icon.lock} This entry is locked and cannot be edited or deleted.
              </div>
            </div>
          </Modal>
        );
      })()}
    </div>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────
export default function App() {
  const store = useStore();

  if (!store.currentUser) {
    return <LoginScreen users={store.users} firms={store.firms} onLogin={store.setCurrentUser} />;
  }
  if (store.currentUser.role === "admin") {
    return <AdminPanel store={store} />;
  }
  return <UserPanel store={store} user={store.currentUser} />;
}

