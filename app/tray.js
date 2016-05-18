const electron      = require('electron');
const BrowserWindow = electron.BrowserWindow;
const path = require('path');

const GhettoSkype = require('./GhettoSkype');

let trayIcon       = null;
let mainWindow     = null;
let settingsWindow = null;
let basePath       = null;

exports.init = function(window) {
	mainWindow = window;
	basePath   = electron.app.getAppPath() + '/assets/tray/';
	trayIcon   = new electron.Tray(`${basePath}skype.png`);

	trayIcon.on('click', toggleOpen);
	trayIcon.setContextMenu(contextMenu);
};

exports.setNotificationCount = function(count) {
	let image = basePath;

	if (count > 0) {
		image += 'skype-1.png';
	} else {
		image += 'skype.png';
	}

	trayIcon.setImage(image);
};

function toggleOpen() {
	let fn = mainWindow.isVisible()	? 'hide' : 'show';
	mainWindow[fn]();
}

let contextMenu = new electron.Menu.buildFromTemplate([
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
