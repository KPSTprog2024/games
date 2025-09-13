// グローバル変数
let cells = []; // 2次元配列でセルの状態を管理
let rows, cols;
let cellSize = 12; // デフォルトのセルサイズ
let canvasWidth, canvasHeight;
let isDragging = false;
let lastPaintedCell = { x: -1, y: -1 };
let isCanvasReady = false;
let canvas; // キャンバス参照を保存

// 重要：すべてのセルの初期色相を統一（赤=0度）
const GLOBAL_HUE_START = 0; // 絶対に変更されない定数として定義

// 設定値（application_data_jsonから取得）
const config = {
  defaultRows: 30,
  defaultCols: 40,
  minCellSize: 8,
  maxCellSize: 24,
  defaultCellSize: 12,
  maxCanvasWidth: 800,
  maxCanvasHeight: 600,
  hueStep: 30, // 色相の進行ステップ
  saturation: 100,
  brightness: 100,
  neighborRadius: 1, // 近傍セルの範囲
  throttleDelay: 100 // スライダーのスロットリング遅延
};

// スロットリング用のタイマー
let sliderThrottleTimer = null;

// DOM要素の初期化（DOMContentLoaded後に実行）
document.addEventListener('DOMContentLoaded', function() {
  console.log('🔧 DOMContentLoaded - DOM操作を開始します');
  
  // 少し遅らせてp5.jsの初期化を待つ
  setTimeout(() => {
    setupSlider();
    setupClearButton();
    setupTouchPrevention();
    console.log('✅ すべてのDOM操作が完了しました');
  }, 100);
});

function setup() {
  console.log('🎨 p5.js setup()を開始します');
  
  // キャンバスサイズの計算
  calculateCanvasSize();
  
  // キャンバスを作成してコンテナに配置
  canvas = createCanvas(canvasWidth, canvasHeight);
  canvas.parent('canvas-container');
  
  // HSB色空間を使用（色相: 0-360, 彩度: 0-100, 明度: 0-100）
  colorMode(HSB, 360, 100, 100);
  
  // セル配列の初期化
  initializeCells();
  
  // キャンバス準備完了
  isCanvasReady = true;
  
  console.log('🌈 p5.jsキャンバス初期化完了');
  console.log(`📐 サイズ: ${canvasWidth}x${canvasHeight} (${cols}x${rows}セル)`);
  console.log(`🎨 初期色相: ${GLOBAL_HUE_START}度（赤）`);
}

function draw() {
  if (!isCanvasReady) return;
  
  // 背景を描画（薄いグレー）
  background(0, 0, 95);
  
  // グリッドの描画
  drawGrid();
  
  // 彩色済みセルの描画
  drawCells();
}

// スライダーの設定（確実な動作を保証）
function setupSlider() {
  const slider = document.getElementById('cellSizeSlider');
  const display = document.getElementById('cellSizeDisplay');
  
  if (!slider || !display) {
    console.error('❌ スライダー要素が見つかりません');
    setTimeout(setupSlider, 100);
    return;
  }
  
  console.log('🎛️ スライダーの初期化を開始します');
  
  // 初期表示を更新
  updateSliderDisplay(slider.value);
  cellSize = parseInt(slider.value);
  
  // inputイベントでリアルタイム更新
  slider.addEventListener('input', function(event) {
    const newValue = parseInt(event.target.value);
    console.log('🎛️ スライダー input:', newValue);
    
    // 表示の即座更新
    updateSliderDisplay(newValue);
    
    // スロットリング処理でキャンバス更新
    if (sliderThrottleTimer) {
      clearTimeout(sliderThrottleTimer);
    }
    
    sliderThrottleTimer = setTimeout(() => {
      updateCellSize(newValue);
    }, config.throttleDelay);
  });
  
  // changeイベントでも設定（保険）
  slider.addEventListener('change', function(event) {
    const newValue = parseInt(event.target.value);
    console.log('🎛️ スライダー change:', newValue);
    updateSliderDisplay(newValue);
    updateCellSize(newValue);
  });
  
  console.log('✅ スライダーのイベントリスナーが設定されました');
}

// スライダー表示の更新
function updateSliderDisplay(value) {
  const display = document.getElementById('cellSizeDisplay');
  if (display) {
    display.textContent = `セルサイズ: ${value}px`;
  }
}

