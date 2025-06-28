//sample code for now

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('posAPI', {
  // Products
  listProducts: (page, limit) => ipcRenderer.invoke('products:list', page, limit),
  searchProducts: (query, limit) => ipcRenderer.invoke('products:search', query, limit),
  addProduct: (product) => ipcRenderer.invoke('products:add', product),
  updateProduct: (product) => ipcRenderer.invoke('products:update', product),
  getProduct: (id) => ipcRenderer.invoke('products:get', id),
  getLowStockProducts: (threshold) => ipcRenderer.invoke('products:getLowStock', threshold),
  
  // Sales
  addSale: (sale) => ipcRenderer.invoke('sales:add', sale),
  listSales: (page, limit) => ipcRenderer.invoke('sales:list', page, limit),
  getSale: (id) => ipcRenderer.invoke('sales:get', id),
  getSalesByDateRange: (startDate, endDate, page, limit) => ipcRenderer.invoke('sales:getByDateRange', startDate, endDate, page, limit),
  getSalesSummary: () => ipcRenderer.invoke('sales:getSummary'),
  getRecentSales: (limit) => ipcRenderer.invoke('sales:getRecent', limit),
  getTopSellingProducts: (limit) => ipcRenderer.invoke('sales:getTopSelling', limit),
}); 