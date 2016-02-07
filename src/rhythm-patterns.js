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
		}
	};
	Note.parseNotes = function(value) {
		var notes = [];
		var split = value.split(",");
		for (var i = 0; i < split.length; i++) {
			notes[i] = Note.parseNote(split[i].trim());
		}
		return notes;
	};

	Note.parseNote = function(value) {
		var isRest;
		if (value.charAt(value.length - 1) === 'r') {
			value = value.substring(0, value.length - 1);
			isRest = true;
		} else {
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

	addPattern("whole", 0, 10, "4/1");
	addPattern("minim", 1, 20, "2/1");
	addPattern("crotchet", 1, 100, "1/1");
	addPattern("crotchet rest", 1, 100, "1/1r");
	addPattern("double quaver", 2, 100, "1/2,1/2");
	addPattern("quaver rest", 2, 100, "1/2r");
	addPattern("dotted crotchet quaver", 3, 100, "3/2,1/2");
	addPattern("quaver dotted crotchet", 3, 100, "1/2,3/2");
	addPattern("quaver", 3, 50, "1/2");
	addPattern("quaver rest quaver", 3, 100, "1/2r,1/2");

	addPattern(null, 4, 25, "1/4,1/4,1/4,1/4");
	addPattern(null, 5, 25, "1/4,1/4,1/2");
	addPattern(null, 5, 25, "1/2,1/4,1/4");
	addPattern(null, 5, 25, "3/4,1/4");
	addPattern(null, 5, 25, "1/4,3/4");

	addPattern(null, 6, 25, "1/4,1/4r,1/4,1/4");
	addPattern(null, 6, 25, "1/4,1/4r,1/2");
	addPattern(null, 6, 25, "1/2,1/4r,1/4");
	addPattern(null, 6, 25, "3/4r,1/4");
	addPattern(null, 6, 25, "1/4r,3/4");


	addPattern("triplet quaver", 7, 20, "1/3,1/3,1/3");
	addPattern("triplet crotchet", 8, 20, "2/3,2/3,2/3");

	addPattern(null, 8, 5, "1/3r,1/3,1/3");
	addPattern(null, 8, 5, "1/3r,1/3r,1/3");
	addPattern(null, 8, 5, "1/3r,1/3r,1/3r");

	addPattern(null, 8, 5, "2/3,1/3");
	addPattern(null, 8, 5, "1/3,2/3");


	addPattern(null, 8, 5, "1/6,1/6,1/6");

	addPattern("quintuplet quaver", 9, 20, "1/5,1/5,1/5,1/5,1/5");
	addPattern("quintuplet crotchet", 10, 1, "2/5,2/5,2/5,2/5,2/5");

	addPattern(null, 10, 1, "2/5,2/5r,2/5,2/5r,2/5");


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
		result.push(new RH.Measure(tempo, timeSignature, [], false, false));
		return result;
	};


	RhythmPatterns.PATTERNS = PATTERNS;
	return RhythmPatterns;
})();