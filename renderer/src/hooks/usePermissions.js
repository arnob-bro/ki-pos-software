import { useMemo } from 'react';
import useUserStore from '../stores/userStore';

/**
 * Custom hook for permission checking using userStore
 * @returns {Object} Permission checking functions and data
 */
export const usePermissions = () => {
  const { permissions, permissionCodes, hasPermission, hasPermissionByCode, hasAnyPermission, hasAllPermissions } = useUserStore();

  // Memoize permission data to avoid unnecessary re-renders
  const permissionData = useMemo(() => ({
    permissions,
    permissionCodes,
    hasPermission,
    hasPermissionByCode,
    hasAnyPermission,
    hasAllPermissions
  }), [permissions, permissionCodes, hasPermission, hasPermissionByCode, hasAnyPermission, hasAllPermissions]);

  return permissionData;
};

/**
 * Hook to check if user has a specific permission
 * @param {string} permissionCode - Permission code to check
 * @returns {boolean} True if user has the permission
 */
export const useHasPermission = (permissionCode) => {
  const { hasPermissionByCode } = useUserStore();
  return hasPermissionByCode(permissionCode);
}; 