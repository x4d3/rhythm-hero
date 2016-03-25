$(document)
	.ready(
		function() {
			'use strict';
			module("Rendering Tests");
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
			var WIDTH = 400;
			// To make the test reproduceable
			Math.seedrandom('Test');
			RH.debug();
			var tempi = [Application.DEFAULT_TEMPO];
			var timeSignatures = [Application.DEFAULT_TS];
			var generateCanvas = function(title, width, comment) {
				var canvasJ = $('<canvas>');
				canvasJ.prop({
					width: width,
					height: 150
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
				var measures = RhythmPatterns.generateMeasures(tempi, timeSignatures, getPatternsNotes(RhythmPatterns.PATTERNS));

				var canvasesData = VexUtils.generateMeasuresCanvases(400, 150, measures);
				displayCanvases(assert.test.testName, canvasesData);
				ok(true);
			});
			test('Defined Patterns', function(assert) {
				var patternsS = ['minim', 'crotchet', 'triplet quaver', 'dotted crotchet quaver', 'quaver dotted crotchet', 'whole', 'minim', 'crotchet rest', 'crotchet rest',
					'crotchet rest', 'crotchet rest', 'crotchet rest'
				];
				var patterns = patternsS.map(RhythmPatterns.getPattern);
				var measures = RhythmPatterns.generateMeasures(tempi, timeSignatures, getPatternsNotes(patterns));

				var canvasesData = VexUtils.generateMeasuresCanvases(400, 150, measures);
				displayCanvases(assert.test.testName, canvasesData);
				ok(true);
			});
			test('Defined Patterns 2', function(assert) {
				var notes = Note.parseNotes(
					"1/3 1/3 1/3 2/3 2/3 2/3 " +
					"q 1/6 1/6 1/6  q 1/6 1/6 1/6  q q  q 1/6 1/6 1/6  q 1/6 1/6 1/6  1/6 1/6 1/6 1/6 1/6 1/6");
				var measures = RhythmPatterns.generateMeasures(tempi, [RH.TS.THREE_FOUR], notes);

				var canvasesData = VexUtils.generateMeasuresCanvases(400, 150, measures);
				displayCanvases(assert.test.testName, canvasesData);
				ok(true);
			});
			test('Defined Patterns 3', function(assert) {
				var notes = Note.parseNotes(
					"1/2 1 1 1 1/2 " + 
					"1/3 1/3 2/3 1/3 1/3 2");
				var measures = RhythmPatterns.generateMeasures(tempi, [RH.TS.FOUR_FOUR], notes);

				var canvasesData = VexUtils.generateMeasuresCanvases(400, 150, measures);
				displayCanvases(assert.test.testName, canvasesData);
				ok(true);
			});

			test('Random Patterns', function(assert) {
				var notes = RH.RhythmPatterns.generateNotes(0, RH.RhythmPatterns.MAX_DIFFICULTY, 100);
				var measures = RhythmPatterns.generateMeasures(tempi, timeSignatures, notes);

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

		});