if (typeof RH === 'undefined') {
	RH = {};
}
if (typeof localStorage === 'undefined') {
	localStorage = {
		getItem: function() {},
		setItem: function() {},
	};
}

(function() {
	'use strict';
	var Preconditions = {};

	Preconditions.checkInstance = function(value, instance) {
		if (!(value instanceof instance)) {
			throw "It should be a " + instance.name + ": " + value;
		}
		return value;
	};

	Preconditions.checkType = function(value, type) {
		if (typeof value !== type) {
			throw "It should be a " + type + ": " + value;
		}
		return value;
	};
	Preconditions.checkIsNumber = function(value) {
		return Preconditions.checkType(value, 'number');
	};
	Preconditions.checkIsString = function(value) {
		return Preconditions.checkType(value, 'string');
	};

	Preconditions.checkIsInt = function(value) {
		RH.Preconditions.checkIsNumber(value);
		if (value % 1 !== 0) {
			throw "It should be an int: " + value;
		}
		return value;
	};

	Preconditions.checkArrayType = function(array, instance) {
		Preconditions.checkInstance(array, Array);
		for (var i = 0; i < array.length; i++) {
			Preconditions.checkInstance(array[i], instance);
		}
		return array;
	};
	RH.Preconditions = Preconditions;

	RH.logManager = (function() {
		var LogLevel = function(level, name) {
			this.level = level;
			this.name = name;
		};
		var LOG_LEVEL = {
			DEBUG: new LogLevel(0, 'DEBUG'),
			WARN: new LogLevel(1, 'WARN'),
			ERROR: new LogLevel(2, 'ERROR')
		};
		var DEFAULT_LOG_LEVEL = LOG_LEVEL.WARN.level;

		function LogManager() {
			this.logLevels = {};
		}
		LogManager.prototype = {
			getLogger: function(id) {
				if (this.logLevels[id] === undefined) {
					this.logLevels[id] = DEFAULT_LOG_LEVEL;
				}
				var logManager = this;
				return {
					debug: function(message) {
						this.log(LOG_LEVEL.DEBUG, message);
					},
					warn: function() {
						this.log(LOG_LEVEL.WARN, message);
					},
					error: function() {
						this.log(LOG_LEVEL.ERROR, message);
					},
					log: function(severity, message) {
						if (severity.level >= logManager.logLevels[id]) {
							console.log("[" + severity.name + "] " + id + " : " + message);
						}
					}
				};
			},
			setLogLevel: function(id, level) {
				this.logLevels[id] = level;
			},
			setAllLogLevel: function(level) {
				var logManager = this;
				Object.keys(this.logLevels).forEach(function(key) {
					logManager.logLevels[key] = level;
				});
			}
		};
		var logManager = new LogManager();
		return logManager;
	}());
	RH.isDebug = false;
	RH.debug = function() {
		RH.logManager.setAllLogLevel(0);
		RH.isDebug = true;
	};


	RH.isInteger = function(s) {
		return s.match(/^\s*(\+|-)?\d+\s*$/);
	};

	RH.identity = function(a) {
		return a;
	};

	var t0 = new Date().getTime();
	RH.getTime = function() {
		return new Date().getTime() - t0;
	};

	RH.divide = function(dividend, divisor) {
		var quotient = Math.floor(dividend / divisor);
		return {
			quotient: quotient,
			rest: dividend - quotient * divisor
		};
	};

	RH.mod = function(input, n) {
		return ((input % n) + n) % n;
	};

	RH.getArrayElement = function(array, index) {
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
			} else if (currentElement > searchElement) {
				maxIndex = currentIndex = currentIndex - 1;
			} else {
				return currentIndex;
			}

		}
		return maxIndex;
	};

	RH.copyProperties = function(from, to) {
		for (var property in from) {
			to[property] = from[property];
		}
		return to;
	};

	RH.createSuiteArray = function(min, max, step) {
		var array = [];
		step = step | 1;
		for (var i = min; i < max; i += step) {
			array.push(i);
		}
		return array;
	};


	RH.intermediatePosition = function(a, b, progress) {
		return a + (b - a) * progress;
	};
	RH.intermediatePoint = function(pointA, pointB, progress) {
		return {
			x: RH.intermediatePosition(pointA.x, pointB.x, progress),
			y: RH.intermediatePosition(pointA.y, pointB.y, progress)
		};
	};

	/**
	 Basic classical inheritance helper. Usage:
	  RH.Inherit(Child, Parent, {
	    getName: function() {return this.name;},
	    setName: function(name) {this.name = name}
	  });
	  Returns 'Child'.
	*/
	RH.inherit = (function() {
		var F = function() {};
		// `C` is Child. `P` is parent. `O` is an object to
		// to extend `C` with.
		return function(C, P, O) {
			F.prototype = P.prototype;
			C.prototype = new F();
			C.superclass = P.prototype;
			C.prototype.constructor = C;
			C.prototype.super = function() {
				P.apply(this, arguments);
			};
			if (O) {
				RH.copyProperties(O, C.prototype);
			}
			return C;
		};
	}());
	/**
	 * input {"a":"valueA", "b", "valueB"}
	 * output {"a" :0, "b":1}
	 */
	RH.getObjectKeysIndexes = function(input) {
		var result = {};
		Object.keys(input).forEach(function(key, index) {
			result[key] = index;
		});
		return result;
	};
	RH.map = function(input, callback) {
		return Object.keys(input).map(function(key, index) {
			return callback(input[key], key, index);
		});
	};
	RH.forEach = function(input, callback) {
		Object.keys(input).forEach(function(key, index) {
			callback(input[key], key, index);
		});
	};

	RH.keepBetween = function(min, max, value) {
		if (value > max) {
			return max;
		} else if (value < min) {
			return min;
		} else {
			return value;
		}
	};

	RH.getVersion = function() {
		if (RH.VERSION !== undefined) {
			return RH.VERSION.version;
		} else {
			return "DEV";
		}
	};

	window.requestAnimFrame = (function() {
		return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function(callback) {
			window.setTimeout(callback, 1000 / 60);
		};
	})();
})();