const LS_BEST = "jump16_best_score_v4";
const LS_SOUND = "jump16_sound_on_v1";
const LS_TUTORIAL = "jump16_tutorial_seen_v1";
const LS_HAPTIC = "jump16_haptic_level_v1";

const DIFFICULTY = {
  easy: { hitWindow: 130, scoreMul: 1 },
  normal: { hitWindow: 98, scoreMul: 1.2 },
  hard: { hitWindow: 72, scoreMul: 1.5 }
};

const ui = {
  canvas: document.getElementById("game"),
  score: document.getElementById("score"),
  combo: document.getElementById("combo"),
  best: document.getElementById("best"),
  life: document.getElementById("life"),
  rate: document.getElementById("rate"),
  streak: document.getElementById("streak"),
  judge: document.getElementById("judge"),
  bpm: document.getElementById("bpm"),
  bpmValue: document.getElementById("bpmValue"),
  soundBtn: document.getElementById("soundBtn"),
  hapticBtn: document.getElementById("hapticBtn"),
  rhythmFill: document.getElementById("rhythmFill"),
  easyBtn: document.getElementById("easyBtn"),
  normalBtn: document.getElementById("normalBtn"),
  hardBtn: document.getElementById("hardBtn"),
  overlay: document.getElementById("overlay"),
  overlayTitle: document.getElementById("overlayTitle"),
  overlayText: document.getElementById("overlayText"),
  overlayMeta: document.getElementById("overlayMeta"),
  startBtn: document.getElementById("startBtn"),
  retryBtn: document.getElementById("retryBtn"),
  jumpBtn: document.getElementById("jumpBtn"),
  pauseBtn: document.getElementById("pauseBtn"),
  resetBtn: document.getElementById("resetBtn"),
  srStatus: document.getElementById("srStatus"),
  tutorial: document.getElementById("tutorial"),
  tutorialText: document.getElementById("tutorialText"),
  tutorialNext: document.getElementById("tutorialNext"),
  historyChart: document.getElementById("historyChart")
};

class MiniAudio {
  constructor() {
    this.ctx = null;
    this.enabled = localStorage.getItem(LS_SOUND) !== "0";
  }

  async ensure() {
    if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (this.ctx.state !== "running") await this.ctx.resume();
  }

  setEnabled(on) {
    this.enabled = on;
    localStorage.setItem(LS_SOUND, on ? "1" : "0");
  }

  beep(freq, ms, gain = 0.1) {
    if (!this.enabled || !this.ctx) return;
    const t = this.ctx.currentTime;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = "sine";
    o.frequency.value = freq;
    g.gain.value = gain;
    o.connect(g).connect(this.ctx.destination);
    o.start(t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + ms / 1000);
    o.stop(t + ms / 1000 + 0.01);
  }

  tick() { this.beep(520, 28, 0.04); }
  success(judge) {
    if (judge === "PERFECT") this.beep(980, 86, 0.13);
    else if (judge === "GREAT") this.beep(840, 74, 0.1);
    else this.beep(720, 60, 0.08);
  }
  miss() { this.beep(220, 140, 0.11); }
}

class RopeJumpGame {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.audio = new MiniAudio();

    this.state = "ready"; // ready, countdown, running, paused, gameover
    this.bpm = Number(ui.bpm.value);
    this.periodMs = 60000 / this.bpm;
    this.difficulty = "easy";
    this.hitWindow = DIFFICULTY[this.difficulty].hitWindow;

    this.startAt = 0;
    this.lastFrameAt = performance.now();
    this.pauseElapsed = 0;
    this.countdownUntil = 0;

    this.score = 0;
    this.combo = 0;
    this.best = Number(localStorage.getItem(LS_BEST) || 0);
    this.life = 3;
    this.streak = 0;
    this.judgeText = "READY";
    this.judgeTimer = 0;

    this.successCount = 0;
    this.totalAttempts = 0;
    this.lastResolvedBeat = -1;
    this.lastTickBeat = -1;

    this.tutorialSeen = localStorage.getItem(LS_TUTORIAL) === "1";
    this.tutorialStep = 0;

    this.hapticLevel = localStorage.getItem(LS_HAPTIC) || "strong";

