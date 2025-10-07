const TWO_PI = Math.PI * 2;
const CIRCUMFERENCE = 2 * Math.PI * 52;
const SNAPSHOT_KEY = 'game34_snapshots_v1';
const BASE_PLAYBACK_SPEED = 160;
const MIN_PLAYBACK_SPEED = 0.01;

const DEFAULT_STATE = {
  mode: 'inner',
  R: 96,
  r: 35,
  dIndex: 2,
  dValues: [0.24, 0.4, 0.55, 0.72, 0.88],
  phi: 0,
  seed: 123456,
  color: '#E0E6FF',
  lineWidth: 1.5,
  playbackSpeed: 1,
  render: {
    sampleSpacingPx: 1.5,
    batchPoints: 4000,
    useWorker: false
  },
  templateId: null
};

const canvas = document.getElementById('mainCanvas');
const ctx = canvas.getContext('2d');
const miniCanvas = document.getElementById('miniMap');
const miniCtx = miniCanvas.getContext('2d');
const pinionCanvas = document.getElementById('pinionCanvas');
const pinionCtx = pinionCanvas.getContext('2d');
const ringCanvas = document.getElementById('ringCanvas');
const ringCtx = ringCanvas.getContext('2d');
const controlPanelEl = document.getElementById('controlPanel');
const panelToggleBtn = document.getElementById('panelToggle');

const pinionValueEl = document.getElementById('pinionValue');
const ringValueEl = document.getElementById('ringValue');
const holeRatioEl = document.getElementById('holeRatio');
const statusText = document.getElementById('statusText');
const ringProgressEl = document.querySelector('.ring-progress');
const ringTextEl = document.querySelector('.ring-text');
const spacingRange = document.getElementById('spacingRange');
const lineWidthRange = document.getElementById('lineWidthRange');
const startRenderBtn = document.getElementById('startRender');
const playbackSpeedRange = document.getElementById('playbackSpeedRange');
const speedValueEl = document.getElementById('speedValue');
const selectorTrack = document.getElementById('pinionTrack');
const selectorPrev = document.getElementById('selectorPrev');
const selectorNext = document.getElementById('selectorNext');
const randomBtn = document.getElementById('randomBtn');
const exportPngBtn = document.getElementById('exportPng');
const exportSnapshotBtn = document.getElementById('exportSnapshot');
const snapshotSelect = document.getElementById('snapshotSelect');
const modeInnerBtn = document.getElementById('modeInner');
const modeOuterBtn = document.getElementById('modeOuter');

let state = jsonClone(DEFAULT_STATE);
let gearScene = null;
let pinionTemplates = [];
let outerTemplate = null;
let currentTemplateIndex = 0;
let pinionIcons = new Map();
let holeHitZones = [];
let isDraggingPinion = false;
let dragStartAngle = 0;
let dragStartPhi = 0;
let computeToken = 0;
let currentGeometry = null;
let drawTask = null;
let lastRandomSignature = '';
let panelCollapsed = false;

function jsonClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function gcd(a, b) {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x;
}

function parseScalar(value) {
  if (!value.length) return '';
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith('\'') && value.endsWith('\''))) {
    return value.slice(1, -1);
  }
  if (value.startsWith('[') && value.endsWith(']')) {
    const content = value.slice(1, -1).trim();
    if (!content) return [];
    return content.split(',').map(v => parseScalar(v.trim()));
  }
  if (value === 'true') return true;
  if (value === 'false') return false;
  const maybeNumber = Number(value);
  if (!Number.isNaN(maybeNumber)) {
    return maybeNumber;
  }
  return value;
}

function getIndent(line) {
  let count = 0;
  for (const ch of line) {
    if (ch === ' ') count += 1; else break;
  }
  return count;
}

function peekNextMeaningfulLine(lines, start) {
  for (let i = start; i < lines.length; i++) {
    const raw = lines[i];
    if (!raw) continue;
    const trimmed = raw.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    return { line: raw, index: i, trimmed };
  }
  return null;
}

function parseYaml(text) {
  const lines = text.split(/\r?\n/);
  const root = {};
  const stack = [{ indent: -1, container: root }];

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    if (!raw) continue;
    const trimmed = raw.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const indent = getIndent(raw);
    while (stack.length > 1 && indent <= stack[stack.length - 1].indent) {
      stack.pop();
    }
    const parent = stack[stack.length - 1].container;

    if (trimmed.startsWith('- ')) {
      if (!Array.isArray(parent)) {
        throw new Error('YAML parse error: array item without array');
      }
      const itemStr = trimmed.slice(2).trim();
      if (!itemStr) {
        const obj = {};
        parent.push(obj);
        stack.push({ indent, container: obj });
        continue;
      }
      if (itemStr.includes(':')) {
        const [keyPart, valuePart] = itemStr.split(':', 2);
        const obj = {};
        const key = keyPart.trim();
        const valueRaw = valuePart.trim();
        obj[key] = valueRaw ? parseScalar(valueRaw) : {};
        parent.push(obj);
        if (!valueRaw) {
          stack.push({ indent, container: obj[key] });
        } else {
          stack.push({ indent, container: obj });
        }
      } else {
        parent.push(parseScalar(itemStr));
      }
      continue;
    }

    const [keyPart, valuePart] = trimmed.split(':', 2);
    const key = keyPart.trim();
    const valueRaw = valuePart !== undefined ? valuePart.trim() : '';
    if (valueRaw.length) {
      parent[key] = parseScalar(valueRaw);
      continue;
    }

    const next = peekNextMeaningfulLine(lines, i + 1);
    if (next && getIndent(next.line) > indent && next.trimmed.startsWith('- ')) {
      parent[key] = [];
      stack.push({ indent, container: parent[key] });
    } else {
      parent[key] = {};
      stack.push({ indent, container: parent[key] });
    }
  }

  return root;
}

