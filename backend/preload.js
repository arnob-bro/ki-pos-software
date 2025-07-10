// preload.js
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("posAPI", {
  // 🔐 Auth
  login: (userId, password) => ipcRenderer.invoke("login", userId, password),
  logout: (userId, refreshToken) => ipcRenderer.invoke("logout", userId, refreshToken),
  // Products
  listProducts: (page, limit) =>
    ipcRenderer.invoke("products:list", page, limit),
  searchProducts: (query, limit) =>
    ipcRenderer.invoke("products:search", query, limit),
  addProduct: (product) => ipcRenderer.invoke("products:add", product),
  updateProduct: (product) => ipcRenderer.invoke("products:update", product),
  deleteProduct: (id) => ipcRenderer.invoke("products:delete", id),
  getProduct: (id) => ipcRenderer.invoke("products:get", id),
  getLowStockProducts: (threshold) =>
    ipcRenderer.invoke("products:getLowStock", threshold),
  listProductCategories: () => ipcRenderer.invoke("productCategories:list"),
  // Transactions
  addTransaction: (data) => ipcRenderer.invoke('transactions:add', data),
  listTransactions: (page, limit) => ipcRenderer.invoke('transactions:list', page, limit),
  getTransaction: (id) => ipcRenderer.invoke('transactions:get', id),
  getReceipts: (filters) => ipcRenderer.invoke('transactions:getReceipts', filters),
  // Employees
  listEmployees: (page, limit, filters) => ipcRenderer.invoke('employees:list', page, limit, filters),
  getEmployee: (id) => ipcRenderer.invoke('employees:get', id),
  addEmployee: (employeeData) => ipcRenderer.invoke('employees:add', employeeData),
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
  getReportStats: () => ipcRenderer.invoke('reports:getStats'),
  // Permissions
  listPermissions: () => ipcRenderer.invoke('employees:listPermissions'),
  getEmployeePermissions: (employeeId) => ipcRenderer.invoke('employees:getEmployeePermissions', employeeId),
  updateEmployeePermissions: (employeeId, permissionCodes) => ipcRenderer.invoke('employees:updateEmployeePermissions', employeeId, permissionCodes),
}); 