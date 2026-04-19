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
const clearQueueBtn = document.getElementById('clearQueueBtn');
const pairQueueList = document.getElementById('pairQueueList');
const shapeAssistCheckbox = document.getElementById('shapeAssistCheckbox');
const shapeHint = document.getElementById('shapeHint');

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
let pairQueue = [];
let shapeRecommendation = null;

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
  history.push(JSON.stringify({ segments, pairQueue }));
  if (history.length > 100) history.shift();
}

function stopAnimation() {
  animationState.running = false;
  if (animationState.rafId !== null) {
    cancelAnimationFrame(animationState.rafId);
    animationState.rafId = null;
  }
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function getPointerPos(evt) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((evt.clientX - rect.left) / rect.width) * canvas.width,
    y: ((evt.clientY - rect.top) / rect.height) * canvas.height,
  };
}

function buildInterpolationLines(job) {
  const segA = segments.find((s) => s.id === job.segmentAId);
  const segB = segments.find((s) => s.id === job.segmentBId);
  return core.buildInterpolationLines(segA, segB, job.directionA, job.directionB, job.divisions);
}

function resolveJobs(baseJob) {
  if (pairQueue.length) {
    return pairQueue.map((job) => ({ ...job, mode: baseJob.mode, intervalMs: baseJob.intervalMs }));
  }

  return [baseJob];
}

function rebuildAutoPairQueue() {
  const divisions = core.validateDivisions(divisionsInput.value);
  pairQueue = [];
  for (let i = 0; i + 1 < segments.length; i += 2) {
    pairQueue.push({
      segmentAId: segments[i].id,
      segmentBId: segments[i + 1].id,
      directionA: directionASelect.value,
      directionB: directionBSelect.value,
      divisions,
    });
  }
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

function drawShapeRecommendation() {
  if (!shapeRecommendation) return;

  const points = shapeRecommendation.idealVertices;
  if (!points.length) return;

  ctx.save();
  ctx.setLineDash([7, 5]);
  ctx.strokeStyle = '#f97316';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i += 1) {
    ctx.lineTo(points[i].x, points[i].y);
  }
  ctx.closePath();
  ctx.stroke();
  ctx.setLineDash([]);

  points.forEach((point) => {
    drawPoint(point, '#f97316');
  });

  ctx.restore();
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
  drawShapeRecommendation();
  drawDraftSegment();
}

function renderPairQueue() {
  pairQueueList.innerHTML = '';
  if (!pairQueue.length) {
    const li = document.createElement('li');
    li.textContent = 'queueは空です';
    pairQueueList.appendChild(li);
    return;
  }

  pairQueue.forEach((pair, index) => {
    const li = document.createElement('li');
    li.textContent = `${index + 1}. ${pair.segmentAId}(${pair.directionA}) ↔ ${pair.segmentBId}(${pair.directionB}) / N=${pair.divisions}`;
    pairQueueList.appendChild(li);
  });
}

function refreshSegmentUI() {
  rebuildAutoPairQueue();
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

  renderPairQueue();
  redraw();
}

function normalizeAngle(angle) {
  let result = angle;
  while (result < -Math.PI) result += Math.PI * 2;
  while (result > Math.PI) result -= Math.PI * 2;
  return result;
}

