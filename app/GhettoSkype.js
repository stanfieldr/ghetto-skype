const electron = require('electron');
const fs       = require('fs');
const path     = require('path');
const settings = require('../settings');
const spawn       = require('child_process').spawn;
const tmp         = require('tmp');

const BrowserWindow = electron.BrowserWindow;

let settingsFile = path.join(electron.app.getPath('userData'), 'settings.json');
try {
	let tmpSettings = JSON.parse(fs.readFileSync(settingsFile));
	Object.assign(settings, tmpSettings);
} catch(e){}

class GhettoSkype {
	constructor(settings) {
		this.settings   = settings;
		this.windows    = [];
		this.imageCache = {};

		const ipc = electron.ipcMain;

		ipc.on('image:download', this.downloadImage.bind(this));
		ipc.on('settings:save', this.saveSettings.bind(this));
		ipc.on('settings:get', (event) => event.returnValue = settings);
	}

	createWindow(options) {
		let window = new BrowserWindow(options);
		let index  = this.windows.push(window) - 1;

		window.on('closed', () => this.windows.splice(index, 1));

		return window;
	}

	downloadImage(event, url) {
		let file = this.imageCache[url];
		if (file) {
			if (file.complete) {
				spawn('xdg-open', [file.path]);
			}

			// Pending downloads intentionally do not proceed
			return;
		}

		let tmpWindow = new BrowserWindow({
			show: false,
			webPreferences: {
				partition: 'persist:skype'
			}
		});

		if (this.settings.ProxyRules) {
			tmpWindow.webContents.session.setProxy({
				proxyRules: this.settings.ProxyRules
			}, () => {});
		}

		tmpWindow.webContents.session.once('will-download', (event, downloadItem) => {
			this.imageCache[url] = file = {
				path: tmp.tmpNameSync() + '.png',
				complete: false
			};
			console.log(file.path);
			downloadItem.setSavePath(file.path);
			downloadItem.once('done', () => {
				tmpWindow.destroy();
				tmpWindow = null;

				spawn('xdg-open', [file.path]);

				file.complete = true;
			});
		});

		tmpWindow.webContents.downloadURL(url);
	}

	openSettings() {
		if (this.settingsWindow) {
			this.settingsWindow.show();
			return;
		}

		this.settingsWindow = this.createWindow({
			autoHideMenuBar: true,
			center: true,
			width: 800,
			height: 370,
			webPreferences: {
				zoomFactor: this.settings.ZoomFactor
			}
		});

		this.settingsWindow.on('closed', function() {
			delete this.settingsWindow;
		});

		let filePath = path.join(__dirname, '..', 'views', 'settings.html');
		this.settingsWindow.loadURL("file://" + filePath);
	}

	saveSettings(event, settings) {
		Object.assign(this.settings, settings);
		this.sendToRenderers('settings:updated', this.settings);

		let data = JSON.stringify(this.settings, null, "\t");
		fs.writeFile(settingsFile, data, (err) => {
			if (err) throw err;

			if (this.settingsWindow) {
				this.settingsWindow.destroy();
				this.settingsWindow = null;
			}
		});
	}

	sendToRenderers(channel, args) {
		this.windows.forEach(window => {
			let webContents = window.webContents;
			webContents.send.apply(webContents, arguments);
		});
	}
}

module.exports = new GhettoSkype(settings);
