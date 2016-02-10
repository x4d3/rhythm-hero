module("RhythmPatterns");

test("general", function() {
	RH.Preconditions.checkIsNumber(RH.RhythmPatterns.MAX_DIFFICULTY);
	var patterns = RH.RhythmPatterns.PATTERNS;
	for (var i = 0; i < patterns.length; i++) {
		console.log(patterns[i]);
	}
	equal(RH.RhythmPatterns.MAX_DIFFICULTY, 10);

});

test("generatePattern", function() {

	var notes = RH.RhythmPatterns.generateNotes(0, RH.RhythmPatterns.MAX_DIFFICULTY, 1000);
	ok(!notes.some(function(element) {
		return element === undefined;
	}));
});

var areArrayEquals = function(expected, tested) {
	equal(expected.length, tested.length, "the two arrays are not the same length: " + expected + ", " + tested);
	for (var i = 0; i < expected.length; i++) {
		ok(expected[i].equals(tested[i]), "objects[" + i + "]: are different " + expected[i] + ", " + tested[i]);
	}

};

test("parsing", function() {

	var newNote = function(a, b, c) {
		return new RH.Note(new Fraction(a, b), c);
	};

	var notes = RH.Note.parseNotes("1 q r s tq 7/8 4/5r");
	areArrayEquals(notes, [
		newNote(1, 1, false),
		newNote(1, 2, false),
		newNote(1, 1, true),
		newNote(1, 4, false),
		newNote(1, 3, false),
		newNote(7, 8, false),
		newNote(4, 5, true)
	]);
});

test("wrong notes are causing errors", function() {


	throws(function() {
		RH.Note.parseNote("1s");
	});

	throws(function() {
		RH.Note.parseNote("1/b");
	});
	throws(function() {
		RH.Note.parseNote("sf");
	});
	throws(function() {
		RH.Note.parseNote("r1");
	});
	throws(function() {
		RH.Note.parseNote("-0");
	});


});