import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useUserStore from "../stores/userStore";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useUserStore();

  const handleLogout = async () => {
    const result = await logout();
    if (result && result.success) {
      navigate("/");
    } else {
      // Optionally show an error message here
      alert(result?.message || "Logout failed");
    }
  };

  return (
    <aside className="sidebar">
      <div className="logo">Point of Sale</div>
      {/* <button
        className={`nav-btn${location.pathname === '/dashboard' ? ' active' : ''}`}
        onClick={() => navigate('/dashboard')}
      >
        Dashboard
      </button> */}
      <button
        className={`nav-btn${
          location.pathname === "/sales-interface" ? " active" : ""
        }`}
        onClick={() => navigate("/sales-interface")}
      >
        🛒 POS
      </button>
      <button
        className={`nav-btn${
          location.pathname === "/dashboard" ? " active" : ""
        }`}
        onClick={() => navigate("/dashboard")}
      >
        📋 Dashboard
      </button>
      <button
        className={`nav-btn${
          location.pathname === "/receipt-archive" ? " active" : ""
        }`}
        onClick={() => navigate("/receipt-archive")}
      >
        📄 Receipt Archive
      </button>
      <button
        className={`nav-btn${
          location.pathname === "/product-management" ? " active" : ""
        }`}
        onClick={() => navigate("/product-management")}
      >
        📄 Product Management
      </button>
      <button
        className={`nav-btn${
          location.pathname === "/employee-management" ? " active" : ""
        }`}
        onClick={() => navigate("/employee-management")}
      >
        📄 Employee Management
      </button>
      <button
        className={`nav-btn${
          location.pathname === "/reports" ? " active" : ""
        }`}
        onClick={() => navigate("/reports")}
      >
        📊 Reports
      </button>
      <button className="nav-btn logout-btn" onClick={handleLogout}>
        🚪 Logout
      </button>
    </aside>
  );
};

export default Sidebar;
