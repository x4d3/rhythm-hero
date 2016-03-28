RH.Application = (function() {
	'use strict';
	var Game = RH.Game;
	var LevelManager = RH.LevelManager;
	var RhythmPatterns = RH.RhythmPatterns;
	var TimeSignature = RH.TimeSignature;
	var EndGameScreen = RH.EndGameScreen;
	var logger = RH.logManager.getLogger('Application');

	var DEFAULT_TEMPO = 60;
	var DEFAULT_TS = RH.TS.FOUR_FOUR;

	var ScoreManager = function(type, index) {
		this.type = type;
		this.index = index;
	};

	ScoreManager.prototype = {
		save: function(score) {
			var best = RH.Parameters.getScore(this.type, this.index);
			if (best === undefined || best < score) {
				RH.Parameters.saveScore(this.type, this.index, score);
				this.bestScoreBeaten = true;
				best = score;
			}
			this.best = best;
		}
	};

	function Application(canvas) {
		this.canvas = canvas;
		this.screen = null;
		this.isAnimating = false;
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
			var timeSignature = TimeSignature.parse(Parameters.model.timeSignature());
			var tempo = Parameters.model.tempo();
			var maxDifficulty = Parameters.model.difficulty();
			var notes = RhythmPatterns.generateNotes(0, maxDifficulty, 50);
			var measures = RhythmPatterns.generateMeasures([tempo], [timeSignature], notes);
			var withLife = Parameters.model.withLife();
			var title = "Practice Mode - Difficulty: " + maxDifficulty;
			var canvas = this.canvas;
			var callback = function() {
				var status = this.status;
				if (status === Game.STATUS.SCORE_SCREEN) {
					$('.result').empty();
					$('.result').append(this.renderScore());
				} else if (status === Game.STATUS.FINISHED) {
					Parameters.model.displayCanvas(false);
					app.screen = null;
				}
			};
			var scoreManager = new ScoreManager('practice', maxDifficulty + "#" + tempo);
			this.screen = new Game(measures, title, canvas, withLife, scoreManager, callback);
			this.startAnimation();
		},
		campaign: function(currentLevel) {
			this.stop();
			var Parameters = RH.Parameters;
			var app = this;
			Parameters.model.displayCanvas(true);
			Parameters.model.beginnerModeEnabled(false);
			var setGame = function() {
				var level = LevelManager.getLevel(currentLevel);
				var scoreManager = new ScoreManager('campaign', currentLevel);
				app.screen = new Game(level.measures, level.description, app.canvas, true, scoreManager, callback);
			};
			var callback = function() {
				var status = this.status;
				if (status === Game.STATUS.SCORE_SCREEN) {
					if (!this.scoreCalculator.hasLost()) {
						currentLevel++;
					}
				} else if (status === Game.STATUS.FINISHED) {
					setGame();
				}
			};
			setGame();
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

	Application.DEFAULT_TEMPO = DEFAULT_TEMPO;
	Application.DEFAULT_TS = DEFAULT_TS;

	return Application;
}());

$(document).ready(function() {
	'use strict';
	var DEFAULT_TEMPO = RH.Application.DEFAULT_TEMPO;
	var DEFAULT_TS = RH.Application.DEFAULT_TS;

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
	//If the version changes, we reset the scores
	var previousVersion = localStorage.getItem("RH.version");
	var version = RH.getVersion();
	if (previousVersion !== version && version != "DEV") {
		localStorage.setItem("RH.version", version);
		localStorage.setItem('RH.scores', []);
	}

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
		timeSignature: ko.observable(DEFAULT_TS.toString(), {
			persist: 'RH.timeSignature'
		}),
		tempiValues: [60, 90, 120, 150, 180],
		tempo: ko.observable(DEFAULT_TEMPO, {
			persist: 'RH.tempo'
		}),
		scrollingDirection: ko.observable("horizontal", {
			persist: 'RH.scrollingDirection'
		}),
		scrollingMode: ko.observable("continuous", {
			persist: 'RH.scrollingMode'
		}),
		displayCanvas: ko.observable(false),
		beginnerModeEnabled: ko.observable(true),
		scores: ko.observable({
			campaign: [],
			practice: {}
		}, {
			persist: 'RH.scores'
		}),
		resetScores: function() {
			bootbox.confirm("Are you sure you want to reset all your scores ?", function(result) {
				if (result) {
					model.scores({
						campaign: [],
						practice: {}
					});
				}
			});
		},
		startPractice: function() {
			initAudio(function() {
				application.quickGame();
			});

		},
		startCampaign: function() {
			initAudio(function() {
				application.campaign(model.scores().campaign.length);
			});
		},
		startLevel: function(score) {
			initAudio(function() {
				application.campaign(score.index);
			});
		},
		close: function() {
			application.stop();
		}
	};
	model.campaignScoresDisplay = ko.computed(function() {
		return model.scores().campaign.map(function(score, index) {
			return {
				description: RH.LevelManager.getLevel(index).description,
				score: RH.ScoreScreen.formatTotal(score),
				index: index
			};
		});
	});

	model.practiceScoresDisplay = ko.computed(function() {
		return RH.map(model.scores().practice, function(score, key, index) {
			var split = key.split('#');
			return {
				description: 'Difficulty: ' + split[0] + ' Tempo:' + split[1],
				score: RH.ScoreScreen.formatTotal(score),
				index: index
			};
		});
	});
	ko.applyBindings(model);
	RH.Parameters = {
		model: model,
		isBeginnerMode: function() {
			return model.beginnerModeEnabled() && model.beginnerMode();
		},
		getScore : function(type, index){
			return model.scores()[type][index];
		},
		/**
		 * save the score if it is the best
		 * @return the current Best Score
		 */
		saveScore: function(type, index, score) {
			var scores = model.scores();
			scores[type][index] = score;
			model.scores(scores);
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

	$(window).blur(function() {
		// If the application loose the focuse, we consider that the user is not pressing any key
		application.resetKeyPressed();
	});

	var level = getParameterByName("level");
	if (RH.isDebug && level) {
		initAudio(function() {
			application.campaign(parseInt(level, 10));
		});

	}
	var audioInitilialised = false;
	var initAudio = function(callback) {
		if (!audioInitilialised) {
			audioInitilialised = true;
			$.mbAudio.pause('effectSprite', callback);
		}
		callback();
	};

	$('body').removeClass('loading');
});