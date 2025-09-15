function hexToHsl(hex){
  hex = hex.replace('#','');
  const r = parseInt(hex.substring(0,2),16)/255;
  const g = parseInt(hex.substring(2,4),16)/255;
  const b = parseInt(hex.substring(4,6),16)/255;
  const max = Math.max(r,g,b), min = Math.min(r,g,b);
  let h, s, l = (max + min) / 2;
  if(max === min){
    h = 0;
    s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch(max){
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h *= 60;
  }
  return {h, s: s*100, l: l*100};
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
    this.resize();
    window.addEventListener('resize', ()=>this.resize());
  }
  resize(){
    const dpr = window.devicePixelRatio || 1;
    this.echoCanvas.width = window.innerWidth * dpr;
    this.echoCanvas.height = window.innerHeight * dpr;
    this.ctx.scale(dpr, dpr);
  }
  generate(progress=1){
    const s = this.settings;
    const {width,height} = this.drawCanvas;
    this.ctx.clearRect(0,0,width,height);
    let start, dH, dS, dL;
    if(s.colorMode === 'gradient'){
      start = hexToHsl(s.startColor);
      const end = hexToHsl(s.endColor);
      dH = (end.h - start.h)/s.echoCount;
      dS = (end.s - start.s)/s.echoCount;
      dL = (end.l - start.l)/s.echoCount;
    }
    for(let i=1;i<=s.echoCount;i++){
      const dx = s.shiftX * i * progress;
      const dy = s.shiftY * i * progress;
      const scale = Math.max(1 - s.shiftZ * i * progress, 0);
      if(scale <= 0) break;
      this.ctx.save();
      this.ctx.globalAlpha = Math.max(1 - s.opacity * i * progress,0);
      if(s.colorMode === 'gradient'){
        this.ctx.filter = 'none';
        this.ctx.translate(dx, dy);
        this.ctx.scale(scale, scale);
        this.ctx.drawImage(this.drawCanvas,0,0);
        this.ctx.globalCompositeOperation = 'source-in';
        const h = start.h + dH * i;
        const sat = start.s + dS * i;
        const l = start.l + dL * i;
        this.ctx.fillStyle = `hsl(${h},${sat}%,${l}%)`;
        this.ctx.fillRect(0,0,width,height);
        this.ctx.globalCompositeOperation = 'source-over';
      } else {
        this.ctx.filter = `hue-rotate(${s.hueShift*i}deg)`;
        this.ctx.translate(dx, dy);
        this.ctx.scale(scale, scale);
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
function bindSlider(id, property, labelId){
  const el = document.getElementById(id);
  const lab = document.getElementById(labelId);
  el.addEventListener('input', ()=>{
    settings[property] = property==='penSize' ? parseFloat(el.value) : parseFloat(el.value);
    lab.textContent = el.value;
    if(property==='penSize') canvasManager.setBrush();
    if(settings.mode==='realtime') echoEngine.generate();
  });
}

bindSlider('echoCount','echoCount','echoCountLabel');
bindSlider('shiftX','shiftX','shiftXLabel');
bindSlider('shiftY','shiftY','shiftYLabel');
bindSlider('shiftZ','shiftZ','shiftZLabel');
bindSlider('hueShift','hueShift','hueShiftLabel');
bindSlider('opacity','opacity','opacityLabel');
bindSlider('penSize','penSize','penSizeLabel');

document.getElementById('startColor').addEventListener('input',e=>{settings.startColor=e.target.value;if(settings.mode==='realtime') echoEngine.generate();});
document.getElementById('endColor').addEventListener('input',e=>{settings.endColor=e.target.value;if(settings.mode==='realtime') echoEngine.generate();});

document.getElementById('mode').addEventListener('change',e=>{settings.mode=e.target.value;});
document.getElementById('colorMode').addEventListener('change',e=>{settings.colorMode=e.target.value;document.getElementById('hueShift').disabled = settings.colorMode==='gradient';if(settings.mode==='realtime') echoEngine.generate();});
document.getElementById('hueShift').disabled = settings.colorMode==='gradient';

document.getElementById('echoBtn').addEventListener('click',()=>{echoEngine.generate();});

document.getElementById('togglePanel').addEventListener('click',()=>{
  document.getElementById('settingsPanel').classList.toggle('open');
});

document.getElementById('closePanel').addEventListener('click',()=>{
  document.getElementById('settingsPanel').classList.remove('open');
});

document.getElementById('exportGif').addEventListener('click',()=>gifExporter.export());
document.getElementById('clearCanvas').addEventListener('click',()=>{
  canvasManager.ctx.clearRect(0,0,drawCanvas.width,drawCanvas.height);
  echoEngine.ctx.clearRect(0,0,echoCanvas.width,echoCanvas.height);
});

// Drawing events
function getPos(e){
  const rect = drawCanvas.getBoundingClientRect();
  return {x: e.clientX - rect.left, y: e.clientY - rect.top};
}

drawCanvas.addEventListener('pointerdown', e=>{
  const p = getPos(e); canvasManager.start(p.x,p.y);
});

drawCanvas.addEventListener('pointermove', e=>{
  const p = getPos(e); canvasManager.draw(p.x,p.y);
  if(settings.mode==='realtime') echoEngine.generate();
});

drawCanvas.addEventListener('pointerup', ()=>canvasManager.end());
drawCanvas.addEventListener('pointerleave', ()=>canvasManager.end());
