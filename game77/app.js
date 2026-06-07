/* ==========================================================================
   Gear: Waka-Zen - 爆速カード巡回エンジン コアロジック
   ========================================================================== */

// 状態管理オブジェクト
const state = {
  allData: [],          // 全百人一首データ (data.js から読み込まれる)
  dataSource: [],       // フィルタリング・シャッフル済みの現在のアクティブデータ配列
  currentIndex: 0,      // 現在表示中のインデックス (0 <= index < dataSource.length)
  currentFace: 'front', // 現在表示中のカード面 ('front' | 'back')
  targetFPS: 24,        // 長押し時の自動再生FPS
  isLongPressing: false,// 現在長押し中かどうかのフラグ
  activeFilter: 'all',  // 現在のフィルターカテゴリ
  volume: 0.5,          // 効果音量 (0.0 ~ 1.0)
  audioEnabled: true    // 効果音の有効フラグ
};

// DOMキャッシュ
const dom = {
  viewport: null,
  progressBar: null,
  fpsSelector: null,
  audioToggleBtn: null,
  audioIconOn: null,
  audioIconOff: null,
  volumeSlider: null,
  shuffleBtn: null,
  filterTabs: null,
  helpBtn: null,
  helpModal: null,
  closeHelpBtn: null,
  triggerOverlay: null,
  renderedCards: new Map() // インデックス -> Card DOM 要素のマップ (DOMリサイクリング用)
};

// Web Audio API 関連
let audioCtx = null;

/**
 * Web Audio API の初期化 (最初のインタラクションで実行)
 */
function initAudio() {
  if (audioCtx) return;
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContextClass();
  } catch (e) {
    console.warn("Web Audio API is not supported in this browser.", e);
  }
}

/**
 * 拍子木・そろばんの玉を模した極小「カチッ」音の合成
 */
function playClickSound() {
  if (!state.audioEnabled || !audioCtx) return;
  
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  const now = audioCtx.currentTime;
  
  const osc = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  osc.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  osc.type = 'triangle';
  
  osc.frequency.setValueAtTime(1200, now);
  osc.frequency.exponentialRampToValueAtTime(600, now + 0.012);

  gainNode.gain.setValueAtTime(state.volume * 0.8, now);
  gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.012);

  osc.start(now);
  osc.stop(now + 0.015);
}

/**
 * カード反転時の「シュッ」という風切り音（エアースワイプ音）の合成
 */
function playFlipSound() {
  if (!state.audioEnabled || !audioCtx) return;
  
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const filter = audioCtx.createBiquadFilter();
  const gainNode = audioCtx.createGain();

  osc.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  osc.type = 'sine';
  osc.frequency.setValueAtTime(150, now);
  osc.frequency.exponentialRampToValueAtTime(600, now + 0.12);
  osc.frequency.exponentialRampToValueAtTime(100, now + 0.25);

  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(400, now);
  filter.Q.setValueAtTime(3, now);

  gainNode.gain.setValueAtTime(0.001, now);
  gainNode.gain.linearRampToValueAtTime(state.volume * 0.4, now + 0.06);
  gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

  osc.start(now);
  osc.stop(now + 0.27);
}

// --------------------------------------------------------------------------
// コア・エンジン処理 (仮想ウィンドウ方式 DOMリサイクリング)
// --------------------------------------------------------------------------

/**
 * 歌データからHTMLカード要素を生成するテンプレート関数
 */
