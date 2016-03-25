module("ScoreCalculator");
(function() {
	var logger = RH.logManager.getLogger('ScoreCalculatorTest');
	RH.debug();
	var Measure = RH.Measure;
	var Application = RH.Application;
	var RhythmPatterns = RH.RhythmPatterns;
	var ScoreCalculator = RH.ScoreCalculator;
	var EventManager = RH.EventManager;
	var Note = RH.Note;
	var scoreManager = {
		save: function(){}
	};
	var MeasureScore = ScoreCalculator.MeasureScore;
	calculateNoteScore = ScoreCalculator.calculateNoteScore;

	var getPatternsNotes = function(patterns) {
		var result = [];
		patterns.forEach(function(pattern) {
			result = result.concat(pattern.notes);
		});
		return result;
	};

	var generateMeasures = function(patternsS) {
		var patterns = patternsS.map(RhythmPatterns.getPattern);
		var tempo = Application.DEFAULT_TEMPO;
		var timeSignature = Application.DEFAULT_TS;

		return RhythmPatterns.generateMeasures([tempo], [timeSignature], getPatternsNotes(patterns));
	};
	var mockEventManager = function(times) {
		var mockEvent = {
			which: 30
		};
		var onDown = true;
		var timeAnswered = null;
		var eventManager = new EventManager(function() {
			return timeAnswered;
		});
		for (var i = 0; i < times.length; i++) {
			timeAnswered = times[i];
			if (onDown) {
				eventManager.onDown(mockEvent);
			} else {
				eventManager.onUp(mockEvent);
			}
			onDown = !onDown;
		}
		return eventManager;
	};
	var measures = generateMeasures(['crotchet', 'whole', 'minim', 'crotchet']);

	test("calculateMeasureScore - errors", function() {

		var scoreCalculator = new ScoreCalculator(mockEventManager([3900, 4800, 5010, 9010, 9015, 11010, 11020, 12030]), measures, false, scoreManager);
		var score1 = scoreCalculator.calculateMeasureScore(8000, 1);
		var score2 = scoreCalculator.calculateMeasureScore(12000, 2);
		ok(true);
	});

	test("calculateMeasureScore - perfect", function() {

		var scoreCalculator = new ScoreCalculator(mockEventManager([4000, 4999, 5000, 8999, 9000, 10999, 11000, 11999]), measures, false, scoreManager);
		var score1 = scoreCalculator.calculateMeasureScore(8000, 1);
		var score2 = scoreCalculator.calculateMeasureScore(12000, 2);

		ok(true);
	});

	test("Measure Score - getMainFailureReason", function() {
		var score = new MeasureScore([calculateNoteScore(-350, 0, false)]);
		equal(score.getMainFailureReason(), 'Too Early');
		score = new MeasureScore([calculateNoteScore(350, 0, false)]);
		equal(score.getMainFailureReason(), 'Too Late');
		score = new MeasureScore([calculateNoteScore(0, -0.9, false)]);
		equal(score.getMainFailureReason(), 'Too Short');
		score = new MeasureScore([calculateNoteScore(0, 0.9, false)]);
		equal(score.getMainFailureReason(), 'Too Long');
		score = new MeasureScore([calculateNoteScore(0, 0, true)]);
		equal(score.getMainFailureReason(), 'Pressed Too Much');

		score = new MeasureScore([calculateNoteScore(-350, 2, true), calculateNoteScore(-350, 0, false)]);
		equal(score.getMainFailureReason(), 'Too Early');



	});


})();