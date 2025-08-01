// ゲームデータ
const events = [
    {
        id: "nyugakushiki",
        name: "にゅうがくしき",
        image: "images/nyugakushiki.png",
        description: "入学式"
    },
    {
        id: "kodomonohi", 
        name: "こどものひ",
        image: "images/kodomonohi.png",
        description: "子供の日"
    },
    {
        id: "hahanohi",
        name: "ははのひ", 
        image: "images/hahanohi.png",
        description: "母の日"
    },
    {
        id: "tsuyu",
        name: "つゆ",
        image: "images/tsuyu.png",
        description: "梅雨"
    },
    {
        id: "tanabata",
        name: "たなばた",
        image: "images/tanabata.png",
        description: "七夕"
    },
    {
        id: "halloween",
        name: "はろうぃん",
        image: "images/halloween.png",
        description: "ハロウィン"
    },
    {
        id: "shichigosan", 
        name: "しちごさん",
        image: "images/shichigosan.png",
        description: "七五三"
    },
    {
        id: "kurisumasu",
        name: "くりすます",
        image: "images/kurisumasu.png",
        description: "クリスマス"
    },
    {
        id: "oshougatsu",
        name: "おしょうがつ",
        image: "images/oshougatsu.png",
        description: "お正月"
    },
    {
        id: "setsubun",
        name: "せつぶん", 
        image: "images/setsubun.png",
        description: "節分"
    },
    {
        id: "hinamatsuri",
        name: "ひなまつり",
        image: "images/hinamatsuri.png",
        description: "ひな祭り"
    },
    {
        id: "hanami",
        name: "はなみ",
        image: "images/hanami.png",
        description: "花見"
    }
];

// ゲーム状態
let gameState = {
    score: 0,
    currentEvent: null,
    choices: [],
    correctChoice: null
};

// グローバル変数
let lastTouchEnd = 0;

// DOM要素（DOMContentLoaded後に初期化）
let startScreen, gameScreen, feedbackScreen;
let startBtn, continueBtn;
let currentScoreEl, gameScoreEl;
let eventImage, choice1Btn, choice2Btn;
let feedbackIcon, feedbackText, feedbackAnswer;

// 画面切り替え関数
function showScreen(screen) {
    const screens = [startScreen, gameScreen, feedbackScreen];
    screens.forEach(s => s.classList.add('hidden'));
    screen.classList.remove('hidden');
}

// ランダムな配列要素を取得
function getRandomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
}

// 配列をシャッフル
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// 新しい問題を生成
function generateQuestion() {
    // 正解の行事をランダム選択
    gameState.currentEvent = getRandomElement(events);
    
    // 不正解の選択肢をランダム選択（正解と異なるもの）
    const incorrectOptions = events.filter(event => event.id !== gameState.currentEvent.id);
    const incorrectChoice = getRandomElement(incorrectOptions);
    
    // 選択肢をシャッフル
    gameState.choices = shuffleArray([gameState.currentEvent, incorrectChoice]);
    gameState.correctChoice = gameState.currentEvent;
    
    // UI更新
    updateGameUI();
}

// ゲームUIを更新
function updateGameUI() {
    // 画像を表示
    eventImage.src = gameState.currentEvent.image;
    eventImage.alt = gameState.currentEvent.description;
    
    // 選択肢ボタンを更新
    choice1Btn.querySelector('.choice-text').textContent = gameState.choices[0].name;
    choice2Btn.querySelector('.choice-text').textContent = gameState.choices[1].name;
    
    // ボタンの状態をリセット
    choice1Btn.className = 'choice-btn';
    choice2Btn.className = 'choice-btn';
    choice1Btn.disabled = false;
    choice2Btn.disabled = false;
    
    // スコア更新
    gameScoreEl.textContent = gameState.score;
}

// 選択肢がクリックされた時の処理
function handleChoice(selectedChoice, buttonElement, otherButtonElement) {
    const isCorrect = selectedChoice.id === gameState.correctChoice.id;
    
    // ボタンを無効化
    choice1Btn.disabled = true;
    choice2Btn.disabled = true;
    
    // ボタンの見た目を更新
    if (isCorrect) {
        buttonElement.classList.add('correct');
        gameState.score++;
    } else {
        buttonElement.classList.add('incorrect');
        // 正解のボタンをハイライト
        if (otherButtonElement.querySelector('.choice-text').textContent === gameState.correctChoice.name) {
            otherButtonElement.classList.add('correct');
        }
    }
    
    // 少し遅延してフィードバック画面を表示
    setTimeout(() => {
        showFeedback(isCorrect);
    }, 1000);
}

