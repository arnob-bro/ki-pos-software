const { db } = require("../config/db");
const { v4: uuidv4 } = require("uuid");
// console.log('Loaded db:', db); // Add this

/**
 * Find user by ID
 * @param {string} id - User ID (UUID)
 * @returns {Object|null} User object or null
 */
function findUserById(id) {
	const stmt = db.prepare("SELECT * FROM users WHERE id = ?");
	return stmt.get(id);
}

/**
 * Find user by email
 * @param {string} email - User email
 * @returns {Object|null} User object or null
 */
function findUserByEmail(email) {
	const stmt = db.prepare("SELECT * FROM users WHERE email = ?");
	return stmt.get(email);
}

/**
 * Find user by name (username)
 * @param {string} name - User name
 * @returns {Object|null} User object or null
 */
function findUserByName(name) {
	const stmt = db.prepare("SELECT * FROM users WHERE name = ?");
	return stmt.get(name);
}

/**
 * Create a new user
 * @param {Object} userData - User data
 * @param {string} userData.name - User name
 * @param {string} userData.email - User email
 * @param {string} userData.password_hash - Hashed password
 * @param {number} userData.role_id - Role ID
 * @param {string} userData.status - User status
 * @returns {Object|null} Created user object or null
 */
function createUser(userData) {
	try {
		const id = uuidv4();
		const stmt = db.prepare(`
      INSERT INTO users (id, name, email, password_hash, role_id, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

		const result = stmt.run(
			id,
			userData.name,
			userData.email,
			userData.password_hash,
			userData.role_id,
			userData.status || "active",
			new Date().toISOString(),
			new Date().toISOString()
		);

		console.log(result);

		return findUserById(id);
	} catch (error) {
		console.error("Error creating user:", error);
		return null;
	}
}

/**
 * Update user
 * @param {string} id - User ID
 * @param {Object} updateData - Data to update
 * @returns {Object|null} Updated user object or null
 */
function updateUser(id, updateData) {
	try {
		const user = findUserById(id);
		if (!user) return null;

		const fields = [];
		const values = [];

		// Build dynamic update query
		Object.keys(updateData).forEach((key) => {
			if (key !== "id") {
				// Don't allow updating ID
				fields.push(`${key} = ?`);
				values.push(updateData[key]);
			}
		});

		if (fields.length === 0) return user;

		// Add updated_at timestamp
		fields.push("updated_at = ?");
		values.push(new Date().toISOString());

		// Add user ID for WHERE clause
		values.push(id);

		const stmt = db.prepare(`
      UPDATE users 
      SET ${fields.join(", ")}
      WHERE id = ?
    `);

		const result = stmt.run(...values);

		if (result.changes > 0) {
			return findUserById(id);
		}
		return null;
	} catch (error) {
		console.error("Error updating user:", error);
		return null;
	}
}

/**
 * Delete user (soft delete by setting status to 'deleted')
 * @param {string} id - User ID
 * @returns {boolean} Success status
 */
function deleteUser(id) {
	try {
		const stmt = db.prepare(
			"UPDATE users SET status = ?, updated_at = ? WHERE id = ?"
		);
		const result = stmt.run("deleted", new Date().toISOString(), id);
		return result.changes > 0;
	} catch (error) {
		console.error("Error deleting user:", error);
		return false;
	}
}

/**
 * Get all users with optional filtering
 * @param {Object} filters - Optional filters
 * @param {string} filters.status - Filter by status
 * @param {number} filters.role_id - Filter by role
 * @returns {Array} Array of users
 */
function getAllUsers(filters = {}) {
	try {
		let query = "SELECT * FROM users WHERE 1=1";
		const values = [];

		if (filters.status) {
			query += " AND status = ?";
			values.push(filters.status);
		}

		if (filters.role_id) {
			query += " AND role_id = ?";
			values.push(filters.role_id);
		}

		query += " ORDER BY created_at DESC";

		const stmt = db.prepare(query);
		return stmt.all(...values);
	} catch (error) {
		console.error("Error getting users:", error);
		return [];
	}
}

/**
 * Get user with role information
 * @param {string} id - User ID
 * @returns {Object|null} User with role info or null
 */
function getUserWithRole(id) {
	try {
		const stmt = db.prepare(`
      SELECT u.*, r.name as role_name 
      FROM users u 
      LEFT JOIN roles r ON u.role_id = r.id 
      WHERE u.id = ?
    `);
		return stmt.get(id);
	} catch (error) {
		console.error("Error getting user with role:", error);
		return null;
	}
}

/**
 * Update user's last login timestamp
 * @param {string} id - User ID
 * @returns {boolean} Success status
 */
function updateLastLogin(id) {
	try {
		const stmt = db.prepare("UPDATE users SET updated_at = ? WHERE id = ?");
		const result = stmt.run(new Date().toISOString(), id);
		return result.changes > 0;
	} catch (error) {
		console.error("Error updating last login:", error);
		return false;
	}
}

/**
 * Get user permissions as an array of boolean values
 * @param {string} userId - User ID
 * @returns {Array} Array of boolean permission values
 */
function getUserPermissions(userId) {
	try {
		// Get all permissions first
		const allPermissionsStmt = db.prepare(
			"SELECT id, code FROM permissions ORDER BY id"
		);
		const allPermissions = allPermissionsStmt.all();

		// Get user's role
		const userStmt = db.prepare("SELECT role_id FROM users WHERE id = ?");
		const user = userStmt.get(userId);

		if (!user) {
			return new Array(allPermissions.length).fill(false);
		}

		// Get user's role permissions
		const userPermissionsStmt = db.prepare(`
      SELECT p.id, p.code 
      FROM permissions p 
      JOIN role_permissions rp ON p.id = rp.permission_id 
      WHERE rp.role_id = ?
    `);
		const userPermissions = userPermissionsStmt.all(user.role_id);

		// Create a map of user's permissions
		const userPermissionMap = {};
		userPermissions.forEach((perm) => {
			userPermissionMap[perm.id] = true;
		});

		// Check for ALL permission (admin override)
		const hasAllPermission = userPermissions.some(
			(perm) => perm.code === "ALL"
		);

		// Build boolean array
		const permissionsArray = allPermissions.map((perm) => {
			return hasAllPermission || userPermissionMap[perm.id] || false;
		});

		return permissionsArray;
	} catch (error) {
		console.error("Error getting user permissions:", error);
		return [];
	}
}

/**
 * Get user permissions with permission codes
 * @param {string} userId - User ID
 * @returns {Object} Object with permissions array and permission codes
 */
function getUserPermissionsWithCodes(userId) {
	try {
		// Get all permissions first
		const allPermissionsStmt = db.prepare(
			"SELECT id, code FROM permissions ORDER BY id"
		);
		const allPermissions = allPermissionsStmt.all();

		// Get user's role
		const userStmt = db.prepare("SELECT role_id FROM users WHERE id = ?");
		const user = userStmt.get(userId);

		if (!user) {
			return {
				permissions: new Array(allPermissions.length).fill(false),
				permissionCodes: allPermissions.map((p) => p.code),
			};
		}

		// Get user's role permissions
		const userPermissionsStmt = db.prepare(`
      SELECT p.id, p.code 
      FROM permissions p 
      JOIN role_permissions rp ON p.id = rp.permission_id 
      WHERE rp.role_id = ?
    `);
		const userPermissions = userPermissionsStmt.all(user.role_id);

		// Create a map of user's permissions
		const userPermissionMap = {};
		userPermissions.forEach((perm) => {
			userPermissionMap[perm.id] = true;
		});

		// Check for ALL permission (admin override)
		const hasAllPermission = userPermissions.some(
			(perm) => perm.code === "ALL"
		);

		// Build boolean array
		const permissionsArray = allPermissions.map((perm) => {
			return hasAllPermission || userPermissionMap[perm.id] || false;
		});

		return {
			permissions: permissionsArray,
			permissionCodes: allPermissions.map((p) => p.code),
		};
	} catch (error) {
		console.error("Error getting user permissions with codes:", error);
		return {
			permissions: [],
			permissionCodes: [],
		};
	}
}

module.exports = {
	findUserById,
	findUserByEmail,
	findUserByName,
	createUser,
	updateUser,
	deleteUser,
	getAllUsers,
	getUserWithRole,
	updateLastLogin,
	getUserPermissions,
	getUserPermissionsWithCodes,
};
