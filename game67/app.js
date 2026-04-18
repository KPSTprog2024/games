const ROWS = 4;
const COLS = 3;
const TOTAL_CELLS = ROWS * COLS;
const MAX_ROUND = 8;
const BASE_DISPLAY_MS = 1000;
const DISPLAY_RATIO = 0.8;
const HIDE_BETWEEN_MS = 260;

const state = {
  round: 1,
  score: 0,
  isAnimating: false,
  isAnswering: false,
  currentDisplayMs: BASE_DISPLAY_MS,
  finalCellIndex: null,
  currentVisibleCellIndex: null,
};

const elements = {
  round: document.getElementById("round"),
  maxRound: document.getElementById("max-round"),
  score: document.getElementById("score"),
  displayMs: document.getElementById("display-ms"),
  message: document.getElementById("message"),
  grid: document.getElementById("grid"),
  startBtn: document.getElementById("start-btn"),
  nextBtn: document.getElementById("next-btn"),
  resetBtn: document.getElementById("reset-btn"),
};

const cells = [];

function createGrid() {
  for (let index = 0; index < TOTAL_CELLS; index += 1) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "cell";
    btn.dataset.index = String(index);
    btn.ariaLabel = `マス ${index + 1}`;
    btn.textContent = String(index + 1);
    btn.disabled = true;
    btn.addEventListener("click", onAnswerClick);
    elements.grid.appendChild(btn);
    cells.push(btn);
  }
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function setMessage(text) {
  elements.message.textContent = text;
}

function syncStatus() {
  elements.round.textContent = String(state.round);
  elements.maxRound.textContent = String(MAX_ROUND);
  elements.score.textContent = String(state.score);
  elements.displayMs.textContent = String(state.currentDisplayMs);
}

function clearHighlights() {
  cells.forEach((cell) => {
    cell.classList.remove("correct", "wrong");
  });
}

function clearCat() {
  if (state.currentVisibleCellIndex === null) {
    return;
  }
  const cell = cells[state.currentVisibleCellIndex];
  cell.textContent = String(state.currentVisibleCellIndex + 1);
  state.currentVisibleCellIndex = null;
}

function showCat(index) {
  clearCat();
  const cell = cells[index];
  cell.textContent = "🐈";
  state.currentVisibleCellIndex = index;
}

function randomNextIndex(previous) {
  let next = Math.floor(Math.random() * TOTAL_CELLS);
  while (next === previous) {
    next = Math.floor(Math.random() * TOTAL_CELLS);
  }
  return next;
}

function truncateToTwoDecimals(value) {
  return Math.floor(value * 100) / 100;
}

function updateButtonStates() {
  const canStart = !state.isAnimating && !state.isAnswering && state.round === 1;
  elements.startBtn.disabled = !canStart;

  const canNext = !state.isAnimating && !state.isAnswering && state.round > 1 && state.round <= MAX_ROUND;
  elements.nextBtn.disabled = !canNext;

  cells.forEach((cell) => {
    cell.disabled = !state.isAnswering;
  });
}

async function runRound() {
  state.isAnimating = true;
  state.isAnswering = false;
  clearHighlights();
  updateButtonStates();

  const hopCount = 2 + state.round;
  let current = Math.floor(Math.random() * TOTAL_CELLS);

  setMessage(`ラウンド ${state.round}: 猫の移動を追跡中...`);

  for (let hop = 0; hop < hopCount; hop += 1) {
    showCat(current);
    await wait(state.currentDisplayMs);
    clearCat();
    await wait(HIDE_BETWEEN_MS);
    current = randomNextIndex(current);
  }

  state.finalCellIndex = randomNextIndex(current);
  showCat(state.finalCellIndex);
  await wait(state.currentDisplayMs);
  clearCat();

  state.isAnimating = false;
  state.isAnswering = true;
  setMessage("最後に🐈がいたマス番号をクリックしてください");
  updateButtonStates();
}

function completeRound(correct) {
  state.isAnswering = false;

  if (correct) {
    state.score += 1;
    setMessage("正解！次のラウンドへ進めます。");
  } else {
    setMessage(`不正解。正しいマスは ${state.finalCellIndex + 1} でした。`);
  }

  if (state.round >= MAX_ROUND) {
    setMessage(`終了！スコアは ${state.score}/${MAX_ROUND} です。リセットで再挑戦。`);
    elements.nextBtn.disabled = true;
  } else {
    state.round += 1;
    state.currentDisplayMs = truncateToTwoDecimals(state.currentDisplayMs * DISPLAY_RATIO);
  }

  syncStatus();
  updateButtonStates();
}

function onAnswerClick(event) {
  if (!state.isAnswering) {
    return;
  }

  const selected = Number(event.currentTarget.dataset.index);
  const correct = selected === state.finalCellIndex;

  if (correct) {
    cells[selected].classList.add("correct");
  } else {
    cells[selected].classList.add("wrong");
    cells[state.finalCellIndex].classList.add("correct");
  }

  completeRound(correct);
}

function resetGame() {
  clearCat();
  clearHighlights();
  state.round = 1;
  state.score = 0;
  state.isAnimating = false;
  state.isAnswering = false;
  state.currentDisplayMs = BASE_DISPLAY_MS;
  state.finalCellIndex = null;
  setMessage("「開始」でスタート");
  syncStatus();
  updateButtonStates();
}

elements.startBtn.addEventListener("click", async () => {
  if (state.round !== 1 || state.isAnimating || state.isAnswering) {
    return;
  }
  await runRound();
});

elements.nextBtn.addEventListener("click", async () => {
  if (state.round > MAX_ROUND || state.isAnimating || state.isAnswering) {
    return;
  }
  await runRound();
});

elements.resetBtn.addEventListener("click", resetGame);

createGrid();
resetGame();
