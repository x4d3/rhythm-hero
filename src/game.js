RH.MEASURE_WIDTH = 400;
RH.REST_PERCENTAGE = 0.05;

RH.Game = (function() {
	'use strict';
	var VexUtils = RH.VexUtils;
	var Note = RH.Note;
	var Measure = RH.Measure;
	var ScoreCalculator = RH.ScoreCalculator;
	var Screen = RH.Screen;
	var EventManager = RH.EventManager;

	var logger = RH.logManager.getLogger('Game');
	var STATUS = {
		STARTED: 'STARTED',
		SCORE_SCREEN: 'SCORE_SCREEN',
		FINISHED: 'FINISHED'
	};

	var Game = function(measures, title, canvas, withLife, scoreManager, callback) {
		var t0 = RH.getTime();
		var ellapsed = function() {
			return RH.getTime() - t0;
		};
		var eventManager = new EventManager(ellapsed);
		this.ellapsed = ellapsed;
		this.eventManager = eventManager;
		this.measures = measures;
		this.callback = callback;
		this.title = title;
		var currentTime = 0;
		this.measuresStartTime = this.measures.map(function(measure) {
			var result = currentTime;
			currentTime += measure.getDuration();
			return result;
		});
		this.endGameTime = currentTime;
		this.measuresStartTime.push(currentTime);
		this.scoreCalculator = new ScoreCalculator(eventManager, this.measures, withLife, scoreManager);
		this.screen = new Screen(canvas, eventManager, this.scoreCalculator, this.measures, title);
		this.status = STATUS.STARTED;
		logger.debug("t0:" + this.t0);
		this.currentMeasureIndex = -1;
	};

	Game.prototype = {
		update: function() {
			var game = this;
			var ellapsed = this.ellapsed();
			var measureInfo = {
				t: ellapsed
			};
			measureInfo.index = RH.binarySearch(this.measuresStartTime, ellapsed);
			var startTime = this.measuresStartTime[measureInfo.index];
			measureInfo.measure = this.measures[Math.min(measureInfo.index, this.measures.length - 1)];

			measureInfo.ellapsedBeats = measureInfo.measure.getBeatPerMillisecond() * (ellapsed - startTime);
			if (measureInfo.index !== this.currentMeasureIndex) {
				//new measure, let's calculate the measure score
				this.currentMeasureIndex = measureInfo.index;
				if (this.status == STATUS.STARTED) {
					this.scoreCalculator.calculateMeasureScore(ellapsed, measureInfo.index - 1);
					logger.debug(measureInfo.index + "," + measureInfo.measure);
				}
			}
			if (this.status == STATUS.STARTED) {
				if (this.scoreCalculator.hasLost()) {
					this.endGameTime = ellapsed;
				}
				if (ellapsed >= this.endGameTime) {
					this.status = STATUS.SCORE_SCREEN;
					this.callback();
				}

			}
			measureInfo.status = this.status;
			this.screen.display(measureInfo);
		},
		renderScore: function() {
			var game = this;
			var resultDiv = $('<div>');
			resultDiv.append('<h2>Result</h2>');
			this.measuresStartTime.forEach(function(startTime, measureIndex) {
				if (measureIndex < 2 || measureIndex == game.measures.length) {
					return;
				}
				var measure = game.measures[measureIndex];
				var measureInfo = {
					t: startTime,
					index: measureIndex - 1,
					ellapsedBeats: 0,
					measure: measure
				};
				var tempCanvaJ = $('<canvas>');
				tempCanvaJ.prop({
					width: 400,
					height: 200
				});
				game.screen.drawOnExternalCanvas(tempCanvaJ[0], measureInfo);
				resultDiv.append(tempCanvaJ);
			});
			return resultDiv;
		},
		resetKeyPressed: function() {
			this.eventManager.resetKeyPressed();
		},
		onEvent: function(isUp, event) {
			this.eventManager.onEvent(isUp, event);
			if (!isUp) {
				if (this.status == STATUS.SCORE_SCREEN && (this.ellapsed() - this.endGameTime > 500)) {
					this.status = STATUS.FINISHED;
					this.callback();
				}
			}

			if (RH.isDebug) {
				var letterPressed = String.fromCharCode(event.which);
				if (letterPressed !== "") {
					logger.debug("Letter Pressed: " + letterPressed);
					switch (letterPressed) {
						case "W":
							logger.debug("Game won automatical");
							this.scoreCalculator.win();
							this.endGameTime = this.ellapsed();
							break;
						case "L":
							this.scoreCalculator.loose();
							this.endGameTime = this.ellapsed();
							break;
					}
				}
			}
		}
	};
	Game.EMPTY_MEASURE = new RH.Measure(60, RH.TS.FOUR_FOUR, [], false, false);
	Game.STATUS = STATUS;
	return Game;
}());