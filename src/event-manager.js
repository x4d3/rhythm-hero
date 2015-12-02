RH.EventManager = (function() {
	'use strict';
	var logger = RH.logManager.getLogger('EventManager');
	function EventManager(getTimeCallback) {
		this.keyPressed = [];
		this.isPressed = false;
		this.keyChanged = [];
		this.getTime = getTimeCallback === undefined ? RH.getTime : getTimeCallback;
	}

	EventManager.prototype = {
		getEventsBetween : function(startTime, endTime) {
			var index1 = RH.binarySearch(this.keyChanged, startTime);
			var index2 = RH.binarySearch(this.keyChanged, endTime);
			if(this.keyChanged[index2] < endTime){
				index2++;
			}
			var isPressed = index1 % 2 === 0;
			var result = [];
			for (var i = index1; i < index2 + 1; i++) {
				if (i>= 0 && i < this.keyChanged.length) {
					result.push({
						isPressed : isPressed,
						t : this.keyChanged[i],
					});
				}
				isPressed = !isPressed;
			}
			return result;
		},
		getEvents : function(t) {
			var index = RH.binarySearch(this.keyChanged, t);
			var isPressed = index % 2 === 0;
			var result = [];
			var addToResult = function(t1, t2) {
				result.push({
					isPressed : isPressed,
					duration : t2 - t1,
					t1 : t1,
					t2 : t2
				});
				isPressed = !isPressed;
			};
			var length = this.keyChanged.length;
			if (index + 1 >= length) {
				addToResult(t, this.getTime());
			} else {
				addToResult(t, this.keyChanged[index + 1]);
				for (var i = index + 2; i < this.keyChanged.length; i++) {
					addToResult(this.keyChanged[i - 1], this.keyChanged[i]);
				}
				addToResult(this.keyChanged[this.keyChanged.length - 1], this.getTime());
			}
			return result;
		},
		onUp : function(event) {
			logger.debug('onUp: ' + event.which);
			this.keyPressed[event.which] = false;
			this._update();
		},
		resetKeyPressed : function() {
			logger.debug('resetKeyPressed');
			this.keyPressed = [];
			this._update();
		},
		onDown : function(event) {
			logger.debug('onDown: ' + event.which);
			this.keyPressed[event.which] = true;
			this._update();
		},
		_update : function() {
			var isPressed = this.keyPressed.some(RH.identity);
			if (isPressed !== this.isPressed) {
				this.keyChanged.push(this.getTime());
			}
			this.isPressed = isPressed;
		},
		toJson :function(){
			//TODO: call copyProperties
			return JSON.stringify({
				keyPressed: this.keyPressed,
				keyChanged:this.keyChanged,
				isPressed: this.isPressed
			});
		}
	};
	EventManager.fromJson = function(json, getTimeCallback){
		var obj = JSON.parse(json);
		var eventManager = new EventManager(getTimeCallback);
		//TODO: call copyProperties
		eventManager.keyPressed = obj.keyPressed;
		eventManager.keyChanged = obj.keyChanged;
		eventManager.isPressed = obj.isPressed;
		return eventManager;
	};
	
	return EventManager;
}());