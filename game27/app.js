// Echo Drawing Application
class EchoDrawingApp {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.settings = {
            echoIntervalMs: 70,
            echoCountMax: 80,
            shiftX: -1,
            shiftY: -2,
            shiftXMode: 'static',
            shiftYMode: 'static',
            shiftXOscAmplitude: 0,
            shiftYOscAmplitude: 0,
            shiftXOscFrequency: 1,
            shiftYOscFrequency: 1,
            scalePerEcho: 0.99,
            alphaPerEcho: 0.98,
            blurPerEcho: 0,
            colorDecay: 'off',
            colorMode: 'gradient',
            gradientEndColor: '#ff0078',
            hueShift: 30,
            strokeColor: '#00c8ff',
            strokeWidth: 3,
            strokeAlpha: 0.75,
            backgroundEffect: 'aurora'
        };
        
        this.presets = {
            'default': {
                echoIntervalMs: 70,
                echoCountMax: 80,
                shiftX: -1,
                shiftY: -2,
                shiftXMode: 'static',
                shiftYMode: 'static',
                shiftXOscAmplitude: 0,
                shiftYOscAmplitude: 0,
                shiftXOscFrequency: 1,
                shiftYOscFrequency: 1,
                scalePerEcho: 0.99,
                alphaPerEcho: 0.98,
                blurPerEcho: 0,
                colorDecay: 'off',
                colorMode: 'gradient',
                gradientEndColor: '#ff0078',
                hueShift: 30,
                strokeColor: '#00c8ff',
                strokeWidth: 3,
                strokeAlpha: 0.75,
                backgroundEffect: 'aurora'
            },
            'rainbow': {
                echoIntervalMs: 40,
                echoCountMax: 200,
                shiftX: 5,
                shiftY: 0,
                shiftXMode: 'oscillate',
                shiftYMode: 'oscillate',
                shiftXOscAmplitude: 25,
                shiftYOscAmplitude: 15,
                shiftXOscFrequency: 0.6,
                shiftYOscFrequency: 0.9,
                scalePerEcho: 0.99,
                alphaPerEcho: 0.98,
                blurPerEcho: 0,
                colorDecay: 'off',
                colorMode: 'rainbow',
                gradientEndColor: '#ff0000',
                hueShift: 3,
                strokeColor: '#ff0000',
                strokeWidth: 5,
                strokeAlpha: 1
            },
            'wireframe-lite': {
                echoIntervalMs: 30,
                echoCountMax: 20,
                shiftX: 20,
                shiftY: 1,
                shiftXMode: 'static',
                shiftYMode: 'static',
                shiftXOscAmplitude: 0,
                shiftYOscAmplitude: 0,
                shiftXOscFrequency: 1,
                shiftYOscFrequency: 1,
                scalePerEcho: 0.9,
                alphaPerEcho: 0.98,
                blurPerEcho: 0,
                colorDecay: 'off',
                colorMode: 'solid',
                gradientEndColor: '#000000',
                hueShift: 30,
                strokeColor: '#00ff64',
                strokeWidth: 1,
                strokeAlpha: 1
            }
        };
        
        this.strokeManager = new StrokeManager();
        this.echoManager = new EchoManager(this.settings.echoCountMax);
        this.renderer = new Canvas2DRenderer();
        this.performance = new PerformanceManager();

