// Infinite Digital Harmonograph Generator with Advanced Time Controls - Fixed Version

class InfiniteHarmonographGenerator {
    constructor() {
        this.canvas = document.getElementById('harmonographCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.timelineCanvas = document.getElementById('timelineCanvas');
        this.timelineCtx = this.timelineCanvas.getContext('2d');
        this.appContainer = document.querySelector('.app-container');

        // Animation state
        this.isAnimating = false;
        this.animationId = null;
        this.currentTime = 0;
        this.globalSpeed = 1.0;
        this.maxRecordedTime = 0;
        this.startTime = Date.now();
        this.lastRenderedTime = 0;
        this.forceFullRedraw = true;

        // Drawing modes
        this.drawingMode = 'infinite';
        this.loopStart = null;
        this.loopEnd = null;
        this.panelsHidden = false;
        
        // Canvas properties
        this.resizeCanvas();
        
        // History management
        this.drawingHistory = new Map();
        this.pathHistory = [];
        this.frameInterval = 0.1;
        this.maxHistoryTime = 3600; // 1 hour maximum
        
        // Mathematical parameters
        this.params = {
            f1: 3.0, f2: 1.0, f3: 2.0, f4: 1.0,
            A1: 150, A2: 100, B1: 150, B2: 100,
            p1: 0, p2: 1.57, p3: 0, p4: 0,
            d1: 0.02, d2: 0.015, d3: 0.02, d4: 0.015
        };
        
        // Rendering settings
        this.rendering = {
            mode: 'solid',
            lineWidth: 2,
            sprayRadius: 8,
            density: 0.3
        };
        
        // Color animation settings
        this.colorAnimation = {
            background: {
                hue: { base: 200, amplitude: 60, frequency: 0.3, wave: 'sine', phase: 0 },
                saturation: { base: 40, amplitude: 20, frequency: 0.2, wave: 'triangle', phase: 0 },
                lightness: { base: 10, amplitude: 5, frequency: 0.1, wave: 'sine', phase: 0 }
            },
            foreground: {
                hue: { base: 180, amplitude: 80, frequency: 0.25, wave: 'sine', phase: 1.57 },
                saturation: { base: 80, amplitude: 15, frequency: 0.4, wave: 'sine', phase: 0 },
                lightness: { base: 70, amplitude: 20, frequency: 0.3, wave: 'triangle', phase: 0 }
            }
        };
        
        // Bookmarks system
        this.bookmarks = [];
        
        // Drawing mode configurations
        this.modeConfigs = {
            finite: {
                name: '有限モード',
                description: '従来の減衰ありモード - パターン完成後に停止',
                useDecay: true,
                clearOnLoop: true,
                maxTime: 20
            },
            infinite: {
                name: '無限モード', 
                description: '減衰なし - ずっと描画し続けます',
                useDecay: false,
                clearOnLoop: false,
                maxTime: Infinity
            },
            cycle: {
                name: 'サイクルモード',
                description: 'パターンをサイクルで繰り返し、同じキャンバスに重ね合わせ',
                useDecay: true,
                clearOnLoop: false,
                maxTime: 20
            },
            accumulate: {
                name: '蓄積モード',
                description: '複数のサイクルが重なり合い複雑なレイヤーパターンを構築',
                useDecay: false,
                clearOnLoop: false,
                maxTime: 60
            },
            fade: {
                name: 'フェードモード',
                description: '古い線が徐々にフェードアウトしながら新しい線が現れる',
                useDecay: true,
                clearOnLoop: false,
                maxTime: 30
            }
        };
        
        // Color presets
        this.colorPresets = [
            {
                name: "永遠のローズ",
                description: "決して止まらない成長し続けるクラシックローズ",
                background: {
                    hue: {base: 200, amplitude: 60, frequency: 0.3, wave: "sine", phase: 0},
                    saturation: {base: 40, amplitude: 20, frequency: 0.2, wave: "triangle", phase: 0},
                    lightness: {base: 10, amplitude: 5, frequency: 0.1, wave: "sine", phase: 0}
                },
                foreground: {
                    hue: {base: 180, amplitude: 80, frequency: 0.25, wave: "sine", phase: 1.57},
                    saturation: {base: 80, amplitude: 15, frequency: 0.4, wave: "sine", phase: 0},
                    lightness: {base: 70, amplitude: 20, frequency: 0.3, wave: "triangle", phase: 0}
                }
            },
            {
                name: "蓄積する銀河",
                description: "複数サイクルにわたってスパイラルパターンが構築される",
                background: {
                    hue: {base: 260, amplitude: 40, frequency: 0.15, wave: "sine", phase: 0},
                    saturation: {base: 30, amplitude: 15, frequency: 0.25, wave: "sine", phase: 0},
                    lightness: {base: 8, amplitude: 6, frequency: 0.2, wave: "triangle", phase: 0}
                },
                foreground: {
                    hue: {base: 240, amplitude: 120, frequency: 0.08, wave: "sine", phase: 0},
                    saturation: {base: 85, amplitude: 10, frequency: 0.3, wave: "sine", phase: 0},
                    lightness: {base: 65, amplitude: 25, frequency: 0.12, wave: "sine", phase: 3.14}
                }
            },
            {
                name: "フェードする夢",
                description: "線がフェードアウトし夢幻的な効果を生み出す",
                background: {
                    hue: {base: 320, amplitude: 80, frequency: 0.05, wave: "sine", phase: 0},
                    saturation: {base: 25, amplitude: 15, frequency: 0.12, wave: "sine", phase: 0},
                    lightness: {base: 15, amplitude: 10, frequency: 0.1, wave: "triangle", phase: 0}
                },
                foreground: {
                    hue: {base: 300, amplitude: 100, frequency: 0.06, wave: "sine", phase: 4.71},
                    saturation: {base: 70, amplitude: 20, frequency: 0.09, wave: "sine", phase: 0},
                    lightness: {base: 75, amplitude: 15, frequency: 0.07, wave: "sine", phase: 0}
                }
            }
        ];
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.generateColorPresets();
        this.updateAllControls();
        this.updateModeInfo();
        this.updateTimelineMarkers();
        this.updatePanelVisibility();
        this.startAnimation();
        
        // Set first preset as active and load it
        const firstPreset = document.querySelector('.color-preset-item');
        if (firstPreset) {
            firstPreset.classList.add('active');
            this.loadColorPreset(this.colorPresets[0]);
        }
        
        // Add infinite indicator to canvas
        this.canvas.classList.add('infinite-indicator');
        
        // Initialize bookmarks display
        this.updateBookmarksList();
    }
    
    resizeCanvas() {
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
        this.centerX = this.canvas.width / 2;
        this.centerY = this.canvas.height / 2;
        
        // Also resize timeline canvas
        const timelineRect = this.timelineCanvas.getBoundingClientRect();
        this.timelineCanvas.width = timelineRect.width;
    }
    
    setupEventListeners() {
        // Window resize
        window.addEventListener('resize', () => {
            this.resizeCanvas();
        });
        
        // Drum picker controls
        this.setupDrumPickers();
        
        // Speed control
        const speedSelect = document.getElementById('speedSelect');
        speedSelect.addEventListener('change', (e) => {
            this.globalSpeed = parseFloat(e.target.value);
        });
        
        // Drawing mode control
        const modeSelect = document.getElementById('drawingMode');
        modeSelect.addEventListener('change', (e) => {
            this.drawingMode = e.target.value;
            this.updateModeInfo();
            this.toggleDecayControls();
            this.updateTimelineMarkers();
            this.resetDrawingState();
            if (this.drawingMode === 'finite' || this.drawingMode === 'cycle') {
                this.clearCanvas();
                this.currentTime = 0;
            }
        });

        const togglePanelsBtn = document.getElementById('togglePanels');
        if (togglePanelsBtn) {
            togglePanelsBtn.addEventListener('click', () => {
                this.panelsHidden = !this.panelsHidden;
                this.updatePanelVisibility();
            });
        }
        
        // Playback controls
        document.getElementById('playPause').addEventListener('click', () => {
            this.toggleAnimation();
        });
        
        document.getElementById('rewind').addEventListener('click', () => {
            this.rewind();
        });
        
        document.getElementById('fastForward').addEventListener('click', () => {
            this.fastForward();
        });
        
        // Control buttons
        document.getElementById('randomize').addEventListener('click', () => {
            this.randomizeParameters();
        });
        
        document.getElementById('clear').addEventListener('click', () => {
            this.clearCanvas();
        });
        
        document.getElementById('bookmark').addEventListener('click', () => {
            this.addBookmark();
        });
        
        // HSL Controls
        this.setupHSLControls();
        
        // Timeline scrubber with better handling
        const timeScrubber = document.getElementById('timeScrubber');
        let isScrubbingSlider = false;
        
        timeScrubber.addEventListener('mousedown', () => {
            isScrubbingSlider = true;
        });
        
        timeScrubber.addEventListener('mouseup', () => {
            isScrubbingSlider = false;
        });
        
        timeScrubber.addEventListener('input', (e) => {
            if (isScrubbingSlider) {
                this.scrubToTime(e.target.value);
            }
        });
        
        // Timeline loop controls
        document.getElementById('setLoopStart').addEventListener('click', () => {
            this.setLoopStart();
        });
        
        document.getElementById('setLoopEnd').addEventListener('click', () => {
            this.setLoopEnd();
        });
        
        document.getElementById('clearLoop').addEventListener('click', () => {
            this.clearLoop();
        });
        
        // Export buttons
        document.getElementById('exportPNG').addEventListener('click', () => {
            this.exportPNG();
        });
        
        document.getElementById('exportRange').addEventListener('click', () => {
            this.exportTimeRange();
        });
    }
    
    setupDrumPickers() {
        document.querySelectorAll('.drum-picker').forEach(picker => {
            const param = picker.dataset.param;
            const min = parseFloat(picker.dataset.min);
            const max = parseFloat(picker.dataset.max);
            const step = parseFloat(picker.dataset.step);
            let currentStep = step;
            
            const downBtn = picker.querySelector('.drum-down');
            const upBtn = picker.querySelector('.drum-up');
            const display = picker.querySelector('.drum-display');
            const stepButtons = picker.parentElement.querySelectorAll('.step-btn');
            
            // Step selector
            stepButtons.forEach(btn => {
                btn.addEventListener('click', () => {
                    stepButtons.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    currentStep = parseFloat(btn.dataset.step);
                });
            });
            
            // Simple click handlers (no long press for better performance)
            downBtn.addEventListener('click', () => {
                this.adjustParameter(param, -1, currentStep, min, max, display);
            });
            
            upBtn.addEventListener('click', () => {
                this.adjustParameter(param, 1, currentStep, min, max, display);
            });
        });
    }
    
    adjustParameter(param, direction, step, min, max, display) {
        let newValue = this.params[param] + (direction * step);
        newValue = Math.max(min, Math.min(max, newValue));
        newValue = Math.round(newValue * 1000) / 1000;
        
        this.params[param] = newValue;
        display.textContent = newValue.toFixed(param.startsWith('d') ? 3 : 1);
    }
    
    setupHSLControls() {
        document.querySelectorAll('.wave-selector').forEach(select => {
            select.addEventListener('change', (e) => {
                const target = e.target.dataset.target;
                const component = e.target.dataset.component;
                this.colorAnimation[target][component].wave = e.target.value;
            });
        });
        
        document.querySelectorAll('.hsl-slider').forEach(slider => {
            const valueSpan = slider.nextElementSibling;
            
            slider.addEventListener('input', (e) => {
                const target = e.target.dataset.target;
                const component = e.target.dataset.component;
                const property = e.target.dataset.property;
                const value = parseFloat(e.target.value);
                
                this.colorAnimation[target][component][property] = value;
                valueSpan.textContent = value.toFixed(1);
            });
        });
    }
    
    generateColorPresets() {
        const grid = document.getElementById('colorPresetGrid');
        if (!grid) return;
        
        grid.innerHTML = '';
        
        this.colorPresets.forEach((preset, index) => {
            const item = document.createElement('div');
            item.className = 'color-preset-item';
            item.innerHTML = `
                <h5>${preset.name}</h5>
                <p>${preset.description}</p>
            `;
            
            item.addEventListener('click', () => {
                document.querySelectorAll('.color-preset-item').forEach(el => 
                    el.classList.remove('active')
                );
                item.classList.add('active');
                this.loadColorPreset(preset);
            });
            
            grid.appendChild(item);
        });
    }
    
    loadColorPreset(preset) {
        this.colorAnimation.background = JSON.parse(JSON.stringify(preset.background));
        this.colorAnimation.foreground = JSON.parse(JSON.stringify(preset.foreground));
        this.updateColorControls();
    }
    
    updateColorControls() {
        ['background', 'foreground'].forEach(target => {
            const shortTarget = target === 'background' ? 'bg' : 'fg';
            
            ['hue', 'saturation', 'lightness'].forEach(component => {
                const settings = this.colorAnimation[target][component];
                
                const waveSelect = document.querySelector(
                    `.wave-selector[data-target="${shortTarget}"][data-component="${component}"]`
                );
                if (waveSelect) {
                    waveSelect.value = settings.wave;
                }
                
                const freqSlider = document.querySelector(
                    `.hsl-slider[data-target="${shortTarget}"][data-component="${component}"][data-property="frequency"]`
                );
                if (freqSlider) {
                    freqSlider.value = settings.frequency;
                    const valueSpan = freqSlider.nextElementSibling;
                    if (valueSpan) {
                        valueSpan.textContent = settings.frequency.toFixed(1);
                    }
                }
            });
        });
    }
    
    updateModeInfo() {
        const modeInfo = document.getElementById('modeInfo');
        if (!modeInfo) return;

        const config = this.modeConfigs[this.drawingMode];
        
        modeInfo.innerHTML = `
            <h4>${config.name}</h4>
            <p>${config.description}</p>
        `;
        
        // Update canvas visual indicator
        this.canvas.classList.remove('infinite-indicator');
        if (this.drawingMode === 'infinite' || this.drawingMode === 'accumulate') {
            this.canvas.classList.add('infinite-indicator');
        }
    }

    updatePanelVisibility() {
        if (this.appContainer) {
            this.appContainer.classList.toggle('panels-hidden', this.panelsHidden);
        }

        const togglePanelsBtn = document.getElementById('togglePanels');
        if (togglePanelsBtn) {
            togglePanelsBtn.textContent = this.panelsHidden ? '📐 パネルを表示' : '📐 パネルを隠す';
            togglePanelsBtn.setAttribute('aria-expanded', (!this.panelsHidden).toString());
        }
    }
    
    toggleDecayControls() {
        const decayGroup = document.getElementById('decayGroup');
        if (!decayGroup) return;
        
        const config = this.modeConfigs[this.drawingMode];
        
        if (config.useDecay && this.drawingMode === 'finite') {
            decayGroup.style.display = 'block';
        } else {
            decayGroup.style.display = 'none';
        }
    }
    
    getWaveValue(waveType, t, frequency, amplitude, base, phase = 0) {
        const arg = frequency * t + phase;
        
        switch (waveType) {
            case 'sine':
                return base + amplitude * Math.sin(arg);
            case 'triangle':
                return base + amplitude * (2 / Math.PI * Math.asin(Math.sin(arg)));
            case 'sawtooth':
                return base + amplitude * (2 * (arg / (2 * Math.PI) - Math.floor(arg / (2 * Math.PI) + 0.5)));
            case 'square':
                return base + amplitude * Math.sign(Math.sin(arg));
            case 'noise':
                return base + amplitude * (
                    0.5 * Math.sin(arg) + 
                    0.3 * Math.sin(2.7 * arg) + 
                    0.2 * Math.sin(4.1 * arg)
                );
            default:
                return base;
        }
    }
    
    getAnimatedColor(target, t) {
        const settings = this.colorAnimation[target];
        
        const h = this.getWaveValue(
            settings.hue.wave, t, 
            settings.hue.frequency, 
            settings.hue.amplitude, 
            settings.hue.base, 
            settings.hue.phase
        ) % 360;
        
        const s = Math.max(0, Math.min(100, this.getWaveValue(
            settings.saturation.wave, t,
            settings.saturation.frequency,
            settings.saturation.amplitude,
            settings.saturation.base,
            settings.saturation.phase
        )));
        
        const l = Math.max(0, Math.min(100, this.getWaveValue(
            settings.lightness.wave, t,
            settings.lightness.frequency,
            settings.lightness.amplitude,
            settings.lightness.base,
            settings.lightness.phase
        )));
        
        return `hsl(${h}, ${s}%, ${l}%)`;
    }
    
    calculatePoint(t, useDecay = null) {
        const { f1, f2, f3, f4, A1, A2, B1, B2, p1, p2, p3, p4, d1, d2, d3, d4 } = this.params;
        const config = this.modeConfigs[this.drawingMode];
        
        // Determine if we should use decay
        const shouldUseDecay = useDecay !== null ? useDecay : config.useDecay;
        
        // For cycle mode, use modulo to repeat the pattern
        let calcTime = t;
        if (this.drawingMode === 'cycle' && config.maxTime !== Infinity) {
            calcTime = t % config.maxTime;
        }
        
        const decay1 = shouldUseDecay ? Math.exp(-d1 * calcTime) : 1;
        const decay2 = shouldUseDecay ? Math.exp(-d2 * calcTime) : 1;
        const decay3 = shouldUseDecay ? Math.exp(-d3 * calcTime) : 1;
        const decay4 = shouldUseDecay ? Math.exp(-d4 * calcTime) : 1;
        
        const x = A1 * Math.sin(f1 * calcTime + p1) * decay1 +
                  A2 * Math.sin(f2 * calcTime + p2) * decay2;
        
        const y = B1 * Math.sin(f3 * calcTime + p3) * decay3 +
                  B2 * Math.sin(f4 * calcTime + p4) * decay4;

        return { x: x + this.centerX, y: y + this.centerY, t: t };
    }

    resetDrawingState() {
        this.lastRenderedTime = 0;
        this.forceFullRedraw = true;
    }

    shouldFullRedraw() {
        const goingBackwards = this.currentTime < this.lastRenderedTime;
        const jumpedForward = this.currentTime - this.lastRenderedTime > 1;
        return this.forceFullRedraw || !this.isAnimating || goingBackwards || jumpedForward;
    }
    
    renderFrame() {
        const config = this.modeConfigs[this.drawingMode];
        
        // Handle different drawing modes
        if (this.drawingMode === 'fade') {
            this.renderFadeMode();
        } else {
            this.renderNormalMode();
        }
        
        // Store frame in history for scrubbing
        this.storeFrameInHistory();
        
        // Update time displays
        this.updateTimeDisplays();
        
        // Show render status briefly
        const status = document.getElementById('renderStatus');
        if (status) {
            status.classList.add('active');
            setTimeout(() => status.classList.remove('active'), 100);
        }
    }
    
    renderNormalMode() {
        const bgColor = this.getAnimatedColor('background', this.currentTime);
        const fgColor = this.getAnimatedColor('foreground', this.currentTime);

        // Set animated background
        this.canvas.style.background = bgColor;

        const needsFullRedraw = this.shouldFullRedraw();

        if (needsFullRedraw) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.drawHarmonographPath(fgColor, 0, this.currentTime);
        } else {
            this.drawHarmonographPath(fgColor, this.lastRenderedTime, this.currentTime);
        }

        this.lastRenderedTime = this.currentTime;
        this.forceFullRedraw = false;
    }
    
