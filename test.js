var xade = xade || {};
(function(){
	var CANVAS = null; 
	var CTX = null;
	var CANVAS_WIDTH = 1000;
	var CANVAS_HEIGHT = 500;
	var SPEED = 10;//px by seconds
	var POSITIONS = new Array(CANVAS_WIDTH/2);
	var MUSIC = new Array(CANVAS_WIDTH);
	
	window.requestAnimFrame = (function(){
	  return  window.requestAnimationFrame       ||
			  window.webkitRequestAnimationFrame ||
			  window.mozRequestAnimationFrame    ||
			  function( callback ){
				window.setTimeout(callback, 1000 / 60);
			  };
	})();



	window.onload = function(event) {
		init();

		(function animloop(){
		  requestAnimFrame(animloop);
		  render();
		})();
	};
	var init = function(){
		CANVAS = document.createElement( 'canvas' );
		CANVAS.width = CANVAS_WIDTH;
		CANVAS.height = CANVAS_HEIGHT;
		CTX = CANVAS.getContext("2d");
		CANVAS.addEventListener("mouseup", onmouseup);
		CANVAS.addEventListener("mousedown", onmousedown);
		document.body.appendChild( CANVAS ); 
	}
	var isLow = false;
	var lastHit = xade.getTime();
	var render = function(){
		var elapsedSeconds = (xade.getTime() - lastHit)/1000;
		var pixelShift = Math.min(elapsedSeconds * SPEED | 0,POSITIONS.length);
		if (pixelShift > 0){
			for (var i = 0; i < POSITIONS.length; i++){
				CTX.clearRect(i,toPixel(POSITIONS[i]),1,1);
			}
			for (var i = 0; i < POSITIONS.length - pixelShift; i++){
				POSITIONS[i] = POSITIONS[i + pixelShift];
			}
			for (var i = 0; i < pixelShift; i++){
				var currentTime = lastHit + i/SPEED;
				
				while(mouseEvents.length > 0){
					var eventTime = mouseEvents[0];
					if (currentTime > eventTime){
						mouseEvents.splice(0,1);
						isLow = !isLow;
					}else{
						break;
					}
				}
				POSITIONS[i + POSITIONS.length - pixelShift] = isLow;
			}
			for (var i = 0; i < POSITIONS.length; i++){
				CTX.fillRect(i,toPixel(POSITIONS[i]),1,1);
			}
			lastHit = xade.getTime();
		}
		

	}
	var toPixel = function(position){
		return position ? 100:200
	}
	
	var mouseEvents = [];
	var onmouseup = function(){
		mouseEvents.push(xade.getTime());
	};
	var onmousedown = function(){
		mouseEvents.push(xade.getTime());
	};
})();