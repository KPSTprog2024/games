let quotesLoaded = false;

// ====================== 基本DOM参照 ======================
const sceneButtons = document.querySelectorAll('.btn--scene');
const quoteCard = document.getElementById('quoteCard');
const quoteScene = document.getElementById('quoteScene');
const quoteOriginal = document.getElementById('quoteOriginal');
const quoteTranslit = document.getElementById('quoteTranslit');
const quoteText = document.getElementById('quoteText');
const quoteAuthor = document.getElementById('quoteAuthor');
const quoteExplanation = document.getElementById('quoteExplanation');
const badgeVerification = document.getElementById('badgeVerification');
const badgeAttributed = document.getElementById('badgeAttributed');
const badgeMisattr = document.getElementById('badgeMisattr');
const quoteWork = document.getElementById('quoteWork');
const quotePeriod = document.getElementById('quotePeriod');
const quoteSourceUrl = document.getElementById('quoteSourceUrl');
const langSelect = document.getElementById('langSelect');
const toggleRtlBtn = document.getElementById('toggleRtl');

// ====================== 状態管理 ======================
let currentCategory = null;
let allQuotes = [];         // 統合配列（packs or legacy）
let byId = new Map();       // id -> quote
let manifest = null;

const queues = {            // 事前シャッフル＋ポインタ
  all: { ids: [], cursor: 0 },
  byCategory: new Map()     // category -> { ids: [], cursor: 0 }
};

// ====================== ユーティリティ ======================
function shuffle(arr) { // Fisher–Yates
  for (let i = arr.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

function inferDirFromLang(lang) {
  return /^(ar|he|fa|ur)(-|$)/.test(lang || '') ? 'rtl' : 'auto';
}

function toggleBadges(status) {
  badgeVerification.hidden = badgeAttributed.hidden = badgeMisattr.hidden = true;
  if (status === 'verified') badgeVerification.hidden = false;
  else if (status === 'misattributed') badgeMisattr.hidden = false;
  else badgeAttributed.hidden = false; // attributed/unknown
}

function buildQueues(quotes) {
  const idsAll = quotes.map(q => q.id);
  shuffle(idsAll);
  queues.all = { ids: idsAll, cursor: 0 };
  const buckets = new Map();
  for (const q of quotes) {
    if (!buckets.has(q.category)) buckets.set(q.category, []);
    buckets.get(q.category).push(q.id);
  }
  for (const [cat, arr] of buckets.entries()) {
    shuffle(arr);
    queues.byCategory.set(cat, { ids: arr, cursor: 0 });
  }
}

function nextIdFrom(queue) {
  if (!queue || queue.ids.length === 0) return null;
  const id = queue.ids[queue.cursor++];
  if (queue.cursor >= queue.ids.length) queue.cursor = 0; // 使い切ったらループ
  return id;
}

// ====================== レンダリング ======================
function renderQuote(q, mode = (langSelect?.value || 'both')) {
  if (!q) return;

  // シーン
  quoteScene.textContent = q.scene || '';

  // 原文
  const showOriginal = (mode === 'both' || mode === 'original');
  const showJa = (mode === 'both' || mode === 'ja');

  quoteOriginal.lang = q.quote_lang || '';
  const autoDir = inferDirFromLang(q.quote_lang);
  if (quoteOriginal.dataset.forced !== '1') quoteOriginal.setAttribute('dir', autoDir);
  quoteOriginal.textContent = q.quote_original || '';
  quoteOriginal.style.display = showOriginal && q.quote_original ? '' : 'none';

  // 転写
  if (q.quote_transliteration) {
    quoteTranslit.textContent = q.quote_transliteration;
    quoteTranslit.hidden = false;
  } else {
    quoteTranslit.hidden = true;
  }

  // 日本語訳（従来のquoteをここに収める）
  quoteText.textContent = q.quote_translation_ja || q.quote || '';
  quoteText.style.display = showJa ? '' : 'none';

  // 著者・出典
  quoteAuthor.textContent = q.author_name || q.author || '';
  quoteWork.textContent = q.work_title ? `『${q.work_title}』` : '';
  quotePeriod.textContent = q.period ? ` / ${q.period}` : '';
  if (q.source_url) {
    quoteSourceUrl.href = q.source_url;
    quoteSourceUrl.hidden = false;
  } else {
    quoteSourceUrl.hidden = true;
  }

  // 検証バッジ
  toggleBadges(q.verification_status || 'unknown');

  // 説明
  quoteExplanation.textContent = q.explanation || '';

  // 表示アニメーション
  quoteCard.classList.remove('hidden');
  quoteCard.classList.remove('show');
  setTimeout(() => quoteCard.classList.add('show'), 50);
}

// ====================== データ読み込み（packs or legacy） ======================
async function fetchJson(url, quiet = false) {
  try {
    const r = await fetch(url, { cache: 'force-cache' });
    if (!r.ok) throw new Error(`${url} ${r.status}`);
    return await r.json();
  } catch (err) {
    console.error(err);
    if (!quiet) alert('データを読み込めませんでした');
    throw err;
  }
}

async function loadManifest() {
  try {
    manifest = await fetchJson('data/manifest.json', true);
    return manifest;
  } catch {
    return null; // 無ければレガシーへ
  }
}

async function loadPack(relPath) {
  const data = await fetchJson(`data/${relPath}`, true);
  const quotes = Array.isArray(data) ? data : data.quotes;
  for (const q of quotes) {
    byId.set(q.id, q);
  }
  allQuotes.push(...quotes);
}

function legacyToNewSchema(legacy) {
  // quotes.json -> ja-core形式へ（id自動割当）
  return legacy.quotes.map((q, i) => ({
    id: `ja-core-${String(i + 1).padStart(4, '0')}`,
    scene: q.scene,
    category: q.category,
    situation: q.situation,
    quote_original: q.quote,          // 日本語原文を原文欄に
    quote_lang: 'ja',
    quote_script: 'Jpan',
    quote_transliteration: null,
    quote_translation_ja: q.quote,    // 表示互換のため同値を入れておく
    author_name: q.author,
    author_lifespan: null,
    work_title: null,
    work_year: null,
    culture_region: 'Asia/Japan',
    period: 'proverb_or_modern',      // 仮
    verification_status: 'unknown',
    source_type: 'tertiary',
    source_url: null,
    explanation: q.explanation
  }));
}

async function bootstrap(lang = 'ja') {
  try {
    const mf = await loadManifest();
    if (mf && Array.isArray(mf.packs)) {
      // マニフェストがある：言語＋group=core優先でロード
      const initial = mf.packs.filter(p => p.lang === lang && p.group === 'core');
      if (initial.length === 0) {
        // 何もなければ全言語から最初の1パック
        if (mf.packs[0]) initial.push(mf.packs[0]);
      }
      for (const p of initial) await loadPack(p.path);
    } else {
      // フォールバック：従来 quotes.json を読む
      const legacy = await fetchJson('./quotes.json', true);
      const converted = legacyToNewSchema(legacy);
      allQuotes = converted;
      for (const q of converted) byId.set(q.id, q);
    }
    buildQueues(allQuotes);
    quotesLoaded = true;
    console.log(`Loaded ${allQuotes.length} quotes.`);
    quotesLoaded = true;
    sceneButtons.forEach(btn => btn.disabled = false);
    return true;
  } catch (err) {
    console.error(err);
    sceneButtons.forEach(btn => btn.disabled = true);
    quotesLoaded = false;
    let errorEl = document.getElementById('loadError');
    if (!errorEl) {
      errorEl = document.createElement('div');
      errorEl.id = 'loadError';
      errorEl.innerHTML = `
        <p>データを読み込めませんでした</p>
        <button id="retryBootstrap" class="btn btn--outline" type="button">再読み込み</button>
      `;
      document.body.appendChild(errorEl);
      const retryBtn = document.getElementById('retryBootstrap');
      retryBtn.addEventListener('click', async () => {
        const success = await bootstrap(lang);
        if (success) errorEl.remove();
      });
    }
    return false;
  }

}

// ====================== 取得＆表示 ======================
function pickNextQuote() {
  if (!currentCategory) return null;
  if (currentCategory === 'all') {
    const id = nextIdFrom(queues.all);
    return byId.get(id);
  } else {
    const bucket = queues.byCategory.get(currentCategory);
    const id = nextIdFrom(bucket || { ids: [], cursor: 0 });
    return byId.get(id);
  }
}

function showNextQuote() {
  const q = pickNextQuote();
  if (q) renderQuote(q);
}

// ====================== 入力系（クリック・スワイプ等） ======================
function pulseButton(button) {
  button.classList.add('pulse');
  setTimeout(() => button.classList.remove('pulse'), 300);
}

sceneButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    if (!quotesLoaded) {
      alert('読み込み中です…');
      return;
    }
    currentCategory = btn.getAttribute('data-category');
    pulseButton(btn);
    setTimeout(showNextQuote, 150);
  });
});

