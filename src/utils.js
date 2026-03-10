'use strict';

const t0 = Date.now();

export function getTime() {
  return Date.now() - t0;
}

export function isInteger(s) {
  return s.match(/^\s*(\+|-)?\d+\s*$/);
}

export function identity(a) {
  return a;
}

export function divide(dividend, divisor) {
  const quotient = Math.floor(dividend / divisor);
  return {
    quotient,
    rest: dividend - quotient * divisor,
  };
}

export function mod(input, n) {
  return ((input % n) + n) % n;
}

export function getArrayElement(array, index) {
  return array[mod(index, array.length)];
}

export function binarySearch(array, searchElement) {
  let minIndex = 0;
  let maxIndex = array.length - 1;

  while (minIndex <= maxIndex) {
    const currentIndex = (minIndex + maxIndex) / 2 | 0;
    const currentElement = array[currentIndex];
    if (currentElement < searchElement) {
      minIndex = currentIndex + 1;
    } else if (currentElement > searchElement) {
      maxIndex = currentIndex - 1;
    } else {
      return currentIndex;
    }
  }
  return maxIndex;
}

export function copyProperties(from, to) {
  for (const property in from) {
    to[property] = from[property];
  }
  return to;
}

export function createSuiteArray(min, max, step) {
  const array = [];
  step = step || 1;
  for (let i = min; i < max; i += step) {
    array.push(i);
  }
  return array;
}

export function intermediatePosition(a, b, progress) {
  return a + (b - a) * progress;
}

export function intermediatePoint(pointA, pointB, progress) {
  return {
    x: intermediatePosition(pointA.x, pointB.x, progress),
    y: intermediatePosition(pointA.y, pointB.y, progress),
  };
}

export function keepBetween(min, max, value) {
  if (value > max) {
    return max;
  } else if (value < min) {
    return min;
  }
  return value;
}
