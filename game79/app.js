class EchoLaterDrawingApp {
  constructor() {
    this.canvas = document.getElementById('drawingCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.settings = {
      strokeColor: '#7de3ff',
      strokeWidth: 4,
      strokeAlpha: 0.85,
      echoIntervalMs: 65,
      echoCountMax: 70,
      shiftX: -2,
      shiftY: -2,
      scalePerEcho: 0.99,
      alphaPerEcho: 0.96
    };
    this.strokes = [];
    this.echoes = [];
    this.currentStroke = null;
    this.isDrawing = false;
    this.echoTimer = null;
    this.echoGeneration = 0;
    this.lastFrameAt = performance.now();
    this.fps = 60;

    this.resizeCanvas();
    this.bindEvents();
    this.bindControls();
    this.updateLabels();
    requestAnimationFrame((time) => this.render(time));
  }

  resizeCanvas() {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.width = rect.width;
    this.height = rect.height;
    this.canvas.width = Math.max(1, Math.floor(rect.width * dpr));
    this.canvas.height = Math.max(1, Math.floor(rect.height * dpr));
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  bindEvents() {
    window.addEventListener('resize', () => this.resizeCanvas());
    window.addEventListener('orientationchange', () => setTimeout(() => this.resizeCanvas(), 100));
    this.canvas.addEventListener('contextmenu', (event) => event.preventDefault());
    this.canvas.addEventListener('touchmove', (event) => event.preventDefault(), { passive: false });
    this.canvas.addEventListener('pointerdown', (event) => this.startStroke(event));
    this.canvas.addEventListener('pointermove', (event) => this.moveStroke(event));
    this.canvas.addEventListener('pointerup', (event) => this.endStroke(event));
    this.canvas.addEventListener('pointercancel', (event) => this.endStroke(event));
    document.getElementById('echoButton').addEventListener('click', () => this.startEcho());
    document.getElementById('clearEchoButton').addEventListener('click', () => this.clearEchoes());
    document.getElementById('undoButton').addEventListener('click', () => this.undoStroke());
    document.getElementById('clearCanvas').addEventListener('click', () => this.clearAll());
    document.getElementById('togglePanel').addEventListener('click', () => this.togglePanel());
  }

  bindControls() {
    const controlIds = ['strokeColor', 'strokeWidth', 'strokeAlpha', 'echoIntervalMs', 'echoCountMax', 'shiftX', 'shiftY', 'scalePerEcho', 'alphaPerEcho'];
    controlIds.forEach((id) => {
      const element = document.getElementById(id);
      element.addEventListener('input', () => {
        const value = element.type === 'range' ? Number(element.value) : element.value;
        this.settings[id] = id === 'strokeAlpha' ? value / 100 : value;
        if (id === 'echoIntervalMs' && this.echoTimer) this.restartEchoTimer();
        if (id === 'echoCountMax') this.trimEchoes();
        this.updateLabels();
      });
    });
  }

  updateLabels() {
    const labels = {
      strokeWidth: this.settings.strokeWidth,
      strokeAlpha: Math.round(this.settings.strokeAlpha * 100),
      echoIntervalMs: this.settings.echoIntervalMs,
      echoCountMax: this.settings.echoCountMax,
      shiftX: this.settings.shiftX,
      shiftY: this.settings.shiftY,
      scalePerEcho: this.settings.scalePerEcho.toFixed(3).replace(/0$/, ''),
      alphaPerEcho: this.settings.alphaPerEcho.toFixed(2)
    };
    Object.entries(labels).forEach(([key, value]) => {
      const label = document.getElementById(`${key}Value`);
      if (label) label.textContent = value;
    });
    this.updateStatus();
  }

  startStroke(event) {
    event.preventDefault();
    this.canvas.setPointerCapture(event.pointerId);
    this.isDrawing = true;
    this.currentStroke = {
      id: globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID() : String(Date.now() + Math.random()),
      color: this.settings.strokeColor,
      width: this.settings.strokeWidth,
      alpha: this.settings.strokeAlpha,
      points: []
    };
    this.addPoint(this.getPoint(event));
    this.updateStatus();
  }

  moveStroke(event) {
    if (!this.isDrawing) return;
    event.preventDefault();
    this.addPoint(this.getPoint(event));
  }

  endStroke(event) {
    if (!this.isDrawing) return;
    event.preventDefault();
    this.isDrawing = false;
    if (this.currentStroke && this.currentStroke.points.length > 0) {
      this.strokes.push(this.currentStroke);
    }
    this.currentStroke = null;
    this.updateStatus();
  }

  getPoint(event) {
    const rect = this.canvas.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top, pressure: event.pressure || 0.5 };
  }

  addPoint(point) {
    if (!this.currentStroke) return;
    const points = this.currentStroke.points;
    const previous = points[points.length - 1];
    if (previous && Math.hypot(point.x - previous.x, point.y - previous.y) < 1.8) return;
    points.push({ ...point, width: this.currentStroke.width * (0.55 + point.pressure * 0.45) });
  }

  startEcho() {
    const drawable = this.getDrawableStrokes();
    if (drawable.length === 0) return;
    this.echoGeneration += 1;
    this.echoes = [];
    this.snapshot(drawable);
    this.restartEchoTimer();
    this.updateStatus();
  }

  restartEchoTimer() {
    clearInterval(this.echoTimer);
    this.echoTimer = setInterval(() => this.snapshot(), this.settings.echoIntervalMs);
  }

  snapshot(sourceStrokes = this.getDrawableStrokes()) {
    if (sourceStrokes.length === 0) return;
    this.echoes.unshift({
      generation: this.echoGeneration,
      createdAt: performance.now(),
      strokes: sourceStrokes.map((stroke) => ({ ...stroke, points: stroke.points.map((point) => ({ ...point })) }))
    });
    this.trimEchoes();
  }

  getDrawableStrokes() {
    return this.currentStroke ? [...this.strokes, this.currentStroke] : [...this.strokes];
  }

  trimEchoes() {
    while (this.echoes.length > this.settings.echoCountMax) this.echoes.pop();
  }

  undoStroke() {
    if (this.isDrawing) return;
    this.strokes.pop();
    this.clearEchoes();
  }

  clearEchoes() {
    clearInterval(this.echoTimer);
    this.echoTimer = null;
    this.echoes = [];
    this.updateStatus();
  }

  clearAll() {
    this.clearEchoes();
    this.strokes = [];
    this.currentStroke = null;
    this.isDrawing = false;
    this.updateStatus();
  }

  render(time) {
    const delta = time - this.lastFrameAt;
    this.lastFrameAt = time;
    this.fps = this.fps * 0.9 + (1000 / Math.max(delta, 1)) * 0.1;
    this.ctx.clearRect(0, 0, this.width, this.height);

    this.echoes.slice().reverse().forEach((echo, index) => this.drawEcho(echo, index + 1));
    this.getDrawableStrokes().forEach((stroke) => this.drawStroke(stroke, 1, 0, 0, 1, true));

    document.getElementById('fpsStatus').textContent = `${Math.round(this.fps)} FPS`;
    requestAnimationFrame((nextTime) => this.render(nextTime));
  }

  drawEcho(echo, echoIndex) {
    const scale = Math.pow(this.settings.scalePerEcho, echoIndex);
    const alpha = Math.pow(this.settings.alphaPerEcho, echoIndex);
    const dx = this.settings.shiftX * echoIndex;
    const dy = this.settings.shiftY * echoIndex;
    echo.strokes.forEach((stroke) => this.drawStroke(stroke, alpha, dx, dy, scale, false));
  }

  drawStroke(stroke, alphaMultiplier, dx, dy, scale, isOriginal) {
    if (stroke.points.length === 0) return;
    const center = stroke.points[Math.floor(stroke.points.length / 2)] || stroke.points[0];
    this.ctx.save();
    this.ctx.globalAlpha = Math.max(0, Math.min(1, stroke.alpha * alphaMultiplier));
    this.ctx.translate(dx, dy);
    this.ctx.translate(center.x, center.y);
    this.ctx.scale(scale, scale);
    this.ctx.translate(-center.x, -center.y);
    this.ctx.strokeStyle = stroke.color;
    this.ctx.fillStyle = stroke.color;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.ctx.shadowColor = stroke.color;
    this.ctx.shadowBlur = isOriginal ? 4 : 10;

    if (stroke.points.length === 1) {
      const point = stroke.points[0];
      this.ctx.beginPath();
      this.ctx.arc(point.x, point.y, Math.max(1, stroke.width * 0.5), 0, Math.PI * 2);
      this.ctx.fill();
    } else {
      this.ctx.beginPath();
      this.ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      for (let index = 1; index < stroke.points.length; index += 1) {
        this.ctx.lineWidth = Math.max(0.5, stroke.points[index].width || stroke.width);
        this.ctx.lineTo(stroke.points[index].x, stroke.points[index].y);
      }
      this.ctx.stroke();
    }
    this.ctx.restore();
  }

  updateStatus() {
    const echoState = this.echoTimer ? `Echo中 (${this.echoes.length})` : 'Echo待機中';
    document.getElementById('strokeStatus').textContent = `${this.strokes.length}${this.currentStroke ? '+描画中' : ''}本の線 / ${echoState}`;
  }

  togglePanel() {
    const panel = document.getElementById('settingsPanel');
    const button = document.getElementById('togglePanel');
    panel.classList.toggle('collapsed');
    const open = !panel.classList.contains('collapsed');
    button.textContent = open ? '▼' : '▲';
    button.setAttribute('aria-expanded', String(open));
  }
}

window.addEventListener('DOMContentLoaded', () => new EchoLaterDrawingApp());
