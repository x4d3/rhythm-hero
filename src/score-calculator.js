RH.ScoreCalculator = (function() {
	'use strict';
	var logger = RH.logManager.getLogger('ScoreCalculator');
	var MAX_START_DIFF = 200;
	var MAX_DURATION_DIFF = 0.8;
	var MAX_FAILED_RATIO = 0.20;
	var FAILED_REASONS = {
		TOO_EARLY: 'Too Early',
		TOO_LATE: 'Too Late',
		TOO_SHORT: 'Too Short',
		TOO_LONG: 'Too Long',
		TOO_MANY_PRESSES: 'Pressed Too Much',
		NOT_PLAYED: 'Not Played'
	};


	function ScoreType(value, label, icon, color) {
		this.value = value;
		this.label = label;
		this.icon = icon;
		this.color = color;
	}

	var SCORE_TYPES = [new ScoreType(0.1, "Boo", "E", "orange"), new ScoreType(0.5, "Average", "D", "maroon"), new ScoreType(0.6, "Good", "C", "grey"),
		new ScoreType(0.7, "Great", "B", "olive"), new ScoreType(0.8, "Awesome", "A", "green"), new ScoreType(0.9, "Perfect", "✔", "green")
	];
	var SCORE_TYPES_VALUES = SCORE_TYPES.map(function(s) {
		return s.value;
	});

	function SuccessNoteScore(value) {
		this.value = value;
		this.isFailed = false;
		this.failureReasons = [];
	}
	SuccessNoteScore.prototype = {
		toString: function() {
			return this.value;
		}
	};

	function FailedNoteScore(failureReasons) {
		this.value = 0;
		this.isFailed = true;
		this.failureReasons = failureReasons;
	}
	FailedNoteScore.prototype = {
		toString: function() {
			return this.failureReasons.join(',');
		}
	};
	var PERFECT = new SuccessNoteScore(1);

	function MeasureScore(notes) {
		this.notes = notes;
	}
	MeasureScore.prototype = {
		value: function() {
			if (this.isFailed()) {
				return 0;
			} else {
				var sum = 0;
				for (var i = 0; i < this.notes.length; i++) {
					sum += this.notes[i].value;
				}
				return sum / this.notes.length;
			}
		},
		isFailed: function() {
			var failedNumber = 0;
			for (var i = 0; i < this.notes.length; i++) {
				if (this.notes[i].isFailed) {
					failedNumber++;
				}
			}
			return failedNumber / this.notes.length >= 0.2;
		},
		toString: function() {
			return this.notes.join(" | ");
		},
		getMainFailureReason: function() {
			var result = {};
			this.notes.forEach(function(note) {
				note.failureReasons.forEach(function(key) {
					result[key] = 1 + (result[key] ? result[key] : 0);
				});
			});
			var max = 0;
			var maxKey = null;
			Object.keys(result).forEach(function(key) {
				if (result[key] > max) {
					maxKey = key;
					max = result[key];
				}
			});
			return FAILED_REASONS[maxKey];
		},
		getType: function() {
			if (this.isFailed()) {
				return new ScoreType(0, this.getMainFailureReason(), "✗", "red");
			} else {
				return SCORE_TYPES[RH.binarySearch(SCORE_TYPES_VALUES, this.value())];
			}
		}
	};


	function ScoreCalculator(eventManager, measures, withLife, scoreManager) {
		this.eventManager = eventManager;
		this.measures = measures;
		this.withLife = withLife;
		this.scoreManager = scoreManager;
		this.life = 0.8;
		this.measuresScore = [];
		this.multiplier = 1;
		this.totalScore = 0;
		this.goodMeasureCount = 0;
	}

	var keepBetween = function(min, max, value) {
		if (value > max) {
			return max;
		} else if (value < min) {
			return min;
		} else {
			return value;
		}
	};

	var calculateNoteScore = function(startDiff, durationDiff, notesPlayedBetween) {
		var failureReasons = [];
		var addFailureReason = function(failureType, isFailed) {
			if (isFailed) {
				failureReasons.push(failureType);
			}
		};
		addFailureReason('TOO_EARLY', startDiff < -MAX_START_DIFF);
		addFailureReason('TOO_LATE', startDiff > MAX_START_DIFF);
		addFailureReason('TOO_SHORT', durationDiff < -MAX_DURATION_DIFF);
		addFailureReason('TOO_LONG', durationDiff > MAX_DURATION_DIFF);
		addFailureReason('TOO_MANY_PRESSES', notesPlayedBetween);
		if (failureReasons.length > 0) {
			return new FailedNoteScore(failureReasons);
		} else {
			var x = Math.max(1 - Math.abs(startDiff / MAX_START_DIFF), 0);
			var y = Math.max(MAX_DURATION_DIFF - Math.abs(durationDiff), 0);
			return new SuccessNoteScore(0.1 + 0.6 * x + 0.3 * y);
		}
	};
	/**this.life = Math.max(this.life - 0.25, 0);
	 * in milliseconds
	 */
	var EPSILON = 10;
	var NO_SCORE = new MeasureScore([]);
	ScoreCalculator.prototype = {
		hasLost: function() {
			return this.withLife && this.life === 0;
		},
		/**
		 * awful awful code.. again...
		 *
		 * @param t
		 * @param measureIndex
		 */
		addMeasureScore: function(t, measureIndex) {
			var eventManager = this.eventManager;
			if (measureIndex < 0) {
				return;
			}
			var measure = this.measures[measureIndex];
			if (measure.isEmpty) {
				this.measuresScore[measureIndex] = NO_SCORE;
				return;
			}
			var bpm = measure.getBeatPerMillisecond();
			var epsilon = RH.REST_PERCENTAGE / bpm;
			var measureDuration = measure.getDuration();

			var noteStartTime = t - measureDuration;
			var notes = measure.notes;
			var notesScores = new MeasureScore(notes.map(function(note, noteIndex) {
				var originalDuration = note.duration.value() / bpm;
				var expectedDuration;
				if (note.isRest) {
					expectedDuration = originalDuration;
				} else {
					expectedDuration = originalDuration - epsilon;
				}
				var start = noteStartTime;
				var end = start + expectedDuration;
				var events = eventManager.getEventsBetween(start, end);
				noteStartTime = start + originalDuration;

				var nextNoteIsRest = (noteIndex < notes.length - 1) && (notes[noteIndex + 1].isRest);

				if (events.length === 0) {
					if (note.isRest) {
						return PERFECT;
					} else {
						return new FailedNoteScore(['NOT_PLAYED']);
					}
				}
				var index = 0;
				// the previous note is not the right kind, we pick the next one
				if (events[0].isPressed === note.isRest) {
					if (events.length == 1) {
						if (events[0].t > end && note.isRest) {
							return PERFECT;
						} else {
							return new FailedNoteScore(['NOT_PLAYED']);
						}
					}
					index = 1;
				}
				var eventStart;
				if ((measure.firstNotePressed && noteIndex === 0) || note.isRest) {
					eventStart = Math.max(start, events[index].t);
				} else {
					eventStart = events[index].t;
				}
				if (index === 0 && !note.isRest && events.length > 2 && Math.abs(events[2].t - start) < Math.abs(eventStart - start)) {
					index = 2;
					eventStart = events[2].t;
				}

				if (events[index].t > end) {
					return new FailedNoteScore(['TOO_LATE']);
				}

				var startDiff = eventStart - start;
				var nextEventT;
				if (index + 1 < events.length) {
					nextEventT = events[index + 1].t;
				} else {
					nextEventT = t;
				}
				var eventEnd;
				if (note.isRest) {
					// if it is the last note, or if the next one is rest as well
					if ((noteIndex === notes.length - 1) || nextNoteIsRest) {
						eventEnd = Math.min(nextEventT, end);
					} else {
						eventEnd = nextEventT;
					}
				} else {
					if (noteIndex === notes.length - 1 && measure.lastNotePressed) {
						eventEnd = Math.min(nextEventT, end);
					} else {
						eventEnd = nextEventT;
					}
				}

				var durationDiff = (eventEnd - eventStart - expectedDuration) / expectedDuration;
				var maxNotes = nextNoteIsRest ? 3 : 4;
				var notesPlayedBetween = events.length - index > maxNotes;
				return calculateNoteScore(startDiff, durationDiff, notesPlayedBetween);
			}));
			logger.debug("addMeasureScore(" + measureIndex + ") " + notesScores);
			this.measuresScore[measureIndex] = notesScores;
			var lifeChange;
			if (notesScores.isFailed()) {
				this.multiplier = 1;
				this.goodMeasureCount = 0;
				lifeChange = -0.25;
			} else {
				this.goodMeasureCount++;
				if (this.goodMeasureCount == 2) {
					this.multiplier = Math.min(this.multiplier + 1, 4);
					this.goodMeasureCount = 0;
				}
				this.totalScore += notesScores.value() * this.multiplier;
				lifeChange = (notesScores.value() - 0.5) * 0.3;
			}
			this.life = keepBetween(0, 1, this.life + lifeChange);
			if(measureIndex == this.measures.length -1){
				this.scoreManager.save(this.totalScore);
			}
			return notesScores;
		},
		win: function(){
			this.totalScore = 666;
			this.scoreManager.save(this.totalScore);
		},
		loose : function(){
			this.life = 0;
		}
	};

	ScoreCalculator.SCORE_TYPES = SCORE_TYPES;
	ScoreCalculator.calculateNoteScore = calculateNoteScore;
	ScoreCalculator.FailedNoteScore = FailedNoteScore;
	ScoreCalculator.SuccessNoteScore = SuccessNoteScore;
	ScoreCalculator.MeasureScore = MeasureScore;
	return ScoreCalculator;
}());