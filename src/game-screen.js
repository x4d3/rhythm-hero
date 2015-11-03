RH.FrontScreen = (function(){
	'use strict';
	// timeWidth is the number of miliseconds that the canvas width can represent
	function FrontScreen(canvas, options) {
		this.canvas = canvas;
		this.options = options;
		this.timeWidth = 2 *  options.getBeatPerBar() / options.getBeatPerMillisecond();
	}
	FrontScreen.prototype = {
		update : function(ups, ellapsed){
			if (!this.options.debugMode){
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
			ups.forEach(function(element){
				y = 0.5 + (element.isPressed ? canvas.height/8: canvas.height/4);
				context.lineTo( x, y);
				var newX = x + (canvas.width/screen.timeWidth) * (element.duration);
				context.lineTo( newX, y);
				x = newX;
			});
			

			context.moveTo(canvas.width/4, 0);
			context.lineTo(canvas.width/4, canvas.height);
			context.stroke();
			context.closePath();
			
			
			var beatPerBar = this.options.getBeatPerBar();
			var beatPerMs = this.options.getBeatPerMillisecond();
			var division = RH.divide(ellapsed *  beatPerMs, beatPerBar);
			var ellapsedBars = division.quotient;
			var ellapsedBeats = division.rest;
			var barLength = (beatPerBar/beatPerMs) *  (canvas.width/ ( this.timeWidth)); //px/seconds
			for (var i = 0; i < 3; i++){
				var shift = barLength * (ellapsedBeats / beatPerBar);
				var startBar = i* barLength  - shift;
				context.fillText(i + ellapsedBars, startBar + barLength/2 , canvas.height * 3/4);
				context.beginPath();
				for (var j = 0; j < beatPerBar; j++){
					var beatX = startBar + j *  (barLength/beatPerBar);
					var z = (j === 0) ? 3/4 : 7/8;
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

RH.BackScreen = (function(){
	'use strict';
	// timeWidth is the number of miliseconds that the canvas width can represent
	function BackScreen(canvas, options) {
		this.canvas = canvas;
		this.options = options;
		this.timeWidth = 2 *  options.getBeatPerBar() / options.getBeatPerMillisecond();
		this.bars = [];
		for (var i = 0; i < 3; i++){
			var notes = [];
			for (var j = 0; j < options.getBeatPerBar(); j++){
				var key = RH.VexUtils.randomKey();
				notes[j] = RH.VexUtils.newNote(key, 4);
			}
			this.bars[i] = notes;
		}
		this.metronome = new RH.Metronome(50, 50);
	}
	BackScreen.prototype = {

		update : function(ellapsed){
			var beatPerBar = this.options.getBeatPerBar();
			var beatPerMs = this.options.getBeatPerMillisecond();
			var division = RH.divide(ellapsed *  beatPerMs, beatPerBar);
			var ellapsedBars = division.quotient;
			var ellapsedBeats = division.rest;
			
			var canvas = this.canvas;
			var context = canvas.getContext("2d");
			context.clearRect(0, 0, canvas.width, canvas.height);
			
			context.save();
			context.translate(canvas.width/2 - 25, 5);
			this.metronome.draw(context, this.options.timeSignature, RH.mod(ellapsedBeats - beatPerBar/2, beatPerBar));
			context.restore();
			
			var renderer = new Vex.Flow.Renderer(canvas,Vex.Flow.Renderer.Backends.CANVAS);
			var barLength = (beatPerBar/beatPerMs) *  (canvas.width/ ( this.timeWidth)); //px/seconds
			for (var i = 0; i < 3; i++){
				var shift = barLength * (ellapsedBeats / beatPerBar);
				var startStave = i* barLength  - shift;
				var stave = new Vex.Flow.Stave(startStave, 50,  barLength);
				stave.setContext(context).draw();
				var notes = RH.getArrayElement(this.bars, ellapsedBars + i);
				Vex.Flow.Formatter.FormatAndDraw(context, stave, notes);
			}
			this.previousBar= ellapsedBars;
			

		}
	};
	return BackScreen;
}());
