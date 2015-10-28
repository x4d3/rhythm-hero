module("RhythmPatterns");

test("general", function() {
	RH.Preconditions.checkIsNumber(RH.RhythmPatterns.MAX_DIFFICULTY);
	expect(0);
});


test("generatePattern", function() {

	var patterns = RH.RhythmPatterns.generatePattern(0, RH.RhythmPatterns.MAX_DIFFICULTY, 10);
	equal(patterns.length, 10);
	for (var i = 0; i < patterns.length; i++) {
		console.log(patterns[i].description);
	}
});

