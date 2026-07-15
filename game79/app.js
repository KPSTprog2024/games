class EphemeralEchoApp {
    constructor() {
        this.canvas = document.getElementById('drawingCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.settings = {
            echoIntervalMs: 70,
            echoCountMax: 80,
            shiftX: -1,
            shiftY: -2,
            scalePerEcho: 0.99,
            alphaPerEcho: 0.98,
            strokeColor: '#9ee7ff',
            strokeWidth: 3,
            strokeAlpha: 0.75
        };
        this.echoes = [];
        this.currentStroke = null;
        this.isDrawing = false;
        this.echoTimer = null;
        this.lastFrameAt = performance.now();
        this.fps = 60;

        this.resizeCanvas();
        this.bindEvents();
        this.bindControls();
        this.startEchoTimer();
        requestAnimationFrame((time) => this.render(time));
    }

    resizeCanvas() {
        const rect = this.canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        this.width = rect.width;
        this.height = rect.height;
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
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
        document.getElementById('clearCanvas').addEventListener('click', () => this.clear());
        document.getElementById('togglePanel').addEventListener('click', () => this.togglePanel());
    }

    bindControls() {
        ['strokeColor', 'strokeWidth', 'strokeAlpha', 'echoIntervalMs', 'echoCountMax'].forEach((id) => {
            const element = document.getElementById(id);
            element.addEventListener('input', () => {
                const rawValue = element.type === 'range' ? Number(element.value) : element.value;
                this.settings[id] = id === 'strokeAlpha' ? rawValue / 100 : rawValue;
                if (id === 'echoIntervalMs') this.restartEchoTimer();
                if (id === 'echoCountMax') this.trimEchoes();
                this.updateLabels();
            });
        });
        this.updateLabels();
    }

    updateLabels() {
        const values = {
            strokeWidth: this.settings.strokeWidth,
            strokeAlpha: Math.round(this.settings.strokeAlpha * 100),
            echoIntervalMs: this.settings.echoIntervalMs,
            echoCountMax: this.settings.echoCountMax
        };
        Object.entries(values).forEach(([key, value]) => {
            const label = document.getElementById(`${key}Value`);
            if (label) label.textContent = value;
        });
    }

    startStroke(event) {
        event.preventDefault();
        this.canvas.setPointerCapture(event.pointerId);
        this.clear();
        this.isDrawing = true;
        this.currentStroke = {
            color: this.settings.strokeColor,
            width: this.settings.strokeWidth,
            alpha: this.settings.strokeAlpha,
            points: []
        };
        this.addPoint(this.getPoint(event));
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
    }

    getPoint(event) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top,
            pressure: event.pressure || 0.5
        };
    }

    addPoint(point) {
        if (!this.currentStroke) return;
        const points = this.currentStroke.points;
        const previous = points[points.length - 1];
        if (previous && Math.hypot(point.x - previous.x, point.y - previous.y) < 2) return;
        points.push({
            ...point,
            width: this.currentStroke.width * (0.5 + point.pressure * 0.5)
        });
    }

    startEchoTimer() {
        this.echoTimer = setInterval(() => this.snapshot(), this.settings.echoIntervalMs);
    }

    restartEchoTimer() {
        clearInterval(this.echoTimer);
        this.startEchoTimer();
    }

    snapshot() {
        if (!this.currentStroke || this.currentStroke.points.length === 0) return;
        this.echoes.unshift({
            color: this.currentStroke.color,
            width: this.currentStroke.width,
            alpha: this.currentStroke.alpha,
            points: this.currentStroke.points.map((point) => ({ ...point }))
        });
        this.trimEchoes();
    }

    trimEchoes() {
        while (this.echoes.length > this.settings.echoCountMax) this.echoes.pop();
    }

    render(time) {
        const delta = time - this.lastFrameAt;
        this.lastFrameAt = time;
        this.fps = this.fps * 0.9 + (1000 / Math.max(delta, 1)) * 0.1;
        this.ctx.clearRect(0, 0, this.width, this.height);

        this.echoes.slice().reverse().forEach((echo, index) => this.drawStroke(echo, index));
        if (this.currentStroke) this.drawStroke(this.currentStroke, 0, true);

        document.getElementById('fpsStatus').textContent = `${Math.round(this.fps)} FPS`;
        document.getElementById('branchStatus').textContent = this.currentStroke ? '描いている間だけ残る' : '次の線で消える';
        requestAnimationFrame((nextTime) => this.render(nextTime));
    }

    drawStroke(stroke, echoIndex, isCurrent = false) {
        if (stroke.points.length === 0) return;
        const alpha = isCurrent ? stroke.alpha : stroke.alpha * Math.pow(this.settings.alphaPerEcho, echoIndex);
        const scale = isCurrent ? 1 : Math.pow(this.settings.scalePerEcho, echoIndex);
        const dx = isCurrent ? 0 : this.settings.shiftX * echoIndex;
        const dy = isCurrent ? 0 : this.settings.shiftY * echoIndex;
        const center = stroke.points[Math.floor(stroke.points.length / 2)] || stroke.points[0];

        this.ctx.save();
        this.ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
        this.ctx.translate(dx, dy);
        this.ctx.translate(center.x, center.y);
        this.ctx.scale(scale, scale);
        this.ctx.translate(-center.x, -center.y);
        this.ctx.strokeStyle = stroke.color;
        this.ctx.fillStyle = stroke.color;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.shadowColor = stroke.color;
        this.ctx.shadowBlur = isCurrent ? 3 : 8;

        this.ctx.beginPath();
        this.ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
        if (stroke.points.length === 1) {
            this.ctx.arc(stroke.points[0].x, stroke.points[0].y, Math.max(1, stroke.width * 0.5), 0, Math.PI * 2);
            this.ctx.fill();
        } else {
            for (let index = 1; index < stroke.points.length; index += 1) {
                const point = stroke.points[index];
                this.ctx.lineWidth = Math.max(0.5, (point.width || stroke.width) * scale);
                this.ctx.lineTo(point.x, point.y);
            }
            this.ctx.stroke();
        }
        this.ctx.restore();
    }

    clear() {
        this.echoes = [];
        this.currentStroke = null;
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

window.addEventListener('DOMContentLoaded', () => new EphemeralEchoApp());
