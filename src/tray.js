const electron = require('electron');
const Settings = require('./Settings.js');
const path     = require('path');
const fs       = require('fs');
const nativeImage = require('electron').nativeImage;
const Canvas = require('canvas');

const BrowserWindow = electron.BrowserWindow;

let trayIcon       = null;
let mainWindow     = null;
let settingsWindow = null;
let iconPath       = null;
let lastCount      = 0;



exports.init = function(window) {
	mainWindow = window;
	iconPath   = electron.app.getAppPath() + '/assets/tray/skype24.png';
	trayIcon   = new electron.Tray(iconPath);
	trayIcon.on('click', toggleOpen);
	trayIcon.setToolTip('Ghetto Skype');
	trayIcon.setContextMenu(contextMenu);
};

function setTrayCount(count) {
	let image = nativeImage.createFromPath(iconPath);
	var data = image.toDataURL();
	let htmlImage = new Canvas.Image(image.getSize().width, image.getSize().height);
	htmlImage.src = data;
	let canvas = new Canvas(htmlImage.width, htmlImage.height);
	let ctx = canvas.getContext('2d');
	ctx.drawImage(htmlImage, 0, 0);
	x = canvas.width / 3 * 2;
	y = canvas.height / 3 * 2;
	radius = canvas.width / 3;
	ctx.fillStyle = '#ffa200';
	ctx.beginPath();
	ctx.arc(x, y, radius, 0, Math.PI * 2, true);
	ctx.closePath();
	ctx.fill();
	ctx.textAlign = "center";
	ctx.fillStyle = '#000000';
	ctx.font = "bold " + (radius + 2) + "px Sans";
	ctx.fillText(count, x, y + 4);
	data = canvas.toDataURL();
	image = nativeImage.createFromDataURL(data);
	return image;
}

exports.setNotificationCount = function(count) {
	if (count === lastCount) {
		return;
	}
	
	let image = nativeImage.createFromPath(iconPath);
	
	if (count > 0) {
		image = setTrayCount(count);
		mainWindow.flashFrame(true);
		if (Settings.get('OpenWhenMessaged')) {
			mainWindow.show();
			mainWindow.focus();
		}
	} else {
		mainWindow.flashFrame(false);
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
