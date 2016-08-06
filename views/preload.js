(function() {
	const ipc = require('electron').ipcRenderer;

	// we use this to keep a backup... user can disable notification from settings
	const Notification = window.Notification;

	// use local jquery in this scope
	let $;
	let settings       = ipc.sendSync('settings:get');
	let activityHandle = null;
	let hasActivity    = false;

	if (!settings.EnableNotifications) {
		delete window.Notification;
	}

	ipc.on('status-change', function(event, status) {
		document.querySelector(".PresencePopup-status--" + status).click();
	});

	ipc.on('read-latest-thread', function(event) {
		$('.unseenNotifications:first').closest('.message').get(0).click();
	});

	ipc.on('settings-updated', function(event, settings) {
		if (settings.EnableNotifications) {
			window.Notification = Notification;
		} else {
			delete window.Notification;
		}

		setActivityHandle(settings.RefreshInterval);
	});

	window.addEventListener("DOMContentLoaded", function(event) {
		$ = require('../assets/jquery-2.2.3.min');

		// Hacking the skype hack
		document.addEventListener('click', function(event) {
			var $elem = $(event.target).closest('a.thumbnail');
			if ($elem.length) {
				ipc.sendToHost('open-link', $elem.prop('href'));
			}
		});

		// Every 5 mintues check if user activity
		// If they are not active refresh skype... fixes bug on skype's end
		if (settings.RefreshInterval) {
			setActivityHandle(settings.RefreshInterval);

			$(window).on('mousemove input', function() {
				hasActivity = true;
			});
		}

		// Get an accurate notification count... we can't parse it out of the title
		// because Web Skype has a bug
		let lastCount = 0;
		setInterval(function() {
			// Gets a numeric representation of each thread's unread messages
			let unreadCounters = $('.unseenNotifications').map(function() {
				return Number($(this).find('p').text());
			});

			// Sums them all up
			let count = 0;
			for (let i = 0; i < unreadCounters.length; i++) {
				count += unreadCounters[i];
			}

			// We currently do not have a way to determine who last messaged the user
			// TODO: figure this out by intercepting HTML5 notifications
			if (count > 0 && lastCount !== 0)
				return;

			lastCount = count;
			ipc.sendToHost('notification-count', count);
		}, 500);
	});

	function setActivityHandle(minutes) {
		clearInterval(activityHandle);
		setInterval(checkActivity, minutes * 60000);
	}

	function checkActivity() {
		if (!hasActivity) {
			window.location = window.location;
		}

		hasActivity = false;
	}
}());