async function loadGearScene() {
  const response = await fetch('gear-art.yaml');
  const text = await response.text();
  return parseYaml(text);
}

function configureHiDpiCanvas(canvasEl, context) {
  const ratio = window.devicePixelRatio || 1;
  const rect = canvasEl.getBoundingClientRect();
  const width = Math.max(1, Math.round(rect.width));
  const height = Math.max(1, Math.round(rect.height));
  if (canvasEl.width !== width * ratio || canvasEl.height !== height * ratio) {
    canvasEl.width = width * ratio;
    canvasEl.height = height * ratio;
  }
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function createOffscreenCanvas(size = 140) {
  const ratio = window.devicePixelRatio || 1;
  const canvasEl = document.createElement('canvas');
  canvasEl.width = size * ratio;
  canvasEl.height = size * ratio;
  canvasEl.style.width = `${size}px`;
  canvasEl.style.height = `${size}px`;
  const context = canvasEl.getContext('2d');
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  return { canvas: canvasEl, ctx: context, size };
}

function polarToCartesian(angle, radius) {
  return [Math.cos(angle) * radius, Math.sin(angle) * radius];
}
function drawGear(context, options) {
  const {
    teeth,
    outerRadius,
    innerRadius,
    centerX,
    centerY,
    stroke,
    strokeWidth,
    fill,
    highlight,
    highlightSpec,
    rotation = 0,
    softness = 0.3
  } = options;

  context.save();
  context.translate(centerX, centerY);
  context.rotate(rotation);

  const step = TWO_PI / teeth;
  context.beginPath();
  context.moveTo(...polarToCartesian(0, innerRadius));
  for (let i = 0; i < teeth; i++) {
    const angle = i * step;
    const rootAngle = angle + step;
    const tipStart = angle + step * softness;
    const tipEnd = angle + step * (1 - softness);

    const [rootX, rootY] = polarToCartesian(angle, innerRadius);
    context.lineTo(rootX, rootY);

    const [tipStartX, tipStartY] = polarToCartesian(tipStart, outerRadius);
    const [tipEndX, tipEndY] = polarToCartesian(tipEnd, outerRadius);
    context.quadraticCurveTo(tipStartX, tipStartY, tipEndX, tipEndY);

    const [nextX, nextY] = polarToCartesian(rootAngle, innerRadius);
    context.lineTo(nextX, nextY);
  }
  context.closePath();

  context.fillStyle = fill;
  context.fill();
  context.lineJoin = 'round';
  context.lineWidth = strokeWidth;
  context.strokeStyle = stroke;
  context.stroke();

  if (highlight && highlightSpec) {
    const { angleDeg, arcDeg, intensity } = highlightSpec;
    const gradient = context.createRadialGradient(0, 0, innerRadius * 0.2, 0, 0, outerRadius);
    gradient.addColorStop(0, `rgba(255,255,255,${intensity})`);
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    context.save();
    context.rotate((angleDeg * Math.PI) / 180);
    context.beginPath();
    context.moveTo(0, 0);
    context.arc(0, 0, outerRadius, 0, (arcDeg * Math.PI) / 180, false);
    context.closePath();
    context.fillStyle = gradient;
    context.fill();
    context.restore();
  }

  context.restore();
}

function normalizeAngle(angle) {
  let a = angle % TWO_PI;
  if (a < 0) a += TWO_PI;
  return a;
}

function updateHoleInfo() {
  const ratio = state.dValues[state.dIndex];
  const d = ratio * state.r;
  holeRatioEl.textContent = `${ratio.toFixed(2)}r (d=${d.toFixed(2)})`;
}

function updateModeButtons() {
  if (state.mode === 'inner') {
    modeInnerBtn.classList.add('active');
    modeOuterBtn.classList.remove('active');
    modeInnerBtn.setAttribute('aria-pressed', 'true');
    modeOuterBtn.setAttribute('aria-pressed', 'false');
  } else {
    modeOuterBtn.classList.add('active');
    modeInnerBtn.classList.remove('active');
    modeOuterBtn.setAttribute('aria-pressed', 'true');
    modeInnerBtn.setAttribute('aria-pressed', 'false');
  }
}

function updateStatus(geometry = currentGeometry) {
  const ratio = state.dValues[state.dIndex];
  const d = ratio * state.r;
  const g = gcd(state.R, state.r);
  const period = TWO_PI * (state.r / g);
  const phiDeg = (normalizeAngle(state.phi) * 180) / Math.PI;
  const pointText = geometry ? `${geometry.pointCount.toLocaleString()}点` : '計算中…';
  statusText.textContent = `mode=${state.mode} | R=${state.R} r=${state.r} | d=${d.toFixed(2)} (${ratio.toFixed(2)}r) | φ=${phiDeg.toFixed(1)}° | gcd=${g} | T=${period.toFixed(2)} | 点数: ${pointText}`;
}

function updateProgress(progress) {
  const dash = clamp(progress, 0, 1) * CIRCUMFERENCE;
  ringProgressEl.setAttribute('stroke-dasharray', `${dash} ${CIRCUMFERENCE - dash}`);
  ringTextEl.textContent = `${Math.round(progress * 100)}%`;
}

function setStartButtonState(mode) {
  if (!startRenderBtn) return;
  if (mode === 'ready') {
    startRenderBtn.disabled = !currentGeometry;
    startRenderBtn.textContent = '描画開始';
  } else if (mode === 'drawing') {
    startRenderBtn.disabled = true;
    startRenderBtn.textContent = '描画中…';
  } else if (mode === 'computing') {
    startRenderBtn.disabled = true;
    startRenderBtn.textContent = '計算中…';
  }
}

function updatePlaybackSpeedControl() {
  const value = clamp(Number(state.playbackSpeed ?? 1), MIN_PLAYBACK_SPEED, Number(playbackSpeedRange?.max ?? 3));
  if (playbackSpeedRange) {
    playbackSpeedRange.value = String(value);
  }
  if (speedValueEl) {
    const decimals = value < 1 ? 2 : 1;
    speedValueEl.textContent = `${value.toFixed(decimals)}x`;
  }
  state.playbackSpeed = value;
}

function prepareCanvasBackground() {
  clearCanvas(ctx, canvas);
  const rect = canvas.getBoundingClientRect();
  ctx.fillStyle = '#05060a';
  ctx.fillRect(0, 0, rect.width, rect.height);
}

function drawPinionModel() {
  if (!state.templateId || !pinionTemplates.length) return;
  configureHiDpiCanvas(pinionCanvas, pinionCtx);
  const rect = pinionCanvas.getBoundingClientRect();
  const cx = rect.width / 2;
  const cy = rect.height / 2;
  const template = pinionTemplates[currentTemplateIndex];
  const radius = Math.min(cx, cy) - 12;
  pinionCtx.clearRect(0, 0, rect.width, rect.height);

  drawGear(pinionCtx, {
    teeth: Math.max(8, Math.round(state.r)),
    outerRadius: radius,
    innerRadius: radius - template.toothDepth,
    centerX: cx,
    centerY: cy,
    stroke: gearScene.scene.palette.pinion.stroke,
    strokeWidth: gearScene.scene.palette.pinion.strokeWidth,
    fill: gearScene.scene.palette.pinion.fill,
    highlight: gearScene.scene.palette.pinion.highlight,
    highlightSpec: template.highlights && template.highlights[0],
    rotation: state.phi,
    softness: template.toothSoftness
  });

  pinionCtx.beginPath();
  pinionCtx.arc(cx, cy, template.hubRadius, 0, TWO_PI);
  pinionCtx.fillStyle = 'rgba(255,255,255,0.92)';
  pinionCtx.fill();
  pinionCtx.lineWidth = 3;
  pinionCtx.strokeStyle = 'rgba(36,52,92,0.6)';
  pinionCtx.stroke();

  const holeRadius = template.holeRadius;
  const count = state.dValues.length;
  const maxDistance = radius * 0.8;
  holeHitZones = [];
  for (let i = 0; i < count; i++) {
    const ratio = state.dValues[i];
    const baseAngle = (TWO_PI / count) * i;
    const angle = baseAngle + state.phi;
    const distance = ratio * maxDistance;
    const x = cx + Math.cos(angle) * distance;
    const y = cy + Math.sin(angle) * distance;
    holeHitZones.push({ x, y, radius: holeRadius + 4, index: i });

    pinionCtx.beginPath();
    pinionCtx.arc(x, y, holeRadius, 0, TWO_PI);
    if (i === state.dIndex) {
      pinionCtx.fillStyle = '#4d6fff';
      pinionCtx.globalAlpha = 0.85;
      pinionCtx.fill();
      pinionCtx.globalAlpha = 1;
      pinionCtx.lineWidth = 2.4;
      pinionCtx.strokeStyle = '#ffffff';
    } else {
      pinionCtx.fillStyle = 'rgba(255,255,255,0.85)';
      pinionCtx.fill();
      pinionCtx.lineWidth = 2;
      pinionCtx.strokeStyle = 'rgba(36,52,92,0.6)';
    }
    pinionCtx.stroke();
  }

  pinionCtx.save();
  pinionCtx.translate(cx, cy);
  pinionCtx.rotate(state.phi);
  pinionCtx.beginPath();
  pinionCtx.moveTo(0, 0);
  pinionCtx.lineTo(radius - 18, 0);
  pinionCtx.strokeStyle = 'rgba(77,111,255,0.7)';
  pinionCtx.lineWidth = 4;
  pinionCtx.stroke();
  pinionCtx.restore();

  pinionCtx.fillStyle = 'rgba(33,42,77,0.75)';
  pinionCtx.font = '14px "Segoe UI", sans-serif';
  pinionCtx.textAlign = 'center';
  pinionCtx.fillText(`φ=${((normalizeAngle(state.phi) * 180) / Math.PI).toFixed(1)}°`, cx, rect.height - 12);
}

function drawRingArt() {
  if (!outerTemplate) return;
  configureHiDpiCanvas(ringCanvas, ringCtx);
  const rect = ringCanvas.getBoundingClientRect();
  const cx = rect.width / 2;
  const cy = rect.height / 2;
  const outerRadius = Math.min(cx, cy) - 10;
  const innerRadius = outerRadius - outerTemplate.toothDepth;
  ringCtx.clearRect(0, 0, rect.width, rect.height);

  drawGear(ringCtx, {
    teeth: Math.max(16, Math.round(state.R)),
    outerRadius,
    innerRadius,
    centerX: cx,
    centerY: cy,
    stroke: gearScene.scene.palette.ring.stroke,
    strokeWidth: gearScene.scene.palette.ring.strokeWidth,
    fill: gearScene.scene.palette.ring.fill,
    highlight: gearScene.scene.palette.ring.highlight,
    highlightSpec: outerTemplate.highlight,
    softness: outerTemplate.toothSoftness
  });

  ringCtx.beginPath();
  ringCtx.arc(cx, cy, innerRadius * 0.6, 0, TWO_PI);
  ringCtx.fillStyle = 'rgba(255,255,255,0.75)';
  ringCtx.fill();
}
function configureSelector() {
  selectorTrack.innerHTML = '';
  pinionTemplates.forEach((template, index) => {
    const item = document.createElement('div');
    item.className = 'selector-item';
    item.dataset.index = String(index);
    item.setAttribute('role', 'option');
    item.setAttribute('aria-label', `${template.label} (r=${template.r})`);

    const img = document.createElement('img');
    img.alt = `${template.label} の歯車イラスト`;
    img.src = pinionIcons.get(template.id);
    const span = document.createElement('span');
    span.textContent = `r=${template.r}`;

    item.appendChild(img);
    item.appendChild(span);
    item.addEventListener('click', () => selectTemplate(index));
    item.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        selectTemplate(index);
      }
    });

    selectorTrack.appendChild(item);
  });
  highlightSelector();
}

