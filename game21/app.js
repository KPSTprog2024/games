// 名言データ（完全版）
const quotesData = {
  "quotes": [
    {
      "scene": "出発前・旅の準備",
      "category": "出発・準備",
      "situation": "荷物準備やワクワク感",
      "quote": "かわいい子には旅をさせよ",
      "author": "日本のことわざ（読み人知らず）",
      "explanation": "昔から「かわいい子には旅をさせよ」って言ってた人がいてだな、本当に大事に思う子どもには、安全な場所にずっと置いておくより、旅に出していろんな体験をさせた方がいいって意味なんだ。今日はみんなで新しいことを見つけに行こうね！"
    },
    {
      "scene": "出発前・旅の準備",
      "category": "出発・準備",
      "situation": "計画を立てる時",
      "quote": "千里の道も一歩から",
      "author": "老子（中国の哲学者）",
      "explanation": "中国の老子っていう偉い人が「千里の道も一歩から」って言ってた人がいてだな、どんなに遠い場所に行く時も、まずは最初の一歩を踏み出すことから始まるって意味なんだ。今日も最初の一歩を踏み出そうね！"
    },
    {
      "scene": "出発前・旅の準備",
      "category": "出発・準備",
      "situation": "ワクワク感を高める",
      "quote": "人生はコンフォートゾーンの終わりから始まる",
      "author": "ニール・ドナルド・ウォルシュ",
      "explanation": "ニール・ドナルド・ウォルシュっていう人が「人生はコンフォートゾーンの終わりから始まる」って言ってた人がいてだな、いつもの安全な場所から出ることで、本当の人生が始まるって意味なんだ。今日も新しい冒険が待ってるよ！"
    },
    {
      "scene": "移動中・電車や車",
      "category": "移動中",
      "situation": "長時間移動で退屈",
      "quote": "旅は道連れ、世は情け",
      "author": "日本のことわざ（江戸いろはカルタ）",
      "explanation": "昔から「旅は道連れ、世は情け」って言ってた人がいてだな、旅をする時は一緒に行く人がいると心強くて楽しいし、世の中はお互い助け合うことが大事だって意味なんだ。今もみんなで一緒だから楽しいんだよね！"
    },
    {
      "scene": "移動中・電車や車",
      "category": "移動中",
      "situation": "時間が長く感じる時",
      "quote": "人生は短く、世界は広い",
      "author": "作者不詳",
      "explanation": "「人生は短く、世界は広い」って言ってた人がいてだな、限られた時間だからこそ、たくさんの場所を見て回りたいって気持ちを表してるんだ。今の移動時間も、素敵な景色を見る大切な時間なんだよ！"
    },
    {
      "scene": "移動中・電車や車",
      "category": "移動中",
      "situation": "移動の価値",
      "quote": "重要なのは到着ではなく旅です",
      "author": "T.S.エリオット",
      "explanation": "T.S.エリオットっていう有名な詩人が「重要なのは到着ではなく旅だ」って言ってた人がいてだな、目的地に着くことよりも、そこまでの道のりを楽しむことが大切だって意味なんだ。今の時間も大切な旅の一部なんだよ！"
    },
    {
      "scene": "観光地・新しい場所",
      "category": "観光・発見",
      "situation": "初めて見るものに驚いた時",
      "quote": "世界は一冊の本であり、旅をしない人はたった1ページしか読みません",
      "author": "アウグスティヌス（古代の思想家）",
      "explanation": "アウグスティヌスっていう昔の偉い人が「世界は一冊の本で、旅をしない人は1ページしか読まない」って言ってた人がいてだな、いろんな場所に行くたびに、新しいページを読むようにたくさんのことを学べるって意味なんだ。今日もまた新しいページを読んでるんだね！"
    },
    {
      "scene": "観光地・新しい場所",
      "category": "観光・発見",
      "situation": "驚いた時",
      "quote": "子供の目には世界の七不思議はありません。七百万の不思議があるのです",
      "author": "ウォルト・ストライティフ",
      "explanation": "ウォルト・ストライティフっていう人が「子供の目には世界の七不思議はない、七百万の不思議がある」って言ってた人がいてだな、大人は決まった有名なものしか不思議に思わないけれど、子供にとっては全てが不思議で素晴らしいって意味なんだ。君たちの目はとっても素敵なんだよ！"
    },
    {
      "scene": "観光地・新しい場所",
      "category": "観光・発見",
      "situation": "新しい視点",
      "quote": "発見の真の航海は、新しい風景を探すことではなく、新しい目を持つことである",
      "author": "マルセル・プルースト",
      "explanation": "マルセル・プルーストっていうフランスの作家が「発見の真の航海は、新しい風景を探すことではなく、新しい目を持つこと」って言ってた人がいてだな、同じものでも見方を変えると新しい発見があるって意味なんだ。今日もいつもと違う目で見てみようね！"
    },
    {
      "scene": "食事・地元料理",
      "category": "食事・文化",
      "situation": "初めての味に挑戦",
      "quote": "郷に入れば郷に従え",
      "author": "日本のことわざ",
      "explanation": "昔から「郷に入れば郷に従え」って言ってた人がいてだな、新しい場所に行ったら、その場所のやり方や文化に合わせることが大事だって意味なんだ。新しい食べ物も、その土地の文化の一つだから、ちょっと挑戦してみようか！"
    },
    {
      "scene": "食事・地元料理",
      "category": "食事・文化",
      "situation": "食文化の理解",
      "quote": "料理は愛の言語です",
      "author": "作者不詳",
      "explanation": "「料理は愛の言語」って言ってた人がいてだな、その土地の料理には、作った人の愛情がこもっているって意味なんだ。新しい味を食べることで、その土地の人たちの気持ちを感じることができるんだよ！"
    },
    {
      "scene": "困った時・トラブル",
      "category": "困った時",
      "situation": "道に迷った時",
      "quote": "迷子になることは、道を見つけることの始まり",
      "author": "現代の格言",
      "explanation": "「迷子になることは、道を見つけることの始まり」って言ってた人がいてだな、道がわからなくなっても、それは新しい道を発見するチャンスだって意味なんだ。パパママと一緒だから大丈夫、きっと面白い発見があるよ！"
    },
    {
      "scene": "困った時・トラブル",
      "category": "困った時",
      "situation": "失敗や間違いをした時",
      "quote": "失敗は成功のもと",
      "author": "日本のことわざ",
      "explanation": "エジソンっていう発明家や昔の人たちが「失敗は成功のもと」って言ってた人がいてだな、間違いをしたり失敗したりしても、そこから学んで次はもっと上手にできるようになるって意味なんだ。だから失敗を恐れなくていいんだよ！"
    },
    {
      "scene": "困った時・トラブル",
      "category": "困った時",
      "situation": "疲れた時",
      "quote": "休むも相場",
      "author": "日本のことわざ",
      "explanation": "昔から「休むも相場」って言ってた人がいてだな、一生懸命頑張ることも大事だけど、疲れた時はちゃんと休むことも同じくらい大事だって意味なんだ。休憩も旅の楽しみの一つだからね！"
    },
    {
      "scene": "新しい体験・挑戦",
      "category": "新しい挑戦",
      "situation": "怖がっている時",
      "quote": "案ずるより産むが易し",
      "author": "日本のことわざ",
      "explanation": "昔から「案ずるより産むが易し」って言ってた人がいてだな、あれこれ心配してるより、実際にやってみたら意外と簡単だったりするって意味なんだ。怖がらずに、まずは一歩踏み出してみようか！"
    },
    {
      "scene": "新しい体験・挑戦",
      "category": "新しい挑戦",
      "situation": "勇気を出す時",
      "quote": "あなたは思っているより勇敢で、見た目より強く、思っているより賢いです",
      "author": "A.A.ミルン（くまのプーさんの作者）",
      "explanation": "『くまのプーさん』を書いたA.A.ミルンっていう人が「あなたは思っているより勇敢で、見た目より強く、思っているより賢い」って言ってた人がいてだな、自分の力を信じることの大切さを教えてくれるんだ。君たちはもうとっても素晴らしいんだよ！"
    },
    {
      "scene": "新しい体験・挑戦",
      "category": "新しい挑戦",
      "situation": "挑戦への勇気",
      "quote": "勇気とは、恐怖がないことではありません。恐怖があっても行動することです",
      "author": "作者不詳",
      "explanation": "「勇気とは、恐怖がないことではなく、恐怖があっても行動すること」って言ってた人がいてだな、怖くても、それでも頑張ってやってみることが本当の勇気だって意味なんだ。一緒にやってみようね！"
    },
    {
      "scene": "写真撮影・思い出作り",
      "category": "思い出作り",
      "situation": "記念写真を撮る時",
      "quote": "一期一会",
      "author": "千利休（茶道の心得）",
      "explanation": "千利休っていうお茶の先生が「一期一会」って言ってた人がいてだな、今この時、今この場所での出会いや体験は二度と同じようには来ないから、とても大切にしようって意味なんだ。今の記念写真も、かけがえのない思い出だね！"
    },
    {
      "scene": "写真撮影・思い出作り",
      "category": "思い出作り",
      "situation": "思い出の価値",
      "quote": "思い出は時間が作る最高の土産物です",
      "author": "作者不詳",
      "explanation": "「思い出は時間が作る最高の土産物」って言ってた人がいてだな、お店で買うお土産よりも、心に残る思い出の方が価値があるって意味なんだ。今日の楽しかった時間も、みんなの心の中に残る一番素敵なお土産になったね！"
    },
    {
      "scene": "帰路・旅の終わり",
      "category": "帰る時",
      "situation": "楽しかった旅行が終わる時",
      "quote": "旅に着くことよりも楽しい道中がよい",
      "author": "英語圏のことわざ",
      "explanation": "「旅に着くことよりも楽しい道中がよい」って言ってた人がいてだな、どこかの場所に行くことよりも、そこに行くまでの時間、みんなで一緒に過ごした時間の方がもっと大切で楽しいって意味なんだ。今日も一番の宝物は、みんなで過ごした時間だったね！"
    },
    {
      "scene": "帰路・旅の終わり",
      "category": "帰る時",
      "situation": "家に帰る時",
      "quote": "家は心のある場所です",
      "author": "作者不詳",
      "explanation": "「家は心のある場所」って言ってた人がいてだな、家族がいて、愛がある場所が本当の家だって意味なんだ。旅行も楽しいけれど、みんなが待っているお家に帰るのも楽しみだね！"
    },
    {
      "scene": "家族の絆",
      "category": "家族時間",
      "situation": "家族と一緒にいる時",
      "quote": "愛する人と一緒に旅をすることは、動いている家です",
      "author": "リー・ハント",
      "explanation": "リー・ハントっていう人が「愛する人と一緒に旅をすることは、動いている家だ」って言ってた人がいてだな、家族と一緒にいれば、どこにいても家にいるような安心感があるって美しい表現なんだ。今もみんなで一緒だから、ここが私たちの家だね！"
    },
    {
      "scene": "家族の絆",
      "category": "家族時間",
      "situation": "家族の大切さ",
      "quote": "共有された喜びは二倍の喜びです",
      "author": "作者不詳",
      "explanation": "「共有された喜びは二倍の喜び」って言ってた人がいてだな、家族と一緒に楽しいことを体験すると、一人で体験するより何倍も楽しいって意味なんだ。今日の楽しさも、みんなで分け合うともっと大きくなるね！"
    },
    {
      "scene": "自然との触れ合い",
      "category": "自然体験",
      "situation": "自然の中で遊ぶ時",
      "quote": "一日の終わりに、あなたの足は汚れ、髪はぼさぼさで、目は輝いているべきです",
      "author": "シャンティ",
      "explanation": "シャンティっていう人が「一日の終わりに、足は汚れ、髪はぼさぼさで、目は輝いているべき」って言ってた人がいてだな、たくさん遊んで、ちょっと汚れても、目がキラキラしているのが一番良い一日の過ごし方だって意味なんだ。今日もいっぱい遊ぼうね！"
    },
    {
      "scene": "自然との触れ合い",
      "category": "自然体験",
      "situation": "自然の教え",
      "quote": "自然は最高の教師です",
      "author": "作者不詳",
      "explanation": "「自然は最高の教師」って言ってた人がいてだな、自然の中では、どんな学校よりも多くのことを学ぶことができるって意味なんだ。木や花、空や海から、たくさんの大切なことを教えてもらおうね！"
    }
  ]
};

