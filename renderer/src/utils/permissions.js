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
  POS_VIEW: 0,
  POS_ADD_PRODUCT: 1,
  POS_REMOVE_PRODUCT: 2,
  POS_APPLY_DISCOUNT: 3,
  POS_OVERRIDE_DISCOUNT: 4,
  POS_SELECT_ORDER_TYPE: 5,
  POS_PARK_RECEIPT: 6,
  POS_RESUME_RECEIPT: 7,
  POS_DELETE_RECEIPT: 8,
  POS_PRINT_RECEIPT: 9,
  POS_PRINT_KITCHEN_COPY: 10,
  POS_OPEN_DRAWER: 11,
  POS_HANDLE_PAYMENT: 12,
  POS_REFUND: 13,
  POS_CANCEL_FINALIZED_TRANSACTION: 14,
  POS_OVERRIDE_SALE: 15,

  RECEIPT_ARCHIVE_VIEW: 16,
  RECEIPT_ARCHIVE_SEARCH: 17,
  RECEIPT_ARCHIVE_VIEW_DETAILS: 18,
  RECEIPT_ARCHIVE_REPRINT: 19,
  RECEIPT_ARCHIVE_EXPORT_PDF: 20,
  RECEIPT_ARCHIVE_VIEW_TAX_INFO: 21,

  TABLE_VIEW: 22,
  TABLE_RESERVE: 23,
  TABLE_ATTACH_RECEIPT: 24,
  TABLE_RELEASE: 25,

  DASHBOARD_VIEW: 26,
  DASHBOARD_VIEW_SALES_SUMMARY: 27,
  DASHBOARD_VIEW_BEST_SELLERS: 28,
  DASHBOARD_VIEW_REVENUE_PER_EMPLOYEE: 29,
  DASHBOARD_VIEW_ALERTS: 30,

  INVENTORY_VIEW: 31,
  INVENTORY_ADD: 32,
  INVENTORY_UPDATE: 33,
  INVENTORY_DELETE: 34,
  INVENTORY_RECEIVE_GOODS: 35,
  INVENTORY_STOCKTAKE: 36,
  INVENTORY_SET_ALERTS: 37,
  INVENTORY_VIEW_HISTORY: 38,
  INVENTORY_AUTO_RESTOCK_CONFIG: 39,
  INVENTORY_VIEW_AUDIT_LOG: 40,

  PRODUCT_MANAGEMENT_VIEW: 41,
  PRODUCT_MANAGEMENT_ADD: 42,
  PRODUCT_MANAGEMENT_UPDATE: 43,
  PRODUCT_MANAGEMENT_DELETE: 44,
  PRODUCT_MANAGEMENT_SET_PRICING_TIERS: 45,
  PRODUCT_MANAGEMENT_ASSIGN_GROUP: 46,
  PRODUCT_MANAGEMENT_SET_BARCODE: 47,
  PRODUCT_MANAGEMENT_DEFINE_COST_CENTER: 48,
  PRODUCT_MANAGEMENT_BULK_IMPORT: 49,
  PRODUCT_MANAGEMENT_BULK_EXPORT: 50,
  PRODUCT_MANAGEMENT_SET_TAX_CLASS: 51,
  PRODUCT_MANAGEMENT_SET_DEFAULT_DISCOUNT: 52,
  PRODUCT_MANAGEMENT_SET_LOSS_RETURN_THRESHOLD: 53,

  CUSTOMER_MANAGEMENT_VIEW: 54,
  CUSTOMER_MANAGEMENT_ADD: 55,
  CUSTOMER_MANAGEMENT_UPDATE: 56,
  CUSTOMER_MANAGEMENT_DELETE: 57,
  CUSTOMER_MANAGEMENT_VIEW_HISTORY: 58,
  CUSTOMER_MANAGEMENT_ASSIGN_LOYALTY: 59,
  CUSTOMER_MANAGEMENT_MERGE_DUPLICATES: 60,

  REPORT_VIEW: 61,
  REPORT_GENERATE_X: 62,
  REPORT_GENERATE_Z: 63,
  REPORT_SALES_BY_CATEGORY: 64,
  REPORT_SALES_BY_TIME: 65,
  REPORT_SALES_BY_OPERATOR: 66,
  REPORT_TAX_BREAKDOWN: 67,
  REPORT_EXPORT_GOBD: 68,
  REPORT_EXPORT_GDPDU: 69,
  REPORT_DOWNLOAD_ARCHIVE: 70,
  REPORT_CONFIGURE_SCHEDULE: 71,

  EMPLOYEE_VIEW: 72,
  EMPLOYEE_ADD: 73,
  EMPLOYEE_UPDATE: 74,
  EMPLOYEE_DELETE: 75,
  EMPLOYEE_UPDATE_STATUS: 76,
  EMPLOYEE_VIEW_STATS: 77,
  EMPLOYEE_ASSIGN_ROLE: 78,
  EMPLOYEE_SET_PERMISSIONS: 79,
  EMPLOYEE_VIEW_LOGIN_HISTORY: 80,
  EMPLOYEE_ASSIGN_SHIFT: 81,
  EMPLOYEE_VIEW_REVENUE: 82,
  EMPLOYEE_VIEW_LIST: 83,
  EMPLOYEE_LIST_ROLES: 84,

  SETTINGS_VIEW: 85,
  SETTINGS_UPDATE: 86,
  SETTINGS_CONFIGURE_VAT: 87,
  SETTINGS_CONFIGURE_COMPANY_INFO: 88,
  SETTINGS_CONFIGURE_CURRENCY: 89,
  SETTINGS_CONFIGURE_LANGUAGE: 90,
  SETTINGS_CONFIGURE_BACKUP_PATH: 91,

  COMPANY_VIEW: 92,
  COMPANY_UPDATE: 93,
  COMPANY_CONFIGURE_LEGAL: 94,
  COMPANY_CONFIGURE_LOGO: 95,
  COMPANY_CONFIGURE_VAT_NUMBER: 96,
  COMPANY_CONFIGURE_GOBD_GDPDU: 97,

  PAYMENT_SETTINGS_VIEW: 98,
  PAYMENT_SETTINGS_UPDATE: 99,
  PAYMENT_SETTINGS_ENABLE_METHOD: 100,
  PAYMENT_SETTINGS_DISABLE_METHOD: 101,
  PAYMENT_SETTINGS_SET_DEFAULT_CURRENCY: 102,
  PAYMENT_SETTINGS_SET_CARD_FEE: 103,
  PAYMENT_SETTINGS_CONFIGURE_INVOICE: 104,

  BACKUP_CONFIGURE_PATH: 105,
  BACKUP_TRIGGER: 106,
  BACKUP_RESTORE: 107,
  BACKUP_VIEW_LOGS: 108,

  HARDWARE_CONFIGURE_EC_TERMINAL: 109,
  HARDWARE_CONFIGURE_DRAWER: 110,
  HARDWARE_CONFIGURE_PRINTER: 111,
  HARDWARE_CONFIGURE_OFFLINE_SYNC: 112,
  HARDWARE_ENABLE_MODULE: 113,
  HARDWARE_DISABLE_MODULE: 114,

  AUDIT_VIEW_LOGS: 115,
  AUDIT_VIEW_DATA_DELETION_LOGS: 116,
  AUDIT_VIEW_LOGIN_ATTEMPTS: 117,

  VOUCHER_VIEW: 118,
  VOUCHER_ADD: 119,
  VOUCHER_UPDATE: 120,
  VOUCHER_DELETE: 121,
  VOUCHER_ASSIGN_TO_CUSTOMER: 122,
  VOUCHER_REDEEM: 123,

  SHIFT_VIEW: 124,
  SHIFT_ADD: 125,
  SHIFT_UPDATE: 126,
  SHIFT_CLOSE: 127,
  SHIFT_VIEW_STATS: 128,

  LANGUAGE_VIEW: 129,
  LANGUAGE_ADD: 130,
  LANGUAGE_UPDATE: 131,
  LANGUAGE_DELETE: 132,
  LANGUAGE_SET_DEFAULT: 133,

  ALL: 134
};


