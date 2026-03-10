'use strict';

function checkIsInt(value) {
  if (typeof value !== 'number') {
    throw 'It should be a number: ' + value;
  }
  if (value % 1 !== 0) {
    throw 'It should be an int: ' + value;
  }
  return value;
}

export function leastFactor(n) {
  checkIsInt(n);
  if (n === 0) return 0;
  if (n === 1) return 1;
  if (n % 2 === 0) return 2;
  if (n % 3 === 0) return 3;
  if (n % 5 === 0) return 5;
  const m = Math.sqrt(n);
  for (let i = 7; i <= m; i += 30) {
    if (n % i === 0) return i;
    if (n % (i + 4) === 0) return i + 4;
    if (n % (i + 6) === 0) return i + 6;
    if (n % (i + 10) === 0) return i + 10;
    if (n % (i + 12) === 0) return i + 12;
    if (n % (i + 16) === 0) return i + 16;
    if (n % (i + 22) === 0) return i + 22;
    if (n % (i + 24) === 0) return i + 24;
  }
  return n;
}

export function isPrime(n) {
  checkIsInt(n);
  return n === leastFactor(n);
}

export function factor(n) {
  checkIsInt(n);
  if (n < 0) {
    throw 'n should be positive';
  }
  const result = [];
  let minFactor;
  do {
    minFactor = leastFactor(n);
    result.push(minFactor);
    n /= minFactor;
  } while (n !== 1);
  return result;
}

export function nextPrime(n) {
  checkIsInt(n);
  if (n < 2) return 2;
  for (let i = n + 1; i < 9007199254740992; i++) {
    if (isPrime(i)) return i;
  }
  return NaN;
}
