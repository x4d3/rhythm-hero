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
	function TargetableScore(updateDuration){
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
			if(this.value === null){
				this.value = this.target;
			}else{
				var progress = Math.min(1, (t - this.updateTime) / this.updateDuration);
				this.value = intermediatePosition(this.previousValue, this.target, progress);
			}			
		}
	};
	function ScoreScreen(options) {
		RH.copyProperties(options, this);
		this.currentIndex = 0;
		this.GoodScoreProjectiles = [];
		this.totalScore = new TargetableScore(UPDATE_SCORE_DURATION);
		this.life = new TargetableScore(UPDATE_LIFE_DURATION);
	}
	ScoreScreen.formatTotal = function(totalScore){
		return pad(Math.round(100 * totalScore), 5);
	};

	ScoreScreen.prototype = {
		draw: function(context, measurePosition, measureIndex, t) {
			// if (measureIndex < 1) {
			// return; = 
			// }
			var multiplier = this.scoreCalculator.multiplier;
			var totalScore = this.scoreCalculator.totalScore;
			if (measureIndex != this.currentIndex) {
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
			this.totalScore.update(totalScore, t);

			context.fillText(ScoreScreen.formatTotal(this.totalScore.value), this.scorePosition.x, this.scorePosition.y);
			context.restore();

			context.save();
			context.font = '32px arcadeclassic';
			context.fillStyle = '#696969';
			context.fillText("X" + multiplier, this.multiplierPosition.x, this.multiplierPosition.y);
			context.restore();

			if(this.scoreCalculator.withLife){
				this.life.update(this.scoreCalculator.life, t); 
				context.save();
				context.strokeStyle = "black";
				context.rect(this.lifePosition.x, this.lifePosition.y - LIFE_HEIGHT, LIFE_WIDTH, LIFE_HEIGHT);
				context.stroke();
				context.fillStyle = '#696969';
				context.fillRect(this.lifePosition.x, this.lifePosition.y- LIFE_HEIGHT, LIFE_WIDTH* this.life.value, LIFE_HEIGHT);
				context.restore();
			}
		},

	};

	
	return ScoreScreen;
}());