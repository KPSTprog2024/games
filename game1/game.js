// 共通の定数やユーティリティ関数を定義
const COLORS = {
    primary: 0x2196F3,
    primaryHover: 0x1976D2,
    success: 0x4CAF50,
    successHover: 0x388E3C,
    danger: 0xFF5722,
    dangerHover: 0xD84315,
    info: 0x2196F3,
    infoHover: 0x1976D2,
    warning: 0xFFD700,
    selected: 0xFF9800,       // 選択されたボタンの色
    selectedHover: 0xFB8C00   // 選択されたボタンのホバー時の色
};

// フォントサイズとボタンサイズの調整関数
function calculateResponsiveSize(scene, baseSize) {
    const { width, height } = scene.scale;
    const minDimension = Math.min(width, height);
    return Math.max(Math.round(minDimension * baseSize), 16); // 最小フォントサイズを16pxに設定
}

// カスタムボタン作成関数
function createCustomButton(scene, text, x, y, width, height, backgroundColor, hoverColor, onClick) {
    const buttonContainer = scene.add.container(x, y);

    // ボタン背景をGraphicsで描画
    const buttonBackground = scene.add.graphics();
    buttonBackground.fillStyle(backgroundColor, 1);
    buttonBackground.fillRoundedRect(-width / 2, -height / 2, width, height, 20);

    // テキストを追加
    const fontSize = calculateResponsiveSize(scene, 0.04); // フォントサイズを大きく調整
    const buttonText = scene.add.text(0, 0, text, {
        fontSize: `${fontSize}px`,
        fill: '#fff',
        align: 'center',
    }).setOrigin(0.5, 0.5);

    buttonContainer.add([buttonBackground, buttonText]);

    // インタラクティブ設定
    buttonContainer.setSize(width, height);
    buttonContainer.setInteractive({ useHandCursor: true });

    // デフォルトの色を保持
    buttonContainer.defaultColor = backgroundColor;
    buttonContainer.hoverColor = hoverColor;
    buttonContainer.selected = false;

    // ホバー時の処理
    buttonContainer.on('pointerover', () => {
        if (buttonContainer.selected) {
            buttonBackground.clear();
            buttonBackground.fillStyle(COLORS.selectedHover, 1);
            buttonBackground.fillRoundedRect(-width / 2, -height / 2, width, height, 20);
        } else {
            buttonBackground.clear();
            buttonBackground.fillStyle(buttonContainer.hoverColor, 1);
            buttonBackground.fillRoundedRect(-width / 2, -height / 2, width, height, 20);
        }
    });

    buttonContainer.on('pointerout', () => {
        if (buttonContainer.selected) {
            buttonBackground.clear();
            buttonBackground.fillStyle(COLORS.selected, 1);
            buttonBackground.fillRoundedRect(-width / 2, -height / 2, width, height, 20);
        } else {
            buttonBackground.clear();
            buttonBackground.fillStyle(buttonContainer.defaultColor, 1);
            buttonBackground.fillRoundedRect(-width / 2, -height / 2, width, height, 20);
        }
    });

    // クリック時の処理
    buttonContainer.on('pointerdown', () => {
        scene.tweens.add({
            targets: buttonContainer,
            scale: { from: 1, to: 0.95 },
            yoyo: true,
            duration: 100
        });
        onClick();
    });

    return buttonContainer;
}

// ベースとなるシーンクラス
class BaseScene extends Phaser.Scene {
    constructor(key) {
        super({ key: key });
    }

    init(data) {
        this.displayTime = data.displayTime || 2000;
        this.level = data.level || 1;
        this.gridSize = data.gridSize || 3;
        this.gameMode = data.gameMode || 'number';
    }

