RH.ScoreScreen = (function() {
	'use strict';
	/**
	 * time to make the travel from start to x
	 */
	var TRAJECTORY_TIME = 1000;

	var intermediatePosition = function(a, b, progress) {
		return a + (b - a) * progress;
	};
	var intermediatePoint = function(pointA, pointB, progress) {
		return {
			x: intermediatePosition(pointA.x, pointB.x, progress),
			y: intermediatePosition(pointA.y, pointB.y, progress)
		};
	};

	var pad = function(n, width, joiner) {
		joiner = joiner || '0';
		n = n + '';
		return n.length >= width ? n : new Array(width - n.length + 1).join(joiner) + n;
	};

	function ScoreProjectile(options) {
		RH.copyProperties(options, this);
		this.end = {
			x: this.start.x,
			y: this.start.y - 25
		};
	}

	ScoreProjectile.prototype = {
		draw: function(context, t) {
			var alpha = (t - this.t0) / TRAJECTORY_TIME;
			var point = intermediatePoint(this.start, this.end, Math.pow(alpha, 4));
			context.save();
			context.font = '18px Open Sans';
			context.fillStyle = this.color;
			context.fillText(this.value, point.x, point.y);
			context.restore();

		},
		isFinished: function(t) {
			return (t - this.t0) > TRAJECTORY_TIME;
		}
	};

	function ScoreScreen(options) {
		RH.copyProperties(options, this);
		this.currentIndex = 0;
		this.scoreProjectiles = [];
	}
	ScoreScreen.prototype = {
		draw: function(context, measureIndex, t) {
			// if (measureIndex < 1) {
			// return;
			// }
			var multiplier = this.scoreCalculator.multiplier;
			var totalScore = this.scoreCalculator.totalScore;
			if (measureIndex != this.currentIndex) {
				this.currentIndex = measureIndex;
				var score = this.scoreCalculator.measuresScore[measureIndex];
				if (score !== undefined) {
					var scoreType = score.getType();
					var newProjectile = new ScoreProjectile({
						t0: t,
						start: this.measurePosition,
						value: scoreType.label,
						color: scoreType.color
					});
					this.scoreProjectiles.push(newProjectile);
				}

			}
			var projectiles = [];
			for (var i = 0; i < this.scoreProjectiles.length; i++) {
				var projectile = this.scoreProjectiles[i];
				if (projectile.isFinished(t)) {
					this.totalScore = projectile.totalScore;
				} else {
					projectile.draw(context, t);
					projectiles.push(projectile);
				}
			}
			this.scoreProjectiles = projectiles;

			context.save();
			context.font = '20px scoreboard';
			context.fillStyle = 'grey';
			context.fillText(pad(Math.round(100 * totalScore), 5), this.scorePosition.x, this.scorePosition.y);
			context.restore();

			context.save();
			context.font = '20px Open Sans';
			context.fillStyle = 'grey';
			context.fillText("X" + multiplier, this.multiplierPosition.x, this.multiplierPosition.y);
			context.restore();

		}
	};
	return ScoreScreen;
}());