RH.BackScreen = (function() {
	'use strict';
	var Preconditions = RH.Preconditions;
	var VF = Vex.Flow;
	var VexUtils = RH.VexUtils;
	
	var createMeasuresCanvases = function(measureWidth, measures) {
		var tempCanvaJ = $('<canvas>');

		tempCanvaJ.prop({
			width : measureWidth * measures.length,
			height : 200
		});
		var tempCanvas = tempCanvaJ[0];
		var context = tempCanvas.getContext('2d');
		var renderer = new VF.Renderer(tempCanvas, VF.Renderer.Backends.CANVAS);
		var ctx = renderer.getContext();
		var currentTimeSignature = null;
		var currentTempo = null;
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
			var tempo = measure.tempo;
			var stave = new VF.Stave(measureWidth * i, 0, measureWidth);
			stave.setContext(context);
			
			if (currentTimeSignature === null || !currentTimeSignature.equals(timeSignature)){
				currentTimeSignature = timeSignature;
				stave.addTimeSignature(timeSignature.toString());
			}
			if (currentTempo === null || currentTempo != tempo){
				currentTempo = tempo;
				stave.setTempo({
					duration : "q",
					bpm : tempo
				}, 0);
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
			result.tuplets.forEach(function(tuplet) {
				tuplet.setContext(context).draw();
			});
			result.ties.forEach(function(tie) {
				tie.setContext(context).draw();
			});

			if (RH.isDebug){
				context.fillText(measure, measureWidth * i, 20);
			}
			
		});
		var result = [];
		for (var i = 0; i < measures.length; i++) {
			result[i] = context.getImageData(measureWidth * i, 0, measureWidth, 200);
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