    drawGrid() {
        const { width, height } = this.scale;
        const gridSize = this.gridSize;
        const gridLength = width < height ? width * 0.8 : height * 0.8;
        const startX = (width - gridLength) / 2;
        const startY = (height - gridLength) / 2;
        const cellSize = gridLength / gridSize;

        // グリッドの線を描画
        const graphics = this.add.graphics();
        graphics.lineStyle(4, 0x000000, 1);

        // 縦線と横線
        for (let i = 0; i <= gridSize; i++) {
            // 縦線
            graphics.moveTo(startX + i * cellSize, startY);
            graphics.lineTo(startX + i * cellSize, startY + gridLength);
            // 横線
            graphics.moveTo(startX, startY + i * cellSize);
            graphics.lineTo(startX + gridLength, startY + i * cellSize);
        }

        graphics.strokePath();
    }

    createParticleEffect() {
        const { width, height } = this.scale;
        for (let i = 0; i < 20; i++) {
            this.time.delayedCall(100 * i, () => {
                const particle = this.add.circle(
                    Phaser.Math.Between(0, width),
                    Phaser.Math.Between(0, height),
                    Phaser.Math.Between(10, 20),
                    Phaser.Display.Color.RandomRGB().color
                );
                this.tweens.add({
                    targets: particle,
                    alpha: 0,
                    scale: { from: 1, to: 3 },
                    duration: 1000,
                    onComplete: () => particle.destroy()
                });
            }, [], this);
        }
    }
}

// シーン1: SelectionScene
class SelectionScene extends Phaser.Scene {
    constructor() {
        super({ key: 'SelectionScene' });
    }

    create() {
        const { width, height } = this.scale;

        // タイトル
        const titleFontSize = calculateResponsiveSize(this, 0.06);
        this.add.text(width / 2, height * 0.1, 'げーむせっていをえらんでね', {
            fontSize: `${titleFontSize}px`,
            fill: '#000',
            align: 'center',
            wordWrap: { width: width * 0.9 }
        }).setOrigin(0.5, 0.5);

        // ボタン設定
        const buttonWidth = width * 0.25;
        const buttonHeight = height * 0.1;
        const buttonSpacing = width * 0.02;

        // 選択オプション
        const options = [
            {
                title: 'ひょうじじかんをえらんでね',
                yPosition: 0.25,
                items: [
                    { label: '0.5びょう', value: 500 },
                    { label: '1びょう', value: 1000 },
                    { label: '3びょう', value: 3000 }
                ],
                buttonsArray: 'timeButtons',
                onSelect: (button, value) => {
                    this.selectedTime = value;
                    this.timeButtons.forEach(btn => {
                        btn.selected = false;
                        btn.emit('pointerout'); // 色を戻す
                    });
                    button.selected = true;
                    button.emit('pointerout'); // 色を更新
                    this.events.emit('selectionChanged');
                }
            },
            {
                title: 'ぐりっどさいずをえらんでね',
                yPosition: 0.45,
                items: [
                    { label: '3x3', value: 3 },
                    { label: '4x4', value: 4 },
                    { label: '5x5', value: 5 }
                ],
                buttonsArray: 'gridSizeButtons',
                onSelect: (button, value) => {
                    this.selectedGridSize = value;
                    this.gridSizeButtons.forEach(btn => {
                        btn.selected = false;
                        btn.emit('pointerout');
                    });
                    button.selected = true;
                    button.emit('pointerout');
                    this.events.emit('selectionChanged');
                }
            },
            {
                title: 'げーむもーどをえらんでね',
                yPosition: 0.65,
                items: [
                    { label: 'すうじもーど', value: 'number' },
                    { label: 'いろもーど', value: 'color' }
                ],
                buttonsArray: 'gameModeButtons',
                onSelect: (button, value) => {
                    this.selectedGameMode = value;
                    this.gameModeButtons.forEach(btn => {
                        btn.selected = false;
                        btn.emit('pointerout');
                    });
                    button.selected = true;
                    button.emit('pointerout');
                    this.events.emit('selectionChanged');
                }
            }
        ];

        // オプションごとにボタンを生成
        options.forEach(option => {
            // セクションタイトル
            const sectionFontSize = calculateResponsiveSize(this, 0.05);
            this.add.text(width / 2, height * option.yPosition, option.title, {
                fontSize: `${sectionFontSize}px`,
                fill: '#000',
                align: 'center',
                wordWrap: { width: width * 0.9 }
            }).setOrigin(0.5, 0.5);

            // ボタンを横に並べる
            const totalWidth = option.items.length * buttonWidth + (option.items.length - 1) * buttonSpacing;
            let startX = (width - totalWidth) / 2 + buttonWidth / 2;
            const startY = height * (option.yPosition + 0.08);

            option.buttons = [];

            option.items.forEach((item, index) => {
                const buttonX = startX + index * (buttonWidth + buttonSpacing);
                const button = createCustomButton(
                    this,
                    item.label,
                    buttonX,
                    startY,
                    buttonWidth,
                    buttonHeight,
                    COLORS.primary,
                    COLORS.primaryHover,
                    () => option.onSelect(button, item.value)
                );

                option.buttons.push(button);
            });

            this[option.buttonsArray] = option.buttons;
        });

        // スタートボタン
        const startButtonWidth = width * 0.6;
        const startButtonHeight = height * 0.12;

        const startButton = createCustomButton(
            this,
            'スタート',
            width / 2,
            height * 0.85,
            startButtonWidth,
            startButtonHeight,
            COLORS.success,
            COLORS.successHover,
            () => {
                if (startButton.getData('enabled')) {
                    this.scene.start('CountdownScene', {
                        displayTime: this.selectedTime,
                        level: 1,
                        gridSize: this.selectedGridSize,
                        gameMode: this.selectedGameMode
                    });
                }
            }
        );

        startButton.setAlpha(0.5); // 初期状態は無効
        startButton.setData('enabled', false);

        // スタートボタンのスタイル更新関数
        const updateStartButton = () => {
            if (this.selectedTime && this.selectedGridSize && this.selectedGameMode) {
                startButton.setAlpha(1);
                startButton.setData('enabled', true);
            } else {
                startButton.setAlpha(0.5);
                startButton.setData('enabled', false);
            }
        };

        // リスナーを追加して選択時にスタートボタンを更新
        this.events.on('selectionChanged', updateStartButton, this);
    }
}

