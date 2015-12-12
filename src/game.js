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

	var Game = function(eventManager, options) {
		this.eventManager = eventManager;
		this.options = options;

		this.container = $('<div>').addClass('application-container');
		var switchSound = $('<div>').addClass('rh-icon switch-sound');
		switchSound.on("click touchstart", function() {
			var isOn = RH.SoundsManager.switchSound();
			switchSound.toggleClass('off', !isOn);
		});
		switchSound.toggleClass('off', !RH.SoundsManager.isOn);
		var canvasDiv = $('<canvas>').addClass('application').prop({
			width : 800,
			height : 300
		});
		this.container.append(switchSound);
		this.container.append(canvasDiv);
		var canvas = canvasDiv[0];
		$('body').append(this.container);

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
		start:function(){
			var game = this;
			(function animloop() {
				if (game.isOn) {
					game.update();
					requestAnimFrame(animloop);
				}
			})();
		},
		stop: function(){
			this.container.remove();
			this.isOn = false;
		},
		update : function() {
			var game = this;
			var t = RH.getTime();
			var ellapsed = t - this.t0;
			var measureIndex = RH.binarySearch(this.measuresStartTime, ellapsed);
			var startTime = this.measuresStartTime[measureIndex];
			var measure = this.measures[measureIndex];

			if (measureIndex !== this.currentMeasureIndex) {
				//new measure, let's calculate the measure score
				this.scoreCalculator.addMeasureScore(t, this.currentMeasureIndex);
				this.currentMeasureIndex = measureIndex;
				logger.debug(measureIndex + "," + measure);
				if (measureIndex === this.measures.length) {
					this.isOn = false;
					this.container.remove();
					var resultDiv = $('.result');
					resultDiv.empty();
					resultDiv.append('<h2>Result</h2>');
					resultDiv.append(renderScore(this.scoreCalculator));
					this.measuresStartTime.forEach(function(startTime, measureIndex) {
						if (measureIndex < 2 || measureIndex == game.measures.length) {
							return;
						}
						var measure = game.measures[measureIndex];
						var measureInfo = {
							t : startTime + game.t0,
							index : measureIndex-1,
							ellapsedBeats : 0,
							measure : measure
						};
						var tempCanvaJ = $('<canvas>');
						tempCanvaJ.prop({
							width : 400,
							height : 200
						});
						game.screen.drawOnExternalCanvas(tempCanvaJ[0], measureInfo);
						resultDiv.append(tempCanvaJ);
					});
					logger.debug("Event Manager: " + this.eventManager.toJson());
					return;
				}
			}
			var measureInfo = {
				t : t,
				index : measureIndex,
				ellapsedBeats : measure.getBeatPerMillisecond() * (ellapsed - startTime),
				measure : measure
			};
			this.screen.display(measureInfo);
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
		notes.forEach(function(note) {
			var sum = note.duration.add(beats);
			var compare = sum.compareTo(beatPerBarF);
			if (compare > 0) {
				var durationLeft = beatPerBarF.subtract(beats);
				var split = note.split(durationLeft);
				measureNotes.push(split[0]);
				result.push(new Measure(tempo, timeSignature, measureNotes, firstNotePressed, !note.isRest));
				if(!note.isRest){
					firstNotePressed = true;
				}
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
	var renderScore = function(scoreCalculator){
		return  $('<div>');
		
	};
	
	return Game;
}());
