'use strict';

export function checkInstance(value, instance) {
  if (!(value instanceof instance)) {
    throw 'It should be a ' + instance.name + ': ' + value;
  }
  return value;
}

export function checkType(value, type) {
  if (typeof value !== type) {
    throw 'It should be a ' + type + ': ' + value;
  }
  return value;
}

export function checkIsNumber(value) {
  return checkType(value, 'number');
}

export function checkIsString(value) {
  return checkType(value, 'string');
}

export function checkIsInt(value) {
  checkIsNumber(value);
  if (value % 1 !== 0) {
    throw 'It should be an int: ' + value;
  }
  return value;
}

export function checkArrayType(array, instance) {
  checkInstance(array, Array);
  for (let i = 0; i < array.length; i++) {
    checkInstance(array[i], instance);
  }
  return array;
}
