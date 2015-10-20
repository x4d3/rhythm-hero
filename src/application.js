RH.Application = (function(){
	var Game = RH.Game;
	var EventManager = RH.EventManager;
	
	function getParameterByName(name) {
		name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
		var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
		results = regex.exec(location.search);
		return results === null ? null : decodeURIComponent(results[1].replace(/\+/g, " "));
	}
	
	function Application(canvas) {
		this.canvas = canvas;
		this.eventManager = new EventManager();
	}
	
	Application.prototype = {
		getEventManager : function(){
			return this.eventManager;
		},
		start : function(){
			var tempo = getParameterByName('tempo');
			var ts = getParameterByName('ts');
			var parsedTempo = tempo ? parseInt(tempo, 10): null;
			var parsedTS = ts? RH.TimeSignature.parse(ts):null;
			var game = new Game(this.eventManager, this.canvas, new RH.GameOptions(parsedTS, parsedTempo));
			(function animloop(){
				var isOn = game.update();
				if (isOn){
					requestAnimFrame(animloop);	
				}
			})();
		
		}
	};
	return Application;
}());

$( document ).ready(function() {
	var canvas = $("canvas");
	if (canvas.length){
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
		
		application.start();
	}
});

