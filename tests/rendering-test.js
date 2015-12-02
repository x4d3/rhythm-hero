$(document).ready(function() {
	'use strict';
	module("Rendering Tests");
	var Game = RH.Game;
	var Measure = RH.Measure;
	var Note = RH.Note;
	var GameOptions = RH.GameOptions;
	var RhythmPatterns = RH.RhythmPatterns;
	var VexUtils = RH.VexUtils;
	
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

	var getPatternsNotes = function(patterns){
		var notes = [];
		patterns.forEach(function(p){
			notes = notes.concat(p.notes);
		});
		return notes;
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
		var measures = Game.generateMeasures(options, getPatternsNotes(RhythmPatterns.PATTERNS));
		
		var canvasesData = VexUtils.generateMeasuresCanvases(400, measures);
		displayCanvases(assert.testName, canvasesData);
		ok(true);
	});
	test('Defined Patterns', function(assert) {
		var tempo = GameOptions.DEFAULT_TEMPO;
		var timeSignature = GameOptions.DEFAULT_TS;
		var options = new GameOptions(timeSignature, tempo);
		var patternsS = ['minim','crotchet', 'quaver', 'triplet quaver','dotted crotchet quaver', 'quaver dotted crotchet', 'whole'];
		var patterns = patternsS.map(RhythmPatterns.getPattern);
		var measures = Game.generateMeasures(options, getPatternsNotes(patterns));
		
		var canvasesData = VexUtils.generateMeasuresCanvases(400, measures);
		displayCanvases(assert.testName, canvasesData);
		ok(true);
	});
	
	test('Random Patterns', function(assert) {
		var tempo = GameOptions.DEFAULT_TEMPO;
		var timeSignature = GameOptions.DEFAULT_TS;
		var options = new GameOptions(timeSignature, tempo);
		var notes = RH.RhythmPatterns.generateNotes(0, RH.RhythmPatterns.MAX_DIFFICULTY, 100);
		var measures = Game.generateMeasures(options, notes);
		
		var canvasesData = VexUtils.generateMeasuresCanvases(400, measures);
		displayCanvases(assert.testName, canvasesData);
		ok(true);
	});

});
