RH.TimeSignature = (function() {
	'use strict';
	function TimeSignature(numerator, denominator) {
		this.numerator = numerator;
		this.denominator = denominator;
	}
	TimeSignature.prototype = {
		toString : function() {
			return this.numerator + "/" + this.denominator;
		},
		// one beat = one 1/4th
		getBeatPerBar : function() {
			return this.numerator * 4 / this.denominator;
		},
		equals : function(other) {
			return other.numerator == this.numerator && other.denominator == this.denominator;
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