# Credit/Debit Transactions Module

## Overview
The Credit/Debit module allows partners to track financial transactions that affect their total income. This includes money received (credits) and money paid out (debits), separate from trip-based income and expenses.

## 🎯 Purpose

### What It Tracks
- **Credits (Money In)**: Client payments, advances, refunds, loans received, investments
- **Debits (Money Out)**: Fuel purchases, repairs, salaries, maintenance, loan repayments

### Why It's Needed
- Track non-trip financial transactions
- Monitor cash flow separate from trip operations
- Record advance payments and refunds
- Track bulk purchases and expenses
- Maintain complete financial records

## 📊 Features

### 1. Transaction Types

#### Credit (Money In) ✅
- Client Payment
- Advance Payment
- Refund Received
- Loan Received
- Investment
- Other Income

#### Debit (Money Out) ❌
- Fuel Purchase
- Vehicle Repair
- Driver Salary
- Helper Salary
- Maintenance
- Insurance Payment
- Loan Repayment
- Office Expenses
- Other Expenses

### 2. Transaction Details
Each transaction records:
- **Type**: Credit or Debit
- **Amount**: Transaction value in ₹
- **Category**: Type of transaction
- **Description**: Brief details
- **Date**: Transaction date
- **Payment Method**: Cash, Bank Transfer, Cheque, UPI, Card
- **Reference Number**: Payment/receipt reference
- **Partner**: Who recorded the transaction

### 3. Financial Summary
- **Total Credits**: Sum of all credit transactions
- **Total Debits**: Sum of all debit transactions
- **Net Balance**: Credits - Debits
- **Total Income**: Trip income + Credits

## 🎨 User Interface

### Navigation
```
Dashboard → Trips → Credit/Debit → Expenses → Vehicles → Partners → Balance
```

### Credit/Debit Page Layout
```
┌─────────────────────────────────────────────────────────┐
│ Credit & Debit                    [+ Add Transaction]   │
│ 15 transactions · Affects total income                  │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ Total Credits│  │ Total Debits │  │ Net Balance  │ │
│  │   ₹45,000    │  │   ₹18,000    │  │   ₹27,000    │ │
│  │ 8 entries    │  │ 7 entries    │  │ ✓ Positive   │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│                                                          │
│  ┌────────────────────────────────────────────────────┐│
│  │ Date  Type    Amount    Category    Description    ││
│  ├────────────────────────────────────────────────────┤│
│  │ 01-20 ↑Credit +₹5,000  Client Pay  From ABC Co.   ││
│  │ 01-19 ↓Debit  -₹2,000  Fuel        Bulk diesel    ││
│  │ 01-18 ↑Credit +₹3,500  Advance     Next month     ││
│  └────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────┘
```

### Add Transaction Modal
```
┌─────────────────────────────────────┐
│ Add Credit/Debit Transaction     × │
├─────────────────────────────────────┤
│ Transaction Type: [Credit ▼]        │
│ Amount: [5000____]                  │
│                                     │
│ Category: [Client Payment ▼]       │
│ Date: [2025-01-20]                 │
│                                     │
│ Description: [Payment from ABC]     │
│                                     │
│ Payment Method: [Bank Transfer ▼]  │
│ Reference: [PAY-001]               │
│                                     │
│ Partner: [Ramesh Sharma ▼]         │
│                                     │
│ ✓ This will increase your total    │
│   income by ₹5,000                 │
│                                     │
│         [Cancel] [Save Transaction] │
└─────────────────────────────────────┘
```

## 💡 Use Cases

### Scenario 1: Client Advance Payment
```
Type: Credit
Amount: ₹10,000
Category: Advance Payment
Description: Advance for next month's trips
Payment: Bank Transfer
Reference: ADV-001
```

### Scenario 2: Bulk Fuel Purchase
```
Type: Debit
Amount: ₹5,000
Category: Fuel Purchase
Description: Diesel for all vehicles
Payment: Cash
Reference: FUEL-123
```

### Scenario 3: Vehicle Repair
```
Type: Debit
Amount: ₹3,500
Category: Vehicle Repair
Description: Brake system replacement
Payment: Bank Transfer
Reference: REP-045
```

### Scenario 4: Client Payment
```
Type: Credit
Amount: ₹15,000
Category: Client Payment
Description: Payment for completed trips
Payment: Cheque
Reference: CHQ-789
```

## 📈 Impact on Financial Reports