function createCardDOM(waka) {
  const card = document.createElement('div');
  card.className = 'waka-card';
  card.id = `card-${waka.id}`;
  
  // 上の句を句切れ（スペース）で分割し、それぞれ span で囲む
  const kamiSpans = waka.content.kamiNoKu.split(' ')
    .map(clause => `<span>${clause}</span>`).join('');
    
  // 下の句を句切れ（スペース）で分割し、それぞれ span で囲む
  const shimoSpans = waka.content.shimoNoKu.split(' ')
    .map(clause => `<span>${clause}</span>`).join('');
  
  card.innerHTML = `
    <!-- カード表面（上の句） -->
    <div class="card-face card-front">
      <div class="waka-id">第 ${waka.id} 首</div>
      <div class="waka-text-container">
        <div class="waka-kami-wrapper">
          <div class="waka-kami-no-ku">
            ${kamiSpans}
            <span class="waka-poet-signature">${waka.poet}</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- カード裏面（解説・上の句＋下の句併記） -->
    <div class="card-face card-back">
      <div class="back-header">
        <div class="back-poet">${waka.poet}</div>
        <div class="back-season-tag">${waka.metadata.season}</div>
      </div>
      <div class="back-main-layout">
        <!-- 裏面和歌全体表示ゾーン（縦書き） -->
        <div class="back-waka-full-container">
          <div class="back-waka-full">
            <div class="back-waka-kami">${kamiSpans}</div>
            <div class="back-waka-shimo">${shimoSpans}</div>
          </div>
        </div>
        <!-- 横書きの解説ゾーン -->
        <div class="back-explanation-box">
          <!-- AIプロンプトコピーボタン -->
          <button class="prompt-copy-btn" onclick="copyAIPrompt(${waka.id})">
            <svg viewBox="0 0 24 24" width="16" height="16"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" fill="currentColor"/></svg>
            <span>AI解説プロンプトをコピー</span>
          </button>
          
          <div class="back-content-item">
            <div class="back-label">現代語訳</div>
            <div class="back-translation">${waka.content.translation}</div>
          </div>
          <div class="back-content-item">
            <div class="back-label">鑑賞</div>
            <div class="back-note">${waka.content.note}</div>
          </div>
        </div>
      </div>
    </div>
  `;
  
  return card;
}

/**
 * 仮想ウィンドウ [Current - 1] 〜 [Current + 2] を計算し、DOMを再配置・破棄する
 */
function updateMemoryWindow() {
  if (state.dataSource.length === 0) {
    dom.viewport.innerHTML = '<div class="no-data">該当する和歌がありません</div>';
    return;
  }

  const curr = state.currentIndex;
  const N = state.dataSource.length;
  
  const wrap = (idx) => (idx + N) % N;

  const activeIndices = new Map([
    [wrap(curr - 1), 'state-prev-1'],
    [wrap(curr),     'state-current'],
    [wrap(wrap(curr + 1)), 'state-next-1'],
    [wrap(wrap(curr + 2)), 'state-next-2']
  ]);

  // 1. アクティブ範囲外で現在レンダリングされているカードを破棄
  for (const [index, cardElement] of dom.renderedCards.entries()) {
    if (!activeIndices.has(index)) {
      cardElement.remove();
      dom.renderedCards.delete(index);
    }
  }

  // 2. アクティブ範囲内のカードについてマウントおよびクラス更新を行う
  activeIndices.forEach((stateClass, index) => {
    let cardElement = dom.renderedCards.get(index);
    
    if (!cardElement) {
      const waka = state.dataSource[index];
      cardElement = createCardDOM(waka);
      dom.viewport.appendChild(cardElement);
      dom.renderedCards.set(index, cardElement);
    }
    
    cardElement.className = 'waka-card';
    cardElement.classList.add(stateClass);
    
    // カレントカードは面状態を反映し、それ以外はフリップを解除して表面にしておく
    if (stateClass === 'state-current') {
      cardElement.classList.toggle('flipped', state.currentFace === 'back');
    } else {
      cardElement.classList.remove('flipped');
    }
  });

  updateProgressBar();
}

/**
 * 段階的カードめくり (上の句 → 下の句 → 次の上の句 / または逆順)
 * @param {'NEXT' | 'PREV'} direction
 */
