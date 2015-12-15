RH.ScoreCalculator = (function() {
	'use strict';
	var logger = RH.logManager.getLogger('ScoreCalculator');
	var MAX_START_DIFF = 200;

	function ScoreType(value, label, icon, color) {
		this.value = value;
		this.label = label;
		this.icon = icon;
		this.color = color;
	}

	var SCORE_TYPES = [new ScoreType(0, "fail", "✗", "red"), new ScoreType(0.5, "boo", "E", "orange"), new ScoreType(0.7, "average", "D", "maroon"), new ScoreType(0.7, "good", "C", "black"),
		new ScoreType(0.8, "great", "B", "olive"), new ScoreType(0.9, "awesome", "A", "green"), new ScoreType(0.95, "perfect", "✔", "green")
	];
	var SCORE_TYPES_VALUES = SCORE_TYPES.map(function(s) {
		return s.value;
	});

	function MeasureScore(notes) {
		this.notes = notes;
	}
	MeasureScore.prototype = {
		value: function() {
			var sum = 0;
			for (var i = 0; i < this.notes.length; i++) {
				var score = this.notes[i];
				if (score.isFailed) {
					return 0;
				}
				sum += score.value();
			}
			return sum / this.notes.length;
		},
		isFailed: function() {
			return this.notes.some(function(x) {
				return x.isFailed;
			});
		},
		toString: function() {
			return this.notes.toString();
		},getType: function() {
			return SCORE_TYPES[RH.binarySearch(SCORE_TYPES_VALUES, this.value())];
		}
	};

	function NoteScore(startDiff, durationDiff, notesPlayedBetween) {
		this.startDiff = startDiff;
		this.durationDiff = durationDiff;
		this.notesPlayedBetween = notesPlayedBetween;
		this.isFailed = !isFinite(startDiff) || !isFinite(durationDiff) || this.notesPlayedBetween;
	}

	NoteScore.prototype = {
		toString: function() {
			if (this.isFailed) {
				return "F";
			} else {
				return this.startDiff.toFixed(0) + " " + numeral(100 * this.durationDiff).format('0') + " " + numeral(100 * this.value()).format('0');
			}
		},
		value: function() {
			if (this.isFailed) {
				return 0;
			} else {
				var x = Math.max(1 - Math.abs(this.startDiff / MAX_START_DIFF), 0);
				var y = Math.max(1 - Math.abs(this.durationDiff), 0);
				return 0.5 + 0.30 * x * x + 0.20 * y;
			}
		}
	};
	var PERFECT = new NoteScore(0, 0, false);
	var FAILED = new NoteScore(Infinity, Infinity, true);

	function ScoreCalculator(eventManager, measures) {
		this.eventManager = eventManager;
		this.measures = measures;
		this.measuresScore = [];
		this.multiplier = 1;
		this.totalScore = 0;
		this.goodMeasureCount = 0;
	}
	/**
	 * in milliseconds
	 */
	var EPSILON = 10;
	var NO_SCORE = new MeasureScore([]);
	ScoreCalculator.prototype = {
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
						return FAILED;
					}
				}
				var index = 0;
				// the previous note is not the right kind, we pick the next one
				if (events[0].isPressed === note.isRest) {
					if (events.length == 1) {
						if (events[0].t > end && note.isRest) {
							return PERFECT;
						} else {
							return FAILED;
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
					return FAILED;
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
					// if it is the last note, or if the next one is rest as
					// well
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
				return new NoteScore(startDiff, durationDiff, notesPlayedBetween);
			}));
			logger.debug("addMeasureScore(" + measureIndex + ") " + notesScores);
			this.measuresScore[measureIndex] = notesScores;
			if (notesScores.isFailed()) {
				this.multiplier = 1;
				this.goodMeasureCount = 0;
			} else {
				this.goodMeasureCount++;
				if (this.goodMeasureCount == 4) {
					this.multiplier = Math.min(this.multiplier + 1, 8);
					this.goodMeasureCount = 0;
				}
				this.totalScore += notesScores.value() * this.multiplier;
			}
			return notesScores;
		}
	};

	ScoreCalculator.SCORE_TYPES = SCORE_TYPES;
	return ScoreCalculator;
}());