RH.CanvasUtils = (function() {
	'use strict';
	var CanvasUtils = {};

	CanvasUtils.brighten = function(pixels) {
		var d = new Uint8ClampedArray(pixels.data);
		for (var i = 0; i < d.length; i += 4) {
			d[i] = 195;
			d[i + 1] = 195;
			d[i + 2] = 195;
		}
		return createImageData(d, pixels.width, pixels.height);
	};

	var createImageData = function(data, width, height) {
		var canvas = document.createElement('canvas');
		canvas.width = width;
		canvas.height = height;
		var ctx = canvas.getContext('2d');
		var imageData = ctx.createImageData(width, height);
		if (imageData.data.set) {
			imageData.data.set(data);
		}
		return imageData;
	};
	return CanvasUtils;
}());