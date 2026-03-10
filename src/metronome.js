'use strict';

import { soundsManager, NOTE_DURATION } from './sounds-manager.js';
import { divide, getArrayElement, intermediatePoint } from './utils.js';
import { FOUR_FOUR, THREE_FOUR, TWO_FOUR } from './time-signature.js';

function drawDot(context, x, y) {
  context.beginPath();
  context.arc(x, y, 5, 0, 2 * Math.PI, false);
  context.fillStyle = 'green';
  context.fill();
  context.lineWidth = 1;
  context.strokeStyle = '#003300';
  context.stroke();
}

function convertProgression(rest) {
  return Math.pow(rest, 5);
}

const POINTS = {};

POINTS[TWO_FOUR.toString()] = [
  { x: 1 / 2, y: 1 },
  { x: 1 / 2, y: 0 },
];

POINTS[THREE_FOUR.toString()] = [
  { x: 1 / 2, y: 1 },
  { x: 1, y: 1 / 2 },
  { x: 1 / 2, y: 0 },
];

POINTS[FOUR_FOUR.toString()] = [
  { x: 1 / 2, y: 1 },
  { x: 0, y: 1 / 2 },
  { x: 1, y: 1 / 2 },
  { x: 1 / 2, y: 0 },
];

export default class Metronome {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.currentBeat = null;
  }

  draw(context, measure, ellapsedBeats, soundsOn) {
    const timeSignature = measure.timeSignature;
    const width = this.width;
    const height = this.height;
    const division = divide(ellapsedBeats, 1);
    const beatNumber = division.quotient;
    const adjustedEllapsedBeats = divide(ellapsedBeats + (NOTE_DURATION / 2) * measure.getBeatPerMillisecond(), 1);
    const adjustedBeat = adjustedEllapsedBeats.quotient % measure.getBeatPerBar();
    if (this.currentBeat !== adjustedBeat) {
      this.currentBeat = adjustedBeat;
      soundsManager.play(adjustedBeat === 0 ? 'TIC' : 'TOC', soundsOn);
    }
    const points = POINTS[timeSignature.toString()];
    context.beginPath();
    context.strokeStyle = '#696969';
    context.lineWidth = 1;
    points.forEach((point, index) => {
      context.moveTo(point.x * width, point.y * height);
      const nextPoint = getArrayElement(points, index + 1);
      context.lineTo(nextPoint.x * width, nextPoint.y * height);
    });
    context.stroke();
    const p1 = getArrayElement(points, beatNumber);
    const p2 = getArrayElement(points, beatNumber + 1);
    const p = intermediatePoint(p1, p2, convertProgression(division.rest));
    drawDot(context, width * p.x, height * p.y);

    context.font = '14px Arial, sans-serif';
    context.fillText(beatNumber + 1, 5, 10);
  }
}
