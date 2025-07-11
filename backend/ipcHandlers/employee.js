const EmployeeService = require('../services/employeeService');
const EmployeeController = require('../controllers/employeeController');

module.exports = function registerEmployeeHandlers(ipcMain, db) {
  const employeeService = new EmployeeService(db);
  const employeeController = new EmployeeController(employeeService);

  // List employees with filters
  ipcMain.handle('employees:list', async (event, page = 1, limit = 20, filters = {}) => {
    try {
      return await employeeController.listEmployees(page, limit, filters);
    } catch (error) {
      console.error('Error listing employees:', error.message);
      throw error;
    }
  });

  // Get employee by ID
  ipcMain.handle('employees:get', async (event, id) => {
    try {
      return await employeeController.getEmployeeById(id);
    } catch (error) {
      console.error('Error getting employee:', error.message);
      throw error;
    }
  });

  // Add new employee
  ipcMain.handle('employees:add', async (event, employeeData) => {
    try {
      return await employeeController.addEmployee(employeeData);
    } catch (error) {
      console.error('Error adding employee:', error.message);
      throw error;
    }
  });

  // Update employee
  ipcMain.handle('employees:update', async (event, id, employeeData) => {
    try {
      return await employeeController.updateEmployee(id, employeeData);
    } catch (error) {
      console.error('Error updating employee:', error.message);
      throw error;
    }
  });

  // Delete employee
  ipcMain.handle('employees:delete', async (event, id) => {
    try {
      return await employeeController.deleteEmployee(id);
    } catch (error) {
      console.error('Error deleting employee:', error.message);
      throw error;
    }
  });

  // Update employee status
  ipcMain.handle('employees:updateStatus', async (event, id, status) => {
    try {
      return await employeeController.updateEmployeeStatus(id, status);
    } catch (error) {
      console.error('Error updating employee status:', error.message);
      throw error;
    }
  });

  // List roles
  ipcMain.handle('employees:listRoles', async (event) => {
    try {
      return await employeeController.listRoles();
    } catch (error) {
      console.error('Error listing roles:', error.message);
      throw error;
    }
  });

  // Get employee statistics
  ipcMain.handle('employees:getStats', async (event) => {
    try {
      return await employeeController.getEmployeeStats();
    } catch (error) {
      console.error('Error getting employee stats:', error.message);
      throw error;
    }
  });

  // List all permissions
  ipcMain.handle('employees:listPermissions', async (event) => {
    try {
      return await employeeController.listPermissions();
    } catch (error) {
      console.error('Error listing permissions:', error.message);
      throw error;
    }
  });

  // Get employee permissions
  ipcMain.handle('employees:getEmployeePermissions', async (event, employeeId) => {
    try {
      return await employeeController.getEmployeePermissions(employeeId);
    } catch (error) {
      console.error('Error getting employee permissions:', error.message);
      throw error;
    }
  });

  // Update employee permissions
  ipcMain.handle('employees:updateEmployeePermissions', async (event, employeeId, permissionCodes) => {
    try {
      return await employeeController.updateEmployeePermissions(employeeId, permissionCodes);
    } catch (error) {
      console.error('Error updating employee permissions:', error.message);
      throw error;
    }
  });

  // Role management
  ipcMain.handle('roles:add', async (event, roleData) => {
    try {
      return await employeeController.addRole(roleData);
    } catch (error) {
      console.error('Error adding role:', error.message);
      throw error;
    }
  });

  ipcMain.handle('roles:get', async (event, id) => {
    try {
      return await employeeController.getRoleById(id);
    } catch (error) {
      console.error('Error getting role:', error.message);
      throw error;
    }
  });

  ipcMain.handle('roles:update', async (event, id, roleData) => {
    try {
      return await employeeController.updateRole(id, roleData);
    } catch (error) {
      console.error('Error updating role:', error.message);
      throw error;
    }
  });

  ipcMain.handle('roles:delete', async (event, id) => {
    try {
      return await employeeController.deleteRole(id);
    } catch (error) {
      console.error('Error deleting role:', error.message);
      throw error;
    }
  });

  ipcMain.handle('roles:getUsage', async (event, id) => {
    try {
      return await employeeController.getRoleUsage(id);
    } catch (error) {
      console.error('Error getting role usage:', error.message);
      throw error;
    }
  });
};
