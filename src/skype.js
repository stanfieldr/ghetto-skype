(function() {
	const electron = require('electron');
	const ipc      = electron.ipcRenderer;

	let $;
	let activityHandle = null;
	let hasActivity    = false;
	let settings       = electron.ipcRenderer.sendSync('get-settings');
	let _mode          = 'normal';

	ipc.on('status-change', (e, status) => {
		document.querySelector(".PresencePopup-status--" + status).click();
	});

	function alternativeEnter() {
		// hack to intercept sending message
		var tmp = $('#chatInputAreaWithQuotes').val();
		$('#chatInputAreaWithQuotes').val('');
		$('#chatInputAreaWithQuotes').trigger('blur');
		setTimeout(function() {
			$('#chatInputAreaWithQuotes').focus();
			$('#chatInputAreaWithQuotes').val(tmp + "\n");
			$('#chatInputAreaWithQuotes').blur();
			$('#chatInputAreaWithQuotes').focus();
		}, 0);
	}

	function interceptKeys(event) {
		if (settings.AltSendKeys && event.key === "Enter" && event.target.id === "chatInputAreaWithQuotes") {
			if (event.ctrlKey) {
				$('.send-button').click();
			} else {
				alternativeEnter();
			}
		}
		// 
		// if (_mode === 'normal' && event.key === "i" && ['textarea', 'input'].indexOf(event.target.type) === -1) {
		// 	updateMode('insert');
		// 	event.preventDefault();
		// 	return;
		// }

		if (_mode === 'normal') {
			// switch (event.key) {
			// 	case 'j':
			// }
		}

		if (event.key === "Escape") {
			event.target.blur();
			updateMode('normal');
			event.stopImmediatePropagation();
			return;
		}
	}

	function updateMode(mode) {
		_mode = mode;
		$('.ghetto.mode').html(mode);

		if (mode === 'insert') {
			document.getElementById('chatInputAreaWithQuotes').focus();
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
		document.body.classList.add('ghetto');
		ipc.send('load-theme');

		// Stop executing JavaScript if they are not logged in
		if (!document.getElementById('chatInputAreaWithQuotes')) {
			setTimeout(domLoaded, 1000);
			return;
		}

		$ = require('./assets/jquery-2.2.3.min');
		const spellcheck = require('electron-spellchecker');
		let chatInput = document.getElementById('chatInputAreaWithQuotes');
		let spellCheckHandler   = new spellcheck.SpellCheckHandler();
		let contextMenuBuilder  = new spellcheck.ContextMenuBuilder(spellCheckHandler);
		let contextMenuListener = new spellcheck.ContextMenuListener((info) => {
			contextMenuBuilder.showPopupMenu(info);
		});

		window.addEventListener('keydown', interceptKeys, true);
		window.addEventListener('focus', function(event) {
			if (event.originalEvent !== null) {
				chatInput.focus();
			}
		});

		chatInput.addEventListener('focus', function(event) {
			if (event.originalEvent !== null) {
				updateMode('insert');
			}
		});

		chatInput.addEventListener('blur', function(event) {
			if (event.originalEvent !== null) {
				updateMode('normal');
			}
		});

		window.addEventListener('beforeunload', function() {
			spellCheckHandler.unsubscribe();
			contextMenuListener.unsubscribe();
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

		document.body.appendChild($('<div class="ghetto mode">normal</div>').get(0));
	});

}())
