// 学習データ
const learningData = {
  spring: [
    { name: "さくら", season: "春", description: "ピンクや白い花が咲く木。4月ごろに咲いて、花見で有名です。", emoji: "🌸" },
    { name: "チューリップ", season: "春", description: "かわいい形の花。赤、黄色、ピンクなど色々な色があります。", emoji: "🌷" },
    { name: "たんぽぽ", season: "春", description: "黄色い小さな花。綿毛になって風で飛んでいきます。", emoji: "🌻" },
    { name: "ひな祭り", season: "春", description: "3月3日の女の子のお祭り。お雛様を飾ります。", emoji: "🎎" },
    { name: "入学式", season: "春", description: "4月に小学校に入る式。新しい生活の始まりです。", emoji: "ランドセル" },
    { name: "いちご", season: "春", description: "甘くて赤い果物。春においしくなります。", emoji: "🍓" },
    { name: "つばめ", season: "春", description: "春に日本にやってくる鳥。巣を作って子育てします。", emoji: "つばめ" },
    { name: "ちょう", season: "春", description: "カラフルな羽の虫。花の蜜を吸います。", emoji: "🦋" },
    { name: "たけのこ", season: "春", description: "竹の赤ちゃん。春にょきにょき伸びます。", emoji: "たけのこ" },
    { name: "菜の花", season: "春", description: "黄色い小さな花がたくさん咲きます。春の野原で見かけます。", emoji: "なのはな" }
  ],
  summer: [
    { name: "ひまわり", season: "夏", description: "大きな黄色い花。太陽の方を向いて咲きます。", emoji: "🌻" },
    { name: "あさがお", season: "夏", description: "朝に咲くラッパの形の花。色々な色があります。", emoji: "あさがお" },
    { name: "七夕", season: "夏", description: "7月7日の星のお祭り。短冊に願いを書きます。", emoji: "🎋" },
    { name: "夏祭り", season: "夏", description: "夏の楽しいお祭り。花火や屋台があります。", emoji: "🎆" },
    { name: "すいか", season: "夏", description: "緑の皮で中が赤い果物。夏にとても甘くなります。", emoji: "🍉" },
    { name: "かぶとむし", season: "夏", description: "角がある強い虫。夏の夜に活動します。", emoji: "かぶとむし" },
    { name: "せみ", season: "夏", description: "夏に「ミーンミーン」と鳴く虫。木にとまっています。", emoji: "せみ" },
    { name: "プール", season: "夏", description: "夏に水遊びをする場所。泳いで涼しくなります。", emoji: "🏊" },
    { name: "かき氷", season: "夏", description: "氷を削った冷たいおやつ。シロップをかけて食べます。", emoji: "かきごおり" },
    { name: "とまと", season: "夏", description: "赤くて丸い野菜。夏にたくさん採れます。", emoji: "🍅" }
  ],
  autumn: [
    { name: "コスモス", season: "秋", description: "ピンクや白い可愛い花。秋の野原に咲きます。", emoji: "コスモス" },
    { name: "もみじ", season: "秋", description: "葉っぱが赤や黄色に変わる木。とてもきれいです。", emoji: "🍁" },
    { name: "月見", season: "秋", description: "秋の満月を見るお祭り。お団子を食べます。", emoji: "🌕" },
    { name: "運動会", season: "秋", description: "秋に行う体を動かす行事。かけっこなどをします。", emoji: "🏃" },
    { name: "りんご", season: "秋", description: "赤くて甘い果物。秋においしくなります。", emoji: "🍎" },
    { name: "かき", season: "秋", description: "オレンジ色の甘い果物。秋の味覚です。", emoji: "かき" },
    { name: "どんぐり", season: "秋", description: "木の実。落ちているのを拾って遊べます。", emoji: "どんぐり" },
    { name: "稲刈り", season: "秋", description: "お米を収穫すること。秋の大切な作業です。", emoji: "🌾" },
    { name: "くり", season: "秋", description: "とげとげの殻に入った甘い木の実です。", emoji: "🌰" }
  ],
  winter: [
    { name: "つばき", season: "冬", description: "寒い冬に咲く赤い花。つやつやした葉っぱが特徴です。", emoji: "つばき" },
    { name: "うめ", season: "冬", description: "寒い時期に咲く香りのよい花。春の始まりを告げます。", emoji: "うめ" },
    { name: "クリスマス", season: "冬", description: "12月25日のお祝い。プレゼントをもらいます。", emoji: "🎄" },
    { name: "お正月", season: "冬", description: "1年の始まりのお祝い。お年玉をもらいます。", emoji: "🎍" },
    { name: "雪だるま", season: "冬", description: "雪で作る人形。冬の楽しい遊びです。", emoji: "⛄" },
    { name: "みかん", season: "冬", description: "冬に食べる甘い果物。ビタミンがたっぷりです。", emoji: "🍊" },
    { name: "マフラー", season: "冬", description: "首に巻く暖かい布。寒い日に使います。", emoji: "マフラー" },
    { name: "節分", season: "冬", description: "2月3日の行事。豆をまいて鬼を追い払います。", emoji: "👹" },
    { name: "スキー", season: "冬", description: "雪の上を滑るスポーツ。冬の楽しい遊びです。", emoji: "🎿" }
  ]
};

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
  orderSlots: [null, null, null, null]
};

