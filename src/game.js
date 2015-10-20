RH.TimeSignature = (function(){
	function TimeSignature(numerator, denumerator){
		this.numerator = numerator;
		this.denumerator = denumerator;
	}
	TimeSignature.prototype = {
		toString: function(){
			return numerator + "/" + denumerator;
		},
		// one beat = one 1/4th
		beatPerBar : function(){
			return numerator * 4 / denumerator;
		}
	};
	return TimeSignature;
}());


RH.TS = {
	FOUR_FOUR : new RH.TimeSignature(4, 4)
};

RH.GameOptions = (function(){
	function GameOptions(timeSignature, tempo){
		this.timeSignature = timeSignature;
		this.tempo = tempo;
	}
	GameOptions.prototype = {
	};
	return GameOptions;
}());

RH.GameScreen = (function(){
	function GameScreen(canva) {
		this.canva = canva;
	}
	GameScreen.prototype = {
		update : function(ups){

		}
	};
	return GameScreen;
}());

RH.Game = (function(){
	function Game(eventManager, canva, options) {
		this.eventManager = eventManager;
		this.canva = canva;
		this.options = options;
		this.isOn = true;
		this.t0 = RH.getTime();

	}
	Game.prototype = {
		update : function(){

		}
	};
	return Game;
}());

