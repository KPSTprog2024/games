// 学習データ（お受験で扱いやすい代表語彙を優先）
const learningData = {
  spring: [
    { name: "さくら", season: "春", description: "春を代表する花。入学シーズンにもよく見ます。", emoji: "🌸", category: "おはな" },
    { name: "たんぽぽ", season: "春", description: "春の野原で見つかる黄色い花です。", emoji: "🌼", category: "おはな" },
    { name: "つくし", season: "春", description: "春の土から出てくる細長い植物です。", emoji: "🌱", visual: "assets/illustrations/tsukushi.svg", category: "しぜん" },
    { name: "ひなまつり", season: "春", description: "3月3日。ひな人形をかざる行事です。", emoji: "🎎", category: "ぎょうじ" },
    { name: "こどものひ", season: "春", description: "5月5日。こいのぼりをあげる日です。", emoji: "🎏", category: "ぎょうじ" },
    { name: "にゅうがくしき", season: "春", description: "新しい学校生活が始まる行事です。", emoji: "🎒", category: "ぎょうじ" },
    { name: "いちご", season: "春", description: "春に甘くなる赤い果物です。", emoji: "🍓", category: "たべもの" },
    { name: "たけのこ", season: "春", description: "春の旬としてよく出る食材です。", emoji: "🌱", visual: "assets/illustrations/takenoko.svg", category: "たべもの" },
    { name: "ちょう", season: "春", description: "春の花畑で見つけやすい虫です。", emoji: "🦋", category: "どうぶつ" },
    { name: "つばめ", season: "春", description: "春に日本へ渡ってくる鳥です。", emoji: "🐦", category: "どうぶつ" }
  ],
  summer: [
    { name: "ひまわり", season: "夏", description: "夏の日差しの中で大きく咲く花です。", emoji: "🌻", category: "おはな" },
    { name: "あさがお", season: "夏", description: "夏の朝に咲く花。観察でもよく扱います。", emoji: "🌺", visual: "assets/illustrations/asagao.svg", category: "おはな" },
    { name: "たなばた", season: "夏", description: "7月7日。短冊に願いごとを書きます。", emoji: "🎋", category: "ぎょうじ" },
    { name: "なつまつり", season: "夏", description: "屋台や花火がある夏の行事です。", emoji: "🎆", category: "ぎょうじ" },
    { name: "すいか", season: "夏", description: "夏を代表する果物です。", emoji: "🍉", category: "たべもの" },
    { name: "かきごおり", season: "夏", description: "暑い日に食べる冷たいおやつです。", emoji: "🍧", category: "たべもの" },
    { name: "ふうりん", season: "夏", description: "チリンチリンと鳴る夏らしい飾りです。", emoji: "🎐", category: "せいかつ" },
    { name: "かぶとむし", season: "夏", description: "夏の昆虫として人気があります。", emoji: "🪲", visual: "assets/illustrations/kabutomushi.svg", category: "どうぶつ" },
    { name: "うみ", season: "夏", description: "海水浴など夏の外遊びの定番です。", emoji: "🏖️", category: "あそび" },
    { name: "プール", season: "夏", description: "夏の水遊びでよく使う場所です。", emoji: "🏊", category: "あそび" }
  ],
  autumn: [
    { name: "もみじ", season: "秋", description: "葉の色が変わる秋の代表です。", emoji: "🍁", category: "しぜん" },
    { name: "いちょう", season: "秋", description: "黄色い葉が美しい秋の木です。", emoji: "🍂", category: "しぜん" },
    { name: "おつきみ", season: "秋", description: "中秋の名月を楽しむ行事です。", emoji: "🌕", category: "ぎょうじ" },
    { name: "うんどうかい", season: "秋", description: "秋に行われることが多い学校行事です。", emoji: "🏃", category: "ぎょうじ" },
    { name: "いもほり", season: "秋", description: "秋の畑でよく行う体験活動です。", emoji: "🍠", category: "ぎょうじ" },
    { name: "りんご", season: "秋", description: "秋に旬を迎える果物です。", emoji: "🍎", category: "たべもの" },
    { name: "くり", season: "秋", description: "秋の味覚としてよく出る木の実です。", emoji: "🌰", category: "たべもの" },
    { name: "さんま", season: "秋", description: "秋の味覚として有名な魚です。", emoji: "🐟", category: "たべもの" },
    { name: "どんぐり", season: "秋", description: "秋の公園で拾える木の実です。", emoji: "🍂", category: "しぜん" },
    { name: "いねかり", season: "秋", description: "米づくりで秋に行う作業です。", emoji: "🌾", category: "ぎょうじ" }
  ],
  winter: [
    { name: "ゆき", season: "冬", description: "冬の代表的な天気です。", emoji: "❄️", category: "しぜん" },
    { name: "ゆきだるま", season: "冬", description: "雪の日に作る冬の遊びです。", emoji: "⛄", category: "あそび" },
    { name: "クリスマス", season: "冬", description: "12月の代表的な行事です。", emoji: "🎄", category: "ぎょうじ" },
    { name: "おしょうがつ", season: "冬", description: "1年の始まりを祝う行事です。", emoji: "🎍", category: "ぎょうじ" },
    { name: "せつぶん", season: "冬", description: "豆まきをする行事。立春の前日です。", emoji: "👹", category: "ぎょうじ" },
    { name: "みかん", season: "冬", description: "冬の食卓でよく見かける果物です。", emoji: "🍊", category: "たべもの" },
    { name: "おでん", season: "冬", description: "寒い日に人気のあたたかい料理です。", emoji: "🍢", category: "たべもの" },
    { name: "てぶくろ", season: "冬", description: "冬に手をあたためる道具です。", emoji: "🧤", category: "せいかつ" },
    { name: "マフラー", season: "冬", description: "首をあたためる冬の身につける物です。", emoji: "🧣", category: "せいかつ" },
    { name: "スキー", season: "冬", description: "雪の上をすべる冬のスポーツです。", emoji: "🎿", category: "あそび" }
  ]
};