function highlightSelector() {
  const items = selectorTrack.querySelectorAll('.selector-item');
  items.forEach((item, idx) => {
    if (idx === currentTemplateIndex) {
      item.classList.add('active');
      item.setAttribute('aria-selected', 'true');
      item.tabIndex = 0;
    } else {
      item.classList.remove('active');
      item.setAttribute('aria-selected', 'false');
      item.tabIndex = -1;
    }
  });
}

function selectTemplate(index) {
  currentTemplateIndex = clamp(index, 0, pinionTemplates.length - 1);
  const template = pinionTemplates[currentTemplateIndex];
  state.templateId = template.id;
  state.r = template.r;
  state.dValues = [...template.holeRatios];
  state.dIndex = clamp(state.dIndex, 0, state.dValues.length - 1);
  pinionValueEl.textContent = state.r;
  highlightSelector();
  drawPinionModel();
  updateHoleInfo();
  scheduleRender('template');
}

function scrollSelector(delta) {
  const newIndex = clamp(currentTemplateIndex + delta, 0, pinionTemplates.length - 1);
  if (newIndex !== currentTemplateIndex) {
    selectTemplate(newIndex);
    selectorTrack.children[newIndex]?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }
}

function setMode(mode) {
  if (state.mode === mode) return;
  state.mode = mode;
  updateModeButtons();
  scheduleRender('mode');
}

