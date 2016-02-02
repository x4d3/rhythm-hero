RH.Metronome = (function() {
	'use strict';
	var SoundsManager = RH.SoundsManager;
	function Metronome(width, height) {
		this.width = width;
		this.height = height;
		this.currentBeat = -1;
	}

	var DRAWERS = {};

	var drawDot = function(context, x, y) {
		context.beginPath();
		context.arc(x, y, 3, 0, 2 * Math.PI, false);
		context.fillStyle = 'green';
		context.fill();
		context.lineWidth = 1;
		context.strokeStyle = '#003300';
		context.stroke();
	};

	//the movement should be slower and then faster going to the target point, like a conductor would do
	var convertProgression = function(rest) {
		return Math.pow(rest, 5);
	};

	DRAWERS[RH.TS.THREE_FOUR.toString()] = function(metronome, context, beatNumber, progression) {

		var x;
		var y;
		switch (beatNumber) {
		case 0:
			x = progression;
			y = Math.sqrt(3 / 4);
			break;
		case 1:
			x = 1 - 1 / 2 * progression;
			y = Math.sqrt(3 / 4) * (1 - progression);
			break;
		case 2:
			x = 1 / 2 * (1 - progression);
			y = progression * Math.sqrt(3 / 4);
			break;
		}
		drawDot(context, metronome.width * x, metronome.height * y);
	};
	DRAWERS[RH.TS.FOUR_FOUR.toString()] = function(metronome, context, beatNumber, progression) {
		var x;
		var y;
		switch (beatNumber) {
		case 0:
			x = 1 / 2 * (1 - progression);
			y = 1 - 1 / 2 * progression;
			break;
		case 1:
			x = progression;
			y = 1 / 2;
			break;
		case 2:
			x = 1 - progression * 1 / 2;
			y = 1 / 2 * (1 - progression);
			break;
		case 3:
			x = 1 / 2;
			y = progression;
			break;
		}
		context.beginPath();
		context.lineWidth = 1;
		context.moveTo(0.5 * metronome.width, 0);
		context.lineTo(0.5 * metronome.width, metronome.height);
		context.moveTo(0, 0.5 * metronome.height);
		context.lineTo(metronome.width, 0.5 * metronome.height);
		context.stroke();

		drawDot(context, metronome.width * x, metronome.height * y);
	};
	Metronome.prototype = {
		draw : function(context, timeSignature, ellapsedBeats) {
			context.save();
			var division = RH.divide(ellapsedBeats, 1);
			var beatNumber = division.quotient;
			if (this.currentBeat != beatNumber) {
				this.currentBeat = beatNumber;
				SoundsManager.play(beatNumber === 0 ? 'TIC' : 'TOC');
			}
			var progression = division.rest;
			DRAWERS[timeSignature.toString()](this, context, beatNumber, convertProgression(progression));
			context.fillText(beatNumber + 1, 5, 10);
			context.restore();
		}
	};
	return Metronome;
}());