    renderFadeMode() {
        const bgColor = this.getAnimatedColor('background', this.currentTime);

        // Set background
        this.canvas.style.background = bgColor;

        // Apply fade effect by drawing semi-transparent background
        this.ctx.fillStyle = bgColor + '05'; // Very low opacity
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw current segment
        const fgColor = this.getAnimatedColor('foreground', this.currentTime);
        const segmentStart = Math.max(this.lastRenderedTime, this.currentTime - 0.5);
        this.drawCurrentSegment(fgColor, segmentStart);

        this.lastRenderedTime = this.currentTime;
        this.forceFullRedraw = false;
    }
    
    drawHarmonographPath(color, startTime = 0, endTime = this.currentTime) {
        const timeStep = 0.02;
        if (endTime <= startTime) return;
        const path = [];

        // Generate path points up to target time
        for (let t = startTime; t <= endTime; t += timeStep) {
            path.push(this.calculatePoint(t));
        }
        
        if (path.length < 2) return;
        
        this.ctx.save();
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = this.rendering.lineWidth;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        
        this.ctx.beginPath();
        this.ctx.moveTo(path[0].x, path[0].y);
        
        for (let i = 1; i < path.length; i++) {
            this.ctx.lineTo(path[i].x, path[i].y);
        }
        
        this.ctx.stroke();
        this.ctx.restore();
    }
    
