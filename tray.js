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

function open() {
	mainWindow.focus();
}

let contextMenu = new electron.Menu.buildFromTemplate([
	{
		label: "Open",
		click: open
	},
	{
		label: "Exit",
		click: function() {
			app.quit();
		}
	}
]);

trayIcon.on('click', open);
trayIcon.setContextMenu(contextMenu);
