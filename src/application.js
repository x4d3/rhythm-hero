RH.Application = (function() {
	'use strict';
	var Game = RH.Game;
	var EventManager = RH.EventManager;

	function Application(canvas) {
		this.canvas = canvas;
		this.eventManager = new EventManager();
		this.game = null;
	}
	Application.prototype = {
		quickGame: function() {
			if (this.game) {
				this.game.stop();
			}
			var options = new RH.GameOptions(timeSignatures, tempi, maxDifficulty);

			RH.Parameters.model.beginnerModeEnabled(true);
			var timeSignatures = RH.Parameters.model.timeSignatures().map(RH.TimeSignature.parse);
			var tempi = RH.Parameters.model.tempi();
			var maxDifficulty = RH.Parameters.model.difficulty();
			var notes = RH.RhythmPatterns.generateNotes(0, maxDifficulty, 50);
			var measures = Game.generateMeasures(options, notes);
			var endGameCallback = function(game) {
				$('.result').append(game.renderScore(this.scoreCalculator));
			};
			this.game = new Game(this.eventManager, measures, this.canvas, false, endGameCallback);
			this.game.start();
		},
		campaign: function(currentLevel) {
			var app = this;
			if (this.game) {
				this.game.stop(true);
			}
			RH.Parameters.model.beginnerModeEnabled(false);

			var timeSignatures = RH.Parameters.model.timeSignatures().map(RH.TimeSignature.parse);
			var tempi = RH.Parameters.model.tempi();
			var maxDifficulty = RH.Parameters.model.difficulty();
			var notes = RH.RhythmPatterns.generateNotes(0, maxDifficulty, 50);
			var measures = Game.generateMeasures(level.options, level.notes);
			var callback = function(previousGame) {
				if(previousGame !== null){
					if (previousGame.isFinished()){
						//display win
						currentLevel++;
						if (currentLevel > RH.Parameters.model.maxLevelObtained()){
							RH.Parameters.model.maxLevelObtained(currentLevel);
						}
					}else{
						//display louse
					}

				}
				app.game = new Game(app.eventManager, measures, app.canvas, true, callback);
				app.game.start();
			};
			callback(null);

		},

		onEvent: function(isUp, event) {
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
		stopGame: function() {
			if (this.game) {
				this.game.stop(true);
			}
			this.game = null;
		}
	};
	return Application;
}());

$(document).ready(function() {
	'use strict';

	var application = new RH.Application($("canvas.application")[0]);

	var difficultyValues = RH.createSuiteArray(1, RH.RhythmPatterns.MAX_DIFFICULTY + 1);
	var timeSignaturesValues = Object.keys(RH.TS).map(function(key) {
		return RH.TS[key].toString();
	});
	var model = {
		beginnerMode: ko.observable(true, {
			persist: 'RH.beginnerMode'
		}),
		toggleBeginnerMode: function() {
			model.beginnerMode(!model.beginnerMode());
		},
		soundsOn: ko.observable(true, {
			persist: 'RH.soundsOn'
		}),
		toggleSoundsOn: function() {
			model.soundsOn(!model.soundsOn());
		},
		difficultyValues: difficultyValues,
		difficulty: ko.observable(1, {
			persist: 'RH.difficulty'
		}),
		timeSignaturesValues: timeSignaturesValues,
		timeSignatures: ko.observable([RH.TS.FOUR_FOUR.toString()], {
			persist: 'RH.timeSignatures'
		}),
		tempiValues: [60, 90, 120, 150, 180],
		tempi: ko.observable([60], {
			persist: 'RH.tempi'
		}),
		scrollingDirection: ko.observable("horizontal", {
			persist: 'RH.scrollingDirection'
		}),
		scrollingMode: ko.observable("continuous", {
			persist: 'RH.scrollingMode'
		}),
		maxLevelObtained: ko.observable(0, {
			persist: 'RH.maxLevelObtained'
		}),
		gameOn: ko.observable(false),
		beginnerModeEnabled: ko.observable(true),
	};

	ko.applyBindings(model);
	RH.Parameters = {
		model: model,
		isBeginnerMode: function() {
			return model.beginnerModeEnabled() && model.beginnerMode();
		}
	};



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
		application.campaign(RH.Parameters.model.maxLevelObtained() + 1);
	});

	$(window).blur(function() {
		// If the application loose the focuse, we consider that the user is not pressing any key
		application.eventManager.resetKeyPressed();
	});
	$('body').removeClass('loading');
});