// Game data with actual image URLs
const gameData = {
  events: [
    { name: "おしょうがつ", month: 1, image: "https://user-gen-media-assets.s3.amazonaws.com/gpt4o_images/a98bfad4-6609-4a6f-866d-79f94448a671.png" },
    { name: "せつぶん", month: 2, image: "https://user-gen-media-assets.s3.amazonaws.com/gpt4o_images/ce4a5901-a7da-4f13-8814-4131f2fd47e0.png" },
    { name: "ひなまつり", month: 3, image: "https://user-gen-media-assets.s3.amazonaws.com/gpt4o_images/4ab690c3-75e7-4940-9513-7824188fc44e.png" },
    { name: "にゅうがくしき", month: 4, image: "https://user-gen-media-assets.s3.amazonaws.com/gpt4o_images/0e33e23d-4daf-48c4-bdc0-f69ec2032474.png" },
    { name: "はなみ", month: 4, image: "https://user-gen-media-assets.s3.amazonaws.com/gpt4o_images/c128092b-24e1-45d5-b01d-c5e033d6a6c3.png" },
    { name: "こどものひ", month: 5, image: "https://user-gen-media-assets.s3.amazonaws.com/gpt4o_images/34e2161c-66c1-4ad8-b116-8bc7320cce9a.png" },
    { name: "ははのひ", month: 5, image: "https://user-gen-media-assets.s3.amazonaws.com/gpt4o_images/b50041b3-7151-49e0-9bf5-1809d9f53c1d.png" },
    { name: "つゆ", month: 6, image: "https://user-gen-media-assets.s3.amazonaws.com/gpt4o_images/3d4a5736-abee-4178-ac3a-3e26620be943.png" },
    { name: "たなばた", month: 7, image: "https://user-gen-media-assets.s3.amazonaws.com/gpt4o_images/130b4a30-baa4-4c90-9891-5496aa0d3687.png" },
    { name: "なつやすみ", month: 8, image: "https://user-gen-media-assets.s3.amazonaws.com/gpt4o_images/b0c36094-6e73-4d0a-bd4f-c0c62aa1a6ed.png" },
    { name: "つきみ", month: 9, image: "https://user-gen-media-assets.s3.amazonaws.com/gpt4o_images/65df9d01-111a-4d41-a456-6461d6f5227a.png" },
    { name: "はろうぃん", month: 10, image: "https://user-gen-media-assets.s3.amazonaws.com/gpt4o_images/93fa8bd7-2c2e-460c-a928-c5136ae65894.png" },
    { name: "しちごさん", month: 11, image: "https://user-gen-media-assets.s3.amazonaws.com/gpt4o_images/4031fb38-7d5f-48b8-beb2-ebb4cec01eb1.png" },
    { name: "くりすます", month: 12, image: "https://user-gen-media-assets.s3.amazonaws.com/gpt4o_images/5fc2f838-eb16-4620-ab29-c75b247aef84.png" }
  ]
};

// Game state
let gameState = {
  currentQuestionIndex: 0,
  score: 0,
  questions: [],
  isAnswered: false
};

// DOM elements - will be initialized in initGame()
let startScreen, gameScreen, resultsScreen;
let startButton, backToStartButton, playAgainButton;
let progressIndicator, eventImage, eventName;
let currentScoreDisplay, finalScoreDisplay;
let celebrationMessage, celebrationEffects;
let feedbackModal, feedbackMessage;
let monthButtons;

// Initialize game - DOM elements are selected here after DOM is loaded
function initGame() {
  console.log('Initializing game...');
  
  // Get DOM elements
  startScreen = document.getElementById('start-screen');
  gameScreen = document.getElementById('game-screen');
  resultsScreen = document.getElementById('results-screen');
  startButton = document.getElementById('start-button');
  backToStartButton = document.getElementById('back-to-start');
  playAgainButton = document.getElementById('play-again');
  progressIndicator = document.getElementById('progress-indicator');
  eventImage = document.getElementById('event-image');
  eventName = document.getElementById('event-name');
  currentScoreDisplay = document.getElementById('current-score');
  finalScoreDisplay = document.getElementById('final-score-display');
  celebrationMessage = document.getElementById('celebration-message');
  celebrationEffects = document.getElementById('celebration-effects');
  feedbackModal = document.getElementById('feedback-modal');
  feedbackMessage = document.getElementById('feedback-message');
  monthButtons = document.querySelectorAll('.month-btn');

  // Check if critical elements exist
  if (!startButton) {
    console.error('Start button not found!');
    return;
  }
  
  if (!gameScreen || !startScreen) {
    console.error('Game screens not found!');
    return;
  }
  
  console.log('DOM elements found, adding event listeners...');
  
  // Remove any existing event listeners first
  startButton.removeEventListener('click', handleStartClick);
  
  // Add event listeners with explicit function reference
  startButton.addEventListener('click', handleStartClick);
  
  if (backToStartButton) {
    backToStartButton.addEventListener('click', handleBackToStart);
  }
  
  if (playAgainButton) {
    playAgainButton.addEventListener('click', handlePlayAgain);
  }
  
  // Add event listeners to month buttons
  if (monthButtons && monthButtons.length > 0) {
    monthButtons.forEach(button => {
      button.addEventListener('click', handleMonthSelection);
    });
    console.log(`Added event listeners to ${monthButtons.length} month buttons`);
  }
  
  console.log('Event listeners added, showing start screen...');
  
  // Show start screen initially
  showStartScreen();
}

