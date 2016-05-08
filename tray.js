let electron   = require('electron');
let trayIcon   = null;
let mainWindow = null;
let basePath   = null;

exports.init = function(window) {
	mainWindow = window;
	basePath   = electron.app.getAppPath() + '/assets/tray/';
	trayIcon   = new electron.Tray(`${basePath}skype.png`);

	trayIcon.on('click', toggleOpen);
	trayIcon.setContextMenu(contextMenu);
}

exports.setNotificationCount = function(count) {
	let image = basePath;

	if (count > 0) {
		image += 'skype-1.png';
	} else {
		image += 'skype.png';
	}

	trayIcon.setImage(image);
};

function toggleOpen() {
	if (mainWindow.isVisible())
		mainWindow.hide();
	else
		mainWindow.show();
}

let contextMenu = new electron.Menu.buildFromTemplate([
	{
		label: "Open",
		click: () => mainWindow.show()
	},
	{
		label: "Exit",
		click: function() {
			electron.app.quit();
		}
	}
]);
