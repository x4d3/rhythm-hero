import { describe, test, expect } from 'vitest';
import Fraction from '../src/lib/fraction.js';
import Measure from '../src/measure.js';
import Note from '../src/note.js';
import * as RhythmPatterns from '../src/rhythm-patterns.js';
import ScoreCalculator, { MeasureScore, calculateNoteScore } from '../src/score-calculator.js';
import EventManager from '../src/event-manager.js';
import { DEFAULT_TEMPO } from '../src/constants.js';
import { FOUR_FOUR as DEFAULT_TS } from '../src/time-signature.js';

describe('ScoreCalculator', () => {
  const scoreManager = { save() {} };

  const getPatternsNotes = (patterns) => {
    let result = [];
    patterns.forEach(pattern => {
      result = result.concat(pattern.notes);
    });
    return result;
  };

  const generateMeasures = (patternsS) => {
    const patterns = patternsS.map(RhythmPatterns.getPattern);
    const tempo = DEFAULT_TEMPO;
    const timeSignature = DEFAULT_TS;
    return RhythmPatterns.generateMeasures([tempo], [timeSignature], getPatternsNotes(patterns));
  };

  const mockEventManager = (times) => {
    const mockEvent = { which: 30 };
    let onDown = true;
    let timeAnswered = null;
    const eventManager = new EventManager(() => timeAnswered);
    for (let i = 0; i < times.length; i++) {
      timeAnswered = times[i];
      if (onDown) {
        eventManager.onDown(mockEvent);
      } else {
        eventManager.onUp(mockEvent);
      }
      onDown = !onDown;
    }
    return eventManager;
  };

  const measures = generateMeasures(['crotchet', 'whole', 'minim', 'crotchet']);

  test('calculateMeasureScore - errors', () => {
    const scoreCalculator = new ScoreCalculator(
      mockEventManager([3900, 4800, 5010, 9010, 9015, 11010, 11020, 12030]),
      measures, false, scoreManager
    );
    scoreCalculator.calculateMeasureScore(8000, 1);
    scoreCalculator.calculateMeasureScore(12000, 2);
    expect(true).toBeTruthy();
  });

  test('calculateMeasureScore - perfect', () => {
    const scoreCalculator = new ScoreCalculator(
      mockEventManager([4000, 4999, 5000, 8999, 9000, 10999, 11000, 11999]),
      measures, false, scoreManager
    );
    scoreCalculator.calculateMeasureScore(8000, 1);
    scoreCalculator.calculateMeasureScore(12000, 2);
    expect(true).toBeTruthy();
  });

  test('Measure Score - getMainFailureReason', () => {
    let score = new MeasureScore([calculateNoteScore(-350, 0, false)]);
    expect(score.getMainFailureReason()).toBe('Too Early');

    score = new MeasureScore([calculateNoteScore(350, 0, false)]);
    expect(score.getMainFailureReason()).toBe('Too Late');

    score = new MeasureScore([calculateNoteScore(0, -0.9, false)]);
    expect(score.getMainFailureReason()).toBe('Too Short');

    score = new MeasureScore([calculateNoteScore(0, 0.9, false)]);
    expect(score.getMainFailureReason()).toBe('Too Long');

    score = new MeasureScore([calculateNoteScore(0, 0, true)]);
    expect(score.getMainFailureReason()).toBe('Too Much');

    score = new MeasureScore([calculateNoteScore(-350, 2, true), calculateNoteScore(-350, 0, false)]);
    expect(score.getMainFailureReason()).toBe('Too Early');
  });
});