// 初期化
document.addEventListener('DOMContentLoaded', function() {
  initializeApp();
});

function initializeApp() {
  loadProgress();
  updateProgressDisplay();
  updateBadgeDisplay();
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
}

// 画面切り替え
function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(screen => {
    screen.classList.remove('active');
  });
  document.getElementById(screenId + '-screen').classList.add('active');
  gameState.currentScreen = screenId;
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
  quizItemEl.textContent = randomItem.emoji;
  quizItemEl.setAttribute('aria-label', randomItem.name);
  adjustTextItem(quizItemEl, randomItem.emoji);
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
  if (isCorrect) {
    gameState.score++;
    gameState.stars++;
  }
  
  showExplanation(isCorrect);
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
  nameIconEl.textContent = correctItem.emoji;
  nameIconEl.setAttribute('aria-label', correctItem.name);
  adjustTextItem(nameIconEl, correctItem.emoji);
  
  // カテゴリを決定
  const categories = ['もの', 'はな', 'くだもの', 'ぎょうじ'];
  const category = categories[Math.floor(Math.random() * categories.length)];
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
  if (isCorrect) {
    gameState.score++;
    gameState.stars++;
  }
  
  showExplanation(isCorrect);
}

// おなじ季節さがし
function startMatchGame() {
  showScreen('match-game');
  generateMatchGameQuestion();
}

