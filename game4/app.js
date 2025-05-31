/* --------------------------------------------------------------------------
   Apple Pencil なぞりゲーム – UI&スコア拡張版 (2025-05-31)
   ・ボタン選択UI（形/入力/時間）
   ・ローカル保存：直近10件 & トップ3（形×時間）
   ・スコアテーブルを常時表示
--------------------------------------------------------------------------- */
'use strict';

/* ---------- 設定 ---------- */
const gameConfig = {
  canvasWidth: 600,
  canvasHeight: 400,
  lineWidth: 12,
  shapeColor: '#888888',
  userTraceColor: '#0066ff',
  vertexPassedColor: '#22cc88',
  vertexAllowableDistance: 12,
  edgeAllowableDistance: 24,
};

/* ---------- 形 ---------- */
const shapes = {
  triangle:  { name: '🔺 三角形', type: 'polygon', vertices: [ {x:300,y:150},{x:250,y:250},{x:350,y:250}], difficulty:1 },
  square:    { name: '⬛ 四角形', type: 'polygon', vertices: [ {x:250,y:150},{x:350,y:150},{x:350,y:250},{x:250,y:250}], difficulty:2 },
  circle:    { name: '⚪ 円', type: 'circle', center:{x:300,y:200},radius:80,points:40,difficulty:3 },
  spiralCW:  { name: '🌀↻ ぐるぐる', type:'spiral',center:{x:300,y:200},radius:2,turns:2,points:300,direction:1,difficulty:4 },
  spiralCCW: { name: '🌀↺ ぐるぐる', type:'spiral',center:{x:300,y:200},radius:3,turns:2,points:300,direction:-1,difficulty:4 },
};

/* ---------- 状態 ---------- */
const gameState = {
  isPlaying:false,
  timeRemaining:10,
  score:0,
  currentPath:[],
  shapePath:[],
  verticesPassed:[],
  isDrawing:false,
  lastPoint:null,
  gameTimer:null,
  currentShape:'triangle',
  inputMode:'pen',
};

/* ---------- DOM ---------- */
let previewCanvas,gameCanvas,previewCtx,ctx;
let startButton,playAgainButton,backToTopButton;
let startScreen,gameScreen,endScreen;
let timerDisplay,scoreDisplay,finalScoreDisplay,resultMessage;
let shapeBtns,inputBtns,timeBtns;
let topTable,recentTable;

/* ---------- 初期化 ---------- */
document.addEventListener('DOMContentLoaded',()=>{
  cache();
  setupCanvases();
  initButtons();
  generateShapePath(shapes[gameState.currentShape]);
  renderPreview();
  renderTables();
  showStartScreen();
});

function cache(){
  previewCanvas=document.getElementById('previewCanvas');
  gameCanvas=document.getElementById('gameCanvas');
  previewCtx=previewCanvas.getContext('2d');
  ctx=gameCanvas.getContext('2d');

  startButton=document.getElementById('startButton');
  playAgainButton=document.getElementById('playAgainButton');
  backToTopButton=document.getElementById('backToTopButton');

  startScreen=document.getElementById('startScreen');
  gameScreen=document.getElementById('gameScreen');
  endScreen=document.getElementById('endScreen');

  timerDisplay=document.getElementById('timer');
  scoreDisplay=document.getElementById('score');
  finalScoreDisplay=document.getElementById('finalScore');
  resultMessage=document.getElementById('resultMessage');

  shapeBtns=[...document.querySelectorAll('#shapeButtons .option-btn')];
  inputBtns=[...document.querySelectorAll('#inputButtons .option-btn')];
  timeBtns =[...document.querySelectorAll('#timeButtons  .option-btn')];

  topTable   =document.getElementById('topScoresTable');
  recentTable=document.getElementById('recentScoresTable');
}

/* ---------- Canvas HiDPI ---------- */
function setupCanvases(){
  const s=el=>{
    const dpr=window.devicePixelRatio||1;
    el.width=gameConfig.canvasWidth*dpr;
    el.height=gameConfig.canvasHeight*dpr;
    el.style.width=`${gameConfig.canvasWidth}px`;
    el.style.height=`${gameConfig.canvasHeight}px`;
    const c=el.getContext('2d');c.scale(dpr,dpr);c.lineCap='round';c.lineJoin='round';
    return c;
  };
  previewCtx=s(previewCanvas);ctx=s(gameCanvas);
}

