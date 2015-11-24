module("Event Manager Test");

test("getEvents", function() {
	var mockEvent = {
		which : 30
	};
	var newEvent = function(isPressed, t1, t2) {
		return {
			isPressed : isPressed,
			duration : t2 - t1,
			t1 : t1,
			t2 : t2
		};
	};

	var timeAnswered = null;
	var eventManager = new RH.EventManager(function() {
		return timeAnswered;
	});

	var onDown = true;
	var times = [ 5, 6, 8, 11, 15 ];
	for (var i = 0; i < times.length; i++) {
		timeAnswered = times[i];
		if (onDown) {
			eventManager.onDown(mockEvent);
		} else {
			eventManager.onUp(mockEvent);
		}
		onDown = !onDown;
	}
	timeAnswered = 20;

	var expected = [ newEvent(false, 0, 5), newEvent(true, 5, 6), newEvent(false, 6, 8), newEvent(true, 8, 11), newEvent(false, 11, 15), newEvent(true, 15, 20) ];
	deepEqual(eventManager.getEvents(0), expected);

	expected = [ newEvent(false, 7, 8), newEvent(true, 8, 11), newEvent(false, 11, 15), newEvent(true, 15, 20) ];
	deepEqual(eventManager.getEvents(7), expected);

});