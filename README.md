# Rhythm Hero

A browser-based rhythm learning game that teaches users to read rhythm notation on music sheets. Built with vanilla JavaScript and [VexFlow](http://www.vexflow.com) for music notation rendering.

[![Deploy to GitHub Pages](https://github.com/x4d3/rhythm-hero/actions/workflows/deploy.yml/badge.svg)](https://github.com/x4d3/rhythm-hero/actions/workflows/deploy.yml)

Demo: https://x4d3.github.io/rhythm-hero/

## Getting Started

```sh
npm install          # Install dependencies
npm run dev          # Start dev server (http://localhost:5173/)
npm test             # Run tests
npm run build        # Production build (output in dist/)
npm run preview      # Preview production build locally
```

## Deployment

Pushes to `master` automatically build and deploy to GitHub Pages via GitHub Actions (see `.github/workflows/deploy.yml`).

## Project Structure

```
index.html                     # App entry HTML
public/                        # Static assets (copied as-is by Vite)
  bootstrap.css
  favicon.ico
  fonts/                       # Custom fonts (arcadeclassic, dpcomic, lunchds, scoreboard)
  images/                      # Game images (backgrounds, UI, loading)
  sounds/                      # Audio sprites (metronome tic/toc)
src/
  main.js                      # Entry point: initializes app, wires DOM events
  style.css                    # Application styles
  constants.js                 # Shared constants (MEASURE_WIDTH, STATUS enum, DEFAULT_TEMPO)
  settings.js                  # Reactive settings store with localStorage persistence
  lib/
    fraction.js                # Fraction arithmetic (custom library)
    prime-library.js           # Prime factorization utilities
    vexflow-debug.js           # VexFlow music notation library (vendored)
    vexflow-init.js            # Pre-initializes VexFlow global for strict mode compatibility
    vexflow.js                 # VexFlow ES module wrapper
  preconditions.js             # Runtime type/argument checks
  logger.js                    # Configurable logging (LogManager singleton)
  utils.js                     # General utilities (binary search, interpolation, etc.)
  canvas-utils.js              # Canvas image data manipulation (brighten effect)
  sounds-manager.js            # Audio playback via Web Audio API
  time-signature.js            # TimeSignature class (2/4, 3/4, 4/4)
  note.js                      # Note class with parsing from string notation
  measure.js                   # Measure class (tempo, time signature, notes)
  pattern.js                   # Rhythm pattern definitions
  rhythm-patterns.js           # Pattern registry (40+ patterns, difficulty 0-10), measure generation
  vex-utils.js                 # VexFlow integration for rendering notation to canvas
  event-manager.js             # Keyboard/touch input tracking with temporal recording
  metronome.js                 # Visual metronome with beat-synchronized audio
  score-calculator.js          # Note accuracy evaluation (Perfect/Awesome/Good/Boo/Failed)
  score-screen.js              # End-game score visualization with projectile animations
  screen.js                    # Main game rendering loop, multi-measure scrolling
  level-manager.js             # 8 campaign levels + dynamic level generation
  game.js                      # Game state machine (STARTED -> SCORE_SCREEN -> FINISHED)
  application.js               # Top-level application controller, campaign/practice modes
tests/
  setup.js                     # Test setup (Web Audio API mocks for jsdom)
  utils.test.js                # Utility function tests
  event-manager.test.js        # Event system tests
  rhythm-patterns.test.js      # Pattern generation tests
  game.test.js                 # Game logic tests
  score-calculator.test.js     # Scoring algorithm tests
```

## Architecture

### Rendering

Double-buffered: VexFlow pre-renders measures to `ImageData`, then composited onto the main canvas. Uses `requestAnimationFrame` for 60 FPS. Supports horizontal/vertical scrolling in continuous or per-measure mode.

### Data Flow

```
User Input -> EventManager -> ScoreCalculator -> Screen -> Canvas
                                     |
                               ScoreManager -> localStorage
```

### Module Dependency Chain (bottom-up)

1. **Foundation** — `preconditions.js`, `logger.js`, `utils.js`, `constants.js`
2. **Music Theory** — `fraction.js`, `time-signature.js`, `note.js`, `measure.js`, `pattern.js`
3. **Pattern Engine** — `rhythm-patterns.js` (40+ rhythm patterns across 11 difficulty levels)
4. **Rendering** — `vex-utils.js`, `canvas-utils.js`, `metronome.js`, `screen.js`, `score-screen.js`
5. **Input & Scoring** — `event-manager.js`, `score-calculator.js` (timing accuracy with multiplier/life system)
6. **Game Logic** — `game.js`, `level-manager.js` (8 campaign levels)
7. **Application** — `settings.js`, `sounds-manager.js`, `application.js`, `main.js`

### Settings

`Settings` class provides a reactive key-value store with automatic `localStorage` persistence. Replaces the previous Knockout.js observable layer. Supports `get(key)`, `set(key, value)`, and `onChange(key, callback)`.

### Audio

`SoundsManager` uses the Web Audio API (`AudioContext` + `BufferSource`) to play metronome sounds from an audio sprite.

## Libraries

- [VexFlow](http://www.vexflow.com) — Music notation rendering
- [Gaussian](https://github.com/errcw/gaussian) — Gaussian distribution (note pitch randomization)
- [seedrandom](https://github.com/davidbau/seedrandom) — Seeded random number generator
- [Numeral.js](https://github.com/adamwdraper/Numeral-js) — Number formatting
- [fraction.js](https://github.com/x4d3/fraction.js) — Fraction arithmetic (vendored)
- [prime-library.js](https://github.com/x4d3/prime-library.js) — Prime factorization (vendored)

## Build Tools

- [Vite](https://vitejs.dev/) — Build tool and dev server
- [Vitest](https://vitest.dev/) — Test framework