/* ---------- ボタンUI ---------- */
function initButtons(){
  /* shape */
  shapeBtns.forEach(btn=>{
    if(btn.dataset.shape===gameState.currentShape)btn.classList.add('selected');
    btn.addEventListener('click',e=>{
      shapeBtns.forEach(b=>b.classList.remove('selected'));
      e.currentTarget.classList.add('selected');
      gameState.currentShape=e.currentTarget.dataset.shape;
      generateShapePath(shapes[gameState.currentShape]);
      renderPreview();
      renderTables();
    });
  });
  /* input */
  inputBtns.forEach(btn=>{
    if(btn.dataset.input===gameState.inputMode)btn.classList.add('selected');
    btn.addEventListener('click',e=>{
      inputBtns.forEach(b=>b.classList.remove('selected'));
      e.currentTarget.classList.add('selected');
      gameState.inputMode=e.currentTarget.dataset.input;
    });
  });
  /* time */
  timeBtns.forEach(btn=>{
    if(+btn.dataset.time===gameState.timeRemaining)btn.classList.add('selected');
    btn.addEventListener('click',e=>{
      timeBtns.forEach(b=>b.classList.remove('selected'));
      e.currentTarget.classList.add('selected');
      gameState.timeRemaining=+e.currentTarget.dataset.time;
      renderTables();
    });
  });

  /* main buttons */
  startButton .addEventListener('click',startGame);
  playAgainButton.addEventListener('click',restartGame);
  backToTopButton.addEventListener('click',()=>{clearInterval(gameState.gameTimer);showStartScreen();});
  
  /* pointer events */
  gameCanvas.addEventListener('pointerdown',pointerDown);
  gameCanvas.addEventListener('pointermove',pointerMove);
  gameCanvas.addEventListener('pointerup',pointerUp);
  gameCanvas.addEventListener('pointercancel',pointerUp);
  ['touchstart','touchmove','touchend'].forEach(ev=>
    gameCanvas.addEventListener(ev,e=>e.preventDefault(),{passive:false}));
}

/* ---------- 図形パス ---------- */
function generateShapePath(s){
  gameState.shapePath.length=0;
  if(s.type==='polygon')genPoly(s.vertices);
  else if(s.type==='circle')genCircle(s.center,s.radius,s.points);
  else genSpiral(s);
}
function genPoly(vs){
  const res=2;
  vs.forEach((v,i)=>{
    const n=vs[(i+1)%vs.length],dx=n.x-v.x,dy=n.y-v.y,dist=Math.hypot(dx,dy),steps=Math.max(1,dist*res);
    for(let j=0;j<=steps;j++){
      const t=j/steps;
      gameState.shapePath.push({x:v.x+dx*t,y:v.y+dy*t,edge:i});
    }
  });
}
function genCircle(c,r,p){
  const step=(2*Math.PI)/p;
  for(let i=0;i<p;i++){
    const a=i*step;
    gameState.shapePath.push({x:c.x+r*Math.cos(a),y:c.y+r*Math.sin(a),edge:i});
  }
}
function genSpiral(s){
  const {center,radius:r0,turns,points,direction}=s;
  const maxTheta=2*Math.PI*turns*direction;
  const b= 5;  // (Math.min(gameConfig.canvasWidth,gameConfig.canvasHeight)/2-r0)/maxTheta;
  for(let i=0;i<=points;i++){
    const t=i/points,theta=maxTheta*t,r=r0+b*theta;
    gameState.shapePath.push({x:center.x+r*Math.cos(theta),y:center.y+r*Math.sin(theta),edge:i%12});
  }
}

/* ---------- 描画 ---------- */
function renderPreview(){drawShape(shapes[gameState.currentShape],previewCtx);}
function drawShape(s,c){
  c.clearRect(0,0,gameConfig.canvasWidth,gameConfig.canvasHeight);
  if(s.type==='polygon'){ c.beginPath(); c.moveTo(s.vertices[0].x,s.vertices[0].y); s.vertices.slice(1).forEach(v=>c.lineTo(v.x,v.y)); c.closePath(); }
  else if(s.type==='circle'){ c.beginPath(); c.arc(s.center.x,s.center.y,s.radius,0,2*Math.PI); }
  else{ c.beginPath(); const p=gameState.shapePath; c.moveTo(p[0].x,p[0].y); p.slice(1).forEach(pt=>c.lineTo(pt.x,pt.y)); }
  c.strokeStyle=gameConfig.shapeColor;c.lineWidth=gameConfig.lineWidth+2;c.stroke();
}

/* ---------- ゲーム制御 ---------- */
function startGame(){
  clearInterval(gameState.gameTimer);
  gameState.isPlaying=true;
  gameState.score=0;
  gameState.currentPath=[];
  timerDisplay.textContent=gameState.timeRemaining;
  scoreDisplay.textContent=0;
  ctx.clearRect(0,0,gameConfig.canvasWidth,gameConfig.canvasHeight);
  drawShape(shapes[gameState.currentShape],ctx);
  showGameScreen();
  gameState.gameTimer=setInterval(()=>{if(--gameState.timeRemaining<=0)endGame();timerDisplay.textContent=gameState.timeRemaining;},1000);
}
function endGame(){
  gameState.isPlaying=false;clearInterval(gameState.gameTimer);
  finalScoreDisplay.textContent=gameState.score;
  resultMessage.textContent=getComment(gameState.score);
  saveRecord();
  renderTables();
  showEndScreen();
}
function restartGame(){showStartScreen();}

