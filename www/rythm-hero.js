if (typeof RH === 'undefined') {
	RH = {};
}
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

(function(){
	var t0 = new Date().getTime();
	RH.getTime = function(){
		return new Date().getTime() - t0;
	};	
})();


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

RH.EventManager = (function(){
	var logger = RH.logManager.getLogger('EventManager');
	function EventManager(getTimeCallback){
		this.keyPressed = [];
		this.isPressed = false;
		this.keyChanged = [];
		this.getTime = getTimeCallback === undefined ? RH.getTime: getTimeCallback;
	}
	
	EventManager.prototype = {
		replay : function(t, callback){
			var index = RH.binarySearch(this.keyChanged, t);
			var isPressed = index % 2 === 0;
			var callCallback = function(t1, t2){
				callback(isPressed, t2 - t1);
				isPressed = !isPressed;
			};
			callCallback(t, this.keyChanged[index + 1]);
			for (var i = index + 2; i < this.keyChanged.length; i++){
				callCallback(this.keyChanged[i - 1], this.keyChanged[i]);
			}
			callCallback(this.keyChanged[this.keyChanged.length - 1], this.getTime());
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
RH.TimeSignature = (function(){
	function TimeSignature(numerator, denumerator){
		this.numerator = numerator;
		this.denumerator = denumerator;
	}
	TimeSignature.prototype = {
		toString: function(){
			return numerator + "/" + denumerator;
		},
		// one beat = one 1/4th
		beatPerBar : function(){
			return numerator * 4 / denumerator;
		}
	};
	return TimeSignature;
}());


RH.TS = {
	FOUR_FOUR : new RH.TimeSignature(4, 4)
};

RH.GameOptions = (function(){
	function GameOptions(timeSignature, tempo){
		this.timeSignature = timeSignature;
		this.tempo = tempo;
	}
	GameOptions.prototype = {
	};
	return GameOptions;
}());

RH.GameScreen = (function(){
	function GameScreen(canva) {
		this.canva = canva;
	}
	GameScreen.prototype = {
		update : function(ups){

		}
	};
	return GameScreen;
}());

RH.Game = (function(){
	function Game(eventManager, canva, options) {
		this.eventManager = eventManager;
		this.canva = canva;
		this.options = options;
		this.isOn = true;
		this.t0 = RH.getTime();

	}
	Game.prototype = {
		update : function(){

		}
	};
	return Game;
}());


RH.Application = (function(){
	var Game = RH.Game;
	var EventManager = RH.EventManager;
	
	function Application(canvas) {
		this.canvas = canvas;
		this.eventManager = new EventManager();
	}
	
	Application.prototype = {
		getEventManager : function(){
			return this.eventManager;
		},
		start : function(){
			var game = new Game(this.eventManager, this.canvas);
			(function animloop(){
				game.update();
				if (game.isOn()){
					requestAnimFrame(animloop);	
				}
			})();
		
		}
	};
	return Application;
}());

$( document ).ready(function() {
	var canvas = $("canvas");
	var application = new RH.Application(canvas[0]);
	var onDown = function(event){
		application.getEventManager().onDown(event);
		event.preventDefault();
	};
	var onUp = function(event){
		application.getEventManager().onUp(event);
		event.preventDefault();
	};
	canvas.mousedown(onDown).mouseup(onUp);
	$("body").keydown(onDown).keyup(onUp);

	
});

