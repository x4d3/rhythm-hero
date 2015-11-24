RH.ScoreCalculator = (function() {
	'use strict';
	var logger = RH.logManager.getLogger('ScoreCalculator');

	function NoteScore(startDiff, durationDiff, notesPlayedBetween) {
		this.startDiff = startDiff;
		this.durationDiff = durationDiff;
		this.notesPlayedBetween = notesPlayedBetween;
		this.isFailed = !isFinite(startDiff) || !isFinite(durationDiff) || this.notesPlayedBetween;
	}
	function ScoreType(value, label, icon, color) {
		this.value = value;
		this.label = label;
		this.icon = icon;
		this.color = color;
	}

	var SCORE_TYPES = [
		new ScoreType(0, "fail", "✗", "red"),
		new ScoreType(0.5, "boo", "~", "maroon"),
		new ScoreType(0.7, "good", "-", "grey"),
		new ScoreType(0.9, "great", "✓", "olive"),
		new ScoreType(0.95, "perfect", "✔", "green")
	];
	var SCORE_TYPES_VALUES = SCORE_TYPES.map(function(s) {
		return s.value;
	});
	NoteScore.prototype = {
		toString : function() {
			if (this.isFailed) {
				return "F";
			} else {
				return this.startDiff.toFixed(0) + "|" + numeral(this.durationDiff).format('0%');
			}
		},
		value : function() {
			if (this.isFailed) {
				return 0;
			} else {
				var x = Math.max(1 - Math.abs(this.startDiff / 100), 0);
				var y = Math.max(1 - Math.abs(this.durationDiff), 0);
				return 0.5 + 0.35 * x * x + 0.15 * y * y;
			}
		},
		getType : function() {
			return SCORE_TYPES[RH.binarySearch(SCORE_TYPES_VALUES, this.value())];
		}
	};
	var PERFECT = new NoteScore(0, 0, false);
	var FAILED = new NoteScore(Infinity, Infinity, true);

	function ScoreCalculator(eventManager, measures) {
		this.eventManager = eventManager;
		this.measures = measures;
		this.measuresScore = [];
		this.currentMultiplier = 1;
		this.totalScore = 0;
	}
	/**
	 * in milliseconds
	 */
	var EPSILON = 10;
	var NO_SCORE = [];
	ScoreCalculator.prototype = {
		/**
		 * awful awful code.. again...
		 * 
		 * @param t
		 * @param measureIndex
		 */
		addMeasureScore : function(t, measureIndex) {
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

			var measureDuration = measure.getBeatPerBar() / bpm;

			var noteStartTime = t - measureDuration;
			var notesScores = measure.notes.map(function(note, noteIndex) {
				var expectedDuration = note.duration.value() / bpm;
				var start = noteStartTime;
				var end = start + expectedDuration;
				var events = eventManager.getEventsBetween(start, end);
				noteStartTime = end;

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
					if ((noteIndex === measure.notes.length - 1) || (measure.notes[noteIndex + 1].isRest)) {
						eventEnd = Math.min(nextEventT, end);
					} else {
						eventEnd = nextEventT;
					}
				} else {
					if (noteIndex === measure.notes.length - 1 && measure.lastNotePressed) {
						eventEnd = Math.min(nextEventT, end);
					} else {
						eventEnd = nextEventT;
					}
				}

				var durationDiff = (eventEnd - eventStart - expectedDuration) / expectedDuration;
				var notesPlayedBetween = events.length - index > 3;
				return new NoteScore(startDiff, durationDiff, notesPlayedBetween);
			});
			logger.debug("addMeasureScore(" + measureIndex + ") " + notesScores);
			this.measuresScore[measureIndex] = notesScores;
			return notesScores;
		}
	};

	ScoreCalculator.SCORE_TYPES = SCORE_TYPES;
	return ScoreCalculator;
}());