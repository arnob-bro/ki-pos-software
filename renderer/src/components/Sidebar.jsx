import React from "react"
import { useLocation, useNavigate } from "react-router-dom"
import useUserStore from "../stores/userStore"
import "./module.sidebar.css"
import useLanguageStore from "../stores/languageStore";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, hasPermissionByCode } = useUserStore();
  const language = useLanguageStore((state) => state.language);
  const setLanguage = useLanguageStore((state) => state.setLanguage);
  const toggleLanguage = () => setLanguage(language === 'en' ? 'de' : 'en');

    const handleLogout = async () => {
        const result = await logout()
        if (result && result.success) {
            navigate("/")
        } else {
            // Optionally show an error message here
            alert(result?.message || "Logout failed")
        }
    }

    return (
        <aside className="sidebar">
            <div className="logo">Point of Sale</div>

            {/* POS - Always visible for authenticated users */}
            <button
                className={`nav-btn${
                    location.pathname === "/sales-interface" ? " active" : ""
                }`}
                onClick={() => navigate("/sales-interface")}>
                Sales Interface
            </button>
            {/* Customer Management - NEED TO UPDATE THE PERMISSION */}
            <button
                className={`nav-btn${
                    location.pathname === "/customer-management"
                        ? " active"
                        : ""
                }`}
                onClick={() => navigate("/customer-management")}>
                Customer Management
            </button>
            {/* Payment Settings - NEED TO UPDATE THE PERMISSION */}
            <button
                className={`nav-btn${
                    location.pathname === "/payment-settings" ? " active" : ""
                }`}
                onClick={() => navigate("/payment-settings")}>
                Payment Settings
            </button>

            {/* Dashboard - Requires dashboard:view permission */}
            {hasPermissionByCode("dashboard:view") && (
                <button
                    className={`nav-btn${
                        location.pathname === "/dashboard" ? " active" : ""
                    }`}
                    onClick={() => navigate("/dashboard")}>
                    Dashboard
                </button>
            )}

            {/* Receipt Archive - Requires receiptarchive:view permission */}
            {hasPermissionByCode("receiptarchive:view") && (
                <button
                    className={`nav-btn${
                        location.pathname === "/receipt-archive"
                            ? " active"
                            : ""
                    }`}
                    onClick={() => navigate("/receipt-archive")}>
                    Receipt Archive
                </button>
            )}

            {/* Product Management - Requires product:view permission */}
            {hasPermissionByCode("productmanagement:view") && (
                <button
                    className={`nav-btn${
                        location.pathname === "/product-management"
                            ? " active"
                            : ""
                    }`}
                    onClick={() => navigate("/product-management")}>
                    Product Management
                </button>
            )}

            {/* Employee Management - Requires settings:view permission */}
            {hasPermissionByCode("employee:view") && (
                <button
                    className={`nav-btn${
                        location.pathname === "/employee-management"
                            ? " active"
                            : ""
                    }`}
                    onClick={() => navigate("/employee-management")}>
                    Employee Management
                </button>
            )}

            {/* Reports - Requires report:view permission */}
            {hasPermissionByCode("inventory:view") && (
                <button
                    className={`nav-btn${
                        location.pathname === "/inventory-management"
                            ? " active"
                            : ""
                    }`}
                    onClick={() => navigate("/inventory-management")}>
                    Inventory Management
                </button>
            )}

      {/* Reports - Requires report:view permission */}
      {hasPermissionByCode('report:view') && (
        <button
          className={`nav-btn${
            location.pathname === "/reports" ? " active" : ""
          }`}
          onClick={() => navigate("/reports")}
        >
          📊 Reports
        </button>
      )}

      {/* Company Info - Requires company:view permission */}
      {hasPermissionByCode('company:view') && (
        <button
          className={`nav-btn${
            location.pathname === "/company-info" ? " active" : ""
          }`}
          
          onClick={() => navigate("/company-info")}
        >
          🏢 Company Info
        </button>
      )}

      {/* System Settings - Requires settings:view permission */}
      {hasPermissionByCode('settings:view') && (      
        <button
          className={`nav-btn${
            location.pathname === "/system-settings" ? " active" : ""
          }`} 
          onClick={() => navigate("/system-settings")}
        >
          ⚙️ System Settings
        </button>
      )}  
      
      {/* Hardware Configuration - Requires settings:view permission */}
      {hasPermissionByCode('settings:view') && (      
        <button
          className={`nav-btn${
            location.pathname === "/hardware-configuration" ? " active" : ""
          }`} 
          onClick={() => navigate("/hardware-configuration")}
        >
          🔧 Hardware Configuration
        </button>
      )}  
      
      {/* Language Toggle */}
      <button
        style={{
          marginTop: '16px',
          backgroundColor: '#007bff',
          color: '#fff',
          border: 'none',
          padding: '5px',
          borderRadius: '6px',
          cursor: 'pointer',
          fontWeight: 'bold',
          transition: 'background-color 0.3s ease',
        }}
        onClick={toggleLanguage}
      >
        {language === 'en' ? '🇬🇧 English' : '🇩🇪 Deutsch'}
      </button>

            <button
                style={{
                    marginTop: "auto",
                    backgroundColor: "#dc3545",
                    color: "#fff",
                    border: "none",
                    padding: "5px",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontWeight: "bold",
                    transition: "background-color 0.3s ease",
                }}
                onClick={handleLogout}
                onMouseEnter={(e) =>
                    (e.target.style.backgroundColor = "#c82333")
                }
                onMouseLeave={(e) =>
                    (e.target.style.backgroundColor = "#dc3545")
                }>
                Logout
            </button>
        </aside>
    )
}

export default Sidebar
