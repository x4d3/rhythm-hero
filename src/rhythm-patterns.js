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
	Pattern.prototype = {
		getDuration:function(){
			return this.notes.reduce(function(sum, note){return sum.add(note.duration)});
		}
	};
	var Note = function(duration, isRest){
		this.duration = duration;
		this.isRest = isRest;
	};
	
	var parseNotes = function(value){
		var notes = [];
		var split = value.split(",");
		for (var i = 0; i < split.length; i++) {
			notes[i] = parseNote(split[i].trim());
		}
	};
	
	var parseNote = function(value){
		var isRest;
		if (value.charAt(value.length - 1) === 'r'){
			value = value.substring(0,value.length - 1);
			isRest = true;
		}else{
			isRest = false;
		}
		var split = value.split("/");
		var numerator = parseInt(split[0].trim(), 10);
		var denominator = parseInt(split[1].trim(), 10);
		var duration = new Fraction(numerator, denominator);
		return new Note(duration, isRest);
		
	};
	
	var PATTERNS = [];

	var addPattern = function(description, difficulty, frequency, notesString){
		var notes = parseNotes(notesString);
		var pattern = new Pattern(description, difficulty, frequency, notes);
		PATTERNS.push(pattern);
	};

	addPattern("one whole", 0, 10, "4/1");
	addPattern("one minim", 0, 10, "2/1");
	addPattern("one crotchet", 0, 100, "1/1");
	addPattern("2 quivers", 1, 100, "1/2,1/2");
	addPattern("dotted crotchet quiver", 1, 100, "3/2,1/2");
	addPattern("dotted crotchet quiver", 1, 100, "1/2,3/2");
	
	addPattern("triplet", 2, 20, "1/3,1/3,1/3");
	addPattern("crotchet triplet", 3, 20, "2/3,2/3,2/3");
	
	addPattern("crotchet rest", 0, 100, "1/1r");
	addPattern("crotchet rest", 1, 100, "1/2,1/2r");
	addPattern("crotchet rest", 1, 100, "1/2r,1/2");
	
	var difficulties = PATTERNS.map(function(x){return x.difficulty;});
	RhythmPatterns.MAX_DIFFICULTY = Math.max.apply(Math, difficulties);
	RhythmPatterns.MIN_DIFFICULTY = Math.min.apply(Math, difficulties);
	
	
	RhythmPatterns.generatePattern = function(minDifficulty, maxDifficulty, numberOfBeats){
		var filtered = PATTERNS.filter(function(x){return x.difficulty >= minDifficulty && x.difficulty<=maxDifficulty;});
		var sumFrequency = 0;
		var summedFrequencies = filtered.map(function(x){
			summedFrequencies += x.frequency;
			return summedFrequencies;
		}); 
	
	};
	
	
	return RhythmPatterns;
});

