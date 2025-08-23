// ===== FILE: assets/js/app.js =====
// Utility
const clamp = (v, a, b) => Math.min(Math.max(v, a), b);
const lerp = (a,b,t) => a + (b-a)*t;

// Robust statistics helpers for calibration
function median(arr){
  if(!arr.length) return 0;
  const s = [...arr].sort((a,b)=>a-b);
  const mid = Math.floor(s.length/2);
  return s.length % 2 ? s[mid] : (s[mid-1] + s[mid]) / 2;
}
function trimmedMedian(samples, thresh=150){
  if(!samples.length) return {value:0, kept:0};
  const m1 = median(samples);
  const keptArr = samples.filter(v => Math.abs(v - m1) <= thresh);
  if(keptArr.length===0){ return {value:m1, kept:0}; }
  return {value: median(keptArr), kept: keptArr.length};
}

// LocalStorage keys
const LS = {
  BEST: 'rjr_best_combo_v1',
  LATENCY: 'rjr_latency_ms_v1',
  SOUND: 'rjr_sound_on_v1'
};

// Audio Engine (Web Audio)
class AudioEngine{
  constructor(){
    this.ctx = null;
    this.enabled = true;
    this.latencyCompMs = parseFloat(localStorage.getItem(LS.LATENCY) || '0');
    const sndOn = localStorage.getItem(LS.SOUND);
    if(sndOn!==null) this.enabled = sndOn === '1';
  }
  async ensure(){
    if(!this.ctx){
      this.ctx = new (window.AudioContext || window.webkitAudioContext)({latencyHint:'interactive'});
      await this.ctx.resume();
    }
  }
  setEnabled(on){
    this.enabled = on; localStorage.setItem(LS.SOUND, on?'1':'0');
  }
  now(){ return this.ctx ? this.ctx.currentTime : 0; }
  tick(at){
    if(!this.enabled || !this.ctx) return;
    const ctx = this.ctx; const t = at ?? ctx.currentTime;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'square';
    o.frequency.value = 1000;
    g.gain.value = 0.001;
    o.connect(g).connect(ctx.destination);
    o.start(t);
    g.gain.setValueAtTime(0.12, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.04);
    o.stop(t + 0.05);
  }
  blipSuccess(){
    if(!this.enabled || !this.ctx) return;
    const t = this.ctx.currentTime;
    this._blip(660, 0.08, t);
    this._blip(990, 0.06, t + 0.05);
  }
  blipMiss(){
    if(!this.enabled || !this.ctx) return;
    const t = this.ctx.currentTime;
    this._blip(200, 0.12, t);
  }
  _blip(freq, dur, t){
    const ctx = this.ctx;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sine'; o.frequency.value = freq;
    g.gain.value = 0.0001;
    o.connect(g).connect(ctx.destination);
    o.start(t);
    g.gain.setValueAtTime(0.15, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.stop(t + dur + 0.01);
  }
}

// Metronome with scheduler
class Metronome{
  constructor(audio){
    this.audio = audio;
    this.bpm = 100;
    this.period = 60/this.bpm; // seconds per beat
    this.basePerf = 0; // performance.now() at start
    this.baseAudio = 0; // audio currentTime at start
    this.nextTick = 0; // audio time of next tick
    this.running = false;
  }
  setBpm(bpm){ this.bpm = bpm; this.period = 60/this.bpm; }
  start(){
    this.basePerf = performance.now();
    this.baseAudio = this.audio.now();
    this.nextTick = this.audio.now();
    this.running = true;
  }
  stop(){ this.running=false; }
  schedule(){
    if(!this.running) return;
    const lookAhead = 0.15; // seconds
    const now = this.audio.now();
    while(this.nextTick < now + lookAhead){
      this.audio.tick(this.nextTick);
      this.nextTick += this.period;
    }
  }
  cycles(nowPerf){
    return (nowPerf - this.basePerf)/1000 / this.period;
  }
  nearestBeatTimeMs(nowPerf){
    const cycles = this.cycles(nowPerf);
    const i = Math.round(cycles);
    return this.basePerf + i * this.period * 1000;
  }
}

// Game core
class Game{
  constructor(canvas){
    this.cv = canvas;
    this.ctx = canvas.getContext('2d');
    this.dpr = window.devicePixelRatio || 1;
    this.audio = new AudioEngine();
    this.metro = new Metronome(this.audio);

    // state
    this.soundOn = true;
    this.paused = false;
    this.started = false;
    this.combo = 0;
    this.best = parseInt(localStorage.getItem(LS.BEST)||'0');
    this.lastJudge = '-';
    this.difficulty = 'easy';
    this.hitWindowMsMap = { easy: 120, normal: 80, hard: 55 };
    this.hitWindowMs = this.hitWindowMsMap[this.difficulty];
    this.latencyMs = this.audio.latencyCompMs; // positive means user taps late

    // learning stats
    this.statsEnabled = true;
    this.recent = []; // {delta, label}
    this.recentCap = 20;

    // resync
    this.resyncInterval = 35000; // 35s
    this._lastResyncPerf = performance.now();

    // character physics
    this.jumpY = 0;
    this.vy = 0;
    this.gravity = 2400;
    this.jumpPower = 780;
    this.missFlash = 0;

    // visuals cache
    this._resizeObserver = new ResizeObserver(()=>this.resize());
    this._resizeObserver.observe(this.cv);
    window.addEventListener('resize', ()=>this.resize());
    this.resize();

    // main loop
    this._lastPerf = performance.now();
    const loop = ()=>{
      const now = performance.now();
      const dt = (now - this._lastPerf)/1000;
      this._lastPerf = now;
      if(this.started && !this.paused){
        this.metro.schedule();
        this.update(dt);
      }
      this.render(now);
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);

    // Input
    this._bindInputs();
  }

