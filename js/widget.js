(function widgetFacelink() {
	var config = FACELINK_WIDGET_CONFIG;
	var serviceHost = 'https://facelink.cc';

	(function init() {
		var request = new XMLHttpRequest();
		var url = serviceHost + '/ucp/widget/' + config.page + '/';

		request.open('GET', url, true);
		request.onload = function (e) {
			if (request.readyState === 4) {
				if (request.status === 200) {
					var data = JSON.parse(request.responseText);
					if (!data.error) {
						updateConfig(data);
						createWidget();
					} else console.error(data.error);
				} else console.error(request.statusText);
			}
		};
		request.onerror = function(e){
			console.error(request.statusText);
		};
		request.send(null);
	})();

	function updateConfig(data) {
		for (var prop in data) {
			if (prop == 'config') {
				for (var p in data.config) {
					if (config[p] === undefined) config[p] = data.config[p];
				}
			} else if (!config[prop]) config[prop] = data[prop];
		}
	}

	function createWidget() {
		var delay = parseInt(config.delay);
		if (!delay || isNaN(delay) || !isFinite(delay)) delay = 0;
		setTimeout(function() {
			appendStyles();
			createWidgetElements();
			fillWidgetContent();
			openWidgetOnInit();
		}, delay * 1000);
	}

	function openWidgetOnInit() {
		if (!readFacelinkCookie('facelink-widget-closed') || (window.location.origin === serviceHost)) {
			if ((config['open-on-init'] === 'true') && (window.innerWidth > 600)) {
				showFaceLinkWidget();
			} else if ((config['open-on-init-mobile'] === 'true') && window.innerWidth <= 600) {
				showFaceLinkWidget();
			}
		}
	}

	function fillWidgetContent() {
		var button = document.querySelector('.facelink-widget-toggle button');
		if (button) {
			if (config.color) {
				if (config.color2) {
					button.style.backgroundImage = 'linear-gradient(149deg, ' + config.color + ', ' + config.color2 + ')';
				} else {
					button.style.backgroundColor = config.color;
				}
			}
			button.innerHTML =
				'<div class="facelink-widget-toggle-video">' +
				'<span class="facelink-video-overlay"></span>' +
				'<video autoplay muted preload="auto" playsinline loop src="' + config.video + '" />' +
				'</div>' +
				'<span class="facelink-widget-caption">' + config.text + '</span>' +
				'<div class="facelink-widget-hide"></div>';
			document.querySelector('.facelink-widget-toggle-video video').addEventListener('canplaythrough', function () {
				document.querySelector('.facelink-widget-toggle').classList.add('facelink-widget-ready');
				this.play();
			});
			document.querySelector('.facelink-widget-toggle .facelink-widget-hide').addEventListener('click', function (event) {
				event.stopPropagation();
				var el = document.querySelector('.facelink-widget-toggle');
				el.parentNode.removeChild(el);
				createFacelinkCookie('facelink-widget-hidden', 'hidden', 30);
			});
			button.addEventListener('click', showFaceLinkWidget);
		}
	}

	function showFaceLinkWidget() {
		var protocol = (window.location.protocol) ? window.location.protocol : document.location.protocol;
		if (protocol === 'https:') {
			var cont = document.querySelector('.facelink-widget-content');
			var link = serviceHost + '/' + config.page + '/';
			cont.classList.add('facelink-widget-active');
			cont.innerHTML = '<div class="facelink-widget-content-in">' +
				'<button type="button" class="facelink-widget-close"></button>' +
				'<iframe src="' + link + '" allow="camera; microphone; autoplay; encrypted-media;" width="100%" height="100%" />' +
				'</div>';
			document.querySelector('.facelink-widget-toggle').classList.add('facelink-widget-toggle-hidden');
			document.querySelector('.facelink-widget-close').addEventListener('click', function () {
				var el = document.querySelector('.facelink-widget-content');
				el.classList.remove('facelink-widget-active');
				el.innerHTML = '';
				document.querySelector('.facelink-widget-toggle').classList.remove('facelink-widget-toggle-hidden');
				createFacelinkCookie('facelink-widget-closed', 'closed', 60);
			});
		} else window.open(config.link);
	}

	window.showFaceLinkWidget = showFaceLinkWidget;


	function appendStyles() {
		var el = document.createElement("link");
		el.rel = "stylesheet";
		el.href = serviceHost + "../css/widget.css";
		el.type = "text/css";
		document.querySelector('head').appendChild(el);
	}

	function createWidgetElements() {
		if (config.type != 'invisible') {
			var el = document.createElement('div');
			el.classList.add('facelink-widget-toggle');
			if (config.type) el.classList.add('facelink-widget-type-' + config.type);
			if (config.position) el.classList.add('facelink-widget-position-' + config.position);
			var button = document.createElement('button');
			button.type = 'button';
			el.appendChild(button);
			document.querySelector('body').appendChild(el);
			widgetViewed();
		}

		el = document.createElement('div');
		el.classList.add('facelink-widget-content');
		if (config.position) el.classList.add('facelink-widget-position-' + config.position);
		document.querySelector('body').appendChild(el);
	}


	function widgetViewed() {
		if (config.id && (window.location.origin !== serviceHost)) {
			if (!readFacelinkCookie(config.id)) {
				var request = new XMLHttpRequest();
				request.open('GET', serviceHost + '/udata://ucp/widgetViewed?page=' + config.id, true);
				request.send(null);
				createFacelinkCookie(config.id, true, 600);
			}
		}
	}


	function createFacelinkCookie(name, value, minutes) {
		if (minutes) {
			var date = new Date();
			date.setTime(date.getTime() + (minutes * 60 * 1000));
			var expires = "; expires=" + date.toGMTString();
		} else var expires = "";
		document.cookie = name + "=" + value + expires + "; path=/";
	}

	function readFacelinkCookie(name) {
		var nameEQ = name + "=";
		var ca = document.cookie.split(';');
		for (var i = 0; i < ca.length; i++) {
			var c = ca[i];
			while (c.charAt(0) == ' ') c = c.substring(1, c.length);
			if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
		}
		return false;
	}


})();