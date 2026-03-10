import { describe, test, expect } from 'vitest';
import EventManager from '../src/event-manager.js';

describe('Event Manager', () => {
  test('getEvents', () => {
    const mockEvent = { which: 30 };
    const newEvent = (isPressed, t1, t2) => ({
      isPressed,
      duration: t2 - t1,
      t1,
      t2,
    });

    let timeAnswered = null;
    const eventManager = new EventManager(() => timeAnswered);

    let onDown = true;
    const times = [5, 6, 8, 11, 15];
    for (let i = 0; i < times.length; i++) {
      timeAnswered = times[i];
      if (onDown) {
        eventManager.onDown(mockEvent);
      } else {
        eventManager.onUp(mockEvent);
      }
      onDown = !onDown;
    }
    timeAnswered = 20;

    let expected = [
      newEvent(false, 0, 5),
      newEvent(true, 5, 6),
      newEvent(false, 6, 8),
      newEvent(true, 8, 11),
      newEvent(false, 11, 15),
      newEvent(true, 15, 20),
    ];
    expect(eventManager.getEvents(0)).toEqual(expected);

    expected = [
      newEvent(false, 7, 8),
      newEvent(true, 8, 11),
      newEvent(false, 11, 15),
      newEvent(true, 15, 20),
    ];
    expect(eventManager.getEvents(7)).toEqual(expected);
  });
});