// シーン2: CountdownScene
class CountdownScene extends BaseScene {
    constructor() {
        super('CountdownScene');
    }

    create() {
        const { width, height } = this.scale;
        this.count = 3;

        // カウントダウン用グリッド
        this.drawGrid();

        // カウントダウン数字
        const countFontSize = calculateResponsiveSize(this, 0.2);
        this.countText = this.add.text(width / 2, height / 2, this.count, {
            fontSize: `${countFontSize}px`,
            fill: '#FF0000',
            align: 'center'
        }).setOrigin(0.5, 0.5);

        // カウントダウン数字にアニメーションを追加
        this.tweens.add({
            targets: this.countText,
            scale: { from: 1, to: 1.5 },
            yoyo: true,
            repeat: -1,
            duration: 500
        });

        this.timeEvent = this.time.addEvent({
            delay: 1000,
            callback: this.updateCountdown,
            callbackScope: this,
            loop: true
        });
    }

    updateCountdown() {
        this.count -= 1;
        if (this.count > 0) {
            this.countText.setText(this.count);
        } else {
            this.timeEvent.remove(false);
            // カウントダウン終了時にアニメーションを停止
            this.tweens.killTweensOf(this.countText);
            this.countText.destroy();
            this.scene.start('GameScene', {
                displayTime: this.displayTime,
                level: this.level,
                gridSize: this.gridSize,
                gameMode: this.gameMode
            });
        }
    }
}

// シーン3: GameScene
class GameScene extends BaseScene {
    constructor() {
        super('GameScene');
    }

    init(data) {
        super.init(data);
        this.expectedNumber = 1;
        this.numbers = [];
        this.grid = [];
        this.wrongCells = [];
        this.totalTargets = 0;
        this.clickedTargets = 0;
    }

