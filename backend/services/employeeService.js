const { v4: uuidv4 } = require("uuid");
const AuditLogService = require("./auditLogService");

class EmployeeService {
	constructor(db) {
		this.db = db;
		this.auditLogService = new AuditLogService(db);
	}

	// List all employees (users) with pagination
	async listEmployees(page = 1, limit = 20, filters = {}) {
		const offset = (page - 1) * limit;

		let query = `
      SELECT 
        u.*,
        r.name as role_name,
        s.start_time as shift_start_time,
        s.end_time as shift_end_time
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      LEFT JOIN shift_assignments sa ON u.id = sa.user_id
      LEFT JOIN shifts s ON sa.shift_id = s.id
      WHERE 1=1
    `;

		const params = [];

		// Apply filters
		if (filters.status && filters.status !== "all") {
			query += ` AND u.status = ?`;
			params.push(filters.status);
		}

		if (filters.role && filters.role !== "all") {
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
			const permissions = this.db
				.prepare(
					`
        SELECT p.code, p.description
        FROM permissions p
        JOIN role_permissions rp ON p.id = rp.permission_id
        WHERE rp.role_id = ?
      `
				)
				.all(employee.role_id);

			employee.permissions = permissions;
		}

		// Get total count for pagination
		// Build count query by reconstructing the base query without ORDER BY, LIMIT, OFFSET
		let countQuery = `
      SELECT COUNT(*) as total
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      LEFT JOIN shift_assignments sa ON u.id = sa.user_id
      LEFT JOIN shifts s ON sa.shift_id = s.id
      WHERE 1=1
    `;

		const countParams = [];

		// Apply the same filters to count query
		if (filters.status && filters.status !== "all") {
			countQuery += ` AND u.status = ?`;
			countParams.push(filters.status);
		}

		if (filters.role && filters.role !== "all") {
			countQuery += ` AND r.name = ?`;
			countParams.push(filters.role);
		}

		if (filters.search) {
			countQuery += ` AND (
        u.name LIKE ? OR 
        u.email LIKE ?
      )`;
			const searchTerm = `%${filters.search}%`;
			countParams.push(searchTerm, searchTerm);
		}

		const countStmt = this.db.prepare(countQuery);
		const countResult = countStmt.get(...countParams);
		const total = countResult ? countResult.total : 0;

		return {
			employees,
			pagination: {
				page,
				limit,
				total,
				totalPages: Math.ceil(total / limit),
			},
		};
	}

	// Get employee by ID
	async getEmployeeById(id) {
		const employee = this.db
			.prepare(
				`
      SELECT 
        u.*,
        r.name as role_name
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      WHERE u.id = ?
    `
			)
			.get(id);

		if (!employee) {
			throw new Error("Employee not found");
		}

		// Get employee permissions
		const permissions = this.db
			.prepare(
				`
      SELECT p.code, p.description
      FROM permissions p
      JOIN role_permissions rp ON p.id = rp.permission_id
      WHERE rp.role_id = ?
    `
			)
			.all(employee.role_id);

		employee.permissions = permissions;

		return employee;
	}

	// Add new employee (user)
	async addEmployee(employeeData, currentUser) {
		const id = uuidv4();

		// Get role ID based on role name
		const role = this.db
			.prepare("SELECT id FROM roles WHERE name = ?")
			.get(employeeData.role);
		if (!role) {
			throw new Error("Invalid role");
		}

		const stmt = this.db.prepare(`
      INSERT INTO users (
        id, name, email, password_hash, role_id, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `);

		// Hash password if provided, otherwise use a default
		const bcrypt = require("bcryptjs");
		const passwordHash =
			employeeData.password_hash || (await bcrypt.hash("123456", 10)); // Default password

		const result = stmt.run(
			id,
			`${employeeData.first_name} ${employeeData.last_name}`,
			employeeData.email,
			passwordHash,
			role.id,
			employeeData.status || "active"
		);

		if (result.changes === 0) {
			throw new Error("Failed to add employee");
		}

		// Handle custom permissions if provided
		if (
			employeeData.custom_permissions &&
			employeeData.custom_permissions.length > 0
		) {
			await this.updateEmployeePermissions(id, employeeData.custom_permissions);
		}

		const newEmployee = await this.getEmployeeById(id);
		// Audit log
		if (currentUser) {
			await this.auditLogService.log({
				user_id: currentUser.id,
				action_type: "CREATE",
				table_name: "users",
				record_id: id,
				old_data: null,
				new_data: newEmployee,
			});
		}
		return newEmployee;
	}

