import { Game } from './game.js';
import { UI } from './ui.js';
import { AudioManager } from './audio.js';

function boot() {
  const elements = {
    stage: document.getElementById('hud-stage'),
    score: document.getElementById('hud-score'),
    lives: document.getElementById('hud-lives'),
    filled: document.getElementById('hud-filled'),
    target: document.getElementById('hud-target'),
    pauseBtn: document.getElementById('pause-btn'),
    controls: document.getElementById('controls'),
    modal: document.getElementById('modal'),
    modalTitle: document.getElementById('modal-title'),
    modalMessage: document.getElementById('modal-message'),
    modalActions: document.getElementById('modal-actions'),
  };

  const canvas = document.getElementById('game-canvas');
  const ui = new UI(elements);
  const audio = new AudioManager();
  const game = new Game(canvas, ui, audio);

  document.addEventListener('touchmove', (event) => {
    event.preventDefault();
  }, { passive: false });

  game.init();
}

window.addEventListener('DOMContentLoaded', boot);
