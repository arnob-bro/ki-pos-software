const Database = require('better-sqlite3');
const path = require('path');
const EmployeeService = require('../services/employeeService');

async function testEmployeeIntegration() {
  console.log('Testing Employee Management Integration...');
  
  const dbPath = path.join(__dirname, 'pos.db');
  console.log('Database path:', dbPath);
  
  const db = new Database(dbPath);
  const employeeService = new EmployeeService(db);
  
  try {
    // Test 1: List employees
    console.log('\n1. Testing listEmployees...');
    const employees = await employeeService.listEmployees(1, 10);
    console.log('Employees found:', employees.employees.length);
    console.log('Pagination:', employees.pagination);
    
    // Test 2: List roles
    console.log('\n2. Testing listRoles...');
    const roles = await employeeService.listRoles();
    console.log('Roles found:', roles.length);
    console.log('Roles:', roles.map(r => r.name));
    
    // Test 3: List permissions
    console.log('\n3. Testing listPermissions...');
    const permissions = await employeeService.listPermissions();
    console.log('Permissions found:', permissions.length);
    console.log('Permissions:', permissions.map(p => p.code));
    
    // Test 4: Add new employee
    console.log('\n4. Testing addEmployee...');
    const newEmployee = {
      first_name: 'Test',
      last_name: 'User',
      email: 'test.user@example.com',
      role: 'cashier',
      status: 'active',
      custom_permissions: ['pos:view', 'receiptarchive:view']
    };
    
    const addedEmployee = await employeeService.addEmployee(newEmployee);
    console.log('Employee added:', addedEmployee.name, addedEmployee.email);
    
    // Test 5: Get employee by ID
    console.log('\n5. Testing getEmployeeById...');
    const employee = await employeeService.getEmployeeById(addedEmployee.id);
    console.log('Employee retrieved:', employee.name, employee.role_name);
    console.log('Employee permissions:', employee.permissions.length);
    
    // Test 6: Update employee
    console.log('\n6. Testing updateEmployee...');
    const updateData = {
      first_name: 'Updated',
      last_name: 'User',
      email: 'updated.user@example.com',
      role: 'manager',
      status: 'active',
      custom_permissions: ['pos:view', 'dashboard:view', 'report:view']
    };
    
    const updatedEmployee = await employeeService.updateEmployee(addedEmployee.id, updateData);
    console.log('Employee updated:', updatedEmployee.name, updatedEmployee.role_name);
    
    // Test 7: Get employee stats
    console.log('\n7. Testing getEmployeeStats...');
    const stats = await employeeService.getEmployeeStats();
    console.log('Employee stats:', stats);
    
    // Test 8: Update employee status
    console.log('\n8. Testing updateEmployeeStatus...');
    const statusUpdated = await employeeService.updateEmployeeStatus(addedEmployee.id, 'suspended');
    console.log('Status updated:', statusUpdated.status);
    
    // Test 9: Get employee permissions
    console.log('\n9. Testing getEmployeePermissions...');
    const employeePermissions = await employeeService.getEmployeePermissions(addedEmployee.id);
    console.log('Employee permissions:', employeePermissions.map(p => p.code));
    
    // Test 10: Delete employee
    console.log('\n10. Testing deleteEmployee...');
    const deleteResult = await employeeService.deleteEmployee(addedEmployee.id);
    console.log('Delete result:', deleteResult);
    
    console.log('\n✅ All employee management tests passed!');
    
  } catch (error) {
    console.error('❌ Employee management test failed:', error.message);
    console.error('Error stack:', error.stack);
  } finally {
    db.close();
  }
}

testEmployeeIntegration(); 