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

export default class Fraction {
  constructor(numerator, denominator, noCheck) {
    if (!noCheck) {
      checkIsInt(numerator);
      checkIsInt(denominator);
      if (denominator === 0) {
        throw 'The denominator must not be zero';
      }
      if (denominator < 0) {
        numerator = -numerator;
        denominator = -denominator;
      }
    }
    this.numerator = numerator;
    this.denominator = denominator;
    this.normalize();
  }

  value() {
    return this.numerator / this.denominator;
  }

  clone() {
    return new Fraction(this.numerator, this.denominator, true);
  }

  inverse() {
    return new Fraction(this.denominator, this.numerator);
  }

  toString() {
    return this.numerator + '/' + this.denominator;
  }

  toTeX(mixed) {
    let result = '';
    if ((this.numerator < 0) !== (this.denominator < 0)) result = '-';
    let numerator = Math.abs(this.numerator);
    const denominator = Math.abs(this.denominator);

    if (!mixed) {
      if (denominator === 1) return result + numerator;
      return result + '\\frac{' + numerator + '}{' + denominator + '}';
    }
    const wholepart = Math.floor(numerator / denominator);
    numerator = numerator % denominator;
    if (wholepart !== 0) result += wholepart;
    if (numerator !== 0) result += '\\frac{' + numerator + '}{' + denominator + '}';
    return result.length > 0 ? result : '0';
  }

  rescale(factor) {
    this.numerator *= factor;
    this.denominator *= factor;
    return this;
  }

  add(b) {
    const a = this.clone();
    if (!(b instanceof Fraction)) {
      throw 'must be a Fraction: ' + b;
    }
    const td = a.denominator;
    a.rescale(b.denominator);
    a.numerator += b.numerator * td;
    return a.normalize();
  }

  subtract(b) {
    const a = this.clone();
    if (!(b instanceof Fraction)) {
      throw 'must be a Fraction: ' + b;
    }
    const td = a.denominator;
    a.rescale(b.denominator);
    a.numerator -= b.numerator * td;
    return a.normalize();
  }

  multiply(b) {
    const a = this.clone();
    a.numerator *= b.numerator;
    a.denominator *= b.denominator;
    return a.normalize();
  }

  divide(b) {
    if (!(b instanceof Fraction)) {
      throw 'must be a Fraction: ' + b;
    }
    const a = this.clone();
    a.numerator *= b.denominator;
    a.denominator *= b.numerator;
    return a.normalize();
  }

  mod(b) {
    checkIsInt(b);
    const a = this.clone();
    a.numerator %= b * a.denominator;
    return a.normalize();
  }

  equals(b) {
    if (!(b instanceof Fraction)) {
      return false;
    }
    return this.numerator === b.numerator && this.denominator === b.denominator;
  }

  compareTo(b) {
    if (!(b instanceof Fraction)) {
      throw 'must be a Fraction: ' + b;
    }
    if (this === b || this.equals(b)) {
      return 0;
    }
    const first = this.numerator * b.denominator;
    const second = b.numerator * this.denominator;
    if (first === second) {
      return 0;
    } else if (first < second) {
      return -1;
    }
    return 1;
  }

  normalize() {
    const gcf = Fraction.gcf(this.numerator, this.denominator);
    this.numerator /= gcf;
    this.denominator /= gcf;
    if (this.denominator < 0) {
      this.numerator *= -1;
      this.denominator *= -1;
    }
    return this;
  }

  static gcf(a, b) {
    if (arguments.length < 2) {
      return a;
    }
    let c;
    a = Math.abs(a);
    b = Math.abs(b);
    while (b) {
      c = a % b;
      a = b;
      b = c;
    }
    return a;
  }

  static parse(s) {
    const split = s.split('/');
    const n = parseInt(split[0].trim(), 10);
    if (isNaN(n)) {
      throw "can't parse: " + s;
    }
    if (split.length === 1) {
      return new Fraction(n, 1);
    }
    const d = parseInt(split[1].trim(), 10);
    if (isNaN(d)) {
      throw "can't parse: " + s;
    }
    return new Fraction(n, d);
  }
}

Fraction.ZERO = new Fraction(0, 1);
Fraction.ONE = new Fraction(1, 1);
