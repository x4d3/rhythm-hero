RH.Note = (function() {
	'use strict';
	var Preconditions = RH.Preconditions;
	var Note = function(duration, isRest) {
		this.duration = Preconditions.checkInstance(duration, Fraction);
		this.isRest = Preconditions.checkType(isRest, 'boolean');
	};


	Note.prototype = {
		toString: function() {
			return this.duration.toString() + (this.isRest ? "r" : "");
		},
		split: function(duration) {
			if (this.duration.compareTo(duration) < 0) {
				throw 'duration: ' + duration + " can't be bigger than note duration: " + this.duration;
			}
			var splitDuration = this.duration.subtract(duration);
			return [new Note(duration, this.isRest), new Note(splitDuration, this.isRest)];
		},
		equals: function(other) {
			return this.duration.equals(other.duration) && this.isRest === other.isRest;
		}
	};

	Note.parseNotes = function(value) {
		var notes = [];
		var split = value.match(/\S+/g);
		for (var i = 0; i < split.length; i++) {
			notes[i] = Note.parseNote(split[i]);
		}
		return notes;
	};

	var NOTES_ALIASES = {
		"w": new Note(new Fraction(4, 1), false), // whole
		"m": new Note(new Fraction(2, 1), false), // minim
		"c": new Note(new Fraction(1, 1), false), // crotchet
		"q": new Note(new Fraction(1, 2), false), // quaver
		"s": new Note(new Fraction(1, 4), false), // semiquaver
		"r": new Note(new Fraction(1, 1), true), // rest
		"qr": new Note(new Fraction(1, 2), true), // quaver rest
		"sr": new Note(new Fraction(1, 4), true), // semiquaver rest

		"tc": new Note(new Fraction(2, 3), false),
		"tq": new Note(new Fraction(1, 3), false),
		"tqr": new Note(new Fraction(1, 3), true),
	};

	Note.parseNote = function(value) {

		var note = NOTES_ALIASES[value];
		if (note) {
			return note;
		}
		if(!value.match(/^\d+(\/\d+)?r?$/)){
			throw value + " is not a valid note.";
		}
		var isRest;
		var replaced;
		if (value.charAt(value.length - 1) === 'r') {
			replaced = value.substring(0, value.length - 1);
			isRest = true;
		} else {
			replaced = value;
			isRest = false;
		}
		var duration = Fraction.parse(value);
		return new Note(duration, isRest);



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
		getDuration: function() {
			return this.notes.reduce(function(sum, note) {
				return sum.add(note.duration);
			}, Fraction.ZERO);
		},
		toString: function() {
			return "Pattern[" + this.description + ",D:" + this.difficulty + ",F:" + this.frequency + ",notes:" + this.notes + ",duration:" + this.getDuration() + "]";
		}
	};

	return Pattern;
})();

