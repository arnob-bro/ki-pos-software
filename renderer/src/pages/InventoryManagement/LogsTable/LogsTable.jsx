// LogsTable.jsx
import React from "react";
import "./LogsTable.css";

const LogsTable = ({ auditLogs }) => {
	// only logs with new_data
	const entries = auditLogs.filter((log) => log.new_data);

	// build rows
	const rows = entries
		.map((log, idx) => {
			const data = JSON.parse(log.new_data);
			let qty = 0,
				type = "";

			if (log.table_name === "products") {
				// creation = items added
				qty = data.stock_quantity;
				type = "added";
			} else if (log.table_name === "transactions") {
				// sale = items sold
				qty = data.items.reduce((sum, it) => sum + it.quantity, 0);
				type = "sold";
			} else {
				return null; // skip any other
			}

			const icon = type === "added" ? "+" : "–";
			return (
				<tr key={idx}>
					<td>{new Date(log.timestamp).toLocaleString()}</td>
					<td>{log.user}</td>
					<td className={`stock-cell ${type}`}>
						<span className='stock-icon'>{icon}</span>
						{qty}
					</td>
				</tr>
			);
		})
		.filter(Boolean);

	return (
		<div className='logs-card'>
			<div className='logs-header'>
				<h3>Activity Log</h3>
				<span className='logs-count'>{rows.length} records</span>
			</div>

			<div className='logs-container'>
				<table className='logs-table'>
					<thead>
						<tr>
							<th>Timestamp</th>
							<th>User</th>
							<th>Stock</th>
						</tr>
					</thead>
					<tbody>{rows}</tbody>
				</table>
			</div>
		</div>
	);
};

export default LogsTable;
