RH.VexUtils = (function() {
	'use strict';
	var VexUtils = {};
	var VF = Vex.Flow;
	var DIATONIC_ACCIDENTALS = ["unison", "m2", "M2", "m3", "M3", "p4", "dim5", "p5", "m6", "M6", "b7", "M7"];

	var ALL_NOTES = {
		'C': {
			root_index: 0,
			int_val: 0
		},
		'Db': {
			root_index: 1,
			int_val: 1
		},
		'D': {
			root_index: 1,
			int_val: 2
		},

		'Eb': {
			root_index: 2,
			int_val: 3
		},
		'E': {
			root_index: 2,
			int_val: 4
		},
		'F': {
			root_index: 3,
			int_val: 5
		},
		'F#': {
			root_index: 3,
			int_val: 6
		},
		'G': {
			root_index: 4,
			int_val: 7
		},
		'Ab': {
			root_index: 5,
			int_val: 8
		},
		'A': {
			root_index: 5,
			int_val: 9
		},
		'Bb': {
			root_index: 6,
			int_val: 10
		},
		'B': {
			root_index: 6,
			int_val: 11
		},
	};

	var ALL_NOTES_ARRAY = $.map(ALL_NOTES, function(i, index) {
		return index;
	});
	var ORIGINAL_KEYS = ALL_NOTES_ARRAY;
	var TRANSPOSED_KEYS = ALL_NOTES_ARRAY;
	var currentIndex = 7;
	var distribution = gaussian(0, 3);

	VexUtils.randomKey = function() {
		currentIndex += Math.floor(distribution.ppf(Math.random()));
		if (currentIndex < 0) {
			currentIndex = 0;
		} else if (currentIndex > 14) {
			currentIndex = 14;
		}
		return VexUtils.newKey(currentIndex);
	};

	VexUtils.newKey = function(index) {
		var division = RH.divide(index, 7);
		var scale = 4 + division.quotient;
		var key = RH.getArrayElement(VF.Music.roots, division.rest);
		return key + "/" + scale;
	};

	VexUtils.newNote = function(key, duration) {
		return new VF.StaveNote({
			keys: [key],
			duration: duration.toString()
		});
	};
	// TODO: please re implement correctly.
	var toBinary = function(n) {
		return n.toString(2).split("").map(function(s) {
			return parseInt(s, 2);
		});
	};
	var last = function(a) {
		return a[a.length - 1];
	};

	var find = function(array, predicate) {
		if (array === null) {
			throw new TypeError('Array.prototype.find called on null or undefined');
		}
		if (typeof predicate !== 'function') {
			throw new TypeError('predicate must be a function');
		}
		var list = Object(array);
		var length = list.length >>> 0;
		var thisArg = arguments[1];
		var value;

		for (var i = 0; i < length; i++) {
			value = list[i];
			if (predicate.call(thisArg, value, i, list)) {
				return value;
			}
		}
		return undefined;
	};

	var isPowerTwo = function(n) {
		return (n & (n - 1)) === 0;
	};
	//Awful, awful code...Refactor please.
	//generate notes Tuplet TiesAnd Beams
	var generateStaveElements = function(notes) {
		var allNotes = [];
		var durationBuffer = Fraction.ZERO;
		notes.forEach(function(note) {
			var notesData = [];
			var isRest = note.isRest;
			var key;
			if (isRest) {
				key = "a/4";
			} else {
				key = VexUtils.randomKey();
			}
			var processNote = function(note) {
				var duration = note.duration;
				var tupletFactor;
				if (duration.denominator != 1) {
					var dFactors = PrimeLibrary.factor(duration.denominator);
					tupletFactor = find(dFactors, function(factor) {
						return factor != 2;
					});
				}

				if (tupletFactor !== undefined) {
					duration = duration.multiply(new Fraction(tupletFactor, 1)).divide(new Fraction(2, 1));
				}
				var binary = toBinary(duration.numerator);

				for (var i = 0; i < binary.length; i++) {
					if (binary[i]) {
						if (!isRest && i > 0 && binary[i - 1]) {
							last(notesData).dots++;
						} else {
							var x = 1 << (binary.length - i - 1);
							var noteDuration = new Fraction(4 * duration.denominator, x);
							Vex.Flow.sanitizeDuration(fractionToString(noteDuration));
							notesData.push({
								keys: [key],
								duration: noteDuration,
								dots: 0,
								tupletFactor: tupletFactor,
								isRest: isRest ? "r" : ""
							});
						}
					}
				}
				allNotes.push(notesData);
			};

			var sum = durationBuffer.add(note.duration);
			var compare = Fraction.ONE.compareTo(sum);
			//Separate note if they overflow a beat and don't come right on another beat
			while (compare < 0 && !sum.mod(1).equals(Fraction.ZERO)) {
				var durationLeft = Fraction.ONE.subtract(durationBuffer);
				var split = note.split(durationLeft);
				processNote(split[0]);
				note = split[1];
				durationBuffer = Fraction.ZERO;
				sum = note.duration;
				compare = Fraction.ONE.compareTo(sum);
			}
			durationBuffer = sum.mod(1);
			if (!note.duration.equals(Fraction.ZERO)) {
				processNote(note);
			}

		});
		var result = {
			notes: [],
			tuplets: []
		};
		var currentTuplet = [];
		allNotes.forEach(function(notesData) {
			notesData.forEach(function(noteData, j) {
				result.notes.push({
					keys: noteData.keys,
					duration: fractionToString(noteData.duration),
					dots: noteData.dots,
					type: noteData.isRest ? "r" : "",
					isTied: j > 0 && !noteData.isRest
				});


				if (noteData.tupletFactor !== undefined) {
					currentTuplet.push(noteData);
					var wholeDuration = currentTuplet.reduce(function(sum, note) {
						return sum.add(note.duration.inverse());
					}, Fraction.ZERO);
					wholeDuration = wholeDuration.divide(new Fraction(noteData.tupletFactor, 2));
					var n = wholeDuration.numerator;
					var d = wholeDuration.denominator;
					if ((n == 1 && isPowerTwo(d)) || (d == 1 && isPowerTwo(n))) {
						var tuplet = {
							tupletFactor: noteData.tupletFactor,
							beats_occupied: 2,
							index: result.notes.length - currentTuplet.length,
							size: currentTuplet.length
						};
						result.tuplets.push(tuplet);
						currentTuplet = [];
					}
				}

			});
		});
		return result;

	};
	var fractionToString = function(duration) {
		if (duration.denominator == 1) {
			return duration.numerator.toString();
		} else {
			return duration.toString();
		}
	};


	VexUtils.generateMeasuresCanvases = function(measureWidth, measureHeight, measures) {
		var tempCanvaJ = $('<canvas>');

		tempCanvaJ.prop({
			width: measureWidth * measures.length,
			height: measureHeight
		});
		var tempCanvas = tempCanvaJ[0];
		var context = tempCanvas.getContext('2d');
		var renderer = new VF.Renderer(tempCanvas, VF.Renderer.Backends.CANVAS);
		var ctx = renderer.getContext();
		var currentTimeSignature = null;
		var currentTempo = null;
		var previousMeasureLastNote = null;
		measures.forEach(function(measure, i) {
			if (measure.isEmpty) {
				return;
			}
			var timeSignature = measure.timeSignature;
			var tempo = measure.tempo;
			var stave = new VF.Stave(measureWidth * i, 0, measureWidth);
			stave.setContext(context);

			if (currentTimeSignature === null || !currentTimeSignature.equals(timeSignature)) {
				currentTimeSignature = timeSignature;
				stave.addTimeSignature(timeSignature.toString());
			}
			if (currentTempo === null || currentTempo != tempo) {
				currentTempo = tempo;
				stave.setTempo({
					duration: "q",
					bpm: tempo
				}, 0);
			}

			stave.draw(context);
			var formatter = new VF.Formatter();
			var staveElements = generateStaveElements(measure.notes);
			var voice = new VF.Voice({
				num_beats: timeSignature.numerator,
				beat_value: timeSignature.denominator,
				resolution: VF.RESOLUTION
			});
			voice.setStrict(false);

			var ties = [];
			var staveNotes = [];
			staveElements.notes.forEach(function(noteData, index) {
				var staveNote = new VF.StaveNote(noteData);
				for (var i = 0; i < noteData.dots; i++) {
					staveNote.addDotToAll();
				}
				if (noteData.isTied) {
					var tie = new Vex.Flow.StaveTie({
						first_note: staveNotes[index - 1],
						last_note: staveNote,
						first_indices: [0],
						last_indices: [0]
					});
					ties.push(tie);
				}
				staveNotes.push(staveNote);
			});


			var tuplets = staveElements.tuplets.map(function(tupleInfo) {

				var tupletOption = {
					num_notes: tupleInfo.tupletFactor,
					beats_occupied: tupleInfo.beats_occupied
				};
				var tupletNotes = staveNotes.slice(tupleInfo.index, tupleInfo.index + tupleInfo.size);
				return new VF.Tuplet(tupletNotes, tupletOption);
			});
			var beamsOption = {
				beam_rests: true,
				beam_middle_only: true
			};
			var beams = VF.Beam.generateBeams(staveNotes, beamsOption);


			voice.addTickables(staveNotes);
			formatter.joinVoices([voice]).formatToStave([voice], stave);
			voice.draw(context, stave);
			if (measure.firstNotePressed) {
				var tie = new Vex.Flow.StaveTie({
					first_note: previousMeasureLastNote,
					last_note: staveNotes[0],
					first_indices: [0],
					last_indices: [0]
				});
				ties.push(tie);
			}
			tuplets.forEach(function(tuplet) {
				tuplet.setContext(context).draw();
			});
			beams.forEach(function(beam) {
				beam.setContext(context).draw();
			});
			ties.forEach(function(tie) {
				tie.setContext(context).draw();
			});

			previousMeasureLastNote = last(staveNotes);
		});
		var result = [];
		for (var i = 0; i < measures.length; i++) {
			result[i] = context.getImageData(measureWidth * i, 0, measureWidth, measureHeight);
		}
		return result;
	};
	VexUtils.generateStaveElements = generateStaveElements;
	return VexUtils;
}());