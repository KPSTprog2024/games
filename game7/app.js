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

// Game State
let currentGameState = {
  mode: null, // 'normal' or 'hard'
  level: 1,
  score: 0,
  sequence: [],
  userSequence: [],
  isPlaying: false,
  isDisplaying: false,
  settings: {
    volume: 0.5,
    soundEnabled: true,
    displaySpeed: 'normal'
  }
};

// Audio Context
let audioContext = null;
let gainNode = null;

// DOM Elements
let elements = {};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM loaded, initializing game...');
  
  // Get all DOM elements
  initializeElements();
  
  // Set up event listeners
  setupEventListeners();
  
  // Initialize audio
  initializeAudio();
  
  // Load settings
  loadSettings();
  
  // Show initial screen
  showScreen('top-screen');
  
  console.log('Game initialized successfully');
});

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
    
    // Game screen elements
    backToMenuBtn: document.getElementById('back-to-menu-btn'),
    currentLevel: document.getElementById('current-level'),
    currentScore: document.getElementById('current-score'),
    emojiDisplaySingle: document.getElementById('emoji-display-single'),
    emojiDisplayDual: document.getElementById('emoji-display-dual'),
    gameStatus: document.getElementById('game-status'),
    statusText: document.getElementById('status-text'),
    choiceArea: document.getElementById('choice-area'),
    choiceGrid: document.getElementById('choice-grid'),
    startGameBtn: document.getElementById('start-game-btn'),
    nextLevelBtn: document.getElementById('next-level-btn'),
    replayBtn: document.getElementById('replay-btn'),
    
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
  
  updateStatusText('スタートボタンを押してください');
}

// Start a level
function startLevel() {
  console.log(`Starting level ${currentGameState.level}`);
  
  currentGameState.userSequence = [];
  currentGameState.isDisplaying = true;
  
  // Hide controls
  elements.startGameBtn.classList.add('hidden');
  elements.nextLevelBtn.classList.add('hidden');
  elements.replayBtn.classList.add('hidden');
  elements.choiceArea.classList.add('hidden');
  
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
  
  updateStatusText('順番にタップしてね！');
  elements.choiceArea.classList.remove('hidden');
  
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
  
  if (currentGameState.mode === 'normal') {
    isCorrect = currentGameState.sequence[expectedIndex] === emoji;
  } else {
    // For hard mode, check if the emoji is in the expected position
    const expectedPair = currentGameState.sequence[Math.floor(expectedIndex / 2)];
    if (expectedIndex % 2 === 0) {
      isCorrect = expectedPair.left === emoji;
    } else {
      isCorrect = expectedPair.right === emoji;
    }
  }
  
  // Find the clicked button
  const clickedButton = Array.from(elements.choiceGrid.children).find(btn => btn.textContent === emoji);
  
  if (isCorrect) {
    clickedButton.classList.add('correct');
    currentGameState.userSequence.push(emoji);
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
    clickedButton.classList.add('incorrect');
    playIncorrectSound();
    
    setTimeout(() => {
      levelFailed();
    }, 1000);
  }
}

// Level complete
function levelComplete() {
  console.log('Level complete!');
  
  currentGameState.score += currentGameState.level * 10;
  updateGameUI();
  
  showResultModal('🎉', 'せいかい！', 'よくできました！', true);
}

// Level failed
function levelFailed() {
  console.log('Level failed!');
  
  showResultModal('😢', 'ざんねん...', 'もういちど がんばろう！', false);
}

// Show result modal
function showResultModal(emoji, title, message, success) {
  elements.resultEmoji.textContent = emoji;
  elements.resultTitle.textContent = title;
  elements.resultMessage.textContent = message;
  
  if (success) {
    elements.continueBtn.classList.remove('hidden');
    if (currentGameState.level >= 10) {
      elements.continueBtn.textContent = 'ゲームクリア！';
    } else {
      elements.continueBtn.textContent = 'つぎのレベル';
    }
  } else {
    elements.continueBtn.classList.add('hidden');
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
  
  updateStatusText('つぎのレベル！スタートボタンを押してください');
}

// Replay level
function replayLevel() {
  elements.startGameBtn.classList.remove('hidden');
  elements.nextLevelBtn.classList.add('hidden');
  elements.replayBtn.classList.add('hidden');
  elements.choiceArea.classList.add('hidden');
  
  updateStatusText('スタートボタンを押してください');
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
}

// Update game UI
function updateGameUI() {
  elements.currentLevel.textContent = `レベル ${currentGameState.level}`;
  elements.currentScore.textContent = `スコア: ${currentGameState.score}`;
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