# Frontend Permission System Guide

This guide explains how to use the permission system in the frontend of the POS application.

## Overview

The permission system provides a flexible way to control access to different parts of the application based on user roles and permissions. When a user logs in, they receive an array of boolean values representing their permissions, along with the corresponding permission codes.

## Permission Structure

Based on the database, there are 10 permissions available:

| Index | Code | Description |
|-------|------|-------------|
| 0 | `pos:view` | Can view POS sales interface |
| 1 | `receiptarchive:view` | Can view receipt archive |
| 2 | `dashboard:view` | Can view dashboard |
| 3 | `inventory:view` | Can view inventory |
| 4 | `product:view` | Can view product management |
| 5 | `customer:view` | Can view customer management |
| 6 | `report:view` | Can view reports |
| 7 | `settings:view` | Can view settings |
| 8 | `company:view` | Can view company settings |
| 9 | `paymentsettings:view` | Can view payment settings |

## Login Response Structure

When a user logs in successfully, the response includes:

```javascript
{
  success: true,
  message: "Login successful",
  user: {
    id: "user-1",
    name: "Admin User",
    email: "admin@example.com",
    role_id: 1,
    status: "active"
  },
  permissions: [true, true, true, true, true, true, true, true, true, false], // Boolean array
  permissionCodes: ["pos:view", "receiptarchive:view", "dashboard:view", ...], // String array
  tokens: {
    accessToken: "...",
    refreshToken: "..."
  }
}
```

## Available Utility Functions

### Basic Permission Functions

```javascript
import { 
  getUserPermissions, 
  getPermissionCodes, 
  hasPermission, 
  hasPermissionByCode 
} from '../utils/permissions';

// Get the boolean permission array
const permissions = getUserPermissions(); // [true, true, false, ...]

// Get the permission codes array
const codes = getPermissionCodes(); // ["pos:view", "dashboard:view", ...]

// Check permission by index
const hasDashboardAccess = hasPermission(2); // Check dashboard:view (index 2)

// Check permission by code
const hasProductAccess = hasPermissionByCode('product:view');
```

### Advanced Permission Functions

```javascript
import { 
  hasAnyPermission, 
  hasAllPermissions, 
  getPermissionIndex 
} from '../utils/permissions';

// Check if user has any of the specified permissions
const canViewReportsOrProducts = hasAnyPermission(['report:view', 'product:view']);

// Check if user has all of the specified permissions
const isAdmin = hasAllPermissions(['dashboard:view', 'report:view', 'settings:view']);

// Get the index of a permission code
const dashboardIndex = getPermissionIndex('dashboard:view'); // Returns 2
```

### Permission Constants

```javascript
import { PERMISSIONS, PERMISSION_CODES } from '../utils/permissions';

// Using index constants
const hasDashboard = hasPermission(PERMISSIONS.DASHBOARD_VIEW);

// Using code constants
const hasProduct = hasPermissionByCode(PERMISSION_CODES.PRODUCT_VIEW);
```

## Components

### 1. ProtectedRoute Component

Use this for route-level protection:

```javascript
import ProtectedRoute from '../components/ProtectedRoute';

// Basic usage - requires authentication only
<ProtectedRoute>
  <Dashboard />
</ProtectedRoute>

// With permission requirement
<ProtectedRoute requiredPermission="dashboard:view">
  <Dashboard />
</ProtectedRoute>

// With custom fallback path
<ProtectedRoute 
  requiredPermission="report:view" 
  fallbackPath="/dashboard"
>
  <Reports />
</ProtectedRoute>

// With custom fallback component
<ProtectedRoute 
  requiredPermission="settings:view"
  fallbackComponent={<AccessDenied />}
>
  <Settings />
</ProtectedRoute>
```

### 2. PermissionGuard Component

Use this for conditional rendering within components:

```javascript
import PermissionGuard from '../components/PermissionGuard';

// Single permission check
<PermissionGuard permission="product:view">
  <button>Add Product</button>
</PermissionGuard>

// Multiple permissions (any)
<PermissionGuard permissions={['product:view', 'inventory:view']} mode="any">
  <p>You can manage products or inventory</p>
</PermissionGuard>

// Multiple permissions (all)
<PermissionGuard permissions={['dashboard:view', 'report:view']} mode="all">
  <p>You have full admin access</p>
</PermissionGuard>

// With fallback
<PermissionGuard 
  permission="settings:view"
  fallback={<p>You don't have access to settings</p>}
>
  <SettingsPanel />
</PermissionGuard>
```

## Usage Examples

### 1. Conditional Button Rendering

```javascript
import { hasPermissionByCode } from '../utils/permissions';

function ProductPage() {
  return (
    <div>
      <h1>Products</h1>
      
      {/* Only show add button if user has product:view permission */}
      {hasPermissionByCode('product:view') && (
        <button onClick={handleAddProduct}>Add Product</button>
      )}
      
      {/* Show different content based on permissions */}
      {hasPermissionByCode('inventory:view') ? (
        <InventoryPanel />
      ) : (
        <p>You can only view products, not manage inventory</p>
      )}
    </div>
  );
}
```

