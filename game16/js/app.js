const LS_BEST = "jump16_best_score_v4";
const LS_SOUND = "jump16_sound_on_v1";

const DIFFICULTY = {
  easy: { hitWindow: 130, scoreMul: 1 },
  normal: { hitWindow: 98, scoreMul: 1.2 },
  hard: { hitWindow: 72, scoreMul: 1.5 }
};

const JUDGE_COLORS = {
  PERFECT: "#ffd166",
  GREAT: "#5cff9d",
  GOOD: "#64b5ff",
  MISS: "#ff5c6c"
};

const MAX_PARTICLES = 64;

const ui = {
  canvas: document.getElementById("game"),
  stageWrap: document.getElementById("stageWrap"),
  score: document.getElementById("score"),
  combo: document.getElementById("combo"),
  best: document.getElementById("best"),
  life: document.getElementById("life"),
  rate: document.getElementById("rate"),
  bpm: document.getElementById("bpm"),
  bpmValue: document.getElementById("bpmValue"),
  easyBtn: document.getElementById("easyBtn"),
  normalBtn: document.getElementById("normalBtn"),
  hardBtn: document.getElementById("hardBtn"),
  overlay: document.getElementById("overlay"),
  overlayTitle: document.getElementById("overlayTitle"),
  overlayText: document.getElementById("overlayText"),
  overlayMeta: document.getElementById("overlayMeta"),
  overlayActions: document.getElementById("overlayActions"),
  startBtn: document.getElementById("startBtn"),
  retryBtn: document.getElementById("retryBtn"),
  jumpBtn: document.getElementById("jumpBtn"),
  pauseBtn: document.getElementById("pauseBtn"),
  resetBtn: document.getElementById("resetBtn"),
  soundBtn: document.getElementById("soundBtn"),
  srStatus: document.getElementById("srStatus")
};

class MiniAudio {
  constructor() {
    this.ctx = null;
    this.enabled = localStorage.getItem(LS_SOUND) !== "0";
  }

  async ensure() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state !== "running") {
      try {
        await this.ctx.resume();
      } catch {
        // Ignore autoplay restrictions until next user gesture
      }
    }
  }

  setEnabled(on) {
    this.enabled = on;
    localStorage.setItem(LS_SOUND, on ? "1" : "0");
  }

  tone(freq, ms, gain = 0.08, type = "sine", delaySec = 0) {
    if (!this.enabled || !this.ctx) return;
    const t = this.ctx.currentTime + delaySec;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + ms / 1000);
    osc.connect(g).connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + ms / 1000 + 0.015);
  }

  tick(isGo = false) {
    if (isGo) {
      this.tone(780, 48, 0.07, "triangle");
    } else {
      this.tone(540, 28, 0.045, "sine");
    }
  }

  success(judge) {
    if (judge === "PERFECT") {
      this.tone(880, 70, 0.11, "triangle", 0);
      this.tone(1174.66, 95, 0.12, "sine", 0.045);
    } else if (judge === "GREAT") {
      this.tone(840, 78, 0.1, "sine");
    } else {
      this.tone(700, 64, 0.085, "sine");
    }
  }

  miss() {
    this.tone(195, 150, 0.12, "sawtooth", 0);
    this.tone(145, 160, 0.1, "triangle", 0.04);
  }
}

class RopeJumpGame {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.audio = new MiniAudio();

    this.state = "ready"; // "ready" | "countdown" | "running" | "paused" | "gameover"
    this.bpm = Number(ui.bpm.value) || 96;
    this.periodMs = 60000 / this.bpm;
    this.difficulty = "easy";
    this.hitWindow = DIFFICULTY[this.difficulty].hitWindow;

    // Unified timing baseline:
    // elapsed = 0 corresponds to the 4th count-in beat ("GO").
    // Count-in beats are k = -3 ("3"), -2 ("2"), -1 ("1"), 0 ("GO").
    // Target rope passes at the feet are k = 1, 2, 3, ... at elapsed = k * periodMs.
    this.startAt = 0;
    this.pauseElapsed = 0;
    this.lastFrameAt = performance.now();

    this.score = 0;
    this.combo = 0;
    this.best = Number(localStorage.getItem(LS_BEST) || 0);
    this.life = 3;
    this.brokenHeartIndex = -1;
    this.brokenHeartTimer = 0;

    this.successCount = 0;
    this.totalAttempts = 0;
    this.judgmentStats = { perfect: 0, great: 0, good: 0, miss: 0 };

    this.lastResolvedBeat = 0;
    this.lastTickBeat = -4;
    this.lastCountLabel = "";
    this.goOverlayVisible = false;

    // Character physics & squash/stretch
    this.jumpY = 0;
    this.jumpV = 0;
    this.gravity = 2500;
    this.jumpPower = -650;
    this.squashTimer = 0;
    this.idleTime = 0;

    // Visual effects
    this.floatingTexts = [];
    this.particles = [];
    this.expandingRings = [];
    this.comboBanner = null;
    this.missEffectTimer = 0;
    this.vignetteTimer = 0;

    this.width = 600;
    this.height = 400;
    this.resize();
    window.addEventListener("resize", () => this.resize());

