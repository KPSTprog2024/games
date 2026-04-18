const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const segmentListEl = document.getElementById('segmentList');
const segmentASelect = document.getElementById('segmentASelect');
const segmentBSelect = document.getElementById('segmentBSelect');
const directionASelect = document.getElementById('directionASelect');
const directionBSelect = document.getElementById('directionBSelect');
const divisionsInput = document.getElementById('divisionsInput');
const modeSelect = document.getElementById('modeSelect');
const intervalInput = document.getElementById('intervalInput');
const stringColorInput = document.getElementById('stringColorInput');
const stringWidthInput = document.getElementById('stringWidthInput');
const statusBar = document.getElementById('statusBar');
const metricsOutput = document.getElementById('metricsOutput');

const generateBtn = document.getElementById('generateBtn');
const stopBtn = document.getElementById('stopBtn');
const resetRenderBtn = document.getElementById('resetRenderBtn');
const undoBtn = document.getElementById('undoBtn');
const clearBtn = document.getElementById('clearBtn');
const exportBtn = document.getElementById('exportBtn');
const metricsBtn = document.getElementById('metricsBtn');

const core = window.StringArtCore;

let segments = [];
let history = [];
let interpolationLines = [];
let renderCursor = 0;

let drawing = false;
let drawStart = null;
let drawCurrent = null;

let animationState = {
  running: false,
  rafId: null,
  lastTick: 0,
  intervalMs: 30,
};

function setStatus(message) {
  statusBar.textContent = message;
}

function pushHistorySnapshot() {
  history.push(JSON.stringify(segments));
  if (history.length > 100) history.shift();
}

function stopAnimation() {
  animationState.running = false;
  if (animationState.rafId !== null) {
    cancelAnimationFrame(animationState.rafId);
    animationState.rafId = null;
  }
}

function undo() {
  if (!history.length) {
    setStatus('Undoできる操作がありません。');
    return;
  }
  stopAnimation();
  segments = JSON.parse(history.pop());
  interpolationLines = [];
  renderCursor = 0;
  refreshSegmentUI();
  redraw();
  setStatus('1操作戻しました。');
}

function clearAll() {
  if (!segments.length) return;
  pushHistorySnapshot();
  stopAnimation();
  segments = [];
  interpolationLines = [];
  renderCursor = 0;
  refreshSegmentUI();
  redraw();
  setStatus('全線分をクリアしました。');
}

function buildInterpolationLines(job) {
  const segA = segments.find((s) => s.id === job.segmentAId);
  const segB = segments.find((s) => s.id === job.segmentBId);
  return core.buildInterpolationLines(segA, segB, job.directionA, job.directionB, job.divisions);
}

function getPointerPos(evt) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((evt.clientX - rect.left) / rect.width) * canvas.width,
    y: ((evt.clientY - rect.top) / rect.height) * canvas.height,
  };
}

function drawPoint(point, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
  ctx.fill();
}

function drawBaseSegments() {
  segments.forEach((s) => {
    const isA = segmentASelect.value === s.id;
    const isB = segmentBSelect.value === s.id;

    ctx.lineWidth = isA || isB ? 2.2 : 1.4;
    ctx.strokeStyle = isA ? '#2563eb' : isB ? '#0f766e' : '#202124';
    ctx.beginPath();
    ctx.moveTo(s.start.x, s.start.y);
    ctx.lineTo(s.end.x, s.end.y);
    ctx.stroke();

    drawPoint(s.start, '#2563eb');
    drawPoint(s.end, '#db2777');

    ctx.font = '12px sans-serif';
    ctx.fillStyle = '#111827';
    ctx.fillText(s.id, (s.start.x + s.end.x) / 2 + 6, (s.start.y + s.end.y) / 2 - 6);
  });
}

