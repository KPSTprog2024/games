const ROWS = 4;
const COLS = 3;
const TOTAL_CELLS = ROWS * COLS;
const MAX_ROUND = 25;
const BASE_DISPLAY_MS = 600;
const EARLY_ROUND_DISPLAY_RATIO = 0.8;
const LATE_ROUND_DISPLAY_RATIO = 0.9;
const MIN_DISPLAY_MS = 10;
const IN_ROUND_RATIO = 0.9;
const MIN_SHOW_COUNT = 6;
const MAX_SHOW_COUNT = 15;

const CAT_ICONS = ["🐈", "🐈‍⬛", "😺", "😻", "😽", "😹", "🙀", "🦁"];
const DISTRACTOR_ICONS = ["🐸", "🐘", "🦒"];

const state = {
  round: 1,
  score: 0,
  isAnimating: false,
  isAnswering: false,
  isDisturbanceMode: false,
  currentDisplayMs: BASE_DISPLAY_MS,
  finalCellIndex: null,
  entities: [],
  needsRetry: false,
};

const elements = {
  round: document.getElementById("round"),
  maxRound: document.getElementById("max-round"),
  score: document.getElementById("score"),
  displayMs: document.getElementById("display-ms"),
  grid: document.getElementById("grid"),
  actionBtn: document.getElementById("action-btn"),
  resetBtn: document.getElementById("reset-btn"),
  prevRoundBtn: document.getElementById("prev-round-btn"),
  nextRoundBtn: document.getElementById("next-round-btn"),
  disturbanceBtn: document.getElementById("disturbance-btn"),
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

function truncateToTwoDecimals(value) {
  return Math.floor(value * 100) / 100;
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomNextIndex(previous, usedIndices = new Set()) {
  let next = Math.floor(Math.random() * TOTAL_CELLS);
  while (next === previous || usedIndices.has(next)) {
    next = Math.floor(Math.random() * TOTAL_CELLS);
  }
  return next;
}

function pickRandomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function pickRandomUniqueItems(items, count) {
  const pool = [...items];
  const picked = [];
  while (picked.length < count && pool.length > 0) {
    const index = Math.floor(Math.random() * pool.length);
    picked.push(pool.splice(index, 1)[0]);
  }
  return picked;
}

function getRoundDisplayRatio(round) {
  return round <= 3 ? EARLY_ROUND_DISPLAY_RATIO : LATE_ROUND_DISPLAY_RATIO;
}

function computeDisplayMsForRound(round) {
  let displayMs = BASE_DISPLAY_MS;
  for (let roundNumber = 2; roundNumber <= round; roundNumber += 1) {
    displayMs = Math.max(
      MIN_DISPLAY_MS,
      truncateToTwoDecimals(displayMs * getRoundDisplayRatio(roundNumber)),
    );
  }
  return displayMs;
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

function clearEntities() {
  cells.forEach((cell) => {
    cell.innerHTML = "";
    cell.classList.remove("has-target", "has-distractor");
  });
}

function renderEntity(entity) {
  const cell = cells[entity.cellIndex];
  const icon = document.createElement("span");
  icon.className = "cat-icon";
  icon.textContent = entity.icon;
  cell.appendChild(icon);
  if (entity.isTarget) {
    cell.classList.add("has-target");
  } else {
    cell.classList.add("has-distractor");
  }
}

function renderEntities(entities) {
  clearEntities();
  entities.forEach(renderEntity);
}

function buildRoundEntities() {
  const entities = [];
  const targetCell = randomInt(0, TOTAL_CELLS - 1);
  entities.push({
    isTarget: true,
    icon: pickRandomItem(CAT_ICONS),
    cellIndex: targetCell,
  });

  if (state.isDisturbanceMode) {
    const distractorCount = randomInt(1, 2);
    const distractorIcons = pickRandomUniqueItems(DISTRACTOR_ICONS, distractorCount);

    distractorIcons.forEach((icon) => {
      const used = new Set(entities.map((entity) => entity.cellIndex));
      entities.push({
        isTarget: false,
        icon,
        cellIndex: randomNextIndex(-1, used),
      });
    });
  }

  return entities;
}

function moveEntities(currentEntities) {
  const used = new Set();
  return currentEntities.map((entity) => {
    const nextCell = randomNextIndex(entity.cellIndex, used);
    used.add(nextCell);
    return {
      ...entity,
      cellIndex: nextCell,
    };
  });
}

function updateButtonStates() {
  const canRunRound = !state.isAnimating && !state.isAnswering && state.round <= MAX_ROUND;
  elements.actionBtn.disabled = !canRunRound;
  if (state.round === 1 && !state.needsRetry) {
    elements.actionBtn.textContent = "スタート";
  } else if (state.needsRetry) {
    elements.actionBtn.textContent = "もういちど";
  } else {
    elements.actionBtn.textContent = "もういちど";
  }

  elements.prevRoundBtn.disabled =
    state.isAnimating || state.isAnswering || state.round <= 1;
  elements.nextRoundBtn.disabled =
    state.isAnimating || state.isAnswering || state.round >= MAX_ROUND;

  elements.disturbanceBtn.disabled = state.isAnimating || state.isAnswering;
  elements.disturbanceBtn.textContent = state.isDisturbanceMode ? "お邪魔あり" : "お邪魔なし";
  elements.disturbanceBtn.setAttribute("aria-pressed", String(state.isDisturbanceMode));

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
  let currentStepMs = state.currentDisplayMs;
  let entities = buildRoundEntities();

  for (let show = 0; show < showCount; show += 1) {
    renderEntities(entities);
    await wait(currentStepMs);
    clearEntities();

    if (show < showCount - 1) {
      await wait(currentStepMs);
      entities = moveEntities(entities);
    }

    currentStepMs = Math.max(
      MIN_DISPLAY_MS,
      truncateToTwoDecimals(currentStepMs * IN_ROUND_RATIO),
    );
  }

  state.entities = entities;
  state.finalCellIndex = entities.find((entity) => entity.isTarget).cellIndex;

  state.isAnimating = false;
  state.isAnswering = true;
  updateButtonStates();
}

function completeRound(correct) {
  state.isAnswering = false;

  if (correct) {
    state.score += 1;
    state.needsRetry = false;

    if (state.round >= MAX_ROUND) {
      elements.actionBtn.disabled = true;
    } else {
      const nextRound = state.round + 1;
      const nextRoundRatio = getRoundDisplayRatio(nextRound);
      state.round = nextRound;
      state.currentDisplayMs = Math.max(
        MIN_DISPLAY_MS,
        truncateToTwoDecimals(state.currentDisplayMs * nextRoundRatio),
      );
    }
  } else {
    state.needsRetry = true;
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

  renderEntities(state.entities);
  completeRound(correct);
}

function stepBackRound() {
  if (state.isAnimating || state.isAnswering || state.round <= 1) {
    return;
  }

  state.round -= 1;
  state.currentDisplayMs = computeDisplayMsForRound(state.round);
  state.finalCellIndex = null;
  state.entities = [];
  state.needsRetry = false;
  clearEntities();
  clearHighlights();
  syncStatus();
  updateButtonStates();
}

function stepForwardRound() {
  if (state.isAnimating || state.isAnswering || state.round >= MAX_ROUND) {
    return;
  }

  state.round += 1;
  state.currentDisplayMs = computeDisplayMsForRound(state.round);
  state.finalCellIndex = null;
  state.entities = [];
  state.needsRetry = false;
  clearEntities();
  clearHighlights();
  syncStatus();
  updateButtonStates();
}

function resetGame() {
  clearEntities();
  clearHighlights();
  state.round = 1;
  state.score = 0;
  state.isAnimating = false;
  state.isAnswering = false;
  state.currentDisplayMs = BASE_DISPLAY_MS;
  state.finalCellIndex = null;
  state.entities = [];
  state.needsRetry = false;
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
elements.prevRoundBtn.addEventListener("click", stepBackRound);
elements.nextRoundBtn.addEventListener("click", stepForwardRound);
elements.disturbanceBtn.addEventListener("click", () => {
  if (state.isAnimating || state.isAnswering) {
    return;
  }
  state.isDisturbanceMode = !state.isDisturbanceMode;
  updateButtonStates();
});

createGrid();
resetGame();
