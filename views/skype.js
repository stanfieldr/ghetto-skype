var electron  = require('electron');
var url       = require('url');
var remote    = require('remote');
var TrayIcon  = remote.require('./tray');
var Settings  = electron.ipcRenderer.sendSync('settings:get');

var skypeView = document.getElementById('skype-view');
var title     = document.querySelector('title');

/**
 * If the user has a Microsoft account, we skip the Skype login
 * form and go straight to the Microsoft login page
 */
function checkMicrosoftAccount(currentURL) {
	if (!Settings.MicrosoftAccount) return;

	if (currentURL.hostname === "login.skype.com" && currentURL.query.client_id) {
		let oathURL = [
			"https://login.skype.com/login/oauth/microsoft?mssso=1&client_id=",
			currentURL.query.client_id,
			"&redirect_uri=https://web.skype.com/"
		].join('');

		skypeView.loadURL(oathURL);
		return;
	}
}

/**
 * Decides if the user has any unread notifications and
 * provides the appropriate feedback to the tray icon
 */
function checkTrayIcon(title) {
	let result = /^\((\d+)\)/.exec(title);

	if (result !== null && result.length === 2) {
		TrayIcon.setNotificationCount(Number(result[1]));
	} else {
		TrayIcon.setNotificationCount(0);
	}
}

skypeView.addEventListener('dom-ready', function boot() {
	skypeView.removeEventListener('dom-ready', boot);

	if (Settings.ProxyRules) {
		skypeView.getWebContents().session.setProxy({
			proxyRules: Settings.ProxyRules
		}, () => {});
	}

	skypeView.loadURL('https://web.skype.com/en', {
		userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2486.0 Safari/537.36 Edge/13.10586'
	});

});

skypeView.addEventListener('did-navigate', function() {
	// For some reason, electron resets the zoom level for each page...
	skypeView.setZoomFactor(Settings.ZoomFactor);
});

skypeView.addEventListener('page-title-updated', function(event) {
	let currentURL = url.parse(skypeView.getURL(), true);

	title.innerHTML = event.title;

	checkMicrosoftAccount(currentURL);
	checkTrayIcon(event.title);
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
