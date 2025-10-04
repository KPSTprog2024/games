// デジタルアート統合ミニアプリ - 三角形+正方形統合版
class Triangle {
    constructor(id, centerI, centerJ, orientation, sizeN, clockwise) {
        this.id = id;
        this.centerI = centerI;
        this.centerJ = centerJ;
        this.orientation = orientation; // 0, 1, 2
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
        
        // 三角形の3つの頂点を計算
        for (let i = 0; i < 3; i++) {
            let angle = (this.orientation * Math.PI / 3) + (i * 2 * Math.PI / 3);
            if (!this.clockwise) {
                angle = -angle;
            }
            
            vertices.push({
                x: center.x + radius * Math.cos(angle),
                y: center.y + radius * Math.sin(angle)
            });
        }
        return vertices;
    }
    
    containsPoint(x, y, grid) {
        const vertices = this.getVertices(grid);
        return this.pointInTriangle(x, y, vertices);
    }
    
    pointInTriangle(px, py, vertices) {
        const [v0, v1, v2] = vertices;
        const denom = (v1.y - v2.y) * (v0.x - v2.x) + (v2.x - v1.x) * (v0.y - v2.y);
        
        if (Math.abs(denom) < 1e-10) return false;
        
        const a = ((v1.y - v2.y) * (px - v2.x) + (v2.x - v1.x) * (py - v2.y)) / denom;
        const b = ((v2.y - v0.y) * (px - v2.x) + (v0.x - v2.x) * (py - v2.y)) / denom;
        const c = 1 - a - b;
        
        return a >= 0 && b >= 0 && c >= 0;
    }
    
    getCenterHandle(grid) {
        const center = grid.gridToPixel(this.centerI, this.centerJ);
        return { x: center.x, y: center.y, radius: 12 };
    }
}

class Square {
    constructor(id, centerI, centerJ, orientation, sizeN, clockwise) {
        this.id = id;
        this.centerI = centerI;
        this.centerJ = centerJ;
        this.orientation = orientation; // 0, 1, 2, 3
        this.sizeN = sizeN; // 1-128
        this.clockwise = clockwise;
        this.stroke = '#FF8000';
        this.lineWidth = 2.0;
        this.zIndex = Date.now();
        this.type = 'square';
    }
    
    getVertices(grid) {
        const center = grid.gridToPixel(this.centerI, this.centerJ);
        const halfSize = this.sizeN * grid.size * 0.7;
        const vertices = [];
        
        // 正方形の4つの頂点を計算
        for (let i = 0; i < 4; i++) {
            let angle = (this.orientation * Math.PI / 4) + (i * Math.PI / 2);
            if (!this.clockwise) {
                angle = -angle;
            }
            
            // 正方形の頂点は中心から対角線の距離
            const diagonalRadius = halfSize * Math.sqrt(2);
            vertices.push({
                x: center.x + diagonalRadius * Math.cos(angle + Math.PI/4),
                y: center.y + diagonalRadius * Math.sin(angle + Math.PI/4)
            });
        }
        return vertices;
    }
    
    containsPoint(x, y, grid) {
        const vertices = this.getVertices(grid);
        return this.pointInPolygon(x, y, vertices);
    }
    
    pointInPolygon(px, py, vertices) {
        let inside = false;
        for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
            if (((vertices[i].y > py) !== (vertices[j].y > py)) &&
                (px < (vertices[j].x - vertices[i].x) * (py - vertices[i].y) / (vertices[j].y - vertices[i].y) + vertices[i].x)) {
                inside = !inside;
            }
        }
        return inside;
    }
    
    getCenterHandle(grid) {
        const center = grid.gridToPixel(this.centerI, this.centerJ);
        return { x: center.x, y: center.y, radius: 12 };
    }
}

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
        const dx = x - pos.x;
        const dy = y - pos.y;
        return Math.sqrt(dx * dx + dy * dy) <= this.radius;
    }
}

class AnimationManager {
    constructor() {
        this.isPlaying = false;
        this.progress = 1.0;           // ✅ 初期は完全表示
        this.startTime = 0;
        this.animationId = null;
        
        // 新アニメーション設定
        this.delayDuration = 500;      // 0.5秒暗転
        this.drawDuration = 3000;      // 3秒描画
        this.totalDuration = 3500;     // 合計3.5秒
        this.fps = 60;
        this.lastFrameTime = 0;
        
        // フェーズ管理
        this.currentPhase = 'editing';  // 'editing', 'hiding', 'dark', 'drawing', 'complete'
        
        // コールバック
        this.onProgressChange = null;
        this.onPhaseChange = null;
    }

