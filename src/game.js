RH.Game = (function(){
	function Game(eventManager, canva, options) {
		this.eventManager = eventManager;
		this.canva = canva;
		this.options = options;
		this._isOn = true;
		this.t0 = RH.getTime();
		
	}
	Game.prototype = {
		isOn : function(){
			return this._isOn;
		},
		update : function(){
		}
	};
	return Game;
}());