  _bindInputs(){
    const onPress = ()=> this.jump();
    document.addEventListener('touchstart', (e)=>{
      if(e.target.closest('#startBtn')) return;
      if(e.target.tagName==='INPUT' || e.target.tagName==='BUTTON') return;
      onPress();
    }, {passive:true});
    document.addEventListener('mousedown', (e)=>{
      if(e.button!==0) return;
      if(e.target.closest('#startBtn')) return;
      if(e.target.tagName==='INPUT' || e.target.tagName==='BUTTON') return;
      onPress();
    });
    document.addEventListener('keydown', (e)=>{
      if(e.code==='Space' || e.code==='Enter'){
        e.preventDefault(); onPress();
      }
    });
    document.getElementById('jumpBtn').addEventListener('click', onPress);

    // controls
    const bpmRange = document.getElementById('bpm');
    const bpmVal = document.getElementById('bpmVal');
    bpmRange.addEventListener('input', ()=>{
      bpmVal.textContent = bpmRange.value;
      this.metro.setBpm(parseInt(bpmRange.value,10));
    });

    const setDiff = (d)=>{
      this.difficulty = d;
      this.hitWindowMs = this.hitWindowMsMap[d];
      document.querySelectorAll('[role="tablist"] .active').forEach(el=>el.classList.remove('active'));
      document.getElementById(d).classList.add('active');
    };
    document.getElementById('easy').onclick = ()=> setDiff('easy');
    document.getElementById('normal').onclick = ()=> setDiff('normal');
    document.getElementById('hard').onclick = ()=> setDiff('hard');

    // sound toggle
    const sndOn = document.getElementById('sndOn');
    const sndOff = document.getElementById('sndOff');
    sndOn.onclick = ()=>{ sndOn.classList.add('active'); sndOff.classList.remove('active'); this.soundOn=true; this.audio.setEnabled(true); };
    sndOff.onclick = ()=>{ sndOff.classList.add('active'); sndOn.classList.remove('active'); this.soundOn=false; this.audio.setEnabled(false); };

    // stats toggle
    const stOn = document.getElementById('statsOn');
    const stOff = document.getElementById('statsOff');
    stOn.onclick = ()=>{ stOn.classList.add('active'); stOff.classList.remove('active'); this.statsEnabled=true; document.getElementById('learnCard').style.display='block'; };
    stOff.onclick = ()=>{ stOff.classList.add('active'); stOn.classList.remove('active'); this.statsEnabled=false; document.getElementById('learnCard').style.display='none'; };

    // pause/reset
    document.getElementById('pauseBtn').onclick = ()=>{ if(!this.started) return; this.paused = !this.paused; showToast(this.paused?'一時停止中':'再開'); };
    document.getElementById('resetBtn').onclick = ()=> this.reset();

    // overlay actions
    document.getElementById('startBtn').onclick = async()=>{
      await this.audio.ensure();
      hideOverlay();
      this.start();
    };
    document.getElementById('howBtn').onclick = ()=>{
      alert('【あそびかた】\nBPMのテンポに合わせてタップしよう。\nロープが足もと（下）を通るタイミングでタップできれば成功！\n判定幅は［やさしい→むずかしい］で狭くなるよ。\n画面どこでもタップOK／下のボタンでもOK。');
    };

    // calibration
    document.getElementById('calibBtn').onclick = ()=> this.calibrate();
  }