// 季節ごとのアイコン候補
const seasonEmojiOptions = {
  '春': ['🌸', '🌷', '🎎', '🐝', '🦋'],
  '夏': ['🌻', '🍉', '🎆', '🏊', '🌞'],
  '秋': ['🍁', '🌾', '🍂', '🌰', '🎑'],
  '冬': ['❄️', '⛄', '🎄', '🎍', '☃️']
};

function pickEmoji(seasonKey) {
  const options = seasonEmojiOptions[seasonKey] || [];
  return options[Math.floor(Math.random() * options.length)] || '';
}

function renderVisual(element, item, options = {}) {
  const { useLargeImage = false } = options;
  if (!element || !item) return;

  element.innerHTML = '';
  element.classList.remove('text-item');
  element.setAttribute('aria-label', item.name || '');

  if (item.visual) {
    const img = document.createElement('img');
    img.src = item.visual;
    img.alt = `${item.name}のイラスト`;
    img.className = useLargeImage ? 'illustration-image large' : 'illustration-image';
    element.appendChild(img);
    return;
  }

  const content = item.emoji || item.name || '';
  element.textContent = content;
  adjustTextItem(element, content);
}

// ゲーム状態管理
let gameState = {
  currentScreen: 'home',
  currentGame: null,
  score: 0,
  level: 1,
  stars: 0,
  badges: {
    spring: false,
    summer: false,
    autumn: false,
    winter: false,
    all: false
  },
  currentQuestion: 0,
  totalQuestions: 0,
  currentQuestionData: null,
  selectedAnswers: [],
  orderSlots: [null, null, null, null],
  confidenceLog: [],
  lastConfidence: null,
  pendingAnswerResult: null
};

// 初期化
document.addEventListener('DOMContentLoaded', function() {
  initializeApp();
});

function initializeApp() {
  loadProgress();
  updateProgressDisplay();
  updateBadgeDisplay();
  updateMetaSummary();
  attachEventListeners();
}

// イベントリスナーの設定
function attachEventListeners() {
  // ゲームボタン
  document.querySelectorAll('.game-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const gameType = this.dataset.game;
      startGame(gameType);
    });
  });

  // 戻るボタン
  document.querySelectorAll('.back-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      showScreen('home');
    });
  });

  // ホームボタン
  document.querySelectorAll('.home-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      showScreen('home');
    });
  });

  // 次へボタン
  document.getElementById('next-btn').addEventListener('click', function() {
    continueGame();
  });

  // 確認ボタン
  document.getElementById('order-check-btn').addEventListener('click', function() {
    checkOrderGame();
  });

  // 自信度ボタン
  document.querySelectorAll('.confidence-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const confidence = Number(this.dataset.confidence);
      handleConfidenceSelection(confidence);
    });
  });
}

