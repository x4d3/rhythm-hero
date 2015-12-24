RH.VexUtils = (function() {
	'use strict';
	var VexUtils = {};
	var VF = Vex.Flow;
	var DIATONIC_ACCIDENTALS = [ "unison", "m2", "M2", "m3", "M3", "p4", "dim5", "p5", "m6", "M6", "b7", "M7" ];

	var ALL_NOTES = {
		'C' : {
			root_index : 0,
			int_val : 0
		},
		'Db' : {
			root_index : 1,
			int_val : 1
		},
		'D' : {
			root_index : 1,
			int_val : 2
		},

		'Eb' : {
			root_index : 2,
			int_val : 3
		},
		'E' : {
			root_index : 2,
			int_val : 4
		},
		'F' : {
			root_index : 3,
			int_val : 5
		},
		'F#' : {
			root_index : 3,
			int_val : 6
		},
		'G' : {
			root_index : 4,
			int_val : 7
		},
		'Ab' : {
			root_index : 5,
			int_val : 8
		},
		'A' : {
			root_index : 5,
			int_val : 9
		},
		'Bb' : {
			root_index : 6,
			int_val : 10
		},
		'B' : {
			root_index : 6,
			int_val : 11
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
			keys : [ key ],
			duration : duration.toString()
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
	var generateNotesTupletTiesAndBeams = function(notes) {

		var allNotes = [];
		notes.forEach(function(note) {
			var notesData = [];
			var duration = note.duration;
			var isRest = note.isRest;
			var key;
			if (isRest) {
				key = "a/4";
			} else {
				key = VexUtils.randomKey();
			}

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
					if (i > 0 && binary[i - 1]) {
						last(notesData).dots++;
					} else {
						var x = 1 << (binary.length - i - 1);
						var noteDuration = new Fraction(4 * duration.denominator, x);
						Vex.Flow.sanitizeDuration(fractionToString(noteDuration));
						notesData.push({
							keys : [ key ],
							duration : noteDuration,
							dots : 0,
							tupletFactor : tupletFactor,
							type : isRest ? "r" : ""
						});
					}
				}
			}
			allNotes.push(notesData);
		});
		var vxNotes = [];
		var ties = [];
		var tuplets = [];
		var currentTuplet = [];
		allNotes.forEach(function(notesData) {
			notesData.forEach(function(noteData, j) {
				var vxNote = new VF.StaveNote({
					keys : noteData.keys,
					duration : fractionToString(noteData.duration),
					dots : noteData.dots,
					type : noteData.type
				});
				for (var i = 0; i < noteData.dots; i++) {
					vxNote.addDotToAll();
				}
				if (j > 0) {
					var tie = new Vex.Flow.StaveTie({
						first_note : last(vxNotes),
						last_note : vxNote,
						first_indices : [ 0 ],
						last_indices : [ 0 ]
					});
					ties.push(tie);
				}
				vxNotes.push(vxNote);

				if (noteData.tupletFactor !== undefined) {
					currentTuplet.push(noteData);
					var wholeDuration = currentTuplet.reduce(function(sum, note) {
						return sum.add(note.duration);
					}, Fraction.ZERO);
					wholeDuration = wholeDuration.divide(new Fraction(noteData.tupletFactor, 1));
					var n = wholeDuration.numerator;
					var d = wholeDuration.denominator;
					if ((n == 1 && isPowerTwo(d)) || (d == 1 && isPowerTwo(1))) {
						var tupletOption = {
							num_notes : noteData.tupletFactor,
							beats_occupied : wholeDuration.value()
						};
						var tuplet = new VF.Tuplet(vxNotes.slice(-currentTuplet.length), tupletOption);
						tuplets.push(tuplet);
						currentTuplet = [];
					}
				}

			});
		});
		var beamsOption = {
			beam_rests : true,
			beam_middle_only : true
		};
		return {
			notes : vxNotes,
			tuplets : tuplets,
			ties : ties,
			beams : VF.Beam.generateBeams(vxNotes, beamsOption)
		};

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
			width : measureWidth * measures.length,
			height : measureHeight
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
				// display
				var x = measureWidth * i;
				var beatPerBar = measure.getBeatPerBar();
				for (var j = 0; j < beatPerBar; j++) {
					context.fillText(j + 1, x + j * measureWidth / beatPerBar, 60);
				}
				return true;
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
					duration : "q",
					bpm : tempo
				}, 0);
			}

			stave.draw(context);
			var formatter = new VF.Formatter();
			var result = generateNotesTupletTiesAndBeams(measure.notes);
			var voice = new VF.Voice({
				num_beats : timeSignature.numerator,
				beat_value : timeSignature.denominator,
				resolution : VF.RESOLUTION
			});
			voice.setStrict(false);
			voice.addTickables(result.notes);
			formatter.joinVoices([ voice ]).formatToStave([ voice ], stave);
			voice.draw(context, stave);
			if (measure.firstNotePressed) {
				var tie = new Vex.Flow.StaveTie({
					first_note : previousMeasureLastNote,
					last_note : result.notes[0],
					first_indices : [ 0 ],
					last_indices : [ 0 ]
				});
				result.ties.push(tie);
			}

			result.beams.forEach(function(beam) {
				beam.setContext(context).draw();
			});
			result.tuplets.forEach(function(tuplet) {
				tuplet.setContext(context).draw();
			});
			result.ties.forEach(function(tie) {
				tie.setContext(context).draw();
			});

			previousMeasureLastNote = last(result.notes);
		});
		var result = [];
		for (var i = 0; i < measures.length; i++) {
			result[i] = context.getImageData(measureWidth * i, 0, measureWidth, measureHeight);
		}
		return result;
	};

	return VexUtils;
}());
