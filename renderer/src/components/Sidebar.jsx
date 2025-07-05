import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <aside className='sidebar'>
      <div className='logo'>Point of Sale</div>
      <button
        className={`nav-btn${location.pathname === '/sales-interface' ? ' active' : ''}`}
        onClick={() => navigate('/sales-interface')}
      >
        🛒 POS
      </button>
      <button
        className={`nav-btn${location.pathname === '/receipt-archive' ? ' active' : ''}`}
        onClick={() => navigate('/receipt-archive')}
      >
        📄 Receipt Archive
      </button>
      <button
        className={`nav-btn${location.pathname === '/product-management' ? ' active' : ''}`}
        onClick={() => navigate('/product-management')}
      >
        📄 Product Management
      </button>
      <button
        className={`nav-btn${location.pathname === '/employee-management' ? ' active' : ''}`}
        onClick={() => navigate('/employee-management')}
      >
        📄 Employee Management
      </button>
    </aside>
  );
};

export default Sidebar;