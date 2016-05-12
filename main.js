const electron      = require('electron');
const app           = electron.app;
const BrowserWindow = require('browser-window');
const Settings      = require('./settings');
const TrayIcon      = require('./tray');
const spawn         = require('child_process').spawn;
const tmp           = require('tmp');

app.on('ready', function() {
	let isQuiting  = false;
	let mainWindow = new BrowserWindow({
		autoHideMenuBar: true,
		center: true,
		show: !Settings.StartMinimized,
		icon: 'assets/tray/skype.png'
	});

	app.on('before-quit', function() {
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

// TODO: Find a new location for this code
let imageCache = {};
electron.ipcMain.on('image:download', function(event, url) {
	let tmpWindow = new BrowserWindow({
		show: false,
		webPreferences: {
			partition: 'persist:skype'
		}
	});

	tmpWindow.webContents.session.once('will-download', function(event, downloadItem) {
		let fileName = imageCache[url];
		if (fileName) {
			event.preventDefault();
			spawn('xdg-open', [`/tmp/${fileName}.png`]);
			return;
		}

		fileName = tmp.tmpNameSync();
		imageCache[url] = fileName;

		let path = `/tmp/${fileName}.png`;

		downloadItem.setSavePath(path);
		downloadItem.once('done', () => {
			tmpWindow.destroy();
			tmpWindow = null;

			spawn('xdg-open', [path]);
		});
	});

	tmpWindow.webContents.downloadURL(url);
});