// DOM要素の取得
const sceneButtons = document.querySelectorAll('.btn--scene');
const quoteCard = document.getElementById('quoteCard');
const quoteScene = document.getElementById('quoteScene');
const quoteText = document.getElementById('quoteText');
const quoteAuthor = document.getElementById('quoteAuthor');
const quoteExplanation = document.getElementById('quoteExplanation');

// カテゴリ別の使用済み名言のインデックスを追跡
let usedQuotesByCategory = {};
let currentCategory = null;

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
  if (!currentCategory) {
    return;
  }
  const randomQuote = getRandomQuoteByCategory(currentCategory);
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
      const randomQuote = getRandomQuoteByCategory(category);
      if (randomQuote) {
        displayQuote(randomQuote);
      }
    }, 150);
  });
});

// 画面端のタップで次の名言を表示（スワイプは除外）
let touchStartX = 0;
let touchMoved = false;
const swipeThreshold = 30;
const edgeOffset = 50;

document.addEventListener('touchstart', e => {
  touchStartX = e.touches[0].clientX;
  touchMoved = false;
});

document.addEventListener('touchmove', e => {
  const moveX = e.touches[0].clientX;
  if (Math.abs(moveX - touchStartX) > swipeThreshold) {
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
  if (x < edgeOffset || x > width - edgeOffset) {
    showNextQuote();
  }
});

// 初期化
document.addEventListener('DOMContentLoaded', () => {
  console.log('旅の言葉アプリが読み込まれました！');
  console.log(`${quotesData.quotes.length}個の名言が利用可能です。`);
  console.log(`${sceneButtons.length}個のボタンが見つかりました。`);
  
  // カテゴリ別の名言数をログ出力
  const categoryCounts = {};
  quotesData.quotes.forEach(quote => {
    categoryCounts[quote.category] = (categoryCounts[quote.category] || 0) + 1;
  });
  console.log('カテゴリ別名言数:', categoryCounts);
});