// デジタルアート統合ミニアプリ - 三角形+正方形+手描き（Freehand）統合版

class Triangle {
    constructor(id, centerI, centerJ, orientation, sizeN, clockwise) {
        this.id = id;
        this.centerI = centerI;
        this.centerJ = centerJ;
        this.orientation = orientation; // 0,1,2
        this.sizeN = sizeN; // 1-128
        this.clockwise = clockwise;
        this.stroke = '#00F0FF';
        this.lineWidth = 2.0;
        this.zIndex = Date.now();
        this.type = 'triangle';
    }
    getVertices(grid) {
        const center = grid.gridToPixel(this.centerI, this.centerJ);
        const radius = this.sizeN * grid.size * 0.8;
        const vertices = [];
        for (let i = 0; i < 3; i++) {
            let angle = (this.orientation * Math.PI / 3) + (i * 2 * Math.PI / 3);
            if (!this.clockwise) angle = -angle;
            vertices.push({ x: center.x + radius * Math.cos(angle), y: center.y + radius * Math.sin(angle) });
        }
        return vertices;
    }
    containsPoint(x, y, grid) {
        const [v0, v1, v2] = this.getVertices(grid);
        const denom = (v1.y - v2.y) * (v0.x - v2.x) + (v2.x - v1.x) * (v0.y - v2.y);
        if (Math.abs(denom) < 1e-10) return false;
        const a = ((v1.y - v2.y) * (x - v2.x) + (v2.x - v1.x) * (y - v2.y)) / denom;
        const b = ((v2.y - v0.y) * (x - v2.x) + (v0.x - v2.x) * (y - v2.y)) / denom;
        const c = 1 - a - b;
        return a >= 0 && b >= 0 && c >= 0;
    }
    getCenterHandle(grid) {
        const c = grid.gridToPixel(this.centerI, this.centerJ);
        return { x: c.x, y: c.y, radius: 12 };
    }
}

class Square {
    constructor(id, centerI, centerJ, orientation, sizeN, clockwise) {
        this.id = id;
        this.centerI = centerI;
        this.centerJ = centerJ;
        this.orientation = orientation; // 0..3
        this.sizeN = sizeN;
        this.clockwise = clockwise;
        this.stroke = '#FF8000';
        this.lineWidth = 2.0;
        this.zIndex = Date.now();
        this.type = 'square';
    }
    getVertices(grid) {
        const center = grid.gridToPixel(this.centerI, this.centerJ);
        const halfSize = this.sizeN * grid.size * 0.7;
        const diagonalRadius = halfSize * Math.sqrt(2);
        const vertices = [];
        for (let i = 0; i < 4; i++) {
            let angle = (this.orientation * Math.PI / 4) + (i * Math.PI / 2);
            if (!this.clockwise) angle = -angle;
            vertices.push({
                x: center.x + diagonalRadius * Math.cos(angle + Math.PI / 4),
                y: center.y + diagonalRadius * Math.sin(angle + Math.PI / 4)
            });
        }
        return vertices;
    }
    containsPoint(x, y, grid) {
        const vertices = this.getVertices(grid);
        let inside = false;
        for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
            if (((vertices[i].y > y) !== (vertices[j].y > y)) &&
                (x < (vertices[j].x - vertices[i].x) * (y - vertices[i].y) / (vertices[j].y - vertices[i].y) + vertices[i].x)) {
                inside = !inside;
            }
        }
        return inside;
    }
    getCenterHandle(grid) {
        const c = grid.gridToPixel(this.centerI, this.centerJ);
        return { x: c.x, y: c.y, radius: 12 };
    }
}

/** 頂点ハンドル */
class VertexHandle {
    constructor(shapeId, vertexIndex) {
        this.shapeId = shapeId;
        this.vertexIndex = vertexIndex;
        this.radius = 8;
        this.visualRadius = 4;
    }
    getPosition(shape, grid) {
        const vertices = shape.getVertices(grid);
        return vertices[this.vertexIndex];
    }
    draw(ctx, shape, grid, isSelected) {
        const pos = this.getPosition(shape, grid);
        const color = isSelected ? '#FF4081' : '#FFFFFF';
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, this.visualRadius, 0, 2 * Math.PI);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.stroke();
    }
    containsPoint(x, y, shape, grid) {
        const pos = this.getPosition(shape, grid);
        const dx = x - pos.x, dy = y - pos.y;
        return Math.hypot(dx, dy) <= this.radius;
    }
}

/** ✍️ 手描きストローク（最適化入り） */
class FreehandStroke {
    constructor(color = '#FFFFFF', lineWidth = 6) {
        this.color = color;
        this.lineWidth = lineWidth;
        this.points = [];      // [{x,y}, ...] 入力中は可変
        this._xs = null;       // finalize 後: Float32Array
        this._ys = null;       // finalize 後: Float32Array
        this.cumLen = null;    // Float32Array 累積長
        this.total = 0;
        this.closed = false;
    }

    addPoint(x, y, minDist = 2) {
        const n = this.points.length;
        if (n === 0) {
            this.points.push({ x, y });
            return true;
        }
        const last = this.points[n - 1];
        if (Math.hypot(x - last.x, y - last.y) >= minDist) {
            this.points.push({ x, y });
            return true;
        }
        return false;
    }

    finalize() {
        const pts = this.points;
        if (!pts || pts.length < 2) return;

        // 型付き配列へ詰め替え
        const n = pts.length;
        this._xs = new Float32Array(n);
        this._ys = new Float32Array(n);
        for (let i = 0; i < n; i++) {
            this._xs[i] = pts[i].x;
            this._ys[i] = pts[i].y;
        }
        // 累積長キャッシュ
        this.cumLen = new Float32Array(n);
        this.cumLen[0] = 0;
        let acc = 0;
        for (let i = 1; i < n; i++) {
            const dx = this._xs[i] - this._xs[i - 1];
            const dy = this._ys[i] - this._ys[i - 1];
            acc += Math.hypot(dx, dy);
            this.cumLen[i] = acc;
        }
        this.total = acc;
        // メモリ節約（元 points は破棄）
        this.points = null;
    }

    /** progress(0..1) に応じて部分描画 */
    draw(ctx, progress) {
        if (progress <= 0) return;
        const xs = this._xs || (this.points && this.points.map(p => p.x));
        const ys = this._ys || (this.points && this.points.map(p => p.y));
        const n = xs ? xs.length : 0;
        if (n < 2) return;

        const total = this.total || this._computeTotalOnTheFly(xs, ys);
        const target = Math.max(0, Math.min(1, progress)) * total;

        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.lineWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.beginPath();
        ctx.moveTo(xs[0], ys[0]);

        // finalize 済みなら二分探索、未 finalize なら逐次で十分
        if (this.cumLen) {
            // 完全に含まれる点まで一気に
            let lo = 1, hi = n - 1, idx = hi;
            while (lo <= hi) {
                const mid = (lo + hi) >> 1;
                if (this.cumLen[mid] >= target) { idx = mid; hi = mid - 1; }
                else lo = mid + 1;
            }
            for (let i = 1; i < idx; i++) ctx.lineTo(xs[i], ys[i]);

            // 端の部分区間を補間
            const prevIdx = Math.max(1, idx) - 1;
            const dx = xs[idx] - xs[prevIdx];
            const dy = ys[idx] - ys[prevIdx];
            const segLen = Math.hypot(dx, dy) || 1e-6;
            const remain = target - this.cumLen[prevIdx];
            const r = Math.max(0, Math.min(1, remain / segLen));
            ctx.lineTo(xs[prevIdx] + dx * r, ys[prevIdx] + dy * r);
        } else {
            // 未 finalize（編集中）: 逐次
            let acc = 0;
            for (let i = 1; i < n; i++) {
                const dx = xs[i] - xs[i - 1], dy = ys[i] - ys[i - 1];
                const seg = Math.hypot(dx, dy);
                if (acc + seg < target) {
                    ctx.lineTo(xs[i], ys[i]);
                    acc += seg;
                } else {
                    const r = (target - acc) / (seg || 1e-6);
                    ctx.lineTo(xs[i - 1] + dx * r, ys[i - 1] + dy * r);
                    break;
                }
            }
        }
        ctx.stroke();
    }

