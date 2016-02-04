RH.Application = (function() {
	'use strict';
	var Game = RH.Game;
	var LevelManager = RH.LevelManager;
	var RhythmPatterns = RH.RhythmPatterns;
	var GameOptions = RH.GameOptions;
	var TimeSignature = RH.TimeSignature;
	var EndGameScreen = RH.EndGameScreen;
	var logger = RH.logManager.getLogger('Application');

	function Application(canvas) {
		this.canvas = canvas;
		this.screen = null;
		this.N = false;
	}

	Application.prototype = {
		startAnimation: function() {
			if (this.isAnimating) {
				return;
			}
			var app = this;
			(function animloop() {
				if (app.screen === null) {
					app.isAnimating = false;
				} else {
					app.screen.update();
					requestAnimFrame(animloop);
				}
			})();
		},
		quickGame: function() {
			this.stop();
			var Parameters = RH.Parameters;
			var app = this;
			Parameters.model.displayCanvas(true);
			Parameters.model.beginnerModeEnabled(true);
			var timeSignatures = Parameters.model.timeSignatures().map(TimeSignature.parse);
			var tempi = Parameters.model.tempi();
			var maxDifficulty = Parameters.model.difficulty();
			var options = new GameOptions(timeSignatures, tempi, maxDifficulty);
			var notes = RhythmPatterns.generateNotes(0, maxDifficulty, 50);
			var measures = RhythmPatterns.generateMeasures(options, notes);
			var endGameCallback = function(game) {
				Parameters.model.displayCanvas(false);
				$('.result').append(game.renderScore());
				app.screen = null;
			};
			var withLife = Parameters.model.withLife();
			this.screen = new Game(measures, "Practice Mode - Difficulty: " + maxDifficulty, this.canvas, withLife, endGameCallback);
			this.startAnimation();
		},
		campaign: function(currentLevel) {
			this.stop();
			var Parameters = RH.Parameters;
			var app = this;
			Parameters.model.displayCanvas(true);
			Parameters.model.beginnerModeEnabled(false);
			var endLevelCallback = null;
			var nextLevelCallback = function() {
				var level = LevelManager.getLevel(currentLevel);
				app.screen = new Game(level.measures, level.description, app.canvas, true, endLevelCallback);
			};
			endLevelCallback = function(game) {
				if (!game.scoreCalculator.hasLost()) {
					if (currentLevel > Parameters.model.maxLevelObtained()) {
						Parameters.model.maxLevelObtained(currentLevel);
					}
					currentLevel++;
				}
				app.screen = new EndGameScreen(app.canvas, game, nextLevelCallback);

			};
			nextLevelCallback();
			this.startAnimation();
		},
		resetKeyPressed: function() {
			if (this.screen !== null && this.screen.resetKeyPressed) {
				this.screen.resetKeyPressed();
			}
		},
		onEvent: function(isUp, event) {
			if (this.screen !== null) {
				this.screen.onEvent(isUp, event);
			}
			if (event.keyCode == 27) { // escape key maps to keycode `27`
				this.stop();
			}
			// Only prevent when a game is on
			// Don't prevent from calling ctrl + U or ctrl + shift + J etc...
			if (!event.ctrlKey && this.screen !== null) {
				event.preventDefault();
			}
		},
		stop: function() {
			this.screen = null;
			RH.Parameters.model.displayCanvas(false);
		}
	};
	return Application;
}());

$(document).ready(function() {
	'use strict';

	var getParameterByName = function(name) {
		name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
		var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
			results = regex.exec(location.search);
		return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
	};
	if ("true" === getParameterByName("debug")) {
		RH.debug();
	}

	var application = new RH.Application($("canvas.application")[0]);

	var difficultyValues = RH.createSuiteArray(1, RH.RhythmPatterns.MAX_DIFFICULTY + 1);
	var timeSignaturesValues = Object.keys(RH.TS).map(function(key) {
		return RH.TS[key].toString();
	});
	var model = {
		version: ko.observable(RH.getVersion()),
		beginnerMode: ko.observable(true, {
			persist: 'RH.beginnerMode'
		}),
		withLife: ko.observable(false, {
			persist: 'RH.withLife'
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
		maxLevelObtained: ko.observable(-1, {
			persist: 'RH.maxLevelObtained'
		}),
		displayCanvas: ko.observable(false),
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
		application.resetKeyPressed();
	});

	var level = getParameterByName("level");
	if (RH.isDebug && level) {
		application.campaign(parseInt(level, 10));
	}

	$('body').removeClass('loading');
});