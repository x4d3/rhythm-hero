'use strict';

import { logManager } from './logger.js';
import { binarySearch, keepBetween } from './utils.js';
import { REST_PERCENTAGE } from './constants.js';

const logger = logManager.getLogger('ScoreCalculator');
const MAX_START_DIFF = 200;
const MAX_DURATION_DIFF = 0.8;
const MAX_FAILED_RATIO = 0.20;

const FAILED_REASONS = {
  TOO_EARLY: 'Too Early',
  TOO_LATE: 'Too Late',
  TOO_SHORT: 'Too Short',
  TOO_LONG: 'Too Long',
  TOO_MANY_PRESSES: 'Too Much',
  NOT_PLAYED: 'Not Played',
};

export class ScoreType {
  constructor(value, label, icon, color) {
    this.value = value;
    this.label = label;
    this.icon = icon;
    this.color = color;
  }
}

export const SCORE_TYPES = [
  new ScoreType(0, 'Failed', 'F', 'black'),
  new ScoreType(0.1, 'Boo', 'E', 'orange'),
  new ScoreType(0.4, 'Good', 'C', 'grey'),
  new ScoreType(0.7, 'Awesome', 'A', 'green'),
  new ScoreType(0.9, 'Perfect', '\u2714', 'green'),
];

const SCORE_TYPES_VALUES = SCORE_TYPES.map(s => s.value);

export class SuccessNoteScore {
  constructor(value) {
    this.value = value;
    this.isFailed = false;
    this.failureReasons = [];
  }

  toString() {
    return String(this.value);
  }
}

export class FailedNoteScore {
  constructor(failureReasons) {
    this.value = 0;
    this.isFailed = true;
    this.failureReasons = failureReasons;
  }

  toString() {
    return this.failureReasons.join(',');
  }
}

const PERFECT = new SuccessNoteScore(1);

export class MeasureScore {
  constructor(notes) {
    this.notes = notes;
  }

  value() {
    if (this.isFailed()) {
      return 0;
    }
    let sum = 0;
    for (let i = 0; i < this.notes.length; i++) {
      sum += this.notes[i].value;
    }
    return sum / this.notes.length;
  }

  isFailed() {
    let failedNumber = 0;
    for (let i = 0; i < this.notes.length; i++) {
      if (this.notes[i].isFailed) {
        failedNumber++;
      }
    }
    return failedNumber / this.notes.length >= 0.2;
  }

  toString() {
    return this.notes.join(' | ');
  }

  getMainFailureReason() {
    const result = {};
    this.notes.forEach(note => {
      note.failureReasons.forEach(key => {
        result[key] = 1 + (result[key] ? result[key] : 0);
      });
    });
    let max = 0;
    let maxKey = null;
    Object.keys(result).forEach(key => {
      if (result[key] > max) {
        maxKey = key;
        max = result[key];
      }
    });
    return FAILED_REASONS[maxKey];
  }

  getType() {
    if (this.isFailed()) {
      return new ScoreType(0, this.getMainFailureReason(), '\u2717', 'red');
    }
    return SCORE_TYPES[this.getTypeIndex()];
  }

  getTypeIndex() {
    return binarySearch(SCORE_TYPES_VALUES, this.value());
  }
}

const NO_SCORE = new MeasureScore([]);

export function calculateNoteScore(startDiff, durationDiff, notesPlayedBetween) {
  const failureReasons = [];
  const addFailureReason = (failureType, isFailed) => {
    if (isFailed) {
      failureReasons.push(failureType);
    }
  };
  addFailureReason('TOO_EARLY', startDiff < -MAX_START_DIFF);
  addFailureReason('TOO_LATE', startDiff > MAX_START_DIFF);
  addFailureReason('TOO_SHORT', durationDiff < -MAX_DURATION_DIFF);
  addFailureReason('TOO_LONG', durationDiff > MAX_DURATION_DIFF);
  addFailureReason('TOO_MANY_PRESSES', notesPlayedBetween);
  if (failureReasons.length > 0) {
    return new FailedNoteScore(failureReasons);
  }
  const x = Math.max(1 - Math.abs(startDiff / MAX_START_DIFF), 0);
  const y = Math.max(MAX_DURATION_DIFF - Math.abs(durationDiff), 0);
  return new SuccessNoteScore(0.1 + 0.6 * x + 0.3 * y);
}

