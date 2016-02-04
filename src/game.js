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

	var Game = function(measures, title, canvas, withLife, endGameCallback) {
		var eventManager = new EventManager();
		this.eventManager = eventManager;
		this.measures = measures;
		this.endGameCallback = endGameCallback;
		this.title = title;
		var currentTime = 0;
		this.measuresStartTime = this.measures.map(function(measure) {
			var result = currentTime;
			currentTime += measure.getDuration();
			return result;
		});
		this.measuresStartTime.push(currentTime);
		this.scoreCalculator = new ScoreCalculator(eventManager, this.measures, withLife);
		this.screen = new Screen(canvas, eventManager, this.scoreCalculator, this.measures, title);
		this.isOn = true;
		this.t0 = RH.getTime();
		logger.debug("t0:" + this.t0);
		this.currentMeasureIndex = -1;
	};

	Game.prototype = {
		stop: function() {
			this.isOn = false;
			$('.result').empty();
			logger.debug("Event Manager: " + this.eventManager.toJson());
			this.endGameCallback(this);
		},
		update: function() {
			var game = this;
			var t = RH.getTime();
			var ellapsed = t - this.t0;
			var measureIndex = RH.binarySearch(this.measuresStartTime, ellapsed);
			var startTime = this.measuresStartTime[measureIndex];
			var measure = this.measures[measureIndex];

			if (measureIndex !== this.currentMeasureIndex) {
				//new measure, let's calculate the measure score
				this.currentMeasureIndex = measureIndex;
				this.scoreCalculator.addMeasureScore(t, measureIndex - 1);
				logger.debug(measureIndex + "," + measure);
				if (this.currentMeasureIndex === this.measures.length || this.scoreCalculator.hasLost()) {
					this.stop();
					return;
				}
			}
			var measureInfo = {
				t: t,
				index: measureIndex,
				ellapsedBeats: measure.getBeatPerMillisecond() * (ellapsed - startTime),
				measure: measure
			};
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
					t: startTime + game.t0,
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
			if (RH.isDebug && this.isOn) {
				var letterPressed = String.fromCharCode(event.which);
				if (letterPressed !== "") {
					logger.debug("Letter Pressed: " + letterPressed);
					switch (letterPressed) {
						case "W":
							logger.debug("Game won automatical");
							this.stop();
							break;
						case "L":
							this.scoreCalculator.life = 0;
							this.stop();
							break;
					}
				}
			}
		}
	};
	Game.EMPTY_MEASURE = new RH.Measure(60, RH.TS.FOUR_FOUR, [], false, false);
	return Game;
}());