// 画面切り替え
function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(screen => {
    screen.classList.remove('active');
  });
  document.getElementById(screenId + '-screen').classList.add('active');
  gameState.currentScreen = screenId;
  if (screenId !== 'confidence') {
    closeConfidencePanel();
  }
}

// ゲーム開始
function startGame(gameType) {
  gameState.currentGame = gameType;
  gameState.currentQuestion = 0;
  gameState.score = 0;
  gameState.selectedAnswers = [];
  gameState.orderSlots = [null, null, null, null];

  switch(gameType) {
    case 'seasonQuiz':
      gameState.totalQuestions = 5;
      startSeasonQuiz();
      break;
    case 'nameQuiz':
      gameState.totalQuestions = 5;
      startNameQuiz();
      break;
    case 'matchGame':
      gameState.totalQuestions = 3;
      startMatchGame();
      break;
    case 'orderGame':
      gameState.totalQuestions = 1;
      startOrderGame();
      break;
    case 'testMode':
      gameState.totalQuestions = 10;
      startTestMode();
      break;
  }
}

// 季節あてクイズ
function startSeasonQuiz() {
  showScreen('season-quiz');
  generateSeasonQuizQuestion();
  attachSeasonQuizListeners();
}

function generateSeasonQuizQuestion() {
  const allItems = [...learningData.spring, ...learningData.summer, ...learningData.autumn, ...learningData.winter];
  const randomItem = allItems[Math.floor(Math.random() * allItems.length)];
  
  gameState.currentQuestionData = randomItem;
  
  const quizItemEl = document.getElementById('season-quiz-item');
  renderVisual(quizItemEl, randomItem);
  document.getElementById('season-quiz-name').textContent = randomItem.name;
}

function attachSeasonQuizListeners() {
  document.querySelectorAll('#season-quiz-screen .answer-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const answer = this.dataset.answer;
      checkSeasonQuizAnswer(answer);
    });
  });
}

function checkSeasonQuizAnswer(answer) {
  const isCorrect = answer === gameState.currentQuestionData.season;
  runAnswerCheck(isCorrect);
}

// なまえあてクイズ
function startNameQuiz() {
  showScreen('name-quiz');
  generateNameQuizQuestion();
}

function generateNameQuizQuestion() {
  const allItems = [...learningData.spring, ...learningData.summer, ...learningData.autumn, ...learningData.winter];
  const correctItem = allItems[Math.floor(Math.random() * allItems.length)];
  
  gameState.currentQuestionData = correctItem;
  
  const nameIconEl = document.getElementById('name-quiz-icon');
  renderVisual(nameIconEl, correctItem, { useLargeImage: true });
  
  // カテゴリを決定（データにあるものを使う）
  const category = correctItem.category || 'もの';
  document.getElementById('name-quiz-category').textContent = category;
  
  // 選択肢を生成
  const wrongItems = allItems.filter(item => item.name !== correctItem.name);
  const shuffledWrong = wrongItems.sort(() => Math.random() - 0.5).slice(0, 3);
  const options = [correctItem, ...shuffledWrong].sort(() => Math.random() - 0.5);
  
  const optionsContainer = document.getElementById('name-options-container');
  optionsContainer.innerHTML = '';
  
  options.forEach(option => {
    const btn = document.createElement('button');
    btn.className = 'answer-btn';
    btn.textContent = option.name;
    btn.addEventListener('click', function() {
      checkNameQuizAnswer(option.name);
    });
    optionsContainer.appendChild(btn);
  });
}

function checkNameQuizAnswer(answer) {
  const isCorrect = answer === gameState.currentQuestionData.name;
  runAnswerCheck(isCorrect);
}

// おなじ季節さがし
function startMatchGame() {
  showScreen('match-game');
  generateMatchGameQuestion();
}

