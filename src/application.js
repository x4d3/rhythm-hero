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
		this.game  = null;
	}

	Application.prototype = {
		quickGame : function() {
			var tempo = getParameterByName('tempo');
			var ts = getParameterByName('ts');
			var debugMode = getParameterByName('debug');
			var parsedDebugMode = debugMode === 'true';
			var parsedTempo = tempo ? parseInt(tempo, 10) : null;
			var parsedTS = ts ? RH.TimeSignature.parse(ts) : null;
			if (parsedDebugMode) {
				RH.debug();
			}
			this.game = new Game(this.eventManager, new RH.GameOptions(parsedTS, parsedTempo));
			this.game.start();
		},
		onEscape : function(){
			if (this.game){
				this.game.stop();
			}
		}
	};
	return Application;
}());

$(document).ready(function() {
	'use strict';
	var application = new RH.Application();
	var onEvent = function(isUp, event) {
		if (isUp) {
			application.eventManager.onUp(event);
		} else {
			application.eventManager.onDown(event);
		}
		if (event.keyCode == 27) { // escape key maps to keycode `27`
			application.onEscape();
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

	$('.quick-game').on('click touchstart', function(e) {
		application.quickGame();
	});

	$('.campaign').on('click touchstart', function(e) {
		application.quickGame();
	});

	$(window).blur(function() {
		// If the application loose the focuse, we consider that the user is not pressing any key
		application.eventManager.resetKeyPressed();
	});
	$('body').removeClass('loading');
});
