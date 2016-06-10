var electron  = require('electron');

var stylus = require('stylus');
var fs     = require('fs');
var path   = require('path');

var url       = require('url');
var TrayIcon  = electron.remote.require('../app/tray');
var Settings  = electron.ipcRenderer.sendSync('settings:get');

var skypeView = document.getElementById('skype-view');
var title     = document.querySelector('title');

electron.ipcRenderer.on('settings:updated', function(event, settings) {
	Settings = settings;
});

/**
 * If the user has a Microsoft account, we skip the Skype login
 * form and go straight to the Microsoft login page
 */
function checkMicrosoftAccount(event, currentURL) {
	if (!Settings.MicrosoftAccount) return;

	if (currentURL.hostname === "login.skype.com" && currentURL.query.client_id) {
		let oathURL = [
			"https://login.skype.com/login/oauth/microsoft?mssso=1&client_id=",
			currentURL.query.client_id,
			"&redirect_uri=https://web.skype.com/"
		].join('');

		skypeView.loadURL(oathURL);
	}
}

/**
 * Decides if the user has any unread notifications and
 * provides the appropriate feedback to the tray icon
 */
function checkTrayIcon(event) {
	let result = /^\((\d+)\)/.exec(event.title);
	let count  = 0;

	if (result !== null && result.length === 2) {
		count = Number(result[1]);
	}

	TrayIcon.setNotificationCount(count);
}

function boot() {
	skypeView.removeEventListener('dom-ready', boot);

	if (Settings.ProxyRules) {
		skypeView.getWebContents().session.setProxy({
			proxyRules: Settings.ProxyRules
		}, () => {});
	}

	skypeView.loadURL('https://web.skype.com/en');

	// skypeView.openDevTools();
}

function loadTheme(theme) {
	let folder = path.join(__dirname, '..', 'themes', theme);
	let p = path.join(folder, 'skype.styl');
	fs.readFile(p, 'utf8', (err, scss) => {
		stylus(scss)
			.include(folder)
			.render((err, css) => skypeView.insertCSS(css));
	});
}

skypeView.addEventListener('did-fail-load', function(event) {
	// We are not interested in redirects, only failures
	if (event.errorCode === -3) {
		return;
	}

	setTimeout(boot, 2500);
});

skypeView.addEventListener('dom-ready', boot);

skypeView.addEventListener('did-navigate', function(event) {
	// For some reason, electron resets the zoom level for each page...
	skypeView.setZoomFactor(Settings.ZoomFactor);
	if (Settings.Theme && event.url.indexOf('https://web.skype.com') >= 0)
		loadTheme(Settings.Theme);
});

skypeView.addEventListener('page-title-updated', function(event) {
	let currentURL = url.parse(skypeView.getURL(), true);

	title.innerHTML = event.title;

	checkMicrosoftAccount(event, currentURL);
	checkTrayIcon(event);
});

skypeView.addEventListener('new-window', function(event) {
	let protocol = url.parse(event.url).protocol;

	if (Settings.NativeImageViewer && event.url.indexOf('imgpsh_fullsize') >= 0) {
		electron.ipcRenderer.send('image:download', event.url);
	} else if (protocol === 'http:' || protocol === 'https:') {
		// Open links in external browser
		electron.shell.openExternal(event.url);
	}
});
