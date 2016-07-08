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
	trayIcon   = new electron.Tray(`${basePath}skype.png`);

	trayIcon.on('click', toggleOpen);
	trayIcon.setContextMenu(contextMenu);
};

exports.setNotificationCount = function(count) {
	if (count === lastCount) {
		return;
	}

	let image = basePath;

	if (count > 0) {
		image += 'skype-1.png';
	} else {
		image += 'skype.png';
	}

	trayIcon.setImage(image);
	lastCount = count;
};

function toggleOpen() {
	let fn = mainWindow.isVisible()	? 'hide' : 'show';
	mainWindow[fn]();
}

let contextMenu = new electron.Menu.buildFromTemplate([
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
	},
	{
		type: 'separator'
	},
	{
		label: "Open",
		click: () => mainWindow.show()
	},
	{
		label: "Settings",
		click: () => GhettoSkype.openSettings()
	},
	{
		label: "Exit",
		click: () => electron.app.quit()
	}
]);