function adjustPinion(delta) {
  const newValue = clamp(state.r + delta, 8, 200);
  if (newValue === state.r) return;
  state.r = newValue;
  pinionValueEl.textContent = state.r;
  drawPinionModel();
  updateHoleInfo();
  scheduleRender('r');
}

function adjustRing(delta) {
  const newValue = clamp(state.R + delta, 8, 220);
  if (newValue === state.R) return;
  state.R = newValue;
  ringValueEl.textContent = state.R;
  drawRingArt();
  scheduleRender('R');
}

function getCanvasDimensions() {
  configureHiDpiCanvas(canvas, ctx);
  configureHiDpiCanvas(miniCanvas, miniCtx);
  const rect = canvas.getBoundingClientRect();
  const miniRect = miniCanvas.getBoundingClientRect();
  const base = state.mode === 'inner' ? state.R - state.r : state.R + state.r;
  const d = state.dValues[state.dIndex] * state.r;
  const maxRadius = Math.max(1, base + d);
  const margin = 28;
  const usable = Math.min(rect.width, rect.height) / 2 - margin;
  const scale = usable / maxRadius;
  const miniUsable = Math.min(miniRect.width, miniRect.height) / 2 - 8;
  const miniScale = miniUsable / maxRadius;
  return {
    width: rect.width,
    height: rect.height,
    centerX: rect.width / 2,
    centerY: rect.height / 2,
    scale: Math.max(scale, 0.02),
    miniScale: Math.max(miniScale, 0.02),
    miniCenterX: miniRect.width / 2,
    miniCenterY: miniRect.height / 2
  };
}

function computePoint(mode, base, ratio, d, t, phi) {
  const angle = t + phi;
  const cosA = Math.cos(angle);
  const sinA = Math.sin(angle);
  const cosB = Math.cos(ratio * angle);
  const sinB = Math.sin(ratio * angle);
  if (mode === 'inner') {
    const x = base * cosA + d * cosB;
    const y = base * sinA - d * sinB;
    const dx = -base * sinA - d * ratio * sinB;
    const dy = base * cosA - d * ratio * cosB;
    return { x, y, speed: Math.hypot(dx, dy) };
  }
  const x = base * cosA - d * cosB;
  const y = base * sinA - d * sinB;
  const dx = -base * sinA + d * ratio * sinB;
  const dy = base * cosA - d * ratio * cosB;
  return { x, y, speed: Math.hypot(dx, dy) };
}

