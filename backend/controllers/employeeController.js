class EmployeeController {
  constructor(employeeService) {
    this.employeeService = employeeService;
  }

  async listEmployees(page = 1, limit = 20, filters = {}) {
    try {
      return await this.employeeService.listEmployees(page, limit, filters);
    } catch (error) {
      throw new Error(`Failed to list employees: ${error.message}`);
    }
  }

  async getEmployeeById(id) {
    try {
      return await this.employeeService.getEmployeeById(id);
    } catch (error) {
      throw new Error(`Failed to get employee: ${error.message}`);
    }
  }

  async addEmployee(employeeData) {
    try {
      // Validate required fields
      if (!employeeData.first_name || !employeeData.last_name || !employeeData.email) {
        throw new Error('First name, last name, and email are required');
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(employeeData.email)) {
        throw new Error('Invalid email format');
      }

      // Set default values
      const employee = {
        ...employeeData,
        status: employeeData.status || 'active',
        role: employeeData.role || 'cashier'
      };

      return await this.employeeService.addEmployee(employee);
    } catch (error) {
      throw new Error(`Failed to add employee: ${error.message}`);
    }
  }

  async updateEmployee(id, employeeData) {
    try {
      // Validate required fields
      if (!employeeData.first_name || !employeeData.last_name || !employeeData.email) {
        throw new Error('First name, last name, and email are required');
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(employeeData.email)) {
        throw new Error('Invalid email format');
      }

      return await this.employeeService.updateEmployee(id, employeeData);
    } catch (error) {
      throw new Error(`Failed to update employee: ${error.message}`);
    }
  }

  async deleteEmployee(id) {
    try {
      return await this.employeeService.deleteEmployee(id);
    } catch (error) {
      throw new Error(`Failed to delete employee: ${error.message}`);
    }
  }

  async updateEmployeeStatus(id, status) {
    try {
      const validStatuses = ['active', 'suspended', 'deleted'];
      if (!validStatuses.includes(status)) {
        throw new Error('Invalid status. Must be active, suspended, or deleted');
      }

      return await this.employeeService.updateEmployeeStatus(id, status);
    } catch (error) {
      throw new Error(`Failed to update employee status: ${error.message}`);
    }
  }

  async listRoles() {
    try {
      return await this.employeeService.listRoles();
    } catch (error) {
      throw new Error(`Failed to list roles: ${error.message}`);
    }
  }

  async getEmployeeStats() {
    try {
      return await this.employeeService.getEmployeeStats();
    } catch (error) {
      throw new Error(`Failed to get employee statistics: ${error.message}`);
    }
  }

  async listPermissions() {
    try {
      return await this.employeeService.listPermissions();
    } catch (error) {
      throw new Error(`Failed to list permissions: ${error.message}`);
    }
  }

  async getEmployeePermissions(employeeId) {
    try {
      return await this.employeeService.getEmployeePermissions(employeeId);
    } catch (error) {
      throw new Error(`Failed to get employee permissions: ${error.message}`);
    }
  }

  async updateEmployeePermissions(employeeId, permissionCodes) {
    try {
      return await this.employeeService.updateEmployeePermissions(employeeId, permissionCodes);
    } catch (error) {
      throw new Error(`Failed to update employee permissions: ${error.message}`);
    }
  }
}

module.exports = EmployeeController;