        this.isDrawing = false;
        this.echoTimer = null;
        this.animationId = null;
        this.lastFrameTime = null;
        this.startTime = null;
        this.init();
    }

    init() {
        this.setupCanvas();
        this.setupAmbientLayer();
        this.setupEventListeners();
        this.setupSettings();
        this.startRenderLoop();
        this.startEchoTimer();

        document.querySelector('.app-container').classList.add('loaded');
    }
    
    setupCanvas() {
        this.canvas = document.getElementById('drawingCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.renderer.setContext(this.ctx);
        this.resizeCanvas();
        
        window.addEventListener('resize', () => this.resizeCanvas());
        window.addEventListener('orientationchange', () => {
            setTimeout(() => this.resizeCanvas(), 100);
        });
    }
    
    resizeCanvas() {
        const dpr = window.devicePixelRatio || 1;
        const rect = this.canvas.getBoundingClientRect();
        
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        
        this.ctx.scale(dpr, dpr);
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';
        
        this.renderer.setDimensions(rect.width, rect.height);
    }
    
    setupEventListeners() {
        // Pointer Events for unified input handling
        this.canvas.addEventListener('pointerdown', (e) => this.handlePointerDown(e));
        this.canvas.addEventListener('pointermove', (e) => this.handlePointerMove(e));
        this.canvas.addEventListener('pointerup', (e) => this.handlePointerUp(e));
        this.canvas.addEventListener('pointercancel', (e) => this.handlePointerUp(e));
        
        // Prevent context menu and page scrolling while drawing
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
        this.canvas.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
        
        // Clear canvas button
        document.getElementById('clearCanvas').addEventListener('click', () => {
            this.clearCanvas();
        });
        
        // Settings panel toggle
        document.getElementById('toggleSettings').addEventListener('click', () => {
            this.toggleSettingsPanel();
        });
    }
    
    setupSettings() {
        // Preset buttons
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.applyPreset(e.target.dataset.preset);
                document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
            });
        });
        
        // Settings controls
        this.setupSettingControl('strokeColor', 'color', (value) => {
            this.settings.strokeColor = value;
        });

        this.setupSettingControl('colorMode', 'select', (value) => {
            this.settings.colorMode = value;
        });

        this.setupSettingControl('gradientEndColor', 'color', (value) => {
            this.settings.gradientEndColor = value;
        });

        this.setupSettingControl('hueShift', 'range', (value) => {
            this.settings.hueShift = parseInt(value);
            document.getElementById('hueShiftValue').textContent = value;
        });
        
        this.setupSettingControl('strokeWidth', 'range', (value) => {
            this.settings.strokeWidth = parseFloat(value);
            document.getElementById('strokeWidthValue').textContent = value;
        });
        
        this.setupSettingControl('strokeAlpha', 'range', (value) => {
            this.settings.strokeAlpha = parseInt(value) / 100;
            document.getElementById('strokeAlphaValue').textContent = value;
        });
        
        this.setupSettingControl('echoInterval', 'range', (value) => {
            this.settings.echoIntervalMs = parseInt(value);
            document.getElementById('echoIntervalValue').textContent = value;
            this.restartEchoTimer();
        });
        
        this.setupSettingControl('echoCount', 'range', (value) => {
            this.settings.echoCountMax = parseInt(value);
            document.getElementById('echoCountValue').textContent = value;
            this.echoManager.setMaxEchoes(parseInt(value));
        });
        
        this.setupSettingControl('shiftX', 'range', (value) => {
            this.settings.shiftX = parseInt(value);
            document.getElementById('shiftXValue').textContent = value;
        });
        
        this.setupSettingControl('shiftY', 'range', (value) => {
            this.settings.shiftY = parseInt(value);
            document.getElementById('shiftYValue').textContent = value;
        });
        
        this.setupSettingControl('shiftXMode', 'select', (value) => {
            this.settings.shiftXMode = value;
            this.updateShiftAxisState('X');
        });

        this.setupSettingControl('shiftXOscAmplitude', 'range', (value) => {
            this.settings.shiftXOscAmplitude = parseFloat(value);
            document.getElementById('shiftXOscAmplitudeValue').textContent = value;
        });

        this.setupSettingControl('shiftXOscFrequency', 'range', (value) => {
            this.settings.shiftXOscFrequency = parseFloat(value);
            document.getElementById('shiftXOscFrequencyValue').textContent = this.formatFrequency(value);
        });

        this.setupSettingControl('shiftYMode', 'select', (value) => {
            this.settings.shiftYMode = value;
            this.updateShiftAxisState('Y');
        });

        this.setupSettingControl('shiftYOscAmplitude', 'range', (value) => {
            this.settings.shiftYOscAmplitude = parseFloat(value);
            document.getElementById('shiftYOscAmplitudeValue').textContent = value;
        });

        this.setupSettingControl('shiftYOscFrequency', 'range', (value) => {
            this.settings.shiftYOscFrequency = parseFloat(value);
            document.getElementById('shiftYOscFrequencyValue').textContent = this.formatFrequency(value);
        });

        this.setupSettingControl('scalePerEcho', 'range', (value) => {
            this.settings.scalePerEcho = parseFloat(value);
            document.getElementById('scalePerEchoValue').textContent = value;
        });
        
        this.setupSettingControl('alphaPerEcho', 'range', (value) => {
            this.settings.alphaPerEcho = parseFloat(value);
            document.getElementById('alphaPerEchoValue').textContent = value;
        });
        
        this.setupSettingControl('blurPerEcho', 'range', (value) => {
            this.settings.blurPerEcho = parseFloat(value);
            document.getElementById('blurPerEchoValue').textContent = value;
        });
        
        this.setupSettingControl('colorDecay', 'select', (value) => {
            this.settings.colorDecay = value;
        });

        document.getElementById('shiftXOscFrequencyValue').textContent = this.formatFrequency(this.settings.shiftXOscFrequency);
        document.getElementById('shiftYOscFrequencyValue').textContent = this.formatFrequency(this.settings.shiftYOscFrequency);

        this.updateShiftAxisState('X');
        this.updateShiftAxisState('Y');
    }

    setupSettingControl(id, type, callback) {
        const element = document.getElementById(id);
        const event = type === 'range' ? 'input' : 'change';

        element.addEventListener(event, (e) => {
            callback(e.target.value);
        });
    }

    updateShiftAxisState(axis) {
        const mode = this.settings[`shift${axis}Mode`];
        const amplitudeInput = document.getElementById(`shift${axis}OscAmplitude`);
        const frequencyInput = document.getElementById(`shift${axis}OscFrequency`);
        const amplitudeGroup = amplitudeInput.closest('.form-group');
        const frequencyGroup = frequencyInput.closest('.form-group');
        const isOscillate = mode === 'oscillate';

        amplitudeInput.disabled = !isOscillate;
        frequencyInput.disabled = !isOscillate;

        amplitudeGroup.classList.toggle('form-group--disabled', !isOscillate);
        frequencyGroup.classList.toggle('form-group--disabled', !isOscillate);
    }

    formatFrequency(value) {
        return parseFloat(value).toFixed(2);
    }

    applyPreset(presetName) {
        const preset = this.presets[presetName];
        if (!preset) return;

        Object.assign(this.settings, preset);
        this.echoManager.setMaxEchoes(this.settings.echoCountMax);

        // Update UI controls
        Object.keys(preset).forEach(key => {
            const element = document.getElementById(this.getControlId(key));
            if (element) {
                let value = preset[key];
                if (key === 'strokeAlpha') {
                    value = preset[key] * 100;
                }
                element.value = value;

                // Update display values
                const valueDisplay = document.getElementById(this.getControlId(key) + 'Value');
                if (valueDisplay) {
                    valueDisplay.textContent = this.formatSettingValue(key, value);
                }
            }
        });

        this.updateShiftAxisState('X');
        this.updateShiftAxisState('Y');
        this.restartEchoTimer();
        this.updateBackgroundEffect();
    }

    getControlId(settingKey) {
        const mapping = {
            echoIntervalMs: 'echoInterval',
            echoCountMax: 'echoCount'
        };
        return mapping[settingKey] || settingKey;
    }

    formatSettingValue(key, value) {
        if (key === 'strokeAlpha') {
            return value;
        }
        if (key.endsWith('Frequency')) {
            return this.formatFrequency(value);
        }
        return value;
    }
    
    handlePointerDown(e) {
        e.preventDefault();
        this.isDrawing = true;
        
        const point = this.getPointerPoint(e);
        this.strokeManager.beginStroke(
            this.settings.strokeColor,
            this.settings.strokeWidth,
            this.settings.strokeAlpha
        );
        this.strokeManager.addPoint(point);
    }
    
    handlePointerMove(e) {
        if (!this.isDrawing) return;
        e.preventDefault();
        
        const point = this.getPointerPoint(e);
        this.strokeManager.addPoint(point);
    }
    
    handlePointerUp(e) {
        if (!this.isDrawing) return;
        e.preventDefault();
        
        this.isDrawing = false;
        this.strokeManager.endStroke();
    }
    
    getPointerPoint(e) {
        const rect = this.canvas.getBoundingClientRect();
        const pressure = e.pressure || 0.5;
        
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
            time: performance.now(),
            pressure: pressure
        };
    }
    
    startRenderLoop() {
        const render = (currentTime) => {
            if (this.startTime === null) {
                this.startTime = currentTime;
            }

            if (this.lastFrameTime === null) {
                this.lastFrameTime = currentTime;
            }

            const deltaTime = currentTime - this.lastFrameTime;
            this.lastFrameTime = currentTime;
            const elapsedTime = currentTime - this.startTime;

            // Update performance metrics
            this.performance.update(deltaTime);

            // Apply performance governor
            this.performance.applyGovernor(this.settings);

            // Update performance display
            this.updatePerformanceDisplay();

            // Cull off-screen echoes
            this.echoManager.cullOffscreen(
                this.renderer.width,
                this.renderer.height,
                this.settings
            );

            // Render frame
            this.renderFrame(elapsedTime);

            this.animationId = requestAnimationFrame(render);
        };

        this.animationId = requestAnimationFrame(render);
    }

    renderFrame(elapsedTime = 0) {
        // Clear canvas
        this.renderer.clear();

        // Draw echoes from back to front
        const echoes = this.echoManager.getRenderPlan();
        for (const {echo, k} of echoes) {
            this.renderer.drawEcho(echo, k, this.getTransformParams(k, elapsedTime), this.settings);
        }

        // Draw current stroke on top
        const currentStroke = this.strokeManager.getCurrentPath();
        if (currentStroke && currentStroke.points.length > 0) {
            this.renderer.drawStroke(currentStroke);
        }
    }

    getTransformParams(k, elapsedTime = 0) {
        return {
            dx: computeShiftAxis(
                this.settings.shiftXMode,
                k * this.settings.shiftX,
                this.settings.shiftXOscAmplitude,
                this.settings.shiftXOscFrequency,
                elapsedTime,
                k
            ),
            dy: computeShiftAxis(
                this.settings.shiftYMode,
                k * this.settings.shiftY,
                this.settings.shiftYOscAmplitude,
                this.settings.shiftYOscFrequency,
                elapsedTime,
                k
            ),
            scale: Math.pow(this.settings.scalePerEcho, k),
            alpha: Math.pow(this.settings.alphaPerEcho, k),
            blur: k * this.settings.blurPerEcho
        };
    }
    
    startEchoTimer() {
        this.echoTimer = setInterval(() => {
            const currentStroke = this.strokeManager.getCurrentPath();
            if (currentStroke && currentStroke.points.length > 0) {
                this.echoManager.snapshot(currentStroke);
            }
        }, this.settings.echoIntervalMs);
    }
    
    restartEchoTimer() {
        if (this.echoTimer) {
            clearInterval(this.echoTimer);
        }
        this.startEchoTimer();
    }
    
    updatePerformanceDisplay() {
        const fps = Math.round(this.performance.getCurrentFPS());
        const status = this.performance.getStatus();
        
        document.getElementById('fpsDisplay').textContent = `${fps} FPS`;
        
        const statusElement = document.getElementById('performanceStatus');
        statusElement.className = 'status ' + this.getStatusClass(status);
        statusElement.textContent = this.getStatusText(status);
    }
    
    getStatusClass(status) {
        switch (status) {
            case 'optimal': return 'status--success';
            case 'degraded': return 'status--warning';
            case 'minimal': return 'status--error';
            default: return 'status--info';
        }
    }
    
    getStatusText(status) {
        switch (status) {
            case 'optimal': return '最適';
            case 'degraded': return '劣化';
            case 'minimal': return '最小';
            default: return '調整中';
        }
    }
    
    toggleSettingsPanel() {
        const content = document.getElementById('settingsContent');
        const icon = document.getElementById('toggleIcon');

        content.classList.toggle('collapsed');
        icon.textContent = content.classList.contains('collapsed') ? '▲' : '▼';
    }

    setupAmbientLayer() {
        this.ambientLayer = document.getElementById('ambientLayer');
        this.particlesContainer = document.getElementById('particlesContainer');
        this.updateBackgroundEffect();
    }

    updateBackgroundEffect() {
        if (!this.ambientLayer) {
            return;
        }

        const desiredEffect = (this.performanceSuppressedEffects && this.settings.backgroundEffect !== 'none')
            ? 'none'
            : this.settings.backgroundEffect;

        if (desiredEffect === this.activeBackgroundEffect) {
            return;
        }

        this.applyBackgroundEffect(desiredEffect);
    }

    applyBackgroundEffect(effect) {
        const classList = ['ambient--aurora', 'ambient--particles', 'ambient--none'];
        this.ambientLayer.classList.remove(...classList);

        switch (effect) {
            case 'particles':
                this.ambientLayer.classList.add('ambient--particles');
                this.ensureParticlesEffect();
                break;
            case 'aurora':
                this.destroyParticles();
                this.ambientLayer.classList.add('ambient--aurora');
                break;
            default:
                this.destroyParticles();
                this.ambientLayer.classList.add('ambient--none');
                break;
        }

        this.activeBackgroundEffect = effect;
    }

    ensureParticlesEffect() {
        if (this.particlesActive) {
            return;
        }

        this.destroyParticles();

        this.loadParticlesLibrary()
            .then(() => {
                this.initParticles();
            })
            .catch((error) => {
                console.error('particles.js を読み込めませんでした', error);
                this.activeBackgroundEffect = 'none';
                this.ambientLayer.classList.remove('ambient--particles');
                this.ambientLayer.classList.add('ambient--none');
                this.particlesActive = false;
            });
    }

    loadParticlesLibrary() {
        if (window.particlesJS) {
            return Promise.resolve();
        }

        if (this.particlesScriptPromise) {
            return this.particlesScriptPromise;
        }

        this.particlesScriptPromise = new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/particles.js@2.0.0/particles.min.js';
            script.async = true;
            script.onload = () => resolve();
            script.onerror = (error) => {
                script.remove();
                this.particlesScriptPromise = null;
                reject(error);
            };
            document.body.appendChild(script);
        });

        return this.particlesScriptPromise;
    }

    initParticles() {
        if (this.activeBackgroundEffect !== 'particles') {
            return;
        }

        if (!window.particlesJS || !this.particlesContainer) {
            return;
        }

        if (window.pJSDom && window.pJSDom.length) {
            window.pJSDom.forEach(instance => {
                if (instance && instance.pJS && instance.pJS.fn && instance.pJS.fn.vendors) {
                    instance.pJS.fn.vendors.destroypJS();
                }
            });
            window.pJSDom = [];
        }

        this.particlesContainer.innerHTML = '';

        window.particlesJS('particlesContainer', {
            particles: {
                number: { value: 45, density: { enable: true, value_area: 800 } },
                color: { value: ['#00c8ff', '#ff0078', '#8a2be2'] },
                shape: { type: 'circle' },
                opacity: { value: 0.4, random: true },
                size: { value: 3, random: true },
                line_linked: { enable: false },
                move: {
                    enable: true,
                    speed: 1.2,
                    direction: 'none',
                    random: true,
                    straight: false,
                    out_mode: 'out'
                }
            },
            interactivity: {
                detect_on: 'canvas',
                events: {
                    onhover: { enable: false },
                    onclick: { enable: false },
                    resize: true
                }
            },
            retina_detect: true
        });

        this.particlesActive = true;
    }

    destroyParticles() {
        if (window.pJSDom && window.pJSDom.length) {
            window.pJSDom.forEach(instance => {
                if (instance && instance.pJS && instance.pJS.fn && instance.pJS.fn.vendors) {
                    instance.pJS.fn.vendors.destroypJS();
                }
            });
            window.pJSDom = [];
        }

        if (this.particlesContainer) {
            this.particlesContainer.innerHTML = '';
        }

        this.particlesActive = false;
    }

    handlePerformanceGovernance() {
        const shouldSuppress = this.performance.shouldSuppressEffects();
        if (shouldSuppress !== this.performanceSuppressedEffects) {
            this.performanceSuppressedEffects = shouldSuppress;
            this.updateBackgroundEffect();
        }
    }

    clearCanvas() {
        this.echoManager.clear();
        this.strokeManager.clear();
        this.renderer.clear();
    }
}

