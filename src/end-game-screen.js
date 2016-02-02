RH.EndGameScreen = (function() {
	'use strict';

	function EndGameScreen(canvas, game, callback) {
		this.canvas = canvas;
		this.game = game;
		this.callback = callback;
		this.t0 = RH.getTime();
		this.isOn = true;
	}

	EndGameScreen.prototype = {
		update: function() {
			var ctx = this.canvas.getContext("2d");
			ctx.font = "30px Verdana";
			// Create gradient
			var gradient = ctx.createLinearGradient(0, 0, this.canvas.width, 0);
			gradient.addColorStop("0", "magenta");
			gradient.addColorStop("0.5", "blue");
			gradient.addColorStop("1.0", "red");
			// Fill with gradient
			ctx.fillStyle = gradient;
			if (this.game.scoreCalculator.hasLost()) {
				ctx.fillText("LOOSE", 10, 90);
			} else {
				ctx.fillText("WIN", 10, 90);
			}
			if (RH.getTime() > this.t0 + 5000) {
				this.stop();
			}
		},
		stop: function() {
			this.isOn = false;
			this.callback();
		},
		onEvent: function(isUp, event) {
			if (this.isOn && !isUp) {
				this.stop();
			}
		}

	};

	return EndGameScreen;
}());