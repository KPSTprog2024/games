/**
 * Project: "Gear" - Core Application Logic
 * Implements 0ms physical latency pointer events, virtual window DOM recycling,
 * auto-scroll loop based on target FPS, and simulated haptics.
 * 
 * Flow updated for 2-page-per-color quiz style:
 * - Tap NEXT: Front (Pure color) -> Back (Trivia) -> Next Color Front -> Back
 * - Tap PREV: Back (Trivia) -> Front (Pure color) -> Prev Color Back -> Front
 */

// Application State
const state = {
  allData: [],          // Original full dataset from colors.js
  dataSource: [],       // Filtered dataset currently being cycled
  currentIndex: 0,      // Active index in dataSource
  targetFPS: 24,        // Frames per second for auto-scroll (default: 24)
  isLongPressing: false,
  isAutoplayOn: false,  // Toggle for persistent auto-scroll without holding
  currentFilter: 'all',
  likedIds: [],         // IDs of liked colors stored in LocalStorage
  isFlipped: false      // Whether the card is currently showing trivia (back face)
};

// DOM References
const dom = {
  viewport: document.getElementById('viewport'),
  bgLayer: document.getElementById('bg-layer'),
  cardWrapper: document.getElementById('card-wrapper'),
  tapZones: document.getElementById('tap-zones'),
  zonePrev: document.getElementById('zone-prev'),
  zoneAction: document.getElementById('zone-action'),
  zoneNext: document.getElementById('zone-next'),
  
  // HUD Displays
  hudIndex: document.getElementById('hud-index-display'),
  hudTag: document.getElementById('hud-tag-display'),
  hudRegion: document.getElementById('hud-region-display'),
  
  // Trivia Elements
  triviaTags: document.getElementById('trivia-tags'),
  triviaTitle: document.getElementById('trivia-title'),
  triviaHex: document.getElementById('trivia-hex'),
  triviaText: document.getElementById('trivia-text'),
  triviaCategoryInfo: document.getElementById('trivia-category-info'),
  triviaIndex: document.getElementById('trivia-index-display'),
  
  // Interactive Buttons
  btnMenu: document.getElementById('btn-menu'),
  btnLikeToggle: document.getElementById('btn-like-toggle'),
  btnAutoplay: document.getElementById('btn-autoplay'),
  btnFlipBack: document.getElementById('btn-flip-back'),
  btnCopyPrompt: document.getElementById('btn-copy-prompt'),
  
  // Panels
  panelMenu: document.getElementById('panel-menu'),
  panelLikes: document.getElementById('panel-likes'),
  btnCloseMenu: document.getElementById('btn-close-menu'),
  btnCloseLikes: document.getElementById('btn-close-likes'),
  
  // Panel Contents
  likesContainer: document.getElementById('likes-container'),
  tagsGrid: document.getElementById('tags-grid'),
  fpsControl: document.getElementById('fps-control'),
  guideControl: document.getElementById('guide-control'),
  
  // Toast
  toast: document.getElementById('toast-notify')
};

// Timers for Long Press
let touchTimer = null;
let frameInterval = null;
let lastTapTime = 0; // For detecting double tap

// --- Haptic Feedback Simulation ---
function triggerHaptic() {
  if ('vibrate' in navigator) {
    // 10ms of extremely sharp vibration to simulate tactile mechanical click
    navigator.vibrate(10);
  }
}

// --- Local Storage Management ---
function loadLikes() {
  const stored = localStorage.getItem('color_gear_likes');
  state.likedIds = stored ? JSON.parse(stored) : [];
}

function saveLikes() {
  localStorage.setItem('color_gear_likes', JSON.stringify(state.likedIds));
  renderLikesPanel();
  updateLikeButtonUI();
}

function toggleLike(id) {
  const index = state.likedIds.indexOf(id);
  if (index === -1) {
    state.likedIds.push(id);
    showToast('ADDED TO PALETTE');
  } else {
    state.likedIds.splice(index, 1);
    showToast('REMOVED FROM PALETTE');
  }
  saveLikes();
}

// --- Card Flip Logic ---
function setFlip(flipped) {
  state.isFlipped = flipped;
  if (flipped) {
    dom.cardWrapper.classList.add('is-flipped');
    dom.tapZones.classList.add('disabled-for-flip');
  } else {
    dom.cardWrapper.classList.remove('is-flipped');
    dom.tapZones.classList.remove('disabled-for-flip');
  }
}