    start() {
        if (this.isPlaying) return;
        
        this.isPlaying = true;
        this.startTime = performance.now();
        
        // Phase 1: 即座に消去
        this.progress = 0.0;
        this.currentPhase = 'hiding';
        this.triggerCallbacks();
        
        this.animate();
    }

    animate = (currentTime = performance.now()) => {
        if (!this.isPlaying) return;

        const elapsed = currentTime - this.startTime;
        
        if (elapsed < this.delayDuration) {
            // Phase 2: 暗転期間（0.5秒）
            this.progress = 0.0;
            this.currentPhase = 'dark';
        } else if (elapsed < this.totalDuration) {
            // Phase 3: 描画期間（0.5秒後から3秒間）
            const drawElapsed = elapsed - this.delayDuration;
            const rawProgress = drawElapsed / this.drawDuration;
            this.progress = this.easeInOutCubic(Math.min(1, Math.max(0, rawProgress)));
            this.currentPhase = 'drawing';
        } else {
            // Phase 4: 完了
            this.progress = 1.0;
            this.currentPhase = 'complete';
            this.stop();
            return;
        }

        this.triggerCallbacks();
        this.animationId = requestAnimationFrame(this.animate);
    };

    stop() {
        this.isPlaying = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        this.progress = 1.0;  // 編集用に完全表示
        this.currentPhase = 'editing';
        this.triggerCallbacks();
    }

    reset() {
        this.stop();
        this.progress = 1.0;  // リセット後も編集用に完全表示
        this.currentPhase = 'editing';
        this.triggerCallbacks();
    }

    easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }
    
    triggerCallbacks() {
        if (this.onProgressChange) {
            this.onProgressChange(this.progress);
        }
        if (this.onPhaseChange) {
            this.onPhaseChange(this.currentPhase, this.progress);
        }
    }
    
    getElapsedTime() {
        if (!this.isPlaying) return 0;
        return Math.min(performance.now() - this.startTime, this.totalDuration);
    }
}

class Grid {
    constructor(size = 16) {
        this.size = size;
        this.width = 0;
        this.height = 0;
        this.originX = 0;
        this.originY = 0;
    }

    updateDimensions(width, height) {
        this.width = width;
        this.height = height;
        this.originX = width / 2;
        this.originY = height / 2;
    }

    gridToPixel(i, j) {
        return {
            x: this.originX + i * this.size,
            y: this.originY + j * this.size
        };
    }

    pixelToGrid(x, y) {
        return {
            i: Math.round((x - this.originX) / this.size),
            j: Math.round((y - this.originY) / this.size)
        };
    }

    snapToGrid(x, y) {
        const grid = this.pixelToGrid(x, y);
        return this.gridToPixel(grid.i, grid.j);
    }
}

class VisualEffects {
    constructor() {
        this.time = 0;
        this.colors = ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5', '#5D878F', '#DB4545', '#D2BA4C', '#964325', '#944454', '#13343B'];
    }
    
    getColor(shape, mode, settings, grid) {
        const center = grid.gridToPixel(shape.centerI, shape.centerJ);
        
        switch (mode) {
            case 'static':
                return shape.stroke;
                
            case 'hueCycle':
                const hue = (this.time * (settings.speed || 0.1) * 100 + (settings.hueOffset || 0)) % 360;
                return `hsl(${hue}, ${settings.saturation || 100}%, ${settings.lightness || 60}%)`;
                
            case 'radialMap':
                const angle = Math.atan2(center.y - window.innerHeight/2, center.x - window.innerWidth/2);
                const hueFromAngle = ((angle + Math.PI) / (2 * Math.PI) * 360 + (settings.hueOffset || 0)) % 360;
                return `hsl(${hueFromAngle}, ${settings.saturation || 90}%, ${settings.lightness || 65}%)`;
                
            case 'ringBands':
                const centerX = window.innerWidth / 2;
                const centerY = window.innerHeight / 2;
                const distance = Math.sqrt((center.x - centerX) ** 2 + (center.y - centerY) ** 2);
                const wave = Math.sin(distance * 0.01 + this.time * (settings.speed || 0.1) * 10);
                const lightness = 30 + wave * 50;
                return `hsl(${(settings.baseHue || 200) + (settings.hueOffset || 0)}, ${settings.saturation || 80}%, ${Math.max(0, Math.min(100, lightness))}%)`;
                
            case 'noiseFlow':
                const noiseX = Math.sin(center.x * 0.01 + this.time * 0.02) * Math.cos(center.y * 0.01);
                const noiseY = Math.cos(center.x * 0.01) * Math.sin(center.y * 0.01 + this.time * 0.02);
                const noiseHue = ((noiseX + noiseY + 2) / 4 * 360 + (settings.hueOffset || 0)) % 360;
                return `hsl(${noiseHue}, ${settings.saturation || 85}%, ${settings.lightness || 55}%)`;
                
            case 'gridIndex':
                const isEven = (shape.centerI + shape.centerJ) % 2 === 0;
                return isEven ? (settings.evenColor || '#00FF41') : (settings.oddColor || '#008F11');
                
            default:
                return shape.stroke;
        }
    }
    
