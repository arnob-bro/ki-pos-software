import React from 'react';
import { 
  hasPermissionByCode, 
  hasPermission, 
  PERMISSIONS, 
  PERMISSION_CODES,
  getUserPermissions,
  getPermissionCodes 
} from '../utils/permissions';
import PermissionGuard from './PermissionGuard';

/**
 * Example component demonstrating various ways to use permissions
 */
const PermissionExample = () => {
  const userPermissions = getUserPermissions();
  const permissionCodes = getPermissionCodes();

  return (
    <div style={{ padding: '20px', maxWidth: '800px' }}>
      <h2>Permission System Examples</h2>
      
      {/* Example 1: Using PermissionGuard component */}
      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '5px' }}>
        <h3>1. Using PermissionGuard Component</h3>
        
        <PermissionGuard permission="dashboard:view">
          <button style={{ backgroundColor: '#007bff', color: 'white', padding: '10px', border: 'none', borderRadius: '5px' }}>
            Dashboard Button (Only visible with dashboard:view permission)
          </button>
        </PermissionGuard>
        
        <PermissionGuard permission="report:view" fallback={<p style={{ color: 'red' }}>You don't have permission to view reports</p>}>
          <button style={{ backgroundColor: '#28a745', color: 'white', padding: '10px', border: 'none', borderRadius: '5px', marginLeft: '10px' }}>
            Reports Button
          </button>
        </PermissionGuard>
        
        <PermissionGuard permissions={['product:view', 'settings:view']} mode="any">
          <p style={{ color: 'green', marginTop: '10px' }}>
            This text is visible if you have either product:view OR settings:view permission
          </p>
        </PermissionGuard>
        
        <PermissionGuard permissions={['dashboard:view', 'report:view']} mode="all">
          <p style={{ color: 'blue', marginTop: '10px' }}>
            This text is visible only if you have BOTH dashboard:view AND report:view permissions
          </p>
        </PermissionGuard>
      </div>

      {/* Example 2: Using permission functions directly */}
      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '5px' }}>
        <h3>2. Using Permission Functions Directly</h3>
        
        {hasPermissionByCode('product:view') && (
          <button style={{ backgroundColor: '#ffc107', color: 'black', padding: '10px', border: 'none', borderRadius: '5px' }}>
            Product Management (Using hasPermissionByCode)
          </button>
        )}
        
        {hasPermission(PERMISSIONS.REPORT_VIEW) && (
          <button style={{ backgroundColor: '#17a2b8', color: 'white', padding: '10px', border: 'none', borderRadius: '5px', marginLeft: '10px' }}>
            Reports (Using hasPermission with index)
          </button>
        )}
        
        {hasPermissionByCode(PERMISSION_CODES.SETTINGS_VIEW) ? (
          <p style={{ color: 'green', marginTop: '10px' }}>You have settings access</p>
        ) : (
          <p style={{ color: 'red', marginTop: '10px' }}>You don't have settings access</p>
        )}
      </div>

      {/* Example 3: Conditional rendering based on multiple permissions */}
      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '5px' }}>
        <h3>3. Conditional Rendering with Multiple Permissions</h3>
        
        {hasPermissionByCode('dashboard:view') && hasPermissionByCode('report:view') && (
          <div style={{ backgroundColor: '#f8f9fa', padding: '10px', borderRadius: '5px' }}>
            <h4>Admin Dashboard</h4>
            <p>This section is only visible to users with both dashboard and report permissions.</p>
            <button style={{ backgroundColor: '#dc3545', color: 'white', padding: '8px', border: 'none', borderRadius: '3px' }}>
              Admin Action
            </button>
          </div>
        )}
        
        {hasPermissionByCode('product:view') && !hasPermissionByCode('settings:view') && (
          <div style={{ backgroundColor: '#e9ecef', padding: '10px', borderRadius: '5px', marginTop: '10px' }}>
            <h4>Limited Access</h4>
            <p>You have product access but not settings access.</p>
          </div>
        )}
      </div>

      {/* Example 4: Display current permissions */}
      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '5px' }}>
        <h3>4. Current User Permissions</h3>
        
        <div style={{ display: 'flex', gap: '20px' }}>
          <div>
            <h4>Permission Array (Boolean):</h4>
            <pre style={{ backgroundColor: '#f8f9fa', padding: '10px', borderRadius: '3px', fontSize: '12px' }}>
              {JSON.stringify(userPermissions, null, 2)}
            </pre>
          </div>
          
          <div>
            <h4>Permission Codes:</h4>
            <pre style={{ backgroundColor: '#f8f9fa', padding: '10px', borderRadius: '3px', fontSize: '12px' }}>
              {JSON.stringify(permissionCodes, null, 2)}
            </pre>
          </div>
        </div>
        
        <div style={{ marginTop: '15px' }}>
          <h4>Permission Status:</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
            {permissionCodes.map((code, index) => (
              <div 
                key={code}
                style={{ 
                  padding: '8px', 
                  borderRadius: '3px', 
                  backgroundColor: userPermissions[index] ? '#d4edda' : '#f8d7da',
                  color: userPermissions[index] ? '#155724' : '#721c24',
                  fontSize: '12px'
                }}
              >
                {code}: {userPermissions[index] ? '✅ Granted' : '❌ Denied'}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Example 5: Dynamic content based on permissions */}
      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '5px' }}>
        <h3>5. Dynamic Content Based on Permissions</h3>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {hasPermissionByCode('dashboard:view') && (
            <div style={{ backgroundColor: '#d1ecf1', padding: '10px', borderRadius: '5px', minWidth: '150px' }}>
              <h5>📊 Dashboard</h5>
              <p>View analytics and metrics</p>
            </div>
          )}
          
          {hasPermissionByCode('product:view') && (
            <div style={{ backgroundColor: '#d4edda', padding: '10px', borderRadius: '5px', minWidth: '150px' }}>
              <h5>📦 Products</h5>
              <p>Manage inventory and products</p>
            </div>
          )}
          
          {hasPermissionByCode('report:view') && (
            <div style={{ backgroundColor: '#fff3cd', padding: '10px', borderRadius: '5px', minWidth: '150px' }}>
              <h5>📈 Reports</h5>
              <p>Generate and view reports</p>
            </div>
          )}
          
          {hasPermissionByCode('settings:view') && (
            <div style={{ backgroundColor: '#f8d7da', padding: '10px', borderRadius: '5px', minWidth: '150px' }}>
              <h5>⚙️ Settings</h5>
              <p>Configure system settings</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PermissionExample; 