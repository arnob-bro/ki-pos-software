// Permission utility functions for the frontend

/**
 * Get user permissions from localStorage
 * @returns {Array} Array of boolean permission values
 */
export const getUserPermissions = () => {
  try {
    const permissions = localStorage.getItem('userPermissions');
    return permissions ? JSON.parse(permissions) : [];
  } catch (error) {
    console.error('Error getting user permissions:', error);
    return [];
  }
};

/**
 * Get permission codes from localStorage
 * @returns {Array} Array of permission codes
 */
export const getPermissionCodes = () => {
  try {
    const codes = localStorage.getItem('permissionCodes');
    return codes ? JSON.parse(codes) : [];
  } catch (error) {
    console.error('Error getting permission codes:', error);
    return [];
  }
};

/**
 * Check if user has a specific permission by index
 * @param {number} permissionIndex - Index of the permission in the array
 * @returns {boolean} True if user has the permission
 */
export const hasPermission = (permissionIndex) => {
  const permissions = getUserPermissions();
  return permissions[permissionIndex] === true;
};

/**
 * Check if user has a specific permission by code
 * @param {string} permissionCode - Permission code to check
 * @returns {boolean} True if user has the permission
 */
export const hasPermissionByCode = (permissionCode) => {
  const permissions = getUserPermissions();
  const codes = getPermissionCodes();
  const index = codes.indexOf(permissionCode);
  return index !== -1 && permissions[index] === true;
};

/**
 * Check if user has any of the specified permissions
 * @param {Array} permissionCodes - Array of permission codes to check
 * @returns {boolean} True if user has any of the permissions
 */
export const hasAnyPermission = (permissionCodes) => {
  return permissionCodes.some(code => hasPermissionByCode(code));
};

/**
 * Check if user has all of the specified permissions
 * @param {Array} permissionCodes - Array of permission codes to check
 * @returns {boolean} True if user has all of the permissions
 */
export const hasAllPermissions = (permissionCodes) => {
  return permissionCodes.every(code => hasPermissionByCode(code));
};

/**
 * Get permission index by code
 * @param {string} permissionCode - Permission code
 * @returns {number} Index of the permission, -1 if not found
 */
export const getPermissionIndex = (permissionCode) => {
  const codes = getPermissionCodes();
  return codes.indexOf(permissionCode);
};

/**
 * Permission constants based on the database structure
 */
export const PERMISSIONS = {
  POS_VIEW: 0,           // 'pos:view'
  RECEIPT_ARCHIVE_VIEW: 1, // 'receiptarchive:view'
  DASHBOARD_VIEW: 2,     // 'dashboard:view'
  INVENTORY_VIEW: 3,     // 'inventory:view'
  PRODUCT_VIEW: 4,       // 'product:view'
  CUSTOMER_VIEW: 5,      // 'customer:view'
  REPORT_VIEW: 6,        // 'report:view'
  SETTINGS_VIEW: 7,      // 'settings:view'
  COMPANY_VIEW: 8,       // 'company:view'
  PAYMENT_SETTINGS_VIEW: 9 // 'paymentsettings:view'
};

/**
 * Permission code constants
 */
export const PERMISSION_CODES = {
  POS_VIEW: 'pos:view',
  RECEIPT_ARCHIVE_VIEW: 'receiptarchive:view',
  DASHBOARD_VIEW: 'dashboard:view',
  INVENTORY_VIEW: 'inventory:view',
  PRODUCT_VIEW: 'product:view',
  CUSTOMER_VIEW: 'customer:view',
  REPORT_VIEW: 'report:view',
  SETTINGS_VIEW: 'settings:view',
  COMPANY_VIEW: 'company:view',
  PAYMENT_SETTINGS_VIEW: 'paymentsettings:view'
};

/**
 * Clear all permission data from localStorage
 */
export const clearPermissions = () => {
  localStorage.removeItem('userPermissions');
  localStorage.removeItem('permissionCodes');
}; 