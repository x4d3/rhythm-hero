RH.Game = (function() {
	'use strict';
	var VexUtils = RH.VexUtils;
	var Note = RH.Note;
	var Measure = RH.Measure;
	var logger = RH.logManager.getLogger('Game');
	
	var Game = function(eventManager, canvases, options) {
		this.eventManager = eventManager;
		this.options = options;
		var patterns = RH.RhythmPatterns.generatePatterns(0, RH.RhythmPatterns.MAX_DIFFICULTY, 50);
		this.measures = Game.generateMeasures(options, patterns);
		var currentTime = 0;
		this.measuresStartTime = this.measures.map(function(measure){
			var result = currentTime;
			currentTime +=  measure.timeSignature.getBeatPerBar()/measure.getBeatPerMillisecond();
			return result;
		});
		this.measuresStartTime.push(currentTime);
		this.screens = {
			front : new RH.FrontScreen(canvases.front, eventManager, this.measures, options),
			back : new RH.BackScreen(canvases.back, this.measures, options)
		};
		this.isOn = true;
		this.t0 = RH.getTime();
		this.currentMeasureIndex = -1;
	};
	
	Game.prototype = {
		update : function() {
			var t = RH.getTime();
			var ellapsed = t - this.t0;
			var measureIndex = RH.binarySearch(this.measuresStartTime, ellapsed);
			var startTime = this.measuresStartTime[measureIndex];
			var measure = this.measures[measureIndex];
			if (measureIndex !== this.currentMeasureIndex){
				this.currentMeasureIndex = measureIndex;
				logger.debug(measureIndex + "," + measure);
				//new measure, let's calculate the measure score
				if (measureIndex  === this.measures.length){
					this.isOn = false;
					return false;
				}
			}
			
			var measureInfo = {
				t:t,
				startTime: startTime,
				index: measureIndex,
				ellapsedBeats: measure.getBeatPerMillisecond()*(ellapsed - startTime),
				measure: this.measures[measureIndex]
			};
			
			this.screens.front.update(measureInfo);
			this.screens.back.update(measureInfo);
			this.isOn = (measureIndex  < this.measures.length);
			return this.isOn;
		}
	};
	
	// static method
	Game.generateMeasures = function(options, patterns) {
		//The two first measure are empty
		var tempo = options.tempo;
		var timeSignature = options.timeSignature;
		var beatPerBar = timeSignature.getBeatPerBar();
		var beatPerBarF = new Fraction(beatPerBar, 1);
		
		var EMPTY = new RH.Measure(tempo, timeSignature, [], false, false);
		
		var result = [EMPTY];
		var beats = Fraction.ZERO;

		var measureNotes = [];
		var firstNotePressed = false;
		for (var i = 0; i < patterns.length; i++) {
			var pattern = patterns[i];
			var notes = pattern.notes;
			for (var j = 0; j < notes.length; j++) {
				var note = notes[j];
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
			}
		}
		// we don't fill the last bar
		return result;
	};

	return Game;
}());
