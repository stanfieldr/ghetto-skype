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
	skypeView.setAudioMuted(Settings.Mute);
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
		electron.ipcRenderer.send('log', 'setting proxy: ' + Settings.ProxyRules);
		skypeView.getWebContents().session.setProxy({
			proxyRules: Settings.ProxyRules
		}, () => {});
	}

	skypeView.loadURL('https://web.skype.com/en');
	skypeView.setAudioMuted(Settings.Mute);

	// skypeView.openDevTools();
}

function loadTheme(theme) {
	let folder = path.join(__dirname, '..', 'themes', theme);
	let p = path.join(folder, 'skype.styl');
	fs.readFile(p, 'utf8', (err, styl) => {
		stylus(styl)
			.include(folder)
			.render((err, css) => skypeView.insertCSS(css));
	});
}

function setUserStatus(status) {
	if (status == "busy") // some aliases for user statuses
		status = "dnd";
	if (status == "away")
		status = "idle";

	// default to idle if status not found
	if (status != "online" && status != "idle" && status != "dnd" && status != "hidden")
		status = "idle";

	skypeView.executeJavaScript('document.querySelector(".PresencePopup-status--' + status + '").click()');
}

electron.ipcRenderer.on("status-change", function(event, status) {
	setUserStatus(status);
});

skypeView.addEventListener('did-fail-load', function(event) {
	if (event.errorCode === -106) {
		electron.ipcRenderer.send('log', 'Connection Unavailable');
		setTimeout(boot, 2500);
		return;
	}

	electron.ipcRenderer.send('log', 'Failed to load: ' + JSON.stringify(event));
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

	// Skype added some weird window.open hack. For what reason, who knows.
	// Could probably fix this upstream in electron, but this is a temp solution
	if (event.url === 'https://web.skype.com/en/undefined') {
		event.preventDefault();
		return;
	}

	if (Settings.NativeImageViewer && event.url.indexOf('imgpsh_fullsize') >= 0) {
		electron.ipcRenderer.send('image:download', event.url);
	} else if (protocol === 'http:' || protocol === 'https:') {
		// Open links in external browser
		electron.shell.openExternal(event.url);
	}
});
