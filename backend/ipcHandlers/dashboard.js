const { db } = require('../config/db');

module.exports = function (ipcMain) {
  // Sales stats (daily/monthly)
  ipcMain.handle('dashboard:getSalesStats', async (event, view = 'daily') => {
    // Example: sum of sales for today or this month
    let query = 'SELECT SUM(total_amount) as total, COUNT(*) as transactions FROM transactions WHERE 1=1';
    if (view === 'daily') {
      query += ` AND DATE(timestamp) = DATE('now', 'localtime')`;
    } else if (view === 'monthly') {
      query += ` AND strftime('%Y-%m', timestamp) = strftime('%Y-%m', 'now', 'localtime')`;
    }
    const result = db.prepare(query).get();
    return result;
  });

  // Top products
  ipcMain.handle('dashboard:getTopProducts', async (event, limit = 5) => {
    const query = `
      SELECT p.name, SUM(ti.quantity) as sold, SUM(ti.quantity * ti.unit_price) as revenue
      FROM transaction_items ti
      JOIN products p ON ti.product_id = p.id
      GROUP BY p.id
      ORDER BY sold DESC
      LIMIT ?
    `;
    return db.prepare(query).all(limit);
  });

  // Low stock items
  ipcMain.handle('dashboard:getLowStockItems', async (event, threshold = 5) => {
    const query = `
      SELECT name, stock_quantity as quantity
      FROM products
      WHERE stock_quantity <= ?
      ORDER BY stock_quantity ASC
    `;
    return db.prepare(query).all(threshold);
  });

  // Audit logs
  ipcMain.handle('dashboard:getAuditLogs', async (event, page = 1, limit = 10) => {
    const offset = (page - 1) * limit;
    const logs = db.prepare(`
      SELECT action_type as action, user_id as user, table_name as table_name, timestamp
      FROM audit_logs
      ORDER BY timestamp DESC
      LIMIT ? OFFSET ?
    `).all(limit, offset);
    const count = db.prepare('SELECT COUNT(*) as total FROM audit_logs').get().total;
    return { logs, total: count };
  });

  ipcMain.handle('dashboard:getTotalProducts', async () => {
    const result = db.prepare('SELECT COUNT(*) as total FROM products').get();
    return { total: result.total };
  });
}; 