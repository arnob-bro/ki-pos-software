const EmployeeService = require("../services/employeeService");
const EmployeeController = require("../controllers/employeeController");
const ShiftModel = require("../models/ShiftModel");

module.exports = function registerEmployeeHandlers(ipcMain, db) {
	const employeeService = new EmployeeService(db);
	const employeeController = new EmployeeController(employeeService);

	// List employees with filters
	ipcMain.handle(
		"employees:list",
		async (event, page = 1, limit = 20, filters = {}) => {
			try {
				return await employeeController.listEmployees(page, limit, filters);
			} catch (error) {
				console.error("Error listing employees:", error.message);
				throw error;
			}
		}
	);

	// Get employee by ID
	ipcMain.handle("employees:get", async (event, id) => {
		try {
			return await employeeController.getEmployeeById(id);
		} catch (error) {
			console.error("Error getting employee:", error.message);
			throw error;
		}
	});

	// Add new employee
	ipcMain.handle("employees:add", async (event, employeeData, currentUser) => {
		try {
			console.log("current user in ipc" + currentUser);
			return await employeeController.addEmployee(employeeData, currentUser);
		} catch (error) {
			console.error("Error adding employee:", error.message);
			throw error;
		}
	});

	// Update employee
	ipcMain.handle("employees:update", async (event, id, employeeData) => {
		try {
			return await employeeController.updateEmployee(id, employeeData);
		} catch (error) {
			console.error("Error updating employee:", error.message);
			throw error;
		}
	});

	// Delete employee
	ipcMain.handle("employees:delete", async (event, id) => {
		try {
			return await employeeController.deleteEmployee(id);
		} catch (error) {
			console.error("Error deleting employee:", error.message);
			throw error;
		}
	});

	// Update employee status
	ipcMain.handle("employees:updateStatus", async (event, id, status) => {
		try {
			return await employeeController.updateEmployeeStatus(id, status);
		} catch (error) {
			console.error("Error updating employee status:", error.message);
			throw error;
		}
	});

	// List roles
	ipcMain.handle("employees:listRoles", async (event) => {
		try {
			return await employeeController.listRoles();
		} catch (error) {
			console.error("Error listing roles:", error.message);
			throw error;
		}
	});

	// Get employee statistics
	ipcMain.handle("employees:getStats", async (event) => {
		try {
			return await employeeController.getEmployeeStats();
		} catch (error) {
			console.error("Error getting employee stats:", error.message);
			throw error;
		}
	});

	// List all permissions
	ipcMain.handle("employees:listPermissions", async (event) => {
		try {
			return await employeeController.listPermissions();
		} catch (error) {
			console.error("Error listing permissions:", error.message);
			throw error;
		}
	});

	// Get employee permissions
	ipcMain.handle(
		"employees:getEmployeePermissions",
		async (event, employeeId) => {
			try {
				return await employeeController.getEmployeePermissions(employeeId);
			} catch (error) {
				console.error("Error getting employee permissions:", error.message);
				throw error;
			}
		}
	);

	// Update employee permissions
	ipcMain.handle(
		"employees:updateEmployeePermissions",
		async (event, employeeId, permissionCodes) => {
			try {
				return await employeeController.updateEmployeePermissions(
					employeeId,
					permissionCodes
				);
			} catch (error) {
				console.error("Error updating employee permissions:", error.message);
				throw error;
			}
		}
	);

	// Role management
	ipcMain.handle("roles:add", async (event, roleData) => {
		try {
			return await employeeController.addRole(roleData);
		} catch (error) {
			console.error("Error adding role:", error.message);
			throw error;
		}
	});

	ipcMain.handle("roles:get", async (event, id) => {
		try {
			return await employeeController.getRoleById(id);
		} catch (error) {
			console.error("Error getting role:", error.message);
			throw error;
		}
	});

	ipcMain.handle("roles:update", async (event, id, roleData) => {
		try {
			return await employeeController.updateRole(id, roleData);
		} catch (error) {
			console.error("Error updating role:", error.message);
			throw error;
		}
	});

	ipcMain.handle("roles:delete", async (event, id) => {
		try {
			return await employeeController.deleteRole(id);
		} catch (error) {
			console.error("Error deleting role:", error.message);
			throw error;
		}
	});

	ipcMain.handle("roles:getUsage", async (event, id) => {
		try {
			return await employeeController.getRoleUsage(id);
		} catch (error) {
			console.error("Error getting role usage:", error.message);
			throw error;
		}
	});

	// --- Shift Management (Admin) ---
	ipcMain.handle("shift:list", async (event) => {
		try {
			const shifts = ShiftModel.listShifts();
			return { success: true, shifts };
		} catch (error) {
			console.error("Shift list IPC error:", error);
			return {
				success: false,
				message: "Failed to list shifts",
				error: error.message,
			};
		}
	});

	ipcMain.handle("shift:create", async (event, shiftData, currentUserId) => {
		try {
			const shift = ShiftModel.createShift(shiftData, currentUserId);
			return { success: true, shift };
		} catch (error) {
			console.error("Shift create IPC error:", error);
			return {
				success: false,
				message: "Failed to create shift",
				error: error.message,
			};
		}
	});

	ipcMain.handle(
		"shift:update",
		async (event, id, updateData, currentUserId) => {
			try {
				const shift = ShiftModel.updateShift(id, updateData, currentUserId);
				return { success: true, shift };
			} catch (error) {
				console.error("Shift update IPC error:", error);
				return {
					success: false,
					message: "Failed to update shift",
					error: error.message,
				};
			}
		}
	);

	ipcMain.handle(
		"shift:assign",
		async (event, shiftId, userId, currentUserId) => {
			try {
				const assignment = ShiftModel.assignUserToShift(
					shiftId,
					userId,
					currentUserId
				);
				return { success: true, assignment };
			} catch (error) {
				console.error("Shift assign IPC error:", error);
				return {
					success: false,
					message: "Failed to assign shift",
					error: error.message,
				};
			}
		}
	);

	ipcMain.handle(
		"shift:unassign",
		async (event, shiftId, userId, currentUserId) => {
			try {
				ShiftModel.unassignUserFromShift(shiftId, userId, currentUserId);
				return { success: true };
			} catch (error) {
				console.error("Shift unassign IPC error:", error);
				return {
					success: false,
					message: "Failed to unassign shift",
					error: error.message,
				};
			}
		}
	);

	ipcMain.handle("shift:listAssignments", async (event, filter) => {
		try {
			const assignments = ShiftModel.listAssignments(filter || {});
			return { success: true, assignments };
		} catch (error) {
			console.error("Shift listAssignments IPC error:", error);
			return {
				success: false,
				message: "Failed to list assignments",
				error: error.message,
			};
		}
	});

	ipcMain.handle("shift:getById", async (event, id) => {
		try {
			const shift = ShiftModel.getShiftById(id);
			return { success: true, shift };
		} catch (error) {
			console.error("Shift getById IPC error:", error);
			return {
				success: false,
				message: "Failed to get shift",
				error: error.message,
			};
		}
	});
};
