const seasons = [
  { key: "spring", name: "春", kana: "はる", className: "spring-answer", cover: "sakura" },
  { key: "summer", name: "夏", kana: "なつ", className: "summer-answer", cover: "watermelon" },
  { key: "autumn", name: "秋", kana: "あき", className: "autumn-answer", cover: "maple" },
  { key: "winter", name: "冬", kana: "ふゆ", className: "winter-answer", cover: "snowman" }
];

const items = [
  { id: "sakura", name: "さくら", season: "春", seasonKey: "spring", category: "おはな", image: "assets/items/sakura.png", description: "ピンクや白の花。あたたかくなるころにさきます。" },
  { id: "tulip", name: "チューリップ", season: "春", seasonKey: "spring", category: "おはな", image: "assets/items/tulip.png", description: "色とりどりのかわいい花。春にたくさんさきます。" },
  { id: "dandelion", name: "たんぽぽ", season: "春", seasonKey: "spring", category: "おはな", image: "assets/items/dandelion.png", description: "黄色い花。わたげになって風にのります。" },
  { id: "hinamatsuri", name: "ひなまつり", season: "春", seasonKey: "spring", category: "ぎょうじ", image: "assets/items/hinamatsuri.png", description: "3がつ3にちの女の子のおまつり。おひなさまをかざります。" },
  { id: "entrance-ceremony", name: "にゅうがくしき", season: "春", seasonKey: "spring", category: "ぎょうじ", image: "assets/items/entrance-ceremony.png", description: "あたらしいがっこうへいく日。わくわくのスタートです。" },
  { id: "strawberry", name: "いちご", season: "春", seasonKey: "spring", category: "たべもの", image: "assets/items/strawberry.png", description: "あかくてあまいくだもの。春においしくなります。" },
  { id: "swallow", name: "つばめ", season: "春", seasonKey: "spring", category: "どうぶつ", image: "assets/items/swallow.png", description: "あたたかくなるとにほんにくる鳥。おうちをつくります。" },
  { id: "butterfly", name: "ちょう", season: "春", seasonKey: "spring", category: "どうぶつ", image: "assets/items/butterfly.png", description: "カラフルなはねの虫。お花のミツをすいます。" },
  { id: "bamboo-shoot", name: "たけのこ", season: "春", seasonKey: "spring", category: "たべもの", image: "assets/items/bamboo-shoot.png", description: "たけのあかちゃん。にょきっと土からでてきます。" },
  { id: "nanohana", name: "なのはな", season: "春", seasonKey: "spring", category: "おはな", image: "assets/items/nanohana.png", description: "黄色の小さな花がいっぱい。春ののはらでさきます。" },

  { id: "sunflower", name: "ひまわり", season: "夏", seasonKey: "summer", category: "おはな", image: "assets/items/sunflower.png", description: "大きなきいろの花。おひさまのほうをむきます。" },
  { id: "morning-glory", name: "あさがお", season: "夏", seasonKey: "summer", category: "おはな", image: "assets/items/morning-glory.png", description: "あさにさくラッパのような花。いろいろな色があります。" },
  { id: "tanabata", name: "たなばた", season: "夏", seasonKey: "summer", category: "ぎょうじ", image: "assets/items/tanabata.png", description: "ほしにねがいをかく日。ささにかざります。" },
  { id: "summer-festival", name: "なつまつり", season: "夏", seasonKey: "summer", category: "ぎょうじ", image: "assets/items/summer-festival.png", description: "やたいとおんどり。はなびがキラキラひかります。" },
  { id: "watermelon", name: "すいか", season: "夏", seasonKey: "summer", category: "たべもの", image: "assets/items/watermelon.png", description: "みずみずしいあまいくだもの。つめたくしておいしいよ。" },
  { id: "beetle", name: "かぶとむし", season: "夏", seasonKey: "summer", category: "どうぶつ", image: "assets/items/beetle.png", description: "つのがかっこいい虫。よるにうごきます。" },
  { id: "cicada", name: "せみ", season: "夏", seasonKey: "summer", category: "どうぶつ", image: "assets/items/cicada.png", description: "「ミーンミーン」となく虫。夏の木にとまっています。" },
  { id: "pool", name: "プール", season: "夏", seasonKey: "summer", category: "あそび", image: "assets/items/pool.png", description: "みずあそびのばしょ。つめたい水でひんやり。" },
  { id: "shaved-ice", name: "かきごおり", season: "夏", seasonKey: "summer", category: "たべもの", image: "assets/items/shaved-ice.png", description: "こおりをけずったひんやりおやつ。シロップをかけます。" },
  { id: "tomato", name: "とまと", season: "夏", seasonKey: "summer", category: "たべもの", image: "assets/items/tomato.png", description: "あかくてまるいやさい。サラダにぴったり。" },

  { id: "cosmos", name: "コスモス", season: "秋", seasonKey: "autumn", category: "おはな", image: "assets/items/cosmos.png", description: "ほそいはねのような花。秋のそらにゆれます。" },
  { id: "maple", name: "もみじ", season: "秋", seasonKey: "autumn", category: "おはな", image: "assets/items/maple.png", description: "はっぱがあかやきいろにへんしん。やまがカラフル。" },
  { id: "moon-viewing", name: "おつきみ", season: "秋", seasonKey: "autumn", category: "ぎょうじ", image: "assets/items/moon-viewing.png", description: "まんまるのおつきをみる日。おだんごをたべます。" },
  { id: "sports-day", name: "うんどうかい", season: "秋", seasonKey: "autumn", category: "あそび", image: "assets/items/sports-day.png", description: "かけっこやダンスをする日。みんなでおうえんします。" },
  { id: "apple", name: "りんご", season: "秋", seasonKey: "autumn", category: "たべもの", image: "assets/items/apple.png", description: "シャキッとしたあまいくだもの。りんごのきからとれます。" },
  { id: "persimmon", name: "かき", season: "秋", seasonKey: "autumn", category: "たべもの", image: "assets/items/persimmon.png", description: "オレンジいろのくだもの。あまくてやわらかいです。" },
  { id: "acorn", name: "どんぐり", season: "秋", seasonKey: "autumn", category: "たべもの", image: "assets/items/acorn.png", description: "きのしたにおちている木の実。ひろってあそべます。" },
  { id: "rice-harvest", name: "いねかり", season: "秋", seasonKey: "autumn", category: "ぎょうじ", image: "assets/items/rice-harvest.png", description: "おこめをとるしゅんかん。たんぼがきんいろです。" },
  { id: "chestnut", name: "くり", season: "秋", seasonKey: "autumn", category: "たべもの", image: "assets/items/chestnut.png", description: "とげとげのなかにあるまるい木の実。ほくほくです。" },

  { id: "camellia", name: "つばき", season: "冬", seasonKey: "winter", category: "おはな", image: "assets/items/camellia.png", description: "さむい日にさくあかい花。つやつやのはっぱです。" },
  { id: "plum", name: "うめ", season: "冬", seasonKey: "winter", category: "おはな", image: "assets/items/plum.png", description: "ひんやりした空気でいいにおいの花。はるのあしおとです。" },
  { id: "christmas", name: "クリスマス", season: "冬", seasonKey: "winter", category: "ぎょうじ", image: "assets/items/christmas.png", description: "きらきらかざりとプレゼントの日。サンタさんがくるかも。" },
  { id: "new-year", name: "おしょうがつ", season: "冬", seasonKey: "winter", category: "ぎょうじ", image: "assets/items/new-year.png", description: "1ねんのはじまりのおいわい。かぞくでおもちをたべます。" },
  { id: "snowman", name: "雪だるま", season: "冬", seasonKey: "winter", category: "あそび", image: "assets/items/snowman.png", description: "ゆきでつくるまるい人。マフラーをつけたりします。" },
  { id: "mandarin", name: "みかん", season: "冬", seasonKey: "winter", category: "たべもの", image: "assets/items/mandarin.png", description: "こたつでたべるあまいくだもの。皮がむきやすいよ。" },
  { id: "scarf", name: "マフラー", season: "冬", seasonKey: "winter", category: "あそび", image: "assets/items/scarf.png", description: "くびにまくあったかいぬの。かぜひかないように。" },
  { id: "setsubun", name: "せつぶん", season: "冬", seasonKey: "winter", category: "ぎょうじ", image: "assets/items/setsubun.png", description: "まめをまいて「おにはそと！」とかけ声をします。" },
  { id: "ski", name: "スキー", season: "冬", seasonKey: "winter", category: "あそび", image: "assets/items/ski.png", description: "ゆきのうえをすべるスポーツ。ビューンとすべります。" }
];

