/* うずまき練習帳 – 24 canvases, trace stays until reset */
'use strict';

const GRID_EL   = document.getElementById('grid');
const BTN_CW    = document.getElementById('btnCW');
const BTN_CCW   = document.getElementById('btnCCW');
const CANVAS_CNT = 24;     // 6×4

let currentDir = 'cw';     // 'cw' | 'ccw'

/* ---------- 初期化 ---------- */
createCanvases();
attachToolbarEvents();
drawAllSpirals();

/* ---------- Canvas 作成 ---------- */
function createCanvases(){
  for(let i=0;i<CANVAS_CNT;i++){
    const cv = document.createElement('canvas');
    cv.className = 'spiral-canvas';
    GRID_EL.appendChild(cv);
    prepCanvas(cv);
    attachDrawing(cv);
  }
}

/* HiDPI + サイズ同期 */
function prepCanvas(cv){
  const resize = ()=>{
    const rect = cv.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    cv.width  = rect.width  * dpr;
    cv.height = rect.height * dpr;
    const ctx = cv.getContext('2d');
    ctx.scale(dpr,dpr);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    drawSpiral(ctx, rect.width, rect.height, currentDir === 'cw');
  };
  // 初回
  resize();
  // リサイズ時
  new ResizeObserver(resize).observe(cv);
}

/* ---------- Spiral 描画 ---------- */
function drawSpiral(ctx, w, h, clockwise=true){
  ctx.clearRect(0,0,w,h);
  const cx = w/2, cy = h/2;
  const turns = 2;
  const maxTheta = 2*Math.PI*turns*(clockwise?1:-1);
  const growth = (Math.min(w,h)/2 - 8) / (Math.abs(maxTheta));
  ctx.beginPath();
  for(let t=0;t<=1;t+=0.005){
    const theta = maxTheta * t;
    const r = 8 + growth * Math.abs(theta);
    ctx.lineTo(cx + r * Math.cos(theta),
               cy + r * Math.sin(theta));
  }
  ctx.strokeStyle = '#888';
  ctx.lineWidth = 4;
  ctx.stroke();
}

/* ---------- 描画イベント ---------- */
function attachDrawing(cv){
  const ctx = cv.getContext('2d');
  let drawing = false, prev = null;

  cv.addEventListener('pointerdown',e=>{
    drawing = true;
    prev = toLocal(e,cv);
  });
  cv.addEventListener('pointermove',e=>{
    if(!drawing) return;
    const p = toLocal(e,cv);
    ctx.beginPath();
    ctx.moveTo(prev.x,prev.y);
    ctx.lineTo(p.x,p.y);
    ctx.strokeStyle = '#0066ff';
    ctx.lineWidth = 4;
    ctx.stroke();
    prev = p;
  });
  cv.addEventListener('pointerup',()=>drawing=false);
  cv.addEventListener('pointercancel',()=>drawing=false);

  /* iOS Safari ジェスチャ抑止 */
  ['touchstart','touchmove','touchend'].forEach(ev=>
    cv.addEventListener(ev,e=>e.preventDefault(),{passive:false}));
}

function toLocal(ev,cv){
  /* 変換はオフセットのみ。ctx.scale が dpr を吸収する */
  const rect = cv.getBoundingClientRect();
  return {
    x: ev.clientX - rect.left,
    y: ev.clientY - rect.top
  };
}

/* ---------- ツールバー操作 ---------- */
function attachToolbarEvents(){
  BTN_CW .addEventListener('click',()=>switchDir('cw'));
  BTN_CCW.addEventListener('click',()=>switchDir('ccw'));
}

function switchDir(dir){
  if(currentDir === dir) return;
  currentDir = dir;
  BTN_CW .classList.toggle('active', dir==='cw');
  BTN_CCW.classList.toggle('active', dir==='ccw');
  clearAllTracesAndRedraw();
}

function clearAllTracesAndRedraw(){
  document.querySelectorAll('.spiral-canvas').forEach(cv=>{
    const ctx = cv.getContext('2d');
    const rect = cv.getBoundingClientRect();
    ctx.clearRect(0,0,rect.width,rect.height);
    drawSpiral(ctx, rect.width, rect.height, currentDir==='cw');
  });
}

/* 初回描画 */
function drawAllSpirals(){
  document.querySelectorAll('.spiral-canvas').forEach(cv=>{
    const ctx = cv.getContext('2d');
    const rect = cv.getBoundingClientRect();
    drawSpiral(ctx, rect.width, rect.height, currentDir==='cw');
  });
}
