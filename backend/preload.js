// preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('posAPI', {
   // 🔐 Auth
   login: (userId, password) => ipcRenderer.invoke('login', userId, password),
  // Products
  listProducts: (page, limit) => ipcRenderer.invoke('products:list', page, limit),
  searchProducts: (query, limit) => ipcRenderer.invoke('products:search', query, limit),
  addProduct: (product) => ipcRenderer.invoke('products:add', product),
  updateProduct: (product) => ipcRenderer.invoke('products:update', product),
  getProduct: (id) => ipcRenderer.invoke('products:get', id),
  getLowStockProducts: (threshold) => ipcRenderer.invoke('products:getLowStock', threshold),

  // Transactions
  addTransaction: (data) => ipcRenderer.invoke('transactions:add', data),
  listTransactions: (page, limit) => ipcRenderer.invoke('transactions:list', page, limit),
  getTransaction: (id) => ipcRenderer.invoke('transactions:get', id),

  // Reports
  generateXReport: (date, userId) => ipcRenderer.invoke('reports:generateX', date, userId),
  generateZReport: (date, userId) => ipcRenderer.invoke('reports:generateZ', date, userId),
  checkZReportExists: (date, userId) => ipcRenderer.invoke('reports:checkZReportExists', date, userId),
  listReports: (page, limit) => ipcRenderer.invoke('reports:list', page, limit),
  exportGoBD: (startDate, endDate) => ipcRenderer.invoke('reports:exportGoBD', startDate, endDate),
  generatePDFReport: (reportId) => ipcRenderer.invoke('reports:generatePDF', reportId),
  getReportStats: () => ipcRenderer.invoke('reports:getStats'),
}); 