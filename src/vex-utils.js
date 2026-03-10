'use strict';

import Vex from './lib/vexflow.js';
import Fraction from './lib/fraction.js';
import { factor } from './lib/prime-library.js';
import { divide, getArrayElement } from './utils.js';
import gaussian from 'gaussian';

const VF = Vex.Flow;

const ALL_NOTES = {
  'C': { root_index: 0, int_val: 0 },
  'Db': { root_index: 1, int_val: 1 },
  'D': { root_index: 1, int_val: 2 },
  'Eb': { root_index: 2, int_val: 3 },
  'E': { root_index: 2, int_val: 4 },
  'F': { root_index: 3, int_val: 5 },
  'F#': { root_index: 3, int_val: 6 },
  'G': { root_index: 4, int_val: 7 },
  'Ab': { root_index: 5, int_val: 8 },
  'A': { root_index: 5, int_val: 9 },
  'Bb': { root_index: 6, int_val: 10 },
  'B': { root_index: 6, int_val: 11 },
};

let currentIndex = 7;
const distribution = gaussian(0, 3);

export function randomKey() {
  currentIndex += Math.floor(distribution.ppf(Math.random()));
  if (currentIndex < 0) {
    currentIndex = 0;
  } else if (currentIndex > 14) {
    currentIndex = 14;
  }
  return newKey(currentIndex);
}

export function newKey(index) {
  const division = divide(index, 7);
  const scale = 4 + division.quotient;
  const key = getArrayElement(VF.Music.roots, division.rest);
  return key + '/' + scale;
}

export function newNote(key, duration) {
  return new VF.StaveNote({
    keys: [key],
    duration: duration.toString(),
  });
}

function toBinary(n) {
  return n.toString(2).split('').map(s => parseInt(s, 2));
}

function last(a) {
  return a[a.length - 1];
}

function isPowerTwo(n) {
  return (n & (n - 1)) === 0;
}

function fractionToString(duration) {
  if (duration.denominator === 1) {
    return duration.numerator.toString();
  }
  return duration.toString();
}

export function generateStaveElements(notes) {
  const allNotes = [];
  let durationBuffer = Fraction.ZERO;
  notes.forEach(note => {
    const notesData = [];
    const isRest = note.isRest;
    let key;
    if (isRest) {
      key = 'a/4';
    } else {
      key = randomKey();
    }
    const processNote = (note) => {
      let duration = note.duration;
      let tupletFactor;
      if (duration.denominator !== 1) {
        const dFactors = factor(duration.denominator);
        tupletFactor = dFactors.find(f => f !== 2);
      }

      if (tupletFactor !== undefined) {
        duration = duration.multiply(new Fraction(tupletFactor, 1)).divide(new Fraction(2, 1));
      }
      const binary = toBinary(duration.numerator);

      for (let i = 0; i < binary.length; i++) {
        if (binary[i]) {
          if (!isRest && i > 0 && binary[i - 1]) {
            last(notesData).dots++;
          } else {
            const x = 1 << (binary.length - i - 1);
            const noteDuration = new Fraction(4 * duration.denominator, x);
            Vex.Flow.sanitizeDuration(fractionToString(noteDuration));
            notesData.push({
              keys: [key],
              duration: noteDuration,
              dots: 0,
              tupletFactor,
              isRest: isRest ? 'r' : '',
            });
          }
        }
      }
    };

    let sum = durationBuffer.add(note.duration);
    let compare = Fraction.ONE.compareTo(sum);
    while (compare < 0 && !sum.mod(1).equals(Fraction.ZERO)) {
      const durationLeft = Fraction.ONE.subtract(durationBuffer);
      const split = note.split(durationLeft);
      processNote(split[0]);
      note = split[1];
      durationBuffer = Fraction.ZERO;
      sum = note.duration;
      compare = Fraction.ONE.compareTo(sum);
    }
    durationBuffer = sum.mod(1);
    if (!note.duration.equals(Fraction.ZERO)) {
      processNote(note);
    }
    allNotes.push(notesData);
  });

  const result = {
    notes: [],
    tuplets: [],
  };
  let currentTuplet = [];
  allNotes.forEach(notesData => {
    notesData.forEach((noteData, j) => {
      result.notes.push({
        keys: noteData.keys,
        duration: fractionToString(noteData.duration),
        dots: noteData.dots,
        type: noteData.isRest ? 'r' : '',
        isTied: j > 0 && !noteData.isRest,
      });

      if (noteData.tupletFactor !== undefined) {
        currentTuplet.push(noteData);
        let wholeDuration = currentTuplet.reduce((sum, note) => {
          return sum.add(note.duration.inverse());
        }, Fraction.ZERO);
        wholeDuration = wholeDuration.divide(new Fraction(noteData.tupletFactor, 2));
        const n = wholeDuration.numerator;
        const d = wholeDuration.denominator;
        if ((n === 1 && isPowerTwo(d)) || (d === 1 && isPowerTwo(n))) {
          const tuplet = {
            tupletFactor: noteData.tupletFactor,
            beats_occupied: 2,
            index: result.notes.length - currentTuplet.length,
            size: currentTuplet.length,
          };
          result.tuplets.push(tuplet);
          currentTuplet = [];
        }
      }
    });
  });
  return result;
}