// フィードバック表示
function showFeedback(isCorrect) {
    if (isCorrect) {
        feedbackIcon.textContent = '⭕️';
        feedbackText.textContent = 'せいかい！';
        feedbackText.className = 'feedback-text correct';
        feedbackAnswer.textContent = `${gameState.correctChoice.name} だったね！`;
    } else {
        feedbackIcon.textContent = '❌';
        feedbackText.textContent = 'ざんねん！';
        feedbackText.className = 'feedback-text incorrect';
        feedbackAnswer.textContent = `せいかいは ${gameState.correctChoice.name} だったよ！`;
    }
    
    showScreen(feedbackScreen);
}

// ゲーム開始
function startGame() {
    try {
        generateQuestion();
        showScreen(gameScreen);
    } catch (error) {
        console.error('Error starting game:', error);
    }
}

// 次の問題へ
function nextQuestion() {
    try {
        generateQuestion();
        showScreen(gameScreen);
    } catch (error) {
        console.error('Error generating next question:', error);
    }
}

// スコア表示を更新
function updateScoreDisplay() {
    currentScoreEl.textContent = gameState.score;
}

// イベントリスナー設定
function setupEventListeners() {
    // スタートボタン
    startBtn.addEventListener('click', function(e) {
        e.preventDefault();
        startGame();
    });
    
    // 継続ボタン
    continueBtn.addEventListener('click', function(e) {
        e.preventDefault();
        nextQuestion();
    });
    
    // 選択肢ボタン
    choice1Btn.addEventListener('click', function(e) {
        e.preventDefault();
        if (!choice1Btn.disabled) {
            handleChoice(gameState.choices[0], choice1Btn, choice2Btn);
        }
    });
    
    choice2Btn.addEventListener('click', function(e) {
        e.preventDefault();
        if (!choice2Btn.disabled) {
            handleChoice(gameState.choices[1], choice2Btn, choice1Btn);
        }
    });
}

// DOM要素の初期化
function initializeElements() {
    // 画面要素
    startScreen = document.getElementById('start-screen');
    gameScreen = document.getElementById('game-screen');
    feedbackScreen = document.getElementById('feedback-screen');
    
    // ボタン要素
    startBtn = document.getElementById('start-btn');
    continueBtn = document.getElementById('continue-btn');
    
    // スコア表示要素
    currentScoreEl = document.getElementById('current-score');
    gameScoreEl = document.getElementById('game-score');
    
    // ゲーム要素
    eventImage = document.getElementById('event-image');
    choice1Btn = document.getElementById('choice-1');
    choice2Btn = document.getElementById('choice-2');
    
    // フィードバック要素
    feedbackIcon = document.getElementById('feedback-icon');
    feedbackText = document.getElementById('feedback-text');
    feedbackAnswer = document.getElementById('feedback-answer');
}

// ページ読み込み時の初期化
document.addEventListener('DOMContentLoaded', function() {
    try {
        // DOM要素を初期化
        initializeElements();
        
        // イベントリスナーを設定
        setupEventListeners();
        
        // スコア表示を更新
        updateScoreDisplay();
        
        // 画像のプリロード
        events.forEach(event => {
            const img = new Image();
            img.src = event.image;
        });
        
        // 初期画面表示
        showScreen(startScreen);
        
        console.log('Game initialized successfully');
    } catch (error) {
        console.error('Error initializing game:', error);
    }
});

// ページの可視性が変わった時の処理
document.addEventListener('visibilitychange', function() {
    if (!document.hidden && currentScoreEl) {
        updateScoreDisplay();
    }
});

// タッチスクロール防止（ゲーム画面で）
document.addEventListener('touchmove', function(e) {
    if (startScreen && !startScreen.classList.contains('hidden')) {
        return; // スタート画面では通常のスクロールを許可
    }
    e.preventDefault();
}, { passive: false });

// ダブルタップズーム防止
document.addEventListener('touchend', function(e) {
    const now = new Date().getTime();
    const timeSince = now - lastTouchEnd;
    if ((timeSince < 300) && (timeSince > 0)) {
        e.preventDefault();
    }
    lastTouchEnd = now;
}, false);