    drawCurrentSegment(color, startTime) {
        const timeStep = 0.02;
        const segmentLength = 0.5; // Draw last 0.5 seconds
        const safeStart = Math.max(0, startTime ?? this.currentTime - segmentLength);

        const path = [];
        for (let t = safeStart; t <= this.currentTime; t += timeStep) {
            path.push(this.calculatePoint(t));
        }
        
        if (path.length < 2) return;
        
        this.ctx.save();
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = this.rendering.lineWidth;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        
        this.ctx.beginPath();
        this.ctx.moveTo(path[0].x, path[0].y);
        
        for (let i = 1; i < path.length; i++) {
            this.ctx.lineTo(path[i].x, path[i].y);
        }
        
        this.ctx.stroke();
        this.ctx.restore();
    }
    
    storeFrameInHistory() {
        // Store frame data at regular intervals for smooth scrubbing
        const frameKey = Math.floor(this.currentTime / this.frameInterval) * this.frameInterval;
        
        if (!this.drawingHistory.has(frameKey)) {
            this.drawingHistory.set(frameKey, {
                time: frameKey,
                params: { ...this.params },
                mode: this.drawingMode,
                colors: {
                    bg: this.getAnimatedColor('background', frameKey),
                    fg: this.getAnimatedColor('foreground', frameKey)
                }
            });
        }
        
        // Update max recorded time
        this.maxRecordedTime = Math.max(this.maxRecordedTime, this.currentTime);
    }
    
