const state = {
  divisions: 20,
  lineColor: '#2f6df6',
  bgColor: '#f8fbff',
  shape: 'square',
  axisMode: 'adjacent',
  opArtMode: false,
  isAnimating: false,
  currentStep: 0,
  linePairs: [],
  rafId: null
};

const canvas = document.getElementById('art-canvas');
const ctx = canvas.getContext('2d');

const ui = {
  divisions: document.getElementById('divisions'),
  divisionsValue: document.getElementById('divisions-value'),
  lineColor: document.getElementById('line-color'),
  bgColor: document.getElementById('bg-color'),
  shape: document.getElementById('shape'),
  axisMode: document.getElementById('axis-mode'),
  opArt: document.getElementById('op-art'),
  playToggle: document.getElementById('play-toggle'),
  reset: document.getElementById('reset'),
  random: document.getElementById('random')
};

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function getDividedPoints(startPt, endPt, divisions) {
  const points = [];
  for (let i = 0; i <= divisions; i += 1) {
    const t = i / divisions;
    points.push({
      x: startPt.x + (endPt.x - startPt.x) * t,
      y: startPt.y + (endPt.y - startPt.y) * t
    });
  }
  return points;
}

function createPolygonVertices(width, height, sides) {
  const size = Math.min(width, height);
  const center = { x: width / 2, y: height / 2 };
  const radius = size * 0.44;
  const vertices = [];
  const offset = sides === 4 ? -Math.PI / 4 : -Math.PI / 2;

  for (let i = 0; i < sides; i += 1) {
    const angle = offset + (Math.PI * 2 * i) / sides;
    vertices.push({
      x: center.x + Math.cos(angle) * radius,
      y: center.y + Math.sin(angle) * radius
    });
  }
  return vertices;
}

function createAxes(width, height) {
  if (state.shape === 'circle') {
    const segments = 36;
    const center = { x: width / 2, y: height / 2 };
    const radius = Math.min(width, height) * 0.44;
    const points = [];
    for (let i = 0; i < segments; i += 1) {
      const angle = -Math.PI / 2 + (Math.PI * 2 * i) / segments;
      points.push({
        x: center.x + Math.cos(angle) * radius,
        y: center.y + Math.sin(angle) * radius
      });
    }
    return points.map((point, i) => ({
      start: point,
      end: points[(i + 1) % points.length]
    }));
  }

  const sideMap = { triangle: 3, square: 4, hexagon: 6 };
  const sides = sideMap[state.shape] || 4;
  const vertices = createPolygonVertices(width, height, sides);
  return vertices.map((point, i) => ({
    start: point,
    end: vertices[(i + 1) % vertices.length]
  }));
}

function getAxisPairs(length, mode) {
  const pairs = [];
  for (let i = 0; i < length; i += 1) {
    for (let j = i + 1; j < length; j += 1) {
      const gap = Math.abs(i - j);
      const ringGap = Math.min(gap, length - gap);
      const adjacent = ringGap === 1;
      const skip = ringGap === 2;
      const cross = ringGap >= Math.floor(length / 2);

      if (
        mode === 'all' ||
        (mode === 'adjacent' && adjacent) ||
        (mode === 'skip' && skip) ||
        (mode === 'cross' && cross)
      ) {
        pairs.push([i, j]);
      }
    }
  }
  return pairs.length ? pairs : [[0, Math.max(1, length - 1)]];
}

function generateLinePairs(axes, currentState) {
  const linePairs = [];
  const axisPairs = getAxisPairs(axes.length, currentState.axisMode);

  axisPairs.forEach(([aIdx, bIdx]) => {
    const axisA = getDividedPoints(axes[aIdx].start, axes[aIdx].end, currentState.divisions);
    const axisB = getDividedPoints(axes[bIdx].start, axes[bIdx].end, currentState.divisions);

    for (let i = 0; i <= currentState.divisions; i += 1) {
      linePairs.push({ p1: axisA[i], p2: axisB[currentState.divisions - i] });
    }
  });

  return linePairs;
}

function clearCanvas() {
  ctx.fillStyle = state.bgColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawLine(p1, p2, color, alpha = 1) {
  ctx.strokeStyle = color;
  ctx.globalAlpha = alpha;
  ctx.beginPath();
  ctx.moveTo(p1.x, p1.y);
  ctx.lineTo(p2.x, p2.y);
  ctx.stroke();
  ctx.globalAlpha = 1;
}

function drawGuide(axes) {
  ctx.lineWidth = 1;
  axes.forEach((axis) => drawLine(axis.start, axis.end, '#8793b8', 0.4));
}

function drawOpArtOverlay() {
  if (!state.opArtMode) {
    return;
  }

  const stripeWidth = clamp(Math.floor(canvas.width / 20), 8, 24);
  for (let x = 0; x < canvas.width + stripeWidth; x += stripeWidth) {
    const odd = Math.floor(x / stripeWidth) % 2 === 1;
    ctx.fillStyle = odd ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.06)';
    ctx.fillRect(x, 0, stripeWidth, canvas.height);
  }
}