function generateMatchGameQuestion() {
  const seasons = ['spring', 'summer', 'autumn', 'winter'];
  const targetSeason = seasons[Math.floor(Math.random() * seasons.length)];
  const seasonItems = [...learningData[targetSeason]].sort(() => Math.random() - 0.5);

  // 参照アイテム
  const referenceItem = seasonItems[0];
  const remainingItems = seasonItems.slice(1);

  // 同じ季節から正解となる1つを選ぶ
  const correctItem = remainingItems[0];

  // 他の季節から5つの選択肢を作成
  const otherItems = seasons
    .filter(s => s !== targetSeason)
    .flatMap(season => learningData[season]);
  const distractors = otherItems.sort(() => Math.random() - 0.5).slice(0, 5);

  const allCards = [correctItem, ...distractors].sort(() => Math.random() - 0.5);

  gameState.currentQuestionData = { referenceItem, correctItem };
  gameState.selectedAnswers = [];

  // 参照アイテムを表示
  const refEl = document.getElementById('match-reference');
  renderVisual(refEl, referenceItem);

  const matchGrid = document.getElementById('match-grid');
  matchGrid.innerHTML = '';
  
  allCards.forEach((item, index) => {
    const card = document.createElement('div');
    card.className = 'match-card';
    renderVisual(card, item);
    card.dataset.item = JSON.stringify(item);
    card.addEventListener('click', function() {
      selectMatchCard(this, item);
    });
    matchGrid.appendChild(card);
  });
}

function selectMatchCard(cardElement, item) {
  if (cardElement.classList.contains('matched')) return;
  
  if (cardElement.classList.contains('selected')) {
    cardElement.classList.remove('selected');
    gameState.selectedAnswers = [];
  } else {
    document.querySelectorAll('.match-card.selected').forEach(card => card.classList.remove('selected'));
    cardElement.classList.add('selected');
    gameState.selectedAnswers = [item];
    setTimeout(() => {
      checkMatchGameAnswer();
    }, 500);
  }
}

function checkMatchGameAnswer() {
  const { referenceItem, correctItem } = gameState.currentQuestionData;
  const referenceSeason = referenceItem.season;

  const isCorrect =
    gameState.selectedAnswers.length === 1 &&
    gameState.selectedAnswers[0].season === referenceSeason;

  if (isCorrect) {
    // 正解のカードをマッチ済みにする
    document.querySelectorAll('.match-card.selected').forEach(card => {
      card.classList.add('matched');
      card.classList.remove('selected');
    });
  } else {
    // 選択を解除
    document.querySelectorAll('.match-card.selected').forEach(card => {
      card.classList.remove('selected');
    });
  }
  
  // 解説用に正解アイテムを保持
  const selectedItem = gameState.selectedAnswers[0];

  gameState.currentQuestionData = {
    items: [
      { ...referenceItem, title: 'もんだいのアイテム' },
      { ...selectedItem, title: 'えらんだアイテム' }
    ]
  };

  setTimeout(() => {
    runAnswerCheck(isCorrect);
  }, 1000);
}

// 季節の順番ゲーム
function startOrderGame() {
  showScreen('order-game');
  generateOrderGameQuestion();
}

function generateOrderGameQuestion() {
  const seasons = [
    { name: '春', emoji: pickEmoji('春'), order: 0 },
    { name: '夏', emoji: pickEmoji('夏'), order: 1 },
    { name: '秋', emoji: pickEmoji('秋'), order: 2 },
    { name: '冬', emoji: pickEmoji('冬'), order: 3 }
  ];
  
  const shuffledSeasons = seasons.sort(() => Math.random() - 0.5);
  gameState.currentQuestionData = { correctOrder: seasons };
  gameState.orderSlots = [null, null, null, null];
  
  const optionsContainer = document.getElementById('order-options');
  optionsContainer.innerHTML = '';
  
  shuffledSeasons.forEach(season => {
    const item = document.createElement('div');
    item.className = 'order-item';
    item.textContent = season.emoji;
    item.setAttribute('aria-label', season.name);
    item.dataset.season = JSON.stringify(season);
    item.addEventListener('click', function() {
      selectOrderItem(this, season);
    });
    optionsContainer.appendChild(item);
  });
  
  // スロットのリセット
  document.querySelectorAll('.order-slot').forEach(slot => {
    slot.innerHTML = '';
  });
}

