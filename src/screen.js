'use strict';

import * as VexUtils from './vex-utils.js';
import ScoreScreen from './score-screen.js';
import { brighten } from './canvas-utils.js';
import Metronome from './metronome.js';
import { createSuiteArray, divide, mod } from './utils.js';
import { MEASURE_WIDTH, REST_PERCENTAGE, STATUS } from './constants.js';

const MEASURE_HEIGHT = 150;
const METRONOME_POSITION = {
  x: MEASURE_WIDTH / 2 - 25,
  y: 5,
};
const TITLE_POSITION = {
  x: MEASURE_WIDTH - 60,
  y: 40,
};
const SCORE_POSITION = {
  x: MEASURE_WIDTH + 25,
  y: 35,
};
const MULTIPLIER_POSITION = {
  x: MEASURE_WIDTH + 75,
  y: 37,
};
const LIFE_POSITION = {
  x: 25,
  y: 35,
};
const PRESS_POSITION = {
  x: 150,
  y: 30,
};
const EVENT_Y = 200;
const DEBUG_Y = 178;
const SIGNAL_HEIGHT = 20;

export { METRONOME_POSITION, MEASURE_WIDTH, SCORE_POSITION, MULTIPLIER_POSITION, LIFE_POSITION };

export default class Screen {
  constructor(canvas, eventManager, scoreCalculator, measures, title, settings) {
    this.canvas = canvas;
    this.eventManager = eventManager;
    this.scoreCalculator = scoreCalculator;
    this.measures = measures;
    this.title = title;
    this.settings = settings;
    this.metronome = new Metronome(50, 50);
    const measuresCanvases = VexUtils.generateMeasuresCanvases(MEASURE_WIDTH, MEASURE_HEIGHT, measures);
    this.measuresCanvases = {
      'true': measuresCanvases,
      'false': measuresCanvases.map(brighten),
    };
    this.scoreScreen = new ScoreScreen({
      scoreCalculator,
      scorePosition: SCORE_POSITION,
      multiplierPosition: MULTIPLIER_POSITION,
      lifePosition: LIFE_POSITION,
      center: {
        x: canvas.width / 2,
        y: canvas.height / 2,
      },
    });
  }

  display(measureInfo) {
    const screen = this;
    const canvas = this.canvas;
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
    const measure = measureInfo.measure;
    const isOn = measureInfo.status === STATUS.STARTED;
    const isHorizontal = this.settings.get('scrollingDirection') === 'horizontal';
    const isContinuous = this.settings.get('scrollingMode') === 'continuous';
    const shift = measureInfo.ellapsedBeats / measure.getBeatPerBar();
    if (shift < 1.5) {
      const staveShift = isContinuous ? shift : 0.5;

      let suiteArray;
      if (isHorizontal) {
        suiteArray = createSuiteArray(-1, 3);
      } else {
        suiteArray = createSuiteArray(-2, 4);
      }

      suiteArray.forEach(i => {
        const index = measureInfo.index + i;
        if (index < 0 || index >= screen.measures.length) {
          return;
        }
        let staveX;
        let staveY;
        if (isHorizontal) {
          staveX = (i + 0.5 - staveShift) * MEASURE_WIDTH;
          staveY = 50;
        } else {
          const parity = mod(index, 2);
          const alpha = Math.floor(i - parity) / 2;
          staveX = parity * MEASURE_WIDTH;
          staveY = (1 + alpha - staveShift / 2) * MEASURE_HEIGHT;
        }
        const isActive = i === 0 && isOn;
        screen.displayStave(canvas, staveX, staveY, index, isActive);
        if (index === 0 && i === 0) {
          context.fillStyle = 'grey';
          const division = divide(measureInfo.ellapsedBeats, 1).quotient;
          const beatPerBar = screen.measures[index].getBeatPerBar();
          for (let beat = 0; beat < beatPerBar; beat++) {
            context.font = beat === division ? 'bolder 36px Open Sans' : '16px Open Sans';
            context.fillText(beat + 1, staveX + beat * MEASURE_WIDTH / beatPerBar, staveY + 70);
          }
        }
      });
      if (isOn) {
        const isBeginnerMode = this.settings.get('beginnerModeEnabled') && this.settings.get('beginnerMode');
        if (isBeginnerMode) {
          this.displayEvents(canvas, EVENT_Y, measure, measureInfo.t, 0.5);
          [-1, 0, 1, 2].forEach(i => {
            const index = measureInfo.index + i;
            if (index < 0 || index >= screen.measures.length) {
              return;
            }
            screen.displayDebug(canvas, DEBUG_Y, (i + 0.5 - shift) * MEASURE_WIDTH, index);
          });
        }
        this.displayMetronome(canvas, measure, measureInfo.ellapsedBeats);
      }
    }
    const previousMeasureIndex = measureInfo.index - 1;
    let measurePosition;
    if (isHorizontal) {
      measurePosition = {
        x: MEASURE_WIDTH / 2 - 80,
        y: 70,
      };
    } else {
      measurePosition = {
        x: (0.75 + mod(previousMeasureIndex, 2)) * MEASURE_WIDTH,
        y: 70,
      };
    }
    if (measureInfo.index < 1) {
      context.save();
      context.font = '24px arcadeclassic';
      context.fillStyle = '#696969';
      context.fillText(this.title, TITLE_POSITION.x, TITLE_POSITION.y);
      context.restore();
    } else {
      this.scoreScreen.draw(context, measurePosition, previousMeasureIndex, measureInfo);
    }

    if (this.eventManager.isPressed) {
      context.save();
      context.beginPath();
      context.lineWidth = 0.5;
      context.arc(PRESS_POSITION.x, PRESS_POSITION.y, 10, 0, 2 * Math.PI, false);
      context.fillStyle = '#696969';
      context.fill();
      context.strokeStyle = '#696969';
      context.stroke();
      context.restore();
    }
  }