export function generateMeasuresCanvases(measureWidth, measureHeight, measures) {
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = measureWidth * measures.length;
  tempCanvas.height = measureHeight;
  const context = tempCanvas.getContext('2d', { willReadFrequently: true });
  const renderer = new VF.Renderer(tempCanvas, VF.Renderer.Backends.CANVAS);
  const ctx = renderer.getContext();
  let currentTimeSignature = null;
  let currentTempo = null;
  let previousMeasureLastNote = null;

  measures.forEach((measure, i) => {
    if (measure.isEmpty) {
      return;
    }
    const timeSignature = measure.timeSignature;
    const tempo = measure.tempo;
    const stave = new VF.Stave(measureWidth * i, 0, measureWidth);
    stave.setContext(context);

    if (currentTimeSignature === null || !currentTimeSignature.equals(timeSignature)) {
      currentTimeSignature = timeSignature;
      stave.addTimeSignature(timeSignature.toString());
    }
    if (currentTempo === null || currentTempo !== tempo) {
      currentTempo = tempo;
      stave.setTempo({ duration: 'q', bpm: tempo }, 0);
    }

    stave.draw(context);
    const formatter = new VF.Formatter();
    const staveElements = generateStaveElements(measure.notes);
    const voice = new VF.Voice({
      num_beats: timeSignature.numerator,
      beat_value: timeSignature.denominator,
      resolution: VF.RESOLUTION,
    });
    voice.setStrict(false);

    const ties = [];
    const staveNotes = [];
    staveElements.notes.forEach((noteData, index) => {
      const staveNote = new VF.StaveNote(noteData);
      for (let d = 0; d < noteData.dots; d++) {
        staveNote.addDotToAll();
      }
      if (noteData.isTied) {
        const tie = new Vex.Flow.StaveTie({
          first_note: staveNotes[index - 1],
          last_note: staveNote,
          first_indices: [0],
          last_indices: [0],
        });
        ties.push(tie);
      }
      staveNotes.push(staveNote);
    });

    const tuplets = staveElements.tuplets.map(tupleInfo => {
      const tupletOption = {
        num_notes: tupleInfo.tupletFactor,
        beats_occupied: tupleInfo.beats_occupied,
      };
      const tupletNotes = staveNotes.slice(tupleInfo.index, tupleInfo.index + tupleInfo.size);
      return new VF.Tuplet(tupletNotes, tupletOption);
    });
    const beamsOption = {
      beam_rests: true,
      beam_middle_only: true,
    };
    const beams = VF.Beam.generateBeams(staveNotes, beamsOption);

    voice.addTickables(staveNotes);
    formatter.joinVoices([voice]).formatToStave([voice], stave);
    voice.draw(context, stave);
    if (measure.firstNotePressed) {
      const tie = new Vex.Flow.StaveTie({
        first_note: previousMeasureLastNote,
        last_note: staveNotes[0],
        first_indices: [0],
        last_indices: [0],
      });
      ties.push(tie);
    }
    tuplets.forEach(tuplet => {
      tuplet.setContext(context).draw();
    });
    beams.forEach(beam => {
      beam.setContext(context).draw();
    });
    ties.forEach(tie => {
      tie.setContext(context).draw();
    });

    previousMeasureLastNote = last(staveNotes);
  });

  const result = [];
  for (let i = 0; i < measures.length; i++) {
    result[i] = context.getImageData(measureWidth * i, 0, measureWidth, measureHeight);
  }
  return result;
}
