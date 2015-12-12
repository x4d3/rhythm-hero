RH.Screen = (function() {
	'use strict';
	var Preconditions = RH.Preconditions;
	var VF = Vex.Flow;
	var VexUtils = RH.VexUtils;

	function Screen(canvas, eventManager, scoreCalculator, measures, options) {
		this.canvas = canvas;
		this.eventManager = eventManager;
		this.scoreCalculator = scoreCalculator;
		this.measures = measures;
		this.options = options;
		this.measureWidth = 400;
		this.metronome = new RH.Metronome(50, 50);
		var measuresCanvases = VexUtils.generateMeasuresCanvases(this.measureWidth, measures);
		this.measuresCanvases = {
			"true" : measuresCanvases,
			"false" : measuresCanvases.map(brighten)
		};
	}

	Screen.prototype = {
		display : function(measureInfo) {
			var screen = this;
			var canvas = this.canvas;
			var context = canvas.getContext("2d");
			context.clearRect(0, 0, canvas.width, canvas.height);
			var measure = measureInfo.measure;
			var shift = this.measureWidth * (-0.5 + measureInfo.ellapsedBeats / measure.getBeatPerBar());
			if (this.eventManager.isPressed) {
				context.beginPath();
				context.arc(canvas.width - 20, 20, 10, 0, 2 * Math.PI, false);
				context.fillStyle = 'grey';
				context.fill();
				context.lineWidth = 0.5;
				context.strokeStyle = 'black';
				context.stroke();
			}
			[ -1, 0, 1, 2 ].forEach(function(i) {
				var index = measureInfo.index + i;
				if (index < 0 || index >= screen.measures.length) {
					return true;
				}
				var startStave = i * screen.measureWidth - shift;
				screen.displayStave(canvas, startStave, index, i === 0);
				// display the count down
				if (screen.measures[index].isEmpty) {
					context.beginPath();
					context.arc(3 + startStave + RH.divide(measureInfo.ellapsedBeats, 1).quotient * screen.measureWidth / screen.measures[index].getBeatPerBar(), 107, 8, 0, 2 * Math.PI, false);
					context.lineWidth = 1;
					context.strokeStyle = '#003300';
					context.stroke();
				}
			});
			this.displayScore(canvas, -screen.measureWidth - shift, measureInfo.index - 1);
			if (RH.isDebug) {
				this.displayEvents(canvas, measureInfo, 0.5);
				[ -1, 0, 1, 2 ].forEach(function(i) {
					var index = measureInfo.index + i;
					if (index < 0 || index >= screen.measures.length) {
						return true;
					}
					var startStave = i * screen.measureWidth - shift;
					screen.displayDebug(canvas, shift, startStave, index);
				});
			}
			this.displayMetronome(canvas, measureInfo);
		},
		drawOnExternalCanvas : function(canvas, measureInfo) {
			this.displayStave(canvas, 0, measureInfo.index, true);
			this.displayEvents(canvas, measureInfo, 1);
			this.displayDebug(canvas, 0, 0, measureInfo.index);
			this.displayScore(canvas, 0, measureInfo.index);
		},
		displayEvents : function(canvas, measureInfo, percentage) {
			var context = canvas.getContext("2d");
			var measure = measureInfo.measure;
			var measureDuration = measure.getDuration();
			var ups = this.eventManager.getEvents(measureInfo.t - measureDuration * percentage);
			var x = 0;
			var screen = this;
			context.beginPath();
			context.lineWidth = 1;
			var y = 0;
			ups.forEach(function(element) {
				y = 0.5 + (element.isPressed ? canvas.height / 16 : canvas.height / 8);
				context.lineTo(x, y);
				var newX = x + element.duration * screen.measureWidth / measureDuration;
				context.lineTo(newX, y);
				x = newX;
			});
			// context.moveTo(canvas.width / 4, 0);
			// context.lineTo(canvas.width / 4, canvas.height);
			context.stroke();
			context.closePath();
		},
		displayDebug : function(canvas, shift, startStave, index) {
			var screen = this;
			var context = canvas.getContext("2d");
			var currentMeasure = screen.measures[index];
			// display awaited rhythm
			context.save();
			context.beginPath();
			context.strokeStyle = 'blue';
			context.lineWidth = 1;
			var x = startStave;
			var beatLength = screen.measureWidth / currentMeasure.getBeatPerBar();
			var epsilon = RH.REST_PERCENTAGE * beatLength;
			var Y_IS_ON = canvas.height * 3 / 16;
			var Y_IS_OFF = canvas.height / 4;
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
			context.closePath();
			context.restore();

		},
		displayStave : function(canvas, startStave, index, isActive) {
			var data = this.measuresCanvases[isActive][index];
			canvas.getContext('2d').putImageData(data, startStave, 50);

		},
		displayScore : function(canvas, startStave, index) {
			var screen = this;
			var context = canvas.getContext("2d");
			var noteScores = screen.scoreCalculator.measuresScore[index];
			if (noteScores !== undefined && !screen.measures[index].isEmpty) {
				context.save();
				context.font = '12px sans-serif';
				var y = 70;
				var x = startStave + screen.measureWidth - 80;
				noteScores.notes.forEach(function(noteScore) {
					var type = noteScore.getType();
					var ch = type.icon;
					context.fillStyle = type.color;
					context.fillText(ch, x, y);
					x += context.measureText(ch).width;
				});
				context.fillStyle = 'black';
				context.fillText(' ' + numeral(noteScores.value()).format("0%"), x, y);
				context.restore();
			}
		},
		displayMetronome : function(canvas, measureInfo) {
			var context = canvas.getContext("2d");
			context.save();
			context.translate(this.canvas.width / 2 - 25, 5);
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