    updateTimeDisplays() {
        const currentMinutes = Math.floor(this.currentTime / 60);
        const currentSeconds = Math.floor(this.currentTime % 60);
        const timeString = `${currentMinutes.toString().padStart(2, '0')}:${currentSeconds.toString().padStart(2, '0')}`;
        
        const timeDisplay = document.getElementById('timeDisplay');
        const currentTimeLabel = document.getElementById('currentTimeLabel');
        const totalTimeLabel = document.getElementById('totalTimeLabel');
        
        if (timeDisplay) timeDisplay.textContent = `時間: ${timeString}`;
        if (currentTimeLabel) currentTimeLabel.textContent = `現在時間: ${timeString}`;
        
        const config = this.modeConfigs[this.drawingMode];
        if (config.maxTime === Infinity) {
            if (totalTimeLabel) totalTimeLabel.textContent = '総時間: ∞';
        } else {
            const totalMinutes = Math.floor(config.maxTime / 60);
            const totalSeconds = Math.floor(config.maxTime % 60);
            const totalString = `${totalMinutes.toString().padStart(2, '0')}:${totalSeconds.toString().padStart(2, '0')}`;
            if (totalTimeLabel) totalTimeLabel.textContent = `総時間: ${totalString}`;
        }
    }
    
    getEffectiveMaxTime() {
        const config = this.modeConfigs[this.drawingMode];
        if (config.maxTime === Infinity) {
            return Math.max(this.maxRecordedTime, 120); // At least 2 minutes for infinite modes
        }
        return config.maxTime;
    }
    
