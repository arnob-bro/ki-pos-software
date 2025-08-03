// services/companyInfoService.js

class CompanyInfoService {
  constructor(db) {
    this.db = db;

    // Make sure the company_info table exists (run once)
    this.db.prepare(`
      CREATE TABLE IF NOT EXISTS company_info (
        id INTEGER PRIMARY KEY,
        companyName TEXT,
        legalAddress TEXT,
        vatNumber TEXT,
        gobdEnabled INTEGER,
        logoPath TEXT
      )
    `).run();
  }

  getCompanyInfo() {
    const row = this.db.prepare("SELECT * FROM company_info WHERE id = 1").get();
    if (!row) return null;

    return {
      ...row,
      gobdEnabled: row.gobdEnabled === 1,
    };
  }

  saveCompanyInfo(companyInfo) {
    const gobdEnabledInt = companyInfo.gobdEnabled ? 1 : 0;
    const logoPath = companyInfo.logo || null;

    const existing = this.db.prepare("SELECT id FROM company_info WHERE id = 1").get();

    if (existing) {
      this.db.prepare(`
        UPDATE company_info SET
          companyName = ?,
          legalAddress = ?,
          vatNumber = ?,
          gobdEnabled = ?,
          logoPath = ?
        WHERE id = 1
      `).run(
        companyInfo.companyName,
        companyInfo.legalAddress,
        companyInfo.vatNumber,
        gobdEnabledInt,
        logoPath
      );
    } else {
      this.db.prepare(`
        INSERT INTO company_info (id, companyName, legalAddress, vatNumber, gobdEnabled, logoPath)
        VALUES (1, ?, ?, ?, ?, ?)
      `).run(
        companyInfo.companyName,
        companyInfo.legalAddress,
        companyInfo.vatNumber,
        gobdEnabledInt,
        logoPath
      );
    }

    return { success: true };
  }
}

module.exports = CompanyInfoService;
