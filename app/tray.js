const electron      = require('electron');
const BrowserWindow = electron.BrowserWindow;
const path = require('path');

const GhettoSkype = require('./GhettoSkype');

let trayIcon       = null;
let mainWindow     = null;
let settingsWindow = null;
let basePath       = null;
let lastCount      = 0;

exports.init = function(window) {
	mainWindow = window;
	basePath   = electron.app.getAppPath() + '/assets/tray/';
	trayIcon   = new electron.Tray(`${basePath}skype24.png`);

	trayIcon.on('click', toggleOpen);
	trayIcon.setToolTip('Ghetto Skype');
	trayIcon.setContextMenu(contextMenu);
};

exports.setNotificationCount = function(count) {
	if (count === lastCount) {
		return;
	}

	let image = basePath;
	if (count > 0) {
		image += 'skype24-1.png';
		mainWindow.flashFrame(true);
		if (GhettoSkype.settings.OpenWhenMessaged) {
			// Do not click threads once a user reads one
			if (count > lastCount) {
				GhettoSkype.sendToRenderers('read-latest-thread');
			}

			mainWindow.show();
			mainWindow.focus();
		}
	} else {
		mainWindow.flashFrame(false);
		image += 'skype24.png';
	}

	trayIcon.setImage(image);
	lastCount = count;
};

function toggleOpen() {
	if (mainWindow.isVisible()) {
		mainWindow.hide();
	} else {
		mainWindow.show();
		mainWindow.focus();
	}
}

let contextMenu = new electron.Menu.buildFromTemplate([
	{
		label: "Open",
		click: () => {
			mainWindow.show();
			mainWindow.focus();
		}
	},
	{
		label: "Online Status",
		submenu: [
			{
				label: "Online",
				click: () => mainWindow.webContents.send("status-change", "online")
			},
			{
				label: "Away",
				click: () => mainWindow.webContents.send("status-change", "idle")
			},
			{
				label: "Busy",
				click: () => mainWindow.webContents.send("status-change", "dnd")
			},
			{
				label: "Invisible",
				click: () => mainWindow.webContents.send("status-change", "hidden")
			}
		]
	},
	{
		label: "Settings",
		click: () => GhettoSkype.openSettings()
	},
	{
		role: "quit",
		label: "Exit",
		click: () => electron.app.quit()
	}
]);
