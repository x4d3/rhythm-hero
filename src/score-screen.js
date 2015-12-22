RH.ScoreScreen = (function() {
	'use strict';
	/**
	 * time to make the travel from start to x
	 */
	var TRAJECTORY_DURATION = 1500;
	var UPDATE_SCORE_DURATION = 2000;
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

	function AbstractProjectile(options) {
		RH.copyProperties(options, this);
	}

	AbstractProjectile.prototype = {
		isFinished: function(t) {
			return (t - this.t0) > TRAJECTORY_DURATION;
		}
	};

	function GoodScoreProjectile(options) {
		this.super(options);
		this.end = {
			x: this.start.x,
			y: this.start.y - 25
		};
	}

	RH.inherit(GoodScoreProjectile, AbstractProjectile, {
		draw: function(context, t) {
			var alpha = (t - this.t0) / TRAJECTORY_DURATION;
			var point = intermediatePoint(this.start, this.end, Math.pow(alpha, 4));
			context.save();
			context.font = '18px Open Sans';
			context.fillStyle = this.color;
			context.fillText(this.value, point.x, point.y);
			context.restore();
		}
	});

	function FailedScoreProjectile(options){
		this.super(options);
		this.end = {
			x: this.start.x - 10,
			y: this.start.y
		};
	}

	RH.inherit(FailedScoreProjectile, AbstractProjectile, {
		draw: function(context, t) {
			var alpha = (t - this.t0) / TRAJECTORY_DURATION;
			var point = intermediatePoint(this.start, this.end, Math.sin(10 * alpha * Math.PI));
			context.save();
			context.font = 'bold 18px Open Sans';
			context.fillStyle = this.color;
			context.fillText(this.value, point.x, point.y);
			context.restore();
		}
	});

	function ScoreScreen(options) {
		RH.copyProperties(options, this);
		this.currentIndex = 0;
		this.GoodScoreProjectiles = [];
		this.totalScore = 0;
		this.targetTotalScore = 0;
		this.totalScoreUpdateTime = 0;
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
					var options = {
						t0: t,
						start: this.measurePosition,
						value: scoreType.label,
						color: scoreType.color
					};
					var newProjectile;
					if(score.isFailed()){
						newProjectile = new FailedScoreProjectile(options);
					}else{
						newProjectile = new GoodScoreProjectile(options);
					}
					this.GoodScoreProjectiles.push(newProjectile);
				}

			}
			var projectiles = [];
			for (var i = 0; i < this.GoodScoreProjectiles.length; i++) {
				var projectile = this.GoodScoreProjectiles[i];
				if (!projectile.isFinished(t)) {
					projectile.draw(context, t);
					projectiles.push(projectile);
				}
			}
			this.GoodScoreProjectiles = projectiles;

			context.save();
			context.font = '32px scoreboard';
			context.fillStyle = '#696969';
			this.updateTotalScore(totalScore, t);

			context.fillText(pad(Math.round(100 * this.totalScore), 5), this.scorePosition.x, this.scorePosition.y);
			context.restore();

			context.save();
			context.font = '32px Open Sans';
			context.fillStyle = '#696969';
			context.fillText("X" + multiplier, this.multiplierPosition.x, this.multiplierPosition.y);
			context.restore();

		},
		updateTotalScore: function(totalScore, t) {
			if (this.targetTotalScore != totalScore) {
				this.targetTotalScore = totalScore;
				this.totalScoreUpdateTime = t;
			}
			var progress = Math.min(1, (t - this.totalScoreUpdateTime) / UPDATE_SCORE_DURATION);
			this.totalScore = intermediatePosition(this.totalScore, this.targetTotalScore, progress);
		}
	};
	return ScoreScreen;
}());