    create() {
        const { width, height } = this.scale;

        // レベル表示
        const levelFontSize = calculateResponsiveSize(this, 0.04);
        this.add.text(width * 0.05, height * 0.05, `れべる: ${this.level}`, {
            fontSize: `${levelFontSize}px`,
            fill: '#000'
        }).setOrigin(0, 0);

        // グリッドの描画
        this.drawGrid();

        // 数字または色の配置
        if (this.gameMode === 'number') {
            this.placeNumbers();
        } else if (this.gameMode === 'color') {
            this.placeColors();
        }

        // 一定時間後に表示を隠す
        this.time.delayedCall(this.displayTime, () => {
            this.hideElements();
        }, [], this);
    }

    placeNumbers() {
        const totalNumbers = this.level + 2;
        if (totalNumbers > this.gridSize * this.gridSize) {
            alert('れべるがたかすぎます！ げーむをしゅうりょうします。');
            this.scene.start('SelectionScene');
            return;
        }

        // 1からtotalNumbersまでの数字を生成
        this.numbers = [];
        for (let i = 1; i <= totalNumbers; i++) {
            this.numbers.push(i);
        }

        // 数字の配置場所をランダムに選択
        const availableIndices = Phaser.Utils.Array.NumberArray(0, this.grid.length - 1);
        Phaser.Utils.Array.Shuffle(availableIndices);

        this.numbers.forEach((num, index) => {
            const gridIndex = availableIndices[index];
            const cell = this.grid[gridIndex];
            cell.number = num;

            // 数字のテキストオブジェクトを作成
            const numberFontSize = calculateResponsiveSize(this, 0.06);
            const numberText = this.add.text(cell.x, cell.y, num, {
                fontSize: `${numberFontSize}px`,
                fill: '#fff',
                backgroundColor: Phaser.Display.Color.IntegerToColor(COLORS.danger).rgba,
                padding: { x: 10, y: 10 },
                borderRadius: 10,
                align: 'center'
            }).setOrigin(0.5, 0.5).setVisible(true); // 初期は表示

            cell.object = numberText;
        });
    }

    placeColors() {
        const totalColors = this.level + 2;
        if (totalColors > this.gridSize * this.gridSize) {
            alert('れべるがたかすぎます！ げーむをしゅうりょうします。');
            this.scene.start('SelectionScene');
            return;
        }

        // 色のリスト
        const colors = [
            0xff5733, // あか
            0x33ff57, // みどり
            0x3357ff, // あお
            0xff33a8, // ピンク
            0xfff933, // きいろ
            0x33fff5, // みずいろ
            0x8e44ad, // むらさき
            0xe67e22, // オレンジ
            0x2ecc71, // ライム
            0x3498db  // あかるいあお
        ];

        // 色の選択
        const selectedColors = Phaser.Utils.Array.Shuffle(colors).slice(0, totalColors);

        // 色の配置場所をランダムに選択
        const availableIndices = Phaser.Utils.Array.NumberArray(0, this.grid.length - 1);
        Phaser.Utils.Array.Shuffle(availableIndices);

        selectedColors.forEach((color, index) => {
            const gridIndex = availableIndices[index];
            const cell = this.grid[gridIndex];
            cell.color = color;

            // 色ブロックのオブジェクトを作成（初期は表示）
            const colorBlock = this.add.rectangle(cell.x, cell.y, cell.width * 0.8, cell.height * 0.8, color)
                .setOrigin(0.5, 0.5)
                .setInteractive()
                .setAlpha(1); // 初期は表示
            cell.object = colorBlock;
        });

        this.totalTargets = selectedColors.length;
    }

    hideElements() {
        this.grid.forEach(cell => {
            if (cell.object) {
                cell.object.setVisible(false);
            }
        });
    }

