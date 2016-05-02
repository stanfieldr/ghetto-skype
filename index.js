const electron = require('electron');
const app = electron.app;
const BrowserWindow = require('browser-window');
const Settings = require('./settings');

app.on('ready', function() {
	let isQuiting = false;
	let mainWindow = new BrowserWindow({
		autoHideMenuBar: true,
		center: true,
		closable: false,
		show: !Settings.startMinimized,
		icon: './skype.png'
	});

	app.on('before-quit', function(e) {
		isQuiting = true;
	});

	mainWindow.on('close', function(e) {
		if (!isQuiting) {
			mainWindow.hide();
			e.preventDefault();
		}
	});

	const TrayIcon = require('./tray');
	TrayIcon.setMainWindow(mainWindow);

	mainWindow.loadURL('file://' + __dirname + '/index.html');
});