### 2. Navigation Menu with Permissions

```javascript
import { hasPermissionByCode } from '../utils/permissions';

function NavigationMenu() {
  return (
    <nav>
      <Link to="/pos">POS</Link>
      
      {hasPermissionByCode('dashboard:view') && (
        <Link to="/dashboard">Dashboard</Link>
      )}
      
      {hasPermissionByCode('product:view') && (
        <Link to="/products">Products</Link>
      )}
      
      {hasPermissionByCode('report:view') && (
        <Link to="/reports">Reports</Link>
      )}
      
      {hasPermissionByCode('settings:view') && (
        <Link to="/settings">Settings</Link>
      )}
    </nav>
  );
}
```

### 3. Complex Permission Logic

```javascript
import { hasPermissionByCode, hasAllPermissions } from '../utils/permissions';

function AdminPanel() {
  const isFullAdmin = hasAllPermissions(['dashboard:view', 'report:view', 'settings:view']);
  const canManageProducts = hasPermissionByCode('product:view');
  const canViewReports = hasPermissionByCode('report:view');
  
  return (
    <div>
      {isFullAdmin && (
        <div className="admin-section">
          <h2>Full Admin Access</h2>
          <button>System Settings</button>
          <button>User Management</button>
        </div>
      )}
      
      {canManageProducts && (
        <div className="product-section">
          <h2>Product Management</h2>
          <button>Add Product</button>
          <button>Edit Products</button>
        </div>
      )}
      
      {canViewReports && !isFullAdmin && (
        <div className="limited-admin">
          <h2>Limited Admin Access</h2>
          <p>You can view reports but have limited admin functions</p>
        </div>
      )}
    </div>
  );
}
```

### 4. Form Field Permissions

```javascript
import PermissionGuard from '../components/PermissionGuard';

function ProductForm() {
  return (
    <form>
      <input type="text" placeholder="Product Name" />
      <input type="number" placeholder="Price" />
      
      {/* Only show cost field to users with inventory permission */}
      <PermissionGuard permission="inventory:view">
        <input type="number" placeholder="Cost" />
      </PermissionGuard>
      
      {/* Only show supplier field to users with settings permission */}
      <PermissionGuard permission="settings:view">
        <select>
          <option>Select Supplier</option>
        </select>
      </PermissionGuard>
      
      <button type="submit">Save Product</button>
    </form>
  );
}
```

## Best Practices

### 1. Always Check Permissions on Both Frontend and Backend

The frontend permission checks are for UX only. Always implement proper backend validation.

### 2. Use Permission Constants

Instead of hardcoding permission codes, use the constants:

```javascript
// Good
import { PERMISSION_CODES } from '../utils/permissions';
hasPermissionByCode(PERMISSION_CODES.DASHBOARD_VIEW);

// Bad
hasPermissionByCode('dashboard:view');
```

### 3. Provide Fallback Content

Always provide meaningful fallback content when permissions are denied:

```javascript
<PermissionGuard 
  permission="report:view"
  fallback={<p>Contact your administrator to get report access</p>}
>
  <ReportsComponent />
</PermissionGuard>
```

### 4. Use Appropriate Permission Levels

Don't over-restrict or under-restrict access:

```javascript
// Good - specific permission
<PermissionGuard permission="product:view">
  <ProductManagement />
</PermissionGuard>

// Bad - too broad
<PermissionGuard permission="dashboard:view">
  <ProductManagement />
</PermissionGuard>
```

### 5. Handle Permission Loading States

```javascript
function MyComponent() {
  const permissions = getUserPermissions();
  
  // Show loading state while permissions are being determined
  if (permissions.length === 0) {
    return <div>Loading permissions...</div>;
  }
  
  return (
    <PermissionGuard permission="dashboard:view">
      <Dashboard />
    </PermissionGuard>
  );
}
```

## Testing Permissions

You can test different permission scenarios by:

1. Logging in with different user accounts (admin, manager, cashier)
2. Manually modifying the permissions array in localStorage
3. Using the PermissionExample component to see all permission states

## Troubleshooting

### Common Issues

1. **Permissions not loading**: Check if the login response includes the permissions array
2. **Permission checks failing**: Verify the permission codes match exactly
3. **Route protection not working**: Ensure ProtectedRoute is wrapping the component correctly

### Debug Permissions

```javascript
// Add this to any component to debug permissions
import { getUserPermissions, getPermissionCodes } from '../utils/permissions';

console.log('Permissions:', getUserPermissions());
console.log('Codes:', getPermissionCodes());
```

## Security Notes

- Frontend permission checks are for UX only
- Always validate permissions on the backend
- Never trust client-side permission data for sensitive operations
- Consider implementing permission refresh mechanisms for long sessions 