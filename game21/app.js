// 名言データは外部ファイルから読み込む
let quotesData;
// DOM要素の取得
const sceneButtons = document.querySelectorAll('.btn--scene');
const quoteCard = document.getElementById('quoteCard');
const quoteScene = document.getElementById('quoteScene');
const quoteText = document.getElementById('quoteText');
const quoteAuthor = document.getElementById('quoteAuthor');
const quoteExplanation = document.getElementById('quoteExplanation');

// 状態管理用の変数
let currentCategory = null;
// カテゴリ別の使用済み名言のインデックスを追跡
let usedQuotesByCategory = {};
let usedQuotesAll = [];
let swipeStartX = 0;

// スワイプ操作を検知
quoteCard.addEventListener('touchstart', (e) => {
  swipeStartX = e.touches[0].clientX;
});

quoteCard.addEventListener('touchend', (e) => {
  const touchEndX = e.changedTouches[0].clientX;
  const swipeDistance = touchEndX - swipeStartX;
  if (Math.abs(swipeDistance) > 50) {
    showNextQuote();
  }
});


// 指定されたカテゴリからランダムな名言を取得する関数
function getRandomQuoteByCategory(category) {
  const categoryQuotes = quotesData.quotes.filter(quote => quote.category === category);
  
  if (categoryQuotes.length === 0) {
    return null;
  }
  
  // カテゴリの使用済みリストを初期化
  if (!usedQuotesByCategory[category]) {
    usedQuotesByCategory[category] = [];
  }
  
  // 全ての名言を使い切った場合はリセット
  if (usedQuotesByCategory[category].length >= categoryQuotes.length) {
    usedQuotesByCategory[category] = [];
  }
  
  // 未使用の名言を取得
  let availableQuotes = categoryQuotes.filter((quote, index) => {
    return !usedQuotesByCategory[category].includes(index);
  });
  
  if (availableQuotes.length === 0) {
    // 全て使用済みの場合はリセット
    usedQuotesByCategory[category] = [];
    availableQuotes = categoryQuotes;
  }
  
  const randomIndex = Math.floor(Math.random() * availableQuotes.length);
  const selectedQuote = availableQuotes[randomIndex];
  
  // 使用済みリストに追加（元の配列でのインデックスを保存）
  const originalIndex = categoryQuotes.findIndex(quote => 
    quote.quote === selectedQuote.quote && quote.author === selectedQuote.author
  );
  usedQuotesByCategory[category].push(originalIndex);

  return selectedQuote;
}

// 全てのカテゴリからランダムな名言を取得する関数
function getRandomQuoteAll() {
  if (quotesData.quotes.length === 0) {
    return null;
  }

  // 全ての名言を使い切った場合はリセット
  if (usedQuotesAll.length >= quotesData.quotes.length) {
    usedQuotesAll = [];
  }

  // 未使用の名言を取得
  let availableQuotes = quotesData.quotes.filter((quote, index) => {
    return !usedQuotesAll.includes(index);
  });

  const randomIndex = Math.floor(Math.random() * availableQuotes.length);
  const selectedQuote = availableQuotes[randomIndex];

  // 使用済みリストに追加
  const originalIndex = quotesData.quotes.findIndex(q =>
    q.quote === selectedQuote.quote && q.author === selectedQuote.author
  );
  usedQuotesAll.push(originalIndex);

  return selectedQuote;
}

// 名言を表示する関数
function displayQuote(quote) {
  if (!quote) {
    return;
  }
  
  // 要素にデータを設定
  quoteScene.textContent = quote.scene;
  quoteText.textContent = quote.quote;
  quoteAuthor.textContent = quote.author;
  quoteExplanation.textContent = quote.explanation;
  
  // 名言カードを表示する
  quoteCard.classList.remove('hidden');
  
  // アニメーション用のクラスをリセットしてから追加
  quoteCard.classList.remove('show');
  setTimeout(() => {
    quoteCard.classList.add('show');
  }, 50);
}

// 現在のカテゴリで次の名言を表示

function showNextQuote() {
  if (!currentCategory || !quotesData) {
    return;
  }
  const randomQuote = currentCategory === 'all'
    ? getRandomQuoteAll()
    : getRandomQuoteByCategory(currentCategory);
  if (randomQuote) {
    displayQuote(randomQuote);
  }
}


// ボタンのパルスアニメーション
function pulseButton(button) {
  button.classList.add('pulse');
  setTimeout(() => {
    button.classList.remove('pulse');
  }, 300);
}

// 各場面ボタンにクリックイベントを設定
sceneButtons.forEach(button => {
  button.addEventListener('click', () => {
    const category = button.getAttribute('data-category');
    currentCategory = category;
    
    // ボタンアニメーション
    pulseButton(button);

    // 少し遅延してから名言を表示
    setTimeout(() => {

      showNextQuote();

    }, 150);
  });
});

// 画面端のタップで次の名言を表示（スワイプは除外）
let tapStartX = 0;
let touchMoved = false;
const swipeThreshold = 30;
const edgeOffset = 50;

document.addEventListener('touchstart', e => {
  tapStartX = e.touches[0].clientX;
  touchMoved = false;
});

document.addEventListener('touchmove', e => {
  const moveX = e.touches[0].clientX;
  if (Math.abs(moveX - tapStartX) > swipeThreshold) {
    touchMoved = true;
  }
});

document.addEventListener('touchend', e => {
  if (touchMoved) {
    return;
  }
  const x = e.changedTouches[0].clientX;
  const width = window.innerWidth;
  if (x < edgeOffset || x > width - edgeOffset) {
    showNextQuote();
  }
});

document.addEventListener('click', e => {
  const x = e.clientX;
  const width = window.innerWidth;
  if (e.target.closest('.btn--scene')) return;
  if (x < edgeOffset || x > width - edgeOffset) {
    showNextQuote();
  }
});

// 初期化
document.addEventListener('DOMContentLoaded', () => {
  fetch('./quotes.json').then(r => r.json()).then(data => {
    quotesData = data;
    console.log('旅の言葉アプリが読み込まれました！');
    console.log(`${quotesData.quotes.length}個の名言が利用可能です。`);
    console.log(`${sceneButtons.length}個のボタンが見つかりました。`);

    const categoryCounts = {};
    quotesData.quotes.forEach(quote => {
      categoryCounts[quote.category] = (categoryCounts[quote.category] || 0) + 1;
    });
    console.log('カテゴリ別名言数:', categoryCounts);
  });
});
