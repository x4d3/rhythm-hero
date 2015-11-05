RH.TimeSignature = (function() {
	'use strict';
	function TimeSignature(numerator, denumerator) {
		this.numerator = numerator;
		this.denumerator = denumerator;
	}
	TimeSignature.prototype = {
		toString : function() {
			return this.numerator + "/" + this.denumerator;
		},
		// one beat = one 1/4th
		getBeatPerBar : function() {
			return this.numerator * 4 / this.denumerator;
		}
	};
	TimeSignature.parse = function(string) {
		var array = string.split("/");
		return new TimeSignature(parseInt(array[0], 10), parseInt(array[1], 10));
	};
	return TimeSignature;
}());

RH.TS = {
	FOUR_FOUR : new RH.TimeSignature(4, 4),
	THREE_FOUR : new RH.TimeSignature(3, 4)
};