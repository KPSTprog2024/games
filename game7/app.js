class EventBus {
  constructor() {
    this.events = {};
  }

  on(event, handler) {
    (this.events[event] ||= []).push(handler);
  }

  emit(event, data) {
    (this.events[event] || []).forEach(h => h(data));
  }
}

const eventBus = new EventBus();

const Game = (() => {
  // Game Data
  const gameData = {
    gameTitle: "でてきたの、なに？",
    subtitle: "〜見て、おぼえて、順番にタップ〜",
    emojis: {
      animals: ["🐶", "🐱", "🐭", "🐰", "🐼", "🐸", "🐷", "🐘", "🐵", "🐥"],
      foods: ["🍎", "🍌", "🍇", "🍓", "🍉", "🥕", "🍞", "🍚", "🍩", "🍰"],
      toys: ["🛝", "🎈", "🧩", "🎲"],
      vehicles: ["🚗", "🚌", "🚓", "🚑", "🚒", "🚲", "✈️", "🚤"],
      items: ["🎒", "🛏", "🔑"]
    },
    gameSettings: {
      normalMode: {
        startLevel: 2,
        maxLevel: 10,
        displayDuration: 1000
      },
      hardMode: {
        startPairs: 2,
        maxPairs: 5,
        displayDuration: 1200
      }
    },
    colors: {
      primary: "#FF6B6B",
      accent: "#4ECDC4",
      background: "#F8F9FA",
      success: "#51CF66",
      error: "#FF6B6B"
    }
  };

  const GamePhases = {
    READY: 'ready',
    DISPLAYING: 'displaying',
    INPUT: 'input',
    RESULT: 'result'
  };

// Game State
  let currentGameState = {
    mode: null, // 'normal' or 'hard'
    level: 1,
    score: 0,
    sequence: [],
    userSequence: [],
    isPlaying: false,
    isDisplaying: false,
    combo: 0,
    maxCombo: 0,
    hasMistake: false,
    phase: GamePhases.READY,
    settings: {
      volume: 0.5,
      soundEnabled: true,
      displaySpeed: 'normal'
    }
  };

// バッジデータ
  const badges = [
    { id: 'first_win', name: 'はじめてのせいこう', emoji: '🎯', description: 'はじめてレベルをクリアした', unlocked: false },
    { id: 'level5', name: 'ちゅうきゅうせい', emoji: '🏅', description: 'レベル5に到達した', unlocked: false },
    { id: 'level10', name: 'じょうきゅうせい', emoji: '🏆', description: 'レベル10に到達した', unlocked: false },
    { id: 'combo10', name: 'コンボマスター', emoji: '⚡', description: '10コンボを達成した', unlocked: false },
    { id: 'perfect', name: 'パーフェクト', emoji: '✨', description: 'ミスなしでレベルをクリアした', unlocked: false }
  ];

  // Audio Context
  let audioContext = null;
  let gainNode = null;

  // DOM Elements
  let elements = {};

// Initialize the application
function initializeApp() {
  console.log('DOM loaded, initializing game...');
  
  // Get all DOM elements
  initializeElements();
  
  // Set up event listeners
  setupEventListeners();
  
  // Initialize audio
  initializeAudio();
  
  // Load settings
  loadSettings();

  // Debug phase changes
  eventBus.on('phase', p => console.log('Phase changed:', p));
  
  // Show initial screen
  showScreen('top-screen');
  
  console.log('Game initialized successfully');
}

// Initialize DOM elements
  function initializeElements() {
    elements = {
    // Screens
    topScreen: document.getElementById('top-screen'),
    gameScreen: document.getElementById('game-screen'),
    settingsScreen: document.getElementById('settings-screen'),
    
    // Top screen buttons
    normalModeBtn: document.getElementById('normal-mode-btn'),
    hardModeBtn: document.getElementById('hard-mode-btn'),
    settingsBtn: document.getElementById('settings-btn'),
    tutorialBtn: document.getElementById('tutorial-btn'),
    
    // Game screen elements
    backToMenuBtn: document.getElementById('back-to-menu-btn'),
    currentLevel: document.getElementById('current-level'),
    currentScore: document.getElementById('current-score'),
    levelProgress: document.getElementById('level-progress'),
    emojiDisplaySingle: document.getElementById('emoji-display-single'),
    emojiDisplayDual: document.getElementById('emoji-display-dual'),
    gameStatus: document.getElementById('game-status'),
    statusText: document.getElementById('status-text'),
    choiceArea: document.getElementById('choice-area'),
    choiceGrid: document.getElementById('choice-grid'),
    startGameBtn: document.getElementById('start-game-btn'),
    nextLevelBtn: document.getElementById('next-level-btn'),
    replayBtn: document.getElementById('replay-btn'),
    hintBtn: document.getElementById('hint-btn'),
    
    // Settings screen elements
    backFromSettingsBtn: document.getElementById('back-from-settings-btn'),
    volumeSlider: document.getElementById('volume-slider'),
    volumeValue: document.getElementById('volume-value'),
    soundToggle: document.getElementById('sound-toggle'),
    displaySpeed: document.getElementById('display-speed'),
    resetScoresBtn: document.getElementById('reset-scores-btn'),
    
    // Modal elements
    resultModal: document.getElementById('result-modal'),
    resultEmoji: document.getElementById('result-emoji'),
    resultTitle: document.getElementById('result-title'),
    resultMessage: document.getElementById('result-message'),
    continueBtn: document.getElementById('continue-btn'),
    endGameBtn: document.getElementById('end-game-btn'),
    
    // Loading screen
    loadingScreen: document.getElementById('loading-screen')
  };
  
  console.log('DOM elements initialized');
}

// Set up all event listeners
function setupEventListeners() {
  console.log('Setting up event listeners...');
  
  // Top screen navigation
  elements.normalModeBtn.addEventListener('click', () => {
    console.log('Normal mode button clicked');
    startGame('normal');
  });
  
  elements.hardModeBtn.addEventListener('click', () => {
    console.log('Hard mode button clicked');
    startGame('hard');
  });
  
  elements.settingsBtn.addEventListener('click', () => {
    console.log('Settings button clicked');
    showScreen('settings-screen');
  });
  
  elements.tutorialBtn.addEventListener('click', () => {
    console.log('Tutorial button clicked');
    showTutorial();
  });
  
  // Game screen navigation
  elements.backToMenuBtn.addEventListener('click', () => {
    console.log('Back to menu button clicked');
    showScreen('top-screen');
    resetGame();
  });
  
  // Settings screen navigation
  elements.backFromSettingsBtn.addEventListener('click', () => {
    console.log('Back from settings button clicked');
    showScreen('top-screen');
  });
  
  // Game controls
  elements.startGameBtn.addEventListener('click', () => {
    console.log('Start game button clicked');
    startLevel();
  });
  
  elements.nextLevelBtn.addEventListener('click', () => {
    console.log('Next level button clicked');
    nextLevel();
  });
  
  elements.replayBtn.addEventListener('click', () => {
    console.log('Replay button clicked');
    replayLevel();
  });
  
  elements.hintBtn.addEventListener('click', () => {
    console.log('Hint button clicked');
    showHint();
  });
  
  // Settings controls
  elements.volumeSlider.addEventListener('input', (e) => {
    const volume = e.target.value / 100;
    currentGameState.settings.volume = volume;
    elements.volumeValue.textContent = e.target.value + '%';
    updateAudioVolume(volume);
    saveSettings();
  });
  
  elements.soundToggle.addEventListener('click', () => {
    currentGameState.settings.soundEnabled = !currentGameState.settings.soundEnabled;
    elements.soundToggle.textContent = currentGameState.settings.soundEnabled ? 'オン' : 'オフ';
    elements.soundToggle.classList.toggle('active', currentGameState.settings.soundEnabled);
    saveSettings();
  });
  
  elements.displaySpeed.addEventListener('change', (e) => {
    currentGameState.settings.displaySpeed = e.target.value;
    saveSettings();
  });
  
  elements.resetScoresBtn.addEventListener('click', () => {
    if (confirm('スコアをリセットしますか？')) {
      localStorage.removeItem('emojiGameScores');
      alert('スコアをリセットしました！');
    }
  });
  
  // Modal controls
  elements.continueBtn.addEventListener('click', () => {
    hideModal();
    nextLevel();
  });
  
  elements.endGameBtn.addEventListener('click', () => {
    hideModal();
    showScreen('top-screen');
    resetGame();
  });
  
  console.log('Event listeners set up successfully');
}

// Screen navigation
function showScreen(screenId) {
  console.log(`Showing screen: ${screenId}`);
  
  // Hide all screens
  document.querySelectorAll('.screen').forEach(screen => {
    screen.classList.remove('active');
  });
  
  // Show target screen
  const targetScreen = document.getElementById(screenId);
  if (targetScreen) {
    targetScreen.classList.add('active');
  } else {
    console.error(`Screen not found: ${screenId}`);
  }
}

// Game initialization
function startGame(mode) {
  console.log(`Starting game in ${mode} mode`);
  
  currentGameState.mode = mode;
  currentGameState.level = 1;
  currentGameState.score = 0;
  currentGameState.sequence = [];
  currentGameState.userSequence = [];
  currentGameState.isPlaying = true;
  currentGameState.combo = 0;
  currentGameState.maxCombo = 0;
  currentGameState.hasMistake = false;
  currentGameState.phase = GamePhases.READY;
  eventBus.emit('phase', currentGameState.phase);
  
  showScreen('game-screen');
  updateGameUI();
  
  // Setup display area based on mode
  if (mode === 'normal') {
    elements.emojiDisplaySingle.classList.remove('hidden');
    elements.emojiDisplayDual.classList.add('hidden');
  } else {
    elements.emojiDisplaySingle.classList.add('hidden');
    elements.emojiDisplayDual.classList.remove('hidden');
  }
  
  // Show start button
  elements.startGameBtn.classList.remove('hidden');
  elements.nextLevelBtn.classList.add('hidden');
  elements.replayBtn.classList.add('hidden');
  elements.choiceArea.classList.add('hidden');
  elements.hintBtn.classList.add('hidden');
  
  updateStatusText('スタートボタンを押してください');
}

// Start a level
function startLevel() {
  console.log(`Starting level ${currentGameState.level}`);
  
  currentGameState.userSequence = [];
  currentGameState.isDisplaying = true;
  currentGameState.phase = GamePhases.DISPLAYING;
  eventBus.emit('phase', currentGameState.phase);
  
  // Hide controls
  elements.startGameBtn.classList.add('hidden');
  elements.nextLevelBtn.classList.add('hidden');
  elements.replayBtn.classList.add('hidden');
  elements.choiceArea.classList.add('hidden');
  elements.hintBtn.classList.add('hidden');
  
  updateStatusText('よく見てね！');
  
  // Generate sequence
  generateSequence();
  
  // Start displaying sequence
  setTimeout(() => {
    displaySequence();
  }, 1000);
}

// Generate emoji sequence
function generateSequence() {
  const allEmojis = [
    ...gameData.emojis.animals,
    ...gameData.emojis.foods,
    ...gameData.emojis.toys,
    ...gameData.emojis.vehicles,
    ...gameData.emojis.items
  ];
  
  currentGameState.sequence = [];
  
  if (currentGameState.mode === 'normal') {
    const sequenceLength = gameData.gameSettings.normalMode.startLevel + currentGameState.level - 1;
    for (let i = 0; i < sequenceLength; i++) {
      const randomEmoji = allEmojis[Math.floor(Math.random() * allEmojis.length)];
      currentGameState.sequence.push(randomEmoji);
    }
  } else {
    const pairCount = gameData.gameSettings.hardMode.startPairs + currentGameState.level - 1;
    for (let i = 0; i < pairCount; i++) {
      const leftEmoji = allEmojis[Math.floor(Math.random() * allEmojis.length)];
      const rightEmoji = allEmojis[Math.floor(Math.random() * allEmojis.length)];
      currentGameState.sequence.push({ left: leftEmoji, right: rightEmoji });
    }
  }
  
  console.log('Generated sequence:', currentGameState.sequence);
}

// Display the sequence
function displaySequence() {
  console.log('Displaying sequence...');
  
  const displayDuration = getDisplayDuration();
  let currentIndex = 0;
  
  function showNext() {
    if (currentIndex >= currentGameState.sequence.length) {
      // Sequence complete
      setTimeout(() => {
        currentGameState.isDisplaying = false;
        showChoices();
      }, 500);
      return;
    }
    
    const item = currentGameState.sequence[currentIndex];
    
    if (currentGameState.mode === 'normal') {
      // Single emoji display
      const emojiSquare = elements.emojiDisplaySingle.querySelector('.emoji-square');
      emojiSquare.textContent = item;
      emojiSquare.classList.add('active');
      
      setTimeout(() => {
        emojiSquare.classList.remove('active');
        emojiSquare.textContent = '';
        currentIndex++;
        setTimeout(showNext, 200);
      }, displayDuration);
    } else {
      // Dual emoji display
      const leftSquare = elements.emojiDisplayDual.querySelector('.emoji-square.left');
      const rightSquare = elements.emojiDisplayDual.querySelector('.emoji-square.right');
      
      leftSquare.textContent = item.left;
      rightSquare.textContent = item.right;
      leftSquare.classList.add('active');
      rightSquare.classList.add('active');
      
      setTimeout(() => {
        leftSquare.classList.remove('active');
        rightSquare.classList.remove('active');
        leftSquare.textContent = '';
        rightSquare.textContent = '';
        currentIndex++;
        setTimeout(showNext, 200);
      }, displayDuration);
    }
  }
  
  showNext();
}

// Show choice options
function showChoices() {
  console.log('Showing choices...');

  currentGameState.phase = GamePhases.INPUT;
  eventBus.emit('phase', currentGameState.phase);
  
  updateStatusText('順番にタップしてね！');
  elements.choiceArea.classList.remove('hidden');
  elements.hintBtn.classList.remove('hidden');
  
  // Generate choice options
  const allEmojis = [
    ...gameData.emojis.animals,
    ...gameData.emojis.foods,
    ...gameData.emojis.toys,
    ...gameData.emojis.vehicles,
    ...gameData.emojis.items
  ];
  
  let choiceOptions = [];
  
  if (currentGameState.mode === 'normal') {
    // Include all sequence emojis
    choiceOptions = [...currentGameState.sequence];
    
    // Add random distractors
    while (choiceOptions.length < Math.min(12, allEmojis.length)) {
      const randomEmoji = allEmojis[Math.floor(Math.random() * allEmojis.length)];
      if (!choiceOptions.includes(randomEmoji)) {
        choiceOptions.push(randomEmoji);
      }
    }
  } else {
    // For hard mode, flatten the pairs
    currentGameState.sequence.forEach(pair => {
      if (!choiceOptions.includes(pair.left)) choiceOptions.push(pair.left);
      if (!choiceOptions.includes(pair.right)) choiceOptions.push(pair.right);
    });
    
    // Add random distractors
    while (choiceOptions.length < Math.min(12, allEmojis.length)) {
      const randomEmoji = allEmojis[Math.floor(Math.random() * allEmojis.length)];
      if (!choiceOptions.includes(randomEmoji)) {
        choiceOptions.push(randomEmoji);
      }
    }
  }
  
  // Shuffle options
  choiceOptions.sort(() => Math.random() - 0.5);
  
  // Create choice buttons
  elements.choiceGrid.innerHTML = '';
  choiceOptions.forEach(emoji => {
    const button = document.createElement('button');
    button.className = 'choice-item';
    button.textContent = emoji;
    button.addEventListener('click', () => handleChoice(emoji));
    elements.choiceGrid.appendChild(button);
  });
}

// Handle user choice
function handleChoice(emoji) {
  if (currentGameState.isDisplaying) return;
  
  console.log('User chose:', emoji);
  
  const expectedIndex = currentGameState.userSequence.length;
  let isCorrect = false;
  let correctEmoji = '';
  
  if (currentGameState.mode === 'normal') {
    correctEmoji = currentGameState.sequence[expectedIndex];
    isCorrect = correctEmoji === emoji;
  } else {
    // For hard mode, check if the emoji is in the expected position
    const expectedPair = currentGameState.sequence[Math.floor(expectedIndex / 2)];
    if (expectedIndex % 2 === 0) {
      correctEmoji = expectedPair.left;
      isCorrect = expectedPair.left === emoji;
    } else {
      correctEmoji = expectedPair.right;
      isCorrect = expectedPair.right === emoji;
    }
  }
  
  // Find the clicked button
  const clickedButton = Array.from(elements.choiceGrid.children).find(btn => btn.textContent === emoji);
  
  if (isCorrect) {
    clickedButton.classList.add('correct');
    currentGameState.userSequence.push(emoji);
    currentGameState.combo++;
    currentGameState.maxCombo = Math.max(currentGameState.maxCombo, currentGameState.combo);
    
    // コンボ表示
    if (currentGameState.combo >= 3) {
      showComboEffect(currentGameState.combo);
    }
    
    playCorrectSound();
    
    // Check if sequence is complete
    const expectedLength = currentGameState.mode === 'normal' 
      ? currentGameState.sequence.length 
      : currentGameState.sequence.length * 2;
    
    if (currentGameState.userSequence.length === expectedLength) {
      // Level complete!
      setTimeout(() => {
        levelComplete();
      }, 1000);
    }
  } else {
    // 不正解の場合
    clickedButton.classList.add('incorrect');
    currentGameState.hasMistake = true;
    currentGameState.combo = 0;
    playIncorrectSound();
    
    // 正解だったものを表示（一瞬だけ）
    const correctButton = Array.from(elements.choiceGrid.children).find(btn => btn.textContent === correctEmoji);
    if (correctButton) {
      correctButton.classList.add('show-correct');
      
      // 「これが正解」というラベルを表示
      const correctLabel = document.createElement('div');
      correctLabel.className = 'correct-label';
      correctLabel.textContent = 'これが正解！';
      correctButton.appendChild(correctLabel);
      
      // ステータステキストを更新
      updateStatusText(`${expectedIndex + 1}番目は ${correctEmoji} だったよ`);
    }
    
    // 少し待ってからレベル失敗へ
    setTimeout(() => {
      levelFailed();
    }, 2000); // 2秒間正解を表示
  }
}

// Level complete
function levelComplete() {
  console.log('Level complete!');

  currentGameState.phase = GamePhases.RESULT;
  eventBus.emit('phase', currentGameState.phase);
  
  currentGameState.score += currentGameState.level * 10;
  updateGameUI();
  
  // バッジチェック
  checkBadges();
  
  showResultModal('🎉', 'せいかい！', 'よくできました！', true);
}

// Level failed
function levelFailed() {
  console.log('Level failed!');

  currentGameState.phase = GamePhases.RESULT;
  eventBus.emit('phase', currentGameState.phase);
  
  // 正解シーケンスを表示する前に少し待つ
  setTimeout(() => {
    showCorrectSequence(() => {
      // 正解表示が終わったらモーダルを表示
      showResultModal('😢', 'ざんねん...', 'もういちど がんばろう！', false);
    });
  }, 1000);
}

// 正解シーケンスを表示する関数
function showCorrectSequence(callback) {
  updateStatusText('正解はこれだったよ！');
  
  // 選択肢をすべて無効化
  const choiceButtons = elements.choiceGrid.querySelectorAll('.choice-item');
  choiceButtons.forEach(btn => {
    btn.disabled = true;
    btn.classList.remove('selected', 'correct', 'incorrect');
  });
  
  let currentIndex = 0;
  const highlightDelay = 800; // ミリ秒
  
  function highlightNext() {
    if (currentGameState.mode === 'normal') {
      // 通常モードの場合
      if (currentIndex >= currentGameState.sequence.length) {
        if (callback) setTimeout(callback, 500);
        return;
      }
      
      const correctEmoji = currentGameState.sequence[currentIndex];
      const correctButton = Array.from(choiceButtons).find(btn => btn.textContent === correctEmoji);
      
      if (correctButton) {
        // 正解の絵文字をハイライト
        correctButton.classList.add('show-correct');
        
        // 順番を表示
        const orderBadge = document.createElement('span');
        orderBadge.className = 'order-badge';
        orderBadge.textContent = currentIndex + 1;
        correctButton.appendChild(orderBadge);
        
        // 次のハイライトへ
        setTimeout(() => {
          currentIndex++;
          highlightNext();
        }, highlightDelay);
      } else {
        currentIndex++;
        highlightNext();
      }
    } else {
      // ハードモードの場合
      if (currentIndex >= currentGameState.sequence.length * 2) {
        if (callback) setTimeout(callback, 500);
        return;
      }
      
      const pairIndex = Math.floor(currentIndex / 2);
      const isLeft = currentIndex % 2 === 0;
      
      const correctEmoji = isLeft 
        ? currentGameState.sequence[pairIndex].left 
        : currentGameState.sequence[pairIndex].right;
      
      const correctButton = Array.from(choiceButtons).find(btn => btn.textContent === correctEmoji);
      
      if (correctButton) {
        // 正解の絵文字をハイライト
        correctButton.classList.add('show-correct');
        
        // 順番を表示
        const orderBadge = document.createElement('span');
        orderBadge.className = 'order-badge';
        orderBadge.textContent = currentIndex + 1;
        correctButton.appendChild(orderBadge);
        
        // 次のハイライトへ
        setTimeout(() => {
          currentIndex++;
          highlightNext();
        }, highlightDelay);
      } else {
        currentIndex++;
        highlightNext();
      }
    }
  }
  
  // ハイライト開始
  highlightNext();
}

// Show result modal
function showResultModal(emoji, title, message, success) {
  elements.resultEmoji.textContent = emoji;
  elements.resultTitle.textContent = title;
  
  // 不正解の場合、追加情報を表示
  if (!success) {
    // 正解の長さと実際に答えた長さを表示
    const answeredCount = currentGameState.userSequence.length;
    const totalCount = currentGameState.mode === 'normal' 
      ? currentGameState.sequence.length 
      : currentGameState.sequence.length * 2;
    
    message += `<div class="result-stats">
      <p>${answeredCount}個正解 / 全${totalCount}個中</p>
      <div class="result-progress">
        <div class="result-progress-fill" style="width: ${(answeredCount / totalCount) * 100}%"></div>
      </div>
    </div>`;
    
    // 「もう一度挑戦」ボタンのテキストを変更
    elements.endGameBtn.textContent = 'もういちど挑戦する';
  } else {
    elements.endGameBtn.textContent = 'おわる';
  }
  
  elements.resultMessage.innerHTML = message;
  
  if (success) {
    elements.continueBtn.classList.remove('hidden');
    elements.resultModal.querySelector('.modal-content').classList.add('success');
    if (currentGameState.level >= 10) {
      elements.continueBtn.textContent = 'ゲームクリア！';
    } else {
      elements.continueBtn.textContent = 'つぎのレベル';
    }
  } else {
    elements.continueBtn.classList.add('hidden');
    elements.resultModal.querySelector('.modal-content').classList.remove('success');
  }
  
  elements.resultModal.classList.remove('hidden');
}

// Hide modal
function hideModal() {
  elements.resultModal.classList.add('hidden');
}

// Next level
function nextLevel() {
  if (currentGameState.level >= 10) {
    // Game complete
    showScreen('top-screen');
    resetGame();
    return;
  }
  
  currentGameState.level++;
  updateGameUI();
  
  elements.startGameBtn.classList.remove('hidden');
  elements.nextLevelBtn.classList.add('hidden');
  elements.replayBtn.classList.add('hidden');
  elements.choiceArea.classList.add('hidden');
  elements.hintBtn.classList.add('hidden');

  updateStatusText('つぎのレベル！スタートボタンを押してください');
  currentGameState.phase = GamePhases.READY;
  eventBus.emit('phase', currentGameState.phase);
}

// Replay level
function replayLevel() {
  elements.startGameBtn.classList.remove('hidden');
  elements.nextLevelBtn.classList.add('hidden');
  elements.replayBtn.classList.add('hidden');
  elements.choiceArea.classList.add('hidden');
  elements.hintBtn.classList.add('hidden');

  updateStatusText('スタートボタンを押してください');
  currentGameState.phase = GamePhases.READY;
  eventBus.emit('phase', currentGameState.phase);
}

// Reset game
function resetGame() {
  currentGameState.mode = null;
  currentGameState.level = 1;
  currentGameState.score = 0;
  currentGameState.sequence = [];
  currentGameState.userSequence = [];
  currentGameState.isPlaying = false;
  currentGameState.isDisplaying = false;
  currentGameState.combo = 0;
  currentGameState.maxCombo = 0;
  currentGameState.hasMistake = false;
  currentGameState.phase = GamePhases.READY;
  eventBus.emit('phase', currentGameState.phase);
}

// Update game UI
function updateGameUI() {
  elements.currentLevel.textContent = `レベル ${currentGameState.level}`;
  elements.currentScore.textContent = `スコア: ${currentGameState.score}`;
  
  // レベル進行バーを更新
  const progressPercentage = (currentGameState.level / 10) * 100;
  elements.levelProgress.style.width = `${progressPercentage}%`;
}

// Update status text
function updateStatusText(text) {
  elements.statusText.textContent = text;
}

// Get display duration based on settings
function getDisplayDuration() {
  const baseDuration = currentGameState.mode === 'normal' 
    ? gameData.gameSettings.normalMode.displayDuration
    : gameData.gameSettings.hardMode.displayDuration;
  
  switch (currentGameState.settings.displaySpeed) {
    case 'slow': return baseDuration * 1.5;
    case 'fast': return baseDuration * 0.7;
    default: return baseDuration;
  }
}

// ヒント機能の実装
function showHint() {
  if (currentGameState.userSequence.length < currentGameState.sequence.length) {
    const nextIndex = currentGameState.userSequence.length;
    const nextEmoji = currentGameState.mode === 'normal' 
      ? currentGameState.sequence[nextIndex]
      : (nextIndex % 2 === 0 
          ? currentGameState.sequence[Math.floor(nextIndex / 2)].left 
          : currentGameState.sequence[Math.floor(nextIndex / 2)].right);
    
    // 次に選ぶべき絵文字を一瞬光らせる
    const buttons = Array.from(elements.choiceGrid.children);
    const hintButton = buttons.find(btn => btn.textContent === nextEmoji);
    
    if (hintButton) {
      hintButton.classList.add('hint-flash');
      setTimeout(() => {
        hintButton.classList.remove('hint-flash');
      }, 500);
    }
    
    // ヒント使用でスコア減少
    currentGameState.score = Math.max(0, currentGameState.score - 5);
    updateGameUI();
  }
}

// コンボエフェクト表示関数
function showComboEffect(combo) {
  const comboDiv = document.createElement('div');
  comboDiv.className = 'combo-effect';
  comboDiv.textContent = `${combo} コンボ！ +${combo}点`;
  
  document.body.appendChild(comboDiv);
  
  // アニメーション終了後に削除
  setTimeout(() => {
    comboDiv.classList.add('fade-out');
    setTimeout(() => {
      document.body.removeChild(comboDiv);
    }, 500);
  }, 1000);
  
  // コンボボーナス加算
  currentGameState.score += combo;
  updateGameUI();
}

// バッジチェック関数
function checkBadges() {
  let newBadges = [];
  
  // レベルクリア
  if (!badges[0].unlocked && currentGameState.level > 1) {
    badges[0].unlocked = true;
    newBadges.push(badges[0]);
  }
  
  // レベル5到達
  if (!badges[1].unlocked && currentGameState.level >= 5) {
    badges[1].unlocked = true;
    newBadges.push(badges[1]);
  }
  
  // レベル10到達
  if (!badges[2].unlocked && currentGameState.level >= 10) {
    badges[2].unlocked = true;
    newBadges.push(badges[2]);
  }
  
  // 10コンボ達成
  if (!badges[3].unlocked && currentGameState.maxCombo >= 10) {
    badges[3].unlocked = true;
    newBadges.push(badges[3]);
  }
  
  // パーフェクト
  if (!badges[4].unlocked && currentGameState.level > 1 && !currentGameState.hasMistake) {
    badges[4].unlocked = true;
    newBadges.push(badges[4]);
  }
  
  // 新しいバッジを獲得した場合、表示
  if (newBadges.length > 0) {
    showBadgeNotification(newBadges);
    saveBadges();
  }
}

// バッジ通知表示
function showBadgeNotification(newBadges) {
  const badge = newBadges[0]; // 最初のバッジを表示
  
  const badgeDiv = document.createElement('div');
  badgeDiv.className = 'badge-notification';
  badgeDiv.innerHTML = `
    <div class="badge-emoji">${badge.emoji}</div>
    <div class="badge-info">
      <h3>バッジゲット！</h3>
      <p>${badge.name}</p>
      <p class="badge-desc">${badge.description}</p>
    </div>
  `;
  
  document.body.appendChild(badgeDiv);
  
  // アニメーション終了後に削除
  setTimeout(() => {
    badgeDiv.classList.add('slide-out');
    setTimeout(() => {
      document.body.removeChild(badgeDiv);
      
      // 複数バッジがある場合、次を表示
      if (newBadges.length > 1) {
        showBadgeNotification(newBadges.slice(1));
      }
    }, 500);
  }, 3000);
}

// バッジを保存
function saveBadges() {
  try {
    localStorage.setItem('emojiGameBadges', JSON.stringify(badges));
  } catch (error) {
    console.warn('Error saving badges:', error);
  }
}

// バッジをロード
function loadBadges() {
  try {
    const savedBadges = localStorage.getItem('emojiGameBadges');
    if (savedBadges) {
      const loadedBadges = JSON.parse(savedBadges);
      badges.forEach((badge, index) => {
        if (loadedBadges[index]) {
          badge.unlocked = loadedBadges[index].unlocked;
        }
      });
    }
  } catch (error) {
    console.warn('Error loading badges:', error);
  }
}

// チュートリアル画面の実装
function showTutorial() {
  const tutorialSteps = [
    {
      title: "ようこそ！",
      content: "「でてきたの、なに？」は記憶力を鍛えるゲームだよ。表示される絵文字を覚えて、同じ順番でタップしてね！",
      emoji: "👋"
    },
    {
      title: "つうじょうモード",
      content: "1つずつ絵文字が表示されるよ。レベルが上がるごとに覚える数が増えていくよ！",
      emoji: "🎯"
    },
    {
      title: "むずかしいモード",
      content: "左右に2つずつ絵文字が表示されるよ。左から右の順番で覚えてね！",
      emoji: "💪"
    },
    {
      title: "コツ",
      content: "絵文字を言葉や物語にして覚えると記憶しやすいよ！たくさん練習して記憶力をアップさせよう！",
      emoji: "💡"
    }
  ];
  
  let currentStep = 0;
  
  // チュートリアルモーダル作成
  const tutorialModal = document.createElement('div');
  tutorialModal.className = 'modal';
  tutorialModal.id = 'tutorial-modal';
  
  function updateTutorialContent() {
    const step = tutorialSteps[currentStep];
    tutorialModal.innerHTML = `
      <div class="modal-content tutorial">
        <div class="tutorial-progress">
          ${tutorialSteps.map((_, i) => 
            `<div class="progress-dot ${i === currentStep ? 'active' : ''}"></div>`
          ).join('')}
        </div>
        <div class="tutorial-emoji">${step.emoji}</div>
        <h2>${step.title}</h2>
        <p>${step.content}</p>
        <div class="modal-actions">
          ${currentStep > 0 ? '<button id="prev-step" class="btn btn--secondary">まえへ</button>' : ''}
          ${currentStep < tutorialSteps.length - 1 
            ? '<button id="next-step" class="btn btn--primary">つぎへ</button>' 
            : '<button id="finish-tutorial" class="btn btn--primary">はじめる</button>'}
        </div>
      </div>
    `;
    
    document.body.appendChild(tutorialModal);
    
    // イベントリスナー設定
    if (currentStep > 0) {
      document.getElementById('prev-step').addEventListener('click', () => {
        currentStep--;
        updateTutorialContent();
      });
    }
    
    if (currentStep < tutorialSteps.length - 1) {
      document.getElementById('next-step').addEventListener('click', () => {
        currentStep++;
        updateTutorialContent();
      });
    } else {
      document.getElementById('finish-tutorial').addEventListener('click', () => {
        document.body.removeChild(tutorialModal);
      });
    }
  }
  
  updateTutorialContent();
}

// Audio functions
function initializeAudio() {
  try {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    gainNode = audioContext.createGain();
    gainNode.connect(audioContext.destination);
    gainNode.gain.value = currentGameState.settings.volume;
    console.log('Audio initialized successfully');
  } catch (error) {
    console.warn('Audio initialization failed:', error);
  }
}

function updateAudioVolume(volume) {
  if (gainNode) {
    gainNode.gain.value = volume;
  }
}

function playCorrectSound() {
  if (!currentGameState.settings.soundEnabled || !audioContext) return;
  
  try {
    const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5
    frequencies.forEach((freq, index) => {
      const oscillator = audioContext.createOscillator();
      const tempGain = audioContext.createGain();
      
      oscillator.connect(tempGain);
      tempGain.connect(gainNode);
      
      oscillator.frequency.value = freq;
      oscillator.type = 'sine';
      
      tempGain.gain.setValueAtTime(0.1, audioContext.currentTime + index * 0.05);
      tempGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + index * 0.05 + 0.3);
      
      oscillator.start(audioContext.currentTime + index * 0.05);
      oscillator.stop(audioContext.currentTime + index * 0.05 + 0.3);
    });
  } catch (error) {
    console.warn('Error playing correct sound:', error);
  }
}

function playIncorrectSound() {
  if (!currentGameState.settings.soundEnabled || !audioContext) return;
  
  try {
    const oscillator = audioContext.createOscillator();
    const tempGain = audioContext.createGain();
    
    oscillator.connect(tempGain);
    tempGain.connect(gainNode);
    
    oscillator.frequency.value = 130.81; // C3
    oscillator.type = 'sawtooth';
    
    tempGain.gain.setValueAtTime(0.2, audioContext.currentTime);
    tempGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.3);
  } catch (error) {
    console.warn('Error playing incorrect sound:', error);
  }
}