    scrubToTime(sliderValue) {
        const progress = parseFloat(sliderValue) / 1000; // Slider is 0-1000
        const maxTime = this.getEffectiveMaxTime();
        
        this.currentTime = progress * maxTime;
        
        // Re-render frame at scrubbed time
        if (!this.isAnimating) {
            this.renderFrame();
        }
        
        this.updateTimelinePreview();
    }
    
    updateTimelineMarkers() {
        const markersContainer = document.getElementById('timelineMarkers');
        if (!markersContainer) return;
        
        markersContainer.innerHTML = '';
        
        const maxTime = this.getEffectiveMaxTime();
        
        // Create 5 time markers
        for (let i = 0; i <= 4; i++) {
            const time = (i / 4) * maxTime;
            const minutes = Math.floor(time / 60);
            const seconds = Math.floor(time % 60);
            const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            
            const marker = document.createElement('span');
            marker.textContent = timeString;
            markersContainer.appendChild(marker);
        }
    }
    
    updateTimelinePreview() {
        if (!this.timelineCtx) return;
        
        const ctx = this.timelineCtx;
        const width = this.timelineCanvas.width;
        const height = this.timelineCanvas.height;
        
        ctx.clearRect(0, 0, width, height);
        
        const maxTime = this.getEffectiveMaxTime();
        
        // Draw color timeline
        const steps = Math.min(width, 200); // Optimize for performance
        
        for (let i = 0; i < steps; i++) {
            const t = (i / steps) * maxTime;
            const bgColor = this.getAnimatedColor('background', t);
            const fgColor = this.getAnimatedColor('foreground', t);
            
            const x = (i / steps) * width;
            const barWidth = Math.ceil(width / steps);
            
            // Background strip
            ctx.fillStyle = bgColor;
            ctx.fillRect(x, 0, barWidth, height / 2);
            
            // Foreground strip
            ctx.fillStyle = fgColor;
            ctx.fillRect(x, height / 2, barWidth, height / 2);
        }
        
        // Draw current time indicator with better visibility
        const currentX = Math.min(width - 1, (this.currentTime / maxTime) * width);
        
        // White line with black outline for visibility
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#000';
        ctx.beginPath();
        ctx.moveTo(currentX, 0);
        ctx.lineTo(currentX, height);
        ctx.stroke();
        
        ctx.lineWidth = 1;
        ctx.strokeStyle = '#fff';
        ctx.beginPath();
        ctx.moveTo(currentX, 0);
        ctx.lineTo(currentX, height);
        ctx.stroke();
        
        // Draw loop indicators if set
        this.drawLoopIndicators(ctx, width, height, maxTime);
        
        // Update timeline slider position
        const progress = Math.min(1000, (this.currentTime / maxTime) * 1000);
        const slider = document.getElementById('timeScrubber');
        if (slider && !slider.matches(':active')) {
            slider.value = progress;
        }
    }
    