    this.refreshSoundButton();
    this.reset();
    this.loop();
  }

  resize() {
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const rect = this.canvas.getBoundingClientRect();
    const w = Math.max(200, rect.width);
    const h = Math.max(200, rect.height);
    this.canvas.width = Math.floor(w * dpr);
    this.canvas.height = Math.floor(h * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.width = w;
    this.height = h;
  }

  getElapsed(now = performance.now()) {
    if (this.state === "paused") return this.pauseElapsed;
    if (this.state === "ready" || this.state === "gameover") return 0;
    return now - this.startAt;
  }

  setBpm(v) {
    const clamped = Math.min(150, Math.max(70, Number(v) || 96));
    const now = performance.now();
    const oldPeriod = this.periodMs;
    const newPeriod = 60000 / clamped;

    if (this.state === "running" || this.state === "countdown") {
      const currentBeatFloat = (now - this.startAt) / oldPeriod;
      this.startAt = now - currentBeatFloat * newPeriod;
    } else if (this.state === "paused") {
      const currentBeatFloat = this.pauseElapsed / oldPeriod;
      this.pauseElapsed = currentBeatFloat * newPeriod;
    }

    this.bpm = clamped;
    this.periodMs = newPeriod;
    ui.bpmValue.textContent = String(clamped);
  }

  setDifficulty(level) {
    if (!DIFFICULTY[level]) return;
    this.difficulty = level;
    this.hitWindow = DIFFICULTY[level].hitWindow;
    ui.easyBtn.classList.toggle("active", level === "easy");
    ui.normalBtn.classList.toggle("active", level === "normal");
    ui.hardBtn.classList.toggle("active", level === "hard");
    this.announce(`難易度 ${level.toUpperCase()}`);
  }

  resetStats() {
    this.score = 0;
    this.combo = 0;
    this.life = 3;
    this.brokenHeartIndex = -1;
    this.brokenHeartTimer = 0;
    this.successCount = 0;
    this.totalAttempts = 0;
    this.judgmentStats = { perfect: 0, great: 0, good: 0, miss: 0 };
    this.lastResolvedBeat = 0;
    this.lastTickBeat = -4;
    this.lastCountLabel = "";
    this.goOverlayVisible = false;
    this.jumpY = 0;
    this.jumpV = 0;
    this.squashTimer = 0;
    this.floatingTexts = [];
    this.particles = [];
    this.expandingRings = [];
    this.comboBanner = null;
    this.missEffectTimer = 0;
    this.vignetteTimer = 0;
  }

  async start() {
    await this.audio.ensure();
    this.resetStats();
    const now = performance.now();
    this.state = "countdown";
    // Beat -3 ("3") starts at now; Beat 0 ("GO") is at now + 3 * periodMs;
    // First target rope pass is Beat 1 at now + 4 * periodMs.
    this.startAt = now + 3 * this.periodMs;
    this.pauseElapsed = -3 * this.periodMs;
    ui.pauseBtn.textContent = "一時停止";
    this.updateHUD();
    this.showCountdownOverlay("3");
    this.announce("カウントイン開始");
  }

  async restart() {
    await this.start();
  }

  reset() {
    this.state = "ready";
    this.resetStats();
    ui.pauseBtn.textContent = "一時停止";
    this.updateHUD();
    this.showReadyOverlay();
    this.announce("準備完了");
  }

  togglePause() {
    const now = performance.now();
    if (this.state === "running" || this.state === "countdown") {
      this.pauseElapsed = now - this.startAt;
      this.state = "paused";
      ui.pauseBtn.textContent = "再開";
      this.showPauseOverlay();
      this.announce("一時停止中");
    } else if (this.state === "paused") {
      this.startAt = now - this.pauseElapsed;
      this.state = this.pauseElapsed < 0 ? "countdown" : "running";
      ui.pauseBtn.textContent = "一時停止";
      if (this.state === "running") {
        this.hideOverlay();
      }
      this.announce("再開");
    }
  }

  vibrate(pattern) {
    if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
      try {
        navigator.vibrate(pattern);
      } catch {
        // Ignore unsupported vibration environments
      }
    }
  }

  async onJump() {
    if (this.state === "ready") {
      await this.start();
      return;
    }
    if (this.state === "gameover") {
      await this.restart();
      return;
    }
    if (this.state === "paused") {
      this.togglePause();
      return;
    }
    if (this.state !== "running") return;

    await this.audio.ensure();
    const now = performance.now();
    const elapsed = this.getElapsed(now);
    const beatFloat = elapsed / this.periodMs;

    // Ignore presses during the first half of the "GO" beat before the rope passes overhead for beat 1
    if (beatFloat < 0.5) return;

    const beatIndex = Math.max(1, Math.round(beatFloat));
    if (beatIndex <= this.lastResolvedBeat) return;

    const beatTime = beatIndex * this.periodMs;
    const signedDelta = elapsed - beatTime;
    const absDelta = Math.abs(signedDelta);

    this.totalAttempts += 1;

    if (absDelta <= this.hitWindow) {
      const ratio = absDelta / this.hitWindow;
      const judge = ratio <= 0.35 ? "PERFECT" : ratio <= 0.72 ? "GREAT" : "GOOD";
      const mul = DIFFICULTY[this.difficulty].scoreMul;

      this.combo += 1;
      this.score += Math.round((100 + this.combo * 10) * mul);
      if (this.score > this.best) {
        this.best = this.score;
        localStorage.setItem(LS_BEST, String(this.best));
      }

      this.successCount += 1;
      this.lastResolvedBeat = beatIndex;
      this.missEffectTimer = 0;

      if (judge === "PERFECT") this.judgmentStats.perfect += 1;
      else if (judge === "GREAT") this.judgmentStats.great += 1;
      else this.judgmentStats.good += 1;

      // Jump physics
      this.jumpV = this.jumpPower;
      this.jumpY = Math.min(this.jumpY, -2);

      // Visual & audio feedback
      this.spawnFloatingJudge(judge, JUDGE_COLORS[judge]);
      if (judge === "PERFECT") {
        this.spawnPerfectEffects();
      }
      if (this.combo === 10 || this.combo === 20 || this.combo === 30 || (this.combo > 30 && this.combo % 10 === 0)) {
        this.triggerComboBanner(this.combo);
      }

      this.audio.success(judge);
      this.vibrate(12);
    } else {
      const subLabel = signedDelta < 0 ? "EARLY" : "LATE";
      this.registerMiss("MISS", beatIndex, subLabel);
    }

    this.updateHUD();
  }

  registerMiss(text, beatIndex, subLabel = "") {
    this.combo = 0;
    const lostIndex = Math.max(0, this.life - 1);
    this.life = Math.max(0, this.life - 1);
    this.brokenHeartIndex = lostIndex;
    this.brokenHeartTimer = 0.6;

    this.judgmentStats.miss += 1;
    this.lastResolvedBeat = Math.max(this.lastResolvedBeat, beatIndex);

    this.missEffectTimer = 0.55;
    this.vignetteTimer = 0.42;

    const displayLabel = subLabel ? `MISS (${subLabel})` : text;
    this.spawnFloatingJudge(displayLabel, JUDGE_COLORS.MISS);
    this.audio.miss();
    this.vibrate([25, 30, 25]);
    this.updateHUD();

    if (this.life <= 0) {
      this.gameOver();
    }
  }

  gameOver() {
    this.state = "gameover";
    this.goOverlayVisible = false;
    if (this.score > this.best) {
      this.best = this.score;
    }
    localStorage.setItem(LS_BEST, String(this.best));
    this.updateHUD();
    this.showGameOverOverlay();
    this.announce(`ゲームオーバー。スコア ${this.score}`);
  }

  spawnFloatingJudge(text, color) {
    this.floatingTexts.push({
      text,
      color,
      age: 0,
      duration: 0.72
    });
    if (this.floatingTexts.length > 6) {
      this.floatingTexts.shift();
    }
  }

  spawnPerfectEffects() {
    const cx = this.width * 0.5;
    const groundY = this.height * 0.77;

    this.expandingRings.push({
      x: cx,
      y: groundY,
      age: 0,
      duration: 0.52,
      maxRadius: 92
    });

    const count = 16;
    for (let i = 0; i < count; i += 1) {
      if (this.particles.length >= MAX_PARTICLES) {
        this.particles.shift();
      }
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.25;
      const speed = 90 + Math.random() * 140;
      this.particles.push({
        x: cx + (Math.random() - 0.5) * 20,
        y: groundY - 12 + (Math.random() - 0.5) * 12,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 70,
        size: 3 + Math.random() * 3.5,
        age: 0,
        duration: 0.45 + Math.random() * 0.25,
        color: i % 2 === 0 ? "#ffd166" : "#fff1a8"
      });
    }
  }

  triggerComboBanner(comboCount) {
    this.comboBanner = {
      text: `${comboCount} COMBO!`,
      age: 0,
      duration: 1.35
    };
  }

  updateHUD() {
    const rate = this.totalAttempts === 0 ? 0 : Math.round((this.successCount / this.totalAttempts) * 100);
    ui.score.textContent = String(this.score);
    ui.combo.textContent = String(this.combo);
    ui.best.textContent = String(this.best);
    ui.rate.textContent = `${rate}%`;

    // Render hearts with breaking state in HUD
    ui.life.innerHTML = "";
    ui.life.setAttribute("aria-label", `残りライフ${this.life}`);
    for (let i = 0; i < 3; i += 1) {
      const span = document.createElement("span");
      if (i < this.life) {
        span.className = "heart active";
        span.textContent = "❤";
      } else if (i === this.brokenHeartIndex && this.brokenHeartTimer > 0) {
        span.className = "heart breaking";
        span.textContent = "💔";
      } else {
        span.className = "heart lost";
        span.textContent = "💔";
      }
      ui.life.appendChild(span);
    }
  }

  showReadyOverlay() {
    ui.overlay.classList.remove("countdown-mode");
    ui.overlayTitle.textContent = "タップ / Space で開始";
    ui.overlayText.textContent = "縄が足元に来る瞬間にタップ";
    ui.overlayMeta.hidden = true;
    ui.overlayActions.hidden = false;
    ui.startBtn.hidden = false;
    ui.retryBtn.hidden = true;
    ui.overlay.style.display = "grid";
  }

  showCountdownOverlay(label) {
    ui.overlay.classList.add("countdown-mode");
    ui.overlayTitle.textContent = label;
    ui.overlayText.textContent = label === "GO" ? "次の拍でジャンプ！" : "リズムに合わせて準備";
    ui.overlayMeta.hidden = true;
    ui.overlayActions.hidden = true;
    ui.overlay.style.display = "grid";
  }

  showPauseOverlay() {
    ui.overlay.classList.remove("countdown-mode");
    ui.overlayTitle.textContent = "一時停止中";
    ui.overlayText.textContent = "タップ / Space または「一時停止」ボタンで再開";
    ui.overlayMeta.hidden = true;
    ui.overlayActions.hidden = true;
    ui.overlay.style.display = "grid";
  }

  showGameOverOverlay() {
    ui.overlay.classList.remove("countdown-mode");
    ui.overlayTitle.textContent = "GAME OVER";
    ui.overlayText.textContent = "縄が足元に来る瞬間にタップ";
    ui.overlayMeta.hidden = false;
    ui.overlayMeta.innerHTML = `
      <div class="stats-score-row">
        <span>Score: <strong>${this.score}</strong></span>
        <span>Best: <strong>${this.best}</strong></span>
      </div>
      <div class="stats-grid">
        <div class="stat-item perfect"><span>PERFECT</span><span>${this.judgmentStats.perfect}</span></div>
        <div class="stat-item great"><span>GREAT</span><span>${this.judgmentStats.great}</span></div>
        <div class="stat-item good"><span>GOOD</span><span>${this.judgmentStats.good}</span></div>
        <div class="stat-item miss"><span>MISS</span><span>${this.judgmentStats.miss}</span></div>
      </div>
    `;
    ui.overlayActions.hidden = false;
    ui.startBtn.hidden = true;
    ui.retryBtn.hidden = false;
    ui.overlay.style.display = "grid";
  }

  hideOverlay() {
    ui.overlay.classList.remove("countdown-mode");
    ui.overlay.style.display = "none";
  }

  toggleSound() {
    const next = !this.audio.enabled;
    this.audio.setEnabled(next);
    this.refreshSoundButton();
    this.announce(next ? "サウンド ON" : "サウンド OFF");
  }

  refreshSoundButton() {
    ui.soundBtn.textContent = this.audio.enabled ? "🔊 Sound ON" : "🔇 Sound OFF";
    ui.soundBtn.setAttribute("aria-pressed", this.audio.enabled ? "true" : "false");
  }

  announce(text) {
    ui.srStatus.textContent = text;
  }

  updateEffects(dt) {
    this.idleTime += dt;

    if (this.squashTimer > 0) {
      this.squashTimer = Math.max(0, this.squashTimer - dt);
    }
    if (this.missEffectTimer > 0) {
      this.missEffectTimer = Math.max(0, this.missEffectTimer - dt);
    }
    if (this.vignetteTimer > 0) {
      this.vignetteTimer = Math.max(0, this.vignetteTimer - dt);
    }
    if (this.brokenHeartTimer > 0) {
      this.brokenHeartTimer = Math.max(0, this.brokenHeartTimer - dt);
      if (this.brokenHeartTimer === 0) {
        this.brokenHeartIndex = -1;
        this.updateHUD();
      }
    }

    // Character jump physics
    if (this.jumpY < 0 || this.jumpV !== 0) {
      this.jumpV += this.gravity * dt;
      this.jumpY += this.jumpV * dt;
      if (this.jumpY >= 0) {
        this.jumpY = 0;
        this.jumpV = 0;
        this.squashTimer = 0.16;
      }
    }

    // Floating judgment texts
    for (let i = this.floatingTexts.length - 1; i >= 0; i -= 1) {
      this.floatingTexts[i].age += dt;
      if (this.floatingTexts[i].age >= this.floatingTexts[i].duration) {
        this.floatingTexts.splice(i, 1);
      }
    }

    // Expanding rings
    for (let i = this.expandingRings.length - 1; i >= 0; i -= 1) {
      this.expandingRings[i].age += dt;
      if (this.expandingRings[i].age >= this.expandingRings[i].duration) {
        this.expandingRings.splice(i, 1);
      }
    }

    // Particles
    for (let i = this.particles.length - 1; i >= 0; i -= 1) {
      const p = this.particles[i];
      p.age += dt;
      if (p.age >= p.duration) {
        this.particles.splice(i, 1);
        continue;
      }
      p.vy += 420 * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
    }

    // Combo banner
    if (this.comboBanner) {
      this.comboBanner.age += dt;
      if (this.comboBanner.age >= this.comboBanner.duration) {
        this.comboBanner = null;
      }
    }
  }

  update(dt, now) {
    this.updateEffects(dt);

    if (this.state !== "countdown" && this.state !== "running") return;

    const elapsed = this.getElapsed(now);
    const beatFloat = elapsed / this.periodMs;
    const currentBeat = Math.floor(beatFloat);

    // Trigger beat tick sound on each beat (-3, -2, -1, 0, 1, 2, ...)
    if (currentBeat > this.lastTickBeat) {
      this.lastTickBeat = currentBeat;
      if (currentBeat >= -3) {
        this.audio.tick(currentBeat === 0);
      }
    }

    // 4-beat count-in handling: -3 -> "3", -2 -> "2", -1 -> "1", 0 -> "GO"
    if (beatFloat < 0) {
      const countNum = Math.min(3, Math.max(1, -currentBeat));
      const label = String(countNum);
      if (this.lastCountLabel !== label) {
        this.lastCountLabel = label;
        this.showCountdownOverlay(label);
      }
      return;
    }

    // Transition from countdown to running at beat 0 ("GO")
    if (this.state === "countdown") {
      this.state = "running";
      this.lastCountLabel = "GO";
      this.goOverlayVisible = true;
      this.showCountdownOverlay("GO");
      this.announce("GO");
    }

    // Hide "GO" overlay cleanly before the first target beat arrives at beatFloat = 1.0
    if (this.goOverlayVisible && beatFloat >= 0.62) {
      this.goOverlayVisible = false;
      this.hideOverlay();
    }

    // Check if an unresolved target beat (k >= 1) passed its hitWindow without input
    const nextUnresolvedBeat = Math.max(1, this.lastResolvedBeat + 1);
    if (elapsed > nextUnresolvedBeat * this.periodMs + this.hitWindow) {
      this.totalAttempts += 1;
      this.registerMiss("MISS", nextUnresolvedBeat);
    }
  }

  drawBackground(ctx, w, h, groundY) {
    // Sky gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, groundY);
    skyGrad.addColorStop(0, "#0f1c3f");
    skyGrad.addColorStop(0.6, "#192d5c");
    skyGrad.addColorStop(1, "#243b70");
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, groundY);

    // Subtle distant horizon glow
    ctx.fillStyle = "rgba(255, 209, 102, 0.06)";
    ctx.fillRect(0, groundY - 24, w, 24);

    // Ground surface
    const groundGrad = ctx.createLinearGradient(0, groundY, 0, h);
    groundGrad.addColorStop(0, "#182549");
    groundGrad.addColorStop(1, "#0d152b");
    ctx.fillStyle = groundGrad;
    ctx.fillRect(0, groundY, w, h - groundY);

    // Main ground line
    ctx.strokeStyle = "#3c528f";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.lineTo(w, groundY);
    ctx.stroke();

    // Court baseline markings
    ctx.strokeStyle = "rgba(159, 176, 217, 0.18)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(w * 0.15, groundY + 26);
    ctx.lineTo(w * 0.85, groundY + 26);
    ctx.stroke();
  }

  drawShrinkingGuideRing(ctx, centerX, groundY, phase) {
    // Shrinking ring at the character's feet:
    // phase is in [0, 1). Rope passes the feet at phase = 0 (and phase -> 1).
    // remaining = 1 - phase goes from 1 -> 0, coinciding with the feet point at the exact pass instant.
    const isRunningOrCount = this.state === "running" || this.state === "countdown" || this.state === "paused";
    const remaining = isRunningOrCount ? 1 - phase : 0.5 + 0.35 * Math.sin(this.idleTime * 3);

    const maxRingR = 54;
    const dotR = 6;
    const currentR = dotR + remaining * (maxRingR - dotR);

    // Check if we are currently inside the hit window around the beat (phase near 0 or 1)
    const distToBeatRatio = Math.min(phase, 1 - phase);
    const hitWindowRatio = this.hitWindow / this.periodMs;
    const inHitZone = isRunningOrCount && distToBeatRatio <= hitWindowRatio;

    ctx.save();
    // Guide perspective: slightly flattened ellipse centered right on the feet point (centerX, groundY)
    ctx.translate(centerX, groundY);
    ctx.scale(1, 0.52);

    // Outer reference ring
    ctx.strokeStyle = "rgba(159, 176, 217, 0.22)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, maxRingR, 0, Math.PI * 2);
    ctx.stroke();

    // Shrinking timing ring
    ctx.strokeStyle = inHitZone ? "#ffd166" : "#4df2c3";
    ctx.lineWidth = inHitZone ? 4.5 : 3;
    ctx.globalAlpha = isRunningOrCount ? Math.min(1, 0.35 + (1 - remaining) * 0.65) : 0.55;
    ctx.beginPath();
    ctx.arc(0, 0, currentR, 0, Math.PI * 2);
    ctx.stroke();

    // Target feet point (center dot + crisp ring)
    ctx.globalAlpha = 1;
    ctx.fillStyle = inHitZone ? "#ffd166" : "#ffffff";
    ctx.beginPath();
    ctx.arc(0, 0, dotR, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#ffd166";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(0, 0, dotR + 3, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  }

  getRopePoint(centerX, pivotY, rx, ry, phase) {
    // Side-view loop around the character:
    // phase = 0.0 -> bottom at feet (centerX, pivotY + ry = groundY)
    // phase = 0.25 -> behind character (left: centerX - rx, pivotY) going up
    // phase = 0.5 -> overhead (top: centerX, pivotY - ry)
    // phase = 0.75 -> in front of character (right: centerX + rx, pivotY) going down
    const angle = phase * Math.PI * 2;
    return {
      x: centerX - Math.sin(angle) * rx,
      y: pivotY + Math.cos(angle) * ry,
      angle
    };
  }

  drawRopeStrand(ctx, handX, handY, tipX, tipY, pivotY, color, width, alpha = 1) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = "round";

    // Control point arches outward so the rope forms a natural curved loop from handle to tip
    const ctrlX = handX + (tipX - handX) * 0.68;
    const ctrlY = pivotY + (tipY - pivotY) * 1.08;

    ctx.beginPath();
    ctx.moveTo(handX, handY);
    ctx.quadraticCurveTo(ctrlX, ctrlY, tipX, tipY);
    ctx.stroke();
    ctx.restore();
  }

  drawRopeOrbitAndGhosts(ctx, centerX, pivotY, rx, ry, handFar, handNear, phase) {
    // Subtle orbit guide showing overhead vs feet trajectory
    ctx.save();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([5, 6]);
    ctx.beginPath();
    ctx.ellipse(centerX, pivotY, rx, ry, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Small overhead marker at phase = 0.5 (top of orbit)
    ctx.fillStyle = "rgba(159, 176, 217, 0.35)";
    ctx.beginPath();
    ctx.arc(centerX, pivotY - ry, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    if (this.state === "ready" || this.missEffectTimer > 0 || this.state === "gameover") return;

    // Ghost / afterimage trails (emphasized near the feet pass)
    const nearFeet = Math.min(phase, 1 - phase) < 0.2;
    const ghostSteps = nearFeet ? [0.025, 0.05, 0.08, 0.115] : [0.03, 0.065, 0.1];

    ghostSteps.forEach((step, idx) => {
      const gp = ((phase - step) % 1 + 1) % 1;
      const pt = this.getRopePoint(centerX, pivotY, rx, ry, gp);
      const baseAlpha = nearFeet ? 0.36 - idx * 0.075 : 0.22 - idx * 0.06;
      const ghostColor = nearFeet ? "#ffd166" : "#89f8de";

      // Draw ghost loop arc and tip bead
      this.drawRopeStrand(ctx, handNear.x, handNear.y, pt.x, pt.y, pivotY, ghostColor, 3 - idx * 0.4, Math.max(0.05, baseAlpha));
      ctx.save();
      ctx.globalAlpha = Math.max(0.06, baseAlpha * 1.2);
      ctx.fillStyle = ghostColor;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 4.5 - idx * 0.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  drawTangledRope(ctx, centerX, groundY, handFar, handNear) {
    // Rope stopped and tangled around the feet on miss
    ctx.save();
    ctx.strokeStyle = "#ff7a85";
    ctx.lineWidth = 4;
    ctx.lineCap = "round";

    ctx.beginPath();
    ctx.moveTo(handFar.x, handFar.y);
    ctx.quadraticCurveTo(centerX - 28, groundY - 18, centerX - 10, groundY - 4);
    ctx.bezierCurveTo(centerX + 22, groundY - 16, centerX - 24, groundY - 2, centerX + 14, groundY + 2);
    ctx.quadraticCurveTo(centerX + 26, groundY - 14, handNear.x, handNear.y);
    ctx.stroke();

    // Tangled loop at ankles
    ctx.strokeStyle = "#ffd166";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(centerX + 2, groundY - 7, 18, 7, -0.15, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  drawCharacterAndRope(ctx, centerX, groundY, phase) {
    const ry = Math.min(72, Math.max(54, this.height * 0.19));
    const rx = ry * 0.88;
    const pivotY = groundY - ry;

    // Idle bobbing vs Jump / Squash-and-stretch / Miss stumble
    const isIdle = this.state === "ready" || this.state === "countdown";
    const idleBob = isIdle ? Math.sin(this.idleTime * 6.5) * 3 : 0;
    const charY = groundY + this.jumpY + idleBob;

    let scaleX = 1;
    let scaleY = 1;
    if (this.jumpY < -8) {
      // Airborne stretch
      const stretch = Math.min(0.12, Math.abs(this.jumpV) / 5500);
      scaleX = 1 - stretch * 0.7;
      scaleY = 1 + stretch;
    } else if (this.squashTimer > 0) {
      // Landing squash
      const s = Math.sin((this.squashTimer / 0.16) * Math.PI);
      scaleX = 1 + s * 0.18;
      scaleY = 1 - s * 0.16;
    }

    const isStumbling = this.missEffectTimer > 0 || this.state === "gameover";
    const stumbleTilt = isStumbling
      ? 0.22 + Math.sin(this.missEffectTimer * 28) * 0.08
      : 0;

    // Wrist circular motion in sync with phase
    const wristAngle = phase * Math.PI * 2;
    const wristOffsetX = -Math.sin(wristAngle) * 5;
    const wristOffsetY = Math.cos(wristAngle) * 5;

    const handFar = {
      x: centerX - 10 + wristOffsetX,
      y: charY - 52 * scaleY + wristOffsetY
    };
    const handNear = {
      x: centerX + 16 + wristOffsetX,
      y: charY - 48 * scaleY + wristOffsetY
    };

    // Current rope tip position
    const activePhase = this.state === "ready" ? 0.15 : phase;
    const ropeTip = this.getRopePoint(centerX, pivotY, rx, ry, activePhase);

    // 1. Ground shadow under character
    const shadowScale = Math.max(0.45, 1 + this.jumpY / 180);
    ctx.fillStyle = "rgba(4, 8, 20, 0.42)";
    ctx.beginPath();
    ctx.ellipse(centerX, groundY + 3, 26 * shadowScale, 7 * shadowScale, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. Orbit guide and ghost trails
    this.drawRopeOrbitAndGhosts(ctx, centerX, pivotY, rx, ry, handFar, handNear, activePhase);

    // 3. Far strand of rope (drawn behind the character)
    if (!isStumbling) {
      this.drawRopeStrand(ctx, handFar.x, handFar.y, ropeTip.x, ropeTip.y, pivotY, "#d9b458", 3.2, 0.75);
    }

    // 4. Character (Side-view profile facing right)
    ctx.save();
    ctx.translate(centerX, charY);
    ctx.rotate(stumbleTilt);
    ctx.scale(scaleX, scaleY);

    const airborne = this.jumpY < -10;
    const kneeBend = airborne ? 14 : isIdle ? Math.max(0, Math.sin(this.idleTime * 6.5) * 3) : 0;

    // Far arm & far handle (behind torso)
    ctx.strokeStyle = "#3b9b8e";
    ctx.lineWidth = 7;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(-4, -66);
    ctx.lineTo(-12, -54);
    ctx.lineTo(-10 + wristOffsetX, -52 + wristOffsetY);
    ctx.stroke();

    // Far rope handle
    ctx.fillStyle = "#ff6b6b";
    ctx.fillRect(-14 + wristOffsetX, -55 + wristOffsetY, 9, 5);

    // Far leg (behind)
    ctx.strokeStyle = "#253659";
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(-4, -34);
    ctx.lineTo(-2 + kneeBend * 0.5, -17 - kneeBend * 0.4);
    ctx.lineTo(-6 - kneeBend * 0.4, -3 - kneeBend * 0.65);
    ctx.stroke();

    // Far shoe
    ctx.fillStyle = "#9fb0d9";
    ctx.beginPath();
    ctx.ellipse(-2 - kneeBend * 0.4, -3 - kneeBend * 0.65, 8, 4.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Torso (sporty jersey)
    ctx.fillStyle = "#4df2c3";
    ctx.beginPath();
    ctx.roundRect(-14, -74, 28, 42, 10);
    ctx.fill();

    // Jersey chest stripe
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(-13, -58, 26, 6);

    // Near leg (front)
    ctx.strokeStyle = "#334b7a";
    ctx.lineWidth = 8.5;
    ctx.beginPath();
    ctx.moveTo(3, -34);
    ctx.lineTo(7 + kneeBend * 0.6, -17 - kneeBend * 0.45);
    ctx.lineTo(2 - kneeBend * 0.35, -3 - kneeBend * 0.7);
    ctx.stroke();

    // Near shoe
    ctx.fillStyle = "#ffd166";
    ctx.beginPath();
    ctx.ellipse(6 - kneeBend * 0.35, -3 - kneeBend * 0.7, 9, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Head
    ctx.fillStyle = "#ffe3d3";
    ctx.beginPath();
    ctx.arc(1, -91, 15.5, 0, Math.PI * 2);
    ctx.fill();

    // Sport headband
    ctx.fillStyle = "#ff5c6c";
    ctx.fillRect(-14, -99, 30, 5.5);
    // Headband tails fluttering behind (left)
    ctx.beginPath();
    ctx.moveTo(-14, -97);
    ctx.lineTo(-23, -101 + Math.sin(this.idleTime * 10) * 2);
    ctx.lineTo(-21, -93 + Math.sin(this.idleTime * 10) * 2);
    ctx.closePath();
    ctx.fill();

    // Eye (facing right)
    ctx.strokeStyle = "#121b36";
    ctx.fillStyle = "#121b36";
    if (isStumbling) {
      // Wince ">" eye on miss
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(6, -93);
      ctx.lineTo(11, -90);
      ctx.lineTo(6, -87);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.arc(8.5, -90, 2.3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Near arm & near handle (in front of torso)
    ctx.strokeStyle = "#ffe3d3";
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(2, -65);
    ctx.lineTo(9, -52);
    ctx.lineTo(16 + wristOffsetX, -48 + wristOffsetY);
    ctx.stroke();

    // Near rope handle
    ctx.fillStyle = "#ff5c6c";
    ctx.beginPath();
    ctx.roundRect(13 + wristOffsetX, -51 + wristOffsetY, 11, 6, 2);
    ctx.fill();

    // Sweat drops on miss/stumble
    if (isStumbling) {
      ctx.fillStyle = "#64b5ff";
      const dropOffset = (1 - (this.missEffectTimer / 0.55)) * 10;
      ctx.beginPath();
      ctx.arc(-16, -104 + dropOffset, 3.2, 0, Math.PI * 2);
      ctx.arc(19, -101 + dropOffset * 0.8, 2.6, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();

    // 5. Near strand of rope & bright loop tip (drawn in front of character)
    if (isStumbling) {
      this.drawTangledRope(ctx, centerX, groundY, handFar, handNear);
    } else {
      const distToFeet = Math.min(activePhase, 1 - activePhase);
      const ropeColor = distToFeet < 0.08 ? "#ffffff" : "#ffd166";
      this.drawRopeStrand(ctx, handNear.x, handNear.y, ropeTip.x, ropeTip.y, pivotY, ropeColor, 4.2, 1);

      // Highlighted rope tip bead so the player can clearly see overhead vs feet position
      ctx.save();
      ctx.fillStyle = ropeColor;
      ctx.shadowColor = "#ffd166";
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(ropeTip.x, ropeTip.y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  drawEffectsAndHUDCanvas(ctx, w, h, centerX, groundY) {
    // Expanding golden rings (PERFECT)
    this.expandingRings.forEach((ring) => {
      const t = ring.age / ring.duration;
      const r = 10 + t * ring.maxRadius;
      ctx.save();
      ctx.translate(ring.x, ring.y);
      ctx.scale(1, 0.52);
      ctx.strokeStyle = "#ffd166";
      ctx.lineWidth = 4 * (1 - t);
      ctx.globalAlpha = Math.max(0, 1 - t);
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    });

    // Golden particles (PERFECT)
    this.particles.forEach((p) => {
      const alpha = Math.max(0, 1 - p.age / p.duration);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // Floating judgment text above the character
    this.floatingTexts.forEach((item) => {
      const t = item.age / item.duration;
      const floatY = groundY - 150 - t * 34;
      const alpha = t < 0.2 ? t / 0.2 : Math.max(0, 1 - (t - 0.2) / 0.8);
      const scale = t < 0.15 ? 0.85 + (t / 0.15) * 0.25 : 1.05;

      ctx.save();
      ctx.translate(centerX, floatY);
      ctx.scale(scale, scale);
      ctx.globalAlpha = alpha;
      ctx.font = "900 26px sans-serif";
      ctx.textAlign = "center";
      ctx.strokeStyle = "rgba(8, 13, 26, 0.85)";
      ctx.lineWidth = 5;
      ctx.strokeText(item.text, 0, 0);
      ctx.fillStyle = item.color;
      ctx.fillText(item.text, 0, 0);
      ctx.restore();
    });

    // Combo milestone banner (10 / 20 / 30...)
    if (this.comboBanner) {
      const b = this.comboBanner;
      const t = b.age / b.duration;
      const alpha = t < 0.15 ? t / 0.15 : t > 0.8 ? Math.max(0, (1 - t) / 0.2) : 1;
      const bannerY = 36;

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = "rgba(255, 209, 102, 0.18)";
      ctx.strokeStyle = "#ffd166";
      ctx.lineWidth = 2;
      const bw = 180;
      const bh = 34;
      ctx.beginPath();
      ctx.roundRect(centerX - bw / 2, bannerY - bh / 2, bw, bh, 999);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#ffd166";
      ctx.font = "900 18px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(b.text, centerX, bannerY);
      ctx.restore();
    }

    // Red edge vignette on miss
    if (this.vignetteTimer > 0) {
      const intensity = (this.vignetteTimer / 0.42) * 0.55;
      const radGrad = ctx.createRadialGradient(
        w * 0.5,
        h * 0.5,
        Math.min(w, h) * 0.25,
        w * 0.5,
        h * 0.5,
        Math.max(w, h) * 0.72
      );
      radGrad.addColorStop(0, "rgba(255, 60, 80, 0)");
      radGrad.addColorStop(1, `rgba(255, 50, 70, ${intensity.toFixed(3)})`);
      ctx.fillStyle = radGrad;
      ctx.fillRect(0, 0, w, h);
    }
  }

  draw(now) {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;
    ctx.clearRect(0, 0, w, h);

    const groundY = Math.floor(h * 0.77);
    const centerX = Math.floor(w * 0.5);

    const elapsed = this.getElapsed(now);
    const beatFloat = elapsed / this.periodMs;
    const phase = ((beatFloat % 1) + 1) % 1;

    this.drawBackground(ctx, w, h, groundY);
    this.drawShrinkingGuideRing(ctx, centerX, groundY, phase);
    this.drawCharacterAndRope(ctx, centerX, groundY, phase);
    this.drawEffectsAndHUDCanvas(ctx, w, h, centerX, groundY);
  }

  loop() {
    const frame = (now) => {
      const rawDt = (now - this.lastFrameAt) / 1000;
      this.lastFrameAt = now;

      // Clamp dt so returning from a background tab does not cause runaway misses
      const dt = Math.min(0.05, Math.max(0, rawDt));
      if (rawDt > 0.1 && (this.state === "running" || this.state === "countdown")) {
        this.startAt += (rawDt - dt) * 1000;
      }

      this.update(dt, now);
      this.draw(now);
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }
}

const game = new RopeJumpGame(ui.canvas);

// Controls binding
ui.bpm.addEventListener("input", (e) => {
  game.setBpm(Number(e.target.value));
});

ui.easyBtn.addEventListener("click", () => game.setDifficulty("easy"));
ui.normalBtn.addEventListener("click", () => game.setDifficulty("normal"));
ui.hardBtn.addEventListener("click", () => game.setDifficulty("hard"));

ui.startBtn.addEventListener("click", () => game.start());
ui.retryBtn.addEventListener("click", () => game.restart());

ui.pauseBtn.addEventListener("click", () => game.togglePause());
ui.resetBtn.addEventListener("click", () => game.reset());

ui.soundBtn.addEventListener("click", async () => {
  await game.audio.ensure();
  game.toggleSound();
});

// Low-latency jump button input (prevent duplicate click firing)
ui.jumpBtn.addEventListener("pointerdown", (e) => {
  e.preventDefault();
  game.onJump();
});

// Stage tap input (excluding buttons inside the overlay card)
ui.stageWrap.addEventListener("pointerdown", (e) => {
  if (e.target.closest("button") || e.target.closest("input")) return;
  game.onJump();
});

// Space / Enter keyboard jump input
document.addEventListener("keydown", (e) => {
  if (e.code === "Space" || e.code === "Enter") {
    e.preventDefault();
    if (e.repeat) return;
    game.onJump();
  }
});
