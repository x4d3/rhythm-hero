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

