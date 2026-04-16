const WIN_SCORE = 5;

const PLAYERS = [
  { id: 'fox', icon: '🦊', label: 'Fox' },
  { id: 'panda', icon: '🐼', label: 'Panda' },
  { id: 'frog', icon: '🐸', label: 'Frog' },
  { id: 'octo', icon: '🐙', label: 'Octo' }
];

const state = {
  phase: 'idle', // idle | waiting | go | roundOver | gameOver
  scores: Object.fromEntries(PLAYERS.map((p) => [p.id, 0])),
  round: 0,
  goTime: 0,
  timerId: null,
  history: [],
  tones: Object.fromEntries(PLAYERS.map((p) => [p.id, 'red']))
};

const ui = {
  status: document.getElementById('status'),
  scoreBoard: document.getElementById('scoreBoard'),
  history: document.getElementById('history'),
  arena: document.getElementById('arena'),
  startBtn: document.getElementById('startBtn'),
  nextBtn: document.getElementById('nextBtn'),
  resetBtn: document.getElementById('resetBtn')
};

function clearTimer() {
  if (state.timerId) {
    clearTimeout(state.timerId);
    state.timerId = null;
  }
}

function setStatus(text) {
  ui.status.textContent = text;
}

function renderScores() {
  ui.scoreBoard.innerHTML = PLAYERS.map((p) => `
    <article class="score-card">
      <div>${p.icon}</div>
      <div class="name">${p.label}</div>
      <strong>${state.scores[p.id]}</strong>
    </article>
  `).join('');
}

function renderHistory() {
  ui.history.innerHTML = '';
  if (state.history.length === 0) {
    const li = document.createElement('li');
    li.className = 'empty';
    li.textContent = '履歴なし';
    ui.history.appendChild(li);
    return;
  }

  state.history.forEach((line) => {
    const li = document.createElement('li');
    li.textContent = line;
    ui.history.appendChild(li);
  });
  ui.history.scrollTop = ui.history.scrollHeight;
}

function zoneLabel(player) {
  return `${player.icon} ${player.label}`;
}

function renderArena() {
  ui.arena.innerHTML = '';
  PLAYERS.forEach((player) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `tap-zone state-${state.tones[player.id]}`;
    button.textContent = zoneLabel(player);
    button.addEventListener('pointerdown', (event) => {
      event.preventDefault();
      handlePress(player.id);
    });
    button.addEventListener('contextmenu', (event) => event.preventDefault());
    ui.arena.appendChild(button);
  });
}

function renderControls() {
  ui.startBtn.disabled = !(state.phase === 'idle' || state.phase === 'gameOver');
  ui.nextBtn.disabled = state.phase !== 'roundOver';
}

function render() {
  renderScores();
  renderHistory();
  renderArena();
  renderControls();
}

function applyToneAll(tone) {
  PLAYERS.forEach((p) => {
    state.tones[p.id] = tone;
  });
}

function resetRoundTones() {
  applyToneAll('red');
}

function getPlayer(id) {
  return PLAYERS.find((p) => p.id === id);
}

function champions() {
  const max = Math.max(...PLAYERS.map((p) => state.scores[p.id]));
  if (max < WIN_SCORE) return [];
  return PLAYERS.filter((p) => state.scores[p.id] === max);
}

function finishRound() {
  const winners = champions();
  if (winners.length > 0) {
    state.phase = 'gameOver';
    const icons = winners.map((p) => p.icon).join(' & ');
    setStatus(`${icons} 優勝！`);
  } else {
    state.phase = 'roundOver';
  }
  render();
}

function startRound() {
  clearTimer();
  state.round += 1;
  state.phase = 'waiting';
  resetRoundTones();
  setStatus(`R${state.round} 準備...`);
  render();

  const wait = Math.floor(Math.random() * 2500) + 1200;
  state.timerId = setTimeout(() => {
    state.phase = 'go';
    state.goTime = performance.now();
    applyToneAll('green');
    setStatus('タップ！');
    render();
  }, wait);
}

function record(text) {
  state.history.push(`R${state.round}: ${text}`);
}

function resolveFoul(foulerId) {
  clearTimer();
  state.phase = 'roundOver';

  PLAYERS.forEach((p) => {
    if (p.id === foulerId) {
      state.tones[p.id] = 'orange';
      return;
    }
    state.scores[p.id] += 1;
    state.tones[p.id] = 'green';
  });

  const fouler = getPlayer(foulerId);
  setStatus(`${fouler.icon} フライング！ 他3人+1`);
  record(`${fouler.icon} がフライング、他3人に加点`);
  finishRound();
}

function resolveReaction(winnerId, reaction) {
  clearTimer();
  state.phase = 'roundOver';

  PLAYERS.forEach((p) => {
    state.tones[p.id] = p.id === winnerId ? 'green' : 'gray';
  });
  state.scores[winnerId] += 1;

  const winner = getPlayer(winnerId);
  setStatus(`${winner.icon} 勝利 ${reaction}ms`);
  record(`${winner.icon} が ${reaction}ms で先取`);
  finishRound();
}

function handlePress(playerId) {
  if (state.phase === 'idle' || state.phase === 'roundOver' || state.phase === 'gameOver') {
    return;
  }

  if (state.phase === 'waiting') {
    resolveFoul(playerId);
    return;
  }

  if (state.phase !== 'go') return;

  const reaction = Math.max(1, Math.round(performance.now() - state.goTime));
  resolveReaction(playerId, reaction);
}

function resetGame() {
  clearTimer();
  state.phase = 'idle';
  state.round = 0;
  state.history = [];
  PLAYERS.forEach((p) => {
    state.scores[p.id] = 0;
  });
  resetRoundTones();
  setStatus('スタートで開始');
  render();
}

ui.startBtn.addEventListener('click', () => {
  if (state.phase === 'idle' || state.phase === 'gameOver') {
    if (state.phase === 'gameOver') {
      PLAYERS.forEach((p) => {
        state.scores[p.id] = 0;
      });
      state.round = 0;
      state.history = [];
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

resetGame();