    update(deltaTime) {
        this.time += deltaTime * 0.001;
    }
}

class BackgroundEffects {
    constructor() {
        this.stars = [];
        this.time = 0;
        this.noiseData = null;
    }
    
    initStars(count = 200) {
        this.stars = [];
        for (let i = 0; i < count; i++) {
            this.stars.push({
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                brightness: Math.random(),
                twinkleSpeed: 0.5 + Math.random() * 2
            });
        }
    }
    
    drawBackground(ctx, mode, settings) {
        const width = ctx.canvas.clientWidth;
        const height = ctx.canvas.clientHeight;
        
        switch (mode) {
            case 'solid':
                ctx.fillStyle = settings.backgroundColor || '#000000';
                ctx.fillRect(0, 0, width, height);
                break;
                
            case 'gradientPulse':
                const centerX = width / 2;
                const centerY = height / 2;
                const radius = Math.max(width, height) * (0.5 + Math.sin(this.time * 0.002) * 0.3);
                const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
                gradient.addColorStop(0, `rgba(31, 184, 205, ${0.1 + Math.sin(this.time * 0.003) * 0.05})`);
                gradient.addColorStop(0.5, `rgba(19, 52, 59, ${0.05 + Math.sin(this.time * 0.002) * 0.03})`);
                gradient.addColorStop(1, '#000000');
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, width, height);
                break;
                
            case 'stars':
                ctx.fillStyle = '#000000';
                ctx.fillRect(0, 0, width, height);
                
                if (this.stars.length === 0) {
                    this.initStars(settings.starCount || 200);
                }
                
                ctx.fillStyle = '#FFFFFF';
                this.stars.forEach(star => {
                    const twinkle = Math.sin(this.time * star.twinkleSpeed * 0.001) * 0.5 + 0.5;
                    const opacity = star.brightness * twinkle * 0.8;
                    ctx.globalAlpha = opacity;
                    ctx.fillRect(star.x, star.y, 1, 1);
                });
                ctx.globalAlpha = 1;
                break;
                
            case 'darkNoise':
                if (!this.noiseData || this.noiseData.width !== width) {
                    this.noiseData = ctx.createImageData(width, height);
                }
                
                const data = this.noiseData.data;
                for (let i = 0; i < data.length; i += 4) {
                    const noise = Math.sin(i * 0.001 + this.time * 0.0005) * 0.5 + 0.5;
                    const value = Math.floor(noise * 30);
                    data[i] = value;     // R
                    data[i + 1] = value * 1.2; // G
                    data[i + 2] = value * 0.8; // B
                    data[i + 3] = 255;   // A
                }
                ctx.putImageData(this.noiseData, 0, 0);
                break;
        }
    }
    
    update(deltaTime) {
        this.time += deltaTime;
    }
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
        this.addShapeCounter = 0; // 新しい図形の配置管理用
        
        // 統合図形管理
        this.state = {
            shapes: new Map(),
            selectedShapeId: null,
            nextTriangleId: 1,
            nextSquareId: 1,
            showHandles: true,
            visual: {
                preset: 'neon-basic',
                colorMode: 'static',
                backgroundMode: 'solid',
                effectIntensity: 100,
                hueOffset: 0
            },
            animation: {
                speed: 1.0
            }
        };
        
        // サンプルパターン
        this.samplePatterns = {
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
            }
        };
        
        // プリセットテーマ設定
        this.themes = {
            "neon-basic": {background: "solid", colorMode: "static", settings: {backgroundColor: "#000000"}},
            "neon-cyberpunk": {background: "gradientPulse", colorMode: "hueCycle", settings: {speed: 0.1, saturation: 100, lightness: 60}},
            "aurora-rings": {background: "stars", colorMode: "ringBands", settings: {baseHue: 200, saturation: 80, lightness: 50, starCount: 200}},
            "matrix-grid": {background: "darkNoise", colorMode: "gridIndex", settings: {evenColor: "#00FF41", oddColor: "#008F11"}},
            "radial-spectrum": {background: "solid", colorMode: "radialMap", settings: {saturation: 90, lightness: 65}},
            "noise-flow": {background: "gradientPulse", colorMode: "noiseFlow", settings: {saturation: 85, lightness: 55}}
        };
        
        // ドラッグ状態
        this.dragState = {
            isDragging: false,
            type: null, // 'vertex-0', 'vertex-1', 'vertex-2', 'center', 'body'
            shapeId: null,
            startX: 0,
            startY: 0,
            lastX: 0,
            lastY: 0
        };
        
        // FPS計測
        this.fps = 0;
        this.frameCount = 0;
        this.lastFrameTime = 0;
        
        this.setupCanvas();
        this.setupEventListeners();
        this.setupUI();
        this.setupAnimationManager();
        this.initializeDefaultShapes();
        this.startAnimationLoop();
    }
    
    initializeDefaultShapes() {
        // ✅ 起動時に三角形と正方形を1つずつ、少し離れた位置に配置
        const triangle = new Triangle(
            `triangle-${this.state.nextTriangleId++}`,
            -3, -3, 0, 3, true  // 左上に配置
        );
        triangle.zIndex = Date.now();
        this.state.shapes.set(triangle.id, triangle);
        
        setTimeout(() => {
            const square = new Square(
                `square-${this.state.nextSquareId++}`,
                3, 3, 0, 3, true    // 右下に配置
            );
            square.zIndex = Date.now() + 1;
            this.state.shapes.set(square.id, square);
            this.updateShapeCounts();
        }, 10); // 少し遅延させてzIndexを確実に分ける
        
        this.updateShapeCounts();
    }
    
    setupAnimationManager() {
        this.animationManager.onProgressChange = (progress) => {
            const progressBar = document.getElementById('progressBar');
            if (progressBar) {
                progressBar.style.width = `${progress * 100}%`;
            }
        };
        
        this.animationManager.onPhaseChange = (phase, progress) => {
            const phaseDisplay = document.getElementById('animationPhase');
            const timeDisplay = document.getElementById('timeDisplay');
            const animationStatus = document.querySelector('.animation-status');
            const progressBar = document.getElementById('progressBar');
            const mainPlayButton = document.getElementById('mainPlayButton');
            
            // フェーズ表示更新
            switch (phase) {
                case 'editing':
                    phaseDisplay.textContent = '編集モード';
                    animationStatus.className = 'animation-status';
                    progressBar.classList.remove('pulsing');
                    mainPlayButton.classList.remove('playing');
                    break;
                case 'hiding':
                    phaseDisplay.textContent = '非表示中...';
                    animationStatus.className = 'animation-status playing';
                    progressBar.classList.add('pulsing');
                    mainPlayButton.classList.add('playing');
                    break;
                case 'dark':
                    phaseDisplay.textContent = '暗転中...';
                    animationStatus.className = 'animation-status dark-phase';
                    progressBar.classList.add('pulsing');
                    mainPlayButton.classList.add('playing');
                    break;
                case 'drawing':
                    phaseDisplay.textContent = '描画中...';
                    animationStatus.className = 'animation-status drawing';
                    progressBar.classList.remove('pulsing');
                    mainPlayButton.classList.add('playing');
                    break;
                case 'complete':
                    phaseDisplay.textContent = '完了';
                    animationStatus.className = 'animation-status';
                    progressBar.classList.remove('pulsing');
                    mainPlayButton.classList.remove('playing');
                    break;
            }
            
            // 時間表示更新
            if (this.animationManager.isPlaying) {
                const elapsed = this.animationManager.getElapsedTime() / 1000;
                timeDisplay.textContent = `時間: ${elapsed.toFixed(1)} / 3.5s`;
            } else {
                timeDisplay.textContent = '時間: 0.0 / 3.5s';
            }
        };
    }
    
    setupCanvas() {
        const applyDimensions = () => {
            // キャンバスサイズを画面全体に設定
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            this.canvas.style.width = window.innerWidth + 'px';
            this.canvas.style.height = window.innerHeight + 'px';

            this.grid.updateDimensions(this.canvas.width, this.canvas.height);
        };

        applyDimensions();
        this.ctx.imageSmoothingEnabled = true;

        if (!this._handleResize) {
            this._handleResize = () => {
                applyDimensions();
            };
            window.addEventListener('resize', this._handleResize);
        }
    }
    
    setupEventListeners() {
        // ポインターイベント
        this.canvas.addEventListener('pointerdown', this.onPointerDown.bind(this));
        this.canvas.addEventListener('pointermove', this.onPointerMove.bind(this));
        this.canvas.addEventListener('pointerup', this.onPointerUp.bind(this));
        this.canvas.addEventListener('pointercancel', this.onPointerUp.bind(this));
        
        // メニュー関連
        document.getElementById('menuToggle').addEventListener('click', this.toggleMenu.bind(this));
        document.getElementById('menuOverlay').addEventListener('click', this.closeMenu.bind(this));
        
        // メイン再生ボタン
        document.getElementById('mainPlayButton').addEventListener('click', () => {
            if (this.animationManager.isPlaying) {
                this.animationManager.stop();
            } else {
                this.animationManager.start();
            }
        });
        
        // 図形追加ボタン（右下）
        document.getElementById('addTriangle').addEventListener('click', () => this.addShape('triangle'));
        document.getElementById('addSquare').addEventListener('click', () => this.addShape('square'));
        
        // 図形追加ボタン（メニュー内）
        document.getElementById('addTriangleMenu').addEventListener('click', () => this.addShape('triangle'));
        document.getElementById('addSquareMenu').addEventListener('click', () => this.addShape('square'));
        
        // サンプルパターン
        document.getElementById('applyPattern').addEventListener('click', () => {
            const patternName = document.getElementById('samplePattern').value;
            if (patternName) {
                this.applyPattern(patternName);
            }
        });
        
        // UI コントロール
        this.setupUIControls();
    }
    
    setupUIControls() {
        // プリセット選択
        document.getElementById('presetSelect').addEventListener('change', (e) => {
            this.applyPreset(e.target.value);
        });
        
        // 色モード・背景モード
        document.getElementById('colorMode').addEventListener('change', (e) => {
            this.state.visual.colorMode = e.target.value;
        });
        
        document.getElementById('backgroundMode').addEventListener('change', (e) => {
            this.state.visual.backgroundMode = e.target.value;
        });
        
        // スライダー
        const setupSlider = (id, valueId, callback) => {
            const slider = document.getElementById(id);
            const valueDisplay = document.getElementById(valueId);
            slider.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                valueDisplay.textContent = id === 'animationSpeed' ? value.toFixed(1) : Math.round(value);
                callback(value);
            });
        };
        
        setupSlider('effectIntensity', 'intensityValue', (v) => this.state.visual.effectIntensity = v);
        setupSlider('hueOffset', 'hueValue', (v) => this.state.visual.hueOffset = v);
        setupSlider('animationSpeed', 'speedValue', (v) => this.state.animation.speed = v);
        
        // チェックボックス
        document.getElementById('showHandles').addEventListener('change', (e) => {
            this.state.showHandles = e.target.checked;
            this.updateVertexHandles();
        });
        
        // アニメーション制御
        document.getElementById('playAnimation').addEventListener('click', () => {
            this.animationManager.start();
        });
        
        document.getElementById('stopAnimation').addEventListener('click', () => {
            this.animationManager.stop();
        });
        
        document.getElementById('resetAnimation').addEventListener('click', () => {
            this.animationManager.reset();
        });
        
        // アクション
        document.getElementById('exportPNG').addEventListener('click', this.exportPNG.bind(this));
        document.getElementById('clearAll').addEventListener('click', this.clearAll.bind(this));
    }
    
    setupUI() {
        // 初期値設定
        document.getElementById('presetSelect').value = this.state.visual.preset;
        document.getElementById('colorMode').value = this.state.visual.colorMode;
        document.getElementById('backgroundMode').value = this.state.visual.backgroundMode;
        document.getElementById('effectIntensity').value = this.state.visual.effectIntensity;
        document.getElementById('hueOffset').value = this.state.visual.hueOffset;
        document.getElementById('animationSpeed').value = this.state.animation.speed;
        document.getElementById('showHandles').checked = this.state.showHandles;
    }
    
    toggleMenu() {
        const menu = document.getElementById('proMenu');
        const overlay = document.getElementById('menuOverlay');
        
        if (menu.classList.contains('hidden')) {
            menu.classList.remove('hidden');
            overlay.classList.remove('hidden');
        } else {
            this.closeMenu();
        }
    }
    
    closeMenu() {
        document.getElementById('proMenu').classList.add('hidden');
        document.getElementById('menuOverlay').classList.add('hidden');
    }
    
    addShape(type, clockwise = true) {
        if (this.state.shapes.size >= 100) return;
        
        // ✅ スパイラル配置で画面中央から少しずつずらす
        this.addShapeCounter++;
        const angle = this.addShapeCounter * 0.8;
        const distance = Math.min(this.addShapeCounter * 1.5, 8);
        
        const centerI = Math.round(Math.cos(angle) * distance);
        const centerJ = Math.round(Math.sin(angle) * distance);
        
        if (type === 'triangle') {
            const triangle = new Triangle(
                `triangle-${this.state.nextTriangleId++}`,
                centerI, centerJ, 0, 3, clockwise
            );
            triangle.zIndex = Date.now();
            this.state.shapes.set(triangle.id, triangle);
            this.state.selectedShapeId = triangle.id; // 新しい図形を選択状態に
        } else if (type === 'square') {
            const square = new Square(
                `square-${this.state.nextSquareId++}`,
                centerI, centerJ, 0, 3, clockwise
            );
            square.zIndex = Date.now();
            this.state.shapes.set(square.id, square);
            this.state.selectedShapeId = square.id; // 新しい図形を選択状態に
        }
        
        this.updateVertexHandles(); // ハンドル更新
        this.updateShapeCounts();
    }
    
    applyPattern(patternName) {
        const pattern = this.samplePatterns[patternName];
        if (!pattern) return;
        
        // 既存図形をクリア
        this.state.shapes.clear();
        this.state.selectedShapeId = null;
        this.addShapeCounter = 0; // カウンターもリセット
        
        // 新しいパターンを適用
        pattern.shapes.forEach((shapeData, index) => {
            let shape;
            if (shapeData.type === 'triangle') {
                shape = new Triangle(
                    `triangle-${this.state.nextTriangleId++}`,
                    shapeData.centerI,
                    shapeData.centerJ,
                    shapeData.orientation,
                    shapeData.sizeN,
                    shapeData.clockwise
                );
            } else if (shapeData.type === 'square') {
                shape = new Square(
                    `square-${this.state.nextSquareId++}`,
                    shapeData.centerI,
                    shapeData.centerJ,
                    shapeData.orientation,
                    shapeData.sizeN,
                    shapeData.clockwise
                );
            }
            
            if (shape) {
                shape.zIndex = Date.now() + index; // 順序保持
                this.state.shapes.set(shape.id, shape);
            }
        });
        
        this.updateShapeCounts();
    }
    
    onPointerDown(event) {
        event.preventDefault();
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        // アニメーション中は操作を無効化
        if (this.animationManager.isPlaying) return;
        
        // ヒットテスト: 頂点ハンドル > 中心ハンドル > 図形本体
        const hitResult = this.performHitTest(x, y);
        
        if (hitResult) {
            this.dragState = {
                isDragging: true,
                type: hitResult.type,
                shapeId: hitResult.shapeId,
                vertexIndex: hitResult.vertexIndex || null,
                startX: x,
                startY: y,
                lastX: x,
                lastY: y
            };
            
            this.state.selectedShapeId = hitResult.shapeId;
            this.updateVertexHandles();
            
            this.canvas.style.cursor = 'grabbing';
        } else {
            this.state.selectedShapeId = null;
            this.vertexHandles = [];
        }
    }
    
    onPointerMove(event) {
        event.preventDefault();
        if (!this.dragState.isDragging || this.animationManager.isPlaying) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        const shape = this.state.shapes.get(this.dragState.shapeId);
        if (!shape) return;
        
        if (this.dragState.type.startsWith('vertex-')) {
            this.resizeShapeByVertex(shape, this.dragState.vertexIndex, x, y);
        } else if (this.dragState.type === 'center' || this.dragState.type === 'body') {
            this.moveShape(shape, x, y);
        }
        
        this.dragState.lastX = x;
        this.dragState.lastY = y;
        
        // ハンドル位置を更新
        this.updateVertexHandles();
    }
    
    onPointerUp(event) {
        this.dragState.isDragging = false;
        this.canvas.style.cursor = 'crosshair';
    }
    
    performHitTest(x, y) {
        // 頂点ハンドルテスト（最優先）
        if (this.state.selectedShapeId && this.state.showHandles && this.animationManager.progress >= 1.0) {
            for (const handle of this.vertexHandles) {
                const shape = this.state.shapes.get(handle.shapeId);
                if (shape && handle.containsPoint(x, y, shape, this.grid)) {
                    return {
                        type: `vertex-${handle.vertexIndex}`,
                        shapeId: handle.shapeId,
                        vertexIndex: handle.vertexIndex
                    };
                }
            }
        }
        
        // 選択された図形の中心ハンドルテスト
        if (this.state.selectedShapeId && this.state.showHandles && this.animationManager.progress >= 1.0) {
            const shape = this.state.shapes.get(this.state.selectedShapeId);
            if (shape) {
                const centerHandle = shape.getCenterHandle(this.grid);
                const dx = x - centerHandle.x;
                const dy = y - centerHandle.y;
                if (Math.sqrt(dx * dx + dy * dy) <= centerHandle.radius) {
                    return { type: 'center', shapeId: shape.id };
                }
            }
        }
        
        // 図形本体テスト（zIndex順、完全表示時のみ）
        if (this.animationManager.progress >= 1.0) {
            const sortedShapes = Array.from(this.state.shapes.values()).sort((a, b) => b.zIndex - a.zIndex);
            
            for (const shape of sortedShapes) {
                if (shape.containsPoint(x, y, this.grid)) {
                    return { type: 'body', shapeId: shape.id };
                }
            }
        }
        
        return null;
    }
    
    resizeShapeByVertex(shape, vertexIndex, newX, newY) {
        const center = this.grid.gridToPixel(shape.centerI, shape.centerJ);
        const distance = Math.sqrt((newX - center.x) ** 2 + (newY - center.y) ** 2);
        const newSizeN = Math.max(1, Math.min(10, Math.round(distance / (this.grid.size * 0.8))));
        
        const angle = Math.atan2(newY - center.y, newX - center.x);
        let newOrientation;
        
        if (shape.type === 'triangle') {
            newOrientation = Math.round((angle * 3) / (2 * Math.PI)) % 3;
            if (newOrientation < 0) newOrientation += 3;
        } else {
            newOrientation = Math.round((angle * 4) / (2 * Math.PI)) % 4;
            if (newOrientation < 0) newOrientation += 4;
        }
        
        shape.sizeN = newSizeN;
        shape.orientation = newOrientation;
        shape.zIndex = Date.now(); // 最前面に移動
    }
    
    moveShape(shape, x, y) {
        const gridPos = this.grid.pixelToGrid(x, y);
        shape.centerI = gridPos.i;
        shape.centerJ = gridPos.j;
        shape.zIndex = Date.now(); // 最前面に
    }
    
    updateVertexHandles() {
        this.vertexHandles = [];
        if (this.state.selectedShapeId && this.state.showHandles && this.animationManager.progress >= 1.0) {
            const selectedShape = this.state.shapes.get(this.state.selectedShapeId);
            if (selectedShape) {
                const vertexCount = selectedShape.type === 'triangle' ? 3 : 4;
                for (let i = 0; i < vertexCount; i++) {
                    this.vertexHandles.push(new VertexHandle(this.state.selectedShapeId, i));
                }
            }
        }
    }
    
    applyPreset(presetName) {
        const theme = this.themes[presetName];
        if (!theme) return;
        
        this.state.visual.preset = presetName;
        this.state.visual.colorMode = theme.colorMode;
        this.state.visual.backgroundMode = theme.background;
        
        // UI更新
        document.getElementById('colorMode').value = theme.colorMode;
        document.getElementById('backgroundMode').value = theme.background;
        
        // 背景エフェクト初期化
        if (theme.background === 'stars') {
            this.backgroundEffects.initStars(theme.settings.starCount);
        }
    }
    
    calculatePerimeter(vertices) {
        let perimeter = 0;
        for (let i = 0; i < vertices.length; i++) {
            const current = vertices[i];
            const next = vertices[(i + 1) % vertices.length];
            perimeter += Math.sqrt(
                (next.x - current.x) ** 2 + (next.y - current.y) ** 2
            );
        }
        return perimeter;
    }
    
    drawShape(shape, progress) {
        if (progress <= 0) {
            return;  // progress=0なら何も描画しない
        }
        
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
            // 完全描画
            this.ctx.beginPath();
            this.ctx.moveTo(vertices[0].x, vertices[0].y);
            for (let i = 1; i < vertices.length; i++) {
                this.ctx.lineTo(vertices[i].x, vertices[i].y);
            }
            this.ctx.closePath();
            this.ctx.stroke();
        } else {
            // 部分描画
            const perimeter = this.calculatePerimeter(vertices);
            const drawLength = perimeter * progress;
            this.drawPartialPath(vertices, drawLength, shape.clockwise);
        }
        
        // 選択された図形をハイライト（完全表示時のみ）
        if (shape.id === this.state.selectedShapeId && progress >= 1.0) {
            this.ctx.strokeStyle = '#FF4081';
            this.ctx.lineWidth = (shape.lineWidth + 1) * (this.state.visual.effectIntensity / 100);
            this.ctx.stroke();
        }
    }
    
    drawPartialPath(vertices, drawLength, clockwise) {
        if (!clockwise) vertices = [...vertices].reverse();
        
        let remainingLength = drawLength;
        this.ctx.beginPath();
        this.ctx.moveTo(vertices[0].x, vertices[0].y);
        
        for (let i = 0; i < vertices.length && remainingLength > 0; i++) {
            const nextIndex = (i + 1) % vertices.length;
            const current = vertices[i];
            const next = vertices[nextIndex];
            
            const segmentLength = Math.sqrt(
                (next.x - current.x) ** 2 + (next.y - current.y) ** 2
            );
            
            if (remainingLength >= segmentLength) {
                this.ctx.lineTo(next.x, next.y);
                remainingLength -= segmentLength;
            } else {
                const ratio = remainingLength / segmentLength;
                const partialX = current.x + (next.x - current.x) * ratio;
                const partialY = current.y + (next.y - current.y) * ratio;
                this.ctx.lineTo(partialX, partialY);
                remainingLength = 0;
            }
        }
        
        this.ctx.stroke();
    }
    
    exportPNG() {
        const link = document.createElement('a');
        link.download = `digital-art-${Date.now()}.png`;
        link.href = this.canvas.toDataURL('image/png');
        link.click();
    }
    
    clearAll() {
        if (confirm('すべての図形を削除しますか？')) {
            this.state.shapes.clear();
            this.state.selectedShapeId = null;
            this.vertexHandles = [];
            this.addShapeCounter = 0;
            this.updateShapeCounts();
        }
    }
    
    updateShapeCounts() {
        const triangleCount = Array.from(this.state.shapes.values()).filter(s => s.type === 'triangle').length;
        const squareCount = Array.from(this.state.shapes.values()).filter(s => s.type === 'square').length;
        
        document.getElementById('triangleCount').textContent = triangleCount;
        document.getElementById('squareCount').textContent = squareCount;
    }
    
    updateFPS(currentTime) {
        this.frameCount++;
        if (currentTime - this.lastFrameTime >= 1000) {
            this.fps = Math.round(this.frameCount * 1000 / (currentTime - this.lastFrameTime));
            document.getElementById('fpsDisplay').textContent = this.fps;
            this.frameCount = 0;
            this.lastFrameTime = currentTime;
        }
    }
    
    startAnimationLoop() {
        let lastTime = 0;
        
        const animate = (currentTime) => {
            const deltaTime = currentTime - lastTime;
            lastTime = currentTime;
            
            // エフェクト更新（アニメーション中は停止）
            if (!this.animationManager.isPlaying) {
                this.visualEffects.update(deltaTime * this.state.animation.speed);
                this.backgroundEffects.update(deltaTime * this.state.animation.speed);
            }
            
            this.render();
            this.updateFPS(currentTime);
            
            requestAnimationFrame(animate);
        };
        
        requestAnimationFrame(animate);
    }
    
    render() {
        const width = this.canvas.width;
        const height = this.canvas.height;
        
        // 画面をクリア
        this.ctx.clearRect(0, 0, width, height);
        
        // 背景描画
        const theme = this.themes[this.state.visual.preset];
        this.backgroundEffects.drawBackground(this.ctx, this.state.visual.backgroundMode, theme?.settings || {});
        
        // 図形描画（zIndex順）
        const sortedShapes = Array.from(this.state.shapes.values()).sort((a, b) => a.zIndex - b.zIndex);
        const progress = this.animationManager.progress;
        
        for (const shape of sortedShapes) {
            this.drawShape(shape, progress);
        }
        
        // ハンドル描画（編集モードかつ完全表示時のみ）
        if (this.state.selectedShapeId && this.state.showHandles && progress >= 1.0) {
            const selectedShape = this.state.shapes.get(this.state.selectedShapeId);
            if (selectedShape) {
                // 中心ハンドル
                const centerHandle = selectedShape.getCenterHandle(this.grid);
                this.ctx.beginPath();
                this.ctx.arc(centerHandle.x, centerHandle.y, 6, 0, 2 * Math.PI);
                this.ctx.fillStyle = '#FF4081';
                this.ctx.fill();
                this.ctx.strokeStyle = '#FFFFFF';
                this.ctx.lineWidth = 2;
                this.ctx.stroke();
                
                // 頂点ハンドル
                for (const handle of this.vertexHandles) {
                    handle.draw(this.ctx, selectedShape, this.grid, true);
                }
            }
        }
    }
}

// アプリケーション起動
document.addEventListener('DOMContentLoaded', () => {
    window.app = new DigitalArtApp();
});
