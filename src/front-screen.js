RH.FrontScreen = (function() {
	'use strict';
	// timeWidth is the number of miliseconds screen the canvas width can represent
	function FrontScreen(canvas, eventManager, measures, options) {
		this.canvas = canvas;
		this.eventManager = eventManager;
		this.measures = measures;
		this.options = options;
		this.measureLength = canvas.width / 2;

	}
	FrontScreen.prototype = {
		update : function(measureInfo) {
			if (!RH.isDebug) {
				return;
			}
			var canvas = this.canvas;

			var measure = measureInfo.measure;
			var beatPerBar = measure.getBeatPerBar();
			var measureDuration = measure.getBeatPerBar() / measure.getBeatPerMillisecond();

			var context = canvas.getContext("2d");
			context.clearRect(0, 0, canvas.width, canvas.height);

			this.displayEvents(measureInfo);

			var shift = this.measureLength * (-0.5 + measureInfo.ellapsedBeats / beatPerBar);
			var screen = this;

			[ -1, 0, 1, 2 ].forEach(function(i) {
				var index = measureInfo.index + i;
				if (index < 0 || index >= screen.measures.length) {
					return true;
				}
				var currentMeasure = screen.measures[index];
				var startBar = i * screen.measureLength - shift;
				context.fillText(index, startBar + screen.measureLength / 2, canvas.height * 3 / 4);
				context.beginPath();
				for (var j = 0; j < currentMeasure.getBeatPerBar(); j++) {
					var beatX = startBar + j * (screen.measureLength / measure.getBeatPerBar());
					var z = (j === 0) ? 3 / 4 : 7 / 8;
					context.moveTo(beatX, canvas.height * z);
					context.lineTo(beatX, canvas.height);
				}
				context.stroke();
				context.closePath();

				context.save();
				context.beginPath();
				context.strokeStyle = 'blue';
				context.lineWidth = 1;
				var x = startBar;

				var beatLength = screen.measureLength / currentMeasure.getBeatPerBar();
				var epsilon = 0.05 * beatLength;
				var Y_IS_ON = canvas.height * 3 / 16;
				var Y_IS_OFF = canvas.height / 4;
				var y = currentMeasure.firstNotePressed ? Y_IS_ON : Y_IS_OFF;
				currentMeasure.notes.forEach(function(note, j) {
					context.moveTo(x, y);
					y = (note.isRest ? Y_IS_OFF : Y_IS_ON);
					context.lineTo(x, y);
					var duration = note.duration.value	() * beatLength;
					var newX = x + duration;
					if (j == (currentMeasure.notes.length - 1) && currentMeasure.lastNotePressed) {
						context.lineTo(newX, y);
					} else {
						context.lineTo(newX - epsilon, y);
						y = Y_IS_OFF;
						context.lineTo(newX - epsilon, y);
						context.lineTo(newX, y	);
					}
					x = newX;
				});
				context.stroke();
				context.closePath();
				context.restore();
			});

		},
		displayEvents : function(measureInfo) {
			var canvas = this.canvas;
			var context = canvas.getContext("2d");
			var measure = measureInfo.measure;
			var measureDuration = measure.getBeatPerBar() / measure.getBeatPerMillisecond();
			var ups = this.eventManager.getEvents(measureInfo.t - measureDuration * 0.5);
			var x = 0;
			var screen = this;
			context.beginPath();
			context.lineWidth = 1;
			var y = 0;
			ups.forEach(function(element) {
				y = 0.5 + (element.isPressed ? canvas.height / 16 : canvas.height / 8);
				context.lineTo(x, y);
				var newX = x + element.duration * screen.measureLength / measureDuration;
				context.lineTo(newX, y);
				x = newX;
			});
			context.moveTo(canvas.width / 4, 0);
			context.lineTo(canvas.width / 4, canvas.height);
			context.stroke();
			context.closePath();
		}
	};
	return FrontScreen;
}());
