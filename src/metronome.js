RH.Metronome = (function() {
	'use strict';
	var SoundsManager = RH.SoundsManager;

	function Metronome(width, height) {
		this.width = width;
		this.height = height;
		this.currentBeat = null;
	}

	var POINTS = {};

	var drawDot = function(context, x, y) {
		context.beginPath();
		context.arc(x, y, 5, 0, 2 * Math.PI, false);
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


	POINTS[RH.TS.TWO_FOUR.toString()] = [{
		x: 1 / 2,
		y: 1
	}, {
		x: 1 / 2,
		y: 0
	}];


	POINTS[RH.TS.THREE_FOUR.toString()] = [{
		x: 1 / 2,
		y: 1
	}, {
		x: 1,
		y: 1 / 2
	}, {
		x: 1 / 2,
		y: 0
	}];

	POINTS[RH.TS.FOUR_FOUR.toString()] = [{
		x: 1 / 2,
		y: 1
	}, {
		x: 0,
		y: 1 / 2
	}, {
		x: 1,
		y: 1 / 2
	}, {
		x: 1 / 2,
		y: 0
	}];

	Metronome.prototype = {
		draw: function(context, measure, ellapsedBeats) {
			var timeSignature = measure.timeSignature;
			var width = this.width;
			var height = this.height;
			var division = RH.divide(ellapsedBeats, 1);
			var beatNumber = division.quotient;
			// the sound needs to start to be played a little bit before the exact change of the beat so it comes directly in the bottom of the beat
			var adjustedEllapsedBeats = RH.divide(ellapsedBeats + (SoundsManager.NOTE_DURATION / 2) * measure.getBeatPerMillisecond(), 1);
			var adjustedBeat = adjustedEllapsedBeats.quotient % measure.getBeatPerBar();
			if (this.currentBeat != adjustedBeat) {
				this.currentBeat = adjustedBeat;
				SoundsManager.play(adjustedBeat === 0 ? 'TIC' : 'TOC');
			}
			var points = POINTS[timeSignature.toString()];
			context.beginPath();
			context.strokeStyle = '#696969';
			context.lineWidth = 1;
			points.forEach(function(point, index) {
				context.moveTo(point.x * width, point.y * height);
				var nextPoint = RH.getArrayElement(points, index + 1);
				context.lineTo(nextPoint.x * width, nextPoint.y * height);
			});
			context.stroke();
			var p1 = RH.getArrayElement(points, beatNumber);
			var p2 = RH.getArrayElement(points, beatNumber + 1);
			var p = RH.intermediatePoint(p1, p2, convertProgression(division.rest));
			drawDot(context, width * p.x, height * p.y);

			context.font = "14px Arial, sans-serif";
			context.fillText(beatNumber + 1, 5, 10);
		}
	};
	return Metronome;
}());