function stepCard(direction) {
  if (state.dataSource.length === 0) return;

  const N = state.dataSource.length;
  let indexChanged = false;
  let playSoundFn = playFlipSound; // デフォルトはフリップ音

  if (direction === 'NEXT') {
    if (state.currentFace === 'front') {
      // 表(上の句) -> 裏(下の句)
      state.currentFace = 'back';
    } else {
      // 裏(下の句) -> 次の歌の表(上の句)
      state.currentFace = 'front';
      state.currentIndex = (state.currentIndex + 1) % N;
      indexChanged = true;
      playSoundFn = playClickSound; // 歌が変わるときは木製クリック音
    }
  } else { // 'PREV'
    if (state.currentFace === 'back') {
      // 裏(下の句) -> 表(上の句)
      state.currentFace = 'front';
    } else {
      // 表(上の句) -> 前の歌の裏(下の句)
      state.currentFace = 'back';
      state.currentIndex = (state.currentIndex - 1 + N) % N;
      indexChanged = true;
      playSoundFn = playClickSound; // 歌が変わるときは木製クリック音
    }
  }

  // 1. 背景色の更新 (歌が変わったときだけ瞬時に反映)
  if (indexChanged) {
    const activeWaka = state.dataSource[state.currentIndex];
    document.body.style.backgroundColor = activeWaka.metadata.color;
  }

  // 2. 音響再生
  playSoundFn();

  // 3. メモリ管理ウィンドウの更新
  updateMemoryWindow();
}

/**
 * プログレス表示の更新
 */
function updateProgressBar() {
  if (state.dataSource.length === 0) {
    dom.progressBar.style.width = '0%';
    return;
  }
  const currentNum = state.currentIndex + 1;
  const totalNum = state.dataSource.length;
  const percentage = (currentNum / totalNum) * 100;
  
  dom.progressBar.style.width = `${percentage}%`;
}

// --------------------------------------------------------------------------
// 長押し自動巡回エンジン (requestAnimationFrame ベース)
// --------------------------------------------------------------------------

let autoPlayTimer = null; // 長押し判定タイマー
let lastFrameTime = 0;    // 前回フレームの実行時間
let animationFrameId = null;

/**
 * 自動巡回ループの開始
 */
function startAutoPlay(direction) {
  state.isLongPressing = true;
  document.body.classList.add('fast-mode'); // 背景トランジションを即座にカット

  const interval = 1000 / state.targetFPS;
  lastFrameTime = performance.now();

  function loop(time) {
    if (!state.isLongPressing) return;

    const delta = time - lastFrameTime;
    if (delta >= interval) {
      stepCard(direction);
      lastFrameTime = time - (delta % interval);
    }
    animationFrameId = requestAnimationFrame(loop);
  }
  animationFrameId = requestAnimationFrame(loop);
}

/**
 * 自動巡回ループの停止
 */
function stopAutoPlay() {
  clearTimeout(autoPlayTimer);
  state.isLongPressing = false;
  document.body.classList.remove('fast-mode');
  
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
}

// --------------------------------------------------------------------------
// フィルター・シャッフル
// --------------------------------------------------------------------------

/**
 * カテゴリフィルタの適用
 */
function applyFilter(category) {
  state.activeFilter = category;
  
  if (category === 'all') {
    state.dataSource = [...state.allData];
  } else {
    state.dataSource = state.allData.filter(waka => waka.tags.includes(category));
  }
  
  state.currentIndex = 0;
  state.currentFace = 'front';
  
  // ビューポート内のDOMキャッシュを全クリアして再構築
  dom.viewport.innerHTML = '';
  dom.renderedCards.clear();

  if (state.dataSource.length > 0) {
    const activeWaka = state.dataSource[0];
    document.body.style.backgroundColor = activeWaka.metadata.color;
  }

  updateMemoryWindow();
}

/**
 * データのシャッフル (フィッシャー・イェーツ)
 */
function shuffleData() {
  const arr = [...state.dataSource];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  state.dataSource = arr;
  state.currentIndex = 0;
  state.currentFace = 'front';

  dom.viewport.innerHTML = '';
  dom.renderedCards.clear();
  
  if (state.dataSource.length > 0) {
    document.body.style.backgroundColor = state.dataSource[0].metadata.color;
  }
  
  playClickSound();
  updateMemoryWindow();
}

// --------------------------------------------------------------------------
// インタラクション & エフェクト (Ripple)
// --------------------------------------------------------------------------

/**
 * タップエリアに和風波紋(Ripple)エフェクトを展開
 */
