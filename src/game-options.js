RH.GameOptions = (function() {
	'use strict';
	var DEFAULT_TEMPO = 60;
	var DEFAULT_TS = RH.TS.FOUR_FOUR;
	
	function GameOptions(debugMode, timeSignature, tempo) {
		this.debugMode = debugMode;
		this.timeSignature = timeSignature ? timeSignature : RH.TS.FOUR_FOUR;
		// beat per minutes
		this.tempo = tempo ? tempo : 60;
	}
	
	GameOptions.DEFAULT_TEMPO = DEFAULT_TEMPO;
	GameOptions.DEFAULT_TS = DEFAULT_TS;
	
	return GameOptions;
}());