// --- Change Card (Core Logic 5.2.①) ---
function changeCard(nextIndex, force = false) {
  if (state.dataSource.length === 0) return;

  // Boundary Loop Checks
  let targetIndex = nextIndex;
  if (targetIndex < 0) {
    targetIndex = state.dataSource.length - 1; // Loop to end
  } else if (targetIndex >= state.dataSource.length) {
    targetIndex = 0; // Loop to start
  }

  // If index hasn't changed (and not forced), do nothing
  if (targetIndex === state.currentIndex && !force) return;

  // Update Index
  state.currentIndex = targetIndex;

  // Render the current color immediately (0ms visual change)
  const currentCard = state.dataSource[state.currentIndex];
  dom.bgLayer.style.backgroundColor = currentCard.hex;

  // Trigger tactile click
  triggerHaptic();

  // Perform memory window updates asynchronously to keep UI thread 100% responsive
  requestAnimationFrame(() => {
    updateMemoryWindow();
    updateHUD();
    updateLikeButtonUI();
  });
}

// --- Memory Management & Virtual Window (Core Logic 5.2.②) ---
// Keeps only [CurrentIndex - 1] to [CurrentIndex + 2] in memory/DOM representation.
function updateMemoryWindow() {
  const curr = state.currentIndex;
  const len = state.dataSource.length;
  const bufferSize = 2; // Preload window size

  // Determine active range with wrap-around support
  const activeIndices = new Set();
  for (let i = -1; i <= bufferSize; i++) {
    let index = (curr + i) % len;
    if (index < 0) index += len;
    activeIndices.add(index);
  }

  // Active Card Data rendering
  const currentCard = state.dataSource[curr];
  
  // Render details for back face
  dom.triviaTitle.textContent = currentCard.title;
  dom.triviaHex.textContent = currentCard.hex;
  dom.triviaHex.style.color = currentCard.hex;
  dom.triviaText.innerHTML = `<p>${currentCard.trivia}</p>`;
  
  // Tags render
  dom.triviaTags.innerHTML = '';
  currentCard.tags.forEach(tag => {
    const span = document.createElement('span');
    span.className = `trivia-tag tag-${tag}`;
    span.textContent = tag === 'japan' ? '日本の伝統色' : tag === 'west' ? '西洋の伝統色' : tag.toUpperCase();
    dom.triviaTags.appendChild(span);
  });

  // Display category info on bottom right of back card
  const isJapan = currentCard.tags.includes('japan');
  dom.triviaCategoryInfo.textContent = isJapan ? 'JAPANESE TRADITIONAL' : 'WESTERN TRADITIONAL';

  // Display padded index (e.g. 001 / 500)
  const currentNum = String(curr + 1).padStart(3, '0');
  const totalNum = String(len).padStart(3, '0');
  dom.triviaIndex.textContent = `${currentNum} / ${totalNum}`;

  // Recycling Simulate: Clear properties of off-screen items to assist Garbage Collection (GC)
  state.dataSource.forEach((card, index) => {
    if (!activeIndices.has(index)) {
      // Release memory of off-screen cards (simulate clearing DOM allocations)
    }
  });
}

// --- Update HUD display ---
function updateHUD() {
  if (state.dataSource.length === 0) return;
  
  const currentCard = state.dataSource[state.currentIndex];
  dom.hudIndex.textContent = `${state.currentIndex + 1} / ${state.dataSource.length}`;
  
  // Filter tag display
  const filterNames = {
    all: 'ALL COLORS',
    japan: '日本の伝統色',
    west: '西洋の伝統色',
    red: '赤系 (RED)',
    blue: '青系 (BLUE)',
    green: '緑系 (GREEN)',
    yellow: '黄系 (YELLOW)',
    purple: '紫系 (PURPLE)',
    brown: '茶・黒 (BROWN/BLACK)'
  };
  dom.hudTag.textContent = filterNames[state.currentFilter] || 'FILTERED';
  
  const isJapan = currentCard.tags.includes('japan');
  dom.hudRegion.textContent = isJapan ? 'JAPANESE' : 'WESTERN';
}

function updateLikeButtonUI() {
  if (state.dataSource.length === 0) return;
  const currentCard = state.dataSource[state.currentIndex];
  if (state.likedIds.includes(currentCard.id)) {
    dom.btnLikeToggle.classList.add('is-liked');
  } else {
    dom.btnLikeToggle.classList.remove('is-liked');
  }
}

