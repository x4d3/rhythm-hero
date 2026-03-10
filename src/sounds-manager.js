'use strict';

const SPRITES = {
  TIC: { start: 0, end: 0.16 },
  TOC: { start: 0.27, end: 0.425 },
};

class SoundsManager {
  constructor() {
    this.audioContext = null;
    this.audioBuffer = null;
    this.initialized = false;
  }

  async init() {
    this.audioContext = new AudioContext();
    const response = await fetch(`${import.meta.env.BASE_URL}sounds/sprites.mp3`);
    const arrayBuffer = await response.arrayBuffer();
    this.audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
    this.initialized = true;
  }

  play(id, soundsOn) {
    if (!soundsOn || !this.initialized) return;
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
    const sprite = SPRITES[id];
    const source = this.audioContext.createBufferSource();
    source.buffer = this.audioBuffer;
    source.connect(this.audioContext.destination);
    source.start(0, sprite.start, sprite.end - sprite.start);
  }
}

export const soundsManager = new SoundsManager();

// in milliseconds
export const NOTE_DURATION = 160;
