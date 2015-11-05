module("RhythmPatterns");

test("general", function() {
	RH.Preconditions.checkIsNumber(RH.RhythmPatterns.MAX_DIFFICULTY);
	var patterns = RH.RhythmPatterns.PATTERNS;
	for (var i = 0; i < patterns.length; i++) {
		console.log(patterns[i]);
	}
	equal(RH.RhythmPatterns.MAX_DIFFICULTY, 3);

});

test("generatePattern", function() {

	var patterns = RH.RhythmPatterns.generatePatterns(0, RH.RhythmPatterns.MAX_DIFFICULTY, 10);
	equal(patterns.length, 10);
	
	patterns = RH.RhythmPatterns.generatePatterns(0, RH.RhythmPatterns.MAX_DIFFICULTY, 1000);
	ok(!patterns.some(function(element){return element === undefined;}));
});
