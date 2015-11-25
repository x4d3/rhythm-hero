RH.Application = (function() {
	'use strict';
	var Game = RH.Game;
	var EventManager = RH.EventManager;

	function getParameterByName(name) {
		name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
		var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"), results = regex.exec(location.search);
		return results === null ? null : decodeURIComponent(results[1].replace(/\+/g, " "));
	}

	function Application(canvas) {
		this.canvas = canvas;
		this.eventManager = new EventManager();
	}

	Application.prototype = {
		getEventManager : function() {
			return this.eventManager;
		},
		start : function() {
			var tempo = getParameterByName('tempo');
			var ts = getParameterByName('ts');
			var debugMode = getParameterByName('debug');
			var parsedDebugMode = debugMode === 'true';
			var parsedTempo = tempo ? parseInt(tempo, 10) : null;
			var parsedTS = ts ? RH.TimeSignature.parse(ts) : null;
			if (parsedDebugMode) {
				RH.debug();
			}
			var game = new Game(this.eventManager, this.canvas, new RH.GameOptions(parsedTS, parsedTempo));
			(function animloop() {
				var isOn = game.update();
				if (isOn) {
					requestAnimFrame(animloop);
				}
			})();

		}
	};
	return Application;
}());

$(document).ready(function() {
	'use strict';
	var canvas = $("canvas#application");
	if (canvas.length) {
		var application = new RH.Application(canvas[0]);
		var onEvent = function(isUp, event) {
			if (isUp) {
				application.getEventManager().onUp(event);
			} else {
				application.getEventManager().onDown(event);
			}
			// Don't prevent from calling ctrl + U or ctrl + shift + J etc...
			if (!event.ctrlKey) {
				event.preventDefault();
			}
		};

		var onDown = function(event) {
			onEvent(false, event);
		};
		var onUp = function(event) {
			onEvent(true, event);
		};
		canvas.on('touchstart mousedown', onDown);
		canvas.on('touchend mouseup touchcancel', onUp);

		$("body").keydown(onDown).keyup(onUp);

		$(window).blur(function() {
			// If the application loose the focuse, we consider that the user is not pressing any key
			application.getEventManager().resetKeyPressed();
		});
		application.start();

		var switchSound = $(".switch-sound");
		switchSound.click(function() {
			var isOn = RH.SoundsManager.switchSound();
			switchSound.toggleClass('off', !isOn);
		});

		$('body').removeClass('loading');
	}
});