    drawLoopIndicators(ctx, width, height, maxTime) {
        if (this.loopStart !== null) {
            const startX = (this.loopStart / maxTime) * width;
            ctx.fillStyle = 'rgba(0, 255, 0, 0.7)';
            ctx.fillRect(startX - 2, 0, 4, height);
            
            // Add text label
            ctx.fillStyle = '#fff';
            ctx.font = '10px Arial';
            ctx.fillText('START', startX - 15, height - 5);
        }
        
        if (this.loopEnd !== null) {
            const endX = (this.loopEnd / maxTime) * width;
            ctx.fillStyle = 'rgba(255, 0, 0, 0.7)';
            ctx.fillRect(endX - 2, 0, 4, height);
            
            // Add text label
            ctx.fillStyle = '#fff';
            ctx.font = '10px Arial';
            ctx.fillText('END', endX - 10, height - 5);
        }
        
        if (this.loopStart !== null && this.loopEnd !== null) {
            const startX = (this.loopStart / maxTime) * width;
            const endX = (this.loopEnd / maxTime) * width;
            ctx.fillStyle = 'rgba(0, 255, 0, 0.2)';
            ctx.fillRect(startX, 0, endX - startX, height);
        }
    }
    
    toggleAnimation() {
        const button = document.getElementById('playPause');
        if (!button) return;
        
        if (this.isAnimating) {
            this.stopAnimation();
            button.textContent = '▶️ 再生';
        } else {
            this.startAnimation();
            button.textContent = '⏸️ 停止';
        }
    }
    