function drawInterpolationLines() {
  ctx.strokeStyle = stringColorInput.value;
  ctx.lineWidth = Number(stringWidthInput.value);

  interpolationLines.slice(0, renderCursor).forEach((line) => {
    ctx.beginPath();
    ctx.moveTo(line.p0.x, line.p0.y);
    ctx.lineTo(line.p1.x, line.p1.y);
    ctx.stroke();
  });
}

function drawDraftSegment() {
  if (!drawing || !drawStart || !drawCurrent) return;
  ctx.strokeStyle = '#9ca3af';
  ctx.setLineDash([8, 6]);
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(drawStart.x, drawStart.y);
  ctx.lineTo(drawCurrent.x, drawCurrent.y);
  ctx.stroke();
  ctx.setLineDash([]);
}

function redraw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBaseSegments();
  drawInterpolationLines();
  drawDraftSegment();
}

function refreshSegmentUI() {
  segmentListEl.innerHTML = '';
  segments.forEach((s) => {
    const li = document.createElement('li');
    li.textContent = `${s.id}: (${Math.round(s.start.x)}, ${Math.round(s.start.y)}) → (${Math.round(s.end.x)}, ${Math.round(s.end.y)})`;
    segmentListEl.appendChild(li);
  });

  const prevA = segmentASelect.value;
  const prevB = segmentBSelect.value;
  const options = ['<option value="">-- choose --</option>']
    .concat(segments.map((s) => `<option value="${s.id}">${s.id}</option>`))
    .join('');

  segmentASelect.innerHTML = options;
  segmentBSelect.innerHTML = options;

  if (segments.some((s) => s.id === prevA)) segmentASelect.value = prevA;
  if (segments.some((s) => s.id === prevB)) segmentBSelect.value = prevB;

  if (!segmentASelect.value && segments[0]) segmentASelect.value = segments[0].id;
  if (!segmentBSelect.value && segments[1]) segmentBSelect.value = segments[1].id;

  redraw();
}

function validateJob() {
  const divisions = core.validateDivisions(divisionsInput.value);
  if (segments.length < 2) throw new Error('線分が2本以上必要です。');
  if (!segmentASelect.value || !segmentBSelect.value) throw new Error('Segment A/B を選択してください。');
  return {
    segmentAId: segmentASelect.value,
    segmentBId: segmentBSelect.value,
    directionA: directionASelect.value,
    directionB: directionBSelect.value,
    divisions,
    mode: modeSelect.value,
    intervalMs: Math.max(5, Number(intervalInput.value) || 30),
  };
}

function runSequentialAnimation(intervalMs) {
  animationState.running = true;
  animationState.lastTick = performance.now();
  animationState.intervalMs = intervalMs;

  const step = (ts) => {
    if (!animationState.running) return;

    const elapsed = ts - animationState.lastTick;
    if (elapsed >= animationState.intervalMs) {
      const steps = Math.max(1, Math.floor(elapsed / animationState.intervalMs));
      renderCursor = Math.min(interpolationLines.length, renderCursor + steps);
      animationState.lastTick = ts;
      redraw();
      setStatus(`Sequential描画中: ${renderCursor}/${interpolationLines.length}`);
    }

    if (renderCursor >= interpolationLines.length) {
      stopAnimation();
      setStatus(`Sequential描画完了: ${interpolationLines.length}本`);
      return;
    }

    animationState.rafId = requestAnimationFrame(step);
  };

  animationState.rafId = requestAnimationFrame(step);
}

function startRender(job) {
  stopAnimation();
  interpolationLines = buildInterpolationLines(job);
  renderCursor = job.mode === 'instant' ? interpolationLines.length : 0;
  redraw();

  if (job.mode === 'instant') {
    setStatus(`Instant描画完了: ${interpolationLines.length}本`);
    return;
  }

  setStatus(`Sequential描画開始: 0/${interpolationLines.length}`);
  runSequentialAnimation(job.intervalMs);
}

function resetRender() {
  stopAnimation();
  interpolationLines = [];
  renderCursor = 0;
  redraw();
  setStatus('補間描画をリセットしました。');
}