/**
 * Permission code constants
 */
export const PERMISSION_CODES = {
  POS_VIEW: 'pos:view',
  POS_ADD_PRODUCT: 'pos:addproduct',
  POS_REMOVE_PRODUCT: 'pos:removeproduct',
  POS_APPLY_DISCOUNT: 'pos:applydiscount',
  POS_OVERRIDE_DISCOUNT: 'pos:overridediscount',
  POS_SELECT_ORDER_TYPE: 'pos:selectordertype',
  POS_PARK_RECEIPT: 'pos:parkreceipt',
  POS_RESUME_RECEIPT: 'pos:resumereceipt',
  POS_DELETE_RECEIPT: 'pos:deletereceipt',
  POS_PRINT_RECEIPT: 'pos:printreceipt',
  POS_PRINT_KITCHEN_COPY: 'pos:printkitchencopy',
  POS_OPEN_DRAWER: 'pos:opendrawer',
  POS_HANDLE_PAYMENT: 'pos:handlepayment',
  POS_REFUND: 'pos:refund',
  POS_CANCEL_FINALIZED_TRANSACTION: 'pos:cancelfinalizedtransaction',
  POS_OVERRIDE_SALE: 'pos:overridesale',

  RECEIPT_ARCHIVE_VIEW: 'receiptarchive:view',
  RECEIPT_ARCHIVE_SEARCH: 'receiptarchive:search',
  RECEIPT_ARCHIVE_VIEW_DETAILS: 'receiptarchive:viewdetails',
  RECEIPT_ARCHIVE_REPRINT: 'receiptarchive:reprint',
  RECEIPT_ARCHIVE_EXPORT_PDF: 'receiptarchive:exportpdf',
  RECEIPT_ARCHIVE_VIEW_TAX_INFO: 'receiptarchive:viewtaxinfo',

  TABLE_VIEW: 'table:view',
  TABLE_RESERVE: 'table:reserve',
  TABLE_ATTACH_RECEIPT: 'table:attachreceipt',
  TABLE_RELEASE: 'table:release',

  DASHBOARD_VIEW: 'dashboard:view',
  DASHBOARD_VIEW_SALES_SUMMARY: 'dashboard:viewsalessummary',
  DASHBOARD_VIEW_BEST_SELLERS: 'dashboard:viewbestsellers',
  DASHBOARD_VIEW_REVENUE_PER_EMPLOYEE: 'dashboard:viewrevenueperemployee',
  DASHBOARD_VIEW_ALERTS: 'dashboard:viewalerts',

  INVENTORY_VIEW: 'inventory:view',
  INVENTORY_ADD: 'inventory:add',
  INVENTORY_UPDATE: 'inventory:update',
  INVENTORY_DELETE: 'inventory:delete',
  INVENTORY_RECEIVE_GOODS: 'inventory:receivegoods',
  INVENTORY_STOCKTAKE: 'inventory:stocktake',
  INVENTORY_SET_ALERTS: 'inventory:setalerts',
  INVENTORY_VIEW_HISTORY: 'inventory:viewhistory',
  INVENTORY_AUTO_RESTOCK_CONFIG: 'inventory:autorestockconfig',
  INVENTORY_VIEW_AUDIT_LOG: 'inventory:viewauditlog',

  PRODUCT_MANAGEMENT_VIEW: 'productmanagement:view',
  PRODUCT_MANAGEMENT_ADD: 'productmanagement:add',
  PRODUCT_MANAGEMENT_UPDATE: 'productmanagement:update',
  PRODUCT_MANAGEMENT_DELETE: 'productmanagement:delete',
  PRODUCT_MANAGEMENT_SET_PRICING_TIERS: 'productmanagement:setpricingtiers',
  PRODUCT_MANAGEMENT_ASSIGN_GROUP: 'productmanagement:assigngroup',
  PRODUCT_MANAGEMENT_SET_BARCODE: 'productmanagement:setbarcode',
  PRODUCT_MANAGEMENT_DEFINE_COST_CENTER: 'productmanagement:definecostcenter',
  PRODUCT_MANAGEMENT_BULK_IMPORT: 'productmanagement:bulkimport',
  PRODUCT_MANAGEMENT_BULK_EXPORT: 'productmanagement:bulkexport',
  PRODUCT_MANAGEMENT_SET_TAX_CLASS: 'productmanagement:settaxclass',
  PRODUCT_MANAGEMENT_SET_DEFAULT_DISCOUNT: 'productmanagement:setdefaultdiscount',
  PRODUCT_MANAGEMENT_SET_LOSS_RETURN_THRESHOLD: 'productmanagement:setlossreturnthreshold',

  CUSTOMER_MANAGEMENT_VIEW: 'customermanagement:view',
  CUSTOMER_MANAGEMENT_ADD: 'customermanagement:add',
  CUSTOMER_MANAGEMENT_UPDATE: 'customermanagement:update',
  CUSTOMER_MANAGEMENT_DELETE: 'customermanagement:delete',
  CUSTOMER_MANAGEMENT_VIEW_HISTORY: 'customermanagement:viewhistory',
  CUSTOMER_MANAGEMENT_ASSIGN_LOYALTY: 'customermanagement:assignloyalty',
  CUSTOMER_MANAGEMENT_MERGE_DUPLICATES: 'customermanagement:mergeduplicates',

  REPORT_VIEW: 'report:view',
  REPORT_GENERATE_X: 'report:generatex',
  REPORT_GENERATE_Z: 'report:generatez',
  REPORT_SALES_BY_CATEGORY: 'report:generatesalesbycategory',
  REPORT_SALES_BY_TIME: 'report:generatesalesbytime',
  REPORT_SALES_BY_OPERATOR: 'report:generatesalesbyoperator',
  REPORT_TAX_BREAKDOWN: 'report:generatetaxbreakdown',
  REPORT_EXPORT_GOBD: 'report:exportgobd',
  REPORT_EXPORT_GDPDU: 'report:exportgdpdu',
  REPORT_DOWNLOAD_ARCHIVE: 'report:downloadarchive',
  REPORT_CONFIGURE_SCHEDULE: 'report:configureschedule',

  EMPLOYEE_VIEW: 'employee:view',
  EMPLOYEE_ADD: 'employee:add',
  EMPLOYEE_UPDATE: 'employee:update',
  EMPLOYEE_DELETE: 'employee:delete',
  EMPLOYEE_UPDATE_STATUS: 'employee:updatestatus',
  EMPLOYEE_VIEW_STATS: 'employee:viewstats',
  EMPLOYEE_ASSIGN_ROLE: 'employee:assignrole',
  EMPLOYEE_SET_PERMISSIONS: 'employee:setpermissions',
  EMPLOYEE_VIEW_LOGIN_HISTORY: 'employee:viewloginhistory',
  EMPLOYEE_ASSIGN_SHIFT: 'employee:assignshift',
  EMPLOYEE_VIEW_REVENUE: 'employee:viewrevenue',
  EMPLOYEE_VIEW_LIST: 'employee:viewlist',
  EMPLOYEE_LIST_ROLES: 'employee:listroles',

  SETTINGS_VIEW: 'settings:view',
  SETTINGS_UPDATE: 'settings:update',
  SETTINGS_CONFIGURE_VAT: 'settings:configurevat',
  SETTINGS_CONFIGURE_COMPANY_INFO: 'settings:configurecompanyinfo',
  SETTINGS_CONFIGURE_CURRENCY: 'settings:configurecurrency',
  SETTINGS_CONFIGURE_LANGUAGE: 'settings:configurelanguage',
  SETTINGS_CONFIGURE_BACKUP_PATH: 'settings:configurebackuppath',

  COMPANY_VIEW: 'company:view',
  COMPANY_UPDATE: 'company:update',
  COMPANY_CONFIGURE_LEGAL: 'company:configurelegal',
  COMPANY_CONFIGURE_LOGO: 'company:configurelogo',
  COMPANY_CONFIGURE_VAT_NUMBER: 'company:configurevatnumber',
  COMPANY_CONFIGURE_GOBD_GDPDU: 'company:configuregobdgdpdu',

  PAYMENT_SETTINGS_VIEW: 'paymentsettings:view',
  PAYMENT_SETTINGS_UPDATE: 'paymentsettings:update',
  PAYMENT_SETTINGS_ENABLE_METHOD: 'paymentsettings:enablemethod',
  PAYMENT_SETTINGS_DISABLE_METHOD: 'paymentsettings:disablemethod',
  PAYMENT_SETTINGS_SET_DEFAULT_CURRENCY: 'paymentsettings:setdefaultcurrency',
  PAYMENT_SETTINGS_SET_CARD_FEE: 'paymentsettings:setcardfee',
  PAYMENT_SETTINGS_CONFIGURE_INVOICE: 'paymentsettings:configureinvoice',

  BACKUP_CONFIGURE_PATH: 'backup:configurepath',
  BACKUP_TRIGGER: 'backup:trigger',
  BACKUP_RESTORE: 'backup:restore',
  BACKUP_VIEW_LOGS: 'backup:viewlogs',

  HARDWARE_CONFIGURE_EC_TERMINAL: 'hardware:configureecterminal',
  HARDWARE_CONFIGURE_DRAWER: 'hardware:configuredrawer',
  HARDWARE_CONFIGURE_PRINTER: 'hardware:configureprinter',
  HARDWARE_CONFIGURE_OFFLINE_SYNC: 'hardware:configureofflinesync',
  HARDWARE_ENABLE_MODULE: 'hardware:enablemodule',
  HARDWARE_DISABLE_MODULE: 'hardware:disablemodule',

  AUDIT_VIEW_LOGS: 'audit:viewlogs',
  AUDIT_VIEW_DATA_DELETION_LOGS: 'audit:viewdatadeletionlogs',
  AUDIT_VIEW_LOGIN_ATTEMPTS: 'audit:viewloginattempts',

  VOUCHER_VIEW: 'voucher:view',
  VOUCHER_ADD: 'voucher:add',
  VOUCHER_UPDATE: 'voucher:update',
  VOUCHER_DELETE: 'voucher:delete',
  VOUCHER_ASSIGN_TO_CUSTOMER: 'voucher:assigntocustomer',
  VOUCHER_REDEEM: 'voucher:redeem',

  SHIFT_VIEW: 'shift:view',
  SHIFT_ADD: 'shift:add',
  SHIFT_UPDATE: 'shift:update',
  SHIFT_CLOSE: 'shift:close',
  SHIFT_VIEW_STATS: 'shift:viewstats',

  LANGUAGE_VIEW: 'language:view',
  LANGUAGE_ADD: 'language:add',
  LANGUAGE_UPDATE: 'language:update',
  LANGUAGE_DELETE: 'language:delete',
  LANGUAGE_SET_DEFAULT: 'language:setdefault',

  ALL: 'ALL'
}; 