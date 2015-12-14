RH.ScoreScreen = (function() {
	'use strict';

	function ScoreProjectile(options) {
		RH.copyProperties(options, this);
	}
	/**
	 * time to make the travel from start to x
	 */
	var TRAJECTORY_TIME = 1000;

	var intermediatePosition = function(a, b, progress) {
		return a + (b - a) * progress;
	};
	var intermediatePoint = function(pointA, pointB, progress) {
		return {
			x : intermediatePosition(pointA.x, pointB.x, progress),
			y : intermediatePosition(pointA.y, pointB.y, progress)
		};
	};
	ScoreProjectile.prototype = {
		draw : function(context, t) {
			var alpha = (t - this.t0) / TRAJECTORY_TIME;
			var point = intermediatePoint(this.start, this.end, Math.pow(alpha, 4));
			context.save();
			context.font = '12px scoreboard';
			context.fillStyle = 'black';
			context.fillText(this.value, point.x, point.y);
			context.restore();

		},
		isFinished : function(t) {
			return (t - this.t0) > TRAJECTORY_TIME;
		}
	};
	function ScoreScreen(options) {
		RH.copyProperties(options, this);
		this.currentIndex = -1;
		this.scoreProjectiles = [];
		this.totalScore = 0;
		this.multiplier = 0;
	}
	ScoreScreen.prototype = {
		draw : function(context, measureIndex, t) {
			// if (measureIndex < 1) {
			// return;
			// }
			var multiplier = this.scoreCalculator.multiplier;
			if (measureIndex != this.currentIndex) {
				this.currentIndex = measureIndex;
				var score = this.scoreCalculator.measuresScore[measureIndex];
				if (score !== undefined) {
					var newProjectile = new ScoreProjectile({
						t0 : t,
						start : this.measurePosition,
						end : this.scorePosition,
						value : numeral(100 * score.value() * multiplier).format("0"),
						totalScore : numeral(this.scoreCalculator.totalScore * 100).format("00000"),
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
			context.fillText(this.totalScore, this.scorePosition.x, this.scorePosition.y);
			context.restore();

			context.save();
			context.font = '20px arial';
			context.fillStyle = 'grey';
			context.fillText("X" + multiplier, this.multiplierPosition.x, this.multiplierPosition.y);
			context.restore();

		}
	};
	return ScoreScreen;
}());
