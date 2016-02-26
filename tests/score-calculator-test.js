module("ScoreCalculator");
(function() {
	var logger = RH.logManager.getLogger('ScoreCalculatorTest');
	RH.debug();
	var Measure = RH.Measure;
	var GameOptions = RH.GameOptions;
	var RhythmPatterns = RH.RhythmPatterns;
	var ScoreCalculator = RH.ScoreCalculator;
	var EventManager = RH.EventManager;
	var Note = RH.Note;

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
		var options = new GameOptions();
		return RhythmPatterns.generateMeasures(options.tempi, options.timeSignatures, getPatternsNotes(patterns));
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

	test("addMeasureScore - errors", function() {

		var scoreCalculator = new ScoreCalculator(mockEventManager([3900, 4800, 5010, 9010, 9015, 11010, 11020, 12030]), measures);
		var score1 = scoreCalculator.addMeasureScore(8000, 1);
		var score2 = scoreCalculator.addMeasureScore(12000, 2);
		ok(true);
	});

	test("addMeasureScore - perfect", function() {

		var scoreCalculator = new ScoreCalculator(mockEventManager([4000, 4999, 5000, 8999, 9000, 10999, 11000, 11999]), measures);
		var score1 = scoreCalculator.addMeasureScore(8000, 1);
		var score2 = scoreCalculator.addMeasureScore(12000, 2);

		ok(true);
	});

	test("Measure Score - getMainFailureReason", function() {
		var score = new MeasureScore([calculateNoteScore(-350, 0, false)]);
		equal(score.getMainFailureReason(), 'Too Early');
		score = new MeasureScore([calculateNoteScore(350, 0, false)]);
		equal(score.getMainFailureReason(), 'Too Late');
		score = new MeasureScore([calculateNoteScore(0, -0.7, false)]);
		equal(score.getMainFailureReason(), 'Too Short');
		score = new MeasureScore([calculateNoteScore(0, 0.7, false)]);
		equal(score.getMainFailureReason(), 'Too Long');
		score = new MeasureScore([calculateNoteScore(0, 0, true)]);
		equal(score.getMainFailureReason(), 'Pressed Too Much');

		score = new MeasureScore([calculateNoteScore(-350, 2, true), calculateNoteScore(-350, 0, false)]);
		equal(score.getMainFailureReason(), 'Too Early');



	});


})();