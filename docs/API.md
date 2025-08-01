# API Documentation

## Overview
The KI POS System uses Electron's IPC (Inter-Process Communication) for API calls between the renderer process (frontend) and main process (backend). All communication is handled through the preload script which exposes a secure API to the renderer process.

## IPC Communication Architecture

### Preload Script (`backend/preload.js`)
The preload script exposes the `posAPI` object to the renderer process with all available IPC handlers:

```javascript
contextBridge.exposeInMainWorld("posAPI", {
  // All API methods are exposed here
});
```

### Usage in Frontend
```javascript
// Example: Login
const result = await window.posAPI.login(identifier, password);

// Example: List products
const products = await window.posAPI.listProducts(1, 20);
```

## Authentication

### Login
**IPC Handler**: `login(identifier, password)`
**Description**: Authenticate user and return user data with permissions

**Parameters**:
- `identifier` (string): User email or ID
- `password` (string): User password

**Response**:
```json
{
  "success": true,
  "user": {
    "id": "user-uuid",
    "name": "John Doe",
    "email": "user@example.com",
    "role": "admin"
  },
  "permissions": [true, false, true, ...],
  "permissionCodes": ["pos:view", "dashboard:view", ...],
  "tokens": {
    "accessToken": "jwt-token"
  }
}
```

### Logout
**IPC Handler**: `logout(userId, refreshToken)`
**Description**: Invalidate user session

**Parameters**:
- `userId` (string): User ID
- `refreshToken` (string): Refresh token

**Response**:
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### Validate Session
**IPC Handler**: `validateSession(token)`
**Description**: Validate JWT token and return user data

## Product Management

### List Products
**IPC Handler**: `listProducts(page, limit)`
**Description**: Get paginated list of products

**Parameters**:
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20)

