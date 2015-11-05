module("Event Manager Test");

test("getEvents", function() {
	var mockEvent = {
		which : 30
	};
	var newEvent = function(isPressed, duration) {
		return {
			isPressed : isPressed,
			duration : duration
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

	var expected = [ newEvent(false, 5), newEvent(true, 1), newEvent(false, 2), newEvent(true, 3), newEvent(false, 4), newEvent(true, 5) ];
	deepEqual(eventManager.getEvents(0), expected);

	expected = [ newEvent(false, 1), newEvent(true, 3), newEvent(false, 4), newEvent(true, 5) ];
	deepEqual(eventManager.getEvents(7), expected);

});