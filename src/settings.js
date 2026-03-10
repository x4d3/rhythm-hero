'use strict';

export default class Settings {
  constructor() {
    this._values = {};
    this._listeners = {};
    this._defaults = {
      beginnerMode: true,
      withLife: false,
      soundsOn: true,
      difficulty: 1,
      timeSignature: '4/4',
      tempo: 60,
      scrollingDirection: 'horizontal',
      scrollingMode: 'continuous',
      scores: { campaign: [], practice: {} },
      displayCanvas: false,
      beginnerModeEnabled: true,
    };
    this._persistKeys = [
      'beginnerMode', 'withLife', 'soundsOn', 'difficulty',
      'timeSignature', 'tempo', 'scrollingDirection', 'scrollingMode', 'scores',
    ];
    this._load();
  }

  _load() {
    for (const [key, defaultValue] of Object.entries(this._defaults)) {
      if (this._persistKeys.includes(key)) {
        const stored = localStorage.getItem('RH.' + key);
        if (stored !== null) {
          try {
            this._values[key] = JSON.parse(stored);
          } catch {
            this._values[key] = defaultValue;
          }
        } else {
          this._values[key] = defaultValue;
        }
      } else {
        this._values[key] = defaultValue;
      }
    }
  }

  get(key) {
    return this._values[key];
  }

  set(key, value) {
    const oldValue = this._values[key];
    this._values[key] = value;
    if (this._persistKeys.includes(key)) {
      localStorage.setItem('RH.' + key, JSON.stringify(value));
    }
    if (this._listeners[key]) {
      this._listeners[key].forEach(cb => cb(value, oldValue));
    }
  }

  onChange(key, callback) {
    if (!this._listeners[key]) {
      this._listeners[key] = [];
    }
    this._listeners[key].push(callback);
  }
}
