// アプリケーションの状態管理
class MultiplicationApp {
    constructor() {
        this.selectedRow = 0;
        this.selectedCol = 0;
        this.currentTheme = 'apple';
        this.columnsCount = 10;
        this.themes = {
            apple: { icon: '🍎', color: '#ff5722' },
            star: { icon: '⭐', color: '#ffc107' },
            heart: { icon: '💖', color: '#e91e63' }
        };
        
        this.init();
    }

    init() {
        this.createGrid();
        this.createNumbersGrid();
        this.setupEventListeners();
        this.updateFormula();
    }

    // 10x10グリッドを作成
    createGrid() {
        const grid = document.getElementById('multiplication-grid');
        grid.innerHTML = '';
        
        for (let row = 1; row <= 10; row++) {
            for (let col = 1; col <= 10; col++) {
                const cell = document.createElement('div');
                cell.className = 'grid-cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                
                // A1セル（1,1）を特別表示
                if (row === 1 && col === 1) {
                    cell.classList.add('origin');
                    cell.textContent = '●';
                }
                
                // クリック・タッチイベント
                cell.addEventListener('click', () => this.selectCell(row, col));
                cell.addEventListener('touchstart', (e) => {
                    e.preventDefault();
                    this.selectCell(row, col);
                });
                
                grid.appendChild(cell);
            }
        }
    }

    // セル選択処理
    selectCell(row, col) {
        this.selectedRow = row;
        this.selectedCol = col;
        this.updateGridSelection();
        this.updateFormula();
        this.updateNumbersHighlight();
    }

    // グリッドの選択状態を更新
    updateGridSelection() {
        const cells = document.querySelectorAll('.grid-cell');
        cells.forEach(cell => {
            const cellRow = parseInt(cell.dataset.row);
            const cellCol = parseInt(cell.dataset.col);
            
            cell.classList.remove('selected');
            
            // A1から選択セルまでの矩形範囲を選択
            if (cellRow <= this.selectedRow && cellCol <= this.selectedCol) {
                cell.classList.add('selected');
                
                // テーマアイコンを表示（A1以外）
                if (!(cellRow === 1 && cellCol === 1) && this.selectedRow > 0 && this.selectedCol > 0) {
                    cell.textContent = this.themes[this.currentTheme].icon;
                }
            } else {
                // 選択範囲外のセルからアイコンを削除（A1以外）
                if (!(cellRow === 1 && cellCol === 1)) {
                    cell.textContent = '';
                }
            }
        });
    }

    // 計算式を更新
    updateFormula() {
        const multiplicationFormula = document.getElementById('multiplication-formula');
        const additionFormula = document.getElementById('addition-formula');
        
        if (this.selectedRow === 0 || this.selectedCol === 0) {
            multiplicationFormula.textContent = '範囲を選択してください';
            additionFormula.textContent = '';
            return;
        }
        
        const result = this.selectedRow * this.selectedCol;
        multiplicationFormula.textContent = `${this.selectedRow} × ${this.selectedCol} = ${result}`;
        
        // 足し算式を生成
        const additionTerms = Array(this.selectedCol).fill(this.selectedRow);
        const additionExpression = additionTerms.join(' + ');
        additionFormula.textContent = `${additionExpression} = ${result}`;
    }

    // 数字一覧グリッドを作成
    createNumbersGrid() {
        const numbersGrid = document.getElementById('numbers-grid');
        numbersGrid.innerHTML = '';
        numbersGrid.style.gridTemplateColumns = `repeat(${this.columnsCount}, 1fr)`;
        
        for (let i = 1; i <= 100; i++) {
            const cell = document.createElement('div');
            cell.className = 'number-cell';
            cell.textContent = i;
            cell.dataset.number = i;
            numbersGrid.appendChild(cell);
        }
        
        this.updateNumbersHighlight();
    }

    // 倍数のハイライトを更新
    updateNumbersHighlight() {
        const numberCells = document.querySelectorAll('.number-cell');
        numberCells.forEach(cell => {
            const number = parseInt(cell.dataset.number);
            cell.classList.remove('highlighted');
            
            // 選択された縦の数の倍数をハイライト
            if (this.selectedRow > 0 && number % this.selectedRow === 0) {
                cell.classList.add('highlighted');
            }
        });
    }

    // 列数を変更
    updateColumnsCount(count) {
        this.columnsCount = count;
        document.getElementById('column-count').textContent = count;
        this.createNumbersGrid();
    }

    // テーマを変更
    changeTheme(theme) {
        this.currentTheme = theme;
        
        // テーマボタンのアクティブ状態を更新
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-theme="${theme}"]`).classList.add('active');
        
        // グリッドの選択状態を更新してアイコンを反映
        this.updateGridSelection();
    }

    // イベントリスナーを設定
    setupEventListeners() {
        // 列数スライダー
        const columnSlider = document.getElementById('column-slider');
        columnSlider.addEventListener('input', (e) => {
            this.updateColumnsCount(parseInt(e.target.value));
        });

        // テーマ選択ボタン
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const theme = e.target.dataset.theme;
                this.changeTheme(theme);
            });
        });

        // 初期テーマを設定
        this.changeTheme('apple');

        // タッチデバイス対応
        document.addEventListener('touchstart', () => {}, { passive: true });
        
        // グリッドへのホバー効果をタッチデバイスで無効化
        if ('ontouchstart' in window) {
            document.documentElement.classList.add('touch-device');
        }
    }
}

// DOM読み込み完了後にアプリを初期化
document.addEventListener('DOMContentLoaded', () => {
    new MultiplicationApp();
});

// タッチデバイス用のスタイル調整
if ('ontouchstart' in window) {
    const style = document.createElement('style');
    style.textContent = `
        .touch-device .grid-cell:hover {
            background-color: var(--color-surface);
        }
        .touch-device .grid-cell.selected:hover {
            background-color: var(--color-bg-1);
        }
        .touch-device .grid-cell.origin:hover {
            background-color: var(--color-primary);
        }
    `;
    document.head.appendChild(style);
}