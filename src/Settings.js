const electron = require('electron');
const fs       = require('fs');
const path     = require('path');

let settings   = null;

exports.init = function() {
	settings = require('./settings.json');
	try {
		let configPath   = this.getSettingsFilePath();
		let userSettings = JSON.parse(fs.readFileSync(configPath));
		Object.assign(settings, userSettings);
	} catch(e){
		console.log('No settings found for this user, you can change settings by right clicking the tray icon.');
	}

	electron.ipcMain.on('get-settings', (e, count) => e.returnValue = settings);
};

exports.getSettingsFilePath = function() {
	return path.join(electron.app.getPath('userData'), 'settings.json');
};

exports.get = function(setting) {
	return settings[setting];
};

exports.set = function(setting, value) {
	settings[setting] = value;
};

exports.save = function() {
	let data    = JSON.stringify(settings, null, "\t");
	let path    = exports.getSettingsFilePath();
	let tmpPath = path + '.tmp';

	return new Promise((resolve, reject) => {
		fs.writeFile(tmpPath, data, (err) => {
			if (err) {
				reject(err);
				return;
			}

			fs.rename(tmpPath, path, (err) => {
				if (err) {
					reject(err);
					return;
				}

				resolve();
			});
		});
	});
};

electron.ipcMain.on('set-settings', (e, value) => {
	settings = value;
	exports.save().then(() => e.sender.send('settings-saved', value));
})