// セルサイズ更新処理
function updateCellSize(newSize) {
  if (newSize === cellSize) {
    return; // 変更がない場合はスキップ
  }
  
  console.log('🔄 セルサイズを更新:', cellSize, '→', newSize);
  
  cellSize = newSize;
  
  // キャンバスが準備できていない場合は後で更新
  if (!isCanvasReady) {
    console.log('⏳ キャンバス準備完了後に更新予定');
    return;
  }
  
  // キャンバスサイズを再計算
  calculateCanvasSize();
  
  // キャンバスをリサイズ
  resizeCanvas(canvasWidth, canvasHeight);
  
  // セル配列を再初期化（描画をクリア）
  initializeCells();
  
  console.log('✅ キャンバスが新しいセルサイズで再構築されました');
}

// クリアボタンの設定（確実な動作を保証）
function setupClearButton() {
  const clearBtn = document.getElementById('clearBtn');
  
  if (!clearBtn) {
    console.error('❌ クリアボタンが見つかりません');
    setTimeout(setupClearButton, 100);
    return;
  }
  
  console.log('🗑️ クリアボタンの初期化を開始します');
  
  // クリックイベントリスナーを設定
  clearBtn.addEventListener('click', handleClearClick);
  
  console.log('✅ クリアボタンのイベントリスナーが設定されました');
}

function handleClearClick(e) {
  console.log('🗑️ クリアボタンがクリックされました');
  
  e.preventDefault();
  e.stopPropagation();
  
  clearCanvas();
}

function calculateCanvasSize() {
  // 利用可能なスペースを計算
  const availableWidth = Math.min(window.innerWidth - 100, config.maxCanvasWidth);
  const availableHeight = Math.min(window.innerHeight * 0.5, config.maxCanvasHeight);
  
  // グリッドサイズを計算
  cols = Math.floor(availableWidth / cellSize);
  rows = Math.floor(availableHeight / cellSize);
  
  // 最小サイズを確保
  cols = Math.max(20, cols);
  rows = Math.max(15, rows);
  
  // キャンバスサイズを設定
  canvasWidth = cols * cellSize;
  canvasHeight = rows * cellSize;
  
  console.log(`📐 キャンバスサイズ計算: ${canvasWidth}x${canvasHeight} (${cols}x${rows}セル, ${cellSize}px)`);
}

// セル配列の完全な初期化
function initializeCells() {
  cells = [];
  for (let y = 0; y < rows; y++) {
    cells[y] = [];
    for (let x = 0; x < cols; x++) {
      cells[y][x] = null; // 未彩色状態はnull
    }
  }
  console.log('🔄 セル配列を初期化:', rows, 'x', cols);
}

function drawGrid() {
  stroke(0, 0, 85, 50);
  strokeWeight(0.5);
  
  // 縦線
  for (let x = 0; x <= cols; x++) {
    line(x * cellSize, 0, x * cellSize, canvasHeight);
  }
  
  // 横線
  for (let y = 0; y <= rows; y++) {
    line(0, y * cellSize, canvasWidth, y * cellSize);
  }
}

// 彩色済みセルのみを描画（パフォーマンス最適化）
function drawCells() {
  noStroke();
  
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (cells[y][x] !== null) {
        // HSB色空間で色を設定
        fill(cells[y][x], config.saturation, config.brightness);
        rect(x * cellSize + 1, y * cellSize + 1, cellSize - 2, cellSize - 2);
      }
    }
  }
}

// 単一セルの塗装処理
function paintCell(x, y) {
  // 境界チェック
  if (x < 0 || x >= cols || y < 0 || y >= rows) {
    return;
  }
  
  if (cells[y][x] === null) {
    // 初回塗り：必ずGLOBAL_HUE_START（赤=0度）から開始
    cells[y][x] = GLOBAL_HUE_START;
    console.log(`🎨 セル[${x},${y}]を初回塗装 - 色相: ${GLOBAL_HUE_START}度`);
  } else {
    // 2回目以降：色相を30度進める（虹色循環）
    const oldHue = cells[y][x];
    cells[y][x] = (cells[y][x] + config.hueStep) % 360;
    console.log(`🌈 セル[${x},${y}]を再塗装 - 色相: ${oldHue}度 → ${cells[y][x]}度`);
  }
}

// 座標をグリッド位置に変換
function getGridPosition(x, y) {
  const gridX = Math.floor(x / cellSize);
  const gridY = Math.floor(y / cellSize);
  return { x: gridX, y: gridY };
}