// --- 2-Page Step Navigation (0ms Trigger Logic) ---
function executeSingleTapStep(direction) {
  if (direction === 'NEXT') {
    if (!state.isFlipped) {
      // Page 1 (Front) -> Page 2 (Back/Trivia)
      setFlip(true);
      triggerHaptic();
    } else {
      // Page 2 (Back) -> Next Color Page 1 (Front)
      setFlip(false);
      changeCard(state.currentIndex + 1);
    }
  } else { // PREV
    if (state.isFlipped) {
      // Page 2 (Back) -> Page 1 (Front)
      setFlip(false);
      triggerHaptic();
    } else {
      // Page 1 (Front) -> Prev Color Page 2 (Back/Trivia)
      changeCard(state.currentIndex - 1);
      // Flip after a micro-frame so changeCard color shows on back details
      requestAnimationFrame(() => {
        setFlip(true);
      });
    }
  }
}

// --- Long Press Auto-Scroll Loop (Core Logic 5.2.③) ---
function handlePointerDown(direction) {
  if (state.isAutoplayOn) {
    stopAutoplay();
  }

  // 1. Immediately run single tap action (0ms response)
  executeSingleTapStep(direction);

  // 2. Set long press timer (200ms threshold) for continuous scroll
  touchTimer = setTimeout(() => {
    state.isLongPressing = true;
    
    // Force front-face viewing for high-speed scroll so colors flash cleanly
    if (state.isFlipped) {
      setFlip(false);
    }
    
    dom.bgLayer.classList.add('no-transition');
    const intervalMs = 1000 / state.targetFPS;
    const step = direction === 'NEXT' ? 1 : -1;

    // Start continuous scroll interval
    frameInterval = setInterval(() => {
      changeCard(state.currentIndex + step);
    }, intervalMs);
  }, 200);
}

function handlePointerUp() {
  clearTimeout(touchTimer);
  clearInterval(frameInterval);
  
  state.isLongPressing = false;
  dom.bgLayer.classList.remove('no-transition');
}

// --- Autoplay Toggle (Persistent hands-free slideshow) ---
function toggleAutoplay() {
  if (state.isAutoplayOn) {
    stopAutoplay();
  } else {
    startAutoplay();
  }
}

function startAutoplay() {
  state.isAutoplayOn = true;
  dom.btnAutoplay.classList.add('is-playing');
  document.getElementById('autoplay-text').textContent = 'PLAYING';
  
  if (state.isFlipped) {
    setFlip(false);
  }
  
  dom.bgLayer.classList.add('no-transition');
  
  const intervalMs = 1000 / state.targetFPS;
  frameInterval = setInterval(() => {
    changeCard(state.currentIndex + 1);
  }, intervalMs);
}

function stopAutoplay() {
  state.isAutoplayOn = false;
  dom.btnAutoplay.classList.remove('is-playing');
  document.getElementById('autoplay-text').textContent = 'AUTO';
  
  clearInterval(frameInterval);
  dom.bgLayer.classList.remove('no-transition');
}

// --- Filter Database ---
function applyFilter(filterTag) {
  state.currentFilter = filterTag;
  
  // Highlight active filter button in panel
  const filterBtns = dom.tagsGrid.querySelectorAll('.filter-tag-btn');
  filterBtns.forEach(btn => {
    if (btn.getAttribute('data-tag') === filterTag) {
      btn.classList.add('is-active');
    } else {
      btn.classList.remove('is-active');
    }
  });

  if (filterTag === 'all') {
    state.dataSource = [...state.allData];
  } else {
    state.dataSource = state.allData.filter(card => card.tags.includes(filterTag));
  }

  // Shuffle colors within the category for a fresh gradient flow experience
  state.dataSource.sort(() => Math.random() - 0.5);

  state.currentIndex = 0;
  
  // Close menu with a micro-delay for smooth layout transition
  setTimeout(() => {
    dom.panelMenu.classList.remove('is-active');
    setFlip(false);
    changeCard(0, true);
  }, 150);
}

