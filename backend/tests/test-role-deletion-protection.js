const Database = require("better-sqlite3");
const path = require("path");
const EmployeeService = require("../services/employeeService");

async function testRoleDeletionProtection() {
	console.log("Testing Role Deletion Protection...");

	const dbPath = path.join(__dirname, "pos.db");
	console.log("Database path:", dbPath);

	const db = new Database(dbPath);
	const employeeService = new EmployeeService(db);

	try {
		// Test 1: Create a test role
		console.log("\n1. Creating test role...");
		const testRole = {
			name: "test_role_for_deletion",
			permissions: ["pos:view", "dashboard:view"],
		};

		const addedRole = await employeeService.addRole(testRole);
		console.log("Test role created:", addedRole.name, "ID:", addedRole.id);

		// Test 2: Create a test employee with this role
		console.log("\n2. Creating test employee with the role...");
		const testEmployee = {
			first_name: "Test",
			last_name: "Employee",
			email: "test.employee@example.com",
			role: "test_role_for_deletion",
			status: "active",
		};

		const addedEmployee = await employeeService.addEmployee(testEmployee);
		console.log("Test employee created:", addedEmployee.name);

		// Test 3: Try to delete the role (should fail)
		console.log("\n3. Attempting to delete role with assigned employee...");
		try {
			await employeeService.deleteRole(addedRole.id);
			console.log(
				"❌ Should have failed - role deletion succeeded when it should not"
			);
		} catch (error) {
			console.log("✅ Correctly prevented role deletion:", error.message);
		}

		// Test 4: Check role usage
		console.log("\n4. Checking role usage...");
		const roleUsage = await employeeService.getRoleUsage(addedRole.id);
		console.log("Role usage:", {
			roleName: roleUsage.role.name,
			userCount: roleUsage.userCount,
			users: roleUsage.users.map((u) => u.name),
		});

		// Test 5: Delete the employee first
		console.log("\n5. Deleting the test employee...");
		await employeeService.deleteEmployee(addedEmployee.id);
		console.log("Employee deleted successfully");

		// Test 6: Now try to delete the role (should succeed)
		console.log("\n6. Attempting to delete role after employee deletion...");
		try {
			const deleteResult = await employeeService.deleteRole(addedRole.id);
			console.log("✅ Role deletion succeeded:", deleteResult.message);
		} catch (error) {
			console.log(
				"❌ Role deletion failed when it should have succeeded:",
				error.message
			);
		}

		// Test 7: Verify role is deleted
		console.log("\n7. Verifying role is deleted...");
		try {
			await employeeService.getRoleById(addedRole.id);
			console.log("❌ Role still exists when it should be deleted");
		} catch (error) {
			console.log("✅ Role successfully deleted:", error.message);
		}

		console.log("\n✅ All role deletion protection tests passed!");
	} catch (error) {
		console.error("❌ Role deletion protection test failed:", error.message);
		console.error("Error stack:", error.stack);
	} finally {
		db.close();
	}
}

testRoleDeletionProtection();