  resize(){
    const rect = this.cv.getBoundingClientRect();
    const dpr = Math.max(1, window.devicePixelRatio||1);
    const w = Math.floor(rect.width * dpr);
    const h = Math.floor(rect.height * dpr);
    if(this.cv.width!==w || this.cv.height!==h){
      this.cv.width = w; this.cv.height = h; this.dpr = dpr;
    }
  }

  start(){
    this.started = true; this.paused = false; this.combo = 0; this.lastJudge = '-';
    this.metro.start();
  }

  reset(){
    this.combo = 0; this.lastJudge='-'; this.jumpY=0; this.vy=0; this.missFlash=0;
    if(this.started) this.metro.start();
  }

  jump(){
    if(!this.started || this.paused) return;
    const now = performance.now();
    const nearest = this.metro.nearestBeatTimeMs(now);
    const delta = now - nearest - this.latencyMs; // ms
    const win = this.hitWindowMs;
    const absd = Math.abs(delta);
    let label;
    if(absd <= win){
      this.combo++;
      label = (absd<=win*0.35) ? 'PERFECT' : (absd<=win*0.7?'GREAT':'GOOD');
      this.lastJudge = label;
      if(this.combo>this.best){ this.best=this.combo; localStorage.setItem(LS.BEST, String(this.best)); }
      if(this.jumpY===0){ this.vy = -this.jumpPower; }
      this.audio.blipSuccess();
    } else {
      this.combo = 0; this.lastJudge = (delta>0?'LATE':'EARLY');
      label = 'MISS';
      this.missFlash = 1; this.audio.blipMiss();
    }

    // record for learning card
    this.recent.push({delta, label});
    if(this.recent.length>this.recentCap) this.recent.shift();
    this.updateLearnCard();

    // HUD update
    document.getElementById('combo').textContent = this.combo;
    document.getElementById('best').textContent = this.best;
    document.getElementById('judge').textContent = this.lastJudge;
  }

  update(dt){
    // physics
    if(this.jumpY < 0 || this.vy < 0){
      this.vy += this.gravity * dt;
      this.jumpY += this.vy * dt;
      if(this.jumpY>0){ this.jumpY=0; this.vy=0; }
    }
    if(this.missFlash>0){ this.missFlash = Math.max(0, this.missFlash - dt*2); }

    // light resync
    const nowPerf = performance.now();
    if (this.started && !this.paused && nowPerf - this._lastResyncPerf > this.resyncInterval) {
      this._lastResyncPerf = nowPerf;
      const nearest = this.metro.nearestBeatTimeMs(nowPerf);
      this.metro.basePerf += (nowPerf - nearest) * 0.1; // 10% gentle correction
      showToast('リズム再同期しました');
    }
  }

