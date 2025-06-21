// ゲーム設定データ
const gameSettings = {
    speedOptions: {
        slow: { duration: 400, label: "🐌 ゆっくり" },
        normal: { duration: 300, label: "🚶 ふつう" },
        fast: { duration: 200, label: "🏃 はやい" }
    }
};

const stageConfig = [
    { stage: 1, flashCount: 2, allowRepeat: false },
    { stage: 2, flashCount: 3, allowRepeat: false },
    { stage: 3, flashCount: 4, allowRepeat: false },
    { stage: 4, flashCount: 5, allowRepeat: true },
    { stage: 5, flashCount: 6, allowRepeat: true },
    { stage: 6, flashCount: 7, allowRepeat: true },
    { stage: 7, flashCount: 8, allowRepeat: true }
];

const messages = {
    success: [
        "すごいね！だんだん上手になってるよ！",
        "集中力がアップしてる！",
        "記憶力がどんどん強くなってるね！"
    ],
    failure: [
        "大丈夫！もう一度チャレンジしてみよう！",
        "みんな最初は難しいんだよ",
        "君ならきっとできるよ！"
    ],
    hints: [
        "もう一度、ゆっくり見てみよう！",
        "今度は少しゆっくり光るよ！"
    ]
};

// ゲーム状態
let gameState = {
    currentStage: 1,
    lives: 2,
    maxLives: 2,
    flashCount: 2,
    flashDuration: 400,
    baseDuration: 400,
    allowRepeat: false,
    sequence: [],
    playerInput: [],
    isPlaying: false,
    isShowingSequence: false,
    isAcceptingInput: false,
    failCount: 0,
    selectedSpeed: null
};

// DOM要素の取得
const screens = {
    settings: document.getElementById('settingsScreen'),
    game: document.getElementById('gameScreen'),
    gameOver: document.getElementById('gameOverScreen')
};

const elements = {
    // Settings screen
    speedButtons: document.querySelectorAll('.speed-btn'),
    startGameBtn: document.getElementById('startGameBtn'),
    settingsBtn: document.getElementById('settingsBtn'),
    backToSettingsBtn: document.getElementById('backToSettingsBtn'),
    
    // Game screen
    readyBtn: document.getElementById('readyBtn'),
    nextStageBtn: document.getElementById('nextStageBtn'),
    retryBtn: document.getElementById('retryBtn'),
    backToStartBtn: document.getElementById('backToStartBtn'),
    restartBtn: document.getElementById('restartBtn'),
    
    // UI elements
    stageNumber: document.getElementById('stageNumber'),
    memoryCount: document.getElementById('memoryCount'),
    livesHearts: document.getElementById('livesHearts'),
    progressFill: document.getElementById('progressFill'),
    progressText: document.getElementById('progressText'),
    gameMessage: document.getElementById('gameMessage'),
    countdown: document.getElementById('countdown'),
    countdownNumber: document.getElementById('countdownNumber'),
    gameBoard: document.getElementById('gameBoard'),
    finalStage: document.getElementById('finalStage'),
    squares: document.querySelectorAll('.game-square')
};

// 初期化
function init() {
    setupEventListeners();
    showScreen('settings');
}

// イベントリスナーの設定
function setupEventListeners() {
    // Ensure all squares are selected (including any new ones)
    elements.squares = document.querySelectorAll('.game-square');
    // Settings screen
    elements.speedButtons.forEach(btn => {
        btn.addEventListener('click', () => selectSpeed(btn.dataset.speed));
    });
    elements.startGameBtn.addEventListener('click', startGame);
    elements.settingsBtn.addEventListener('click', () => showScreen('settings'));
    elements.backToSettingsBtn.addEventListener('click', () => showScreen('settings'));
    
    // Game controls
    elements.nextStageBtn.addEventListener('click', nextStage);
    elements.retryBtn.addEventListener('click', retryStage);
    elements.backToStartBtn.addEventListener('click', () => showScreen('settings'));
    elements.restartBtn.addEventListener('click', () => {
        resetGame();
        startGame();
    });

    // ゲームボードのタッチ/クリックイベント
    elements.squares.forEach((square, index) => {
        square.addEventListener('click', () => handleSquareClick(index));
        square.addEventListener('touchstart', (e) => {
            e.preventDefault();
            handleSquareClick(index);
        });
    });
}

// 速度選択
function selectSpeed(speed) {
    gameState.selectedSpeed = speed;
    gameState.baseDuration = gameSettings.speedOptions[speed].duration;
    
    // 選択状態の更新
    elements.speedButtons.forEach(btn => {
        btn.classList.remove('selected');
        if (btn.dataset.speed === speed) {
            btn.classList.add('selected');
        }
    });
    
    // スタートボタンを有効化
    elements.startGameBtn.disabled = false;
}

