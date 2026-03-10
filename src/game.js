'use strict';

import { binarySearch, getTime } from './utils.js';
import ScoreCalculator from './score-calculator.js';
import Screen from './screen.js';
import EventManager from './event-manager.js';
import Measure from './measure.js';
import { FOUR_FOUR } from './time-signature.js';
import { logManager, isDebug } from './logger.js';
import { STATUS } from './constants.js';

const logger = logManager.getLogger('Game');

export { STATUS };

export default class Game {
  constructor(measures, title, canvas, withLife, scoreManager, callback, settings) {
    const t0 = getTime();
    const ellapsed = () => getTime() - t0;
    const eventManager = new EventManager(ellapsed);
    this.ellapsed = ellapsed;
    this.eventManager = eventManager;
    this.measures = measures;
    this.callback = callback;
    this.title = title;
    this.settings = settings;
    let currentTime = 0;
    this.measuresStartTime = this.measures.map(measure => {
      const result = currentTime;
      currentTime += measure.getDuration();
      return result;
    });
    this.endGameTime = currentTime;
    this.measuresStartTime.push(currentTime);
    this.scoreCalculator = new ScoreCalculator(eventManager, this.measures, withLife, scoreManager);
    this.screen = new Screen(canvas, eventManager, this.scoreCalculator, this.measures, title, settings);
    this.status = STATUS.STARTED;
    logger.debug('t0:' + t0);
    this.currentMeasureIndex = -1;
  }

  update() {
    const ellapsed = this.ellapsed();
    const measureInfo = { t: ellapsed };
    measureInfo.index = binarySearch(this.measuresStartTime, ellapsed);
    const startTime = this.measuresStartTime[measureInfo.index];
    measureInfo.measure = this.measures[Math.min(measureInfo.index, this.measures.length - 1)];

    measureInfo.ellapsedBeats = measureInfo.measure.getBeatPerMillisecond() * (ellapsed - startTime);
    if (measureInfo.index !== this.currentMeasureIndex) {
      this.currentMeasureIndex = measureInfo.index;
      if (this.status === STATUS.STARTED) {
        this.scoreCalculator.calculateMeasureScore(ellapsed, measureInfo.index - 1);
        logger.debug(measureInfo.index + ',' + measureInfo.measure);
      }
    }
    if (this.status === STATUS.STARTED) {
      if (this.scoreCalculator.hasLost()) {
        this.endGameTime = ellapsed;
      }
      if (ellapsed >= this.endGameTime) {
        this.status = STATUS.SCORE_SCREEN;
        this.callback();
      }
    }
    measureInfo.status = this.status;
    this.screen.display(measureInfo);
  }

  renderScore() {
    const resultDiv = document.createElement('div');
    const h2 = document.createElement('h2');
    h2.textContent = 'Result';
    resultDiv.appendChild(h2);
    this.measuresStartTime.forEach((startTime, measureIndex) => {
      if (measureIndex < 2 || measureIndex === this.measures.length) {
        return;
      }
      const measure = this.measures[measureIndex];
      const measureInfo = {
        t: startTime,
        index: measureIndex - 1,
        ellapsedBeats: 0,
        measure,
      };
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = 400;
      tempCanvas.height = 200;
      this.screen.drawOnExternalCanvas(tempCanvas, measureInfo);
      resultDiv.appendChild(tempCanvas);
    });
    return resultDiv;
  }

  resetKeyPressed() {
    this.eventManager.resetKeyPressed();
  }

  onEvent(isUp, event) {
    this.eventManager.onEvent(isUp, event);
    if (!isUp) {
      if (this.status === STATUS.SCORE_SCREEN && (this.ellapsed() - this.endGameTime > 2000)) {
        this.status = STATUS.FINISHED;
        this.callback();
      }
    }

    if (isDebug) {
      const letterPressed = String.fromCharCode(event.which);
      if (letterPressed !== '') {
        logger.debug('Letter Pressed: ' + letterPressed);
        switch (letterPressed) {
          case 'W':
            logger.debug('Game won automatically');
            this.scoreCalculator.win();
            this.endGameTime = this.ellapsed();
            break;
          case 'L':
            this.scoreCalculator.loose();
            this.endGameTime = this.ellapsed();
            break;
        }
      }
    }
  }
}

Game.EMPTY_MEASURE = new Measure(60, FOUR_FOUR, [], false, false);
