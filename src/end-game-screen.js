RH.EndGameScreen = (function() {
	'use strict';

	function EndGameScreen(canvas, game, callback) {
		this.canvas = canvas;
		this.game = game;
		this.callback = callback;
	}

	EndGameScreen.prototype = {
		start: function() {
			var screen = this;
			this.t0 = RH.getTime();
			this.isOn = true;
			(function animloop() {
				if (screen.isOn) {
					screen.update();
					requestAnimFrame(animloop);
				}
			})();
		},
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
			if (this.game.isFinished) {
				ctx.fillText("WIN", 10, 90);
			} else {
				ctx.fillText("LOOSE", 10, 90);
			}
			if (RH.getTime() > this.t0 + 5000) {
				this.stop(false);
			}
		},
		stop: function(forced) {
			this.isOn = false;
			if (!forced) {
				this.callback();
			}
		},
		onEvent: function(isUp, event) {
			if (this.isOn) {
				this.stop(false);
			}
		}

	};

	return EndGameScreen;
}());