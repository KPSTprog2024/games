'use strict';

// =========================
// Constants
// =========================
const WIN_SCORE = 3;
const INPUT_GUARD_MS = 100;
const POST_DECISION_CAPTURE_MS = 100;
const COUNTDOWN_STEP_MS = 700;

const COLORS = ['red', 'blue', 'green'];
const SHAPES = ['circle', 'triangle', 'square'];

const PLAYER = {
  DIAMOND: 'diamond',
  HEART: 'heart'
};

const PLAYER_SYMBOL = {
  [PLAYER.DIAMOND]: '♦️',
  [PLAYER.HEART]: '❤️'
};

const COMBINATIONS = createCombinations();

// =========================
// State
// =========================
const state = {
  roundNumber: 0,
  scores: {
    [PLAYER.DIAMOND]: 0,
    [PLAYER.HEART]: 0
  },
  currentTopic: null,
  currentChoices: [],
  acceptingInput: false,
  roundSettled: false,
  gameEnded: false,
  reactionStartAt: 0,
  pressedAt: {
    [PLAYER.DIAMOND]: null,
    [PLAYER.HEART]: null
  },
  pressedChoiceIndex: {
    [PLAYER.DIAMOND]: null,
    [PLAYER.HEART]: null
  },
  reactionsMs: {
    [PLAYER.DIAMOND]: null,
    [PLAYER.HEART]: null
  },
  correctness: {
    [PLAYER.DIAMOND]: null,
    [PLAYER.HEART]: null
  },
  winnerOfRound: null,
  roundHistory: [],
  roundTimers: {
    guard: null,
    finish: null,
    countdown: null
  },
  isCountingDown: false
};

// =========================
// DOM refs
// =========================
const ui = {
  scoreDiamond: document.getElementById('score-diamond'),
  scoreHeart: document.getElementById('score-heart'),
  scoreDiamondCenter: document.getElementById('score-diamond-center'),
  scoreHeartCenter: document.getElementById('score-heart-center'),
  roundLabel: document.getElementById('round-label'),
  phaseBadge: document.getElementById('phase-badge'),
  topicShape: document.getElementById('topic-shape'),
  statusPanel: document.getElementById('status-panel'),
  diamondChoices: document.getElementById('choices-diamond'),
  heartChoices: document.getElementById('choices-heart'),
  choiceTemplate: document.getElementById('choice-button-template')
};

// =========================
// Init
// =========================
init();

function init() {
  startNewGame();
}

// =========================
// Core round flow
// =========================

function startNewGame() {
  clearRoundTimers();

  state.roundNumber = 0;
  state.scores[PLAYER.DIAMOND] = 0;
  state.scores[PLAYER.HEART] = 0;
  state.roundHistory = [];
  state.gameEnded = false;

  startNextRound();
}

function startNextRound() {
  clearRoundTimers();

  state.roundNumber += 1;
  state.currentTopic = randomFrom(COMBINATIONS);
  state.currentChoices = generateRoundChoices(state.currentTopic);

  state.acceptingInput = false;
  state.roundSettled = false;
  state.winnerOfRound = null;

  resetRoundInputState();

  renderScore();
  renderRoundLabel();
  renderChoices(true);
  startRoundCountdown();
}

function startRoundCountdown() {
  const countdownValues = ['3', '2', '1'];
  let index = 0;

  state.isCountingDown = true;

  const tick = () => {
    const value = countdownValues[index];
    renderCountdown(value);

    if (index === countdownValues.length - 1) {
      state.roundTimers.countdown = window.setTimeout(beginRoundInput, COUNTDOWN_STEP_MS);
      return;
    }

    index += 1;
    state.roundTimers.countdown = window.setTimeout(tick, COUNTDOWN_STEP_MS);
  };

  tick();
}

function beginRoundInput() {
  state.roundTimers.countdown = null;
  state.isCountingDown = false;

  renderTopic();
  renderChoices(false);

  state.roundTimers.guard = window.setTimeout(() => {
    state.acceptingInput = true;
    state.reactionStartAt = performance.now();
    renderStatusWaiting();
  }, INPUT_GUARD_MS);
}

function generateRoundChoices(topic) {
  const correctPool = COMBINATIONS.filter(
    (item) => item.color !== topic.color && item.shape !== topic.shape
  );

  const wrongPool = COMBINATIONS.filter(
    (item) => !(item.color !== topic.color && item.shape !== topic.shape)
  );

  const correct = randomFrom(correctPool);
  const wrong = randomFrom(wrongPool);

  const twoChoices = [
    { ...correct, isCorrect: true, key: makeKey(correct) },
    { ...wrong, isCorrect: false, key: makeKey(wrong) }
  ];

  return Math.random() < 0.5 ? twoChoices : [twoChoices[1], twoChoices[0]];
}