    _computeTotalOnTheFly(xs, ys) {
        let acc = 0;
        for (let i = 1; i < xs.length; i++) {
            acc += Math.hypot(xs[i] - xs[i - 1], ys[i] - ys[i - 1]);
        }
        return acc;
    }
}

class AnimationManager {
    constructor() {
        this.isPlaying = false;
        this.progress = 1.0;   // 編集時は完全表示
        this.startTime = 0;
        this.animationId = null;

        this.delayDuration = 500;
        this.drawDuration = 3000;
        this.totalDuration = 3500;

        this.currentPhase = 'editing'; // 'editing','hiding','dark','drawing','complete'

        this.onProgressChange = null;
        this.onPhaseChange = null;
    }
    start() {
        if (this.isPlaying) return;
        this.isPlaying = true;
        this.startTime = performance.now();
        this.progress = 0.0;
        this.currentPhase = 'hiding';
        this._trigger();
        this.animate();
    }
    animate = (t = performance.now()) => {
        if (!this.isPlaying) return;
        const elapsed = t - this.startTime;
        if (elapsed < this.delayDuration) {
            this.progress = 0.0;
            this.currentPhase = 'dark';
        } else if (elapsed < this.totalDuration) {
            const drawElapsed = elapsed - this.delayDuration;
            const raw = drawElapsed / this.drawDuration;
            this.progress = this._easeInOutCubic(Math.min(1, Math.max(0, raw)));
            this.currentPhase = 'drawing';
        } else {
            this.progress = 1.0;
            this.currentPhase = 'complete';
            this.stop();
            return;
        }
        this._trigger();
        this.animationId = requestAnimationFrame(this.animate);
    };
    stop() {
        this.isPlaying = false;
        if (this.animationId) cancelAnimationFrame(this.animationId);
        this.animationId = null;
        this.progress = 1.0;
        this.currentPhase = 'editing';
        this._trigger();
    }
    reset() {
        this.stop();
        this.progress = 1.0;
        this.currentPhase = 'editing';
        this._trigger();
    }
    getElapsedTime() {
        if (!this.isPlaying) return 0;
        return Math.min(performance.now() - this.startTime, this.totalDuration);
    }
    _easeInOutCubic(t) { return t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2,3)/2; }
    _trigger() {
        this.onProgressChange && this.onProgressChange(this.progress);
        this.onPhaseChange && this.onPhaseChange(this.currentPhase, this.progress);
    }
}

class Grid {
    constructor(size = 16) {
        this.size = size;
        this.width = 0; this.height = 0;
        this.originX = 0; this.originY = 0;
    }
    updateDimensions(w, h) {
        this.width = w; this.height = h;
        this.originX = w / 2; this.originY = h / 2;
    }
    gridToPixel(i, j) {
        return { x: this.originX + i * this.size, y: this.originY + j * this.size };
    }
    pixelToGrid(x, y) {
        return { i: Math.round((x - this.originX) / this.size), j: Math.round((y - this.originY) / this.size) };
    }
}

class VisualEffects {
    constructor() { this.time = 0; }
    getColor(shape, mode, settings, grid) {
        const center = grid.gridToPixel(shape.centerI, shape.centerJ);
        switch (mode) {
            case 'static': return shape.stroke;
            case 'hueCycle': {
                const hue = (this.time * (settings.speed || 0.1) * 100 + (settings.hueOffset || 0)) % 360;
                return `hsl(${hue}, ${settings.saturation || 100}%, ${settings.lightness || 60}%)`;
            }
            case 'radialMap': {
                const angle = Math.atan2(center.y - window.innerHeight/2, center.x - window.innerWidth/2);
                const hue = ((angle + Math.PI) / (2 * Math.PI) * 360 + (settings.hueOffset || 0)) % 360;
                return `hsl(${hue}, ${settings.saturation || 90}%, ${settings.lightness || 65}%)`;
            }
            case 'ringBands': {
                const cx = window.innerWidth / 2, cy = window.innerHeight / 2;
                const dist = Math.hypot(center.x - cx, center.y - cy);
                const wave = Math.sin(dist * 0.01 + this.time * (settings.speed || 0.1) * 10);
                const light = 30 + wave * 50;
                return `hsl(${(settings.baseHue || 200) + (settings.hueOffset || 0)}, ${settings.saturation || 80}%, ${Math.max(0, Math.min(100, light))}%)`;
            }
            case 'noiseFlow': {
                const nx = Math.sin(center.x * 0.01 + this.time * 0.02) * Math.cos(center.y * 0.01);
                const ny = Math.cos(center.x * 0.01) * Math.sin(center.y * 0.01 + this.time * 0.02);
                const hue = ((nx + ny + 2) / 4 * 360 + (settings.hueOffset || 0)) % 360;
                return `hsl(${hue}, ${settings.saturation || 85}%, ${settings.lightness || 55}%)`;
            }
            case 'gridIndex':
                return (shape.centerI + shape.centerJ) % 2 === 0 ? (settings.evenColor || '#00FF41') : (settings.oddColor || '#008F11');
            default: return shape.stroke;
        }
    }
    update(dt) { this.time += dt * 0.001; }
}

class BackgroundEffects {
    constructor() { this.stars = []; this.time = 0; this.noiseData = null; }
    initStars(count = 200) {
        this.stars = [];
        for (let i = 0; i < count; i++) {
            this.stars.push({ x: Math.random()*window.innerWidth, y: Math.random()*window.innerHeight, brightness: Math.random(), twinkleSpeed: 0.5 + Math.random()*2 });
        }
    }
    drawBackground(ctx, mode, settings) {
        const width = ctx.canvas.clientWidth, height = ctx.canvas.clientHeight;
        switch (mode) {
            case 'solid':
                ctx.fillStyle = settings.backgroundColor || '#000000';
                ctx.fillRect(0,0,width,height);
                break;
            case 'gradientPulse': {
                const cx = width/2, cy = height/2;
                const radius = Math.max(width, height) * (0.5 + Math.sin(this.time * 0.002)*0.3);
                const g = ctx.createRadialGradient(cx,cy,0,cx,cy,radius);
                g.addColorStop(0, `rgba(31,184,205,${0.1 + Math.sin(this.time*0.003)*0.05})`);
                g.addColorStop(0.5, `rgba(19,52,59,${0.05 + Math.sin(this.time*0.002)*0.03})`);
                g.addColorStop(1, '#000');
                ctx.fillStyle = g; ctx.fillRect(0,0,width,height);
                break;
            }
            case 'stars':
                ctx.fillStyle = '#000'; ctx.fillRect(0,0,width,height);
                if (this.stars.length === 0) this.initStars(settings.starCount || 200);
                ctx.fillStyle = '#FFF';
                this.stars.forEach(s => {
                    const tw = Math.sin(this.time * s.twinkleSpeed * 0.001) * 0.5 + 0.5;
                    ctx.globalAlpha = s.brightness * tw * 0.8;
                    ctx.fillRect(s.x, s.y, 1, 1);
                });
                ctx.globalAlpha = 1; break;
            case 'darkNoise': {
                if (!this.noiseData || this.noiseData.width !== width) this.noiseData = ctx.createImageData(width, height);
                const data = this.noiseData.data;
                for (let i = 0; i < data.length; i += 4) {
                    const n = Math.sin(i*0.001 + this.time*0.0005) * 0.5 + 0.5;
                    const v = Math.floor(n * 30);
                    data[i] = v; data[i+1] = v*1.2; data[i+2] = v*0.8; data[i+3] = 255;
                }
                ctx.putImageData(this.noiseData, 0, 0);
                break;
            }
        }
    }
    update(dt) { this.time += dt; }
}

