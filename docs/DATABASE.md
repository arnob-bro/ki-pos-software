# Database Documentation

## Overview
The KI POS System uses SQLite as its database engine with a file-based approach. The database is located at `backend/pos.db` and uses the `better-sqlite3` library for Node.js integration.

## Database Schema

### Core Tables

#### users
Stores employee/user information and authentication data.

```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,                    -- UUID as TEXT
  name VARCHAR NOT NULL,                  -- Full name
  email VARCHAR NOT NULL UNIQUE,          -- Email address
  password_hash TEXT NOT NULL,            -- Hashed password
  role_id INTEGER,                        -- Foreign key to roles
  status VARCHAR NOT NULL CHECK (status IN ('active', 'suspended', 'deleted')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (role_id) REFERENCES roles(id)
);
```

**Indexes:**
- `idx_users_email` - Email lookup
- `idx_users_name` - Name search

#### roles
Defines user roles for RBAC system.

```sql
CREATE TABLE roles (
  id INTEGER PRIMARY KEY,
  name VARCHAR NOT NULL                   -- 'admin', 'manager', 'cashier'
);
```

#### permissions
Stores granular permissions for the RBAC system.

```sql
CREATE TABLE permissions (
  id INTEGER PRIMARY KEY,
  code VARCHAR NOT NULL,                  -- e.g., 'VIEW_REPORTS', 'EDIT_PRODUCTS'
  description TEXT                        -- Human-readable description
);
```

#### role_permissions
Many-to-many relationship between roles and permissions.

```sql
CREATE TABLE role_permissions (
  role_id INTEGER NOT NULL,
  permission_id INTEGER NOT NULL,
  FOREIGN KEY (role_id) REFERENCES roles(id),
  FOREIGN KEY (permission_id) REFERENCES permissions(id),
  PRIMARY KEY (role_id, permission_id)
);
```

#### products
Stores inventory items and product information.

```sql
CREATE TABLE products (
  id TEXT PRIMARY KEY,                    -- UUID stored as TEXT
  name VARCHAR NOT NULL,                  -- Product name
  category_id INTEGER,                    -- Foreign key to categories
  barcode VARCHAR,                        -- Product barcode
  price DECIMAL(10, 2),                  -- Unit price
  vat_rate DECIMAL(5, 2),                -- VAT percentage
  stock_quantity INTEGER DEFAULT 0,       -- Current stock level
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id)
);
```

**Indexes:**
- `idx_products_name` - Name search
- `idx_products_stock` - Stock level queries

#### categories
Product categorization system.

```sql
CREATE TABLE categories (
  id INTEGER PRIMARY KEY,
  name VARCHAR NOT NULL,                  -- Category name
  description TEXT                        -- Category description
);
```

#### customers
Customer information and loyalty data.

