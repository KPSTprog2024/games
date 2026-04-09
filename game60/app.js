const WIN_SCORE = 3;

const state = {
  scoreTop: 0,
  scoreBottom: 0,
  phase: 'idle', // idle | waiting | go | roundOver | gameOver
  goTime: 0,
  timeoutId: null,
  round: 0,
  toneTop: 'red',
  toneBottom: 'red'
};

const ui = {
  topBtn: document.getElementById('topBtn'),
  bottomBtn: document.getElementById('bottomBtn'),
  status: document.getElementById('status'),
  scoreTop: document.getElementById('scoreTop'),
  scoreBottom: document.getElementById('scoreBottom'),
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

function render() {
  ui.scoreTop.textContent = String(state.scoreTop);
  ui.scoreBottom.textContent = String(state.scoreBottom);

  applyTone(ui.topBtn, state.toneTop);
  applyTone(ui.bottomBtn, state.toneBottom);

  ui.nextBtn.disabled = !(state.phase === 'roundOver' || state.phase === 'idle');
}

function setStatus(statusText) {
  ui.status.textContent = statusText;
}

function startRound() {
  clearTimer();
  state.round += 1;
  state.phase = 'waiting';
  state.toneTop = 'red';
  state.toneBottom = 'red';
  setStatus(`第${state.round}ラウンド：まだ押さないで！`);
  render();

  const wait = Math.floor(Math.random() * 2500) + 1500;
  state.timeoutId = setTimeout(() => {
    state.phase = 'go';
    state.goTime = performance.now();
    state.toneTop = 'green';
    state.toneBottom = 'green';
    setStatus('タップ！早く押した方に1点');
    render();
  }, wait);
}

function endRound(winner, cause = 'react', actor = null) {
  clearTimer();

  if (winner === 'top') state.scoreTop += 1;
  if (winner === 'bottom') state.scoreBottom += 1;

  if (cause === 'react') {
    state.toneTop = winner === 'top' ? 'green' : 'gray';
    state.toneBottom = winner === 'bottom' ? 'green' : 'gray';
  } else if (cause === 'foul') {
    state.toneTop = actor === 'top' ? 'orange' : 'green';
    state.toneBottom = actor === 'bottom' ? 'orange' : 'green';
  }

  const winTop = state.scoreTop >= WIN_SCORE;
  const winBottom = state.scoreBottom >= WIN_SCORE;

  if (winTop || winBottom) {
    state.phase = 'gameOver';
    const champ = winTop ? '上プレイヤー' : '下プレイヤー';
    setStatus(`ゲーム終了：${champ}の勝ち！`);
  } else {
    state.phase = 'roundOver';
    const roundWinner = winner === 'top' ? '上プレイヤー' : '下プレイヤー';
    setStatus(`${roundWinner} 1点！「次のラウンド」を押してください`);
  }

  render();
}

function handlePress(player) {
  if (state.phase === 'idle') return;

  if (state.phase === 'waiting') {
    const winner = player === 'top' ? 'bottom' : 'top';
    endRound(winner, 'foul', player);
    const fouler = player === 'top' ? '上プレイヤー' : '下プレイヤー';
    ui.status.textContent = `${fouler}のフライング！惜しかったのでオレンジ表示`;
    return;
  }

  if (state.phase !== 'go') return;

  const reaction = Math.round(performance.now() - state.goTime);
  endRound(player, 'react');
  const winnerLabel = player === 'top' ? '上プレイヤー' : '下プレイヤー';
  ui.status.textContent = `${winnerLabel}が${reaction}msで獲得！押し負けはグレー表示`;
}

function resetGame() {
  clearTimer();
  state.scoreTop = 0;
  state.scoreBottom = 0;
  state.phase = 'idle';
  state.round = 0;
  state.toneTop = 'red';
  state.toneBottom = 'red';
  setStatus('スタートを押して開始（待機色は赤 / 押せる時は緑）');
  render();
}

function bindPress(target, player) {
  const onPress = (event) => {
    event.preventDefault();
    handlePress(player);
  };

  target.addEventListener('pointerdown', onPress);
  target.addEventListener('touchstart', onPress, { passive: false });
  target.addEventListener('contextmenu', (event) => event.preventDefault());
}

ui.startBtn.addEventListener('click', () => {
  if (state.phase === 'idle' || state.phase === 'gameOver') {
    if (state.phase === 'gameOver') {
      state.scoreTop = 0;
      state.scoreBottom = 0;
      state.round = 0;
    }
    startRound();
  }
});

ui.nextBtn.addEventListener('click', () => {
  if (state.phase === 'roundOver' || state.phase === 'idle') {
    startRound();
  }
});

ui.resetBtn.addEventListener('click', resetGame);

bindPress(ui.topBtn, 'top');
bindPress(ui.bottomBtn, 'bottom');

resetGame();
