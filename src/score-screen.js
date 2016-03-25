RH.ScoreScreen = (function() {
	'use strict';
	/**
	 * time to make the travel from start to x
	 */
	var TRAJECTORY_DURATION = 1000;
	var UPDATE_SCORE_DURATION = 2000;
	var UPDATE_LIFE_DURATION = 1000;
	var LIFE_WIDTH = 80;
	var LIFE_HEIGHT = 10;
	var intermediatePoint = RH.intermediatePoint;
	var intermediatePosition = RH.intermediatePosition;


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

	function FailedScoreProjectile(options) {
		this.super(options);
		this.end = {
			x: this.start.x - 3,
			y: this.start.y
		};
	}

	RH.inherit(FailedScoreProjectile, AbstractProjectile, {
		draw: function(context, t) {
			var alpha = (t - this.t0) / TRAJECTORY_DURATION;
			var point = intermediatePoint(this.start, this.end, Math.sin(15 * alpha * Math.PI));
			context.save();
			context.font = '18px Open Sans';
			context.fillStyle = this.color;
			context.fillText(this.value, point.x, point.y);
			context.restore();
		}
	});

	function TargetableScore(updateDuration) {
		this.updateDuration = updateDuration;
		this.target = null;
		this.value = null;
		this.previousValue = null;
		this.updateTime = null;
	}
	TargetableScore.prototype = {
		update: function(newValue, t) {
			if (this.target != newValue) {
				this.target = newValue;
				this.previousValue = this.value;
				this.updateTime = t;
			}
			if (this.value === null) {
				this.value = this.target;
			} else {
				var progress = Math.min(1, (t - this.updateTime) / this.updateDuration);
				this.value = intermediatePosition(this.previousValue, this.target, progress);
			}
		}
	};

	function ScoreScreen(options) {
		RH.copyProperties(options, this);
		this.currentIndex = 0;
		this.projectiles = [];
		this.totalScore = new TargetableScore(UPDATE_SCORE_DURATION);
		this.life = new TargetableScore(UPDATE_LIFE_DURATION);
	}
	ScoreScreen.formatTotal = function(totalScore) {
		return pad(Math.round(100 * totalScore), 5);
	};

	ScoreScreen.prototype = {
		draw: function(context, measurePosition, measureIndex, measureInfo) {
			context.save();
			var t = measureInfo.t;
			var multiplier = this.scoreCalculator.multiplier;
			var totalScore = this.scoreCalculator.totalScore;
			if (measureIndex != this.currentIndex && (measureInfo.status == RH.Game.STATUS.STARTED)) {
				this.currentIndex = measureIndex;
				var score = this.scoreCalculator.measuresScore[measureIndex];
				if (measureIndex > 0) {
					var scoreType = score.getType();
					var options = {
						t0: t,
						start: measurePosition,
						value: scoreType.label,
						color: scoreType.color
					};
					var newProjectile;
					if (score.isFailed()) {
						newProjectile = new FailedScoreProjectile(options);
					} else {
						newProjectile = new GoodScoreProjectile(options);
					}
					this.projectiles.push(newProjectile);
				}

			}


			context.font = '32px scoreboard';
			context.fillStyle = '#696969';
			this.totalScore.update(totalScore, t);

			context.fillText(ScoreScreen.formatTotal(this.totalScore.value), this.scorePosition.x, this.scorePosition.y);


			context.font = '32px arcadeclassic';
			context.fillStyle = '#696969';
			context.fillText("X" + multiplier, this.multiplierPosition.x, this.multiplierPosition.y);


			if (this.scoreCalculator.withLife) {
				this.life.update(this.scoreCalculator.life, t);
				context.lineWidth = 5;
				context.strokeStyle = '#696969';
				context.rect(this.lifePosition.x, this.lifePosition.y - LIFE_HEIGHT, LIFE_WIDTH, LIFE_HEIGHT);
				context.stroke();
				context.fillStyle = '#696969';
				context.fillRect(this.lifePosition.x, this.lifePosition.y - LIFE_HEIGHT, LIFE_WIDTH * this.life.value, LIFE_HEIGHT);

			}

			if (measureInfo.status == RH.Game.STATUS.SCORE_SCREEN) {
				var best = this.scoreCalculator.scoreManager.best;
				if (best) {
					context.font = '32px scoreboard';
					context.fillStyle = '#696969';
					context.fillText(ScoreScreen.formatTotal(best), this.scorePosition.x, this.scorePosition.y + 40);

				}
				if (this.scoreCalculator.hasLost()) {
					context.font = '32px arcadeclassic';
					context.fillStyle = '#696969';
					context.textAlign = "center";
					context.textBaseline = "middle";
					context.fillText('Game Over', this.center.x, this.center.y);
				}
			}
			this.drawProjectiles(context, t);
			context.restore();
		},
		drawProjectiles: function(context, t) {
			var projectiles = [];
			for (var i = 0; i < this.projectiles.length; i++) {
				var projectile = this.projectiles[i];
				if (!projectile.isFinished(t)) {
					projectile.draw(context, t);
					projectiles.push(projectile);
				}
			}
			this.projectiles = projectiles;
		}

	};


	return ScoreScreen;
}());