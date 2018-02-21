const electron = require('electron');
const fs       = require('fs');
const path     = require('path');
const readline = require('readline');

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

exports.noHardwareAcceleration = function() {
    var nhardwareAcceleration = false;
    var fl = '/etc/applications/ghetto-skype.cfg';
    if (fs.existsSync(fl)) {
        console.log("start");
        var ordissimo_version = process.env['ORDISSIMO_VERSION'];
        fs.readFileSync(fl).toString().split("\n").forEach(function(line, index, arr) {
            if (index === arr.length - 1 && line === "") { return; }
            console.log(index + " " + line);
            str = line.replace(/[\r\n]/g, '').trim();
            if ( ordissimo_version === str )
                nhardwareAcceleration = true;

        });
        console.log("end");
    }
    return nhardwareAcceleration;
};

electron.ipcMain.on('set-settings', (e, value) => {
	settings = value;
	exports.save().then(() => e.sender.send('settings-saved', value));
})

