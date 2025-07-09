import React from 'react';
import { hasPermissionByCode, hasAnyPermission, hasAllPermissions } from '../utils/permissions';

/**
 * PermissionGuard component for conditional rendering based on permissions
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render
 * @param {string} props.permission - Single permission code to check
 * @param {Array} props.permissions - Array of permission codes to check
 * @param {string} props.mode - 'any' (default) or 'all' - whether to check for any or all permissions
 * @param {React.ReactNode} props.fallback - Component to render if permission denied
 * @returns {React.ReactNode} Component or fallback based on permissions
 */
const PermissionGuard = ({ 
  children, 
  permission, 
  permissions = [], 
  mode = 'any',
  fallback = null 
}) => {
  let hasAccess = false;

  // Check single permission
  if (permission) {
    hasAccess = hasPermissionByCode(permission);
  }
  // Check multiple permissions
  else if (permissions.length > 0) {
    if (mode === 'all') {
      hasAccess = hasAllPermissions(permissions);
    } else {
      hasAccess = hasAnyPermission(permissions);
    }
  }
  // If no permissions specified, allow access
  else {
    hasAccess = true;
  }

  if (!hasAccess) {
    return fallback;
  }

  return children;
};

export default PermissionGuard; 