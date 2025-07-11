import { Routes, Route } from "react-router-dom";
import POS from "./pages/POS/POS";
import "./App.css";
import Dashboard from './pages/Dashboard/Dashboard';
import EmployeeManagement from "./pages/EmployeeManagment/EmployeeManagement";
import Login from './pages/Login/Login';
import ProductManagement from './pages/ProductManagement/ProductManagement';
import ReceiptArchive from './pages/ReceiptArchive/ReceiptArchive';
import Reports from "./pages/Reports/Reports";
import InventoryManagement from "./pages/InventoryManagement/InventoryManagement";
import ProtectedRoute from './components/ProtectedRoute';
import CompanyProfile from "./pages/CompanyInfo/CompanyInfo";
import SystemSettings from "./pages/SystemSettings/SystemSettings";

function App() {
	return (
		<Routes>
			<Route path='/' element={<Login />} />
			
			{/* POS - No specific permission required for authenticated users */}
			<Route 
				path='/sales-interface' 
				element={
					<ProtectedRoute>
						<POS />
					</ProtectedRoute>
				} 
			/>
			
			{/* Dashboard - Requires dashboard:view permission */}
			<Route 
				path='/dashboard' 
				element={
					<ProtectedRoute requiredPermission="dashboard:view">
						<Dashboard />
					</ProtectedRoute>
				} 
			/>
			
			{/* Receipt Archive - Requires receiptarchive:view permission */}
			<Route 
				path='/receipt-archive' 
				element={
					<ProtectedRoute requiredPermission="receiptarchive:view">
						<ReceiptArchive />
					</ProtectedRoute>
				} 
			/>
			
			{/* Product Management - Requires product:view permission */}
			<Route 
				path='/product-management' 
				element={
					<ProtectedRoute requiredPermission="product:view">
						<ProductManagement />
					</ProtectedRoute>
				} 
			/>
			
			{/* Employee Management - Requires employee:view permission */}
			<Route 
				path='/employee-management' 
				element={
					<ProtectedRoute requiredPermission="settings:view">
						<EmployeeManagement />
					</ProtectedRoute>
				} 
			/>

			{/* Inventory Management - Requires inventory:view permission */}
			<Route 
				path='/inventory-management' 
				element={
					<ProtectedRoute requiredPermission="inventory:view">
						<InventoryManagement />
					</ProtectedRoute>
				} 
			/>
			
			{/* Reports - Requires report:view permission */}
			<Route 
				path='/reports' 
				element={
					<ProtectedRoute requiredPermission="report:view">
						<Reports />
					</ProtectedRoute>
				} 
			/>

			{/* Company Info - Requires company:view permission */}
			<Route 
				path='/company-info' 
				element={
					<ProtectedRoute requiredPermission="company:view">
						<CompanyProfile />
					</ProtectedRoute>
				} 
			/>

			{/* System Settings - Requires systemsettings:view permission */}
			<Route 
				path='/system-settings' 
				element={
					<SystemSettings />
				} 
			/>

		</Routes>
	);
}

export default App;
