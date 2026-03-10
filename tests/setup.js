// Vitest setup file for jsdom environment
// Mock Audio API if not available
if (typeof window.Audio === 'undefined') {
  window.Audio = class Audio {
    constructor(src) {
      this.src = src;
    }
    play() {}
  };
}

// Mock AudioContext for sounds-manager
if (typeof window.AudioContext === 'undefined') {
  window.AudioContext = class AudioContext {
    constructor() {
      this.state = 'running';
      this.destination = {};
    }
    createBufferSource() {
      return {
        buffer: null,
        connect() {},
        start() {},
      };
    }
    decodeAudioData() {
      return Promise.resolve({});
    }
    resume() {
      return Promise.resolve();
    }
  };
}
