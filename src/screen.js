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
		this.measureWidth = canvas.width / 2;
		this.metronome = new RH.Metronome(50, 50);
		this.measuresCanvases = VexUtils.generateMeasuresCanvases(this.measureWidth, measures);
	}

	Screen.prototype = {
		update : function(measureInfo) {
			var screen = this;
			var canvas = this.canvas;
			var context = canvas.getContext("2d");
			context.clearRect(0, 0, canvas.width, canvas.height);

			var measure = measureInfo.measure;
			var beatPerBar = measure.getBeatPerBar();
			var measureDuration = measure.getDuration();
			var shift = this.measureWidth * (-0.5 + measureInfo.ellapsedBeats / beatPerBar);
			
			if (this.eventManager.isPressed) {
				context.beginPath();
				context.arc(canvas.width - 20, 20, 10, 0, 2 * Math.PI, false);
				context.fillStyle = 'grey';
				context.fill();
				context.lineWidth = 0.5;
				context.strokeStyle = 'black';
				context.stroke();
			}

			if (RH.isDebug) {
				this.displayEvents(measureInfo);

				

				[ -1, 0, 1, 2 ].forEach(function(i) {
					var index = measureInfo.index + i;
					if (index < 0 || index >= screen.measures.length) {
						return true;
					}
					var currentMeasure = screen.measures[index];
					var startBar = i * screen.measureWidth - shift;
					context.fillText(index, startBar + screen.measureWidth / 2, canvas.height * 3 / 4);
					context.beginPath();
					for (var j = 0; j < currentMeasure.getBeatPerBar(); j++) {
						var beatX = startBar + j * (screen.measureWidth / measure.getBeatPerBar());
						var z = (j === 0) ? 3 / 4 : 7 / 8;
						context.moveTo(beatX, canvas.height * z);
						context.lineTo(beatX, canvas.height);
					}
					context.stroke();
					context.closePath();

					context.save();
					context.beginPath();
					context.strokeStyle = 'blue';
					context.lineWidth = 1;
					var x = startBar;

					var beatLength = screen.measureWidth / currentMeasure.getBeatPerBar();
					var epsilon = 0.05 * beatLength;
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
				});
			}
			[ -1, 0, 1, 2 ].forEach(function(i) {
				var startStave = i * screen.measureWidth - shift;
				var index = measureInfo.index + i;
				if (index < 0 || index >= screen.measuresCanvases.length) {
					return;
				}
				if (i == -1) {
					var noteScores = screen.scoreCalculator.measuresScore[index];
					if (noteScores !== undefined) {
						context.save();
						var y = 50;
						var x = startStave + screen.measureWidth - 20;
						noteScores.forEach(function(noteScore) {
							var type = noteScore.getType();
							var ch = type.icon;
							context.fillStyle = type.color;
							context.fillText(ch, x, y);
							x += context.measureText(ch).width;
						});
						context.restore();
					}
				}
				var measureCanvasData = screen.measuresCanvases[index];
				canvas.getContext('2d').putImageData(measureCanvasData, startStave, 50);
				// display the count down
				if (screen.measures[index].isEmpty) {
					context.beginPath();
					context.arc(3 + startStave + RH.divide(measureInfo.ellapsedBeats, 1).quotient * screen.measureWidth / screen.measures[index].getBeatPerBar(), 107, 8, 0, 2 * Math.PI, false);
					context.lineWidth = 1;
					context.strokeStyle = '#003300';
					context.stroke();
				}
			});

			// Draw Metronome
			context.save();
			context.translate(canvas.width / 2 - 25, 5);
			this.metronome.draw(context, measure.timeSignature, measureInfo.ellapsedBeats);
			context.restore();

		},
		displayEvents : function(measureInfo) {
			var canvas = this.canvas;
			var context = canvas.getContext("2d");
			var measure = measureInfo.measure;
			var measureDuration = measure.getBeatPerBar() / measure.getBeatPerMillisecond();
			var ups = this.eventManager.getEvents(measureInfo.t - measureDuration * 0.5);
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
			context.moveTo(canvas.width / 4, 0);
			context.lineTo(canvas.width / 4, canvas.height);
			context.stroke();
			context.closePath();
		}
	};


	return Screen;

}());
