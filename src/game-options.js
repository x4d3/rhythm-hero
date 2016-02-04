RH.GameOptions = (function() {
	'use strict';
	var DEFAULT_TEMPO = 60;
	var DEFAULT_TS = RH.TS.FOUR_FOUR;

	function GameOptions(timeSignatures, tempi, maxDifficulty) {
		this.timeSignatures = timeSignatures ? timeSignatures : [ DEFAULT_TS ];
		this.tempi = tempi ? tempi : [ DEFAULT_TEMPO ];
		this.maxDifficulty = maxDifficulty ? maxDifficulty : RH.RhythmPatterns.MAX_DIFFICULTY;
	}
	GameOptions.prototype = {
		toString : function() {
			return "TS: " + this.timeSignatures + " Tempi: " + this.tempi + " Difficulty: " + this.maxDifficulty;
		}
	};
	GameOptions.DEFAULT_TEMPO = DEFAULT_TEMPO;
	GameOptions.DEFAULT_TS = DEFAULT_TS;

	return GameOptions;
}());