// Settings management
function loadSettings() {
  try {
    const savedSettings = localStorage.getItem('emojiGameSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      currentGameState.settings = { ...currentGameState.settings, ...settings };
    }
    
    // Update UI
    elements.volumeSlider.value = currentGameState.settings.volume * 100;
    elements.volumeValue.textContent = Math.round(currentGameState.settings.volume * 100) + '%';
    elements.soundToggle.textContent = currentGameState.settings.soundEnabled ? 'オン' : 'オフ';
    elements.soundToggle.classList.toggle('active', currentGameState.settings.soundEnabled);
    elements.displaySpeed.value = currentGameState.settings.displaySpeed;
    
    if (gainNode) {
      gainNode.gain.value = currentGameState.settings.volume;
    }
    
    // バッジをロード
    loadBadges();
  } catch (error) {
    console.warn('Error loading settings:', error);
  }
}

function saveSettings() {
  try {
    localStorage.setItem('emojiGameSettings', JSON.stringify(currentGameState.settings));
  } catch (error) {
    console.warn('Error saving settings:', error);
  }
}

// Initialize audio context on user interaction
document.addEventListener('click', function initAudioOnClick() {
  if (audioContext && audioContext.state === 'suspended') {
    audioContext.resume();
  }
}, { once: true });

// Handle visibility change for audio context
  document.addEventListener('visibilitychange', function() {
    if (audioContext) {
      if (document.hidden) {
        audioContext.suspend();
      } else {
        audioContext.resume();
      }
    }
  });

  console.log('App.js loaded successfully');

  return { init: initializeApp };
})();

document.addEventListener('DOMContentLoaded', Game.init);