async function generateGeometry(currentState, dims, token) {
  const { mode, R, r, phi, render } = currentState;
  const d = currentState.dValues[currentState.dIndex] * r;
  const g = gcd(R, r);
  const period = TWO_PI * (r / g);
  const base = mode === 'inner' ? R - r : R + r;
  const ratio = base / r;
  const centerX = dims.centerX;
  const centerY = dims.centerY;
  const scale = dims.scale;
  const miniScale = dims.miniScale;
  const miniCenterX = dims.miniCenterX;
  const miniCenterY = dims.miniCenterY;
  const targetSpacing = render.sampleSpacingPx;
  const minStep = 0.0004;
  const maxStep = 0.18;

  const points = [];
  const miniPoints = [];
  let t = 0;
  let lastYield = performance.now();

  while (t < period) {
    const { x, y, speed } = computePoint(mode, base, ratio, d, t, phi);
    points.push(centerX + x * scale, centerY + y * scale);
    miniPoints.push(miniCenterX + x * miniScale, miniCenterY + y * miniScale);

    const velocity = Math.max(speed * scale, 1e-4);
    let dt = targetSpacing / velocity;
    dt = clamp(dt, minStep, maxStep);
    t += dt;

    if (performance.now() - lastYield > 14) {
      await new Promise(requestAnimationFrame);
      if (token !== computeToken) return null;
      lastYield = performance.now();
    }
  }

  const { x: finalX, y: finalY } = computePoint(mode, base, ratio, d, period, phi);
  points.push(centerX + finalX * scale, centerY + finalY * scale);
  miniPoints.push(miniCenterX + finalX * miniScale, miniCenterY + finalY * miniScale);

  return {
    points: new Float32Array(points),
    miniPoints: new Float32Array(miniPoints),
    pointCount: points.length / 2,
    period,
    g,
    base,
    d,
    scale,
    mode
  };
}

function clearCanvas(context, canvasEl) {
  context.save();
  context.setTransform(1, 0, 0, 1, 0, 0);
  context.clearRect(0, 0, canvasEl.width, canvasEl.height);
  context.restore();
}

function startDrawing(geometry) {
  if (!geometry) return;
  if (drawTask && drawTask.frame) {
    cancelAnimationFrame(drawTask.frame);
  }
  drawTask = null;
  setStartButtonState('drawing');
  prepareCanvasBackground();

  ctx.strokeStyle = state.color;
  ctx.lineWidth = state.lineWidth;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  const pts = geometry.points;
  const totalPoints = pts.length / 2;
  if (totalPoints < 2) {
    updateProgress(1);
    setStartButtonState('ready');
    return;
  }

  if (!geometry.cumulativeLengths || geometry.cumulativeLengths.length !== totalPoints) {
    const cumulative = new Float32Array(totalPoints);
    cumulative[0] = 0;
    for (let i = 1; i < totalPoints; i++) {
      const prev = (i - 1) * 2;
      const idx = i * 2;
      const dx = pts[idx] - pts[prev];
      const dy = pts[idx + 1] - pts[prev + 1];
      cumulative[i] = cumulative[i - 1] + Math.hypot(dx, dy);
    }
    geometry.cumulativeLengths = cumulative;
    geometry.totalLength = cumulative[totalPoints - 1];
  }

  const cumulative = geometry.cumulativeLengths;
  const totalLength = geometry.totalLength || cumulative[totalPoints - 1] || 1;

  drawTask = {
    geometry,
    frame: null,
    token: computeToken,
    totalPoints,
    cumulative,
    totalLength,
    lastTime: null,
    progressLength: 0,
    drawnIndex: 1,
    currentIndex: 1
  };

  updateProgress(0);

  const drawFrame = (timestamp) => {
    if (!drawTask || drawTask.token !== computeToken) return;
    if (drawTask.lastTime === null) {
      drawTask.lastTime = timestamp;
      drawTask.frame = requestAnimationFrame(drawFrame);
      return;
    }

    const deltaSeconds = Math.max(0, (timestamp - drawTask.lastTime) / 1000);
    drawTask.lastTime = timestamp;
    const playbackScale = Math.max(MIN_PLAYBACK_SPEED, Number(state.playbackSpeed ?? 1));
    const speed = playbackScale * BASE_PLAYBACK_SPEED;
    drawTask.progressLength = Math.min(drawTask.progressLength + deltaSeconds * speed, drawTask.totalLength);

    while (drawTask.currentIndex < drawTask.totalPoints && cumulative[drawTask.currentIndex] <= drawTask.progressLength) {
      drawTask.currentIndex += 1;
    }

    if (drawTask.currentIndex > drawTask.drawnIndex) {
      ctx.beginPath();
      const moveIdx = (drawTask.drawnIndex - 1) * 2;
      ctx.moveTo(pts[moveIdx], pts[moveIdx + 1]);
      for (let i = drawTask.drawnIndex; i < drawTask.currentIndex; i++) {
        const idx = i * 2;
        ctx.lineTo(pts[idx], pts[idx + 1]);
      }
      ctx.stroke();
      drawTask.drawnIndex = drawTask.currentIndex;
    }

    const progressRatio = drawTask.totalLength > 0 ? drawTask.progressLength / drawTask.totalLength : 1;
    updateProgress(progressRatio);

    if (drawTask.progressLength + 1e-6 >= drawTask.totalLength) {
      drawTask = null;
      updateProgress(1);
      setStartButtonState('ready');
      return;
    }

    drawTask.frame = requestAnimationFrame(drawFrame);
  };

  drawTask.frame = requestAnimationFrame(drawFrame);
}

