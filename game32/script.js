function hexToRgb(hex){
  let value = hex.replace('#','');
  if(value.length===3){
    value = value.split('').map(v=>v+v).join('');
  }
  const int = parseInt(value,16);
  return {
    r:(int>>16)&255,
    g:(int>>8)&255,
    b:int&255
  };
}

function lerpColor(startHex, endHex, t){
  const start = hexToRgb(startHex);
  const end = hexToRgb(endHex);
  const ratio = Math.min(Math.max(t,0),1);
  const r = Math.round(start.r + (end.r - start.r) * ratio);
  const g = Math.round(start.g + (end.g - start.g) * ratio);
  const b = Math.round(start.b + (end.b - start.b) * ratio);
  return `rgb(${r},${g},${b})`;
}

class Settings {
  constructor(){
    this.echoCount = 60;
    this.shiftX = 0;
    this.shiftY = 0;
    this.shiftZ = 0.01;
    this.hueShift = 12;
    this.startColor = '#ff0000';
    this.endColor = '#0000ff';
    this.opacity = 0.02;
    this.penSize = 5;
    this.mode = 'realtime';
    this.colorMode = 'rainbow';
  }
}

class CanvasManager {
  constructor(canvas, settings){
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.settings = settings;
    this.drawing = false;
    this.resize();
    window.addEventListener('resize', ()=>this.resize());
  }
  resize(){
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = window.innerWidth * dpr;
    this.canvas.height = window.innerHeight * dpr;
    this.ctx.setTransform(1,0,0,1,0,0);
    this.ctx.scale(dpr, dpr);
  }
  setBrush(){
    this.ctx.lineWidth = this.settings.penSize;
    this.ctx.lineCap = 'round';
    this.ctx.strokeStyle = this.settings.startColor;
  }
  start(x,y){
    this.setBrush();
    this.ctx.beginPath();
    this.ctx.moveTo(x,y);
    this.drawing = true;
  }
  draw(x,y){
    if(!this.drawing) return;
    this.ctx.lineTo(x,y);
    this.ctx.stroke();
  }
  end(){ this.drawing = false; }
}