function calculateMeasureScore(eventManager, t, measure) {
  const bpm = measure.getBeatPerMillisecond();
  const epsilon = REST_PERCENTAGE / bpm;
  const measureDuration = measure.getDuration();

  let noteStartTime = t - measureDuration;
  const notes = measure.notes;
  const notesScores = notes.map((note, noteIndex) => {
    const originalDuration = note.duration.value() / bpm;
    let expectedDuration;
    if (note.isRest) {
      expectedDuration = originalDuration;
    } else {
      expectedDuration = originalDuration - epsilon;
    }
    const start = noteStartTime;
    const end = start + expectedDuration;
    const events = eventManager.getEventsBetween(start, end);
    noteStartTime = start + originalDuration;

    const nextNoteIsRest = (noteIndex < notes.length - 1) && (notes[noteIndex + 1].isRest);

    if (events.length === 0) {
      if (note.isRest) {
        return PERFECT;
      }
      return new FailedNoteScore(['NOT_PLAYED']);
    }
    let index = 0;
    if (events[0].isPressed === note.isRest) {
      if (events.length === 1) {
        if (events[0].t > end && note.isRest) {
          return PERFECT;
        }
        return new FailedNoteScore(['NOT_PLAYED']);
      }
      index = 1;
    }
    let eventStart;
    if ((measure.firstNotePressed && noteIndex === 0) || note.isRest) {
      eventStart = Math.max(start, events[index].t);
    } else {
      eventStart = events[index].t;
    }
    if (index === 0 && !note.isRest && events.length > 2 && Math.abs(events[2].t - start) < Math.abs(eventStart - start)) {
      index = 2;
      eventStart = events[2].t;
    }

    if (events[index].t > end) {
      return new FailedNoteScore(['TOO_LATE']);
    }

    const startDiff = eventStart - start;
    let nextEventT;
    if (index + 1 < events.length) {
      nextEventT = events[index + 1].t;
    } else {
      nextEventT = t;
    }
    let eventEnd;
    if (note.isRest) {
      if ((noteIndex === notes.length - 1) || nextNoteIsRest) {
        eventEnd = Math.min(nextEventT, end);
      } else {
        eventEnd = nextEventT;
      }
    } else {
      if (noteIndex === notes.length - 1 && measure.lastNotePressed) {
        eventEnd = Math.min(nextEventT, end);
      } else {
        eventEnd = nextEventT;
      }
    }

    const durationDiff = (eventEnd - eventStart - expectedDuration) / expectedDuration;
    const maxNotes = nextNoteIsRest ? 3 : 4;
    const notesPlayedBetween = events.length - index > maxNotes;
    return calculateNoteScore(startDiff, durationDiff, notesPlayedBetween);
  });
  return new MeasureScore(notesScores);
}

export default class ScoreCalculator {
  constructor(eventManager, measures, withLife, scoreManager) {
    this.eventManager = eventManager;
    this.measures = measures;
    this.withLife = withLife;
    this.scoreManager = scoreManager;
    this.life = 0.8;
    this.measuresScore = [NO_SCORE];
    this.multiplier = 1;
    this.totalScore = 0;
    this.goodMeasuresCount = 0;
    this.maxGoodMeasuresCount = 0;
  }

  hasLost() {
    return this.withLife && this.life === 0;
  }

  calculateMeasureScore(t, measureIndex) {
    if (measureIndex < 1) {
      return;
    }
    const measure = this.measures[measureIndex];
    const score = calculateMeasureScore(this.eventManager, t, measure);
    return this.addMeasureScore(measureIndex, score);
  }

  addMeasureScore(measureIndex, score) {
    this.measuresScore[measureIndex] = score;
    let lifeChange;
    if (score.isFailed()) {
      this.multiplier = 1;
      this.goodMeasuresCount = 0;
      lifeChange = -0.25;
    } else {
      this.goodMeasuresCount++;
      if ((this.goodMeasuresCount % 2) === 0) {
        this.multiplier = Math.min(this.multiplier + 1, 4);
      }
      this.maxGoodMeasuresCount = Math.max(this.goodMeasuresCount, this.maxGoodMeasuresCount);
      this.totalScore += score.value() * this.multiplier;
      lifeChange = (score.value() - 0.2) * 0.4;
    }
    this.life = keepBetween(0, 1, this.life + lifeChange);
    if (measureIndex === this.measures.length - 1) {
      this.scoreManager.save(this.totalScore);
    }
    return score;
  }

  win() {
    this.totalScore = 666;
    this.scoreManager.save(this.totalScore);
  }

  loose() {
    this.life = 0;
  }

  scoresTypeCount() {
    const scoresTypeCount = SCORE_TYPES.map(type => ({
      label: type.label,
      count: 0,
    }));
    for (let i = 1; i < this.measuresScore.length; i++) {
      const score = this.measuresScore[i];
      scoresTypeCount[score.getTypeIndex()].count++;
    }
    return scoresTypeCount;
  }
}
