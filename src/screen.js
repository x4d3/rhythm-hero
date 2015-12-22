RH.Screen = (function() {
	'use strict';
	var Preconditions = RH.Preconditions;
	var VF = Vex.Flow;
	var VexUtils = RH.VexUtils;
	var ScoreScreen = RH.ScoreScreen;

	var MEASURE_WIDTH = 400;

	var METRONOME_POSITION = {
		x: 3* MEASURE_WIDTH / 4 - 25,
		y: 5
	};
	var SCORE_POSITION = {
		x: MEASURE_WIDTH - 25,
		y: 40
	};
	var MULTIPLIER_POSITION = {
		x: MEASURE_WIDTH + 100,
		y: 40
	};
	Screen.METRONOME_POSITION = METRONOME_POSITION;
	Screen.MEASURE_WIDTH = MEASURE_WIDTH;
	Screen.SCORE_POSITION = SCORE_POSITION;
	Screen.MULTIPLIER_POSITION = MULTIPLIER_POSITION;
	
	var EVENT_Y = 200;
	var DEBUG_Y = 178;
	var SIGNAL_HEIGHT = 20;

	function Screen(canvas, eventManager, scoreCalculator, measures) {
		this.canvas = canvas;
		this.eventManager = eventManager;
		this.scoreCalculator = scoreCalculator;
		this.measures = measures;

		this.metronome = new RH.Metronome(50, 50);
		var measuresCanvases = VexUtils.generateMeasuresCanvases(MEASURE_WIDTH, measures);
		this.measuresCanvases = {
			"true": measuresCanvases,
			"false": measuresCanvases.map(brighten)
		};
		this.scoreScreen = new ScoreScreen({
			scoreCalculator: scoreCalculator,
			measurePosition: {
				x: MEASURE_WIDTH / 2 - 80,
				y: 70
			},
			scorePosition: SCORE_POSITION,
			multiplierPosition: MULTIPLIER_POSITION
		});
	}

	Screen.prototype = {
		display: function(measureInfo) {
			var screen = this;
			var canvas = this.canvas;
			var context = canvas.getContext("2d");
			context.clearRect(0, 0, canvas.width, canvas.height);
			var measure = measureInfo.measure;
			var shift = MEASURE_WIDTH * (-0.5 + measureInfo.ellapsedBeats / measure.getBeatPerBar());
			if (this.eventManager.isPressed) {
				context.beginPath();
				context.arc(canvas.width - 20, 20, 10, 0, 2 * Math.PI, false);
				context.fillStyle = 'grey';
				context.fill();
				context.lineWidth = 0.5;
				context.strokeStyle = 'black';
				context.stroke();
			}
			[-1, 0, 1, 2].forEach(function(i) {
				var index = measureInfo.index + i;
				if (index < 0 || index >= screen.measures.length) {
					return true;
				}
				var startStave = i * MEASURE_WIDTH - shift;
				screen.displayStave(canvas, startStave, index, i === 0);
				// display the count down
				if (screen.measures[index].isEmpty) {
					context.beginPath();
					context.arc(3 + startStave + RH.divide(measureInfo.ellapsedBeats, 1).quotient * MEASURE_WIDTH / screen.measures[index].getBeatPerBar(), 107, 8, 0, 2 * Math.PI, false);
					context.lineWidth = 1;
					context.strokeStyle = '#003300';
					context.stroke();
				}
			});

			if (RH.Parameters.isBeginnerMode()) {
				this.displayEvents(canvas, measureInfo, 0.5);
				[-1, 0, 1, 2].forEach(function(i) {
					var index = measureInfo.index + i;
					if (index < 0 || index >= screen.measures.length) {
						return true;
					}
					var startStave = i * MEASURE_WIDTH - shift;
					screen.displayDebug(canvas, shift, startStave, index);
				});
			}
			this.displayMetronome(canvas, measureInfo);
			this.scoreScreen.draw(canvas.getContext("2d"), measureInfo.index - 1, measureInfo.t);
		},
		drawOnExternalCanvas: function(canvas, measureInfo) {
			this.displayStave(canvas, 0, measureInfo.index, true);
			this.displayEvents(canvas, measureInfo, 1);
			this.displayDebug(canvas, 0, 0, measureInfo.index);
			var score = this.scoreCalculator.measuresScore[measureInfo.index];
			if(score !== undefined){
				var context = canvas.getContext("2d");
				context.font = '18px Open Sans';
				context.fillStyle = 'grey';
				context.fillText(Math.round(100 * score.value()), SCORE_POSITION.x, SCORE_POSITION.y);
			}

		},
		displayEvents: function(canvas, measureInfo, percentage) {
			var context = canvas.getContext("2d");
			
			var measure = measureInfo.measure;
			var measureDuration = measure.getDuration();
			var ups = this.eventManager.getEvents(measureInfo.t - measureDuration * percentage);
			var x = 0;
			var screen = this;
			context.save();
			context.beginPath();
			context.strokeStyle = '#003300';
			context.lineWidth = 1;
			var Y_IS_ON = EVENT_Y - SIGNAL_HEIGHT;
			var Y_IS_OFF = EVENT_Y;
			var y = canvas.height / 8;
			ups.forEach(function(element) {
				y = 0.5 + (element.isPressed ? Y_IS_ON : Y_IS_OFF);
				context.lineTo(x, y);
				var newX = x + element.duration * MEASURE_WIDTH / measureDuration;
				context.lineTo(newX, y);
				x = newX;
			});
			context.stroke();
			context.restore();
		},
		displayDebug: function(canvas, shift, startStave, index) {
			var screen = this;
			var context = canvas.getContext("2d");
			var currentMeasure = screen.measures[index];
			// display awaited rhythm
			context.save();
			context.beginPath();
			context.strokeStyle = 'blue';
			context.lineWidth = 1;
			var x = startStave;
			var beatLength = MEASURE_WIDTH / currentMeasure.getBeatPerBar();
			var epsilon = RH.REST_PERCENTAGE * beatLength;
			var Y_IS_ON = DEBUG_Y - SIGNAL_HEIGHT;
			var Y_IS_OFF = DEBUG_Y;
			var y = currentMeasure.firstNotePressed ? Y_IS_ON : Y_IS_OFF;
			currentMeasure.notes.forEach(function(note, j) {
				context.moveTo(x, y);
				y = (note.isRest ? Y_IS_OFF : Y_IS_ON);
				context.lineTo(x, y);
				var duration = note.duration.value() * beatLength;
				var newX = x + duration;
				if (j == (currentMeasure.notes.length - 1) && currentMeasure.lastNotePressed) {
					context.lineTo(newX, y);
				} else {
					context.lineTo(newX - epsilon, y);
					y = Y_IS_OFF;
					context.lineTo(newX - epsilon, y);
					context.lineTo(newX, y);
				}
				x = newX;
			});
			context.stroke();
			context.restore();

		},
		displayStave: function(canvas, startStave, index, isActive) {
			var data = this.measuresCanvases[isActive][index];
			canvas.getContext('2d').putImageData(data, startStave, 50);

		},
		displayMetronome: function(canvas, measureInfo) {
			var context = canvas.getContext("2d");
			context.save();
			context.translate(METRONOME_POSITION.x, METRONOME_POSITION.y);
			this.metronome.draw(context, measureInfo.measure.timeSignature, measureInfo.ellapsedBeats);
			context.restore();
		}

	};
	var brighten = function(pixels) {
		var d = new Uint8ClampedArray(pixels.data);
		for (var i = 0; i < d.length; i += 4) {
			d[i] = 195;
			d[i + 1] = 195;
			d[i + 2] = 195;
		}
		return createImageData(d, pixels.width, pixels.height);
	};

	var createImageData = function(data, width, height) {
		var canvas = document.createElement('canvas');
		canvas.width = width;
		canvas.height = height;
		var ctx = canvas.getContext('2d');
		var imageData = ctx.createImageData(width, height);
		if (imageData.data.set) {
			imageData.data.set(data);
		}
		return imageData;
	};

	return Screen;

}());