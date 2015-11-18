$(document).ready(function() {
	'use strict';
	module("Rendering Tests");
	RH.debug();
	function createNote(note_data) {
		return new Vex.Flow.StaveNote(note_data);
	}

	var VF = Vex.Flow;
	var generateCanvas = function(title, canvasWidth){
		var canvasJ = $('<canvas>');
		canvasJ.prop({
			width : canvasWidth,
			height : 100
		});
		$('<div>').append($('<h2>').text(title)).append(canvasJ).appendTo($("#test-output"));
		return canvasJ[0];
	};
	
	var testCanvas = function(title, callBack) {
		test(title, function() {
			var canvas = generateCanvas(title, 800);
			callBack(canvas);
			ok(true, title);
		});
	};

	test('first', function() {
		var title = 'first';
		var Game = RH.Game;
		var Measure = RH.Measure;
		var Note = RH.Note;
		var GameOptions = RH.GameOptions;
		var RhythmPatterns = RH.RhythmPatterns;
		var BackScreen = RH.BackScreen;
		var canvasWidth = 400;
		
		var tempo = GameOptions.DEFAULT_TEMPO;
		var timeSignature = GameOptions.DEFAULT_TS;
		var options = new GameOptions(timeSignature, tempo);
		var measures = Game.generateMeasures(options, RhythmPatterns.PATTERNS);
		
		var canvasesData = BackScreen.createMeasuresCanvases(400, measures);
		var canvas = generateCanvas(title, canvasWidth * measures.length);
		for (var i = 0; i < measures.length; i++){
			canvas.getContext('2d').putImageData(canvasesData[i], canvasWidth * i , 0);
		}
		ok(true, title);
	});

	test('second', function() {
		var title = 'second';
		var Game = RH.Game;
		var Measure = RH.Measure;
		var Note = RH.Note;
		var GameOptions = RH.GameOptions;
		var RhythmPatterns = RH.RhythmPatterns;
		var BackScreen = RH.BackScreen;
		var canvasWidth = 400;
		
		var tempo = GameOptions.DEFAULT_TEMPO;
		var timeSignature = GameOptions.DEFAULT_TS;
		var options = new GameOptions(timeSignature, tempo);
		var patterns = RH.RhythmPatterns.generatePatterns(0, RH.RhythmPatterns.MAX_DIFFICULTY, 50);
		var measures = Game.generateMeasures(options, patterns);
		
		var canvasesData = BackScreen.createMeasuresCanvases(400, measures);
		var canvas = generateCanvas(title, canvasWidth * measures.length);
		for (var i = 0; i < measures.length; i++){
			canvas.getContext('2d').putImageData(canvasesData[i], canvasWidth * i , 0);
		}
		ok(true, title);
	});
	
});
