# RupeeWise — System Architecture Specification

## 1. Executive Summary
**RupeeWise** is an academic software engineering project implementing a comprehensive personal finance and wealth management system. Designed for rigorous college evaluation, the system features a 3-tier architecture adhering to SOLID principles, Object-Oriented Programming (OOP) patterns, and strict double-entry ledger bookkeeping in Indian Rupees (INR ₹).

## 2. Three-Tier Architectural Model

```
+-------------------------------------------------------------+
|                PRESENTATION LAYER (Client)                  |
|  React 19 + TypeScript + Tailwind CSS + Chart.js            |
|  - Dashboard (KPIs, MoM delta, 4 interactive Chart.js graphs)|
|  - General Ledger (Double-Entry, chronological balance)     |
|  - Income & Expense Management with Data-Driven Insights    |
|  - Interactive Specs Explorer & Teacher Presentation Mode   |
+------------------------------+------------------------------+
                               | REST JSON / HTTPS
+------------------------------v------------------------------+
|               BUSINESS LOGIC LAYER (Spring Boot)            |
|  Java 21 LTS + Spring Boot 3.3.4                            |
|  - RupeeWiseApplication (Asia/Kolkata Timezone)             |
|  - Domain Entities: FinancialTransaction Hierarchy          |
|    * IncomeTransaction, ExpenseTransaction, TransferTx     |
|    * Account, Budget, SavingsGoal, RecurringTransaction     |
|  - Services: TransactionService (@Transactional ACID)       |
|    * LedgerService (Chronological Running Balance)          |
|    * FinancialCalculator (Interface with Default Methods)   |
|  - Validation: Jakarta Bean Validation (@DecimalMin, etc.)  |
|  - Exception Handling: GlobalExceptionHandler (@ControllerAdvice)|
+------------------------------+------------------------------+
                               | Spring Data JPA / Hibernate
+------------------------------v------------------------------+
|                 DATA ACCESS LAYER (Database)                |
|  H2 Relational Database Engine (Persistent File Storage)    |
|  - URL: jdbc:h2:file:./data/rupeewisedb                      |
|  - Tables: accounts, financial_transactions, budgets, etc.  |
|  - Referential Integrity: ON DELETE RESTRICT                |
|  - Indexes: idx_tx_date, idx_tx_account                     |
+-------------------------------------------------------------+
```

## 3. Financial Integrity & Precision Rules
1. **Zero Float Rounding Errors:** All currency amounts are stored and calculated using Java `BigDecimal` with `RoundingMode.HALF_UP`.
2. **Indian Rupee Formatting:** Formatted strictly in `en-IN` locale (`₹1,25,000.00`).
3. **Double-Entry Transfers:** Inter-account movements debit the source account and credit the target account without inflating aggregate income or expense totals.
4. **Reconciliation Guarantee:** Ledger closing balances match actual physical account balances.
