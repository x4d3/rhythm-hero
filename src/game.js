RH.GameOptions = (function(){
	'use strict';
	function GameOptions(debugMode, timeSignature, tempo){
		this.debugMode = debugMode;
		this.timeSignature = timeSignature ? timeSignature:RH.TS.FOUR_FOUR;
		//beat per minutes
		this.tempo = tempo?tempo:60; 
	}
	GameOptions.prototype = {
		getBeatPerMillisecond : function(){
			return this.tempo/(60 * 1000);
		},getBeatPerBar : function(){
			return this.timeSignature.getBeatPerBar();
		}
	};
	return GameOptions;
}());

RH.Game = (function(){
	'use strict';
	var VexUtils = RH.VexUtils;
	var Note = RH.Note;
	var Measure = RH.Measure;
	var ZERO_F = new Fraction(0);

	var Game = function(eventManager, canvases, options) {
		this.eventManager = eventManager;
		this.options = options;
		var patterns = RH.RhythmPatterns.generatePatterns(0, RH.RhythmPatterns.MAX_DIFFICULTY, 50);
		this.measures = Game.generateMeasures(options.getBeatPerBar(), patterns);
		this.screens = {
			front: new RH.FrontScreen(canvases.front, this.measures, options),
			back: new RH.BackScreen(canvases.back, this.measures, options)
		};
		this.isOn = true;
		this.t0 = RH.getTime();
	};
	//static method
	Game.generateMeasures = function(beatPerBar, patterns){
		var result = [];
		var beats = ZERO_F;
		var beatPerBarF = new Fraction(beatPerBar, 1);
		var measureNotes = [];
		var firstNotePressed = false;
		for (var i = 0; i < patterns.length; i++) {
			var pattern = patterns[i];
			var notes = pattern.notes;
			for (var j = 0; j < notes.length; j++) {
				var note = notes[j];
				var sum = note.duration.add(beats);
				var compare = sum.compare(beatPerBar, 1);
				if (compare > 0){
					var durationLeft = beatPerBarF.sub(beats.n, beats.d);
					var split = note.split(durationLeft);
					measureNotes.push(split[0]);
					result.push(new Measure(measureNotes, firstNotePressed, true));
					firstNotePressed = true;
					var newDuration = note.duration.sub(durationLeft.n, durationLeft.d);
					measureNotes = [split[1]];
					beats = split[1].duration;
				}else{
					measureNotes.push(note);
					if (compare === 0){
						beats = ZERO_F;
						result.push(new Measure(measureNotes, firstNotePressed, false));
						measureNotes = [];
						firstNotePressed = false;
					}else{
						beats = sum;
					}
				}
			}
		}
		//we don't fill the last bar
		return result;
	};
	
	
	Game.prototype = {
		update : function(){
			var t = RH.getTime();
			var ellapsed = t - this.t0;
			var beatPerBar = this.options.getBeatPerBar();
			var beatPerMs = this.options.getBeatPerMillisecond();
			var shift = 0.5 * beatPerBar / beatPerMs;
			var events = this.eventManager.getEvents(t - shift);
			this.screens.front.update(events, ellapsed);
			this.screens.back.update(ellapsed);
			return this.isOn;
		}
	};
	return Game;
}());

