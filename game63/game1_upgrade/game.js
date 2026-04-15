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

const MEMORY_CHUNK_COLORS = [
    { color: 0xff6b6b, label: 'あか' },
    { color: 0x4dabf7, label: 'あお' },
    { color: 0xffd43b, label: 'きいろ' },
    { color: 0x69db7c, label: 'みどり' }
];

const GAME_METRICS_KEY = 'game1_memory_sessions_v1';
const TEMPO_SETTINGS = {
    slow: { label: 'ゆっくり', beatMs: 700 },
    normal: { label: 'ふつう', beatMs: 420 }
};

const SESSION_STATE = {
    currentSession: null
};

function startSession(mode, gridSize, displayTime, tempo) {
    const sessionId = `session-${Date.now()}`;
    SESSION_STATE.currentSession = {
        sessionId,
        mode,
        gridSize,
        displayTime,
        tempo,
        startedAt: new Date().toISOString(),
        events: [],
        stats: {
            roundsPlayed: 0,
            successCount: 0,
            failCount: 0
        },
        rhythmStats: {
            roundsWithGuide: 0
        },
        dynamicLevel: 1,
        dynamicDisplayTime: displayTime,
        winStreak: 0,
        loseStreak: 0,
        adjustmentMessage: '',
        reviewQueue: [],
        reviewStats: {
            total: 0,
            success: 0
        }
    };
    return SESSION_STATE.currentSession;
}

function getSession() {
    return SESSION_STATE.currentSession;
}

function recordEvent(eventName, payload = {}) {
    const session = getSession();
    if (!session) return;
    const event = {
        event: eventName,
        timestamp: new Date().toISOString(),
        level: payload.level ?? session.dynamicLevel,
        mode: payload.mode ?? session.mode,
        tempo: payload.tempo ?? session.tempo ?? 'normal',
        result: payload.result ?? null,
        round_id: payload.roundId ?? null,
        source_round_id: payload.sourceRoundId ?? null
    };
    Object.keys(event).forEach((key) => {
        if (event[key] === null || event[key] === undefined) {
            delete event[key];
        }
    });
    session.events.push(event);
}

function saveSessionToLocalStorage(session) {
    if (!session) return;
    const saved = JSON.parse(localStorage.getItem(GAME_METRICS_KEY) || '[]');
    saved.push({
        sessionId: session.sessionId,
        startedAt: session.startedAt,
        endedAt: new Date().toISOString(),
        mode: session.mode,
        gridSize: session.gridSize,
        initialDisplayTime: session.displayTime,
        tempo: session.tempo,
        stats: session.stats,
        rhythmStats: session.rhythmStats,
        reviewStats: session.reviewStats,
        events: session.events
    });
    localStorage.setItem(GAME_METRICS_KEY, JSON.stringify(saved));
}

function endSession() {
    const session = getSession();
    if (!session || session.endedAt) return;
    recordEvent('session_end', {
        level: session.dynamicLevel,
        mode: session.mode,
        result: session.stats.failCount > 0 ? 'mixed' : 'success'
    });
    session.endedAt = new Date().toISOString();
    saveSessionToLocalStorage(session);
}

function cloneRoundPlan(plan) {
    return JSON.parse(JSON.stringify(plan));
}

function createRoundPlanFromGrid(grid, gameMode, roundId) {
    return {
        sourceRoundId: roundId,
        gameMode,
        targets: grid
            .filter((cell) => (gameMode === 'number' ? cell.number !== null : cell.color !== null))
            .map((cell) => ({
                row: cell.row,
                col: cell.col,
                number: cell.number,
                color: cell.color,
                colorName: cell.colorName
            }))
    };
}

function enqueueReviewRound(roundPlan) {
    const session = getSession();
    if (!session || !roundPlan?.targets?.length) return;
    session.reviewQueue.push({
        dueInRounds: Phaser.Math.Between(1, 3),
        roundPlan: cloneRoundPlan(roundPlan)
    });
}

function popDueReviewRound(currentMode) {
    const session = getSession();
    if (!session || session.reviewQueue.length === 0) return null;
    session.reviewQueue.forEach((item) => {
        item.dueInRounds -= 1;
    });
    const dueIndex = session.reviewQueue.findIndex((item) => item.dueInRounds <= 0 && item.roundPlan.gameMode === currentMode);
    if (dueIndex === -1) return null;
    return session.reviewQueue.splice(dueIndex, 1)[0].roundPlan;
}