	// Update employee
	async updateEmployee(id, employeeData, currentUser) {
		const oldEmployee = await this.getEmployeeById(id);
		// Get role ID based on role name
		const role = this.db
			.prepare("SELECT id FROM roles WHERE name = ?")
			.get(employeeData.role);
		if (!role) {
			throw new Error("Invalid role");
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
			throw new Error("Employee not found or no changes made");
		}

		// Handle custom permissions if provided
		if (
			employeeData.custom_permissions &&
			employeeData.custom_permissions.length > 0
		) {
			await this.updateEmployeePermissions(id, employeeData.custom_permissions);
		}

		const updatedEmployee = await this.getEmployeeById(id);
		// Audit log
		if (currentUser) {
			await this.auditLogService.log({
				user_id: currentUser.id,
				action_type: "UPDATE",
				table_name: "users",
				record_id: id,
				old_data: oldEmployee,
				new_data: updatedEmployee,
			});
		}
		return updatedEmployee;
	}

	// Delete employee
	async deleteEmployee(id, currentUser) {
		const oldEmployee = await this.getEmployeeById(id);
		const stmt = this.db.prepare("DELETE FROM users WHERE id = ?");
		const result = stmt.run(id);

		if (result.changes === 0) {
			throw new Error("Employee not found");
		}

		// Audit log
		if (currentUser) {
			await this.auditLogService.log({
				user_id: currentUser.id,
				action_type: "DELETE",
				table_name: "users",
				record_id: id,
				old_data: oldEmployee,
				new_data: null,
			});
		}
		return { success: true, message: "Employee deleted successfully" };
	}

	// Update employee status
	async updateEmployeeStatus(id, status) {
		const stmt = this.db.prepare(
			"UPDATE users SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
		);
		const result = stmt.run(status, id);

		if (result.changes === 0) {
			throw new Error("Employee not found");
		}

		return this.getEmployeeById(id);
	}

	// List roles (for dropdown)
	async listRoles() {
		return this.db.prepare("SELECT * FROM roles ORDER BY name").all();
	}

	// Add new role
	async addRole(roleData, currentUser) {
		const stmt = this.db.prepare("INSERT INTO roles (name) VALUES (?)");
		const result = stmt.run(roleData.name);

		if (result.changes === 0) {
			throw new Error("Failed to add role");
		}

		const roleId = result.lastInsertRowid;

		// Add permissions to the role if provided
		if (roleData.permissions && roleData.permissions.length > 0) {
			await this.addPermissionsToRole(roleId, roleData.permissions);
		}

		const newRole = await this.getRoleById(roleId);
		if (currentUser) {
			await this.auditLogService.log({
				user_id: currentUser.id,
				action_type: "CREATE",
				table_name: "roles",
				record_id: roleId,
				old_data: null,
				new_data: newRole,
			});
		}
		return newRole;
	}

	// Get role by ID
	async getRoleById(id) {
		const role = this.db.prepare("SELECT * FROM roles WHERE id = ?").get(id);
		if (!role) {
			throw new Error("Role not found");
		}

		// Get role permissions
		const permissions = this.db
			.prepare(
				`
      SELECT p.code, p.description
      FROM permissions p
      JOIN role_permissions rp ON p.id = rp.permission_id
      WHERE rp.role_id = ?
    `
			)
			.all(role.id);

		role.permissions = permissions;
		return role;
	}

	// Update role
	async updateRole(id, roleData, currentUser) {
		const oldRole = await this.getRoleById(id);
		const stmt = this.db.prepare("UPDATE roles SET name = ? WHERE id = ?");
		const result = stmt.run(roleData.name, id);

		if (result.changes === 0) {
			throw new Error("Role not found or no changes made");
		}

		// Update permissions if provided
		if (roleData.permissions) {
			// Remove existing permissions
			this.db.prepare("DELETE FROM role_permissions WHERE role_id = ?").run(id);

			// Add new permissions
			if (roleData.permissions.length > 0) {
				await this.addPermissionsToRole(id, roleData.permissions);
			}
		}

		const updatedRole = await this.getRoleById(id);
		if (currentUser) {
			await this.auditLogService.log({
				user_id: currentUser.id,
				action_type: "UPDATE",
				table_name: "roles",
				record_id: id,
				old_data: oldRole,
				new_data: updatedRole,
			});
		}
		return updatedRole;
	}

