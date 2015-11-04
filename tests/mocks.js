$(document).bind('mobileinit',function(){
	$.mobile.changePage.defaults.changeHash = false;
	$.mobile.hashListeningEnabled = false;
	$.mobile.pushStateEnabled = false;
});
if (typeof window.Audio === 'undefined') {
	console.log('mocking window.Audio');
	var Audio = function(src){
		this.src = src;
	};
	Audio.prototype = {
		play : function(){
			console.log("Audio play: " + this.src);
		}
	};
	window.Audio = Audio;
}else{
	console.log('window.Audio found.');
}