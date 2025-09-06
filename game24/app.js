// 複数レーザーミラービリヤード - アスペクト比対応版
class MultiLaserBilliards {
    constructor() {
        this.canvas = document.getElementById('laserCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Hi-DPI設定
        this.pixelRatio = window.devicePixelRatio || 1;
        
        // 物理パラメータ
        this.params = {
            laserCount: 3,
            placementMode: 'radial',
            colorMode: 'rainbow',
            angle: 33.0,
            angleFan: 120,
            speed: 240,
            lineWidth: 1.5,
            fade: 0.06,
            maxTotalBounces: 200,
            aspectRatio: { width: 1.6, height: 1.0 }
        };
        
        // アスペクト比プリセット
        this.aspectPresets = {
            custom: { width: 1.6, height: 1.0, name: 'カスタム' },
            square: { width: 1.0, height: 1.0, name: '正方形' },
            '4:3': { width: 1.33, height: 1.0, name: '4:3' },
            '16:10': { width: 1.6, height: 1.0, name: '16:10' },
            golden: { width: 1.618, height: 1.0, name: '黄金比' },
            silver: { width: 1.414, height: 1.0, name: '√2:1' },
            '3:2': { width: 1.5, height: 1.0, name: '3:2' }
        };
        
        // 複数レーザープリセット
        this.multiPresets = {
            symmetry3: {
                laserCount: 3, placementMode: 'radial', colorMode: 'rainbow',
                angle: 0, angleFan: 120, speed: 240, lineWidth: 1.5, fade: 0.06,
                aspectRatio: { width: 1.0, height: 1.0 }
            },
            grid9: {
                laserCount: 9, placementMode: 'grid', colorMode: 'gradient',
                angle: 45, speed: 180, lineWidth: 1.2, fade: 0.04,
                aspectRatio: { width: 1.33, height: 1.0 }
            },
            goldenFan: {
                laserCount: 5, placementMode: 'radial', colorMode: 'hueShift',
                angle: 0, angleFan: 72, speed: 200, lineWidth: 1.4, fade: 0.05,
                aspectRatio: { width: 1.618, height: 1.0 }
            },
            randomCloud: {
                laserCount: 7, placementMode: 'random', colorMode: 'randomColor',
                angle: 30, speed: 300, lineWidth: 1.8, fade: 0.08,
                aspectRatio: { width: 1.6, height: 1.0 }
            },
            circleStorm: {
                laserCount: 12, placementMode: 'circle', colorMode: 'rainbow',
                angle: 0, speed: 350, lineWidth: 1.0, fade: 0.12,
                aspectRatio: { width: 1.0, height: 1.0 }
            },
            neonDance: {
                laserCount: 6, placementMode: 'radial', colorMode: 'hueShift',
                angle: 15, angleFan: 60, speed: 400, lineWidth: 2.5, fade: 0.10,
                aspectRatio: { width: 1.414, height: 1.0 }
            }
        };
        
        // 状態
        this.isPlaying = false;
        this.lasers = [];
        this.totalBounceCount = 0;
        this.frameCount = 0;
        
        this.init();
    }
    
    init() {
        this.setupCanvas();
        this.setupEventListeners();
        this.initializeLasers();
        this.clearCanvas();
        this.updateAllUI();
        
        // 初期描画
        this.drawStaticElements();

        // アニメーションループ
        this.lastTime = performance.now();
        this.animationId = requestAnimationFrame(time => this.animate(time));
    }
    
    initializeLasers() {
        this.lasers = [];
        this.totalBounceCount = 0;
        
        console.log(`Initializing ${this.params.laserCount} lasers with ${this.params.placementMode} placement`);
        
        for (let i = 0; i < this.params.laserCount; i++) {
            this.lasers.push(this.createLaser(i));
        }
        
        console.log(`Created ${this.lasers.length} lasers:`, this.lasers);
    }
    
    createLaser(index) {
        const laser = {
            id: index,
            pos: { x: 0, y: 0 },
            velocity: { x: 0, y: 0 },
            bounceCount: 0,
            hue: 0,
            trails: []
        };
        
        this.setLaserPosition(laser, index);
        this.setLaserVelocity(laser, index);
        this.setLaserColor(laser, index);
        
        console.log(`Laser ${index}:`, laser);
        return laser;
    }
    
    setLaserPosition(laser, index) {
        const margin = 15;
        const width = this.canvasWidth - 2 * margin;
        const height = this.canvasHeight - 2 * margin;
        
        switch (this.params.placementMode) {
            case 'radial':
                laser.pos.x = margin + width * 0.5;
                laser.pos.y = margin + height * 0.5;
                break;
                
            case 'grid':
                const cols = Math.ceil(Math.sqrt(this.params.laserCount));
                const rows = Math.ceil(this.params.laserCount / cols);
                const col = index % cols;
                const row = Math.floor(index / cols);
                laser.pos.x = margin + (col + 0.5) * (width / cols);
                laser.pos.y = margin + (row + 0.5) * (height / rows);
                break;
                
            case 'random':
                laser.pos.x = margin + Math.random() * width;
                laser.pos.y = margin + Math.random() * height;
                break;
                
            case 'circle':
                const centerX = margin + width * 0.5;
                const centerY = margin + height * 0.5;
                const radius = Math.min(width, height) * 0.35;
                const angle = (index / this.params.laserCount) * 2 * Math.PI;
                laser.pos.x = centerX + Math.cos(angle) * radius;
                laser.pos.y = centerY + Math.sin(angle) * radius;
                break;
                
            case 'free':
            default:
                laser.pos.x = margin + width * (0.3 + (index * 0.4) / Math.max(1, this.params.laserCount - 1));
                laser.pos.y = margin + height * (0.3 + (index * 0.4) / Math.max(1, this.params.laserCount - 1));
                break;
        }
    }
    
    setLaserVelocity(laser, index) {
        const speed = this.params.speed / 60; // px per frame (60fps想定)
        let angle;
        
        switch (this.params.placementMode) {
            case 'radial':
                if (this.params.laserCount === 1) {
                    angle = this.params.angle;
                } else {
                    const fanRange = this.params.angleFan;
                    const startAngle = this.params.angle - fanRange / 2;
                    angle = startAngle + (index / Math.max(1, this.params.laserCount - 1)) * fanRange;
                }
                break;
                
            case 'grid':
                angle = this.params.angle + (Math.random() - 0.5) * 30;
                break;
                
            case 'random':
                angle = Math.random() * 180;
                break;
                
            case 'circle':
                // 円周配置では中心向きに発射
                const centerX = this.canvasWidth * 0.5;
                const centerY = this.canvasHeight * 0.5;
                const dx = centerX - laser.pos.x;
                const dy = centerY - laser.pos.y;
                angle = Math.atan2(dx, -dy) * 180 / Math.PI;
                if (angle < 0) angle += 360;
                break;
                
            default:
                angle = this.params.angle + index * 15;
                break;
        }
        
        const angleRad = angle * Math.PI / 180;
        laser.velocity.x = Math.sin(angleRad) * speed;
        laser.velocity.y = -Math.cos(angleRad) * speed;
    }
    
    setLaserColor(laser, index) {
        switch (this.params.colorMode) {
            case 'rainbow':
                laser.hue = (index / Math.max(1, this.params.laserCount - 1)) * 300;
                break;
            case 'gradient':
                laser.hue = (index / Math.max(1, this.params.laserCount - 1)) * 240;
                break;
            case 'randomColor':
                laser.hue = Math.random() * 360;
                break;
            case 'monochrome':
                laser.hue = 0;
                break;
            case 'hueShift':
                laser.hue = (index * 60) % 360;
                break;
        }
    }
    
    updateAllUI() {
        // 入力要素が存在するかチェック
        const elements = [
            'laserCountSlider', 'laserCountValue', 'placementModeSelect',
            'angleFanSlider', 'angleFanValue', 'colorModeSelect',
            'widthSlider', 'widthValue', 'heightSlider', 'heightValue',
            'angleSlider', 'angleValue', 'speedSlider', 'speedValue',
            'lineWidthSlider', 'lineWidthValue', 'fadeSlider', 'fadeValue',
            'maxBouncesSlider', 'maxBouncesValue'
        ];
        
        elements.forEach(id => {
            const element = document.getElementById(id);
            if (!element) {
                console.warn(`Element not found: ${id}`);
            }
        });
        
        // UI更新
        this.safeUpdateElement('laserCountSlider', 'value', this.params.laserCount);
        this.safeUpdateElement('laserCountValue', 'textContent', this.params.laserCount);
        this.safeUpdateElement('placementModeSelect', 'value', this.params.placementMode);
        this.safeUpdateElement('angleFanSlider', 'value', this.params.angleFan);
        this.safeUpdateElement('angleFanValue', 'textContent', this.params.angleFan);
        this.safeUpdateElement('colorModeSelect', 'value', this.params.colorMode);
        
        this.safeUpdateElement('widthSlider', 'value', this.params.aspectRatio.width);
        this.safeUpdateElement('widthValue', 'textContent', this.params.aspectRatio.width.toFixed(1));
        this.safeUpdateElement('heightSlider', 'value', this.params.aspectRatio.height);
        this.safeUpdateElement('heightValue', 'textContent', this.params.aspectRatio.height.toFixed(1));
        
        this.safeUpdateElement('angleSlider', 'value', this.params.angle);
        this.safeUpdateElement('angleValue', 'textContent', this.params.angle.toFixed(1));
        this.safeUpdateElement('speedSlider', 'value', this.params.speed);
        this.safeUpdateElement('speedValue', 'textContent', this.params.speed);
        this.safeUpdateElement('lineWidthSlider', 'value', this.params.lineWidth);
        this.safeUpdateElement('lineWidthValue', 'textContent', this.params.lineWidth.toFixed(1));
        this.safeUpdateElement('fadeSlider', 'value', this.params.fade);
        this.safeUpdateElement('fadeValue', 'textContent', this.params.fade.toFixed(2));
        this.safeUpdateElement('maxBouncesSlider', 'value', this.params.maxTotalBounces);
        this.safeUpdateElement('maxBouncesValue', 'textContent', this.params.maxTotalBounces);
        
        this.updateAspectRatioDisplay();
        this.updateLaserCountDisplay();
        this.updateAngleFanVisibility();
    }
    
    safeUpdateElement(id, property, value) {
        const element = document.getElementById(id);
        if (element) {
            element[property] = value;
        }
    }
    
    updateAngleFanVisibility() {
        const angleFanControl = document.getElementById('angleFanControl');
        if (angleFanControl) {
            if (this.params.placementMode === 'radial') {
                angleFanControl.classList.remove('hidden');
            } else {
                angleFanControl.classList.add('hidden');
            }
        }
    }
    
    setupCanvas() {
        const container = this.canvas.parentElement;
        const rect = container.getBoundingClientRect();
        const aspectRatio = this.params.aspectRatio.width / this.params.aspectRatio.height;
        
        let canvasWidth = Math.min(700, rect.width - 32);
        let canvasHeight = canvasWidth / aspectRatio;
        
        const maxHeight = rect.height - 64;
        if (canvasHeight > maxHeight) {
            canvasHeight = maxHeight;
            canvasWidth = canvasHeight * aspectRatio;
        }
        
        this.canvas.width = canvasWidth * this.pixelRatio;
        this.canvas.height = canvasHeight * this.pixelRatio;
        this.canvas.style.width = canvasWidth + 'px';
        this.canvas.style.height = canvasHeight + 'px';
        
        this.ctx.scale(this.pixelRatio, this.pixelRatio);
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        
        console.log(`Canvas resized: ${canvasWidth}x${canvasHeight}`);
    }
    
    updateAspectRatioDisplay() {
        const display = document.getElementById('aspectRatioDisplay');
        if (display) {
            const w = this.params.aspectRatio.width.toFixed(2);
            const h = this.params.aspectRatio.height.toFixed(2);
            display.textContent = `${w}:${h}`;
            
            display.classList.remove('highlight');
            setTimeout(() => display.classList.add('highlight'), 10);
            setTimeout(() => display.classList.remove('highlight'), 800);
        }
    }
    
    updateLaserCountDisplay() {
        const display = document.getElementById('laserCounter');
        if (display) {
            display.textContent = `レーザー数: ${this.params.laserCount}`;
            
            display.classList.remove('highlight');
            setTimeout(() => display.classList.add('highlight'), 10);
            setTimeout(() => display.classList.remove('highlight'), 800);
        }
    }
    
    clearCanvas() {
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
    }
    
    drawStaticElements() {
        // 静止状態でレーザーの開始位置を表示
        if (!this.isPlaying && this.lasers.length > 0) {
            for (const laser of this.lasers) {
                const color = this.getLaserColor(laser);
                
                // 開始位置マーカー
                this.ctx.fillStyle = color;
                this.ctx.strokeStyle = color;
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                this.ctx.arc(laser.pos.x, laser.pos.y, 4, 0, 2 * Math.PI);
                this.ctx.stroke();
                this.ctx.beginPath();
                this.ctx.arc(laser.pos.x, laser.pos.y, 2, 0, 2 * Math.PI);
                this.ctx.fill();
                
                // 方向線（短い線で方向を示す）
                const dirLength = 20;
                const endX = laser.pos.x + laser.velocity.x * dirLength;
                const endY = laser.pos.y + laser.velocity.y * dirLength;
                
                this.ctx.strokeStyle = color;
                this.ctx.lineWidth = 1;
                this.ctx.beginPath();
                this.ctx.moveTo(laser.pos.x, laser.pos.y);
                this.ctx.lineTo(endX, endY);
                this.ctx.stroke();
                
                // 矢印の先端
                const arrowLength = 5;
                const arrowAngle = Math.PI / 6;
                const angle = Math.atan2(laser.velocity.y, laser.velocity.x);
                
                this.ctx.beginPath();
                this.ctx.moveTo(endX, endY);
                this.ctx.lineTo(
                    endX - arrowLength * Math.cos(angle - arrowAngle),
                    endY - arrowLength * Math.sin(angle - arrowAngle)
                );
                this.ctx.moveTo(endX, endY);
                this.ctx.lineTo(
                    endX - arrowLength * Math.cos(angle + arrowAngle),
                    endY - arrowLength * Math.sin(angle + arrowAngle)
                );
                this.ctx.stroke();
            }
        }
    }
    
    setupEventListeners() {
        // ボタンイベント
        const playBtn = document.getElementById('playPauseBtn');
        const resetBtn = document.getElementById('resetBtn');
        const snapshotBtn = document.getElementById('snapshotBtn');
        
        if (playBtn) playBtn.addEventListener('click', () => this.togglePlayPause());
        if (resetBtn) resetBtn.addEventListener('click', () => this.reset());
        if (snapshotBtn) snapshotBtn.addEventListener('click', () => this.saveSnapshot());
        
        // 複数レーザーコントロール
        this.addEventListenerSafe('laserCountSlider', 'input', (e) => {
            this.params.laserCount = parseInt(e.target.value);
            this.safeUpdateElement('laserCountValue', 'textContent', this.params.laserCount);
            this.initializeLasers();
            this.updateLaserCountDisplay();
            this.clearCanvas();
            this.drawStaticElements();
        });
        
        this.addEventListenerSafe('placementModeSelect', 'change', (e) => {
            this.params.placementMode = e.target.value;
            this.initializeLasers();
            this.updateAngleFanVisibility();
            this.clearCanvas();
            this.drawStaticElements();
        });
        
        this.addEventListenerSafe('angleFanSlider', 'input', (e) => {
            this.params.angleFan = parseFloat(e.target.value);
            this.safeUpdateElement('angleFanValue', 'textContent', this.params.angleFan);
            this.initializeLasers();
            this.clearCanvas();
            this.drawStaticElements();
        });
        
        this.addEventListenerSafe('colorModeSelect', 'change', (e) => {
            this.params.colorMode = e.target.value;
            this.initializeLasers();
            this.clearCanvas();
            this.drawStaticElements();
        });
        
        this.addEventListenerSafe('multiPresetSelect', 'change', (e) => {
            if (e.target.value) {
                this.applyMultiPreset(e.target.value);
            }
        });
        
        // アスペクト比コントロール
        this.addEventListenerSafe('aspectPresetSelect', 'change', (e) => {
            if (e.target.value !== 'custom') {
                this.applyAspectPreset(e.target.value);
            }
        });
        
        this.addEventListenerSafe('widthSlider', 'input', (e) => {
            this.params.aspectRatio.width = parseFloat(e.target.value);
            this.safeUpdateElement('widthValue', 'textContent', this.params.aspectRatio.width.toFixed(1));
            this.updateAspectRatio();
            this.safeUpdateElement('aspectPresetSelect', 'value', 'custom');
        });
        
        this.addEventListenerSafe('heightSlider', 'input', (e) => {
            this.params.aspectRatio.height = parseFloat(e.target.value);
            this.safeUpdateElement('heightValue', 'textContent', this.params.aspectRatio.height.toFixed(1));
            this.updateAspectRatio();
            this.safeUpdateElement('aspectPresetSelect', 'value', 'custom');
        });
        
        // レーザーコントロール
        this.addEventListenerSafe('angleSlider', 'input', (e) => {
            this.params.angle = parseFloat(e.target.value);
            this.safeUpdateElement('angleValue', 'textContent', this.params.angle.toFixed(1));
            this.initializeLasers();
            this.clearCanvas();
            this.drawStaticElements();
        });
        
        this.addEventListenerSafe('speedSlider', 'input', (e) => {
            this.params.speed = parseInt(e.target.value);
            this.safeUpdateElement('speedValue', 'textContent', this.params.speed);
            this.initializeLasers();
        });
        
        this.addEventListenerSafe('lineWidthSlider', 'input', (e) => {
            this.params.lineWidth = parseFloat(e.target.value);
            this.safeUpdateElement('lineWidthValue', 'textContent', this.params.lineWidth.toFixed(1));
        });
        
        this.addEventListenerSafe('fadeSlider', 'input', (e) => {
            this.params.fade = parseFloat(e.target.value);
            this.safeUpdateElement('fadeValue', 'textContent', this.params.fade.toFixed(2));
        });
        
        this.addEventListenerSafe('maxBouncesSlider', 'input', (e) => {
            this.params.maxTotalBounces = parseInt(e.target.value);
            this.safeUpdateElement('maxBouncesValue', 'textContent', this.params.maxTotalBounces);
        });
        
        // ウィンドウリサイズ
        window.addEventListener('resize', () => {
            this.setupCanvas();
            this.initializeLasers();
            this.clearCanvas();
            this.drawStaticElements();
        });
    }
    
    addEventListenerSafe(id, event, handler) {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener(event, handler);
        } else {
            console.warn(`Cannot add event listener to missing element: ${id}`);
        }
    }
    
