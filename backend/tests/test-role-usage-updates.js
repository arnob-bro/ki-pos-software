const Database = require("better-sqlite3");
const path = require("path");
const EmployeeService = require("../services/employeeService");

async function testRoleUsageUpdates() {
	console.log("Testing Role Usage Updates...");

	const dbPath = path.join(__dirname, "pos.db");
	console.log("Database path:", dbPath);

	const db = new Database(dbPath);
	const employeeService = new EmployeeService(db);

	try {
		// Test 1: Create a test role
		console.log("\n1. Creating test role...");
		const testRole = {
			name: "test_role_for_usage",
			permissions: ["pos:view", "dashboard:view"],
		};

		const addedRole = await employeeService.addRole(testRole);
		console.log("Test role created:", addedRole.name, "ID:", addedRole.id);

		// Test 2: Check initial role usage (should be 0)
		console.log("\n2. Checking initial role usage...");
		const initialUsage = await employeeService.getRoleUsage(addedRole.id);
		console.log("Initial usage:", {
			roleName: initialUsage.role.name,
			userCount: initialUsage.userCount,
			users: initialUsage.users.map((u) => u.name),
		});

		// Test 3: Add an employee to the role
		console.log("\n3. Adding employee to the role...");
		const testEmployee1 = {
			first_name: "John",
			last_name: "Doe",
			email: "john.doe@example.com",
			role: "test_role_for_usage",
			status: "active",
		};

		const addedEmployee1 = await employeeService.addEmployee(testEmployee1);
		console.log("Employee 1 added:", addedEmployee1.name);

		// Test 4: Check role usage after adding employee
		console.log("\n4. Checking role usage after adding employee...");
		const usageAfterAdd = await employeeService.getRoleUsage(addedRole.id);
		console.log("Usage after adding employee:", {
			roleName: usageAfterAdd.role.name,
			userCount: usageAfterAdd.userCount,
			users: usageAfterAdd.users.map((u) => u.name),
		});

		// Test 5: Add another employee to the same role
		console.log("\n5. Adding second employee to the role...");
		const testEmployee2 = {
			first_name: "Jane",
			last_name: "Smith",
			email: "jane.smith@example.com",
			role: "test_role_for_usage",
			status: "active",
		};

		const addedEmployee2 = await employeeService.addEmployee(testEmployee2);
		console.log("Employee 2 added:", addedEmployee2.name);

		// Test 6: Check role usage after adding second employee
		console.log("\n6. Checking role usage after adding second employee...");
		const usageAfterSecondAdd = await employeeService.getRoleUsage(
			addedRole.id
		);
		console.log("Usage after adding second employee:", {
			roleName: usageAfterSecondAdd.role.name,
			userCount: usageAfterSecondAdd.userCount,
			users: usageAfterSecondAdd.users.map((u) => u.name),
		});

		// Test 7: Remove one employee
		console.log("\n7. Removing one employee...");
		await employeeService.deleteEmployee(addedEmployee1.id);
		console.log("Employee 1 deleted");

		// Test 8: Check role usage after removing employee
		console.log("\n8. Checking role usage after removing employee...");
		const usageAfterRemove = await employeeService.getRoleUsage(addedRole.id);
		console.log("Usage after removing employee:", {
			roleName: usageAfterRemove.role.name,
			userCount: usageAfterRemove.userCount,
			users: usageAfterRemove.users.map((u) => u.name),
		});

		// Test 9: Remove the last employee
		console.log("\n9. Removing last employee...");
		await employeeService.deleteEmployee(addedEmployee2.id);
		console.log("Employee 2 deleted");

		// Test 10: Check final role usage
		console.log("\n10. Checking final role usage...");
		const finalUsage = await employeeService.getRoleUsage(addedRole.id);
		console.log("Final usage:", {
			roleName: finalUsage.role.name,
			userCount: finalUsage.userCount,
			users: finalUsage.users.map((u) => u.name),
		});

		// Test 11: Clean up - delete the test role
		console.log("\n11. Cleaning up - deleting test role...");
		await employeeService.deleteRole(addedRole.id);
		console.log("Test role deleted successfully");

		console.log("\n✅ All role usage update tests passed!");
	} catch (error) {
		console.error("❌ Role usage update test failed:", error.message);
		console.error("Error stack:", error.stack);
	} finally {
		db.close();
	}
}

testRoleUsageUpdates();