function handlePlayerPress(player, choiceIndex) {
  if (state.gameEnded || !state.acceptingInput) {
    return;
  }

  const now = performance.now();

  if (state.pressedAt[player] !== null) {
    return;
  }

  state.pressedAt[player] = now;
  state.pressedChoiceIndex[player] = choiceIndex;
  state.reactionsMs[player] = Math.max(0, Math.round(now - state.reactionStartAt));

  const selected = state.currentChoices[choiceIndex];
  state.correctness[player] = selected.isCorrect;

  markPressedVisual(player, choiceIndex);
  if (!selected.isCorrect) {
    triggerMistapFeedback(player, choiceIndex);
  }

  if (!state.roundSettled) {
    settleRoundByFirstInput(player, selected.isCorrect);
  }
}

function settleRoundByFirstInput(firstPlayer, firstIsCorrect) {
  state.roundSettled = true;

  const other = firstPlayer === PLAYER.DIAMOND ? PLAYER.HEART : PLAYER.DIAMOND;
  state.winnerOfRound = firstIsCorrect ? firstPlayer : other;

  state.scores[state.winnerOfRound] += 1;

  state.roundTimers.finish = window.setTimeout(() => {
    finishRound();
  }, POST_DECISION_CAPTURE_MS);

  renderStatusRoundResult();
}

function finishRound() {
  state.acceptingInput = false;

  saveRoundHistory();

  if (state.scores[PLAYER.DIAMOND] >= WIN_SCORE || state.scores[PLAYER.HEART] >= WIN_SCORE) {
    state.gameEnded = true;
    renderGameFinished();
    return;
  }

  renderStatusRoundResult(true);
}

function saveRoundHistory() {
  state.roundHistory.push({
    round: state.roundNumber,
    winner: state.winnerOfRound,
    diamondReaction: state.reactionsMs[PLAYER.DIAMOND],
    heartReaction: state.reactionsMs[PLAYER.HEART],
    diamondCorrect: state.correctness[PLAYER.DIAMOND],
    heartCorrect: state.correctness[PLAYER.HEART]
  });
}

function resetRoundInputState() {
  state.pressedAt[PLAYER.DIAMOND] = null;
  state.pressedAt[PLAYER.HEART] = null;
  state.pressedChoiceIndex[PLAYER.DIAMOND] = null;
  state.pressedChoiceIndex[PLAYER.HEART] = null;
  state.reactionsMs[PLAYER.DIAMOND] = null;
  state.reactionsMs[PLAYER.HEART] = null;
  state.correctness[PLAYER.DIAMOND] = null;
  state.correctness[PLAYER.HEART] = null;
}

// =========================
// Render
// =========================
function renderAll() {
  renderScore();
  renderRoundLabel();
  renderTopic();
  renderChoices();
  renderStatusWaiting();
}

function renderScore() {
  ui.scoreDiamond.textContent = state.scores[PLAYER.DIAMOND];
  ui.scoreHeart.textContent = state.scores[PLAYER.HEART];
  if (ui.scoreDiamondCenter && ui.scoreHeartCenter) {
    ui.scoreDiamondCenter.textContent = state.scores[PLAYER.DIAMOND];
    ui.scoreHeartCenter.textContent = state.scores[PLAYER.HEART];
  }
}

function renderRoundLabel() {
  ui.roundLabel.textContent = `Round ${state.roundNumber}`;
}

function renderTopic() {
  ui.topicShape.innerHTML = '';
  ui.topicShape.appendChild(buildShapeElement(state.currentTopic));
}

function renderChoices(hiddenUntilStart = false) {
  renderPlayerChoices(ui.diamondChoices, PLAYER.DIAMOND, hiddenUntilStart);
  renderPlayerChoices(ui.heartChoices, PLAYER.HEART, hiddenUntilStart);
}

function renderPlayerChoices(container, player, hiddenUntilStart) {
  container.innerHTML = '';
  container.classList.remove('choices--winner', 'choices--loser');

  state.currentChoices.forEach((choice, index) => {
    const fragment = ui.choiceTemplate.content.cloneNode(true);
    const btn = fragment.querySelector('.choice-btn');

    btn.dataset.player = player;
    btn.dataset.index = String(index);
    btn.setAttribute('aria-label', `${PLAYER_SYMBOL[player]} の候補 ${index + 1}`);
    if (hiddenUntilStart) {
      btn.setAttribute('aria-label', `${PLAYER_SYMBOL[player]} の候補（カウントダウン中）`);
    } else {
      btn.appendChild(buildShapeElement(choice));
    }

    btn.addEventListener('click', () => handlePlayerPress(player, index));

    container.appendChild(fragment);
  });
}


