import { describe, test, expect } from 'vitest';
import { checkIsNumber } from '../src/preconditions.js';
import { MAX_DIFFICULTY, PATTERNS, generateNotes } from '../src/rhythm-patterns.js';
import Note from '../src/note.js';
import Fraction from '../src/lib/fraction.js';

function areArrayEquals(expected, tested) {
  expect(expected.length).toBe(tested.length);
  for (let i = 0; i < expected.length; i++) {
    expect(expected[i].equals(tested[i])).toBe(true);
  }
}

describe('RhythmPatterns', () => {
  test('general', () => {
    checkIsNumber(MAX_DIFFICULTY);
    expect(MAX_DIFFICULTY).toBe(10);
  });

  test('generatePattern', () => {
    const notes = generateNotes(0, MAX_DIFFICULTY, 1000);
    expect(notes.some(element => element === undefined)).toBe(false);
  });

  test('parsing', () => {
    const newNote = (a, b, c) => new Note(new Fraction(a, b), c);

    const notes = Note.parseNotes('1 q r s tq 7/8 4/5r');
    areArrayEquals(notes, [
      newNote(1, 1, false),
      newNote(1, 2, false),
      newNote(1, 1, true),
      newNote(1, 4, false),
      newNote(1, 3, false),
      newNote(7, 8, false),
      newNote(4, 5, true),
    ]);
  });

  test('wrong notes are causing errors', () => {
    expect(() => Note.parseNote('1s')).toThrow();
    expect(() => Note.parseNote('1/b')).toThrow();
    expect(() => Note.parseNote('sf')).toThrow();
    expect(() => Note.parseNote('r1')).toThrow();
    expect(() => Note.parseNote('-0')).toThrow();
  });
});
