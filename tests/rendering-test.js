$(document)
	.ready(
		function() {
			'use strict';
			module("Rendering Tests");
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
			Math.seedrandom('Test');
			RH.debug();
			var options = new GameOptions();
			var generateCanvas = function(title, width, comment) {
				var canvasJ = $('<canvas>');
				canvasJ.prop({
					width: width,
					height: 200
				});
				var div = $('<div>').append($('<h2>').text(title)).append(canvasJ);
				if (comment !== undefined) {
					div.append($('<div>').text(comment));
				}
				div.appendTo($("#test-output"));
				return canvasJ[0];
			};

			var getPatternsNotes = function(patterns) {
				var notes = [];
				patterns.forEach(function(p) {
					notes = notes.concat(p.notes);
				});
				return notes;
			};

			var displayCanvases = function(title, canvasesData) {
				var canvas = generateCanvas(title, WIDTH * canvasesData.length);
				for (var i = 1; i < canvasesData.length; i++) {
					canvas.getContext('2d').putImageData(canvasesData[i], WIDTH * (i - 1), 0);
				}
			};
			test('All Patterns', function(assert) {
				var measures = RhythmPatterns.generateMeasures(options.tempi, options.timeSignatures, getPatternsNotes(RhythmPatterns.PATTERNS));

				var canvasesData = VexUtils.generateMeasuresCanvases(400, 150, measures);
				displayCanvases(assert.test.testName, canvasesData);
				ok(true);
			});
			test('Defined Patterns', function(assert) {
				var patternsS = ['minim', 'crotchet', 'quaver', 'triplet quaver', 'dotted crotchet quaver', 'quaver dotted crotchet', 'whole', 'minim', 'crotchet rest', 'crotchet rest',
					'crotchet rest', 'crotchet rest', 'crotchet rest'
				];
				var patterns = patternsS.map(RhythmPatterns.getPattern);
				var measures = RhythmPatterns.generateMeasures(options.tempi, options.timeSignatures, getPatternsNotes(patterns));

				var canvasesData = VexUtils.generateMeasuresCanvases(400, 150, measures);
				displayCanvases(assert.test.testName, canvasesData);
				ok(true);
			});
			test('Defined Patterns 2', function(assert) {
				var notes = Note.parseNotes(
					"1/3 1/3 1/3 2/3 2/3 2/3 " +
					"q 1/6 1/6 1/6  q 1/6 1/6 1/6  q q  q 1/6 1/6 1/6  q 1/6 1/6 1/6  1/6 1/6 1/6 1/6 1/6 1/6");
				var measures = RhythmPatterns.generateMeasures(options.tempi, [RH.TS.THREE_FOUR], notes);

				var canvasesData = VexUtils.generateMeasuresCanvases(400, 150, measures);
				displayCanvases(assert.test.testName, canvasesData);
				ok(true);
			});
			test('Random Patterns', function(assert) {
				var notes = RH.RhythmPatterns.generateNotes(0, RH.RhythmPatterns.MAX_DIFFICULTY, 100);
				var measures = RhythmPatterns.generateMeasures(options.tempi, options.timeSignatures, notes);

				var canvasesData = VexUtils.generateMeasuresCanvases(400, 150, measures);
				displayCanvases(assert.test.testName, canvasesData);				
				ok(true);
			});

			test('All Levels', function(assert) {
				RH.LevelManager.levels.forEach(function(level) {
					var canvasesData = VexUtils.generateMeasuresCanvases(400, 150, level.measures);
					displayCanvases(level.description, canvasesData);
				});
				ok(true);
			});


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

			test(
				"Score Computation - drawOnExternalCanvas",
				function(assert) {

					var NOTES_INPUT = "1/1 q 1/1r 1/1 q 1/1 1/1r 1/1 2/1 1/1r 1/1 1/1r 1/1r 1/1r 1/1r q 1/1 1/1 1/1 1/1 q 1/1r 1/1 1/1r 2/1 1/1 1/1 1/1r 1/1r 1/1 1/1r 1/1 1/1r q q 1/1 q 1/1r q 1/1r 1/1 q 1/1r 1/1r 1/1 1/1r q 1/1 1/1 1/1";
					var notes = Note.parseNotes(NOTES_INPUT);

					var measures = RhythmPatterns.generateMeasures(options.tempi, options.timeSignatures, notes);
					var eventManager = EventManager
						.fromJson('{"keyPressed":[null,false],"keyChanged":[4031,4949,5100,5765,6474,7350,7509,8059,8175,10189,11869,12702,13975,15137,19082,19407,19579,20316,20473,21327,21490,22326,22481,23182,23343,23898,24758,26058,27051,28590,28815,29700,29832,31095,33061,34014,35001,35983,37174,37331,37500,37790,38031,38564,39078,39545,40401,40780,40915,41249,41932,42944,43107,43672],"isPressed":false}');
					eventManager.getTime = function() {
						return 45000;
					};
					var scoreCalculator = new ScoreCalculator(eventManager, measures);

					var t0 = 117;
					var screen = new Screen(null, eventManager, scoreCalculator, measures, options);

					for (var measureIndex = 2; measureIndex < measures.length; measureIndex++) {
						var t = t0 + 4000 * measureIndex;
						scoreCalculator.addMeasureScore(t, measureIndex - 1);
						var measureInfo = {
							t: t,
							index: measureIndex - 1,
							measure: measures[measureIndex]
						};
						var tempCanvas = generateCanvas(assert.test.testName + " " + measureIndex, 400, scoreCalculator.measuresScore[measureIndex - 1]);
						screen.drawOnExternalCanvas(tempCanvas, measureInfo);
					}

					ok(true);
				});



		});