function selectOrderItem(element, season) {
  // 空いているスロットに配置
  const slots = document.querySelectorAll('.order-slot');
  for (let i = 0; i < slots.length; i++) {
    if (!gameState.orderSlots[i]) {
      gameState.orderSlots[i] = season;
      slots[i].textContent = season.emoji;
      element.style.display = 'none';
      break;
    }
  }
}

function checkOrderGame() {
  const correctOrder = [0, 1, 2, 3]; // 春、夏、秋、冬の順番
  const userOrder = gameState.orderSlots.map(slot => slot ? slot.order : -1);
  
  const isCorrect = JSON.stringify(correctOrder) === JSON.stringify(userOrder);


  const correctOrderDetail = gameState.currentQuestionData.correctOrder;

  const orderDescription = correctOrderDetail
    .map(season => `${season.name} ${season.emoji}`)
    .join(' → ');

  gameState.currentQuestionData = {
    emoji: correctOrderDetail.map(season => season.emoji).join(' → '),
    name: '四季のじゅんばん',
    season: '春 → 夏 → 秋 → 冬',
    description: `四季はこのじゅんばんでめぐるよ：${orderDescription}`
  };

  runAnswerCheck(isCorrect);
}

// おぼえたかな？テスト
function startTestMode() {
  showScreen('test-mode');
  generateTestQuestion();
}

function generateTestQuestion() {
  const allItems = [...learningData.spring, ...learningData.summer, ...learningData.autumn, ...learningData.winter];
  const correctItem = allItems[Math.floor(Math.random() * allItems.length)];
  
  gameState.currentQuestionData = correctItem;
  
  const questionTypes = ['season', 'name'];
  const questionType = questionTypes[Math.floor(Math.random() * questionTypes.length)];
  
  const testItemEl = document.getElementById('test-question-item');
  renderVisual(testItemEl, correctItem);
  
  const optionsContainer = document.getElementById('test-options-container');
  optionsContainer.innerHTML = '';
  
  if (questionType === 'season') {
    document.getElementById('test-question').textContent = `${correctItem.name} は どの季節かな？`;
    
    const seasons = ['春', '夏', '秋', '冬'];
    seasons.forEach(season => {
      const btn = document.createElement('button');
      btn.className = 'answer-btn';
      btn.textContent = season;
      btn.addEventListener('click', function() {
        checkTestAnswer(season, 'season');
      });
      optionsContainer.appendChild(btn);
    });
  } else {
    document.getElementById('test-question').textContent = 'これは なんでしょう？';
    
    const wrongItems = allItems.filter(item => item.name !== correctItem.name);
    const shuffledWrong = wrongItems.sort(() => Math.random() - 0.5).slice(0, 3);
    const options = [correctItem, ...shuffledWrong].sort(() => Math.random() - 0.5);
    
    options.forEach(option => {
      const btn = document.createElement('button');
      btn.className = 'answer-btn';
      btn.textContent = option.name;
      btn.addEventListener('click', function() {
        checkTestAnswer(option.name, 'name');
      });
      optionsContainer.appendChild(btn);
    });
  }
  
  updateTestProgress();
}

function checkTestAnswer(answer, type) {
  let isCorrect = false;
  
  if (type === 'season') {
    isCorrect = answer === gameState.currentQuestionData.season;
  } else {
    isCorrect = answer === gameState.currentQuestionData.name;
  }
  
  runAnswerCheck(isCorrect);
}

function updateTestProgress() {
  document.getElementById('current-question').textContent = gameState.currentQuestion + 1;
  document.getElementById('total-questions').textContent = gameState.totalQuestions;
}

