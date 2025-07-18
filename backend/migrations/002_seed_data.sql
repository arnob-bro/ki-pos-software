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
INSERT OR IGNORE INTO permissions (id, code, description) VALUES
-- POS Sales Interface
(1, 'pos:view', 'Can view POS sales interface'),
(2, 'pos:addproduct', 'Can add product to POS'),
(3, 'pos:removeproduct', 'Can remove product from POS'),
(4, 'pos:applydiscount', 'Can apply discount'),
(5, 'pos:overridediscount', 'Can override discount'),
(6, 'pos:selectordertype', 'Can select order type'),
(7, 'pos:parkreceipt', 'Can park receipt'),
(8, 'pos:resumereceipt', 'Can resume receipt'),
(9, 'pos:deletereceipt', 'Can delete receipt'),
(10, 'pos:printreceipt', 'Can print receipt'),
(11, 'pos:printkitchencopy', 'Can print kitchen copy'),
(12, 'pos:opendrawer', 'Can open drawer'),
(13, 'pos:handlepayment', 'Can handle payment'),
(14, 'pos:refund', 'Can process refund'),
(15, 'pos:cancelfinalizedtransaction', 'Can cancel finalized transaction'),
(16, 'pos:overridesale', 'Can override sale'),
-- Receipt Archive
(17, 'receiptarchive:view', 'Can view receipt archive'),
(18, 'receiptarchive:search', 'Can search in receipt archive'),
(19, 'receiptarchive:viewdetails', 'Can view receipt details'),
(20, 'receiptarchive:reprint', 'Can reprint receipt'),
(21, 'receiptarchive:exportpdf', 'Can export receipt as PDF'),
(22, 'receiptarchive:viewtaxinfo', 'Can view tax information'),
-- Table Reservation
(23, 'table:view', 'Can view tables'),
(24, 'table:reserve', 'Can reserve a table'),
(25, 'table:attachreceipt', 'Can attach receipt to table'),
(26, 'table:release', 'Can release table'),
-- Dashboard
(27, 'dashboard:view', 'Can view dashboard'),
(28, 'dashboard:viewsalessummary', 'Can view sales summary'),
(29, 'dashboard:viewbestsellers', 'Can view best sellers'),
(30, 'dashboard:viewrevenueperemployee', 'Can view revenue per employee'),
(31, 'dashboard:viewalerts', 'Can view alerts'),
-- Inventory Management
(32, 'inventory:view', 'Can view inventory'),
(33, 'inventory:add', 'Can add inventory items'),
(34, 'inventory:update', 'Can update inventory items'),
(35, 'inventory:delete', 'Can delete inventory items'),
(36, 'inventory:receivegoods', 'Can receive goods'),
(37, 'inventory:stocktake', 'Can perform stocktake'),
(38, 'inventory:setalerts', 'Can set inventory alerts'),
(39, 'inventory:viewhistory', 'Can view inventory history'),
(40, 'inventory:autorestockconfig', 'Can configure auto restock'),
(41, 'inventory:viewauditlog', 'Can view inventory audit log'),
-- Product Management
(42, 'productmanagement:view', 'Can view product management'),
(43, 'productmanagement:add', 'Can add products'),
(44, 'productmanagement:update', 'Can update products'),
(45, 'productmanagement:delete', 'Can delete products'),
(46, 'productmanagement:setpricingtiers', 'Can set pricing tiers'),
(47, 'productmanagement:assigngroup', 'Can assign product groups'),
(48, 'productmanagement:setbarcode', 'Can set product barcodes'),
(49, 'productmanagement:definecostcenter', 'Can define cost center'),
(50, 'productmanagement:bulkimport', 'Can bulk import products'),
(51, 'productmanagement:bulkexport', 'Can bulk export products'),
(52, 'productmanagement:settaxclass', 'Can set tax class'),
(53, 'productmanagement:setdefaultdiscount', 'Can set default discount'),
(54, 'productmanagement:setlossreturnthreshold', 'Can set loss/return threshold'),
-- Customer Management
(55, 'customermanagement:view', 'Can view customer management'),
(56, 'customermanagement:add', 'Can add customers'),
(57, 'customermanagement:update', 'Can update customers'),
(58, 'customermanagement:delete', 'Can delete customers'),
(59, 'customermanagement:viewhistory', 'Can view customer history'),
(60, 'customermanagement:assignloyalty', 'Can assign loyalty points'),
(61, 'customermanagement:mergeduplicates', 'Can merge duplicate customers'),
-- Reports
(62, 'report:view', 'Can view reports'),
(63, 'report:generatex', 'Can generate X reports'),
(64, 'report:generatez', 'Can generate Z reports'),
(65, 'report:generatesalesbycategory', 'Can generate sales by category'),
(66, 'report:generatesalesbytime', 'Can generate sales by time'),
(67, 'report:generatesalesbyoperator', 'Can generate sales by operator'),
(68, 'report:generatetaxbreakdown', 'Can generate tax breakdown'),
(69, 'report:exportgobd', 'Can export GoBD report'),
(70, 'report:exportgdpdu', 'Can export GDPdU report'),
(71, 'report:downloadarchive', 'Can download archived data'),
(72, 'report:configureschedule', 'Can configure report schedule'),
-- Employee Management
(73, 'employee:view', 'Can view employees'),
(74, 'employee:add', 'Can add employees'),
(75, 'employee:update', 'Can update employees'),
(76, 'employee:delete', 'Can delete employees'),
(77, 'employee:updatestatus', 'Can update employee status'),
(78, 'employee:viewstats', 'Can view employee stats'),
(79, 'employee:assignrole', 'Can assign roles to employees'),
(80, 'employee:setpermissions', 'Can set employee permissions'),
(81, 'employee:viewloginhistory', 'Can view login history'),
(82, 'employee:assignshift', 'Can assign shifts'),
(83, 'employee:viewrevenue', 'Can view employee revenue'),
(84, 'employee:viewlist', 'Can view employee list'),
(85, 'employee:listroles', 'Can list roles'),
-- System Settings
(86, 'settings:view', 'Can view system settings'),
(87, 'settings:update', 'Can update system settings'),
(88, 'settings:configurevat', 'Can configure VAT'),
(89, 'settings:configurecompanyinfo', 'Can configure company info'),
(90, 'settings:configurecurrency', 'Can configure currency'),
(91, 'settings:configurelanguage', 'Can configure language'),
(92, 'settings:configurebackuppath', 'Can configure backup path'),
-- Company Profile
(93, 'company:view', 'Can view company profile'),
(94, 'company:update', 'Can update company profile'),
(95, 'company:configurelegal', 'Can configure legal information'),
(96, 'company:configurelogo', 'Can configure logo'),
(97, 'company:configurevatnumber', 'Can configure VAT number'),
(98, 'company:configuregobdgdpdu', 'Can configure GoBD/GDPdU'),
-- Payment Settings
(99, 'paymentsettings:view', 'Can view payment settings'),
(100, 'paymentsettings:update', 'Can update payment settings'),
(101, 'paymentsettings:enablemethod', 'Can enable payment methods'),
(102, 'paymentsettings:disablemethod', 'Can disable payment methods'),
(103, 'paymentsettings:setdefaultcurrency', 'Can set default currency'),
(104, 'paymentsettings:setcardfee', 'Can set card fee'),
(105, 'paymentsettings:configureinvoice', 'Can configure invoice'),
-- Data Backup & Restore
(106, 'backup:configurepath', 'Can configure backup path'),
(107, 'backup:trigger', 'Can trigger backup'),
(108, 'backup:restore', 'Can restore data'),
(109, 'backup:viewlogs', 'Can view backup logs'),
-- Hardware Configuration
(110, 'hardware:configureecterminal', 'Can configure EC terminal'),
(111, 'hardware:configuredrawer', 'Can configure cash drawer'),
(112, 'hardware:configureprinter', 'Can configure printer'),
(113, 'hardware:configureofflinesync', 'Can configure offline sync'),
(114, 'hardware:enablemodule', 'Can enable hardware module'),
(115, 'hardware:disablemodule', 'Can disable hardware module'),
-- Audit & Logs
(116, 'audit:viewlogs', 'Can view audit logs'),
(117, 'audit:viewdatadeletionlogs', 'Can view data deletion logs'),
(118, 'audit:viewloginattempts', 'Can view login attempts'),
-- Vouchers
(119, 'voucher:view', 'Can view vouchers'),
(120, 'voucher:add', 'Can add vouchers'),
(121, 'voucher:update', 'Can update vouchers'),
(122, 'voucher:delete', 'Can delete vouchers'),
(123, 'voucher:assigntocustomer', 'Can assign vouchers to customers'),
(124, 'voucher:redeem', 'Can redeem vouchers'),
-- Shifts
(125, 'shift:view', 'Can view shifts'),
(126, 'shift:add', 'Can add shifts'),
(127, 'shift:update', 'Can update shifts'),
(128, 'shift:close', 'Can close shifts'),
(129, 'shift:viewstats', 'Can view shift stats'),
-- Languages
(130, 'language:view', 'Can view languages'),
(131, 'language:add', 'Can add languages'),
(132, 'language:update', 'Can update languages'),
(133, 'language:delete', 'Can delete languages'),
(134, 'language:setdefault', 'Can set default language'),
-- Admin All Access
(135, 'ALL', 'Admin has all access');




-- role_permissions 
INSERT OR IGNORE INTO role_permissions (role_id, permission_id)
VALUES (1,135);
INSERT OR IGNORE INTO role_permissions (role_id, permission_id)
VALUES (2,27);




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
INSERT OR IGNORE INTO shifts (id, start_time)
VALUES ('shift-1', '2024-06-01 08:00:00');

-- Shift Assignments
INSERT OR IGNORE INTO shift_assignments (id, shift_id, user_id)
VALUES ('assign-1', 'shift-1', 'user-1');

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