RH.ScoreCalculator = (function() {
	'use strict';
	var logger = RH.logManager.getLogger('ScoreCalculator');

	function NoteScore(startDiff, durationDiff, notesPlayedBetween) {
		this.startDiff = startDiff;
		this.durationDiff = durationDiff;
		this.notesPlayedBetween = notesPlayedBetween;
	}
	
	NoteScore.prototype = {
		toString : function() {
			if (isFinite(this.startDiff) && isFinite(this.durationDiff) && this.notesPlayedBetween) {
				return "S:" + this.startDiff + ",D:" + this.durationDiff + ",NB:" + this.notesPlayedBetween;
			} else {
				return "F";
			}
		}
	};
	var PERFECT = new NoteScore(0, 0, false);
	var FAILED = new NoteScore(Infinity, Infinity, true);
	
	function ScoreCalculator(eventManager, measures) {
		this.eventManager = eventManager;
		this.measures = measures;
		this.measuresScore = [];
	}
	/**
	 * in milliseconds
	 */
	var EPSILON = 10;
	var NO_SCORE = {};
	ScoreCalculator.prototype = {
		/**
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
			var notesScores = measure.notes.map(function(note) {
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
						if (events[0].t > end && note.isRest){
							return new NoteScore(0, (events[0].t - start) / expectedDuration , false);
						}else{
							return FAILED;
						}
					}
					index = 1;
				}
				var startDiff = events[index].t - start;
				var durationDiff;
				if (index + 1 < events.length) {
					durationDiff = (events[index + 1].t - events[index].t - expectedDuration) / expectedDuration;
				} else {
					durationDiff = 0;
				}
				var notesPlayedBetween = events.length > 3;
				return new NoteScore(startDiff, durationDiff, notesPlayedBetween);
			});
			logger.debug("addMeasureScore(" + measureIndex + ") " + notesScores);
			this.measuresScore[measureIndex] = notesScores;
		}
	};
	return ScoreCalculator;
}());