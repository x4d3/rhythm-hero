'use strict';

import { binarySearch, getTime, identity } from './utils.js';
import { logManager } from './logger.js';

const logger = logManager.getLogger('EventManager');

export default class EventManager {
  constructor(getTimeCallback) {
    this.keyPressed = [];
    this.isPressed = false;
    this.keyChanged = [];
    this.getTime = getTimeCallback === undefined ? getTime : getTimeCallback;
  }

  getEventsBetween(startTime, endTime) {
    const index1 = binarySearch(this.keyChanged, startTime);
    const index2 = binarySearch(this.keyChanged, endTime);
    if (this.keyChanged[index2] < endTime) {
      // index2++;  — not used, we use the loop below
    }
    let isPressed = index1 % 2 === 0;
    const adjustedIndex2 = this.keyChanged[binarySearch(this.keyChanged, endTime)] < endTime
      ? binarySearch(this.keyChanged, endTime) + 1
      : binarySearch(this.keyChanged, endTime);
    const result = [];
    for (let i = index1; i < adjustedIndex2 + 1; i++) {
      if (i >= 0 && i < this.keyChanged.length) {
        result.push({
          isPressed,
          t: this.keyChanged[i],
        });
      }
      isPressed = !isPressed;
    }
    return result;
  }

  getEvents(t) {
    const index = binarySearch(this.keyChanged, t);
    let isPressed = index % 2 === 0;
    const result = [];
    const addToResult = (t1, t2) => {
      result.push({
        isPressed,
        duration: t2 - t1,
        t1,
        t2,
      });
      isPressed = !isPressed;
    };
    const length = this.keyChanged.length;
    if (index + 1 >= length) {
      addToResult(t, this.getTime());
    } else {
      addToResult(t, this.keyChanged[index + 1]);
      for (let i = index + 2; i < this.keyChanged.length; i++) {
        addToResult(this.keyChanged[i - 1], this.keyChanged[i]);
      }
      addToResult(this.keyChanged[this.keyChanged.length - 1], this.getTime());
    }
    return result;
  }

  onUp(event) {
    logger.debug('onUp: ' + event.which);
    this.keyPressed[event.which] = false;
    this._update();
  }

  resetKeyPressed() {
    logger.debug('resetKeyPressed');
    this.keyPressed = [];
    this._update();
  }

  onDown(event) {
    logger.debug('onDown: ' + event.which);
    this.keyPressed[event.which] = true;
    this._update();
  }

  onEvent(isUp, event) {
    if (isUp) {
      this.onUp(event);
    } else {
      this.onDown(event);
    }
  }

  _update() {
    const isPressed = this.keyPressed.some(identity);
    if (isPressed !== this.isPressed) {
      this.keyChanged.push(this.getTime());
    }
    this.isPressed = isPressed;
  }

  toJson() {
    return JSON.stringify({
      keyPressed: this.keyPressed,
      keyChanged: this.keyChanged,
      isPressed: this.isPressed,
    });
  }

  static fromJson(json, getTimeCallback) {
    const obj = JSON.parse(json);
    const eventManager = new EventManager(getTimeCallback);
    eventManager.keyPressed = obj.keyPressed;
    eventManager.keyChanged = obj.keyChanged;
    eventManager.isPressed = obj.isPressed;
    return eventManager;
  }
}
