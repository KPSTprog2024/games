const WIN_SCORE = 3;

const state = {
  scoreTop: 0,
  scoreBottom: 0,
  phase: 'idle', // idle | waiting | go | roundOver | gameOver
  goTime: 0,
  timeoutId: null,
  round: 0
};

const ui = {
  battleArea: document.getElementById('battleArea'),
  topBtn: document.getElementById('topBtn'),
  bottomBtn: document.getElementById('bottomBtn'),
  overlay: document.getElementById('overlay'),
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

function render() {
  ui.scoreTop.textContent = String(state.scoreTop);
  ui.scoreBottom.textContent = String(state.scoreBottom);

  ui.battleArea.classList.remove('waiting', 'go', 'finished');
  if (state.phase === 'waiting') ui.battleArea.classList.add('waiting');
  if (state.phase === 'go') ui.battleArea.classList.add('go');
  if (state.phase === 'gameOver') ui.battleArea.classList.add('finished');

  ui.nextBtn.disabled = !(state.phase === 'roundOver' || state.phase === 'idle');
}

function setMessage(overlayText, statusText) {
  ui.overlay.textContent = overlayText;
  ui.status.textContent = statusText;
}

function startRound() {
  clearTimer();
  state.round += 1;
  state.phase = 'waiting';
  setMessage('まだ押さないで！', `第${state.round}ラウンド 準備中`);
  render();

  const wait = Math.floor(Math.random() * 2500) + 1500;
  state.timeoutId = setTimeout(() => {
    state.phase = 'go';
    state.goTime = performance.now();
    setMessage('タップ！', '早く押した方に1点');
    render();
  }, wait);
}

function endRound(winner) {
  clearTimer();

  if (winner === 'top') state.scoreTop += 1;
  if (winner === 'bottom') state.scoreBottom += 1;

  const winTop = state.scoreTop >= WIN_SCORE;
  const winBottom = state.scoreBottom >= WIN_SCORE;

  if (winTop || winBottom) {
    state.phase = 'gameOver';
    const champ = winTop ? '上プレイヤー' : '下プレイヤー';
    setMessage('ゲーム終了', `${champ}の勝ち！`);
  } else {
    state.phase = 'roundOver';
    const roundWinner = winner === 'top' ? '上プレイヤー' : '下プレイヤー';
    setMessage(`${roundWinner} 1点！`, '次のラウンドへ進んでください');
  }

  render();
}

function handlePress(player) {
  if (state.phase === 'idle') return;

  if (state.phase === 'waiting') {
    // フライングは相手に1点
    const winner = player === 'top' ? 'bottom' : 'top';
    endRound(winner);
    const fouler = player === 'top' ? '上プレイヤー' : '下プレイヤー';
    ui.status.textContent = `${fouler}のフライング！相手に1点`;
    return;
  }

  if (state.phase !== 'go') return;

  const reaction = Math.round(performance.now() - state.goTime);
  endRound(player);
  const winnerLabel = player === 'top' ? '上プレイヤー' : '下プレイヤー';
  ui.status.textContent = `${winnerLabel}が${reaction}msで獲得！`;
}

function resetGame() {
  clearTimer();
  state.scoreTop = 0;
  state.scoreBottom = 0;
  state.phase = 'idle';
  state.round = 0;
  setMessage('待機中…', 'スタートを押して開始');
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
