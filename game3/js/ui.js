import { state } from './state.js';
import { TOTAL_QUESTIONS, difficultyMap, CHOICE_COUNT } from './config.js';
import { clearChildren, shuffleArray, createElem } from './utils.js';
import { checkAnswer } from './gameLogic.js';

// 画面切替
export function showScreen(id) {
  document.querySelectorAll('.screen').forEach(el=>el.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

export function updateProgress() {
  const stars = document.querySelector('.progress-stars');
  clearChildren(stars);
  for(let i=1;i<=TOTAL_QUESTIONS;i++){
    const s=createElem('span'); s.className='star'+(i<=state.currentQuestion?' active':'');
    s.textContent='★'; stars.appendChild(s);
  }
}

export function renderChoices(correct) {
  const container = document.getElementById('choice-container');
  clearChildren(container);
  let choices = [correct];
  while(choices.length<CHOICE_COUNT) {
    const r = getRandomInt(Math.max(1, state.settings.circleMin-2), state.settings.circleMax+2);
    if(!choices.includes(r)) choices.push(r);
  }
  shuffleArray(choices).forEach(val=>{
    const btn=createElem('button',{class:'btn choice'});
    btn.textContent=val; btn.onclick=()=>checkAnswer(val, correct, btn);
    container.appendChild(btn);
  });
}

export function renderResult(correctCount) {
  const starsEl=document.querySelector('.result-stars');
  clearChildren(starsEl);
  for(let i=0;i<correctCount;i++){
    const s=createElem('span',{class:'star'});
    s.textContent='★'; starsEl.appendChild(s);
  }
  // メッセージ設定
}

// 初期化イベント設定
export function initUI() {
  document.getElementById('startBtn').onclick = () => import('./gameLogic.js').then(m=>m.startGame());
  document.getElementById('ruleBtn').onclick  = () => showScreen('screen-rule');
  // 他ボタン設定...
}

document.addEventListener('DOMContentLoaded', initUI);