// マウスイベント処理
function mousePressed() {
  if (!isCanvasReady) {
    console.log('⚠️ キャンバス未準備のためクリックを無視');
    return false;
  }
  
  if (mouseX >= 0 && mouseX < canvasWidth && mouseY >= 0 && mouseY < canvasHeight) {
    const pos = getGridPosition(mouseX, mouseY);
    console.log(`🖱️ マウスクリック: (${mouseX}, ${mouseY}) → セル[${pos.x}, ${pos.y}]`);
    
    paintCell(pos.x, pos.y);
    lastPaintedCell = pos;
    isDragging = true;
    return false; // デフォルトイベントを防止
  }
}

function mouseDragged() {
  if (!isCanvasReady || !isDragging) {
    return false;
  }
  
  if (mouseX >= 0 && mouseX < canvasWidth && mouseY >= 0 && mouseY < canvasHeight) {
    const pos = getGridPosition(mouseX, mouseY);
    // 前回と異なるセルの場合のみ塗る（スムーズな線描画）
    if (pos.x !== lastPaintedCell.x || pos.y !== lastPaintedCell.y) {
      paintCell(pos.x, pos.y);
      lastPaintedCell = pos;
    }
    return false;
  }
}

function mouseReleased() {
  isDragging = false;
  lastPaintedCell = { x: -1, y: -1 };
}

// タッチイベント処理（モバイル対応）
function touchStarted() {
  if (!isCanvasReady) {
    console.log('⚠️ キャンバス未準備のためタッチを無視');
    return true;
  }

  if (touches.length === 1) {
    const touch = touches[0];
    // キャンバス内のタッチのみ処理
    if (touch.x >= 0 && touch.x < canvasWidth && touch.y >= 0 && touch.y < canvasHeight) {
      const pos = getGridPosition(touch.x, touch.y);
      console.log(`👆 タッチ開始: (${touch.x}, ${touch.y}) → セル[${pos.x}, ${pos.y}]`);

      paintCell(pos.x, pos.y);
      lastPaintedCell = pos;
      isDragging = true;
      return false; // 1本指で描画するときのみスクロール防止
    }
  }
  return true; // それ以外はスクロール許可
}

function touchMoved() {
  if (!isCanvasReady || !isDragging) {
    return true;
  }

  if (touches.length === 1) {
    const touch = touches[0];
    if (touch.x >= 0 && touch.x < canvasWidth && touch.y >= 0 && touch.y < canvasHeight) {
      const pos = getGridPosition(touch.x, touch.y);
      // 前回と異なるセルの場合のみ塗る
      if (pos.x !== lastPaintedCell.x || pos.y !== lastPaintedCell.y) {
        paintCell(pos.x, pos.y);
        lastPaintedCell = pos;
      }
    }
    return false; // 描画中はスクロール防止
  }
  return true;
}

function touchEnded() {
  isDragging = false;
  lastPaintedCell = { x: -1, y: -1 };
  return true;
}

// キャンバスクリア機能（確実な動作）
function clearCanvas() {
  console.log('🧹 キャンバスをクリアしています...');
  
  if (!isCanvasReady) {
    console.log('⚠️ キャンバスの準備が完了していません');
    return;
  }
  
  // セル配列を完全にリセット
  initializeCells();
  
  // 描画状態もリセット
  isDragging = false;
  lastPaintedCell = { x: -1, y: -1 };
  
  // 視覚的フィードバック
  const clearBtn = document.getElementById('clearBtn');
  if (clearBtn) {
    clearBtn.classList.add('clearing');
    setTimeout(() => {
      clearBtn.classList.remove('clearing');
    }, 300);
  }
  
  console.log('✅ キャンバスがクリアされました');
}

// モバイルでのタッチスクロール防止
function setupTouchPrevention() {
  const canvasContainer = document.getElementById('canvas-container');
  if (!canvasContainer) {
    console.error('❌ canvas-container要素が見つかりません');
    setTimeout(setupTouchPrevention, 100);
    return;
  }
  
  console.log('📱 タッチスクロール防止を設定します');
  
  canvasContainer.addEventListener(
    'touchstart',
    function (e) {
      // キャンバス領域で1本指のときのみスクロールを防止
      if (e.target.tagName === 'CANVAS' && e.touches.length === 1) {
        e.preventDefault();
      }
    },
    { passive: false }
  );

  canvasContainer.addEventListener(
    'touchmove',
    function (e) {
      // キャンバス領域で1本指のときのみスクロールを防止
      if (e.target.tagName === 'CANVAS' && e.touches.length === 1) {
        e.preventDefault();
      }
    },
    { passive: false }
  );
  
  console.log('✅ タッチスクロール防止が設定されました');
}

