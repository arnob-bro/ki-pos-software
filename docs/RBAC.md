# RBAC (Role-Based Access Control) Documentation

## Overview
The KI POS System implements a comprehensive Role-Based Access Control (RBAC) system with 135 granular permissions organized into 20 categories. The system uses a combination of role-based and permission-based access control for maximum flexibility.

## Architecture

### Core Components
- **Roles**: Predefined user categories (admin, manager, cashier)
- **Permissions**: 135 granular access rights for specific actions
- **Role-Permission Mapping**: Many-to-many relationship between roles and permissions
- **Permission Checking**: Runtime validation in both backend and frontend

### Database Schema
```sql
-- Roles table
CREATE TABLE roles (
  id INTEGER PRIMARY KEY,
  name VARCHAR NOT NULL
);

-- Permissions table
CREATE TABLE permissions (
  id INTEGER PRIMARY KEY,
  code VARCHAR NOT NULL,
  description TEXT
);

-- Role-Permission mapping
CREATE TABLE role_permissions (
  role_id INTEGER NOT NULL,
  permission_id INTEGER NOT NULL,
  FOREIGN KEY (role_id) REFERENCES roles(id),
  FOREIGN KEY (permission_id) REFERENCES permissions(id),
  PRIMARY KEY (role_id, permission_id)
);

-- Users with role assignment
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  name VARCHAR NOT NULL,
  email VARCHAR NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role_id INTEGER,
  status VARCHAR NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (role_id) REFERENCES roles(id)
);
```

## Permission System

### Permission Categories

#### 1. POS Sales Interface (16 permissions)
| Permission Code | Description | Default Roles |
|----------------|-------------|---------------|
| `pos:view` | Can view POS sales interface | Cashier, Manager, Admin |
| `pos:addproduct` | Can add product to POS | Cashier, Manager, Admin |
| `pos:removeproduct` | Can remove product from POS | Cashier, Manager, Admin |
| `pos:applydiscount` | Can apply discount | Cashier, Manager, Admin |
| `pos:overridediscount` | Can override discount | Manager, Admin |
| `pos:selectordertype` | Can select order type | Cashier, Manager, Admin |
| `pos:parkreceipt` | Can park receipt | Cashier, Manager, Admin |
| `pos:resumereceipt` | Can resume receipt | Cashier, Manager, Admin |
| `pos:deletereceipt` | Can delete receipt | Cashier, Manager, Admin |
| `pos:printreceipt` | Can print receipt | Cashier, Manager, Admin |
| `pos:printkitchencopy` | Can print kitchen copy | Cashier, Manager, Admin |
| `pos:opendrawer` | Can open drawer | Cashier, Manager, Admin |
| `pos:handlepayment` | Can handle payment | Cashier, Manager, Admin |
| `pos:refund` | Can process refund | Manager, Admin |
| `pos:cancelfinalizedtransaction` | Can cancel finalized transaction | Manager, Admin |
| `pos:overridesale` | Can override sale | Admin |

#### 2. Receipt Archive (6 permissions)
| Permission Code | Description | Default Roles |
|----------------|-------------|---------------|
| `receiptarchive:view` | Can view receipt archive | Cashier, Manager, Admin |
| `receiptarchive:search` | Can search in receipt archive | Cashier, Manager, Admin |
| `receiptarchive:viewdetails` | Can view receipt details | Cashier, Manager, Admin |
| `receiptarchive:reprint` | Can reprint receipt | Cashier, Manager, Admin |
| `receiptarchive:exportpdf` | Can export receipt as PDF | Manager, Admin |
| `receiptarchive:viewtaxinfo` | Can view tax information | Manager, Admin |

#### 3. Table Reservation (4 permissions)
| Permission Code | Description | Default Roles |
|----------------|-------------|---------------|
| `table:view` | Can view tables | Cashier, Manager, Admin |
| `table:reserve` | Can reserve a table | Cashier, Manager, Admin |
| `table:attachreceipt` | Can attach receipt to table | Cashier, Manager, Admin |
| `table:release` | Can release table | Cashier, Manager, Admin |

