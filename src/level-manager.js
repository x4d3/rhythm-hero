RH.LevelManager = (function() {
	'use strict';
	var RhythmPatterns = RH.RhythmPatterns;
	var TimeSignature = RH.TimeSignature;
	var Note = RH.Note;
	var GameOptions = RH.GameOptions;
	var Level = function(description, measures) {
		this.description = description;
		this.measures = measures;
	};

	var LevelManager = function() {
		this.levels = [];
	};


	LevelManager.prototype = {
		getLevel: function(index) {
			if (index < this.levels.length) {
				return this.levels[index];
			} else {
				//TODO: generate level based on index
				var options = new GameOptions();
				var notes = RhythmPatterns.generateNotes(0, options.maxDifficulty, 50);
				var measures = RhythmPatterns.generateMeasures(options, notes);
				return new Level("Level " + (index + 1), measures);
			}
		},
		registerLevels: function(levels) {
			this.levels = levels.map(function(level) {
				var description = level[0];
				var timeSignature = RH.TimeSignature.parse(level[1]);
				var tempo = level[2];
				var notes = Note.parseNotes(level[3]);
				var options = new GameOptions([timeSignature], [tempo], 1);
				var measures = RhythmPatterns.generateMeasures(options, notes);
				return new Level(description, measures);
			});
		}
	};

	return new LevelManager();
}());

(function() {
	var LEVELS = [
		["Whole, minims and quaver", "4/4", 60, "4, 2,2, 4, 2,2, 1,1,1,1, 2,1,1, 1,2,1, 1,1,2, 2,4,2"],
		["Let's rest", "4/4", 60, "1,1r,1,1r, 1,1,2, 1r,2,1r, 1,1,2r"]
	];

	RH.LevelManager.registerLevels(LEVELS);

}());