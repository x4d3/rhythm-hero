'use strict';

import './style.css';
import Application, { DEFAULT_TEMPO, DEFAULT_TS } from './application.js';
import { levelManager } from './level-manager.js';
import { MAX_DIFFICULTY } from './rhythm-patterns.js';
import { createSuiteArray } from './utils.js';
import { debug as enableDebug } from './logger.js';
import { soundsManager } from './sounds-manager.js';
import ScoreScreen from './score-screen.js';
import Settings from './settings.js';
import TimeSignature, { FOUR_FOUR, THREE_FOUR, TWO_FOUR } from './time-signature.js';

// Initialize settings
const settings = new Settings();

// Debug mode
function getParameterByName(name) {
  name = name.replace(/[[\]]/g, '\\$&');
  const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
  const results = regex.exec(location.search);
  return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

if (getParameterByName('debug') === 'true') {
  enableDebug();
}

// Create application
const canvas = document.querySelector('canvas.application');
const application = new Application(canvas, settings);

// Audio initialization
let audioInitialized = false;
async function initAudio(callback) {
  if (!audioInitialized) {
    audioInitialized = true;
    await soundsManager.init();
  }
  callback();
}

// Populate select options
function populateSelect(selectEl, values, currentValue) {
  selectEl.innerHTML = '';
  values.forEach(val => {
    const option = document.createElement('option');
    option.value = val;
    option.textContent = val;
    if (String(val) === String(currentValue)) {
      option.selected = true;
    }
    selectEl.appendChild(option);
  });
}

const difficultyValues = createSuiteArray(1, MAX_DIFFICULTY + 1);
const timeSignaturesValues = [FOUR_FOUR, THREE_FOUR, TWO_FOUR].map(ts => ts.toString());
const tempiValues = [60, 90, 120, 150, 180];

const difficultySelect = document.getElementById('difficulty-select');
const timeSignatureSelect = document.getElementById('timesignature-select');
const tempoSelect = document.getElementById('tempo-select');
const beginnerModeCheckbox = document.getElementById('beginner-mode-checkbox');
const withLifeCheckbox = document.getElementById('with-life-checkbox');

populateSelect(difficultySelect, difficultyValues, settings.get('difficulty'));
populateSelect(timeSignatureSelect, timeSignaturesValues, settings.get('timeSignature'));
populateSelect(tempoSelect, tempiValues, settings.get('tempo'));

beginnerModeCheckbox.checked = settings.get('beginnerMode');
withLifeCheckbox.checked = settings.get('withLife');

// Scrolling direction radio buttons
document.querySelectorAll('input[name="scrolling-direction"]').forEach(radio => {
  radio.checked = radio.value === settings.get('scrollingDirection');
  radio.addEventListener('change', () => {
    settings.set('scrollingDirection', radio.value);
  });
});

// Scrolling mode radio buttons
document.querySelectorAll('input[name="scrolling-mode"]').forEach(radio => {
  radio.checked = radio.value === settings.get('scrollingMode');
  radio.addEventListener('change', () => {
    settings.set('scrollingMode', radio.value);
  });
});

// Select change handlers
difficultySelect.addEventListener('change', () => {
  settings.set('difficulty', parseInt(difficultySelect.value, 10));
});
timeSignatureSelect.addEventListener('change', () => {
  settings.set('timeSignature', timeSignatureSelect.value);
});
tempoSelect.addEventListener('change', () => {
  settings.set('tempo', parseInt(tempoSelect.value, 10));
});
beginnerModeCheckbox.addEventListener('change', () => {
  settings.set('beginnerMode', beginnerModeCheckbox.checked);
});
withLifeCheckbox.addEventListener('change', () => {
  settings.set('withLife', withLifeCheckbox.checked);
});

// Game buttons
document.getElementById('btn-practice').addEventListener('click', () => {
  initAudio(() => application.quickGame());
});
document.getElementById('btn-campaign').addEventListener('click', () => {
  initAudio(() => {
    const scores = settings.get('scores');
    application.campaign(scores.campaign.length);
  });
});

// Canvas UI icons
const appContainer = document.querySelector('.application-container');
const beginnerIcon = document.getElementById('icon-beginner');
const soundIcon = document.getElementById('icon-sound');
const closeIcon = document.getElementById('icon-close');

beginnerIcon.addEventListener('click', () => {
  const val = !settings.get('beginnerMode');
  settings.set('beginnerMode', val);
  beginnerIcon.classList.toggle('on', val);
  beginnerModeCheckbox.checked = val;
});

soundIcon.addEventListener('click', () => {
  const val = !settings.get('soundsOn');
  settings.set('soundsOn', val);
  soundIcon.classList.toggle('on', val);
});

closeIcon.addEventListener('click', () => {
  application.stop();
});

// Toggle display canvas visibility
settings.onChange('displayCanvas', (show) => {
  const navbar = document.querySelector('.navbar');
  const mainContainer = document.getElementById('main-container');
  navbar.classList.toggle('js-hidden', show);
  mainContainer.classList.toggle('js-hidden', show);
  appContainer.classList.toggle('js-hidden', !show);

  if (show) {
    beginnerIcon.classList.toggle('on', settings.get('beginnerMode'));
    soundIcon.classList.toggle('on', settings.get('soundsOn'));
  }
});

settings.onChange('beginnerModeEnabled', (enabled) => {
  beginnerIcon.style.display = enabled ? '' : 'none';
});

// Initialize display state
appContainer.classList.add('js-hidden');
soundIcon.classList.toggle('on', settings.get('soundsOn'));
beginnerIcon.classList.toggle('on', settings.get('beginnerMode'));

// Keyboard and touch events
const onDown = (event) => application.onEvent(false, event);
const onUp = (event) => application.onEvent(true, event);

document.body.addEventListener('touchstart', onDown, { passive: false });
document.body.addEventListener('mousedown', onDown);
document.body.addEventListener('touchend', onUp, { passive: false });
document.body.addEventListener('mouseup', onUp);
document.body.addEventListener('touchcancel', onUp, { passive: false });
document.body.addEventListener('keydown', onDown);
document.body.addEventListener('keyup', onUp);

window.addEventListener('blur', () => {
  application.resetKeyPressed();
});

// Modal handling
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  modal.classList.add('show');
  // Create backdrop
  const backdrop = document.createElement('div');
  backdrop.className = 'fixed inset-0 bg-black/50 z-40';
  backdrop.dataset.modalBackdrop = modalId;
  backdrop.addEventListener('click', () => closeModal(modalId));
  document.body.appendChild(backdrop);
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  modal.classList.remove('show');
  const backdrop = document.querySelector(`[data-modal-backdrop="${modalId}"]`);
  if (backdrop) backdrop.remove();
}

