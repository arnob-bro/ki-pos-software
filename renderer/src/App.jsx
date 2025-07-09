import { Route, Routes } from "react-router-dom";
// import Settings from "./pages/Settings";
import POS from "./pages/POS/POS";

import "./App.css";
import Dashboard from './pages/Dashboard/Dashboard';
import EmployeeManagement from "./pages/EmployeeManagment/EmployeeManagement";
import Login from './pages/Login/Login';
import ProductManagement from './pages/ProductManagement/ProductManagement';
import ReceiptArchive from './pages/ReceiptArchive/ReceiptArchive';
import Reports from "./pages/Reports/Reports";

function App() {
	return (
		<Routes>
			<Route path='/' element={<Login />} />
			<Route path='/sales-interface' element={<POS />} />
		  <Route path='/dashboard' element={<Dashboard />} />
		  <Route path='/receipt-archive' element={<ReceiptArchive />} />
		  <Route path='/product-management' element={<ProductManagement />} />
		  <Route path='/employee-management' element={<EmployeeManagement />} />
		  <Route path='/reports' element={<Reports />} />
		</Routes>
	);
}

export default App;