    startAnimation() {
        this.isAnimating = true;
        this.animate();
    }
    
    stopAnimation() {
        this.isAnimating = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
    
    animate() {
        if (!this.isAnimating) return;
        
        this.renderFrame();
        this.updateTimelinePreview();
        
        // Advance time
        this.currentTime += 0.02 * this.globalSpeed;
        
        // Handle different loop behaviors
        const config = this.modeConfigs[this.drawingMode];
        
        // Check for loop points first
        if (this.loopStart !== null && this.loopEnd !== null) {
            if (this.currentTime >= this.loopEnd) {
                this.currentTime = this.loopStart;
                if (config.clearOnLoop) {
                    this.clearCanvas();
                }
            }
        } else if (config.maxTime !== Infinity && this.currentTime >= config.maxTime) {
            if (this.drawingMode === 'cycle') {
                this.currentTime = 0; // Restart cycle
            } else if (this.drawingMode === 'finite') {
                this.stopAnimation(); // Stop at end
                return;
            }
        }
        
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    rewind() {
        this.currentTime = Math.max(0, this.currentTime - 5); // Rewind 5 seconds
        if (!this.isAnimating) {
            this.renderFrame();
            this.updateTimelinePreview();
        }
    }
    
    fastForward() {
        const config = this.modeConfigs[this.drawingMode];
        if (config.maxTime === Infinity) {
            this.currentTime += 10; // Forward 10 seconds
        } else {
            this.currentTime = Math.min(config.maxTime, this.currentTime + 5); // Forward 5 seconds
        }
        
        if (!this.isAnimating) {
            this.renderFrame();
            this.updateTimelinePreview();
        }
    }
    
    setLoopStart() {
        this.loopStart = this.currentTime;
        this.updateTimelinePreview();
        alert(`ループ開始点を ${this.formatTime(this.currentTime)} に設定しました`);
    }
    
    setLoopEnd() {
        this.loopEnd = this.currentTime;
        this.updateTimelinePreview();
        alert(`ループ終了点を ${this.formatTime(this.currentTime)} に設定しました`);
    }
    
    clearLoop() {
        this.loopStart = null;
        this.loopEnd = null;
        this.updateTimelinePreview();
        alert('ループポイントをクリアしました');
    }
    
    formatTime(time) {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    addBookmark() {
        const bookmark = {
            time: this.currentTime,
            name: `ブックマーク ${this.bookmarks.length + 1}`,
            timestamp: new Date().toLocaleTimeString()
        };
        
        this.bookmarks.push(bookmark);
        this.updateBookmarksList();
        alert(`ブックマークを ${this.formatTime(this.currentTime)} に追加しました`);
    }
    
    updateBookmarksList() {
        const list = document.getElementById('bookmarkList');
        if (!list) return;
        
        list.innerHTML = '';
        
        if (this.bookmarks.length === 0) {
            list.innerHTML = '<p style="color: var(--color-text-secondary); font-size: var(--font-size-sm); text-align: center; padding: var(--space-16);">ブックマークなし</p>';
            return;
        }
        
        this.bookmarks.forEach((bookmark, index) => {
            const item = document.createElement('div');
            item.className = 'bookmark-item';
            
            const timeString = this.formatTime(bookmark.time);
            
            item.innerHTML = `
                <div>
                    <div class="bookmark-time">${timeString}</div>
                    <div style="font-size: var(--font-size-xs); color: var(--color-text-secondary);">${bookmark.timestamp}</div>
                </div>
                <button class="bookmark-delete">×</button>
            `;
            
            // Navigate to bookmark on click
            item.addEventListener('click', (e) => {
                if (!e.target.classList.contains('bookmark-delete')) {
                    this.currentTime = bookmark.time;
                    if (!this.isAnimating) {
                        this.renderFrame();
                        this.updateTimelinePreview();
                    }
                    // Visual feedback
                    item.style.background = 'var(--color-primary)';
                    item.style.color = 'var(--color-btn-primary-text)';
                    setTimeout(() => {
                        item.style.background = '';
                        item.style.color = '';
                    }, 500);
                }
            });
            
            // Delete bookmark
            item.querySelector('.bookmark-delete').addEventListener('click', (e) => {
                e.stopPropagation();
                this.bookmarks.splice(index, 1);
                this.updateBookmarksList();
            });
            
            list.appendChild(item);
        });
    }
    
    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.canvas.style.background = '';
        this.pathHistory = [];
        this.drawingHistory.clear();
        this.maxRecordedTime = 0;
        this.currentTime = 0;
        this.resetDrawingState();
        this.updateTimelinePreview();
    }
    
    randomizeParameters() {
        this.params.f1 = Math.random() * 8 + 1;
        this.params.f2 = Math.random() * 5 + 0.5;
        this.params.f3 = Math.random() * 8 + 1;
        this.params.f4 = Math.random() * 5 + 0.5;
        
        this.params.A1 = Math.random() * 200 + 50;
        this.params.A2 = Math.random() * 150 + 20;
        this.params.B1 = Math.random() * 200 + 50;
        this.params.B2 = Math.random() * 150 + 20;
        
        this.params.p1 = Math.random() * Math.PI * 2;
        this.params.p2 = Math.random() * Math.PI * 2;
        this.params.p3 = Math.random() * Math.PI * 2;
        this.params.p4 = Math.random() * Math.PI * 2;
        
        this.params.d1 = Math.random() * 0.05 + 0.005;
        this.params.d2 = Math.random() * 0.05 + 0.005;
        this.params.d3 = Math.random() * 0.05 + 0.005;
        this.params.d4 = Math.random() * 0.05 + 0.005;

        this.updateAllControls();
        this.clearCanvas();
    }
    
    updateAllControls() {
        document.querySelectorAll('.drum-picker').forEach(picker => {
            const param = picker.dataset.param;
            const display = picker.querySelector('.drum-display');
            if (display && this.params[param] !== undefined) {
                const value = this.params[param];
                display.textContent = value.toFixed(param.startsWith('d') ? 3 : 1);
            }
        });
        
        this.updateTimelineMarkers();
    }
    
    exportPNG() {
        const link = document.createElement('a');
        const timeString = this.formatTime(this.currentTime);
        link.download = `infinite-harmonograph-${timeString.replace(':', '-')}-${Date.now()}.png`;
        link.href = this.canvas.toDataURL();
        link.click();
        
        alert(`PNG画像を ${timeString} の時点でエクスポートしました`);
    }
    
    exportTimeRange() {
        const startTime = prompt('開始時間（秒）:', '0');
        const endTime = prompt('終了時間（秒）:', this.currentTime.toString());
        
        if (startTime !== null && endTime !== null) {
            const start = parseFloat(startTime);
            const end = parseFloat(endTime);
            
            if (!isNaN(start) && !isNaN(end) && start < end) {
                alert(`時間範囲 ${this.formatTime(start)} - ${this.formatTime(end)} のエクスポートを開始します。\n現在のフレームをPNGとして保存します。`);
                this.exportPNG();
            } else {
                alert('無効な時間範囲です。開始時間は終了時間より小さくしてください。');
            }
        }
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new InfiniteHarmonographGenerator();
});