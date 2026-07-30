import { useState, useEffect, useMemo, useRef } from "react";
import { supabase } from "../utils/supabase";
import { dbToApp, appToDb } from "../utils/dataConverter";

// ── Seed Data ─────────────────────────────────────────────────────────────────
const SEED = {
  firms: [],
  users: [],
  vehicles: [],
  expenses: [],
  trips: [],
  transactions: [],
};

const ITEMS = ["Stone", "Concrete", "Pubba", "Bricks", "Soil", "Gravel", "Sand (plain)", "Sand (unplain)"];

const CREDIT_CATEGORIES = ["Client Payment", "Advance Payment", "Refund Received", "Loan Received", "Investment", "Other Income"];
const DEBIT_CATEGORIES = ["Fuel Purchase", "Vehicle Repair", "Driver Salary", "Helper Salary", "Maintenance", "Insurance Payment", "Loan Repayment", "Office Expenses", "Other Expenses"];
const PAYMENT_METHODS = ["Cash", "Bank Transfer", "Cheque", "UPI", "Card", "Other"];

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
.app{display:flex;height:100dvh;overflow:hidden}
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
.btn:disabled{opacity:.6;cursor:not-allowed}
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
.fg2{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.fg3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px}
.veh-row{display:grid;grid-template-columns:1fr 1fr auto;gap:10px;align-items:end}
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
.login-page{min-height:100vh;display:flex;background:var(--bg)}
.login-brand{width:360px;flex-shrink:0;background:var(--bg2);border-right:1px solid var(--border);display:flex;flex-direction:column;padding:48px 36px;position:relative;overflow:hidden}
.login-brand::before{content:'';position:absolute;top:-60px;right:-60px;width:220px;height:220px;border-radius:50%;background:var(--accent);opacity:.04;pointer-events:none}
.login-brand::after{content:'';position:absolute;bottom:-40px;left:-40px;width:160px;height:160px;border-radius:50%;background:var(--teal);opacity:.04;pointer-events:none}
.lb-logo{display:flex;align-items:center;gap:12px;margin-bottom:52px}
.lb-logo-icon{width:40px;height:40px;background:var(--accent);border-radius:9px;display:flex;align-items:center;justify-content:center;color:#0d1117;flex-shrink:0}
.lb-logo-icon svg{width:22px;height:22px}
.lb-logo h2{font-size:18px;font-family:'Syne',sans-serif;font-weight:700;color:var(--text);letter-spacing:-.3px}
.lb-logo p{font-size:10px;color:var(--text3);margin-top:1px}
.lb-tagline{font-size:26px;font-family:'Syne',sans-serif;font-weight:800;color:var(--text);letter-spacing:-.8px;line-height:1.25;margin-bottom:10px}
.lb-tagline span{color:var(--accent)}
.lb-sub{font-size:12.5px;color:var(--text3);margin-bottom:44px;line-height:1.7}
.lb-features{display:flex;flex-direction:column;gap:18px;margin-top:auto}
.lb-feat{display:flex;align-items:center;gap:12px}
.lb-feat-icon{width:34px;height:34px;border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.lb-feat-icon svg{width:15px;height:15px}
.lb-feat-title{font-size:12px;font-weight:600;color:var(--text);font-family:'Syne',sans-serif}
.lb-feat-sub{font-size:10.5px;color:var(--text3);margin-top:1px}
.login-panel{flex:1;display:flex;align-items:center;justify-content:center;padding:40px 48px;overflow-y:auto}
.login-panel-inner{width:100%;max-width:420px}
.lp-heading{font-size:22px;font-family:'Syne',sans-serif;font-weight:700;color:var(--text);margin-bottom:6px}
.lp-sub{font-size:13px;color:var(--text3);margin-bottom:28px}
.lp-admin{width:100%;display:flex;align-items:center;gap:12px;padding:14px 16px;background:var(--accent-dim);border:1px solid var(--accent);border-radius:var(--radius);cursor:pointer;font-family:'DM Sans',sans-serif;transition:all .2s;margin-bottom:6px}
.lp-admin:hover{background:var(--accent);transform:translateY(-1px);box-shadow:0 4px 16px var(--accent-dim)}
.lp-admin-icon{width:34px;height:34px;background:var(--accent);border-radius:7px;display:flex;align-items:center;justify-content:center;color:#0d1117;flex-shrink:0;transition:all .2s}
.lp-admin:hover .lp-admin-icon{background:#0d1117;color:var(--accent)}
.lp-admin-text .t{font-size:14px;font-weight:700;color:var(--accent);font-family:'Syne',sans-serif;transition:color .2s}
.lp-admin:hover .lp-admin-text .t{color:#0d1117}
.lp-admin-text .s{font-size:11px;color:var(--text3);margin-top:1px;transition:color .2s}
.lp-admin:hover .lp-admin-text .s{color:#0d1117;opacity:.7}
.lp-admin-arrow{margin-left:auto;font-size:18px;color:var(--accent);opacity:.5;transition:opacity .2s}
.lp-admin:hover .lp-admin-arrow{opacity:1;color:#0d1117}
.lp-divider{display:flex;align-items:center;gap:10px;margin:20px 0 16px}
.lp-divider hr{flex:1;border:none;border-top:1px solid var(--border);margin:0}
.lp-divider span{font-size:10px;text-transform:uppercase;letter-spacing:.8px;color:var(--text3);white-space:nowrap}
.lp-partners{display:flex;flex-direction:column;gap:7px;max-height:340px;overflow-y:auto;padding-right:2px}
.lp-partners::-webkit-scrollbar{width:4px}
.lp-partners::-webkit-scrollbar-thumb{background:var(--bg4);border-radius:2px}
.lp-card{width:100%;display:flex;align-items:center;gap:12px;padding:11px 14px;background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius);cursor:pointer;transition:all .15s;text-align:left;font-family:'DM Sans',sans-serif}
.lp-card:hover{background:var(--bg3);border-color:var(--border2);transform:translateX(3px)}
.lp-avatar{width:36px;height:36px;background:var(--bg3);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:15px;font-family:'Syne',sans-serif;font-weight:700;color:var(--accent);flex-shrink:0;border:1px solid var(--border)}
.lp-card:hover .lp-avatar{border-color:var(--accent);background:var(--accent-dim)}
.lp-name{font-size:13px;font-weight:600;color:var(--text)}
.lp-meta{font-size:11px;color:var(--text3);margin-top:1px;display:flex;align-items:center;gap:6px}
.lp-firm-dot{width:5px;height:5px;border-radius:50%;background:var(--accent);opacity:.6;display:inline-block}
.lp-mobile-hint{font-size:11px;color:var(--text3);margin-left:auto;font-variant-numeric:tabular-nums}
.lp-arrow{font-size:16px;color:var(--text3);margin-left:6px;transition:color .15s}
.lp-card:hover .lp-arrow{color:var(--accent)}
@media(max-width:768px){
  .login-page{flex-direction:column}
  .login-brand{width:100%;padding:24px 20px;border-right:none;border-bottom:1px solid var(--border)}
  .lb-tagline{font-size:20px}
  .lb-sub,.lb-features{display:none}
  .lb-logo{margin-bottom:0}
  .login-panel{padding:24px 20px;align-items:flex-start}
}

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
  .sidebar-footer{margin-left:auto;padding:8px;border-top:none;border-left:1px solid var(--border)}
  .logout-btn{padding:8px 12px;font-size:11px;white-space:nowrap}
  .main{overflow-y:auto}
  .g2,.g3,.g4{grid-template-columns:1fr}
  .fg2,.fg3{grid-template-columns:1fr;gap:10px}
  .veh-row{grid-template-columns:1fr 1fr}
  .topbar{padding:14px 16px 0;flex-wrap:wrap;gap:10px}
  .page-title{font-size:18px}
  .stat-value{font-size:22px;letter-spacing:-.5px}
  .content{padding:14px 16px 40px}
  .filter-bar{flex-wrap:wrap}
  .filter-bar input,.filter-bar select{min-width:100px;max-width:none;flex:1}
  .overlay{padding:0;align-items:flex-end}
  .modal{max-width:100%;border-radius:var(--radius-lg) var(--radius-lg) 0 0;max-height:92dvh}
  .modal-header{padding:14px 18px 12px}
  .modal-body{padding:14px 18px}
  .modal-footer{padding:10px 18px}
  .card{padding:14px}
}

/* filter bar */
.filter-bar{display:flex;align-items:center;gap:10px;margin-bottom:16px;flex-wrap:wrap}
.filter-bar input,.filter-bar select{width:auto;min-width:120px;max-width:180px;padding:7px 10px;font-size:12px}
.filter-count{font-size:11px;color:var(--text3)}

/* trip cards (mobile) */
.trip-cards{display:none;flex-direction:column;gap:10px}
.trip-card{background:var(--bg3);border:1px solid var(--border);border-radius:var(--radius);padding:14px;cursor:pointer;transition:border-color .15s}
.trip-card:active{border-color:var(--border2)}
.tc-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px}
.tc-date{font-size:11px;color:var(--text3)}
.tc-client{font-size:16px;font-weight:700;font-family:'Syne',sans-serif;color:var(--text);margin-bottom:3px}
.tc-meta{font-size:11px;color:var(--text3);margin-bottom:10px}
.tc-nums{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.tc-num{background:var(--bg2);border-radius:8px;padding:8px 10px}
.tc-num-label{font-size:9px;text-transform:uppercase;letter-spacing:.7px;color:var(--text3);margin-bottom:2px}
.tc-num-val{font-size:15px;font-weight:700;font-family:'Syne',sans-serif}
@media(max-width:768px){
  .trip-table{display:none}
  .trip-cards{display:flex}
}
.emi-tag{display:inline-flex;align-items:center;gap:4px;padding:2px 8px;border-radius:5px;font-size:10px;font-weight:600;letter-spacing:.3px;white-space:nowrap}
.emi-active{background:var(--blue-dim);color:var(--blue)}
.emi-done{background:var(--teal-dim);color:var(--teal)}
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
  wallet: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 010-4h14v4"/><path d="M3 5v14a2 2 0 002 2h16v-5"/><path d="M18 12a2 2 0 000 4h4v-4z"/></svg>,
  arrowUp: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>,
  arrowDown: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>,
  driver: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/><path d="M16 3.5a4 4 0 010 9"/><path d="M20 19c0-3-1.8-5.5-4-6.5"/></svg>,
};

// ── App State ─────────────────────────────────────────────────────────────────
function useStore() {
  const [firms, setFirms] = useState([]);
  const [users, setUsers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [trips, setTrips] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [driverPayments, setDriverPayments] = useState([]);
  const [clients, setClients] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load all data on mount
  useEffect(() => {
    loadAllData();
  }, []);

  async function loadAllData() {
    try {
      setLoading(true);
      
      // Load firms
      const { data: firmsData, error: firmsError } = await supabase
        .from('firms')
        .select('*')
        .order('created_at', { ascending: false });
      if (firmsError) throw firmsError;
      setFirms((firmsData || []).map(dbToApp.firm));

      // Load users
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });
      if (usersError) throw usersError;
      setUsers((usersData || []).map(dbToApp.user));

      // Load vehicles
      const { data: vehiclesData, error: vehiclesError } = await supabase
        .from('vehicles')
        .select('*')
        .order('created_at', { ascending: false });
      if (vehiclesError) throw vehiclesError;
      setVehicles((vehiclesData || []).map(dbToApp.vehicle));

      // Load expenses
      const { data: expensesData, error: expensesError } = await supabase
        .from('expenses')
        .select('*')
        .order('created_at', { ascending: false });
      if (expensesError) throw expensesError;
      setExpenses((expensesData || []).map(dbToApp.expense));

      // Load trips
      const { data: tripsData, error: tripsError } = await supabase
        .from('trips')
        .select('*')
        .order('date', { ascending: false });
      if (tripsError) throw tripsError;
      setTrips((tripsData || []).map(dbToApp.trip));

      // Load transactions
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false });
      if (transactionsError) throw transactionsError;
      setTransactions((transactionsData || []).map(tx => ({
        id: tx.id,
        firmId: tx.firm_id,
        partnerId: tx.partner_id,
        type: tx.type,
        amount: Number(tx.amount),
        category: tx.category,
        description: tx.description,
        date: tx.date,
        referenceNumber: tx.reference_number,
        paymentMethod: tx.payment_method,
      })));

      // Load drivers
      const { data: driversData, error: driversError } = await supabase
        .from('drivers').select('*').order('created_at', { ascending: false });
      if (driversError) throw driversError;
      setDrivers((driversData || []).map(dbToApp.driver));

      // Load driver payments
      const { data: driverPaymentsData, error: driverPaymentsError } = await supabase
        .from('driver_payments').select('*').order('date', { ascending: false });
      if (driverPaymentsError) throw driverPaymentsError;
      setDriverPayments((driverPaymentsData || []).map(dbToApp.driverPayment));

      // Load clients
      const { data: clientsData, error: clientsError } = await supabase
        .from('clients').select('*').order('name', { ascending: true });
      if (clientsError) throw clientsError;
      setClients((clientsData || []).map(dbToApp.client));

    } catch (error) {
      console.error('Error loading data:', error);
      alert('Failed to load data from database. Check console for details.');
    } finally {
      setLoading(false);
    }
  }

  const firmUsers = (firmId) => users.filter(u => u.firmId === firmId);
  const firmVehicles = (firmId) => vehicles.filter(v => v.firmId === firmId);
  const firmExpenses = (firmId) => expenses.filter(e => e.firmId === firmId);
  const firmTrips = (firmId) => trips.filter(t => t.firmId === firmId);
  const firmTransactions = (firmId) => transactions.filter(tx => tx.firmId === firmId);
  const firmDrivers = (firmId) => drivers.filter(d => d.firmId === firmId);
  const firmDriverPayments = (driverId) => driverPayments.filter(p => p.driverId === driverId);
  const firmClients = (firmId) => clients.filter(c => c.firmId === firmId);

  const addFirm = async (name) => {
    try {
      const { data, error } = await supabase
        .from('firms')
        .insert([{ name }])
        .select()
        .single();
      if (error) throw error;
      const newFirm = dbToApp.firm(data);
      setFirms(p => [newFirm, ...p]);
      return newFirm;
    } catch (error) {
      console.error('Error adding firm:', error);
      alert('Failed to add firm');
      throw error;
    }
  };

  const addUser = async (data) => {
    try {
      const { data: dbData, error } = await supabase
        .from('users')
        .insert([appToDb.user(data)])
        .select()
        .single();
      if (error) throw error;
      const newUser = dbToApp.user(dbData);
      setUsers(p => [newUser, ...p]);
      return newUser;
    } catch (error) {
      console.error('Error adding user:', error);
      alert('Failed to add user');
      throw error;
    }
  };

  const updateUserPin = async (userId, pin) => {
    try {
      const { error } = await supabase.from('users').update({ pin }).eq('id', userId);
      if (error) throw error;
      setUsers(p => p.map(u => u.id === userId ? { ...u, pin } : u));
    } catch (error) {
      console.error('Error updating PIN:', error);
      alert('Failed to update PIN');
      throw error;
    }
  };

  const addVehicle = async (data) => {
    try {
      const { data: dbData, error } = await supabase
        .from('vehicles')
        .insert([appToDb.vehicle(data)])
        .select()
        .single();
      if (error) throw error;
      const newVehicle = dbToApp.vehicle(dbData);
      setVehicles(p => [newVehicle, ...p]);
    } catch (error) {
      console.error('Error adding vehicle:', error);
      alert('Failed to add vehicle');
      throw error;
    }
  };

  const updateVehicle = async (id, data) => {
    try {
      const { data: dbData, error } = await supabase
        .from('vehicles')
        .update(appToDb.vehicle(data))
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      const updated = dbToApp.vehicle(dbData);
      setVehicles(p => p.map(v => v.id === id ? updated : v));
    } catch (error) {
      console.error('Error updating vehicle:', error);
      alert('Failed to update vehicle');
      throw error;
    }
  };

  const addExpense = async (data) => {
    try {
      const { data: dbData, error } = await supabase
        .from('expenses')
        .insert([appToDb.expense(data)])
        .select()
        .single();
      if (error) throw error;
      const newExpense = dbToApp.expense(dbData);
      setExpenses(p => [newExpense, ...p]);
    } catch (error) {
      console.error('Error adding expense:', error);
      alert('Failed to add expense');
      throw error;
    }
  };

  const addTrip = async (data) => {
    try {
      const { data: dbData, error } = await supabase
        .from('trips')
        .insert([appToDb.trip(data)])
        .select()
        .single();
      if (error) throw error;
      const newTrip = dbToApp.trip(dbData);
      setTrips(p => [newTrip, ...p]);
    } catch (error) {
      console.error('Error adding trip:', error);
      alert('Failed to add trip');
      throw error;
    }
  };

  const updateTripProfit = async (tripId, newProfit) => {
    try {
      const { error } = await supabase
        .from('trips')
        .update({ edited_profit: newProfit })
        .eq('id', tripId)
        .select();
      if (error) throw error;
      setTrips(p => p.map(t => t.id === tripId ? { ...t, editedProfit: newProfit } : t));
    } catch (error) {
      console.error('Error updating trip profit:', error);
      alert('Failed to update profit: ' + (error?.message || JSON.stringify(error)));
      throw error;
    }
  };

  const updateClientPaid = async (tripId, amount) => {
    try {
      const { error } = await supabase
        .from('trips')
        .update({ client_paid: amount })
        .eq('id', tripId)
        .select();
      if (error) throw error;
      setTrips(p => p.map(t => t.id === tripId ? { ...t, clientPaid: amount } : t));
    } catch (error) {
      console.error('Error updating client paid:', error);
      alert('Failed to update payment: ' + (error?.message || JSON.stringify(error)));
      throw error;
    }
  };

  const addTransaction = async (data) => {
    try {
      const { data: dbData, error } = await supabase
        .from('transactions')
        .insert([{
          firm_id: data.firmId,
          partner_id: data.partnerId,
          type: data.type,
          amount: data.amount,
          category: data.category,
          description: data.description || '',
          date: data.date,
          reference_number: data.referenceNumber || '',
          payment_method: data.paymentMethod || '',
        }])
        .select()
        .single();
      if (error) throw error;
      const newTx = {
        id: dbData.id,
        firmId: dbData.firm_id,
        partnerId: dbData.partner_id,
        type: dbData.type,
        amount: Number(dbData.amount),
        category: dbData.category,
        description: dbData.description,
        date: dbData.date,
        referenceNumber: dbData.reference_number,
        paymentMethod: dbData.payment_method,
      };
      setTransactions(p => [newTx, ...p]);
    } catch (error) {
      console.error('Error adding transaction:', error);
      alert('Failed to add transaction');
      throw error;
    }
  };

  const addClient = async (data) => {
    try {
      const { data: dbData, error } = await supabase
        .from('clients').insert([appToDb.client(data)]).select().single();
      if (error) throw error;
      const newClient = dbToApp.client(dbData);
      setClients(p => [...p, newClient].sort((a, b) => a.name.localeCompare(b.name)));
      return newClient;
    } catch (error) {
      console.error('Error adding client:', error);
      alert('Failed to add client');
      throw error;
    }
  };

  const updateClient = async (id, data) => {
    try {
      const { data: dbData, error } = await supabase
        .from('clients').update(appToDb.client(data)).eq('id', id).select().single();
      if (error) throw error;
      const updated = dbToApp.client(dbData);
      setClients(p => p.map(c => c.id === id ? updated : c));
    } catch (error) {
      console.error('Error updating client:', error);
      alert('Failed to update client');
      throw error;
    }
  };

  const addDriver = async (data) => {
    try {
      const { data: dbData, error } = await supabase
        .from('drivers').insert([appToDb.driver(data)]).select().single();
      if (error) throw error;
      const newDriver = dbToApp.driver(dbData);
      setDrivers(p => [newDriver, ...p]);
      return newDriver;
    } catch (error) {
      console.error('Error adding driver:', error);
      alert('Failed to add driver');
      throw error;
    }
  };

  const updateDriver = async (id, data) => {
    try {
      const { data: dbData, error } = await supabase
        .from('drivers').update(appToDb.driver(data)).eq('id', id).select().single();
      if (error) throw error;
      const updated = dbToApp.driver(dbData);
      setDrivers(p => p.map(d => d.id === id ? updated : d));
      return updated;
    } catch (error) {
      console.error('Error updating driver:', error);
      alert('Failed to update driver');
      throw error;
    }
  };

  const addDriverPayment = async (data) => {
    try {
      const { data: dbData, error } = await supabase
        .from('driver_payments').insert([appToDb.driverPayment(data)]).select().single();
      if (error) throw error;
      const newPayment = dbToApp.driverPayment(dbData);
      setDriverPayments(p => [newPayment, ...p]);
      return newPayment;
    } catch (error) {
      console.error('Error adding driver payment:', error);
      alert('Failed to record payment');
      throw error;
    }
  };

  // Calculate totals for a trip
  const calcTrip = (trip) => {
    const income = trip.ratePerTrip * trip.tripCount;
    const calculatedProfit = income;
    const profit = trip.editedProfit !== undefined ? trip.editedProfit : calculatedProfit;
    const clientPaid = trip.clientPaid || 0;
    const pending = income - clientPaid;
    return { income, profit, calculatedProfit, clientPaid, pending };
  };

  // Firm summary
  const firmSummary = (firmId) => {
    const ftrips = firmTrips(firmId);
    const ftransactions = firmTransactions(firmId);
    const firmDriverIds = drivers.filter(d => d.firmId === firmId).map(d => d.id);
    const driverPaymentsPaid = driverPayments
      .filter(p => firmDriverIds.includes(p.driverId))
      .reduce((s, p) => s + p.amount, 0);

    const tripSummary = ftrips.reduce((acc, t) => {
      const c = calcTrip(t);
      acc.income += c.income;
      acc.profit += c.profit;
      acc.trips += t.tripCount;
      acc.totalPending += c.pending;
      return acc;
    }, { income: 0, profit: 0, trips: 0, totalPending: 0 });

    const transactionSummary = ftransactions.reduce((acc, tx) => {
      if (tx.type === 'credit') {
        acc.credits += tx.amount;
      } else {
        acc.debits += tx.amount;
      }
      return acc;
    }, { credits: 0, debits: 0 });

    return {
      ...tripSummary,
      driverPaymentsPaid,
      netProfit: tripSummary.profit - driverPaymentsPaid,
      credits: transactionSummary.credits,
      debits: transactionSummary.debits,
      netBalance: transactionSummary.credits - transactionSummary.debits,
      totalIncome: tripSummary.income + transactionSummary.credits,
    };
  };

  const resetAllData = async () => {
    try {
      await supabase.from('trips').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('transactions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('expenses').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('vehicles').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('driver_payments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('drivers').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('clients').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('users').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('firms').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      setFirms([]); setUsers([]); setVehicles([]);
      setExpenses([]); setTrips([]); setTransactions([]);
      setDrivers([]); setDriverPayments([]); setClients([]);
    } catch (error) {
      console.error('Error resetting data:', error);
      alert('Failed to reset data: ' + error.message);
      throw error;
    }
  };

  return {
    firms, users, vehicles, expenses, trips, transactions, drivers, driverPayments, clients, currentUser, setCurrentUser, loading,

    firmUsers, firmVehicles, firmExpenses, firmTrips, firmTransactions, firmDrivers, firmDriverPayments, firmClients,
    addFirm, addUser, updateUserPin, addVehicle, updateVehicle, addExpense, addTrip, updateTripProfit, updateClientPaid, addTransaction, addDriver, updateDriver, addDriverPayment, addClient, updateClient,
    calcTrip, firmSummary, resetAllData,
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

function monthLabel(monthStr) {
  const [y, m] = monthStr.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("en-IN", { month: "long", year: "numeric" });
}

function calcEmi(v) {
  if (!v.emiAmount || !v.emiStartDate || !v.emiTenureMonths) return null;
  const start = new Date(v.emiStartDate);
  const now = new Date();
  const elapsed = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
  const remaining = Math.max(0, v.emiTenureMonths - elapsed);
  return { monthly: v.emiAmount, remaining, total: remaining * v.emiAmount, done: remaining === 0 };
}

// ── Login Screen ──────────────────────────────────────────────────────────────
function LoginScreen({ users, firms, onLogin }) {
  const [firmFilter, setFirmFilter] = useState("all");
  const [pinFor, setPinFor] = useState(null);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const visible = firmFilter === "all" ? users : users.filter(u => u.firmId === firmFilter);

  const handleCardClick = (u) => {
    if (!u.pin) { onLogin(u); return; }
    setPinFor(u);
    setPinInput('');
    setPinError(false);
  };

  const handlePinChange = (u, val) => {
    const digits = val.replace(/\D/g, '').slice(0, 4);
    setPinInput(digits);
    setPinError(false);
    if (digits.length === 4) {
      if (digits === u.pin) { onLogin(u); }
      else { setPinError(true); setTimeout(() => { setPinInput(''); setPinError(false); }, 900); }
    }
  };

  return (
    <div className="login-page">
      <style>{style}</style>

      {/* ── Left brand panel ── */}
      <div className="login-brand">
        <div className="lb-logo">
          <div className="lb-logo-icon">{Icon.truck}</div>
          <div>
            <h2>DumperTrack</h2>
            <p>Fleet & Finance Management</p>
          </div>
        </div>

        <div className="lb-tagline">Every trip.<br />Every rupee.<br /><span>Always in control.</span></div>
        <p className="lb-sub">
          One app to manage trips, expenses, vehicles,<br />
          EMI loans, and partner finances — all in real time.
        </p>

        <div className="lb-features">
          {[
            { icon: Icon.trips,   bg: "var(--accent-dim)",  color: "var(--accent)",  title: "Trip Management",    sub: "Log & lock every trip entry" },
            { icon: Icon.balance, bg: "var(--teal-dim)",    color: "var(--teal)",    title: "Financial Reports",  sub: "Income, expenses & profit" },
            { icon: Icon.vehicle, bg: "var(--blue-dim)",    color: "var(--blue)",    title: "Fleet & EMI",        sub: "Vehicles, loans & EMI tracking" },
            { icon: Icon.wallet,  bg: "var(--purple-dim)",  color: "var(--purple)",  title: "Credit & Debit",     sub: "Full transaction history" },
          ].map(f => (
            <div key={f.title} className="lb-feat">
              <div className="lb-feat-icon" style={{ background: f.bg, color: f.color }}>{f.icon}</div>
              <div>
                <div className="lb-feat-title">{f.title}</div>
                <div className="lb-feat-sub">{f.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right login panel ── */}
      <div className="login-panel">
        <div className="login-panel-inner">
          <div className="lp-heading">Welcome back</div>
          <div className="lp-sub">Select your profile to continue</div>

          {/* Admin access */}
          <button className="lp-admin" onClick={() => onLogin({ id: "admin", name: "Admin", role: "admin" })}>
            <div className="lp-admin-icon">{Icon.admin}</div>
            <div className="lp-admin-text">
              <div className="t">Admin Panel</div>
              <div className="s">Manage firms & partners</div>
            </div>
            <div className="lp-admin-arrow">›</div>
          </button>

          <div className="lp-divider">
            <hr /><span>Partners</span><hr />
          </div>

          {/* Firm filter — only shown when multiple firms exist */}
          {firms.length > 1 && (
            <div style={{ marginBottom: 12 }}>
              <select value={firmFilter} onChange={e => setFirmFilter(e.target.value)} style={{ width: "100%", fontSize: 12 }}>
                <option value="all">All Firms</option>
                {firms.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
            </div>
          )}

          {/* Partner cards */}
          <div className="lp-partners">
            {visible.length === 0 && (
              <div className="empty" style={{ padding: "28px 0" }}>
                <p>No partners yet. Use Admin Panel to add partners.</p>
              </div>
            )}
            {visible.map(u => {
              const firm = firms.find(f => f.id === u.firmId);
              const isEnteringPin = pinFor?.id === u.id;
              return (
                <div key={u.id} style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                  <button className="lp-card" onClick={() => handleCardClick(u)} style={{ borderBottomLeftRadius: isEnteringPin ? 0 : undefined, borderBottomRightRadius: isEnteringPin ? 0 : undefined }}>
                    <div className="lp-avatar">{u.name[0].toUpperCase()}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="lp-name">{u.name}</div>
                      <div className="lp-meta">
                        <span className="lp-firm-dot" />
                        <span>{firm?.name}</span>
                      </div>
                    </div>
                    {u.mobile && <div className="lp-mobile-hint">{u.mobile}</div>}
                    {u.pin ? <div style={{ fontSize: 14, opacity: 0.6 }}>🔒</div> : <div className="lp-arrow">›</div>}
                  </button>
                  {isEnteringPin && (
                    <div style={{ background: "var(--bg3)", border: "1px solid var(--border)", borderTop: "none", borderBottomLeftRadius: "var(--radius)", borderBottomRightRadius: "var(--radius)", padding: "10px 14px", display: "flex", gap: 8, alignItems: "center" }}>
                      <input
                        type="password"
                        inputMode="numeric"
                        maxLength={4}
                        placeholder="Enter PIN"
                        value={pinInput}
                        autoFocus
                        onChange={e => handlePinChange(u, e.target.value)}
                        style={{ flex: 1, letterSpacing: "0.4em", textAlign: "center", borderColor: pinError ? "var(--red)" : undefined, transition: "border-color 0.2s" }}
                      />
                      <button className="btn btn-outline btn-sm" onClick={() => { setPinFor(null); setPinInput(''); setPinError(false); }}>Cancel</button>
                    </div>
                  )}
                  {isEnteringPin && pinError && (
                    <div style={{ fontSize: 11, color: "var(--red)", textAlign: "center", marginTop: 4 }}>Wrong PIN. Try again.</div>
                  )}
                </div>
              );
            })}
          </div>}

          <div style={{ marginTop: 24, textAlign: "center", fontSize: 11, color: "var(--text3)", lineHeight: 1.6 }}>
            Design &amp; Developed by{" "}
            <a href="https://www.Karnveer.com" target="_blank" rel="noopener noreferrer"
              style={{ color: "var(--accent)", fontWeight: 600, textDecoration: "none" }}>
              Karnveer Singh
            </a>
            {" · "}
            <a href="https://www.Karnveer.com" target="_blank" rel="noopener noreferrer"
              style={{ color: "var(--text3)", textDecoration: "none" }}>
              www.Karnveer.com
            </a>
          </div>
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
  const [resetConfirm, setResetConfirm] = useState("");
  const [resetting, setResetting] = useState(false);
  const [pinEdit, setPinEdit] = useState(null);
  const [pinVal, setPinVal] = useState('');
  const [pinSaving, setPinSaving] = useState(false);

  const handleReset = async () => {
    if (resetConfirm !== "RESET") return;
    setResetting(true);
    try {
      await store.resetAllData();
      setModal(null); setResetConfirm("");
    } finally {
      setResetting(false);
    }
  };

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
    if (!form.name?.trim() || !form.firmId) return;
    store.addUser({ name: form.name.trim(), mobile: form.mobile?.trim() || "", firmId: form.firmId });
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
          <button className="btn btn-danger btn-sm" style={{ width: "100%", marginBottom: 8, justifyContent: "center" }} onClick={() => { setModal("reset"); setResetConfirm(""); }}>
            ⚠ Reset All Data
          </button>
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

          {tab === "users" && (() => {
            const savePin = async (u) => {
              if (pinVal.length > 0 && pinVal.length !== 4) { alert('PIN must be exactly 4 digits'); return; }
              setPinSaving(true);
              try {
                await store.updateUserPin(u.id, pinVal);
                setPinEdit(null);
                setPinVal('');
              } catch (_) {} finally { setPinSaving(false); }
            };
            return (
              <div className="grid g2" style={{ gap: 12 }}>
                {store.users.map(u => {
                  const firm = store.firms.find(f => f.id === u.firmId);
                  const isEditing = pinEdit === u.id;
                  return (
                    <div key={u.id} className="card-sm" style={{ background: "var(--bg2)", border: "1px solid var(--border)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                        <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--accent-dim)", color: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontFamily: "Syne", flexShrink: 0 }}>
                          {u.name[0].toUpperCase()}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 600, fontSize: 13 }}>{u.name}</div>
                          <div style={{ fontSize: 11, color: "var(--text3)" }}>{u.mobile || '—'} · {firm?.name}</div>
                        </div>
                        {u.pin ? (
                          <span className="badge badge-teal" style={{ fontSize: 10 }}>PIN set</span>
                        ) : (
                          <span className="badge badge-gray" style={{ fontSize: 10 }}>No PIN</span>
                        )}
                      </div>
                      {isEditing ? (
                        <div style={{ display: "flex", gap: 6, alignItems: "center", marginTop: 4 }}>
                          <input
                            type="password"
                            inputMode="numeric"
                            maxLength={4}
                            placeholder="4-digit PIN"
                            value={pinVal}
                            autoFocus
                            onChange={e => setPinVal(e.target.value.replace(/\D/g, '').slice(0, 4))}
                            onKeyDown={e => { if (e.key === 'Enter') savePin(u); if (e.key === 'Escape') { setPinEdit(null); setPinVal(''); } }}
                            style={{ flex: 1, letterSpacing: "0.3em", textAlign: "center" }}
                          />
                          <button className="btn btn-primary btn-sm" onClick={() => savePin(u)} disabled={pinSaving}>Save</button>
                          {u.pin && <button className="btn btn-outline btn-sm" style={{ color: "var(--red)" }} onClick={async () => { setPinSaving(true); try { await store.updateUserPin(u.id, ''); setPinEdit(null); setPinVal(''); } catch (_) {} finally { setPinSaving(false); } }}>Clear</button>}
                          <button className="btn btn-outline btn-sm" onClick={() => { setPinEdit(null); setPinVal(''); }}>✕</button>
                        </div>
                      ) : (
                        <button className="btn btn-outline btn-sm" style={{ width: "100%", justifyContent: "center", marginTop: 4 }}
                          onClick={() => { setPinEdit(u.id); setPinVal(''); }}>
                          {u.pin ? 'Change PIN' : 'Set PIN'}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })()}
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
            <div><label>Full Name *</label><input placeholder="Partner name" value={form.name || ""} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
            <div><label>Mobile Number</label><input placeholder="10-digit mobile (optional)" value={form.mobile || ""} onChange={e => setForm(p => ({ ...p, mobile: e.target.value }))} /></div>
            <div><label>Assign to Firm *</label>
              <select value={form.firmId || ""} onChange={e => setForm(p => ({ ...p, firmId: e.target.value }))}>
                <option value="">— Select Firm —</option>
                {store.firms.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
            </div>
          </div>
        </Modal>
      )}

      {modal === "reset" && (
        <Modal title="Reset All Data" onClose={() => { setModal(null); setResetConfirm(""); }}
          footer={
            <>
              <button className="btn btn-outline" onClick={() => { setModal(null); setResetConfirm(""); }}>Cancel</button>
              <button className="btn btn-danger" onClick={handleReset} disabled={resetConfirm !== "RESET" || resetting}>
                {resetting ? "Deleting…" : "Delete Everything"}
              </button>
            </>
          }>
          <div className="form-grid">
            <div style={{ background: "var(--red-dim)", border: "1px solid var(--red)", borderRadius: "var(--radius)", padding: 14, fontSize: 13 }}>
              <div style={{ fontWeight: 600, color: "var(--red)", marginBottom: 6 }}>⚠ This cannot be undone</div>
              <div style={{ color: "var(--text2)", lineHeight: 1.6 }}>
                All trips, transactions, expenses, vehicles, partners, and firms will be permanently deleted for all users.
              </div>
            </div>
            <div>
              <label>Type <strong style={{ color: "var(--red)", fontFamily: "monospace" }}>RESET</strong> to confirm</label>
              <input placeholder="RESET" value={resetConfirm} onChange={e => setResetConfirm(e.target.value)} style={{ borderColor: resetConfirm === "RESET" ? "var(--red)" : "" }} />
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
  const [submitting, setSubmitting] = useState(false);
  const [tripDetail, setTripDetail] = useState(null);
  const [driverDetail, setDriverDetail] = useState(null);
  const [driverDetailFilter, setDriverDetailFilter] = useState({ dateFrom: '', dateTo: '' });
  const [driverSearch, setDriverSearch] = useState('');
  const [driverTripLogFilter, setDriverTripLogFilter] = useState({ dateFrom: '', dateTo: '' });
  const [clientDetail, setClientDetail] = useState(null);
  const [editingProfit, setEditingProfit] = useState(false);
  const [editedProfitValue, setEditedProfitValue] = useState("");
  const [editingClientPaid, setEditingClientPaid] = useState(false);
  const [clientPaidValue, setClientPaidValue] = useState("");
  const [tripFilter, setTripFilter] = useState({ client: "", partner: "", vehicle: "", dateFrom: "", dateTo: "" });
  const [txFilter, setTxFilter] = useState({ type: "all", partner: "", dateFrom: "", dateTo: "" });
  const [vehFilter, setVehFilter] = useState({ type: "all", emi: "all" });
  const [expCatFilter, setExpCatFilter] = useState("all");
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const swipeLocked = useRef(false);

  const firm = store.firms.find(f => f.id === user.firmId);
  const partners = store.firmUsers(user.firmId);
  const vehicles = store.firmVehicles(user.firmId);
  const expenses = store.firmExpenses(user.firmId);
  const trips = store.firmTrips(user.firmId);
  const transactions = store.firmTransactions(user.firmId);
  const drivers = store.firmDrivers(user.firmId);
  const clients = store.firmClients(user.firmId);
  const summary = store.firmSummary(user.firmId);

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: Icon.dashboard },
    { id: "trips", label: "Trips", icon: Icon.trips },
    { id: "clients", label: "Clients", icon: Icon.people },
    { id: "transactions", label: "Credit/Debit", icon: Icon.wallet },
    { id: "expenses", label: "Expenses", icon: Icon.expense },
    { id: "vehicles", label: "Vehicles", icon: Icon.vehicle },
    { id: "drivers", label: "Drivers", icon: Icon.driver },
    { id: "partners", label: "Partners", icon: Icon.people },
    { id: "balance", label: "Balance", icon: Icon.balance },
  ];

  const tabIds = navItems.map(n => n.id);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    // Lock if the finger starts inside any horizontally-scrollable element
    let el = e.target;
    while (el && el !== e.currentTarget) {
      if (el.scrollWidth > el.clientWidth + 2) { swipeLocked.current = true; return; }
      el = el.parentElement;
    }
    swipeLocked.current = false;
  };

  const handleTouchMove = (e) => {
    if (swipeLocked.current) return;
    const dx = Math.abs(e.touches[0].clientX - touchStartX.current);
    const dy = Math.abs(e.touches[0].clientY - touchStartY.current);
    if (dy > 8 && dy >= dx) swipeLocked.current = true;
  };

  const handleTouchEnd = (e) => {
    if (swipeLocked.current) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    if (Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
    const idx = tabIds.indexOf(tab);
    if (dx < 0 && idx < tabIds.length - 1) setTab(tabIds[idx + 1]);
    if (dx > 0 && idx > 0) setTab(tabIds[idx - 1]);
  };

  // Trip form auto-calculation
  const tripIncome = (form.ratePerTrip || 0) * (form.tripCount || 0);

  const submitTrip = () => {
    const selectedClient = clients.find(c => c.id === form.clientId);
    const resolvedClientName = selectedClient ? selectedClient.name : (form.clientName?.trim() || "");

    const selectedDriver = drivers.find(d => d.id === form.driverId);
    const resolvedDriverName = selectedDriver ? selectedDriver.name : (form.driverName?.trim() || "");
    const resolvedDriverId = selectedDriver ? selectedDriver.id : null;
    const isPerTripDriver = selectedDriver?.salaryType === "per_trip";

    if (
      !resolvedClientName ||
      !form.partnerId ||
      !form.vehicleId ||
      !resolvedDriverName ||
      !form.place?.trim() ||
      !form.item ||
      !form.tripCount ||
      !form.ratePerTrip
    ) return alert("Fill all required fields.");

    if (isPerTripDriver && (!form.driverTripRate || Number(form.driverTripRate) <= 0)) {
      return alert("Enter the driver's rate per trip.");
    }

    store.addTrip({
      firmId: user.firmId,
      clientName: resolvedClientName,
      partnerId: form.partnerId,
      driverId: resolvedDriverId,
      driverName: resolvedDriverName,
      driverTripRate: isPerTripDriver ? Number(form.driverTripRate) : 0,
      vehicleId: form.vehicleId,
      place: form.place,
      item: form.item,
      tripCount: Number(form.tripCount),
      ratePerTrip: Number(form.ratePerTrip),
      date: form.date || today(),
      note: form.note || "",
      expenses: {},
    });
    setModal(null);
    setForm({});
  };

  const submitVehicle = async () => {
    const rows = (form.vehicleRows || []).filter(r => r.number?.trim());
    if (!rows.length) return;
    await Promise.all(rows.map(r => store.addVehicle({
      firmId: user.firmId,
      number: r.number.trim(),
      type: r.type || "Dumper",
      emiAmount: 0, emiStartDate: null, emiTenureMonths: 0, emiDescription: "",
    })));
    setModal(null); setForm({});
  };

  const submitEditVehicle = async () => {
    if (!form.id || !form.number?.trim()) return;
    await store.updateVehicle(form.id, {
      firmId: user.firmId,
      number: form.number.trim(),
      type: form.type || "Dumper",
      emiAmount: Number(form.emiAmount) || 0,
      emiStartDate: form.emiStartDate || null,
      emiTenureMonths: Number(form.emiTenureMonths) || 0,
      emiDescription: form.emiDescription?.trim() || "",
    });
    setModal(null); setForm({});
  };

  const submitExpense = async () => {
    const rows = (form.expenseRows || []).filter(r => r.label?.trim());
    if (!rows.length) return;
    await Promise.all(rows.map(r => store.addExpense({ firmId: user.firmId, label: r.label.trim(), amount: 0, perTrip: true })));
    setModal(null); setForm({});
  };

  // Apply a client payment FIFO across that client's oldest pending trips first
  const distributeClientPayment = async (clientName, amount) => {
    const pendingTrips = trips
      .filter(t => t.clientName.toLowerCase() === clientName.toLowerCase() && store.calcTrip(t).pending > 0)
      .sort((a, b) => a.date.localeCompare(b.date));
    let remaining = amount;
    for (const trip of pendingTrips) {
      if (remaining <= 0) break;
      const c = store.calcTrip(trip);
      const toApply = Math.min(remaining, c.pending);
      await store.updateClientPaid(trip.id, c.clientPaid + toApply);
      remaining -= toApply;
    }
  };

  const submitTransaction = async () => {
    if (!form.type || !form.amount || !form.category?.trim() || !form.date) {
      return alert("Fill all required fields.");
    }
    if (submitting) return;
    setSubmitting(true);
    try {
      await store.addTransaction({
        firmId: user.firmId,
        partnerId: form.partnerId || user.id,
        type: form.type,
        amount: Number(form.amount),
        category: form.category.trim(),
        description: form.description?.trim() || "",
        date: form.date,
        referenceNumber: form.referenceNumber?.trim() || "",
        paymentMethod: form.paymentMethod || "",
      });
      // If Debit + Driver Salary + specific driver selected, also record in driver_payments
      const realDriver = form.driverPickId && form.driverPickId !== "__manual__"
        ? drivers.find(d => d.id === form.driverPickId) : null;
      if (form.type === "debit" && form.category === "Driver Salary" && realDriver) {
        await store.addDriverPayment({
          driverId: realDriver.id,
          firmId: user.firmId,
          amount: Number(form.amount),
          note: form.description?.trim() || "",
          date: form.date,
          month: form.date.slice(0, 7),
          recordedBy: user.id,
        });
      }
      // If Credit + Client Payment + specific client selected, apply payment to their pending trips
      const realClient = form.clientPickId && form.clientPickId !== "__manual__"
        ? clients.find(c => c.id === form.clientPickId) : null;
      if (form.type === "credit" && form.category === "Client Payment" && realClient) {
        await distributeClientPayment(realClient.name, Number(form.amount));
      }
      setModal(null);
      setForm({});
    } finally {
      setSubmitting(false);
    }
  };

  const submitDriver = async () => {
    if (!form.name?.trim()) return alert("Driver name is required.");
    const data = {
      firmId: user.firmId,
      name: form.name.trim(),
      mobile: form.mobile?.trim() || "",
      salaryType: form.salaryType || "per_trip",
      salaryAmount: Number(form.salaryAmount) || 0,
    };
    if (form.editDriverId) {
      await store.updateDriver(form.editDriverId, data);
    } else {
      await store.addDriver(data);
    }
    setModal(null);
    setForm({});
  };

  const submitDriverPayment = async () => {
    if (!form.amount || Number(form.amount) <= 0) return alert("Enter a valid payment amount.");
    if (!form.driverPaymentId) return;
    if (submitting) return;
    setSubmitting(true);
    try {
      const date = form.date || today();
      const drv = drivers.find(d => d.id === form.driverPaymentId);
      await store.addDriverPayment({
        driverId: form.driverPaymentId,
        firmId: user.firmId,
        amount: Number(form.amount),
        note: form.note?.trim() || "",
        date,
        month: date.slice(0, 7),
        recordedBy: user.id,
      });
      // Mirror as a debit transaction so it appears in Credit/Debit tab
      await store.addTransaction({
        firmId: user.firmId,
        partnerId: user.id,
        type: "debit",
        amount: Number(form.amount),
        category: "Driver Salary",
        description: drv ? drv.name + (form.note?.trim() ? " · " + form.note.trim() : "") : (form.note?.trim() || ""),
        date,
        referenceNumber: "",
        paymentMethod: "",
      });
      setModal(null);
      setForm({});
    } finally {
      setSubmitting(false);
    }
  };

  const submitClient = async () => {
    if (!form.name?.trim()) return alert("Client name is required.");
    if (form.editClientId) {
      await store.updateClient(form.editClientId, { firmId: user.firmId, name: form.name.trim(), mobile: form.mobile?.trim() || "", address: form.address?.trim() || "", notes: form.notes?.trim() || "" });
    } else {
      await store.addClient({ firmId: user.firmId, name: form.name.trim(), mobile: form.mobile?.trim() || "", address: form.address?.trim() || "", notes: form.notes?.trim() || "" });
    }
    setModal(null);
    setForm({});
  };

  const submitClientPayment = async () => {
    const amount = Number(form.clientPaymentAmount);
    if (!amount || amount <= 0) return alert("Enter a valid payment amount.");
    const hasPending = (form.clientPaymentTrips || []).some(t => store.calcTrip(t).pending > 0);
    if (!hasPending) return alert("No pending amount for this client.");
    await distributeClientPayment(form.clientPaymentName, amount);
    setModal(null);
    setForm({});
  };

  const importClientsFromTrips = async () => {
    const existingNames = new Set(clients.map(c => c.name.toLowerCase().trim()));
    const toImport = [...new Set(trips.map(t => t.clientName.trim()))].filter(n => !existingNames.has(n.toLowerCase()));
    if (!toImport.length) return alert("All trip clients are already in your clients list.");
    await Promise.all(toImport.map(name => store.addClient({ firmId: user.firmId, name, mobile: "", address: "", notes: "" })));
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

      <div className="main" onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
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
                <div className="stat-card accent">
                  <div className="stat-label">Total Income</div>
                  <div className="stat-value">{fmt(summary.income)}</div>
                  <div className="stat-sub">{trips.length} trip entries</div>
                </div>
                <div className="stat-card red">
                  <div className="stat-label">Pending Payments</div>
                  <div className="stat-value">{fmt(summary.totalPending)}</div>
                  <div className="stat-sub">Uncollected from clients</div>
                </div>
                <div className="stat-card teal">
                  <div className="stat-label">My Net Profit</div>
                  <div className="stat-value">{(() => {
                    const myTrips = trips.filter(t => t.partnerId === user.id);
                    const myTripProfit = myTrips.reduce((s, t) => s + store.calcTrip(t).profit, 0);
                    const myTx = transactions.filter(tx => tx.partnerId === user.id);
                    const myCredits = myTx.filter(tx => tx.type === 'credit').reduce((s, tx) => s + tx.amount, 0);
                    const myDebits = myTx.filter(tx => tx.type === 'debit').reduce((s, tx) => s + tx.amount, 0);
                    return fmt(myTripProfit + myCredits - myDebits);
                  })()}</div>
                  <div className="stat-sub">Trips + Credits − Debits</div>
                </div>
                <div className="stat-card blue">
                  <div className="stat-label">Total Trips</div>
                  <div className="stat-value">{summary.trips}</div>
                  <div className="stat-sub">{trips.length} entries logged</div>
                </div>
              </div>

              <div className="grid g2" style={{ marginBottom: 20, gap: 16 }}>
                <div className="card">
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                    <div>
                      <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Quick Stats</h3>
                      <p style={{ fontSize: 11, color: "var(--text3)" }}>Overview of operations</p>
                    </div>
                  </div>
                  <div style={{ display: "grid", gap: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", background: "var(--bg3)", borderRadius: "var(--radius)", border: "1px solid var(--border)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 36, height: 36, background: "var(--accent-dim)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent)" }}>{Icon.vehicle}</div>
                        <div>
                          <div style={{ fontSize: 11, color: "var(--text3)" }}>Active Vehicles</div>
                          <div style={{ fontSize: 18, fontWeight: 700, fontFamily: "Syne", color: "var(--text)" }}>{vehicles.length}</div>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", background: "var(--bg3)", borderRadius: "var(--radius)", border: "1px solid var(--border)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 36, height: 36, background: "var(--teal-dim)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--teal)" }}>{Icon.people}</div>
                        <div>
                          <div style={{ fontSize: 11, color: "var(--text3)" }}>Partners</div>
                          <div style={{ fontSize: 18, fontWeight: 700, fontFamily: "Syne", color: "var(--text)" }}>{partners.length}</div>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", background: "var(--bg3)", borderRadius: "var(--radius)", border: "1px solid var(--border)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 36, height: 36, background: "var(--purple-dim)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--purple)" }}>{Icon.expense}</div>
                        <div>
                          <div style={{ fontSize: 11, color: "var(--text3)" }}>Expense Types</div>
                          <div style={{ fontSize: 18, fontWeight: 700, fontFamily: "Syne", color: "var(--text)" }}>{expenses.length}</div>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", background: "var(--bg3)", borderRadius: "var(--radius)", border: "1px solid var(--border)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 36, height: 36, background: "var(--blue-dim)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--blue)" }}>{Icon.wallet}</div>
                        <div>
                          <div style={{ fontSize: 11, color: "var(--text3)" }}>Transactions</div>
                          <div style={{ fontSize: 18, fontWeight: 700, fontFamily: "Syne", color: "var(--text)" }}>{transactions.length}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                    <div>
                      <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Top Clients</h3>
                      <p style={{ fontSize: 11, color: "var(--text3)" }}>By total income</p>
                    </div>
                  </div>
                  <div style={{ display: "grid", gap: 10 }}>
                    {(() => {
                      const byClient = {};
                      trips.forEach(t => {
                        const c = store.calcTrip(t);
                        if (!byClient[t.clientName]) {
                          byClient[t.clientName] = { income: 0, trips: 0 };
                        }
                        byClient[t.clientName].income += c.income;
                        byClient[t.clientName].trips += t.tripCount;
                      });
                      return Object.entries(byClient)
                        .sort((a, b) => b[1].income - a[1].income)
                        .slice(0, 5)
                        .map(([name, data]) => (
                          <div key={name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", background: "var(--bg3)", borderRadius: "var(--radius)", border: "1px solid var(--border)" }}>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</div>
                              <div style={{ fontSize: 10, color: "var(--text3)" }}>{data.trips} trips</div>
                            </div>
                            <div style={{ fontSize: 14, fontWeight: 700, fontFamily: "Syne", color: "var(--accent)", marginLeft: 12 }}>{fmt(data.income)}</div>
                          </div>
                        ));
                    })()}
                    {trips.length === 0 && (
                      <div style={{ textAlign: "center", padding: "20px", color: "var(--text3)", fontSize: 12 }}>No client data yet</div>
                    )}
                  </div>
                </div>
              </div>

              <div className="card">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                  <div>
                    <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Recent Trip Entries</h3>
                    <p style={{ fontSize: 11, color: "var(--text3)" }}>Latest {Math.min(6, trips.length)} of {trips.length} total entries</p>
                  </div>
                  <button className="btn btn-outline btn-sm" onClick={() => setTab("trips")}>View all</button>
                </div>
                <div className="table-wrap">
                  <table>
                    <thead><tr><th>Date</th><th>Client</th><th>Item</th><th>Trips</th><th>Income</th><th>Profit</th><th>By</th></tr></thead>
                    <tbody>
                      {trips.length === 0 && <tr><td colSpan={7}><div className="empty" style={{ padding: "32px 20px" }}><p>No trips yet. Click "Add Trip" to get started.</p></div></td></tr>}
                      {[...trips].reverse().slice(0, 6).map(t => {
                        const c = store.calcTrip(t);
                        const by = partners.find(p => p.id === t.partnerId);
                        const isEdited = t.editedProfit !== undefined;
                        return (
                          <tr key={t.id} style={{ cursor: "pointer" }} onClick={() => setTripDetail(t)}>
                            <td>{t.date}</td>
                            <td className="td-bold">{t.clientName}</td>
                            <td><span className="badge badge-purple">{t.item}</span></td>
                            <td>{t.tripCount}</td>
                            <td className="td-accent">{fmt(c.income)}</td>
                            <td className={c.profit >= 0 ? "td-teal" : "td-red"}>
                              {fmt(c.profit)}
                              {isEdited && <span style={{ fontSize: 9, marginLeft: 4, opacity: 0.7 }}>✎</span>}
                            </td>
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
                <div className="filter-bar">
                  <input placeholder="Search client…" value={tripFilter.client} onChange={e => setTripFilter(p => ({ ...p, client: e.target.value }))} style={{ flex: 1, minWidth: 130 }} />
                  <select value={tripFilter.partner} onChange={e => setTripFilter(p => ({ ...p, partner: e.target.value }))}>
                    <option value="">All Partners</option>
                    {partners.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                  <select value={tripFilter.vehicle} onChange={e => setTripFilter(p => ({ ...p, vehicle: e.target.value }))}>
                    <option value="">All Vehicles</option>
                    {vehicles.map(v => <option key={v.id} value={v.id}>{v.number}</option>)}
                  </select>
                  <input type="date" value={tripFilter.dateFrom} onChange={e => setTripFilter(p => ({ ...p, dateFrom: e.target.value }))} title="From date" />
                  <input type="date" value={tripFilter.dateTo} onChange={e => setTripFilter(p => ({ ...p, dateTo: e.target.value }))} title="To date" />
                  {(tripFilter.client || tripFilter.partner || tripFilter.vehicle || tripFilter.dateFrom || tripFilter.dateTo) && (
                    <button className="btn btn-outline btn-sm" onClick={() => setTripFilter({ client: "", partner: "", vehicle: "", dateFrom: "", dateTo: "" })}>Clear</button>
                  )}
                </div>
                {(() => {
                  const filtered = [...trips].reverse().filter(t => {
                    if (tripFilter.client && !t.clientName.toLowerCase().includes(tripFilter.client.toLowerCase())) return false;
                    if (tripFilter.partner && t.partnerId !== tripFilter.partner) return false;
                    if (tripFilter.vehicle && t.vehicleId !== tripFilter.vehicle) return false;
                    if (tripFilter.dateFrom && t.date < tripFilter.dateFrom) return false;
                    if (tripFilter.dateTo && t.date > tripFilter.dateTo) return false;
                    return true;
                  });
                  return (
                    <>
                      <div className="filter-count" style={{ marginBottom: 10 }}>Showing {filtered.length} of {trips.length} entries</div>

                      {/* ── Desktop table ── */}
                      <div className="trip-table table-wrap">
                        <table>
                          <thead><tr><th>Date</th><th>Client</th><th>Place</th><th>Item</th><th>Driver</th><th>Vehicle</th><th>Trips</th><th>Rate</th><th>Income</th><th>Received</th><th>Pending</th><th>Profit</th><th>Partner</th><th></th></tr></thead>
                          <tbody>
                            {filtered.length === 0 && <tr><td colSpan={15}><div className="empty"><p>No trips match the filter.</p></div></td></tr>}
                            {filtered.map(t => {
                              const c = store.calcTrip(t);
                              const by = partners.find(p => p.id === t.partnerId);
                              const veh = vehicles.find(v => v.id === t.vehicleId);
                              const isEdited = t.editedProfit !== undefined;
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
                                  <td className="td-teal">{fmt(c.clientPaid)}</td>
                                  <td className={c.pending > 0 ? "td-red" : "td-teal"}>{fmt(c.pending)}</td>
                                  <td className={c.profit >= 0 ? "td-teal" : "td-red"}>
                                    {fmt(c.profit)}
                                    {isEdited && <span style={{ fontSize: 9, marginLeft: 4, opacity: 0.7 }}>✎</span>}
                                  </td>
                                  <td><span className="badge badge-gray">{by?.name?.split(" ")[0]}</span></td>
                                  <td><button className="btn btn-outline btn-sm" onClick={() => setTripDetail(t)}>Detail</button></td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      {/* ── Mobile cards ── */}
                      <div className="trip-cards">
                        {filtered.length === 0 && <div className="empty"><p>No trips match the filter.</p></div>}
                        {filtered.map(t => {
                          const c = store.calcTrip(t);
                          const veh = vehicles.find(v => v.id === t.vehicleId);
                          const by = partners.find(p => p.id === t.partnerId);
                          return (
                            <div key={t.id} className="trip-card" onClick={() => setTripDetail(t)}>
                              <div className="tc-top">
                                <span className="tc-date">{t.date}</span>
                                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                  <span className="badge badge-purple">{t.item}</span>
                                  <span style={{ fontSize: 11, color: "var(--text3)" }}>{t.tripCount} trips</span>
                                </div>
                              </div>
                              <div className="tc-client">{t.clientName}</div>
                              <div className="tc-meta">{t.place}{veh ? ` · ${veh.number}` : ""}{by ? ` · ${by.name.split(" ")[0]}` : ""}</div>
                              <div className="tc-nums">
                                <div className="tc-num">
                                  <div className="tc-num-label">Income</div>
                                  <div className="tc-num-val" style={{ color: "var(--accent)" }}>{fmt(c.income)}</div>
                                </div>
                                <div className="tc-num">
                                  <div className="tc-num-label">Profit</div>
                                  <div className="tc-num-val" style={{ color: c.profit >= 0 ? "var(--teal)" : "var(--red)" }}>{fmt(c.profit)}</div>
                                </div>
                              </div>
                              {c.pending > 0 && (
                                <div style={{ marginTop: 8, fontSize: 11, color: "var(--red)" }}>⚠ {fmt(c.pending)} pending</div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          </>
        )}

        {tab === "clients" && (() => {
          const unlinked = trips.filter(t => !clients.some(c => c.name.toLowerCase() === t.clientName.toLowerCase()));
          return (
            <>
              <div className="topbar">
                <div>
                  <h1 className="page-title">Clients</h1>
                  <p className="page-sub">{clients.length} clients · Complete business record per client</p>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  {unlinked.length > 0 && (
                    <button className="btn btn-outline" onClick={importClientsFromTrips}>
                      ↓ Import from trips
                    </button>
                  )}
                  <button className="btn btn-primary" onClick={() => { setModal("client"); setForm({}); }}>
                    {Icon.plus} Add Client
                  </button>
                </div>
              </div>
              <div className="content">
                {clients.length === 0 && (
                  <div className="card">
                    <div className="empty">
                      <p>No clients yet.</p>
                      {trips.length > 0 && (
                        <button className="btn btn-primary" style={{ marginTop: 12 }} onClick={importClientsFromTrips}>
                          ↓ Import clients from existing trips
                        </button>
                      )}
                    </div>
                  </div>
                )}
                <div className="grid g3">
                  {clients.map(c => {
                    const cTrips = trips.filter(t => t.clientName.toLowerCase() === c.name.toLowerCase());
                    const totalIncome = cTrips.reduce((s, t) => s + store.calcTrip(t).income, 0);
                    const totalPaid = cTrips.reduce((s, t) => s + store.calcTrip(t).clientPaid, 0);
                    const totalPending = cTrips.reduce((s, t) => s + store.calcTrip(t).pending, 0);
                    const totalTripCount = cTrips.reduce((s, t) => s + t.tripCount, 0);
                    return (
                      <div key={c.id} className="card">
                        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 10 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ width: 40, height: 40, background: "var(--accent-dim)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontFamily: "Syne", fontWeight: 700, color: "var(--accent)" }}>
                              {c.name[0].toUpperCase()}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, fontFamily: "Syne", fontSize: 14 }}>{c.name}</div>
                              <div style={{ fontSize: 11, color: "var(--text3)" }}>{c.mobile || "—"}</div>
                            </div>
                          </div>
                          <button className="btn btn-outline btn-sm" onClick={() => { setModal("client"); setForm({ editClientId: c.id, name: c.name, mobile: c.mobile, address: c.address, notes: c.notes }); }}>✎ Edit</button>
                        </div>
                        {c.address && <div style={{ fontSize: 11, color: "var(--text3)", marginBottom: 8 }}>{c.address}</div>}
                        <hr className="divider" />
                        <div style={{ display: "grid", gap: 6, fontSize: 12, marginBottom: 12 }}>
                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span style={{ color: "var(--text3)" }}>Trip entries</span>
                            <span style={{ color: "var(--text)", fontWeight: 500 }}>{cTrips.length} ({totalTripCount} trips)</span>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span style={{ color: "var(--text3)" }}>Total billed</span>
                            <span style={{ color: "var(--accent)", fontWeight: 600 }}>{fmt(totalIncome)}</span>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span style={{ color: "var(--text3)" }}>Received</span>
                            <span style={{ color: "var(--teal)", fontWeight: 600 }}>{fmt(totalPaid)}</span>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid var(--border)", paddingTop: 6, marginTop: 2 }}>
                            <span style={{ fontWeight: 600 }}>Pending</span>
                            <span style={{ color: totalPending > 0 ? "var(--red)" : "var(--teal)", fontWeight: 700, fontFamily: "Syne" }}>{fmt(totalPending)}</span>
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: 8 }}>
                          {totalPending > 0 && (
                            <button className="btn btn-primary btn-sm" style={{ flex: 1, justifyContent: "center" }}
                              onClick={() => { setModal("clientPayment"); setForm({ clientPaymentTrips: cTrips, clientPaymentName: c.name, clientPaymentPending: totalPending, date: today() }); }}>
                              + Record Payment
                            </button>
                          )}
                          <button className="btn btn-outline btn-sm" style={{ flex: 1, justifyContent: "center" }}
                            onClick={() => setClientDetail({ client: c, cTrips, totalIncome, totalPaid, totalPending, totalTripCount })}>
                            View Balance Sheet
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          );
        })()}

        {tab === "transactions" && (
          <>
            <div className="topbar">
              <div>
                <h1 className="page-title">Credit & Debit</h1>
                <p className="page-sub">{transactions.length} transactions · Affects total income</p>
              </div>
              <button className="btn btn-primary" onClick={() => { setModal("transaction"); setForm({ partnerId: user.id, date: today(), type: "credit" }); }}>
                {Icon.plus} Add Transaction
              </button>
            </div>
            <div className="content">
              <div className="grid g3" style={{ marginBottom: 20 }}>
                <div className="stat-card teal">
                  <div className="stat-label">Total Credits</div>
                  <div className="stat-value">{fmt(summary.credits || 0)}</div>
                  <div className="stat-sub">{transactions.filter(tx => tx.type === 'credit').length} credit entries</div>
                </div>
                <div className="stat-card red">
                  <div className="stat-label">Total Debits</div>
                  <div className="stat-value">{fmt(summary.debits || 0)}</div>
                  <div className="stat-sub">{transactions.filter(tx => tx.type === 'debit').length} debit entries</div>
                </div>
                <div className="stat-card accent">
                  <div className="stat-label">Net Balance</div>
                  <div className="stat-value">{fmt(summary.netBalance || 0)}</div>
                  <div className="stat-sub">{summary.netBalance >= 0 ? "✓ Positive" : "⚠ Negative"}</div>
                </div>
              </div>

              <div className="card" style={{ marginBottom: 20 }}>
                <div style={{ marginBottom: 16 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Partner-wise Summary</h3>
                  <p style={{ fontSize: 11, color: "var(--text3)" }}>Credits and debits by each partner</p>
                </div>
                <div className="table-wrap">
                  <table>
                    <thead><tr><th>Partner</th><th>Credits</th><th>Debits</th><th>Net Balance</th></tr></thead>
                    <tbody>
                      {partners.map(p => {
                        const ptx = transactions.filter(tx => tx.partnerId === p.id);
                        const credits = ptx.filter(tx => tx.type === 'credit').reduce((s, tx) => s + tx.amount, 0);
                        const debits = ptx.filter(tx => tx.type === 'debit').reduce((s, tx) => s + tx.amount, 0);
                        const balance = credits - debits;
                        return (
                          <tr key={p.id}>
                            <td className="td-bold">{p.name} {p.id === user.id && <span style={{ fontSize: 10, color: "var(--accent)" }}>(You)</span>}</td>
                            <td className="td-teal">{fmt(credits)}</td>
                            <td className="td-red">{fmt(debits)}</td>
                            <td className={balance >= 0 ? "td-teal" : "td-red"} style={{ fontWeight: 600 }}>{fmt(balance)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="card">
                <div style={{ marginBottom: 14 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>All Transactions</h3>
                  <p style={{ fontSize: 11, color: "var(--text3)" }}>Complete transaction history</p>
                </div>
                <div className="filter-bar">
                  <select value={txFilter.type} onChange={e => setTxFilter(p => ({ ...p, type: e.target.value }))}>
                    <option value="all">All Types</option>
                    <option value="credit">Credit only</option>
                    <option value="debit">Debit only</option>
                  </select>
                  <select value={txFilter.partner} onChange={e => setTxFilter(p => ({ ...p, partner: e.target.value }))}>
                    <option value="">All Partners</option>
                    {partners.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                  {(() => {
                    const t = today();
                    const yest = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
                    const isToday = txFilter.dateFrom === t && txFilter.dateTo === t;
                    const isYest = txFilter.dateFrom === yest && txFilter.dateTo === yest;
                    return (
                      <>
                        <button className={`btn btn-sm ${isToday ? "btn-primary" : "btn-outline"}`}
                          onClick={() => setTxFilter(p => ({ ...p, dateFrom: isToday ? "" : t, dateTo: isToday ? "" : t }))}>Today</button>
                        <button className={`btn btn-sm ${isYest ? "btn-primary" : "btn-outline"}`}
                          onClick={() => setTxFilter(p => ({ ...p, dateFrom: isYest ? "" : yest, dateTo: isYest ? "" : yest }))}>Yesterday</button>
                      </>
                    );
                  })()}
                  <input type="date" value={txFilter.dateFrom} onChange={e => setTxFilter(p => ({ ...p, dateFrom: e.target.value }))} title="From date" />
                  <input type="date" value={txFilter.dateTo} onChange={e => setTxFilter(p => ({ ...p, dateTo: e.target.value }))} title="To date" />
                  {(txFilter.type !== "all" || txFilter.partner || txFilter.dateFrom || txFilter.dateTo) && (
                    <button className="btn btn-outline btn-sm" onClick={() => setTxFilter({ type: "all", partner: "", dateFrom: "", dateTo: "" })}>Clear</button>
                  )}
                </div>
                {(() => {
                  const filtered = [...transactions].sort((a, b) => b.date.localeCompare(a.date)).filter(tx => {
                    if (txFilter.type !== "all" && tx.type !== txFilter.type) return false;
                    if (txFilter.partner && tx.partnerId !== txFilter.partner) return false;
                    if (txFilter.dateFrom && tx.date < txFilter.dateFrom) return false;
                    if (txFilter.dateTo && tx.date > txFilter.dateTo) return false;
                    return true;
                  });
                  return (
                    <>
                      <div className="filter-count" style={{ marginBottom: 10 }}>Showing {filtered.length} of {transactions.length} entries</div>
                      <div className="table-wrap">
                        <table>
                          <thead><tr><th>Date</th><th>Type</th><th>Amount</th><th>Category</th><th>Description</th><th>Payment</th><th>Reference</th><th>Partner</th></tr></thead>
                          <tbody>
                            {filtered.length === 0 && <tr><td colSpan={8}><div className="empty"><p>No entries match the filter.</p></div></td></tr>}
                            {filtered.map(tx => {
                              const by = partners.find(p => p.id === tx.partnerId);
                              return (
                                <tr key={tx.id}>
                                  <td>{tx.date}</td>
                                  <td>
                                    {tx.type === 'credit' ? (
                                      <span className="badge badge-teal" style={{ display: 'flex', alignItems: 'center', gap: 4, width: 'fit-content' }}>
                                        {Icon.arrowUp} Credit
                                      </span>
                                    ) : (
                                      <span className="badge badge-red" style={{ display: 'flex', alignItems: 'center', gap: 4, width: 'fit-content' }}>
                                        {Icon.arrowDown} Debit
                                      </span>
                                    )}
                                  </td>
                                  <td className={tx.type === 'credit' ? 'td-teal' : 'td-red'} style={{ fontWeight: 600 }}>
                                    {tx.type === 'credit' ? '+' : '-'}{fmt(tx.amount)}
                                  </td>
                                  <td className="td-bold">{tx.category}</td>
                                  <td style={{ fontSize: 12, color: 'var(--text3)' }}>{tx.description || '—'}</td>
                                  <td><span className="badge badge-gray">{tx.paymentMethod || '—'}</span></td>
                                  <td style={{ fontSize: 11 }}>{tx.referenceNumber || '—'}</td>
                                  <td><span className="badge badge-gray">{by?.name?.split(" ")[0] || '—'}</span></td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          </>
        )}

        {tab === "expenses" && (
          <>
            <div className="topbar">
              <div>
                <h1 className="page-title">Expenses</h1>
                <p className="page-sub">All debit entries from Credit/Debit</p>
              </div>
              <button className="btn btn-primary" onClick={() => { setModal("expense"); setForm({ expenseRows: [{ label: "" }] }); }}>
                {Icon.plus} Add Category
              </button>
            </div>
            <div className="content">
              {(() => {
                const debits = transactions.filter(tx => tx.type === "debit");
                // Build category list: user-defined expense labels + any categories used in debits
                const expenseLabels = expenses.map(e => e.label);
                const usedCats = [...new Set(debits.map(tx => tx.category))];
                const allCats = [...new Set([...expenseLabels, ...usedCats])].filter(Boolean);

                const totalByCategory = {};
                allCats.forEach(cat => {
                  totalByCategory[cat] = debits.filter(tx => tx.category === cat).reduce((s, tx) => s + tx.amount, 0);
                });
                const grandTotal = debits.reduce((s, tx) => s + tx.amount, 0);

                const filtered = (expCatFilter === "all" ? debits : debits.filter(tx => tx.category === expCatFilter))
                  .sort((a, b) => b.date.localeCompare(a.date));

                return (
                  <>
                    {/* Totals by category */}
                    <div className="grid g3" style={{ marginBottom: 16 }}>
                      <div className="stat-card red">
                        <div className="stat-label">Total Expenses</div>
                        <div className="stat-value">{fmt(grandTotal)}</div>
                        <div className="stat-sub">{debits.length} debit entries</div>
                      </div>
                      {allCats.slice(0, 2).map(cat => (
                        <div key={cat} className="stat-card" style={{ background: "var(--bg2)", border: "1px solid var(--border)" }}>
                          <div className="stat-label">{cat}</div>
                          <div className="stat-value" style={{ color: "var(--red)" }}>{fmt(totalByCategory[cat] || 0)}</div>
                          <div className="stat-sub">{debits.filter(tx => tx.category === cat).length} entries</div>
                        </div>
                      ))}
                    </div>

                    {/* Category filter tags */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
                      <button className={`btn btn-sm ${expCatFilter === "all" ? "btn-primary" : "btn-outline"}`}
                        onClick={() => setExpCatFilter("all")}>All</button>
                      {allCats.map(cat => (
                        <button key={cat} className={`btn btn-sm ${expCatFilter === cat ? "btn-primary" : "btn-outline"}`}
                          onClick={() => setExpCatFilter(expCatFilter === cat ? "all" : cat)}>
                          {cat}
                          <span style={{ marginLeft: 5, fontSize: 10, opacity: 0.8 }}>{fmt(totalByCategory[cat] || 0)}</span>
                        </button>
                      ))}
                    </div>

                    {/* Transaction list */}
                    <div className="card">
                      <div className="table-wrap">
                        <table>
                          <thead><tr><th>Date</th><th>Category</th><th>Amount</th><th>Description</th><th>Partner</th></tr></thead>
                          <tbody>
                            {filtered.length === 0 && (
                              <tr><td colSpan={5}><div className="empty"><p>No expenses yet. Add a Debit entry in Credit/Debit.</p></div></td></tr>
                            )}
                            {filtered.map(tx => {
                              const by = partners.find(p => p.id === tx.partnerId);
                              return (
                                <tr key={tx.id}>
                                  <td>{tx.date}</td>
                                  <td><span className="badge badge-red">{tx.category}</span></td>
                                  <td className="td-red" style={{ fontWeight: 600 }}>– {fmt(tx.amount)}</td>
                                  <td style={{ fontSize: 12, color: "var(--text3)" }}>{tx.description || "—"}</td>
                                  <td><span className="badge badge-gray">{by?.name?.split(" ")[0] || "—"}</span></td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Manage categories */}
                    {expenses.length > 0 && (
                      <div className="card" style={{ marginTop: 16 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 10, color: "var(--text2)" }}>Expense Categories</div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                          {expenses.map(e => (
                            <span key={e.id} className="badge badge-gray" style={{ fontSize: 12, padding: "4px 10px" }}>{e.label}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                );
              })()}
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
              <button className="btn btn-primary" onClick={() => { setModal("vehicle"); setForm({ vehicleRows: [{ number: "", type: "Dumper" }] }); }}>
                {Icon.plus} Add Vehicle
              </button>
            </div>
            <div className="content">
              {vehicles.some(v => v.emiAmount > 0) && (() => {
                const activeEmiVehicles = vehicles.filter(v => { const e = calcEmi(v); return e && !e.done; });
                const totalMonthly = activeEmiVehicles.reduce((s, v) => s + v.emiAmount, 0);
                const totalOutstanding = activeEmiVehicles.reduce((s, v) => s + calcEmi(v).total, 0);
                return (
                  <div className="grid g3" style={{ marginBottom: 20 }}>
                    <div className="stat-card blue">
                      <div className="stat-label">Monthly EMI Load</div>
                      <div className="stat-value">{fmt(totalMonthly)}</div>
                      <div className="stat-sub">{activeEmiVehicles.length} active EMIs</div>
                    </div>
                    <div className="stat-card red">
                      <div className="stat-label">Total Outstanding</div>
                      <div className="stat-value">{fmt(totalOutstanding)}</div>
                      <div className="stat-sub">Across all vehicles</div>
                    </div>
                    <div className="stat-card accent">
                      <div className="stat-label">Vehicles with EMI</div>
                      <div className="stat-value">{vehicles.filter(v => v.emiAmount > 0).length}</div>
                      <div className="stat-sub">of {vehicles.length} total</div>
                    </div>
                  </div>
                );
              })()}
              <div className="filter-bar">
                <select value={vehFilter.type} onChange={e => setVehFilter(p => ({ ...p, type: e.target.value }))}>
                  <option value="all">All Types</option>
                  {[...new Set(vehicles.map(v => v.type))].sort().map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <select value={vehFilter.emi} onChange={e => setVehFilter(p => ({ ...p, emi: e.target.value }))}>
                  <option value="all">All EMI Status</option>
                  <option value="active">Active EMI</option>
                  <option value="done">EMI Complete</option>
                  <option value="none">No EMI</option>
                </select>
                {(vehFilter.type !== "all" || vehFilter.emi !== "all") && (
                  <button className="btn btn-outline btn-sm" onClick={() => setVehFilter({ type: "all", emi: "all" })}>Clear</button>
                )}
              </div>
              {(() => {
                const filtered = vehicles.filter(v => {
                  if (vehFilter.type !== "all" && v.type !== vehFilter.type) return false;
                  if (vehFilter.emi !== "all") {
                    const e = calcEmi(v);
                    if (vehFilter.emi === "active" && !(e && !e.done)) return false;
                    if (vehFilter.emi === "done" && !(e && e.done)) return false;
                    if (vehFilter.emi === "none" && v.emiAmount > 0) return false;
                  }
                  return true;
                });
                return (
                  <div className="grid g3">
                    {filtered.length === 0 && <div className="card"><div className="empty"><p>No vehicles match the filter.</p></div></div>}
                    {filtered.map(v => {
                      const emi = calcEmi(v);
                      return (
                        <div key={v.id} className="card">
                          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <div style={{ width: 36, height: 36, background: "var(--accent-dim)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent)", flexShrink: 0 }}>{Icon.vehicle}</div>
                              <div>
                                <div style={{ fontWeight: 600, fontFamily: "Syne", fontSize: 14 }}>{v.number}</div>
                                <div style={{ fontSize: 11, color: "var(--text3)" }}>{v.type}</div>
                              </div>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                              {emi && <span className={`emi-tag ${emi.done ? "emi-done" : "emi-active"}`}>{emi.done ? "EMI Done" : "EMI Active"}</span>}
                              <button className="btn btn-outline btn-sm" onClick={() => { setModal("editVehicle"); setForm({ id: v.id, number: v.number, type: v.type, emiAmount: v.emiAmount || "", emiStartDate: v.emiStartDate || "", emiTenureMonths: v.emiTenureMonths || "", emiDescription: v.emiDescription || "" }); }}>✎ Edit</button>
                            </div>
                          </div>
                          <div style={{ display: "grid", gap: 6, fontSize: 12 }}>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                              <span style={{ color: "var(--text3)" }}>Total Trips</span>
                              <span style={{ color: "var(--teal)", fontWeight: 500 }}>{trips.filter(t => t.vehicleId === v.id).reduce((s, t) => s + t.tripCount, 0)}</span>
                            </div>
                            {emi && !emi.done && (
                              <>
                                <div style={{ display: "flex", justifyContent: "space-between" }}>
                                  <span style={{ color: "var(--text3)" }}>Monthly EMI</span>
                                  <span style={{ color: "var(--blue)", fontWeight: 600 }}>{fmt(emi.monthly)}</span>
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between" }}>
                                  <span style={{ color: "var(--text3)" }}>Remaining</span>
                                  <span style={{ color: "var(--text)", fontWeight: 500 }}>{emi.remaining} mo · {fmt(emi.total)}</span>
                                </div>
                              </>
                            )}
                            {emi && emi.done && (
                              <div style={{ color: "var(--teal)", fontSize: 11 }}>Loan fully paid</div>
                            )}
                            {!emi && (
                              <div style={{ color: "var(--text3)", fontSize: 11 }}>No EMI set · <button onClick={() => { setModal("editVehicle"); setForm({ id: v.id, number: v.number, type: v.type, emiAmount: "", emiStartDate: "", emiTenureMonths: "", emiDescription: "" }); }} style={{ background: "none", border: "none", color: "var(--accent)", cursor: "pointer", fontSize: 11, padding: 0 }}>Set EMI</button></div>
                            )}
                            {v.emiDescription && (
                              <div style={{ color: "var(--text3)", fontSize: 11, marginTop: 2, borderTop: "1px solid var(--border)", paddingTop: 6 }}>{v.emiDescription}</div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          </>
        )}

        {tab === "drivers" && (
          <>
            <div className="topbar">
              <div>
                <h1 className="page-title">Drivers</h1>
                <p className="page-sub">{drivers.length} registered drivers · Salary tracking</p>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input className="inp" placeholder="Search driver…" value={driverSearch}
                  onChange={e => setDriverSearch(e.target.value)}
                  style={{ width: 160, fontSize: 13 }} />
                <button className="btn btn-primary" onClick={() => { setModal("driver"); setForm({ salaryType: "per_trip" }); }}>
                  {Icon.plus} Add Driver
                </button>
              </div>
            </div>
            <div className="content">
              {drivers.length === 0 && (
                <div className="card"><div className="empty"><p>No drivers yet. Add a driver to assign them to trips and track salary.</p></div></div>
              )}

              {(() => {
                const allPayments = drivers.flatMap(d => store.firmDriverPayments(d.id).map(p => ({ ...p, driverName: d.name })));
                if (allPayments.length === 0) return null;
                const byMonth = {};
                allPayments.forEach(p => {
                  if (!byMonth[p.month]) byMonth[p.month] = [];
                  byMonth[p.month].push(p);
                });
                const months = Object.keys(byMonth).sort().reverse();
                return (
                  <div className="card" style={{ marginBottom: 16 }}>
                    <h3 style={{ fontSize: 14, marginBottom: 14 }}>Driver Salary — Monthly Summary</h3>
                    {months.map(month => {
                      const monthPayments = byMonth[month];
                      const monthTotal = monthPayments.reduce((s, p) => s + p.amount, 0);
                      const byDriver = {};
                      monthPayments.forEach(p => {
                        if (!byDriver[p.driverId]) byDriver[p.driverId] = { name: p.driverName, total: 0, count: 0 };
                        byDriver[p.driverId].total += p.amount;
                        byDriver[p.driverId].count += 1;
                      });
                      return (
                        <div key={month} style={{ marginBottom: 12 }}>
                          <div className="exp-row" style={{ borderBottom: "1px solid var(--border2)" }}>
                            <span style={{ fontWeight: 600, fontFamily: "Syne" }}>{monthLabel(month)}</span>
                            <span style={{ fontWeight: 700, fontFamily: "Syne", color: "var(--red)" }}>{fmt(monthTotal)}</span>
                          </div>
                          {Object.values(byDriver).map(d => (
                            <div key={d.name} className="exp-row" style={{ paddingLeft: 12 }}>
                              <span className="er-label">{d.name} <span style={{ fontSize: 10, color: "var(--text3)" }}>({d.count} payment{d.count !== 1 ? "s" : ""})</span></span>
                              <span style={{ fontWeight: 500 }}>{fmt(d.total)}</span>
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                );
              })()}

              <div className="grid g3">
                {drivers.filter(d => !driverSearch || d.name.toLowerCase().includes(driverSearch.toLowerCase())).map(d => {
                  const thisMonth = today().slice(0, 7);
                  const driverTrips = trips.filter(t => t.driverId === d.id && t.date.startsWith(thisMonth));
                  const monthTrips = driverTrips.reduce((s, t) => s + t.tripCount, 0);
                  const salaryDue = d.salaryType === "per_trip"
                    ? driverTrips.reduce((s, t) => s + (t.driverTripRate || 0) * t.tripCount, 0)
                    : d.salaryAmount;
                  const payments = store.firmDriverPayments(d.id).filter(p => p.month === thisMonth);
                  const totalPaid = payments.reduce((s, p) => s + p.amount, 0);
                  const remaining = Math.max(0, salaryDue - totalPaid);
                  const allPayments = store.firmDriverPayments(d.id);
                  return (
                    <div key={d.id} className="card">
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 12 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 40, height: 40, background: "var(--teal-dim)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontFamily: "Syne", fontWeight: 700, color: "var(--teal)" }}>
                            {d.name[0]}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, fontFamily: "Syne", fontSize: 14 }}>{d.name}</div>
                            <div style={{ fontSize: 11, color: "var(--text3)" }}>{d.mobile || "—"}</div>
                          </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span className={`badge ${d.salaryType === "salaried" ? "badge-accent" : "badge-teal"}`}>
                            {d.salaryType === "salaried" ? "Salaried" : "Per Trip"}
                          </span>
                          <button className="btn btn-outline btn-sm" onClick={() => { setModal("driver"); setForm({ editDriverId: d.id, name: d.name, mobile: d.mobile, salaryType: d.salaryType, salaryAmount: d.salaryAmount }); }}>✎ Edit</button>
                        </div>
                      </div>
                      <hr className="divider" />
                      <div style={{ display: "grid", gap: 6, fontSize: 12, marginBottom: 12 }}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span style={{ color: "var(--text3)" }}>This month trips</span>
                          <span style={{ color: "var(--text)", fontWeight: 500 }}>{monthTrips}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span style={{ color: "var(--text3)" }}>
                            {d.salaryType === "per_trip" ? "Salary (from trips)" : "Monthly salary"}
                          </span>
                          <span style={{ color: "var(--accent)", fontWeight: 600 }}>{fmt(salaryDue)}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span style={{ color: "var(--text3)" }}>Paid this month</span>
                          <span style={{ color: "var(--teal)", fontWeight: 600 }}>{fmt(totalPaid)}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid var(--border)", paddingTop: 6, marginTop: 2 }}>
                          <span style={{ fontWeight: 600 }}>Remaining</span>
                          <span style={{ color: remaining > 0 ? "var(--red)" : "var(--teal)", fontWeight: 700, fontFamily: "Syne" }}>{fmt(remaining)}</span>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button className="btn btn-primary btn-sm" style={{ flex: 1, justifyContent: "center" }}
                          onClick={() => { setModal("driverPayment"); setForm({ driverPaymentId: d.id, date: today() }); }}>
                          + Record Payment
                        </button>
                        <button className="btn btn-outline btn-sm" style={{ flex: 1, justifyContent: "center" }}
                          onClick={() => {
                            setDriverDetail({ driver: d, allPayments, thisMonth, driverTrips: trips.filter(t => t.driverId === d.id) });
                            setDriverDetailFilter({ dateFrom: thisMonth + '-01', dateTo: today() });
                          }}>
                          View Details
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Driver Trip Log */}
              {(() => {
                const allDriverTrips = trips
                  .filter(t => t.driverId)
                  .map(t => ({ ...t, driverName: drivers.find(d => d.id === t.driverId)?.name || '—' }));
                const { dateFrom: tldf, dateTo: tldt } = driverTripLogFilter;
                const q = driverSearch.toLowerCase();
                const filtered = allDriverTrips.filter(t =>
                  (!q || t.driverName.toLowerCase().includes(q)) &&
                  (!tldf || t.date >= tldf) &&
                  (!tldt || t.date <= tldt)
                ).sort((a, b) => b.date.localeCompare(a.date));
                return (
                  <div className="card" style={{ marginTop: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: 14 }}>
                      <h3 style={{ fontSize: 14, margin: 0 }}>Trip Log — All Drivers</h3>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                        <input type="date" className="inp" style={{ fontSize: 12 }}
                          value={tldf} onChange={e => setDriverTripLogFilter(p => ({ ...p, dateFrom: e.target.value }))} />
                        <span style={{ fontSize: 12, color: "var(--text3)" }}>to</span>
                        <input type="date" className="inp" style={{ fontSize: 12 }}
                          value={tldt} onChange={e => setDriverTripLogFilter(p => ({ ...p, dateTo: e.target.value }))} />
                        {(tldf || tldt) && (
                          <button className="btn btn-outline btn-sm" onClick={() => setDriverTripLogFilter({ dateFrom: '', dateTo: '' })}>Clear</button>
                        )}
                      </div>
                    </div>
                    {filtered.length === 0 ? (
                      <div style={{ fontSize: 12, color: "var(--text3)", textAlign: "center", padding: "14px 0" }}>No trips found.</div>
                    ) : (
                      <div className="table-wrap">
                        <table>
                          <thead>
                            <tr><th>Date</th><th>Driver</th><th>Client</th><th>Vehicle</th><th>Trips</th><th>Driver Pay</th></tr>
                          </thead>
                          <tbody>
                            {filtered.map(t => {
                              const drv = drivers.find(d => d.id === t.driverId);
                              const veh = vehicles.find(v => v.id === t.vehicleId);
                              const pay = drv?.salaryType === 'per_trip' ? (t.driverTripRate || 0) * t.tripCount : null;
                              return (
                                <tr key={t.id}>
                                  <td>{t.date}</td>
                                  <td className="td-bold">{t.driverName}</td>
                                  <td>{t.clientName}</td>
                                  <td style={{ fontSize: 11 }}>{veh?.number || '—'}</td>
                                  <td>{t.tripCount}</td>
                                  <td className="td-teal">{pay !== null ? fmt(pay) : '—'}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              })()}
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
                  <div className="stat-label">Pending Payments</div>
                  <div className="stat-value">{fmt(summary.totalPending)}</div>
                  <div className="stat-sub">Uncollected from clients</div>
                </div>
                <div className="stat-card teal">
                  <div className="stat-label">Net Profit</div>
                  <div className="stat-value">{fmt(summary.netProfit)}</div>
                  <div className="stat-sub">After ₹{fmt(summary.driverPaymentsPaid)} driver payments</div>
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
                  <h3 style={{ fontSize: 14, marginBottom: 14 }}>Profit Summary</h3>
                  <div className="exp-row"><span className="er-label">Gross Income (trips)</span><span className="er-val">{fmt(summary.income)}</span></div>
                  <div className="exp-row">
                    <span className="er-label">– Driver Payments Made</span>
                    <span style={{ color: "var(--red)", fontSize: 13 }}>– {fmt(summary.driverPaymentsPaid)}</span>
                  </div>
                  <div className="exp-row" style={{ borderTop: "1px solid var(--border2)", marginTop: 6, paddingTop: 12 }}>
                    <span style={{ fontWeight: 600 }}>Net Profit</span>
                    <span style={{ fontWeight: 700, fontFamily: "Syne", color: summary.netProfit >= 0 ? "var(--teal)" : "var(--red)" }}>{fmt(summary.netProfit)}</span>
                  </div>
                </div>
              </div>

              <div className="card" style={{ marginTop: 16 }}>
                <h3 style={{ fontSize: 14, marginBottom: 14 }}>Partner-wise Contribution</h3>
                <div className="table-wrap">
                  <table>
                    <thead><tr><th>Partner</th><th>Entries</th><th>Trips</th><th>Income Logged</th><th>Profit</th></tr></thead>
                    <tbody>
                      {partners.map(p => {
                        const ptrips = trips.filter(t => t.partnerId === p.id);
                        const inc = ptrips.reduce((s, t) => s + store.calcTrip(t).income, 0);
                        const prf = ptrips.reduce((s, t) => s + store.calcTrip(t).profit, 0);
                        return (
                          <tr key={p.id}>
                            <td className="td-bold">{p.name} {p.id === user.id && <span style={{ fontSize: 10, color: "var(--accent)" }}>(You)</span>}</td>
                            <td>{ptrips.length}</td>
                            <td>{ptrips.reduce((s, t) => s + t.tripCount, 0)}</td>
                            <td className="td-accent">{fmt(inc)}</td>
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
            <div className="fg2">
              <div>
                <label>Client Name *</label>
                <select value={form.clientId || ""} onChange={e => {
                  const sel = clients.find(c => c.id === e.target.value);
                  setForm(p => ({ ...p, clientId: e.target.value, clientName: sel ? sel.name : "" }));
                }}>
                  <option value="">— Select Client —</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  <option value="__manual__">Type name manually…</option>
                </select>
                {form.clientId === "__manual__" && (
                  <input style={{ marginTop: 6 }} placeholder="Client / builder name" value={form.clientName || ""} onChange={e => setForm(p => ({ ...p, clientName: e.target.value }))} />
                )}
                {clients.length === 0 && form.clientId !== "__manual__" && (
                  <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 4 }}>No clients yet — select "Type name manually…" or add clients in the Clients tab first.</div>
                )}
              </div>
              <div><label>Date *</label><input type="date" value={form.date || today()} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} /></div>
            </div>
            <div className="fg2">
              <div><label>Partner (Entry by) *</label>
                <select value={form.partnerId || ""} onChange={e => setForm(p => ({ ...p, partnerId: e.target.value }))}>
                  <option value="">— Select —</option>
                  {partners.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label>Driver *</label>
                {drivers.length > 0 ? (
                  <>
                    <select value={form.driverId || ""} onChange={e => setForm(p => ({ ...p, driverId: e.target.value, driverName: "", driverTripRate: "" }))}>
                      <option value="">— Select Driver —</option>
                      {drivers.map(d => <option key={d.id} value={d.id}>{d.name} ({d.salaryType === "salaried" ? "Salaried" : "Per Trip"})</option>)}
                      <option value="__manual__">Type name manually…</option>
                    </select>
                    {form.driverId === "__manual__" && (
                      <input style={{ marginTop: 6 }} placeholder="Driver's name" value={form.driverName || ""} onChange={e => setForm(p => ({ ...p, driverName: e.target.value }))} />
                    )}
                    {(() => {
                      const sel = drivers.find(d => d.id === form.driverId);
                      if (!sel) return null;
                      if (sel.salaryType === "salaried") {
                        return (
                          <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: "var(--accent-dim)", borderRadius: "var(--radius)", fontSize: 12 }}>
                            <span style={{ color: "var(--accent)", fontWeight: 600 }}>Salaried</span>
                            <span style={{ color: "var(--text3)" }}>— fixed monthly salary, tracked separately</span>
                          </div>
                        );
                      }
                      return (
                        <div style={{ marginTop: 8 }}>
                          <label style={{ fontSize: 11 }}>Driver Rate per Trip (₹) *</label>
                          <input type="number" min="0" placeholder="e.g. 300" value={form.driverTripRate || ""} onChange={e => setForm(p => ({ ...p, driverTripRate: e.target.value }))} />
                        </div>
                      );
                    })()}
                  </>
                ) : (
                  <input placeholder="Driver's name" value={form.driverName || ""} onChange={e => setForm(p => ({ ...p, driverName: e.target.value }))} />
                )}
              </div>
            </div>
            <div className="fg2">
              <div><label>Vehicle *</label>
                <select value={form.vehicleId || ""} onChange={e => setForm(p => ({ ...p, vehicleId: e.target.value }))}>
                  <option value="">— Select Vehicle —</option>
                  {vehicles.map(v => <option key={v.id} value={v.id}>{v.number}</option>)}
                </select>
              </div>
              <div><label>Place / Location *</label><input placeholder="Site or quarry location" value={form.place || ""} onChange={e => setForm(p => ({ ...p, place: e.target.value }))} /></div>
            </div>
            <div className="fg3">
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
                <div className="exp-row">
                  <span className="er-label">Total Income ({form.tripCount} trips × {fmt(form.ratePerTrip)})</span>
                  <span style={{ fontFamily: "Syne", fontWeight: 700, fontSize: 16, color: "var(--teal)" }}>{fmt(tripIncome)}</span>
                </div>
                <div style={{ marginTop: 10, fontSize: 11, color: "var(--text3)", display: "flex", alignItems: "center", gap: 4 }}>
                  {Icon.lock} Entries cannot be edited or deleted after saving
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}

      {modal === "vehicle" && (
        <Modal title="Add Vehicles" onClose={() => setModal(null)}
          footer={<><button className="btn btn-outline" onClick={() => setModal(null)}>Cancel</button><button className="btn btn-primary" onClick={submitVehicle}>Add {(form.vehicleRows||[]).filter(r=>r.number?.trim()).length || ""} Vehicle{(form.vehicleRows||[]).filter(r=>r.number?.trim()).length !== 1 ? "s" : ""}</button></>}>
          <div className="form-grid">
            <div style={{ fontSize: 11, color: "var(--text3)", marginBottom: 2 }}>Enter one vehicle per row. Click + to add more.</div>
            {(form.vehicleRows || [{ number: "", type: "Dumper" }]).map((row, i) => (
              <div key={i} className="veh-row">
                <div><label>Vehicle Number *</label><input placeholder="e.g. RJ-14-GA-1234" value={row.number || ""} onChange={e => setForm(p => { const r = [...p.vehicleRows]; r[i] = { ...r[i], number: e.target.value }; return { ...p, vehicleRows: r }; })} /></div>
                <div><label>Type</label>
                  <select value={row.type || "Dumper"} onChange={e => setForm(p => { const r = [...p.vehicleRows]; r[i] = { ...r[i], type: e.target.value }; return { ...p, vehicleRows: r }; })}>
                    <option>Dumper</option><option>Truck</option><option>Loader</option><option>JCB</option><option>Dumper 10 wheels</option><option>Dumper 12 wheels</option><option>Dumper 16 wheels</option><option>Tractor</option>
                  </select>
                </div>
                <button style={{ height: 36, width: 36, border: "1px solid var(--border)", borderRadius: "var(--radius)", background: "var(--bg3)", color: "var(--red)", cursor: "pointer", fontSize: 18, lineHeight: 1, display: (form.vehicleRows||[]).length > 1 ? "flex" : "none", alignItems: "center", justifyContent: "center" }}
                  onClick={() => setForm(p => ({ ...p, vehicleRows: p.vehicleRows.filter((_, j) => j !== i) }))}>×</button>
              </div>
            ))}
            <button className="btn btn-outline btn-sm" style={{ alignSelf: "flex-start", marginTop: 2 }}
              onClick={() => setForm(p => ({ ...p, vehicleRows: [...(p.vehicleRows || []), { number: "", type: "Dumper" }] }))}>
              + Add Another Vehicle
            </button>
          </div>
        </Modal>
      )}

      {modal === "editVehicle" && (
        <Modal title="Edit Vehicle" onClose={() => { setModal(null); setForm({}); }}
          footer={<><button className="btn btn-outline" onClick={() => { setModal(null); setForm({}); }}>Cancel</button><button className="btn btn-primary" onClick={submitEditVehicle}>Save Changes</button></>}>
          <div className="form-grid">
            <div className="fg2">
              <div><label>Vehicle Number *</label><input placeholder="e.g. RJ-14-GA-1234" value={form.number || ""} onChange={e => setForm(p => ({ ...p, number: e.target.value }))} /></div>
              <div><label>Type</label>
                <select value={form.type || "Dumper"} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
                  <option>Dumper</option><option>Truck</option><option>Loader</option><option>JCB</option><option>Dumper 10 wheels</option><option>Dumper 12 wheels</option><option>Dumper 16 wheels</option><option>Tractor</option>
                </select>
              </div>
            </div>
            <hr className="divider" />
            <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: -4 }}>EMI Details <span style={{ opacity: .6 }}>(leave blank to remove EMI)</span></div>
            <div className="fg2">
              <div><label>Monthly EMI (₹)</label><input type="number" min="0" placeholder="e.g. 25000" value={form.emiAmount || ""} onChange={e => setForm(p => ({ ...p, emiAmount: e.target.value }))} /></div>
              <div><label>Tenure (Months)</label><input type="number" min="1" placeholder="e.g. 36" value={form.emiTenureMonths || ""} onChange={e => setForm(p => ({ ...p, emiTenureMonths: e.target.value }))} /></div>
            </div>
            <div className="fg2">
              <div><label>EMI Start Date</label><input type="date" value={form.emiStartDate || ""} onChange={e => setForm(p => ({ ...p, emiStartDate: e.target.value }))} /></div>
              <div><label>Loan / Bank Note</label><input placeholder="e.g. SBI Loan #123456" value={form.emiDescription || ""} onChange={e => setForm(p => ({ ...p, emiDescription: e.target.value }))} /></div>
            </div>
            {Number(form.emiAmount) > 0 && Number(form.emiTenureMonths) > 0 && (
              <div style={{ background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 12, fontSize: 12 }}>
                <div style={{ fontSize: 11, color: "var(--text3)", textTransform: "uppercase", letterSpacing: ".7px", marginBottom: 8 }}>EMI Preview</div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ color: "var(--text2)" }}>Total Loan Cost</span>
                  <span style={{ color: "var(--blue)", fontWeight: 600, fontFamily: "Syne" }}>{fmt(Number(form.emiAmount) * Number(form.emiTenureMonths))}</span>
                </div>
                {form.emiStartDate && (() => {
                  const elapsed = Math.floor((new Date() - new Date(form.emiStartDate)) / (30 * 24 * 60 * 60 * 1000));
                  const remaining = Math.max(0, Number(form.emiTenureMonths) - elapsed);
                  return (
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "var(--text2)" }}>Remaining</span>
                      <span style={{ color: remaining === 0 ? "var(--teal)" : "var(--text)", fontWeight: 600, fontFamily: "Syne" }}>{remaining === 0 ? "Paid off" : `${remaining} mo · ${fmt(remaining * Number(form.emiAmount))}`}</span>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </Modal>
      )}

      {modal === "expense" && (
        <Modal title="Add Expense Types" onClose={() => setModal(null)}
          footer={<><button className="btn btn-outline" onClick={() => setModal(null)}>Cancel</button><button className="btn btn-primary" onClick={submitExpense}>Add {(form.expenseRows||[]).filter(r=>r.label?.trim()).length || ""} Expense{(form.expenseRows||[]).filter(r=>r.label?.trim()).length !== 1 ? "s" : ""}</button></>}>
          <div className="form-grid">
            <div style={{ fontSize: 11, color: "var(--text3)", marginBottom: 2 }}>Labels only — amounts are entered per trip. Click + to add more.</div>
            {(form.expenseRows || [{ label: "" }]).map((row, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 10, alignItems: "end" }}>
                <div><label>Expense Label *</label><input placeholder="e.g. Diesel, Driver Wages" value={row.label || ""} onChange={e => setForm(p => { const r = [...p.expenseRows]; r[i] = { label: e.target.value }; return { ...p, expenseRows: r }; })} /></div>
                <button style={{ height: 36, width: 36, border: "1px solid var(--border)", borderRadius: "var(--radius)", background: "var(--bg3)", color: "var(--red)", cursor: "pointer", fontSize: 18, lineHeight: 1, display: (form.expenseRows||[]).length > 1 ? "flex" : "none", alignItems: "center", justifyContent: "center" }}
                  onClick={() => setForm(p => ({ ...p, expenseRows: p.expenseRows.filter((_, j) => j !== i) }))}>×</button>
              </div>
            ))}
            <button className="btn btn-outline btn-sm" style={{ alignSelf: "flex-start", marginTop: 2 }}
              onClick={() => setForm(p => ({ ...p, expenseRows: [...(p.expenseRows || []), { label: "" }] }))}>
              + Add Another Expense
            </button>
          </div>
        </Modal>
      )}

      {modal === "transaction" && (
        <Modal title="Add Credit/Debit Transaction" onClose={() => setModal(null)}
          footer={<><button className="btn btn-outline" onClick={() => setModal(null)}>Cancel</button><button className="btn btn-primary" disabled={submitting} onClick={submitTransaction}>{submitting ? "Saving…" : "Save Transaction"}</button></>}>
          <div className="form-grid">
            <div className="fg2">
              <div>
                <label>Transaction Type *</label>
                <select value={form.type || "credit"} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
                  <option value="credit">Credit (Money In)</option>
                  <option value="debit">Debit (Money Out)</option>
                </select>
              </div>
              <div><label>Amount (₹) *</label><input type="number" min="0" step="0.01" placeholder="e.g. 5000" value={form.amount || ""} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} /></div>
            </div>
            <div className="fg2">
              <div>
                <label>Category *</label>
                <select value={form.category || ""} onChange={e => setForm(p => ({ ...p, category: e.target.value, driverPickId: "", clientPickId: "", description: "" }))}>
                  <option value="">— Select Category —</option>
                  {form.type === 'credit' ? (
                    CREDIT_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)
                  ) : (
                    <>
                      {expenses.length > 0 && (
                        <optgroup label="My Expense Categories">
                          {expenses.map(e => <option key={e.id} value={e.label}>{e.label}</option>)}
                        </optgroup>
                      )}
                      <optgroup label="Other">
                        {DEBIT_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      </optgroup>
                    </>
                  )}
                </select>
              </div>
              <div><label>Date *</label><input type="date" value={form.date || today()} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} /></div>
            </div>
            {form.type === "debit" && form.category === "Driver Salary" && (
              <div>
                <label>Driver</label>
                <select value={form.driverPickId || ""} onChange={e => {
                  const val = e.target.value;
                  const drv = drivers.find(d => d.id === val);
                  setForm(p => ({ ...p, driverPickId: val, description: drv ? drv.name : p.description }));
                }}>
                  <option value="">— Select Driver —</option>
                  {drivers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  <option value="__manual__">Type manually…</option>
                </select>
              </div>
            )}
            {form.type === "credit" && form.category === "Client Payment" && (
              <div>
                <label>Client</label>
                <select value={form.clientPickId || ""} onChange={e => {
                  const val = e.target.value;
                  const cl = clients.find(c => c.id === val);
                  setForm(p => ({ ...p, clientPickId: val, description: cl ? cl.name : p.description }));
                }}>
                  <option value="">— Select Client —</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  <option value="__manual__">Type manually…</option>
                </select>
                {form.clientPickId && form.clientPickId !== "__manual__" && (
                  <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 4 }}>
                    Payment will be applied to this client's oldest pending trips first.
                  </div>
                )}
              </div>
            )}
            <div>
              <label>Description</label>
              <input placeholder={
                (form.type === "debit" && form.category === "Driver Salary" && form.driverPickId === "__manual__") ||
                (form.type === "credit" && form.category === "Client Payment" && form.clientPickId === "__manual__")
                  ? "Enter name or note"
                  : "Brief description of transaction"
              } value={form.description || ""} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
            </div>
            <div className="fg2">
              <div>
                <label>Payment Method</label>
                <select value={form.paymentMethod || ""} onChange={e => setForm(p => ({ ...p, paymentMethod: e.target.value }))}>
                  <option value="">— Select —</option>
                  {PAYMENT_METHODS.map(method => (
                    <option key={method} value={method}>{method}</option>
                  ))}
                </select>
              </div>
              <div><label>Reference Number</label><input placeholder="e.g. PAY-001, CHQ-123" value={form.referenceNumber || ""} onChange={e => setForm(p => ({ ...p, referenceNumber: e.target.value }))} /></div>
            </div>
            <div>
              <label>Partner (Entry by)</label>
              <select value={form.partnerId || user.id} onChange={e => setForm(p => ({ ...p, partnerId: e.target.value }))}>
                {partners.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div style={{ background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 12, fontSize: 12, color: "var(--text3)" }}>
              {form.type === 'credit' ? (
                <>✓ This will increase your total income by {fmt(form.amount || 0)}</>
              ) : (
                <>⚠ This will decrease your total income by {fmt(form.amount || 0)}</>
              )}
            </div>
          </div>
        </Modal>
      )}

      {modal === "client" && (
        <Modal title={form.editClientId ? "Edit Client" : "Add Client"} onClose={() => { setModal(null); setForm({}); }}
          footer={<><button className="btn btn-outline" onClick={() => { setModal(null); setForm({}); }}>Cancel</button><button className="btn btn-primary" onClick={submitClient}>{form.editClientId ? "Save Changes" : "Add Client"}</button></>}>
          <div className="form-grid">
            <div className="fg2">
              <div><label>Client / Company Name *</label><input placeholder="e.g. Raj Construction" value={form.name || ""} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
              <div><label>Mobile</label><input placeholder="Contact number (optional)" value={form.mobile || ""} onChange={e => setForm(p => ({ ...p, mobile: e.target.value }))} /></div>
            </div>
            <div><label>Address</label><input placeholder="Site / office address (optional)" value={form.address || ""} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} /></div>
            <div><label>Notes</label><input placeholder="Any notes about this client (optional)" value={form.notes || ""} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} /></div>
          </div>
        </Modal>
      )}

      {modal === "clientPayment" && (
        <Modal title={`Record Payment — ${form.clientPaymentName}`} onClose={() => { setModal(null); setForm({}); }}
          footer={<><button className="btn btn-outline" onClick={() => { setModal(null); setForm({}); }}>Cancel</button><button className="btn btn-primary" onClick={submitClientPayment}>Save Payment</button></>}>
          <div className="form-grid">
            <div style={{ background: "var(--bg3)", borderRadius: "var(--radius)", padding: 12, fontSize: 13 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text3)" }}>Total pending</span>
                <span style={{ color: "var(--red)", fontWeight: 700, fontFamily: "Syne" }}>{fmt(form.clientPaymentPending)}</span>
              </div>
            </div>
            <div><label>Amount Received (₹) *</label>
              <input type="number" min="0" placeholder="e.g. 50000" value={form.clientPaymentAmount || ""}
                onChange={e => setForm(p => ({ ...p, clientPaymentAmount: e.target.value }))} />
            </div>
            <div><label>Date *</label>
              <input type="date" value={form.date || today()} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
            </div>
            <div><label>Note (optional)</label>
              <input placeholder="e.g. cheque, UPI ref" value={form.note || ""} onChange={e => setForm(p => ({ ...p, note: e.target.value }))} />
            </div>
            <div style={{ fontSize: 11, color: "var(--text3)" }}>
              Payment is applied to oldest pending trips first.
            </div>
          </div>
        </Modal>
      )}

      {clientDetail && (() => {
        const { client: c, cTrips, totalIncome, totalPaid, totalPending, totalTripCount } = clientDetail;
        const sortedTrips = [...cTrips].sort((a, b) => b.date.localeCompare(a.date));
        return (
          <Modal title={`${c.name} — Balance Sheet`} onClose={() => setClientDetail(null)}>
            <div style={{ display: "grid", gap: 14 }}>
              {/* Summary cards */}
              <div className="grid g3" style={{ gap: 10 }}>
                <div className="card-sm" style={{ background: "var(--accent-dim)", borderColor: "var(--accent)" }}>
                  <div style={{ fontSize: 10, color: "var(--accent)", textTransform: "uppercase", letterSpacing: ".7px" }}>Total Billed</div>
                  <div style={{ fontWeight: 700, fontFamily: "Syne", fontSize: 18, color: "var(--accent)", marginTop: 4 }}>{fmt(totalIncome)}</div>
                  <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 2 }}>{cTrips.length} entries · {totalTripCount} trips</div>
                </div>
                <div className="card-sm" style={{ background: "var(--teal-dim)", borderColor: "var(--teal)" }}>
                  <div style={{ fontSize: 10, color: "var(--teal)", textTransform: "uppercase", letterSpacing: ".7px" }}>Received</div>
                  <div style={{ fontWeight: 700, fontFamily: "Syne", fontSize: 18, color: "var(--teal)", marginTop: 4 }}>{fmt(totalPaid)}</div>
                  <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 2 }}>{totalIncome > 0 ? ((totalPaid / totalIncome) * 100).toFixed(0) : 0}% of total</div>
                </div>
                <div className="card-sm" style={{ background: totalPending > 0 ? "var(--red-dim)" : "var(--teal-dim)", borderColor: totalPending > 0 ? "var(--red)" : "var(--teal)" }}>
                  <div style={{ fontSize: 10, color: totalPending > 0 ? "var(--red)" : "var(--teal)", textTransform: "uppercase", letterSpacing: ".7px" }}>Pending</div>
                  <div style={{ fontWeight: 700, fontFamily: "Syne", fontSize: 18, color: totalPending > 0 ? "var(--red)" : "var(--teal)", marginTop: 4 }}>{fmt(totalPending)}</div>
                  <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 2 }}>{totalPending > 0 ? "Outstanding balance" : "Fully settled"}</div>
                </div>
              </div>

              {/* Contact info */}
              {(c.mobile || c.address) && (
                <div className="card-sm" style={{ background: "var(--bg3)" }}>
                  <div style={{ display: "flex", gap: 20, fontSize: 12 }}>
                    {c.mobile && <div><span style={{ color: "var(--text3)" }}>Mobile: </span><span style={{ fontWeight: 500 }}>{c.mobile}</span></div>}
                    {c.address && <div><span style={{ color: "var(--text3)" }}>Address: </span><span style={{ fontWeight: 500 }}>{c.address}</span></div>}
                  </div>
                  {c.notes && <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 6 }}>{c.notes}</div>}
                </div>
              )}

              {/* Trip-by-trip breakdown */}
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>All Trips ({sortedTrips.length} entries)</div>
                {sortedTrips.length === 0 ? (
                  <div style={{ fontSize: 12, color: "var(--text3)", padding: "12px 0" }}>No trips recorded yet for this client.</div>
                ) : (
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr><th>Date</th><th>Place</th><th>Item</th><th>Trips</th><th>Rate</th><th>Billed</th><th>Received</th><th>Pending</th></tr>
                      </thead>
                      <tbody>
                        {sortedTrips.map(t => {
                          const calc = store.calcTrip(t);
                          return (
                            <tr key={t.id}>
                              <td>{t.date}</td>
                              <td>{t.place}</td>
                              <td><span className="badge badge-purple">{t.item}</span></td>
                              <td className="td-bold">{t.tripCount}</td>
                              <td>{fmt(t.ratePerTrip)}</td>
                              <td className="td-accent">{fmt(calc.income)}</td>
                              <td className="td-teal">{fmt(calc.clientPaid)}</td>
                              <td className={calc.pending > 0 ? "td-red" : "td-teal"}>{fmt(calc.pending)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot>
                        <tr style={{ fontWeight: 700, borderTop: "2px solid var(--border2)" }}>
                          <td colSpan={3} style={{ color: "var(--text3)", fontSize: 11 }}>Total</td>
                          <td className="td-bold">{totalTripCount}</td>
                          <td></td>
                          <td className="td-accent">{fmt(totalIncome)}</td>
                          <td className="td-teal">{fmt(totalPaid)}</td>
                          <td className={totalPending > 0 ? "td-red" : "td-teal"}>{fmt(totalPending)}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </Modal>
        );
      })()}

      {modal === "driver" && (
        <Modal title={form.editDriverId ? "Edit Driver" : "Add Driver"} onClose={() => { setModal(null); setForm({}); }}
          footer={<><button className="btn btn-outline" onClick={() => { setModal(null); setForm({}); }}>Cancel</button><button className="btn btn-primary" onClick={submitDriver}>{form.editDriverId ? "Save Changes" : "Add Driver"}</button></>}>
          <div className="form-grid">
            <div className="fg2">
              <div><label>Full Name *</label><input placeholder="Driver's name" value={form.name || ""} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
              <div><label>Mobile</label><input placeholder="10-digit mobile (optional)" value={form.mobile || ""} onChange={e => setForm(p => ({ ...p, mobile: e.target.value }))} /></div>
            </div>
            <div>
              <label>Salary Type *</label>
              <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
                <button className={`btn ${form.salaryType === "per_trip" ? "btn-primary" : "btn-outline"}`}
                  style={{ flex: 1, justifyContent: "center" }}
                  onClick={() => setForm(p => ({ ...p, salaryType: "per_trip" }))}>Per Trip</button>
                <button className={`btn ${form.salaryType === "salaried" ? "btn-primary" : "btn-outline"}`}
                  style={{ flex: 1, justifyContent: "center" }}
                  onClick={() => setForm(p => ({ ...p, salaryType: "salaried" }))}>Salaried (Monthly)</button>
              </div>
            </div>
            {form.salaryType === "salaried" && (
              <div>
                <label>Monthly Salary (₹) *</label>
                <input type="number" min="0" placeholder="e.g. 12000" value={form.salaryAmount || ""} onChange={e => setForm(p => ({ ...p, salaryAmount: e.target.value }))} />
              </div>
            )}
            <div style={{ background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 12, fontSize: 12, color: "var(--text3)" }}>
              {form.salaryType === "salaried"
                ? "Fixed monthly salary — driver earns a flat amount regardless of trips."
                : "Per-trip salary — driver rate is entered each time a trip is added."}
            </div>
          </div>
        </Modal>
      )}

      {modal === "driverPayment" && (
        <Modal title="Record Salary Payment" onClose={() => { setModal(null); setForm({}); }}
          footer={<><button className="btn btn-outline" onClick={() => { setModal(null); setForm({}); }}>Cancel</button><button className="btn btn-primary" disabled={submitting} onClick={submitDriverPayment}>{submitting ? "Saving…" : "Save Payment"}</button></>}>
          <div className="form-grid">
            {(() => {
              const d = drivers.find(dr => dr.id === form.driverPaymentId);
              return d ? <div style={{ background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 12, fontSize: 13 }}>Recording payment for <strong>{d.name}</strong></div> : null;
            })()}
            <div className="fg2">
              <div><label>Amount Paid (₹) *</label><input type="number" min="1" placeholder="e.g. 5000" value={form.amount || ""} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} autoFocus /></div>
              <div><label>Date</label><input type="date" value={form.date || today()} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} /></div>
            </div>
            <div><label>Note (optional)</label><input placeholder="e.g. Advance, Partial payment…" value={form.note || ""} onChange={e => setForm(p => ({ ...p, note: e.target.value }))} /></div>
          </div>
        </Modal>
      )}

      {driverDetail && (() => {
        const { driver: d, allPayments, thisMonth, driverTrips } = driverDetail;
        const { dateFrom: df, dateTo: dt } = driverDetailFilter;
        const filteredTrips = driverTrips.filter(t => (!df || t.date >= df) && (!dt || t.date <= dt));
        const filteredPayments = allPayments.filter(p => (!df || p.date >= df) && (!dt || p.date <= dt));
        const tripCount = filteredTrips.reduce((s, t) => s + t.tripCount, 0);
        const salaryEarned = d.salaryType === 'per_trip'
          ? filteredTrips.reduce((s, t) => s + (t.driverTripRate || 0) * t.tripCount, 0)
          : null;
        const totalPaid = filteredPayments.reduce((s, p) => s + p.amount, 0);
        const isCurrentMonth = df === thisMonth + '-01' && dt === today();
        const rangeLabel = (!df && !dt) ? 'All Time' : isCurrentMonth ? `This Month (${thisMonth})` : `${df || '…'} → ${dt || '…'}`;
        return (
          <Modal title={`${d.name} — Driver Details`} onClose={() => setDriverDetail(null)}>
            <div style={{ display: "grid", gap: 14 }}>
              <div className="grid g2" style={{ gap: 10 }}>
                {[["Name", d.name], ["Mobile", d.mobile || "—"], ["Salary Type", d.salaryType === "salaried" ? "Salaried (Monthly)" : "Per Trip"], ["Rate", d.salaryType === "per_trip" ? "Set per trip" : `${fmt(d.salaryAmount)} / month`]].map(([k, v]) => (
                  <div key={k} className="card-sm">
                    <div style={{ fontSize: 10, color: "var(--text3)", textTransform: "uppercase", letterSpacing: ".7px" }}>{k}</div>
                    <div style={{ fontWeight: 500, marginTop: 2 }}>{v}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <input type="date" className="inp" style={{ flex: 1, minWidth: 120 }}
                  value={df} onChange={e => setDriverDetailFilter(p => ({ ...p, dateFrom: e.target.value }))} />
                <span style={{ color: "var(--text3)", fontSize: 12 }}>to</span>
                <input type="date" className="inp" style={{ flex: 1, minWidth: 120 }}
                  value={dt} onChange={e => setDriverDetailFilter(p => ({ ...p, dateTo: e.target.value }))} />
                {(df || dt) && (
                  <button className="btn btn-outline btn-sm" onClick={() => setDriverDetailFilter({ dateFrom: '', dateTo: '' })}>All Time</button>
                )}
              </div>
              <div className="card-sm" style={{ background: "var(--bg3)" }}>
                <div style={{ fontSize: 11, color: "var(--text3)", textTransform: "uppercase", letterSpacing: ".8px", marginBottom: 10 }}>{rangeLabel}</div>
                <div className="exp-row"><span className="er-label">Trips completed</span><span className="er-val">{tripCount}</span></div>
                {salaryEarned !== null && (
                  <div className="exp-row"><span className="er-label">Salary earned</span><span className="er-val">{fmt(salaryEarned)}</span></div>
                )}
                <div className="exp-row"><span className="er-label" style={{ color: "var(--teal)" }}>Payments received</span><span className="er-val" style={{ color: "var(--teal)" }}>{fmt(totalPaid)}</span></div>
                {salaryEarned !== null && (
                  <div style={{ borderTop: "1px solid var(--border2)", marginTop: 8, paddingTop: 10, display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontWeight: 600 }}>Balance</span>
                    <span style={{ fontFamily: "Syne", fontWeight: 700, color: salaryEarned - totalPaid > 0 ? "var(--red)" : "var(--teal)" }}>{fmt(Math.abs(salaryEarned - totalPaid))}{salaryEarned - totalPaid > 0 ? " due" : " surplus"}</span>
                  </div>
                )}
              </div>
              {filteredTrips.length > 0 && (
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>Trips</div>
                  <div className="table-wrap">
                    <table>
                      <thead><tr><th>Date</th><th>Client</th><th>Vehicle</th><th>Trips</th>{d.salaryType === "per_trip" && <th>Driver Pay</th>}</tr></thead>
                      <tbody>
                        {filteredTrips.map(t => {
                          const veh = vehicles.find(v => v.id === t.vehicleId);
                          return (
                            <tr key={t.id}>
                              <td>{t.date}</td>
                              <td className="td-bold">{t.clientName}</td>
                              <td style={{ fontSize: 11 }}>{veh?.number}</td>
                              <td>{t.tripCount}</td>
                              {d.salaryType === "per_trip" && (
                                <td className="td-teal">{fmt((t.driverTripRate || 0) * t.tripCount)}</td>
                              )}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              {filteredTrips.length === 0 && (
                <div style={{ fontSize: 12, color: "var(--text3)", textAlign: "center", padding: "10px 0" }}>No trips in this range.</div>
              )}
              {filteredPayments.length > 0 && (
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>Payment History</div>
                  <div className="table-wrap">
                    <table>
                      <thead><tr><th>Date</th><th>Month</th><th>Amount</th><th>Note</th><th>Recorded By</th></tr></thead>
                      <tbody>
                        {filteredPayments.map(p => {
                          const recorder = partners.find(pt => pt.id === p.recordedBy);
                          return (
                            <tr key={p.id}>
                              <td>{p.date}</td><td>{p.month}</td>
                              <td className="td-teal">{fmt(p.amount)}</td>
                              <td style={{ fontSize: 11, color: "var(--text3)" }}>{p.note || "—"}</td>
                              <td><span className="badge badge-gray">{recorder?.name?.split(" ")[0] || "—"}</span></td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              {filteredPayments.length === 0 && (
                <div style={{ fontSize: 12, color: "var(--text3)", textAlign: "center", padding: "4px 0 8px" }}>No payments in this range.</div>
              )}
            </div>
          </Modal>
        );
      })()}

      {/* Trip Detail Modal */}
      {tripDetail && (() => {
        const c = store.calcTrip(tripDetail);
        const by = partners.find(p => p.id === tripDetail.partnerId);
        const veh = vehicles.find(v => v.id === tripDetail.vehicleId);
        const isEdited = tripDetail.editedProfit !== undefined;
        
        const handleEditProfit = () => {
          setEditingProfit(true);
          setEditedProfitValue(c.profit.toString());
        };
        
        const handleSaveProfit = () => {
          const newProfit = Number(editedProfitValue);
          if (!isNaN(newProfit)) {
            store.updateTripProfit(tripDetail.id, newProfit);
            setEditingProfit(false);
            // Update the tripDetail to reflect changes
            setTripDetail({ ...tripDetail, editedProfit: newProfit });
          }
        };
        
        const handleCancelEdit = () => {
          setEditingProfit(false);
          setEditedProfitValue("");
        };
        
        const handleEditClientPaid = () => {
          setEditingClientPaid(true);
          setClientPaidValue(c.clientPaid.toString());
        };

        const handleSaveClientPaid = () => {
          const amount = Number(clientPaidValue);
          if (!isNaN(amount) && amount >= 0) {
            store.updateClientPaid(tripDetail.id, amount);
            setEditingClientPaid(false);
            setTripDetail({ ...tripDetail, clientPaid: amount });
          }
        };

        return (
          <Modal title="Trip Detail" onClose={() => { setTripDetail(null); setEditingProfit(false); setEditedProfitValue(""); setEditingClientPaid(false); setClientPaidValue(""); }}>
            <div style={{ display: "grid", gap: 12 }}>
              <div className="grid g2" style={{ gap: 10 }}>
                {[['Client', tripDetail.clientName], ['Date', tripDetail.date], ['Driver', tripDetail.driverName], ['Vehicle', veh?.number], ['Place', tripDetail.place], ['Item', tripDetail.item], ['No. of Trips', tripDetail.tripCount], ['Rate/Trip', fmt(tripDetail.ratePerTrip)], ['Entered by', by?.name]].map(([k, v]) => (
                  <div key={k} className="card-sm">
                    <div style={{ fontSize: 10, color: "var(--text3)", textTransform: "uppercase", letterSpacing: ".7px" }}>{k}</div>
                    <div style={{ fontWeight: 500, marginTop: 2 }}>{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-sm" style={{ background: "var(--bg3)" }}>
                <div style={{ fontSize: 11, color: "var(--text3)", textTransform: "uppercase", letterSpacing: ".8px", marginBottom: 10 }}>Payment Status</div>
                <div className="exp-row">
                  <span className="er-label">Invoice (Income)</span>
                  <span className="er-val">{fmt(c.income)}</span>
                </div>
                <div className="exp-row" style={{ alignItems: "center" }}>
                  <span className="er-label">Amount Received</span>
                  {!editingClientPaid ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ color: "var(--teal)", fontWeight: 600, fontFamily: "Syne" }}>{fmt(c.clientPaid)}</span>
                      <button className="btn btn-outline btn-sm" onClick={handleEditClientPaid} style={{ padding: "4px 8px", fontSize: 11 }}>Update</button>
                    </div>
                  ) : (
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <input type="number" min="0" value={clientPaidValue} onChange={e => setClientPaidValue(e.target.value)} style={{ width: 120, padding: "4px 8px", fontSize: 13 }} autoFocus />
                      <button className="btn btn-primary btn-sm" onClick={handleSaveClientPaid} style={{ padding: "4px 8px", fontSize: 11 }}>Save</button>
                      <button className="btn btn-outline btn-sm" onClick={() => setEditingClientPaid(false)} style={{ padding: "4px 8px", fontSize: 11 }}>Cancel</button>
                    </div>
                  )}
                </div>
                <div style={{ borderTop: "1px solid var(--border2)", marginTop: 8, paddingTop: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontWeight: 600 }}>Pending</span>
                  <span style={{ fontFamily: "Syne", fontWeight: 700, fontSize: 16, color: c.pending > 0 ? "var(--red)" : "var(--teal)" }}>{fmt(c.pending)}</span>
                </div>
              </div>

              <div className="card-sm" style={{ background: "var(--bg3)" }}>
                <div style={{ fontSize: 11, color: "var(--text3)", textTransform: "uppercase", letterSpacing: ".8px", marginBottom: 10 }}>Financial Breakdown</div>
                <div className="exp-row"><span className="er-label">Income</span><span className="er-val">{fmt(c.income)}</span></div>
                <div style={{ borderTop: "1px solid var(--border2)", marginTop: 8, paddingTop: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <span style={{ fontWeight: 600 }}>Net Profit {isEdited && <span style={{ fontSize: 10, color: "var(--accent)" }}>(Edited)</span>}</span>
                    {!editingProfit ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontFamily: "Syne", fontWeight: 700, color: c.profit >= 0 ? "var(--teal)" : "var(--red)" }}>{fmt(c.profit)}</span>
                        <button className="btn btn-outline btn-sm" onClick={handleEditProfit} style={{ padding: "4px 8px", fontSize: 11 }}>Edit</button>
                      </div>
                    ) : (
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <input
                          type="number"
                          value={editedProfitValue}
                          onChange={(e) => setEditedProfitValue(e.target.value)}
                          style={{ width: 120, padding: "4px 8px", fontSize: 13 }}
                          autoFocus
                        />
                        <button className="btn btn-primary btn-sm" onClick={handleSaveProfit} style={{ padding: "4px 8px", fontSize: 11 }}>Save</button>
                        <button className="btn btn-outline btn-sm" onClick={handleCancelEdit} style={{ padding: "4px 8px", fontSize: 11 }}>Cancel</button>
                      </div>
                    )}
                  </div>
                  {isEdited && c.calculatedProfit !== c.profit && (
                    <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 4 }}>
                      Original calculated: {fmt(c.calculatedProfit)}
                    </div>
                  )}
                </div>
              </div>
              {tripDetail.note && <div className="card-sm"><div style={{ fontSize: 11, color: "var(--text3)" }}>Note</div><div style={{ marginTop: 2 }}>{tripDetail.note}</div></div>}
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text3)", padding: "6px 0" }}>
                {Icon.lock} This entry is locked. Only profit can be edited by partners.
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

  if (store.loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
        <style>{style}</style>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 56, height: 56, background: 'var(--accent)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            {Icon.truck}
          </div>
          <h2 style={{ fontSize: 18, color: 'var(--text)', marginBottom: 8 }}>Loading DumperTrack...</h2>
          <p style={{ fontSize: 13, color: 'var(--text3)' }}>Connecting to database</p>
        </div>
      </div>
    );
  }

  if (!store.currentUser) {
    return <LoginScreen users={store.users} firms={store.firms} onLogin={store.setCurrentUser} />;
  }
  if (store.currentUser.role === "admin") {
    return <AdminPanel store={store} />;
  }
  return <UserPanel store={store} user={store.currentUser} />;
}

