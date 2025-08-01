import { useEffect, useState } from "react"
import "./EmployeeManagement.css"
import Sidebar from "../../components/Sidebar"
import useLanguageStore from "../../stores/languageStore"
import { PERMISSION_CODES } from "../../utils/permissions"
import useUserStore from "../../stores/userStore"

const EmployeeManagement = () => {
    const language = useLanguageStore((state) => state.language)
    const t = (en, de) => (language === "de" ? de : en)
    const [employees, setEmployees] = useState([])
    const [roles, setRoles] = useState([])
    const [permissions, setPermissions] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [formData, setFormData] = useState({
        id: "",
        first_name: "",
        last_name: "",
        email: "",
        role: "",
        status: "active",
        custom_permissions: [],
    })
    const [editing, setEditing] = useState(false)
    const [showForm, setShowForm] = useState(false)
    const [showRoleForm, setShowRoleForm] = useState(false)
    const [filterStatus, setFilterStatus] = useState("all")
    const [filterRole, setFilterRole] = useState("all")
    const [searchTerm, setSearchTerm] = useState("")
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
    })
    const [roleFormData, setRoleFormData] = useState({
        id: "",
        name: "",
        permissions: [],
    })
    const [editingRole, setEditingRole] = useState(false)
    const { hasPermissionByCode } = useUserStore()
    const isAdmin = hasPermissionByCode(PERMISSION_CODES.ALL)
    const currentUser = useUserStore((state) => state.user)

    // --- Shift Management State ---
    const [shifts, setShifts] = useState([])
    const [shiftModalOpen, setShiftModalOpen] = useState(false)
    const [editingShift, setEditingShift] = useState(null)
    const [shiftForm, setShiftForm] = useState({ startTime: "", endTime: "" })
    const [shiftLoading, setShiftLoading] = useState(false)
    const [shiftError, setShiftError] = useState(null)

    // --- Employee Shift Assignment Modal State ---
    const [shiftAssignModalOpen, setShiftAssignModalOpen] = useState(false)
    const [shiftAssignEmployee, setShiftAssignEmployee] = useState(null)
    const [employeeAssignments, setEmployeeAssignments] = useState([])
    const [shiftAssignLoading, setShiftAssignLoading] = useState(false)

    // --- Shift assignment for employee form ---
    const [formShiftAssignments, setFormShiftAssignments] = useState([])
    const [formShiftsLoading, setFormShiftsLoading] = useState(false)

    useEffect(() => {
        fetchEmployees()
        fetchRoles()
        fetchPermissions()
    }, [pagination.page, filterStatus, filterRole, searchTerm])

    useEffect(() => {
        if (isAdmin) fetchShifts()
    }, [isAdmin])

    const fetchEmployees = async () => {
        try {
            setLoading(true)
            const filters = {}
            if (filterStatus !== "all") filters.status = filterStatus
            if (filterRole !== "all") filters.role = filterRole
            if (searchTerm) filters.search = searchTerm

            const result = await window.posAPI.listEmployees(
                pagination.page,
                pagination.limit,
                filters
            )
            setEmployees(result.employees)
            setPagination((prev) => ({
                ...prev,
                total: result.pagination.total,
                totalPages: result.pagination.totalPages,
            }))
        } catch (error) {
            console.error("Error fetching employees:", error)
            setError("Failed to fetch employees")
        } finally {
            setLoading(false)
        }
    }

    const fetchRoles = async () => {
        try {
            const rolesData = await window.posAPI.listRoles()
            // Load permissions and usage for each role
            const rolesWithData = await Promise.all(
                rolesData.map(async (role) => {
                    try {
                        const [roleDetails, roleUsage] = await Promise.all([
                            window.posAPI.getRole(role.id),
                            window.posAPI.getRoleUsage(role.id),
                        ])

                        return {
                            ...role,
                            permissions: roleDetails.permissions || [],
                            userCount: roleUsage.userCount,
                        }
                    } catch (error) {
                        console.error(
                            `Error loading data for role ${role.id}:`,
                            error
                        )
                        return {
                            ...role,
                            permissions: [],
                            userCount: 0,
                        }
                    }
                })
            )
            setRoles(rolesWithData)
        } catch (error) {
            console.error("Error fetching roles:", error)
        }
    }

    // Function to refresh role usage data specifically
    const refreshRoleUsage = async () => {
        try {
            const updatedRoles = await Promise.all(
                roles.map(async (role) => {
                    try {
                        const roleUsage = await window.posAPI.getRoleUsage(
                            role.id
                        )
                        return {
                            ...role,
                            userCount: roleUsage.userCount,
                        }
                    } catch (error) {
                        console.error(
                            `Error refreshing usage for role ${role.id}:`,
                            error
                        )
                        return role
                    }
                })
            )
            setRoles(updatedRoles)
        } catch (error) {
            console.error("Error refreshing role usage:", error)
        }
    }

    const fetchPermissions = async () => {
        try {
            const permissionsData = await window.posAPI.listPermissions()
            setPermissions(permissionsData)
        } catch (error) {
            console.error("Error fetching permissions:", error)
        }
    }

    const fetchShifts = async () => {
        try {
            setShiftLoading(true)
            const res = await window.posAPI.listShifts()
            if (res.success) setShifts(res.shifts)
            else setShifts([])
        } catch (e) {
            setShiftError("Failed to load shifts")
            setShifts([])
        } finally {
            setShiftLoading(false)
        }
    }

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target

        if (name.startsWith("permissions.")) {
            const permissionCode = name.split(".")[1]
            setFormData((prev) => ({
                ...prev,
                custom_permissions: checked
                    ? [...prev.custom_permissions, permissionCode]
                    : prev.custom_permissions.filter(
                          (p) => p !== permissionCode
                      ),
            }))
        } else {
            setFormData({
                ...formData,
                [name]: type === "checkbox" ? checked : value,
            })
        }
    }

    // Fetch shifts and assignments when opening the form
    const fetchFormShiftsAndAssignments = async (employeeId) => {
        setFormShiftsLoading(true)
        try {
            const [shiftsRes, assignmentsRes] = await Promise.all([
                window.posAPI.listShifts(),
                employeeId
                    ? window.posAPI.listShiftAssignments({ userId: employeeId })
                    : Promise.resolve({ success: true, assignments: [] }),
            ])
            if (shiftsRes.success) setShifts(shiftsRes.shifts)
            if (assignmentsRes.success)
                setFormShiftAssignments(
                    assignmentsRes.assignments.map((a) => a.shift_id)
                )
            else setFormShiftAssignments([])
        } finally {
            setFormShiftsLoading(false)
        }
    }

    // When opening the form for edit/add
    const handleEdit = async (employee) => {
        try {
            // Fetch employee permissions
            const employeePermissions =
                await window.posAPI.getEmployeePermissions(employee.id)
            await fetchFormShiftsAndAssignments(employee.id)

            setFormData({
                id: employee.id,
                first_name: employee.name.split(" ")[0] || "",
                last_name: employee.name.split(" ").slice(1).join(" ") || "",
                email: employee.email,
                role: employee.role_name,
                status: employee.status,
                custom_permissions: employeePermissions.map((p) => p.code),
            })
            setEditing(true)
            setShowForm(true)
        } catch (error) {
            console.error("Error fetching employee details:", error)
            setError("Failed to load employee details")
        }
    }

    const handleAddNew = async () => {
        resetForm()
        await fetchFormShiftsAndAssignments(null)
        setShowForm(true)
    }

    const handleCloseForm = () => {
        setShowForm(false)
        resetForm()
    }

    const resetForm = () => {
        setFormData({
            id: "",
            first_name: "",
            last_name: "",
            email: "",
            role: "",
            status: "active",
            custom_permissions: [],
        })
        setFormShiftAssignments([])
        setEditing(false)
        setError(null)
    }

    const handlePageChange = (newPage) => {
        setPagination((prev) => ({ ...prev, page: newPage }))
    }

    // Role management functions
    const handleRoleChange = (e) => {
        const { name, value, type, checked } = e.target

        if (name.startsWith("rolePermissions.")) {
            const permissionCode = name.split(".")[1]
            setRoleFormData((prev) => ({
                ...prev,
                permissions: checked
                    ? [...prev.permissions, permissionCode]
                    : prev.permissions.filter((p) => p !== permissionCode),
            }))
        } else {
            setRoleFormData({
                ...roleFormData,
                [name]: type === "checkbox" ? checked : value,
            })
        }
    }

    const handleRoleSubmit = async (e) => {
        e.preventDefault()
        try {
            if (editingRole) {
                await window.posAPI.updateRole(roleFormData.id, roleFormData)
            } else {
                await window.posAPI.addRole(roleFormData)
            }

            // Refresh roles to update usage information
            await fetchRoles()
            resetRoleForm()
            setShowRoleForm(false)
        } catch (error) {
            console.error("Error saving role:", error)
            setError("Failed to save role")
        }
    }

    const resetRoleForm = () => {
        setRoleFormData({
            id: "",
            name: "",
            permissions: [],
        })
        setEditingRole(false)
        setError(null)
    }

    const handleEditRole = async (role) => {
        try {
            const roleDetails = await window.posAPI.getRole(role.id)
            setRoleFormData({
                id: role.id,
                name: role.name,
                permissions: roleDetails.permissions.map((p) => p.code),
            })
            setEditingRole(true)
            setShowRoleForm(true)
        } catch (error) {
            console.error("Error fetching role details:", error)
            setError("Failed to load role details")
        }
    }

    const handleDeleteRole = async (id) => {
        try {
            // First check if role is being used
            const roleUsage = await window.posAPI.getRoleUsage(id)

            if (roleUsage.userCount > 0) {
                const userList = roleUsage.users.map((u) => u.name).join(", ")
                const message = `Cannot delete role "${roleUsage.role.name}" because it is assigned to ${roleUsage.userCount} employee(s):\n\n${userList}\n\nPlease reassign or delete these employees first.`
                alert(message)
                return
            }

            // If no users, proceed with deletion
            if (
                window.confirm(
                    `Are you sure you want to delete the role "${roleUsage.role.name}"?`
                )
            ) {
                await window.posAPI.deleteRole(id)
                // Refresh roles to update usage information
                await fetchRoles()
            }
        } catch (error) {
            console.error("Error deleting role:", error)
            setError(error.message || "Failed to delete role")
        }
    }

    const handleAddNewRole = () => {
        resetRoleForm()
        setShowRoleForm(true)
    }

    const handleCloseRoleForm = () => {
        setShowRoleForm(false)
        resetRoleForm()
    }

    const openShiftModal = (shift = null) => {
        setEditingShift(shift)
        setShiftForm(
            shift
                ? {
                      startTime: shift.start_time
                          ? shift.start_time.slice(0, 16)
                          : "",
                      endTime: shift.end_time
                          ? shift.end_time.slice(0, 16)
                          : "",
                  }
                : { startTime: "", endTime: "" }
        )
        setShiftModalOpen(true)
    }
    const closeShiftModal = () => {
        setShiftModalOpen(false)
        setEditingShift(null)
        setShiftForm({ startTime: "", endTime: "" })
        setShiftError(null)
    }

    const handleShiftFormChange = (e) => {
        const { name, value } = e.target
        setShiftForm((f) => ({ ...f, [name]: value }))
    }

    const handleShiftSubmit = async (e) => {
        e.preventDefault()
        setShiftLoading(true)
        setShiftError(null)
        try {
            if (editingShift) {
                const res = await window.posAPI.updateShift(
                    editingShift.id,
                    {
                        startTime: shiftForm.startTime,
                        endTime: shiftForm.endTime || null,
                    },
                    currentUser
                )
                if (!res.success) throw new Error(res.message)
            } else {
                const res = await window.posAPI.createShift(
                    {
                        startTime: shiftForm.startTime,
                        endTime: shiftForm.endTime || null,
                    },
                    currentUser
                )
                if (!res.success) throw new Error(res.message)
            }
            await fetchShifts()
            closeShiftModal()
        } catch (e) {
            setShiftError(e.message || "Failed to save shift")
        } finally {
            setShiftLoading(false)
        }
    }

    // Get unique roles from backend data
    const getUniqueRoles = () => {
        return roles.map((role) => role.name)
    }

    const filteredEmployees = employees // Backend handles filtering

    const getRoleDisplayName = (roleName) => {
        return roleName
            ? roleName.charAt(0).toUpperCase() + roleName.slice(1)
            : "N/A"
    }

    const closeShiftAssignModal = () => {
        setShiftAssignModalOpen(false)
        setShiftAssignEmployee(null)
        setEmployeeAssignments([])
    }

    const isShiftAssigned = (shiftId) =>
        employeeAssignments.some((a) => a.shift_id === shiftId)
    const handleAssignShiftToEmployee = async (shiftId) => {
        setShiftAssignLoading(true)
        try {
            await window.posAPI.assignShift(
                shiftId,
                shiftAssignEmployee.id,
                currentUser
            )
            const res = await window.posAPI.listShiftAssignments({
                userId: shiftAssignEmployee.id,
            })
            setEmployeeAssignments(res.success ? res.assignments : [])
        } finally {
            setShiftAssignLoading(false)
        }
    }
    const handleUnassignShiftFromEmployee = async (shiftId) => {
        setShiftAssignLoading(true)
        try {
            await window.posAPI.unassignShift(
                shiftId,
                shiftAssignEmployee.id,
                currentUser
            )
            const res = await window.posAPI.listShiftAssignments({
                userId: shiftAssignEmployee.id,
            })
            setEmployeeAssignments(res.success ? res.assignments : [])
        } finally {
            setShiftAssignLoading(false)
        }
    }

    // On submit, update assignments after add/update
    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            let employeeId
            if (editing) {
                await window.posAPI.updateEmployee(formData.id, formData)
                employeeId = formData.id
            } else {
                const res = await window.posAPI.addEmployee(
                    formData,
                    currentUser
                )
                employeeId = res && res.user && res.user.id
            }
            // Update shift assignment
            if (employeeId) {
                const currentAssignmentsRes =
                    await window.posAPI.listShiftAssignments({
                        userId: employeeId,
                    })
                const currentAssigned = currentAssignmentsRes.success
                    ? currentAssignmentsRes.assignments.map((a) => a.shift_id)
                    : []
                const selectedShift = formShiftAssignments[0]
                // Assign new if selected and not already assigned
                if (selectedShift && !currentAssigned.includes(selectedShift)) {
                    await window.posAPI.assignShift(
                        selectedShift,
                        employeeId,
                        currentUser
                    )
                }
                // Unassign all others
                for (const shiftId of currentAssigned) {
                    if (shiftId !== selectedShift) {
                        await window.posAPI.unassignShift(
                            shiftId,
                            employeeId,
                            currentUser
                        )
                    }
                }
            }
            await Promise.all([fetchEmployees(), fetchRoles()])
            resetForm()
            setShowForm(false)
        } catch (error) {
            console.error("Error saving employee:", error)
            setError("Failed to save employee")
        }
    }

    const handleStatusChange = async (id, newStatus) => {
        try {
            await window.posAPI.updateEmployeeStatus(id, newStatus)
            await Promise.all([fetchEmployees(), fetchRoles()])
        } catch (error) {
            setError("Failed to update employee status")
        }
    }

    if (loading && employees.length === 0) {
        return (
            <div className="employee-management-page">
                <Sidebar />
                <div className="employee-management">
                    <div className="loading">Loading employees...</div>
                </div>
            </div>
        )
    }

    return (
        <div className="employee-management-page">
            <Sidebar />
            <div className="employee-management">
                <div className="employee-header">
                    <h2>👥 Employee Management</h2>
                    {isAdmin && (
                        <button
                            className="add-employee-btn"
                            onClick={handleAddNew}>
                            + Add New Employee
                        </button>
                    )}
                </div>

                {error && (
                    <div className="error-message">
                        {error}
                        <button onClick={() => setError(null)}>×</button>
                    </div>
                )}

                <div className="employee-stats">
                    <div className="stat-cards">
                        <h4>Total Employees</h4>
                        <span>{pagination.total}</span>
                    </div>
                    <div className="stat-cards">
                        <h4>Active</h4>
                        <span>
                            {
                                employees.filter((e) => e.status === "active")
                                    .length
                            }
                        </span>
                    </div>
                    <div className="stat-cards">
                        <h4>Inactive</h4>
                        <span>
                            {
                                employees.filter(
                                    (e) => e.status === "suspended"
                                ).length
                            }
                        </span>
                    </div>
                    <div className="stat-cards">
                        <h4>Managers</h4>
                        <span>
                            {
                                employees.filter(
                                    (e) => e.role_name === "manager"
                                ).length
                            }
                        </span>
                    </div>
                    <div className="stat-cards">
                        <h4>Showing Results</h4>
                        <span>{filteredEmployees.length}</span>
                    </div>
                </div>

                {/* Role Management Section */}
                {isAdmin && (
                    <div className="role-management-section">
                        <div className="role-header">
                            <h3>🎭 Roles </h3>
                            <div className="role-actions">
                                <button
                                    className="refresh-btn"
                                    onClick={refreshRoleUsage}
                                    title="Refresh role usage">
                                    🔄
                                </button>
                                <button
                                    className="add-role-btn"
                                    onClick={handleAddNewRole}>
                                    + Add New Role
                                </button>
                            </div>
                        </div>
                        <div className="role-table-container">
                            <table className="role-table">
                                <thead>
                                    <tr>
                                        <th>{t("Role Name", "Rollenname")}</th>
                                        <th>{t("Employees", "Mitarbeiter")}</th>
                                        <th>
                                            {t("Permissions", "Berechtigungen")}
                                        </th>
                                        <th>{t("Actions", "Aktionen")}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {roles.map((role) => (
                                        <tr key={role.id}>
                                            <td>
                                                <span className="role-name">
                                                    {role.name}
                                                </span>
                                            </td>
                                            <td>
                                                <span
                                                    className={`employee-count ${
                                                        role.userCount > 0
                                                            ? "has-employees"
                                                            : "no-employees"
                                                    }`}>
                                                    {role.userCount}{" "}
                                                    {t(
                                                        "employee(s)",
                                                        "Mitarbeiter"
                                                    )}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="role-permissions">
                                                    {role.permissions ? (
                                                        role.permissions.map(
                                                            (perm, index) => (
                                                                <span
                                                                    key={index}
                                                                    className="permission-tag">
                                                                    {perm.code}
                                                                </span>
                                                            )
                                                        )
                                                    ) : (
                                                        <span className="no-permissions">
                                                            {t(
                                                                "No permissions",
                                                                "Keine Berechtigungen"
                                                            )}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="action-buttons">
                                                <button
                                                    onClick={() =>
                                                        handleEditRole(role)
                                                    }
                                                    className="edit-btn"
                                                    title={t(
                                                        "Edit role",
                                                        "Rollen bearbeiten"
                                                    )}>
                                                    ✏️
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleDeleteRole(
                                                            role.id
                                                        )
                                                    }
                                                    className={`delete-btn ${
                                                        role.userCount > 0
                                                            ? "disabled"
                                                            : ""
                                                    }`}
                                                    disabled={
                                                        role.userCount > 0
                                                    }
                                                    title={
                                                        role.userCount > 0
                                                            ? `${t(
                                                                  "Cannot delete: %s employee(s) assigned",
                                                                  "Kann nicht löschen: %s Mitarbeiter zugewiesen"
                                                              )} ${
                                                                  role.userCount
                                                              }`
                                                            : t(
                                                                  "Delete role",
                                                                  "Rollen löschen"
                                                              )
                                                    }>
                                                    🗑️
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Shift Management Section (Admin only) */}
                {isAdmin && (
                    <div className="shift-management-section">
                        <div className="shift-header">
                            <h3>
                                🕒 {t("Shift Management", "Schichtverwaltung")}
                            </h3>
                            <button
                                className="add-shift-btn"
                                onClick={() => openShiftModal()}>
                                {t("Add Shift", "Schicht hinzufügen")}
                            </button>
                        </div>
                        {shiftError && (
                            <div className="error-message">{shiftError}</div>
                        )}
                        {shiftLoading ? (
                            <div>
                                {t(
                                    "Loading shifts...",
                                    "Schichten werden geladen..."
                                )}
                            </div>
                        ) : (
                            <div className="shift-table-container">
                                <table className="shift-table">
                                    <thead>
                                        <tr>
                                            <th>{t("Shift", "Schicht")}</th>
                                            <th>
                                                {t("Start Time", "Startzeit")}
                                            </th>
                                            <th>{t("End Time", "Endzeit")}</th>
                                            <th>{t("Actions", "Aktionen")}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {shifts.map((shift) => (
                                            <tr key={shift.id}>
                                                <td>
                                                    {shift.start_time
                                                        ? shift.end_time
                                                            ? `${shift.start_time} - ${shift.end_time}`
                                                            : shift.start_time
                                                        : "-"}
                                                </td>
                                                <td>
                                                    {shift.start_time
                                                        ? new Date(
                                                              `1970-01-01T${shift.start_time}:00`
                                                          ).toLocaleTimeString(
                                                              [],
                                                              {
                                                                  hour: "2-digit",
                                                                  minute: "2-digit",
                                                              }
                                                          )
                                                        : "-"}
                                                </td>
                                                <td>
                                                    {shift.end_time
                                                        ? new Date(
                                                              `1970-01-01T${shift.end_time}:00`
                                                          ).toLocaleTimeString(
                                                              [],
                                                              {
                                                                  hour: "2-digit",
                                                                  minute: "2-digit",
                                                              }
                                                          )
                                                        : "-"}
                                                </td>
                                                <td>
                                                    <button
                                                        onClick={() =>
                                                            openShiftModal(
                                                                shift
                                                            )
                                                        }>
                                                        {t(
                                                            "Edit",
                                                            "Bearbeiten"
                                                        )}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                        {/* Shift Modal */}
                        {shiftModalOpen && (
                            <div className="modal-overlay">
                                <div className="modal-content">
                                    <div className="modal-header">
                                        <h3>
                                            {editingShift
                                                ? t(
                                                      "Edit Shift",
                                                      "Schicht bearbeiten"
                                                  )
                                                : t(
                                                      "Add Shift",
                                                      "Schicht hinzufügen"
                                                  )}
                                        </h3>
                                        <button
                                            className="close-btn"
                                            onClick={closeShiftModal}>
                                            ×
                                        </button>
                                    </div>
                                    <form
                                        onSubmit={handleShiftSubmit}
                                        className="shift-form">
                                        <div className="form-section">
                                            <label>
                                                {t("Start Time", "Startzeit")}
                                            </label>
                                            <input
                                                type="time"
                                                name="startTime"
                                                value={shiftForm.startTime}
                                                onChange={handleShiftFormChange}
                                                required
                                            />
                                        </div>
                                        <div className="form-section">
                                            <label>
                                                {t("End Time", "Endzeit")}
                                            </label>
                                            <input
                                                type="time"
                                                name="endTime"
                                                value={shiftForm.endTime}
                                                onChange={handleShiftFormChange}
                                            />
                                        </div>
                                        <div className="form-actions">
                                            <button
                                                type="submit"
                                                className="submit-btn"
                                                disabled={shiftLoading}>
                                                {editingShift
                                                    ? t(
                                                          "Update Shift",
                                                          "Schicht aktualisieren"
                                                      )
                                                    : t(
                                                          "Add Shift",
                                                          "Schicht hinzufügen"
                                                      )}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={closeShiftModal}
                                                className="cancel-btn">
                                                {t("Cancel", "Abbrechen")}
                                            </button>
                                        </div>
                                        {shiftError && (
                                            <div className="error-message">
                                                {shiftError}
                                            </div>
                                        )}
                                    </form>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <div className="employee-controls">
                    <div className="search-section">
                        <input
                            type="text"
                            placeholder={t(
                                "Search by name, email, or role...",
                                "Suche nach Name, E-Mail oder Rolle..."
                            )}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                        <button
                            className="clear-search-btn"
                            onClick={() => setSearchTerm("")}
                            style={{ display: searchTerm ? "block" : "none" }}>
                            {t("Clear", "Löschen")}
                        </button>
                    </div>

                    <div className="filter-section">
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="filter-select">
                            <option value="all">
                                {t("All Status", "Alle Status")}
                            </option>
                            <option value="active">
                                {t("Active", "Aktiv")}
                            </option>
                            <option value="suspended">
                                {t("Suspended", "Gesperrt")}
                            </option>
                            <option value="deleted">
                                {t("Deleted", "Gelöscht")}
                            </option>
                        </select>

                        <select
                            value={filterRole}
                            onChange={(e) => setFilterRole(e.target.value)}
                            className="filter-select">
                            <option value="all">
                                {t("All Roles", "Alle Rollen")}
                            </option>
                            {getUniqueRoles().map((role) => (
                                <option key={role} value={role}>
                                    {getRoleDisplayName(role)}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Employee Table */}
                <div className="employee-table-container">
                    <table className="employee-table">
                        <thead>
                            <tr>
                                <th>{t("Name", "Name")}</th>
                                <th>{t("Email", "E-Mail")}</th>
                                <th>{t("Role", "Rolle")}</th>
                                <th>{t("Shift", "Schicht")}</th>
                                <th>{t("Status", "Status")}</th>
                                <th>{t("Created", "Erstellt")}</th>
                                <th>{t("Actions", "Aktionen")}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredEmployees.map((employee) => (
                                <tr key={employee.id}>
                                    <td>{employee.name}</td>
                                    <td>{employee.email}</td>
                                    <td>
                                        <span
                                            className={`role-badge ${employee.role_name
                                                ?.replace(/\s+/g, "-")
                                                .toLowerCase()}`}>
                                            {getRoleDisplayName(
                                                employee.role_name
                                            )}
                                        </span>
                                    </td>
                                    {/* TODO: FIX IT */}
                                    <td>{employee.shift_name}</td>
                                    <td>
                                        <select
                                            value={employee.status}
                                            onChange={(e) =>
                                                handleStatusChange(
                                                    employee.id,
                                                    e.target.value
                                                )
                                            }
                                            className={`status-select ${employee.status}`}>
                                            <option value="active">
                                                {t("Active", "Aktiv")}
                                            </option>
                                            <option value="suspended">
                                                {t("Suspended", "Gesperrt")}
                                            </option>
                                            <option value="deleted">
                                                {t("Deleted", "Gelöscht")}
                                            </option>
                                        </select>
                                    </td>
                                    <td>
                                        {new Date(
                                            employee.created_at
                                        ).toLocaleDateString()}
                                    </td>
                                    <td className="action-buttons">
                                        <button
                                            onClick={() => handleEdit(employee)}
                                            className="edit-btn">
                                            ✏️
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {/* Shift Assign Modal */}
                {shiftAssignModalOpen && shiftAssignEmployee && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h3>
                                    {t(
                                        "Assign Shifts to Employee",
                                        "Schichten dem Mitarbeiter zuweisen"
                                    )}
                                </h3>
                                <button
                                    className="close-btn"
                                    onClick={closeShiftAssignModal}>
                                    ×
                                </button>
                            </div>
                            <div style={{ marginBottom: 18 }}>
                                <strong>{t("Employee", "Mitarbeiter")}:</strong>{" "}
                                {shiftAssignEmployee.name}
                            </div>
                            {shiftAssignLoading ? (
                                <div>{t("Loading...", "Lädt...")}</div>
                            ) : (
                                <div>
                                    {shifts.map((shift) => (
                                        <div
                                            key={shift.id}
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                marginBottom: 8,
                                            }}>
                                            <input
                                                type="checkbox"
                                                checked={isShiftAssigned(
                                                    shift.id
                                                )}
                                                onChange={(e) =>
                                                    e.target.checked
                                                        ? handleAssignShiftToEmployee(
                                                              shift.id
                                                          )
                                                        : handleUnassignShiftFromEmployee(
                                                              shift.id
                                                          )
                                                }
                                                id={`shift-assign-${shift.id}`}
                                            />
                                            <label
                                                htmlFor={`shift-assign-${shift.id}`}
                                                style={{ marginLeft: 8 }}>
                                                {shift.id} (
                                                {shift.start_time
                                                    ? new Date(
                                                          shift.start_time
                                                      ).toLocaleString()
                                                    : "-"}
                                                )
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="pagination">
                        <button
                            onClick={() =>
                                handlePageChange(pagination.page - 1)
                            }
                            disabled={pagination.page === 1}
                            className="pagination-btn">
                            {t("Previous", "Vorherige")}
                        </button>
                        <span className="pagination-info">
                            {t("Page %s of %s", "Seite %s von %s")}{" "}
                            {pagination.page} {t("of", "von")}{" "}
                            {pagination.totalPages}
                        </span>
                        <button
                            onClick={() =>
                                handlePageChange(pagination.page + 1)
                            }
                            disabled={pagination.page === pagination.totalPages}
                            className="pagination-btn">
                            {t("Next", "Nächste")}
                        </button>
                    </div>
                )}

                {/* Modal/Popup Form */}
                {showForm && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h3>
                                    {editing
                                        ? t(
                                              "Edit Employee",
                                              "Mitarbeiter bearbeiten"
                                          )
                                        : t(
                                              "Add New Employee",
                                              "Neuen Mitarbeiter hinzufügen"
                                          )}
                                </h3>
                                <button
                                    className="close-btn"
                                    onClick={handleCloseForm}>
                                    ×
                                </button>
                            </div>

                            <form
                                onSubmit={handleSubmit}
                                className="employee-form">
                                <div className="form-section">
                                    <h4>
                                        {t(
                                            "Basic Information",
                                            "Grundlegende Informationen"
                                        )}
                                    </h4>
                                    <div className="form-row">
                                        <input
                                            name="first_name"
                                            placeholder={t(
                                                "First Name",
                                                "Vorname"
                                            )}
                                            value={formData.first_name}
                                            onChange={handleChange}
                                            required
                                        />
                                        <input
                                            name="last_name"
                                            placeholder={t(
                                                "Last Name",
                                                "Nachname"
                                            )}
                                            value={formData.last_name}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-row">
                                        <input
                                            name="email"
                                            type="email"
                                            placeholder={t("Email", "E-Mail")}
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                        />
                                        <select
                                            name="role"
                                            value={formData.role}
                                            onChange={handleChange}
                                            required>
                                            <option value="">
                                                {t(
                                                    "Select Role",
                                                    "Rolle auswählen"
                                                )}
                                            </option>
                                            {roles.map((role) => (
                                                <option
                                                    key={role.id}
                                                    value={role.name}>
                                                    {getRoleDisplayName(
                                                        role.name
                                                    )}
                                                </option>
                                            ))}
                                        </select>
                                        <select
                                            name="status"
                                            value={formData.status}
                                            onChange={handleChange}>
                                            <option value="active">
                                                {t("Active", "Aktiv")}
                                            </option>
                                            <option value="suspended">
                                                {t("Suspended", "Gesperrt")}
                                            </option>
                                            <option value="deleted">
                                                {t("Deleted", "Gelöscht")}
                                            </option>
                                        </select>
                                    </div>
                                    <div className="form-row">
                                        <label style={{ marginRight: 8 }}>
                                            {t("Shift", "Schicht")}:
                                        </label>
                                        <select
                                            value={
                                                formShiftAssignments[0] || ""
                                            }
                                            onChange={(e) =>
                                                setFormShiftAssignments(
                                                    e.target.value
                                                        ? [e.target.value]
                                                        : []
                                                )
                                            }
                                            className="shift-select"
                                            disabled={formShiftsLoading}>
                                            <option value="">
                                                {t(
                                                    "Select Shift",
                                                    "Schicht auswählen"
                                                )}
                                            </option>
                                            {shifts.map((shift) => {
                                                let label =
                                                    shift.start_time || ""
                                                if (shift.end_time) {
                                                    label = `${shift.start_time} - ${shift.end_time}`
                                                }
                                                return (
                                                    <option
                                                        key={shift.id}
                                                        value={shift.id}>
                                                        {label}
                                                    </option>
                                                )
                                            })}
                                        </select>
                                    </div>
                                </div>

                                <div className="form-actions">
                                    <button
                                        type="submit"
                                        className="submit-btn">
                                        {editing
                                            ? t(
                                                  "Update Employee",
                                                  "Mitarbeiter aktualisieren"
                                              )
                                            : t(
                                                  "Add Employee",
                                                  "Mitarbeiter hinzufügen"
                                              )}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleCloseForm}
                                        className="cancel-btn">
                                        {t("Cancel", "Abbrechen")}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Role Management Modal */}
                {showRoleForm && isAdmin && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h3>
                                    {editingRole
                                        ? t("Edit Role", "Rolle bearbeiten")
                                        : t(
                                              "Add New Role",
                                              "Neue Rolle hinzufügen"
                                          )}
                                </h3>
                                <button
                                    className="close-btn"
                                    onClick={handleCloseRoleForm}>
                                    ×
                                </button>
                            </div>

                            <form
                                onSubmit={handleRoleSubmit}
                                className="role-form">
                                <div className="form-section">
                                    <h4>
                                        {t(
                                            "Basic Information",
                                            "Grundlegende Informationen"
                                        )}
                                    </h4>
                                    <div className="form-row">
                                        <input
                                            name="name"
                                            placeholder={t(
                                                "Role Name (e.g., Supervisor, Assistant Manager)",
                                                "Rollenname (z.B. Supervisor, Assistent Manager)"
                                            )}
                                            value={roleFormData.name}
                                            onChange={handleRoleChange}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-section">
                                    <h4>
                                        {t(
                                            "Role Permissions",
                                            "Rollenberechtigungen"
                                        )}
                                    </h4>
                                    <div className="permissions-grid">
                                        {permissions.map((permission) => (
                                            <label
                                                key={permission.id}
                                                className="permission-item">
                                                <input
                                                    type="checkbox"
                                                    name={`rolePermissions.${permission.code}`}
                                                    checked={roleFormData.permissions.includes(
                                                        permission.code
                                                    )}
                                                    onChange={handleRoleChange}
                                                />
                                                {permission.description ||
                                                    permission.code}
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="form-actions">
                                    <button
                                        type="submit"
                                        className="submit-btn">
                                        {editingRole
                                            ? t(
                                                  "Update Role",
                                                  "Rolle aktualisieren"
                                              )
                                            : t("Add Role", "Rolle hinzufügen")}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleCloseRoleForm}
                                        className="cancel-btn">
                                        {t("Cancel", "Abbrechen")}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default EmployeeManagement
