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


RH.Metronome = (function(){
	'use strict';
	function Metronome(width, height){
		this.width = width;
		this.height = height;
	}
	
	var DRAWERS = {};
	
	var drawDot = function(context, x, y){
		context.beginPath();
		context.arc(x, y, 2, 0, 2 * Math.PI, false);
		context.fillStyle = 'green';
		context.fill();
		context.lineWidth = 1;
		context.strokeStyle = '#003300';
		context.stroke();
	};
	
	DRAWERS[RH.TS.FOUR_FOUR.toString()] = function(metronome, context, ellapsedBeats){
		var division = RH.divide(ellapsedBeats, 1);
		var x;
		var y;
		switch(division.quotient) {
			case 0:
				x =	1/2;
				y = division.rest;
				break;
			case 1:
				x = 1/2 * (1 - division.rest);
				y = 1 - 1/2 * division.rest;
				break;
			case 2:
				x = division.rest;
				y = 1/2;
				break;
			case 3:
				x = 1 - division.rest * 1/2;
				y = 1/2 * (1 - division.rest);
				break;
		}
		drawDot(context, metronome.width * x , metronome.height * y);
	};
	Metronome.prototype = {
		draw: function(context, timeSignature, ellapsedBeats){
			context.clearRect(0, 0, this.width, this.height);
			DRAWERS[timeSignature.toString()](this, context, ellapsedBeats);
		}
	};
	return Metronome;
}());

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
		this.metronome = new RH.Metronome(50, 50);
	}
	GameScreen.prototype = {
		update : function(ellapsedBars, ellapsedBeats, beatPerBar, beatPerMs, timeSignature){

			var canvas = this.canvas;
			var context = canvas.getContext("2d");
			context.clearRect(0, 0, canvas.width, canvas.height);
			
			context.save();
			context.translate(canvas.width/2 - 25, 30);
			this.metronome.draw(context, timeSignature, ellapsedBeats);
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
			this.screens.back.update(division.quotient, division.rest, beatPerBar, beatPerMs, this.options.timeSignature);
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

