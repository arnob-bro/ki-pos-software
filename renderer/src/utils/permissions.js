// Permission utility functions for the frontend using userStore

import useUserStore from '../stores/userStore';

/**
 * Get user permissions from userStore
 * @returns {Array} Array of boolean permission values
 */
export const getUserPermissions = () => {
  return useUserStore.getState().permissions || [];
};

/**
 * Get permission codes from userStore
 * @returns {Array} Array of permission codes
 */
export const getPermissionCodes = () => {
  return useUserStore.getState().permissionCodes || [];
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
  PAYMENT_SETTINGS_VIEW: 9, // 'paymentsettings:view'
  ALL: 10, // 'paymentsettings:view'
  EMPLOYEE_VIEW: 11 // 'paymentsettings:view'
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
  PAYMENT_SETTINGS_VIEW: 'paymentsettings:view',
  ALL: 'ALL',
  EMPLOYEE_VIEW: 'employee:view'
  
}; 