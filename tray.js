const electron      = require('electron');
const fs            = require('fs');
const BrowserWindow = require('browser-window');

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
}

exports.setNotificationCount = function(count) {
	let image = basePath;

	if (count > 0) {
		image += 'skype-1.png';
	} else {
		image += 'skype.png';
	}

	trayIcon.setImage(image);
};

function openSettings() {
	if (settingsWindow !== null) {
		settingsWindow.show();
		return;
	}

	settingsWindow = new BrowserWindow({
		autoHideMenuBar: true,
		center: true,
		width: 800,
		height: 370,
		webPreferences: {
			zoomFactor: Settings.ZoomFactor
		}
	});

	settingsWindow.on('closed', function() {
		settingsWindow = null;
	});

	settingsWindow.loadURL("file://" + __dirname + "/views/settings.html");
}

function toggleOpen() {
	if (mainWindow.isVisible())
		mainWindow.hide();
	else
		mainWindow.show();
}

let contextMenu = new electron.Menu.buildFromTemplate([
	{
		label: "Open",
		click: () => mainWindow.show()
	},
	{
		label: "Settings",
		click: openSettings
	},
	{
		label: "Exit",
		click: function() {
			electron.app.quit();
		}
	}
]);

let settingFile = electron.app.getPath('userData') + '/settings.json';
let Settings;

try {
	settingFile = JSON.parse(fs.readFileSync(settingFile));
	Settings    = require('./settings.json');

	Object.assign(Settings, settingFile);
} catch(e) {
	Settings = require('./settings.json');
}

exports.getSettings = () => Settings;
electron.ipcMain.on('settings:get', function(event) {
	event.returnValue = Settings;
});

electron.ipcMain.on('settings:save', function(event, settings) {
	Object.assign(Settings, settings);
	let data = JSON.stringify(settings, null, "\t");
	fs.writeFile(settingFile, data, (err) => {
		if (err) throw err;
		settingsWindow.destroy();
		settingsWindow = null;
	})
});
