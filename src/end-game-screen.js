RH.EndGameScreen = (function() {
	'use strict';
	var ScoreScreen = RH.ScoreScreen;

	function EndGameScreen(canvas, game, bestScore, callback) {
		this.canvas = canvas;
		this.game = game;
		this.callback = callback;
		this.t0 = RH.getTime();
		this.isOn = true;
		var ctx = this.canvas.getContext("2d");
		ctx.save();
		ctx.font = "40px arcadeclassic";
		ctx.fillStyle = "#696969";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		var score = this.game.scoreCalculator.totalScore;
		var w = this.canvas.width / 2;
		var h = this.canvas.height / 2 + 10;
		var writeText = function(text) {
			ctx.fillText(text, w, h);
			h += 50;
		};

		if (this.game.scoreCalculator.hasLost()) {
			writeText("Game Over");
			h += 50;
			writeText("Press a button to restart level");
		} else {
			writeText("Congratulation");
			var message = "You scored " + ScoreScreen.formatTotal(this.game.scoreCalculator.totalScore) + " points";
			if (score === bestScore) {
				message += " This is a new record";
			}	
			writeText(message);
			writeText("Press a button to go the next level");
		}
		ctx.restore();
	}
	EndGameScreen.prototype = {
		update: function() {},
		stop: function() {
			this.isOn = false;
			this.callback();
		},
		onEvent: function(isUp, event) {
			if (this.isOn && !isUp && RH.getTime() > this.t0 + 500) {
				this.stop();
			}
		}
	};
	return EndGameScreen;
}());