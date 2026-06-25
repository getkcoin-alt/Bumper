# General Store (Kirana Store) Management System
### Product Requirements Document

---

## Why This System Is Needed

A typical Indian kirana store is run by a sole proprietor or family (1–5 people), open 365 days, selling 800–2,000 SKUs of groceries, FMCG, and household goods to 150–300 daily customers. Monthly revenue ranges ₹1–3 lakhs. The owner is tech-shy but pragmatic — their problems are real and urgent, and paper simply can't keep up.

**Without a management system, every single day involves:**

- Handwritten khata books per customer — illegible, easily lost, cause disputes
- No idea what's in stock until a customer asks and you can't find it
- Cash and UPI payments mixed with credit sales — no real cash-on-hand figure
- Supplier invoices piled up with no record of what's owed or paid
- Rent, wages, electricity paid out of the till — profit is a guess at best
- Bad debt accumulates silently — chronic defaulters go unnoticed until it's too late

The owner cannot afford an accountant, doesn't trust complex software, and uses a budget Android phone on patchy mobile data. Existing apps (Vyapar, Khatabook, OkCredit) address parts of this — strong on khata/billing, weak on inventory, often too expensive or too complex for a single-person store.

**This system fills that gap** — a purpose-built, offline-first, Hindi-friendly tool that ties together POS, khata, inventory, purchases, and P&L in one simple interface priced for a ₹1–3 lakh/month store.

---

## Who Uses It

| Role | Description |
|---|---|
| **Owner / Admin** | Full access — sees all data, sets prices, manages credit limits, views P&L |
| **Counter Staff** | Sales only — billing, cash collection, basic khata entry, no reports |
| **Family Member** | Configurable — often same as staff, may also record purchases |

---

## Core Feature Requirements

### 1. Inventory Management
- Add/edit items: name, category, unit (kg/piece/packet), purchase price, selling price, GST rate
- Current stock level per item, updated automatically on every sale and purchase
- **Low-stock alert** — configurable threshold per item (e.g., alert when rice < 5 kg)
- Barcode scan (optional) or quick name/number search for lookup at counter
- Batch/expiry tracking for perishables (milk, bread, medicines)
- Disable (hide) discontinued items without deleting history

### 2. Sales & Billing (POS)
- Fast checkout: search item by name → quantity → total, add multiple items per bill
- Payment modes: Cash, UPI, Card, Credit (khata) — split payments supported
- Auto-calculated GST per item (5% / 12% / 18% based on category)
- Bill output: print (Bluetooth thermal printer) or send via WhatsApp/SMS
- Daily sales total — cash received, UPI received, credit issued, total revenue
- Return/refund flow — reduces stock back, reverses payment

### 3. Customer Credit (Khata)
- Per-customer digital ledger — every credit sale and payment with date/item detail
- Running balance always visible — no disputes ("you owe ₹450 since 12 June")
- Record payment: full or partial, with note ("paid via PhonePe")
- **Overdue alerts**: flag customers with balance > ₹X for > N days (both configurable)
- Send WhatsApp/SMS reminder: "Dear [Name], your balance is ₹XXX. Please pay at your convenience."
- Per-customer credit limit — warns cashier if limit would be exceeded
- Monthly outstanding report: sorted by amount / days overdue

### 4. Purchases & Supplier Management
- Record purchase: supplier, items, quantity, price, date, invoice number
- Auto-updates stock on purchase entry
- Track payment status: paid / partial / unpaid
- Supplier-wise outstanding dues with aging (30/60/90 days)
- Quantity discrepancy flag if delivered ≠ ordered
- Supplier contact directory with notes

### 5. Expense Tracking
- Fixed expenses: rent, electricity, phone, insurance — enter once/month
- Variable expenses: staff wages, packaging, repairs, miscellaneous — daily entry
- Pre-built category list + add custom categories
- Monthly expense summary, exportable

### 6. Cash Register
- Opening balance entry (morning cash count)
- End-of-day settlement: expected cash (opening + cash sales − withdrawals) vs. actual count
- Discrepancy alert if difference > ₹X
- Owner withdrawal recording ("took ₹500 for personal use")
- Cash vs. UPI vs. card breakdown for the day