  drawOnExternalCanvas(canvas, measureInfo) {
    const measure = measureInfo.measure;
    this.displayStave(canvas, 0, 0, measureInfo.index, true);
    this.displayEvents(canvas, 150, measure, measureInfo.t, 1);
    this.displayDebug(canvas, 120, 0, measureInfo.index);
    const score = this.scoreCalculator.measuresScore[measureInfo.index];
    if (score !== undefined) {
      const context = canvas.getContext('2d');
      context.font = '18px Open Sans';
      context.fillStyle = 'grey';
      context.fillText(Math.round(100 * score.value()), SCORE_POSITION.x, SCORE_POSITION.y);
    }
  }

  displayEvents(canvas, eventY, measure, t, percentage) {
    const context = canvas.getContext('2d');
    const measureDuration = measure.getDuration();
    const ups = this.eventManager.getEvents(t - measureDuration * percentage);
    let x = 0;
    context.save();
    context.beginPath();
    context.strokeStyle = '#003300';
    context.lineWidth = 1;
    const Y_IS_ON = eventY - SIGNAL_HEIGHT;
    const Y_IS_OFF = eventY;
    let y;
    ups.forEach(element => {
      y = 0.5 + (element.isPressed ? Y_IS_ON : Y_IS_OFF);
      context.lineTo(x, y);
      const newX = x + element.duration * MEASURE_WIDTH / measureDuration;
      context.lineTo(newX, y);
      x = newX;
    });
    context.stroke();
    context.restore();
  }

  displayDebug(canvas, debugY, startStave, index) {
    const context = canvas.getContext('2d');
    const currentMeasure = this.measures[index];
    context.save();
    context.beginPath();
    context.strokeStyle = 'blue';
    context.lineWidth = 1;
    let x = startStave;
    const beatLength = MEASURE_WIDTH / currentMeasure.getBeatPerBar();
    const epsilon = REST_PERCENTAGE * beatLength;
    const Y_IS_ON = debugY - SIGNAL_HEIGHT;
    const Y_IS_OFF = debugY;
    let y = currentMeasure.firstNotePressed ? Y_IS_ON : Y_IS_OFF;
    currentMeasure.notes.forEach((note, j) => {
      context.moveTo(x, y);
      y = note.isRest ? Y_IS_OFF : Y_IS_ON;
      context.lineTo(x, y);
      const duration = note.duration.value() * beatLength;
      const newX = x + duration;
      if (j === (currentMeasure.notes.length - 1) && currentMeasure.lastNotePressed) {
        context.lineTo(newX, y);
      } else {
        context.lineTo(newX - epsilon, y);
        y = Y_IS_OFF;
        context.lineTo(newX - epsilon, y);
        context.lineTo(newX, y);
      }
      x = newX;
    });
    context.stroke();
    context.restore();
  }

  displayStave(canvas, x, y, index, isActive) {
    const data = this.measuresCanvases[isActive][index];
    canvas.getContext('2d').putImageData(data, x, y);
  }

  displayMetronome(canvas, measure, ellapsedBeats) {
    const context = canvas.getContext('2d');
    context.save();
    context.translate(METRONOME_POSITION.x, METRONOME_POSITION.y);
    this.metronome.draw(context, measure, ellapsedBeats, this.settings.get('soundsOn'));
    context.restore();
  }
}