// ウィンドウリサイズ対応
function windowResized() {
  if (!isCanvasReady) return;
  
  console.log('🖥️ ウィンドウサイズが変更されました');
  calculateCanvasSize();
  resizeCanvas(canvasWidth, canvasHeight);
  initializeCells(); // リサイズ時はキャンバスをクリア
}

// デバッグ用のキーボードショートカット
function keyPressed() {
  if (key === 'c' || key === 'C') {
    clearCanvas();
  }
  if (key === 'd' || key === 'D') {
    console.log('🔍 デバッグ情報:');
    console.log('- キャンバス準備:', isCanvasReady);
    console.log('- キャンバスサイズ:', canvasWidth, 'x', canvasHeight);
    console.log('- セルサイズ:', cellSize);
    console.log('- グリッドサイズ:', cols, 'x', rows);
  }
}

// アプリケーション初期化完了のログ
console.log('🌈 虹色グリッドペイント（修正版）のJavaScriptが読み込まれました');
console.log('- バグ修正1: セル密度スライダーの確実な動作');  
console.log('- バグ修正2: 全部消すボタンの確実な動作');
console.log('- バグ修正3: 描画機能の完全修正');
console.log('- 初期色相: 赤（' + GLOBAL_HUE_START + '度）で統一');
console.log('- 色相進行: ' + config.hueStep + '度ずつ循環');
console.log('💡 デバッグ: Dキーでデバッグ情報表示, Cキーでクリア');
// =============================
// Extended features: mode switch & palette
// =============================
if (typeof window.paintMode === 'undefined') {
  window.paintMode = 'color';
}
if (typeof window.grayConfig === 'undefined') {
  // brightness: 100=明(白) -> 低いほど暗(黒)
  window.grayConfig = { min: 20, max: 100, initial: 100, step: 10 };
}

function setupModeSwitch() {
  try {
    const controls = document.querySelector('.controls-panel');
    if (!controls) { setTimeout(setupModeSwitch, 100); return; }

    let modeWrapper = controls.querySelector('.mode-control');
    if (!modeWrapper) {
      modeWrapper = document.createElement('div');
      modeWrapper.className = 'mode-control';

      const label = document.createElement('label');
      label.className = 'form-label';
      label.textContent = '描画モード';

      const group = document.createElement('div');
      group.className = 'mode-toggle';

      const btnColor = document.createElement('button');
      btnColor.type = 'button';
      btnColor.id = 'modeBtnColor';
      btnColor.className = 'btn btn--outline';
      btnColor.textContent = 'カラフル';

      const btnGray = document.createElement('button');
      btnGray.type = 'button';
      btnGray.id = 'modeBtnGray';
      btnGray.className = 'btn btn--outline';
      btnGray.textContent = 'グレースケール';

      group.appendChild(btnColor);
      group.appendChild(btnGray);

      modeWrapper.appendChild(label);
      modeWrapper.appendChild(group);

      const before = controls.querySelector('.button-controls');
      if (before) {
        controls.insertBefore(modeWrapper, before);
      } else {
        controls.appendChild(modeWrapper);
      }
    }

    const btnColor = document.getElementById('modeBtnColor');
    const btnGray = document.getElementById('modeBtnGray');

    function applyActive() {
      if (!btnColor || !btnGray) return;
      const isColor = window.paintMode === 'color';
      btnColor.className = 'btn ' + (isColor ? 'btn--primary' : 'btn--outline');
      btnGray.className = 'btn ' + (!isColor ? 'btn--primary' : 'btn--outline');
    }

    if (btnColor && btnGray) {
      applyActive();
      const setMode = (mode) => {
        window.paintMode = mode;
        applyActive();
        updateCurrentColorLabel();
        if (typeof color === 'function' && isCanvasReady) renderPalettePreview();
      };
      const handleColor = (e) => { e.preventDefault(); setMode('color'); };
      const handleGray = (e) => { e.preventDefault(); setMode('grayscale'); };
      btnColor.addEventListener('click', handleColor);
      btnColor.addEventListener('touchstart', handleColor);
      btnGray.addEventListener('click', handleGray);
      btnGray.addEventListener('touchstart', handleGray);
    }
  } catch (e) {
    console.error('setupModeSwitch error:', e);
  }
}

