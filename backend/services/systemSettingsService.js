// services/companyInfoService.js

class SystemSettingsService {
    constructor(db) {
      this.db = db;
  
      // Make sure the system_settings table exists (run once)
      this.db.prepare(`
        CREATE TABLE IF NOT EXISTS system_settings (
          id INTEGER PRIMARY KEY,
          backupPath TEXT,
          vat TEXT,
          currency TEXT
        )
      `).run();
    }
  
    getSystemSettings() {
      const row = this.db.prepare("SELECT * FROM system_settings WHERE id = 1").get();
      if (!row) return null;
  
      return {
        ...row,
      };
    }
  
    updateSystemSettings(systemSettings) {
      const existing = this.db.prepare("SELECT id FROM system_settings WHERE id = 1").get();
  
      if (existing) {
        this.db.prepare(`
          UPDATE system_settings SET
            backupPath = ?,
            vat = ?,
            currency = ?
          WHERE id = 1
        `).run(
          systemSettings.backupPath,
          systemSettings.vat,
          systemSettings.currency
        );
      } else {
        this.db.prepare(`
          INSERT INTO system_settings (id, backupPath, vat, currency)
          VALUES (1, ?, ?, ?)
        `).run(
          systemSettings.backupPath,
          systemSettings.vat,
          systemSettings.currency
        );
      }
  
      return { success: true };
    }
  }
  
  module.exports = SystemSettingsService;
  