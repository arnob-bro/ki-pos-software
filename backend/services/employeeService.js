const { v4: uuidv4 } = require('uuid');

class EmployeeService {
  constructor(db) {
    this.db = db;
  }

  // List all employees (users) with pagination
  async listEmployees(page = 1, limit = 20, filters = {}) {
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT 
        u.*,
        r.name as role_name
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      WHERE 1=1
    `;
    
    const params = [];
    
    // Apply filters
    if (filters.status && filters.status !== 'all') {
      query += ` AND u.status = ?`;
      params.push(filters.status);
    }
    
    if (filters.role && filters.role !== 'all') {
      query += ` AND r.name = ?`;
      params.push(filters.role);
    }
    
    if (filters.search) {
      query += ` AND (
        u.name LIKE ? OR 
        u.email LIKE ?
      )`;
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm);
    }
    
    query += ` ORDER BY u.created_at DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);
    
    const stmt = this.db.prepare(query);
    const employees = stmt.all(...params);
    
    // Get permissions for each employee
    for (let employee of employees) {
      const permissions = this.db.prepare(`
        SELECT p.code, p.description
        FROM permissions p
        JOIN role_permissions rp ON p.id = rp.permission_id
        WHERE rp.role_id = ?
      `).all(employee.role_id);
      
      employee.permissions = permissions;
    }
    
    // Get total count for pagination
    const countQuery = query.replace(/SELECT.*FROM/, 'SELECT COUNT(*) as total FROM').replace(/ORDER BY.*LIMIT.*OFFSET.*/, '');
    const countStmt = this.db.prepare(countQuery);
    const { total } = countStmt.get(...params.slice(0, -2)); // Remove limit and offset
    
    return {
      employees,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  // Get employee by ID
  async getEmployeeById(id) {
    const employee = this.db.prepare(`
      SELECT 
        u.*,
        r.name as role_name
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      WHERE u.id = ?
    `).get(id);
    
    if (!employee) {
      throw new Error('Employee not found');
    }
    
    // Get employee permissions
    const permissions = this.db.prepare(`
      SELECT p.code, p.description
      FROM permissions p
      JOIN role_permissions rp ON p.id = rp.permission_id
      WHERE rp.role_id = ?
    `).all(employee.role_id);
    
    employee.permissions = permissions;
    
    return employee;
  }

  // Add new employee (user)
  async addEmployee(employeeData) {
    const id = uuidv4();
    
    // Get role ID based on role name
    const role = this.db.prepare('SELECT id FROM roles WHERE name = ?').get(employeeData.role);
    if (!role) {
      throw new Error('Invalid role');
    }
    
    const stmt = this.db.prepare(`
      INSERT INTO users (
        id, name, email, password_hash, role_id, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `);
    
    const result = stmt.run(
      id,
      `${employeeData.first_name} ${employeeData.last_name}`,
      employeeData.email,
      employeeData.password_hash || 'default_hash', // You might want to hash the PIN
      role.id,
      employeeData.status || 'active'
    );
    
    if (result.changes === 0) {
      throw new Error('Failed to add employee');
    }
    
    // Handle custom permissions if provided
    if (employeeData.custom_permissions && employeeData.custom_permissions.length > 0) {
      await this.updateEmployeePermissions(id, employeeData.custom_permissions);
    }
    
    return this.getEmployeeById(id);
  }

  // Update employee
  async updateEmployee(id, employeeData) {
    // Get role ID based on role name
    const role = this.db.prepare('SELECT id FROM roles WHERE name = ?').get(employeeData.role);
    if (!role) {
      throw new Error('Invalid role');
    }
    
    const stmt = this.db.prepare(`
      UPDATE users SET 
        name = ?, email = ?, role_id = ?, status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    
    const result = stmt.run(
      `${employeeData.first_name} ${employeeData.last_name}`,
      employeeData.email,
      role.id,
      employeeData.status,
      id
    );
    
    if (result.changes === 0) {
      throw new Error('Employee not found or no changes made');
    }
    
    // Handle custom permissions if provided
    if (employeeData.custom_permissions && employeeData.custom_permissions.length > 0) {
      await this.updateEmployeePermissions(id, employeeData.custom_permissions);
    }
    
    return this.getEmployeeById(id);
  }

  // Delete employee
  async deleteEmployee(id) {
    const stmt = this.db.prepare('DELETE FROM users WHERE id = ?');
    const result = stmt.run(id);
    
    if (result.changes === 0) {
      throw new Error('Employee not found');
    }
    
    return { success: true, message: 'Employee deleted successfully' };
  }

  // Update employee status
  async updateEmployeeStatus(id, status) {
    const stmt = this.db.prepare('UPDATE users SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
    const result = stmt.run(status, id);
    
    if (result.changes === 0) {
      throw new Error('Employee not found');
    }
    
    return this.getEmployeeById(id);
  }

  // List roles (for dropdown)
  async listRoles() {
    return this.db.prepare('SELECT * FROM roles ORDER BY name').all();
  }

  // Get employee statistics
  async getEmployeeStats() {
    const stats = this.db.prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN status = 'suspended' THEN 1 ELSE 0 END) as inactive,
        SUM(CASE WHEN status = 'deleted' THEN 1 ELSE 0 END) as deleted
      FROM users
    `).get();
    
    // Get role-based stats
    const roleStats = this.db.prepare(`
      SELECT 
        r.name,
        COUNT(u.id) as count
      FROM roles r
      LEFT JOIN users u ON r.id = u.role_id
      GROUP BY r.id, r.name
    `).all();
    
    const managers = roleStats.find(r => r.name === 'manager')?.count || 0;
    
    return {
      ...stats,
      managers,
      cashiers: roleStats.find(r => r.name === 'cashier')?.count || 0
    };
  }

  // Get all available permissions
  async listPermissions() {
    return this.db.prepare('SELECT * FROM permissions ORDER BY code').all();
  }

  // Get permissions for a specific employee
  async getEmployeePermissions(employeeId) {
    const employee = this.db.prepare('SELECT role_id FROM users WHERE id = ?').get(employeeId);
    if (!employee) {
      throw new Error('Employee not found');
    }

    return this.db.prepare(`
      SELECT p.code, p.description
      FROM permissions p
      JOIN role_permissions rp ON p.id = rp.permission_id
      WHERE rp.role_id = ?
    `).all(employee.role_id);
  }

  // Update employee permissions (override role permissions)
  async updateEmployeePermissions(employeeId, permissionCodes) {
    // First, get the employee's role
    const employee = this.db.prepare('SELECT role_id FROM users WHERE id = ?').get(employeeId);
    if (!employee) {
      throw new Error('Employee not found');
    }

    // Get permission IDs for the provided codes
    const permissionIds = this.db.prepare(`
      SELECT id FROM permissions WHERE code IN (${permissionCodes.map(() => '?').join(',')})
    `).all(...permissionCodes).map(p => p.id);

    // Remove existing role permissions for this employee
    this.db.prepare('DELETE FROM role_permissions WHERE role_id = ?').run(employee.role_id);

    // Add new permissions
    const insertStmt = this.db.prepare('INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)');
    for (const permissionId of permissionIds) {
      insertStmt.run(employee.role_id, permissionId);
    }
  }
}

module.exports = EmployeeService;