function ensurePaletteSection() {
  const container = document.getElementById('canvas-container');
  if (!container) { setTimeout(ensurePaletteSection, 100); return; }

  let section = document.querySelector('.palette-preview');
  if (!section) {
    section = document.createElement('section');
    section.className = 'palette-preview';
    section.setAttribute('aria-labelledby', 'paletteTitle');

    const h2 = document.createElement('h2');
    h2.id = 'paletteTitle';
    h2.className = 'sr-only';
    h2.textContent = '色見本';

    const sw = document.createElement('div');
    sw.id = 'paletteSwatches';
    sw.className = 'palette-preview__swatches';
    sw.setAttribute('role', 'list');

    const cap = document.createElement('p');
    cap.id = 'paletteCaption';
    cap.className = 'palette-preview__caption';

    section.appendChild(h2);
    section.appendChild(sw);
    section.appendChild(cap);

    // 可能ならモードパネル内へ、それ以外はキャンバス直後
    const modePanel = document.querySelector('.panel--mode') || document.querySelector('.mode-control')?.parentElement;
    if (modePanel && modePanel.classList.contains('panel--mode')) {
      modePanel.appendChild(section);
    } else {
      container.insertAdjacentElement('afterend', section);
    }
  }
}

// レイアウトの再配置: 上(モード+色見本) / 中(セル密度) / 下(全消去)
function rearrangePanels() {
  try {
    const appMain = document.querySelector('.app-main');
    const canvasContainer = document.getElementById('canvas-container');
    const oldPanel = document.querySelector('.controls-panel');
    const slider = document.querySelector('.slider-control');
    const actions = document.querySelector('.button-controls');
    const modeCtrl = document.querySelector('.mode-control');
    const palette = document.querySelector('.palette-preview');

    if (!appMain || !canvasContainer) return;

    // 上: モード + 色見本
    let modePanel = document.querySelector('.panel--mode');
    if (!modePanel) {
      modePanel = document.createElement('div');
      modePanel.className = 'controls-panel panel--mode';
      appMain.insertBefore(modePanel, canvasContainer);
    }
    if (modeCtrl && modeCtrl.parentElement !== modePanel) {
      modePanel.appendChild(modeCtrl);
    }
    if (palette && palette.parentElement !== modePanel) {
      modePanel.appendChild(palette);
    }

    // 中: セル密度（スライダー）
    if (slider) {
      let sliderPanel = document.querySelector('.panel--slider');
      if (!sliderPanel) {
        sliderPanel = document.createElement('div');
        sliderPanel.className = 'controls-panel panel--slider';
        canvasContainer.insertAdjacentElement('afterend', sliderPanel);
      }
      if (slider.parentElement !== sliderPanel) {
        sliderPanel.appendChild(slider);
      }
    }

    // 下: 全消去ボタン
    if (actions) {
      let actionPanel = document.querySelector('.panel--actions');
      const sliderPanel = document.querySelector('.panel--slider') || canvasContainer;
      if (!actionPanel) {
        actionPanel = document.createElement('div');
        actionPanel.className = 'controls-panel panel--actions';
        if (sliderPanel && sliderPanel.nextSibling) {
          sliderPanel.parentElement.insertBefore(actionPanel, sliderPanel.nextSibling);
        } else if (sliderPanel) {
          sliderPanel.parentElement.appendChild(actionPanel);
        } else {
          canvasContainer.insertAdjacentElement('afterend', actionPanel);
        }
      }
      if (actions.parentElement !== actionPanel) {
        actionPanel.appendChild(actions);
      }
    }

    // 余った旧パネルを削除
    if (oldPanel && oldPanel.children.length === 0) {
      oldPanel.remove();
    }
  } catch (e) {
    console.error('rearrangePanels error:', e);
  }
}

function updateCurrentColorLabel() {
  // 現在モードの文字表示は不要になったため、要素があれば削除
  const el = document.querySelector('.current-color');
  if (el && el.parentElement) {
    el.parentElement.removeChild(el);
  }
}

