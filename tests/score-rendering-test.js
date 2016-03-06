$(document).ready(
	function() {
		'use strict';
		module("Rendering Tests - Score");
		var Game = RH.Game;
		var Measure = RH.Measure;
		var Note = RH.Note;
		var GameOptions = RH.GameOptions;
		var RhythmPatterns = RH.RhythmPatterns;
		var VexUtils = RH.VexUtils;
		var EventManager = RH.EventManager;
		var ScoreCalculator = RH.ScoreCalculator;
		var Screen = RH.Screen;
		var ScoreScreen = RH.ScoreScreen;
		var WIDTH = 400;
		// To make the test reproduceable
		Math.seedrandom('Test Score');
		RH.debug();
		var options = new GameOptions();
		var generateCanvas = function(title, width, comment) {
			var canvasJ = $('<canvas>');
			canvasJ.prop({
				width: width,
				height: 300
			});
			var div = $('<div>').append($('<h2>').text(title)).append(canvasJ);
			if (comment !== undefined) {
				div.append($('<div>').text(comment));
			}
			div.appendTo($("#test-output"));
			return canvasJ[0];
		};

		test(
			"Score Computation - Display",
			function(assert) {
				var canvas = generateCanvas(assert.test.testName, Screen.MEASURE_WIDTH * 2);
				var context = canvas.getContext("2d");
				var NOTES_INPUT = "1/1 q 1/1r 1/1 q 1/1 1/1r 1/1 2/1 1/1r 1/1 1/1r 1/1r 1/1r 1/1r q 1/1 1/1 1/1 1/1 q 1/1r 1/1 1/1r 2/1 1/1 1/1 1/1r 1/1r 1/1 1/1r 1/1 1/1r q q 1/1 q 1/1r q 1/1r 1/1 q 1/1r 1/1r 1/1 1/1r q 1/1 1/1 1/1";
				var notes = Note.parseNotes(NOTES_INPUT);
				var measures = RhythmPatterns.generateMeasures([120], [RH.TS.FOUR_FOUR], notes);
				var eventManager = EventManager
					.fromJson('{"keyPressed":[null,false],"keyChanged":[4031,4949,5100,5765,6474,7350,7509,8059,8175,10189,11869,12702,13975,15137,19082,19407,19579,20316,20473,21327,21490,22326,22481,23182,23343,23898,24758,26058,27051,28590,28815,29700,29832,31095,33061,34014,35001,35983,37174,37331,37500,37790,38031,38564,39078,39545,40401,40780,40915,41249,41932,42944,43107,43672],"isPressed":false}');

				var measurePosition = {
					x: Screen.MEASURE_WIDTH / 2 - 80,
					y: 70
				};

				var scoreCalculator = new ScoreCalculator(eventManager, measures);
				var scoreScreen = new ScoreScreen({
					scoreCalculator: scoreCalculator,
					scorePosition: Screen.SCORE_POSITION,
					multiplierPosition: Screen.MULTIPLIER_POSITION
				});

				var t0 = RH.getTime();
				var previousIndex = -1;
				(function animloop() {
					var t = RH.getTime() - t0;
					context.clearRect(0, 0, canvas.width, canvas.height);
					var index = Math.round(t / measures[0].getDuration());
					if (measures[index] === undefined) {
						return;
					}
					eventManager.getTime = function() {
						return t;
					};

					if (previousIndex != index) {
						scoreCalculator.addMeasureScore(t, index);
						previousIndex = index;
					}
					scoreScreen.draw(context, measurePosition, index, t);
					requestAnimFrame(animloop);
				})();

				ok(true);
			});

		test("End Game Screen",
			function(assert) {
				var canvas = generateCanvas(assert.test.testName, Screen.MEASURE_WIDTH * 2);
				var bestScore = 50;
				var game = {
					scoreCalculator: {
						hasLost: function() {
							return false;
						},
						totalScore: 25
					}
				};
				var callback = function() {
					console.log('callback called');
				};
				var endGameScreen = new RH.EndGameScreen(canvas, game, bestScore, callback);

				ok(true);
			});

	});