// アプリケーションの状態管理
class SpeedTimeDistanceApp {
    constructor() {
        this.currentTransport = 'car';
        this.selectedSpeed = 0;
        this.selectedTime = 0;
        this.selectedDistance = 0;
        this.isAnimating = false;
        this.countdownInterval = null;
        
        this.transportIcons = {
            car: '🚗',
            bicycle: '🚴‍♂️', 
            runner: '🏃‍♂️'
        };
        
        this.init();
    }
    
    init() {
        console.log('Initializing app...');
        this.createGrid();
        this.createDistanceMarks();
        this.bindEvents();
        this.updateFormula();
        console.log('App initialized successfully');
    }
    
    // 10x10グリッドを生成（軸ラベルと完全同期）
    createGrid() {
        const grid = document.getElementById('calculationGrid');
        if (!grid) {
            console.error('Grid container not found');
            return;
        }
        
        grid.innerHTML = '';
        console.log('Creating grid...');
        
        // 重要：縦軸（速さ）1-10を上から下、横軸（時間）1-10を左から右に配置
        for (let speed = 1; speed <= 10; speed++) {
            for (let time = 1; time <= 10; time++) {
                const cell = document.createElement('div');
                cell.className = 'grid-cell';
                cell.dataset.speed = speed.toString();
                cell.dataset.time = time.toString();
                cell.innerHTML = this.transportIcons[this.currentTransport];
                cell.style.userSelect = 'none'; // テキスト選択を防ぐ
                
                // セル選択イベント - 軸ラベルと完全同期
                cell.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log(`Cell clicked: speed=${speed}, time=${time}`);
                    this.selectCell(speed, time);
                });
                
                // タッチデバイス対応
                cell.addEventListener('touchend', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.selectCell(speed, time);
                });
                
