-- Roles
INSERT OR IGNORE INTO roles (id, name) VALUES (1, 'admin');
INSERT OR IGNORE INTO roles (id, name) VALUES (2, 'manager');
INSERT OR IGNORE INTO roles (id, name) VALUES (3, 'cashier');


-- Users (password_hash will be updated by app.js with proper hash)
INSERT OR IGNORE INTO users (id, name, email, password_hash, role_id, status)
VALUES ('user-1', 'Admin User', 'admin@example.com', 'temp_hash', 1, 'active');
INSERT OR IGNORE INTO users (id, name, email, password_hash, role_id, status)
VALUES ('user-2', 'Manager User', 'manager@example.com', 'temp_hash', 2, 'active');
INSERT OR IGNORE INTO users (id, name, email, password_hash, role_id, status)
VALUES ('user-3', 'Cashier User', 'cashier@example.com', 'temp_hash', 3, 'active');


-- permissions 
INSERT OR IGNORE INTO permissions (id, code, description)
VALUES (1, 'pos:view', 'can view pos sales interface');
INSERT OR IGNORE INTO permissions (id, code, description)
VALUES (2, 'receiptarchive:view', 'can view receipt archive');
INSERT OR IGNORE INTO permissions (id, code, description)
VALUES (3, 'dashboard:view', 'can view dashboard');
INSERT OR IGNORE INTO permissions (id, code, description)
VALUES (4, 'inventory:view', 'can view inventory management');
INSERT OR IGNORE INTO permissions (id, code, description)
VALUES (5, 'product:view', 'can view product management');
INSERT OR IGNORE INTO permissions (id, code, description)
VALUES (6, 'customer:view', 'can view customer management');
INSERT OR IGNORE INTO permissions (id, code, description)
VALUES (7, 'report:view', 'can view reports');
INSERT OR IGNORE INTO permissions (id, code, description)
VALUES (8, 'settings:view', 'can view settings');
INSERT OR IGNORE INTO permissions (id, code, description)
VALUES (9, 'company:view', 'can view company profile');
INSERT OR IGNORE INTO permissions (id, code, description)
VALUES (10, 'paymentsettings:view', 'can view payment settings');
INSERT OR IGNORE INTO permissions (id, code, description)
VALUES (11, 'ALL', 'Admin has all access');
INSERT OR IGNORE INTO permissions (id, code, description)
VALUES (12, 'employee:view', 'can view employee management');


-- role_permissions 
INSERT OR IGNORE INTO role_permissions (role_id, permission_id)
VALUES (1,1);
INSERT OR IGNORE INTO role_permissions (role_id, permission_id)
VALUES (1,2);
INSERT OR IGNORE INTO role_permissions (role_id, permission_id)
VALUES (1,3);
INSERT OR IGNORE INTO role_permissions (role_id, permission_id)
VALUES (1,4);
INSERT OR IGNORE INTO role_permissions (role_id, permission_id)
VALUES (1,5);
INSERT OR IGNORE INTO role_permissions (role_id, permission_id)
VALUES (1,6);
INSERT OR IGNORE INTO role_permissions (role_id, permission_id)
VALUES (1,7);
INSERT OR IGNORE INTO role_permissions (role_id, permission_id)
VALUES (1,8);
INSERT OR IGNORE INTO role_permissions (role_id, permission_id)
VALUES (1,9);
INSERT OR IGNORE INTO role_permissions (role_id, permission_id)
VALUES (1,11);
INSERT OR IGNORE INTO role_permissions (role_id, permission_id)
VALUES (1,12);


-- Categories
INSERT OR IGNORE INTO categories (id, name, description) VALUES (1, 'Default', 'Default category');

-- Products
INSERT OR IGNORE INTO products (id, name, category_id, barcode, price, vat_rate, stock_quantity)
VALUES ('prod-1', 'Protein Powder', 1, '1000000000000', 10.00, 5.00, 100);
INSERT OR IGNORE INTO products (id, name, category_id, barcode, price, vat_rate, stock_quantity)
VALUES ('prod-2', 'Bread', 1, '1000000000001', 2.00, 5.00, 50);
INSERT OR IGNORE INTO products (id, name, category_id, barcode, price, vat_rate, stock_quantity)
VALUES ('prod-3', 'Milk', 1, '1000000000002', 3.50, 5.00, 30);
INSERT OR IGNORE INTO products (id, name, category_id, barcode, price, vat_rate, stock_quantity)
VALUES ('prod-4', 'Eggs (dozen)', 1, '1000000000003', 4.00, 5.00, 40);
INSERT OR IGNORE INTO products (id, name, category_id, barcode, price, vat_rate, stock_quantity)
VALUES ('prod-5', 'Butter', 1, '1000000000004', 2.50, 5.00, 25);
INSERT OR IGNORE INTO products (id, name, category_id, barcode, price, vat_rate, stock_quantity)
VALUES ('prod-6', 'Apples', 1, '1000000000005', 5.00, 5.00, 60);
INSERT OR IGNORE INTO products (id, name, category_id, barcode, price, vat_rate, stock_quantity)
VALUES ('prod-7', 'Orange Juice', 1, '1000000000006', 6.00, 5.00, 20);

-- Customers
INSERT OR IGNORE INTO customers (id, name) VALUES ('cust-1', 'Default Customer');

-- Shifts
INSERT OR IGNORE INTO shifts (id, user_id, start_time)
VALUES ('shift-1', 'user-1', '2024-06-01 08:00:00');

-- Transactions (insert with tse_signature NULL for now)
INSERT OR IGNORE INTO transactions (id, user_id, customer_id, shift_id, payment_method, total_amount, tse_signature)
VALUES ('txn-1', 'user-1', 'cust-1', 'shift-1', 'cash', 10.00, NULL);

-- TSE Logs (reference the transaction)
INSERT OR IGNORE INTO tse_logs (id, transaction_id, tse_signature)
VALUES ('tse-1', 'txn-1', 'sig-abc');

-- Now update the transaction to set tse_signature
UPDATE transactions SET tse_signature = 'sig-abc' WHERE id = 'txn-1';

-- Transaction Items
INSERT OR IGNORE INTO transaction_items (id, transaction_id, product_id, quantity, unit_price)
VALUES ('item-1', 'txn-1', 'prod-1', 1, 10.00);

-- Generated Reports
INSERT OR IGNORE INTO generated_reports (id, type, user_id)
VALUES ('rep-1', 'daily', 'user-1');

-- Languages
INSERT OR IGNORE INTO languages (id, code, label, is_default)
VALUES (1, 'en', 'English', 1);

-- Audit Logs
INSERT OR IGNORE INTO audit_logs (id, user_id, action_type, table_name, record_id)
VALUES ('log-1', 'user-1', 'CREATE', 'products', 'prod-1');

-- Data Deletion Logs
INSERT OR IGNORE INTO data_deletion_logs (id, user_id, deleted_entity, record_id)
VALUES ('del-1', 'user-1', 'products', 'prod-1');


-- Login Attempts
INSERT OR IGNORE INTO login_attempts (id, user_id, success)
VALUES ('login-1', 'user-1', 1);