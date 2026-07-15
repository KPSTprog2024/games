class SpreadingEchoApp {
    constructor() {
        this.canvas = document.getElementById('drawingCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.settings = {
            echoIntervalMs: 70, echoCountMax: 90, baseAngleDeg: 225, echoDistance: 3,
            spreadAngleDeg: 50, spreadGrowth: 0.025, branch3Start: 12, branch5Start: 32,
            spreadMode: 'growing', pulseFrequency: 0.5, pulseDepth: 0.35, spiralRotationPerEcho: 2,
            scalePerEcho: 0.99, alphaPerEcho: 0.965, blurPerEcho: 0.15,
            colorMode: 'gradient', strokeColor: '#00c8ff', gradientEndColor: '#ff4fd8', hueShift: 24,
            strokeWidth: 4, strokeAlpha: 0.85, decorationTheme: 'spark', sparkAmount: 0.45,
            radialBloomStrength: 0.25, radialBloomRadius: 24, spiralRadius: 10, spiralTightness: 0.8,
            tornadoLift: 0.35, rippleInterval: 180, rippleRadiusGrowth: 1.8, rippleAlphaDecay: 0.92,
            stampDensity: 0.12
        };
        this.presets = this.createPresets();
        this.strokes = [];
        this.echoes = [];
        this.particles = [];
        this.ripples = [];
        this.currentStroke = null;
        this.lastEchoAt = 0;
        this.lastFrameAt = performance.now();
        this.fps = 60;
        this.resizeCanvas();
        this.bindEvents();
        this.bindControls();
        requestAnimationFrame((time) => this.render(time));
    }

    createPresets() {
        return {
            softFan: { decorationTheme: 'bloom', spreadMode: 'growing', spreadAngleDeg: 42, branch3Start: 14, branch5Start: 44, strokeColor: '#00c8ff', gradientEndColor: '#ff4fd8', sparkAmount: 0.25 },
            sparkler: { decorationTheme: 'spark', spreadMode: 'pulse', spreadAngleDeg: 62, branch3Start: 8, branch5Start: 24, strokeColor: '#fff0a8', gradientEndColor: '#ff6a00', colorMode: 'gradient', sparkAmount: 0.85 },
            spiralRibbon: { decorationTheme: 'spiralRibbon', spreadMode: 'spiral', spreadAngleDeg: 72, branch3Start: 6, branch5Start: 22, strokeColor: '#8dfcff', gradientEndColor: '#b86bff', sparkAmount: 0.45, spiralRadius: 18, spiralTightness: 1.2 },
            tornado: { decorationTheme: 'tornado', spreadMode: 'spiral', spreadAngleDeg: 88, branch3Start: 5, branch5Start: 18, strokeColor: '#b7ffea', gradientEndColor: '#ffffff', sparkAmount: 0.35, tornadoLift: 0.75 },
            ripple: { decorationTheme: 'ripple', spreadMode: 'mirror', spreadAngleDeg: 34, branch3Start: 10, branch5Start: 34, strokeColor: '#68d8ff', gradientEndColor: '#b7fff6', sparkAmount: 0.3 },
            starShower: { decorationTheme: 'stamp', spreadMode: 'growing', spreadAngleDeg: 105, branch3Start: 4, branch5Start: 14, strokeColor: '#ffd166', gradientEndColor: '#ff4fd8', colorMode: 'rainbow', sparkAmount: 0.75, stampDensity: 0.35 }
        };
    }

    resizeCanvas() {
        const dpr = window.devicePixelRatio || 1;
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = Math.floor(this.width * dpr);
        this.canvas.height = Math.floor(this.height * dpr);
        this.canvas.style.width = `${this.width}px`;
        this.canvas.style.height = `${this.height}px`;
        this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    bindEvents() {
        window.addEventListener('resize', () => this.resizeCanvas());
        window.addEventListener('orientationchange', () => setTimeout(() => this.resizeCanvas(), 120));
        this.canvas.addEventListener('contextmenu', (event) => event.preventDefault());
        this.canvas.addEventListener('pointerdown', (event) => this.startStroke(event));
        this.canvas.addEventListener('pointermove', (event) => this.moveStroke(event));
        this.canvas.addEventListener('pointerup', (event) => this.endStroke(event));
        this.canvas.addEventListener('pointercancel', (event) => this.endStroke(event));
        document.getElementById('clearCanvas').addEventListener('click', () => this.clear());
        document.getElementById('togglePanel').addEventListener('click', () => this.togglePanel());
    }

    bindControls() {
        document.querySelectorAll('.preset-button').forEach((button) => {
            button.addEventListener('click', () => {
                document.querySelectorAll('.preset-button').forEach((item) => item.classList.remove('active'));
                button.classList.add('active');
                Object.assign(this.settings, this.presets[button.dataset.preset]);
                this.syncControls();
            });
        });
        const controls = ['strokeColor', 'gradientEndColor', 'colorMode', 'strokeWidth', 'strokeAlpha', 'baseAngleDeg', 'echoDistance', 'spreadAngleDeg', 'branch3Start', 'branch5Start', 'spreadMode', 'echoIntervalMs', 'echoCountMax', 'decorationTheme', 'sparkAmount'];
        controls.forEach((id) => {
            const element = document.getElementById(id);
            element.addEventListener('input', () => {
                const numeric = element.type === 'range';
                this.settings[id] = numeric ? Number(element.value) : element.value;
                if (id === 'strokeAlpha' || id === 'sparkAmount') this.settings[id] = Number(element.value) / (id === 'strokeAlpha' ? 100 : 100);
                if (id === 'echoCountMax') this.trimEchoes();
                this.updateValueLabels();
            });
        });
        this.syncControls();
    }

    syncControls() {
        Object.entries(this.settings).forEach(([key, value]) => {
            const element = document.getElementById(key);
            if (!element) return;
            element.value = key === 'strokeAlpha' || key === 'sparkAmount' ? Math.round(value * 100) : value;
        });
        this.updateValueLabels();
    }

    updateValueLabels() {
        const labelMap = { strokeWidth: '', strokeAlpha: '', baseAngleDeg: '', echoDistance: '', spreadAngleDeg: '', branch3Start: '', branch5Start: '', echoIntervalMs: '', echoCountMax: '', sparkAmount: '' };
        Object.keys(labelMap).forEach((key) => {
            const label = document.getElementById(`${key}Value`);
            if (!label) return;
            const value = key === 'strokeAlpha' || key === 'sparkAmount' ? Math.round(this.settings[key] * 100) : this.settings[key];
            label.textContent = value;
        });
    }

    startStroke(event) {
        event.preventDefault();
        this.canvas.setPointerCapture(event.pointerId);
        const point = this.getPoint(event);
        this.currentStroke = { id: this.createId(), points: [point], color: this.settings.strokeColor, width: this.settings.strokeWidth, alpha: this.settings.strokeAlpha, createdAt: performance.now() };
        this.strokes.push(this.currentStroke);
        this.addRipple(point, performance.now());
    }

    moveStroke(event) {
        if (!this.currentStroke) return;
        event.preventDefault();
        const point = this.getPoint(event);
        const points = this.currentStroke.points;
        const last = points[points.length - 1];
        const distance = Math.hypot(point.x - last.x, point.y - last.y);
        const steps = Math.max(1, Math.floor(distance / 6));
        for (let index = 1; index <= steps; index += 1) {
            points.push({ x: last.x + ((point.x - last.x) * index) / steps, y: last.y + ((point.y - last.y) * index) / steps, pressure: point.pressure, time: point.time });
        }
        if (point.time - this.lastEchoAt > this.settings.echoIntervalMs) {
            this.createEcho(this.currentStroke, point.time);
            this.lastEchoAt = point.time;
        }
    }

    endStroke(event) {
        if (!this.currentStroke) return;
        this.moveStroke(event);
        this.createEcho(this.currentStroke, performance.now());
        this.currentStroke = null;
    }

    getPoint(event) {
        const rect = this.canvas.getBoundingClientRect();
        return { x: event.clientX - rect.left, y: event.clientY - rect.top, pressure: event.pressure || 0.5, time: performance.now() };
    }

    createId() {
        if (window.crypto && typeof window.crypto.randomUUID === 'function') return window.crypto.randomUUID();
        return `stroke-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    }

    createEcho(stroke, time) {
        if (!stroke || stroke.points.length < 1) return;
        const echoIndex = this.echoes.length ? this.echoes[this.echoes.length - 1].echoIndex + 1 : 1;
        const branchCount = this.getBranchCount(echoIndex);
        const offsets = this.getBranchOffsets(branchCount);
        offsets.forEach((branchOffset, branchIndex) => {
            const angleDeg = this.getAngle(echoIndex, branchOffset, time);
            const distance = this.settings.echoDistance * echoIndex;
            const rad = (angleDeg * Math.PI) / 180;
            const tornadoLift = this.settings.decorationTheme === 'tornado' ? echoIndex * this.settings.tornadoLift * -1.4 : 0;
            const echo = {
                source: stroke, echoIndex, branchIndex, branchCount, angleDeg,
                dx: Math.cos(rad) * distance,
                dy: Math.sin(rad) * distance + tornadoLift,
                scale: Math.pow(this.settings.scalePerEcho, echoIndex),
                alpha: Math.pow(this.settings.alphaPerEcho, echoIndex),
                color: this.getEchoColor(echoIndex, branchIndex),
                blur: this.settings.blurPerEcho * echoIndex,
                createdAt: time
            };
            this.echoes.push(echo);
            this.decorateEcho(echo, time);
        });
        this.trimEchoes();
    }

    trimEchoes() {
        const max = this.settings.echoCountMax * 5;
        if (this.echoes.length > max) this.echoes.splice(0, this.echoes.length - max);
    }

    getBranchCount(echoIndex) {
        if (echoIndex >= this.settings.branch5Start) return 5;
        if (echoIndex >= this.settings.branch3Start) return 3;
        return 1;
    }

    getBranchOffsets(branchCount) {
        if (branchCount === 1) return [0];
        if (branchCount === 3) return [-0.5, 0, 0.5];
        return [-1, -0.5, 0, 0.5, 1];
    }

    getSpreadRatio(echoIndex, time) {
        const growing = Math.min(1, echoIndex * this.settings.spreadGrowth);
        if (this.settings.spreadMode !== 'pulse') return growing;
        const pulse = 1 - this.settings.pulseDepth + Math.sin(time * 0.001 * Math.PI * 2 * this.settings.pulseFrequency) * this.settings.pulseDepth;
        return Math.max(0.08, Math.min(1, growing * pulse));
    }

    getAngle(echoIndex, branchOffset, time) {
        let base = this.settings.baseAngleDeg;
        if (this.settings.spreadMode === 'spiral') base += echoIndex * this.settings.spiralRotationPerEcho;
        const mirrorBoost = this.settings.spreadMode === 'mirror' ? 1.25 : 1;
        return base + branchOffset * this.settings.spreadAngleDeg * this.getSpreadRatio(echoIndex, time) * mirrorBoost;
    }

    getEchoColor(echoIndex, branchIndex) {
        if (this.settings.colorMode === 'solid') return this.settings.strokeColor;
        if (this.settings.colorMode === 'rainbow') return `hsl(${(echoIndex * this.settings.hueShift + branchIndex * 34) % 360}, 94%, 66%)`;
        return this.mixHex(this.settings.strokeColor, this.settings.gradientEndColor, Math.min(1, echoIndex / this.settings.echoCountMax));
    }

    mixHex(start, end, ratio) {
        const a = this.hexToRgb(start), b = this.hexToRgb(end);
        return `rgb(${Math.round(a.r + (b.r - a.r) * ratio)}, ${Math.round(a.g + (b.g - a.g) * ratio)}, ${Math.round(a.b + (b.b - a.b) * ratio)})`;
    }

    hexToRgb(hex) {
        const value = hex.replace('#', '');
        return { r: parseInt(value.slice(0, 2), 16), g: parseInt(value.slice(2, 4), 16), b: parseInt(value.slice(4, 6), 16) };
    }

    decorateEcho(echo, time) {
        const points = echo.source.points;
        const tip = points[points.length - 1];
        if (!tip) return;
        const x = tip.x + echo.dx;
        const y = tip.y + echo.dy;
        if (this.settings.decorationTheme === 'spark' || this.settings.decorationTheme === 'stamp') this.addSparks(x, y, echo, time);
        if (this.settings.decorationTheme === 'ripple') this.addRipple({ x, y }, time);
    }

    addSparks(x, y, echo, time) {
        const count = Math.round((3 + echo.branchCount * 1.8) * this.settings.sparkAmount);
        for (let index = 0; index < count; index += 1) {
            const angle = ((echo.angleDeg + (Math.random() - 0.5) * 80) * Math.PI) / 180;
            const speed = 0.35 + Math.random() * 1.8;
            this.particles.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, size: 1.4 + Math.random() * 3.8, life: 1, decay: 0.018 + Math.random() * 0.02, color: this.settings.decorationTheme === 'stamp' ? this.randomStampColor() : echo.color, stamp: this.settings.decorationTheme === 'stamp' });
        }
    }

    randomStampColor() {
        return ['#fff3a3', '#ff7ac8', '#7afcff', '#b9ff7a', '#ffffff'][Math.floor(Math.random() * 5)];
    }

    addRipple(point, time) {
        this.ripples.push({ x: point.x, y: point.y, radius: 4, life: 1, createdAt: time });
        if (this.ripples.length > 80) this.ripples.shift();
    }

    render(time) {
        const delta = time - this.lastFrameAt;
        this.lastFrameAt = time;
        this.fps = this.fps * 0.9 + (1000 / Math.max(delta, 1)) * 0.1;
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.drawBackgroundGlow(time);
        this.echoes.forEach((echo) => this.drawEcho(echo, time));
        this.strokes.forEach((stroke) => this.drawStroke(stroke, { dx: 0, dy: 0, scale: 1, alpha: stroke.alpha, color: stroke.color, blur: 0 }, time));
        this.drawParticles();
        this.drawRipples();
        document.getElementById('fpsStatus').textContent = `${Math.round(this.fps)} FPS`;
        const newest = this.echoes[this.echoes.length - 1];
        document.getElementById('branchStatus').textContent = newest ? `${newest.branchCount}方向` : '1方向';
        requestAnimationFrame((nextTime) => this.render(nextTime));
    }

    drawBackgroundGlow(time) {
        const gradient = this.ctx.createRadialGradient(this.width * 0.5, this.height * 0.48, 0, this.width * 0.5, this.height * 0.48, Math.max(this.width, this.height) * 0.7);
        gradient.addColorStop(0, `rgba(0, 200, 255, ${0.05 + Math.sin(time * 0.001) * 0.02})`);
        gradient.addColorStop(0.55, 'rgba(255, 79, 216, 0.035)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.width, this.height);
    }

    drawEcho(echo, time) {
        this.drawStroke(echo.source, echo, time);
        if (this.settings.decorationTheme === 'bloom') this.drawBloom(echo);
        if (this.settings.decorationTheme === 'spiralRibbon') this.drawSpiralRibbon(echo, time);
        if (this.settings.decorationTheme === 'tornado') this.drawTornadoRings(echo);
    }

    drawStroke(stroke, echo, time) {
        if (stroke.points.length < 1) return;
        this.ctx.save();
        this.ctx.translate(echo.dx, echo.dy);
        const center = stroke.points[Math.floor(stroke.points.length / 2)] || { x: this.width / 2, y: this.height / 2 };
        this.ctx.translate(center.x, center.y);
        this.ctx.scale(echo.scale, echo.scale);
        this.ctx.translate(-center.x, -center.y);
        this.ctx.globalAlpha = Math.min(1, echo.alpha);
        this.ctx.strokeStyle = echo.color;
        this.ctx.lineWidth = Math.max(0.5, stroke.width * echo.scale);
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.shadowColor = echo.color;
        this.ctx.shadowBlur = Math.min(26, echo.blur + 7);
        this.ctx.beginPath();
        this.ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
        if (stroke.points.length === 1) {
            this.ctx.arc(stroke.points[0].x, stroke.points[0].y, Math.max(1, stroke.width * 0.5), 0, Math.PI * 2);
            this.ctx.fillStyle = echo.color;
            this.ctx.fill();
        }
        for (let index = 1; index < stroke.points.length; index += 1) {
            const point = stroke.points[index];
            this.ctx.lineTo(point.x, point.y);
        }
        this.ctx.stroke();
        this.ctx.restore();
    }

    drawBloom(echo) {
        const points = echo.source.points;
        if (!points.length) return;
        const point = points[Math.floor(points.length * 0.65)];
        const radius = this.settings.radialBloomRadius + echo.echoIndex * 1.4;
        this.ctx.save();
        this.ctx.globalAlpha = this.settings.radialBloomStrength * echo.alpha;
        this.ctx.strokeStyle = echo.color;
        this.ctx.lineWidth = 1.2;
        this.ctx.beginPath();
        this.ctx.ellipse(point.x + echo.dx, point.y + echo.dy, radius * 1.4, radius, echo.angleDeg, 0, Math.PI * 2);
        this.ctx.stroke();
        this.ctx.restore();
    }

    drawSpiralRibbon(echo, time) {
        const points = echo.source.points;
        if (points.length < 2) return;
        this.ctx.save();
        this.ctx.globalAlpha = echo.alpha * 0.55;
        this.ctx.strokeStyle = echo.color;
        this.ctx.lineWidth = 1.2;
        this.ctx.beginPath();
        points.forEach((point, index) => {
            const wave = Math.sin(index * this.settings.spiralTightness + time * 0.006 + echo.echoIndex * 0.3) * this.settings.spiralRadius;
            const x = point.x + echo.dx + Math.cos((echo.angleDeg + 90) * Math.PI / 180) * wave;
            const y = point.y + echo.dy + Math.sin((echo.angleDeg + 90) * Math.PI / 180) * wave;
            if (index === 0) this.ctx.moveTo(x, y); else this.ctx.lineTo(x, y);
        });
        this.ctx.stroke();
        this.ctx.restore();
    }

    drawTornadoRings(echo) {
        if (echo.echoIndex % 3 !== 0) return;
        const points = echo.source.points;
        const point = points[points.length - 1];
        this.ctx.save();
        this.ctx.globalAlpha = echo.alpha * 0.45;
        this.ctx.strokeStyle = echo.color;
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.ellipse(point.x + echo.dx, point.y + echo.dy, 12 + echo.echoIndex * 0.6, 5 + echo.echoIndex * 0.22, echo.angleDeg, 0, Math.PI * 2);
        this.ctx.stroke();
        this.ctx.restore();
    }

    drawParticles() {
        this.particles = this.particles.filter((particle) => particle.life > 0);
        this.particles.forEach((particle) => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vy += 0.01;
            particle.life -= particle.decay;
            this.ctx.save();
            this.ctx.globalAlpha = Math.max(0, particle.life);
            this.ctx.fillStyle = particle.color;
            this.ctx.shadowColor = particle.color;
            this.ctx.shadowBlur = 12;
            this.ctx.beginPath();
            if (particle.stamp) this.drawStar(particle.x, particle.y, particle.size * 1.8); else this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        });
    }

    drawStar(x, y, radius) {
        for (let index = 0; index < 10; index += 1) {
            const angle = -Math.PI / 2 + index * Math.PI / 5;
            const r = index % 2 === 0 ? radius : radius * 0.45;
            const px = x + Math.cos(angle) * r;
            const py = y + Math.sin(angle) * r;
            if (index === 0) this.ctx.moveTo(px, py); else this.ctx.lineTo(px, py);
        }
        this.ctx.closePath();
    }

    drawRipples() {
        this.ripples = this.ripples.filter((ripple) => ripple.life > 0);
        this.ripples.forEach((ripple) => {
            ripple.radius += this.settings.rippleRadiusGrowth;
            ripple.life *= this.settings.rippleAlphaDecay;
            this.ctx.save();
            this.ctx.globalAlpha = ripple.life * 0.55;
            this.ctx.strokeStyle = this.settings.gradientEndColor;
            this.ctx.lineWidth = 1.4;
            this.ctx.beginPath();
            this.ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
            this.ctx.stroke();
            this.ctx.restore();
        });
    }

    clear() {
        this.strokes = [];
        this.echoes = [];
        this.particles = [];
        this.ripples = [];
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

window.addEventListener('DOMContentLoaded', () => new SpreadingEchoApp());
