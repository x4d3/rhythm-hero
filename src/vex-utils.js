RH.VexUtils = (function(){
	'use strict';
	var VexUtils = {};
	
	var DIATONIC_ACCIDENTALS = [
		"unison", 
		"m2",     
		"M2",     
		"m3",     
		"M3",     
		"p4",     
		"dim5",   
		"p5",     
		"m6",     
		"M6",     
		"b7",     
		"M7"
	];
	
	var ALL_NOTES = {
		'C':   { root_index: 0, int_val: 0 },
		'Db':  { root_index: 1, int_val: 1 },
		'D':   { root_index: 1, int_val: 2 },

		'Eb':  { root_index: 2, int_val: 3 },
		'E':   { root_index: 2, int_val: 4 },
		'F':   { root_index: 3, int_val: 5 },
		'F#':  { root_index: 3, int_val: 6 },
		'G':   { root_index: 4, int_val: 7 },
		'Ab':  { root_index: 5, int_val: 8 },
		'A':   { root_index: 5, int_val: 9 },
		'Bb':  { root_index: 6, int_val: 10 },
		'B':   { root_index: 6, int_val: 11 },
	};
	
	var ALL_NOTES_ARRAY = $.map(ALL_NOTES, function(i, index){
		return index;
	});
	var ORIGINAL_KEYS = ALL_NOTES_ARRAY;
	var TRANSPOSED_KEYS = ALL_NOTES_ARRAY;
	
	VexUtils.randomKey = function(){
		var index = Math.floor((Math.random() * 14));
		return VexUtils.newKey(index);
	};
	VexUtils.newKey = function(index){
		var division = RH.divide(index, 7);
		var scale = 4 + division.quotient;
		var key = RH.getArrayElement(Vex.Flow.Music.roots, division.rest); 
		return key + "/" + scale;
	};
	VexUtils.newNote = function(key, duration){
		return new Vex.Flow.StaveNote({ keys: [key], duration: duration.toString()});
	};

	return VexUtils;
}());