// Modal triggers
document.querySelectorAll('[data-modal-target]').forEach(el => {
  el.addEventListener('click', (e) => {
    e.preventDefault();
    openModal(el.getAttribute('data-modal-target'));
  });
});

// Modal close buttons
document.querySelectorAll('[data-modal-dismiss]').forEach(el => {
  el.addEventListener('click', () => {
    const modal = el.closest('.modal');
    if (modal) closeModal(modal.id);
  });
});

// Render score tables
function renderScores() {
  const scores = settings.get('scores');

  // Campaign scores
  const campaignBody = document.getElementById('campaign-scores-body');
  const campaignEmpty = document.getElementById('campaign-scores-empty');
  campaignBody.innerHTML = '';
  if (scores.campaign.length === 0) {
    campaignEmpty.classList.remove('js-hidden');
  } else {
    campaignEmpty.classList.add('js-hidden');
    scores.campaign.forEach((score, index) => {
      const level = levelManager.getLevel(index);
      const tr = document.createElement('tr');
      tr.className = 'border-b border-stone-700/50';
      tr.innerHTML = `<td class="py-2 text-stone-300">${level.description}</td><td class="text-right score py-2">${ScoreScreen.formatTotal(score)}</td><td class="text-right py-2"><button type="button" class="px-3 py-1 rounded bg-amber-700 hover:bg-amber-600 text-amber-50 text-sm transition cursor-pointer">Retry</button></td>`;
      tr.querySelector('button').addEventListener('click', () => {
        closeModal('scores-modal');
        initAudio(() => application.campaign(index));
      });
      campaignBody.appendChild(tr);
    });
  }

  // Practice scores
  const practiceBody = document.getElementById('practice-scores-body');
  const practiceEmpty = document.getElementById('practice-scores-empty');
  practiceBody.innerHTML = '';
  const practiceScores = scores.practice;
  const practiceKeys = Object.keys(practiceScores);
  if (practiceKeys.length === 0) {
    practiceEmpty.classList.remove('js-hidden');
  } else {
    practiceEmpty.classList.add('js-hidden');
    practiceKeys.forEach(key => {
      const split = key.split('#');
      const tr = document.createElement('tr');
      tr.className = 'border-b border-stone-700/50';
      tr.innerHTML = `<td class="py-2 text-stone-300">Difficulty: ${split[0]} Tempo:${split[1]}</td><td class="text-right score py-2">${ScoreScreen.formatTotal(practiceScores[key])}</td>`;
      practiceBody.appendChild(tr);
    });
  }
}

// Render scores initially and when scores change
renderScores();
settings.onChange('scores', renderScores);

// Reset scores button
document.getElementById('btn-reset-scores').addEventListener('click', () => {
  if (confirm('Are you sure you want to reset all your scores?')) {
    settings.set('scores', { campaign: [], practice: {} });
  }
});

// Navbar collapse toggle
const navbarToggle = document.querySelector('.navbar-toggle');
const navbarMobile = document.getElementById('navbar-mobile');
if (navbarToggle) {
  navbarToggle.addEventListener('click', () => {
    navbarMobile.classList.toggle('js-hidden');
  });
}

// Debug mode: auto-start level
if (getParameterByName('debug') === 'true') {
  const level = getParameterByName('level');
  if (level) {
    initAudio(() => {
      application.campaign(parseInt(level, 10));
    });
  }
}

// Display version
const versionEl = document.getElementById('app-version');
if (versionEl) {
  versionEl.textContent = `v${__APP_VERSION__}`;
  versionEl.href = `https://github.com/x4d3/rhythm-hero/tree/v${__APP_VERSION__}`;
}

// Remove loading screen
document.body.classList.remove('loading');
