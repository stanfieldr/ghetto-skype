(function() {
	const ipc = require('electron').ipcRenderer;

	// we use this to keep a backup... user can disable notification from settings
	const Notification = window.Notification;

	// use local jquery in this scope
	let $;
	let settings = ipc.sendSync('settings:get');
	if (!settings.EnableNotifications) {
		delete window.Notification;
	}

	ipc.on('status-change', function(event, status) {
		document.querySelector(".PresencePopup-status--" + status).click();
	});

	ipc.on('read-latest-thread', function(event) {
		document.querySelector(".recent.message").click();
	});

	ipc.on('settings-updated', function(event, settings) {
		if (settings.EnableNotifications) {
			window.Notification = Notification;
		} else {
			console.log('Before: ', window.Notification);
			delete window.Notification;
			console.log('After: ', window.Notification);
		}
	});

	window.addEventListener("DOMContentLoaded", function(event) {
		$ = require('jquery');

		// Hacking the skype hack
		document.addEventListener('click', function(event) {
			var $elem = $(event.target).closest('a.thumbnail');
			if ($elem.length) {
				ipc.sendToHost('open-link', $elem.prop('href'));
			}
		});
	});
}());