    applyMultiPreset(presetName) {
        const preset = this.multiPresets[presetName];
        if (!preset) return;
        
        console.log('Applying multi preset:', presetName, preset);
        
        Object.assign(this.params, JSON.parse(JSON.stringify(preset)));
        
        this.updateAllUI();
        this.updateAspectRatio();
        this.initializeLasers();
        this.clearCanvas();
        this.drawStaticElements();
        
        setTimeout(() => {
            this.safeUpdateElement('multiPresetSelect', 'value', '');
        }, 100);
    }
    
    applyAspectPreset(presetName) {
        const preset = this.aspectPresets[presetName];
        if (!preset) return;
        
        this.params.aspectRatio = { width: preset.width, height: preset.height };
        
        this.safeUpdateElement('widthSlider', 'value', preset.width);
        this.safeUpdateElement('widthValue', 'textContent', preset.width.toFixed(1));
        this.safeUpdateElement('heightSlider', 'value', preset.height);
        this.safeUpdateElement('heightValue', 'textContent', preset.height.toFixed(1));
        
        this.updateAspectRatio();
    }
    
    updateAspectRatio() {
        this.setupCanvas();
        this.initializeLasers();
        this.clearCanvas();
        this.drawStaticElements();
    }
    
    togglePlayPause() {
        this.isPlaying = !this.isPlaying;
        const btn = document.getElementById('playPauseBtn');
        if (btn) {
            if (this.isPlaying) {
                btn.textContent = '一時停止';
                btn.classList.add('playing');
            } else {
                btn.textContent = '再生';
                btn.classList.remove('playing');
                this.clearCanvas();
                this.drawStaticElements();
            }
        }
    }
    
