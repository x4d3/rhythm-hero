RH.EventManager = (function(){
	var logger = RH.logManager.getLogger('EventManager');
	function EventManager() {
		this.keyPressed = [];
		this.isPressed = false;
		this.keyPressedTime = [];
	}
	
	EventManager.prototype = {
		onUp: function(event){
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
				this.keyPressedTime.push(RH.getTime());
			}
			this.isPressed = isPressed;

		}
	};
	return EventManager;
}());