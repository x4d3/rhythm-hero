RH.SoundsManager = (function() {
	'use strict';
	var SoundsManager = {};
	var SOUNDS = {
		TIC : new window.Audio('sounds/tic.mp3'),
		TOC : new window.Audio('sounds/toc.mp3')
	};
	SoundsManager.play = function(id) {
		if (RH.Parameters.model.soundsOn()) {
			SOUNDS[id].play();
		}
	};


	return SoundsManager;
}());
