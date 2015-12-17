RH.Application = (function() {
	'use strict';
	var Game = RH.Game;
	var EventManager = RH.EventManager;

	function Application() {
		this.eventManager = new EventManager();
		this.game = null;
	}
 Application.prototype = {
		quickGame : function() {
			if(this.game){
				this.game.stop();
			}
			var notes = RH.RhythmPatterns.generateNotes(0, 0, 50);
			var options = new RH.GameOptions();
			var measures = Game.generateMeasures(options, notes);
			this.game = new Game(this.eventManager, measures);
			this.game.start();
		},
		onEvent : function(isUp, event) {
			if (isUp) {
				this.eventManager.onUp(event);
			} else {
				this.eventManager.onDown(event);
			}
			if (event.keyCode == 27) { // escape key maps to keycode `27`
				this.stopGame();
			}
			// Only prevent when a game is on
			// Don't prevent from calling ctrl + U or ctrl + shift + J etc...
			if (!event.ctrlKey && this.game) {
				event.preventDefault();
			}
		},
		stopGame : function() {
			if (this.game) {
				this.game.stop();
			}
			this.game = null;
		}
	};
	return Application;
}());

$(document).ready(function() {
	'use strict';

	var difficultyValues = RH.createSuiteArray(1, RH.RhythmPatterns.MAX_DIFFICULTY + 1);
	var timeSignaturesValues = Object.keys(RH.TS).map(function(key){return RH.TS[key].toString();});
	RH.Parameters = {
		model : {
			beginnerMode : ko.observable(true),
			soundOn : ko.observable(true),
			difficultyValues : difficultyValues,
			difficulty : ko.observable(1),
			timeSignaturesValues:timeSignaturesValues,
			timeSignatures : ko.observable([ RH.TS.FOUR_FOUR.toString() ]),
			tempiValues : [60,90,120,150,180],
			tempi: ko.observable([ 60]),
			scrollingDirection : ko.observable("horizontal"),			
			scrollingMode : ko.observable("continuous")
		}
	};
	ko.applyBindings(RH.Parameters.model);

	var application = new RH.Application();

	var onDown = function(event) {
		application.onEvent(false, event);
	};
	var onUp = function(event) {
		application.onEvent(true, event);
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
