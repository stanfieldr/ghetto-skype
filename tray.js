let electron   = require('electron');
let trayIcon   = new electron.Tray('./skype.png');
let mainWindow = null;

exports.setMainWindow = function(window) {
	mainWindow = window;
}

exports.setNotificationCount = function(count) {
	let image;

	if (count > 0) {
		image = './skype-1.png';
	} else {
		image = './skype.png';
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
		click: () => mainWindow.focus()
	},
	{
		label: "Exit",
		click: function() {
			electron.app.quit();
		}
	}
]);

trayIcon.on('click', toggleOpen);
trayIcon.setContextMenu(contextMenu);