class DigitalArtApp {
    constructor() {
        this.canvas = document.getElementById('mainCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.grid = new Grid(16);
        this.visualEffects = new VisualEffects();
        this.backgroundEffects = new BackgroundEffects();
        this.vertexHandles = [];
        this.animationManager = new AnimationManager();

        this.appContainer = document.querySelector('.app-container');
        this.presentationOverlay = document.getElementById('presentationOverlay');
        this.presentationHidden = false;
        this.history = [];

        this.addShapeCounter = 0;

        // 状態
        this.state = {
            shapes: new Map(),
            selectedShapeId: null,
            nextTriangleId: 1,
            nextSquareId: 1,
            showHandles: true,
            showGridOverlay: false,
            visual: { preset: 'neon-basic', colorMode: 'static', backgroundMode: 'solid', effectIntensity: 100, hueOffset: 0 },
            animation: { speed: 1.0 },
            // ✍️ 手描き
            freehand: {
                enabled: false,
                lineWidth: 6,
                color: '#FFFFFF',
                sampleDistance: 2,
                strokes: [],      // FreehandStroke[]
                current: null,    // 入力中ストローク
                maxPointsAll: 100000 // 安全上限（必要なら調整）
            }
        };

        // テーマ・パターン（元のまま）
        this.samplePatterns = this._buildSamplePatterns();
        this.themes = this._buildThemes();

        // ドラッグ状態
        this.dragState = { isDragging: false, type: null, shapeId: null, startX: 0, startY: 0, lastX: 0, lastY: 0 };

        // FPS
        this.fps = 0; this.frameCount = 0; this.lastFrameTime = 0;

        this.setupCanvas();
        this.setupEventListeners();
        this.setupUI();
        this.setupAnimationManager();
        this.initializeDefaultShapes();
        this.startAnimationLoop();
        this.updateUndoButtonState();
    }

    // ---- 初期化 ----
    initializeDefaultShapes() {
        const tri = new Triangle(`triangle-${this.state.nextTriangleId++}`, -3, -3, 0, 3, true);
        tri.zIndex = Date.now();
        this.state.shapes.set(tri.id, tri);

        setTimeout(() => {
            const sq = new Square(`square-${this.state.nextSquareId++}`, 3, 3, 0, 3, true);
            sq.zIndex = Date.now() + 1;
            this.state.shapes.set(sq.id, sq);
            this.updateCountsAndHandles();
        }, 10);

        this.updateCountsAndHandles();
    }

    setupAnimationManager() {
        this.animationManager.onProgressChange = (p) => {
            const bar = document.getElementById('progressBar');
            if (bar) bar.style.width = `${p * 100}%`;
        };
        this.animationManager.onPhaseChange = (phase) => {
            const phaseEl = document.getElementById('animationPhase');
            const timeEl = document.getElementById('timeDisplay');
            const status = document.querySelector('.animation-status');
            const bar = document.getElementById('progressBar');
            const mainBtn = document.getElementById('mainPlayButton');
            switch (phase) {
                case 'editing': phaseEl.textContent = '編集モード'; status.className = 'animation-status'; bar.classList.remove('pulsing'); mainBtn.classList.remove('playing'); break;
                case 'hiding': phaseEl.textContent = '非表示中...'; status.className = 'animation-status playing'; bar.classList.add('pulsing'); mainBtn.classList.add('playing'); break;
                case 'dark': phaseEl.textContent = '暗転中...'; status.className = 'animation-status dark-phase'; bar.classList.add('pulsing'); mainBtn.classList.add('playing'); break;
                case 'drawing': phaseEl.textContent = '描画中...'; status.className = 'animation-status drawing'; bar.classList.remove('pulsing'); mainBtn.classList.add('playing'); break;
                case 'complete': phaseEl.textContent = '完了'; status.className = 'animation-status'; bar.classList.remove('pulsing'); mainBtn.classList.remove('playing'); break;
            }
            if (this.animationManager.isPlaying) {
                const sec = (this.animationManager.getElapsedTime() / 1000).toFixed(1);
                timeEl.textContent = `時間: ${sec} / 3.5s`;
            } else {
                timeEl.textContent = '時間: 0.0 / 3.5s';
            }
        };
    }

    setupCanvas() {
        const applyDimensions = () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            this.canvas.style.width = window.innerWidth + 'px';
            this.canvas.style.height = window.innerHeight + 'px';
            this.grid.updateDimensions(this.canvas.width, this.canvas.height);
        };
        applyDimensions();
        this.ctx.imageSmoothingEnabled = true;
        if (!this._handleResize) {
            this._handleResize = () => applyDimensions();
            window.addEventListener('resize', this._handleResize);
        }
    }

