# RupeeWise — Relational Database Schema Specification

## Database Engine
- **Engine:** H2 Database (File-based persistent mode)
- **JDBC URL:** `jdbc:h2:file:./data/rupeewisedb;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE;AUTO_SERVER=TRUE`
- **Web Console:** `http://localhost:8080/h2-console`

## Entity-Relationship Schema

### 1. `accounts`
Stores financial asset repositories (Cash Wallets, Savings Accounts, Current Accounts).
- `id` (VARCHAR 50, PRIMARY KEY)
- `name` (VARCHAR 100, NOT NULL)
- `account_type` (VARCHAR 30, CHECK IN ('CASH_WALLET', 'SAVINGS_BANK', 'CURRENT_BANK', 'OTHER'))
- `opening_balance` (NUMERIC 15,2, NOT NULL DEFAULT 0.00)
- `current_balance` (NUMERIC 15,2, NOT NULL DEFAULT 0.00)
- `institution_name` (VARCHAR 100)
- `account_number_mask` (VARCHAR 20)
- `color_hex` (VARCHAR 10)
- `is_active` (BOOLEAN DEFAULT TRUE)
- `created_at` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP)

### 2. `financial_transactions`
Implements Single Table Inheritance for polymorphic transactions.
- `id` (VARCHAR 50, PRIMARY KEY)
- `transaction_date` (DATE NOT NULL)
- `transaction_type` (VARCHAR 20, CHECK IN ('INCOME', 'EXPENSE', 'TRANSFER'))
- `amount` (NUMERIC 15,2, CHECK amount > 0)
- `category` (VARCHAR 80, NOT NULL)
- `description` (VARCHAR 255, NOT NULL)
- `payment_method` (VARCHAR 50, NOT NULL)
- `account_id` (VARCHAR 50, FOREIGN KEY -> accounts(id) ON DELETE RESTRICT)
- `target_account_id` (VARCHAR 50, FOREIGN KEY -> accounts(id) ON DELETE RESTRICT)
- `notes` (VARCHAR 500)
- `tags` (VARCHAR 255)
- `is_cleared` (BOOLEAN DEFAULT TRUE)
- `created_at` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP)
- `updated_at` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP)

### 3. `budgets`
- `id` (VARCHAR 50, PRIMARY KEY)
- `category` (VARCHAR 80, NOT NULL UNIQUE)
- `monthly_limit` (NUMERIC 15,2, CHECK monthly_limit > 0)
- `color_hex` (VARCHAR 10)
- `carry_forward_enabled` (BOOLEAN DEFAULT FALSE)

### 4. `savings_goals`
- `id` (VARCHAR 50, PRIMARY KEY)
- `name` (VARCHAR 120, NOT NULL)
- `target_amount` (NUMERIC 15,2, CHECK target_amount > 0)
- `current_amount` (NUMERIC 15,2, DEFAULT 0.00 CHECK current_amount >= 0)
- `target_date` (DATE NOT NULL)
- `priority` (VARCHAR 20, CHECK IN ('HIGH', 'MEDIUM', 'LOW'))
- `notes` (VARCHAR 255)

### Indexes for High Performance
```sql
CREATE INDEX idx_tx_date ON financial_transactions(transaction_date DESC);
CREATE INDEX idx_tx_account ON financial_transactions(account_id);
CREATE INDEX idx_tx_category ON financial_transactions(category);
```
