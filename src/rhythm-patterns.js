RH.Note = (function() {
	'use strict';
	var Preconditions = RH.Preconditions;

	var Note = function(duration, isRest) {
		this.duration = Preconditions.checkInstance(duration, Fraction);
		this.isRest = Preconditions.checkType(isRest, 'boolean');
	};

	Note.prototype = {
		toString : function() {
			return this.duration.toString() + (this.isRest ? "r" : "");
		},
		split : function(duration) {
			if (this.duration.compareTo(duration) < 0) {
				throw 'duration: ' + duration + " can't be bigger than note duration: " + this.duration;
			}
			var splitDuration = this.duration.subtract(duration);
			return [ new Note(duration, this.isRest), new Note(splitDuration, this.isRest) ];
		}
	};

	return Note;
})();

RH.Pattern = (function() {
	'use strict';
	var Preconditions = RH.Preconditions;
	var Note = RH.Note;

	var Pattern = function(description, difficulty, frequency, notes) {
		this.description = Preconditions.checkIsString(description);
		this.difficulty = Preconditions.checkIsNumber(difficulty);
		this.frequency = Preconditions.checkIsNumber(frequency);
		this.notes = Preconditions.checkArrayType(notes, Note);
	};

	Pattern.prototype = {
		getDuration : function() {
			return this.notes.reduce(function(sum, note) {
				return sum.add(note.duration);
			}, Fraction.ZERO);
		},
		toString : function() {
			return "Pattern[" + this.description + ",D:" + this.difficulty + ",F:" + this.frequency + ",notes:" + this.notes + ",duration:" + this.getDuration() + "]";
		}
	};

	return Pattern;
})();

RH.RhythmPatterns = (function() {
	'use strict';
	var Note = RH.Note;
	var Pattern = RH.Pattern;

	var RhythmPatterns = {};

	var parseNotes = function(value) {
		var notes = [];
		var split = value.split(",");
		for (var i = 0; i < split.length; i++) {
			notes[i] = parseNote(split[i].trim());
		}
		return notes;
	};

	var parseNote = function(value) {
		var isRest;
		if (value.charAt(value.length - 1) === 'r') {
			value = value.substring(0, value.length - 1);
			isRest = true;
		} else {
			isRest = false;
		}
		var duration =  Fraction.parse(value);
		return new Note(duration, isRest);
	};

	var PATTERNS = [];
	var PATTERNS_PER_DESCRIPTION = {};
	var addPattern = function(description, difficulty, frequency, notesString) {
		if (description === null){
			description = notesString;
		}
		var notes = parseNotes(notesString);
		var pattern = new Pattern(description, difficulty, frequency, notes);
		PATTERNS.push(pattern);
		if (PATTERNS_PER_DESCRIPTION[description] !== undefined) {
			throw 'duplicate description: ' + description;
		}
		PATTERNS_PER_DESCRIPTION[description] = pattern;
	};

	addPattern("whole", 0, 10, "4/1");
	addPattern("minim", 0, 10, "2/1");
	addPattern("crotchet", 0, 100, "1/1");
	addPattern("quaver", 0, 50, "1/2");
	addPattern("double quaver", 1, 100, "1/2,1/2");
	addPattern("dotted crotchet quaver", 1, 100, "3/2,1/2");
	addPattern("quaver dotted crotchet", 1, 100, "1/2,3/2");

	addPattern("crotchet rest", 0, 100, "1/1r");
	addPattern("quaver rest", 1, 100, "1/2r");
	addPattern("quaver rest quaver", 1, 100, "1/2r,1/2");
	
	addPattern(null, 2, 25, "1/4,1/4,1/4,1/4");
	addPattern(null, 2, 25, "1/4,1/4,1/2");
	addPattern(null, 2, 25, "1/2,1/4,1/4");
	addPattern(null, 2, 25, "3/4,1/4");
	addPattern(null, 2, 25, "1/4,3/4");
	
	addPattern(null, 2, 25, "1/4,1/4r,1/4,1/4");
	addPattern(null, 2, 25, "1/4,1/4r,1/2");
	addPattern(null, 2, 25, "1/2,1/4r,1/4");
	addPattern(null, 2, 25, "3/4r,1/4");
	addPattern(null, 2, 25, "1/4r,3/4");
	
	
	
	addPattern("triplet quaver", 2, 20, "1/3,1/3,1/3");
	addPattern("triplet crotchet", 3, 20, "2/3,2/3,2/3");

	addPattern("quintuplet quaver", 5, 20, "1/5,1/5,1/5,1/5,1/5");
	addPattern("quintuplet crotchet", 6, 20, "2/5,2/5,2/5,2/5,2/5");

	var difficulties = PATTERNS.map(function(x) {
		return x.difficulty;
	});
	RhythmPatterns.MAX_DIFFICULTY = Math.max.apply(Math, difficulties);

	RhythmPatterns.generatePatterns = function(minDifficulty, maxDifficulty, size) {
		var filtered = PATTERNS.filter(function(x) {
			return x.difficulty >= minDifficulty && x.difficulty <= maxDifficulty;
		});
		var sumFrequency = 0;
		var summedFrequencies = filtered.map(function(x) {
			sumFrequency += x.frequency;
			return sumFrequency;
		});
		var result = [];
		for (var i = 0; i < size; i++) {
			var alea = Math.random() * sumFrequency;
			var index = RH.binarySearch(summedFrequencies, alea) + 1 ;
			if (index >= filtered.length){
				throw 'error: ' + index + ",[" + summedFrequencies + "], " + alea +", " + sumFrequency;
			}
			result[i] = filtered[index];
		}
		return result;
	};

	RhythmPatterns.getPattern = function(description) {
		var pattern = PATTERNS_PER_DESCRIPTION[description];
		if (pattern === undefined) {
			throw 'Unrecognized description: ' + description;
		}
		return pattern;
	};

	RhythmPatterns.PATTERNS = PATTERNS;
	return RhythmPatterns;
})();