function renderCountdown(value) {
  renderPhase('countdown');
  ui.topicShape.innerHTML = `<p class="countdown-number" aria-label="カウントダウン ${value}">${value}</p>`;
  ui.statusPanel.innerHTML = `
    <p class="status-title">まもなく開始</p>
    <div>${value}...</div>
    <p class="status-hint">合図が出るまでタップは無効です</p>
  `;
}

function renderStatusWaiting() {
  if (state.roundSettled || state.gameEnded || state.isCountingDown) {
    return;
  }

  renderPhase('ready');
  ui.statusPanel.innerHTML = `
    <p class="status-title">いまタップOK！ お題と違う「色」かつ違う「図形」を押す！</p>
    <div>先に3点で勝利</div>
    <p class="status-hint">両プレイヤーとも自分側の2択だけを押してください</p>
  `;
}

function renderStatusRoundResult(showNextButton = false) {
  renderPhase('result');
  const diamondTime = formatReaction(
    state.reactionsMs[PLAYER.DIAMOND],
    state.correctness[PLAYER.DIAMOND]
  );
  const heartTime = formatReaction(state.reactionsMs[PLAYER.HEART], state.correctness[PLAYER.HEART]);

  const winnerLabel = state.winnerOfRound ? PLAYER_SYMBOL[state.winnerOfRound] : '—';
  const reasonText = buildRoundReasonText();

  ui.statusPanel.innerHTML = `
    <p class="status-title">ラウンド勝者: ${winnerLabel}</p>
    <p class="status-reason">${reasonText}</p>
    <div class="result-grid">
      <div>♦️ ${diamondTime} / ${formatCorrectness(state.correctness[PLAYER.DIAMOND])}</div>
      <div>❤️ ${heartTime} / ${formatCorrectness(state.correctness[PLAYER.HEART])}</div>
    </div>
    ${
      showNextButton
        ? `<button class="control-btn" id="next-round-btn" type="button">次へ</button>
           <p class="status-hint">内容を確認したら「次へ」を押してください</p>`
        : '<div>判定中...</div>'
    }
  `;

  paintChoiceFeedback();

  if (showNextButton) {
    const nextBtn = document.getElementById('next-round-btn');
    nextBtn.addEventListener(
      'click',
      () => {
        startNextRound();
      },
      { once: true }
    );
  }
}

function renderGameFinished() {
  renderPhase('result', 'ゲーム終了');
  renderScore();
  const winner =
    state.scores[PLAYER.DIAMOND] > state.scores[PLAYER.HEART] ? PLAYER.DIAMOND : PLAYER.HEART;

  const historyItems = state.roundHistory
    .slice(-3)
    .map((row) => {
      return `<li>R${row.round}: ${PLAYER_SYMBOL[row.winner]} / ♦️ ${formatReaction(
        row.diamondReaction,
        row.diamondCorrect
      )} / ❤️ ${formatReaction(row.heartReaction, row.heartCorrect)}</li>`;
    })
    .join('');

  ui.statusPanel.innerHTML = `
    <p class="status-title">ゲーム勝者: ${PLAYER_SYMBOL[winner]}</p>
    <div>最終スコア: ♦️ ${state.scores[PLAYER.DIAMOND]} - ❤️ ${state.scores[PLAYER.HEART]}</div>
    <p class="status-hint">履歴: 全${state.roundHistory.length}ラウンド（最新3件）</p>
    <ul class="history history--compact">${historyItems}</ul>
    <div class="control-stack">
      <button class="control-btn" id="restart-btn" type="button">もう一度</button>
      <a class="control-btn control-btn--secondary" href="./index.html">トップへ戻る</a>
    </div>
  `;

  paintChoiceFeedback();

  const restartBtn = document.getElementById('restart-btn');
  restartBtn.addEventListener('click', startNewGame, { once: true });
}

function paintChoiceFeedback() {
  [ui.diamondChoices, ui.heartChoices].forEach((container, idx) => {
    const player = idx === 0 ? PLAYER.DIAMOND : PLAYER.HEART;
    const buttons = container.querySelectorAll('.choice-btn');
    const isRoundWinner = player === state.winnerOfRound;
    const pressedIndex = pressedChoiceIndex(player);

    container.classList.toggle('choices--winner', isRoundWinner);
    container.classList.toggle('choices--loser', !isRoundWinner);

    buttons.forEach((btn, index) => {
      const isCorrect = state.currentChoices[index].isCorrect;
      btn.classList.toggle('is-correct', isRoundWinner && isCorrect);
      btn.classList.toggle('is-correct-muted', !isRoundWinner && isCorrect);
      btn.classList.toggle('is-muted', !isRoundWinner);
      const pressed = pressedIndex !== null && Number(btn.dataset.index) === pressedIndex;
      btn.classList.toggle('is-pressed', pressed);
      btn.classList.toggle('is-wrong', isRoundWinner && pressed && state.correctness[player] === false);
    });
  });
}

