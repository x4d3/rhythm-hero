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
		return array.join(" ");
	};
	var LEVELS = [
		["Whole, minims and quaver", ["4/4"],
			[60], "4  2 2  4  2 2  1 1 1 1  2 1 1  1 2 1  1 1 2  2 4 2  1 4 2 1"
		],
		["Let's rest", ["4/4"],
			[60], "1 r 1 r  1 1 2  r 2 r  1 1 2r  1 r 1 r  2 1 r  1 2r 1"
		],
		["Half Beat", ["4/4"],
			[60], "1 q q 1 q q   1 1 q q q q    1 q q  q q 1   q q 2 q q  q q  4  q q 1 1 "
		],
		["Syncopation", ["4/4"],
			[60], "q qr q qr q qr q qr    qr q qr q qr q qr q   q 1 1 1 qr  1 1 1 1 q 1 q q 1 q   qr 1 1 1  1 1 1 1 q 4"
		],

		["Triolet", ["4/4"],
			[60],
			[
				repeat("1", 4),
				repeat("q", 8), repeat("tq", 12),
				repeat("q", 4), repeat("tq", 6),
				repeat("1", 2), repeat("tq", 6),
				"1 q q  tq tq tq q q tq tq tq q q 1 1 4"
			].join(" ")


		],
		["Wiganor", ["4/4"],
			[60],
			["13/3  tq tq  tq  tq  tq  5/6 1 9/2",
				repeat("tq", 12), "q q qr q qr q qr q", "r q 3/2r q qr"
			].join(" ")
		],
		["Mars Attack!", ["4/4"],
			[90], repeat(repeat("q q s s s sr", 3) + "  q q 1", 2)
		],
		["Bolero", ["3/4"],
			[72],
			[
				repeat("q  1/6  1/6  1/6   q  1/6  1/6  1/6   q  q   q  1/6  1/6  1/6   q  1/6  1/6  1/6   1/6  1/6  1/6  1/6  1/6  1/6", 4),
				"6/4  s  s  s  s  s  s    q  s  s   6/4  s  s    s  s  s  s  9/4   s  s  s   s  s  s  s    9/4",
				"s  s  s    s  s  s  s    s  s  1   s  s   q  q  1  5"
			].join(" ")
		]
	];
	RH.LevelManager.registerLevels(LEVELS);
}());