    reset() {
        this.isPlaying = false;
        const btn = document.getElementById('playPauseBtn');
        if (btn) {
            btn.textContent = '再生';
            btn.classList.remove('playing');
        }
        
        this.totalBounceCount = 0;
        this.frameCount = 0;
        this.initializeLasers();
        this.clearCanvas();
        this.drawStaticElements();
    }
    
    simulate(deltaTime) {
        if (!this.isPlaying || deltaTime <= 0) return;
        
        const dt = Math.min(deltaTime, 50);
        const steps = Math.max(1, Math.ceil(dt / 16.67));
        
        let frameBouncesTotal = 0;
        
        for (let step = 0; step < steps && frameBouncesTotal < this.params.maxTotalBounces; step++) {
            for (const laser of this.lasers) {
                if (frameBouncesTotal >= this.params.maxTotalBounces) break;
                
                const prevPos = { x: laser.pos.x, y: laser.pos.y };
                const stepTime = dt / steps;
                
                laser.pos.x += laser.velocity.x * (stepTime / 16.67);
                laser.pos.y += laser.velocity.y * (stepTime / 16.67);
                
                let bounced = false;
                
                // 境界衝突検出と反射
                if (laser.pos.x <= 5) {
                    laser.pos.x = 5;
                    laser.velocity.x = Math.abs(laser.velocity.x);
                    bounced = true;
                } else if (laser.pos.x >= this.canvasWidth - 5) {
                    laser.pos.x = this.canvasWidth - 5;
                    laser.velocity.x = -Math.abs(laser.velocity.x);
                    bounced = true;
                }
                
                if (laser.pos.y <= 5) {
                    laser.pos.y = 5;
                    laser.velocity.y = Math.abs(laser.velocity.y);
                    bounced = true;
                } else if (laser.pos.y >= this.canvasHeight - 5) {
                    laser.pos.y = this.canvasHeight - 5;
                    laser.velocity.y = -Math.abs(laser.velocity.y);
                    bounced = true;
                }
                
                // 軌跡を記録
                const dx = laser.pos.x - prevPos.x;
                const dy = laser.pos.y - prevPos.y;
                if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) {
                    laser.trails.push({
                        from: prevPos,
                        to: { x: laser.pos.x, y: laser.pos.y },
                        color: this.getLaserColor(laser),
                        width: this.params.lineWidth
                    });
                }
                
                if (bounced) {
                    laser.bounceCount++;
                    frameBouncesTotal++;
                }
            }
        }
        