const badges = [
  { id: "spring", symbol: "春", name: "はるはかせ", seasonKey: "spring" },
  { id: "summer", symbol: "夏", name: "なつマスター", seasonKey: "summer" },
  { id: "autumn", symbol: "秋", name: "あきの友だち", seasonKey: "autumn" },
  { id: "winter", symbol: "冬", name: "ふゆたんけん", seasonKey: "winter" },
  { id: "all", symbol: "金", name: "きせつはかせ" }
];

const modeMeta = {
  season: { label: "きせつ", title: "どの季節かな？", total: 5 },
  name: { label: "なまえ", title: "これはなあに？", total: 5 },
  match: { label: "なかま", title: "同じ季節をえらぼう", total: 5 },
  order: { label: "じゅんばん", title: "季節をならべよう", total: 1 },
  challenge: { label: "おさらい", title: "きせつチャレンジ", total: 8 }
};

const storageKey = "kisetsuManabiPictureProgress";

let progress = loadProgress();
let currentRun = null;
let libraryShuffle = false;

document.addEventListener("DOMContentLoaded", () => {
  renderHome();
  attachEvents();
});

function attachEvents() {
  document.querySelectorAll("[data-mode]").forEach(button => {
    button.addEventListener("click", () => startMode(button.dataset.mode));
  });
  document.getElementById("back-home").addEventListener("click", showHome);
  document.getElementById("result-home").addEventListener("click", showHome);
  document.getElementById("next-question").addEventListener("click", nextQuestion);
  document.getElementById("shuffle-library").addEventListener("click", () => {
    libraryShuffle = !libraryShuffle;
    renderLibrary();
  });
}

