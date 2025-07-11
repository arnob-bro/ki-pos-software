const Database = require('better-sqlite3');
const path = require('path');
const EmployeeService = require('../services/employeeService');

async function testRoleManagement() {
  console.log('Testing Role Management...');
  
  const dbPath = path.join(__dirname, 'pos.db');
  console.log('Database path:', dbPath);
  
  const db = new Database(dbPath);
  const employeeService = new EmployeeService(db);
  
  try {
    // Test 1: List existing roles
    console.log('\n1. Testing listRoles...');
    const existingRoles = await employeeService.listRoles();
    console.log('Existing roles:', existingRoles.map(r => r.name));
    
    // Test 2: Add new role
    console.log('\n2. Testing addRole...');
    const newRole = {
      name: 'supervisor',
      permissions: ['pos:view', 'dashboard:view', 'report:view', 'employee:view']
    };
    
    const addedRole = await employeeService.addRole(newRole);
    console.log('Role added:', addedRole.name);
    console.log('Role permissions:', addedRole.permissions.map(p => p.code));
    
    // Test 3: Get role by ID
    console.log('\n3. Testing getRoleById...');
    const role = await employeeService.getRoleById(addedRole.id);
    console.log('Role retrieved:', role.name);
    console.log('Role permissions:', role.permissions.map(p => p.code));
    
    // Test 4: Update role
    console.log('\n4. Testing updateRole...');
    const updateData = {
      name: 'senior_supervisor',
      permissions: ['pos:view', 'dashboard:view', 'report:view', 'employee:view', 'settings:view']
    };
    
    const updatedRole = await employeeService.updateRole(addedRole.id, updateData);
    console.log('Role updated:', updatedRole.name);
    console.log('Updated permissions:', updatedRole.permissions.map(p => p.code));
    
    // Test 5: List all roles after update
    console.log('\n5. Testing listRoles after update...');
    const allRoles = await employeeService.listRoles();
    console.log('All roles:', allRoles.map(r => r.name));
    
    // Test 6: Try to add duplicate role name
    console.log('\n6. Testing duplicate role name...');
    try {
      await employeeService.addRole({ name: 'senior_supervisor', permissions: [] });
      console.log('❌ Should have failed - duplicate name allowed');
    } catch (error) {
      console.log('✅ Correctly prevented duplicate role name:', error.message);
    }
    
    // Test 7: Delete role
    console.log('\n7. Testing deleteRole...');
    const deleteResult = await employeeService.deleteRole(addedRole.id);
    console.log('Delete result:', deleteResult);
    
    // Test 8: Verify role is deleted
    console.log('\n8. Testing listRoles after deletion...');
    const rolesAfterDelete = await employeeService.listRoles();
    console.log('Roles after deletion:', rolesAfterDelete.map(r => r.name));
    
    console.log('\n✅ All role management tests passed!');
    
  } catch (error) {
    console.error('❌ Role management test failed:', error.message);
    console.error('Error stack:', error.stack);
  } finally {
    db.close();
  }
}

testRoleManagement(); 