RH.Application = (function(){
	var Game = RH.Game;
	var EventManager = RH.EventManager;
	
	function Application(canvas) {
		this.canvas = canvas;
		this.eventManager = new EventManager();
	}
	
	Application.prototype = {
		getEventManager : function(){
			return this.eventManager;
		},
		start : function(){
			var game = new Game(this.eventManager, this.canvas);
			(function animloop(){
				game.update();
				if (game.isOn()){
					requestAnimFrame(animloop);	
				}
			})();
		
		}
	};
	return Application;
}());

$( document ).ready(function() {
	var canvas = $("canvas");
	var application = new RH.Application(canvas[0]);
	var onDown = function(event){
		application.getEventManager().onDown(event);
		event.preventDefault();
	};
	var onUp = function(event){
		application.getEventManager().onUp(event);
		event.preventDefault();
	};
	canvas.mousedown(onDown).mouseup(onUp);
	$("body").keydown(onDown).keyup(onUp);

	
});

