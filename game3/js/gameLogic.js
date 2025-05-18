import { state } from './state.js';
import { TOTAL_QUESTIONS, difficultyMap, shapeTypes } from './config.js';
import { getRandomInt, shuffleArray, clearChildren, createElem } from './utils.js';
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
  // DOMから取得して設定を反映
  s.difficulty = document.getElementById('difficultySelect').value;
  s.circleMin = difficultyMap[s.difficulty].min;
  s.circleMax = difficultyMap[s.difficulty].max;
  s.displayTime = parseFloat(document.getElementById('displayTimeSelect').value);
  s.gameMode = document.getElementById('gameMode').value;
  s.sound = document.getElementById('soundOnOff').value === 'on';
}

export function nextQuestion() {
  state.next();
  if (state.currentQuestion > TOTAL_QUESTIONS) {
    showResult();
    return;
  }
  updateProgress();
  renderCountdown(3, () => renderShapes());
}

function renderCountdown(sec, cb) {
  const el = document.getElementById('countdown');
  let c = sec;
  el.textContent = c;
  const timer = setInterval(() => {
    c -= 1;
    if (c <= 0) {
      clearInterval(timer);
      el.textContent = '';
      cb();
    } else {
      el.textContent = c;
    }
  }, 1000);
}

function renderShapes() {
  const container = document.getElementById('circle-container');
  clearChildren(container);
  // 丸の数をランダム決定（前回と同じ数を避ける）
  let count;
  do {
    count = getRandomInt(state.settings.circleMin, state.settings.circleMax);
  } while (count === state.previousCircleCount && state.settings.circleMax - state.settings.circleMin > 0);
  state.previousCircleCount = count;

  // 図形配置データ生成
  const shapes = [];
  const { clientWidth: w, clientHeight: h } = container;
  for (let i = 0; i < count; i++) {
    let shape = createShapeObject(w, h, 'circle');
    let attempts = 0;
    while (checkOverlap(shape, shapes) && attempts < 50) {
      shape = createShapeObject(w, h, 'circle');
      attempts++;
    }
    shapes.push(shape);
  }
  // チャレンジモード: お邪魔マーク
  if (state.settings.gameMode === 'distraction') {
    const distractionCount = Math.floor(count / 2) + getRandomInt(1, 3);
    for (let i = 0; i < distractionCount; i++) {
      const type = shapeTypes[getRandomInt(1, shapeTypes.length - 1)];
      let shape = createShapeObject(w, h, type);
      let attempts = 0;
      while (checkOverlap(shape, shapes) && attempts < 50) {
        shape = createShapeObject(w, h, type);
        attempts++;
      }
      shapes.push(shape);
    }
  }
  state.currentShapes = shapes;

  // DOMに図形を表示
  shapes.forEach(shape => {
    const div = document.createElement('div');
    div.classList.add('shape', shape.type);
    div.style.cssText = `width:${shape.size}px;height:${shape.size}px;left:${shape.x}px;top:${shape.y}px;background:${shape.color};`;
    container.appendChild(div);
  });

  // 一定時間後に図形を消し、選択肢を表示
  setTimeout(() => {
    clearChildren(container);
    document.getElementById('question-prompt').textContent = 'まるは いくつ あった？';
    renderChoices(count);
  }, state.settings.displayTime * 1000);
}

export function checkAnswer(selected, correctAnswer, btnElem) {
  const feedbackEl = document.getElementById('feedback');
  if (selected === correctAnswer) {
    playSound(true, state.settings.sound);
    feedbackEl.textContent = 'せいかい！';
    feedbackEl.className = 'feedback-correct';
    if (!state.questionMissed) {
      state.correctCount++;
      state.consecutiveCorrect++;
      if (state.consecutiveCorrect >= 2) {
        createConfetti();
      }
    }
    btnElem.classList.add('correct-animate');
    reShowShapesOnCorrect();
  } else {
    playSound(false, state.settings.sound);
    feedbackEl.textContent = 'ちがうよ…もういちど！';
    feedbackEl.className = 'feedback-incorrect';
    btnElem.classList.add('incorrect-animate');
    state.questionMissed = true;
    state.consecutiveCorrect = 0;
    setTimeout(() => btnElem.classList.remove('incorrect-animate'), 300);
  }
}

function reShowShapesOnCorrect() {
  const container = document.getElementById('circle-container');
  clearChildren(container);
  state.currentShapes.forEach(shape => {
    const div = document.createElement('div');
    div.classList.add('shape', shape.type);
    div.style.cssText = `width:${shape.size}px;height:${shape.size}px;left:${shape.x}px;top:${shape.y}px;background:${shape.color};`;
    container.appendChild(div);
  });
  // 丸数表示
  const countDisplay = createElem('div', { class: 'count-display' });
  countDisplay.textContent = `まるの数: ${state.currentShapes.filter(s => s.type==='circle').length}`;
  container.appendChild(countDisplay);
  // 次へボタン
  const nextBtn = createElem('button', { id: 'nextQuestionBtn', class: 'btn' });
  nextBtn.textContent = '次の問題へ';
  nextBtn.onclick = () => {
    nextBtn.remove();
    nextQuestion();
  };
  document.getElementById('control-panel').appendChild(nextBtn);
}

export function showResult() {
  showScreen('screen-result');
  renderResult(state.correctCount);
}
```#### 11. js/ui.js
```js
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
