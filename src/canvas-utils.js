'use strict';

function createImageData(data, width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  const imageData = ctx.createImageData(width, height);
  if (imageData.data.set) {
    imageData.data.set(data);
  }
  return imageData;
}

export function brighten(pixels) {
  const d = new Uint8ClampedArray(pixels.data);
  for (let i = 0; i < d.length; i += 4) {
    d[i] = 195;
    d[i + 1] = 195;
    d[i + 2] = 195;
  }
  return createImageData(d, pixels.width, pixels.height);
}
