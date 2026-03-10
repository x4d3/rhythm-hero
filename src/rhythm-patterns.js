'use strict';

import Fraction from './lib/fraction.js';
import Note from './note.js';
import Pattern from './pattern.js';
import Measure from './measure.js';
import { binarySearch, getArrayElement } from './utils.js';

const PATTERNS = [];
const PATTERNS_PER_DESCRIPTION = {};

function addPattern(description, difficulty, frequency, notesString) {
  if (description === null) {
    description = notesString;
  }
  const notes = Note.parseNotes(notesString);
  const pattern = new Pattern(description, difficulty, frequency, notes);
  PATTERNS.push(pattern);
  if (PATTERNS_PER_DESCRIPTION[description] !== undefined) {
    throw 'duplicate description: ' + description;
  }
  PATTERNS_PER_DESCRIPTION[description] = pattern;
}

addPattern('whole', 0, 10, 'w');
addPattern('minim', 1, 20, 'm');
addPattern('crotchet', 1, 100, 'c');
addPattern('crotchet rest', 1, 100, 'r');
addPattern('double quaver', 2, 100, 'q q');
addPattern('quaver rest', 2, 100, 'qr');
addPattern('dotted crotchet quaver', 3, 100, '3/2 q');
addPattern('quaver dotted crotchet', 3, 100, 'q 3/2');
addPattern('rest quaver quaver', 3, 50, 'qr q');
addPattern('quaver rest quaver', 3, 100, 'qr q');
addPattern(null, 3, 100, 'qr q');
addPattern(null, 3, 100, 'q c c c q');
addPattern(null, 3, 100, 'q c q q c q');

addPattern(null, 4, 25, 's s s s');
addPattern(null, 5, 25, 's s q');
addPattern(null, 5, 25, 'q s s');
addPattern(null, 5, 25, '3/4 s');
addPattern(null, 5, 25, 's 3/4');

addPattern(null, 6, 25, 's sr s s');
addPattern(null, 6, 25, 's sr q');
addPattern(null, 6, 25, 'q sr s');
addPattern(null, 6, 25, '3/4r s');
addPattern(null, 6, 25, 'sr 3/4');

addPattern('triplet quaver', 7, 20, 'tq tq tq');
addPattern('triplet crotchet', 8, 20, '2/3 2/3 2/3');

addPattern(null, 8, 20, 'tqr tq tq');
addPattern(null, 8, 20, 'tqr tqr tq');
addPattern(null, 8, 20, 'tqr tqr tqr');

addPattern(null, 8, 20, '2/3 tq');
addPattern(null, 8, 20, 'tq 2/3');

addPattern(null, 8, 20, '1/6 1/6 1/6 q');
addPattern(null, 8, 20, '1/6 1/6 1/6 1/6 1/6 1/6');
addPattern(null, 8, 20, 'q 1/6 1/6 1/6');

addPattern('quintuplet quaver', 9, 20, '1/5 1/5 1/5 1/5 1/5');
addPattern('quintuplet crotchet', 10, 20, '2/5 2/5 2/5 2/5 2/5');

addPattern(null, 10, 20, '2/5 2/5r 2/5 2/5r 2/5');

const difficulties = PATTERNS.map(x => x.difficulty);
export const MAX_DIFFICULTY = Math.max.apply(Math, difficulties);

export function generateNotes(minDifficulty, maxDifficulty, size) {
  const filtered = PATTERNS.filter(x => x.difficulty >= minDifficulty && x.difficulty <= maxDifficulty);
  let sumFrequency = 0;
  const summedFrequencies = filtered.map(x => {
    sumFrequency += x.frequency;
    return sumFrequency;
  });
  let notes = [];
  for (let i = 0; i < size; i++) {
    const alea = Math.random() * sumFrequency;
    const index = binarySearch(summedFrequencies, alea) + 1;
    if (index >= filtered.length) {
      throw 'error: ' + index + ',[' + summedFrequencies + '], ' + alea + ', ' + sumFrequency;
    }
    notes = notes.concat(filtered[index].notes);
  }
  return notes;
}

export function getPattern(description) {
  const pattern = PATTERNS_PER_DESCRIPTION[description];
  if (pattern === undefined) {
    throw 'Unrecognized description: ' + description;
  }
  return pattern;
}

export function generateMeasures(tempi, timeSignatures, notes) {
  let tempo = tempi[0];
  let timeSignature = timeSignatures[0];
  let beatPerBarF = new Fraction(timeSignature.getBeatPerBar(), 1);

  const result = [new Measure(tempo, timeSignature, [], false, false)];

  const measure = {
    beats: Fraction.ZERO,
    notes: [],
  };

  let firstNotePressed = false;
  notes.forEach(note => {
    let sum = note.duration.add(measure.beats);
    let compare = sum.compareTo(beatPerBarF);
    while (compare >= 0) {
      const durationLeft = beatPerBarF.subtract(measure.beats);
      const split = note.split(durationLeft);
      measure.notes.push(split[0]);
      const lastNotPressed = !note.isRest && compare !== 0;
      result.push(new Measure(tempo, timeSignature, measure.notes, firstNotePressed, lastNotPressed));
      tempo = getArrayElement(tempi, result.length);
      timeSignature = getArrayElement(timeSignatures, result.length);
      beatPerBarF = new Fraction(timeSignature.getBeatPerBar(), 1);
      measure.beats = Fraction.ZERO;
      measure.notes = [];
      firstNotePressed = lastNotPressed;
      note = split[1];
      sum = measure.beats.add(note.duration);
      compare = sum.compareTo(beatPerBarF);
    }
    measure.beats = sum;
    if (!note.duration.equals(Fraction.ZERO)) {
      measure.notes.push(note);
    }
  });
  // we don't fill the last bar
  return result;
}

export { PATTERNS };
