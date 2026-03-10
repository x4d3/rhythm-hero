'use strict';

import Game, { STATUS } from './game.js';
import { levelManager } from './level-manager.js';
import * as RhythmPatterns from './rhythm-patterns.js';
import TimeSignature, { FOUR_FOUR } from './time-signature.js';
import ScoreScreen from './score-screen.js';
import { logManager } from './logger.js';

const logger = logManager.getLogger('Application');

export const DEFAULT_TEMPO = 60;
export const DEFAULT_TS = FOUR_FOUR;

export class ScoreManager {
  constructor(settings, type, index) {
    this.settings = settings;
    this.type = type;
    this.index = index;
  }

  save(score) {
    const scores = this.settings.get('scores');
    let best = scores[this.type][this.index];
    if (best === undefined || best < score) {
      scores[this.type][this.index] = score;
      this.settings.set('scores', scores);
      this.bestScoreBeaten = true;
      best = score;
    }
    this.best = best;
  }
}

export default class Application {
  constructor(canvas, settings) {
    this.canvas = canvas;
    this.settings = settings;
    this.screen = null;
    this.isAnimating = false;
  }

  startAnimation() {
    if (this.isAnimating) {
      return;
    }
    this.isAnimating = true;
    const app = this;
    const animloop = () => {
      if (app.screen === null) {
        app.isAnimating = false;
      } else {
        app.screen.update();
        requestAnimationFrame(animloop);
      }
    };
    animloop();
  }

  quickGame() {
    this.stop();
    const settings = this.settings;
    settings.set('displayCanvas', true);
    settings.set('beginnerModeEnabled', true);
    const timeSignature = TimeSignature.parse(settings.get('timeSignature'));
    const tempo = settings.get('tempo');
    const maxDifficulty = settings.get('difficulty');
    const notes = RhythmPatterns.generateNotes(0, maxDifficulty, 50);
    const measures = RhythmPatterns.generateMeasures([tempo], [timeSignature], notes);
    const withLife = settings.get('withLife');
    const title = 'Practice Mode - Difficulty: ' + maxDifficulty;
    const canvas = this.canvas;
    const app = this;
    const callback = function () {
      const status = this.status;
      if (status === STATUS.SCORE_SCREEN) {
        const resultDiv = document.querySelector('.result');
        resultDiv.innerHTML = '';
        resultDiv.appendChild(this.renderScore());
      } else if (status === STATUS.FINISHED) {
        settings.set('displayCanvas', false);
        app.screen = null;
      }
    };
    const scoreManager = new ScoreManager(settings, 'practice', maxDifficulty + '#' + tempo);
    this.screen = new Game(measures, title, canvas, withLife, scoreManager, callback, settings);
    this.startAnimation();
  }

  campaign(currentLevel) {
    this.stop();
    const settings = this.settings;
    const app = this;
    settings.set('displayCanvas', true);
    settings.set('beginnerModeEnabled', false);
    const setGame = () => {
      const level = levelManager.getLevel(currentLevel);
      const scoreManager = new ScoreManager(settings, 'campaign', currentLevel);
      app.screen = new Game(level.measures, level.description, app.canvas, true, scoreManager, callback, settings);
    };
    const callback = function () {
      const status = this.status;
      if (status === STATUS.SCORE_SCREEN) {
        if (!this.scoreCalculator.hasLost()) {
          currentLevel++;
        }
      } else if (status === STATUS.FINISHED) {
        setGame();
      }
    };
    setGame();
    this.startAnimation();
  }

  resetKeyPressed() {
    if (this.screen !== null && this.screen.resetKeyPressed) {
      this.screen.resetKeyPressed();
    }
  }

  onEvent(isUp, event) {
    if (this.screen !== null) {
      this.screen.onEvent(isUp, event);
    }
    if (event.keyCode === 27) {
      this.stop();
    }
    if (!event.ctrlKey && this.screen !== null) {
      event.preventDefault();
    }
  }

  stop() {
    this.screen = null;
    this.settings.set('displayCanvas', false);
  }
}