function renderMiniMap(geometry) {
  clearCanvas(miniCtx, miniCanvas);
  const rect = miniCanvas.getBoundingClientRect();
  miniCtx.fillStyle = 'rgba(10,12,22,0.86)';
  miniCtx.fillRect(0, 0, rect.width, rect.height);
  if (!geometry || geometry.miniPoints.length < 4) return;
  const pts = geometry.miniPoints;
  miniCtx.strokeStyle = 'rgba(224,230,255,0.85)';
  miniCtx.lineWidth = 1.1;
  miniCtx.beginPath();
  miniCtx.moveTo(pts[0], pts[1]);
  for (let i = 1; i < pts.length / 2; i++) {
    const idx = i * 2;
    miniCtx.lineTo(pts[idx], pts[idx + 1]);
  }
  miniCtx.stroke();
}

function scheduleRender(reason = 'state', reuse = false) {
  if (drawTask && drawTask.frame) {
    cancelAnimationFrame(drawTask.frame);
  }
  drawTask = null;
  updateProgress(0);

  if (reuse && currentGeometry) {
    prepareCanvasBackground();
    renderMiniMap(currentGeometry);
    updateStatus(currentGeometry);
    setStartButtonState('ready');
    return;
  }

  currentGeometry = null;
  setStartButtonState('computing');
  computeToken += 1;
  const token = computeToken;
  updateStatus(null);
  const dims = getCanvasDimensions();
  prepareCanvasBackground();
  generateGeometry(state, dims, token)
    .then((geometry) => {
      if (!geometry) return;
      if (token !== computeToken) return;
      currentGeometry = geometry;
      renderMiniMap(geometry);
      updateStatus(geometry);
      updateProgress(0);
      setStartButtonState('ready');
    })
    .catch((err) => {
      console.error(err);
      setStartButtonState('ready');
    });
}

function setHoleIndex(index) {
  if (index === state.dIndex) return;
  state.dIndex = clamp(index, 0, state.dValues.length - 1);
  updateHoleInfo();
  drawPinionModel();
  scheduleRender('hole');
}

let phiAnimationHandle = null;
function setPhi(angle) {
  state.phi = angle;
  drawPinionModel();
  if (!phiAnimationHandle) {
    phiAnimationHandle = requestAnimationFrame(() => {
      phiAnimationHandle = null;
      scheduleRender('phi');
    });
  }
}

function pointerPosition(canvasEl, event) {
  const rect = canvasEl.getBoundingClientRect();
  return {
    x: event.clientX - rect.left - rect.width / 2,
    y: event.clientY - rect.top - rect.height / 2,
    rect
  };
}

function setupPinionPointer() {
  pinionCanvas.addEventListener('pointerdown', (event) => {
    pinionCanvas.setPointerCapture(event.pointerId);
    const { x, y, rect } = pointerPosition(pinionCanvas, event);
    const absX = x + rect.width / 2;
    const absY = y + rect.height / 2;
    const hit = holeHitZones.find(zone => Math.hypot(zone.x - absX, zone.y - absY) <= zone.radius);
    if (hit) {
      setHoleIndex(hit.index);
      return;
    }
    isDraggingPinion = true;
    dragStartAngle = Math.atan2(y, x);
    dragStartPhi = state.phi;
  });

  const moveHandler = (event) => {
    if (!isDraggingPinion) return;
    const { x, y } = pointerPosition(pinionCanvas, event);
    const angle = Math.atan2(y, x);
    let delta = angle - dragStartAngle;
    if (delta > Math.PI) delta -= TWO_PI;
    if (delta < -Math.PI) delta += TWO_PI;
    setPhi(dragStartPhi + delta);
  };

  pinionCanvas.addEventListener('pointermove', moveHandler);
  pinionCanvas.addEventListener('pointerup', (event) => {
    pinionCanvas.releasePointerCapture(event.pointerId);
    isDraggingPinion = false;
  });
  pinionCanvas.addEventListener('pointercancel', (event) => {
    pinionCanvas.releasePointerCapture(event.pointerId);
    isDraggingPinion = false;
  });
}

function createRng(seed) {
  let stateSeed = seed >>> 0;
  return () => {
    stateSeed = (1664525 * stateSeed + 1013904223) >>> 0;
    return stateSeed / 0x100000000;
  };
}