// --- Rendering Liked Panel ---
function renderLikesPanel() {
  dom.likesContainer.innerHTML = '';
  
  if (state.likedIds.length === 0) {
    dom.likesContainer.innerHTML = `
      <div class="empty-likes">No liked colors yet.<br>Double-tap screen center to save!</div>
    `;
    return;
  }

  state.likedIds.forEach(id => {
    const card = state.allData.find(c => c.id === id);
    if (!card) return;

    const item = document.createElement('div');
    item.className = 'like-item';
    item.innerHTML = `
      <div class="like-item-left">
        <div class="like-color-dot" style="background-color: ${card.hex};"></div>
        <div>
          <div class="like-color-name">${card.title}</div>
          <div class="like-color-code">${card.hex}</div>
        </div>
      </div>
      <svg viewBox="0 0 24 24" style="width:16px; height:16px; fill:#ff4757;">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
      </svg>
    `;

    // Tap liked color to jump directly to it in active database
    item.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      
      // Load all colors so we can show the liked one properly
      state.currentFilter = 'all';
      state.dataSource = [...state.allData];
      
      const idx = state.dataSource.findIndex(c => c.id === id);
      if (idx !== -1) {
        state.currentIndex = idx;
        setFlip(false);
        changeCard(idx, true);
        dom.panelLikes.classList.remove('is-active');
      }
    });

    dom.likesContainer.appendChild(item);
  });
}

// --- Toast notification ---
let toastTimer = null;
function showToast(message) {
  dom.toast.textContent = message;
  dom.toast.classList.add('show');
  
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    dom.toast.classList.remove('show');
  }, 1800);
}

// --- Clipboard Copy ---
function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    showToast(`COPIED: ${text}`);
    triggerHaptic();
  }).catch(err => {
    console.error('Failed to copy: ', err);
  });
}

// --- RGB Converter & AI Prompt Generator ---
function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `RGB(${r}, ${g}, ${b})`;
}

function copyAIPrompt() {
  if (state.dataSource.length === 0) return;
  const currentCard = state.dataSource[state.currentIndex];
  const rgb = hexToRgb(currentCard.hex);
  
  const promptText = `以下のカラーコードについて、色彩科学、美術史、化学、歴史的背景、文化的象徴などの観点から、詳しく掘り下げて教えてください。

なお、提示している色名は、本アプリ独自のコンセプトに基づいて付けられた「コンセプトカラー（創作色名）」が含まれている可能性があります。実在する公式の伝統色名とは異なる場合があるため、色名に引きずられすぎることなく、提示されたHEXコードやRGB値の物理的な色彩データに基づいて、客観的かつ多角的な調査・解説を行ってください。

[対象のカラー情報]
- 提示された色名: ${currentCard.title}
- HEXコード: ${currentCard.hex}
- RGB値: ${rgb}

[解説してほしい項目]
1. このカラーコード（または極めて近い色相）が歴史的・文化的にどのように使われてきたか（絵画、衣装、建築、儀式などでの具体的な使用例や作品など）
2. この色を物理的・化学的に作り出すために使われた顔料や染料の歴史（天然鉱物、動植物、または合成化学の誕生など）
3. この色相・カラーコードにまつわる、一般にはあまり知られていない興味深い歴史的事件、特定の人物、または面白いエピソード
4. この色が人間の心理や社会に与える象徴的意味（ステータスや色彩心理、各文化での捉え方の違いなど）

専門的でありながら、読む人をワクワクさせるようなストーリー性のある文体で、詳しく解説してください。`;

  navigator.clipboard.writeText(promptText).then(() => {
    showToast('AI PROMPT COPIED');
    triggerHaptic();
  }).catch(err => {
    console.error('Failed to copy prompt: ', err);
  });
}