function createRipple(e, zone) {
  if (state.isLongPressing) return;

  const rect = zone.getBoundingClientRect();
  const circle = document.createElement('span');
  const diameter = Math.max(rect.width, rect.height);
  const radius = diameter / 2;

  circle.style.width = circle.style.height = `${diameter}px`;
  
  const clientX = e.clientX || (e.touches && e.touches[0].clientX);
  const clientY = e.clientY || (e.touches && e.touches[0].clientY);

  circle.style.left = `${clientX - rect.left - radius}px`;
  circle.style.top = `${clientY - rect.top - radius}px`;
  circle.className = 'ripple';

  const oldRipple = zone.querySelector('.ripple');
  if (oldRipple) oldRipple.remove();

  zone.appendChild(circle);
}

// --------------------------------------------------------------------------
// イベントリスナーのセットアップ
// --------------------------------------------------------------------------

function setupEventListeners() {
  // 1. トリガーゾーン操作 (画面オーバーレイ) - 左右の2分割に変更
  const triggers = [
    { el: document.getElementById('triggerPrev'), action: 'PREV' },
    { el: document.getElementById('triggerNext'), action: 'NEXT' }
  ];

  triggers.forEach(({ el, action }) => {
    if (!el) return;

    el.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      initAudio(); // 最初のタップでAudioをアクティブ化
      createRipple(e, el);

      // 即座に1ステップ切り替え（上の句→下の句→次の上の句）
      stepCard(action);

      // 200ms以上押し続けたら自動巡回開始
      clearTimeout(autoPlayTimer);
      autoPlayTimer = setTimeout(() => {
        startAutoPlay(action);
      }, 200);
    });

    const cancelPress = () => {
      stopAutoPlay();
    };
    
    el.addEventListener('pointerup', cancelPress);
    el.addEventListener('pointercancel', cancelPress);
    el.addEventListener('pointerleave', cancelPress);
    
    el.addEventListener('touchstart', (e) => e.preventDefault(), { passive: false });
  });

  // 2. キーボード操作サポート (PC用)
  document.addEventListener('keydown', (e) => {
    if (dom.helpModal.classList.contains('open')) return;

    if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      stepCard('NEXT');
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      stepCard('PREV');
    }
  });

  // 3. 設定コントローラーのハンドリング
  dom.fpsSelector.addEventListener('change', (e) => {
    state.targetFPS = parseInt(e.target.value);
  });

  dom.audioToggleBtn.addEventListener('click', () => {
    initAudio();
    state.audioEnabled = !state.audioEnabled;
    dom.audioToggleBtn.classList.toggle('active', state.audioEnabled);
    if (state.audioEnabled) {
      dom.audioIconOn.style.display = 'block';
      dom.audioIconOff.style.display = 'none';
      playClickSound();
    } else {
      dom.audioIconOn.style.display = 'none';
      dom.audioIconOff.style.display = 'block';
    }
  });

  dom.volumeSlider.addEventListener('input', (e) => {
    state.volume = parseFloat(e.target.value);
  });

  dom.shuffleBtn.addEventListener('click', () => {
    shuffleData();
  });

  // フィルタータブ切り替え
  dom.filterTabs.addEventListener('click', (e) => {
    const btn = e.target.closest('.tab-btn');
    if (!btn) return;
    
    dom.filterTabs.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    applyFilter(btn.dataset.filter);
  });

  // 4. ヘルプモーダル関連
  dom.helpBtn.addEventListener('click', () => {
    dom.helpModal.classList.add('open');
  });

  const closeHelp = () => {
    dom.helpModal.classList.remove('open');
    initAudio();
  };
  
  dom.closeHelpBtn.addEventListener('click', closeHelp);
  dom.helpModal.addEventListener('click', (e) => {
    if (e.target === dom.helpModal) closeHelp();
  });
}

// --------------------------------------------------------------------------
// アプリケーション起動
// --------------------------------------------------------------------------

