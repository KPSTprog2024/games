class MultiPendulumHarmonograph {
    constructor() {
        // Canvas elements
        this.backgroundCanvas = document.getElementById('backgroundCanvas');
        this.drawingCanvas = document.getElementById('drawingCanvas');
        this.bgCtx = this.backgroundCanvas.getContext('2d');
        this.ctx = this.drawingCanvas.getContext('2d');
        
        // Animation state
        this.isPlaying = false;
        this.animationId = null;
        this.time = 0;
        this.pathHistory = [];
        
        // Multi-pen system
        this.pens = [this.createDefaultPen(1)];
        this.selectedPenIndex = 0;
        
        // Paper motion
        this.paperMotion = {
            enabled: false,
            rotationAmplitude: 0,
            rotationFrequency: 1,
            rotationPhase: 0,
            rotationDamping: 0.0003
        };
        
        // Global settings
        this.globalSettings = {
            speed: 1,
            phaseLock: false,
            amplitudeScale: 1,
            background: 'nightsky'
        };
        
        // Data from JSON
        this.backgroundData = {
            nightsky: { colors: ['#0a0a1a', '#1a1a2e', '#16213e'], type: 'radial_gradient_with_particles' },
            mandala: { colors: ['#2d1b69', '#11082f', '#433878'], type: 'mandala_pattern' },
            mist: { colors: ['#2c2c2c', '#3d3d3d', '#1a1a1a'], type: 'radial_mist' },
            charcoal: { colors: ['#1a1a1a', '#2a2a2a', '#333333'], type: 'textured_paper' },
            enso: { colors: ['#f5f5f5', '#e8e8e8', '#333333'], type: 'enso_circle' }
        };
        
        this.frequencyPresets = [
            {name: "1:1", fx: 1, fy: 1}, {name: "3:2", fx: 3, fy: 2}, {name: "4:3", fx: 4, fy: 3},
            {name: "5:4", fx: 5, fy: 4}, {name: "4:5", fx: 4, fy: 5}, {name: "7:5", fx: 7, fy: 5},
            {name: "2:3", fx: 2, fy: 3}, {name: "8:5", fx: 8, fy: 5}, {name: "5:3", fx: 5, fy: 3}
        ];
        
        this.blendModes = [
            {name: "通常", value: "source-over"}, {name: "加算", value: "lighter"},
            {name: "乗算", value: "multiply"}, {name: "スクリーン", value: "screen"}
        ];
        
        this.multiPenPresets = {
            "双龍": {
                pens: [
                    { ax: 140, ay: 140, fx: 3, fy: 2, phaseX: 0, phaseY: 0, dampingX: 0.0008, dampingY: 0.0008, strokeWidth: 1.5, color: "#ff6b6b", gradientEnd: "#4ecdc4", gradient: true, blendMode: "source-over", opacity: 0.8 },
                    { ax: 120, ay: 160, fx: 2, fy: 3, phaseX: 1.57, phaseY: 1.57, dampingX: 0.001, dampingY: 0.001, strokeWidth: 1.5, color: "#45b7d1", gradientEnd: "#f9ca24", gradient: true, blendMode: "source-over", opacity: 0.8 }
                ],
                paper: {enabled: false}, background: "nightsky"
            },
            "花火": {
                pens: [
                    { ax: 100, ay: 100, fx: 5, fy: 4, phaseX: 0, phaseY: 0, dampingX: 0.002, dampingY: 0.002, strokeWidth: 1, color: "#ff9ff3", gradientEnd: "#54a0ff", gradient: true, blendMode: "lighter", opacity: 0.7 },
                    { ax: 80, ay: 120, fx: 7, fy: 5, phaseX: 2.09, phaseY: 2.09, dampingX: 0.0015, dampingY: 0.0015, strokeWidth: 1, color: "#5f27cd", gradientEnd: "#00d2d3", gradient: true, blendMode: "lighter", opacity: 0.7 },
                    { ax: 60, ay: 140, fx: 4, fy: 3, phaseX: 4.19, phaseY: 4.19, dampingX: 0.0012, dampingY: 0.0012, strokeWidth: 1, color: "#ff6348", gradientEnd: "#2ed573", gradient: true, blendMode: "lighter", opacity: 0.7 }
                ],
                paper: {enabled: false}, background: "charcoal"
            },
            "銀河": {
                pens: [
                    { ax: 160, ay: 160, fx: 3, fy: 2, phaseX: 0, phaseY: 0, dampingX: 0.0005, dampingY: 0.0005, strokeWidth: 2, color: "#74b9ff", gradientEnd: "#0984e3", gradient: true, blendMode: "source-over", opacity: 0.9 },
                    { ax: 120, ay: 120, fx: 5, fy: 3, phaseX: 1.57, phaseY: 1.57, dampingX: 0.0008, dampingY: 0.0008, strokeWidth: 1.5, color: "#a29bfe", gradientEnd: "#6c5ce7", gradient: true, blendMode: "source-over", opacity: 0.7 },
                    { ax: 80, ay: 100, fx: 7, fy: 4, phaseX: 3.14, phaseY: 3.14, dampingX: 0.0012, dampingY: 0.0012, strokeWidth: 1, color: "#fd79a8", gradientEnd: "#e84393", gradient: true, blendMode: "source-over", opacity: 0.6 },
                    { ax: 40, ay: 60, fx: 8, fy: 5, phaseX: 4.71, phaseY: 4.71, dampingX: 0.0015, dampingY: 0.0015, strokeWidth: 0.5, color: "#fdcb6e", gradientEnd: "#e17055", gradient: true, blendMode: "lighter", opacity: 0.5 }
                ],
                paper: { enabled: true, rotationAmplitude: 0.2, rotationFrequency: 0.5, rotationPhase: 0, rotationDamping: 0.0003 },
                background: "mandala"
            },
            "陰陽": {
                pens: [
                    { ax: 150, ay: 150, fx: 4, fy: 3, phaseX: 0, phaseY: 0, dampingX: 0.001, dampingY: 0.001, strokeWidth: 2, color: "#2d3436", gradientEnd: "#636e72", gradient: true, blendMode: "source-over", opacity: 0.8 },
                    { ax: 150, ay: 150, fx: 4, fy: 3, phaseX: 3.14, phaseY: 3.14, dampingX: 0.001, dampingY: 0.001, strokeWidth: 2, color: "#ddd", gradientEnd: "#fff", gradient: true, blendMode: "source-over", opacity: 0.8 }
                ],
                paper: {enabled: false}, background: "enso"
            },
            "桜吹雪": {
                pens: [
                    { ax: 100, ay: 130, fx: 5, fy: 4, phaseX: 0, phaseY: 0.52, dampingX: 0.0015, dampingY: 0.0015, strokeWidth: 1, color: "#ff7675", gradientEnd: "#fd79a8", gradient: true, blendMode: "source-over", opacity: 0.6 },
                    { ax: 80, ay: 110, fx: 7, fy: 5, phaseX: 2.09, phaseY: 1.05, dampingX: 0.0018, dampingY: 0.0018, strokeWidth: 0.8, color: "#fab1a0", gradientEnd: "#e17055", gradient: true, blendMode: "source-over", opacity: 0.5 },
                    { ax: 60, ay: 90, fx: 3, fy: 2, phaseX: 4.19, phaseY: 2.62, dampingX: 0.002, dampingY: 0.002, strokeWidth: 0.6, color: "#fdcb6e", gradientEnd: "#f39c12", gradient: true, blendMode: "source-over", opacity: 0.4 }
                ],
                paper: { enabled: true, rotationAmplitude: 0.1, rotationFrequency: 0.3, rotationPhase: 0, rotationDamping: 0.0005 },
                background: "mist"
            }
        };
        
        this.init();
    }
    
    createDefaultPen(id) {
        return {
            id: id,
            enabled: true,
            ax: 150, ay: 150,
            fx: 3, fy: 2,
            phaseX: 0, phaseY: 0,
            dampingX: 0.001, dampingY: 0.001,
            strokeWidth: 2,
            color: '#ff4757',
            gradientEnd: '#3742fa',
            gradient: true,
            blendMode: 'source-over',
            opacity: 1.0
        };
    }
    
    init() {
        this.setupCanvas();
        this.setupEventListeners();
        this.renderBackground();
        this.updateUI();
        this.renderPenControls();
    }
    
    setupCanvas() {
        const container = document.querySelector('.canvas-container');
        const rect = container.getBoundingClientRect();
        const size = Math.min(rect.width, rect.height, 600);
        
        this.backgroundCanvas.width = size;
        this.backgroundCanvas.height = size;
        this.drawingCanvas.width = size;
        this.drawingCanvas.height = size;
        
        this.backgroundCanvas.style.width = size + 'px';
        this.backgroundCanvas.style.height = size + 'px';
        this.drawingCanvas.style.width = size + 'px';
        this.drawingCanvas.style.height = size + 'px';
        
        this.centerX = size / 2;
        this.centerY = size / 2;
    }
    
    setupEventListeners() {
        // Playback controls
        document.getElementById('playPauseBtn').addEventListener('click', () => this.togglePlayPause());
        document.getElementById('resetBtn').addEventListener('click', () => this.reset());
        document.getElementById('saveBtn').addEventListener('click', () => this.saveImage());
        
        // Multi-pen presets
        document.querySelectorAll('.preset-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const presetName = card.dataset.preset;
                this.loadMultiPenPreset(presetName);
            });
        });
        
        // Pen management
        document.getElementById('addPenBtn').addEventListener('click', () => this.addPen());
        document.getElementById('duplicatePenBtn').addEventListener('click', () => this.duplicatePen());
        
        // Global controls
        this.setupSlider('globalSpeedSlider', 'globalSpeedValue', (value) => {
            this.globalSettings.speed = parseFloat(value);
        });
        
        this.setupSlider('globalAmplitudeSlider', 'globalAmplitudeValue', (value) => {
            this.globalSettings.amplitudeScale = parseFloat(value);
        });
        
        document.getElementById('phaseLockToggle').addEventListener('change', (e) => {
            this.globalSettings.phaseLock = e.target.checked;
        });
        
        // Paper motion controls
        document.getElementById('paperMotionToggle').addEventListener('change', (e) => {
            this.paperMotion.enabled = e.target.checked;
            document.getElementById('paperControls').style.display = e.target.checked ? 'grid' : 'none';
        });
        
        this.setupSlider('paperRotAmplitudeSlider', 'paperRotAmplitudeValue', (value) => {
            this.paperMotion.rotationAmplitude = parseFloat(value);
        });
        
        this.setupSlider('paperRotFreqSlider', 'paperRotFreqValue', (value) => {
            this.paperMotion.rotationFrequency = parseFloat(value);
        });
        
        this.setupSlider('paperRotDampingSlider', 'paperRotDampingValue', (value) => {
            this.paperMotion.rotationDamping = parseFloat(value);
        }, 4);
        
        // Background selector
        document.querySelectorAll('.background-option').forEach(option => {
            option.addEventListener('click', (e) => {
                document.querySelectorAll('.background-option').forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');
                this.globalSettings.background = option.dataset.bg;
                this.renderBackground();
            });
        });
        
        // Collapsible sections
        document.querySelectorAll('.collapsible').forEach(header => {
            header.addEventListener('click', (e) => {
                const target = document.getElementById(header.dataset.target);
                if (target) {
                    header.classList.toggle('collapsed');
                    target.classList.toggle('collapsed');
                }
            });
        });
        
        // Window resize
        window.addEventListener('resize', () => {
            setTimeout(() => {
                this.setupCanvas();
                this.renderBackground();
                this.redrawPaths();
            }, 100);
        });
    }
    
    setupSlider(sliderId, valueId, callback, decimals = 1) {
        const slider = document.getElementById(sliderId);
        const valueDisplay = document.getElementById(valueId);
        
        if (slider && valueDisplay) {
            slider.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                callback(value);
                valueDisplay.textContent = decimals > 0 ? value.toFixed(decimals) : Math.round(value);
            });
        }
    }
    
    addPen() {
        if (this.pens.length >= 4) return;
        
        const newId = Math.max(...this.pens.map(p => p.id)) + 1;
        const newPen = this.createDefaultPen(newId);
        
        // Add some variation to make it interesting
        newPen.color = this.getRandomColor();
        newPen.gradientEnd = this.getRandomColor();
        newPen.phaseX = Math.random() * Math.PI * 2;
        newPen.phaseY = Math.random() * Math.PI * 2;
        
        this.pens.push(newPen);
        this.renderPenControls();
        this.updatePenCount();
        this.reset();
    }
    
    duplicatePen() {
        if (this.pens.length >= 4 || this.selectedPenIndex < 0) return;
        
        const sourcePen = this.pens[this.selectedPenIndex];
        const newId = Math.max(...this.pens.map(p => p.id)) + 1;
        const duplicatedPen = { ...sourcePen, id: newId };
        
        // Add slight variations
        duplicatedPen.phaseX += 0.5;
        duplicatedPen.phaseY += 0.5;
        duplicatedPen.ax *= 0.9;
        duplicatedPen.ay *= 1.1;
        
        this.pens.push(duplicatedPen);
        this.renderPenControls();
        this.updatePenCount();
        this.reset();
    }
    
    removePen(penId) {
        if (this.pens.length <= 1) return;
        
        this.pens = this.pens.filter(pen => pen.id !== penId);
        this.selectedPenIndex = Math.min(this.selectedPenIndex, this.pens.length - 1);
        this.renderPenControls();
        this.updatePenCount();
        this.reset();
    }
    
    togglePen(penId) {
        const pen = this.pens.find(p => p.id === penId);
        if (pen) {
            pen.enabled = !pen.enabled;
            this.renderPenControls();
        }
    }
    
    soloPen(penId) {
        const soloEnabled = this.pens.filter(p => p.enabled).length === 1 && this.pens.find(p => p.id === penId)?.enabled;
        
        this.pens.forEach(pen => {
            pen.enabled = soloEnabled || pen.id === penId;
        });
        
        this.renderPenControls();
    }
    
    getRandomColor() {
        const colors = ['#ff4757', '#3742fa', '#2ed573', '#feca57', '#ff9ff3', '#54a0ff', '#5f27cd', '#ff6348'];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    renderPenControls() {
        const penList = document.getElementById('penList');
        penList.innerHTML = '';
        
        this.pens.forEach((pen, index) => {
            const penControl = this.createPenControlElement(pen, index);
            penList.appendChild(penControl);
        });
        
        this.updatePenCount();
    }
    
    createPenControlElement(pen, index) {
        const penDiv = document.createElement('div');
        penDiv.className = `pen-control ${pen.enabled ? '' : 'muted'}`;
        
        penDiv.innerHTML = `
            <div class="pen-header">
                <div class="pen-info">
                    <div class="pen-color-indicator" style="background: ${pen.gradient ? 
                        `linear-gradient(45deg, ${pen.color}, ${pen.gradientEnd})` : pen.color}"></div>
                    <span class="pen-name">ペン ${pen.id}</span>
                </div>
                <div class="pen-controls-toggle">
                    <button class="pen-action-btn" title="ソロ" data-action="solo" data-pen-id="${pen.id}">S</button>
                    <button class="pen-action-btn" title="ミュート" data-action="toggle" data-pen-id="${pen.id}">${pen.enabled ? 'M' : 'U'}</button>
                    <button class="pen-action-btn" title="削除" data-action="remove" data-pen-id="${pen.id}">×</button>
                    <button class="pen-action-btn collapse-toggle" title="展開/折りたたみ">▼</button>
                </div>
            </div>
            <div class="pen-content">
                <div class="pen-parameters">
                    <div class="param-group">
                        <label class="form-label">X振幅: <span class="value-display">${Math.round(pen.ax)}</span></label>
                        <input type="range" class="form-control pen-param" data-param="ax" min="20" max="250" value="${pen.ax}">
                    </div>
                    <div class="param-group">
                        <label class="form-label">Y振幅: <span class="value-display">${Math.round(pen.ay)}</span></label>
                        <input type="range" class="form-control pen-param" data-param="ay" min="20" max="250" value="${pen.ay}">
                    </div>
                    <div class="param-group">
                        <label class="form-label">周波数X: <span class="value-display">${pen.fx}</span></label>
                        <input type="range" class="form-control pen-param" data-param="fx" min="1" max="10" value="${pen.fx}">
                    </div>
                    <div class="param-group">
                        <label class="form-label">周波数Y: <span class="value-display">${pen.fy}</span></label>
                        <input type="range" class="form-control pen-param" data-param="fy" min="1" max="10" value="${pen.fy}">
                    </div>
                    <div class="param-group">
                        <label class="form-label">X位相: <span class="value-display">${Math.round(pen.phaseX * 180 / Math.PI)}°</span></label>
                        <input type="range" class="form-control pen-param" data-param="phaseX" min="0" max="${Math.PI * 2}" step="0.1" value="${pen.phaseX}">
                    </div>
                    <div class="param-group">
                        <label class="form-label">Y位相: <span class="value-display">${Math.round(pen.phaseY * 180 / Math.PI)}°</span></label>
                        <input type="range" class="form-control pen-param" data-param="phaseY" min="0" max="${Math.PI * 2}" step="0.1" value="${pen.phaseY}">
                    </div>
                    <div class="param-group">
                        <label class="form-label">X減衰: <span class="value-display">${pen.dampingX.toFixed(4)}</span></label>
                        <input type="range" class="form-control pen-param" data-param="dampingX" min="0" max="0.005" step="0.0001" value="${pen.dampingX}">
                    </div>
                    <div class="param-group">
                        <label class="form-label">Y減衰: <span class="value-display">${pen.dampingY.toFixed(4)}</span></label>
                        <input type="range" class="form-control pen-param" data-param="dampingY" min="0" max="0.005" step="0.0001" value="${pen.dampingY}">
                    </div>
                </div>
                <div class="pen-visual-controls">
                    <div class="param-group">
                        <label class="form-label">線幅: <span class="value-display">${pen.strokeWidth.toFixed(1)}</span></label>
                        <input type="range" class="form-control pen-param" data-param="strokeWidth" min="0.5" max="5" step="0.1" value="${pen.strokeWidth}">
                    </div>
                    <div class="param-group">
                        <label class="form-label">透明度: <span class="value-display">${pen.opacity.toFixed(1)}</span></label>
                        <input type="range" class="form-control pen-param" data-param="opacity" min="0.1" max="1" step="0.1" value="${pen.opacity}">
                    </div>
                    <div class="param-group">
                        <label class="form-label">開始色</label>
                        <input type="color" class="color-input pen-param" data-param="color" value="${pen.color}">
                    </div>
                    <div class="param-group">
                        <label class="form-label">終了色</label>
                        <input type="color" class="color-input pen-param" data-param="gradientEnd" value="${pen.gradientEnd}">
                    </div>
                    <div class="param-group">
                        <label class="form-label">
                            <input type="checkbox" class="pen-param" data-param="gradient" ${pen.gradient ? 'checked' : ''}> グラデーション
                        </label>
                    </div>
                    <div class="param-group">
                        <label class="form-label">ブレンド</label>
                        <select class="form-control pen-param" data-param="blendMode">
                            ${this.blendModes.map(mode => 
                                `<option value="${mode.value}" ${pen.blendMode === mode.value ? 'selected' : ''}>${mode.name}</option>`
                            ).join('')}
                        </select>
                    </div>
                </div>
                <div class="frequency-presets">
                    <label class="form-label">周波数プリセット:</label>
                    ${this.frequencyPresets.map(preset => 
                        `<button type="button" class="freq-preset-btn ${pen.fx === preset.fx && pen.fy === preset.fy ? 'active' : ''}" 
                                data-preset-fx="${preset.fx}" data-preset-fy="${preset.fy}">${preset.name}</button>`
                    ).join('')}
                </div>
            </div>
        `;
        
        // Add event listeners for this pen's controls
        const penParams = penDiv.querySelectorAll('.pen-param');
        penParams.forEach(param => {
            const paramName = param.dataset.param;
            
            if (param.type === 'checkbox') {
                param.addEventListener('change', (e) => {
                    pen[paramName] = e.target.checked;
                    this.updatePenColorIndicator(pen.id);
                });
            } else {
                param.addEventListener('input', (e) => {
                    let value = e.target.value;
                    
                    if (param.type === 'range') {
                        value = parseFloat(value);
                        // Update display value
                        const display = param.parentElement.querySelector('.value-display');
                        if (display) {
                            if (paramName.includes('phase')) {
                                display.textContent = Math.round(value * 180 / Math.PI) + '°';
                            } else if (paramName.includes('damping')) {
                                display.textContent = value.toFixed(4);
                            } else if (paramName === 'strokeWidth' || paramName === 'opacity') {
                                display.textContent = value.toFixed(1);
                            } else {
                                display.textContent = Math.round(value);
                            }
                        }
                    }
                    
                    pen[paramName] = value;
                    this.updatePenColorIndicator(pen.id);
                });
            }
        });
        
        // Action buttons
        const actionButtons = penDiv.querySelectorAll('.pen-action-btn[data-action]');
        actionButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const action = btn.dataset.action;
                const penId = parseInt(btn.dataset.penId);
                
                switch (action) {
                    case 'solo':
                        this.soloPen(penId);
                        break;
                    case 'toggle':
                        this.togglePen(penId);
                        break;
                    case 'remove':
                        this.removePen(penId);
                        break;
                }
            });
        });
        
        // Frequency preset buttons
        const presetButtons = penDiv.querySelectorAll('.freq-preset-btn');
        presetButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const fx = parseInt(btn.dataset.presetFx);
                const fy = parseInt(btn.dataset.presetFy);
                this.setFrequencyPreset(pen.id, fx, fy);
            });
        });
        
        // Toggle expand/collapse
        const collapseToggle = penDiv.querySelector('.collapse-toggle');
        const penContent = penDiv.querySelector('.pen-content');
        
        collapseToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            penContent.classList.toggle('expanded');
            collapseToggle.textContent = penContent.classList.contains('expanded') ? '▲' : '▼';
        });
        
        return penDiv;
    }
    
    updatePenColorIndicator(penId) {
        const pen = this.pens.find(p => p.id === penId);
        if (!pen) return;
        
        const penControls = Array.from(document.querySelectorAll('.pen-control'));
        const penIndex = this.pens.findIndex(p => p.id === penId);
        
        if (penIndex >= 0 && penIndex < penControls.length) {
            const targetIndicator = penControls[penIndex].querySelector('.pen-color-indicator');
            if (targetIndicator) {
                targetIndicator.style.background = pen.gradient ? 
                    `linear-gradient(45deg, ${pen.color}, ${pen.gradientEnd})` : pen.color;
            }
        }
    }
    
    updatePenCount() {
        document.getElementById('penCountDisplay').textContent = this.pens.length;
        
        const addBtn = document.getElementById('addPenBtn');
        const duplicateBtn = document.getElementById('duplicatePenBtn');
        
        addBtn.disabled = this.pens.length >= 4;
        duplicateBtn.disabled = this.pens.length >= 4;
    }
    
    setFrequencyPreset(penId, fx, fy) {
        const pen = this.pens.find(p => p.id === penId);
        if (pen) {
            pen.fx = fx;
            pen.fy = fy;
            this.renderPenControls();
        }
    }
    
    loadMultiPenPreset(presetName) {
        const preset = this.multiPenPresets[presetName];
        if (!preset) return;
        
        // Load pens
        this.pens = preset.pens.map((penData, index) => ({
            ...this.createDefaultPen(index + 1),
            ...penData,
            id: index + 1,
            enabled: true
        }));
        
        // Load paper motion
        if (preset.paper) {
            this.paperMotion = { ...this.paperMotion, ...preset.paper };
            document.getElementById('paperMotionToggle').checked = preset.paper.enabled || false;
            document.getElementById('paperControls').style.display = preset.paper.enabled ? 'grid' : 'none';
        }
        
        // Load background
        if (preset.background) {
            this.globalSettings.background = preset.background;
            document.querySelectorAll('.background-option').forEach(opt => {
                opt.classList.toggle('active', opt.dataset.bg === preset.background);
            });
        }
        
        this.renderPenControls();
        this.updateUI();
        this.renderBackground();
        this.reset();
    }
    
    togglePlayPause() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }
    
    play() {
        this.isPlaying = true;
        document.getElementById('playIcon').classList.add('hidden');
        document.getElementById('pauseIcon').classList.remove('hidden');
        this.animate();
    }
    
    pause() {
        this.isPlaying = false;
        document.getElementById('playIcon').classList.remove('hidden');
        document.getElementById('pauseIcon').classList.add('hidden');
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
    
    reset() {
        this.pause();
        this.time = 0;
        this.pathHistory = [];
        this.ctx.clearRect(0, 0, this.drawingCanvas.width, this.drawingCanvas.height);
    }
    
    animate() {
        if (!this.isPlaying) return;
        
        this.time += 0.02 * this.globalSettings.speed;
        
        // Calculate positions for all enabled pens
        const currentPaths = [];
        let maxDamping = 0;
        
        this.pens.forEach(pen => {
            if (!pen.enabled) return;
            
            const dampingX = Math.exp(-pen.dampingX * this.time * 100);
            const dampingY = Math.exp(-pen.dampingY * this.time * 100);
            maxDamping = Math.max(maxDamping, Math.min(dampingX, dampingY));
            
            const x = pen.ax * this.globalSettings.amplitudeScale * 
                     Math.sin(pen.fx * this.time + pen.phaseX) * dampingX;
            const y = pen.ay * this.globalSettings.amplitudeScale * 
                     Math.sin(pen.fy * this.time + pen.phaseY) * dampingY;
            
            // Apply paper motion if enabled
            let finalX = x;
            let finalY = y;
            
            if (this.paperMotion.enabled) {
                const paperDamping = Math.exp(-this.paperMotion.rotationDamping * this.time * 100);
                const rotation = this.paperMotion.rotationAmplitude * 
                               Math.sin(this.paperMotion.rotationFrequency * this.time + this.paperMotion.rotationPhase) * 
                               paperDamping;
                
                const cos = Math.cos(rotation);
                const sin = Math.sin(rotation);
                finalX = x * cos - y * sin;
                finalY = x * sin + y * cos;
            }
            
            currentPaths.push({
                x: this.centerX + finalX,
                y: this.centerY + finalY,
                penId: pen.id,
                time: this.time
            });
        });
        
        // Store current paths
        this.pathHistory.push(currentPaths);
        
        // Keep path length manageable for performance
        if (this.pathHistory.length > 8000) {
            this.pathHistory = this.pathHistory.slice(-6000);
        }
        
        this.drawAllPens();
        
        // Continue animation if damping hasn't reduced amplitude too much
        if (maxDamping > 0.005 && this.isPlaying) {
            this.animationId = requestAnimationFrame(() => this.animate());
        } else if (this.isPlaying) {
            this.pause();
        }
    }
    
    drawAllPens() {
        // Clear the drawing canvas
        this.ctx.clearRect(0, 0, this.drawingCanvas.width, this.drawingCanvas.height);
        
        if (this.pathHistory.length < 2) return;
        
        // Group paths by pen for efficient drawing
        const penPaths = {};
        
        // Initialize pen paths
        this.pens.forEach(pen => {
            if (pen.enabled) {
                penPaths[pen.id] = [];
            }
        });
        
        // Organize path points by pen
        this.pathHistory.forEach(timeSlice => {
            timeSlice.forEach(position => {
                if (penPaths[position.penId]) {
                    penPaths[position.penId].push(position);
                }
            });
        });
        
        // Draw each pen's path
        Object.entries(penPaths).forEach(([penId, path]) => {
            if (path.length < 2) return;
            
            const pen = this.pens.find(p => p.id === parseInt(penId));
            if (pen) {
                this.drawPenPath(path, pen);
            }
        });
    }
    
    drawPenPath(path, pen) {
        // Set up drawing properties
        this.ctx.globalCompositeOperation = pen.blendMode;
        this.ctx.globalAlpha = pen.opacity;
        this.ctx.lineWidth = pen.strokeWidth;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        
        // Draw path segments
        for (let i = 1; i < path.length; i++) {
            const current = path[i];
            const previous = path[i - 1];
            
            // Calculate color based on gradient setting
            let color = pen.color;
            if (pen.gradient && path.length > 1) {
                const progress = i / path.length;
                color = this.interpolateColor(pen.color, pen.gradientEnd, progress);
            }
            
            this.ctx.strokeStyle = color;
            this.ctx.beginPath();
            this.ctx.moveTo(previous.x, previous.y);
            this.ctx.lineTo(current.x, current.y);
            this.ctx.stroke();
        }
        
        // Reset drawing state
        this.ctx.globalCompositeOperation = 'source-over';
        this.ctx.globalAlpha = 1.0;
    }
    
    redrawPaths() {
        if (this.pathHistory.length > 0) {
            this.drawAllPens();
        }
    }
    
    interpolateColor(color1, color2, factor) {
        const hex1 = color1.replace('#', '');
        const hex2 = color2.replace('#', '');
        
        const r1 = parseInt(hex1.substr(0, 2), 16);
        const g1 = parseInt(hex1.substr(2, 2), 16);
        const b1 = parseInt(hex1.substr(4, 2), 16);
        
        const r2 = parseInt(hex2.substr(0, 2), 16);
        const g2 = parseInt(hex2.substr(2, 2), 16);
        const b2 = parseInt(hex2.substr(4, 2), 16);
        
        const r = Math.round(r1 + (r2 - r1) * factor);
        const g = Math.round(g1 + (g2 - g1) * factor);
        const b = Math.round(b1 + (b2 - b1) * factor);
        
        return `rgb(${r}, ${g}, ${b})`;
    }
    
    renderBackground() {
        const bg = this.backgroundData[this.globalSettings.background];
        const ctx = this.bgCtx;
        const width = this.backgroundCanvas.width;
        const height = this.backgroundCanvas.height;
        
        ctx.clearRect(0, 0, width, height);
        
        switch (bg.type) {
            case 'radial_gradient_with_particles':
                this.renderNightSky(ctx, width, height, bg.colors);
                break;
            case 'mandala_pattern':
                this.renderMandala(ctx, width, height, bg.colors);
                break;
            case 'radial_mist':
                this.renderMist(ctx, width, height, bg.colors);
                break;
            case 'textured_paper':
                this.renderCharcoal(ctx, width, height, bg.colors);
                break;
            case 'enso_circle':
                this.renderEnso(ctx, width, height, bg.colors);
                break;
        }
    }
    
    renderNightSky(ctx, width, height, colors) {
        const gradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, width/2);
        gradient.addColorStop(0, colors[1]);
        gradient.addColorStop(1, colors[0]);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
        
        // Add particles
        ctx.fillStyle = colors[2] + '60';
        for (let i = 0; i < 50; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const size = Math.random() * 2 + 0.5;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    renderMandala(ctx, width, height, colors) {
        const gradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, width/2);
        gradient.addColorStop(0, colors[2]);
        gradient.addColorStop(0.7, colors[0]);
        gradient.addColorStop(1, colors[1]);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
        
        // Draw mandala pattern
        ctx.strokeStyle = colors[2] + '40';
        ctx.lineWidth = 1;
        const centerX = width / 2;
        const centerY = height / 2;
        
        for (let i = 0; i < 12; i++) {
            const angle = (i * Math.PI * 2) / 12;
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(centerX + Math.cos(angle) * width/3, centerY + Math.sin(angle) * height/3);
            ctx.stroke();
        }
        
        // Add circles
        for (let r = 50; r < width/2; r += 50) {
            ctx.beginPath();
            ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
            ctx.stroke();
        }
    }
    
    renderMist(ctx, width, height, colors) {
        const gradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, width/2);
        gradient.addColorStop(0, colors[1]);
        gradient.addColorStop(0.6, colors[0]);
        gradient.addColorStop(1, colors[2]);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
    }
    
    renderCharcoal(ctx, width, height, colors) {
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, colors[1]);
        gradient.addColorStop(0.5, colors[0]);
        gradient.addColorStop(1, colors[2]);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
        
        // Add texture
        for (let i = 0; i < 500; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const alpha = Math.random() * 0.1;
            ctx.fillStyle = `rgba(255,255,255,${alpha})`;
            ctx.fillRect(x, y, 1, 1);
        }
    }
    
    renderEnso(ctx, width, height, colors) {
        ctx.fillStyle = colors[0];
        ctx.fillRect(0, 0, width, height);
        
        // Draw enso circle
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(width, height) * 0.3;
        
        ctx.strokeStyle = colors[2] + '30';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 1.75);
        ctx.stroke();
    }
    
    updateUI() {
        // Update global sliders
        document.getElementById('globalSpeedSlider').value = this.globalSettings.speed;
        document.getElementById('globalSpeedValue').textContent = this.globalSettings.speed.toFixed(1);
        
        document.getElementById('globalAmplitudeSlider').value = this.globalSettings.amplitudeScale;
        document.getElementById('globalAmplitudeValue').textContent = this.globalSettings.amplitudeScale.toFixed(1);
        
        document.getElementById('phaseLockToggle').checked = this.globalSettings.phaseLock;
        
        // Update paper motion controls
        document.getElementById('paperMotionToggle').checked = this.paperMotion.enabled;
        document.getElementById('paperControls').style.display = this.paperMotion.enabled ? 'grid' : 'none';
        
        document.getElementById('paperRotAmplitudeSlider').value = this.paperMotion.rotationAmplitude;
        document.getElementById('paperRotAmplitudeValue').textContent = this.paperMotion.rotationAmplitude.toFixed(1);
        
        document.getElementById('paperRotFreqSlider').value = this.paperMotion.rotationFrequency;
        document.getElementById('paperRotFreqValue').textContent = this.paperMotion.rotationFrequency.toFixed(1);
        
        document.getElementById('paperRotDampingSlider').value = this.paperMotion.rotationDamping;
        document.getElementById('paperRotDampingValue').textContent = this.paperMotion.rotationDamping.toFixed(4);
        
        // Update background selection
        document.querySelectorAll('.background-option').forEach(opt => {
            opt.classList.toggle('active', opt.dataset.bg === this.globalSettings.background);
        });
    }
    
    saveImage() {
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        
        tempCanvas.width = this.drawingCanvas.width;
        tempCanvas.height = this.drawingCanvas.height;
        
        // Draw background
        tempCtx.drawImage(this.backgroundCanvas, 0, 0);
        // Draw pendulum paths
        tempCtx.drawImage(this.drawingCanvas, 0, 0);
        
        // Download the image
        const link = document.createElement('a');
        link.download = `multi-pendulum-${Date.now()}.png`;
        link.href = tempCanvas.toDataURL();
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new MultiPendulumHarmonograph();
});