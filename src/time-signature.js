'use strict';

export default class TimeSignature {
  constructor(numerator, denominator) {
    this.numerator = numerator;
    this.denominator = denominator;
  }

  toString() {
    return this.numerator + '/' + this.denominator;
  }

  // one beat = one 1/4th
  getBeatPerBar() {
    return this.numerator * 4 / this.denominator;
  }

  equals(other) {
    return other.numerator === this.numerator && other.denominator === this.denominator;
  }

  static parse(string) {
    const array = string.split('/');
    return new TimeSignature(parseInt(array[0], 10), parseInt(array[1], 10));
  }
}

export const FOUR_FOUR = new TimeSignature(4, 4);
export const THREE_FOUR = new TimeSignature(3, 4);
export const TWO_FOUR = new TimeSignature(1, 2);
