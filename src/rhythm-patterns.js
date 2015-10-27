RH.RhythmPatterns = (function(){
	'use strict';
	var RhythmPatterns = {};
	
	var Preconditions = RH.Preconditions;
	
	
	var Pattern = function(description, difficulty, frequency, notes){
		this.description = Preconditions.checkIsString(description);
		this.difficulty = Preconditions.checkIsNumber(difficulty);
		this.frequency = Preconditions.checkIsNumber(frequency);
		this.notes = notes;
	};
	
	var Note = function(duration, isRest){
		this.duration = duration;
		this.isRest = isRest;
	};
	
	var PATTERNS = [];
	var n = function(numerator, denominator, isRest){
		return new Note(new Fraction(numerator, denominator), isRest === undefined? false : isRest);
	};
	
	var addPattern = function(description, difficulty, frequency, notes){
		var pattern = new Pattern(description, difficulty, frequency, notes);
		PATTERNS.push(pattern);
	};
	
	addPattern("one crotchet", 0, 100, n(1,1));
	
	
	return RhythmPatterns;
});

