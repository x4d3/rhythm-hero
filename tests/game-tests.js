module("RH Tests");

test("Game.generateBars", function() {
	var Game = RH.Game;
	var Measure = RH.Measure;
	var Note = RH.Note;

	var newNote = function(n, d) {
		return new Note(new Fraction(n, d), false);
	};
	var testMeasures = function(patternsS, awaitedMeasures) {
		var patterns = patternsS.map(RH.RhythmPatterns.getPattern);
		var measures = Game.generateMeasures(4, patterns);
		deepEqual(measures, [ Measure.EMPTY, Measure.EMPTY ].concat(awaitedMeasures), "measures" + measures + ", " + awaitedMeasures);
	};
	testMeasures([ 'crotchet', 'whole', 'minim', 'crotchet' ],
		[ new Measure([ newNote(1, 1), newNote(3, 1) ], false, true), new Measure([ newNote(1, 1), newNote(2, 1), newNote(1, 1) ], true, false) ]);

	testMeasures([ 'minim', 'crotchet', 'dotted, crotchet quaver', 'quaver, dotted crotchet', 'crotchet' ], [ new Measure([ newNote(2, 1), newNote(1, 1), newNote(1, 1) ], false, true),
		new Measure([ newNote(1, 2), newNote(1, 2), newNote(1, 2), newNote(3, 2), newNote(1, 1) ], true, false) ]);

	testMeasures([ 'minim', 'crotchet', 'dotted, crotchet quaver', 'quaver, dotted crotchet' ], [ new Measure([ newNote(2, 1), newNote(1, 1), newNote(1, 1) ], false, true) ]);

});
