// Spirograph Generator Application
class SpirographGenerator {
    constructor() {
        this.canvas = document.getElementById('spirograph-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.animationId = null;
        this.isAnimating = false;
        this.isPaused = false;
        this.currentAngle = 0;
        this.points = [];
        
        // Presets data
        this.presets = [
            {"name": "Classic Rose", "type": "hypotrochoid", "R": 120, "r": 60, "d": 80, "color": "#ff6b9d"},
            {"name": "Flower Burst", "type": "epitrochoid", "R": 150, "r": 30, "d": 70, "color": "#4ecdc4"},
            {"name": "Star Pattern", "type": "hypotrochoid", "R": 100, "r": 25, "d": 90, "color": "#ffe66d"},
            {"name": "Complex Web", "type": "epitrochoid", "R": 180, "r": 45, "d": 60, "color": "#a8e6cf"},
            {"name": "Simple Circle", "type": "hypotrochoid", "R": 80, "r": 40, "d": 20, "color": "#ff8b94"},
            {"name": "Delicate Lace", "type": "hypotrochoid", "R": 140, "r": 84, "d": 50, "color": "#b4a7d6"}
        ];
        
        // Default settings
        this.settings = {
            R: 120,
            r: 60,
            d: 80,
            speed: 1.0,
            lineWidth: 2,
            lineColor: "#00aaff",
            backgroundColor: "#1a1a1a",
            type: "hypotrochoid"
        };
        
        this.initCanvas();
        this.bindEvents();
        this.updateControls();
    }
    
    initCanvas() {
        // Set canvas size with high-DPI support
        const rect = this.canvas.parentElement.getBoundingClientRect();
        const size = Math.min(rect.width - 48, rect.height - 48, 800);
        
        this.canvas.width = size * window.devicePixelRatio;
        this.canvas.height = size * window.devicePixelRatio;
        this.canvas.style.width = size + 'px';
        this.canvas.style.height = size + 'px';
        
        this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        this.centerX = size / 2;
        this.centerY = size / 2;
        
        this.clearCanvas();
    }
    
    bindEvents() {
        // Control elements
        const elements = {
            patternType: document.querySelectorAll('input[name="patternType"]'),
            outerRadius: document.getElementById('outer-radius'),
            innerRadius: document.getElementById('inner-radius'),
            penDistance: document.getElementById('pen-distance'),
            animationSpeed: document.getElementById('animation-speed'),
            lineWidth: document.getElementById('line-width'),
            lineColor: document.getElementById('line-color'),
            backgroundColor: document.getElementById('background-color'),
            presetSelect: document.getElementById('preset-select'),
            startBtn: document.getElementById('start-btn'),
            pauseBtn: document.getElementById('pause-btn'),
            resetBtn: document.getElementById('reset-btn'),
            saveBtn: document.getElementById('save-btn')
        };
        
        // Pattern type radio buttons
        elements.patternType.forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.settings.type = e.target.value;
                this.updatePreview();
            });
        });
        
        // Sliders with real-time updates
        elements.outerRadius.addEventListener('input', (e) => {
            this.settings.R = parseInt(e.target.value);
            document.getElementById('outer-radius-value').textContent = e.target.value;
            this.updatePreview();
        });
        
        elements.innerRadius.addEventListener('input', (e) => {
            this.settings.r = parseInt(e.target.value);
            document.getElementById('inner-radius-value').textContent = e.target.value;
            this.updatePreview();
        });
        
        elements.penDistance.addEventListener('input', (e) => {
            this.settings.d = parseInt(e.target.value);
            document.getElementById('pen-distance-value').textContent = e.target.value;
            this.updatePreview();
        });
        
        elements.animationSpeed.addEventListener('input', (e) => {
            this.settings.speed = parseFloat(e.target.value);
            document.getElementById('speed-value').textContent = e.target.value;
        });
        
        elements.lineWidth.addEventListener('input', (e) => {
            this.settings.lineWidth = parseInt(e.target.value);
            document.getElementById('line-width-value').textContent = e.target.value;
            this.updatePreview();
        });
        
        // Color inputs
        elements.lineColor.addEventListener('input', (e) => {
            this.settings.lineColor = e.target.value;
            this.updatePreview();
        });
        
        elements.backgroundColor.addEventListener('input', (e) => {
            this.settings.backgroundColor = e.target.value;
            this.canvas.style.backgroundColor = e.target.value;
            this.updatePreview();
        });
        
        // Preset selector
        elements.presetSelect.addEventListener('change', (e) => {
            if (e.target.value !== '') {
                this.applyPreset(parseInt(e.target.value));
            }
        });
        
        // Control buttons
        elements.startBtn.addEventListener('click', () => this.startAnimation());
        elements.pauseBtn.addEventListener('click', () => this.pauseAnimation());
        elements.resetBtn.addEventListener('click', () => this.resetAnimation());
        elements.saveBtn.addEventListener('click', () => this.saveImage());
        
        // Window resize
        window.addEventListener('resize', () => {
            this.initCanvas();
            this.redrawPoints();
        });
    }
    
    updateControls() {
        // Update all control values
        document.getElementById('outer-radius').value = this.settings.R;
        document.getElementById('outer-radius-value').textContent = this.settings.R;
        document.getElementById('inner-radius').value = this.settings.r;
        document.getElementById('inner-radius-value').textContent = this.settings.r;
        document.getElementById('pen-distance').value = this.settings.d;
        document.getElementById('pen-distance-value').textContent = this.settings.d;
        document.getElementById('animation-speed').value = this.settings.speed;
        document.getElementById('speed-value').textContent = this.settings.speed;
        document.getElementById('line-width').value = this.settings.lineWidth;
        document.getElementById('line-width-value').textContent = this.settings.lineWidth;
        document.getElementById('line-color').value = this.settings.lineColor;
        document.getElementById('background-color').value = this.settings.backgroundColor;
        
        // Update pattern type radio
        document.querySelector(`input[name="patternType"][value="${this.settings.type}"]`).checked = true;
        
        // Update canvas background
        this.canvas.style.backgroundColor = this.settings.backgroundColor;
    }
    
    applyPreset(index) {
        const preset = this.presets[index];
        if (!preset) return;
        
        this.settings.R = preset.R;
        this.settings.r = preset.r;
        this.settings.d = preset.d;
        this.settings.type = preset.type;
        this.settings.lineColor = preset.color;
        
        this.updateControls();
        this.updatePreview();
        
        // Reset preset selector
        document.getElementById('preset-select').value = '';
    }
    
    calculatePoint(angle) {
        const { R, r, d, type } = this.settings;
        let x, y;
        
        if (type === 'hypotrochoid') {
            // Inner spirograph
            x = (R - r) * Math.cos(angle) + d * Math.cos((R - r) / r * angle);
            y = (R - r) * Math.sin(angle) - d * Math.sin((R - r) / r * angle);
        } else {
            // Outer spirograph (epitrochoid)
            x = (R + r) * Math.cos(angle) + d * Math.cos((R + r) / r * angle);
            y = (R + r) * Math.sin(angle) - d * Math.sin((R + r) / r * angle);
        }
        
        return {
            x: this.centerX + x,
            y: this.centerY + y
        };
    }
    
    calculateCycleLength() {
        const { R, r } = this.settings;
        const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
        const lcm = (a, b) => (a * b) / gcd(a, b);
        return 2 * Math.PI * lcm(R, r) / r;
    }
    
    clearCanvas() {
        this.ctx.fillStyle = this.settings.backgroundColor;
        this.ctx.fillRect(0, 0, this.canvas.width / window.devicePixelRatio, this.canvas.height / window.devicePixelRatio);
    }
    
    updatePreview() {
        if (!this.isAnimating) {
            this.points = [];
            this.currentAngle = 0;
            this.clearCanvas();
            
            // Draw a few points to show preview
            const previewPoints = 100;
            const angleStep = this.calculateCycleLength() / previewPoints;
            
            this.ctx.strokeStyle = this.settings.lineColor;
            this.ctx.lineWidth = this.settings.lineWidth;
            this.ctx.lineCap = 'round';
            this.ctx.lineJoin = 'round';
            this.ctx.globalAlpha = 0.3;
            
            this.ctx.beginPath();
            for (let i = 0; i <= previewPoints; i++) {
                const point = this.calculatePoint(i * angleStep);
                if (i === 0) {
                    this.ctx.moveTo(point.x, point.y);
                } else {
                    this.ctx.lineTo(point.x, point.y);
                }
            }
            this.ctx.stroke();
            this.ctx.globalAlpha = 1;
        }
    }
    
    redrawPoints() {
        if (this.points.length === 0) return;
        
        this.clearCanvas();
        this.ctx.strokeStyle = this.settings.lineColor;
        this.ctx.lineWidth = this.settings.lineWidth;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        
        this.ctx.beginPath();
        this.points.forEach((point, index) => {
            if (index === 0) {
                this.ctx.moveTo(point.x, point.y);
            } else {
                this.ctx.lineTo(point.x, point.y);
            }
        });
        this.ctx.stroke();
    }
    
    animate() {
        if (!this.isAnimating || this.isPaused) return;
        
        const cycleLength = this.calculateCycleLength();
        const angleStep = this.settings.speed * 0.02;
        
        // Calculate current point
        const point = this.calculatePoint(this.currentAngle);
        this.points.push(point);
        
        // Draw line to new point
        this.ctx.strokeStyle = this.settings.lineColor;
        this.ctx.lineWidth = this.settings.lineWidth;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        
        if (this.points.length > 1) {
            const prevPoint = this.points[this.points.length - 2];
            this.ctx.beginPath();
            this.ctx.moveTo(prevPoint.x, prevPoint.y);
            this.ctx.lineTo(point.x, point.y);
            this.ctx.stroke();
        }
        
        this.currentAngle += angleStep;
        
        // Update progress
        const progress = Math.min((this.currentAngle / cycleLength) * 100, 100);
        document.getElementById('progress-info').textContent = `${progress.toFixed(1)}%`;
        
        // Check if cycle is complete
        if (this.currentAngle >= cycleLength) {
            this.completeAnimation();
            return;
        }
        
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    startAnimation() {
        if (this.isPaused) {
            this.isPaused = false;
            this.isAnimating = true;
            this.updateAnimationStatus('アニメーション中', 'success');
            this.animate();
        } else {
            this.resetAnimation();
            this.isAnimating = true;
            this.currentAngle = 0;
            this.points = [];
            this.clearCanvas();
            this.updateAnimationStatus('アニメーション中', 'success');
            this.animate();
        }
        
        this.updateButtons();
    }
    
    pauseAnimation() {
        this.isPaused = true;
        this.isAnimating = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        this.updateAnimationStatus('一時停止', 'warning');
        this.updateButtons();
    }
    
    resetAnimation() {
        this.isAnimating = false;
        this.isPaused = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        this.currentAngle = 0;
        this.points = [];
        this.clearCanvas();
        this.updatePreview();
        this.updateAnimationStatus('待機中', 'info');
        document.getElementById('progress-info').textContent = '0%';
        this.updateButtons();
    }
    
    completeAnimation() {
        this.isAnimating = false;
        this.isPaused = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        this.updateAnimationStatus('完了', 'success');
        document.getElementById('progress-info').textContent = '100%';
        this.updateButtons();
    }
    
    updateAnimationStatus(text, type) {
        const statusElement = document.getElementById('animation-status');
        statusElement.textContent = text;
        statusElement.className = `status status--${type}`;
    }
    
    updateButtons() {
        const startBtn = document.getElementById('start-btn');
        const pauseBtn = document.getElementById('pause-btn');
        const resetBtn = document.getElementById('reset-btn');
        
        if (this.isAnimating) {
            startBtn.disabled = true;
            pauseBtn.disabled = false;
            resetBtn.disabled = false;
        } else if (this.isPaused) {
            startBtn.textContent = '再開';
            startBtn.disabled = false;
            pauseBtn.disabled = true;
            resetBtn.disabled = false;
        } else {
            startBtn.textContent = '開始';
            startBtn.disabled = false;
            pauseBtn.disabled = true;
            resetBtn.disabled = false;
        }
    }
    
    saveImage() {
        const link = document.createElement('a');
        link.download = `spirograph-${Date.now()}.png`;
        link.href = this.canvas.toDataURL('image/png');
        link.click();
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SpirographGenerator();
});