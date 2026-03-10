'use strict';

const LOG_LEVEL = {
  DEBUG: { level: 0, name: 'DEBUG' },
  WARN: { level: 1, name: 'WARN' },
  ERROR: { level: 2, name: 'ERROR' },
};

const DEFAULT_LOG_LEVEL = LOG_LEVEL.WARN.level;

class LogManager {
  constructor() {
    this.logLevels = {};
  }

  getLogger(id) {
    if (this.logLevels[id] === undefined) {
      this.logLevels[id] = DEFAULT_LOG_LEVEL;
    }
    const logManager = this;
    return {
      debug(message) {
        this.log(LOG_LEVEL.DEBUG, message);
      },
      warn(message) {
        this.log(LOG_LEVEL.WARN, message);
      },
      error(message) {
        this.log(LOG_LEVEL.ERROR, message);
      },
      log(severity, message) {
        if (severity.level >= logManager.logLevels[id]) {
          console.log('[' + severity.name + '] ' + id + ' : ' + message);
        }
      },
    };
  }

  setLogLevel(id, level) {
    this.logLevels[id] = level;
  }

  setAllLogLevel(level) {
    for (const key of Object.keys(this.logLevels)) {
      this.logLevels[key] = level;
    }
  }
}

export const logManager = new LogManager();

export let isDebug = false;

export function debug() {
  logManager.setAllLogLevel(0);
  isDebug = true;
}