function generateMatchGameQuestion() {
  const seasons = ['spring', 'summer', 'autumn', 'winter'];
  const targetSeason = seasons[Math.floor(Math.random() * seasons.length)];
  const seasonItems = [...learningData[targetSeason]];
  
  // 同じ季節から2つ選択
  const shuffledItems = seasonItems.sort(() => Math.random() - 0.5);
  const correctItems = shuffledItems.slice(0, 2);
  
  // 他の季節から4つ選択
  const otherSeasons = seasons.filter(s => s !== targetSeason);
  const wrongItems = [];
  otherSeasons.forEach(season => {
    const items = [...learningData[season]].sort(() => Math.random() - 0.5);
    wrongItems.push(items[0]);
    if (wrongItems.length < 4) {
      wrongItems.push(items[1]);
    }
  });
  
  const allCards = [...correctItems, ...wrongItems.slice(0, 4)].sort(() => Math.random() - 0.5);
  
  gameState.currentQuestionData = { correctItems, targetSeason };
  gameState.selectedAnswers = [];
  
  const matchGrid = document.getElementById('match-grid');
  matchGrid.innerHTML = '';
  
  allCards.forEach((item, index) => {
    const card = document.createElement('div');
    card.className = 'match-card';
    card.textContent = item.emoji;
    card.setAttribute('aria-label', item.name);
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
    gameState.selectedAnswers = gameState.selectedAnswers.filter(selected => selected.name !== item.name);
  } else {
    if (gameState.selectedAnswers.length < 2) {
      cardElement.classList.add('selected');
      gameState.selectedAnswers.push(item);
    }
  }
  
  if (gameState.selectedAnswers.length === 2) {
    setTimeout(() => {
      checkMatchGameAnswer();
    }, 500);
  }
}

function checkMatchGameAnswer() {
  const correctItems = gameState.currentQuestionData.correctItems;
  const selectedNames = gameState.selectedAnswers.map(item => item.name);
  const correctNames = correctItems.map(item => item.name);
  
  const isCorrect = selectedNames.every(name => correctNames.includes(name));
  
  if (isCorrect) {
    gameState.score++;
    gameState.stars++;
    
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
  
  // 解説用のデータを設定（最初の正解アイテム）
  gameState.currentQuestionData = correctItems[0];
  
  setTimeout(() => {
    showExplanation(isCorrect);
  }, 1000);
}

// 季節の順番ゲーム
function startOrderGame() {
  showScreen('order-game');
  generateOrderGameQuestion();
}

function generateOrderGameQuestion() {
  const seasons = [
    { name: '春', emoji: '🌸', order: 0 },
    { name: '夏', emoji: '🌻', order: 1 },
    { name: '秋', emoji: '🍁', order: 2 },
    { name: '冬', emoji: '❄️', order: 3 }
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
  
  if (isCorrect) {
    gameState.score++;
    gameState.stars++;
  }
  
  // 解説用のデータを設定（春のデータ）
  gameState.currentQuestionData = learningData.spring[0];
  
  showExplanation(isCorrect);
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
  testItemEl.textContent = correctItem.emoji;
  testItemEl.setAttribute('aria-label', correctItem.name);
  adjustTextItem(testItemEl, correctItem.emoji);
  
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
  
  if (isCorrect) {
    gameState.score++;
    gameState.stars++;
  }
  
  showExplanation(isCorrect);
}

function updateTestProgress() {
  document.getElementById('current-question').textContent = gameState.currentQuestion + 1;
  document.getElementById('total-questions').textContent = gameState.totalQuestions;
}

// 解説画面表示
function showExplanation(isCorrect) {
  const judgmentResult = document.getElementById('judgment-result');
  const explanationIcon = document.getElementById('explanation-icon');
  const explanationName = document.getElementById('explanation-name');
  const explanationSeason = document.getElementById('explanation-season');
  const explanationDescription = document.getElementById('explanation-description');
  
  // 判定結果の表示
  judgmentResult.textContent = isCorrect ? '✨ せいかい！ ✨' : '❌ まちがい！';
  judgmentResult.className = isCorrect ? 'judgment-result correct' : 'judgment-result incorrect';
  
  // 解説内容の表示
  const item = gameState.currentQuestionData;
  explanationIcon.textContent = item.emoji;
  explanationIcon.setAttribute('aria-label', item.name);
  adjustTextItem(explanationIcon, item.emoji);
  explanationName.textContent = item.name;
  explanationSeason.textContent = `季節：${item.season}`;
  explanationDescription.textContent = item.description;
  
  // 季節に応じた色付け
  const seasonClass = {
    '春': 'spring-text',
    '夏': 'summer-text',
    '秋': 'autumn-text',
    '冬': 'winter-text'
  };
  explanationSeason.className = `explanation-season ${seasonClass[item.season]}`;
  
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
      badges: gameState.badges
    };
    localStorage.setItem('game11Progress', JSON.stringify(data));
  } catch (e) {
    console.warn('Failed to save progress:', e);
  }
}

// 進捗を読み込み
function loadProgress() {
  try {
    const saved = localStorage.getItem('game11Progress');
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
    }
  } catch (e) {
    console.warn('Failed to load progress:', e);
  }
}

// 問題表示用アイコンのテキスト量に応じてクラスを付与
function adjustTextItem(element, content) {
  if (content && content.length > 2) {
    element.classList.add('text-item');
  } else {
    element.classList.remove('text-item');
  }
}
