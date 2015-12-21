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
	ok(!notes.some(function(element){return element === undefined;}));
});