### 7. Reports & Analytics
| Report | Frequency | What It Shows |
|---|---|---|
| Daily Summary | Daily | Sales, credit, expenses, net cash |
| Monthly P&L | Monthly | Revenue, COGS, expenses, gross margin, net profit |
| Top 20 Items | Weekly/monthly | Best sellers by revenue or quantity |
| Credit Outstanding | On demand | Per-customer balance, days overdue |
| Supplier Dues | On demand | Per-supplier outstanding, aging |
| Category Sales | Monthly | Which category (grocery/FMCG/snacks) earns most |
| Stock Report | On demand | Current stock, low-stock items, expiry alerts |

### 8. Staff Management *(nice-to-have)*
- Employee name, role, monthly wage or daily rate
- Basic attendance log (present/absent per day)
- Monthly wage calculation and payment record

---

## Why Digital Beats Paper Khata

| Problem with Paper | Digital Solution |
|---|---|
| Handwriting errors, illegible entries | Typed, timestamped, permanent |
| Customer disputes the balance | Transaction history shown instantly |
| Forgot to remind a customer | Automated WhatsApp reminder sent on schedule |
| Khata book lost or torn | Cloud backup; always recoverable |
| Family gives conflicting balances | Single source of truth, multi-device sync |
| No way to see total outstanding | One-tap report: total owed across all customers |
| Tax season is chaos | Full year of income/expense records, exportable |

**Collections improve 20–30%** when customers receive a WhatsApp reminder with their exact balance — they can't argue with a timestamped digital record.

---

## Technical Requirements & Constraints

### Platform
- **Android-first** (iOS optional); must run on ₹5,000–15,000 budget phones (Redmi, Realme, Poco)
- Min spec: Android 9+, 3 GB RAM, 16 GB storage
- Web app as secondary option (tablet/PC use at counter)

### Offline-First
- All core functions — billing, khata, inventory, cash register — work with zero internet
- Data syncs to cloud automatically when connection resumes
- Conflict resolution: last-write-wins with local audit log

### UI/UX
- **Hindi language** as primary option; regional languages (Marathi, Gujarati, Tamil) as nice-to-have
- Large tap targets, high contrast — usable by 50-year-olds without reading glasses
- Max 3 taps to complete any common action (add sale, record payment, check balance)
- No jargon — "Khata" not "Accounts Receivable"

### Cost
- Free tier usable indefinitely for single-store basics (billing, khata, inventory)
- Paid tier: ≤ ₹299/month for reports, multi-staff, WhatsApp reminders
- No per-SMS/WhatsApp charges baked into base price
- One-time device license acceptable (₹2,000–4,000)

### Integrations
- **WhatsApp Business API** — send bills, khata reminders, payment links
- **UPI deep-links** — generate QR / payment request from bill screen
- **GST** — auto-rate assignment by item category, invoice compliant with GST rules
- **Bluetooth thermal printer** — 57mm or 80mm roll, common at kirana counters
- **CSV/Excel export** — for accountant handoff, tax filing

### Security
- PIN or biometric login per staff role
- Owner can see everything; staff sees only sales and khata
- Encrypted cloud backup (HTTPS, AES-256)
- No customer data sold or shared — strict privacy policy

---

## Success Criteria

The system succeeds when a kirana owner can:

1. Complete a sale and issue a WhatsApp bill in **under 30 seconds**
2. Know exact cash on hand at any moment — no mental arithmetic needed
3. Send a khata reminder to 10 overdue customers in **under 2 minutes**
4. See today's profit (after COGS and expenses) by 9 PM each day
5. Know which items are running low before a customer asks
6. Run the full app for a 3-hour power-cut/offline stretch without any disruption
7. Pay ≤ ₹299/month (or nothing) — and genuinely feel it saves more than it costs

---

## Gaps This Fills vs. Existing Apps

Existing apps handle khata and billing well but fall short on:

- **Inventory not tied to billing** — stock doesn't update automatically when you make a sale
- **No supplier / purchase tracking** — buying side completely unmanaged
- **No daily cash reconciliation** — UPI and cash not reconciled at day-end
- **Complexity / cost creep** — free tier is too limited; paid tiers priced for larger businesses
- **Offline not truly reliable** — patchy sync causes data loss on slow networks
- **One-screen P&L is missing** — profit requires jumping across 4–5 different reports

This system targets the **₹1–3 lakh/month store** — not the wholesaler, not the supermarket — with every feature sized and priced for that context.

---

