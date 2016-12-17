const electron = require('electron');
const fs       = require('fs');
const path     = require('path');
const stylus   = require('stylus');
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

app.setName('Ghetto Skype');
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

	mainWindow.webContents.setUserAgent("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.87 Safari/537.36");
	mainWindow.loadURL('https://web.skype.com/en');
});

electron.ipcMain.on('reload-skype', () => {
	mainWindow.reload();
});

function injectStylus(theme) {
	let themeFolder   = path.join(__dirname, 'themes', theme);
	let themeSkeleton = path.join(__dirname, 'themes', 'core', 'skype.styl');

	fs.readFile(themeSkeleton, 'utf8', (err, styl) => {
		if (err) {
			console.error('Error:', err);
			return;
		}

		stylus(styl)
			.include(themeFolder)
			.render((err, css) => {
				if (err) {
					console.error('Error:', err);
					return;
				}

				mainWindow.webContents.insertCSS(css)
			});
	});
}

electron.ipcMain.on('load-theme', () => {
	injectStylus(Settings.get('Theme'));
});

electron.ipcMain.on('open-link', (e, href) => {
	let protocol = require('url').parse(href).protocol;

	if (href.indexOf('imgpsh_fullsize') >= 0) {
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
