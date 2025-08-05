-- Table: roles
CREATE TABLE roles (
  id INTEGER PRIMARY KEY,
  name VARCHAR NOT NULL -- 'admin', 'manager', 'cashier'
);

-- Table: permissions
CREATE TABLE permissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code VARCHAR NOT NULL, -- e.g., 'VIEW_REPORTS', 'EDIT_PRODUCTS', etc.
  description TEXT
);

-- Table: role_permissions
CREATE TABLE role_permissions (
  role_id INTEGER NOT NULL,
  permission_id INTEGER NOT NULL,
  FOREIGN KEY (role_id) REFERENCES roles(id),
  FOREIGN KEY (permission_id) REFERENCES permissions(id),
  PRIMARY KEY (role_id, permission_id)
);

-- Table: users
CREATE TABLE users (
  id TEXT PRIMARY KEY, -- UUID as TEXT
  name VARCHAR NOT NULL,
  email VARCHAR NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role_id INTEGER,
  status VARCHAR NOT NULL CHECK (status IN ('active', 'suspended', 'deleted')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (role_id) REFERENCES roles(id)
);

-- Table: categories
CREATE TABLE categories (
  id INTEGER PRIMARY KEY,
  name VARCHAR NOT NULL,
  description TEXT
);

-- Table: products
CREATE TABLE products (
  id TEXT PRIMARY KEY, -- UUID stored as TEXT in SQLite
  name VARCHAR NOT NULL,
  category_id INTEGER,
  barcode VARCHAR,
  price DECIMAL(10, 2),
  vat_rate DECIMAL(5, 2),
  stock_quantity INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- Table: customers
CREATE TABLE customers (
  id TEXT PRIMARY KEY,
  name VARCHAR NOT NULL,
  phone VARCHAR,
  email VARCHAR,
  address TEXT,
  loyalty_points INTEGER DEFAULT 0,
  loyalty_tier VARCHAR, -- e.g., Silver, Gold, Platinum
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: vouchers
CREATE TABLE vouchers (
  id TEXT PRIMARY KEY,
  code VARCHAR NOT NULL UNIQUE,
  amount DECIMAL(10, 2) NOT NULL,
  customer_id TEXT,
  expiry_date DATE,
  status VARCHAR NOT NULL CHECK (status IN ('active', 'used', 'expired')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id)
);

-- Table: shifts
CREATE TABLE shifts (
  id TEXT PRIMARY KEY,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP,
  total_sales DECIMAL(10, 2) DEFAULT 0.00,
  cash_handled DECIMAL(10, 2) DEFAULT 0.00
);

-- Table: shift_assignments
CREATE TABLE IF NOT EXISTS shift_assignments (
  id TEXT PRIMARY KEY,
  shift_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (shift_id) REFERENCES shifts(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Table: transactions
CREATE TABLE transactions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  customer_id TEXT,
  shift_id TEXT,
  payment_method VARCHAR NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  vat_amount DECIMAL(10, 2) DEFAULT 0.00,
  discount_amount DECIMAL(10, 2) DEFAULT 0.00,
  tse_signature TEXT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (customer_id) REFERENCES customers(id),
  FOREIGN KEY (shift_id) REFERENCES shifts(id)
);

-- Table: tse_logs
CREATE TABLE tse_logs (
  id TEXT PRIMARY KEY,
  transaction_id TEXT NOT NULL,
  tse_signature TEXT NOT NULL,
  device_id VARCHAR,
  generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (transaction_id) REFERENCES transactions(id)
);

-- Table: transaction_items
CREATE TABLE transaction_items (
  id TEXT PRIMARY KEY,
  transaction_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  vat_amount DECIMAL(10, 2) DEFAULT 0.00,
  discount_applied DECIMAL(10, 2) DEFAULT 0.00,
  FOREIGN KEY (transaction_id) REFERENCES transactions(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Table: generated_reports
CREATE TABLE generated_reports (
  id TEXT PRIMARY KEY,
  type VARCHAR NOT NULL CHECK (type IN ('x_report', 'z_report')),
  generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  data_blob TEXT,
  user_id TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Table: languages
CREATE TABLE IF NOT EXISTS languages (
  id INTEGER PRIMARY KEY,
  code VARCHAR UNIQUE NOT NULL,
  label VARCHAR NOT NULL,
  is_default BOOLEAN DEFAULT 0
);

CREATE TABLE IF NOT EXISTS company_info (
    id TEXT PRIMARY KEY,
    companyName TEXT,
    legalAddress TEXT,
    vatNumber TEXT,
    gobdEnabled INTEGER,
    logoPath TEXT
);

CREATE TABLE IF NOT EXISTS system_settings (
    id TEXT PRIMARY KEY,
    backupPath TEXT,
    vat TEXT,
    currency TEXT
);

-- Table: audit_logs
CREATE TABLE audit_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  action_type VARCHAR NOT NULL CHECK (action_type IN ('CREATE', 'UPDATE', 'DELETE')),
  table_name VARCHAR NOT NULL,
  record_id TEXT NOT NULL,
  old_data TEXT,
  new_data TEXT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Table: data_deletion_logs
CREATE TABLE data_deletion_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  deleted_entity VARCHAR NOT NULL,
  record_id TEXT NOT NULL,
  reason TEXT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Table: login_attempts
CREATE TABLE login_attempts (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  success BOOLEAN NOT NULL,
  ip_address VARCHAR,
  device_info TEXT,
  location VARCHAR,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_timestamp ON transactions(timestamp);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(DATE(timestamp));
CREATE INDEX IF NOT EXISTS idx_transactions_payment_method ON transactions(payment_method);
CREATE INDEX IF NOT EXISTS idx_transactions_total_amount ON transactions(total_amount);
CREATE INDEX IF NOT EXISTS idx_transaction_items_transaction_id ON transaction_items(transaction_id);
CREATE INDEX IF NOT EXISTS idx_transaction_items_product_id ON transaction_items(product_id);
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
CREATE INDEX IF NOT EXISTS idx_products_stock ON products(stock_quantity);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_name ON users(name);
CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(name);

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_transactions_user_timestamp ON transactions(user_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_date_timestamp ON transactions(DATE(timestamp), timestamp DESC);
