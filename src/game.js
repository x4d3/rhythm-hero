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
		beatPerBar : function(){
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
	}
	GameScreen.prototype = {
		update : function(ups){
			var canvas = this.canvas;
			var context = canvas.getContext("2d");
			context.clearRect(0, 0, canvas.width, canvas.height);
			var renderer = new Vex.Flow.Renderer(canvas, Vex.Flow.Renderer.Backends.CANVAS);

			var stave = new Vex.Flow.Stave(10, 0, canvas.width - 10);
			stave.addClef("treble").setContext(context).draw();
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
			front: new RH.DebugGameScreen(canvases.front,1000* 2 * this.options.timeSignature.beatPerBar() * 60/this.options.tempo),
			back: new RH.GameScreen(canvases.back,1000* this.options.timeSignature.beatPerBar() * 60/this.options.tempo)
		};
		this.isOn = true;
		this.t0 = RH.getTime();
	}
	Game.prototype = {
		update : function(){
			var beatPerBar = this.options.timeSignature.beatPerBar();
			var shift = 1000/2 * (beatPerBar) * (60/this.options.tempo);
			var events = this.eventManager.getEvents(RH.getTime() - shift);
			//console.log(events[0]);
			this.screens.front.update(events);
			this.screens.back.update(events);
			return this.isOn;
		}
	};
	return Game;
}());

