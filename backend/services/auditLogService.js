const { v4: uuidv4 } = require("uuid");

class AuditLogService {
	constructor(db) {
		this.db = db;
	}

	async log({
		user_id,
		action_type,
		table_name,
		record_id,
		old_data,
		new_data,
	}) {
		const stmt = this.db.prepare(`
      INSERT INTO audit_logs (id, user_id, action_type, table_name, record_id, old_data, new_data)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
		stmt.run(
			uuidv4(),
			user_id,
			action_type,
			table_name,
			record_id,
			old_data ? JSON.stringify(old_data) : null,
			new_data ? JSON.stringify(new_data) : null
		);
	}
}

module.exports = AuditLogService;
