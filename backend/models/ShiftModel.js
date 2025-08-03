const { db } = require("../config/db");
const { v4: uuidv4 } = require("uuid");

function getCurrentShift(userId) {
	// Find the most recent open shift assigned to the user
	return db
		.prepare(
			`
    SELECT s.*
    FROM shifts s
    JOIN shift_assignments sa ON sa.shift_id = s.id
    WHERE sa.user_id = ? AND s.end_time IS NULL
    ORDER BY s.start_time DESC
    LIMIT 1
  `
		)
		.get(userId);
}

function startShift(userId) {
	const id = uuidv4();
	const startTime = new Date().toISOString();
	db.prepare(
		`
    INSERT INTO shifts (id, user_id, start_time) VALUES (?, ?, ?)
  `
	).run(id, userId, startTime);
	return getCurrentShift(userId);
}

function endShift(shiftId) {
	const endTime = new Date().toISOString();
	db.prepare(
		`
    UPDATE shifts SET end_time = ? WHERE id = ?
  `
	).run(endTime, shiftId);
}

function listShifts() {
	return db.prepare("SELECT * FROM shifts ORDER BY start_time DESC").all();
}

function createShift({ startTime, endTime }, userId) {
	const id = uuidv4();
	db.prepare(
		"INSERT INTO shifts (id, start_time, end_time) VALUES (?, ?, ?)"
	).run(id, startTime, endTime || null);
	const newShift = getShiftById(id);
	logAudit({
		userId,
		actionType: "CREATE",
		tableName: "shifts",
		recordId: id,
		oldData: null,
		newData: newShift,
	});
	return newShift;
}

function updateShift(id, { startTime, endTime }, userId) {
	const oldShift = getShiftById(id);
	db.prepare("UPDATE shifts SET start_time = ?, end_time = ? WHERE id = ?").run(
		startTime,
		endTime,
		id
	);
	const newShift = getShiftById(id);
	logAudit({
		userId,
		actionType: "UPDATE",
		tableName: "shifts",
		recordId: id,
		oldData: oldShift,
		newData: newShift,
	});
	return newShift;
}

function getShiftById(id) {
	return db.prepare("SELECT * FROM shifts WHERE id = ?").get(id);
}

// --- Assignment functions ---
function listAssignments({ shiftId, userId } = {}) {
	if (shiftId) {
		return db
			.prepare("SELECT * FROM shift_assignments WHERE shift_id = ?")
			.all(shiftId);
	}
	if (userId) {
		return db
			.prepare("SELECT * FROM shift_assignments WHERE user_id = ?")
			.all(userId);
	}
	return db.prepare("SELECT * FROM shift_assignments").all();
}

function assignUserToShift(shiftId, userId, actingUserId) {
	const id = uuidv4();
	db.prepare(
		"INSERT INTO shift_assignments (id, shift_id, user_id) VALUES (?, ?, ?)"
	).run(id, shiftId, userId);
	const newAssignment = getAssignmentById(id);
	logAudit({
		userId: actingUserId,
		actionType: "CREATE",
		tableName: "shift_assignments",
		recordId: id,
		oldData: null,
		newData: newAssignment,
	});
	return newAssignment;
}

function unassignUserFromShift(shiftId, userId, actingUserId) {
	const oldAssignment = db
		.prepare(
			"SELECT * FROM shift_assignments WHERE shift_id = ? AND user_id = ?"
		)
		.get(shiftId, userId);
	db.prepare(
		"DELETE FROM shift_assignments WHERE shift_id = ? AND user_id = ?"
	).run(shiftId, userId);
	if (oldAssignment) {
		logAudit({
			userId: actingUserId,
			actionType: "DELETE",
			tableName: "shift_assignments",
			recordId: oldAssignment.id,
			oldData: oldAssignment,
			newData: null,
		});
	}
}

function getAssignmentById(id) {
	return db.prepare("SELECT * FROM shift_assignments WHERE id = ?").get(id);
}

// Helper to log audit actions
function logAudit({
	userId,
	actionType,
	tableName,
	recordId,
	oldData,
	newData,
}) {
	const id = require("uuid").v4();
	const timestamp = new Date().toISOString();
	db.prepare(
		`INSERT INTO audit_logs (id, user_id, action_type, table_name, record_id, old_data, new_data, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `
	).run(
		id,
		userId,
		actionType,
		tableName,
		recordId,
		oldData ? JSON.stringify(oldData) : null,
		newData ? JSON.stringify(newData) : null,
		timestamp
	);
}

module.exports = {
	getCurrentShift,
	startShift,
	endShift,
	listShifts,
	createShift,
	updateShift,
	getShiftById,
	listAssignments,
	assignUserToShift,
	unassignUserFromShift,
	getAssignmentById,
};
