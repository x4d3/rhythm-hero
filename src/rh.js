if (typeof RH === 'undefined') {
	RH = {};
}
RH.identity = function(a){
	return a;
};
(function(){
	var t0 = new Date().getTime();
	RH.getTime = function(){
		return new Date().getTime() - t0;
	};	
})();

RH.logManager = (function(){
	var LogLevel = function(level, name){
		this.level = level;
		this.name = name;
	};
	var LOG_LEVEL = {
		DEBUG: new LogLevel(0, 'DEBUG'),
		WARN: new LogLevel(1, 'WARN'),
		ERROR: new LogLevel(2, 'ERROR')
	};
	var DEFAULT_LOG_LEVEL = LOG_LEVEL.WARN.level;
	function LogManager(){
		this.logLevels = {};
	}
	LogManager.prototype = {
		getLogger: function(id){
			if (this.logLevels[id] === undefined){
				this.logLevels[id] = DEFAULT_LOG_LEVEL;
			}
			var logManager = this;
			return {
				debug : function(message){
					this.log(LOG_LEVEL.DEBUG, message);
				},
				warn : function(){
					this.log(LOG_LEVEL.WARN, message);
				},
				error : function(){
					this.log(LOG_LEVEL.ERROR, message);
				},
				log : function(severity, message){
					if (severity.level  >= logManager.logLevels[id]){
						console.log("[" + severity.name + "] " + id + " : " + message);
					}
				}
			};
		},
		setLogLevel : function(id, level){
			this.logLevels[id] = level;
		},setAllLogLevel : function(level){
			var logManager = this;
			Object.keys(this.logLevels).forEach(function(key){
				logManager.logLevels[key] = level;
			});
		}
	};
	var logManager = new LogManager();
	return logManager;
}());
RH.debug = function(){
	RH.logManager.setAllLogLevel(0);
};

window.requestAnimFrame = (function(){
	return  window.requestAnimationFrame ||
	window.webkitRequestAnimationFrame ||
	window.mozRequestAnimationFrame    ||
	function( callback ){
		window.setTimeout(callback, 1000 / 60);
	};
})();
