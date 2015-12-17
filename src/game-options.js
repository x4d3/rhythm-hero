RH.GameOptions = (function() {
	'use strict';
	var DEFAULT_TEMPO = 60;
	var DEFAULT_TS = RH.TS.FOUR_FOUR;

	function GameOptions(timeSignature, tempi, maxDifficulty) {
		this.timeSignatures = timeSignature ? timeSignature : [ DEFAULT_TS ];
		this.tempi = tempi ? tempi : [ DEFAULT_TEMPO ];
		this.maxDifficulty = maxDifficulty ? maxDifficulty : RH.RhythmPatterns.MAX_DIFFICULTY;
	}

	GameOptions.DEFAULT_TEMPO = DEFAULT_TEMPO;
	GameOptions.DEFAULT_TS = DEFAULT_TS;

	return GameOptions;
}());