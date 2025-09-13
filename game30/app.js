class ZenPendulumArt {
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
        this.path = [];
        
        // Parameters
        this.params = {
            fx: 3, fy: 2,
            ax: 150, ay: 150,
            phaseX: 0, phaseY: 0,
            damping: 0.001,
            strokeWidth: 2,
            speed: 1,
            gradient: true,
            startColor: '#ff4757',
            endColor: '#3742fa',
            background: 'nightsky'
        };
        
        // Background data
        this.backgrounds = {
            nightsky: { colors: ['#0a0a1a', '#1a1a2e', '#16213e'], type: 'radial_gradient_with_particles' },
            mandala: { colors: ['#2d1b69', '#11082f', '#433878'], type: 'mandala_pattern' },
            mist: { colors: ['#2c2c2c', '#3d3d3d', '#1a1a1a'], type: 'radial_mist' },
            charcoal: { colors: ['#1a1a1a', '#2a2a2a', '#333333'], type: 'textured_paper' },
            enso: { colors: ['#f5f5f5', '#e8e8e8', '#333333'], type: 'enso_circle' }
        };
        
        this.init();
    }
    
    init() {
        this.setupCanvas();
        this.setupEventListeners();
        this.renderBackground();
        this.updateUI();
    }
    
    setupCanvas() {
        const container = document.querySelector('.canvas-container');
        const rect = container.getBoundingClientRect();
        const size = Math.min(rect.width, rect.height, 600);
        
        this.backgroundCanvas.width = size;
        this.backgroundCanvas.height = size;
        this.drawingCanvas.width = size;
        this.drawingCanvas.height = size;
        
        // Set canvas display size
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
        
        // Background selector
        document.querySelectorAll('.background-option').forEach(option => {
            option.addEventListener('click', (e) => {
                document.querySelectorAll('.background-option').forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');
                this.params.background = option.dataset.bg;
                this.renderBackground();
            });
        });
        
        // Frequency presets
        document.querySelectorAll('.frequency-presets .preset-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.frequency-presets .preset-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.params.fx = parseInt(btn.dataset.fx);
                this.params.fy = parseInt(btn.dataset.fy);
                this.reset();
            });
        });
        
        // Parameter sliders
        this.setupSlider('axSlider', 'axValue', 'ax');
        this.setupSlider('aySlider', 'ayValue', 'ay');
        this.setupSlider('dampingSlider', 'dampingValue', 'damping', 4);
        this.setupSlider('speedSlider', 'speedValue', 'speed', 1);
        this.setupSlider('strokeWidthSlider', 'strokeWidthValue', 'strokeWidth', 1);
        
        // Phase control
        const phaseCircle = document.getElementById('phaseCircle');
        phaseCircle.addEventListener('click', (e) => this.handlePhaseClick(e));
        
        // Gradient toggle
        document.getElementById('gradientToggle').addEventListener('change', (e) => {
            this.params.gradient = e.target.checked;
        });
        
        // Color presets
        document.querySelectorAll('.color-preset').forEach(preset => {
            preset.addEventListener('click', (e) => {
                document.querySelectorAll('.color-preset').forEach(p => p.classList.remove('active'));
                preset.classList.add('active');
                this.params.startColor = preset.dataset.start;
                this.params.endColor = preset.dataset.end;
            });
        });
        
        // Art presets
        document.querySelectorAll('.art-presets .preset-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.loadArtPreset(btn.dataset.preset));
        });
        
        // Window resize
        window.addEventListener('resize', () => {
            setTimeout(() => {
                this.setupCanvas();
                this.renderBackground();
                this.redrawPath();
            }, 100);
        });
    }
    
    setupSlider(sliderId, valueId, paramKey, decimals = 0) {
        const slider = document.getElementById(sliderId);
        const valueDisplay = document.getElementById(valueId);
        
        if (slider && valueDisplay) {
            slider.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                this.params[paramKey] = value;
                valueDisplay.textContent = decimals > 0 ? value.toFixed(decimals) : Math.round(value);
            });
        }
    }
    
    handlePhaseClick(e) {
        const rect = e.target.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const x = e.clientX - centerX;
        const y = e.clientY - centerY;
        
        const angle = Math.atan2(y, x);
        this.params.phaseX = angle;
        this.params.phaseY = angle + Math.PI / 2;
        
        this.updatePhaseDisplay();
        this.reset();
    }
    
    updatePhaseDisplay() {
        const indicator = document.getElementById('phaseIndicator');
        const phaseXValue = document.getElementById('phaseXValue');
        const phaseYValue = document.getElementById('phaseYValue');
        
        if (indicator && phaseXValue && phaseYValue) {
            const phaseXDeg = (this.params.phaseX * 180 / Math.PI).toFixed(0);
            const phaseYDeg = (this.params.phaseY * 180 / Math.PI).toFixed(0);
            
            const radius = 40;
            const x = Math.cos(this.params.phaseX) * radius;
            const y = Math.sin(this.params.phaseX) * radius;
            
            indicator.style.transform = `translate(${x}px, ${y}px)`;
            
            phaseXValue.textContent = phaseXDeg + '°';
            phaseYValue.textContent = phaseYDeg + '°';
        }
    }
    
    renderBackground() {
        const bg = this.backgrounds[this.params.background];
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
        this.path = [];
        this.ctx.clearRect(0, 0, this.drawingCanvas.width, this.drawingCanvas.height);
    }
    
    animate() {
        if (!this.isPlaying) return;
        
        this.time += 0.02 * this.params.speed;
        
        // Calculate pendulum position using harmonograph equations
        const dampingFactor = Math.exp(-this.params.damping * this.time * 100);
        const x = this.params.ax * Math.sin(this.params.fx * this.time + this.params.phaseX) * dampingFactor;
        const y = this.params.ay * Math.sin(this.params.fy * this.time + this.params.phaseY) * dampingFactor;
        
        const canvasX = this.centerX + x;
        const canvasY = this.centerY + y;
        
        this.path.push({ x: canvasX, y: canvasY, time: this.time });
        
        // Keep path length manageable for performance
        if (this.path.length > 10000) {
            this.path = this.path.slice(-8000);
        }
        
        this.drawPendulum();
        
        // Continue animation if damping hasn't reduced amplitude too much
        if (dampingFactor > 0.01 && this.isPlaying) {
            this.animationId = requestAnimationFrame(() => this.animate());
        } else if (this.isPlaying) {
            this.pause();
        }
    }
    
    drawPendulum() {
        // Clear the drawing canvas
        this.ctx.clearRect(0, 0, this.drawingCanvas.width, this.drawingCanvas.height);
        
        if (this.path.length < 2) return;
        
        // Set up drawing properties
        this.ctx.lineWidth = this.params.strokeWidth;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.globalCompositeOperation = 'screen';
        
        // Draw each segment of the path
        for (let i = 1; i < this.path.length; i++) {
            const point = this.path[i];
            const prevPoint = this.path[i - 1];
            
            // Calculate color based on gradient setting
            if (this.params.gradient) {
                const progress = i / this.path.length;
                const color = this.interpolateColor(this.params.startColor, this.params.endColor, progress);
                this.ctx.strokeStyle = color;
            } else {
                this.ctx.strokeStyle = this.params.startColor;
            }
            
            // Draw line segment
            this.ctx.beginPath();
            this.ctx.moveTo(prevPoint.x, prevPoint.y);
            this.ctx.lineTo(point.x, point.y);
            this.ctx.stroke();
        }
        
        // Reset composite operation
        this.ctx.globalCompositeOperation = 'source-over';
    }
    
    redrawPath() {
        // Redraw the existing path after canvas resize
        if (this.path.length > 0) {
            this.drawPendulum();
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
    
    loadArtPreset(presetName) {
        const presets = {
            'zen-flower': {
                background: 'enso', fx: 5, fy: 4, ax: 150, ay: 150,
                phaseX: 0, phaseY: 1.57, damping: 0.001, strokeWidth: 2,
                gradient: true, startColor: '#2ed573', endColor: '#1e3799'
            },
            'night-dance': {
                background: 'nightsky', fx: 3, fy: 2, ax: 180, ay: 120,
                phaseX: 0, phaseY: 0, damping: 0.0005, strokeWidth: 1.5,
                gradient: true, startColor: '#3742fa', endColor: '#ff4757'
            },
            'meditation-circle': {
                background: 'mandala', fx: 1, fy: 1, ax: 200, ay: 200,
                phaseX: 0, phaseY: 0, damping: 0, strokeWidth: 3,
                gradient: false, startColor: '#feca57', endColor: '#feca57'
            }
        };
        
        const preset = presets[presetName];
        if (preset) {
            this.params = { ...this.params, ...preset };
            this.updateUI();
            this.renderBackground();
            this.reset();
        }
    }
    
    updateUI() {
        // Update sliders
        const sliders = {
            'axSlider': this.params.ax,
            'aySlider': this.params.ay,
            'dampingSlider': this.params.damping,
            'speedSlider': this.params.speed,
            'strokeWidthSlider': this.params.strokeWidth
        };
        
        Object.entries(sliders).forEach(([id, value]) => {
            const slider = document.getElementById(id);
            if (slider) slider.value = value;
        });
        
        // Update value displays
        const displays = {
            'axValue': Math.round(this.params.ax),
            'ayValue': Math.round(this.params.ay),
            'dampingValue': this.params.damping.toFixed(4),
            'speedValue': this.params.speed.toFixed(1),
            'strokeWidthValue': this.params.strokeWidth.toFixed(1)
        };
        
        Object.entries(displays).forEach(([id, value]) => {
            const display = document.getElementById(id);
            if (display) display.textContent = value;
        });
        
        // Update checkbox
        const gradientToggle = document.getElementById('gradientToggle');
        if (gradientToggle) gradientToggle.checked = this.params.gradient;
        
        // Update active states
        document.querySelectorAll('.background-option').forEach(opt => {
            opt.classList.toggle('active', opt.dataset.bg === this.params.background);
        });
        
        document.querySelectorAll('.frequency-presets .preset-btn').forEach(btn => {
            const isActive = btn.dataset.fx == this.params.fx && btn.dataset.fy == this.params.fy;
            btn.classList.toggle('active', isActive);
        });
        
        this.updatePhaseDisplay();
    }
    
    saveImage() {
        // Create a temporary canvas combining background and drawing
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        
        tempCanvas.width = this.drawingCanvas.width;
        tempCanvas.height = this.drawingCanvas.height;
        
        // Draw background
        tempCtx.drawImage(this.backgroundCanvas, 0, 0);
        // Draw pendulum path
        tempCtx.drawImage(this.drawingCanvas, 0, 0);
        
        // Download the image
        const link = document.createElement('a');
        link.download = `zen-pendulum-${Date.now()}.png`;
        link.href = tempCanvas.toDataURL();
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ZenPendulumArt();
});