// Stroke Manager Class
class StrokeManager {
    constructor() {
        this.currentStroke = null;
        this.lastPoint = null;
    }
    
    beginStroke(color, width, alpha) {
        this.currentStroke = {
            color: color,
            width: width,
            alpha: alpha,
            points: [],
            startTime: performance.now()
        };
        this.lastPoint = null;
    }
    
    addPoint(point) {
        if (!this.currentStroke) return;
        
        // Distance-based point thinning
        if (this.lastPoint) {
            const dx = point.x - this.lastPoint.x;
            const dy = point.y - this.lastPoint.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 2) return; // Skip points too close together
        }
        
        // Apply pressure sensitivity to width
        const pressureWidth = this.currentStroke.width * (0.5 + point.pressure * 0.5);
        const enhancedPoint = { ...point, width: pressureWidth };
        
        this.currentStroke.points.push(enhancedPoint);
        this.lastPoint = point;
    }
    
    endStroke() {
        this.lastPoint = null;
    }
    
    getCurrentPath() {
        return this.currentStroke;
    }
    
    clear() {
        this.currentStroke = null;
        this.lastPoint = null;
    }
}

// Echo Manager Class
class EchoManager {
    constructor(maxEchoes = 80) {
        this.echoes = [];
        this.maxEchoes = maxEchoes;
    }

