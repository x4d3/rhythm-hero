RH.Measure = (function() {
	'use strict';
	var Preconditions = RH.Preconditions;
	
	var Measure = function(tempo, timeSignature, notes, firstNotePressed, lastNotePressed) {
		this.notes = Preconditions.checkArrayType(notes, RH.Note);
		this.firstNotePressed = firstNotePressed;
		this.lastNotePressed = lastNotePressed;
		this.isEmpty = notes.length === 0;
		this.tempo = Preconditions.checkIsNumber(tempo);
		this.timeSignature = Preconditions.checkInstance(timeSignature, RH.TimeSignature);
	};
	

	Measure.prototype = {
		toString : function() {
			return "{" + this.tempo + ", " + this.timeSignature + ", " + this.notes + ", " + this.firstNotePressed + ", " + this.lastNotePressed + "}";
		},
		getBeatPerMillisecond : function() {
			return this.tempo / (60 * 1000);
		},
		getBeatPerBar : function() {
			return this.timeSignature.getBeatPerBar();
		},
		getDuration : function() {
			return this.getBeatPerBar() / this.getBeatPerMillisecond();
		}
	};

	return Measure;
}());