function renderPalettePreview() {
  const holder = document.getElementById('paletteSwatches');
  const caption = document.getElementById('paletteCaption');
  if (!holder || !caption) { setTimeout(renderPalettePreview, 100); return; }
  if (typeof color !== 'function' || !isCanvasReady) { setTimeout(renderPalettePreview, 100); return; }

  holder.innerHTML = '';
  if (window.paintMode === 'color') {
    let h = GLOBAL_HUE_START;
    for (let i = 0; i < 12; i++) {
      const sw = document.createElement('div');
      sw.className = 'swatch';
      sw.style.backgroundColor = color(h, config.saturation, config.brightness).toString();
      sw.setAttribute('role', 'listitem');
      sw.title = `Hue ${h}°`;
      holder.appendChild(sw);
      h = (h + config.hueStep) % 360;
    }
    caption.textContent = `色相: ${GLOBAL_HUE_START}° から ${config.hueStep}° ずつ循環`;
  } else {
    // 明るい -> 暗い の並び
    for (let b = window.grayConfig.max; b >= window.grayConfig.min; b -= window.grayConfig.step) {
      const sw = document.createElement('div');
      sw.className = 'swatch';
      sw.style.backgroundColor = color(0, 0, b).toString();
      sw.setAttribute('role', 'listitem');
      sw.title = `Brightness ${b}`;
      holder.appendChild(sw);
    }
    caption.textContent = `グレースケール: 輝度 ${window.grayConfig.max}→${window.grayConfig.min}（${window.grayConfig.step} 刻み）`;
  }
}

function drawCells() {
  noStroke();
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const v = cells[y][x];
      if (v === null) continue;
      if (typeof v === 'number') {
        fill(v, config.saturation, config.brightness);
      } else if (v.mode === 'color') {
        fill(v.hue, config.saturation, config.brightness);
      } else {
        fill(0, 0, v.brightness);
      }
      rect(x * cellSize + 1, y * cellSize + 1, cellSize - 2, cellSize - 2);
    }
  }
}

function paintCell(x, y) {
  if (x < 0 || x >= cols || y < 0 || y >= rows) return;

  if (cells[y][x] === null) {
    if (window.paintMode === 'color') {
      cells[y][x] = { mode: 'color', hue: GLOBAL_HUE_START };
    } else {
      // 初期は明るい→徐々に暗く（dir=-1）
      cells[y][x] = { mode: 'grayscale', brightness: window.grayConfig.initial, brightnessDir: -1 };
    }
  } else {
    if (typeof cells[y][x] === 'number') {
      cells[y][x] = { mode: 'color', hue: cells[y][x] };
    }

    if (window.paintMode === 'color') {
      // 現在がカラフル: 他モードなら上書き初期化、同モードなら循環
      if (cells[y][x].mode !== 'color') {
        cells[y][x] = { mode: 'color', hue: GLOBAL_HUE_START };
      } else {
        cells[y][x].hue = (cells[y][x].hue + config.hueStep) % 360;
      }
    } else {
      // 現在がグレー: 他モードなら上書き初期化、同モードならピンポン更新
      if (cells[y][x].mode !== 'grayscale') {
        cells[y][x] = { mode: 'grayscale', brightness: window.grayConfig.initial, brightnessDir: -1 };
      } else {
        // Ping-pong grayscale: bounce between min/max without jump（明↔暗）
        if (typeof cells[y][x].brightnessDir !== 'number') {
          // 既存データ対応: 未設定なら暗く向かう
          cells[y][x].brightnessDir = -1;
        }
        const dir = cells[y][x].brightnessDir;
        let b = cells[y][x].brightness + dir * window.grayConfig.step;
        if (b > window.grayConfig.max) {
          cells[y][x].brightnessDir = -1;
          b = window.grayConfig.max - window.grayConfig.step;
        } else if (b < window.grayConfig.min) {
          cells[y][x].brightnessDir = 1;
          b = window.grayConfig.min + window.grayConfig.step;
        }
        cells[y][x].brightness = b;
      }
    }
  }
}

document.addEventListener('DOMContentLoaded', function() {
  setTimeout(() => {
    setupModeSwitch();
    ensurePaletteSection();
    updateCurrentColorLabel();
    rearrangePanels();
    const timer = setInterval(() => {
      if (typeof color === 'function' && isCanvasReady) {
        renderPalettePreview();
        clearInterval(timer);
      }
    }, 100);
  }, 100);
});
