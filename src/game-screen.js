RH.FrontScreen = (function() {
	'use strict';
	// timeWidth is the number of miliseconds screen the canvas width can represent
	function FrontScreen(canvas, eventManager, measures, options) {
		this.canvas = canvas;
		this.eventManager = eventManager;
		this.measures = measures;
		this.options = options;
		this.measureLength = canvas.width / 2;

	}
	FrontScreen.prototype = {
		update : function(measureInfo) {
			if (!RH.isDebug) {
				return;
			}
			var canvas = this.canvas;

			var measure = measureInfo.measure;
			var beatPerBar = measure.getBeatPerBar();
			var measureDuration = measure.getBeatPerBar() / measure.getBeatPerMillisecond();

			var context = canvas.getContext("2d");
			context.clearRect(0, 0, canvas.width, canvas.height);

			this.displayEvents(measureInfo);

			var shift = this.measureLength * (-0.5 + measureInfo.ellapsedBeats / beatPerBar);
			var screen = this;

			[ -1, 0, 1, 2 ].forEach(function(i) {
				var index = measureInfo.index + i;
				if (index < 0 || index >= screen.measures.length) {
					return true;
				}
				var currentMeasure = screen.measures[index];
				var startBar = i * screen.measureLength - shift;
				context.fillText(index, startBar + screen.measureLength / 2, canvas.height * 3 / 4);
				context.beginPath();
				for (var j = 0; j < currentMeasure.getBeatPerBar(); j++) {
					var beatX = startBar + j * (screen.measureLength / measure.getBeatPerBar());
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

				var beatLength = screen.measureLength / currentMeasure.getBeatPerBar();
				var epsilon = 0.05 * beatLength;
				var Y_IS_ON = canvas.height * 3 / 16;
				var Y_IS_OFF = canvas.height / 4;
				var y = currentMeasure.firstNotePressed ? Y_IS_ON : Y_IS_OFF;
				currentMeasure.notes.forEach(function(note, j) {
					context.moveTo(x, y);
					y = (note.isRest ? Y_IS_OFF : Y_IS_ON);
					context.lineTo(x, y);
					var duration = note.duration.value	() * beatLength;
					var newX = x + duration;
					if (j == (currentMeasure.notes.length - 1) && currentMeasure.lastNotePressed) {
						context.lineTo(newX, y);
					} else {
						context.lineTo(newX - epsilon, y);
						y = Y_IS_OFF;
						context.lineTo(newX - epsilon, y);
						context.lineTo(newX, y	);
					}
					x = newX;
				});
				context.stroke();
				context.closePath();
				context.restore();
			});

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
				var newX = x + element.duration * screen.measureLength / measureDuration;
				context.lineTo(newX, y);
				x = newX;
			});
			context.moveTo(canvas.width / 4, 0);
			context.lineTo(canvas.width / 4, canvas.height);
			context.stroke();
			context.closePath();
		}
	};
	return FrontScreen;
}());

RH.BackScreen = (function() {
	'use strict';
	var Preconditions = RH.Preconditions;
	var VF = Vex.Flow;
	var VexUtils = RH.VexUtils;
	
	var createMeasuresCanvases = function(measureWidth, measures) {
		var tempCanvaJ = $('<canvas>');

		tempCanvaJ.prop({
			width : measureWidth * measures.length,
			height : 100
		});
		var tempCanvas = tempCanvaJ[0];
		var context = tempCanvas.getContext('2d');
		var renderer = new VF.Renderer(tempCanvas, VF.Renderer.Backends.CANVAS);
		var ctx = renderer.getContext();
		var currentTimeSignature = null;
		measures.forEach(function(measure, i) {
			if (measure.isEmpty) {
				//display 
				var x = measureWidth * i;
				var beatPerBar = measure.getBeatPerBar();
				for (var j = 0; j < beatPerBar; j++) {
					context.fillText(j + 1, x + j * measureWidth / beatPerBar, 60);
				}
				return true;
			}
			var timeSignature = measure.timeSignature;
			
			var stave = new VF.Stave(measureWidth * i, 0, measureWidth);
			stave.setContext(context);
			
			if (currentTimeSignature === null || currentTimeSignature.equals(timeSignature)){
				currentTimeSignature = timeSignature;
				stave.addTimeSignature(timeSignature.toString());
			}
			stave.draw(context);
			var formatter = new VF.Formatter();
			var result = VexUtils.generateNotesTupletTiesAndBeams(measure.notes);

			var voice = new VF.Voice({
				num_beats : timeSignature.numerator,
				beat_value : timeSignature.denominator,
				resolution : VF.RESOLUTION
			});
			voice.setStrict(false);
			voice.addTickables(result.notes);
			formatter.joinVoices([ voice ]).formatToStave([ voice ], stave);
			voice.draw(context, stave);
			
			result.beams.forEach(function(beam) {
				beam.setContext(context).draw();
			});
			result.ties.forEach(function(tie) {
				tie.setContext(context).draw();
			});
			result.tuplets.forEach(function(tuplet) {
				tuplet.setContext(context).draw();
			});
			if (RH.isDebug){
				context.fillText(measure, measureWidth * i, 0);
			}
			
		});
		var result = [];
		for (var i = 0; i < measures.length; i++) {
			result[i] = context.getImageData(measureWidth * i, 0, measureWidth, 100);
		}
		return result;
	};

	// timeWidth is the number of miliseconds screen the canvas width can represent
	var BackScreen = function(canvas, measures, options) {
		this.canvas = canvas;
		this.options = options;
		this.metronome = new RH.Metronome(50, 50);
		this.measureWidth = Math.floor(canvas.width / 2);
		this.measures = measures;
		this.measuresCanvases = createMeasuresCanvases(this.measureWidth, measures);
	};
	BackScreen.createMeasuresCanvases = createMeasuresCanvases;
	
	BackScreen.prototype = {

		update : function(measureInfo) {
			var measure = measureInfo.measure;
			var beatPerBar = measure.getBeatPerBar();
			var shift = this.measureWidth * (-0.5 + measureInfo.ellapsedBeats / beatPerBar);

			var canvas = this.canvas;
			var context = canvas.getContext("2d");
			context.clearRect(0, 0, canvas.width, canvas.height);

			for (var i = -1; i < 3; i++) {
				var startStave = i * this.measureWidth - shift;
				var index = measureInfo.index + i;
				if (index < 0 || index >= this.measuresCanvases.length) {
					continue;
				}

				var measureCanvasData = this.measuresCanvases[index];
				canvas.getContext('2d').putImageData(measureCanvasData, startStave, 50);
				//display the count down
				if (this.measures[index].isEmpty) {
					context.beginPath();
					context.arc(3 + startStave + RH.divide(measureInfo.ellapsedBeats, 1).quotient * this.measureWidth / this.measures[index].getBeatPerBar(), 107, 8, 0, 2 * Math.PI, false);
					context.lineWidth = 1;
					context.strokeStyle = '#003300';
					context.stroke();
				}
			}

			//Draw Metronome
			context.save();
			context.translate(canvas.width / 2 - 25, 5);
			this.metronome.draw(context, measure.timeSignature, measureInfo.ellapsedBeats);
			context.restore();
		}
	};
	return BackScreen;
}());
