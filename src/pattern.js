'use strict';

import Fraction from './lib/fraction.js';
import Note from './note.js';
import { checkIsString, checkIsNumber, checkArrayType } from './preconditions.js';

export default class Pattern {
  constructor(description, difficulty, frequency, notes) {
    this.description = checkIsString(description);
    this.difficulty = checkIsNumber(difficulty);
    this.frequency = checkIsNumber(frequency);
    this.notes = checkArrayType(notes, Note);
  }

  getDuration() {
    return this.notes.reduce((sum, note) => sum.add(note.duration), Fraction.ZERO);
  }

  toString() {
    return 'Pattern[' + this.description + ',D:' + this.difficulty + ',F:' + this.frequency + ',notes:' + this.notes + ',duration:' + this.getDuration() + ']';
  }
}
