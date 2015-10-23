RH.GameOptions = (function(){
	'use strict';
	function GameOptions(timeSignature, tempo){
		this.timeSignature = timeSignature ? timeSignature:RH.TS.FOUR_FOUR;
		//beat per minutes
		this.tempo = tempo?tempo:60; 
	}
	GameOptions.prototype = {
		getBeatPerMillisecond : function(){
			return this.tempo/(60 * 1000);
		},getBeatPerBar : function(){
			return this.timeSignature.getBeatPerBar();
		}
	};
	return GameOptions;
}());

RH.Game = (function(){
	'use strict';
	function Game(eventManager, canvases, options) {
		this.eventManager = eventManager;
		this.options = options;
		this.screens = {
			front: new RH.DebugGameScreen(canvases.front, options),
			back: new RH.GameScreen(canvases.back, options)
		};
		this.isOn = true;
		this.t0 = RH.getTime();
	}
	
	Game.prototype = {
		update : function(){
			var t = RH.getTime();
			var ellapsed = t - this.t0;
			var beatPerBar = this.options.getBeatPerBar();
			var beatPerMs = this.options.getBeatPerMillisecond();
			var shift = 0.5 * beatPerBar / beatPerMs;
			var events = this.eventManager.getEvents(t - shift);
			this.screens.front.update(events, ellapsed);
			this.screens.back.update(ellapsed);
			return this.isOn;
		}
	};
	return Game;
}());

