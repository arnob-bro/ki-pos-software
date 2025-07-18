// preload.js
const { contextBridge, ipcRenderer } = require("electron");
const { shell } = require("electron");

contextBridge.exposeInMainWorld("posAPI", {
  // 🔐 Auth
  login: (userId, password) => ipcRenderer.invoke("login", userId, password),
  logout: (userId, refreshToken) => ipcRenderer.invoke("logout", userId, refreshToken),
  // Products
  listProducts: (page, limit) =>
    ipcRenderer.invoke("products:list", page, limit),
  searchProducts: (query, limit) =>
    ipcRenderer.invoke("products:search", query, limit),
  addProduct: (product, currentUser) => ipcRenderer.invoke("products:add", product, currentUser),
  updateProduct: (product, currentUser) => ipcRenderer.invoke("products:update", product, currentUser),
  deleteProduct: (id, currentUser) => ipcRenderer.invoke("products:delete", id, currentUser),
  getProduct: (id) => ipcRenderer.invoke("products:get", id),
  getLowStockProducts: (threshold) =>
    ipcRenderer.invoke("products:getLowStock", threshold),
  listProductCategories: () => ipcRenderer.invoke("productCategories:list"),
  // Transactions
  addTransaction: (data, currentUser) => ipcRenderer.invoke('transactions:add', data, currentUser),
  listTransactions: (page, limit) => ipcRenderer.invoke('transactions:list', page, limit),
  getTransaction: (id) => ipcRenderer.invoke('transactions:get', id),
  getReceipts: (filters) => ipcRenderer.invoke('transactions:getReceipts', filters),
  addSale: (sale, currentUser) => ipcRenderer.invoke('sales:add', sale, currentUser),
  // Employees
  listEmployees: (page, limit, filters) => ipcRenderer.invoke('employees:list', page, limit, filters),
  getEmployee: (id) => ipcRenderer.invoke('employees:get', id),
  addEmployee: (employeeData, currentUser) => ipcRenderer.invoke('employees:add', employeeData, currentUser),
  updateEmployee: (id, employeeData) => ipcRenderer.invoke('employees:update', id, employeeData),
  deleteEmployee: (id) => ipcRenderer.invoke('employees:delete', id),
  updateEmployeeStatus: (id, status) => ipcRenderer.invoke('employees:updateStatus', id, status),
  listRoles: () => ipcRenderer.invoke('employees:listRoles'),
  getEmployeeStats: () => ipcRenderer.invoke('employees:getStats'),

  // Reports
  generateXReport: (date, userId) => ipcRenderer.invoke('reports:generateX', date, userId),
  generateZReport: (date, userId) => ipcRenderer.invoke('reports:generateZ', date, userId),
  checkZReportExists: (date, userId) => ipcRenderer.invoke('reports:checkZReportExists', date, userId),
  listReports: (page, limit) => ipcRenderer.invoke('reports:list', page, limit),
  exportGoBD: (startDate, endDate) => ipcRenderer.invoke('reports:exportGoBD', startDate, endDate),
  generatePDFReport: (reportId) => ipcRenderer.invoke('reports:generatePDF', reportId),
  downloadReportFile: (filePath) => ipcRenderer.invoke('reports:downloadFile', filePath),
  getReportStats: () => ipcRenderer.invoke('reports:getStats'),
  openFile: (filePath) => ipcRenderer.invoke('open-file', filePath),
  // Permissions
  listPermissions: () => ipcRenderer.invoke('employees:listPermissions'),
  getEmployeePermissions: (employeeId) => ipcRenderer.invoke('employees:getEmployeePermissions', employeeId),
  updateEmployeePermissions: (employeeId, permissionCodes) => ipcRenderer.invoke('employees:updateEmployeePermissions', employeeId, permissionCodes),
  
  // Role Management
  addRole: (roleData) => ipcRenderer.invoke('roles:add', roleData),
  getRole: (id) => ipcRenderer.invoke('roles:get', id),
  updateRole: (id, roleData) => ipcRenderer.invoke('roles:update', id, roleData),
  deleteRole: (id) => ipcRenderer.invoke('roles:delete', id),
  getRoleUsage: (id) => ipcRenderer.invoke('roles:getUsage', id),
  
  // Hardware Configuration
  getHardwareConfig: () => ipcRenderer.invoke('hardware:getConfig'),
  saveHardwareConfig: (config) => ipcRenderer.invoke('hardware:saveConfig', config),
  testECTerminal: (config) => ipcRenderer.invoke('hardware:testECTerminal', config),
  testDrawer: (config) => ipcRenderer.invoke('hardware:testDrawer', config),
  testPrinter: (config) => ipcRenderer.invoke('hardware:testPrinter', config),
  syncData: () => ipcRenderer.invoke('hardware:syncData'),
  getAvailablePorts: () => ipcRenderer.invoke('hardware:getAvailablePorts'),
  getHardwareStatus: () => ipcRenderer.invoke('hardware:getStatus'),

  // Dashboard
  getSalesStats: (view) => ipcRenderer.invoke('dashboard:getSalesStats', view),
  getTopProducts: (limit) => ipcRenderer.invoke('dashboard:getTopProducts', limit),
  getLowStockItems: (threshold) => ipcRenderer.invoke('dashboard:getLowStockItems', threshold),
  getAuditLogs: (page, limit) => ipcRenderer.invoke('dashboard:getAuditLogs', page, limit),
}); 