    setMaxEchoes(max) {
        this.maxEchoes = max;
    }
    
    snapshot(stroke) {
        if (!stroke || stroke.points.length === 0) return;
        
        // Deep copy the stroke
        const echo = {
            color: stroke.color,
            width: stroke.width,
            alpha: stroke.alpha,
            points: [...stroke.points],
            timestamp: performance.now()
        };
        
        this.echoes.unshift(echo);
        
        // Limit echo count
        while (this.echoes.length > this.maxEchoes) {
            this.echoes.pop();
        }
    }
    
    getRenderPlan() {
        return this.echoes.map((echo, index) => ({
            echo: echo,
            k: index
        })).reverse(); // Render from oldest to newest
    }
    
    cullOffscreen(canvasWidth, canvasHeight, settings = {}) {
        this.echoes = this.echoes.filter((echo, k) => {
            const shiftX = settings.shiftX ?? 0;
            const shiftY = settings.shiftY ?? 0;
            const modeX = settings.shiftXMode;
            const modeY = settings.shiftYMode;
            const ampX = settings.shiftXOscAmplitude ?? 0;
            const ampY = settings.shiftYOscAmplitude ?? 0;

            const baseShiftX = modeX === 'off' ? 0 : Math.abs(k * shiftX);
            const baseShiftY = modeY === 'off' ? 0 : Math.abs(k * shiftY);
            const extraShiftX = modeX === 'oscillate' ? Math.abs(ampX) : 0;
            const extraShiftY = modeY === 'oscillate' ? Math.abs(ampY) : 0;

            const maxShift = Math.max(baseShiftX + extraShiftX, baseShiftY + extraShiftY);
            return maxShift < Math.max(canvasWidth, canvasHeight) * 2;
        });
    }
    
