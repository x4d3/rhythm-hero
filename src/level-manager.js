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
				var notes = RhythmPatterns.generateNotes(5, 15, 50);
				var measures = RhythmPatterns.generateMeasures([120], [RH.TS.FOUR_FOUR], notes);
				return new Level("Level " + (index + 1), measures);
			}
		},
		registerLevels: function(levels) {
			this.levels = levels.map(function(level, index) {
				var description = level[0];
				var timeSignatures = level[1].map(RH.TimeSignature.parse);
				var tempi = level[2];
				var notes = Note.parseNotes(level[3]);
				var measures = RhythmPatterns.generateMeasures(tempi, timeSignatures, notes);
				return new Level("Level " + (index + 1) + ": " + description, measures);
			});
		}
	};

	return new LevelManager();
}());
(function() {
	var repeat = function(element, count) {
		var array = new Array(count);
		for (var i = 0; i < count; i++) {
			array[i] = element;
		}
		return array.join(",");
	};
	var bolero = "";
	var LEVELS = [
		["Whole, minims and quaver", ["4/4"],
			[60], "4, 2,2, 4, 2,2, 1,1,1,1, 2,1,1, 1,2,1, 1,1,2, 2,4,2"
		],
		["Let's rest", ["4/4"],
			[60], "1,1r,1,1r, 1,1,2, 1r,2,1r, 1,1,2r"
		],

		["Wiganor", ["4/4"],
			[60],
			[
				"13/3, 1/3,1/3, 1/3 ,1/3 ,1/3 ,5/6,1,9/2",
				repeat("1/3", 12),
				"1/2,1/2,1/2r,1/2,1/2r,1/2,1/2r,1/2",
				"1r,1/2,3/2r,1/2,1/2r"
			].join(",")
		],


		["Mars Attack!", ["4/4"],
			[90], repeat(repeat("1/2,1/2,1/4,1/4,1/4,1/4r", 3) + ", 1/2,1/2,1", 2)
		],

		["Bolero", ["3/4"],
			[72],
			[repeat("1/2,1/6,1/6,1/6, 1/2,1/6,1/6,1/6, 1/2,1/2, 1/2,1/6,1/6,1/6, 1/2,1/6,1/6,1/6, 1/6,1/6,1/6,1/6,1/6,1/6", 4),
				"6/4,1/4,1/4,1/4,1/4,1/4,1/4,  1/2,1/4,1/4, 6/4,1/4,1/4,  1/4,1/4,1/4,1/4,9/4, 1/4,1/4,1/4 ,1/4,1/4,1/4,1/4,  9/4",
				"1/4,1/4,1/4 , 1/4,1/4,1/4,1/4 , 1/4,1/4,1 ,1/4,1/4, 1/2,1/2,1,5"
			].join(",")
		]



	];

	RH.LevelManager.registerLevels(LEVELS);

}());