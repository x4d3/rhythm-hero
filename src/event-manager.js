RH.EventManager = (function(){
	'use strict';
	var logger = RH.logManager.getLogger('EventManager');
	function EventManager(getTimeCallback){
		this.keyPressed = [];
		this.isPressed = false;
		this.keyChanged = [];
		this.getTime = getTimeCallback === undefined ? RH.getTime: getTimeCallback;
	}
	
	EventManager.prototype = {
		getEvents : function(t){
			var index = RH.binarySearch(this.keyChanged, t);
			var isPressed = index % 2 === 0;
			var result = [];
			var addToResult = function(t1, t2){
				result.push({isPressed: isPressed, duration: t2 - t1});
				isPressed = !isPressed;
			};
			var length = this.keyChanged.length;
			if(index + 1 >= length){
				addToResult(t, this.getTime());
			}else{
				addToResult(t, this.keyChanged[index + 1]);
				for (var i = index + 2; i < this.keyChanged.length; i++){
					addToResult(this.keyChanged[i - 1], this.keyChanged[i]);
				}
				addToResult(this.keyChanged[this.keyChanged.length - 1], this.getTime());
			}
			return result;
		},onUp: function(event){
			logger.debug('onUp: ' + event.which);
			this.keyPressed[event.which] = false;
			this._update();
		},
		onDown: function(event){
			logger.debug('onDown: '+ event.which);
			this.keyPressed[event.which] = true;
			this._update();
		},
		_update : function(){
			var isPressed = this.keyPressed.some(RH.identity);
			if (isPressed !== this.isPressed){
				this.keyChanged.push(this.getTime());
			}
			this.isPressed = isPressed;
		}
	};
	return EventManager;
}());