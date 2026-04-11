const WIN_SCORE = 3;

const PLAYER = {
  apple: '🍎',
  banana: '🍌'
};

const state = {
  score: { apple: 0, banana: 0 },
  phase: 'idle', // idle | waiting | go | roundOver | gameOver
  goTime: 0,
  timeoutId: null,
  round: 0,
  toneTop: 'red',
  toneBottom: 'red',
  topPlayer: 'banana',
  bottomPlayer: 'apple',
  history: []
};

const ui = {
  topBtn: document.getElementById('topBtn'),
  bottomBtn: document.getElementById('bottomBtn'),
  status: document.getElementById('status'),
  scoreApple: document.getElementById('scoreApple'),
  scoreBanana: document.getElementById('scoreBanana'),
  positionHint: document.getElementById('positionHint'),
  historyList: document.getElementById('historyList'),
  introPanel: document.getElementById('introPanel'),
  startBtn: document.getElementById('startBtn'),
  nextBtn: document.getElementById('nextBtn'),
  resetBtn: document.getElementById('resetBtn')
};

function clearTimer() {
  if (state.timeoutId) {
    clearTimeout(state.timeoutId);
    state.timeoutId = null;
  }
}

function applyTone(button, tone) {
  button.classList.remove('state-red', 'state-green', 'state-orange', 'state-gray');
  button.classList.add(`state-${tone}`);
}

function playerIcon(key) {
  return PLAYER[key];
}

function formatMs(value) {
  return Number.isFinite(value) ? `${value}ms` : '--';
}

function updateHistory() {
  ui.historyList.innerHTML = '';

  if (state.history.length === 0) {
    const li = document.createElement('li');
    li.className = 'empty';
    li.textContent = '履歴なし';
    ui.historyList.appendChild(li);
    return;
  }

  state.history.forEach((item) => {
    const li = document.createElement('li');
    const winner = item.winner ? playerIcon(item.winner) : 'なし';
    const detail = `R${item.round} 🍎 ${item.apple} / 🍌 ${item.banana} → ${winner}`;
    li.textContent = detail;
    ui.historyList.appendChild(li);
  });

  ui.historyList.scrollTop = ui.historyList.scrollHeight;
}

function setStatus(statusText) {
  ui.status.textContent = statusText;
}

function setPhaseUi() {
  const isIdle = state.phase === 'idle';
  const isRoundOver = state.phase === 'roundOver';
  const isGameOver = state.phase === 'gameOver';

  ui.introPanel.classList.toggle('hidden', !isIdle);
  ui.startBtn.classList.toggle('hidden', !isIdle && !isGameOver);
  ui.nextBtn.classList.toggle('hidden', !isRoundOver);
  ui.nextBtn.disabled = !isRoundOver;
}

function render() {
  ui.scoreApple.textContent = String(state.score.apple);
  ui.scoreBanana.textContent = String(state.score.banana);
  ui.positionHint.textContent = `上: ${playerIcon(state.topPlayer)} / 下: ${playerIcon(state.bottomPlayer)}`;

  applyTone(ui.topBtn, state.toneTop);
  applyTone(ui.bottomBtn, state.toneBottom);
  updateHistory();
  setPhaseUi();
}

function startRound() {
  clearTimer();
  state.round += 1;
  state.phase = 'waiting';
  state.toneTop = 'red';
  state.toneBottom = 'red';
  setStatus(`R${state.round} 準備`);
  render();

  const wait = Math.floor(Math.random() * 2500) + 1500;
  state.timeoutId = setTimeout(() => {
    state.phase = 'go';
    state.goTime = performance.now();
    state.toneTop = 'green';
    state.toneBottom = 'green';
    setStatus('タップ！');
    render();
  }, wait);
}

function addHistory(entry) {
  state.history.push({
    round: state.round,
    apple: entry.apple,
    banana: entry.banana,
    winner: entry.winner
  });
}

function endRound(winner, cause = 'react', actor = null, reaction = null) {
  clearTimer();

  if (winner) {
    state.score[winner] += 1;
  }

  if (cause === 'react') {
    state.toneTop = state.topPlayer === winner ? 'green' : 'gray';
    state.toneBottom = state.bottomPlayer === winner ? 'green' : 'gray';

    addHistory({
      apple: winner === 'apple' ? formatMs(reaction) : '--',
      banana: winner === 'banana' ? formatMs(reaction) : '--',
      winner
    });

    setStatus(`${playerIcon(winner)}の勝ち！ ${reaction}ms`);
  } else {
    const foulerKey = actor === 'top' ? state.topPlayer : state.bottomPlayer;
    const winnerKey = winner;

    state.toneTop = actor === 'top' ? 'orange' : 'green';
    state.toneBottom = actor === 'bottom' ? 'orange' : 'green';

    addHistory({
      apple: foulerKey === 'apple' ? 'false start' : '--',
      banana: foulerKey === 'banana' ? 'false start' : '--',
      winner: winnerKey
    });

    setStatus('フライング');
  }

  const winApple = state.score.apple >= WIN_SCORE;
  const winBanana = state.score.banana >= WIN_SCORE;

  if (winApple || winBanana) {
    state.phase = 'gameOver';
    const champ = winApple ? 'apple' : 'banana';
    setStatus(`${playerIcon(champ)}の勝ち！`);
  } else {
    state.phase = 'roundOver';
  }

  render();
}

function handlePress(position) {
  if (state.phase === 'idle' || state.phase === 'roundOver' || state.phase === 'gameOver') return;

  if (state.phase === 'waiting') {
    const winner = position === 'top' ? state.bottomPlayer : state.topPlayer;
    endRound(winner, 'foul', position);
    return;
  }

  if (state.phase !== 'go') return;

  const reaction = Math.round(performance.now() - state.goTime);
  const winner = position === 'top' ? state.topPlayer : state.bottomPlayer;
  endRound(winner, 'react', null, reaction);
}

function resetGame() {
  clearTimer();
  state.score.apple = 0;
  state.score.banana = 0;
  state.phase = 'idle';
  state.round = 0;
  state.toneTop = 'red';
  state.toneBottom = 'red';
  state.topPlayer = 'banana';
  state.bottomPlayer = 'apple';
  state.history = [];
  setStatus('スタートで開始');
  render();
}

function bindPress(target, position) {
  const onPress = (event) => {
    event.preventDefault();
    handlePress(position);
  };

  target.addEventListener('pointerdown', onPress);
  target.addEventListener('touchstart', onPress, { passive: false });
  target.addEventListener('contextmenu', (event) => event.preventDefault());
}

ui.startBtn.addEventListener('click', () => {
  if (state.phase === 'idle' || state.phase === 'gameOver') {
    if (state.phase === 'gameOver') {
      state.score.apple = 0;
      state.score.banana = 0;
      state.round = 0;
      state.history = [];
      state.topPlayer = 'banana';
      state.bottomPlayer = 'apple';
    }
    startRound();
  }
});

ui.nextBtn.addEventListener('click', () => {
  if (state.phase === 'roundOver') {
    startRound();
  }
});

ui.resetBtn.addEventListener('click', resetGame);

bindPress(ui.topBtn, 'top');
bindPress(ui.bottomBtn, 'bottom');

resetGame();
