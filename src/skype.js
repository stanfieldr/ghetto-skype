(function() {
	const electron = require('electron');
	const ipc      = electron.ipcRenderer;

	let $;
	let activityHandle = null;
	let hasActivity    = false;
	let settings       = electron.ipcRenderer.sendSync('get-settings');

	ipc.on('status-change', (e, status) => {
		document.querySelector(".PresencePopup-status--" + status).click();
	});

	function interceptEnterKey(event) {
		if (settings.AltSendKeys && event.keyCode === 13 && event.target.id === "chatInputAreaWithQuotes") {
			if (event.ctrlKey) {
				$('.send').click();
			} else {
				// hack to intercept sending message
				var tmp = $('#chatInputAreaWithQuotes').val();
				$('#chatInputAreaWithQuotes').val('');
				$('#chatInputAreaWithQuotes').trigger('blur');
				setTimeout(function() {
					$('#chatInputAreaWithQuotes').focus();
					$('#chatInputAreaWithQuotes').val(tmp + "\n");
					$('#chatInputAreaWithQuotes').trigger('blur');
					$('#chatInputAreaWithQuotes').focus();
				}, 0);
			}
		}
	}

	function startNotificationTicker() {
		let unreadCounters = document.getElementsByClassName('unseenNotifications');
		let sum            = 0;

		for (let i = unreadCounters.length - 1; i >= 0; i--) {
			try {
				sum += Number(unreadCounters[i].querySelector('p').textContent);
			} catch(e) {
				// if we're unlucky, unseenNotifications will be removed during the loop
			}
		}

		electron.ipcRenderer.send('notification-count', sum);

		setTimeout(startNotificationTicker, 1000);
	}

	function setActivityHandle(minutes) {
		clearInterval(activityHandle);
		if (minutes) {
			activityHandle = setInterval(checkActivity, minutes * 60000);
		}
	}

	function checkActivity() {
		if (!hasActivity) {
			window.location = window.location;
		}

		hasActivity = false;
	}

	window.addEventListener("DOMContentLoaded", function domLoaded() {
		// Stop executing JavaScript if they are not logged in
		if (!document.getElementById('chatInputAreaWithQuotes')) {
			setTimeout(domLoaded, 1000);
			return;
		}

		$ = require('./assets/jquery-2.2.3.min');
		const {SpellCheckHandler, ContextMenuListener, ContextMenuBuilder} = require('electron-spellchecker');

		let spellCheckHandler   = new SpellCheckHandler();
		let contextMenuBuilder  = new ContextMenuBuilder(spellCheckHandler);
		let contextMenuListener = new ContextMenuListener((info) => {
			contextMenuBuilder.showPopupMenu(info);
		});

		window.addEventListener('keydown', interceptEnterKey, true);
		window.addEventListener('focus', function(event) {
			document.getElementById('chatInputAreaWithQuotes').focus();
		});

		spellCheckHandler.attachToInput();
		spellCheckHandler.switchLanguage('en-US');

		startNotificationTicker();
		setActivityHandle(settings.RefreshInterval);

		document.addEventListener('mousemove', function() {
			hasActivity = true;
		});

		// Hacking the skype hack
		document.addEventListener('click', function(event) {
			var $elem = $(event.target).closest('a[rel*="noopener"], a.thumbnailHolder');
			if ($elem.length) {
				event.stopImmediatePropagation();
				event.preventDefault();
				ipc.send('open-link', $elem.prop('href'));
			}
		}, true);
	});

}())