class EchoEngine {
  constructor(drawCanvas, echoCanvas, settings){
    this.drawCanvas = drawCanvas;
    this.echoCanvas = echoCanvas;
    this.ctx = echoCanvas.getContext('2d');
    this.settings = settings;
    this.animationFrame = null;
    this.animationDuration = 600;
    this.tintCanvas = document.createElement('canvas');
    this.tintCtx = this.tintCanvas.getContext('2d');
    this.resize();
    window.addEventListener('resize', ()=>this.resize());
  }
  resize(){
    const dpr = window.devicePixelRatio || 1;
    this.echoCanvas.width = window.innerWidth * dpr;
    this.echoCanvas.height = window.innerHeight * dpr;
    this.ctx.setTransform(1,0,0,1,0,0);
    this.ctx.scale(dpr, dpr);
    this.tintCanvas.width = this.drawCanvas.width;
    this.tintCanvas.height = this.drawCanvas.height;
  }
  cancelAnimation(){
    if(this.animationFrame){
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }
  playAnimation(){
    this.cancelAnimation();
    this.generate(0);
    const start = performance.now();
    const step = (now)=>{
      const progress = Math.min((now - start) / this.animationDuration, 1);
      this.generate(progress);
      if(progress < 1){
        this.animationFrame = requestAnimationFrame(step);
      } else {
        this.animationFrame = null;
      }
    };
    this.animationFrame = requestAnimationFrame(step);
  }
  generate(progress=1){
    const s = this.settings;
    const {width,height} = this.drawCanvas;
    this.ctx.save();
    this.ctx.setTransform(1,0,0,1,0,0);
    this.ctx.clearRect(0,0,this.echoCanvas.width,this.echoCanvas.height);
    this.ctx.restore();
    if(progress <= 0){
      return;
    }
    const phase = progress * s.echoCount;
    for(let i=1;i<=s.echoCount;i++){
      if(phase < i-1){
        break;
      }
      const local = Math.min(Math.max(phase - (i-1), 0), 1);
      if(local <= 0){
        continue;
      }
      const dx = s.shiftX * i * local;
      const dy = s.shiftY * i * local;
      const scale = 1 - s.shiftZ * i * local;
      if(scale <= 0){
        break;
      }
      const baseAlpha = Math.max(1 - s.opacity * i, 0);
      const alpha = baseAlpha * local;
      if(alpha <= 0){
        continue;
      }
      this.ctx.save();
      this.ctx.globalAlpha = alpha;
      this.ctx.translate(dx, dy);
      this.ctx.scale(scale, scale);
      if(s.colorMode === 'gradient'){
        const ratio = s.echoCount === 1 ? 1 : (i-1)/(s.echoCount-1);
        const color = lerpColor(s.startColor, s.endColor, ratio);
        this.tintCtx.clearRect(0,0,width,height);
        this.tintCtx.drawImage(this.drawCanvas,0,0);
        this.tintCtx.globalCompositeOperation = 'source-in';
        this.tintCtx.fillStyle = color;
        this.tintCtx.fillRect(0,0,width,height);
        this.tintCtx.globalCompositeOperation = 'source-over';
        this.ctx.filter = 'none';
        this.ctx.drawImage(this.tintCanvas,0,0);
      } else {
        this.ctx.filter = `hue-rotate(${s.hueShift * i}deg)`;
        this.ctx.drawImage(this.drawCanvas,0,0);
      }
      this.ctx.restore();
    }
  }
}

class GifExporter {
  constructor(drawCanvas, echoCanvas, settings){
    this.drawCanvas = drawCanvas;
    this.echoCanvas = echoCanvas;
    this.settings = settings;
  }
  export(){
    app.echo.cancelAnimation();
    const gif = new GIF({
      workers:2,
      quality:10,
      workerScript:'https://cdnjs.cloudflare.com/ajax/libs/gif.js/0.2.0/gif.worker.js'
    });
    const composite = document.createElement('canvas');
    composite.width = this.drawCanvas.width;
    composite.height = this.drawCanvas.height;
    const cctx = composite.getContext('2d');
    const frames = 20;
    for(let f=0; f<frames; f++){
      const prog = f/(frames-1);
      app.echo.generate(prog);
      cctx.clearRect(0,0,composite.width,composite.height);
      cctx.drawImage(this.drawCanvas,0,0);
      cctx.drawImage(this.echoCanvas,0,0);
      gif.addFrame(cctx, {copy:true, delay:100});
    }
    app.echo.generate(1);
    gif.on('finished', function(blob){
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'echo.gif';
      a.click();
    });
    gif.render();
  }
}

const settings = new Settings();
const drawCanvas = document.getElementById('drawCanvas');
const echoCanvas = document.getElementById('echoCanvas');
const canvasManager = new CanvasManager(drawCanvas, settings);
const echoEngine = new EchoEngine(drawCanvas, echoCanvas, settings);
const gifExporter = new GifExporter(drawCanvas, echoCanvas, settings);

const app = {canvas:canvasManager, echo:echoEngine, gif:gifExporter, settings};

// UI bindings
function bindSlider(id, property, labelId, parser=parseFloat){
  const el = document.getElementById(id);
  const lab = document.getElementById(labelId);
  el.addEventListener('input', ()=>{
    const value = parser(el.value);
    settings[property] = value;
    lab.textContent = el.value;
    if(property==='penSize') canvasManager.setBrush();
    if(settings.mode==='realtime') echoEngine.playAnimation();
  });
}

bindSlider('echoCount','echoCount','echoCountLabel', value => parseInt(value,10));
bindSlider('shiftX','shiftX','shiftXLabel');
bindSlider('shiftY','shiftY','shiftYLabel');
bindSlider('shiftZ','shiftZ','shiftZLabel');
bindSlider('hueShift','hueShift','hueShiftLabel');
bindSlider('opacity','opacity','opacityLabel');
bindSlider('penSize','penSize','penSizeLabel');

document.getElementById('startColor').addEventListener('input',e=>{
  settings.startColor=e.target.value;
  if(settings.mode==='realtime') echoEngine.playAnimation();
});
document.getElementById('endColor').addEventListener('input',e=>{
  settings.endColor=e.target.value;
  if(settings.mode==='realtime') echoEngine.playAnimation();
});

document.getElementById('mode').addEventListener('change',e=>{
  settings.mode=e.target.value;
  if(settings.mode!=='realtime'){
    echoEngine.cancelAnimation();
  } else {
    echoEngine.playAnimation();
  }
});
document.getElementById('colorMode').addEventListener('change',e=>{
  settings.colorMode=e.target.value;
  document.getElementById('hueShift').disabled = settings.colorMode==='gradient';
  if(settings.mode==='realtime') echoEngine.playAnimation();
});
document.getElementById('hueShift').disabled = settings.colorMode==='gradient';

document.getElementById('echoBtn').addEventListener('click',()=>{echoEngine.playAnimation();});
document.getElementById('togglePanel').addEventListener('click',()=>{
  document.getElementById('settingsPanel').classList.toggle('open');
});

document.getElementById('closePanel').addEventListener('click',()=>{
  document.getElementById('settingsPanel').classList.remove('open');
});

document.getElementById('exportGif').addEventListener('click',()=>gifExporter.export());
document.getElementById('clearCanvas').addEventListener('click',()=>{
  canvasManager.ctx.save();
  canvasManager.ctx.setTransform(1,0,0,1,0,0);
  canvasManager.ctx.clearRect(0,0,drawCanvas.width,drawCanvas.height);
  canvasManager.ctx.restore();
  echoEngine.cancelAnimation();
  echoEngine.ctx.save();
  echoEngine.ctx.setTransform(1,0,0,1,0,0);
  echoEngine.ctx.clearRect(0,0,echoCanvas.width,echoCanvas.height);
  echoEngine.ctx.restore();
});

// Drawing events
function getPos(e){
  const rect = drawCanvas.getBoundingClientRect();
  return {x: e.clientX - rect.left, y: e.clientY - rect.top};
}

drawCanvas.addEventListener('pointerdown', e=>{
  const p = getPos(e);
  canvasManager.start(p.x,p.y);
  if(settings.mode==='realtime'){
    echoEngine.playAnimation();
  }
});

drawCanvas.addEventListener('pointermove', e=>{
  const p = getPos(e);
  canvasManager.draw(p.x,p.y);
  if(settings.mode==='realtime' && canvasManager.drawing && !echoEngine.animationFrame) {
    echoEngine.playAnimation();
  }
});

drawCanvas.addEventListener('pointerup', ()=>canvasManager.end());
drawCanvas.addEventListener('pointerleave', ()=>canvasManager.end());