function detectPolygonCandidate() {
  if (segments.length < 3) return null;

  const threshold = 20;
  const endpointRefs = [];
  segments.forEach((segment) => {
    endpointRefs.push({ segmentId: segment.id, key: 'start', point: segment.start });
    endpointRefs.push({ segmentId: segment.id, key: 'end', point: segment.end });
  });

  const clusters = [];
  endpointRefs.forEach((ref) => {
    const matchIndex = clusters.findIndex((cluster) => distance(cluster.center, ref.point) <= threshold);
    if (matchIndex === -1) {
      clusters.push({ center: { ...ref.point }, refs: [ref] });
      return;
    }

    const cluster = clusters[matchIndex];
    cluster.refs.push(ref);
    const sum = cluster.refs.reduce((acc, item) => ({ x: acc.x + item.point.x, y: acc.y + item.point.y }), { x: 0, y: 0 });
    cluster.center = { x: sum.x / cluster.refs.length, y: sum.y / cluster.refs.length };
  });

  if (clusters.length < 3 || clusters.length !== segments.length) return null;

  const endpointToCluster = new Map();
  clusters.forEach((cluster, idx) => {
    cluster.refs.forEach((ref) => {
      endpointToCluster.set(`${ref.segmentId}:${ref.key}`, idx);
    });
  });

  const adjacency = Array.from({ length: clusters.length }, () => []);
  const degree = Array(clusters.length).fill(0);
  for (const segment of segments) {
    const a = endpointToCluster.get(`${segment.id}:start`);
    const b = endpointToCluster.get(`${segment.id}:end`);
    if (a === undefined || b === undefined || a === b) return null;
    adjacency[a].push(b);
    adjacency[b].push(a);
    degree[a] += 1;
    degree[b] += 1;
  }

  if (degree.some((d) => d !== 2)) return null;

  const orderedClusterIndex = [0];
  let previous = -1;
  let current = 0;
  while (orderedClusterIndex.length < clusters.length) {
    const candidates = adjacency[current].filter((idx) => idx !== previous);
    if (!candidates.length) return null;
    const next = candidates[0];
    if (orderedClusterIndex.includes(next)) return null;
    orderedClusterIndex.push(next);
    previous = current;
    current = next;
  }

  const firstNeighbors = adjacency[orderedClusterIndex[0]];
  if (!firstNeighbors.includes(orderedClusterIndex[orderedClusterIndex.length - 1])) return null;

  const vertices = orderedClusterIndex.map((index) => clusters[index].center);
  const centroid = vertices.reduce((acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }), { x: 0, y: 0 });
  centroid.x /= vertices.length;
  centroid.y /= vertices.length;

  const avgRadius = vertices.reduce((acc, p) => acc + distance(p, centroid), 0) / vertices.length;
  const baseAngle = Math.atan2(vertices[0].y - centroid.y, vertices[0].x - centroid.x);
  const idealVertices = vertices.map((_, i) => {
    const angle = baseAngle + (Math.PI * 2 * i) / vertices.length;
    return {
      x: centroid.x + Math.cos(angle) * avgRadius,
      y: centroid.y + Math.sin(angle) * avgRadius,
    };
  });

  const edgeLengths = vertices.map((p, i) => distance(p, vertices[(i + 1) % vertices.length]));
  const averageEdge = edgeLengths.reduce((acc, v) => acc + v, 0) / edgeLengths.length;
  const maxEdgeDiff = Math.max(...edgeLengths.map((v) => Math.abs(v - averageEdge)));

  const angles = vertices.map((point, i) => {
    const prev = vertices[(i - 1 + vertices.length) % vertices.length];
    const next = vertices[(i + 1) % vertices.length];
    const a1 = Math.atan2(prev.y - point.y, prev.x - point.x);
    const a2 = Math.atan2(next.y - point.y, next.x - point.x);
    return Math.abs(normalizeAngle(a2 - a1));
  });

  let label = `${vertices.length}角形`;
  if (vertices.length === 3) label = '三角形';
  if (vertices.length === 4) {
    const rightAngle = Math.PI / 2;
    const averageAngleDiff = angles.reduce((acc, value) => acc + Math.abs(value - rightAngle), 0) / angles.length;
    if (averageAngleDiff < 0.28 && maxEdgeDiff / averageEdge < 0.22) {
      label = '正方形';
    } else {
      label = '四角形';
    }
  }

  const clusterRank = new Map();
  orderedClusterIndex.forEach((clusterIndex, rank) => {
    clusterRank.set(clusterIndex, rank);
  });

  return {
    label,
    idealVertices,
    endpointToIdealVertex: endpointToCluster,
    clusterRank,
  };
}

function applyShapeAssistIfNeeded() {
  shapeRecommendation = detectPolygonCandidate();

  if (!shapeRecommendation) {
    shapeHint.textContent = '形状判定: まだ候補はありません';
    redraw();
    return;
  }

  shapeHint.textContent = `形状判定: ${shapeRecommendation.label} を検出。正図形ガイドを表示中`; 

  if (!shapeAssistCheckbox.checked) {
    redraw();
    return;
  }

  segments = segments.map((segment) => {
    const startCluster = shapeRecommendation.endpointToIdealVertex.get(`${segment.id}:start`);
    const endCluster = shapeRecommendation.endpointToIdealVertex.get(`${segment.id}:end`);
    if (startCluster === undefined || endCluster === undefined) return segment;

    return {
      ...segment,
      start: { ...shapeRecommendation.idealVertices[shapeRecommendation.clusterRank.get(startCluster)] },
      end: { ...shapeRecommendation.idealVertices[shapeRecommendation.clusterRank.get(endCluster)] },
    };
  });

  redraw();
  setStatus(`入力補助を適用: ${shapeRecommendation.label} として頂点を補正しました。`);
}

function validateBaseJob() {
  const divisions = core.validateDivisions(divisionsInput.value);
  if (segments.length < 2) throw new Error('線分が2本以上必要です。');

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
  const jobs = resolveJobs(job);
  if (!pairQueue.length && (!job.segmentAId || !job.segmentBId)) {
    throw new Error('Segment A/B を選択してください。');
  }

  interpolationLines = jobs.flatMap((pairJob) => buildInterpolationLines(pairJob));
  renderCursor = job.mode === 'instant' ? interpolationLines.length : 0;
  redraw();

  if (job.mode === 'instant') {
    setStatus(`Instant描画完了: ${interpolationLines.length}本 (${jobs.length}ペア)`);
    return;
  }

  setStatus(`Sequential描画開始: 0/${interpolationLines.length} (${jobs.length}ペア)`);
  runSequentialAnimation(job.intervalMs);
}

function undo() {
  if (!history.length) {
    setStatus('Undoできる操作がありません。');
    return;
  }
  stopAnimation();
  const previous = JSON.parse(history.pop());
  segments = previous.segments;
  pairQueue = previous.pairQueue || [];
  interpolationLines = [];
  renderCursor = 0;
  shapeRecommendation = null;
  shapeHint.textContent = '形状判定: まだ候補はありません';
  refreshSegmentUI();
  setStatus('1操作戻しました。');
}

function clearAll() {
  if (!segments.length) return;
  pushHistorySnapshot();
  stopAnimation();
  segments = [];
  pairQueue = [];
  interpolationLines = [];
  renderCursor = 0;
  shapeRecommendation = null;
  shapeHint.textContent = '形状判定: まだ候補はありません';
  refreshSegmentUI();
  setStatus('全線分をクリアしました。');
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
  applyShapeAssistIfNeeded();
  if (!shapeRecommendation) {
    const pairCount = pairQueue.length;
    const remainder = segments.length % 2;
    const remainderText = remainder ? '（末尾1本は次の線分待ち）' : '';
    setStatus(`${id} を追加しました。自動ペア数: ${pairCount}${remainderText}`);
  }
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

clearQueueBtn.addEventListener('click', () => {
  if (!segments.length) return;
  pushHistorySnapshot();
  stopAnimation();
  segments = [];
  interpolationLines = [];
  renderCursor = 0;
  pairQueue = [];
  shapeRecommendation = null;
  shapeHint.textContent = '形状判定: まだ候補はありません';
  refreshSegmentUI();
  setStatus('線分とQueueをクリアしました。');
});

generateBtn.addEventListener('click', () => {
  try {
    startRender(validateBaseJob());
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

[directionASelect, directionBSelect, divisionsInput].forEach((el) => {
  el.addEventListener('change', () => {
    rebuildAutoPairQueue();
    renderPairQueue();
  });
});

refreshSegmentUI();
setStatus('キャンバスをドラッグして線分を作成してください。');