### Dashboard
- Shows net balance from transactions
- Displays total income (trips + credits)

### Balance Sheet
- Credits added to income
- Debits shown separately
- Net balance calculated

### Partner Summary
- Each partner's transactions tracked
- Individual credit/debit totals
- Net contribution calculated

## 🔄 Workflow

### Adding a Credit Transaction
1. Click "Add Transaction" button
2. Select "Credit (Money In)"
3. Enter amount
4. Choose category (e.g., Client Payment)
5. Add description
6. Select payment method
7. Enter reference number (optional)
8. Save transaction

### Adding a Debit Transaction
1. Click "Add Transaction" button
2. Select "Debit (Money Out)"
3. Enter amount
4. Choose category (e.g., Fuel Purchase)
5. Add description
6. Select payment method
7. Enter reference number (optional)
8. Save transaction

## 📊 Database Schema

### Table: transactions
```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY,
  firm_id UUID REFERENCES firms(id),
  partner_id UUID REFERENCES users(id),
  type TEXT CHECK (type IN ('credit', 'debit')),
  amount NUMERIC NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  reference_number TEXT,
  payment_method TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Indexes
- `idx_transactions_firm_id`
- `idx_transactions_partner_id`
- `idx_transactions_date`
- `idx_transactions_type`

## 🔍 Queries

### Get All Transactions for a Firm
```sql
SELECT * FROM transactions 
WHERE firm_id = 'YOUR_FIRM_ID'
ORDER BY date DESC;
```

### Calculate Net Balance
```sql
SELECT 
  SUM(CASE WHEN type = 'credit' THEN amount ELSE 0 END) as credits,
  SUM(CASE WHEN type = 'debit' THEN amount ELSE 0 END) as debits,
  SUM(CASE WHEN type = 'credit' THEN amount ELSE -amount END) as net
FROM transactions
WHERE firm_id = 'YOUR_FIRM_ID';
```

### Partner-wise Summary
```sql
SELECT 
  u.name,
  SUM(CASE WHEN t.type = 'credit' THEN t.amount ELSE 0 END) as credits,
  SUM(CASE WHEN t.type = 'debit' THEN t.amount ELSE 0 END) as debits
FROM users u
LEFT JOIN transactions t ON u.id = t.partner_id
WHERE u.firm_id = 'YOUR_FIRM_ID'
GROUP BY u.name;
```

## 🎯 Best Practices

### Do's ✅
- Record all financial transactions
- Use appropriate categories
- Add clear descriptions
- Include reference numbers
- Record transactions promptly
- Review balance regularly

### Don'ts ❌
- Don't duplicate trip income
- Don't mix trip expenses with transactions
- Don't forget to add descriptions
- Don't use wrong transaction type
- Don't skip reference numbers

## 🔐 Security & Permissions

- All partners can add transactions
- All partners can view firm transactions
- Transactions are not editable (add only)
- Admin can view all firm transactions

## 📱 Mobile Responsive

- Touch-friendly buttons
- Scrollable transaction table
- Compact summary cards
- Easy-to-use forms

## 🚀 Future Enhancements

Potential improvements:
- [ ] Edit/delete transactions
- [ ] Transaction attachments (receipts)
- [ ] Recurring transactions
- [ ] Transaction categories customization
- [ ] Export to Excel/PDF
- [ ] Transaction approval workflow
- [ ] Bank reconciliation
- [ ] Multi-currency support

## 📝 Example Data

### Sample Credits
```javascript
{
  type: "credit",
  amount: 5000,
  category: "Client Payment",
  description: "Payment from Anand Builders",
  date: "2025-01-15",
  paymentMethod: "Bank Transfer",
  referenceNumber: "PAY-001"
}
```

### Sample Debits
```javascript
{
  type: "debit",
  amount: 2000,
  category: "Fuel Purchase",
  description: "Bulk diesel purchase",
  date: "2025-01-16",
  paymentMethod: "Cash",
  referenceNumber: "EXP-001"
}
```

## 🔗 Integration

### With Trips Module
- Trips track operational income
- Transactions track additional income/expenses
- Both contribute to total income

### With Balance Sheet
- Credits added to income
- Debits shown as expenses
- Net balance displayed

### With Dashboard
- Summary cards show transaction totals
- Recent transactions displayed
- Net balance highlighted

---

**Version**: 1.3
**Module**: Credit/Debit Transactions
**Status**: ✅ Active
**Last Updated**: 2025-01-XX
