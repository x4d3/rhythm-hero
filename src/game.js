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

	var Game = function(eventManager, canvas, options) {
		this.eventManager = eventManager;
		this.options = options;
		var notes = RH.RhythmPatterns.generateNotes(0, 0, 50);
		logger.debug("Notes: " + notes);
		this.measures = Game.generateMeasures(options, notes);
		var currentTime = 0;
		this.measuresStartTime = this.measures.map(function(measure) {
			var result = currentTime;
			currentTime += measure.getDuration();
			return result;
		});
		this.measuresStartTime.push(currentTime);
		this.scoreCalculator = new ScoreCalculator(eventManager, this.measures);
		this.screen = new Screen(canvas, eventManager, this.scoreCalculator, this.measures, options);
		this.isOn = true;
		this.t0 = RH.getTime();
		logger.debug("t0:" + this.t0);
		this.currentMeasureIndex = -1;

	};

	Game.prototype = {
		update : function() {
			var t = RH.getTime();
			var ellapsed = t - this.t0;
			var measureIndex = RH.binarySearch(this.measuresStartTime, ellapsed);
			var startTime = this.measuresStartTime[measureIndex];
			var measure = this.measures[measureIndex];
			
			var measureInfo = {
				t : t,
				index : measureIndex,
				ellapsedBeats : measure.getBeatPerMillisecond() * (ellapsed - startTime),
				measure : this.measures[measureIndex]
			};
			if (measureIndex !== this.currentMeasureIndex) {
				this.scoreCalculator.addMeasureScore(t, this.currentMeasureIndex);
				this.currentMeasureIndex = measureIndex;
				logger.debug(measureIndex + "," + measure);
				//new measure, let's calculate the measure score
				if (measureIndex === this.measures.length) {
					this.isOn = false;
					return false;
				}
				if (RH.isDebug && measureIndex > 1) {
					var tempCanvaJ = $('<canvas>');
					tempCanvaJ.prop({
						width : 400,
						height : 200
					});
					this.screen.drawOnExternalCanvas(tempCanvaJ[0], measureInfo);
					$('body').append(tempCanvaJ);
					logger.debug("Event Manager: " + this.eventManager.toJson());
					
				}
			}



			this.screen.display(measureInfo);
			this.isOn = (measureIndex < this.measures.length);
			return this.isOn;
		}
	};

	// static method
	Game.generateMeasures = function(options, notes) {
		//The two first measure are empty
		var tempo = options.tempo;
		var timeSignature = options.timeSignature;
		var beatPerBar = timeSignature.getBeatPerBar();
		var beatPerBarF = new Fraction(beatPerBar, 1);

		var EMPTY = new RH.Measure(tempo, timeSignature, [], false, false);
		var result = [ EMPTY ];
		var beats = Fraction.ZERO;

		var measureNotes = [];
		var firstNotePressed = false;
		notes.forEach(function(note){
			var sum = note.duration.add(beats);
			var compare = sum.compareTo(beatPerBarF);
			if (compare > 0) {
				var durationLeft = beatPerBarF.subtract(beats);
				var split = note.split(durationLeft);
				measureNotes.push(split[0]);
				result.push(new Measure(tempo, timeSignature, measureNotes, firstNotePressed, true));
				firstNotePressed = true;
				var newDuration = note.duration.subtract(durationLeft);
				measureNotes = [ split[1] ];
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