    clear() {
        this.echoes = [];
    }
}

// Canvas 2D Renderer Class
class Canvas2DRenderer {
    constructor() {
        this.ctx = null;
        this.width = 0;
        this.height = 0;
    }
    
    setContext(ctx) {
        this.ctx = ctx;
    }
    
    setDimensions(width, height) {
        this.width = width;
        this.height = height;
    }
    
    clear() {
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.width, this.height);
    }
    
    drawStroke(stroke) {
        if (!stroke || stroke.points.length === 0) return;
        
        this.ctx.save();
        this.ctx.strokeStyle = stroke.color;
        this.ctx.lineWidth = stroke.width;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.globalAlpha = stroke.alpha;
        
        if (stroke.points.length === 1) {
            // Single point - draw a circle
            const point = stroke.points[0];
            this.ctx.beginPath();
            this.ctx.arc(point.x, point.y, stroke.width / 2, 0, Math.PI * 2);
            this.ctx.fillStyle = stroke.color;
            this.ctx.fill();
        } else {
            // Multiple points - draw smooth line
            this.ctx.beginPath();
            this.ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
            
            for (let i = 1; i < stroke.points.length; i++) {
                const point = stroke.points[i];
                this.ctx.lineTo(point.x, point.y);
            }
            
            this.ctx.stroke();
        }
        
        this.ctx.restore();
    }
    
    drawEcho(echo, k, transform, settings) {
        if (!echo || echo.points.length === 0) return;

        this.ctx.save();

        // Apply transforms
        this.ctx.translate(transform.dx, transform.dy);
        this.ctx.scale(transform.scale, transform.scale);
        this.ctx.globalAlpha = echo.alpha * transform.alpha;

        // Apply blur if enabled
        if (transform.blur > 0) {
            this.ctx.shadowBlur = transform.blur;
            this.ctx.shadowColor = echo.color;
        }

        // Apply color effects
        const echoColor = this.applyColorEffect(echo.color, k, settings);

        this.ctx.strokeStyle = echoColor;
        this.ctx.lineWidth = echo.width;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        
        if (echo.points.length === 1) {
            // Single point
            const point = echo.points[0];
            this.ctx.beginPath();
            this.ctx.arc(point.x, point.y, echo.width / 2, 0, Math.PI * 2);
            this.ctx.fillStyle = echoColor;
            this.ctx.fill();
        } else {
            // Multiple points
            this.ctx.beginPath();
            this.ctx.moveTo(echo.points[0].x, echo.points[0].y);
            
            for (let i = 1; i < echo.points.length; i++) {
                const point = echo.points[i];
                this.ctx.lineTo(point.x, point.y);
            }
            
            this.ctx.stroke();
        }
        
        this.ctx.restore();
    }

    applyColorEffect(color, k, settings) {
        switch (settings.colorMode) {
            case 'gradient':
                const t = Math.min(1, k / settings.echoCountMax);
                return this.interpolateColor(color, settings.gradientEndColor, t);
            case 'rainbow':
                return this.shiftHue(color, k * settings.hueShift);
            default:
                if (settings.colorDecay !== 'off') {
                    return this.applyColorDecay(color, k, settings.colorDecay);
                }
                return color;
        }
    }

    applyColorDecay(color, k, intensity) {
        // Convert hex to RGB
        const r = parseInt(color.substr(1, 2), 16);
        const g = parseInt(color.substr(3, 2), 16);
        const b = parseInt(color.substr(5, 2), 16);
        
        // Apply decay based on intensity
        const decayFactor = intensity === 'strong' ? 0.15 : 0.08;
        const decay = 1 - (k * decayFactor);
        
        const newR = Math.max(0, Math.round(r * decay));
        const newG = Math.max(0, Math.round(g * decay));
        const newB = Math.max(0, Math.round(b * decay));
        
        return `rgb(${newR}, ${newG}, ${newB})`;
    }

    interpolateColor(startColor, endColor, t) {
        const sr = parseInt(startColor.substr(1, 2), 16);
        const sg = parseInt(startColor.substr(3, 2), 16);
        const sb = parseInt(startColor.substr(5, 2), 16);
        const er = parseInt(endColor.substr(1, 2), 16);
        const eg = parseInt(endColor.substr(3, 2), 16);
        const eb = parseInt(endColor.substr(5, 2), 16);
        const r = Math.round(sr + (er - sr) * t);
        const g = Math.round(sg + (eg - sg) * t);
        const b = Math.round(sb + (eb - sb) * t);
        return `rgb(${r}, ${g}, ${b})`;
    }

    shiftHue(color, amount) {
        const { h, s, l } = this.hexToHsl(color);
        const newH = (h + amount) % 360;
        const { r, g, b } = this.hslToRgb(newH, s, l);
        return `rgb(${r}, ${g}, ${b})`;
    }

    hexToHsl(hex) {
        let r = parseInt(hex.substr(1, 2), 16) / 255;
        let g = parseInt(hex.substr(3, 2), 16) / 255;
        let b = parseInt(hex.substr(5, 2), 16) / 255;
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h *= 60;
        }
        return { h, s: s * 100, l: l * 100 };
    }

    hslToRgb(h, s, l) {
        s /= 100;
        l /= 100;
        const c = (1 - Math.abs(2 * l - 1)) * s;
        const x = c * (1 - Math.abs((h / 60) % 2 - 1));
        const m = l - c / 2;
        let r1, g1, b1;
        if (h < 60) { r1 = c; g1 = x; b1 = 0; }
        else if (h < 120) { r1 = x; g1 = c; b1 = 0; }
        else if (h < 180) { r1 = 0; g1 = c; b1 = x; }
        else if (h < 240) { r1 = 0; g1 = x; b1 = c; }
        else if (h < 300) { r1 = x; g1 = 0; b1 = c; }
        else { r1 = c; g1 = 0; b1 = x; }
        const r = Math.round((r1 + m) * 255);
        const g = Math.round((g1 + m) * 255);
        const b = Math.round((b1 + m) * 255);
        return { r, g, b };
    }
}

