# RupeeWise — RESTful API Specification

Base URL: `http://localhost:8080/api` (Spring Boot) / `http://localhost:3000/api` (Vite Proxy)

## 1. Dashboard
- `GET /api/dashboard/summary`
  Returns 8 key metric summary cards: totalAvailableBalance, totalSavings, currentMonthIncome, currentMonthExpenses, currentMonthNetCashFlow, remainingMonthlyBudget, savingsRate, outstandingPlannedPayments.
- `GET /api/dashboard/charts`
  Returns dataset for Chart.js doughnut and bar visualizers.

## 2. Transactions
- `GET /api/transactions`
  Query params: `startDate`, `endDate`, `category`, `type`. Returns chronological list.
- `POST /api/transactions`
  Body: `{ transactionDate, transactionType, amount, category, description, paymentMethod, accountId, targetAccountId?, notes?, tags? }`
  Response: 201 Created.
- `PUT /api/transactions/:id`
  Updates transaction, reverses old balance effect, and reapplies new balance.
- `DELETE /api/transactions/:id`
  Reverses balance effect on account before deletion. Response: 204 No Content.

## 3. General Ledger
- `GET /api/ledger`
  Query params: `accountId`, `startDate`, `endDate`.
  Returns `{ openingBalance, totalCredits, totalDebits, closingBalance, entries: [ { transactionId, date, description, category, debit, credit, runningBalance } ] }`.

## 4. Accounts
- `GET /api/accounts`
  Returns active accounts list.
- `POST /api/accounts`
  Creates new cash wallet, savings, or checking account.

## 5. Budgets
- `GET /api/budgets`
- `POST /api/budgets`
  Sets category spending limits.

## 6. Savings Goals
- `GET /api/savings-goals`
- `POST /api/savings-goals`
  Creates asset reservation target.

## 7. Specs
- `GET /api/specs/files`
  Returns synchronized JSON catalogue of all 13 categories of Java backend source files.