function loadProgress() {
  try {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      return { stars: 0, bestStreak: 0, learned: [], bestChallenge: 0, ...JSON.parse(saved) };
    }
  } catch (error) {
    console.warn("Progress could not be loaded.", error);
  }
  return { stars: 0, bestStreak: 0, learned: [], bestChallenge: 0 };
}

function saveProgress() {
  localStorage.setItem(storageKey, JSON.stringify(progress));
}

function showScreen(id) {
  document.querySelectorAll(".screen").forEach(screen => screen.classList.remove("is-active"));
  document.getElementById(id).classList.add("is-active");
}

function showHome() {
  currentRun = null;
  renderHome();
  showScreen("home-screen");
}

function renderHome() {
  document.getElementById("stars-value").textContent = progress.stars;
  document.getElementById("streak-value").textContent = progress.bestStreak;
  document.getElementById("learned-value").textContent = progress.learned.length;
  document.getElementById("total-value").textContent = items.length;
  renderBadges();
  renderLibrary();
}

function renderBadges() {
  const list = document.getElementById("badge-list");
  list.innerHTML = badges.map(badge => {
    const unlocked = badge.id === "all"
      ? progress.learned.length === items.length
      : learnedBySeason(badge.seasonKey) >= 5;
    return `
      <div class="badge ${unlocked ? "" : "is-locked"}">
        <span class="badge-symbol">${badge.symbol}</span>
        <span class="badge-name">${badge.name}</span>
      </div>
    `;
  }).join("");
}

function renderLibrary() {
  const list = libraryShuffle ? shuffle(items) : [...items];
  const grid = document.getElementById("library-grid");
  grid.innerHTML = list.map(item => `
    <article class="library-card">
      <img src="${item.image}" alt="${item.name}">
      <strong>${item.name}</strong>
      <span>${item.season}・${item.category}</span>
    </article>
  `).join("");
}

function learnedBySeason(seasonKey) {
  return items.filter(item => item.seasonKey === seasonKey && progress.learned.includes(item.id)).length;
}

function startMode(mode) {
  const meta = modeMeta[mode];
  currentRun = {
    mode,
    index: 0,
    total: meta.total,
    score: 0,
    streak: 0,
    questions: mode === "order" ? [] : buildQuestions(mode, meta.total),
    orderSelection: []
  };

  document.getElementById("mode-label").textContent = meta.label;
  document.getElementById("question-title").textContent = meta.title;
  document.getElementById("round-total").textContent = meta.total;
  renderRoundTrack();
  showScreen("play-screen");
  scrollPlayTop();
  renderQuestion();
}

function buildQuestions(mode, total) {
  const kinds = mode === "challenge" ? ["season", "name", "match"] : [mode];
  return Array.from({ length: total }, () => {
    const type = sample(kinds);
    const item = sample(items);
    return { type, item };
  });
}

function renderRoundTrack() {
  const track = document.getElementById("round-track");
  track.innerHTML = Array.from({ length: currentRun.total }, (_, index) => (
    `<span class="round-dot ${index < currentRun.index ? "is-done" : ""}"></span>`
  )).join("");
}

function renderQuestion() {
  document.getElementById("feedback-panel").hidden = true;
  document.getElementById("round-now").textContent = currentRun.index + 1;
  renderRoundTrack();

  if (currentRun.mode === "order") {
    renderOrderQuestion();
    return;
  }

  const question = currentRun.questions[currentRun.index];
  if (question.type === "season") renderSeasonQuestion(question.item);
  if (question.type === "name") renderNameQuestion(question.item);
  if (question.type === "match") renderMatchQuestion(question.item);
  scrollPlayTop();
}

