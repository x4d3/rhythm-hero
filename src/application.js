RH.Application = (function() {
	'use strict';
	var Game = RH.Game;
	var EventManager = RH.EventManager;

	function getParameterByName(name) {
		name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
		var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"), results = regex.exec(location.search);
		return results === null ? null : decodeURIComponent(results[1].replace(/\+/g, " "));
	}

	function Application() {
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
			var game = new Game(this.eventManager, new RH.GameOptions(parsedTS, parsedTempo));
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
	var application = new RH.Application();
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
	$("body").on('touchstart mousedown', onDown);
	$("body").on('touchend mouseup touchcancel', onUp);
	$("body").keydown(onDown).keyup(onUp);

	$(window).blur(function() {
		// If the application loose the focuse, we consider that the user is not pressing any key
		application.getEventManager().resetKeyPressed();
	});
	application.start();
	$('body').removeClass('loading');
});