// Event handler functions
function handleStartClick(event) {
  event.preventDefault();
  event.stopPropagation();
  console.log('Start button clicked! Starting game...');
  
  // Disable the button to prevent multiple clicks
  if (startButton) {
    startButton.disabled = true;
    startButton.textContent = '読み込み中...';
  }
  
  // Small delay to show loading state, then start game
  setTimeout(() => {
    startGame();
    
    // Re-enable button for future use
    if (startButton) {
      startButton.disabled = false;
      startButton.textContent = 'ゲームを始める';
    }
  }, 100);
}

function handleBackToStart(event) {
  event.preventDefault();
  console.log('Back to start clicked');
  showStartScreen();
}

function handlePlayAgain(event) {
  event.preventDefault();
  console.log('Play again clicked');
  showStartScreen();
}

// Shuffle array function
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Reset month buttons to original state
function resetMonthButtons() {
  if (!monthButtons || monthButtons.length === 0) return;
  
  monthButtons.forEach(button => {
    button.disabled = false;
    button.style.opacity = '';
    button.style.backgroundColor = '';
    button.style.color = '';
    button.style.transform = '';
    
    // Restore seasonal colors based on parent season group
    const seasonGroup = button.closest('.season-group');
    if (seasonGroup) {
      if (seasonGroup.classList.contains('spring')) {
        button.style.backgroundColor = '#FFB6C1';
        button.style.color = '#2D4A2B';
      } else if (seasonGroup.classList.contains('summer')) {
        button.style.backgroundColor = '#87CEEB';
        button.style.color = '#1B3A57';
      } else if (seasonGroup.classList.contains('autumn')) {
        button.style.backgroundColor = '#FFA500';
        button.style.color = '#2F1B14';
      } else if (seasonGroup.classList.contains('winter')) {
        button.style.backgroundColor = '#E6E6FA';
        button.style.color = '#2F2F4F';
      }
    }
  });
}

// Start new game
function startGame() {
  console.log('Starting new game...');
  
  // Reset game state
  gameState = {
    currentQuestionIndex: 0,
    score: 0,
    questions: shuffleArray(gameData.events),
    isAnswered: false
  };
  
  console.log('Game state reset, questions shuffled');
  
  // Reset UI elements
  resetMonthButtons();
  
  // Update displays
  updateScore();
  
  // Show game screen and load first question
  showGameScreen();
  loadCurrentQuestion();
  
  console.log('Game started successfully');
}

// Show different screens with explicit display control
function showStartScreen() {
  console.log('Showing start screen');
  
  if (startScreen) {
    startScreen.style.display = 'flex';
    startScreen.classList.remove('hidden');
  }
  
  if (gameScreen) {
    gameScreen.style.display = 'none';
    gameScreen.classList.add('hidden');
  }
  
  if (resultsScreen) {
    resultsScreen.style.display = 'none';
    resultsScreen.classList.add('hidden');
  }
  
  // Reset month buttons when returning to start
  resetMonthButtons();
}

function showGameScreen() {
  console.log('Showing game screen');
  
  if (startScreen) {
    startScreen.style.display = 'none';
    startScreen.classList.add('hidden');
  }
  
  if (gameScreen) {
    gameScreen.style.display = 'flex';
    gameScreen.classList.remove('hidden');
  }
  
  if (resultsScreen) {
    resultsScreen.style.display = 'none';
    resultsScreen.classList.add('hidden');
  }
}

function showResultsScreen() {
  console.log('Showing results screen');
  
  if (startScreen) {
    startScreen.style.display = 'none';
    startScreen.classList.add('hidden');
  }
  
  if (gameScreen) {
    gameScreen.style.display = 'none';
    gameScreen.classList.add('hidden');
  }
  
  if (resultsScreen) {
    resultsScreen.style.display = 'flex';
    resultsScreen.classList.remove('hidden');
  }
}

// Load current question
function loadCurrentQuestion() {
  if (!gameState.questions || gameState.questions.length === 0) {
    console.error('No questions available');
    return;
  }
  
  const currentQuestion = gameState.questions[gameState.currentQuestionIndex];
  console.log('Loading question:', currentQuestion.name);
  
  // Update progress
  if (progressIndicator) {
    progressIndicator.textContent = `${gameState.currentQuestionIndex + 1}/14問目`;
  }
  
  // Update event display
  if (eventImage && eventName) {
    eventImage.src = currentQuestion.image;
    eventImage.alt = currentQuestion.name;
    eventImage.style.display = 'block';
    eventName.textContent = currentQuestion.name;
    
    // Add error handling for image loading
    eventImage.onerror = function() {
      console.error('Failed to load image:', currentQuestion.image);
      // Create a fallback display
      this.style.display = 'block';
      this.style.backgroundColor = '#f0f0f0';
      this.style.borderColor = '#ccc';
    };
    
    eventImage.onload = function() {
      this.style.display = 'block';
      console.log('Image loaded successfully');
    };
  }
  
  // Reset month buttons for new question
  resetMonthButtons();
  
  gameState.isAnswered = false;
}

