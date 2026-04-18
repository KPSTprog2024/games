const ROWS = 4;
const COLS = 3;
const TOTAL_CELLS = ROWS * COLS;
const MAX_ROUND = 8;
const BASE_DISPLAY_MS = 800;
const DISPLAY_RATIO = 0.7;
const MIN_DISPLAY_MS = 10;
const HIDE_BETWEEN_MS = 260;
const MIN_SHOW_COUNT = 6;
const MAX_SHOW_COUNT = 15;

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
  grid: document.getElementById("grid"),
  actionBtn: document.getElementById("action-btn"),
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
    btn.textContent = "";
    btn.disabled = true;
    btn.addEventListener("click", onAnswerClick);
    elements.grid.appendChild(btn);
    cells.push(btn);
  }
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
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
  cell.textContent = "";
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

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function updateButtonStates() {
  const canRunRound = !state.isAnimating && !state.isAnswering && state.round <= MAX_ROUND;
  elements.actionBtn.disabled = !canRunRound;
  elements.actionBtn.textContent = state.round === 1 ? "開始" : "次のラウンド";

  cells.forEach((cell) => {
    cell.disabled = !state.isAnswering;
  });
}

async function runRound() {
  state.isAnimating = true;
  state.isAnswering = false;
  clearHighlights();
  updateButtonStates();

  const showCount = randomInt(MIN_SHOW_COUNT, MAX_SHOW_COUNT);
  let current = Math.floor(Math.random() * TOTAL_CELLS);

  for (let show = 0; show < showCount; show += 1) {
    showCat(current);
    await wait(state.currentDisplayMs);
    clearCat();
    if (show < showCount - 1) {
      await wait(HIDE_BETWEEN_MS);
      current = randomNextIndex(current);
    }
  }

  state.finalCellIndex = current;

  state.isAnimating = false;
  state.isAnswering = true;
  updateButtonStates();
}

function completeRound(correct) {
  state.isAnswering = false;

  if (correct) {
    state.score += 1;
  }

  if (state.round >= MAX_ROUND) {
    elements.actionBtn.disabled = true;
  } else {
    state.round += 1;
    state.currentDisplayMs = Math.max(
      MIN_DISPLAY_MS,
      truncateToTwoDecimals(state.currentDisplayMs * DISPLAY_RATIO),
    );
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
  syncStatus();
  updateButtonStates();
}

elements.actionBtn.addEventListener("click", async () => {
  if (state.round > MAX_ROUND || state.isAnimating || state.isAnswering) {
    return;
  }
  await runRound();
});

elements.resetBtn.addEventListener("click", resetGame);

createGrid();
resetGame();