function drawArt(lineCount = state.linePairs.length) {
  clearCanvas();
  const axes = createAxes(canvas.width, canvas.height);
  drawGuide(axes);

  ctx.lineWidth = Math.max(0.8, Math.min(2.4, 120 / state.divisions));
  for (let i = 0; i < lineCount; i += 1) {
    const pair = state.linePairs[i];
    if (!pair) break;
    drawLine(pair.p1, pair.p2, state.lineColor, 0.95);
  }

  drawOpArtOverlay();
}

function animateStep() {
  if (!state.isAnimating) {
    return;
  }

  state.currentStep += Math.ceil(state.divisions / 8);
  const maxLines = state.linePairs.length;

  if (state.currentStep >= maxLines) {
    state.currentStep = maxLines;
    state.isAnimating = false;
    ui.playToggle.textContent = '▶ 再生';
  }

  drawArt(state.currentStep);

  if (state.isAnimating) {
    state.rafId = requestAnimationFrame(animateStep);
  }
}

function regenerateAndDraw() {
  const axes = createAxes(canvas.width, canvas.height);
  state.linePairs = generateLinePairs(axes, state);

  if (state.isAnimating) {
    cancelAnimationFrame(state.rafId);
    state.currentStep = 0;
    animateStep();
    return;
  }

  drawArt();
}

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  canvas.width = Math.max(1, Math.floor(rect.width));
  canvas.height = Math.max(1, Math.floor(rect.height));
  regenerateAndDraw();
}

function applyRandom() {
  const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const pick = (arr) => arr[rand(0, arr.length - 1)];

  state.divisions = rand(8, 90);
  state.shape = pick(['square', 'triangle', 'hexagon', 'circle']);
  state.axisMode = pick(['adjacent', 'skip', 'cross', 'all']);
  state.lineColor = `#${Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0')}`;
  state.bgColor = `#${Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0')}`;
  state.opArtMode = Math.random() > 0.5;

  syncUI();
  regenerateAndDraw();
}

function syncUI() {
  ui.divisions.value = state.divisions;
  ui.divisionsValue.textContent = String(state.divisions);
  ui.lineColor.value = state.lineColor;
  ui.bgColor.value = state.bgColor;
  ui.shape.value = state.shape;
  ui.axisMode.value = state.axisMode;
  ui.opArt.checked = state.opArtMode;
}

function bindEvents() {
  ui.divisions.addEventListener('input', (event) => {
    state.divisions = Number(event.target.value);
    ui.divisionsValue.textContent = String(state.divisions);
    regenerateAndDraw();
  });

  ui.lineColor.addEventListener('input', (event) => {
    state.lineColor = event.target.value;
    drawArt(state.isAnimating ? state.currentStep : state.linePairs.length);
  });

  ui.bgColor.addEventListener('input', (event) => {
    state.bgColor = event.target.value;
    drawArt(state.isAnimating ? state.currentStep : state.linePairs.length);
  });

  ui.shape.addEventListener('change', (event) => {
    state.shape = event.target.value;
    regenerateAndDraw();
  });

  ui.axisMode.addEventListener('change', (event) => {
    state.axisMode = event.target.value;
    regenerateAndDraw();
  });

  ui.opArt.addEventListener('change', (event) => {
    state.opArtMode = event.target.checked;
    drawArt(state.isAnimating ? state.currentStep : state.linePairs.length);
  });

  ui.playToggle.addEventListener('click', () => {
    if (state.isAnimating) {
      state.isAnimating = false;
      ui.playToggle.textContent = '▶ 再生';
      cancelAnimationFrame(state.rafId);
      drawArt(state.currentStep);
      return;
    }

    state.isAnimating = true;
    if (state.currentStep >= state.linePairs.length) {
      state.currentStep = 0;
    }
    ui.playToggle.textContent = '⏸ 停止';
    animateStep();
  });

  ui.reset.addEventListener('click', () => {
    state.isAnimating = false;
    state.currentStep = 0;
    ui.playToggle.textContent = '▶ 再生';
    cancelAnimationFrame(state.rafId);
    regenerateAndDraw();
  });

  ui.random.addEventListener('click', applyRandom);

  window.addEventListener('resize', resizeCanvas);
}

function init() {
  bindEvents();
  syncUI();
  resizeCanvas();
}

init();
