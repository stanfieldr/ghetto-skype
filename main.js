const electron      = require('electron');
const app           = electron.app;
const BrowserWindow = require('browser-window');
const Settings      = require('./settings');
const TrayIcon      = require('./tray');

app.on('ready', function() {
	let isQuiting = false;
	let mainWindow = new BrowserWindow({
		autoHideMenuBar: true,
		center: true,
		closable: false,
		show: !Settings.StartMinimized,
		icon: 'assets/tray/skype.png'
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

	TrayIcon.init(mainWindow);
	mainWindow.loadURL('file://' + __dirname + '/views/skype.html');
});
