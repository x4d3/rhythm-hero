RH.Screen = (function() {
	'use strict';
	var Preconditions = RH.Preconditions;
	var VF = Vex.Flow;
	var VexUtils = RH.VexUtils;
	var ScoreScreen = RH.ScoreScreen;
	var CanvasUtils = RH.CanvasUtils;

	var MEASURE_WIDTH = 400;
	var MEASURE_HEIGHT = 150;
	var METRONOME_POSITION = {
		x: MEASURE_WIDTH / 2 - 25,
		y: 5
	};

	var TITLE_POSITION = {
		x: MEASURE_WIDTH - 60,
		y: 40
	};

	var SCORE_POSITION = {
		x: MEASURE_WIDTH + 25,
		y: 35
	};
	var MULTIPLIER_POSITION = {
		x: MEASURE_WIDTH + 75,
		y: 37
	};
	var LIFE_POSITION = {
		x: 25,
		y: 35
	};
	var PRESS_POSITION = {
		x: 150,
		y: 30
	};

	Screen.METRONOME_POSITION = METRONOME_POSITION;
	Screen.MEASURE_WIDTH = MEASURE_WIDTH;
	Screen.SCORE_POSITION = SCORE_POSITION;
	Screen.MULTIPLIER_POSITION = MULTIPLIER_POSITION;
	Screen.LIFE_POSITION = LIFE_POSITION;


	var EVENT_Y = 200;
	var DEBUG_Y = 178;
	var SIGNAL_HEIGHT = 20;

	function Screen(canvas, eventManager, scoreCalculator, measures, title) {
		this.canvas = canvas;
		this.eventManager = eventManager;
		this.scoreCalculator = scoreCalculator;
		this.measures = measures;
		this.title = title;
		this.metronome = new RH.Metronome(50, 50);
		var measuresCanvases = VexUtils.generateMeasuresCanvases(MEASURE_WIDTH, MEASURE_HEIGHT, measures);
		this.measuresCanvases = {
			"true": measuresCanvases,
			"false": measuresCanvases.map(CanvasUtils.brighten)
		};
		this.scoreScreen = new ScoreScreen({
			scoreCalculator: scoreCalculator,
			scorePosition: SCORE_POSITION,
			multiplierPosition: MULTIPLIER_POSITION,
			lifePosition: LIFE_POSITION,
			center: {
				x: canvas.width / 2,
				y: canvas.height / 2
			}
		});
	}

	Screen.prototype = {
		display: function(measureInfo) {
			var screen = this;
			var canvas = this.canvas;
			var context = canvas.getContext("2d");
			context.clearRect(0, 0, canvas.width, canvas.height);
			var measure = measureInfo.measure;
			var isOn = measureInfo.status === RH.Game.STATUS.STARTED;
			var isHorizontal = RH.Parameters.model.scrollingDirection() == 'horizontal';
			var isContinuous = RH.Parameters.model.scrollingMode() == 'continuous';
			var shift = measureInfo.ellapsedBeats / measure.getBeatPerBar();
			if (shift < 1.5) {
				var staveShift = isContinuous ? shift : 0.5;

				var suiteArray;
				if (isHorizontal) {
					suiteArray = RH.createSuiteArray(-1, 3);
				} else {
					suiteArray = RH.createSuiteArray(-2, 4);
				}

				suiteArray.forEach(function(i) {
					var index = measureInfo.index + i;
					if (index < 0 || index >= screen.measures.length) {
						return;
					}
					var staveX;
					var staveY;
					if (isHorizontal) {
						staveX = (i + 0.5 - staveShift) * MEASURE_WIDTH;
						staveY = 50;
					} else {
						var parity = RH.mod(index, 2);
						var alpha = Math.floor(i - parity) / 2;
						staveX = parity * MEASURE_WIDTH;
						staveY = (1 + alpha - staveShift / 2) * MEASURE_HEIGHT;
					}
					var isActive = i === 0 && isOn;
					screen.displayStave(canvas, staveX, staveY, index, isActive);
					// display the count down
					if (index === 0 && i === 0) {
						context.fillStyle = 'grey';
						var division = RH.divide(measureInfo.ellapsedBeats, 1).quotient;
						var beatPerBar = screen.measures[index].getBeatPerBar();
						for (var beat = 0; beat < beatPerBar; beat++) {
							context.font = beat === division ? 'bolder 36px Open Sans' : '16px Open Sans';
							context.fillText(beat + 1, staveX + beat * MEASURE_WIDTH / beatPerBar, staveY + 70);
						}
					}
				});
				if (isOn) {
					if (RH.Parameters.isBeginnerMode()) {
						this.displayEvents(canvas, EVENT_Y, measure, measureInfo.t, 0.5);
						[-1, 0, 1, 2].forEach(function(i) {
							var index = measureInfo.index + i;
							if (index < 0 || index >= screen.measures.length) {
								return;
							}
							var startStave = i * MEASURE_WIDTH - shift;
							screen.displayDebug(canvas, DEBUG_Y, (i + 0.5 - shift) * MEASURE_WIDTH, index);
						});
					}
					this.displayMetronome(canvas, measure, measureInfo.ellapsedBeats);
				}

			}
			var previousMeasureIndex = measureInfo.index - 1;
			var measurePosition;
			if (isHorizontal) {
				measurePosition = {
					x: MEASURE_WIDTH / 2 - 80,
					y: 70
				};
			} else {
				measurePosition = {
					x: (0.75 + RH.mod(previousMeasureIndex, 2)) * MEASURE_WIDTH,
					y: 70
				};

			}
			//display title
			if (measureInfo.index < 1) {
				context.save();
				context.font = '24px arcadeclassic';
				context.fillStyle = "#696969";
				context.fillText(this.title, TITLE_POSITION.x, TITLE_POSITION.y);
				context.restore();
			} else {
				this.scoreScreen.draw(context, measurePosition, previousMeasureIndex, measureInfo);
			}

			if (this.eventManager.isPressed) {
				context.save();
				context.beginPath();
				context.lineWidth = 0.5;
				context.arc(PRESS_POSITION.x, PRESS_POSITION.y, 10, 0, 2 * Math.PI, false);
				context.fillStyle = '#696969';
				context.fill();

				context.strokeStyle = '#696969';
				context.stroke();
				context.restore();
			}

		},
		drawOnExternalCanvas: function(canvas, measureInfo) {
			var measure = measureInfo.measure;
			this.displayStave(canvas, 0, 0, measureInfo.index, true);
			this.displayEvents(canvas, 150, measure, measureInfo.t, 1);
			this.displayDebug(canvas, 120, 0, measureInfo.index);
			var score = this.scoreCalculator.measuresScore[measureInfo.index];
			if (score !== undefined) {
				var context = canvas.getContext("2d");
				context.font = '18px Open Sans';
				context.fillStyle = 'grey';
				context.fillText(Math.round(100 * score.value()), SCORE_POSITION.x, SCORE_POSITION.y);
			}

		},
		displayEvents: function(canvas, eventY, measure, t, percentage) {
			var context = canvas.getContext("2d");
			var measureDuration = measure.getDuration();
			var ups = this.eventManager.getEvents(t - measureDuration * percentage);
			var x = 0;
			var screen = this;
			context.save();
			context.beginPath();
			context.strokeStyle = '#003300';
			context.lineWidth = 1;
			var Y_IS_ON = eventY - SIGNAL_HEIGHT;
			var Y_IS_OFF = eventY;
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
		displayDebug: function(canvas, debugY, startStave, index) {
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
			var Y_IS_ON = debugY - SIGNAL_HEIGHT;
			var Y_IS_OFF = debugY;
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
		displayStave: function(canvas, x, y, index, isActive) {
			var data = this.measuresCanvases[isActive][index];
			canvas.getContext('2d').putImageData(data, x, y);

		},
		displayMetronome: function(canvas, measure, ellapsedBeats) {
			var context = canvas.getContext("2d");
			context.save();
			context.translate(METRONOME_POSITION.x, METRONOME_POSITION.y);
			this.metronome.draw(context, measure, ellapsedBeats);
			context.restore();
		}
	};
	return Screen;
}());