    handleGridClick(row, col) {
        const clickedCell = this.grid.find(cell => cell.row === row && cell.col === col);
        if (!clickedCell) return;

        if (this.gameMode === 'number') {
            // 数字モード
            if (clickedCell.number === null) {
                this.wrongCells.push({ row, col });
                this.scene.start('RetryScene', {
                    displayTime: this.displayTime,
                    level: this.level,
                    gridSize: this.gridSize,
                    gameMode: this.gameMode,
                    grid: this.grid,
                    wrongCells: this.wrongCells
                });
                return;
            }

            if (clickedCell.clicked) return;

            if (clickedCell.number === this.expectedNumber) {
                clickedCell.clicked = true;
                clickedCell.object.setStyle({ backgroundColor: Phaser.Display.Color.IntegerToColor(COLORS.success).rgba });
                clickedCell.object.setVisible(true);
                clickedCell.zone.disableInteractive();

                this.tweens.add({
                    targets: clickedCell.object,
                    scale: { from: 1, to: 1.2 },
                    yoyo: true,
                    duration: 200
                });

                this.expectedNumber += 1;

                if (this.expectedNumber > this.numbers.length) {
                    this.time.delayedCall(500, () => {
                        this.scene.start('ClearScene', {
                            displayTime: this.displayTime,
                            level: this.level,
                            gridSize: this.gridSize,
                            gameMode: this.gameMode,
                            grid: this.grid
                        });
                    }, [], this);
                }
            } else {
                this.wrongCells.push({ row, col });
                if (clickedCell.object) {
                    this.tweens.add({
                        targets: clickedCell.object,
                        scale: { from: 1, to: 0.8 },
                        yoyo: true,
                        duration: 200
                    });
                }

                this.scene.start('RetryScene', {
                    displayTime: this.displayTime,
                    level: this.level,
                    gridSize: this.gridSize,
                    gameMode: this.gameMode,
                    grid: this.grid,
                    wrongCells: this.wrongCells
                });
            }
        } else if (this.gameMode === 'color') {
            // 色モード
            if (clickedCell.color === null) {
                this.wrongCells.push({ row, col });
                this.scene.start('RetryScene', {
                    displayTime: this.displayTime,
                    level: this.level,
                    gridSize: this.gridSize,
                    gameMode: this.gameMode,
                    grid: this.grid,
                    wrongCells: this.wrongCells
                });
                return;
            }

            if (clickedCell.clicked) return;

            // 色モードではタッチが正しい場合に色ブロックを表示
            clickedCell.clicked = true;
            clickedCell.object.setVisible(true); // 表示
            clickedCell.zone.disableInteractive();

            this.tweens.add({
                targets: clickedCell.object,
                scale: { from: 1, to: 1.2 },
                yoyo: true,
                duration: 200
            });

            this.clickedTargets += 1;

            if (this.clickedTargets >= this.totalTargets) {
                this.time.delayedCall(500, () => {
                    this.scene.start('ClearScene', {
                        displayTime: this.displayTime,
                        level: this.level,
                        gridSize: this.gridSize,
                        gameMode: this.gameMode,
                        grid: this.grid
                    });
                }, [], this);
            }
        }
    }

    drawGrid() {
        super.drawGrid();
        const { width, height } = this.scale;
        const gridSize = this.gridSize;
        const gridLength = width < height ? width * 0.8 : height * 0.8;
        const startX = (width - gridLength) / 2;
        const startY = (height - gridLength) / 2;
        const cellSize = gridLength / gridSize;

        // グリッドセルのクリックエリアを設定
        for (let row = 0; row < gridSize; row++) {
            for (let col = 0; col < gridSize; col++) {
                const x = startX + col * cellSize + cellSize / 2;
                const y = startY + row * cellSize + cellSize / 2;

                // グリッドセルの透明なボタンを作成
                const zone = this.add.zone(x, y, cellSize, cellSize)
                    .setRectangleDropZone(cellSize, cellSize)
                    .setInteractive({ useHandCursor: true });

                // ホバー時のハイライト
                zone.on('pointerover', () => {
                    zone.setAlpha(0.3);
                });

                zone.on('pointerout', () => {
                    zone.setAlpha(0);
                });

                zone.on('pointerdown', () => {
                    this.handleGridClick(row, col);
                });

                // グリッドセルの情報を保存
                this.grid.push({
                    row: row,
                    col: col,
                    x: x,
                    y: y,
                    width: cellSize,
                    height: cellSize,
                    number: null, // 後で数字を割り当て
                    color: null,  // 後で色を割り当て
                    object: null, // テキストまたは色ブロックのオブジェクト
                    zone: zone,
                    clicked: false
                });
            }
        }
    }
}

