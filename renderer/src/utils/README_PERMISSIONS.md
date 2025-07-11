# Frontend Permission System Guide

This guide explains how to use the permission system in the frontend of the POS application using Zustand userStore.

## Overview

The permission system provides a flexible way to control access to different parts of the application based on user roles and permissions. When a user logs in, their permissions are stored in the userStore along with the corresponding permission codes.

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

## Available Methods

### Using userStore Directly

```javascript
import useUserStore from '../stores/userStore';

function MyComponent() {
  const { 
    hasPermission, 
    hasPermissionByCode, 
    hasAnyPermission, 
    hasAllPermissions,
    permissions,
    permissionCodes 
  } = useUserStore();

  // Check permission by index
  const hasDashboardAccess = hasPermission(2); // Check dashboard:view (index 2)

  // Check permission by code
  const hasProductAccess = hasPermissionByCode('product:view');

  // Check multiple permissions (any)
  const canViewReportsOrProducts = hasAnyPermission(['report:view', 'product:view']);

  // Check multiple permissions (all)
  const isAdmin = hasAllPermissions(['dashboard:view', 'report:view', 'settings:view']);

  return (
    <div>
      {hasProductAccess && <ProductManagement />}
      {canViewReportsOrProducts && <ReportsOrProducts />}
      {isAdmin && <AdminPanel />}
    </div>
  );
}
```

### Using Custom Hooks

```javascript
import { usePermissions, useHasPermission } from '../hooks/usePermissions';

function MyComponent() {
  // Get all permission data and functions
  const { permissions, permissionCodes, hasPermissionByCode, hasAnyPermission, hasAllPermissions } = usePermissions();
  
  // Check specific permission
  const canViewDashboard = useHasPermission('dashboard:view');
  
  return (
    <div>
      {canViewDashboard && <Dashboard />}
      {hasPermissionByCode('product:view') && <ProductManagement />}
      {hasAnyPermission(['report:view', 'settings:view']) && <AdminFeatures />}
    </div>
  );
}
```

### Using Utility Functions

```javascript
import { getUserPermissions, getPermissionCodes, PERMISSIONS, PERMISSION_CODES } from '../utils/permissions';

function MyComponent() {
  // Get the boolean permission array from userStore
  const permissions = getUserPermissions(); // [true, true, false, ...]

  // Get the permission codes array from userStore
  const codes = getPermissionCodes(); // ["pos:view", "dashboard:view", ...]

  // Using constants
  const hasDashboard = permissions[PERMISSIONS.DASHBOARD_VIEW];
  const hasProduct = permissions[PERMISSIONS.PRODUCT_VIEW];

  return (
    <div>
      {hasDashboard && <Dashboard />}
      {hasProduct && <ProductManagement />}
    </div>
  );
}
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
import useUserStore from '../stores/userStore';

function ProductPage() {
  const { hasPermissionByCode } = useUserStore();

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
import useUserStore from '../stores/userStore';

function NavigationMenu() {
  const { hasPermissionByCode } = useUserStore();

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
import useUserStore from '../stores/userStore';

function AdminPanel() {
  const { hasPermissionByCode, hasAllPermissions } = useUserStore();
  
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

### 5. Using Custom Hooks

```javascript
import { useHasPermission } from '../hooks/usePermissions';

function Dashboard() {
  const canViewReports = useHasPermission('report:view');
  const canManageProducts = useHasPermission('product:view');
  
  return (
    <div>
      <h1>Dashboard</h1>
      
      {canViewReports && (
        <div className="reports-section">
          <h2>Reports</h2>
          <button>Generate Report</button>
        </div>
      )}
      
      {canManageProducts && (
        <div className="products-section">
          <h2>Products</h2>
          <button>Manage Products</button>
        </div>
      )}
    </div>
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
const { hasPermissionByCode } = useUserStore();
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
import useUserStore from '../stores/userStore';

function MyComponent() {
  const { permissions } = useUserStore();
  
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

### 6. Use Custom Hooks for Better Performance

```javascript
// Good - uses custom hook for better performance
function MyComponent() {
  const canViewReports = useHasPermission('report:view');
  return canViewReports ? <Reports /> : <AccessDenied />;
}

// Bad - calls function on every render
function MyComponent() {
  const { hasPermissionByCode } = useUserStore();
  return hasPermissionByCode('report:view') ? <Reports /> : <AccessDenied />;
}
```

## Testing Permissions

You can test different permission scenarios by:

1. Logging in with different user accounts (admin, manager, cashier)
2. Using the PermissionUsageExample component for a visual demo
3. Checking the userStore state in browser dev tools

## Troubleshooting

### Common Issues

1. **Permissions not loading**: Check if the login response includes the permissions array
2. **Permission checks failing**: Verify the permission codes match exactly
3. **Route protection not working**: Ensure ProtectedRoute is wrapping the component correctly
4. **State not persisting**: Check if userStore is properly configured with persist middleware

### Debug Permissions

```javascript
// Add this to any component to debug permissions
import useUserStore from '../stores/userStore';

function DebugComponent() {
  const { user, permissions, permissionCodes } = useUserStore();
  
  console.log('User:', user);
  console.log('Permissions:', permissions);
  console.log('Codes:', permissionCodes);
  
  return <div>Check console for permission data</div>;
}
```

## Security Notes

- Frontend permission checks are for UX only
- Always validate permissions on the backend
- Never trust client-side permission data for sensitive operations
- The userStore automatically persists data using Zustand's persist middleware
- Consider implementing permission refresh mechanisms for long sessions

## Migration from localStorage

If you were previously using localStorage for permissions, the migration is automatic:

1. **Old approach**: `localStorage.getItem('userPermissions')`
2. **New approach**: `useUserStore().permissions` or `getUserPermissions()`

The userStore automatically handles persistence, so you don't need to manually manage localStorage anymore. 