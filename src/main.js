const electron = require('electron');
const path     = require('path');
const TrayIcon = require('./tray');
const Settings = require('./Settings.js');

const {app} = electron;
let mainWindow;

let shouldQuit = app.makeSingleInstance(() => {
	if (mainWindow) {
		mainWindow.show();
		mainWindow.focus();
	}
});

if (shouldQuit) {
	app.quit();
	return;
}

Settings.init();

app.on('before-quit', () => shouldQuit = true);
app.on('ready', () => {
	// Restore the dimensions of main window from the last time it was run
	let width, height;
	if (Settings.get('mainWindow')) {
		width  = Settings.get('mainWindow').width;
		height = Settings.get('mainWindow').height;
	}

	mainWindow = new electron.BrowserWindow({
		width : width  || 800,
		height: height || 600,
		show  : !Settings.get('StartMinimized'),
		icon  : app.getAppPath() + '/assets/tray/skype-big.png',

		webPreferences: {
			partition      : 'persist:skype',
			preload        : path.join(__dirname, 'skype.js'),
			nodeIntegration: false,
			webaudio       : Settings.get('Mute'),
			zoomFactor     : Settings.get('ZoomFactor')
		}
	});

	if (Settings.get('ProxyRules')) {
		mainWindow.webContents.session.setProxy({
			proxyRules: Settings.get('ProxyRules')
		}, () => {});
	}

	mainWindow.on('close', function(event) {
		shouldQuit = shouldQuit || Settings.get('QuitByCloseWindow');
		if (shouldQuit) {
			let size = mainWindow.getSize();
			Settings.set('mainWindow', {
				width : size[0],
				height: size[1]
			});

			Settings.save().then(() => app.quit());
		} else {
			event.preventDefault();
			mainWindow.hide();
		}
	});

	TrayIcon.init(mainWindow);
	mainWindow.loadURL('https://web.skype.com/en');
});

electron.ipcMain.on('open-link', (e, href) => {
	let protocol = require('url').parse(href).protocol;

	console.log(href, href.indexOf('imgpsh_fullsize') >= 0);
	if (href.indexOf('imgpsh_fullsize') >= 0) {
		console.log('Native: ', Settings.get('NativeImageViewer'));
		if (Settings.get('NativeImageViewer')) {
			downloadImage(href);
		} else {
			let tmp = new electron.BrowserWindow({
				show: true,
				webPreferences: {
					partition      : 'persist:skype',
					nodeIntegration: false,
					zoomFactor     : Settings.get('ZoomFactor')
				}
			});

			tmp.loadURL(href);
		}
	} else if (protocol === 'http:' || protocol === 'https:') {
		electron.shell.openExternal(href);
	}
});

let imageCache = {};
function downloadImage(url) {
	let file = imageCache[url];
	if (file) {
		if (file.complete) {
			electron.shell.openItem(file.path);
		}

		// Pending downloads intentionally do not proceed
		return;
	}

	let tmpWindow = new electron.BrowserWindow({
		show: false,
		webPreferences: {
			partition: 'persist:skype'
		}
	});

	if (Settings.get('ProxyRules')) {
		tmpWindow.webContents.session.setProxy({
			proxyRules: Settings.get('ProxyRules')
		}, () => {});
	}

	tmpWindow.webContents.session.once('will-download', (event, downloadItem) => {
		imageCache[url] = file = {
			path: require('tmp').tmpNameSync() + '.' + require('mime').extension(downloadItem.getMimeType()),
			complete: false
		};

		downloadItem.setSavePath(file.path);
		downloadItem.once('done', () => {
			tmpWindow.destroy();
			tmpWindow = null;

			electron.shell.openItem(file.path);

			file.complete = true;
		});
	});

	tmpWindow.webContents.downloadURL(url);
}
