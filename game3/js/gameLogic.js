import { state } from './state.js';
import { TOTAL_QUESTIONS, difficultyMap, shapeTypes } from './config.js';
import { getRandomInt, shuffleArray } from './utils.js';
import { createShapeObject, checkOverlap } from './shapes.js';
import { playSound, createConfetti } from './effects.js';
import { showScreen, updateProgress, renderChoices, renderResult } from './ui.js';

export async function startGame() {
  state.reset();
  applySettings();
  showScreen('screen-game');
  nextQuestion();
}

function applySettings() {
  const s = state.settings;
  // DOMから取得して state.settings にセット
}

export function nextQuestion() {
  state.next();
  if (state.currentQuestion > TOTAL_QUESTIONS) return showResult();
  updateProgress();
  renderCountdown(3, () => renderShapes());
}

function renderCountdown(sec, cb) {
  const el = document.getElementById('countdown');
  let c=sec;
  el.textContent = c;
  const timer = setInterval(()=>{
    if(--c<=0) { clearInterval(timer); el.textContent=''; cb(); }
    else el.textContent=c;
  },1000);
}

function renderShapes() {
  const container = document.getElementById('circle-container');
  // 省略: shape生成→表示→一定時間後消去→renderChoices
}

function showResult() { renderResult(state.correctCount); }
