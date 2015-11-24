module("ScoreCalculator");
(function() {
	RH.debug();
	var Game = RH.Game;
	var Measure = RH.Measure;
	var GameOptions = RH.GameOptions;
	var RhythmPatterns = RH.RhythmPatterns;
	var ScoreCalculator = RH.ScoreCalculator;
	var EventManager = RH.EventManager;

	var generateMeasures = function(patternsS) {
		var patterns = patternsS.map(RhythmPatterns.getPattern);
		var options = new GameOptions(GameOptions.DEFAULT_TS, GameOptions.DEFAULT_TEMPO);
		return Game.generateMeasures(options, patterns);
	};
	var mockEventManager = function(times) {
		var mockEvent = {
			which : 30
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
	var measures = generateMeasures([ 'crotchet', 'whole', 'minim', 'crotchet' ]);

	test("addMeasureScore - errors", function() {

		var scoreCalculator = new ScoreCalculator(mockEventManager([ 3900, 4800, 5010, 9010, 9015, 11010, 11020, 12030 ]), measures);
		var score1 = scoreCalculator.addMeasureScore(8000, 1);
		var score2 = scoreCalculator.addMeasureScore(12000, 2);
		ok(true);
	});

	test("addMeasureScore - perfect", function() {

		var scoreCalculator = new ScoreCalculator(mockEventManager([ 4000, 4999, 5000, 8999, 9000, 10999, 11000, 11999 ]), measures);
		var score1 = scoreCalculator.addMeasureScore(8000, 1);
		var score2 = scoreCalculator.addMeasureScore(12000, 2);

		ok(true);
	});

})();