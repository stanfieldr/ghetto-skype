let electron   = require('electron');
let trayIcon   = null;
let mainWindow = null;

exports.init = function(window) {
	mainWindow = window;
	trayIcon   = new electron.Tray('assets/tray/skype.png');

	trayIcon.on('click', toggleOpen);
	trayIcon.setContextMenu(contextMenu);
}

exports.setNotificationCount = function(count) {
	let image;

	if (count > 0) {
		image = 'assets/tray/skype-1.png';
	} else {
		image = 'assets/tray/skype.png';
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