    this.history = [];
    this.historyMax = 10;

    this.jumpY = 0;
    this.jumpV = 0;
    this.gravity = 2300;
    this.jumpPower = -760;

    this.judgmentStats = { perfect: 0, great: 0, good: 0, miss: 0 };

    this.resize();
    window.addEventListener("resize", () => this.resize());
    this.refreshSoundButton();
    this.refreshHapticButton();
    this.updateHUD();
    this.bindTutorial();
    this.renderHistory();
    this.loop();
  }


  bindTutorial() {
    ui.tutorialNext.addEventListener("click", () => this.advanceTutorial());
  }

  showTutorial(text) {
    if (this.tutorialSeen) return;
    ui.tutorialText.textContent = text;
    ui.tutorial.hidden = false;
  }

  hideTutorial() {
    ui.tutorial.hidden = true;
  }

  advanceTutorial() {
    if (this.tutorialSeen) return;
    this.tutorialStep += 1;
    if (this.tutorialStep === 1) {
      this.showTutorial("GOOD! 次は連続で3回成功を狙ってみよう。");
      return;
    }
    if (this.tutorialStep === 2) {
      this.showTutorial("MISSしてもOK。タイミングを見直して再挑戦！");
      return;
    }
    this.tutorialSeen = true;
    localStorage.setItem(LS_TUTORIAL, "1");
    this.hideTutorial();
  }


  pushHistory(type, strength = 0.6) {
    this.history.push({ type, strength });
    if (this.history.length > this.historyMax) this.history.shift();
    this.renderHistory();
  }

  renderHistory() {
    if (!ui.historyChart) return;
    ui.historyChart.innerHTML = "";
    const padded = Array(Math.max(0, this.historyMax - this.history.length)).fill({ type: "empty", strength: 0.25 }).concat(this.history);
    padded.forEach((item) => {
      const bar = document.createElement("div");
      bar.className = `history-bar ${item.type === "empty" ? "" : item.type}`.trim();
      bar.style.height = `${Math.round(12 + item.strength * 20)}px`;
      bar.title = item.type.toUpperCase();
      ui.historyChart.appendChild(bar);
    });
  }

  vibrate(pattern) {
    if (this.hapticLevel === "off") return;
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      if (this.hapticLevel === "light") {
        const light = Array.isArray(pattern) ? pattern.map((p) => Math.max(8, Math.round(p * 0.5))) : 12;
        navigator.vibrate(light);
      } else {
        navigator.vibrate(pattern);
      }
    }
  }

  toggleHaptic() {
    const order = ["off", "light", "strong"];
    const i = order.indexOf(this.hapticLevel);
    this.hapticLevel = order[(i + 1) % order.length];
    localStorage.setItem(LS_HAPTIC, this.hapticLevel);
    this.refreshHapticButton();
    this.announce(`触覚 ${this.hapticLevel}`);
  }

  refreshHapticButton() {
    const label = this.hapticLevel.toUpperCase();
    ui.hapticBtn.textContent = `📳 Haptic: ${label}`;
    ui.hapticBtn.setAttribute("aria-pressed", this.hapticLevel === "off" ? "false" : "true");
  }

  resize() {
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = Math.floor(rect.width * dpr);
    this.canvas.height = Math.floor(rect.height * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.width = rect.width;
    this.height = rect.height;
  }

  getElapsed(now = performance.now()) {
    if (this.state === "paused") return this.pauseElapsed;
    return Math.max(0, now - this.startAt);
  }

  setBpm(v) {
    const now = performance.now();
    const elapsed = this.getElapsed(now);
    this.bpm = v;
    this.periodMs = 60000 / this.bpm;
    if (this.state === "running") this.startAt = now - elapsed;
  }

  setDifficulty(level) {
    this.difficulty = level;
    this.hitWindow = DIFFICULTY[level].hitWindow;
    [ui.easyBtn, ui.normalBtn, ui.hardBtn].forEach((btn) => btn.classList.remove("active"));
    if (level === "easy") ui.easyBtn.classList.add("active");
    if (level === "normal") ui.normalBtn.classList.add("active");
    if (level === "hard") ui.hardBtn.classList.add("active");
    this.announce(`難易度 ${level.toUpperCase()} に変更`);
  }

  async start() {
    await this.audio.ensure();
    const now = performance.now();
    this.state = "countdown";
    this.countdownUntil = now + 3000;
    this.showOverlay("3", "リズムを感じて、開始に備えてください。", false);
    this.announce("カウントダウン開始");
  }

  beginRun(now = performance.now()) {
    this.state = "running";
    this.startAt = now;
    this.pauseElapsed = 0;
    this.lastResolvedBeat = -1;
    this.lastTickBeat = -1;
    this.hideOverlay();
    this.setJudge("GO!");
    this.announce("ゲーム開始");
  }

  reset() {
    this.state = "ready";
    this.score = 0;
    this.combo = 0;
    this.life = 3;
    this.streak = 0;
    this.successCount = 0;
    this.totalAttempts = 0;
    this.lastResolvedBeat = -1;
    this.lastTickBeat = -1;
    this.judgmentStats = { perfect: 0, great: 0, good: 0, miss: 0 };
    this.jumpY = 0;
    this.jumpV = 0;
    this.setJudge("READY");
    this.updateHUD();
    this.updateRhythmBar(0);
    this.showOverlay("Tap / Space で開始", "縄が足元(黄色ライン)を通る瞬間に押そう。", false);
    ui.overlayMeta.textContent = "";
    this.history = [];
    this.renderHistory();
    if (!this.tutorialSeen) this.showTutorial("黄色ラインを縄が通る瞬間に押そう！");
    this.announce("リセットしました");
  }

  togglePause() {
    if (this.state === "running") {
      this.state = "paused";
      this.pauseElapsed = this.getElapsed();
      this.showOverlay("一時停止中", "再開するには一時停止をもう一度押してください。", false);
      this.announce("一時停止");
    } else if (this.state === "paused") {
      this.state = "running";
      this.startAt = performance.now() - this.pauseElapsed;
      this.hideOverlay();
      this.announce("再開");
    }
  }

  async onJump() {
    if (this.state === "ready") {
      await this.start();
      return;
    }
    if (this.state === "countdown" || this.state !== "running") return;

    const now = performance.now();
    const elapsed = this.getElapsed(now);
    const beatFloat = elapsed / this.periodMs;
    const beatIndex = Math.round(beatFloat);
    const beatTime = beatIndex * this.periodMs;
    const delta = Math.abs(elapsed - beatTime);

    if (beatIndex <= this.lastResolvedBeat) return;

    this.totalAttempts += 1;

    if (delta <= this.hitWindow) {
      const judge = delta <= this.hitWindow * 0.35 ? "PERFECT" : delta <= this.hitWindow * 0.72 ? "GREAT" : "GOOD";
      const mul = DIFFICULTY[this.difficulty].scoreMul;
      this.combo += 1;
      this.streak += 1;
      this.score += Math.round((100 + this.combo * 10 + this.streak * 2) * mul);
      this.successCount += 1;
      if (this.streak > 0 && this.streak % 10 === 0) {
        this.score += Math.round(250 * mul);
        this.setJudge("STREAK BONUS");
      } else {
        this.setJudge(judge);
      }
      this.jumpV = this.jumpPower;
      if (judge === "PERFECT") this.judgmentStats.perfect += 1;
      else if (judge === "GREAT") this.judgmentStats.great += 1;
      else this.judgmentStats.good += 1;
      this.audio.success(judge);
      this.pushHistory(judge.toLowerCase(), Math.max(0.2, 1 - delta / this.hitWindow));
      this.vibrate([10]);
      this.lastResolvedBeat = beatIndex;
      if (!this.tutorialSeen && this.successCount === 1 && this.tutorialStep < 1) this.showTutorial("ナイス！もう一度OKを押すと次のヒントへ進みます。");
    } else {
      this.registerMiss("EARLY/LATE", beatIndex);
    }

    this.updateHUD();
  }

  registerMiss(text, beatIndex) {
    this.combo = 0;
    this.streak = 0;
    this.life -= 1;
    this.setJudge(text);
    this.audio.miss();
    this.judgmentStats.miss += 1;
    this.pushHistory("miss", 0.95);
    this.vibrate([20, 20, 20]);
    this.lastResolvedBeat = Math.max(this.lastResolvedBeat, beatIndex);
    if (!this.tutorialSeen && this.tutorialStep < 2) this.showTutorial("MISSは学習のチャンス。OKで次へ。");
    if (this.life <= 0) this.gameOver();
  }

  gameOver() {
    this.state = "gameover";
    this.best = Math.max(this.best, this.score);
    localStorage.setItem(LS_BEST, String(this.best));
    this.updateHUD();
    this.showOverlay("GAME OVER", `Score: ${this.score} / Best: ${this.best}`, true);
    ui.overlayMeta.textContent = `PERFECT ${this.judgmentStats.perfect}  /  GREAT ${this.judgmentStats.great}\nGOOD ${this.judgmentStats.good}  /  MISS ${this.judgmentStats.miss}`;
    this.announce(`ゲームオーバー。スコア ${this.score}`);
  }

  setJudge(text) {
    this.judgeText = text;
    this.judgeTimer = 0.85;
    ui.judge.textContent = text;
    ui.judge.style.color = text.includes("MISS") || text.includes("EARLY") ? "var(--warn)" : "var(--good)";
  }

  updateHUD() {
    const rate = this.totalAttempts === 0 ? 0 : Math.round((this.successCount / this.totalAttempts) * 100);
    ui.score.textContent = String(this.score);
    ui.combo.textContent = String(this.combo);
    ui.best.textContent = String(this.best);
    ui.life.textContent = "❤".repeat(Math.max(0, this.life)) + "·".repeat(Math.max(0, 3 - this.life));
    ui.rate.textContent = `${rate}%`;
    ui.streak.textContent = String(this.streak);
    ui.judge.textContent = this.judgeText;
  }

  updateRhythmBar(progress) {
    ui.rhythmFill.style.width = `${Math.round(progress * 100)}%`;
  }

  showOverlay(title, text, showRetry) {
    ui.overlayTitle.textContent = title;
    ui.overlayText.textContent = text;
    ui.retryBtn.hidden = !showRetry;
    if (title !== "GAME OVER") ui.overlayMeta.textContent = "";
    ui.overlay.style.display = "grid";
  }

  hideOverlay() {
    ui.overlay.style.display = "none";
  }

  toggleSound() {
    const next = !this.audio.enabled;
    this.audio.setEnabled(next);
    this.refreshSoundButton();
    this.announce(next ? "サウンドオン" : "サウンドオフ");
  }

  refreshSoundButton() {
    ui.soundBtn.textContent = this.audio.enabled ? "🔊 Sound ON" : "🔇 Sound OFF";
    ui.soundBtn.setAttribute("aria-pressed", this.audio.enabled ? "true" : "false");
  }

  announce(text) {
    ui.srStatus.textContent = text;
  }

  updateCountdown(now) {
    const remain = Math.ceil((this.countdownUntil - now) / 1000);
    if (remain <= 0) {
      this.beginRun(now);
      return;
    }
    this.showOverlay(String(remain), "リズムを感じて、開始に備えてください。", false);
  }

  update(dt) {
    const now = performance.now();

    if (this.state === "countdown") {
      this.updateCountdown(now);
      return;
    }

    if (this.state !== "running") return;

    if (this.judgeTimer > 0) this.judgeTimer -= dt;

    this.jumpV += this.gravity * dt;
    this.jumpY += this.jumpV * dt;
    if (this.jumpY > 0) {
      this.jumpY = 0;
      this.jumpV = 0;
    }

    const elapsed = this.getElapsed(now);
    const beatProgress = (elapsed % this.periodMs) / this.periodMs;
    this.updateRhythmBar(beatProgress);

    const beatIndex = Math.floor(elapsed / this.periodMs);
    if (beatIndex > this.lastResolvedBeat + 1) {
      this.totalAttempts += 1;
      this.registerMiss("MISS", beatIndex - 1);
      this.updateHUD();
    }

    if (beatIndex > this.lastTickBeat) {
      this.lastTickBeat = beatIndex;
      if (beatIndex >= 0) this.audio.tick();
    }
  }

  draw() {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;
    ctx.clearRect(0, 0, w, h);

    const groundY = h * 0.75;
    const centerX = w * 0.5;
    const ropeR = Math.min(190, w * 0.25);

    const elapsed = this.getElapsed(performance.now());
    const phase = ((elapsed % this.periodMs) / this.periodMs) * Math.PI * 2;

    ctx.fillStyle = "#19274f";
    ctx.fillRect(0, groundY, w, h - groundY);

    ctx.strokeStyle = "#ffd166";
    ctx.setLineDash([6, 6]);
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(centerX - 140, groundY + 6);
    ctx.lineTo(centerX + 140, groundY + 6);
    ctx.stroke();
    ctx.setLineDash([]);

    if (this.state !== "ready") {
      const ropeY = groundY - Math.sin(phase) * 82;
      const depth = Math.max(0.4, 1 - (Math.sin(phase) + 1) * 0.2);
      ctx.strokeStyle = "#ffe082";
      ctx.lineWidth = 5 * depth;
      ctx.beginPath();
      ctx.moveTo(centerX - ropeR, ropeY);
      ctx.quadraticCurveTo(centerX, ropeY + 58, centerX + ropeR, ropeY);
      ctx.stroke();
    }

    const y = groundY + this.jumpY;
    ctx.fillStyle = "rgba(0,0,0,0.3)";
    ctx.beginPath();
    ctx.ellipse(centerX, groundY + 8, 36, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    const boost = Math.min(1, this.streak / 20);
    const g = Math.floor(240 - boost * 50);
    const b = Math.floor(200 + boost * 40);
    ctx.fillStyle = `rgb(90, ${g}, ${b})`;
    ctx.fillRect(centerX - 24, y - 78, 48, 72);
    if (boost > 0.4) {
      ctx.strokeStyle = "rgba(255, 230, 120, 0.7)";
      ctx.lineWidth = 2 + boost * 2;
      ctx.strokeRect(centerX - 26, y - 80, 52, 76);
    }
    ctx.fillStyle = "#edf2ff";
    ctx.beginPath();
    ctx.arc(centerX, y - 96, 18, 0, Math.PI * 2);
    ctx.fill();

    if (this.judgeTimer > 0) {
      ctx.globalAlpha = Math.min(1, this.judgeTimer + 0.12);
      ctx.fillStyle = this.judgeText.includes("MISS") || this.judgeText.includes("EARLY") ? "#ff6b6b" : "#7dfc84";
      ctx.font = "bold 30px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(this.judgeText, centerX, 80);
      ctx.globalAlpha = 1;
    }
  }

  loop() {
    const frame = () => {
      const now = performance.now();
      const dt = (now - this.lastFrameAt) / 1000;
      this.lastFrameAt = now;
      this.update(dt);
      this.draw();
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }
}

const game = new RopeJumpGame(ui.canvas);

ui.bpm.addEventListener("input", (e) => {
  const value = Number(e.target.value);
  ui.bpmValue.textContent = String(value);
  game.setBpm(value);
});

ui.easyBtn.addEventListener("click", () => game.setDifficulty("easy"));
ui.normalBtn.addEventListener("click", () => game.setDifficulty("normal"));
ui.hardBtn.addEventListener("click", () => game.setDifficulty("hard"));

ui.soundBtn.addEventListener("click", async () => {
  await game.audio.ensure();
  game.toggleSound();
});

ui.hapticBtn.addEventListener("click", () => game.toggleHaptic());

ui.startBtn.addEventListener("click", () => game.start());
ui.retryBtn.addEventListener("click", () => game.reset());
ui.jumpBtn.addEventListener("click", () => game.onJump());
ui.pauseBtn.addEventListener("click", () => game.togglePause());
ui.resetBtn.addEventListener("click", () => game.reset());

document.addEventListener("keydown", (e) => {
  if (e.code === "Space" || e.code === "Enter") {
    e.preventDefault();
    game.onJump();
  }
});

document.addEventListener("pointerdown", (e) => {
  if (e.target.closest("button") || e.target.closest("input")) return;
  game.onJump();
});

game.reset();
