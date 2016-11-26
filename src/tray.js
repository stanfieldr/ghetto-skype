const electron      = require('electron');
const Settings      = require('./Settings.js');
const BrowserWindow = electron.BrowserWindow;
const path = require('path');

let trayIcon       = null;
let mainWindow     = null;
let settingsWindow = null;
let basePath       = null;
let lastCount      = 0;

exports.init = function(window) {
	mainWindow = window;
	basePath   = electron.app.getAppPath() + '/assets/tray/';
	trayIcon   = new electron.Tray(`${basePath}skype24.png`);

	trayIcon.on('click', toggleOpen);
	trayIcon.setToolTip('Ghetto Skype');
	trayIcon.setContextMenu(contextMenu);
};

exports.setNotificationCount = function(count) {
	if (count === lastCount) {
		return;
	}

	let image = basePath;
	if (count > 0) {
		image += 'skype24-1.png';
		mainWindow.flashFrame(true);
		if (Settings.get('OpenWhenMessaged')) {
			mainWindow.show();
			mainWindow.focus();
		}
	} else {
		mainWindow.flashFrame(false);
		image += 'skype24.png';
	}

	trayIcon.setImage(image);
	lastCount = count;
};

electron.ipcMain.on('notification-count', (e, count) => exports.setNotificationCount(count));

function toggleOpen() {
	if (mainWindow.isFocused()) {
		mainWindow.hide();
	} else {
		mainWindow.show();
		mainWindow.focus();
	}
}

let contextMenu = new electron.Menu.buildFromTemplate([
	{
		label: "Open",
		click: () => {
			mainWindow.show();
			mainWindow.focus();
		}
	},
	{
		label: "Reload/Refresh",
		click: () => {
			mainWindow.show();
			mainWindow.reload();
		}
	},
	{
		label: "Online Status",
		submenu: [
			{
				label: "Online",
				click: () => mainWindow.webContents.send("status-change", "online")
			},
			{
				label: "Away",
				click: () => mainWindow.webContents.send("status-change", "idle")
			},
			{
				label: "Busy",
				click: () => mainWindow.webContents.send("status-change", "dnd")
			},
			{
				label: "Invisible",
				click: () => mainWindow.webContents.send("status-change", "hidden")
			}
		]
	},
	{
		label: "Settings",
		click: () => {
			if (settingsWindow) {
				settingsWindow.show();
				settingsWindow.focus();
				return;
			}

			settingsWindow = new BrowserWindow({
				autoHideMenuBar: true,
				center: true,
				width : 900,
				height: 625,
				parent: mainWindow,
				webPreferences: {
					zoomFactor: Settings.get('ZoomFactor')
				}
			});

			settingsWindow.focus();

			if (Settings.get('Theme')) {
				let folder = path.join(__dirname, 'themes', Settings.get('Theme'));
				let p = path.join(folder, 'settings.styl');
				fs.readFile(p, 'utf8', (err, scss) => {
					stylus(scss)
						.include(folder)
						.render((err, css) => {
							settingsWindow.webContents.once('did-finish-load', () => settingsWindow.webContents.insertCSS(css));
						});
				});
			}

			settingsWindow.on('closed', () => settingsWindow = null);

			let filePath = path.join(__dirname, 'views', 'settings.html');
			settingsWindow.loadURL("file://" + filePath);
		}
	},
	{
		role: "quit",
		label: "Exit",
		click: () => electron.app.quit()
	}
]);
