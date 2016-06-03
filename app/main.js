const {app}       = require('electron');
const fs          = require('fs');
const path        = require('path');
const GhettoSkype = require('./GhettoSkype');
const TrayIcon    = require('./tray');
const tmp         = require('tmp');

app.on('ready', function() {
	let isQuiting  = false;
	let settings   = GhettoSkype.settings;
	let mainWindow = GhettoSkype.createWindow({
		autoHideMenuBar: true,
		center: true,
		show: !settings.StartMinimized,
		icon: app.getAppPath() + '/assets/tray/skype.png'
	});

	if (settings.mainWindow) {
		let {width, height} = settings.mainWindow;
		mainWindow.setSize(width, height);
	}

	app.on('before-quit', function() {
		isQuiting = true;
	});

	mainWindow.on('close', function(event) {
		if (!isQuiting) {
			event.preventDefault();
			mainWindow.hide();
		} else {
			let size = mainWindow.getSize();
			GhettoSkype.saveSettings(null, {
				mainWindow: {
					width:  size[0],
					height: size[1]
				}
			});
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
