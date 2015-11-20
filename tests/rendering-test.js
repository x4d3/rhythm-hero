$(document).ready(function() {
	'use strict';
	module("Rendering Tests");
	var Game = RH.Game;
	var Measure = RH.Measure;
	var Note = RH.Note;
	var GameOptions = RH.GameOptions;
	var RhythmPatterns = RH.RhythmPatterns;
	var BackScreen = RH.BackScreen;
	
	var WIDTH = 400;
	//To make the test reproduceable
	Math.seedrandom('Test');
	RH.debug();
	
	var generateCanvas = function(title, WIDTH){
		var canvasJ = $('<canvas>');
		canvasJ.prop({
			width : WIDTH,
			height : 150	
		});
		$('<div>').append($('<h2>').text(title)).append(canvasJ).appendTo($("#test-output"));
		return canvasJ[0];
	};
	
	var displayCanvases = function(title, canvasesData){
		var canvas = generateCanvas(title, WIDTH * canvasesData.length);
		for (var i = 1; i < canvasesData.length; i++){
			canvas.getContext('2d').putImageData(canvasesData[i], WIDTH * (i-1) , 0);
		}
	};
	test('All Patterns', function(assert) {
		var tempo = GameOptions.DEFAULT_TEMPO;
		var timeSignature = GameOptions.DEFAULT_TS;
		var options = new GameOptions(timeSignature, tempo);
		var measures = Game.generateMeasures(options, RhythmPatterns.PATTERNS);
		
		var canvasesData = BackScreen.createMeasuresCanvases(400, measures);
		displayCanvases(assert.testName, canvasesData);
		ok(true);
	});

	test('Defined Patterns', function(assert) {
		var tempo = GameOptions.DEFAULT_TEMPO;
		var timeSignature = GameOptions.DEFAULT_TS;
		var options = new GameOptions(timeSignature, tempo);
		var patternsS = ['minim','crotchet', 'quaver', 'triplet quaver','dotted crotchet quaver', 'quaver dotted crotchet', 'whole'];
		var patterns = patternsS.map(RhythmPatterns.getPattern);
		var measures = Game.generateMeasures(options, patterns);
		
		var canvasesData = BackScreen.createMeasuresCanvases(400, measures);
		displayCanvases(assert.testName, canvasesData);
		ok(true);
	});
	
	test('Random Patterns', function(assert) {
		var tempo = GameOptions.DEFAULT_TEMPO;
		var timeSignature = GameOptions.DEFAULT_TS;
		var options = new GameOptions(timeSignature, tempo);
		var patterns = RH.RhythmPatterns.generatePatterns(0, RH.RhythmPatterns.MAX_DIFFICULTY, 100);
		var measures = Game.generateMeasures(options, patterns);
		
		var canvasesData = BackScreen.createMeasuresCanvases(400, measures);
		displayCanvases(assert.testName, canvasesData);
		ok(true);
	});

});