// Handle month selection
function handleMonthSelection(event) {
  if (gameState.isAnswered) return;
  
  const selectedMonth = parseInt(event.target.dataset.month);
  const correctMonth = gameState.questions[gameState.currentQuestionIndex].month;
  const isCorrect = selectedMonth === correctMonth;
  
  console.log('Month selected:', selectedMonth, 'Correct:', correctMonth, 'Is correct:', isCorrect);
  
  gameState.isAnswered = true;
  
  // Disable all buttons and highlight correct answer
  if (monthButtons) {
    monthButtons.forEach(button => {
      button.disabled = true;
      button.style.opacity = '0.6';
      
      if (parseInt(button.dataset.month) === correctMonth) {
        button.style.backgroundColor = '#4CAF50';
        button.style.color = 'white';
        button.style.opacity = '1';
        button.style.transform = 'scale(1.05)';
      }
    });
  }
  
  // Show feedback
  if (isCorrect) {
    gameState.score++;
    updateScore();
    showFeedback('⭕️せいかい！', '#4CAF50');
  } else {
    showFeedback('❌ざんねん！', '#f44336');
  }
  
  // Wait 1.5 seconds then proceed
  setTimeout(() => {
    hideFeedback();
    gameState.currentQuestionIndex++;
    
    if (gameState.currentQuestionIndex >= gameState.questions.length) {
      // Game finished
      console.log('Game finished! Final score:', gameState.score);
      showResults();
    } else {
      // Next question
      loadCurrentQuestion();
    }
  }, 1500);
}

// Update score display
function updateScore() {
  if (currentScoreDisplay) {
    currentScoreDisplay.textContent = `${gameState.score}`;
  }
}

// Show feedback modal
function showFeedback(message, color) {
  if (feedbackMessage && feedbackModal) {
    feedbackMessage.textContent = message;
    feedbackMessage.style.color = color;
    feedbackModal.style.display = 'flex';
    feedbackModal.classList.remove('hidden');
  }
}

// Hide feedback modal
function hideFeedback() {
  if (feedbackModal) {
    feedbackModal.style.display = 'none';
    feedbackModal.classList.add('hidden');
  }
}

// Show results with celebration effects
function showResults() {
  showResultsScreen();
  
  if (finalScoreDisplay) {
    finalScoreDisplay.textContent = `${gameState.score}/14`;
  }
  
  // Clear previous effects
  if (celebrationEffects) {
    celebrationEffects.innerHTML = '';
  }
  
  // Determine celebration message and effects
  let message = '';
  let effectType = '';
  
  if (gameState.score === 14) {
    message = 'すごい！パーフェクト！';
    effectType = 'confetti';
  } else if (gameState.score >= 11) {
    message = 'とってもよくできました！';
    effectType = 'stars';
  } else if (gameState.score >= 8) {
    message = 'よくがんばりました！';
    effectType = 'petals';
  } else {
    message = 'また挑戦してね！';
    effectType = 'smileys';
  }
  
  if (celebrationMessage) {
    celebrationMessage.textContent = message;
  }
  
  // Start celebration effects
  startCelebrationEffects(effectType);
  
  // Stop effects after 2 seconds
  setTimeout(() => {
    if (celebrationEffects) {
      celebrationEffects.innerHTML = '';
    }
  }, 2000);
}

// Start celebration effects
function startCelebrationEffects(type) {
  const effectCount = 20;
  
  for (let i = 0; i < effectCount; i++) {
    setTimeout(() => {
      createCelebrationEffect(type);
    }, i * 100);
  }
}

// Create individual celebration effect
function createCelebrationEffect(type) {
  if (!celebrationEffects) return;
  
  const effect = document.createElement('div');
  effect.className = type.slice(0, -1); // Remove 's' from plural
  
  // Random position
  effect.style.left = Math.random() * 100 + '%';
  effect.style.animationDelay = Math.random() * 2 + 's';
  
  // Random colors for some effects
  if (type === 'confetti') {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'];
    effect.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
  }
  
  celebrationEffects.appendChild(effect);
  
  // Remove effect after animation
  setTimeout(() => {
    if (effect.parentNode) {
      effect.parentNode.removeChild(effect);
    }
  }, 4000);
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM loaded, initializing game...');
  initGame();
});

// Fallback for browsers where DOM might already be loaded
if (document.readyState !== 'loading') {
  console.log('DOM already loaded, initializing game immediately...');
  initGame();
}