function renderSeasonQuestion(item) {
  stage(item, `${item.name} は どの季節かな？`);
  const answerArea = document.getElementById("answer-area");
  answerArea.innerHTML = seasons.map(season => `
    <button class="season-chip ${season.className}" type="button" data-answer="${season.name}">
      ${season.kana}<br>${season.name}
    </button>
  `).join("");
  answerArea.querySelectorAll("[data-answer]").forEach(button => {
    button.addEventListener("click", () => answerQuestion(button.dataset.answer === item.season, item));
  });
}

function renderNameQuestion(item) {
  stage(item, `これは なんていう ${item.category} かな？`);
  const choices = shuffle([
    item,
    ...shuffle(items.filter(other => other.id !== item.id && other.category === item.category)).slice(0, 3)
  ]);
  const answerArea = document.getElementById("answer-area");
  answerArea.innerHTML = choices.map(choice => `
    <button class="answer-button" type="button" data-answer="${choice.id}">${choice.name}</button>
  `).join("");
  answerArea.querySelectorAll("[data-answer]").forEach(button => {
    button.addEventListener("click", () => answerQuestion(button.dataset.answer === item.id, item));
  });
}

function renderMatchQuestion(reference) {
  stage(reference, `${reference.name} と 同じ季節のものはどれ？`);
  const sameSeason = shuffle(items.filter(item => item.seasonKey === reference.seasonKey && item.id !== reference.id)).slice(0, 1);
  const others = shuffle(items.filter(item => item.seasonKey !== reference.seasonKey)).slice(0, 3);
  const choices = shuffle([...sameSeason, ...others]);
  const answerArea = document.getElementById("answer-area");
  answerArea.innerHTML = choices.map(choice => `
    <button class="image-choice" type="button" data-answer="${choice.id}">
      <img src="${choice.image}" alt="${choice.name}">
      <span>${choice.name}</span>
    </button>
  `).join("");
  answerArea.querySelectorAll("[data-answer]").forEach(button => {
    const choice = items.find(item => item.id === button.dataset.answer);
    button.addEventListener("click", () => answerQuestion(choice.seasonKey === reference.seasonKey, reference, choice));
  });
}

function renderOrderQuestion() {
  const seasonItems = seasons.map(season => ({
    ...season,
    item: items.find(item => item.id === season.cover)
  }));

  document.getElementById("question-stage").innerHTML = `
    <p class="question-copy">春、夏、秋、冬のじゅんに ならべよう</p>
    <div class="order-board">
      <div id="order-slots" class="order-slots">
        ${Array.from({ length: 4 }, (_, index) => `<button class="order-slot" type="button" data-slot="${index}">ここに<br>${index + 1}</button>`).join("")}
      </div>
      <div id="order-bank" class="order-bank">
        ${shuffle(seasonItems).map(season => `
          <button class="order-card" type="button" data-season="${season.key}">
            <img src="${season.item.image}" alt="${season.name}">
            <span>${season.kana}<br>${season.name}</span>
          </button>
        `).join("")}
      </div>
    </div>
  `;
  document.getElementById("answer-area").innerHTML = `<button id="check-order" class="primary-button" type="button">かくにん</button>`;
  document.getElementById("check-order").disabled = true;

  document.querySelectorAll(".order-card").forEach(card => {
    card.addEventListener("click", () => placeSeason(card.dataset.season, card));
  });
  document.querySelectorAll(".order-slot").forEach(slot => {
    slot.addEventListener("click", () => removeSeason(Number(slot.dataset.slot)));
  });
  document.getElementById("check-order").addEventListener("click", checkOrder);
}

function placeSeason(seasonKey, card) {
  if (currentRun.orderSelection.includes(seasonKey)) return;
  const emptyIndex = currentRun.orderSelection.length;
  currentRun.orderSelection.push(seasonKey);
  card.style.visibility = "hidden";
  paintOrderSlots();
  document.getElementById("check-order").disabled = currentRun.orderSelection.length !== 4;
}

function removeSeason(index) {
  const seasonKey = currentRun.orderSelection[index];
  if (!seasonKey) return;
  currentRun.orderSelection.splice(index, 1);
  const card = document.querySelector(`.order-card[data-season="${seasonKey}"]`);
  if (card) card.style.visibility = "visible";
  paintOrderSlots();
  document.getElementById("check-order").disabled = true;
}