                grid.appendChild(cell);
            }
        }
        console.log('Grid created with 100 cells');
    }
    
    // 距離目盛り（100マス）を生成
    createDistanceMarks() {
        const marksContainer = document.getElementById('distanceMarks');
        if (!marksContainer) {
            console.error('Distance marks container not found');
            return;
        }
        
        marksContainer.innerHTML = '';
        
        for (let i = 0; i < 100; i++) {
            const mark = document.createElement('div');
            mark.className = 'distance-mark';
            mark.dataset.position = (i + 1).toString();
            marksContainer.appendChild(mark);
        }
        console.log('Distance marks created');
    }
    
    // イベントリスナーをバインド
    bindEvents() {
        console.log('Binding events...');
        
        // 移動手段選択
        const transportBtns = document.querySelectorAll('.transport-btn');
        transportBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log(`Transport selected: ${e.target.dataset.transport}`);
                this.selectTransport(e.target.dataset.transport);
            });
        });
        console.log(`Transport buttons bound: ${transportBtns.length}`);
        
        // 制御ボタン
        const startBtn = document.getElementById('startBtn');
        const resetBtn = document.getElementById('resetBtn');
        
        if (startBtn) {
            startBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Start button clicked');
                this.startAnimation();
            });
        }
        
        if (resetBtn) {
            resetBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Reset button clicked');
                this.resetAnimation();
            });
        }
        
        console.log('Control buttons bound');
    }
    
    // セル選択処理（軸ラベルと完全同期）
    selectCell(speed, time) {
        if (this.isAnimating) {
            console.log('Cannot select cell while animating');
            return;
        }
        
        console.log(`Selecting cell: speed=${speed}, time=${time}`);
        
        this.selectedSpeed = speed;
        this.selectedTime = time;
        this.selectedDistance = speed * time;
        
        // 選択範囲をハイライト（左上から選択セルまでの矩形）
        this.updateGridSelection();
        this.updateFormula();
        
        console.log(`Selection updated: ${speed} × ${time} = ${this.selectedDistance}`);
    }
    
    // グリッドの選択状態を更新（軸ラベルと完全同期）
    updateGridSelection() {
        const cells = document.querySelectorAll('.grid-cell');
        console.log(`Updating grid selection for ${cells.length} cells`);
        
        let selectedCount = 0;
        cells.forEach(cell => {
            const cellSpeed = parseInt(cell.dataset.speed);
            const cellTime = parseInt(cell.dataset.time);
            
            // 左上(1,1)から選択した(speed,time)までの矩形範囲をハイライト
            if (cellSpeed <= this.selectedSpeed && cellTime <= this.selectedTime) {
                cell.classList.add('selected');
                selectedCount++;
            } else {
                cell.classList.remove('selected');
            }
        });
        
        console.log(`${selectedCount} cells selected`);
    }
    
    // 移動手段選択
    selectTransport(transport) {
        if (this.isAnimating) {
            console.log('Cannot change transport while animating');
            return;
        }
        
        console.log(`Changing transport to: ${transport}`);
        
        // ボタンの状態更新
        document.querySelectorAll('.transport-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const activeBtn = document.querySelector(`[data-transport="${transport}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }
        
        this.currentTransport = transport;
        
        // グリッドのアイコンを更新
        const newIcon = this.transportIcons[transport];
        document.querySelectorAll('.grid-cell').forEach(cell => {
            cell.innerHTML = newIcon;
        });
        
        // 移動アイコンを更新
        const movingIcon = document.getElementById('movingIcon');
        if (movingIcon) {
            movingIcon.textContent = newIcon;
        }
        
        console.log(`Transport changed to ${transport} with icon ${newIcon}`);
    }
    
    // 計算式表示を更新
    updateFormula() {
        const display = document.getElementById('formulaDisplay');
        if (!display) {
            console.error('Formula display not found');
            return;
        }
        
        if (this.selectedSpeed === 0 || this.selectedTime === 0) {
            display.textContent = '速さと時間を選択してください';
        } else {
            display.textContent = `速さ: ${this.selectedSpeed} km/h × 時間: ${this.selectedTime} 時間 = 距離: ${this.selectedDistance} km`;
        }
        
        console.log(`Formula updated: ${display.textContent}`);
    }
    
    // アニメーション開始
    startAnimation() {
        if (this.isAnimating) {
            console.log('Animation already running');
            return;
        }
        
        if (this.selectedDistance === 0) {
            alert('速さと時間を選択してからスタートしてください！');
            console.log('No selection made for animation');
            return;
        }
        
        console.log('Starting animation...');
        this.isAnimating = true;
        
        const startBtn = document.getElementById('startBtn');
        const movingIcon = document.getElementById('movingIcon');
        const countdownDisplay = document.getElementById('countdownDisplay');
        
        // スタートボタンを無効化
        if (startBtn) {
            startBtn.disabled = true;
            startBtn.textContent = '移動中...';
        }
        
        // アイコンを右向きに反転
        if (movingIcon) {
            movingIcon.classList.add('flipped');
        }
        
        // 距離分のマスを瞬時に塗りつぶし
        this.highlightDistanceMarks();
        
        // カウントダウン開始（1時間 = 1秒）
        let remainingTime = this.selectedTime;
        this.updateCountdown(remainingTime);
        
        this.countdownInterval = setInterval(() => {
            remainingTime--;
            if (remainingTime > 0) {
                this.updateCountdown(remainingTime);
            } else {
                this.completeAnimation();
            }
        }, 1000);
        
        // 等速アニメーション（最重要：linear timing function）
        const trackContainer = document.querySelector('.distance-marks');
        if (trackContainer && movingIcon) {
            const trackWidth = trackContainer.offsetWidth;
            const finalPosition = Math.min((this.selectedDistance / 100) * trackWidth, trackWidth - 50);
            const duration = this.selectedTime * 1000; // 1時間 = 1秒
            
            console.log(`Animation: ${duration}ms to position ${finalPosition}px`);
            
            // CSS transition で等速移動（linear が最重要）
            movingIcon.style.transition = `left ${duration}ms linear`;
            movingIcon.style.left = finalPosition + 'px';
        }
    }
    
    // 距離マスをハイライト（瞬時塗りつぶし）
    highlightDistanceMarks() {
        const marks = document.querySelectorAll('.distance-mark');
        const maxDistance = Math.min(this.selectedDistance, 100);
        
        console.log(`Highlighting ${maxDistance} distance marks`);
        
        marks.forEach((mark, index) => {
            if (index < maxDistance) {
                mark.classList.add('highlighted');
            } else {
                mark.classList.remove('highlighted');
            }
        });
    }
    
    // カウントダウン表示を更新
    updateCountdown(remainingTime) {
        const countdownDisplay = document.getElementById('countdownDisplay');
        if (countdownDisplay && remainingTime > 0) {
            countdownDisplay.textContent = `あと${remainingTime}秒でゴール！`;
            console.log(`Countdown: ${remainingTime} seconds remaining`);
        }
    }
    
    // アニメーション完了
    completeAnimation() {
        console.log('Completing animation...');
        
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
            this.countdownInterval = null;
        }
        
        const countdownDisplay = document.getElementById('countdownDisplay');
        const startBtn = document.getElementById('startBtn');
        
        // 完了メッセージ表示
        if (countdownDisplay) {
            countdownDisplay.textContent = `移動完了！${this.selectedDistance}km移動しました！`;
            countdownDisplay.parentElement.classList.add('completed');
        }
        
        // スタートボタンを再有効化
        if (startBtn) {
            startBtn.disabled = false;
            startBtn.textContent = 'スタート';
        }
        
        this.isAnimating = false;
        console.log('Animation completed');
    }
    
    // アニメーションリセット
    resetAnimation() {
        console.log('Resetting animation...');
        
        // カウントダウン停止
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
            this.countdownInterval = null;
        }
        
        // 状態リセット
        this.isAnimating = false;
        this.selectedSpeed = 0;
        this.selectedTime = 0;
        this.selectedDistance = 0;
        
        // UI要素リセット
        const movingIcon = document.getElementById('movingIcon');
        const countdownDisplay = document.getElementById('countdownDisplay');
        const startBtn = document.getElementById('startBtn');
        
        // アイコン位置リセット（トランジション無効化）
        if (movingIcon) {
            movingIcon.style.transition = 'none';
            movingIcon.style.left = '0px';
            movingIcon.classList.remove('flipped');
        }
        
        // カウントダウン表示リセット
        if (countdownDisplay) {
            countdownDisplay.textContent = 'スタートボタンを押してください';
            countdownDisplay.parentElement.classList.remove('completed');
        }
        
        // ボタン状態リセット
        if (startBtn) {
            startBtn.disabled = false;
            startBtn.textContent = 'スタート';
        }
        
        // グリッド選択リセット
        document.querySelectorAll('.grid-cell').forEach(cell => {
            cell.classList.remove('selected');
        });
        
        // 距離マークリセット
        document.querySelectorAll('.distance-mark').forEach(mark => {
            mark.classList.remove('highlighted');
        });
        
        // 計算式リセット
        this.updateFormula();
        
        // アイコンのトランジション再有効化（少し遅延）
        setTimeout(() => {
            if (movingIcon) {
                movingIcon.style.transition = '';
            }
        }, 100);
        
        console.log('Reset completed');
    }
}

// グローバル変数としてアプリケーションインスタンスを保存
let app;

// アプリケーション初期化
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing app...');
    try {
        app = new SpeedTimeDistanceApp();
    } catch (error) {
        console.error('Failed to initialize app:', error);
    }
});

// タッチデバイス対応
document.addEventListener('touchstart', function() {}, {passive: true});
document.addEventListener('touchend', function() {}, {passive: true});

// 画面サイズ変更時の対応
window.addEventListener('resize', () => {
    // 移動中でなければアイコン位置を調整
    if (app && !app.isAnimating) {
        const movingIcon = document.getElementById('movingIcon');
        if (movingIcon) {
            movingIcon.style.left = '0px';
        }
    }
});

// デバッグ用関数
window.debugApp = function() {
    if (app) {
        console.log('App State:', {
            currentTransport: app.currentTransport,
            selectedSpeed: app.selectedSpeed,
            selectedTime: app.selectedTime,
            selectedDistance: app.selectedDistance,
            isAnimating: app.isAnimating
        });
    }
};