// 画面表示制御
function showScreen(screenName) {
    Object.values(screens).forEach(screen => screen.classList.add('hidden'));
    screens[screenName].classList.remove('hidden');
}

// ゲーム開始
function startGame() {
    resetGame();
    showScreen('game');
    updateUI();
    startCountdown();
}

// ゲーム状態リセット
function resetGame() {
    gameState = {
        ...gameState,
        currentStage: 1,
        lives: 2,
        maxLives: 2,
        flashCount: 2,
        flashDuration: gameState.baseDuration,
        allowRepeat: false,
        sequence: [],
        playerInput: [],
        isPlaying: false,
        isShowingSequence: false,
        isAcceptingInput: false,
        failCount: 0
    };
    updateStageConfig();
}

// ステージ設定の更新
function updateStageConfig() {
    const config = stageConfig.find(s => s.stage === gameState.currentStage) || 
                   { flashCount: Math.max(8, gameState.currentStage + 1), allowRepeat: true };
    
    gameState.flashCount = config.flashCount;
    gameState.allowRepeat = config.allowRepeat;
    
    // 基本速度を設定
    gameState.flashDuration = gameState.baseDuration;
    
    // ステージ7以降は段階的に速度アップ
    if (gameState.currentStage >= 7) {
        const speedReduction = Math.min((gameState.currentStage - 7) * 50, 200);
        gameState.flashDuration = Math.max(gameState.baseDuration - speedReduction, 200);
    }
    
    // ヒント機能：2回目の失敗時は表示時間を延長
    if (gameState.failCount >= 1) {
        gameState.flashDuration += 100;
    }
}

// UI更新
function updateUI() {
    elements.stageNumber.textContent = `ステージ ${gameState.currentStage}`;
    elements.memoryCount.textContent = gameState.flashCount;
    elements.livesHearts.textContent = '❤️'.repeat(gameState.lives);
    
    // プログレスバー更新
    // 最終ステージはstageConfigから自動取得
    const maxStage = stageConfig[stageConfig.length - 1]?.stage || 7;
    const progress = (gameState.currentStage / maxStage) * 100;
    elements.progressFill.style.width = `${Math.min(progress, 100)}%`;
    elements.progressText.textContent = `${gameState.currentStage}/${maxStage}`;
}

// メッセージ表示
function showMessage(message) {
    elements.gameMessage.textContent = message;
}

// ボタン表示制御
function showButton(buttonType) {
    const buttons = ['ready', 'nextStage', 'retry'];
    buttons.forEach(btn => {
        const element = elements[btn + 'Btn'];
        if (btn === buttonType) {
            element.classList.remove('hidden');
        } else {
            element.classList.add('hidden');
        }
    });
}

// カウントダウン開始
async function startCountdown() {
    showButton(null);
    showMessage('');
    
    for (let i = 3; i > 0; i--) {
        elements.countdownNumber.textContent = i;
        elements.countdown.classList.remove('hidden');
        await sleep(1000);
        elements.countdown.classList.add('hidden');
        await sleep(100);
    }
    
    startSequence();
}

// シーケンス開始
async function startSequence() {
    gameState.isPlaying = true;
    gameState.isShowingSequence = true;
    gameState.playerInput = [];
    
    // シーケンス生成
    generateSequence();
    
    showMessage('よく見て覚えよう！');
    await sleep(500);
    
    // シーケンス表示
    await showSequence();
    
    // プレイヤー入力待ち
    gameState.isShowingSequence = false;
    gameState.isAcceptingInput = true;
    showMessage('順番にタップしてね！');
}

// シーケンス生成
function generateSequence() {
    gameState.sequence = [];
    for (let i = 0; i < gameState.flashCount; i++) {
        let nextIndex;
        do {
            nextIndex = Math.floor(Math.random() * 5);
        } while (!gameState.allowRepeat && i > 0 && nextIndex === gameState.sequence[i - 1]);
        
        gameState.sequence.push(nextIndex);
    }
}

// シーケンス表示
async function showSequence() {
    for (let i = 0; i < gameState.sequence.length; i++) {
        await sleep(200);
        const squareIndex = gameState.sequence[i];
        const square = elements.squares[squareIndex];
        
        // マスを光らせる
        square.classList.add('flash');
        await sleep(gameState.flashDuration);
        square.classList.remove('flash');
        
        if (i < gameState.sequence.length - 1) {
            await sleep(200);
        }
    }
}

