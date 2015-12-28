RH.MEASURE_WIDTH = 400;
RH.REST_PERCENTAGE = 0.05;

RH.Game = (function() {
	'use strict';
	var VexUtils = RH.VexUtils;
	var Note = RH.Note;
	var Measure = RH.Measure;
	var ScoreCalculator = RH.ScoreCalculator;
	var Screen = RH.Screen;
	var logger = RH.logManager.getLogger('Game');

	var Game = function(eventManager, measures, canvas, withLife, endGameCallback) {
		this.eventManager = eventManager;
		this.measures = measures;
		this.endGameCallback = endGameCallback;
		var currentTime = 0;
		this.measuresStartTime = this.measures.map(function(measure) {
			var result = currentTime;
			currentTime += measure.getDuration();
			return result;
		});
		this.measuresStartTime.push(currentTime);
		this.scoreCalculator = new ScoreCalculator(eventManager, this.measures);
		this.screen = new Screen(canvas, eventManager, this.scoreCalculator, this.measures);
		this.isOn = true;
		this.t0 = RH.getTime();
		logger.debug("t0:" + this.t0);
		this.currentMeasureIndex = -1;

	};

	Game.prototype = {
		start: function() {
			var game = this;
			RH.Parameters.model.gameOn(true);
			(function animloop() {
				if (game.isOn) {
					game.update();
					requestAnimFrame(animloop);
				}
			})();
		},
		stop: function(forced) {
			RH.Parameters.model.gameOn(false);
			this.isOn = false;
			$('.result').empty();
			logger.debug("Event Manager: " + this.eventManager.toJson());
			if (!forced){
				this.endGameCallback(this);
			}
		},
		isFinished: function() {
			return this.currentMeasureIndex === this.measures.length;
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
				if (this.isFinished()) {
					this.stop(false);
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
		}
	};
	Game.EMPTY_MEASURE = new RH.Measure(60, RH.TS.FOUR_FOUR, [], false, false);
	// static method
	Game.generateMeasures = function(options, notes) {
		//The two first measure are empty
		var tempo = options.tempi[0];
		var timeSignature = options.timeSignatures[0];
		var beatPerBar = timeSignature.getBeatPerBar();
		var beatPerBarF = new Fraction(beatPerBar, 1);


		var result = [new RH.Measure(tempo, RH.TS.FOUR_FOUR, [], false, false)];
		var beats = Fraction.ZERO;

		var measureNotes = [];
		var firstNotePressed = false;
		notes.forEach(function(note) {
			var sum = note.duration.add(beats);
			var compare = sum.compareTo(beatPerBarF);
			if (compare > 0) {
				var durationLeft = beatPerBarF.subtract(beats);
				var split = note.split(durationLeft);
				measureNotes.push(split[0]);
				result.push(new Measure(tempo, timeSignature, measureNotes, firstNotePressed, !note.isRest));
				firstNotePressed = !note.isRest;
				var newDuration = note.duration.subtract(durationLeft);
				measureNotes = [split[1]];
				beats = split[1].duration;
			} else {
				measureNotes.push(note);
				if (compare === 0) {
					beats = Fraction.ZERO;
					result.push(new Measure(tempo, timeSignature, measureNotes, firstNotePressed, false));
					measureNotes = [];
					firstNotePressed = false;
				} else {
					beats = sum;
				}
			}
		});
		// we don't fill the last bar
		return result;
	};


	return Game;
}());