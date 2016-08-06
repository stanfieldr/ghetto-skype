const electron = require('electron');
const fs       = require('fs');
const path     = require('path');
const spawn    = require('child_process').spawn;
const tmp      = require('tmp');
const mime     = require('mime');
const stylus   = require('stylus');

const settings = require('../settings');

const BrowserWindow = electron.BrowserWindow;

let settingsFile = path.join(electron.app.getPath('userData'), 'settings.json');
try {
	let tmpSettings = JSON.parse(fs.readFileSync(settingsFile));
	Object.assign(settings, tmpSettings);
} catch(e){
	console.log('Error', e);
}

class GhettoSkype {
	constructor(settings) {
		this.settings   = settings;
		this.uniqID     = 0;
		this.windows    = {};
		this.imageCache = {};

		const ipc = electron.ipcMain;

		ipc.on('image:download', this.downloadImage.bind(this));
		ipc.on('settings:save', this.saveSettings.bind(this));
		ipc.on('settings:get', (event) => event.returnValue = settings);
		ipc.on('log', (e, message) => console.log(message));
	}

	createWindow(options) {
		let window = new BrowserWindow(options);
		let index  = this.uniqID++;

		this.windows[index] = window;
		window.on('closed', () => delete this.windows[index]);

		return window;
	}

	downloadImage(event, url) {
		let file = this.imageCache[url];
		if (file) {
			if (file.complete) {
				electron.shell.openItem(file.path);
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
				path: tmp.tmpNameSync() + '.' + mime.extension(downloadItem.getMimeType()),
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

	openSettings() {
		if (this.settingsWindow) {
			this.settingsWindow.show();
			this.settingsWindow.focus();
			return;
		}

		this.settingsWindow = this.createWindow({
			autoHideMenuBar: true,
			center: true,
			width: 900,
			height: 625,
			webPreferences: {
				zoomFactor: this.settings.ZoomFactor
			}
		});
		this.settingsWindow.focus();

		if (this.settings.Theme) {
			let folder = path.join(__dirname, '..', 'themes', this.settings.Theme);
			let p = path.join(folder, 'settings.styl');
			fs.readFile(p, 'utf8', (err, scss) => {
				stylus(scss)
					.include(folder)
					.render((err, css) => {
						this.settingsWindow.webContents.once('did-finish-load', () => this.settingsWindow.webContents.insertCSS(css));
					});
			});
		}

		this.settingsWindow.on('closed', () => delete this.settingsWindow);

		let filePath = path.join(__dirname, '..', 'views', 'settings.html');
		this.settingsWindow.loadURL("file://" + filePath);
	}

	saveSettings(event, settings) {
		Object.assign(this.settings, settings);
		this.sendToRenderers('settings:updated', this.settings);

		let data = JSON.stringify(this.settings, null, "\t");
		let tmpFile = settingsFile + '.tmp';

		fs.writeFile(tmpFile, data, (err) => {
			if (err) throw err;

			fs.rename(tmpFile, settingsFile, (err) => {
				if (err) throw err;

				if (this.settingsWindow) {
					this.settingsWindow.destroy();
					this.settingsWindow = null;
				}
			});
		});
	}

	sendToRenderers(channel, args) {
		for (var id in this.windows) {
			let webContents = this.windows[id].webContents;
			webContents.send.apply(webContents, arguments);
		}
	}
}

module.exports = new GhettoSkype(settings);
