import { describe, test, expect } from 'vitest';
import Measure from '../src/measure.js';
import Note from '../src/note.js';
import Fraction from '../src/lib/fraction.js';
import * as RhythmPatterns from '../src/rhythm-patterns.js';
import { DEFAULT_TEMPO } from '../src/constants.js';
import { FOUR_FOUR as DEFAULT_TS } from '../src/time-signature.js';

describe('Game', () => {
  test('generateBars', () => {
    const tempo = DEFAULT_TEMPO;
    const timeSignature = DEFAULT_TS;

    const getPatternsNotes = (patterns) => {
      let result = [];
      patterns.forEach(pattern => {
        result = result.concat(pattern.notes);
      });
      return result;
    };

    const newNote = (n, d) => new Note(new Fraction(n, d), false);

    const testMeasures = (patternsS, awaitedMeasures) => {
      const patterns = patternsS.map(RhythmPatterns.getPattern);
      const measures = RhythmPatterns.generateMeasures([tempo], [timeSignature], getPatternsNotes(patterns)).slice(1);
      expect(measures).toEqual(awaitedMeasures);
    };

    testMeasures(['crotchet', 'whole', 'minim', 'crotchet'], [
      new Measure(tempo, timeSignature, [newNote(1, 1), newNote(3, 1)], false, true),
      new Measure(tempo, timeSignature, [newNote(1, 1), newNote(2, 1), newNote(1, 1)], true, false),
    ]);

    testMeasures(['minim', 'crotchet', 'dotted crotchet quaver', 'quaver dotted crotchet', 'crotchet'], [
      new Measure(tempo, timeSignature, [newNote(2, 1), newNote(1, 1), newNote(1, 1)], false, true),
      new Measure(tempo, timeSignature, [newNote(1, 2), newNote(1, 2), newNote(1, 2), newNote(3, 2), newNote(1, 1)], true, false),
    ]);

    testMeasures(['minim', 'crotchet', 'dotted crotchet quaver', 'quaver dotted crotchet'], [
      new Measure(tempo, timeSignature, [newNote(2, 1), newNote(1, 1), newNote(1, 1)], false, true),
    ]);
  });
});
