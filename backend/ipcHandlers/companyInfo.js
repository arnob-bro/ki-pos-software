// ipcHandlers/companyInfo.js
const CompanyInfoController = require("../controllers/companyInfoController");
const CompanyInfoService = require("../services/companyInfoService");

module.exports = function registerCompanyInfoHandlers(ipcMain, db) {
  const companyInfoService = new CompanyInfoService(db);
  const companyInfoController = new CompanyInfoController(companyInfoService);

  ipcMain.handle("companyInfo:get", () => companyInfoController.getCompanyInfo());

  ipcMain.handle("companyInfo:save", (event, companyInfo) =>
    companyInfoController.saveCompanyInfo(companyInfo)
  );
};