function exportPng() {
  const url = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.href = url;
  link.download = `string-art-${Date.now()}.png`;
  link.click();
  setStatus('PNGを書き出しました。');
}

function onPointerDown(evt) {
  canvas.setPointerCapture(evt.pointerId);
  drawStart = getPointerPos(evt);
  drawCurrent = drawStart;
  drawing = true;
  redraw();
}

function onPointerMove(evt) {
  if (!drawing) return;
  drawCurrent = getPointerPos(evt);
  redraw();
}

function onPointerUp(evt) {
  if (!drawing) return;
  const end = getPointerPos(evt);
  drawing = false;

  const length = Math.hypot(end.x - drawStart.x, end.y - drawStart.y);
  if (length < 4) {
    drawStart = null;
    drawCurrent = null;
    redraw();
    setStatus('短すぎる線分は追加されません。');
    return;
  }

  pushHistorySnapshot();
  const id = `S${String(segments.length + 1).padStart(2, '0')}`;
  segments.push({ id, start: drawStart, end });
  drawStart = null;
  drawCurrent = null;
  refreshSegmentUI();
  setStatus(`${id} を追加しました。`);
}

function runMetrics() {
  if (segments.length < 2 || !segmentASelect.value || !segmentBSelect.value) {
    setStatus('Metrics実行には線分2本以上とA/B選択が必要です。');
    return;
  }

  const cases = [50, 100, 200];
  const output = [];

  cases.forEach((divisions) => {
    const job = {
      segmentAId: segmentASelect.value,
      segmentBId: segmentBSelect.value,
      directionA: directionASelect.value,
      directionB: directionBSelect.value,
      divisions,
    };

    const t0 = performance.now();
    const lines = buildInterpolationLines(job);
    const t1 = performance.now();

    const firstLine = lines[0];
    const drawStartMs = performance.now();
    ctx.beginPath();
    ctx.moveTo(firstLine.p0.x, firstLine.p0.y);
    ctx.lineTo(firstLine.p1.x, firstLine.p1.y);
    ctx.stroke();
    const drawEndMs = performance.now();

    output.push({
      divisions,
      buildMs: (t1 - t0).toFixed(2),
      firstDrawMs: (drawEndMs - drawStartMs).toFixed(2),
      lineCount: lines.length,
    });
  });

  metricsOutput.textContent = [
    'Metrics Results (local runtime):',
    ...output.map((r) => `N=${r.divisions}: build=${r.buildMs}ms, firstDraw=${r.firstDrawMs}ms, lines=${r.lineCount}`),
  ].join('\n');

  redraw();
  setStatus('Metricsを更新しました。');
}

canvas.addEventListener('pointerdown', onPointerDown);
canvas.addEventListener('pointermove', onPointerMove);
canvas.addEventListener('pointerup', onPointerUp);
canvas.addEventListener('pointerleave', onPointerUp);

[segmentASelect, segmentBSelect, stringColorInput, stringWidthInput].forEach((el) => {
  el.addEventListener('change', redraw);
});

generateBtn.addEventListener('click', () => {
  try {
    startRender(validateJob());
  } catch (error) {
    setStatus(error.message);
  }
});

stopBtn.addEventListener('click', () => {
  stopAnimation();
  setStatus('描画を停止しました。');
});

resetRenderBtn.addEventListener('click', resetRender);
undoBtn.addEventListener('click', undo);
clearBtn.addEventListener('click', clearAll);
exportBtn.addEventListener('click', exportPng);
metricsBtn.addEventListener('click', runMetrics);

window.addEventListener('keydown', (evt) => {
  if (evt.key.toLowerCase() === 'g') generateBtn.click();
  if (evt.key.toLowerCase() === 'u') undoBtn.click();
});

refreshSegmentUI();
setStatus('キャンバスをドラッグして線分を作成してください。');