```sql
CREATE TABLE customers (
  id TEXT PRIMARY KEY,                    -- UUID
  name VARCHAR NOT NULL,                  -- Customer name
  phone VARCHAR,                          -- Phone number
  email VARCHAR,                          -- Email address
  address TEXT,                           -- Physical address
  loyalty_points INTEGER DEFAULT 0,       -- Loyalty program points
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Indexes:**
- `idx_customers_name` - Name search

#### transactions
Sales transactions and payment records.

```sql
CREATE TABLE transactions (
  id TEXT PRIMARY KEY,                    -- UUID
  user_id TEXT NOT NULL,                  -- Employee who made the sale
  customer_id TEXT,                       -- Customer (optional)
  shift_id TEXT,                          -- Associated shift
  payment_method VARCHAR NOT NULL,        -- cash, card, voucher, etc.
  total_amount DECIMAL(10, 2) NOT NULL,   -- Total transaction amount
  vat_amount DECIMAL(10, 2) DEFAULT 0.00, -- VAT amount
  discount_amount DECIMAL(10, 2) DEFAULT 0.00, -- Discount applied
  tse_signature TEXT,                     -- TSE signature for compliance
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (customer_id) REFERENCES customers(id),
  FOREIGN KEY (shift_id) REFERENCES shifts(id)
);
```

**Indexes:**
- `idx_transactions_user_id` - User lookup
- `idx_transactions_timestamp` - Time-based queries
- `idx_transactions_date` - Date-based queries
- `idx_transactions_payment_method` - Payment method filtering
- `idx_transactions_total_amount` - Amount-based queries

#### transaction_items
Individual items within a transaction.

```sql
CREATE TABLE transaction_items (
  id TEXT PRIMARY KEY,                    -- UUID
  transaction_id TEXT NOT NULL,           -- Parent transaction
  product_id TEXT NOT NULL,               -- Product sold
  quantity INTEGER NOT NULL,              -- Quantity sold
  unit_price DECIMAL(10, 2) NOT NULL,     -- Price per unit
  vat_amount DECIMAL(10, 2) DEFAULT 0.00, -- VAT for this item
  discount_applied DECIMAL(10, 2) DEFAULT 0.00, -- Discount for this item
  FOREIGN KEY (transaction_id) REFERENCES transactions(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);
```

**Indexes:**
- `idx_transaction_items_transaction_id` - Transaction lookup
- `idx_transaction_items_product_id` - Product lookup

#### shifts
Employee work sessions and shift tracking.

```sql
CREATE TABLE shifts (
  id TEXT PRIMARY KEY,                    -- UUID
  user_id TEXT NOT NULL,                  -- Employee
  start_time TIMESTAMP NOT NULL,          -- Shift start
  end_time TIMESTAMP,                     -- Shift end (null if active)
  total_sales DECIMAL(10, 2) DEFAULT 0.00, -- Total sales during shift
  cash_handled DECIMAL(10, 2) DEFAULT 0.00, -- Cash handled during shift
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

#### vouchers
Gift cards and voucher system.

```sql
CREATE TABLE vouchers (
  id TEXT PRIMARY KEY,                    -- UUID
  code VARCHAR NOT NULL UNIQUE,           -- Voucher code
  amount DECIMAL(10, 2) NOT NULL,         -- Voucher value
  customer_id TEXT,                       -- Assigned customer
  expiry_date DATE,                       -- Expiration date
  status VARCHAR NOT NULL CHECK (status IN ('active', 'used', 'expired')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id)
);
```

### Audit & Compliance Tables

#### audit_logs
Comprehensive audit trail for compliance.

```sql
CREATE TABLE audit_logs (
  id TEXT PRIMARY KEY,                    -- UUID
  user_id TEXT NOT NULL,                  -- User who performed action
  action_type VARCHAR NOT NULL CHECK (action_type IN ('CREATE', 'UPDATE', 'DELETE')),
  table_name VARCHAR NOT NULL,            -- Affected table
  record_id TEXT NOT NULL,                -- Affected record
  old_data TEXT,                          -- Previous data (JSON)
  new_data TEXT,                          -- New data (JSON)
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

#### data_deletion_logs
Specialized logging for data deletion (GDPR compliance).

```sql
CREATE TABLE data_deletion_logs (
  id TEXT PRIMARY KEY,                    -- UUID
  user_id TEXT NOT NULL,                  -- User who deleted
  deleted_entity VARCHAR NOT NULL,        -- Type of data deleted
  record_id TEXT NOT NULL,                -- Deleted record ID
  reason TEXT,                            -- Deletion reason
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

#### login_attempts
Security logging for authentication attempts.

```sql
CREATE TABLE login_attempts (
  id TEXT PRIMARY KEY,                    -- UUID
  user_id TEXT,                           -- User (null for failed attempts)
  success BOOLEAN NOT NULL,               -- Success status
  ip_address VARCHAR,                     -- IP address
  device_info TEXT,                       -- Device information
  location VARCHAR,                       -- Geographic location
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

#### tse_logs
Technical Security Equipment logs for compliance.

```sql
CREATE TABLE tse_logs (
  id TEXT PRIMARY KEY,                    -- UUID
  transaction_id TEXT NOT NULL,           -- Associated transaction
  tse_signature TEXT NOT NULL,            -- TSE signature
  device_id VARCHAR,                      -- TSE device identifier
  generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (transaction_id) REFERENCES transactions(id)
);
```

### Report & Analytics Tables

#### generated_reports
Stores generated reports for caching and history.

```sql
CREATE TABLE generated_reports (
  id TEXT PRIMARY KEY,                    -- UUID
  type VARCHAR NOT NULL CHECK (type IN ('x_report', 'z_report', 'daily', 'monthly', 'tax', 'employee')),
  generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  data_blob TEXT,                         -- Report data (JSON)
  user_id TEXT,                           -- User who generated report
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

#### languages
Multi-language support configuration.

```sql
CREATE TABLE languages (
  id INTEGER PRIMARY KEY,
  code VARCHAR UNIQUE NOT NULL,           -- Language code (en, de, etc.)
  label VARCHAR NOT NULL,                 -- Language name
  is_default BOOLEAN DEFAULT 0            -- Default language flag
);
```

## Relationships

### Primary Relationships
- **users** → **roles** (Many-to-One)
- **users** → **shifts** (One-to-Many)
- **users** → **transactions** (One-to-Many)
- **products** → **categories** (Many-to-One)
- **transactions** → **customers** (Many-to-One)
- **transactions** → **transaction_items** (One-to-Many)
- **transaction_items** → **products** (Many-to-One)

### Many-to-Many Relationships
- **roles** ↔ **permissions** (via role_permissions)

## Migration System

### Migration Files
- `001_init.sql` - Initial schema creation
- `002_seed_data.sql` - Seed data and default values
- `003_update_report_types.sql` - Report type updates

### Migration Runner
Located at `backend/migrations/runner.js`, the migration system:
- Automatically detects and runs pending migrations
- Maintains migration history in the database
- Supports rollback functionality
- Validates migration integrity

### Running Migrations
```bash
# Run all pending migrations
npm run migrate

# Run specific migration
node migrations/runner.js --migration=001_init.sql
```

## Data Integrity

### Constraints
- Foreign key constraints on all relationships
- Check constraints on status fields
- Unique constraints on email addresses and voucher codes
- NOT NULL constraints on required fields

### Triggers
- Automatic timestamp updates on record modifications
- Stock quantity updates on transaction completion
- Audit log creation on data changes

## Performance Optimization

### Indexes
- Composite indexes for common query patterns
- Indexes on frequently searched fields
- Indexes on foreign key columns

### Query Optimization
- Prepared statements for repeated queries
- Connection pooling for concurrent access
- Efficient pagination with LIMIT/OFFSET

## Backup & Recovery

### Backup Strategy
- Regular automated backups
- Transaction log backups
- Point-in-time recovery capability

### Recovery Procedures
- Database restoration from backup
- Migration replay for schema recovery
- Data integrity verification

## Security Considerations

### Data Protection
- Password hashing with bcrypt
- Sensitive data encryption
- Audit trail for all changes

### Access Control
- Role-based permissions
- Session management
- Input validation and sanitization

## Monitoring & Maintenance

### Database Monitoring
- Query performance monitoring
- Storage space monitoring
- Connection pool monitoring

### Maintenance Tasks
- Regular VACUUM operations
- Index optimization
- Statistics updates 