// Performance Manager Class
class PerformanceManager {
    constructor() {
        this.frameTimes = [];
        this.maxSamples = 60;
        this.targetFPS = 60;
        this.minFPS = 30;
        this.currentFPS = 60;
        this.status = 'optimal';
        this.degradationLevel = 0;
        this.lowPerformanceTime = 0;
        this.effectsSuppressed = false;
    }
    
    update(deltaTime) {
        this.frameTimes.push(deltaTime);
        
        if (this.frameTimes.length > this.maxSamples) {
            this.frameTimes.shift();
        }
        
        // Calculate average FPS
        const avgFrameTime = this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length;
        this.currentFPS = 1000 / avgFrameTime;
        
        // Update status
        this.updateStatus();
    }
    
    updateStatus() {
        if (this.currentFPS >= 50) {
            this.status = 'optimal';
            this.lowPerformanceTime = 0;
        } else if (this.currentFPS >= 35) {
            this.status = 'degraded';
            this.lowPerformanceTime += 16; // Assume 60fps timing
        } else {
            this.status = 'minimal';
            this.lowPerformanceTime += 16;
        }
    }
    
    applyGovernor(settings) {
        // Auto-adjust settings based on performance
        if (this.currentFPS < 45 && this.lowPerformanceTime > 2000) {
            if (this.degradationLevel === 0) {
                settings.blurPerEcho = 0; // Disable blur
                this.degradationLevel = 1;
            }
        }

        if (this.currentFPS < 40 && this.lowPerformanceTime > 3000) {
            if (this.degradationLevel === 1) {
                settings.echoCountMax = Math.max(10, settings.echoCountMax - 8);
                this.degradationLevel = 2;
            }
        }

        if (this.currentFPS < 30 && this.lowPerformanceTime > 5000) {
            if (this.degradationLevel === 2) {
                settings.echoCountMax = Math.max(8, settings.echoCountMax - 4);
                this.degradationLevel = 3;
            }
        }

        this.effectsSuppressed = this.status !== 'optimal';
    }
    
    getCurrentFPS() {
        return this.currentFPS;
    }
    
    getStatus() {
        return this.status;
    }

    shouldSuppressEffects() {
        return this.effectsSuppressed;
    }
}

function computeShiftAxis(mode, base, amplitude = 0, frequency = 0, time = 0, index = 0) {
    const numericBase = Number(base) || 0;
    const numericAmplitude = Number(amplitude) || 0;
    const numericFrequency = Number(frequency) || 0;
    const numericTime = Number(time) || 0;
    const numericIndex = Number(index) || 0;

    switch (mode) {
        case 'off':
            return 0;
        case 'oscillate': {
            const omega = numericFrequency * Math.PI * 2;
            const phase = omega * (numericTime / 1000) + numericIndex * 0.5;
            return numericBase + numericAmplitude * Math.sin(phase);
        }
        case 'static':
        default:
            return numericBase;
    }
}

if (typeof window !== 'undefined') {
    window.computeShiftAxis = computeShiftAxis;
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new EchoDrawingApp();
});