// シーン4: ClearScene
class ClearScene extends BaseScene {
    constructor() {
        super('ClearScene');
    }

    init(data) {
        super.init(data);
        this.grid = data.grid; // グリッドデータを受け取る
        this.messages = [
            'すごい！',
            'よくできた！',
            'ナイス！',
            'かんせい！',
            'がんばったね！',
            'きらきら！',
            'ピカピカ！',
            'スマート！',
            'トップだ！',
            'ファンタスティック！'
        ];
    }

    create() {
        const { width, height } = this.scale;

        // グリッドの描画
        this.drawGrid();

        // 正しい数字または色を全て表示
        this.grid.forEach(cell => {
            if (this.gameMode === 'number' && cell.number !== null) {
                const numberFontSize = calculateResponsiveSize(this, 0.06);
                const numberText = this.add.text(cell.x, cell.y, cell.number, {
                    fontSize: `${numberFontSize}px`,
                    fill: '#fff',
                    backgroundColor: Phaser.Display.Color.IntegerToColor(COLORS.success).rgba,
                    padding: { x: 10, y: 10 },
                    borderRadius: 10,
                    align: 'center'
                }).setOrigin(0.5, 0.5).setVisible(true);
            } else if (this.gameMode === 'color' && cell.color !== null) {
                const colorBlock = this.add.rectangle(cell.x, cell.y, cell.width * 0.8, cell.height * 0.8, cell.color)
                    .setOrigin(0.5, 0.5)
                    .setAlpha(1);
            }
        });

        // クリアテキスト
        const clearFontSize = calculateResponsiveSize(this, 0.08);
        this.add.text(width / 2, height * 0.2, 'クリア！', {
            fontSize: `${clearFontSize}px`,
            fill: Phaser.Display.Color.IntegerToColor(COLORS.warning).rgba,
            align: 'center',
            wordWrap: { width: width * 0.9 }
        }).setOrigin(0.5, 0.5);

        // ランダムメッセージ
        const messageFontSize = calculateResponsiveSize(this, 0.06);
        const randomMessage = Phaser.Utils.Array.GetRandom(this.messages);
        this.add.text(width / 2, height * 0.35, randomMessage, {
            fontSize: `${messageFontSize}px`,
            fill: '#000',
            align: 'center',
            wordWrap: { width: width * 0.9 }
        }).setOrigin(0.5, 0.5);

        // エフェクト（簡易的な花火）
        this.createParticleEffect();

        // ボタンのサイズと位置
        const buttonWidth = width * 0.4;
        const buttonHeight = height * 0.1;
        const buttonSpacing = width * 0.05;
        const buttonYPosition = height * 0.6;

        // 「もういちど」ボタン
        const retryButton = createCustomButton(
            this,
            'もういちど',
            width / 2 - buttonWidth / 2 - buttonSpacing / 2,
            buttonYPosition,
            buttonWidth,
            buttonHeight,
            COLORS.info,
            COLORS.infoHover,
            () => {
                this.scene.start('CountdownScene', {
                    displayTime: this.displayTime,
                    level: this.level,
                    gridSize: this.gridSize,
                    gameMode: this.gameMode
                });
            }
        );

        // 「つぎのれべる」ボタン
        const nextLevelButton = createCustomButton(
            this,
            'つぎのれべる',
            width / 2 + buttonWidth / 2 + buttonSpacing / 2,
            buttonYPosition,
            buttonWidth,
            buttonHeight,
            COLORS.success,
            COLORS.successHover,
            () => {
                this.scene.start('CountdownScene', {
                    displayTime: this.displayTime,
                    level: this.level + 1,
                    gridSize: this.gridSize,
                    gameMode: this.gameMode
                });
            }
        );
    }
}