function initApp() {
  dom.viewport = document.getElementById('cardViewport');
  dom.progressBar = document.getElementById('progressBar');
  dom.fpsSelector = document.getElementById('fpsSelector');
  dom.audioToggleBtn = document.getElementById('audioToggleBtn');
  dom.audioIconOn = document.getElementById('audioIconOn');
  dom.audioIconOff = document.getElementById('audioIconOff');
  dom.volumeSlider = document.getElementById('volumeSlider');
  dom.shuffleBtn = document.getElementById('shuffleBtn');
  dom.filterTabs = document.getElementById('filterTabs');
  dom.helpBtn = document.getElementById('helpBtn');
  dom.helpModal = document.getElementById('helpModal');
  dom.closeHelpBtn = document.getElementById('closeHelpBtn');
  dom.triggerOverlay = document.getElementById('triggerOverlay');

  state.allData = window.wakaData || [];
  state.dataSource = [...state.allData];

  setupEventListeners();

  if (state.dataSource.length > 0) {
    document.body.style.backgroundColor = state.dataSource[0].metadata.color;
    updateMemoryWindow();
  }

  dom.helpModal.classList.add('open');
}

window.addEventListener('DOMContentLoaded', initApp);

// --------------------------------------------------------------------------
// AI解説プロンプトコピー機能
// --------------------------------------------------------------------------
window.copyAIPrompt = function(wakaId) {
  const waka = state.dataSource.find(w => w.id === wakaId);
  if (!waka) return;

  const promptText = `あなたは優れた古典文学の専門家・教育者です。以下の百人一首の一首について、古典の面白さや奥深さに高校生が惹き込まれるような、情緒豊かで知的好奇心を刺激する解説を作成してください。

---
【対象の和歌】
作者：${waka.poet}
上の句：${waka.content.kamiNoKu}
下の句：${waka.content.shimoNoKu}
---

【解説の要件】
以下の4つのセクションに分けて、高校生向けにわかりやすく、かつストーリー仕立ての魅力的なトーンで説明してください。専門用語には簡単な補足を入れ、現代の言葉や感覚に例えながら解説してください。

1. 情緒豊かな解説（情景と心の解剖）
   - この歌が描いているビジュアル（色彩、音、季節の空気感、光と影のコントラスト）を、目の前に浮かぶように鮮やかに描写してください。
   - 詠み人がどのような感情（恋の葛藤、無常観、孤独、あるいは秘めたプライド）をこの三十一文字に込めたのか、現代の若者でも共感できる人間味あふれるアプローチで説明してください。

2. この歌の成立背景・歴史的ドラマ
   - この歌がいつ、どこで、どのような状況（歌合での対決、旅先での孤独、あるいは権力闘争や恋愛関係）で詠まれたのか、その背景にある人間ドラマや歴史的エピソードを教えてください。

3. 後世への引用と影響（カルチャー調査）
   - この歌が、後世の文学作品（本歌取りの例など）や、現代のポップカルチャー（漫画・アニメ・ゲーム・映画など）においてどのように引用・オマージュされ、愛され続けているか、具体的な調査結果を提示してください（例：アニメ『ちはやふる』での象徴的な意味や、キャラクターの心情とのリンクなど）。

4. 知っていると自慢できる「古典の裏トリビア」
   - この歌に使われている掛詞や修辞技法（序詞、枕詞、縁語など）のパズル的な妙技、あるいは作者にまつわる意外なエピソードを1つ紹介してください。`;

  navigator.clipboard.writeText(promptText).then(() => {
    // コピー成功時、スワイプ音を再生して感覚的な完了をサポート
    playFlipSound();

    const btn = document.querySelector(`#card-${wakaId} .prompt-copy-btn`);
    if (btn) {
      const originalHTML = btn.innerHTML;
      btn.classList.add('copied');
      btn.innerHTML = `
        <svg viewBox="0 0 24 24" width="16" height="16"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="currentColor"/></svg>
        <span>コピーしました！</span>
      `;
      setTimeout(() => {
        btn.classList.remove('copied');
        btn.innerHTML = originalHTML;
      }, 1500);
    }
  }).catch(err => {
    console.error("Failed to copy prompt:", err);
  });
};
