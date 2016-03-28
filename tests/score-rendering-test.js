$(document).ready(
	function() {
		'use strict';
		module("Rendering Tests - Score");
		var Application = RH.Application;
		var Game = RH.Game;
		var Measure = RH.Measure;
		var Note = RH.Note;
		var RhythmPatterns = RH.RhythmPatterns;
		var VexUtils = RH.VexUtils;
		var EventManager = RH.EventManager;
		var ScoreCalculator = RH.ScoreCalculator;
		var Screen = RH.Screen;
		var ScoreScreen = RH.ScoreScreen;


		var FailedNoteScore = ScoreCalculator.FailedNoteScore;
		var SuccessNoteScore = ScoreCalculator.SuccessNoteScore;
		var MeasureScore = ScoreCalculator.MeasureScore;
		var measurePosition = {
			x: Screen.MEASURE_WIDTH / 2 - 80,
			y: 70
		};
		var scoreManager = {
			save: function() {},
			best: 666,
			bestScoreBeaten: true
		};
		var WIDTH = 400;
		// To make the test reproduceable
		Math.seedrandom('Test Score');
		RH.debug();
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
				var measuresScores = [
					new MeasureScore([
						new SuccessNoteScore(0.8),
						new SuccessNoteScore(0.8),
						new SuccessNoteScore(0.8),
					]),
					new MeasureScore([
						new SuccessNoteScore(0.1),
						new SuccessNoteScore(0.2),
						new SuccessNoteScore(0.3),
					]),
					new MeasureScore([
						new FailedNoteScore(['TOO_EARLY']),
					]),
					new MeasureScore([
						new SuccessNoteScore(0.95),
					]),
					new MeasureScore([
						new SuccessNoteScore(0.7),
					]),
					new MeasureScore([
						new SuccessNoteScore(0.8),
					]),
					new MeasureScore([
						new SuccessNoteScore(0.6),
					]),

				];
				var eventManager = new EventManager(function() {
					return t;
				});
				var scoreCalculator = new ScoreCalculator(eventManager, [], true, scoreManager);
				var scoreScreen = new ScoreScreen({
					scoreCalculator: scoreCalculator,
					scorePosition: Screen.SCORE_POSITION,
					multiplierPosition: Screen.MULTIPLIER_POSITION,
					lifePosition: Screen.LIFE_POSITION,
					center: {
						x: canvas.width / 2,
						y: canvas.height / 2
					}
				});
				var measureDuration = 2000;
				var t0 = RH.getTime();
				var previousIndex = -1;
				(function animloop() {
					var t = RH.getTime() - t0;
					context.clearRect(0, 0, canvas.width, canvas.height);
					var index = Math.round(t / measureDuration) + 1;
					if (index != previousIndex) {
						scoreCalculator.addMeasureScore(previousIndex, RH.getArrayElement(measuresScores, previousIndex));
						previousIndex = index;
					}
					var measureInfo = {
						t: t
					};
					scoreScreen.draw(context, measurePosition, index - 1, measureInfo);
					requestAnimFrame(animloop);
				})();

				ok(true);
			});
		test(
			"End Score Rendering",
			function(assert) {

				var canvas = generateCanvas(assert.test.testName, Screen.MEASURE_WIDTH * 2);
				var context = canvas.getContext("2d");
				var eventManager = new EventManager(function() {
					return t;
				});

				var measuresScores = [
					new MeasureScore([
						new SuccessNoteScore(0.8),
						new SuccessNoteScore(0.8),
						new SuccessNoteScore(0.8),
					]),
					new MeasureScore([
						new SuccessNoteScore(0.1),
						new SuccessNoteScore(0.2),
						new SuccessNoteScore(0.3),
					]),
					new MeasureScore([
						new FailedNoteScore(['TOO_EARLY']),
					]),
					new MeasureScore([
						new SuccessNoteScore(0.95),
					]),
				];

				var scoreCalculator = new ScoreCalculator(eventManager, [], true, scoreManager);
				for (var i = 0; i < measuresScores.length; i++) {
					scoreCalculator.addMeasureScore(i + 1, measuresScores[i]);
				}
				var scoreScreen = new ScoreScreen({
					scoreCalculator: scoreCalculator,
					scorePosition: Screen.SCORE_POSITION,
					multiplierPosition: Screen.MULTIPLIER_POSITION,
					lifePosition: Screen.LIFE_POSITION,
					center: {
						x: canvas.width / 2,
						y: canvas.height / 2
					}
				});
				(function animloop() {
					var t = RH.getTime();
					context.clearRect(0, 0, canvas.width, canvas.height);
					var measureInfo = {
						t: t,
						status: RH.Game.STATUS.SCORE_SCREEN
					};
					scoreScreen.draw(context, measurePosition, 0, measureInfo);
					requestAnimFrame(animloop);
				})();

				ok(true);
			});

	});