function paintOrderSlots() {
  document.querySelectorAll(".order-slot").forEach((slot, index) => {
    const seasonKey = currentRun.orderSelection[index];
    if (!seasonKey) {
      slot.innerHTML = `ここに<br>${index + 1}`;
      return;
    }
    const season = seasons.find(entry => entry.key === seasonKey);
    const item = items.find(entry => entry.id === season.cover);
    slot.innerHTML = `<img src="${item.image}" alt="${season.name}"><span>${season.kana}<br>${season.name}</span>`;
  });
}

function checkOrder() {
  const correct = currentRun.orderSelection.join(",") === seasons.map(season => season.key).join(",");
  answerOrder(correct);
}

function answerOrder(isCorrect) {
  document.querySelectorAll("#answer-area button, .order-card, .order-slot").forEach(button => {
    button.disabled = true;
  });

  if (isCorrect) {
    currentRun.score += 1;
    currentRun.streak += 1;
    progress.stars += 1;
    progress.bestStreak = Math.max(progress.bestStreak, currentRun.streak);
    seasons.forEach(season => {
      if (!progress.learned.includes(season.cover)) progress.learned.push(season.cover);
    });
  } else {
    currentRun.streak = 0;
  }

  saveProgress();

  const panel = document.getElementById("feedback-panel");
  panel.hidden = false;
  panel.className = `feedback-panel ${isCorrect ? "is-good" : "is-bad"}`;
  document.getElementById("feedback-mark").textContent = isCorrect ? "せいかい" : "ならびを たしかめよう";
  document.getElementById("feedback-copy").innerHTML = `
    季節は <strong>春 → 夏 → 秋 → 冬</strong> のじゅんばんで、くりかえしめぐるよ。<br>
    春はあたたかく、夏はあつく、秋はすずしく、冬はさむくなるね。
  `;
}

function stage(item, copy) {
  document.getElementById("question-stage").innerHTML = `
    <div class="item-picture">
      <img src="${item.image}" alt="${item.name}">
    </div>
    <p class="question-copy">${copy}</p>
  `;
}

function answerQuestion(isCorrect, item, selectedItem = null, customDescription = "") {
  document.querySelectorAll("#answer-area button").forEach(button => {
    button.disabled = true;
  });

  if (isCorrect) {
    currentRun.score += 1;
    currentRun.streak += 1;
    progress.stars += 1;
    progress.bestStreak = Math.max(progress.bestStreak, currentRun.streak);
    if (!progress.learned.includes(item.id)) progress.learned.push(item.id);
    if (selectedItem && !progress.learned.includes(selectedItem.id)) progress.learned.push(selectedItem.id);
  } else {
    currentRun.streak = 0;
  }

  if (currentRun.mode === "challenge") {
    progress.bestChallenge = Math.max(progress.bestChallenge, currentRun.score);
  }

  saveProgress();
  renderFeedback(isCorrect, item, selectedItem, customDescription);
}

function renderFeedback(isCorrect, item, selectedItem, customDescription) {
  const panel = document.getElementById("feedback-panel");
  panel.hidden = false;
  panel.className = `feedback-panel ${isCorrect ? "is-good" : "is-bad"}`;
  document.getElementById("feedback-mark").textContent = isCorrect ? "せいかい" : "もういちど おぼえよう";

  const selectedLine = selectedItem
    ? `えらんだ「${selectedItem.name}」は ${selectedItem.season} のものです。`
    : "";
  document.getElementById("feedback-copy").innerHTML = `
    <strong>${item.name}</strong> は <strong>${item.season}</strong> の ${item.category}。<br>
    ${customDescription || item.description}
    ${selectedLine ? `<br>${selectedLine}` : ""}
  `;
  panel.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function nextQuestion() {
  currentRun.index += 1;
  if (currentRun.index >= currentRun.total) {
    showResult();
    return;
  }
  renderQuestion();
}

function scrollPlayTop() {
  window.scrollTo({ top: 0, behavior: "auto" });
}

function showResult() {
  const perfect = currentRun.score === currentRun.total;
  document.getElementById("result-title").textContent = perfect ? "すばらしい" : "よくがんばったね";
  document.getElementById("result-score").textContent = `${currentRun.score} / ${currentRun.total}`;
  document.getElementById("result-message").textContent = perfect
    ? "ぜんぶできたね。ずかんも少しずつうまっていくよ。"
    : "絵をみて、季節となまえをまたたしかめてみよう。";
  renderHome();
  showScreen("result-screen");
}

function sample(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function shuffle(list) {
  return [...list].sort(() => Math.random() - 0.5);
}
