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

	//the movement should be slower and then faster going to the target point, like a conductor would do
	var convertProgression = function(rest){
		return Math.pow(rest, 4);
	};
	
	DRAWERS[RH.TS.THREE_FOUR.toString()] = function(metronome, context, ellapsedBeats){
		var division = RH.divide(ellapsedBeats, 1);
		var x;
		var y;
		var alpha = convertProgression(division.rest);
		switch(division.quotient) {
			case 0:
				x = alpha;
				y = Math.sqrt(3/4);
				break;
			case 1:
				x = 1 - 1/2 * alpha;
				y = Math.sqrt(3/4) * (1 - alpha);
				break;
			case 2:
				x = 1/2 * (1 - alpha);
				y = alpha * Math.sqrt(3/4);
				break;
		}
		context.fillText(division.quotient + 1, 5 , 10);
		drawDot(context, metronome.width * x , metronome.height * y);
	};
	DRAWERS[RH.TS.FOUR_FOUR.toString()] = function(metronome, context, ellapsedBeats){
		var division = RH.divide(ellapsedBeats, 1);
		var x;
		var y;
		var alpha = convertProgression(division.rest);
		switch(division.quotient) {
			case 0:
				x = 1/2 * (1 - alpha);
				y = 1 - 1/2 * alpha;
				break;
			case 1:
				x = alpha;
				y = 1/2;
				break;
			case 2:
				x = 1 - alpha * 1/2;
				y = 1/2 * (1 - alpha);
				break;
			case 3:
				x = 1/2;
				y = alpha;
				break;
		}
		context.beginPath();
		context.lineWidth = 1;
		context.moveTo(0.5 * metronome.width, 0);
		context.lineTo(0.5 * metronome.width, metronome.height);
		context.moveTo(0, 0.5 * metronome.height);
		context.lineTo(metronome.width, 0.5 * metronome.height);
		context.stroke();
		context.fillText(division.quotient + 1, 5 , 10);
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
