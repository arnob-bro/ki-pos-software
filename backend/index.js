const { app, BrowserWindow } = require("electron");
const path = require("path");

// Initialize database and IPC handlers
require("./app");

app.whenReady().then(() => {
	const win = new BrowserWindow({
		webPreferences: {
			preload: path.join(__dirname, "preload.js"),
			contextIsolation: true,
			nodeIntegration: false,
		},
	});
	win.loadURL("http://localhost:5173");
});

app.on("window-all-closed", () => {
	if (process.platform !== "darwin") {
		app.quit();
	}
});

app.on("activate", () => {
	if (BrowserWindow.getAllWindows().length === 0) {
		const win = new BrowserWindow({
			webPreferences: {
				preload: path.join(__dirname, "preload.js"),
				contextIsolation: true,
				nodeIntegration: false,
			},
		});
		win.loadURL("http://localhost:5173");
	}
});
