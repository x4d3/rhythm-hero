RH.SoundsManager = (function() {
	'use strict';
	var SoundsManager = {};

	$.mbAudio.sounds = {

		backgroundSprite: {},

		effectSprite: {
			id: "effectSprite",
			ogg: "sounds/sprites.ogg",
			mp3: "sounds/sprites.mp3",
			sprite: {
				TIC: {
					id: "TIC",
					start: 0,
					end: 0.16,
					loop: false
				},
				TOC: {
					id: "TOC",
					start: 0.27,
					end: 0.425,
					loop: false
				}
			}
		}
	};

	SoundsManager.play = function(id) {
		if (RH.Parameters.model.soundsOn()) {
			$.mbAudio.play('effectSprite', id);
		}
	};


	return SoundsManager;
}());