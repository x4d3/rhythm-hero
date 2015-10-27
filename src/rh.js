if (typeof RH === 'undefined') {
	RH = {};
}

(function(){
	'use strict';
	RH.Preconditions = {};
	
	RH.Preconditions.checkType = function(value, type){
		if(typeof value !== type){
			throw new Exception("It should be a " + type + ": " + value);
		}
		return value;
	};
	RH.Preconditions.checkIsNumber = function(value){
		return RH.Preconditions.checkType(value, 'number');
	};
	RH.Preconditions.checkIsString = function(value){
		return RH.Preconditions.checkType(value, 'string');
	};
	
	RH.Preconditions.checkIsInt = function(value){
		RH.Preconditions.checkIsNumber(value);
		if (value % 1 !== 0){
			throw new Exception("It should be an int: " + value);
		}
		return value;
	};
	
	
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

	RH.identity = function(a){
		return a;
	};

	var t0 = new Date().getTime();
	RH.getTime = function(){
		return new Date().getTime() - t0;
	};

	RH.divide = function(dividend, divisor){
		var quotient = Math.floor(dividend / divisor);
		return {quotient : quotient, rest : dividend - quotient * divisor};
	};

	RH.mod = function(input, n){
		return ((input % n) +n)% n;
	};

	RH.getArrayElement = function(array, index){
		return array[RH.mod(index, array.length)];
	};

	RH.binarySearch = function(array, searchElement) {
		var minIndex = 0;
		var maxIndex = array.length - 1;

		while (minIndex <= maxIndex) {
			var currentIndex = (minIndex + maxIndex) / 2 | 0;
			var currentElement = array[currentIndex];
			if (currentElement < searchElement) {
				minIndex = currentIndex + 1;
			}else if (currentElement > searchElement) {
				maxIndex = currentIndex = currentIndex - 1;
			}else {
				return currentIndex;
			}

		}
		return maxIndex;
	};

	window.requestAnimFrame = (function(){
		return  window.requestAnimationFrame ||
		window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame    ||
		function( callback ){
			window.setTimeout(callback, 1000 / 60);
		};
	})();
})();