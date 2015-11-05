RH.SoundsManager = (function() {
	'use strict';
	var SoundsManager = {
		isOn : true
	};
	var SOUNDS = {
		TIC : new window.Audio('sounds/tic.mp3'),
		TOC : new window.Audio('sounds/toc.mp3')
	};
	SoundsManager.play = function(id) {
		if (this.isOn) {
			SOUNDS[id].play();
		}
	};

	SoundsManager.switchSound = function() {
		this.isOn = !this.isOn;
		return this.isOn;
	};

	return SoundsManager;
}());
