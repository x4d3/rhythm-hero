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
	var MULTIPLIERS_FONT = [24, 30, 36, 42];

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
		},
		draw: function(context, t) {
			var alpha = (t - this.t0) / TRAJECTORY_DURATION;
			var point = intermediatePoint(this.start, this.end, Math.pow(alpha, 0.5));
			context.save();
			context.font = '18px Open Sans';
			context.fillStyle = this.color;
			context.fillText(this.value, point.x, point.y);
			context.restore();
		}
	};

	function GoodScoreProjectile(options) {
		this.super(options);
		this.end = {
			x: this.start.x,
			y: this.start.y - 25
		};
	}

	RH.inherit(GoodScoreProjectile, AbstractProjectile);

	function FailedScoreProjectile(options) {
		this.super(options);
		this.end = {
			x: this.start.x - 3,
			y: this.start.y + 25
		};
	}

	RH.inherit(FailedScoreProjectile, AbstractProjectile);

	function TargetableScore(updateDuration, getValueFromProgress) {
		this.updateDuration = updateDuration;
		this.target = null;
		this.value = null;
		this.previousValue = null;
		this.updateTime = null;
		this.getValueFromProgress = getValueFromProgress ? getValueFromProgress : intermediatePosition;
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
				this.value = this.getValueFromProgress(this.previousValue, this.target, progress);
			}
		}
	};

	function ScoreScreen(options) {
		RH.copyProperties(options, this);
		this.currentIndex = 0;
		this.projectiles = [];
		this.totalScore = new TargetableScore(UPDATE_SCORE_DURATION);
		this.life = new TargetableScore(UPDATE_LIFE_DURATION);
		this.multiplierSize = new TargetableScore(250, function(a, b, progress) {
			var c = a + 4 * (b - a);
			var alpha = 0.7;
			var result;
			if (progress < alpha) {
				result = intermediatePosition(a, c, progress / alpha);
			} else {
				result = intermediatePosition(c, b, (progress - alpha) / (1 - alpha));
			}
			return RH.keepBetween(5, 55, result);
		});
		this.multiplierSize.value = 28;
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
			if (measureIndex != this.currentIndex) {
				this.currentIndex = measureIndex;
				var score = this.scoreCalculator.measuresScore[measureIndex];
				if (score !== undefined && measureIndex > 0) {
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
			context.textAlign = "right";
			context.textBaseline = "middle";
			this.totalScore.update(totalScore, t);

			context.fillText(ScoreScreen.formatTotal(this.totalScore.value), this.scorePosition.x, this.scorePosition.y);

			this.multiplierSize.update(MULTIPLIERS_FONT[multiplier - 1], t);
			context.font = this.multiplierSize.value + 'px arcadeclassic';
			context.textAlign = "center";
			context.fillStyle = '#696969';
			context.textBaseline = "middle";
			context.fillText("X" + multiplier, this.multiplierPosition.x, this.multiplierPosition.y);


			if (this.scoreCalculator.withLife) {
				this.life.update(this.scoreCalculator.life, t);
				context.lineWidth = 1;
				context.strokeStyle = '#696969';
				context.rect(this.lifePosition.x, this.lifePosition.y - LIFE_HEIGHT, LIFE_WIDTH, LIFE_HEIGHT);
				context.stroke();
				context.fillStyle = '#696969';
				context.fillRect(this.lifePosition.x, this.lifePosition.y - LIFE_HEIGHT, LIFE_WIDTH * this.life.value, LIFE_HEIGHT);
			}
			if (measureInfo.status == RH.Game.STATUS.SCORE_SCREEN) {
				var best = this.scoreCalculator.scoreManager.best;
				var bestScoreBeaten = this.scoreCalculator.scoreManager.bestScoreBeaten;

				if (best) {
					if (!bestScoreBeaten || ((t % 1000) > 300)) {
						context.font = '32px scoreboard';
						context.fillStyle = '#696969';
						context.textAlign = "right";
						context.textBaseline = "middle";
						context.fillText('HS: ' + ScoreScreen.formatTotal(best), this.scorePosition.x, this.scorePosition.y + 40);
					}
				}
				if (this.scoreCalculator.hasLost()) {
					context.font = '32px arcadeclassic';
					context.fillStyle = '#696969';
					context.textAlign = "center";
					context.textBaseline = "middle";
					context.fillText('Game Over', this.center.x, this.center.y);
				} else {
					context.font = '20px arcadeclassic';
					context.fillStyle = '#696969';
					context.textAlign = "left";
					context.textBaseline = "middle";
					var x = this.center.x;
					var y = this.center.y - 25;
					this.scoreCalculator.scoresTypeCount().reverse().forEach(function(scoreType) {
						context.fillText(scoreType.label, x - 100, y);
						context.fillText(scoreType.count, x + 50, y);
						y += 25;
					});
					y += 10;
					context.fillText('Longest Combo', x - 100, y);
					context.fillText(this.scoreCalculator.maxGoodMeasuresCount, x + 50, y);

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