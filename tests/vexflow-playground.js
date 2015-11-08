$(document).ready(function() {
	'use strict';
	var body = $("body");
	var VF = Vex.Flow;
	var testCanvas = function(title, callBack) {
		body.append($('<h2>').text(title));
		var canvasJ = $('<canvas>');
		canvasJ.prop({
			width : 800,
			height : 100
		});
		callBack(canvasJ.appendTo(body)[0]);

	};

	testCanvas('first', function(canvas) {
		var renderer = new Vex.Flow.Renderer(canvas, Vex.Flow.Renderer.Backends.CANVAS);
		var ctx = renderer.getContext();
		var stave = new Vex.Flow.Stave(10, 0, canvas.width);

		// Add a treble clef
		stave.addClef("treble");
		stave.setContext(ctx).draw();

		var notes = [
		// Dotted eighth E##
		new Vex.Flow.StaveNote({
			keys : [ "e##/5" ],
			duration : "8d"
		}).addAccidental(0, new Vex.Flow.Accidental("##")).addDotToAll(),

		// Sixteenth Eb
		new Vex.Flow.StaveNote({
			keys : [ "eb/5" ],
			duration : "16"
		}).addAccidental(0, new Vex.Flow.Accidental("b")),

		// Half D
		new Vex.Flow.StaveNote({
			keys : [ "d/5" ],
			duration : "h"
		}),

		// Quarter Cm#5
		new Vex.Flow.StaveNote({
			keys : [ "c/5", "eb/5", "g#/5" ],
			duration : "q"
		}).addAccidental(1, new Vex.Flow.Accidental("b")).addAccidental(2, new Vex.Flow.Accidental("#")) ];

		// Helper function to justify and draw a 4/4 voice
		Vex.Flow.Formatter.FormatAndDraw(ctx, stave, notes);
	});

	testCanvas('first', function(canvas) {
		var renderer = new Vex.Flow.Renderer(canvas, Vex.Flow.Renderer.Backends.CANVAS);
		var context = renderer.getContext();
		var stave = new Vex.Flow.Stave(10, 0, 500);

		function newNote(note_struct) {
			return new VF.StaveNote(note_struct);
		}

		var notes = [ newNote({
			keys : [ "g/4" ],
			stem_direction : 1,
			duration : "q"
		}), newNote({
			keys : [ "a/4" ],
			stem_direction : 1,
			duration : "q"
		}), newNote({
			keys : [ "b/4" ],
			stem_direction : 1,
			duration : "q"
		}), newNote({
			keys : [ "b/4" ],
			stem_direction : 1,
			duration : "8"
		}), newNote({
			keys : [ "a/4" ],
			stem_direction : 1,
			duration : "8"
		}), newNote({
			keys : [ "g/4" ],
			stem_direction : 1,
			duration : "8"
		}) ];

		var tuplet1 = new VF.Tuplet(notes.slice(0, 3));
		var tuplet2 = new VF.Tuplet(notes.slice(3, 6));

		// 3/4 time
		var voice = new VF.Voice({
			num_beats : 3,
			beat_value : 4,
			resolution : VF.RESOLUTION
		});

		voice.setStrict(true);
		voice.addTickables(notes);
		stave.setContext(context);
		stave.addTimeSignature("3/4");
		stave.draw(context);
		var beams = VF.Beam.generateBeams(notes);
		var formatter = new VF.Formatter().joinVoices([ voice ]).format([ voice ], 300);
		voice.draw(context, stave);


		beams.forEach(function(beam) {
			beam.setContext(context).draw();
		});

		tuplet1.setContext(context).draw();
		tuplet2.setContext(context).draw();
	});

	var drawBeamsOnStave = function(context, stave){


		var note_data = [ {
			keys : [ "f/4" ],
			duration : "8"
		}, {
			keys : [ "e/4" ],
			duration : "8"
		}, {
			keys : [ "d/4" ],
			duration : "8"
		}, {
			keys : [ "c/4" ],
			duration : "16"
		}, {
			keys : [ "c/4" ],
			duration : "16"
		}, {
			keys : [ "c/5" ],
			duration : "8"
		}, {
			keys : [ "b/4" ],
			duration : "8"
		}, {
			keys : [ "c/5" ],
			duration : "8"
		}, {
			keys : [ "c/5" ],
			duration : "32"
		}, {
			keys : [ "c/5" ],
			duration : "32"
		}, {
			keys : [ "b/4" ],
			duration : "32"
		}, {
			keys : [ "f/4" ],
			duration : "32"
		} ];

		function createNote(note_data) {
			return new Vex.Flow.StaveNote(note_data);
		}
		
		stave.setContext(context);
		stave.addTimeSignature("3/4");
		stave.draw(context);
		
		var formatter = new Vex.Flow.Formatter();
		var notes = note_data.map(createNote);
		var voice = new Vex.Flow.Voice(Vex.Flow.TIME4_4);
		
		var group1 = notes.slice(0, 5);
		var group2 = notes.slice(5, 12);
		var beam1 = new Vex.Flow.Beam(group1);
		var beam2 = new Vex.Flow.Beam(group2);
		
		
		voice.addTickables(notes);
		formatter.joinVoices([ voice ]).formatToStave([ voice ], stave);

		
		voice.draw(context, stave);

		beam1.setContext(context).draw();
		beam2.setContext(context).draw();

	};
	
	testCanvas('3', function(canvas) {
		var renderer = new Vex.Flow.Renderer(canvas, Vex.Flow.Renderer.Backends.CANVAS);
		var context = renderer.getContext();
		var stave = new Vex.Flow.Stave(10, 0, 500);
		drawBeamsOnStave(context, stave);
	});

	testCanvas('3', function(canvas) {
		var numberOfMeasures = 60;
		var tempCanvaJ = $('<canvas>');
		tempCanvaJ.prop({
			width : 400 * numberOfMeasures,
			height : 100
		});
		var tempCanvas = tempCanvaJ[0];
		var context = tempCanvas.getContext('2d');
		var renderer = new Vex.Flow.Renderer(tempCanvas, Vex.Flow.Renderer.Backends.CANVAS);
		var ctx = renderer.getContext();
		for (var i = 0; i < numberOfMeasures; i++){
			var stave = new Vex.Flow.Stave(400 * i, 0, 400);
			drawBeamsOnStave(ctx, stave);
		}
		tempCanvaJ.appendTo(body);
		var savedCanvas = [];
		for (var i = 0; i < numberOfMeasures; i++){
			savedCanvas[i] = context.getImageData(400* i, 0, 400, 100);
		}
		canvas.getContext('2d').putImageData(savedCanvas[5], 0, 0)
	});
	

	

});
