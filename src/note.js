'use strict';

import Fraction from './lib/fraction.js';
import { checkInstance, checkType } from './preconditions.js';

export default class Note {
  constructor(duration, isRest) {
    this.duration = checkInstance(duration, Fraction);
    this.isRest = checkType(isRest, 'boolean');
  }

  toString() {
    return this.duration.toString() + (this.isRest ? 'r' : '');
  }

  split(duration) {
    if (this.duration.compareTo(duration) < 0) {
      throw 'duration: ' + duration + " can't be bigger than note duration: " + this.duration;
    }
    const splitDuration = this.duration.subtract(duration);
    return [new Note(duration, this.isRest), new Note(splitDuration, this.isRest)];
  }

  equals(other) {
    return this.duration.equals(other.duration) && this.isRest === other.isRest;
  }

  static parseNotes(value) {
    const split = value.match(/\S+/g);
    const notes = [];
    for (let i = 0; i < split.length; i++) {
      notes[i] = Note.parseNote(split[i]);
    }
    return notes;
  }

  static parseNote(value) {
    const note = NOTES_ALIASES[value];
    if (note) {
      return note;
    }
    if (!value.match(/^\d+(\/\d+)?r?$/)) {
      throw value + ' is not a valid note.';
    }
    let isRest;
    let replaced;
    if (value.charAt(value.length - 1) === 'r') {
      replaced = value.substring(0, value.length - 1);
      isRest = true;
    } else {
      replaced = value;
      isRest = false;
    }
    const duration = Fraction.parse(value);
    return new Note(duration, isRest);
  }
}

const NOTES_ALIASES = {
  'w': new Note(new Fraction(4, 1), false),   // whole
  'm': new Note(new Fraction(2, 1), false),   // minim
  'c': new Note(new Fraction(1, 1), false),   // crotchet
  'q': new Note(new Fraction(1, 2), false),   // quaver
  's': new Note(new Fraction(1, 4), false),   // semiquaver
  'r': new Note(new Fraction(1, 1), true),    // rest
  'qr': new Note(new Fraction(1, 2), true),   // quaver rest
  'sr': new Note(new Fraction(1, 4), true),   // semiquaver rest
  'tc': new Note(new Fraction(2, 3), false),
  'tq': new Note(new Fraction(1, 3), false),
  'tqr': new Note(new Fraction(1, 3), true),
};
