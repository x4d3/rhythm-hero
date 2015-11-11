RH.FrontScreen = (function() {
	'use strict';
	// timeWidth is the number of miliseconds that the canvas width can represent
	function FrontScreen(canvas, eventManager, measures, options) {
		this.canvas = canvas;
		this.eventManager = eventManager;
		this.measures = measures;
		this.options = options;
	}
	FrontScreen.prototype = {
		update : function(measureInfo) {
			if (!this.options.debugMode) {
				return;
			}
			var canvas = this.canvas;
			
			var measure = measureInfo.measure;
			var beatPerBar = measure.getBeatPerBar();
			var measureDuration = measure.getBeatPerBar() / measure.getBeatPerMillisecond();
			
			var ups = this.eventManager.getEvents(measureInfo.t - measureDuration* 0.5);
			var barLength = canvas.width/2;
			
			
			var context = canvas.getContext("2d");
			context.clearRect(0, 0, canvas.width, canvas.height);

			
			var x = 0;
			var screen = this;
			context.beginPath();
			context.lineWidth = 1;
			var y = 0;
			ups.forEach(function(element) {
				y = 0.5 + (element.isPressed ? canvas.height / 8 : canvas.height / 4);
				context.lineTo(x, y);
				var newX = x + element.duration * barLength/measureDuration;
				context.lineTo(newX, y);
				x = newX;
			});

			context.moveTo(canvas.width / 4, 0);
			context.lineTo(canvas.width / 4, canvas.height);
			context.stroke();
			context.closePath();

			
			var shift = barLength * (0.5 + measureInfo.ellapsedBeats / beatPerBar);
			
			
			for (var i = 0; i < 4; i++){
				var index = measureInfo.index  + i;
				if (index < 0  || index >= this.measures.length){
					continue;
				}
				var currentMeasure = this.measures[index];
				var startBar = i * barLength - shift;
				context.fillText(index, startBar + barLength / 2, canvas.height * 3 / 4);
				context.beginPath();
				for (var j = 0; j < currentMeasure.getBeatPerBar(); j++) {
					var beatX = startBar + j * (barLength / measure.getBeatPerBar());
					var z = (j === 0) ? 3 / 4 : 7 / 8;
					context.moveTo(beatX, canvas.height * z);
					context.lineTo(beatX, canvas.height);
				}
				context.stroke();
				context.closePath();
			}

		}
	};
	return FrontScreen;
}());

RH.BackScreen = (function() {
	'use strict';
	var Preconditions = RH.Preconditions;
	var VF = Vex.Flow;

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
		var createNote = function (note_data) {
			return new Vex.Flow.StaveNote(note_data);
		};
		
		measures.forEach(function(measure, i){
			if (measure.isEmpty) {
				var x = measureWidth * i;
				var beatPerBar = measure.getBeatPerBar();
				for (var j = 0; j < beatPerBar; j++) {
					context.fillText(j+1, x + j * measureWidth / beatPerBar, 50);
				}
				return true;
			}
			
			var stave = new VF.Stave(measureWidth * i, 0, measureWidth);

			stave.setContext(context);
			stave.addTimeSignature("3/4");
			stave.draw(context);

			var formatter = new VF.Formatter();
			var note_data = [ {
				keys : [ "f/4" ],
				duration : "8"
			}, {
				keys : [ "e/4" ],
				duration : "8"
			}, {
				keys : [ "d/4" ],
				duration : "8"
			}, {
				keys : [ "c/4" ],
				duration : "16"
			}, {
				keys : [ "c/4" ],
				duration : "16"
			}, {
				keys : [ "c/5" ],
				duration : "8"
			}, {
				keys : [ "b/4" ],
				duration : "8"
			}, {
				keys : [ "c/5" ],
				duration : "8"
			}, {
				keys : [ "c/5" ],
				duration : "32"
			}, {
				keys : [ "c/5" ],
				duration : "32"
			}, {
				keys : [ "b/4" ],
				duration : "32"
			}, {
				keys : [ "f/4" ],
				duration : "32"
			} ];
			
			var notes = note_data.map(createNote);
			var voice = new VF.Voice(VF.TIME4_4);
			
			var group1 = notes.slice(0, 5);
			var group2 = notes.slice(5, 12);
			var beams = [];
			beams.push(new Vex.Flow.Beam(group1));
			beams.push(new Vex.Flow.Beam(group2));
			
			
			voice.addTickables(notes);
			formatter.joinVoices([ voice ]).formatToStave([ voice ], stave);

			
			voice.draw(context, stave);			
			beams.forEach(function(beam){
				beam.setContext(context).draw();
			});

		});
		var result = [];
		for (var i = 0; i < measures.length; i++) {
			result[i] = context.getImageData(measureWidth * i, 0, measureWidth, 100);
		}
		return result;
	};

	// timeWidth is the number of miliseconds that the canvas width can represent
	var BackScreen = function(canvas, measures, options) {
		this.canvas = canvas;
		this.options = options;
		this.metronome = new RH.Metronome(50, 50);
		this.measureWidth = Math.floor(canvas.width / 2);
		this.measuresCanvases = createMeasuresCanvases(this.measureWidth, measures);
	};

	BackScreen.prototype = {

		update : function(measureInfo) {
			var measure = measureInfo.measure;
			var beatPerBar = measure.getBeatPerBar();
			var shift = this.measureWidth * (0.5 + measureInfo.ellapsedBeats / beatPerBar);
			
			var canvas = this.canvas;
			var context = canvas.getContext("2d");
			context.clearRect(0, 0, canvas.width, canvas.height);
			
			for (var i = 0; i < 4; i++) {
				var startStave = i * this.measureWidth - shift;
				var index = measureInfo.index + i;
				if (index < 0  || index >= this.measuresCanvases.length){
					continue;
				}
				var measureCanvasData = this.measuresCanvases[index];
				canvas.getContext('2d').putImageData(measureCanvasData, startStave, 50);
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