	// Delete role
	async deleteRole(id, currentUser) {
		const oldRole = await this.getRoleById(id);
		// Check if role is being used by any users
		const usersWithRole = this.db
			.prepare("SELECT COUNT(*) as count FROM users WHERE role_id = ?")
			.get(id);
		if (usersWithRole.count > 0) {
			// Get detailed information about users with this role
			const users = this.db
				.prepare(
					`
        SELECT id, name, email, status 
        FROM users 
        WHERE role_id = ? 
        ORDER BY name
      `
				)
				.all(id);

			const userNames = users.map((u) => u.name).join(", ");
			throw new Error(
				`Cannot delete role: it is assigned to ${usersWithRole.count} employee(s): ${userNames}. Please reassign or delete these employees first.`
			);
		}

		// Remove role permissions first
		this.db.prepare("DELETE FROM role_permissions WHERE role_id = ?").run(id);

		// Delete the role
		const stmt = this.db.prepare("DELETE FROM roles WHERE id = ?");
		const result = stmt.run(id);

		if (result.changes === 0) {
			throw new Error("Role not found");
		}

		if (currentUser) {
			await this.auditLogService.log({
				user_id: currentUser.id,
				action_type: "DELETE",
				table_name: "roles",
				record_id: id,
				old_data: oldRole,
				new_data: null,
			});
		}
		return { success: true, message: "Role deleted successfully" };
	}

	// Get role usage information
	async getRoleUsage(id) {
		const role = this.db.prepare("SELECT * FROM roles WHERE id = ?").get(id);
		if (!role) {
			throw new Error("Role not found");
		}

		const users = this.db
			.prepare(
				`
      SELECT id, name, email, status 
      FROM users 
      WHERE role_id = ? 
      ORDER BY name
    `
			)
			.all(id);

		return {
			role: role,
			userCount: users.length,
			users: users,
		};
	}

	// Add permissions to role
	async addPermissionsToRole(roleId, permissionCodes) {
		// Get permission IDs for the provided codes
		const permissionIds = this.db
			.prepare(
				`
      SELECT id FROM permissions WHERE code IN (${permissionCodes
				.map(() => "?")
				.join(",")})
    `
			)
			.all(...permissionCodes)
			.map((p) => p.id);

		// Add permissions to role
		const insertStmt = this.db.prepare(
			"INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)"
		);
		for (const permissionId of permissionIds) {
			insertStmt.run(roleId, permissionId);
		}
	}

	// Get employee statistics
	async getEmployeeStats() {
		const stats = this.db
			.prepare(
				`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN status = 'suspended' THEN 1 ELSE 0 END) as inactive,
        SUM(CASE WHEN status = 'deleted' THEN 1 ELSE 0 END) as deleted
      FROM users
    `
			)
			.get();

		// Get role-based stats
		const roleStats = this.db
			.prepare(
				`
      SELECT 
        r.name,
        COUNT(u.id) as count
      FROM roles r
      LEFT JOIN users u ON r.id = u.role_id
      GROUP BY r.id, r.name
    `
			)
			.all();

		const managers = roleStats.find((r) => r.name === "manager")?.count || 0;

		return {
			...stats,
			managers,
			cashiers: roleStats.find((r) => r.name === "cashier")?.count || 0,
		};
	}

	// Get all available permissions
	async listPermissions() {
		return this.db.prepare("SELECT * FROM permissions ORDER BY code").all();
	}

	// Get permissions for a specific employee
	async getEmployeePermissions(employeeId) {
		const employee = this.db
			.prepare("SELECT role_id FROM users WHERE id = ?")
			.get(employeeId);
		if (!employee) {
			throw new Error("Employee not found");
		}

		return this.db
			.prepare(
				`
      SELECT p.code, p.description
      FROM permissions p
      JOIN role_permissions rp ON p.id = rp.permission_id
      WHERE rp.role_id = ?
    `
			)
			.all(employee.role_id);
	}

	// Update employee permissions (override role permissions)
	async updateEmployeePermissions(employeeId, permissionCodes) {
		// First, get the employee's role
		const employee = this.db
			.prepare("SELECT role_id FROM users WHERE id = ?")
			.get(employeeId);
		if (!employee) {
			throw new Error("Employee not found");
		}

		// Get permission IDs for the provided codes
		const permissionIds = this.db
			.prepare(
				`
      SELECT id FROM permissions WHERE code IN (${permissionCodes
				.map(() => "?")
				.join(",")})
    `
			)
			.all(...permissionCodes)
			.map((p) => p.id);

		// Remove existing role permissions for this employee
		this.db
			.prepare("DELETE FROM role_permissions WHERE role_id = ?")
			.run(employee.role_id);

		// Add new permissions
		const insertStmt = this.db.prepare(
			"INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)"
		);
		for (const permissionId of permissionIds) {
			insertStmt.run(employee.role_id, permissionId);
		}
	}
}

module.exports = EmployeeService;