**Response**:
```json
{
  "products": [
    {
      "id": "prod-uuid",
      "name": "Product Name",
      "category_id": 1,
      "barcode": "123456789",
      "price": 10.99,
      "vat_rate": 19.0,
      "stock_quantity": 100,
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

### Search Products
**IPC Handler**: `searchProducts(query, limit)`
**Description**: Search products by name or barcode

**Parameters**:
- `query` (string): Search term
- `limit` (number): Maximum results

### Add Product
**IPC Handler**: `addProduct(product, currentUser)`
**Description**: Create new product

**Parameters**:
- `product` (object): Product data
- `currentUser` (object): Current authenticated user

### Update Product
**IPC Handler**: `updateProduct(product, currentUser)`
**Description**: Update existing product

### Delete Product
**IPC Handler**: `deleteProduct(id, currentUser)`
**Description**: Delete product (soft delete)

### Get Product
**IPC Handler**: `getProduct(id)`
**Description**: Get single product by ID

### Get Low Stock Products
**IPC Handler**: `getLowStockProducts(threshold)`
**Description**: Get products below stock threshold

## Employee Management

### List Employees
**IPC Handler**: `listEmployees(page, limit, filters)`
**Description**: Get paginated list of employees

**Parameters**:
- `page` (number): Page number
- `limit` (number): Items per page
- `filters` (object): Filter options
  - `status` (string): Filter by status
  - `role` (string): Filter by role
  - `search` (string): Search by name or email

**Response**:
```json
{
  "employees": [
    {
      "id": "user-uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "role_name": "admin",
      "status": "active",
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "totalPages": 3
  }
}
```

### Add Employee
**IPC Handler**: `addEmployee(employeeData, currentUser)`
**Description**: Create new employee

**Parameters**:
- `employeeData` (object): Employee information
- `currentUser` (object): Current authenticated user

### Update Employee
**IPC Handler**: `updateEmployee(id, employeeData)`
**Description**: Update employee information

### Delete Employee
**IPC Handler**: `deleteEmployee(id)`
**Description**: Soft delete employee

### Update Employee Status
**IPC Handler**: `updateEmployeeStatus(id, status)`
**Description**: Change employee status (active, suspended, deleted)

### List Roles
**IPC Handler**: `listRoles()`
**Description**: Get available roles

### Get Employee Stats
**IPC Handler**: `getEmployeeStats()`
**Description**: Get employee statistics

### List Permissions
**IPC Handler**: `listPermissions()`
**Description**: Get all available permissions

### Get Employee Permissions
**IPC Handler**: `getEmployeePermissions(employeeId)`
**Description**: Get permissions for specific employee

### Update Employee Permissions
**IPC Handler**: `updateEmployeePermissions(employeeId, permissionCodes)`
**Description**: Update employee permissions

## Transactions & Sales

### Add Transaction
**IPC Handler**: `addTransaction(data, currentUser)`
**Description**: Create new sales transaction

**Parameters**:
- `data` (object): Transaction data
- `currentUser` (object): Current authenticated user

### List Transactions
**IPC Handler**: `listTransactions(page, limit)`
**Description**: Get paginated list of transactions

### Get Transaction
**IPC Handler**: `getTransaction(id)`
**Description**: Get transaction details

### Get Receipts
**IPC Handler**: `getReceipts(filters)`
**Description**: Get receipts with filters

### Add Sale
**IPC Handler**: `addSale(sale, currentUser)`
**Description**: Add sale to current transaction

## Reports

### Generate X Report
**IPC Handler**: `generateXReport(date, userId)`
**Description**: Generate interim sales report

**Parameters**:
- `date` (string): Report date
- `userId` (string): User generating report

### Generate Z Report
**IPC Handler**: `generateZReport(date, userId)`
**Description**: Generate daily closing report

### Check Z Report Exists
**IPC Handler**: `checkZReportExists(date, userId)`
**Description**: Check if Z report already exists for date

### List Reports
**IPC Handler**: `listReports(userId, page, limit)`
**Description**: Get paginated list of generated reports

### Export GoBD
**IPC Handler**: `exportGoBD(startDate, endDate)`
**Description**: Export data in GoBD format

### Generate PDF Report
**IPC Handler**: `generatePDFReport(reportId)`
**Description**: Generate PDF version of report

### Download Report File
**IPC Handler**: `downloadReportFile(filePath)`
**Description**: Download report file

### Get Report Stats
**IPC Handler**: `getReportStats(userId)`
**Description**: Get report statistics

### Sales Analytics
**IPC Handler**: `reports_salesByCategory(startDate, endDate)`
**Description**: Generate sales by category report

**IPC Handler**: `reports_salesByTime(startDate, endDate, interval)`
**Description**: Generate sales by time report

**IPC Handler**: `reports_salesByOperator(startDate, endDate)`
**Description**: Generate sales by operator report

**IPC Handler**: `reports_taxBreakdown(startDate, endDate)`
**Description**: Generate tax breakdown report

### Generate CSV Report
**IPC Handler**: `generateCSVReport(reportId)`
**Description**: Generate CSV version of report

## Hardware Configuration

### Get Hardware Config
**IPC Handler**: `getHardwareConfig()`
**Description**: Get current hardware configuration

### Save Hardware Config
**IPC Handler**: `saveHardwareConfig(config)`
**Description**: Save hardware configuration

### Test EC Terminal
**IPC Handler**: `testECTerminal(config)`
**Description**: Test EC terminal connection

### Test Drawer
**IPC Handler**: `testDrawer(config)`
**Description**: Test cash drawer

### Test Printer
**IPC Handler**: `testPrinter(config)`
**Description**: Test receipt printer

### Sync Data
**IPC Handler**: `syncData()`
**Description**: Sync data with external systems

### Get Available Ports
**IPC Handler**: `getAvailablePorts()`
**Description**: Get available serial ports

### Get Hardware Status
**IPC Handler**: `getHardwareStatus()`
**Description**: Get hardware status

## Dashboard

### Get Sales Stats
**IPC Handler**: `getSalesStats(view)`
**Description**: Get sales statistics for dashboard

### Get Top Products
**IPC Handler**: `getTopProducts(limit)`
**Description**: Get best-selling products

### Get Low Stock Items
**IPC Handler**: `getLowStockItems(threshold)`
**Description**: Get items below stock threshold

### Get Audit Logs
**IPC Handler**: `getAuditLogs(page, limit)`
**Description**: Get audit logs for dashboard

### Get Total Products
**IPC Handler**: `getTotalProducts()`
**Description**: Get total product count

## Shifts

### Start Shift
**IPC Handler**: `startShift(userId)`
**Description**: Start a new shift for user

### End Shift
**IPC Handler**: `endShift(shiftId)`
**Description**: End current shift

### Get Current Shift
**IPC Handler**: `getCurrentShift(userId)`
**Description**: Get current shift for user

### List Shifts
**IPC Handler**: `listShifts()`
**Description**: Get all shifts

### Create Shift
**IPC Handler**: `createShift(shiftData, currentUser)`
**Description**: Create new shift

### Update Shift
**IPC Handler**: `updateShift(id, updateData, currentUser)`
**Description**: Update shift

### Assign Shift
**IPC Handler**: `assignShift(shiftId, userId, currentUser)`
**Description**: Assign user to shift

### Unassign Shift
**IPC Handler**: `unassignShift(shiftId, userId, currentUser)`
**Description**: Remove user from shift

### List Shift Assignments
**IPC Handler**: `listShiftAssignments(filter)`
**Description**: Get shift assignments

### Get Shift By ID
**IPC Handler**: `getShiftById(id)`
**Description**: Get shift by ID

## Customers

### List Customers
**IPC Handler**: `listCustomers(page, limit)`
**Description**: Get paginated list of customers

### Add Customer
**IPC Handler**: `addCustomer(customer)`
**Description**: Create new customer

### Update Customer
**IPC Handler**: `updateCustomer(customer)`
**Description**: Update customer information

### Delete Customer
**IPC Handler**: `deleteCustomer(id, user)`
**Description**: Delete customer

### Get Customer History
**IPC Handler**: `getCustomerHistory(customerId)`
**Description**: Get customer purchase history

### Assign Loyalty Tier
**IPC Handler**: `assignLoyaltyTier(id, tier)`
**Description**: Assign loyalty tier to customer

## Role Management

### Add Role
**IPC Handler**: `addRole(roleData)`
**Description**: Create new role

### Get Role
**IPC Handler**: `getRole(id)`
**Description**: Get role by ID

### Update Role
**IPC Handler**: `updateRole(id, roleData)`
**Description**: Update role

### Delete Role
**IPC Handler**: `deleteRole(id)`
**Description**: Delete role

### Get Role Usage
**IPC Handler**: `getRoleUsage(id)`
**Description**: Get role usage statistics

## File Operations

### Open File
**IPC Handler**: `openFile(filePath)`
**Description**: Open file using system default application

## Error Handling

All IPC handlers return consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "code": "ERROR_CODE",
  "error": "Detailed error message"
}
```

Common error codes:
- `IPC_ERROR`: IPC communication error
- `VALIDATION_ERROR`: Invalid input data
- `NOT_FOUND`: Resource not found
- `UNAUTHORIZED`: Authentication required
- `FORBIDDEN`: Insufficient permissions
- `INTERNAL_ERROR`: Server error

## Security

### Context Isolation
- All IPC communication goes through the preload script
- Context isolation is enabled for security
- Node integration is disabled in renderer process

### Permission Checking
- All operations check user permissions
- Role-based access control enforced
- Audit logging for all operations

### Input Validation
- Server-side validation for all inputs
- SQL injection prevention through prepared statements
- XSS protection through context isolation 