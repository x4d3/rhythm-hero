RH.Measure = (function() {
	'use strict';
	var Measure = function(notes, firstNotePressed, lastNotePressed) {
		this.notes = notes;
		this.firstNotePressed = firstNotePressed;
		this.lastNotePressed = lastNotePressed;
	};

	Measure.prototype = {
		toString : function() {
			return "{" + this.notes + ", " + this.firstNotePressed + ", " + this.lastNotePressed + "}";
		}
	};

	return Measure;
}());