#### 4. Dashboard (5 permissions)
| Permission Code | Description | Default Roles |
|----------------|-------------|---------------|
| `dashboard:view` | Can view dashboard | Manager, Admin |
| `dashboard:viewsalessummary` | Can view sales summary | Manager, Admin |
| `dashboard:viewbestsellers` | Can view best sellers | Manager, Admin |
| `dashboard:viewrevenueperemployee` | Can view revenue per employee | Manager, Admin |
| `dashboard:viewalerts` | Can view alerts | Manager, Admin |

#### 5. Inventory Management (10 permissions)
| Permission Code | Description | Default Roles |
|----------------|-------------|---------------|
| `inventory:view` | Can view inventory | Manager, Admin |
| `inventory:add` | Can add inventory items | Manager, Admin |
| `inventory:update` | Can update inventory items | Manager, Admin |
| `inventory:delete` | Can delete inventory items | Admin |
| `inventory:receivegoods` | Can receive goods | Manager, Admin |
| `inventory:stocktake` | Can perform stocktake | Manager, Admin |
| `inventory:setalerts` | Can set inventory alerts | Manager, Admin |
| `inventory:viewhistory` | Can view inventory history | Manager, Admin |
| `inventory:autorestockconfig` | Can configure auto restock | Admin |
| `inventory:viewauditlog` | Can view inventory audit log | Admin |

#### 6. Product Management (13 permissions)
| Permission Code | Description | Default Roles |
|----------------|-------------|---------------|
| `productmanagement:view` | Can view product management | Manager, Admin |
| `productmanagement:add` | Can add products | Manager, Admin |
| `productmanagement:update` | Can update products | Manager, Admin |
| `productmanagement:delete` | Can delete products | Admin |
| `productmanagement:setpricingtiers` | Can set pricing tiers | Manager, Admin |
| `productmanagement:assigngroup` | Can assign product groups | Manager, Admin |
| `productmanagement:setbarcode` | Can set product barcodes | Manager, Admin |
| `productmanagement:definecostcenter` | Can define cost center | Manager, Admin |
| `productmanagement:bulkimport` | Can bulk import products | Admin |
| `productmanagement:bulkexport` | Can bulk export products | Admin |
| `productmanagement:settaxclass` | Can set tax class | Manager, Admin |
| `productmanagement:setdefaultdiscount` | Can set default discount | Manager, Admin |
| `productmanagement:setlossreturnthreshold` | Can set loss/return threshold | Admin |

#### 7. Customer Management (7 permissions)
| Permission Code | Description | Default Roles |
|----------------|-------------|---------------|
| `customermanagement:view` | Can view customer management | Manager, Admin |
| `customermanagement:add` | Can add customers | Manager, Admin |
| `customermanagement:update` | Can update customers | Manager, Admin |
| `customermanagement:delete` | Can delete customers | Admin |
| `customermanagement:viewhistory` | Can view customer history | Manager, Admin |
| `customermanagement:assignloyalty` | Can assign loyalty points | Manager, Admin |
| `customermanagement:mergeduplicates` | Can merge duplicate customers | Admin |

#### 8. Reports (12 permissions)
| Permission Code | Description | Default Roles |
|----------------|-------------|---------------|
| `report:view` | Can view reports | Manager, Admin |
| `report:generatex` | Can generate X reports | Manager, Admin |
| `report:generatez` | Can generate Z reports | Manager, Admin |
| `report:generatesalesbycategory` | Can generate sales by category | Manager, Admin |
| `report:generatesalesbytime` | Can generate sales by time | Manager, Admin |
| `report:generatesalesbyoperator` | Can generate sales by operator | Manager, Admin |
| `report:generatetaxbreakdown` | Can generate tax breakdown | Manager, Admin |
| `report:exportgobd` | Can export GoBD report | Admin |
| `report:exportgdpdu` | Can export GDPdU report | Admin |
| `report:downloadarchive` | Can download archived data | Admin |
| `report:configureschedule` | Can configure report schedule | Admin |