function randomizeConfiguration() {
  if (!pinionTemplates.length) return;
  const rng = createRng(state.seed || 123456);
  state.seed = Math.floor(rng() * 1_000_000_000);

  let templateIndex = Math.floor(rng() * pinionTemplates.length);
  const template = pinionTemplates[templateIndex];
  const baseR = template.r;
  const delta = Math.round((rng() - 0.5) * 8);
  const newR = clamp(baseR + delta, 10, 120);
  let chosenR = newR;
  let bestScore = -Infinity;
  let bestCandidate = newR;
  for (let i = 0; i < 20; i++) {
    const candidate = clamp(Math.round(30 + rng() * 140), 12, 200);
    const g = gcd(candidate, newR);
    let score = g === 1 ? 5 : g === 2 ? 2 : 0.5;
    score -= Math.abs(candidate - newR) * 0.01;
    if (score > bestScore) {
      bestScore = score;
      bestCandidate = candidate;
    }
  }
  chosenR = bestCandidate;

  let dIndex = Math.floor(rng() * template.holeRatios.length);
  const mode = rng() < 0.5 ? 'inner' : 'outer';
  const phi = rng() * TWO_PI;
  const signature = `${mode}-${chosenR}-${newR}-${dIndex}`;
  if (signature === lastRandomSignature) {
    dIndex = (dIndex + 1) % template.holeRatios.length;
  }
  lastRandomSignature = signature;

  currentTemplateIndex = templateIndex;
  state.templateId = template.id;
  state.r = newR;
  state.R = chosenR;
  state.dValues = [...template.holeRatios];
  state.dIndex = dIndex;
  state.mode = mode;
  state.phi = phi;

  pinionValueEl.textContent = state.r;
  ringValueEl.textContent = state.R;
  spacingRange.value = state.render.sampleSpacingPx;
  lineWidthRange.value = state.lineWidth;
  updateModeButtons();
  highlightSelector();
  drawPinionModel();
  drawRingArt();
  updateHoleInfo();
  scheduleRender('random');
}