// シーン5: RetryScene
class RetryScene extends BaseScene {
    constructor() {
        super('RetryScene');
    }

    init(data) {
        super.init(data);
        this.grid = data.grid;
        this.wrongCells = data.wrongCells;
    }

    create() {
        const { width, height } = this.scale;

        // ゲームオーバーのテキスト
        const gameOverFontSize = calculateResponsiveSize(this, 0.08);
        this.add.text(width / 2, height * 0.2, 'ゲームオーバー', {
            fontSize: `${gameOverFontSize}px`,
            fill: '#FF0000',
            align: 'center',
            wordWrap: { width: width * 0.9 }
        }).setOrigin(0.5, 0.5);

        // グリッドの描画
        this.drawGrid();

        // 正しい数字または色を全て表示
        this.grid.forEach(cell => {
            if (this.gameMode === 'number' && cell.number !== null) {
                const numberFontSize = calculateResponsiveSize(this, 0.06);
                const numberText = this.add.text(cell.x, cell.y, cell.number, {
                    fontSize: `${numberFontSize}px`,
                    fill: '#fff',
                    backgroundColor: Phaser.Display.Color.IntegerToColor(COLORS.danger).rgba,
                    padding: { x: 10, y: 10 },
                    borderRadius: 10,
                    align: 'center'
                }).setOrigin(0.5, 0.5).setVisible(true); // 正しい数字を表示
            } else if (this.gameMode === 'color' && cell.color !== null) {
                const colorBlock = this.add.rectangle(cell.x, cell.y, cell.width * 0.8, cell.height * 0.8, cell.color)
                    .setOrigin(0.5, 0.5)
                    .setAlpha(1); // 正しい色ブロックを表示
            }
        });

        // 間違ってクリックされたセルに「×」マークを表示
        this.wrongCells.forEach(wrongCell => {
            const cell = this.grid.find(c => c.row === wrongCell.row && c.col === wrongCell.col);
            if (cell) {
                const xMarkFontSize = calculateResponsiveSize(this, 0.1);
                this.add.text(cell.x, cell.y, '×', {
                    fontSize: `${xMarkFontSize}px`,
                    fill: '#FF0000',
                    align: 'center'
                }).setOrigin(0.5, 0.5);
            }
        });

        // 「もういちど」ボタン
        const retryButton = createCustomButton(
            this,
            'もういちど',
            width / 2,
            height * 0.65,
            width * 0.6,
            height * 0.12,
            COLORS.danger,
            COLORS.dangerHover,
            () => {
                this.scene.start('CountdownScene', {
                    displayTime: this.displayTime,
                    level: this.level,
                    gridSize: this.gridSize,
                    gameMode: this.gameMode
                });
            }
        );

        // 「さいしょから」ボタン
        const restartButton = createCustomButton(
            this,
            'さいしょから',
            width / 2,
            height * 0.8,
            width * 0.6,
            height * 0.12,
            COLORS.info,
            COLORS.infoHover,
            () => {
                this.scene.start('SelectionScene');
            }
        );
    }
}

// Phaserの設定
const config = {
    type: Phaser.AUTO,
    parent: 'game-container',
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: '#f0f8ff',
    scene: [SelectionScene, CountdownScene, GameScene, ClearScene, RetryScene],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: window.innerWidth,
        height: window.innerHeight
    },
    // 解像度をデバイスのピクセル比に合わせる
    resolution: window.devicePixelRatio
};

// ゲームインスタンスの作成
const game = new Phaser.Game(config);

// ウィンドウリサイズ時の対応
window.addEventListener('resize', () => {
    game.scale.resize(window.innerWidth, window.innerHeight);
});