#### 9. Employee Management (13 permissions)
| Permission Code | Description | Default Roles |
|----------------|-------------|---------------|
| `employee:view` | Can view employees | Manager, Admin |
| `employee:add` | Can add employees | Admin |
| `employee:update` | Can update employees | Admin |
| `employee:delete` | Can delete employees | Admin |
| `employee:updatestatus` | Can update employee status | Admin |
| `employee:viewstats` | Can view employee stats | Manager, Admin |
| `employee:assignrole` | Can assign roles to employees | Admin |
| `employee:setpermissions` | Can set employee permissions | Admin |
| `employee:viewloginhistory` | Can view login history | Admin |
| `employee:assignshift` | Can assign shifts | Manager, Admin |
| `employee:viewrevenue` | Can view employee revenue | Manager, Admin |
| `employee:viewlist` | Can view employee list | Manager, Admin |
| `employee:listroles` | Can list roles | Manager, Admin |

#### 10. System Settings (7 permissions)
| Permission Code | Description | Default Roles |
|----------------|-------------|---------------|
| `settings:view` | Can view system settings | Admin |
| `settings:update` | Can update system settings | Admin |
| `settings:configurevat` | Can configure VAT | Admin |
| `settings:configurecompanyinfo` | Can configure company info | Admin |
| `settings:configurecurrency` | Can configure currency | Admin |
| `settings:configurelanguage` | Can configure language | Admin |
| `settings:configurebackuppath` | Can configure backup path | Admin |

#### 11. Company Profile (7 permissions)
| Permission Code | Description | Default Roles |
|----------------|-------------|---------------|
| `company:view` | Can view company profile | Admin |
| `company:update` | Can update company profile | Admin |
| `company:configurelegal` | Can configure legal information | Admin |
| `company:configurelogo` | Can configure logo | Admin |
| `company:configurevatnumber` | Can configure VAT number | Admin |
| `company:configuregobdgdpdu` | Can configure GoBD/GDPdU | Admin |

#### 12. Payment Settings (7 permissions)
| Permission Code | Description | Default Roles |
|----------------|-------------|---------------|
| `paymentsettings:view` | Can view payment settings | Admin |
| `paymentsettings:update` | Can update payment settings | Admin |
| `paymentsettings:enablemethod` | Can enable payment methods | Admin |
| `paymentsettings:disablemethod` | Can disable payment methods | Admin |
| `paymentsettings:setdefaultcurrency` | Can set default currency | Admin |
| `paymentsettings:setcardfee` | Can set card fee | Admin |
| `paymentsettings:configureinvoice` | Can configure invoice | Admin |

#### 13. Data Backup & Restore (4 permissions)
| Permission Code | Description | Default Roles |
|----------------|-------------|---------------|
| `backup:configurepath` | Can configure backup path | Admin |
| `backup:trigger` | Can trigger backup | Admin |
| `backup:restore` | Can restore data | Admin |
| `backup:viewlogs` | Can view backup logs | Admin |

#### 14. Hardware Configuration (6 permissions)
| Permission Code | Description | Default Roles |
|----------------|-------------|---------------|
| `hardware:configureecterminal` | Can configure EC terminal | Admin |
| `hardware:configuredrawer` | Can configure cash drawer | Admin |
| `hardware:configureprinter` | Can configure printer | Admin |
| `hardware:configureofflinesync` | Can configure offline sync | Admin |
| `hardware:enablemodule` | Can enable hardware module | Admin |
| `hardware:disablemodule` | Can disable hardware module | Admin |

#### 15. Audit & Logs (3 permissions)
| Permission Code | Description | Default Roles |
|----------------|-------------|---------------|
| `audit:viewlogs` | Can view audit logs | Admin |
| `audit:viewdatadeletionlogs` | Can view data deletion logs | Admin |
| `audit:viewloginattempts` | Can view login attempts | Admin |

#### 16. Vouchers (6 permissions)
| Permission Code | Description | Default Roles |
|----------------|-------------|---------------|
| `voucher:view` | Can view vouchers | Manager, Admin |
| `voucher:add` | Can add vouchers | Manager, Admin |
| `voucher:update` | Can update vouchers | Manager, Admin |
| `voucher:delete` | Can delete vouchers | Admin |
| `voucher:assigntocustomer` | Can assign vouchers to customers | Manager, Admin |
| `voucher:redeem` | Can redeem vouchers | Cashier, Manager, Admin |

