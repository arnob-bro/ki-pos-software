import React, { useEffect, useState } from "react";
import "./EmployeeManagement.css";
import Sidebar from "../../components/Sidebar";

const EmployeeManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [formData, setFormData] = useState({
    id: "",
    employee_id: "",
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    role: "",
    status: "active",
    shift_id: "",
    permissions: {
      can_process_returns: false,
      can_apply_discounts: false,
      can_void_transactions: false,
      can_access_reports: false,
      can_manage_inventory: false,
      can_override_prices: false,
      can_open_register: false,
      can_close_register: false,
      max_discount_percent: 0,
      max_void_amount: 0,
    },
    address: "",
    emergency_contact: "",
    emergency_phone: "",
    notes: "",
  });
  const [editing, setEditing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showPermissions, setShowPermissions] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterRole, setFilterRole] = useState("all");
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchEmployees();
    fetchDepartments();
    fetchShifts();
  }, []);

  const fetchEmployees = async () => {
    // Mock data - replace with actual API call
    const mockEmployees = [
      {
        id: 1,
        employee_id: "EMP001",
        first_name: "John",
        last_name: "Doe",
        email: "john.doe@company.com",
        phone: "555-0123",
        role: "cashier",
        status: "active",
        shift_id: 1,
        permissions: {
          can_process_returns: true,
          can_apply_discounts: true,
          can_void_transactions: false,
          can_access_reports: false,
          can_manage_inventory: false,
          can_override_prices: false,
          can_open_register: true,
          can_close_register: true,
          max_discount_percent: 10,
          max_void_amount: 50,
        },
        address: "123 Main St, City, State 12345",
        emergency_contact: "Jane Doe",
        emergency_phone: "555-0124",
        notes: "Reliable employee",
      },
      {
        id: 2,
        employee_id: "EMP002",
        first_name: "Alice",
        last_name: "Smith",
        email: "alice.smith@company.com",
        phone: "555-0456",
        role: "manager",
        status: "active",
        shift_id: 1,
        permissions: {
          can_process_returns: true,
          can_apply_discounts: true,
          can_void_transactions: true,
          can_access_reports: true,
          can_manage_inventory: true,
          can_override_prices: true,
          can_open_register: true,
          can_close_register: true,
          max_discount_percent: 25,
          max_void_amount: 500,
        },
        address: "456 Oak Ave, City, State 12345",
        emergency_contact: "Bob Smith",
        emergency_phone: "555-0457",
        notes: "Team leader",
      },
      {
        id: 3,
        employee_id: "EMP003",
        first_name: "Mike",
        last_name: "Johnson",
        email: "mike.johnson@company.com",
        phone: "555-0789",
        role: "inventory specialist",
        status: "active",
        shift_id: 2,
        permissions: {
          can_process_returns: false,
          can_apply_discounts: false,
          can_void_transactions: false,
          can_access_reports: false,
          can_manage_inventory: true,
          can_override_prices: false,
          can_open_register: false,
          can_close_register: false,
          max_discount_percent: 0,
          max_void_amount: 0,
        },
        address: "789 Pine St, City, State 12345",
        emergency_contact: "Sarah Johnson",
        emergency_phone: "555-0790",
        notes: "New hire",
      },
    ];
    setEmployees(mockEmployees);
  };

  const fetchDepartments = async () => {
    // Mock data - replace with actual API call
    const mockDepartments = [
      { id: 1, name: "Sales Floor" },
      { id: 2, name: "Management" },
      { id: 3, name: "Stockroom" },
      { id: 4, name: "Customer Service" },
    ];
    setDepartments(mockDepartments);
  };

  const fetchShifts = async () => {
    // Mock data - replace with actual API call
    const mockShifts = [
      {
        id: 1,
        name: "Morning (8AM-4PM)",
        start_time: "08:00",
        end_time: "16:00",
      },
      {
        id: 2,
        name: "Evening (4PM-12AM)",
        start_time: "16:00",
        end_time: "00:00",
      },
      {
        id: 3,
        name: "Night (12AM-8AM)",
        start_time: "00:00",
        end_time: "08:00",
      },
    ];
    setShifts(mockShifts);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.startsWith("permissions.")) {
      const permissionName = name.split(".")[1];
      setFormData({
        ...formData,
        permissions: {
          ...formData.permissions,
          [permissionName]: type === "checkbox" ? checked : value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: type === "checkbox" ? checked : value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (editing) {
      // Update employee
      const updatedEmployees = employees.map((emp) =>
        emp.id === formData.id ? { ...formData } : emp
      );
      setEmployees(updatedEmployees);
    } else {
      // Add new employee
      const newEmployee = {
        ...formData,
        id: employees.length + 1,
        employee_id:
          formData.employee_id ||
          `EMP${String(employees.length + 1).padStart(3, "0")}`,
      };
      setEmployees([...employees, newEmployee]);
    }

    resetForm();
    setShowForm(false);
  };

  const resetForm = () => {
    setFormData({
      id: "",
      employee_id: "",
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      role: "",
      status: "active",
      shift_id: "",
      permissions: {
        can_process_returns: false,
        can_apply_discounts: false,
        can_void_transactions: false,
        can_access_reports: false,
        can_manage_inventory: false,
        can_override_prices: false,
        can_open_register: false,
        can_close_register: false,
        max_discount_percent: 0,
        max_void_amount: 0,
      },
      address: "",
      emergency_contact: "",
      emergency_phone: "",
      notes: "",
    });
    setEditing(false);
    setShowPermissions(false);
  };

  const handleEdit = (employee) => {
    setFormData(employee);
    setEditing(true);
    setShowPermissions(true);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this employee?")) {
      setEmployees(employees.filter((emp) => emp.id !== id));
    }
  };

  const handleStatusChange = (id, newStatus) => {
    const updatedEmployees = employees.map((emp) =>
      emp.id === id ? { ...emp, status: newStatus } : emp
    );
    setEmployees(updatedEmployees);
  };

  const handleAddNew = () => {
    resetForm();
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    resetForm();
  };

  // Get unique roles from employees for filter dropdown
  const getUniqueRoles = () => {
    const roles = [...new Set(employees.map(emp => emp.role))];
    return roles.sort();
  };

  const filteredEmployees = employees.filter((employee) => {
    const searchText = searchTerm.toLowerCase();
    const matchesSearch =
      employee.first_name.toLowerCase().includes(searchText) ||
      employee.last_name.toLowerCase().includes(searchText) ||
      employee.employee_id.toLowerCase().includes(searchText) ||
      employee.email.toLowerCase().includes(searchText) ||
      employee.phone.includes(searchText) ||
      employee.role.toLowerCase().includes(searchText);

    const matchesStatus =
      filterStatus === "all" || employee.status === filterStatus;
    const matchesRole = filterRole === "all" || employee.role === filterRole;
    // Removed department filter since department_id is not in the data
    
    return matchesSearch && matchesStatus && matchesRole;
  });

  const getShiftName = (id) => {
    const shift = shifts.find((s) => s.id === parseInt(id));
    return shift ? shift.name : "N/A";
  };

  return (
    <div className="employee-management-page">
      <Sidebar />
      <div className="employee-management">
        <div className="employee-header">
          <h2>👥 Employee Management</h2>
          <button className="add-employee-btn" onClick={handleAddNew}>
            + Add New Employee
          </button>
        </div>
        <div className="employee-stats">
          <div className="stat-card">
            <h4>Total Employees</h4>
            <span>{employees.length}</span>
          </div>
          <div className="stat-card">
            <h4>Active</h4>
            <span>{employees.filter((e) => e.status === "active").length}</span>
          </div>
          <div className="stat-card">
            <h4>Inactive</h4>
            <span>
              {employees.filter((e) => e.status === "inactive").length}
            </span>
          </div>
          <div className="stat-card">
            <h4>Managers</h4>
            <span>{employees.filter((e) => e.role === "manager").length}</span>
          </div>
          <div className="stat-card">
            <h4>Showing Results</h4>
            <span>{filteredEmployees.length}</span>
          </div>
        </div>
        <div className="employee-controls">
          <div className="search-section">
            <input
              type="text"
              placeholder="Search by name, ID, email, phone, or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <button
              className="clear-search-btn"
              onClick={() => setSearchTerm("")}
              style={{ display: searchTerm ? "block" : "none" }}
            >
              Clear
            </button>
          </div>

          <div className="filters-section">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>

            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Roles</option>
              {getUniqueRoles().map((role) => (
                <option key={role} value={role}>
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </option>
              ))}
            </select>

            {/* Removed department filter since department_id is not in the data */}
          </div>
        </div>

        <div className="employee-table-container">
          <table className="employee-table">
            <thead>
              <tr>
                <th>Employee ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Shift</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map((employee) => (
                <tr key={employee.id}>
                  <td>{employee.employee_id}</td>
                  <td>
                    {employee.first_name} {employee.last_name}
                  </td>
                  <td>{employee.email}</td>
                  <td>
                    <span className={`role-badge ${employee.role.replace(/\s+/g, '-').toLowerCase()}`}>
                      {employee.role}
                    </span>
                  </td>
                  <td>{getShiftName(employee.shift_id)}</td>
                  <td>
                    <select
                      value={employee.status}
                      onChange={(e) =>
                        handleStatusChange(employee.id, e.target.value)
                      }
                      className={`status-select ${employee.status}`}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </td>
                  <td className="action-buttons">
                    <button
                      onClick={() => handleEdit(employee)}
                      className="edit-btn"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(employee.id)}
                      className="delete-btn"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal/Popup Form */}
        {showForm && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3>{editing ? "Edit Employee" : "Add New Employee"}</h3>
                <button className="close-btn" onClick={handleCloseForm}>
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit} className="employee-form">
                <div className="form-section">
                  <h4>Basic Information</h4>
                  <div className="form-row">
                    <input
                      name="employee_id"
                      placeholder="Employee ID"
                      value={formData.employee_id}
                      onChange={handleChange}
                    />
                    <input
                      name="first_name"
                      placeholder="First Name"
                      value={formData.first_name}
                      onChange={handleChange}
                      required
                    />
                    <input
                      name="last_name"
                      placeholder="Last Name"
                      value={formData.last_name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-row">
                    <input
                      name="email"
                      type="email"
                      placeholder="Email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                    <input
                      name="phone"
                      placeholder="Phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-section">
                  <h4>Work Information</h4>
                  <div className="form-row">
                    <input
                      name="role"
                      placeholder="Role (e.g., Cashier, Manager, Sales Associate)"
                      value={formData.role}
                      onChange={handleChange}
                      required
                    />
                    <select
                      name="shift_id"
                      value={formData.shift_id}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Shift</option>
                      {shifts.map((shift) => (
                        <option key={shift.id} value={shift.id}>
                          {shift.name}
                        </option>
                      ))}
                    </select>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </div>
                </div>

                <div className="form-section">
                  <h4>Security</h4>
                  <div className="form-row">
                    <button
                      type="button"
                      onClick={() => setShowPermissions(!showPermissions)}
                      className="toggle-permissions-btn"
                    >
                      {showPermissions ? "Hide" : "Show"} Permissions
                    </button>
                  </div>
                </div>

                {showPermissions && (
                  <div className="form-section">
                    <h4>POS Permissions</h4>
                    <div className="permissions-grid">
                      <label className="permission-item">
                        <input
                          type="checkbox"
                          name="permissions.can_process_returns"
                          checked={formData.permissions.can_process_returns}
                          onChange={handleChange}
                        />
                        Process Returns
                      </label>
                      <label className="permission-item">
                        <input
                          type="checkbox"
                          name="permissions.can_apply_discounts"
                          checked={formData.permissions.can_apply_discounts}
                          onChange={handleChange}
                        />
                        Apply Discounts
                      </label>
                      <label className="permission-item">
                        <input
                          type="checkbox"
                          name="permissions.can_void_transactions"
                          checked={formData.permissions.can_void_transactions}
                          onChange={handleChange}
                        />
                        Void Transactions
                      </label>
                      <label className="permission-item">
                        <input
                          type="checkbox"
                          name="permissions.can_access_reports"
                          checked={formData.permissions.can_access_reports}
                          onChange={handleChange}
                        />
                        Access Reports
                      </label>
                      <label className="permission-item">
                        <input
                          type="checkbox"
                          name="permissions.can_manage_inventory"
                          checked={formData.permissions.can_manage_inventory}
                          onChange={handleChange}
                        />
                        Manage Inventory
                      </label>
                      <label className="permission-item">
                        <input
                          type="checkbox"
                          name="permissions.can_override_prices"
                          checked={formData.permissions.can_override_prices}
                          onChange={handleChange}
                        />
                        Override Prices
                      </label>
                      <label className="permission-item">
                        <input
                          type="checkbox"
                          name="permissions.can_open_register"
                          checked={formData.permissions.can_open_register}
                          onChange={handleChange}
                        />
                        Open Register
                      </label>
                      <label className="permission-item">
                        <input
                          type="checkbox"
                          name="permissions.can_close_register"
                          checked={formData.permissions.can_close_register}
                          onChange={handleChange}
                        />
                        Close Register
                      </label>
                    </div>
                  </div>
                )}

                <div className="form-section">
                  <h4>Additional Information</h4>
                  <div className="form-row">
                    <input
                      name="address"
                      placeholder="Address"
                      value={formData.address}
                      onChange={handleChange}
                    />
                    <input
                      name="emergency_contact"
                      placeholder="Emergency Contact"
                      value={formData.emergency_contact}
                      onChange={handleChange}
                    />
                    <input
                      name="emergency_phone"
                      placeholder="Emergency Phone"
                      value={formData.emergency_phone}
                      onChange={handleChange}
                    />
                  </div>
                  <textarea
                    name="notes"
                    placeholder="Notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows="3"
                  />
                </div>

                <div className="form-actions">
                  <button type="submit" className="submit-btn">
                    {editing ? "Update Employee" : "Add Employee"}
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseForm}
                    className="cancel-btn"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeManagement;