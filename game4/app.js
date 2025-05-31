/* --------------------------------------------------------------------------
   Apple Pencil なぞりゲーム – 拡張版 (2025-05-31)
   追加機能:
   1. 入力方法選択（ペン / 指どちらでも）
   2. 制限時間選択（10 / 20 / 30 秒）
   3. ゲーム中断ボタン（トップに戻る）
   4. 渦巻き形状（右回り・左回り）の追加
   5. ローカルハイスコア保存・表示
--------------------------------------------------------------------------- */
'use strict';

/* 1. ゲーム設定 ------------------------------------------------------------ */
const gameConfig = {
  canvasWidth: 600,
  canvasHeight: 400,
  lineWidth: 4,
  shapeColor: '#888888',
  userTraceColor: '#0066ff',
  vertexPassedColor: '#22cc88',
  vertexAllowableDistance: 7,
  edgeAllowableDistance: 10,
};

/* 2. 形状データ ------------------------------------------------------------ */
const shapes = {
  triangle: {
    name: '三角形',
    type: 'polygon',
    vertices: [
      { x: 300, y: 150 },
      { x: 250, y: 250 },
      { x: 350, y: 250 },
    ],
    difficulty: 1,
  },
  square: {
    name: '四角形',
    type: 'polygon',
    vertices: [
      { x: 250, y: 150 },
      { x: 350, y: 150 },
      { x: 350, y: 250 },
      { x: 250, y: 250 },
    ],
    difficulty: 2,
  },
  circle: {
    name: '円',
    type: 'circle',
    center: { x: 300, y: 200 },
    radius: 80,
    points: 40,
    difficulty: 3,
  },
  spiralCW: {
    name: '渦巻き（右）',
    type: 'spiral',
    center: { x: 300, y: 200 },
    radius: 10,       // 初期半径
    turns: 2,         // 2 回転
    points: 300,
    direction: 1,     // 時計回り
    difficulty: 4,
  },
  spiralCCW: {
    name: '渦巻き（左）',
    type: 'spiral',
    center: { x: 300, y: 200 },
    radius: 10,
    turns: 2,
    points: 300,
    direction: -1,    // 反時計回り
    difficulty: 4,
  },
};

/* 3. ゲーム状態 ------------------------------------------------------------ */
const gameState = {
  isPlaying: false,
  timeRemaining: 10,
  score: 0,
  currentPath: [],
  shapePath: [],
  verticesPassed: [],
  isDrawing: false,
  lastPoint: null,
  gameTimer: null,
  currentShape: 'triangle',
  inputMode: 'pen',       // 'pen' | 'any'
};

/* 4. DOM 参照 -------------------------------------------------------------- */
let previewCanvas, gameCanvas;
let previewCtx, ctx;
let startButton, playAgainButton, backToTopButton;
let startScreen, gameScreen, endScreen;
let timerDisplay, scoreDisplay, finalScoreDisplay, resultMessage, bestScoreDisplay;
let shapeSelector, timeSelector, inputModeRadios;

/* -------------------------------------------------------------------------- */
/* 5. 初期化                                                                 */
/* -------------------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', init);

function init() {
  cacheElements();
  setupCanvases();
  populateShapeSelector();
  populateBestScore();
  bindEvents();
  generateShapePath(shapes[gameState.currentShape]);
  showStartScreen();
}

function cacheElements() {
  previewCanvas      = document.getElementById('previewCanvas');
  gameCanvas         = document.getElementById('gameCanvas');
  previewCtx         = previewCanvas.getContext('2d');
  ctx                = gameCanvas.getContext('2d');

  startButton        = document.getElementById('startButton');
  playAgainButton    = document.getElementById('playAgainButton');
  backToTopButton    = document.getElementById('backToTopButton');

  startScreen        = document.getElementById('startScreen');
  gameScreen         = document.getElementById('gameScreen');
  endScreen          = document.getElementById('endScreen');

  timerDisplay       = document.getElementById('timer');
  scoreDisplay       = document.getElementById('score');
  finalScoreDisplay  = document.getElementById('finalScore');
  resultMessage      = document.getElementById('resultMessage');
  bestScoreDisplay   = document.getElementById('bestScore'); // optional

  shapeSelector      = document.getElementById('shapeSelector');
  timeSelector       = document.getElementById('timeSelector');
  inputModeRadios    = document.querySelectorAll('input[name="inputMode"]');
}

/* -------------------------------------------------------------------------- */
/* 6. Canvas Hi-DPI スケーリング                                              */
/* -------------------------------------------------------------------------- */
function setupCanvas(canvasEl) {
  const dpr = window.devicePixelRatio || 1;
  canvasEl.width  = gameConfig.canvasWidth  * dpr;
  canvasEl.height = gameConfig.canvasHeight * dpr;
  canvasEl.style.width  = `${gameConfig.canvasWidth}px`;
  canvasEl.style.height = `${gameConfig.canvasHeight}px`;
  const context = canvasEl.getContext('2d');
  context.scale(dpr, dpr);
  context.lineCap  = 'round';
  context.lineJoin = 'round';
  return context;
}
function setupCanvases() {
  previewCtx = setupCanvas(previewCanvas);
  ctx        = setupCanvas(gameCanvas);
}

/* -------------------------------------------------------------------------- */
/* 7. 形状パス生成                                                            */
/* -------------------------------------------------------------------------- */
function generateShapePath(shape) {
  gameState.shapePath.length = 0;
  if (shape.type === 'polygon') {
    generatePolygonPath(shape.vertices);
  } else if (shape.type === 'circle') {
    generateCirclePath(shape.center, shape.radius, shape.points);
  } else if (shape.type === 'spiral') {
    generateSpiralPath(shape);
  }
}

function generatePolygonPath(vertices) {
  const res = 2; // points per px
  vertices.forEach((v, i) => {
    const n  = vertices[(i + 1) % vertices.length];
    const dx = n.x - v.x;
    const dy = n.y - v.y;
    const dist  = Math.hypot(dx, dy);
    const steps = Math.max(1, Math.floor(dist * res));
    for (let j = 0; j <= steps; j++) {
      const t = j / steps;
      gameState.shapePath.push({
        x: v.x + dx * t,
        y: v.y + dy * t,
        edge: i,
        isVertex: j === 0,
        vertexIndex: i,
      });
    }
  });
}
function generateCirclePath(c, r, pts) {
  const step = (2 * Math.PI) / pts;
  for (let i = 0; i < pts; i++) {
    const a = i * step;
    gameState.shapePath.push({
      x: c.x + r * Math.cos(a),
      y: c.y + r * Math.sin(a),
      edge: i,
      isVertex: false,
      vertexIndex: -1,
    });
  }
}
function generateSpiralPath(s) {
  const { center, radius: r0, turns, points, direction } = s;
  const maxTheta = 2 * Math.PI * turns * direction;
  const b = (Math.min(gameConfig.canvasWidth, gameConfig.canvasHeight) / 2 - r0) / maxTheta;
  for (let i = 0; i <= points; i++) {
    const ratio = i / points;
    const theta = maxTheta * ratio;
    const r = r0 + b * theta;
    gameState.shapePath.push({
      x: center.x + r * Math.cos(theta),
      y: center.y + r * Math.sin(theta),
      edge: Math.floor((ratio * turns * 12)) % 12, // 12 セグメントに分割
      isVertex: false,
      vertexIndex: -1,
    });
  }
}

/* -------------------------------------------------------------------------- */
/* 8. 形状セレクター                                                          */
/* -------------------------------------------------------------------------- */
function populateShapeSelector() {
  Object.entries(shapes).forEach(([key, s]) => {
    const opt = document.createElement('option');
    opt.value = key;
    opt.textContent = `${s.name} (難易度: ${'★'.repeat(s.difficulty)})`;
    shapeSelector.appendChild(opt);
  });
  shapeSelector.value = gameState.currentShape;
  shapeSelector.addEventListener('change', () => {
    gameState.currentShape = shapeSelector.value;
    generateShapePath(shapes[gameState.currentShape]);
    if (!gameState.isPlaying) drawShape(shapes[gameState.currentShape], previewCtx);
    populateBestScore();
  });
}

/* -------------------------------------------------------------------------- */
/* 9. イベントバインド                                                        */
/* -------------------------------------------------------------------------- */
function bindEvents() {
  startButton.addEventListener('click', startGame);
  playAgainButton.addEventListener('click', restartGame);
  backToTopButton?.addEventListener('click', () => {
    clearInterval(gameState.gameTimer);
    gameState.isPlaying = false;
    showStartScreen();
  });

  gameCanvas.addEventListener('pointerdown', pointerDown);
  gameCanvas.addEventListener('pointermove', pointerMove);
  gameCanvas.addEventListener('pointerup', pointerUp);
  gameCanvas.addEventListener('pointercancel', pointerUp);

  // Prevent scrolling on touch
  ['touchstart', 'touchmove', 'touchend'].forEach(ev =>
    gameCanvas.addEventListener(ev, e => e.preventDefault(), { passive: false }),
  );

  // 入力モード変更
  inputModeRadios.forEach(r =>
    r.addEventListener('change', () => {
      gameState.inputMode = document.querySelector('input[name="inputMode"]:checked').value;
    }),
  );
}

/* -------------------------------------------------------------------------- */
/* 10. ポインタ操作                                                           */
/* -------------------------------------------------------------------------- */
function allowPointerType(pt) {
  return gameState.inputMode === 'any' || pt === 'pen' || pt === 'mouse' || pt === 'touch';
}

function pointerDown(e) {
  if (!gameState.isPlaying || !allowPointerType(e.pointerType)) return;
  e.preventDefault();
  const p = getCanvasPoint(e);
  gameState.isDrawing   = true;
  gameState.currentPath = [p];
  gameState.lastPoint   = p;
  resetVerticesPassed();
  ctx.beginPath();
  ctx.moveTo(p.x, p.y);
}
function pointerMove(e) {
  if (!gameState.isPlaying || !gameState.isDrawing || !allowPointerType(e.pointerType)) return;
  e.preventDefault();
  const p = getCanvasPoint(e);
  ctx.lineTo(p.x, p.y);
  ctx.strokeStyle = gameConfig.userTraceColor;
  ctx.lineWidth   = gameConfig.lineWidth;
  ctx.stroke();
  gameState.currentPath.push(p);
  gameState.lastPoint = p;
  checkVertexPassing(p);
  checkLoopCompletion();
}
function pointerUp() {
  gameState.isDrawing = false;
  gameState.lastPoint = null;
}
function getCanvasPoint(e) {
  const rect = gameCanvas.getBoundingClientRect();
  const scaleX = gameConfig.canvasWidth  / rect.width;
  const scaleY = gameConfig.canvasHeight / rect.height;
  return {
    x: (e.clientX - rect.left) * scaleX,
    y: (e.clientY - rect.top)  * scaleY,
  };
}

/* -------------------------------------------------------------------------- */
/* 11. 描画ユーティリティ                                                     */
/* -------------------------------------------------------------------------- */
function drawShape(shape, target = ctx) {
  if (!target) return;
  target.clearRect(0, 0, gameConfig.canvasWidth, gameConfig.canvasHeight);

  if (shape.type === 'polygon') {
    drawPolygon(shape.vertices, target);
  } else if (shape.type === 'circle') {
    drawCircle(shape.center, shape.radius, target);
  } else if (shape.type === 'spiral') {
    drawSpiral(shape, target);
  }
}
function drawPolygon(verts, c) {
  c.beginPath();
  c.moveTo(verts[0].x, verts[0].y);
  verts.slice(1).forEach(v => c.lineTo(v.x, v.y));
  c.closePath();
  c.strokeStyle = gameConfig.shapeColor;
  c.lineWidth   = gameConfig.lineWidth + 2;
  c.stroke();
  verts.forEach((v, i) => {
    c.beginPath();
    c.arc(v.x, v.y, 4, 0, Math.PI * 2);
    c.fillStyle = gameState.verticesPassed[i] ? gameConfig.vertexPassedColor : gameConfig.shapeColor;
    c.fill();
  });
}
function drawCircle(center, radius, c) {
  c.beginPath();
  c.arc(center.x, center.y, radius, 0, Math.PI * 2);
  c.strokeStyle = gameConfig.shapeColor;
  c.lineWidth   = gameConfig.lineWidth + 2;
  c.stroke();
}
function drawSpiral(s, c) {
  const path = gameState.shapePath;
  c.beginPath();
  c.moveTo(path[0].x, path[0].y);
  path.slice(1).forEach(p => c.lineTo(p.x, p.y));
  c.strokeStyle = gameConfig.shapeColor;
  c.lineWidth   = gameConfig.lineWidth + 2;
  c.stroke();
}

/* -------------------------------------------------------------------------- */
/* 12. 頂点判定                                                               */
/* -------------------------------------------------------------------------- */
function resetVerticesPassed() {
  const s = shapes[gameState.currentShape];
  gameState.verticesPassed = s.type === 'polygon' ? new Array(s.vertices.length).fill(false) : [false];
}
function checkVertexPassing(p) {
  const s = shapes[gameState.currentShape];
  if (s.type !== 'polygon') return;
  s.vertices.forEach((v, i) => {
    if (!gameState.verticesPassed[i] && Math.hypot(p.x - v.x, p.y - v.y) <= gameConfig.vertexAllowableDistance) {
      gameState.verticesPassed[i] = true;
      // visual feedback
      ctx.save();
      ctx.fillStyle = gameConfig.vertexPassedColor;
      ctx.beginPath();
      ctx.arc(v.x, v.y, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  });
}

/* -------------------------------------------------------------------------- */
/* 13. ループ判定                                                             */
/* -------------------------------------------------------------------------- */
function checkLoopCompletion() {
  if (gameState.currentPath.length < 50) return;
  const s = shapes[gameState.currentShape];
  if (s.type === 'polygon' && !gameState.verticesPassed.every(Boolean)) return;

  const segments =
    s.type === 'polygon' ? s.vertices.length :
    s.type === 'circle'  ? 12 :
    12; // spiral

  const covered  = new Array(segments).fill(false);
  const segIndex = sp => sp.edge % segments;

  gameState.currentPath.forEach(up => {
    gameState.shapePath.forEach(sp => {
      if (Math.hypot(up.x - sp.x, up.y - sp.y) <= gameConfig.edgeAllowableDistance)
        covered[segIndex(sp)] = true;
    });
  });

  const start = gameState.currentPath[0];
  const end   = gameState.currentPath[gameState.currentPath.length - 1];
  const closed = Math.hypot(end.x - start.x, end.y - start.y) <= gameConfig.edgeAllowableDistance * 2;

  if (covered.every(Boolean) && closed) {
    gameState.score += 1;
    updateScore();
    gameState.currentPath = [];
    resetVerticesPassed();
    scoreDisplay.animate([{ transform: 'scale(1.2)' }, { transform: 'scale(1)' }], { duration: 200 });
  }
}

/* -------------------------------------------------------------------------- */
/* 14. 画面ヘルパー                                                          */
/* -------------------------------------------------------------------------- */
function updateTimer() {
  timerDisplay.textContent = gameState.timeRemaining;
  timerDisplay.classList.remove('warning', 'danger');
  if (gameState.timeRemaining <= 3) timerDisplay.classList.add('danger');
  else if (gameState.timeRemaining <= 5) timerDisplay.classList.add('warning');
}
function updateScore() {
  scoreDisplay.textContent = gameState.score;
}
function populateBestScore() {
  if (!bestScoreDisplay) return;
  const key = bestScoreKey();
  const best = localStorage.getItem(key);
  bestScoreDisplay.textContent = best ? `ベスト: ${best}` : '';
}
function showStartScreen() {
  startScreen.classList.remove('hidden');
  gameScreen.classList.add('hidden');
  endScreen.classList.add('hidden');
  drawShape(shapes[gameState.currentShape], previewCtx);
  populateBestScore();
}
function showGameScreen() {
  startScreen.classList.add('hidden');
  gameScreen.classList.remove('hidden');
  endScreen.classList.add('hidden');
  drawShape(shapes[gameState.currentShape], ctx);
}
function showEndScreen() {
  startScreen.classList.add('hidden');
  gameScreen.classList.add('hidden');
  endScreen.classList.remove('hidden');

  finalScoreDisplay.textContent = gameState.score;
  const diff = shapes[gameState.currentShape].difficulty;
  const excellent = 5 - diff + 1;
  const good      = 3 - Math.floor(diff / 2);
  let msg;
  if (gameState.score >= excellent) msg = '素晴らしい！🎉';
  else if (gameState.score >= good) msg = '良い調子です！👍';
  else if (gameState.score >= 1) msg = 'もう少し！💪';
  else msg = '次回頑張りましょう！🔥';
  resultMessage.textContent = msg;
}

/* -------------------------------------------------------------------------- */
/* 15. ゲーム制御                                                             */
/* -------------------------------------------------------------------------- */
function startGame() {
  clearInterval(gameState.gameTimer);

  // 入力モード・タイムリミットを取得
  gameState.inputMode = document.querySelector('input[name="inputMode"]:checked')?.value || 'pen';
  gameState.timeRemaining = parseInt(timeSelector.value, 10) || 10;

  Object.assign(gameState, {
    isPlaying: true,
    score: 0,
    currentPath: [],
    verticesPassed: [],
    isDrawing: false,
    lastPoint: null,
  });

  generateShapePath(shapes[gameState.currentShape]);
  showGameScreen();
  updateTimer();
  updateScore();

  ctx.clearRect(0, 0, gameConfig.canvasWidth, gameConfig.canvasHeight);
  drawShape(shapes[gameState.currentShape], ctx);

  gameState.gameTimer = setInterval(() => {
    if (--gameState.timeRemaining <= 0) return endGame();
    updateTimer();
  }, 1000);
}

function endGame() {
  gameState.isPlaying = false;
  gameState.isDrawing = false;
  clearInterval(gameState.gameTimer);

  // ハイスコア保存
  const key = bestScoreKey();
  const best = Number(localStorage.getItem(key) || 0);
  if (gameState.score > best) localStorage.setItem(key, gameState.score);

  showEndScreen();
}

function restartGame() {
  ctx.clearRect(0, 0, gameConfig.canvasWidth, gameConfig.canvasHeight);
  startGame();
}

/* -------------------------------------------------------------------------- */
/* 16. Utility                                                                */
/* -------------------------------------------------------------------------- */
function bestScoreKey() {
  return `bestScore_${gameState.currentShape}_${gameState.timeRemaining}`;
}
