class RingDanceGenerator {
    constructor() {
        this.canvas = document.getElementById('danceCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.fpsCounter = document.getElementById('fpsCounter');
        
        // Animation state
        this.isPlaying = true;
        this.currentTime = 0;
        this.lastFrameTime = 0;
        this.fps = 0;
        this.frameCount = 0;
        
        // Current parameters
        this.params = {
            rings: 12,
            loopTime: 10,
            ringSize: 1.0,
            lineWidth: 2.0,
            orbitType: 'circle',
            amplitudeX: 0.4,
            amplitudeY: 0.4,
            frequencyX: 1.0,
            frequencyY: 1.0,
            phaseX: 0,
            phaseY: 1.57,
            offsetX: 0,
            offsetY: 0,
            symmetry: 'rotational_12',
            visualStyle: 'neon',
            trailMode: 'none',
            background: 'dark_grid',
            speed: 1.0,
            rotationSpeed: 1.0
        };
        
        // Presets data
        this.presets = {
            "circle_waltz": {
                "name": "円環ワルツ",
                "rings": 12,
                "orbit_type": "circle",
                "symmetry": "rotational_12",
                "rotation_speed": 1.0,
                "visual_style": "neon",
                "amplitude_x": 0.4,
                "amplitude_y": 0.4,
                "frequency_x": 1.0,
                "frequency_y": 1.0,
                "phase_x": 0,
                "phase_y": 1.57,
                "offset_x": 0,
                "offset_y": 0
            },
            "lissajous_flare": {
                "name": "リサジュー・フレア",
                "rings": 24,
                "orbit_type": "lissajous",
                "symmetry": "mirror_x",
                "rotation_speed": 2.5,
                "visual_style": "holographic",
                "amplitude_x": 0.6,
                "amplitude_y": 0.4,
                "frequency_x": 3.0,
                "frequency_y": 2.0,
                "phase_x": 0,
                "phase_y": 0,
                "offset_x": 0,
                "offset_y": 0
            },
            "epicycloid_fever": {
                "name": "エピクロイド・フィーバー",
                "rings": 36,
                "orbit_type": "epicycloid",
                "symmetry": "point",
                "rotation_speed": 4.0,
                "visual_style": "metallic",
                "amplitude_x": 0.5,
                "amplitude_y": 0.5,
                "frequency_x": 2.0,
                "frequency_y": 5.0,
                "phase_x": 0,
                "phase_y": 0,
                "offset_x": 0,
                "offset_y": 0
            },
            "sine_swing": {
                "name": "サインウェーブ・スウィング",
                "rings": 48,
                "orbit_type": "sine_wave",
                "symmetry": "mirror_y",
                "rotation_speed": 0.8,
                "visual_style": "stroke",
                "amplitude_x": 0.8,
                "amplitude_y": 0.3,
                "frequency_x": 2.0,
                "frequency_y": 1.0,
                "phase_x": 0,
                "phase_y": 0,
                "offset_x": 0,
                "offset_y": 0
            },
            "minimal_spin": {
                "name": "ミニマル・スピン",
                "rings": 6,
                "orbit_type": "linear",
                "symmetry": "rotational_6",
                "rotation_speed": 5.0,
                "visual_style": "wireframe",
                "amplitude_x": 0.2,
                "amplitude_y": 0.1,
                "frequency_x": 1.0,
                "frequency_y": 2.0,
                "phase_x": 0,
                "phase_y": 0,
                "offset_x": 0,
                "offset_y": 0
            },
            "custom_art": {
                "name": "カスタム・アート",
                "rings": 16,
                "orbit_type": "circle",
                "symmetry": "none",
                "rotation_speed": 3.0,
                "visual_style": "neon",
                "amplitude_x": 0.5,
                "amplitude_y": 0.5,
                "frequency_x": 1.0,
                "frequency_y": 1.0,
                "phase_x": 0,
                "phase_y": 0,
                "offset_x": 0,
                "offset_y": 0
            }
        };
        
        // Trail history for effects
        this.trailHistory = [];
        this.maxHistoryLength = 20;

        // Auto randomization
        this.autoRandomEnabled = false;
        this.autoRandomInterval = 12;
        this.autoRandomTimer = null;
        this.autoRandomTransitionDuration = 3; // seconds
        this.transition = null;

        this.initializeControls();
        this.loadPreset('circle_waltz');
        this.startAnimation();
    }
    
    initializeControls() {
        // Preset selection
        document.getElementById('presetSelect').addEventListener('change', (e) => {
            this.loadPreset(e.target.value);
        });
        
        // Play/Pause control
        document.getElementById('playPauseBtn').addEventListener('click', () => {
            this.isPlaying = !this.isPlaying;
            document.getElementById('playPauseBtn').textContent = this.isPlaying ? '一時停止' : '再生';
        });
        
        // Reset button
        document.getElementById('resetBtn').addEventListener('click', () => {
            this.currentTime = 0;
            this.trailHistory = [];
        });
        
        // Speed control
        document.getElementById('speedSelect').addEventListener('change', (e) => {
            this.params.speed = parseFloat(e.target.value);
        });
        
        // Randomize button
        document.getElementById('randomizeBtn').addEventListener('click', () => {
            this.randomizeParameters();
        });

        // Auto random toggle
        const autoRandomBtn = document.getElementById('autoRandomBtn');
        if (autoRandomBtn) {
            autoRandomBtn.addEventListener('click', () => {
                this.autoRandomEnabled = !this.autoRandomEnabled;
                autoRandomBtn.textContent = this.autoRandomEnabled ? 'オートランダム: ON' : 'オートランダム: OFF';
                if (this.autoRandomEnabled) {
                    this.scheduleNextAutoRandom();
                } else if (this.autoRandomTimer) {
                    clearTimeout(this.autoRandomTimer);
                    this.autoRandomTimer = null;
                }
            });
            autoRandomBtn.textContent = 'オートランダム: OFF';
        }

        const autoIntervalSlider = document.getElementById('autoIntervalSlider');
        const autoIntervalValue = document.getElementById('autoIntervalValue');
        if (autoIntervalSlider && autoIntervalValue) {
            autoIntervalSlider.value = this.autoRandomInterval;
            autoIntervalValue.textContent = this.autoRandomInterval.toString();
            autoIntervalSlider.addEventListener('input', (e) => {
                this.autoRandomInterval = parseFloat(e.target.value);
                autoIntervalValue.textContent = this.autoRandomInterval.toString();
                if (this.autoRandomEnabled) {
                    this.scheduleNextAutoRandom();
                }
            });
        }

        // Parameter sliders
        this.setupSlider('ringsSlider', 'ringsValue', 'rings');
        this.setupSlider('loopTimeSlider', 'loopTimeValue', 'loopTime', '秒');
        this.setupSlider('ringSizeSlider', 'ringSizeValue', 'ringSize');
        this.setupSlider('lineWidthSlider', 'lineWidthValue', 'lineWidth');
        this.setupSlider('amplitudeXSlider', 'amplitudeXValue', 'amplitudeX');
        this.setupSlider('amplitudeYSlider', 'amplitudeYValue', 'amplitudeY');
        this.setupSlider('frequencyXSlider', 'frequencyXValue', 'frequencyX');
        this.setupSlider('frequencyYSlider', 'frequencyYValue', 'frequencyY');
        this.setupSlider('phaseXSlider', 'phaseXValue', 'phaseX');
        this.setupSlider('phaseYSlider', 'phaseYValue', 'phaseY');
        
        // Dropdown controls
        document.getElementById('orbitSelect').addEventListener('change', (e) => {
            this.params.orbitType = e.target.value;
        });
        document.getElementById('symmetrySelect').addEventListener('change', (e) => {
            this.params.symmetry = e.target.value;
        });
        document.getElementById('visualSelect').addEventListener('change', (e) => {
            this.params.visualStyle = e.target.value;
        });
        document.getElementById('trailSelect').addEventListener('change', (e) => {
            this.params.trailMode = e.target.value;
        });
        document.getElementById('backgroundSelect').addEventListener('change', (e) => {
            this.params.background = e.target.value;
        });
    }
    
    setupSlider(sliderId, valueId, paramName, suffix = '') {
        const slider = document.getElementById(sliderId);
        const valueDisplay = document.getElementById(valueId);
        
        slider.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            this.params[paramName] = value;
            valueDisplay.textContent = value.toString() + suffix;
        });
    }
    
    loadPreset(presetKey) {
        const preset = this.presets[presetKey];
        if (!preset) return;
        
        // Update parameters
        this.params.rings = preset.rings;
        this.params.orbitType = preset.orbit_type;
        this.params.symmetry = preset.symmetry;
        this.params.rotationSpeed = preset.rotation_speed;
        this.params.visualStyle = preset.visual_style;
        this.params.amplitudeX = preset.amplitude_x;
        this.params.amplitudeY = preset.amplitude_y;
        this.params.frequencyX = preset.frequency_x;
        this.params.frequencyY = preset.frequency_y;
        this.params.phaseX = preset.phase_x;
        this.params.phaseY = preset.phase_y;
        this.params.offsetX = preset.offset_x;
        this.params.offsetY = preset.offset_y;
        
        // Update UI controls
        this.updateUIFromParams();
        
        // Reset animation
        this.currentTime = 0;
        this.trailHistory = [];
    }
    
    updateUIFromParams() {
        document.getElementById('ringsSlider').value = this.params.rings;
        document.getElementById('ringsValue').textContent = this.params.rings;
        document.getElementById('loopTimeSlider').value = this.params.loopTime;
        document.getElementById('loopTimeValue').textContent = this.params.loopTime;
        document.getElementById('ringSizeSlider').value = this.params.ringSize;
        document.getElementById('ringSizeValue').textContent = this.params.ringSize;
        document.getElementById('lineWidthSlider').value = this.params.lineWidth;
        document.getElementById('lineWidthValue').textContent = this.params.lineWidth;
        document.getElementById('amplitudeXSlider').value = this.params.amplitudeX;
        document.getElementById('amplitudeXValue').textContent = this.params.amplitudeX;
        document.getElementById('amplitudeYSlider').value = this.params.amplitudeY;
        document.getElementById('amplitudeYValue').textContent = this.params.amplitudeY;
        document.getElementById('frequencyXSlider').value = this.params.frequencyX;
        document.getElementById('frequencyXValue').textContent = this.params.frequencyX;
        document.getElementById('frequencyYSlider').value = this.params.frequencyY;
        document.getElementById('frequencyYValue').textContent = this.params.frequencyY;
        document.getElementById('phaseXSlider').value = this.params.phaseX;
        document.getElementById('phaseXValue').textContent = this.params.phaseX.toFixed(2);
        document.getElementById('phaseYSlider').value = this.params.phaseY;
        document.getElementById('phaseYValue').textContent = this.params.phaseY.toFixed(2);

        document.getElementById('orbitSelect').value = this.params.orbitType;
        document.getElementById('symmetrySelect').value = this.params.symmetry;
        document.getElementById('visualSelect').value = this.params.visualStyle;
        document.getElementById('trailSelect').value = this.params.trailMode;
        document.getElementById('backgroundSelect').value = this.params.background;
    }

    cloneParams(params) {
        return { ...params };
    }

    generateRandomParams(baseParams = this.params) {
        const newParams = { ...baseParams };
        newParams.rings = Math.floor(Math.random() * 48) + 6;
        newParams.amplitudeX = Math.random() * 0.8 + 0.1;
        newParams.amplitudeY = Math.random() * 0.8 + 0.1;
        newParams.frequencyX = Math.random() * 8 + 0.5;
        newParams.frequencyY = Math.random() * 8 + 0.5;
        newParams.phaseX = Math.random() * Math.PI * 2;
        newParams.phaseY = Math.random() * Math.PI * 2;
        newParams.rotationSpeed = Math.random() * 4 + 0.5;

        const orbitTypes = ['circle', 'lissajous', 'epicycloid', 'sine_wave', 'linear'];
        const symmetryTypes = ['none', 'mirror_x', 'mirror_y', 'point', 'rotational_6', 'rotational_12'];
        const visualStyles = ['stroke', 'neon', 'holographic', 'metallic', 'wireframe'];

        newParams.orbitType = orbitTypes[Math.floor(Math.random() * orbitTypes.length)];
        newParams.symmetry = symmetryTypes[Math.floor(Math.random() * symmetryTypes.length)];
        newParams.visualStyle = visualStyles[Math.floor(Math.random() * visualStyles.length)];

        return newParams;
    }

    scheduleNextAutoRandom() {
        if (this.autoRandomTimer) {
            clearTimeout(this.autoRandomTimer);
        }
        this.autoRandomTimer = setTimeout(() => this.triggerAutoRandom(), this.autoRandomInterval * 1000);
    }

    triggerAutoRandom() {
        if (!this.autoRandomEnabled) return;
        if (this.transition) {
            this.scheduleNextAutoRandom();
            return;
        }
        this.startAutoRandomTransition();
        this.scheduleNextAutoRandom();
    }

    startAutoRandomTransition() {
        const newParams = this.generateRandomParams(this.params);
        this.transition = {
            fromParams: this.cloneParams(this.params),
            toParams: newParams,
            progress: 0,
            duration: this.autoRandomTransitionDuration * 1000,
            fromTime: this.currentTime,
            toTime: 0
        };
        this.trailHistory = [];
    }

    easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    renderEffect(params, time, alpha = 1) {
        this.ctx.save();
        this.ctx.globalAlpha = alpha;

        const normalizedTime = (time / params.loopTime) % 1;
        let positions = [];

        for (let i = 0; i < params.rings; i++) {
            const ringTime = normalizedTime + (i / params.rings) * 0.1;
            const pos = this.calculateOrbitPosition(ringTime % 1, i, params);
            positions.push(pos);
        }

        positions = this.applySymmetry(positions, params);

        positions.forEach((pos, index) => {
            this.drawRing(pos, index, positions.length, params);
        });

        this.ctx.restore();
    }

    randomizeParameters() {
        if (this.transition) {
            this.transition = null;
        }
        this.params = this.generateRandomParams(this.params);
        this.updateUIFromParams();
        this.currentTime = 0;
        this.trailHistory = [];
    }

    calculateOrbitPosition(t, ringIndex = 0, params = this.params) {
        const { orbitType, amplitudeX, amplitudeY, frequencyX, frequencyY, phaseX, phaseY, offsetX, offsetY } = params;
        
        let x, y;
        
        switch (orbitType) {
            case 'circle':
                x = offsetX + amplitudeX * Math.cos(2 * Math.PI * t + phaseX);
                y = offsetY + amplitudeY * Math.sin(2 * Math.PI * t + phaseY);
                break;
                
            case 'lissajous':
                x = offsetX + amplitudeX * Math.sin(2 * Math.PI * frequencyX * t + phaseX);
                y = offsetY + amplitudeY * Math.sin(2 * Math.PI * frequencyY * t + phaseY);
                break;
                
            case 'epicycloid':
                const R = amplitudeX * 100;
                const r = amplitudeY * 30;
                const k = R / r;
                const angle = 2 * Math.PI * frequencyX * t;
                x = offsetX + ((R + r) * Math.cos(angle) - r * Math.cos((R + r) / r * angle)) / 200;
                y = offsetY + ((R + r) * Math.sin(angle) - r * Math.sin((R + r) / r * angle)) / 200;
                break;
                
            case 'sine_wave':
                x = offsetX + (t * 2 - 1) * amplitudeX;
                y = offsetY + amplitudeY * Math.sin(2 * Math.PI * frequencyX * t + phaseX);
                break;
                
            case 'linear':
                x = offsetX + amplitudeX * Math.cos(Math.PI * t);
                y = offsetY + amplitudeY * Math.sin(2 * Math.PI * frequencyY * t + phaseY);
                break;
                
            default:
                x = offsetX;
                y = offsetY;
        }
        
        return { x, y };
    }
    
    applySymmetry(positions, params = this.params) {
        const { symmetry } = params;
        let result = [...positions];
        
        switch (symmetry) {
            case 'mirror_x':
                result = result.concat(positions.map(pos => ({ x: pos.x, y: -pos.y })));
                break;
                
            case 'mirror_y':
                result = result.concat(positions.map(pos => ({ x: -pos.x, y: pos.y })));
                break;
                
            case 'point':
                result = result.concat(positions.map(pos => ({ x: -pos.x, y: -pos.y })));
                break;
                
            case 'rotational_6':
                for (let i = 1; i < 6; i++) {
                    const angle = (i * Math.PI * 2) / 6;
                    const cos = Math.cos(angle);
                    const sin = Math.sin(angle);
                    result = result.concat(positions.map(pos => ({
                        x: pos.x * cos - pos.y * sin,
                        y: pos.x * sin + pos.y * cos
                    })));
                }
                break;
                
            case 'rotational_12':
                for (let i = 1; i < 12; i++) {
                    const angle = (i * Math.PI * 2) / 12;
                    const cos = Math.cos(angle);
                    const sin = Math.sin(angle);
                    result = result.concat(positions.map(pos => ({
                        x: pos.x * cos - pos.y * sin,
                        y: pos.x * sin + pos.y * cos
                    })));
                }
                break;
        }
        
        return result;
    }
    
    drawBackground(params = this.params, alpha = 1) {
        const { background } = params;
        const { width, height } = this.canvas;

        this.ctx.save();
        this.ctx.globalAlpha = alpha;
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, width, height);

        if (background === 'dark_grid') {
            this.ctx.strokeStyle = 'rgba(50, 184, 198, 0.1)';
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();
            
            for (let x = 0; x < width; x += 20) {
                this.ctx.moveTo(x, 0);
                this.ctx.lineTo(x, height);
            }
            for (let y = 0; y < height; y += 20) {
                this.ctx.moveTo(0, y);
                this.ctx.lineTo(width, y);
            }

            this.ctx.stroke();
        } else if (background === 'space') {
            const gradient = this.ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, Math.max(width, height)/2);
            gradient.addColorStop(0, 'rgba(19, 52, 59, 0.8)');
            gradient.addColorStop(1, 'rgba(0, 0, 0, 1)');
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(0, 0, width, height);

            // Add some stars
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            for (let i = 0; i < 100; i++) {
                const x = Math.random() * width;
                const y = Math.random() * height;
                const size = Math.random() * 2;
                this.ctx.fillRect(x, y, size, size);
            }
        }

        this.ctx.restore();
    }
    
    drawTrails() {
        const { trailMode } = this.params;
        
        if (trailMode === 'fade') {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        } else if (trailMode === 'history' && this.trailHistory.length > 1) {
            this.ctx.strokeStyle = 'rgba(50, 184, 198, 0.3)';
            this.ctx.lineWidth = 1;
            
            for (let i = 1; i < this.trailHistory.length; i++) {
                const prevPositions = this.trailHistory[i - 1];
                const currPositions = this.trailHistory[i];
                const alpha = i / this.trailHistory.length * 0.3;
                
                this.ctx.globalAlpha = alpha;
                
                for (let j = 0; j < Math.min(prevPositions.length, currPositions.length); j++) {
                    const prev = this.normalizedToCanvas(prevPositions[j]);
                    const curr = this.normalizedToCanvas(currPositions[j]);
                    
                    this.ctx.beginPath();
                    this.ctx.moveTo(prev.x, prev.y);
                    this.ctx.lineTo(curr.x, curr.y);
                    this.ctx.stroke();
                }
            }
            
            this.ctx.globalAlpha = 1.0;
        }
    }
    
    normalizedToCanvas(pos) {
        const { width, height } = this.canvas;
        return {
            x: (pos.x + 1) * width / 2,
            y: (pos.y + 1) * height / 2
        };
    }
    
    drawRing(position, ringIndex, totalRings, params = this.params) {
        const canvasPos = this.normalizedToCanvas(position);
        const { visualStyle, ringSize, lineWidth } = params;
        const radius = 10 * ringSize;

        // Calculate color based on ring index
        const hue = (ringIndex / totalRings) * 360;
        const baseColor = `hsl(${hue}, 70%, 60%)`;
        
        this.ctx.save();
        
        switch (visualStyle) {
            case 'stroke':
                this.ctx.strokeStyle = baseColor;
                this.ctx.lineWidth = lineWidth;
                this.ctx.beginPath();
                this.ctx.arc(canvasPos.x, canvasPos.y, radius, 0, Math.PI * 2);
                this.ctx.stroke();
                break;
                
            case 'neon':
                // Outer glow
                this.ctx.shadowColor = baseColor;
                this.ctx.shadowBlur = 15;
                this.ctx.strokeStyle = baseColor;
                this.ctx.lineWidth = lineWidth * 2;
                this.ctx.beginPath();
                this.ctx.arc(canvasPos.x, canvasPos.y, radius, 0, Math.PI * 2);
                this.ctx.stroke();
                
                // Inner bright ring
                this.ctx.shadowBlur = 0;
                this.ctx.strokeStyle = `hsl(${hue}, 100%, 80%)`;
                this.ctx.lineWidth = lineWidth;
                this.ctx.beginPath();
                this.ctx.arc(canvasPos.x, canvasPos.y, radius, 0, Math.PI * 2);
                this.ctx.stroke();
                break;
                
            case 'holographic':
                const gradient = this.ctx.createLinearGradient(
                    canvasPos.x - radius, canvasPos.y - radius,
                    canvasPos.x + radius, canvasPos.y + radius
                );
                gradient.addColorStop(0, `hsl(${hue}, 100%, 70%)`);
                gradient.addColorStop(0.5, `hsl(${(hue + 60) % 360}, 100%, 70%)`);
                gradient.addColorStop(1, `hsl(${(hue + 120) % 360}, 100%, 70%)`);
                
                this.ctx.strokeStyle = gradient;
                this.ctx.lineWidth = lineWidth * 1.5;
                this.ctx.beginPath();
                this.ctx.arc(canvasPos.x, canvasPos.y, radius, 0, Math.PI * 2);
                this.ctx.stroke();
                break;
                
            case 'metallic':
                const metallicGradient = this.ctx.createLinearGradient(
                    canvasPos.x - radius, canvasPos.y - radius,
                    canvasPos.x + radius, canvasPos.y + radius
                );
                metallicGradient.addColorStop(0, `hsl(${hue}, 30%, 40%)`);
                metallicGradient.addColorStop(0.3, `hsl(${hue}, 60%, 80%)`);
                metallicGradient.addColorStop(0.7, `hsl(${hue}, 40%, 60%)`);
                metallicGradient.addColorStop(1, `hsl(${hue}, 30%, 30%)`);
                
                this.ctx.fillStyle = metallicGradient;
                this.ctx.beginPath();
                this.ctx.arc(canvasPos.x, canvasPos.y, radius, 0, Math.PI * 2);
                this.ctx.fill();
                break;
                
            case 'wireframe':
                this.ctx.strokeStyle = baseColor;
                this.ctx.lineWidth = 1;
                this.ctx.setLineDash([3, 3]);
                this.ctx.beginPath();
                this.ctx.arc(canvasPos.x, canvasPos.y, radius, 0, Math.PI * 2);
                this.ctx.stroke();
                this.ctx.setLineDash([]);
                break;
        }
        
        this.ctx.restore();
    }
    
    animate(currentTime) {
        let deltaTime = currentTime - this.lastFrameTime;
        if (this.lastFrameTime === 0) {
            deltaTime = 0;
        }

        if (this.isPlaying) {
            if (this.transition) {
                const fromParams = this.transition.fromParams;
                const toParams = this.transition.toParams;

                const fromSpeed = (fromParams.speed ?? this.params.speed) * (fromParams.rotationSpeed ?? 1);
                const toSpeed = (toParams.speed ?? this.params.speed) * (toParams.rotationSpeed ?? 1);

                this.transition.fromTime += (deltaTime / 1000) * fromSpeed;
                this.transition.toTime += (deltaTime / 1000) * toSpeed;
                this.transition.progress = Math.min(1, this.transition.progress + deltaTime / this.transition.duration);
            } else {
                this.currentTime += (deltaTime / 1000) * this.params.speed * this.params.rotationSpeed;
            }

            if (deltaTime > 0) {
                this.fps = Math.round(1000 / deltaTime);
                this.frameCount++;
                if (this.frameCount % 30 === 0) {
                    this.fpsCounter.textContent = `${this.fps} FPS`;
                }
            }
        }

        this.lastFrameTime = currentTime;

        if (this.transition) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            const easedProgress = this.easeInOutCubic(this.transition.progress);

            this.drawBackground(this.transition.fromParams, 1 - easedProgress);
            this.drawBackground(this.transition.toParams, easedProgress);

            this.renderEffect(this.transition.fromParams, this.transition.fromTime, 1 - easedProgress);
            this.renderEffect(this.transition.toParams, this.transition.toTime, easedProgress);

            if (this.transition.progress >= 1) {
                this.params = this.cloneParams(this.transition.toParams);
                this.currentTime = this.transition.toTime;
                this.updateUIFromParams();
                this.transition = null;
            }
        } else {
            if (this.params.trailMode === 'none') {
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                this.drawBackground(this.params, 1);
            } else {
                if (this.frameCount % 60 === 0) {
                    this.drawBackground(this.params, 1);
                }
                this.drawTrails();
            }

            const normalizedTime = (this.currentTime / this.params.loopTime) % 1;
            let positions = [];

            for (let i = 0; i < this.params.rings; i++) {
                const ringTime = normalizedTime + (i / this.params.rings) * 0.1;
                const pos = this.calculateOrbitPosition(ringTime % 1, i, this.params);
                positions.push(pos);
            }

            positions = this.applySymmetry(positions, this.params);

            if (this.params.trailMode === 'history') {
                this.trailHistory.push([...positions]);
                if (this.trailHistory.length > this.maxHistoryLength) {
                    this.trailHistory.shift();
                }
            }

            positions.forEach((pos, index) => {
                this.drawRing(pos, index, positions.length, this.params);
            });
        }

        requestAnimationFrame((time) => this.animate(time));
    }
    
    startAnimation() {
        requestAnimationFrame((time) => this.animate(time));
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new RingDanceGenerator();
});