function markPressedVisual(player, choiceIndex) {
  const container = player === PLAYER.DIAMOND ? ui.diamondChoices : ui.heartChoices;
  const button = container.querySelector(`.choice-btn[data-index="${choiceIndex}"]`);

  if (button) {
    button.classList.add('is-pressed');
  }
}

function triggerMistapFeedback(player, choiceIndex) {
  const container = player === PLAYER.DIAMOND ? ui.diamondChoices : ui.heartChoices;
  const button = container.querySelector(`.choice-btn[data-index="${choiceIndex}"]`);

  if (!button) {
    return;
  }

  button.classList.add('is-mistake');
  window.setTimeout(() => {
    button.classList.remove('is-mistake');
  }, 260);

  if ('vibrate' in navigator) {
    navigator.vibrate(20);
  }
}

function pressedChoiceIndex(player) {
  return state.pressedChoiceIndex[player];
}

function renderPhase(phase, customLabel = null) {
  if (!ui.phaseBadge) {
    return;
  }

  ui.phaseBadge.classList.remove('phase-badge--countdown', 'phase-badge--ready', 'phase-badge--result');

  if (phase === 'ready') {
    ui.phaseBadge.classList.add('phase-badge--ready');
    ui.phaseBadge.textContent = customLabel || '入力受付中';
    return;
  }

  if (phase === 'result') {
    ui.phaseBadge.classList.add('phase-badge--result');
    ui.phaseBadge.textContent = customLabel || '判定表示中';
    return;
  }

  ui.phaseBadge.classList.add('phase-badge--countdown');
  ui.phaseBadge.textContent = customLabel || '準備中';
}

function buildRoundReasonText() {
  const firstPlayer =
    state.pressedAt[PLAYER.DIAMOND] !== null && state.pressedAt[PLAYER.HEART] !== null
      ? state.pressedAt[PLAYER.DIAMOND] <= state.pressedAt[PLAYER.HEART]
        ? PLAYER.DIAMOND
        : PLAYER.HEART
      : state.pressedAt[PLAYER.DIAMOND] !== null
        ? PLAYER.DIAMOND
        : state.pressedAt[PLAYER.HEART] !== null
          ? PLAYER.HEART
          : null;

  if (!firstPlayer) {
    return '入力が成立しなかったため、勝敗理由を判定できませんでした。';
  }

  const firstCorrect = state.correctness[firstPlayer];
  const firstPlayerLabel = PLAYER_SYMBOL[firstPlayer];
  const loser = firstPlayer === PLAYER.DIAMOND ? PLAYER.HEART : PLAYER.DIAMOND;
  const loserLabel = PLAYER_SYMBOL[loser];

  if (firstCorrect) {
    return `${firstPlayerLabel} が最初に正解をタップしたため勝利。`;
  }

  return `${firstPlayerLabel} が最初に不正解をタップしたため、${loserLabel} の勝利。`;
}

// =========================
// Utilities
// =========================
function createCombinations() {
  const result = [];

  COLORS.forEach((color) => {
    SHAPES.forEach((shape) => {
      result.push({ color, shape });
    });
  });

  return result;
}

function buildShapeElement({ color, shape }) {
  const shapeEl = document.createElement('span');
  shapeEl.className = `shape color-${color} ${shape}`;
  return shapeEl;
}

function randomFrom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function makeKey(item) {
  return `${item.color}-${item.shape}`;
}

function formatReaction(ms, isCorrect) {
  if (ms === null) {
    return '—';
  }

  return isCorrect === false ? `✕ ${ms}ms` : `${ms}ms`;
}

function formatCorrectness(correctness) {
  if (correctness === null) {
    return '—';
  }
  return correctness ? '○' : '✕';
}

function clearRoundTimers() {
  if (state.roundTimers.guard !== null) {
    window.clearTimeout(state.roundTimers.guard);
    state.roundTimers.guard = null;
  }

  if (state.roundTimers.finish !== null) {
    window.clearTimeout(state.roundTimers.finish);
    state.roundTimers.finish = null;
  }

  if (state.roundTimers.countdown !== null) {
    window.clearTimeout(state.roundTimers.countdown);
    state.roundTimers.countdown = null;
  }
}