// 解説画面表示
function showExplanation(isCorrect) {
  const judgmentResult = document.getElementById('judgment-result');
  const explanationItemsContainer = document.getElementById('explanation-items');

  explanationItemsContainer.innerHTML = '';

  // 判定結果の表示
  judgmentResult.textContent = isCorrect ? '✨ せいかい！ ✨' : '❌ まちがい！';
  judgmentResult.className = isCorrect ? 'judgment-result correct' : 'judgment-result incorrect';

  const seasonClass = {
    '春': 'spring-text',
    '夏': 'summer-text',
    '秋': 'autumn-text',
    '冬': 'winter-text'
  };

  const items = gameState.currentQuestionData.items || [gameState.currentQuestionData];

  items.forEach(item => {
    const explanationContent = document.createElement('div');
    explanationContent.className = 'explanation-content';

    const icon = document.createElement('div');
    icon.className = 'explanation-icon';
    renderVisual(icon, item);

    const textWrapper = document.createElement('div');
    textWrapper.className = 'explanation-text';

    if (item.title) {
      const label = document.createElement('p');
      label.className = 'explanation-label';
      label.textContent = item.title;
      textWrapper.appendChild(label);
    }

    const nameEl = document.createElement('h3');
    nameEl.className = 'explanation-name';
    nameEl.textContent = item.name;

    const seasonEl = document.createElement('p');
    seasonEl.className = `explanation-season ${seasonClass[item.season] || ''}`;
    seasonEl.textContent = `季節：${item.season}`;

    const descriptionEl = document.createElement('p');
    descriptionEl.className = 'explanation-description';
    descriptionEl.textContent = item.description;

    textWrapper.appendChild(nameEl);
    textWrapper.appendChild(seasonEl);
    textWrapper.appendChild(descriptionEl);

    explanationContent.appendChild(icon);
    explanationContent.appendChild(textWrapper);

    explanationItemsContainer.appendChild(explanationContent);
  });

  const coaching = document.createElement('div');
  coaching.className = 'meta-coaching';
  coaching.textContent = `ふりかえり: ${getCoachingMessage(isCorrect, gameState.lastConfidence || 2)}`;
  explanationItemsContainer.appendChild(coaching);

  showScreen('explanation');
}

// ゲーム継続
function continueGame() {
  gameState.currentQuestion++;
  
  if (gameState.currentQuestion >= gameState.totalQuestions) {
    endGame();
  } else {
    // 次の問題
    switch(gameState.currentGame) {
      case 'seasonQuiz':
        generateSeasonQuizQuestion();
        showScreen('season-quiz');
        break;
      case 'nameQuiz':
        generateNameQuizQuestion();
        showScreen('name-quiz');
        break;
      case 'matchGame':
        generateMatchGameQuestion();
        showScreen('match-game');
        break;
      case 'orderGame':
        endGame(); // 順番ゲームは1問のみ
        break;
      case 'testMode':
        generateTestQuestion();
        showScreen('test-mode');
        break;
    }
  }
}

// ゲーム終了
function endGame() {
  updateLevel();
  updateBadges();
  saveProgress();
  showResults();
  updateProgressDisplay();
  updateBadgeDisplay();
  updateMetaSummary();
}

function updateLevel() {
  const newLevel = Math.floor(gameState.stars / 10) + 1;
  if (newLevel > gameState.level) {
    gameState.level = newLevel;
  }
}

function updateBadges() {
  const correctAnswers = gameState.score;
  const totalQuestions = gameState.totalQuestions;
  
  if (correctAnswers === totalQuestions) {
    // パーフェクトの場合、ゲームに応じたバッジを獲得
    switch(gameState.currentGame) {
      case 'seasonQuiz':
        gameState.badges.spring = true;
        break;
      case 'nameQuiz':
        gameState.badges.summer = true;
        break;
      case 'matchGame':
        gameState.badges.autumn = true;
        break;
      case 'orderGame':
        gameState.badges.winter = true;
        break;
      case 'testMode':
        // 全てのバッジを持っている場合、マスターバッジを獲得
        if (gameState.badges.spring && gameState.badges.summer && gameState.badges.autumn && gameState.badges.winter) {
          gameState.badges.all = true;
        }
        break;
    }
  }
}

function showResults() {
  document.getElementById('result-stars-count').textContent = gameState.score;
  
  const messages = [
    'すばらしい！',
    'よくできました！',
    'がんばったね！',
    'またちょうせんしてね！'
  ];
  
  const percentage = (gameState.score / gameState.totalQuestions) * 100;
  let messageIndex = 0;
  
  if (percentage === 100) messageIndex = 0;
  else if (percentage >= 80) messageIndex = 1;
  else if (percentage >= 60) messageIndex = 2;
  else messageIndex = 3;
  
  document.getElementById('result-message').textContent = messages[messageIndex];
  
  showScreen('result');
}