        this.totalBounceCount += frameBouncesTotal;
        
        // 色相を更新
        if (this.params.colorMode === 'hueShift') {
            for (const laser of this.lasers) {
                laser.hue += 0.8;
                if (laser.hue >= 360) laser.hue = 0;
            }
        }
        
        this.frameCount++;
    }
    
    getLaserColor(laser) {
        switch (this.params.colorMode) {
            case 'monochrome':
                return '#ffffff';
            case 'rainbow':
                return `hsl(${laser.hue}, 80%, 65%)`;
            case 'gradient':
                return `hsl(${laser.hue}, 80%, 65%)`;
            case 'randomColor':
                return `hsl(${laser.hue}, 80%, 65%)`;
            case 'hueShift':
                return `hsl(${laser.hue}, 80%, 65%)`;
            default:
                return '#ffffff';
        }
    }
    
    draw() {
        // フェード効果
        if (this.params.fade > 0) {
            this.ctx.fillStyle = `rgba(0, 0, 0, ${this.params.fade})`;
            this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
        }
        
        // 全レーザーの軌跡を描画
        for (const laser of this.lasers) {
            for (const trail of laser.trails) {
                this.ctx.strokeStyle = trail.color;
                this.ctx.lineWidth = trail.width;
                this.ctx.beginPath();
                this.ctx.moveTo(trail.from.x, trail.from.y);
                this.ctx.lineTo(trail.to.x, trail.to.y);
                this.ctx.stroke();
            }
        }
        
        // 現在位置（レーザーポイント）の描画
        if (this.isPlaying) {
            for (const laser of this.lasers) {
                const color = this.getLaserColor(laser);
                
                // グロー効果
                this.ctx.save();
                this.ctx.shadowColor = color;
                this.ctx.shadowBlur = 8;
                this.ctx.fillStyle = color;
                this.ctx.beginPath();
                this.ctx.arc(laser.pos.x, laser.pos.y, 3, 0, 2 * Math.PI);
                this.ctx.fill();
                this.ctx.restore();
                
                // メインドット
                this.ctx.fillStyle = color;
                this.ctx.beginPath();
                this.ctx.arc(laser.pos.x, laser.pos.y, 1.5, 0, 2 * Math.PI);
                this.ctx.fill();
            }
        }
    }
    
    animate(currentTime = performance.now()) {
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        this.simulate(deltaTime);
        this.draw();
        
        this.animationId = requestAnimationFrame((time) => this.animate(time));
    }
    
    saveSnapshot() {
        const w = this.params.aspectRatio.width.toFixed(1);
        const h = this.params.aspectRatio.height.toFixed(1);
        const link = document.createElement('a');
        link.download = `multi-laser-billiards-${this.params.laserCount}lasers-${w}x${h}-${Date.now()}.png`;
        link.href = this.canvas.toDataURL('image/png');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        console.log('Snapshot saved');
    }
}

// アプリケーション初期化
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing Multi-Laser Billiards...');
    const app = new MultiLaserBilliards();
    
    setTimeout(() => {
        console.log('Multi-laser setup complete');
    }, 100);
    
    window.multiLaserApp = app;
});