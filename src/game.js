RH.TimeSignature = (function(){
	'use strict';
	function TimeSignature(numerator, denumerator){
		this.numerator = numerator;
		this.denumerator = denumerator;
	}
	TimeSignature.prototype = {
		toString: function(){
			return this.numerator + "/" + this.denumerator;
		},
		// one beat = one 1/4th
		getBeatPerBar : function(){
			return this.numerator * 4 / this.denumerator;
		}
	};
	TimeSignature.parse = function(string){
		var array = string.split("/");
		return new TimeSignature(parseInt(array[0], 10), parseInt(array[1], 10));
	};
	return TimeSignature;
}());


RH.TS = {
	FOUR_FOUR : new RH.TimeSignature(4, 4)
};

RH.GameOptions = (function(){
	'use strict';
	function GameOptions(timeSignature, tempo){
		this.timeSignature = timeSignature ? timeSignature:RH.TS.FOUR_FOUR;
		//beat per minutes
		this.tempo = tempo?tempo:60; 
	}
	GameOptions.prototype = {
	};
	return GameOptions;
}());

RH.DebugGameScreen = (function(){
	'use strict';
	// timeWidth is the number of miliseconds that the canvas width can represent
	function DebugGameScreen(canvas, timeWidth) {
		this.canvas = canvas;
		this.timeWidth = timeWidth;
	}
	DebugGameScreen.prototype = {
		update : function(ups){
			var canvas = this.canvas;
			var context = canvas.getContext("2d");
			context.clearRect(0, 0, canvas.width, canvas.height);
			var x = 0;
			var screen = this;
			context.beginPath();
			context.lineWidth = 1;
			var y = 0;
			ups.forEach(function(element){
				y = 0.5 + (element.isPressed ? canvas.height/4: canvas.height/2);
				context.lineTo( x, y);
				var newX = x + (canvas.width/screen.timeWidth) * (element.duration);
				context.lineTo( newX, y);
				x = newX;
			});
			context.lineTo(canvas.width, y);
			context.stroke();
		}
	};
	return DebugGameScreen;
}());

RH.GameScreen = (function(){
	'use strict';
	// timeWidth is the number of miliseconds that the canvas width can represent
	function GameScreen(canvas, timeWidth) {
		this.canvas = canvas;
		this.timeWidth = timeWidth;
		this.bars = [];
		for (var i = 0; i < 3; i++){
			var notes = [];
			for (var j = 0; j < 4; j++){
				var key = RH.VexUtils.randomKey();
				notes[j] = RH.VexUtils.newNote(key, 4);
			}
			this.bars[i] = notes;
		}
	}
	GameScreen.prototype = {
		update : function(barEllapsed, beatsEllapsed, beatPerBar, beatPerMs){

			var canvas = this.canvas;
			var context = canvas.getContext("2d");
			context.clearRect(0, 0, canvas.width, canvas.height);
			var renderer = new Vex.Flow.Renderer(canvas,Vex.Flow.Renderer.Backends.CANVAS);
			var barLength = (beatPerBar/beatPerMs) *  (canvas.width/ ( this.timeWidth)); //px/seconds
			for (var i = 0; i < 3; i++){
				var shift = barLength * (beatsEllapsed / beatPerBar);
				var startStave = i* barLength  - shift;
				var stave = new Vex.Flow.Stave(startStave, 50,  barLength);
				stave.setContext(context).draw();
				var notes = RH.getArrayElement(this.bars, barEllapsed + i);
				Vex.Flow.Formatter.FormatAndDraw(context, stave, notes);
			}
			this.previousBar= barEllapsed;
			

		}
	};
	return GameScreen;
}());

RH.Game = (function(){
	'use strict';
	function Game(eventManager, canvases, options) {
		this.eventManager = eventManager;
		this.options = options;
		this.screens = {
			front: new RH.DebugGameScreen(canvases.front, 2 * this.getBeatPerBar() / this.getBeatPerMillisecond()),
			back: new RH.GameScreen(canvases.back,2* this.getBeatPerBar() / this.getBeatPerMillisecond())
		};
		this.isOn = true;
		this.t0 = RH.getTime();
	}
	
	Game.prototype = {
		update : function(){
			var t = RH.getTime();
			var ellapsed = t - this.t0;
			var beatPerBar = this.getBeatPerBar();
			var beatPerMs = this.getBeatPerMillisecond();
			var division = RH.divide(ellapsed *  beatPerMs, beatPerBar);
			var shift = 0.5 * beatPerBar / beatPerMs;
			var events = this.eventManager.getEvents(t - shift);
			this.screens.front.update(events);
			this.screens.back.update(division.quotient, division.rest, beatPerBar, beatPerMs);
			return this.isOn;
		},
		getBeatPerMillisecond : function(){
			return this.options.tempo/(60 * 1000);
		},getBeatPerBar : function(){
			return this.options.timeSignature.getBeatPerBar();
		}
	};
	return Game;
}());