RH.RhythmPatterns = (function() {
	'use strict';
	var Note = RH.Note;
	var Pattern = RH.Pattern;
	var Measure = RH.Measure;
	var RhythmPatterns = {};

	var PATTERNS = [];
	var PATTERNS_PER_DESCRIPTION = {};
	var addPattern = function(description, difficulty, frequency, notesString) {
		if (description === null) {
			description = notesString;
		}
		var notes = Note.parseNotes(notesString);
		var pattern = new Pattern(description, difficulty, frequency, notes);
		PATTERNS.push(pattern);
		if (PATTERNS_PER_DESCRIPTION[description] !== undefined) {
			throw 'duplicate description: ' + description;
		}
		PATTERNS_PER_DESCRIPTION[description] = pattern;
	};

	addPattern("whole", 0, 10, "w");
	addPattern("minim", 1, 20, "m");
	addPattern("crotchet", 1, 100, "c");
	addPattern("crotchet rest", 1, 100, "r");
	addPattern("double quaver", 2, 100, "q q");
	addPattern("quaver rest", 2, 100, "qr");
	addPattern("dotted crotchet quaver", 3, 100, "3/2 q");
	addPattern("quaver dotted crotchet", 3, 100, "q 3/2");
	addPattern("quaver", 3, 50, "q");
	addPattern("quaver rest quaver", 3, 100, "qr q");

	addPattern(null, 4, 25, "s s s s");
	addPattern(null, 5, 25, "s s q");
	addPattern(null, 5, 25, "q s s");
	addPattern(null, 5, 25, "3/4 s");
	addPattern(null, 5, 25, "s 3/4");

	addPattern(null, 6, 25, "s sr s s");
	addPattern(null, 6, 25, "s sr q");
	addPattern(null, 6, 25, "q sr s");
	addPattern(null, 6, 25, "3/4r s");
	addPattern(null, 6, 25, "sr 3/4");


	addPattern("triplet quaver", 7, 20, "tq tq tq");
	addPattern("triplet crotchet", 8, 20, "2/3 2/3 2/3");

	addPattern(null, 8, 5, "tqr tq tq");
	addPattern(null, 8, 5, "tqr tqr tq");
	addPattern(null, 8, 5, "tqr tqr tqr");

	addPattern(null, 8, 5, "2/3 tq");
	addPattern(null, 8, 5, "tq 2/3");


	addPattern(null, 8, 5, "1/6 1/6 1/6");

	addPattern("quintuplet quaver", 9, 20, "1/5 1/5 1/5 1/5 1/5");
	addPattern("quintuplet crotchet", 10, 1, "2/5 2/5 2/5 2/5 2/5");

	addPattern(null, 10, 1, "2/5 2/5r 2/5 2/5r 2/5");


	var difficulties = PATTERNS.map(function(x) {
		return x.difficulty;
	});
	RhythmPatterns.MAX_DIFFICULTY = Math.max.apply(Math, difficulties);

	RhythmPatterns.generateNotes = function(minDifficulty, maxDifficulty, size) {
		var filtered = PATTERNS.filter(function(x) {
			return x.difficulty >= minDifficulty && x.difficulty <= maxDifficulty;
		});
		var sumFrequency = 0;
		var summedFrequencies = filtered.map(function(x) {
			sumFrequency += x.frequency;
			return sumFrequency;
		});
		var notes = [];
		for (var i = 0; i < size; i++) {
			var alea = Math.random() * sumFrequency;
			var index = RH.binarySearch(summedFrequencies, alea) + 1;
			if (index >= filtered.length) {
				throw 'error: ' + index + ",[" + summedFrequencies + "], " + alea + ", " + sumFrequency;
			}
			notes = notes.concat(filtered[index].notes);
		}
		return notes;
	};

	RhythmPatterns.getPattern = function(description) {
		var pattern = PATTERNS_PER_DESCRIPTION[description];
		if (pattern === undefined) {
			throw 'Unrecognized description: ' + description;
		}
		return pattern;
	};
	// static method

	RhythmPatterns.generateMeasures = function(tempi, timeSignatures, notes) {
		//The two first measure are empty
		var tempo = tempi[0];
		var timeSignature = timeSignatures[0];
		var beatPerBarF = new Fraction(timeSignature.getBeatPerBar(), 1);


		var result = [new RH.Measure(tempo, timeSignature, [], false, false)];

		var measure = {
			beats: Fraction.ZERO,
			notes: []
		};

		var firstNotePressed = false;
		notes.forEach(function(note) {
			var sum = note.duration.add(measure.beats);
			var compare = sum.compareTo(beatPerBarF);
			while (compare >= 0) {
				var durationLeft = beatPerBarF.subtract(measure.beats);
				var split = note.split(durationLeft);
				measure.notes.push(split[0]);
				var lastNotPressed = !note.isRest && compare !== 0;
				result.push(new Measure(tempo, timeSignature, measure.notes, firstNotePressed, lastNotPressed));
				tempo = RH.getArrayElement(tempi, result.length);
				timeSignature = RH.getArrayElement(timeSignatures, result.length);
				beatPerBarF = new Fraction(timeSignature.getBeatPerBar(), 1);
				measure = {
					beats: Fraction.ZERO,
					notes: []
				};
				firstNotePressed = lastNotPressed;
				note = split[1];
				sum = measure.beats.add(note.duration);
				compare = sum.compareTo(beatPerBarF);
			}
			measure.beats = sum;
			if (!note.duration.equals(Fraction.ZERO)) {
				measure.notes.push(note);
			}

		});
		// we don't fill the last bar
		result.push(new RH.Measure(tempo, RH.TS.TWO_FOUR, [], false, false));
		return result;
	};


	RhythmPatterns.PATTERNS = PATTERNS;
	return RhythmPatterns;
})();