function exportPng() {
  const link = document.createElement('a');
  link.download = `spirograph-${Date.now()}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

function loadSnapshots() {
  try {
    const raw = localStorage.getItem(SNAPSHOT_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.warn('Failed to load snapshots', err);
    return [];
  }
}

function saveSnapshots(list) {
  localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(list));
}

function populateSnapshotSelect(list) {
  const current = snapshotSelect.value;
  snapshotSelect.innerHTML = '<option value="">選択してください</option>';
  list.forEach((entry) => {
    const option = document.createElement('option');
    option.value = String(entry.id);
    option.textContent = entry.label;
    snapshotSelect.appendChild(option);
  });
  if (list.some(item => String(item.id) === current)) {
    snapshotSelect.value = current;
  }
}

function exportSnapshot() {
  const entry = {
    id: Date.now(),
    label: new Date().toLocaleString(),
    state: {
      mode: state.mode,
      R: state.R,
      r: state.r,
      dIndex: state.dIndex,
      dValues: [...state.dValues],
      phi: state.phi,
      seed: state.seed,
      color: state.color,
      lineWidth: state.lineWidth,
      playbackSpeed: state.playbackSpeed,
      render: { ...state.render },
      templateId: state.templateId
    }
  };
  const list = loadSnapshots();
  list.unshift(entry);
  const limited = list.slice(0, 12);
  saveSnapshots(limited);
  populateSnapshotSelect(limited);
  snapshotSelect.value = String(entry.id);
}

function applySnapshot(entry) {
  const snapState = entry.state;
  state.mode = snapState.mode;
  state.R = snapState.R;
  state.r = snapState.r;
  state.dIndex = snapState.dIndex;
  state.dValues = snapState.dValues && snapState.dValues.length ? [...snapState.dValues] : [...state.dValues];
  state.phi = snapState.phi;
  state.seed = snapState.seed;
  state.color = snapState.color;
  state.lineWidth = snapState.lineWidth;
  state.playbackSpeed = snapState.playbackSpeed ?? 1;
  state.render = { ...snapState.render };
  state.templateId = snapState.templateId;

  const templateIndex = pinionTemplates.findIndex(t => t.id === state.templateId);
  if (templateIndex >= 0) {
    currentTemplateIndex = templateIndex;
    const template = pinionTemplates[templateIndex];
    state.dValues = [...template.holeRatios];
  }
  state.dIndex = clamp(state.dIndex, 0, state.dValues.length - 1);

  pinionValueEl.textContent = state.r;
  ringValueEl.textContent = state.R;
  spacingRange.value = state.render.sampleSpacingPx;
  lineWidthRange.value = state.lineWidth;
  updatePlaybackSpeedControl();
  updateModeButtons();
  highlightSelector();
  drawPinionModel();
  drawRingArt();
  updateHoleInfo();
  scheduleRender('snapshot');
}

function setupUIEvents() {
  if (startRenderBtn) {
    startRenderBtn.addEventListener('click', () => {
      if (currentGeometry) {
        startDrawing(currentGeometry);
      }
    });
  }
  if (playbackSpeedRange) {
    playbackSpeedRange.addEventListener('input', (event) => {
      const value = parseFloat(event.target.value);
      state.playbackSpeed = Number.isFinite(value) ? value : 1;
      updatePlaybackSpeedControl();
    });
  }
  selectorPrev.addEventListener('click', () => scrollSelector(-1));
  selectorNext.addEventListener('click', () => scrollSelector(1));
  randomBtn.addEventListener('click', randomizeConfiguration);
  document.getElementById('pinionMinus').addEventListener('click', () => adjustPinion(-1));
  document.getElementById('pinionPlus').addEventListener('click', () => adjustPinion(1));
  document.getElementById('ringMinus').addEventListener('click', () => adjustRing(-1));
  document.getElementById('ringPlus').addEventListener('click', () => adjustRing(1));
  modeInnerBtn.addEventListener('click', () => setMode('inner'));
  modeOuterBtn.addEventListener('click', () => setMode('outer'));
  spacingRange.addEventListener('input', (event) => {
    state.render.sampleSpacingPx = parseFloat(event.target.value);
    scheduleRender('spacing');
  });
  lineWidthRange.addEventListener('input', (event) => {
    state.lineWidth = parseFloat(event.target.value);
    scheduleRender('lineWidth', true);
  });
  exportPngBtn.addEventListener('click', exportPng);
  exportSnapshotBtn.addEventListener('click', exportSnapshot);
  snapshotSelect.addEventListener('change', () => {
    const value = snapshotSelect.value;
    if (!value) return;
    const list = loadSnapshots();
    const entry = list.find(item => String(item.id) === value);
    if (entry) {
      applySnapshot(entry);
    }
  });

  if (panelToggleBtn && controlPanelEl) {
    const mobileQuery = window.matchMedia('(max-width: 720px)');

    const applyPanelState = (collapsed) => {
      panelCollapsed = collapsed;
      controlPanelEl.classList.toggle('collapsed', collapsed);
      panelToggleBtn.setAttribute('aria-expanded', String(!collapsed));
      panelToggleBtn.setAttribute('aria-label', collapsed ? '設定画面を開く' : '設定画面を閉じる');
      panelToggleBtn.textContent = collapsed ? '設定を開く' : '設定を閉じる';
    };

    applyPanelState(mobileQuery.matches);

    panelToggleBtn.addEventListener('click', () => {
      applyPanelState(!panelCollapsed);
    });

    const handleMediaChange = (event) => {
      if (!event.matches && panelCollapsed) {
        applyPanelState(false);
      }
    };

    if (typeof mobileQuery.addEventListener === 'function') {
      mobileQuery.addEventListener('change', handleMediaChange);
    } else if (typeof mobileQuery.addListener === 'function') {
      mobileQuery.addListener(handleMediaChange);
    }
  }

  let resizeTimer = null;
  window.addEventListener('resize', () => {
    if (resizeTimer) cancelAnimationFrame(resizeTimer);
    resizeTimer = requestAnimationFrame(() => {
      resizeTimer = null;
      drawPinionModel();
      drawRingArt();
      scheduleRender('resize');
    });
  });
}

function buildPinionIcons() {
  pinionIcons.clear();
  pinionTemplates.forEach((template) => {
    const { canvas: iconCanvas, ctx: iconCtx, size } = createOffscreenCanvas(110);
    const cx = size / 2;
    const cy = size / 2;
    const radius = size / 2 - 10;
    drawGear(iconCtx, {
      teeth: template.r,
      outerRadius: radius,
      innerRadius: radius - template.toothDepth,
      centerX: cx,
      centerY: cy,
      stroke: gearScene.scene.palette.pinion.stroke,
      strokeWidth: gearScene.scene.palette.pinion.strokeWidth,
      fill: gearScene.scene.palette.pinion.fill,
      highlight: gearScene.scene.palette.pinion.highlight,
      highlightSpec: template.highlights && template.highlights[0],
      softness: template.toothSoftness
    });
    iconCtx.beginPath();
    iconCtx.arc(cx, cy, template.hubRadius * 0.65, 0, TWO_PI);
    iconCtx.fillStyle = 'rgba(255,255,255,0.85)';
    iconCtx.fill();
    const count = template.holeRatios.length;
    const maxDistance = radius * 0.8;
    for (let i = 0; i < count; i++) {
      const angle = (TWO_PI / count) * i;
      const distance = template.holeRatios[i] * maxDistance;
      const x = cx + Math.cos(angle) * distance;
      const y = cy + Math.sin(angle) * distance;
      iconCtx.beginPath();
      iconCtx.arc(x, y, template.holeRadius * 0.75, 0, TWO_PI);
      iconCtx.fillStyle = 'rgba(77,111,255,0.4)';
      iconCtx.fill();
    }
    pinionIcons.set(template.id, iconCanvas.toDataURL());
  });
}

async function init() {
  gearScene = await loadGearScene();
  pinionTemplates = gearScene.scene.pinionTemplates.map((template) => ({
    id: template.id,
    label: template.label,
    r: template.r,
    hubRadius: template.hubRadius,
    toothDepth: template.toothDepth,
    toothSoftness: template.toothSoftness ?? 0.3,
    holeRadius: template.holeRadius,
    holeRatios: template.holeRatios,
    highlights: template.highlights || []
  }));
  outerTemplate = gearScene.scene.outerRing;

  buildPinionIcons();
  configureSelector();

  const defaultIndex = Math.max(0, pinionTemplates.findIndex(t => t.r === DEFAULT_STATE.r));
  selectTemplate(defaultIndex >= 0 ? defaultIndex : 0);
  updateModeButtons();
  drawRingArt();
  drawPinionModel();
  updateHoleInfo();
  setupUIEvents();
  setupPinionPointer();

  const snapshots = loadSnapshots();
  populateSnapshotSelect(snapshots);
  spacingRange.value = state.render.sampleSpacingPx;
  lineWidthRange.value = state.lineWidth;
  updatePlaybackSpeedControl();
  scheduleRender('init');
}

init().catch((err) => {
  console.error('初期化に失敗しました', err);
  statusText.textContent = '初期化に失敗しました';
});
