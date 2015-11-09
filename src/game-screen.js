RH.FrontScreen = (function() {
	'use strict';
	// timeWidth is the number of miliseconds that the canvas width can represent
	function FrontScreen(canvas, measures, options) {
		this.canvas = canvas;
		this.options = options;
		this.measures = measures;
		this.timeWidth = 2 * options.getBeatPerBar() / options.getBeatPerMillisecond();
	}
	FrontScreen.prototype = {
		update : function(ups, ellapsed) {
			if (!this.options.debugMode) {
				return;
			}
			var canvas = this.canvas;
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
				var newX = x + (canvas.width / screen.timeWidth) * (element.duration);
				context.lineTo(newX, y);
				x = newX;
			});

			context.moveTo(canvas.width / 4, 0);
			context.lineTo(canvas.width / 4, canvas.height);
			context.stroke();
			context.closePath();

			var beatPerBar = this.options.getBeatPerBar();
			var beatPerMs = this.options.getBeatPerMillisecond();
			var division = RH.divide(ellapsed * beatPerMs, beatPerBar);
			var ellapsedBars = division.quotient;
			var ellapsedBeats = division.rest;
			var barLength = (beatPerBar / beatPerMs) * (canvas.width / (this.timeWidth)); //px/seconds
			for (var i = 0; i < 3; i++) {
				var shift = barLength * (ellapsedBeats / beatPerBar);
				var startBar = i * barLength - shift;
				context.fillText(i + ellapsedBars, startBar + barLength / 2, canvas.height * 3 / 4);
				context.beginPath();
				for (var j = 0; j < beatPerBar; j++) {
					var beatX = startBar + j * (barLength / beatPerBar);
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

	var drawBeamsOnStave = function(context, stave){


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

		function createNote(note_data) {
			return new Vex.Flow.StaveNote(note_data);
		}
		
		stave.setContext(context);
		stave.addTimeSignature("3/4");
		stave.draw(context);
		
		var formatter = new Vex.Flow.Formatter();
		var notes = note_data.map(createNote);
		var voice = new Vex.Flow.Voice(Vex.Flow.TIME4_4);
		
		var group1 = notes.slice(0, 5);
		var group2 = notes.slice(5, 12);
		var beam1 = new Vex.Flow.Beam(group1);
		var beam2 = new Vex.Flow.Beam(group2);
		
		
		voice.addTickables(notes);
		formatter.joinVoices([ voice ]).formatToStave([ voice ], stave);

		
		voice.draw(context, stave);

		beam1.setContext(context).draw();
		beam2.setContext(context).draw();

	};
	
	var createMeasuresCanvases = function(measureWidth, measures) {
		var tempCanvaJ = $('<canvas>');

		tempCanvaJ.prop({
			width : measureWidth * measures.length,
			height : 100
		});
		var tempCanvas = tempCanvaJ[0];
		var context = tempCanvas.getContext('2d');
		var renderer = new Vex.Flow.Renderer(tempCanvas, Vex.Flow.Renderer.Backends.CANVAS);
		var ctx = renderer.getContext();
		for (var i = 0; i < measures.length; i++) {
			var stave = new Vex.Flow.Stave(measureWidth * i, 0, measureWidth);
//			if (!measures[i].isEmpty){
				drawBeamsOnStave(ctx, stave);
//			}
		}
		var result = [];
		for (i = 0; i < measures.length; i++) {
			result[i] = context.getImageData(measureWidth * i, 0, measureWidth, 100);
		}
		return result;
	};

	// timeWidth is the number of miliseconds that the canvas width can represent
	var BackScreen = function(canvas, measures, options) {
		this.canvas = canvas;
		this.options = options;
		this.timeWidth = 2 * options.getBeatPerBar() / options.getBeatPerMillisecond();
		this.metronome = new RH.Metronome(50, 50);
		this.measureWidth = Math.floor(canvas.width / 2);
		this.measuresCanvases = createMeasuresCanvases(this.measureWidth, measures);
	};

	BackScreen.prototype = {

		update : function(ellapsed) {
			var beatPerBar = this.options.getBeatPerBar();
			var beatPerMs = this.options.getBeatPerMillisecond();
			var division = RH.divide(ellapsed * beatPerMs, beatPerBar);
			var ellapsedBars = division.quotient;
			var ellapsedBeats = division.rest;

			var canvas = this.canvas;
			var context = canvas.getContext("2d");
			context.clearRect(0, 0, canvas.width, canvas.height);
			
			for (var i = 0; i < 3; i++) {
				var shift = this.measureWidth * (ellapsedBeats / beatPerBar);
				var startStave = i * this.measureWidth - shift;
				var measureCanvasData = this.measuresCanvases[ellapsedBars];
				if (measureCanvasData !== undefined){
					canvas.getContext('2d').putImageData(measureCanvasData, startStave, 50);
				}else{
					throw 'error: ' + ellapsedBars;
				}

			}

			
			//Draw Metronome
			context.save();
			context.translate(canvas.width / 2 - 25, 5);
			this.metronome.draw(context, this.options.timeSignature, RH.mod(ellapsedBeats - beatPerBar / 2, beatPerBar));
			context.restore();
		}
	};
	return BackScreen;
}());