function getHintText(grid) {
    const colorCountMap = {};
    grid.forEach((cell) => {
        if (cell.colorName) {
            colorCountMap[cell.colorName] = (colorCountMap[cell.colorName] || 0) + 1;
        }
    });
    const strongestColor = Object.entries(colorCountMap).sort((a, b) => b[1] - a[1])[0];
    if (strongestColor) {
        return `つぎは ${strongestColor[0]} のなかま から おぼえよう`;
    }
    return 'さいしょは 1つのいろ だけ みよう';
}

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
        this.tempo = data.tempo || 'normal';
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
        const existingSession = getSession();
        if (existingSession && !existingSession.endedAt && existingSession.stats.roundsPlayed > 0) {
            endSession();
        }

        // タイトル
        const titleFontSize = calculateResponsiveSize(this, 0.06);
        this.add.text(width / 2, height * 0.1, 'げーむせっていをえらんでね', {
            fontSize: `${titleFontSize}px`,
            fill: '#000',
            align: 'center',
            wordWrap: { width: width * 0.9 }
        }).setOrigin(0.5, 0.5);

        const savedSessions = JSON.parse(localStorage.getItem(GAME_METRICS_KEY) || '[]');
        const latestSession = savedSessions[savedSessions.length - 1];
        if (latestSession?.reviewStats?.total > 0) {
            const recapFontSize = calculateResponsiveSize(this, 0.032);
            this.add.text(
                width / 2,
                height * 0.16,
                `きょうは ${latestSession.reviewStats.success}/${latestSession.reviewStats.total} もん おもいだせたよ`,
                {
                    fontSize: `${recapFontSize}px`,
                    fill: '#000',
                    align: 'center',
                    wordWrap: { width: width * 0.9 }
                }
            ).setOrigin(0.5, 0.5);
        }
        if (latestSession?.rhythmStats?.roundsWithGuide > 0) {
            const rhythmRecapFontSize = calculateResponsiveSize(this, 0.028);
            this.add.text(
                width / 2,
                height * 0.2,
                `りずむで ${latestSession.rhythmStats.roundsWithGuide} らうんど れんしゅうしたよ`,
                {
                    fontSize: `${rhythmRecapFontSize}px`,
                    fill: '#000',
                    align: 'center',
                    wordWrap: { width: width * 0.9 }
                }
            ).setOrigin(0.5, 0.5);
        }

        // ボタン設定
        const buttonWidth = width * 0.25;
        const buttonHeight = height * 0.1;
        const buttonSpacing = width * 0.02;

        // 選択オプション
        const options = [
            {
                title: 'ひょうじじかんをえらんでね',
                yPosition: 0.24,
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
                yPosition: 0.4,
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
                yPosition: 0.56,
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
            },
            {
                title: 'てんぽをえらんでね',
                yPosition: 0.72,
                items: [
                    { label: 'ゆっくり', value: 'slow' },
                    { label: 'ふつう', value: 'normal' }
                ],
                buttonsArray: 'tempoButtons',
                onSelect: (button, value) => {
                    this.selectedTempo = value;
                    this.tempoButtons.forEach(btn => {
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
            height * 0.9,
            startButtonWidth,
            startButtonHeight,
            COLORS.success,
            COLORS.successHover,
            () => {
                if (startButton.getData('enabled')) {
                    const session = startSession(this.selectedGameMode, this.selectedGridSize, this.selectedTime, this.selectedTempo);
                    this.scene.start('CountdownScene', {
                        displayTime: session.dynamicDisplayTime,
                        level: session.dynamicLevel,
                        gridSize: this.selectedGridSize,
                        gameMode: this.selectedGameMode,
                        tempo: this.selectedTempo
                    });
                }
            }
        );

        startButton.setAlpha(0.5); // 初期状態は無効
        startButton.setData('enabled', false);

        // スタートボタンのスタイル更新関数
        const updateStartButton = () => {
            if (this.selectedTime && this.selectedGridSize && this.selectedGameMode && this.selectedTempo) {
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
                gameMode: this.gameMode,
                tempo: this.tempo
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
        this.chunkHighlights = [];
        this.roundId = `round-${Date.now()}`;
        this.isReviewRound = false;
        this.reviewSourceRoundId = null;
        this.roundPlan = null;
        this.recallSequence = [];
    }

    create() {
        const { width, height } = this.scale;
        const dueReview = popDueReviewRound(this.gameMode);
        if (dueReview) {
            this.roundPlan = dueReview;
            this.isReviewRound = true;
            this.reviewSourceRoundId = dueReview.sourceRoundId;
        }
        const session = getSession();
        if (session) {
            session.dynamicLevel = this.level;
            session.dynamicDisplayTime = this.displayTime;
            recordEvent('round_start', {
                level: this.level,
                mode: this.gameMode,
                tempo: this.tempo,
                roundId: this.roundId,
                sourceRoundId: this.reviewSourceRoundId,
                result: this.isReviewRound ? 'review' : 'normal'
            });
        }

        // レベル表示
        const levelFontSize = calculateResponsiveSize(this, 0.04);
        this.add.text(width * 0.05, height * 0.05, `れべる: ${this.level}`, {
            fontSize: `${levelFontSize}px`,
            fill: '#000'
        }).setOrigin(0, 0);
        this.add.text(width * 0.05, height * 0.1, `てんぽ: ${TEMPO_SETTINGS[this.tempo]?.label || 'ふつう'}`, {
            fontSize: `${levelFontSize}px`,
            fill: '#000'
        }).setOrigin(0, 0);

        if (this.isReviewRound) {
            this.add.text(width / 2, height * 0.12, 'おもいだし ちゃれんじ', {
                fontSize: `${levelFontSize}px`,
                fill: '#000',
                align: 'center'
            }).setOrigin(0.5, 0.5);
        }

        // グリッドの描画
        this.drawGrid();

        // 数字または色の配置
        if (this.gameMode === 'number') {
            this.placeNumbers();
        } else if (this.gameMode === 'color') {
            this.placeColors();
        }
        this.recallSequence = this.buildRecallSequence();
        this.playRhythmGuide();

        // 一定時間後に表示を隠す
        this.time.delayedCall(this.displayTime, () => {
            this.hideElements();
            recordEvent('memorize_phase_end', {
                level: this.level,
                mode: this.gameMode,
                roundId: this.roundId
            });
        }, [], this);
    }

    placeNumbers() {
        const usingPlan = this.isReviewRound && this.roundPlan?.targets?.length > 0;
        const totalNumbers = usingPlan ? this.roundPlan.targets.length : this.level + 2;
        if (totalNumbers > this.gridSize * this.gridSize) {
            alert('れべるがたかすぎます！ げーむをしゅうりょうします。');
            this.scene.start('SelectionScene');
            return;
        }

        if (usingPlan) {
            this.numbers = this.roundPlan.targets.map((target) => target.number).sort((a, b) => a - b);
            this.roundPlan.targets.forEach((target) => {
                const cell = this.grid.find((gridCell) => gridCell.row === target.row && gridCell.col === target.col);
                if (cell) cell.number = target.number;
            });
        } else {
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
            });
        }

        this.grid.filter((cell) => cell.number !== null).forEach((cell) => {
            // 数字のテキストオブジェクトを作成
            const numberFontSize = calculateResponsiveSize(this, 0.06);
            const numberText = this.add.text(cell.x, cell.y, cell.number, {
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
        const usingPlan = this.isReviewRound && this.roundPlan?.targets?.length > 0;
        const totalColors = usingPlan ? this.roundPlan.targets.length : this.level + 2;
        if (totalColors > this.gridSize * this.gridSize) {
            alert('れべるがたかすぎます！ げーむをしゅうりょうします。');
            this.scene.start('SelectionScene');
            return;
        }

        if (usingPlan) {
            this.roundPlan.targets.forEach((target) => {
                const cell = this.grid.find((gridCell) => gridCell.row === target.row && gridCell.col === target.col);
                if (!cell) return;
                cell.color = target.color;
                cell.colorName = target.colorName;
            });
        } else {
            const chunkPool = Phaser.Utils.Array.Shuffle([...MEMORY_CHUNK_COLORS]);
            const chunkTypes = chunkPool.slice(0, Math.min(3, totalColors));
            const selectedColors = [];
            for (let i = 0; i < totalColors; i++) {
                selectedColors.push(chunkTypes[i % chunkTypes.length]);
            }
            Phaser.Utils.Array.Shuffle(selectedColors);

            // 色の配置場所をランダムに選択
            const availableIndices = Phaser.Utils.Array.NumberArray(0, this.grid.length - 1);
            Phaser.Utils.Array.Shuffle(availableIndices);

            selectedColors.forEach((chunk, index) => {
                const gridIndex = availableIndices[index];
                const cell = this.grid[gridIndex];
                cell.color = chunk.color;
                cell.colorName = chunk.label;
            });
        }

        this.grid.filter((cell) => cell.color !== null).forEach((cell) => {
            // 色ブロックのオブジェクトを作成（初期は表示）
            const colorBlock = this.add.rectangle(cell.x, cell.y, cell.width * 0.8, cell.height * 0.8, cell.color)
                .setOrigin(0.5, 0.5)
                .setInteractive()
                .setAlpha(1); // 初期は表示
            cell.object = colorBlock;
        });

        this.drawChunkHighlights();

        this.totalTargets = this.grid.filter((cell) => cell.color !== null).length;
    }

    drawChunkHighlights() {
        const groupedCells = {};
        this.grid.forEach((cell) => {
            if (!cell.colorName) return;
            if (!groupedCells[cell.colorName]) {
                groupedCells[cell.colorName] = [];
            }
            groupedCells[cell.colorName].push(cell);
        });

        Object.values(groupedCells).forEach((cells) => {
            if (cells.length <= 1) return;
            cells.forEach((cell) => {
                const ring = this.add.circle(cell.x, cell.y, cell.width * 0.42)
                    .setStrokeStyle(4, 0xffffff, 0.8)
                    .setFillStyle(0xffffff, 0.08);
                this.chunkHighlights.push(ring);
            });
        });
    }

    buildRecallSequence() {
        if (this.gameMode === 'number') {
            return this.grid
                .filter((cell) => cell.number !== null)
                .sort((a, b) => a.number - b.number)
                .map((cell) => ({ row: cell.row, col: cell.col }));
        }
        return this.grid
            .filter((cell) => cell.color !== null)
            .sort((a, b) => (a.row - b.row) || (a.col - b.col))
            .map((cell) => ({ row: cell.row, col: cell.col }));
    }

    playRhythmGuide() {
        const beatMs = TEMPO_SETTINGS[this.tempo]?.beatMs || TEMPO_SETTINGS.normal.beatMs;
        const maxSteps = Math.max(1, Math.floor((this.displayTime - 120) / beatMs));
        const steps = this.recallSequence.slice(0, maxSteps);
        if (steps.length === 0) return;

        const pulse = this.add.circle(0, 0, 8, 0xffffff, 0.35).setVisible(false);
        const rhythmText = this.add.text(this.scale.width / 2, this.scale.height * 0.16, 'ぽん ぽん', {
            fontSize: `${calculateResponsiveSize(this, 0.04)}px`,
            fill: '#000',
            align: 'center'
        }).setOrigin(0.5, 0.5);

        steps.forEach((step, idx) => {
            this.time.delayedCall(beatMs * idx, () => {
                const cell = this.grid.find((item) => item.row === step.row && item.col === step.col);
                if (!cell) return;
                pulse.setVisible(true).setPosition(cell.x, cell.y).setRadius(cell.width * 0.25);
                this.tweens.add({
                    targets: pulse,
                    alpha: { from: 0.4, to: 0.05 },
                    scale: { from: 1, to: 1.7 },
                    duration: Math.max(140, beatMs - 60)
                });
            }, [], this);
        });

        this.time.delayedCall(beatMs * steps.length, () => {
            pulse.destroy();
            rhythmText.destroy();
        }, [], this);

        const session = getSession();
        if (session) {
            session.rhythmStats.roundsWithGuide += 1;
            recordEvent('rhythm_guide_played', {
                level: this.level,
                mode: this.gameMode,
                tempo: this.tempo,
                roundId: this.roundId,
                result: `steps:${steps.length}`
            });
        }
    }

    hideElements() {
        this.grid.forEach(cell => {
            if (cell.object) {
                cell.object.setVisible(false);
            }
        });
        this.chunkHighlights.forEach((highlight) => highlight.setVisible(false));
    }

    resolveRoundResult(isSuccess) {
        const session = getSession();
        if (!session) return { nextLevel: this.level, nextDisplayTime: this.displayTime, adjustmentMessage: '' };
        session.stats.roundsPlayed += 1;
        if (isSuccess) {
            session.stats.successCount += 1;
            session.winStreak += 1;
            session.loseStreak = 0;
        } else {
            session.stats.failCount += 1;
            session.loseStreak += 1;
            session.winStreak = 0;
        }

        let nextLevel = this.level;
        let nextDisplayTime = this.displayTime;
        let adjustmentMessage = '';
        if (session.loseStreak >= 2) {
            nextLevel = Math.max(1, this.level - 1);
            nextDisplayTime = Math.min(3000, this.displayTime + 500);
            session.loseStreak = 0;
            adjustmentMessage = 'ちょっと やさしくしたよ';
        } else if (session.winStreak >= 2) {
            nextLevel = this.level + 1;
            nextDisplayTime = Math.max(500, this.displayTime - 200);
            session.winStreak = 0;
            adjustmentMessage = 'ちょっと つよくしたよ';
        }

        session.dynamicLevel = nextLevel;
        session.dynamicDisplayTime = nextDisplayTime;
        session.adjustmentMessage = adjustmentMessage;
        if (this.isReviewRound) {
            session.reviewStats.total += 1;
            if (isSuccess) {
                session.reviewStats.success += 1;
            }
        } else if (isSuccess) {
            enqueueReviewRound(createRoundPlanFromGrid(this.grid, this.gameMode, this.roundId));
        }

        if (adjustmentMessage) {
            recordEvent('difficulty_adjusted', {
                level: this.level,
                mode: this.gameMode,
                roundId: this.roundId,
                result: adjustmentMessage
            });
        }
        return { nextLevel, nextDisplayTime, adjustmentMessage };
    }

    handleGridClick(row, col) {
        const clickedCell = this.grid.find(cell => cell.row === row && cell.col === col);
        if (!clickedCell) return;

        if (this.gameMode === 'number') {
            // 数字モード
            if (clickedCell.number === null) {
                recordEvent('recall_fail', {
                    level: this.level,
                    mode: this.gameMode,
                    result: 'fail',
                    roundId: this.roundId
                });
                const adjustment = this.resolveRoundResult(false);
                this.wrongCells.push({ row, col });
                this.scene.start('RetryScene', {
                    displayTime: adjustment.nextDisplayTime,
                    level: adjustment.nextLevel,
                    gridSize: this.gridSize,
                    gameMode: this.gameMode,
                    tempo: this.tempo,
                    grid: this.grid,
                    wrongCells: this.wrongCells,
                    hintText: getHintText(this.grid),
                    adjustmentMessage: adjustment.adjustmentMessage
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
                    recordEvent('recall_success', {
                        level: this.level,
                        mode: this.gameMode,
                        result: 'success',
                        roundId: this.roundId
                    });
                    const adjustment = this.resolveRoundResult(true);
                    this.time.delayedCall(500, () => {
                        this.scene.start('ClearScene', {
                            displayTime: adjustment.nextDisplayTime,
                            level: adjustment.nextLevel,
                            gridSize: this.gridSize,
                            gameMode: this.gameMode,
                            tempo: this.tempo,
                            grid: this.grid,
                            adjustmentMessage: adjustment.adjustmentMessage,
                            isReviewRound: this.isReviewRound
                        });
                    }, [], this);
                }
            } else {
                recordEvent('recall_fail', {
                    level: this.level,
                    mode: this.gameMode,
                    result: 'fail',
                    roundId: this.roundId
                });
                const adjustment = this.resolveRoundResult(false);
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
                    displayTime: adjustment.nextDisplayTime,
                    level: adjustment.nextLevel,
                    gridSize: this.gridSize,
                    gameMode: this.gameMode,
                    tempo: this.tempo,
                    grid: this.grid,
                    wrongCells: this.wrongCells,
                    hintText: getHintText(this.grid),
                    adjustmentMessage: adjustment.adjustmentMessage
                });
            }
        } else if (this.gameMode === 'color') {
            // 色モード
            if (clickedCell.color === null) {
                recordEvent('recall_fail', {
                    level: this.level,
                    mode: this.gameMode,
                    result: 'fail',
                    roundId: this.roundId
                });
                const adjustment = this.resolveRoundResult(false);
                this.wrongCells.push({ row, col });
                this.scene.start('RetryScene', {
                    displayTime: adjustment.nextDisplayTime,
                    level: adjustment.nextLevel,
                    gridSize: this.gridSize,
                    gameMode: this.gameMode,
                    tempo: this.tempo,
                    grid: this.grid,
                    wrongCells: this.wrongCells,
                    hintText: getHintText(this.grid),
                    adjustmentMessage: adjustment.adjustmentMessage
                });
                return;
            }

            if (clickedCell.clicked) return;

            const expectedStep = this.recallSequence[this.clickedTargets];
            const isRightOrder = expectedStep && expectedStep.row === row && expectedStep.col === col;
            if (!isRightOrder) {
                recordEvent('recall_fail', {
                    level: this.level,
                    mode: this.gameMode,
                    result: 'wrong_order',
                    roundId: this.roundId
                });
                const adjustment = this.resolveRoundResult(false);
                this.wrongCells.push({ row, col });
                this.scene.start('RetryScene', {
                    displayTime: adjustment.nextDisplayTime,
                    level: adjustment.nextLevel,
                    gridSize: this.gridSize,
                    gameMode: this.gameMode,
                    tempo: this.tempo,
                    grid: this.grid,
                    wrongCells: this.wrongCells,
                    hintText: 'りずむの じゅんで たっちしよう',
                    adjustmentMessage: adjustment.adjustmentMessage
                });
                return;
            }

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
                recordEvent('recall_success', {
                    level: this.level,
                    mode: this.gameMode,
                    result: 'success',
                    roundId: this.roundId
                });
                const adjustment = this.resolveRoundResult(true);
                this.time.delayedCall(500, () => {
                    this.scene.start('ClearScene', {
                        displayTime: adjustment.nextDisplayTime,
                        level: adjustment.nextLevel,
                        gridSize: this.gridSize,
                        gameMode: this.gameMode,
                        tempo: this.tempo,
                        grid: this.grid,
                        adjustmentMessage: adjustment.adjustmentMessage,
                        isReviewRound: this.isReviewRound
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
        this.adjustmentMessage = data.adjustmentMessage || '';
        this.isReviewRound = data.isReviewRound || false;
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

        if (this.isReviewRound) {
            const reviewFontSize = calculateResponsiveSize(this, 0.04);
            this.add.text(width / 2, height * 0.42, 'おもいだし せいこう！', {
                fontSize: `${reviewFontSize}px`,
                fill: '#000',
                align: 'center'
            }).setOrigin(0.5, 0.5);
        }

        if (this.adjustmentMessage) {
            const adjustFontSize = calculateResponsiveSize(this, 0.04);
            this.add.text(width / 2, height * 0.45, this.adjustmentMessage, {
                fontSize: `${adjustFontSize}px`,
                fill: '#000',
                align: 'center'
            }).setOrigin(0.5, 0.5);
        }

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
                    gameMode: this.gameMode,
                    tempo: this.tempo
                });
            }
        );

        // 「つぎのれべる」ボタン
        const nextLevelButton = createCustomButton(
            this,
            'つぎへ',
            width / 2 + buttonWidth / 2 + buttonSpacing / 2,
            buttonYPosition,
            buttonWidth,
            buttonHeight,
            COLORS.success,
            COLORS.successHover,
            () => {
                this.scene.start('CountdownScene', {
                    displayTime: this.displayTime,
                    level: this.level,
                    gridSize: this.gridSize,
                    gameMode: this.gameMode,
                    tempo: this.tempo
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
        this.hintText = data.hintText || 'さいしょは 1つのいろ だけ みよう';
        this.adjustmentMessage = data.adjustmentMessage || '';
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

        const hintFontSize = calculateResponsiveSize(this, 0.04);
        this.add.text(width / 2, height * 0.28, this.hintText, {
            fontSize: `${hintFontSize}px`,
            fill: '#000',
            align: 'center',
            wordWrap: { width: width * 0.9 }
        }).setOrigin(0.5, 0.5);
        recordEvent('hint_shown', {
            level: this.level,
            mode: this.gameMode,
            result: this.hintText
        });

        if (this.adjustmentMessage) {
            this.add.text(width / 2, height * 0.34, this.adjustmentMessage, {
                fontSize: `${hintFontSize}px`,
                fill: '#000',
                align: 'center'
            }).setOrigin(0.5, 0.5);
        }

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
                    gameMode: this.gameMode,
                    tempo: this.tempo
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
                endSession();
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

window.addEventListener('beforeunload', () => {
    endSession();
});
