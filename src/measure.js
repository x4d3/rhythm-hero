'use strict';

import Note from './note.js';
import TimeSignature from './time-signature.js';
import { checkArrayType, checkIsNumber, checkInstance } from './preconditions.js';

export default class Measure {
  constructor(tempo, timeSignature, notes, firstNotePressed, lastNotePressed) {
    this.notes = checkArrayType(notes, Note);
    this.firstNotePressed = firstNotePressed;
    this.lastNotePressed = lastNotePressed;
    this.isEmpty = notes.length === 0;
    this.tempo = checkIsNumber(tempo);
    this.timeSignature = checkInstance(timeSignature, TimeSignature);
  }

  toString() {
    return '{' + this.tempo + ', ' + this.timeSignature + ', ' + this.notes + ', ' + this.firstNotePressed + ', ' + this.lastNotePressed + '}';
  }

  getBeatPerMillisecond() {
    return this.tempo / (60 * 1000);
  }

  getBeatPerBar() {
    return this.timeSignature.getBeatPerBar();
  }

  getDuration() {
    return this.getBeatPerBar() / this.getBeatPerMillisecond();
  }
}