    setupEventListeners() {
        // Canvas pointer
        this.canvas.addEventListener('pointerdown', this.onPointerDown.bind(this));
        this.canvas.addEventListener('pointermove', this.onPointerMove.bind(this));
        this.canvas.addEventListener('pointerup', this.onPointerUp.bind(this));
        this.canvas.addEventListener('pointercancel', this.onPointerUp.bind(this));

        // メニュー
        document.getElementById('menuToggle').addEventListener('click', this.toggleMenu.bind(this));
        document.getElementById('menuOverlay').addEventListener('click', this.closeMenu.bind(this));

        // メイン再生
        document.getElementById('mainPlayButton').addEventListener('click', () => {
            this.animationManager.isPlaying ? this.animationManager.stop() : this.animationManager.start();
        });

        document.getElementById('undoAction').addEventListener('click', () => this.undoLastAction());
        document.getElementById('toggleVisibility').addEventListener('click', () => this.togglePresentationMode());
        if (this.presentationOverlay) {
            this.presentationOverlay.addEventListener('click', () => this.deactivatePresentationHide(true));
            this.presentationOverlay.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
                    e.preventDefault();
                    this.deactivatePresentationHide(true);
                }
            });
        }

        // 右下UI
        document.getElementById('addTriangle').addEventListener('click', () => this.addShape('triangle'));
        document.getElementById('addSquare').addEventListener('click', () => this.addShape('square'));
        document.getElementById('toggleDraw').addEventListener('click', () => this.toggleDrawMode());

        // メニュー内の図形
        document.getElementById('addTriangleMenu').addEventListener('click', () => this.addShape('triangle'));
        document.getElementById('addSquareMenu').addEventListener('click', () => this.addShape('square'));

        // パターン
        document.getElementById('applyPattern').addEventListener('click', () => {
            const name = document.getElementById('samplePattern').value;
            if (name) this.applyPattern(name);
        });

        // ✍️ お絵かき（メニュー）
        document.getElementById('toggleDrawMenu').addEventListener('click', () => this.toggleDrawMode());
        document.getElementById('clearStrokes').addEventListener('click', () => this.clearStrokes());

        // UI コントロール
        this.setupUIControls();
    }

    setupUI() {
        document.getElementById('presetSelect').value = this.state.visual.preset;
        document.getElementById('colorMode').value = this.state.visual.colorMode;
        document.getElementById('backgroundMode').value = this.state.visual.backgroundMode;
        document.getElementById('effectIntensity').value = this.state.visual.effectIntensity;
        document.getElementById('hueOffset').value = this.state.visual.hueOffset;
        document.getElementById('animationSpeed').value = this.state.animation.speed;
        document.getElementById('showHandles').checked = this.state.showHandles;
        document.getElementById('showGridOverlay').checked = this.state.showGridOverlay;

        // ✍️ 手描き初期値
        document.getElementById('strokeWidth').value = this.state.freehand.lineWidth;
        document.getElementById('strokeWidthValue').textContent = this.state.freehand.lineWidth;
        document.getElementById('strokeColor').value = this.state.freehand.color;
        document.getElementById('sampleDistance').value = this.state.freehand.sampleDistance;
        document.getElementById('sampleDistanceValue').textContent = this.state.freehand.sampleDistance;
    }

    setupUIControls() {
        // プリセット
        document.getElementById('presetSelect').addEventListener('change', (e) => this.applyPreset(e.target.value));
        // 色/背景
        document.getElementById('colorMode').addEventListener('change', (e) => this.state.visual.colorMode = e.target.value);
        document.getElementById('backgroundMode').addEventListener('change', (e) => this.state.visual.backgroundMode = e.target.value);

        // スライダー
        const setupSlider = (id, valueId, cb, format = (v)=>v) => {
            const el = document.getElementById(id);
            const label = document.getElementById(valueId);
            el.addEventListener('input', (e) => {
                const v = parseFloat(e.target.value);
                label.textContent = format(v);
                cb(v);
            });
        };
        setupSlider('effectIntensity','intensityValue', (v)=> this.state.visual.effectIntensity = v, (v)=>Math.round(v));
        setupSlider('hueOffset','hueValue', (v)=> this.state.visual.hueOffset = v, (v)=>Math.round(v));
        setupSlider('animationSpeed','speedValue', (v)=> this.state.animation.speed = v, (v)=>v.toFixed(1));

        // ✍️ 手描き設定
        setupSlider('strokeWidth','strokeWidthValue', (v)=> this.state.freehand.lineWidth = v, (v)=>Math.round(v));
        document.getElementById('strokeColor').addEventListener('input', (e)=> this.state.freehand.color = e.target.value);
        setupSlider('sampleDistance','sampleDistanceValue', (v)=> this.state.freehand.sampleDistance = v, (v)=>v);

        // 表示系
        document.getElementById('showHandles').addEventListener('change', (e)=>{ this.state.showHandles = e.target.checked; this.updateVertexHandles(); });
        document.getElementById('showGridOverlay').addEventListener('change', (e)=> this.state.showGridOverlay = e.target.checked);

        // アニメーション
        document.getElementById('playAnimation').addEventListener('click', ()=> this.animationManager.start());
        document.getElementById('stopAnimation').addEventListener('click', ()=> this.animationManager.stop());
        document.getElementById('resetAnimation').addEventListener('click', ()=> this.animationManager.reset());

        // アクション
        const del = document.getElementById('deleteSelected');
        del.addEventListener('click', ()=> { if (!del.disabled) this.deleteSelectedShape(); });
        document.getElementById('exportPNG').addEventListener('click', this.exportPNG.bind(this));
        document.getElementById('clearAll').addEventListener('click', this.clearAll.bind(this));

        this.updateDeleteButtonState();
    }

    // ---- UI 操作 ----
    toggleMenu() {
        const menu = document.getElementById('proMenu');
        const overlay = document.getElementById('menuOverlay');
        if (menu.classList.contains('hidden')) { menu.classList.remove('hidden'); overlay.classList.remove('hidden'); }
        else this.closeMenu();
    }
    closeMenu() {
        document.getElementById('proMenu').classList.add('hidden');
        document.getElementById('menuOverlay').classList.add('hidden');
    }

    toggleDrawMode() {
        this.state.freehand.enabled = !this.state.freehand.enabled;
        const btn = document.getElementById('toggleDraw');
        if (this.state.freehand.enabled) {
            btn.classList.remove('btn--secondary');
            btn.classList.add('btn--primary');
            btn.title = '手描きモード: ON';
        } else {
            btn.classList.remove('btn--primary');
            btn.classList.add('btn--secondary');
            btn.title = '手描きモード: OFF';
        }
    }

    togglePresentationMode() {
        if (this.presentationHidden) this.deactivatePresentationHide(true);
        else this.activatePresentationHide();
    }

    activatePresentationHide() {
        if (this.presentationHidden) return;
        this.presentationHidden = true;
        this.animationManager.reset();
        this.closeMenu();
        if (this.appContainer) this.appContainer.classList.add('presentation-hidden');
        if (this.presentationOverlay) {
            this.presentationOverlay.classList.remove('hidden');
            this.presentationOverlay.setAttribute('aria-hidden', 'false');
            this.presentationOverlay.setAttribute('tabindex', '0');
            setTimeout(() => {
                if (this.presentationOverlay) {
                    this.presentationOverlay.focus({ preventScroll: true });
                }
            }, 0);
        }
    }

    deactivatePresentationHide(autoPlay = false) {
        if (!this.presentationHidden) return;
        this.presentationHidden = false;
        if (this.appContainer) this.appContainer.classList.remove('presentation-hidden');
        if (this.presentationOverlay) {
            this.presentationOverlay.classList.add('hidden');
            this.presentationOverlay.setAttribute('aria-hidden', 'true');
            this.presentationOverlay.setAttribute('tabindex', '-1');
        }
        if (autoPlay) this.animationManager.start();
    }

    // ---- 図形/パターン ----
    addShape(type, clockwise = true) {
        if (this.state.shapes.size >= 100) return;
        this.addShapeCounter++;
        const angle = this.addShapeCounter * 0.8;
        const distance = Math.min(this.addShapeCounter * 1.5, 8);
        const centerI = Math.round(Math.cos(angle) * distance);
        const centerJ = Math.round(Math.sin(angle) * distance);

        let createdId = null;
        if (type === 'triangle') {
            const t = new Triangle(`triangle-${this.state.nextTriangleId++}`, centerI, centerJ, 0, 3, clockwise);
            t.zIndex = Date.now();
            this.state.shapes.set(t.id, t);
            this.state.selectedShapeId = t.id;
            createdId = t.id;
        } else {
            const s = new Square(`square-${this.state.nextSquareId++}`, centerI, centerJ, 0, 3, clockwise);
            s.zIndex = Date.now();
            this.state.shapes.set(s.id, s);
            this.state.selectedShapeId = s.id;
            createdId = s.id;
        }
        this.updateCountsAndHandles();
        if (createdId) this.recordAction({ type: 'shape-add', shapeId: createdId });
    }

    applyPattern(patternName) {
        const pattern = this.samplePatterns[patternName];
        if (!pattern) return;
        this.state.shapes.clear();
        this.state.selectedShapeId = null;
        this.addShapeCounter = 0;
        pattern.shapes.forEach((shapeData, idx) => {
            let shape;
            if (shapeData.type === 'triangle') {
                shape = new Triangle(`triangle-${this.state.nextTriangleId++}`, shapeData.centerI, shapeData.centerJ, shapeData.orientation, shapeData.sizeN, shapeData.clockwise);
            } else {
                shape = new Square(`square-${this.state.nextSquareId++}`, shapeData.centerI, shapeData.centerJ, shapeData.orientation, shapeData.sizeN, shapeData.clockwise);
            }
            shape.zIndex = Date.now() + idx;
            this.state.shapes.set(shape.id, shape);
        });
        this.updateCountsAndHandles();
    }

    applyPreset(name) {
        const theme = this.themes[name];
        if (!theme) return;
        this.state.visual.preset = name;
        this.state.visual.colorMode = theme.colorMode;
        this.state.visual.backgroundMode = theme.background;
        document.getElementById('colorMode').value = theme.colorMode;
        document.getElementById('backgroundMode').value = theme.background;
        if (theme.background === 'stars') this.backgroundEffects.initStars(theme.settings.starCount);
    }

    // ---- 入力（図形 or 手描き） ----
    onPointerDown(e) {
        e.preventDefault();
        const { x, y } = this._eventToXY(e);

        // 再生中は無効
        if (this.animationManager.isPlaying) return;

        // 手描きがONなら手描き優先
        if (this.state.freehand.enabled) {
            const s = new FreehandStroke(this.state.freehand.color, this.state.freehand.lineWidth);
            s.addPoint(x, y, 0); // 最初の点は無条件
            this.state.freehand.current = s;
            this.canvas.setPointerCapture(e.pointerId);
            return;
        }

        // 既存挙動（図形操作）
        const hit = this.performHitTest(x, y);
        if (hit) {
            this.dragState = { isDragging: true, type: hit.type, shapeId: hit.shapeId, vertexIndex: hit.vertexIndex || null, startX: x, startY: y, lastX: x, lastY: y };
            this.state.selectedShapeId = hit.shapeId;
            this.updateVertexHandles();
            this.canvas.style.cursor = 'grabbing';
        } else {
            this.state.selectedShapeId = null;
            this.updateVertexHandles();
        }
    }

    onPointerMove(e) {
        e.preventDefault();
        const { x, y } = this._eventToXY(e);

        // 再生中は無効
        if (this.animationManager.isPlaying) return;

        // 手描き中
        if (this.state.freehand.enabled && this.state.freehand.current) {
            const cur = this.state.freehand.current;
            cur.addPoint(x, y, this.state.freehand.sampleDistance);
            return;
        }

        // 図形ドラッグ中
        if (!this.dragState.isDragging) return;
        const shape = this.state.shapes.get(this.dragState.shapeId);
        if (!shape) return;

        if (this.dragState.type.startsWith('vertex-')) {
            this.resizeShapeByVertex(shape, this.dragState.vertexIndex, x, y);
        } else if (this.dragState.type === 'center' || this.dragState.type === 'body') {
            this.moveShape(shape, x, y);
        }

        this.dragState.lastX = x; this.dragState.lastY = y;
        this.updateVertexHandles();
    }

    onPointerUp(e) {
        // 手描き終端
        if (this.state.freehand.current) {
            const cur = this.state.freehand.current;
            cur.finalize();
            if (cur.total > 0) {
                this.state.freehand.strokes.push(cur);
                this._enforceStrokePointBudget(); // 安全上限
                this.recordAction({ type: 'stroke-add', stroke: cur });
            }
            this.state.freehand.current = null;
            this.updateCountsAndHandles();
        }

        // 図形ドラッグ終端
        this.dragState.isDragging = false;
        this.canvas.style.cursor = 'crosshair';
    }

    _enforceStrokePointBudget() {
        // ゆるい制限：全 Float32Array 長の合計がおおよそ上限を超えたら古いものを間引き
        const max = this.state.freehand.maxPointsAll;
        let totalPts = 0;
        for (const s of this.state.freehand.strokes) {
            totalPts += (s._xs ? s._xs.length : (s.points ? s.points.length : 0));
        }
        // 超過なら古いものから削除
        while (totalPts > max && this.state.freehand.strokes.length > 0) {
            const rm = this.state.freehand.strokes.shift();
            const len = rm._xs ? rm._xs.length : (rm.points ? rm.points.length : 0);
            totalPts -= len;
        }
    }

    // ---- 図形編集 ----
    performHitTest(x, y) {
        if (this.state.selectedShapeId && this.state.showHandles && this.animationManager.progress >= 1.0) {
            for (const h of this.vertexHandles) {
                const shape = this.state.shapes.get(h.shapeId);
                if (shape && h.containsPoint(x, y, shape, this.grid)) {
                    return { type: `vertex-${h.vertexIndex}`, shapeId: h.shapeId, vertexIndex: h.vertexIndex };
                }
            }
            const sel = this.state.shapes.get(this.state.selectedShapeId);
            if (sel) {
                const c = sel.getCenterHandle(this.grid);
                if (Math.hypot(x - c.x, y - c.y) <= c.radius) return { type: 'center', shapeId: sel.id };
            }
        }

        if (this.animationManager.progress >= 1.0) {
            const sorted = Array.from(this.state.shapes.values()).sort((a,b)=> b.zIndex - a.zIndex);
            for (const s of sorted) if (s.containsPoint(x, y, this.grid)) return { type: 'body', shapeId: s.id };
        }
        return null;
    }

    resizeShapeByVertex(shape, vertexIndex, newX, newY) {
        const center = this.grid.gridToPixel(shape.centerI, shape.centerJ);
        const dist = Math.hypot(newX - center.x, newY - center.y);
        const newSizeN = Math.max(1, Math.min(10, Math.round(dist / (this.grid.size * 0.8))));
        const angle = Math.atan2(newY - center.y, newX - center.x);
        let newOrient;
        if (shape.type === 'triangle') {
            newOrient = Math.round((angle * 3) / (2 * Math.PI)) % 3;
            if (newOrient < 0) newOrient += 3;
        } else {
            newOrient = Math.round((angle * 4) / (2 * Math.PI)) % 4;
            if (newOrient < 0) newOrient += 4;
        }
        shape.sizeN = newSizeN;
        shape.orientation = newOrient;
        shape.zIndex = Date.now();
    }

    moveShape(shape, x, y) {
        const g = this.grid.pixelToGrid(x, y);
        shape.centerI = g.i; shape.centerJ = g.j;
        shape.zIndex = Date.now();
    }

    // ---- 共通 UI 更新 ----
    updateVertexHandles() {
        this.vertexHandles = [];
        if (this.state.selectedShapeId && this.state.showHandles && this.animationManager.progress >= 1.0) {
            const s = this.state.shapes.get(this.state.selectedShapeId);
            if (s) {
                const count = s.type === 'triangle' ? 3 : 4;
                for (let i = 0; i < count; i++) this.vertexHandles.push(new VertexHandle(this.state.selectedShapeId, i));
            }
        }
        this.updateDeleteButtonState();
    }

    updateDeleteButtonState() {
        const btn = document.getElementById('deleteSelected');
        if (!btn) return;
        const ok = !!(this.state.selectedShapeId && this.state.shapes.has(this.state.selectedShapeId));
        btn.disabled = !ok;
        btn.setAttribute('aria-disabled', String(!ok));
        btn.title = ok ? '' : '図形が選択されていません';
    }

    updateUndoButtonState() {
        const btn = document.getElementById('undoAction');
        if (!btn) return;
        const hasHistory = this.history.length > 0;
        btn.disabled = !hasHistory;
        btn.setAttribute('aria-disabled', String(!hasHistory));
    }

    updateCountsAndHandles() {
        const t = Array.from(this.state.shapes.values()).filter(s => s.type === 'triangle').length;
        const s = Array.from(this.state.shapes.values()).filter(s => s.type === 'square').length;
        const strokes = this.state.freehand.strokes.length + (this.state.freehand.current ? 1 : 0);
        document.getElementById('triangleCount').textContent = t;
        document.getElementById('squareCount').textContent = s;
        document.getElementById('strokeCount').textContent = strokes;
        this.updateDeleteButtonState();
        this.updateVertexHandles();
        this.updateUndoButtonState();
    }

    recordAction(action) {
        if (!action) return;
        this.history.push(action);
        if (this.history.length > 100) this.history.shift();
        this.updateUndoButtonState();
    }

    undoLastAction() {
        const last = this.history.pop();
        if (!last) { this.updateUndoButtonState(); return; }

        switch (last.type) {
            case 'shape-add': {
                if (last.shapeId && this.state.shapes.has(last.shapeId)) {
                    this.state.shapes.delete(last.shapeId);
                    if (this.state.selectedShapeId === last.shapeId) {
                        this.state.selectedShapeId = null;
                    }
                    this.updateCountsAndHandles();
                }
                break;
            }
            case 'stroke-add': {
                if (last.stroke) {
                    const idx = this.state.freehand.strokes.lastIndexOf(last.stroke);
                    if (idx >= 0) {
                        this.state.freehand.strokes.splice(idx, 1);
                        this.updateCountsAndHandles();
                    }
                }
                break;
            }
            default:
                break;
        }

        this.updateUndoButtonState();
    }

    // ---- 書き出し/消去 ----
    exportPNG() {
        const link = document.createElement('a');
        link.download = `digital-art-${Date.now()}.png`;
        link.href = this.canvas.toDataURL('image/png');
        link.click();
    }

    clearAll() {
        if (confirm('すべての図形と手描きを削除しますか？')) {
            this.state.shapes.clear();
            this.state.selectedShapeId = null;
            this.state.freehand.strokes = [];
            this.state.freehand.current = null;
            this.addShapeCounter = 0;
            this.history = [];
            this.updateCountsAndHandles();
        }
    }

    clearStrokes() {
        if (confirm('すべての手描きストロークを削除しますか？')) {
            this.state.freehand.strokes = [];
            this.state.freehand.current = null;
            this.history = this.history.filter(action => action.type !== 'stroke-add');
            this.updateCountsAndHandles();
        }
    }

    deleteSelectedShape() {
        const id = this.state.selectedShapeId;
        if (!id || !this.state.shapes.has(id)) { this.updateDeleteButtonState(); return; }
        this.state.shapes.delete(id);
        this.state.selectedShapeId = null;
        this.updateCountsAndHandles();
    }

    // ---- ループ/描画 ----
    startAnimationLoop() {
        let last = 0;
        const tick = (t) => {
            const dt = t - last; last = t;
            if (!this.animationManager.isPlaying) {
                this.visualEffects.update(dt * this.state.animation.speed);
                this.backgroundEffects.update(dt * this.state.animation.speed);
            }
            this.render();
            this.updateFPS(t);
            requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    }

    updateFPS(t) {
        this.frameCount++;
        if (t - this.lastFrameTime >= 1000) {
            this.fps = Math.round(this.frameCount * 1000 / (t - this.lastFrameTime));
            document.getElementById('fpsDisplay').textContent = this.fps;
            this.frameCount = 0;
            this.lastFrameTime = t;
        }
    }

    drawGridOverlay() {
        const { width, height } = this.canvas;
        const ctx = this.ctx, spacing = this.grid.size;
        if (!spacing) return;

        ctx.save();
        ctx.lineWidth = 1;

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.setLineDash([6,6]);
        ctx.beginPath();
        ctx.moveTo(this.grid.originX, 0); ctx.lineTo(this.grid.originX, height);
        ctx.moveTo(0, this.grid.originY); ctx.lineTo(width, this.grid.originY);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.setLineDash([2,10]);
        for (let x = this.grid.originX + spacing; x < width; x += spacing) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,height); ctx.stroke(); }
        for (let x = this.grid.originX - spacing; x > 0; x -= spacing) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,height); ctx.stroke(); }
        for (let y = this.grid.originY + spacing; y < height; y += spacing) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(width,y); ctx.stroke(); }
        for (let y = this.grid.originY - spacing; y > 0; y -= spacing) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(width,y); ctx.stroke(); }

        ctx.restore();
    }

    calculatePerimeter(vertices) {
        let p = 0;
        for (let i = 0; i < vertices.length; i++) {
            const a = vertices[i], b = vertices[(i+1)%vertices.length];
            p += Math.hypot(b.x - a.x, b.y - a.y);
        }
        return p;
    }

    drawShape(shape, progress) {
        if (progress <= 0) return;
        const vertices = shape.getVertices(this.grid);
        const theme = this.themes[this.state.visual.preset];
        const color = this.visualEffects.getColor(shape, this.state.visual.colorMode, {
            ...theme?.settings,
            hueOffset: this.state.visual.hueOffset,
            speed: 0.1 * this.state.animation.speed,
            saturation: theme?.settings?.saturation || 100,
            lightness: theme?.settings?.lightness || 60,
            baseHue: theme?.settings?.baseHue || 200,
            evenColor: theme?.settings?.evenColor || '#00FF41',
            oddColor: theme?.settings?.oddColor || '#008F11'
        }, this.grid);

        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = shape.lineWidth * (this.state.visual.effectIntensity / 100);
        this.ctx.lineCap = 'round';

        if (progress >= 1.0) {
            this.ctx.beginPath();
            this.ctx.moveTo(vertices[0].x, vertices[0].y);
            for (let i = 1; i < vertices.length; i++) this.ctx.lineTo(vertices[i].x, vertices[i].y);
            this.ctx.closePath();
            this.ctx.stroke();
        } else {
            const perimeter = this.calculatePerimeter(vertices);
            const drawLength = perimeter * progress;
            this._drawPartialPolygon(vertices, drawLength, shape.clockwise);
        }

        if (shape.id === this.state.selectedShapeId && progress >= 1.0) {
            this.ctx.strokeStyle = '#FF4081';
            this.ctx.lineWidth = (shape.lineWidth + 1) * (this.state.visual.effectIntensity / 100);
            this.ctx.stroke();
        }
    }

    _drawPartialPolygon(vertices, drawLength, clockwise) {
        const verts = clockwise ? vertices.slice() : vertices.slice().reverse();
        let remain = drawLength;
        this.ctx.beginPath();
        this.ctx.moveTo(verts[0].x, verts[0].y);
        for (let i = 0; i < verts.length && remain > 0; i++) {
            const a = verts[i], b = verts[(i+1)%verts.length];
            const seg = Math.hypot(b.x - a.x, b.y - a.y);
            if (remain >= seg) { this.ctx.lineTo(b.x, b.y); remain -= seg; }
            else {
                const r = remain / (seg || 1e-6);
                this.ctx.lineTo(a.x + (b.x - a.x) * r, a.y + (b.y - a.y) * r);
                remain = 0;
            }
        }
        this.ctx.stroke();
    }

    render() {
        const w = this.canvas.width, h = this.canvas.height;
        this.ctx.clearRect(0,0,w,h);

        if (this.presentationHidden) {
            this.ctx.fillStyle = '#000000';
            this.ctx.fillRect(0, 0, w, h);
            return;
        }

        const theme = this.themes[this.state.visual.preset];
        this.backgroundEffects.drawBackground(this.ctx, this.state.visual.backgroundMode, theme?.settings || {});
        if (this.state.showGridOverlay) this.drawGridOverlay();

        const progress = this.animationManager.progress;

        // ✍️ 手描き → 図形 の順で描画（重ね順の分かりやすさ重視）
        // 手描き（完成分）
        for (const s of this.state.freehand.strokes) s.draw(this.ctx, progress);
        // 手描き（入力中）
        if (this.state.freehand.current) this.state.freehand.current.draw(this.ctx, 1.0);

        // 図形（zIndex順）
        const sorted = Array.from(this.state.shapes.values()).sort((a,b)=> a.zIndex - b.zIndex);
        for (const shape of sorted) this.drawShape(shape, progress);

        // ハンドル（編集 & 完全表示）
        if (this.state.selectedShapeId && this.state.showHandles && progress >= 1.0) {
            const s = this.state.shapes.get(this.state.selectedShapeId);
            if (s) {
                const c = s.getCenterHandle(this.grid);
                this.ctx.beginPath();
                this.ctx.arc(c.x, c.y, 6, 0, 2*Math.PI);
                this.ctx.fillStyle = '#FF4081';
                this.ctx.fill();
                this.ctx.strokeStyle = '#FFFFFF';
                this.ctx.lineWidth = 2;
                this.ctx.stroke();
                for (const h of this.vertexHandles) h.draw(this.ctx, s, this.grid, true);
            }
        }
    }

    // ---- ヘルパ ----
    _eventToXY(e) {
        const rect = this.canvas.getBoundingClientRect();
        return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }

    _buildThemes() {
        return {
            "neon-basic": {background: "solid", colorMode: "static", settings: {backgroundColor: "#000000"}},
            "neon-cyberpunk": {background: "gradientPulse", colorMode: "hueCycle", settings: {speed: 0.1, saturation: 100, lightness: 60}},
            "aurora-rings": {background: "stars", colorMode: "ringBands", settings: {baseHue: 200, saturation: 80, lightness: 50, starCount: 200}},
            "matrix-grid": {background: "darkNoise", colorMode: "gridIndex", settings: {evenColor: "#00FF41", oddColor: "#008F11"}},
            "radial-spectrum": {background: "solid", colorMode: "radialMap", settings: {saturation: 90, lightness: 65}},
            "noise-flow": {background: "gradientPulse", colorMode: "noiseFlow", settings: {saturation: 85, lightness: 55}}
        };
    }

    _buildSamplePatterns() {
        // （元の samplePatterns をそのまま移植）
        return {
            "grid-matrix": {
                "name": "格子マトリックス",
                "description": "整然とした格子状配置",
                "shapes": [
                    {"type": "triangle", "centerI": -4, "centerJ": -2, "orientation": 0, "sizeN": 2, "clockwise": true},
                    {"type": "triangle", "centerI": 0, "centerJ": -2, "orientation": 1, "sizeN": 2, "clockwise": true},
                    {"type": "triangle", "centerI": 4, "centerJ": -2, "orientation": 2, "sizeN": 2, "clockwise": true},
                    {"type": "square", "centerI": -2, "centerJ": 0, "orientation": 0, "sizeN": 2, "clockwise": true},
                    {"type": "square", "centerI": 2, "centerJ": 0, "orientation": 1, "sizeN": 2, "clockwise": true},
                    {"type": "square", "centerI": -4, "centerJ": 2, "orientation": 2, "sizeN": 2, "clockwise": true},
                    {"type": "square", "centerI": 0, "centerJ": 2, "orientation": 3, "sizeN": 2, "clockwise": true},
                    {"type": "square", "centerI": 4, "centerJ": 2, "orientation": 0, "sizeN": 2, "clockwise": true}
                ]
            },
            "flower-mandala": {
                "name": "フラワーマンダラ",
                "description": "中央の大きな図形を小さな図形が花のように取り囲む",
                "shapes": [
                    {"type": "square", "centerI": 0, "centerJ": 0, "orientation": 0, "sizeN": 4, "clockwise": true},
                    {"type": "triangle", "centerI": -3, "centerJ": -3, "orientation": 0, "sizeN": 1, "clockwise": true},
                    {"type": "triangle", "centerI": 0, "centerJ": -3, "orientation": 1, "sizeN": 1, "clockwise": true},
                    {"type": "triangle", "centerI": 3, "centerJ": -3, "orientation": 2, "sizeN": 1, "clockwise": true},
                    {"type": "triangle", "centerI": 3, "centerJ": 0, "orientation": 0, "sizeN": 1, "clockwise": true},
                    {"type": "triangle", "centerI": 3, "centerJ": 3, "orientation": 1, "sizeN": 1, "clockwise": true},
                    {"type": "triangle", "centerI": 0, "centerJ": 3, "orientation": 2, "sizeN": 1, "clockwise": true},
                    {"type": "triangle", "centerI": -3, "centerJ": 3, "orientation": 0, "sizeN": 1, "clockwise": true},
                    {"type": "triangle", "centerI": -3, "centerJ": 0, "orientation": 1, "sizeN": 1, "clockwise": true}
                ]
            },
            "layered-drift": {
                "name": "レイヤードドリフト",
                "description": "重なって配置され、少しずつ位置がズレたレイヤー効果",
                "shapes": [
                    {"type": "triangle", "centerI": -1, "centerJ": -1, "orientation": 0, "sizeN": 5, "clockwise": true},
                    {"type": "triangle", "centerI": 0, "centerJ": -1, "orientation": 0, "sizeN": 5, "clockwise": true},
                    {"type": "triangle", "centerI": 1, "centerJ": 0, "orientation": 0, "sizeN": 5, "clockwise": true},
                    {"type": "triangle", "centerI": 0, "centerJ": 1, "orientation": 0, "sizeN": 5, "clockwise": true},
                    {"type": "square", "centerI": 2, "centerJ": -2, "orientation": 0, "sizeN": 3, "clockwise": true},
                    {"type": "square", "centerI": 3, "centerJ": -1, "orientation": 1, "sizeN": 3, "clockwise": true},
                    {"type": "square", "centerI": 2, "centerJ": 0, "orientation": 2, "sizeN": 3, "clockwise": true},
                    {"type": "square", "centerI": 1, "centerJ": -1, "orientation": 3, "sizeN": 3, "clockwise": true}
                ]
            },
            "spiral-galaxy": {
                "name": "スパイラルギャラクシー",
                "description": "中心から螺旋状に広がる宇宙のようなパターン",
                "shapes": [
                    {"type": "square", "centerI": 0, "centerJ": 0, "orientation": 0, "sizeN": 2, "clockwise": true},
                    {"type": "triangle", "centerI": 1, "centerJ": 0, "orientation": 0, "sizeN": 1, "clockwise": true},
                    {"type": "triangle", "centerI": 0, "centerJ": 1, "orientation": 1, "sizeN": 1, "clockwise": true},
                    {"type": "triangle", "centerI": -1, "centerJ": 0, "orientation": 2, "sizeN": 1, "clockwise": true},
                    {"type": "square", "centerI": 2, "centerJ": -1, "orientation": 1, "sizeN": 1, "clockwise": true},
                    {"type": "square", "centerI": 1, "centerJ": 2, "orientation": 2, "sizeN": 1, "clockwise": true},
                    {"type": "square", "centerI": -2, "centerJ": 1, "orientation": 3, "sizeN": 1, "clockwise": true},
                    {"type": "square", "centerI": -1, "centerJ": -2, "orientation": 0, "sizeN": 1, "clockwise": true},
                    {"type": "triangle", "centerI": 3, "centerJ": -2, "orientation": 0, "sizeN": 2, "clockwise": true},
                    {"type": "triangle", "centerI": 2, "centerJ": 3, "orientation": 1, "sizeN": 2, "clockwise": true},
                    {"type": "triangle", "centerI": -3, "centerJ": 2, "orientation": 2, "sizeN": 2, "clockwise": true}
                ]
            },
            "wave-pattern": {
                "name": "ウェーブパターン",
                "description": "波のように上下に躍動感のある配置",
                "shapes": [
                    {"type": "triangle", "centerI": -6, "centerJ": -2, "orientation": 0, "sizeN": 2, "clockwise": true},
                    {"type": "square", "centerI": -3, "centerJ": -3, "orientation": 1, "sizeN": 2, "clockwise": true},
                    {"type": "triangle", "centerI": 0, "centerJ": -2, "orientation": 2, "sizeN": 2, "clockwise": true},
                    {"type": "square", "centerI": 3, "centerJ": -3, "orientation": 3, "sizeN": 2, "clockwise": true},
                    {"type": "triangle", "centerI": 6, "centerJ": -2, "orientation": 0, "sizeN": 2, "clockwise": true},
                    {"type": "square", "centerI": -6, "centerJ": 2, "orientation": 2, "sizeN": 2, "clockwise": true},
                    {"type": "triangle", "centerI": -3, "centerJ": 3, "orientation": 1, "sizeN": 2, "clockwise": true},
                    {"type": "square", "centerI": 0, "centerJ": 2, "orientation": 0, "sizeN": 2, "clockwise": true},
                    {"type": "triangle", "centerI": 3, "centerJ": 3, "orientation": 2, "sizeN": 2, "clockwise": true},
                    {"type": "square", "centerI": 6, "centerJ": 2, "orientation": 1, "sizeN": 2, "clockwise": true}
                ]
            },
            "minimalist-zen": {
                "name": "ミニマリスト禅",
                "description": "シンプルで美しい、禅の思想を表現した最小限のパターン",
                "shapes": [
                    {"type": "square", "centerI": 0, "centerJ": 0, "orientation": 0, "sizeN": 6, "clockwise": true},
                    {"type": "triangle", "centerI": -4, "centerJ": 0, "orientation": 1, "sizeN": 2, "clockwise": true},
                    {"type": "triangle", "centerI": 4, "centerJ": 0, "orientation": 2, "sizeN": 2, "clockwise": true},
                    {"type": "square", "centerI": 0, "centerJ": -4, "orientation": 1, "sizeN": 1, "clockwise": true},
                    {"type": "square", "centerI": 0, "centerJ": 4, "orientation": 3, "sizeN": 1, "clockwise": true}
                ]
            },
            "cosmic-rings": {
                "name": "コズミックリングス",
                "description": "中心から重なり合う同心正方形による宇宙的な広がり",
                "shapes": (() => {
                    const sizes = [2,3,4,5,6];
                    return sizes.map((size, i) => ({ "type":"square", "centerI":0, "centerJ":0, "orientation": i%4, "sizeN": size, "clockwise": i%2===0 }));
                })()
            },
            "mandala-matrix": {
                "name": "マンダラマトリックス",
                "description": "コズミックリングスを3×3に配置した神聖幾何学的な構成",
                "shapes": (() => {
                    const shapes = [], sizes = [2,3,4,5,6], spacing=14, offsets = [-spacing,0,spacing];
                    offsets.forEach((oj, r) => { offsets.forEach((oi, c) => {
                        sizes.forEach((size, i) => {
                            shapes.push({ "type":"square", "centerI":oi, "centerJ":oj, "orientation":(i+r+c)%4, "sizeN": size, "clockwise": (i+r)%2===0 });
                        });
                    })});
                    return shapes;
                })()
            },
            "mystic-pentagons": {
                "name": "ミスティックペンタゴンズ",
                "description": "回転する五つの三角形で描く神秘的な輪",
                "shapes": (() => {
                    const sizes = [2,3,4,5,6];
                    return sizes.map((size, i)=>({ "type":"triangle", "centerI":0,"centerJ":0,"orientation": i%6,"sizeN": size,"clockwise": i%2===0 }));
                })()
            },
            "crystal-pyramid": {
                "name": "クリスタルピラミッド",
                "description": "ミスティックペンタゴンズを積層したピラミッド構造",
                "shapes": (() => {
                    const shapes = [], sizes = [2,3,4,5,6], col=12, row=12;
                    const rows = [{count:3, j: row}, {count:2, j:0}, {count:1, j:-row}];
                    rows.forEach((rw, r)=> {
                        const startI = -((rw.count -1)*col)/2;
                        for (let c=0;c<rw.count;c++){
                            const ci = startI + c*col;
                            sizes.forEach((size,i)=> {
                                shapes.push({ "type":"triangle","centerI":parseFloat(ci.toFixed(2)),"centerJ": rw.j,"orientation": (i+r+c)%6,"sizeN": size,"clockwise": (i+c)%2===0});
                            });
                        }
                    }); return shapes;
                })()
            },
            "square-grid-10x10": {
                "name": "10×10スクエアグリッド",
                "description": "整然と並ぶ100個の正方形による巨大グリッド",
                "shapes": (() => {
                    const shapes = [], rows=10, cols=10, spacing=1.4, off=(rows-1)/2;
                    for (let r=0;r<rows;r++) for (let c=0;c<cols;c++){
                        const i=(c-off)*spacing, j=(r-off)*spacing;
                        shapes.push({ "type":"square","centerI":+i.toFixed(2),"centerJ":+j.toFixed(2),"orientation":0,"sizeN":1,"clockwise":true });
                    }
                    return shapes;
                })()
            },
            "square-grid-staggered": {
                "name": "シフトスクエアグリッド",
                "description": "まだらにずれた配置が織りなすアシンメトリックな格子",
                "shapes": (() => {
                    const shapes=[], rows=10, cols=10, spacing=1.4, off=(rows-1)/2;
                    for (let r=0;r<rows;r++){
                        const shift = (r%2===0 ? -0.35 : 0.35);
                        for (let c=0;c<cols;c++){
                            const bi=(c-off)*spacing, bj=(r-off)*spacing;
                            const ji = shift + ((c%3)-1)*0.2;
                            const jj = ((r+c)%3 -1)*0.25;
                            shapes.push({ "type":"square","centerI":+(bi+ji).toFixed(2),"centerJ":+(bj+jj).toFixed(2),"orientation": (r+c)%4,"sizeN":1,"clockwise":true });
                        }
                    }
                    return shapes;
                })()
            },
            "triangle-overlap-spiral": {
                "name": "トライアングルスパイラル",
                "description": "重なり合う三角形が描くダイナミックな螺旋",
                "shapes": (() => {
                    const shapes=[], count=18;
                    for (let s=0;s<count;s++){
                        const ang = s*0.55, rad = 0.8 + s*0.55;
                        const i = Math.cos(ang)*rad, j=Math.sin(ang)*rad;
                        const orientation = Math.floor((ang / (Math.PI/3)))%3;
                        const sizeN = 1 + Math.floor(s/6);
                        shapes.push({ "type":"triangle","centerI":+i.toFixed(2),"centerJ":+j.toFixed(2),"orientation": orientation,"sizeN": sizeN,"clockwise": s%2===0});
                    }
                    return shapes;
                })()
            }
        };
    }
}

// 起動
document.addEventListener('DOMContentLoaded', () => { window.app = new DigitalArtApp(); });