  render(nowPerf){
    const ctx = this.ctx; const W = this.cv.width; const H = this.cv.height;
    ctx.clearRect(0,0,W,H);
    // background grid subtle
    ctx.save();
    ctx.globalAlpha = 0.15;
    ctx.strokeStyle = '#272b53';
    const step = 32 * this.dpr;
    for(let x= (W%step); x<W; x+=step){ ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
    for(let y= (H%step); y<H; y+=step){ ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }
    ctx.restore();

    // stage
    const cx = W*0.5; const groundY = H*0.75; const scale = Math.min(W,H);
    const r = Math.max(120, Math.min(scale*0.22, 260));

    // character
    const charY = groundY + this.jumpY;
    drawCharacter(ctx, cx, charY, this.dpr, this.jumpY);

    // rope
    if(this.started){
      const cycles = this.metro.cycles(nowPerf);
      const ang = (cycles % 1) * Math.PI*2;
      drawRope(ctx, cx, groundY, r, ang, this.missFlash);
    }

    // combo label
    ctx.save();
    ctx.textAlign = 'center'; ctx.fillStyle = 'rgba(230,232,255,0.8)';
    ctx.font = `${32*this.dpr}px ui-sans-serif, system-ui`;
    ctx.fillText(`${this.combo} combo`, cx, groundY - r - 26*this.dpr);
    ctx.restore();
  }

  updateLearnCard(){
    const card = document.getElementById('learnCard');
    if(!card || !this.statsEnabled){ return; }
    const N = this.recent.length;
    document.getElementById('sampleCount').textContent = `${N} / ${this.recentCap}`;
    if(N===0){
      document.getElementById('avgDelta').textContent = '- ms';
      document.getElementById('tempoRate').textContent = '- %';
      return;
    }
    const avgAbs = this.recent.reduce((a,r)=>a+Math.abs(r.delta),0)/N;
    const goodCount = this.recent.filter(r=> r.label==='PERFECT' || r.label==='GREAT').length;
    const rate = Math.round((goodCount / N) * 100);
    document.getElementById('avgDelta').textContent = `${avgAbs.toFixed(0)} ms`;
    document.getElementById('tempoRate').textContent = `${rate} %`;
  }

  async calibrate(){
    if(!this.audio.ctx){ await this.audio.ensure(); }
    const bpm = parseInt(document.getElementById('bpm').value,10);
    this.metro.setBpm(bpm);
    const N = 12;
    const samples = [];
    showToast('キャリブレーション：リズムに合わせて12回タップしてください');
    this.metro.start();
    this.started = true; this.paused = false;

    const onTap = (e)=>{
      const now = performance.now();
      const nearest = this.metro.nearestBeatTimeMs(now);
      samples.push(now - nearest);
      if(samples.length>=N){
        document.removeEventListener('touchstart', onTapCap, {passive:true});
        document.removeEventListener('mousedown', onTap);
        document.removeEventListener('keydown', onKey);
        finish();
      }
    };
    const onTapCap = (e)=>{
      if(e.target.tagName==='INPUT' || e.target.tagName==='BUTTON') return;
      onTap(e);
    };
    const onKey = (e)=>{ if(e.code==='Space'||e.code==='Enter'){ e.preventDefault(); onTap(e);} };
    document.addEventListener('touchstart', onTapCap, {passive:true});
    document.addEventListener('mousedown', onTap);
    document.addEventListener('keydown', onKey);

    const finish = ()=>{
      const {value, kept} = trimmedMedian(samples, 150);
      this.latencyMs = value;
      localStorage.setItem(LS.LATENCY, String(this.latencyMs));
      const dropped = samples.length - kept;
      showToast(`補正: ${value.toFixed(0)}ms（中央値${kept>0?`・外れ値${dropped}件除外`:''}）を適用しました`);
    };
  }
}

// Drawing helpers
function drawCharacter(ctx, x, y, dpr, jumpY){
  ctx.save();
  const shadowW = 120*dpr; const shadowH = 22*dpr;
  const shadowAlpha = clamp(1 + jumpY/140, 0.25, 1);
  ctx.fillStyle = `rgba(0,0,0,${0.25*shadowAlpha})`;
  ctx.beginPath();
  ctx.ellipse(x, y+8*dpr, shadowW, shadowH, 0, 0, Math.PI*2);
  ctx.fill();

  const bodyW = 80*dpr; const bodyH = 110*dpr;
  const bodyX = x - bodyW/2; const bodyY = y - bodyH - 8*dpr;
  const grd = ctx.createLinearGradient(x, bodyY, x, bodyY+bodyH);
  grd.addColorStop(0, '#7cf4d3');
  grd.addColorStop(1, '#4cd9bd');
  ctx.fillStyle = grd;
  roundRect(ctx, bodyX, bodyY, bodyW, bodyH, 16*dpr);
  ctx.fill();

  ctx.fillStyle = '#0d1022';
  ctx.beginPath(); ctx.arc(x-18*dpr, bodyY+44*dpr, 6*dpr, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(x+18*dpr, bodyY+44*dpr, 6*dpr, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#0d1022';
  ctx.beginPath(); ctx.arc(x, bodyY+64*dpr, 10*dpr, 0, Math.PI); ctx.fill();

  ctx.fillStyle = '#e6e8ff';
  roundRect(ctx, x-30*dpr, y-6*dpr, 24*dpr, 12*dpr, 6*dpr); ctx.fill();
  roundRect(ctx, x+6*dpr, y-6*dpr, 24*dpr, 12*dpr, 6*dpr); ctx.fill();
  ctx.restore();
}
function drawRope(ctx, cx, groundY, r, angle, missFlash){
  ctx.save();
  if(missFlash>0){
    ctx.fillStyle = `rgba(255, 107, 107, ${0.25*missFlash})`;
    ctx.fillRect(0,0,ctx.canvas.width, ctx.canvas.height);
  }
  const baseY = groundY - 10;
  const a = angle;
  const hx1 = cx - r*0.9 * Math.cos(a);
  const hy1 = baseY - r*0.35 * Math.sin(a);
  const hx2 = cx + r*0.9 * Math.cos(a);
  const hy2 = baseY + r*0.35 * Math.sin(a);
  ctx.lineWidth = 6; ctx.lineCap='round'; ctx.strokeStyle = getRopeGradient(ctx, cx, groundY, r);
  ctx.beginPath();
  ctx.moveTo(hx1, hy1);
  const c1x = cx - r * Math.cos(a + Math.PI/2);
  const c1y = baseY + r * 0.6;
  const c2x = cx + r * Math.cos(a + Math.PI/2);
  const c2y = baseY + r * 0.6;
  ctx.bezierCurveTo(c1x, c1y, c2x, c2y, hx2, hy2);
  ctx.stroke();
  ctx.fillStyle = '#ffd37a';
  ctx.beginPath(); ctx.arc(hx1, hy1, 8, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(hx2, hy2, 8, 0, Math.PI*2); ctx.fill();
  ctx.globalAlpha = 0.35; ctx.fillStyle = '#7cf4d3';
  ctx.beginPath(); ctx.arc(cx, groundY-2, 8, 0, Math.PI*2); ctx.fill();
  ctx.globalAlpha = 1;
  ctx.restore();
}
function getRopeGradient(ctx, cx, cy, r){
  const g = ctx.createLinearGradient(cx, cy-r, cx, cy+r);
  g.addColorStop(0, '#f7e88a');
  g.addColorStop(1, '#d8c35a');
  return g;
}
function roundRect(ctx, x, y, w, h, r){
  ctx.beginPath();
  ctx.moveTo(x+r, y);
  ctx.arcTo(x+w, y, x+w, y+h, r);
  ctx.arcTo(x+w, y+h, x, y+h, r);
  ctx.arcTo(x, y+h, x, y, r);
  ctx.arcTo(x, y, x+w, y, r);
  ctx.closePath();
}

// Toast & Overlay helpers
const toastEl = document.getElementById('toast');
let toastTimer = null;
function showToast(text){
  toastEl.textContent = text;
  toastEl.style.display = 'block';
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=> toastEl.style.display='none', 1800);
}
function hideOverlay(){ document.getElementById('overlay').style.display='none'; }
function showOverlay(){ document.getElementById('overlay').style.display='flex'; }

// Boot
const game = new Game(document.getElementById('cv'));
document.getElementById('bpmVal').textContent = document.getElementById('bpm').value;
document.getElementById('combo').textContent = '0';
document.getElementById('best').textContent = localStorage.getItem(LS.BEST)||'0';
document.getElementById('judge').textContent = '-';
if(localStorage.getItem(LS.SOUND)==='0'){
  document.getElementById('sndOff').classList.add('active');
  document.getElementById('sndOn').classList.remove('active');
}
// show learn card initially
(function(){
  const card = document.getElementById('learnCard');
  if(card){ card.style.display = 'block'; }
})();