#### 17. Shifts (5 permissions)
| Permission Code | Description | Default Roles |
|----------------|-------------|---------------|
| `shift:view` | Can view shifts | Manager, Admin |
| `shift:add` | Can add shifts | Manager, Admin |
| `shift:update` | Can update shifts | Manager, Admin |
| `shift:close` | Can close shifts | Manager, Admin |
| `shift:viewstats` | Can view shift stats | Manager, Admin |

#### 18. Languages (5 permissions)
| Permission Code | Description | Default Roles |
|----------------|-------------|---------------|
| `language:view` | Can view languages | Admin |
| `language:add` | Can add languages | Admin |
| `language:update` | Can update languages | Admin |
| `language:delete` | Can delete languages | Admin |
| `language:setdefault` | Can set default language | Admin |

#### 19. Admin All Access (1 permission)
| Permission Code | Description | Default Roles |
|----------------|-------------|---------------|
| `ALL` | Admin has all access | Admin |

## Role Definitions

### Admin Role
**Description**: Full system access and configuration
**Default Permissions**: ALL (135 permissions)
- Complete system access
- User and role management
- System configuration
- Hardware management
- Audit and compliance
- All operational functions

### Manager Role
**Description**: Operational control, inventory, and reporting
**Default Permissions**: 25+ permissions
- Dashboard access
- Inventory management
- Product management
- Customer management
- Basic reports
- Employee viewing and shift assignment
- Override capabilities

### Cashier Role
**Description**: Basic sales operations and receipt management
**Default Permissions**: 15+ permissions
- POS operations (basic)
- Receipt viewing and reprinting
- Table reservation (if enabled)
- Basic voucher redemption

## Implementation

### Backend Permission Checking
```javascript
// In service layer
async function addProduct(productData, user) {
  if (!user.hasPermission('productmanagement:add')) {
    throw new Error('Insufficient permissions to add products');
  }
  
  // Proceed with product creation
  return await productService.create(productData);
}
```

### Frontend Permission Checking
```javascript
// React hook for permission checking
const usePermission = (permission) => {
  const { user } = useAuth();
  return user?.permissions?.includes(permission) || false;
};

// Usage in components
const ProductManagement = () => {
  const canAddProduct = usePermission('productmanagement:add');
  const canDeleteProduct = usePermission('productmanagement:delete');
  
  return (
    <div>
      {canAddProduct && <AddProductButton />}
      {canDeleteProduct && <DeleteProductButton />}
    </div>
  );
};
```

### Protected Routes
```javascript
// Route protection with permissions
<Route
  path="/product-management"
  element={
    <ProtectedRoute requiredPermission="productmanagement:view">
      <ProductManagement />
    </ProtectedRoute>
  }
/>
```

## Database Seeding

### Default Roles
```sql
INSERT INTO roles (id, name) VALUES
(1, 'admin'),
(2, 'manager'),
(3, 'cashier');
```

### Default Permissions
```sql
-- Insert all 135 permission codes
INSERT INTO permissions (id, code, description) VALUES
(1, 'pos:view', 'Can view POS sales interface'),
(2, 'pos:addproduct', 'Can add product to POS'),
-- ... (all other permissions)
(135, 'ALL', 'Admin has all access');
```

### Role-Permission Mappings
```sql
-- Admin gets ALL permission (access to everything)
INSERT INTO role_permissions (role_id, permission_id) VALUES (1, 135);

-- Manager gets subset of permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT 2, id FROM permissions 
WHERE code IN ('dashboard:view', 'inventory:view', 'report:view', ...);

-- Cashier gets basic permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT 3, id FROM permissions 
WHERE code IN ('pos:view', 'pos:addproduct', 'receiptarchive:view', ...);
```

## Security Considerations

### Permission Validation
- Server-side validation for all operations
- Client-side UI hiding for better UX
- Regular permission audits

### Role Management
- Only admins can create/modify roles
- Role changes require re-authentication
- Audit logging for role changes

### Session Management
- Permissions cached in user session
- Session timeout for security
- Secure token storage

## Best Practices

### Permission Design
- Use descriptive permission codes
- Follow naming convention: `resource:action`
- Group related permissions logically
- Document all permissions

### Implementation
- Check permissions at multiple levels
- Use middleware for common checks
- Cache permission lookups
- Log permission failures

### Maintenance
- Regular permission audits
- Remove unused permissions
- Update role assignments as needed
- Monitor permission usage 