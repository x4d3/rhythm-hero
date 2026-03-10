# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Rhythm Hero is a browser-based rhythm learning game that teaches users to read rhythm notation on music sheets. Built with vanilla JavaScript (ES5), it uses VexFlow for music notation rendering, Knockout.js for MVVM data binding, and jQuery for DOM manipulation.

Demo: http://x4d3.github.io/rhythm-hero/

## Build & Development Commands

```bash
npm install              # Install dependencies (Grunt-based build system)
grunt                    # Run tests, start dev server on http://localhost:4567/, watch for changes
grunt test               # Run jshint linting + QUnit tests
grunt qunit              # Run only QUnit tests
grunt jshint             # Run only linting
grunt stage              # Production build (minify JS/CSS/HTML, generate appcache) into target/
```

## Architecture

All code lives under the global `RH` namespace using IIFE module pattern. Source files are concatenated in the order defined by `source-files.json` — **load order matters for dependencies**.

### Module Dependency Chain (bottom-up)

- **rh.js** — Core utilities: preconditions, logger, binary search, inheritance helpers
- **canvas-utils.js** — Image data manipulation (brighten effect)
- **sounds-manager.js** — Audio sprite playback (metronome TIC/TOC)
- **time-signature.js** — TimeSignature class (2/4, 3/4, 4/4)
- **vex-utils.js** — VexFlow integration for rendering notation to canvas
- **measure.js** — Measure class (tempo, time signature, notes)
- **rhythm-patterns.js** — 40+ rhythm patterns with difficulty levels 0-10, generates measures
- **event-manager.js** — Keyboard/touch input tracking with temporal event recording
- **metronome.js** — Visual metronome display with beat-synchronized audio
- **score-calculator.js** — Note accuracy evaluation (Perfect/Awesome/Good/Boo/Failed), multiplier system, life system
- **score-screen.js** — End-game score visualization
- **screen.js** — Main game rendering loop, multi-measure scrolling (horizontal/vertical, continuous/per-measure)
- **level-manager.js** — 8 campaign levels with progressive difficulty, plus dynamic level generation
- **game.js** — Game state machine (STARTED → SCORE_SCREEN → FINISHED), update loop coordination
- **application.js** — Knockout.js MVVM controller, localStorage integration, campaign vs practice modes

### Rendering

Double-buffered: VexFlow pre-renders measures to ImageData, then composited to the main canvas. Uses `requestAnimationFrame` for 60 FPS.

### Data Flow

```
User Input → EventManager → ScoreCalculator → Screen → Canvas
                                    ↓
                              ScoreManager → localStorage
```

## Testing

Tests use QUnit and are in `tests/`. Test runner HTML is `tests/all-test.html`. Key test files:
- `rh-test.js` — Core utilities
- `event-manager.test.js` — Event system
- `rhythm-patterns-test.js` — Pattern generation
- `game-tests.js` — Game logic
- `score-calculator-test.js` — Scoring algorithm
- `mocks.js` — Test doubles

## Code Conventions

- All modules use `'use strict'`
- Classical inheritance via `RH.inherit()`
- Type checking via `RH.Preconditions` (checkArgument, checkType, etc.)
- Configurable logging per module via `RH.loggerFactory`
- Third-party libraries live in `src/lib/`, app code in `src/`
- Web assets (HTML, CSS, fonts, sounds) live in `www/`
