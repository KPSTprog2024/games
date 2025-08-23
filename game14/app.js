class DiameterLineAnimator {
    constructor() {
        // 見えないボール（絶対に描画しない内部制御のみ）
        this.invisibleBallPhase = 0;        // 円周上の位相
        this.angularVelocity = 0.02;        // 角速度 rad/frame
        
        // 直径線管理
        this.divisionCount = 8;             // 直径線数
        this.lineAngles = [];               // 各直径線の角度
        
        // キャンバス設定
        this.canvas = document.getElementById('animationCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.centerX = this.canvas.width / 2;
        this.centerY = this.canvas.height / 2;
        this.radius = 280;
        
        // 見えるボール管理（各直径線に1つ）
        this.visibleBalls = [];             // 位置・色情報
        this.firstBallColor = '#ff0000';    // 水平線上で位置が変わらないボールの色
        this.defaultBallColor = 'white';    // その他のボールの色
        
        // アニメーション制御
        this.isPlaying = false;
        this.animationId = null;
        this.speedMultiplier = 1.0;
        
        // 自動分割
        this.autoIncrement = true;
        this.incrementInterval = 3000;
        this.lastIncrementTime = Date.now();
        
        // プリセット設定
        this.presets = [
            {
                name: "シンプル",
                divisionCount: 4,
                angularVelocity: 0.015,
                autoIncrement: false
            },
            {
                name: "標準",
                divisionCount: 8,
                angularVelocity: 0.02,
                autoIncrement: true
            },
            {
                name: "複雑",
                divisionCount: 16,
                angularVelocity: 0.03,
                autoIncrement: true
            }
        ];
        
        this.calculateLineAngles();
        this.setupEventListeners();
        this.updateUI();
        this.calculateVisibleBallPositions();
        this.render();
    }
    
    // 直径線の角度を計算
    calculateLineAngles() {
        this.lineAngles = [];
        for (let i = 0; i < this.divisionCount; i++) {
            const angle = (2 * Math.PI * i) / this.divisionCount;
            this.lineAngles.push(angle);
        }
    }
    
    // 直径線を描画（円周の対向点を結ぶ）
    drawDiameterLines() {
        this.ctx.strokeStyle = '#888888';
        this.ctx.lineWidth = 1.5;
        
        this.lineAngles.forEach(angle => {
            // 円周上の一方の点
            const x1 = this.centerX + this.radius * Math.cos(angle);
            const y1 = this.centerY + this.radius * Math.sin(angle);
            
            // 円周上の対向点（180度反対側）
            const x2 = this.centerX + this.radius * Math.cos(angle + Math.PI);
            const y2 = this.centerY + this.radius * Math.sin(angle + Math.PI);
            
            // 直径線を描画（円周から円周へ）
            this.ctx.beginPath();
            this.ctx.moveTo(x1, y1);
            this.ctx.lineTo(x2, y2);
            this.ctx.stroke();
        });
    }
    
    // 見えるボール位置計算（直径線上の往復）
    calculateVisibleBallPositions() {
        this.visibleBalls = [];
        
        this.lineAngles.forEach((lineAngle, index) => {
            // 見えないボールとの位相差
            let phaseDiff = this.invisibleBallPhase - lineAngle;
            
            // -π〜π範囲に正規化
            while (phaseDiff > Math.PI) phaseDiff -= 2 * Math.PI;
            while (phaseDiff < -Math.PI) phaseDiff += 2 * Math.PI;
            
            // cosine投影で直径線上の位置を計算
            const normalizedPosition = Math.cos(phaseDiff);
            
            // 直径線上の位置（-radius ～ +radius の範囲）
            const radialDistance = normalizedPosition * this.radius;
            
            // 直径線上の実際の座標
            const x = this.centerX + radialDistance * Math.cos(lineAngle);
            const y = this.centerY + radialDistance * Math.sin(lineAngle);

            const color = index === 0 ? this.firstBallColor : this.defaultBallColor;

            this.visibleBalls.push({
                x: x,
                y: y,
                color: color
            });
        });
    }
    
    // 描画関数（厳格 - 見えないボールは絶対に描画しない）
    render() {
        // 背景クリア
        this.ctx.fillStyle = '#2a2a2a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 直径線のみ描画
        this.drawDiameterLines();
        
        // 見えるボールのみ描画
        this.visibleBalls.forEach(ball => {
            this.ctx.fillStyle = ball.color;
            this.ctx.beginPath();
            this.ctx.arc(ball.x, ball.y, 6, 0, 2 * Math.PI);
            this.ctx.fill();
        });
        
        // 禁止：見えないボールや参照線は絶対に描画しない
    }
    
    // アニメーションループ
    animate() {
        if (!this.isPlaying) return;
        
        // 見えないボールの位相更新（等速回転）
        this.invisibleBallPhase += this.angularVelocity * this.speedMultiplier;
        if (this.invisibleBallPhase > 2 * Math.PI) {
            this.invisibleBallPhase -= 2 * Math.PI;
        }
        
        // 自動分割処理
        if (this.autoIncrement && Date.now() - this.lastIncrementTime > this.incrementInterval) {
            this.incrementDivisionCount();
            this.lastIncrementTime = Date.now();
        }
        
        // 見えるボール位置計算
        this.calculateVisibleBallPositions();
        
        // 描画
        this.render();
        
        // UI更新
        this.updateStatusDisplay();
        
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    // 分割数を増加（位置継続性保証）
    incrementDivisionCount() {
        if (this.divisionCount < 32) {
            this.divisionCount += 2;
            this.calculateLineAngles();
            this.updateUI();
        }
    }
    
    // 再生/停止制御
    togglePlayPause() {
        this.isPlaying = !this.isPlaying;
        if (this.isPlaying) {
            this.animate();
        } else if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        this.updatePlayPauseButton();
    }
    
    // リセット
    reset() {
        this.invisibleBallPhase = 0;
        this.calculateVisibleBallPositions();
        this.render();
        this.updateStatusDisplay();
    }
    
    // 分割数変更（位置継続）
    setDivisionCount(count) {
        this.divisionCount = Math.max(4, Math.min(32, count));
        this.calculateLineAngles();
        this.calculateVisibleBallPositions();
        this.render();
        this.updateUI();
    }
    
    // 速度変更
    setSpeed(multiplier) {
        this.speedMultiplier = multiplier;
        this.updateUI();
    }
    
    // 自動分割設定
    setAutoIncrement(enabled) {
        this.autoIncrement = enabled;
        if (enabled) {
            this.lastIncrementTime = Date.now();
        }
        this.updateUI();
    }
    
    // 間隔設定
    setIncrementInterval(interval) {
        this.incrementInterval = interval;
        this.updateUI();
    }
    
    // プリセット適用
    applyPreset(presetIndex) {
        const preset = this.presets[presetIndex];
        if (!preset) return;
        
        this.setDivisionCount(preset.divisionCount);
        this.angularVelocity = preset.angularVelocity;
        this.setAutoIncrement(preset.autoIncrement);
        
        this.updateUI();
        this.updatePresetButtons(presetIndex);
    }
    
    // UI更新
    updateUI() {
        document.getElementById('divisionValue').textContent = this.divisionCount;
        document.getElementById('divisionSlider').value = this.divisionCount;
        document.getElementById('lineCount').textContent = this.divisionCount;
        
        document.getElementById('speedValue').textContent = this.speedMultiplier.toFixed(1);
        document.getElementById('speedSlider').value = this.speedMultiplier;
        document.getElementById('speedDisplay').textContent = this.speedMultiplier.toFixed(1);
        
        document.getElementById('autoIncrementCheck').checked = this.autoIncrement;
        
        document.getElementById('intervalValue').textContent = (this.incrementInterval / 1000).toFixed(1);
        document.getElementById('intervalSlider').value = this.incrementInterval;
        
        const intervalGroup = document.getElementById('intervalGroup');
        intervalGroup.style.display = this.autoIncrement ? 'block' : 'none';
        
        document.getElementById('visibleBallCount').textContent = this.divisionCount;
    }
    
    // ステータス表示更新
    updateStatusDisplay() {
        document.getElementById('angularVelocityDisplay').textContent = 
            (this.angularVelocity * this.speedMultiplier).toFixed(3);
        document.getElementById('phaseDisplay').textContent = 
            this.invisibleBallPhase.toFixed(2);
    }
    
    // 再生/停止ボタン更新
    updatePlayPauseButton() {
        const btn = document.getElementById('playPauseBtn');
        btn.textContent = this.isPlaying ? '停止' : '再生';
        btn.className = this.isPlaying ? 'btn btn--secondary' : 'btn btn--primary';
    }
    
    // プリセットボタン更新
    updatePresetButtons(activeIndex) {
        document.querySelectorAll('.preset-btn').forEach((btn, index) => {
            btn.classList.toggle('active', index === activeIndex);
        });
    }
    
    // イベントリスナー設定
    setupEventListeners() {
        // 基本制御
        document.getElementById('playPauseBtn').addEventListener('click', () => {
            this.togglePlayPause();
        });
        
        document.getElementById('resetBtn').addEventListener('click', () => {
            this.reset();
        });
        
        // 速度制御
        document.getElementById('speedSlider').addEventListener('input', (e) => {
            this.setSpeed(parseFloat(e.target.value));
        });
        
        // 分割数制御
        document.getElementById('divisionSlider').addEventListener('input', (e) => {
            this.setDivisionCount(parseInt(e.target.value));
        });
        
        // 自動分割制御
        document.getElementById('autoIncrementCheck').addEventListener('change', (e) => {
            this.setAutoIncrement(e.target.checked);
        });
        
        // 間隔制御
        document.getElementById('intervalSlider').addEventListener('input', (e) => {
            this.setIncrementInterval(parseInt(e.target.value));
        });
        
        // プリセット制御
        document.querySelectorAll('.preset-btn').forEach((btn, index) => {
            btn.addEventListener('click', () => {
                this.applyPreset(index);
            });
        });
        
        // キーボードショートカット
        document.addEventListener('keydown', (e) => {
            switch(e.code) {
                case 'Space':
                    e.preventDefault();
                    this.togglePlayPause();
                    break;
                case 'KeyR':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        this.reset();
                    }
                    break;
                case 'Digit1':
                    this.applyPreset(0);
                    break;
                case 'Digit2':
                    this.applyPreset(1);
                    break;
                case 'Digit3':
                    this.applyPreset(2);
                    break;
            }
        });
    }
}

// アプリケーション初期化
document.addEventListener('DOMContentLoaded', () => {
    const animator = new DiameterLineAnimator();
    
    // 初期状態で自動再生
    setTimeout(() => {
        animator.togglePlayPause();
    }, 500);
});