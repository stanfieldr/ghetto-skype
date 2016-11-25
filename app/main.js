const {app}       = require('electron');
const fs          = require('fs');
const path        = require('path');
const GhettoSkype = require('./GhettoSkype');
const TrayIcon    = require('./tray');
const tmp         = require('tmp');

let mainWindow = null;

const shouldQuit = app.makeSingleInstance(() => {
	if (mainWindow) {
		mainWindow.show();
		mainWindow.focus();
	}
});

if (shouldQuit) {
	app.quit();
	return;
}

app.on('ready', function() {
	var isQuiting = false;
	let settings  = GhettoSkype.settings;
	mainWindow    = GhettoSkype.createWindow({
		autoHideMenuBar: true,
		center         : true,
		show           : !settings.StartMinimized,
		icon           : app.getAppPath() + '/assets/tray/skype-big.png'
	});

	if (settings.mainWindow) {
		let {width, height} = settings.mainWindow;
		mainWindow.setSize(width, height);
	}

	app.on('before-quit', function() {
		isQuiting = true;
	});

	mainWindow.on('focus', function() {
		GhettoSkype.sendToRenderers('opened-main-window');
	});

	mainWindow.on('show', function() {
		mainWindow.focus();
	});

	mainWindow.on('close', function(event) {
		isQuiting = isQuiting || settings.QuitByCloseWindow;
		if (isQuiting) {
			let size = mainWindow.getSize();
			GhettoSkype.saveSettings(null, {
				mainWindow: {
					width:  size[0],
					height: size[1]
				}
			});
			app.quit();
		} else {
			event.preventDefault();
			mainWindow.hide();
		}
	});

	TrayIcon.init(mainWindow);

	let filePath = path.join(__dirname, '..', 'views', 'skype.html');
	mainWindow.loadURL('file://' + filePath);

	// By default, electron will navigate the browser window to files that are dragged
	// on top of it, but we want the files to be handled by Web Skype
	mainWindow.webContents.on('will-navigate', function(event) {
		event.preventDefault();
	});
});
