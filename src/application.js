if (typeof xade === 'undefined') {
	xade = {
		RH : {}
	};
}
xade.RH.log = function(message){
	console.log(message);
};

xade.RH.Application = (function(){
	var log = xade.RH.log;
	function Application() {}

	Application.prototype = {
		start:function(){
			log("Application Started");
		}
	};
	return Application;
}());

