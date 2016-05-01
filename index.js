const electron = require('electron');
const app = electron.app;
const BrowserWindow = require('browser-window');

app.on('ready', function() {
	let mainWindow = new BrowserWindow({
		autoHideMenuBar: true,
		center: true,
		closable: false
	});

	const TrayIcon = require('./tray');
	TrayIcon.setMainWindow(mainWindow);

	mainWindow.loadURL('file://' + __dirname + '/index.html');
});