function getComment(sc){return sc>=5?'すごい！🎉':sc>=3?'いいね！👍':sc>=1?'がんばった！💪':'つぎチャレンジ！';}

/* ---------- ポインタ ---------- */
function allow(pt){return gameState.inputMode==='any'||pt==='pen'||pt==='touch'||pt==='mouse';}
function pointerDown(e){if(!gameState.isPlaying||!allow(e.pointerType))return; const p=pt(e);gameState.isDrawing=true;gameState.currentPath=[p];ctx.beginPath();ctx.moveTo(p.x,p.y);}
function pointerMove(e){if(!gameState.isPlaying||!gameState.isDrawing||!allow(e.pointerType))return;const p=pt(e);ctx.lineTo(p.x,p.y);ctx.strokeStyle=gameConfig.userTraceColor;ctx.lineWidth=gameConfig.lineWidth;ctx.stroke();gameState.currentPath.push(p);checkLoop();}
function pointerUp(){gameState.isDrawing=false;}
function pt(e){const r=gameCanvas.getBoundingClientRect(),sx=gameConfig.canvasWidth/r.width,sy=gameConfig.canvasHeight/r.height;return{x:(e.clientX-r.left)*sx,y:(e.clientY-r.top)*sy};}

/* ---------- ループ判定（簡略） ---------- */
function checkLoop(){
  if(gameState.currentPath.length<50)return;
  const sp=gameState.currentPath,first=sp[0],last=sp[sp.length-1];
  if(Math.hypot(first.x-last.x,first.y-last.y)<=gameConfig.edgeAllowableDistance*2){
    gameState.score++;scoreDisplay.textContent=gameState.score;gameState.currentPath=[];
  }
}

/* ---------- 画面遷移 ---------- */
function showStartScreen(){startScreen.classList.remove('hidden');gameScreen.classList.add('hidden');endScreen.classList.add('hidden');}
function showGameScreen(){startScreen.classList.add('hidden');gameScreen.classList.remove('hidden');endScreen.classList.add('hidden');}
function showEndScreen(){startScreen.classList.add('hidden');gameScreen.classList.add('hidden');endScreen.classList.remove('hidden');}

/* ---------- スコア保存 ---------- */
function saveRecord(){
  const rec={
    date:new Date().toLocaleDateString('ja-JP',{year:'numeric',month:'2-digit',day:'2-digit'}),
    time:new Date().toLocaleTimeString('ja-JP',{hour:'2-digit',minute:'2-digit'}),
    shape:gameState.currentShape,
    timeLimit:gameState.timeRemaining,
    score:gameState.score,
    input:gameState.inputMode,
  };
  /* 直近10 */
  const recent=JSON.parse(localStorage.getItem('trace_recent')||'[]');
  recent.unshift(rec);if(recent.length>10)recent.pop();
  localStorage.setItem('trace_recent',JSON.stringify(recent));
  /* トップ3 */
  const key=`trace_best_${rec.shape}_${rec.timeLimit}`;
  const best=JSON.parse(localStorage.getItem(key)||'[]');
  best.push(rec);
  best.sort((a,b)=>b.score-a.score||new Date(b.date+' '+b.time)-new Date(a.date+' '+a.time));
  if(best.length>3)best.length=3;
  localStorage.setItem(key,JSON.stringify(best));
}

/* ---------- テーブル描画 ---------- */
function renderTables(){
  /* Top3 */
  const key=`trace_best_${gameState.currentShape}_${gameState.timeRemaining}`;
  const best=JSON.parse(localStorage.getItem(key)||'[]');
  topTable.innerHTML=best.length?toRows(best,true):'<tr><td>まだないよ！</td></tr>';
  /* Recent */
  const recent=JSON.parse(localStorage.getItem('trace_recent')||'[]');
  recentTable.innerHTML=recent.length?toRows(recent,false):'<tr><td>まだないよ！</td></tr>';
}
function toRows(arr,rank){
  return arr.map((r,i)=>`
    <tr>
      ${rank?`<td>${['🥇','🥈','🥉'][i]||''}</td>`:''}
      <td>${r.date}</td><td>${r.time}</td><td>${r.input==='pen'?'✍️':'☝️'}</td>
      <td>${shapes[r.shape].name}</td><td>${r.timeLimit}秒</td><td>${r.score}</td>
    </tr>`).join('');
}
