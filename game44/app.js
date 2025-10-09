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
        this.setDirections = [...preset.pattern];
        
        // Update all control buttons
        for (let i = 0; i < 16; i++) {
            this.updateControlButtons(i);
        }
    }
    
    stopAll() {
        this.setDirections.fill('none');
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
        
        // 2マス周期でのオフセット計算
        let drawOffsetX = 0;
        let drawOffsetY = 0;
        
        switch (direction) {
            case 'right':
                drawOffsetX = -offset.x;
                break;
            case 'left':
                drawOffsetX = offset.x;
                break;
            case 'down':
                drawOffsetY = -offset.y;
                break;
            case 'up':
                drawOffsetY = offset.y;
                break;
        }
        
        // 拡張エリアを描画（シームレスなループのため）
        const extendSize = Math.ceil(this.scrollPeriod / this.cellSize) + this.config.setSize;
        
        for (let row = -extendSize; row < extendSize; row++) {
            for (let col = -extendSize; col < extendSize; col++) {
                // 描画位置を計算（ピクセルパーフェクトにするため整数化）
                const drawX = Math.round(startX + col * this.cellSize + drawOffsetX);
                const drawY = Math.round(startY + row * this.cellSize + drawOffsetY);
                
                // グローバル座標での市松計算（オフセットを考慮）
                let globalCol = setCol * this.config.setSize + col;
                let globalRow = setRow * this.config.setSize + row;
                
                // 2マス周期のオフセット補正
                const cellOffsetX = Math.floor(offset.x / this.cellSize);
                const cellOffsetY = Math.floor(offset.y / this.cellSize);
                
                switch (direction) {
                    case 'right':
                        globalCol += cellOffsetX;
                        break;
                    case 'left':
                        globalCol -= cellOffsetX;
                        break;
                    case 'down':
                        globalRow += cellOffsetY;
                        break;
                    case 'up':
                        globalRow -= cellOffsetY;
                        break;
                }
                
                const color = this.getCheckerboardColor(globalCol, globalRow);
                
                // セル描画
                this.ctx.fillStyle = color;
                this.ctx.fillRect(drawX, drawY, this.cellSize, this.cellSize);
            }
        }
        
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
        
        switch(direction) {
            case 'right':
                this.setOffsets[setIndex].x += speed;
                if (this.setOffsets[setIndex].x >= period) {
                    this.setOffsets[setIndex].x = 0; // 2マス進んだらリセット
                }
                break;
            case 'left':
                this.setOffsets[setIndex].x += speed;
                if (this.setOffsets[setIndex].x >= period) {
                    this.setOffsets[setIndex].x = 0; // 2マス進んだらリセット
                }
                break;
            case 'down':
                this.setOffsets[setIndex].y += speed;
                if (this.setOffsets[setIndex].y >= period) {
                    this.setOffsets[setIndex].y = 0; // 2マス進んだらリセット
                }
                break;
            case 'up':
                this.setOffsets[setIndex].y += speed;
                if (this.setOffsets[setIndex].y >= period) {
                    this.setOffsets[setIndex].y = 0; // 2マス進んだらリセット
                }
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