// マスクリック処理
function handleSquareClick(index) {
    if (!gameState.isAcceptingInput) return;
    
    const square = elements.squares[index];
    
    // 視覚的フィードバック
    square.classList.add('user-tap');
    setTimeout(() => square.classList.remove('user-tap'), 200);
    
    // 入力を記録
    gameState.playerInput.push(index);
    
    // 入力チェック
    checkInput();
}

// 入力チェック
function checkInput() {
    const currentIndex = gameState.playerInput.length - 1;
    const expectedIndex = gameState.sequence[currentIndex];
    const actualIndex = gameState.playerInput[currentIndex];
    
    if (actualIndex !== expectedIndex) {
        // 間違い
        handleFailure();
        return;
    }
    
    // 正解継続中
    if (gameState.playerInput.length === gameState.sequence.length) {
        // 全て正解
        handleSuccess();
    }
}

// 成功処理
async function handleSuccess() {
    gameState.isAcceptingInput = false;
    gameState.failCount = 0;
    gameState.lives = gameState.maxLives; // ライフ回復
    
    // 励ましメッセージ
    const successMessage = messages.success[Math.floor(Math.random() * messages.success.length)];
    showMessage(successMessage);

    await sleep(2000);

    // 成功の紙吹雪エフェクト
    createConfetti();

    if (gameState.currentStage >= 7) {
        // 高ステージクリア
        showMessage('次のステージに進もう！');
        showButton('nextStage');
    } else {
        // 次ステージ
        showMessage('次のステージに進もう！');
        showButton('nextStage');
    }
}

// 失敗処理
async function handleFailure() {
    gameState.isAcceptingInput = false;
    gameState.lives--;
    gameState.failCount++;
    
    updateUI();
    
    if (gameState.lives <= 0) {
        // ゲームオーバー
        const failureMessage = messages.failure[Math.floor(Math.random() * messages.failure.length)];
        showMessage(failureMessage);
        await sleep(2000);
        showGameOver();
        return;
    }
    
    // ヒント表示
    let hintMessage;
    if (gameState.failCount === 1) {
        hintMessage = messages.hints[0]; // "もう一度、ゆっくり見てみよう！"
    } else {
        hintMessage = messages.hints[1]; // "今度は少しゆっくり光るよ！"
        updateStageConfig(); // 表示時間延長
    }
    
    showMessage(hintMessage);
    await sleep(2000);
    showButton('retry');
}

// 次ステージ
function nextStage() {
    gameState.currentStage++;
    gameState.lives = gameState.maxLives;
    gameState.failCount = 0;
    updateStageConfig();
    updateUI();
    startCountdown();
}

// ステージリトライ
function retryStage() {
    updateStageConfig();
    updateUI();
    startCountdown();
}

// 紙吹雪エフェクト
function createConfetti() {
    const container = document.body;
    const colors = ['#ff9a9e', '#a1c4fd', '#f6d365', '#96e6a1', '#ffecd2'];
    const confettiCount = 50;

    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.top = '-10px';
        confetti.style.width = Math.floor(Math.random() * 10 + 5) + 'px';
        confetti.style.height = Math.floor(Math.random() * 10 + 5) + 'px';
        confetti.style.opacity = 1;
        confetti.style.transform = 'rotate(' + Math.random() * 360 + 'deg)';

        const shapes = ['', '50%'];
        confetti.style.borderRadius = shapes[Math.floor(Math.random() * shapes.length)];

        container.appendChild(confetti);

        const animationDuration = 1 + Math.random() * 2;
        const animationDelay = Math.random() * 0.5;
        confetti.style.animation = `confetti-fall ${animationDuration}s ease-in ${animationDelay}s forwards`;
        confetti.style.position = 'fixed';
        confetti.style.zIndex = '9999';

        const keyframes = `
            @keyframes confetti-fall {
                0% { transform: translateY(0) rotate(0deg); opacity: 1; }
                100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
            }
        `;

        if (!document.querySelector('style#confetti-style')) {
            const styleSheet = document.createElement('style');
            styleSheet.id = 'confetti-style';
            styleSheet.innerHTML = keyframes;
            document.head.appendChild(styleSheet);
        }

        setTimeout(() => {
            container.removeChild(confetti);
        }, (animationDuration + animationDelay) * 1000);
    }
}

// ゲームオーバー
function showGameOver() {
    elements.finalStage.innerHTML = `到達ステージ: <span class="highlight">${gameState.currentStage}</span>`;
    showScreen('gameOver');
}

// ユーティリティ関数
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// 初期化実行
document.addEventListener('DOMContentLoaded', init);