let swipeStartX = 0;
quoteCard.addEventListener('touchstart', e => { swipeStartX = e.touches[0].clientX; });
quoteCard.addEventListener('touchend', e => {
  const swipeDistance = e.changedTouches[0].clientX - swipeStartX;
  if (Math.abs(swipeDistance) > 50) showNextQuote();
});

let tapStartX = 0, touchMoved = false;
const swipeThreshold = 30, edgeOffset = 50;
document.addEventListener('touchstart', e => { tapStartX = e.touches[0].clientX; touchMoved = false; });
document.addEventListener('touchmove', e => { if (Math.abs(e.touches[0].clientX - tapStartX) > swipeThreshold) touchMoved = true; });
document.addEventListener('touchend', e => {
  if (touchMoved) return;
  const x = e.changedTouches[0].clientX, w = window.innerWidth;
  if (x < edgeOffset || x > w - edgeOffset) showNextQuote();
});
document.addEventListener('click', e => {
  if (e.target.closest('.btn--scene')) return;
  const x = e.clientX, w = window.innerWidth;
  if (x < edgeOffset || x > w - edgeOffset) showNextQuote();
});

// 表示モード変更
langSelect?.addEventListener('change', () => {
  // 現在表示中を再レンダリング（カテゴリが選ばれていれば次を出す）
  showNextQuote();
});

// RTL強制トグル
toggleRtlBtn?.addEventListener('click', () => {
  const forced = quoteOriginal.dataset.forced === '1';
  if (forced) {
    quoteOriginal.dataset.forced = '0';
    quoteOriginal.setAttribute('dir', 'auto');
    toggleRtlBtn.setAttribute('aria-pressed', 'false');
  } else {
    quoteOriginal.dataset.forced = '1';
    quoteOriginal.setAttribute('dir', 'rtl');
    toggleRtlBtn.setAttribute('aria-pressed', 'true');
  }
});

// ====================== 初期化 ======================
document.addEventListener('DOMContentLoaded', async () => {
  await bootstrap('ja');
  console.log('旅の言葉アプリ：初期化完了');
});
