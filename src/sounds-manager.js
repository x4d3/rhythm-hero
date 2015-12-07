RH.SoundsManager = (function() {
	'use strict';
	var LOCAL_STORAGE_ID = "SoundsManager.isOn";
	var SoundsManager = {
		isOn : localStorage.getItem(LOCAL_STORAGE_ID) !== 'false'
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
		localStorage.setItem(LOCAL_STORAGE_ID, this.isOn);
		return this.isOn;
	};

	return SoundsManager;
}());
