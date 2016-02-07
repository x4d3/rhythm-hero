module("RH Tests");

test("Game.generateBars", function() {
	'use strict';
	var Game = RH.Game;
	var Measure = RH.Measure;
	var Note = RH.Note;
	var GameOptions = RH.GameOptions;
	var RhythmPatterns = RH.RhythmPatterns;
	
	var options = new GameOptions();
	var tempo = options.tempi[0];
	var timeSignature = options.timeSignatures[0];
	
	var getPatternsNotes = function(patterns){
		var result = [];
		patterns.forEach(function(pattern){
			result = result.concat(pattern.notes);
		});
		return result;
	};
	
	var newNote = function(n, d) {
		return new Note(new Fraction(n, d), false);
	};

	var testMeasures = function(patternsS, awaitedMeasures) {
		var patterns = patternsS.map(RhythmPatterns.getPattern);
		var measures = RhythmPatterns.generateMeasures(options.tempi, options.timeSignatures, getPatternsNotes(patterns)).slice(1, -1);
		deepEqual(measures, awaitedMeasures, "Got    : " + measures + "\nAwaited: " + awaitedMeasures);
	};
	testMeasures([ 'crotchet', 'whole', 'minim', 'crotchet' ],
		[ new Measure(tempo, timeSignature, [ newNote(1, 1), newNote(3, 1) ], false, true), new Measure(tempo, timeSignature, [ newNote(1, 1), newNote(2, 1), newNote(1, 1) ], true, false) ]);

	testMeasures([ 'minim', 'crotchet', 'dotted crotchet quaver', 'quaver dotted crotchet', 'crotchet' ], [ new Measure(tempo, timeSignature, [ newNote(2, 1), newNote(1, 1), newNote(1, 1) ], false, true),
		new Measure(tempo, timeSignature, [ newNote(1, 2), newNote(1, 2), newNote(1, 2), newNote(3, 2), newNote(1, 1) ], true, false) ]);

	testMeasures([ 'minim', 'crotchet', 'dotted crotchet quaver', 'quaver dotted crotchet' ], [ new Measure(tempo, timeSignature, [ newNote(2, 1), newNote(1, 1), newNote(1, 1) ], false, true) ]);

});
