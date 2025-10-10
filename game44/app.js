class CheckerboardApp {
    constructor() {
        this.canvas = document.getElementById('checkerboardCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Grid configuration
        this.config = {
            totalSize: 12,
            setSize: 3,
            setsCount: 4,
            colors: {
                black: '#000000',
                white: '#ffffff'
            }
        };
        
        // Direction definitions
        this.directions = [
            {value: "none", text: "停止", symbol: "⏸"},
            {value: "right", text: "右", symbol: "→"},
            {value: "left", text: "左", symbol: "←"},
            {value: "down", text: "下", symbol: "↓"},
            {value: "up", text: "上", symbol: "↑"}
        ];
        
        // Presets
        this.presets = [
            {
                name: "全停止",
                pattern: Array(16).fill("none")
            },
            {
                name: "右流れ",
                pattern: Array(16).fill("right")
            },
            {
                name: "渦巻き",
                pattern: ["right", "right", "right", "left", "down", "none", "none", "up", "down", "none", "none", "up", "right", "left", "left", "left"]
            },
            {
                name: "波模様",
                pattern: ["right", "left", "right", "left", "left", "right", "left", "right", "right", "left", "right", "left", "left", "right", "left", "right"]
            }
        ];
        
        // Animation state
        this.setDirections = Array(16).fill("none");
        this.setOffsets = Array(16).fill().map(() => ({x: 0, y: 0}));
        this.animationSpeed = 0.5; // ピクセル/フレーム
        this.animationId = null;
        
        // Canvas dimensions
        this.cellSize = 30;
        this.canvasSize = this.config.totalSize * this.cellSize;
        
        // 2マス周期の計算
        this.scrollPeriod = this.cellSize * 2; // 市松模様の2マス分の距離
        
        this.pattern = null;

        this.init();
    }

    init() {
        this.setupCanvas();
        this.createControls();
        this.bindEvents();
        this.startAnimation();
    }
    
    setupCanvas() {
        this.canvas.width = this.canvasSize;
        this.canvas.height = this.canvasSize;
        this.canvas.style.width = this.canvasSize + 'px';
        this.canvas.style.height = this.canvasSize + 'px';

        // アンチエイリアスを無効にしてピクセルパーフェクトな描画を確保
        this.ctx.imageSmoothingEnabled = false;

        this.createCheckerboardPattern();
    }

    createCheckerboardPattern() {
        const patternCanvas = document.createElement('canvas');
        patternCanvas.width = this.scrollPeriod;
        patternCanvas.height = this.scrollPeriod;

        const patternCtx = patternCanvas.getContext('2d');
        patternCtx.imageSmoothingEnabled = false;

        for (let row = 0; row < 2; row++) {
            for (let col = 0; col < 2; col++) {
                const color = this.getCheckerboardColor(col, row);
                patternCtx.fillStyle = color;
                patternCtx.fillRect(
                    col * this.cellSize,
                    row * this.cellSize,
                    this.cellSize,
                    this.cellSize
                );
            }
        }

        this.pattern = this.ctx.createPattern(patternCanvas, 'repeat');
    }
    
    createControls() {
        const controlGrid = document.querySelector('.control-grid');
        controlGrid.innerHTML = '';
        
        for (let setRow = 0; setRow < this.config.setsCount; setRow++) {
            for (let setCol = 0; setCol < this.config.setsCount; setCol++) {
                const setIndex = setRow * this.config.setsCount + setCol;
                const setControl = this.createSetControl(setIndex, setRow + 1, setCol + 1);
                controlGrid.appendChild(setControl);
            }
        }
    }
    
    createSetControl(setIndex, row, col) {
        const setControl = document.createElement('div');
        setControl.className = 'set-control';
        
        const label = document.createElement('div');
        label.className = 'set-label';
        label.textContent = `[${row},${col}]`;
        
        const directionButtons = document.createElement('div');
        directionButtons.className = 'direction-buttons';
        
        // Create direction buttons
        this.directions.forEach(direction => {
            const button = document.createElement('button');
            button.className = `direction-btn direction-btn--${direction.value === 'none' ? 'stop' : direction.value}`;
            button.textContent = direction.symbol;
            button.title = direction.text;
            button.dataset.setIndex = setIndex;
            button.dataset.direction = direction.value;
            
            if (direction.value === 'none') {
                button.classList.add('active');
            }
            
            button.addEventListener('click', (e) => {
                this.setDirection(setIndex, direction.value);
                this.updateControlButtons(setIndex);
            });
            
            directionButtons.appendChild(button);
        });
        
        setControl.appendChild(label);
        setControl.appendChild(directionButtons);
        
        return setControl;
    }
    
    bindEvents() {
        // Preset buttons
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const presetIndex = parseInt(e.target.dataset.preset);
                this.applyPreset(presetIndex);
            });
        });
        
        // Stop all button
        document.getElementById('stopAllBtn').addEventListener('click', () => {
            this.stopAll();
        });
    }
    
    setDirection(setIndex, direction) {
        this.setDirections[setIndex] = direction;

        const offset = this.setOffsets[setIndex];

        if (!offset) {
            return;
        }

        if (direction === 'none') {
            offset.x = 0;
            offset.y = 0;
            return;
        }

        const isHorizontal = direction === 'right' || direction === 'left';
        const activeAxis = isHorizontal ? 'x' : 'y';
        const inactiveAxis = isHorizontal ? 'y' : 'x';

        // reset the axis that is not used for the new direction
        offset[inactiveAxis] = 0;

        // Find another set moving in the same direction to synchronize offsets
        const syncIndex = this.setDirections.findIndex((dir, idx) => idx !== setIndex && dir === direction);

        if (syncIndex !== -1) {
            const sourceOffset = this.setOffsets[syncIndex];
            offset.x = sourceOffset.x;
            offset.y = sourceOffset.y;
        } else {
            // keep the current offset on the active axis within the scroll period range
            offset[activeAxis] = offset[activeAxis] % this.scrollPeriod;
        }
    }
    
    updateControlButtons(setIndex) {
        const setControl = document.querySelectorAll('.set-control')[setIndex];
        const buttons = setControl.querySelectorAll('.direction-btn');
        
        buttons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.direction === this.setDirections[setIndex]) {
                btn.classList.add('active');
            }
        });
    }
    
    applyPreset(presetIndex) {
        const preset = this.presets[presetIndex];

        preset.pattern.forEach((direction, index) => {
            this.setDirection(index, direction);
        });

        // Update all control buttons
        for (let i = 0; i < 16; i++) {
            this.updateControlButtons(i);
        }
    }
    
    stopAll() {
        this.setDirections.fill('none');
        this.setOffsets.forEach(offset => {
            offset.x = 0;
            offset.y = 0;
        });
        for (let i = 0; i < 16; i++) {
            this.updateControlButtons(i);
        }
    }
    
    getCheckerboardColor(x, y) {
        return (x + y) % 2 === 0 ? this.config.colors.black : this.config.colors.white;
    }
    
    drawSet(setRow, setCol) {
        const setIndex = setRow * this.config.setsCount + setCol;
        const direction = this.setDirections[setIndex];
        const offset = this.setOffsets[setIndex];

        const setPixelSize = this.cellSize * this.config.setSize;
        const startX = setCol * setPixelSize;
        const startY = setRow * setPixelSize;

        // セット領域をクリップ
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.rect(startX, startY, setPixelSize, setPixelSize);
        this.ctx.clip();

        let translateX = 0;
        let translateY = 0;

        switch (direction) {
            case 'right':
                translateX = -offset.x;
                break;
            case 'left':
                translateX = offset.x;
                break;
            case 'down':
                translateY = -offset.y;
                break;
            case 'up':
                translateY = offset.y;
                break;
        }

        this.ctx.save();
        this.ctx.translate(translateX, translateY);

        if (this.pattern) {
            const baseOffsetX = startX % this.scrollPeriod;
            const baseOffsetY = startY % this.scrollPeriod;
            const fillX = startX - translateX - baseOffsetX - this.scrollPeriod;
            const fillY = startY - translateY - baseOffsetY - this.scrollPeriod;
            const fillWidth = setPixelSize + this.scrollPeriod * 3;
            const fillHeight = setPixelSize + this.scrollPeriod * 3;

            this.ctx.fillStyle = this.pattern;
            this.ctx.fillRect(fillX, fillY, fillWidth, fillHeight);
        }

        this.ctx.restore();
        this.ctx.restore();

        // セット境界線を描画
        this.ctx.strokeStyle = '#888888';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(startX + 0.5, startY + 0.5, setPixelSize - 1, setPixelSize - 1);
    }
    
    // 2マス周期の正確な実装
    updateScroll(setIndex, direction) {
        const speed = this.animationSpeed;
        const period = this.scrollPeriod; // 2 * this.cellSize
        const offset = this.setOffsets[setIndex];

        switch(direction) {
            case 'right':
                offset.x = (offset.x + speed) % period;
                offset.y = 0;
                break;
            case 'left':
                offset.x = (offset.x + speed) % period;
                offset.y = 0;
                break;
            case 'down':
                offset.y = (offset.y + speed) % period;
                offset.x = 0;
                break;
            case 'up':
                offset.y = (offset.y + speed) % period;
                offset.x = 0;
                break;
        }
    }
    
    updateAnimation() {
        for (let i = 0; i < 16; i++) {
            const direction = this.setDirections[i];
            if (direction !== 'none') {
                this.updateScroll(i, direction);
            }
        }
    }
    
    draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvasSize, this.canvasSize);
        
        // Draw each set
        for (let setRow = 0; setRow < this.config.setsCount; setRow++) {
            for (let setCol = 0; setCol < this.config.setsCount; setCol++) {
                this.drawSet(setRow, setCol);
            }
        }
    }
    
    animate() {
        this.updateAnimation();
        this.draw();
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    startAnimation() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        this.animate();
    }
    
    stopAnimation() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CheckerboardApp();
});