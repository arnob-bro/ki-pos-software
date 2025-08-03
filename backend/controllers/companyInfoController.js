// controllers/companyInfoController.js
class CompanyInfoController {
  constructor(companyInfoService) {
    this.companyInfoService = companyInfoService;
  }

  getCompanyInfo() {
    return this.companyInfoService.getCompanyInfo();
  }

  saveCompanyInfo(companyInfo) {
    console.log(companyInfo);
    return this.companyInfoService.saveCompanyInfo(companyInfo);
  }
}

module.exports = CompanyInfoController;