// 進捗表示更新
function updateProgressDisplay() {
  document.getElementById('level-value').textContent = gameState.level;
  document.getElementById('stars-value').textContent = gameState.stars;
}

// バッジ表示更新
function updateBadgeDisplay() {
  Object.keys(gameState.badges).forEach(badgeType => {
    const badgeElement = document.getElementById(`badge-${badgeType}`);
    if (gameState.badges[badgeType]) {
      badgeElement.classList.remove('locked');
      badgeElement.classList.add('unlocked');
    }
  });
}

// 進捗を保存
function saveProgress() {
  try {
    const data = {
      level: gameState.level,
      stars: gameState.stars,
      badges: gameState.badges,
      confidenceLog: gameState.confidenceLog
    };
    localStorage.setItem('game66Progress', JSON.stringify(data));
  } catch (e) {
    console.warn('Failed to save progress:', e);
  }
}

// 進捗を読み込み
function loadProgress() {
  try {
    const saved = localStorage.getItem('game66Progress');
    if (saved) {
      const data = JSON.parse(saved);
      if (typeof data.level === 'number') {
        gameState.level = data.level;
      }
      if (typeof data.stars === 'number') {
        gameState.stars = data.stars;
      }
      if (data.badges && typeof data.badges === 'object') {
        gameState.badges = { ...gameState.badges, ...data.badges };
      }
      if (Array.isArray(data.confidenceLog)) {
        gameState.confidenceLog = data.confidenceLog;
      }
    }
  } catch (e) {
    console.warn('Failed to load progress:', e);
  }
}


function openConfidencePanel() {
  const panel = document.getElementById('confidence-panel');
  panel.classList.remove('hidden');
}

function closeConfidencePanel() {
  const panel = document.getElementById('confidence-panel');
  panel.classList.add('hidden');
}

function handleConfidenceSelection(confidence) {
  if (![1, 2, 3].includes(confidence)) return;
  if (!gameState.pendingAnswerResult) return;

  const pending = gameState.pendingAnswerResult;
  gameState.pendingAnswerResult = null;
  closeConfidencePanel();

  gameState.lastConfidence = confidence;
  gameState.confidenceLog.push({
    isCorrect: pending.isCorrect,
    confidence,
    season: pending.season,
    ts: Date.now()
  });

  if (pending.isCorrect) {
    gameState.score++;
    gameState.stars++;
  }

  saveProgress();
  updateMetaSummary();
  showExplanation(pending.isCorrect);
}

function runAnswerCheck(isCorrect) {
  if (gameState.pendingAnswerResult) return;
  const season = gameState.currentQuestionData?.season || '不明';
  gameState.pendingAnswerResult = { isCorrect, season };
  openConfidencePanel();
}

function getCoachingMessage(isCorrect, confidence) {
  if (isCorrect && confidence === 3) return 'よみがあたったね！この調子で根拠をことばにしてみよう。';
  if (isCorrect && confidence <= 2) return 'せいかい！次は「なぜそう思ったか」も言えると、もっとつよくなるよ。';
  if (!isCorrect && confidence === 3) return 'じしんが高かったぶん、学びチャンス！どこで判断したかを見直そう。';
  return 'ナイス挑戦。解説を読んでから、もう一回えらぶと記憶にのこるよ。';
}

function updateMetaSummary() {
  const target = document.getElementById('meta-summary');
  if (!target) return;
  if (!gameState.confidenceLog.length) {
    target.textContent = 'まだ記録がないよ。こたえる時に「じしんど」を考えてみよう。';
    return;
  }

  const recent = gameState.confidenceLog.slice(-20);
  const avgConf = recent.reduce((a,b)=>a+b.confidence,0)/recent.length;
  const acc = recent.filter(x=>x.isCorrect).length/recent.length*100;
  target.textContent = `さいきん${recent.length}問: せいかい率 ${acc.toFixed(0)}% / じしん平均 ${avgConf.toFixed(1)}`;
}

// 問題表示用アイコンのテキスト量に応じてクラスを付与
function adjustTextItem(element, content) {
  if (content && content.length > 2) {
    element.classList.add('text-item');
  } else {
    element.classList.remove('text-item');
  }
}