// --- Init Event Listeners ---
function initEventListeners() {
  // Prevent default context menu to ensure long presses work seamlessly on mobile
  dom.viewport.addEventListener('contextmenu', e => e.preventDefault());

  // PREV Trigger zone
  dom.zonePrev.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    handlePointerDown('PREV');
  });

  // NEXT Trigger zone
  dom.zoneNext.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    handlePointerDown('NEXT');
  });

  // Universal release for scrolling
  window.addEventListener('pointerup', handlePointerUp);
  window.addEventListener('pointercancel', handlePointerUp);

  // ACTION Trigger zone (Flip & Like)
  dom.zoneAction.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    
    // Stop autoplay if playing
    if (state.isAutoplayOn) {
      stopAutoplay();
    }

    const now = Date.now();
    const timeDiff = now - lastTapTime;
    
    if (timeDiff < 300) {
      // --- Double Tap Action: Toggle Like ---
      const currentCard = state.dataSource[state.currentIndex];
      toggleLike(currentCard.id);
    } else {
      // --- Single Tap Action: 3D Flip ---
      // We wait briefly to make sure it's not a double-tap
      setTimeout(() => {
        if (Date.now() - lastTapTime >= 300) {
          setFlip(!state.isFlipped);
          triggerHaptic();
        }
      }, 150);
    }
    lastTapTime = now;
  });

  // Copy hex on back face click
  dom.triviaHex.addEventListener('click', (e) => {
    e.preventDefault();
    copyToClipboard(dom.triviaHex.textContent);
  });

  // Flip back button
  dom.btnFlipBack.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    setFlip(false);
    triggerHaptic();
  });

  // Copy AI prompt button
  dom.btnCopyPrompt.addEventListener('click', (e) => {
    e.preventDefault();
    copyAIPrompt();
  });

  // Toggle Like button
  dom.btnLikeToggle.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    e.stopPropagation();
    const currentCard = state.dataSource[state.currentIndex];
    toggleLike(currentCard.id);
  });

  // Autoplay Button
  dom.btnAutoplay.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleAutoplay();
  });

  // Menu / Filter Button
  dom.btnMenu.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (state.isAutoplayOn) stopAutoplay();
    dom.panelMenu.classList.add('is-active');
  });

  dom.btnCloseMenu.addEventListener('pointerdown', () => {
    dom.panelMenu.classList.remove('is-active');
  });

  // Open Likes Panel (via Index Display or Like Button holding)
  dom.hudIndex.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    if (state.isAutoplayOn) stopAutoplay();
    renderLikesPanel();
    dom.panelLikes.classList.add('is-active');
  });

  dom.btnCloseLikes.addEventListener('pointerdown', () => {
    dom.panelLikes.classList.remove('is-active');
  });

  // FPS Segment Control
  dom.fpsControl.addEventListener('pointerdown', (e) => {
    const btn = e.target.closest('.segment-btn');
    if (!btn) return;
    
    const fps = parseInt(btn.getAttribute('data-fps'), 10);
    state.targetFPS = fps;
    
    // UI update
    dom.fpsControl.querySelectorAll('.segment-btn').forEach(b => b.classList.remove('is-active'));
    btn.classList.add('is-active');

    // If currently autoplaying, restart timer with new FPS interval
    if (state.isAutoplayOn) {
      stopAutoplay();
      startAutoplay();
    }
    triggerHaptic();
  });

  // Tap Zone Guide Lines Show/Hide
  dom.guideControl.addEventListener('pointerdown', (e) => {
    const btn = e.target.closest('.segment-btn');
    if (!btn) return;

    const action = btn.getAttribute('data-guide');
    if (action === 'show') {
      dom.tapZones.classList.add('show-borders');
    } else {
      dom.tapZones.classList.remove('show-borders');
    }

    dom.guideControl.querySelectorAll('.segment-btn').forEach(b => b.classList.remove('is-active'));
    btn.classList.add('is-active');
    triggerHaptic();
  });

  // Filter Tag Buttons Click
  dom.tagsGrid.addEventListener('pointerdown', (e) => {
    const btn = e.target.closest('.filter-tag-btn');
    if (!btn) return;

    const tag = btn.getAttribute('data-tag');
    applyFilter(tag);
    triggerHaptic();
  });

  // Handle clicks on the back card itself for navigation when tap-zones are bypassed
  dom.cardWrapper.querySelector('.card-back').addEventListener('click', (e) => {
    // If the click is on an interactive element, do nothing and let it bubble/handle
    if (e.target.closest('.back-btn') || e.target.closest('.color-code-display') || e.target.closest('.trivia-tag') || e.target.closest('.hud-btn')) {
      return;
    }

    const rect = dom.cardWrapper.querySelector('.card-back').getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;

    if (x < width * 0.3) {
      // Left 30%: Go to Prev Color Back
      setFlip(false);
      changeCard(state.currentIndex - 1);
      // Wait for card shift, then flip it to show details of prev color
      requestAnimationFrame(() => {
        setFlip(true);
      });
    } else if (x > width * 0.7) {
      // Right 30%: Go to Next Color Front
      setFlip(false);
      changeCard(state.currentIndex + 1);
    } else {
      // Center 40%: Just Flip Back to Front
      setFlip(false);
      triggerHaptic();
    }
  });
}

// --- App Initialization ---
function init() {
  // Load data from window namespace (defined in colors.js)
  state.allData = window.COLOR_DATABASE || [];
  state.dataSource = [...state.allData];
  
  // Shuffle on start for dynamic palette sequence
  state.dataSource.sort(() => Math.random() - 0.5);

  loadLikes();
  initEventListeners();
  
  // Load first card (force render)
  changeCard(0, true);
}

// Start application
window.addEventListener('DOMContentLoaded', init);
