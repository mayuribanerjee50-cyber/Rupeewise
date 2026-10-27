-- RupeeWise Database Schema (H2 / PostgreSQL Compatible DDL)
-- Demonstrates Relational Database Management Systems (RDBMS) concepts:
-- Primary Keys, Foreign Keys with Referential Integrity, Constraints, Check Clauses, and Indexes.

CREATE TABLE IF NOT EXISTS user_profiles (
    id VARCHAR(50) PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150),
    monthly_income_target NUMERIC(15, 2) DEFAULT 50000.00,
    initial_savings_balance NUMERIC(15, 2) DEFAULT 20000.00,
    monthly_savings_goal NUMERIC(15, 2) DEFAULT 10000.00,
    budgeting_method VARCHAR(50) DEFAULT '50/30/20 Rule',
    financial_year_start VARCHAR(20) DEFAULT 'April',
    monthly_expense_budget NUMERIC(15, 2) DEFAULT 35000.00,
    short_term_goal VARCHAR(255),
    long_term_goal VARCHAR(255),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS accounts (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    account_type VARCHAR(30) NOT NULL CHECK (account_type IN ('CASH_WALLET', 'SAVINGS_BANK', 'CURRENT_BANK', 'OTHER')),
    opening_balance NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    current_balance NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    institution_name VARCHAR(100),
    account_number_mask VARCHAR(20),
    color_hex VARCHAR(10) DEFAULT '#10B981',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS financial_transactions (
    id VARCHAR(50) PRIMARY KEY,
    transaction_date DATE NOT NULL,
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('INCOME', 'EXPENSE', 'TRANSFER')),
    amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
    category VARCHAR(80) NOT NULL,
    description VARCHAR(255) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    account_id VARCHAR(50) NOT NULL,
    target_account_id VARCHAR(50),
    notes VARCHAR(500),
    tags VARCHAR(255),
    is_cleared BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_tx_source_account FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE RESTRICT,
    CONSTRAINT fk_tx_target_account FOREIGN KEY (target_account_id) REFERENCES accounts(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS budgets (
    id VARCHAR(50) PRIMARY KEY,
    category VARCHAR(80) NOT NULL UNIQUE,
    monthly_limit NUMERIC(15, 2) NOT NULL CHECK (monthly_limit > 0),
    color_hex VARCHAR(10) DEFAULT '#6366F1',
    carry_forward_enabled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS savings_goals (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    target_amount NUMERIC(15, 2) NOT NULL CHECK (target_amount > 0),
    current_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (current_amount >= 0),
    target_date DATE NOT NULL,
    priority VARCHAR(20) DEFAULT 'MEDIUM' CHECK (priority IN ('HIGH', 'MEDIUM', 'LOW')),
    notes VARCHAR(255),
    color_hex VARCHAR(10) DEFAULT '#06B6D4',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS recurring_transactions (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(120) NOT NULL,
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('INCOME', 'EXPENSE')),
    amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
    frequency VARCHAR(20) NOT NULL CHECK (frequency IN ('DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY')),
    due_day INT NOT NULL CHECK (due_day BETWEEN 1 AND 31),
    category VARCHAR(80) NOT NULL,
    account_id VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    last_processed_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_rec_account FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
);

-- Performance Optimization Indexes
CREATE INDEX IF NOT EXISTS idx_tx_date ON financial_transactions(transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_tx_account ON financial_transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_tx_category ON financial_transactions(category);
