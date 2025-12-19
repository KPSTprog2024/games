// 学習データ
const learningData = {
  spring: [
    { name: "さくら", season: "春", description: "ピンクや白の花。あたたかくなるころにさきます。", emoji: "🌸", category: "おはな" },
    { name: "チューリップ", season: "春", description: "色とりどりのかわいい花。春にたくさんさきます。", emoji: "🌷", category: "おはな" },
    { name: "たんぽぽ", season: "春", description: "黄色い花。わたげになって風にのります。", emoji: "🌼", category: "おはな" },
    { name: "ひなまつり", season: "春", description: "3がつ3にちの女の子のおまつり。おひなさまをかざります。", emoji: "🎎", category: "ぎょうじ" },
    { name: "にゅうがくしき", season: "春", description: "あたらしいがっこうへいく日。わくわくのスタートです。", emoji: "🎒", category: "ぎょうじ" },
    { name: "いちご", season: "春", description: "あかくてあまいくだもの。春においしくなります。", emoji: "🍓", category: "たべもの" },
    { name: "つばめ", season: "春", description: "あたたかくなるとにほんにくる鳥。おうちをつくります。", emoji: "🐦", category: "どうぶつ" },
    { name: "ちょう", season: "春", description: "カラフルなはねの虫。お花のミツをすいます。", emoji: "🦋", category: "どうぶつ" },
    { name: "たけのこ", season: "春", description: "たけのあかちゃん。にょきっと土からでてきます。", emoji: "🌱", category: "たべもの" },
    { name: "なのはな", season: "春", description: "黄色の小さな花がいっぱい。春ののはらでさきます。", emoji: "💛", category: "おはな" }
  ],
  summer: [
    { name: "ひまわり", season: "夏", description: "大きなきいろの花。おひさまのほうをむきます。", emoji: "🌻", category: "おはな" },
    { name: "あさがお", season: "夏", description: "あさにさくラッパのような花。いろいろな色があります。", emoji: "🌺", category: "おはな" },
    { name: "たなばた", season: "夏", description: "ほしにねがいをかく日。ささにかざります。", emoji: "🎋", category: "ぎょうじ" },
    { name: "なつまつり", season: "夏", description: "やたいとおんどり。はなびがキラキラひかります。", emoji: "🎆", category: "ぎょうじ" },
    { name: "すいか", season: "夏", description: "みずみずしいあまいくだもの。つめたくしておいしいよ。", emoji: "🍉", category: "たべもの" },
    { name: "かぶとむし", season: "夏", description: "つのがかっこいい虫。よるにうごきます。", emoji: "🪲", category: "どうぶつ" },
    { name: "せみ", season: "夏", description: "「ミーンミーン」となく虫。夏の木にとまっています。", emoji: "🪰", category: "どうぶつ" },
    { name: "プール", season: "夏", description: "みずあそびのばしょ。つめたい水でひんやり。", emoji: "🏊", category: "あそび" },
    { name: "かきごおり", season: "夏", description: "こおりをけずったひんやりおやつ。シロップをかけます。", emoji: "🍧", category: "たべもの" },
    { name: "とまと", season: "夏", description: "あかくてまるいやさい。サラダにぴったり。", emoji: "🍅", category: "たべもの" }
  ],
  autumn: [
    { name: "コスモス", season: "秋", description: "ほそいはねのような花。秋のそらにゆれます。", emoji: "🌼", category: "おはな" },
    { name: "もみじ", season: "秋", description: "はっぱがあかやきいろにへんしん。やまがカラフル。", emoji: "🍁", category: "おはな" },
    { name: "おつきみ", season: "秋", description: "まんまるのおつきをみる日。おだんごをたべます。", emoji: "🌕", category: "ぎょうじ" },
    { name: "うんどうかい", season: "秋", description: "かけっこやダンスをする日。みんなでおうえんします。", emoji: "🤸", category: "あそび" },
    { name: "りんご", season: "秋", description: "シャキッとしたあまいくだもの。りんごのきからとれます。", emoji: "🍎", category: "たべもの" },
    { name: "かき", season: "秋", description: "オレンジいろのくだもの。あまくてやわらかいです。", emoji: "🟠", category: "たべもの" },
    { name: "どんぐり", season: "秋", description: "きのしたにおちている木の実。ひろってあそべます。", emoji: "🌰", category: "たべもの" },
    { name: "いねかり", season: "秋", description: "おこめをとるしゅんかん。たんぼがきんいろです。", emoji: "🌾", category: "ぎょうじ" },
    { name: "くり", season: "秋", description: "とげとげのなかにあるまるい木の実。ほくほくです。", emoji: "🌰", category: "たべもの" }
  ],
  winter: [
    { name: "つばき", season: "冬", description: "さむい日にさくあかい花。つやつやのはっぱです。", emoji: "🌺", category: "おはな" },
    { name: "うめ", season: "冬", description: "ひんやりした空気でいいにおいの花。はるのあしおとです。", emoji: "🌸", category: "おはな" },
    { name: "クリスマス", season: "冬", description: "きらきらかざりとプレゼントの日。サンタさんがくるかも。", emoji: "🎄", category: "ぎょうじ" },
    { name: "おしょうがつ", season: "冬", description: "1ねんのはじまりのおいわい。かぞくでおもちをたべます。", emoji: "🎍", category: "ぎょうじ" },
    { name: "雪だるま", season: "冬", description: "ゆきでつくるまるい人。マフラーをつけたりします。", emoji: "⛄", category: "あそび" },
    { name: "みかん", season: "冬", description: "こたつでたべるあまいくだもの。皮がむきやすいよ。", emoji: "🍊", category: "たべもの" },
    { name: "マフラー", season: "冬", description: "くびにまくあったかいぬの。かぜひかないように。", emoji: "🧣", category: "あそび" },
    { name: "せつぶん", season: "冬", description: "まめをまいて「おにはそと！」とかけ声をします。", emoji: "👹", category: "ぎょうじ" },
    { name: "スキー", season: "冬", description: "ゆきのうえをすべるスポーツ。ビューンとすべります。", emoji: "🎿", category: "あそび" }
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
  const refContent = referenceItem.emoji || referenceItem.name;
  refEl.textContent = refContent;
  refEl.setAttribute('aria-label', referenceItem.name);
  adjustTextItem(refEl, refContent);

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
  
  // 解説用に正解アイテムを保持
  const selectedItem = gameState.selectedAnswers[0];

  gameState.currentQuestionData = {
    items: [
      { ...referenceItem, title: 'もんだいのアイテム' },
      { ...selectedItem, title: 'えらんだアイテム' }
    ]
  };

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

  if (isCorrect) {
    gameState.score++;
    gameState.stars++;
  }

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
    const iconContent = item.emoji || item.name;
    icon.textContent = iconContent;
    icon.setAttribute('aria-label', item.name);
    adjustTextItem(icon, iconContent);

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
