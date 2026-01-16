-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ROLES
-- Defines system access levels.
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL, -- e.g., 'admin', 'trader', 'support'
    description TEXT
);

-- 2. USERS
-- Core identity table. Separated sensitive auth data conceptually.
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL, -- Store Argon2 or Bcrypt hash, NEVER plain text
    full_name VARCHAR(100) NOT NULL,
    role_id INTEGER REFERENCES roles(id) ON DELETE RESTRICT,
    phone_number VARCHAR(20),
    is_kyc_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. WALLETS (Cash Balance)
-- Separating cash allows for easier locking/transactional integrity and potential multi-currency support later.
CREATE TABLE wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    currency VARCHAR(3) DEFAULT 'INR',
    balance NUMERIC(15, 2) DEFAULT 0.00 CHECK (balance >= 0), -- Prevent overdrafts at DB level
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_user_currency UNIQUE (user_id, currency)
);

-- 4. ASSETS
-- Tradable instruments (Stocks, Mutual Funds, etc.)
CREATE TABLE assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    symbol VARCHAR(20) UNIQUE NOT NULL, -- e.g., 'RELIANCE', 'TCS'
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'EQUITY', 'MUTUAL_FUND', 'IPO'
    exchange VARCHAR(20) NOT NULL, -- 'NSE', 'BSE'
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. INVESTMENTS (Current Portfolio/Holdings)
-- Represents the current state of a user's ownership.
CREATE TABLE investments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    asset_id UUID REFERENCES assets(id) ON DELETE RESTRICT,
    quantity NUMERIC(15, 2) NOT NULL CHECK (quantity >= 0),
    average_buy_price NUMERIC(15, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_user_asset UNIQUE (user_id, asset_id)
);

-- 6. TRANSACTIONS
-- Immutable ledger of all money and asset movements.
-- Used to reconstruct portfolio state if needed.
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    wallet_id UUID REFERENCES wallets(id),
    asset_id UUID REFERENCES assets(id), -- Nullable for DEPOSIT/WITHDRAWAL
    type VARCHAR(20) NOT NULL, -- 'BUY', 'SELL', 'DEPOSIT', 'WITHDRAWAL', 'DIVIDEND'
    quantity NUMERIC(15, 2), -- Null for cash-only transactions
    price_per_unit NUMERIC(15, 2),
    total_amount NUMERIC(15, 2) NOT NULL, -- Impact on wallet balance
    fee NUMERIC(10, 2) DEFAULT 0.00,
    status VARCHAR(20) DEFAULT 'COMPLETED', -- 'PENDING', 'COMPLETED', 'FAILED'
    executed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. PORTFOLIO SNAPSHOTS
-- Daily/Hourly snapshots for performance charting (Time-Series data).
CREATE TABLE portfolio_snapshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    total_equity_value NUMERIC(15, 2) NOT NULL,
    cash_balance NUMERIC(15, 2) NOT NULL,
    total_portfolio_value NUMERIC(15, 2) NOT NULL,
    snapshot_date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. AUDIT LOGS
-- Security requirement. Tracks "Who did What and When".
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Keep log even if user deleted
    action VARCHAR(100) NOT NULL, -- e.g., 'LOGIN_SUCCESS', 'ORDER_PLACED', 'KYC_UPDATED'
    resource_entity VARCHAR(50), -- e.g., 'transaction', 'user_profile'
    resource_id UUID,
    ip_address INET,
    user_agent TEXT,
    details JSONB, -- Flexible field for before/after state
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_assets_symbol ON assets(symbol);
CREATE INDEX idx_transactions_user_date ON transactions(user_id, executed_at DESC);
CREATE INDEX idx_investments_user ON investments(user_id);
CREATE INDEX idx_snapshots_user_date ON portfolio_snapshots(user_id, snapshot_date);
CREATE INDEX idx_audit_logs_user_action ON audit_logs(user_id, action);
