class PendulumWaveSimulation {
  constructor() {
    this.canvas = document.getElementById('simulationCanvas');
    this.ctx = this.canvas.getContext('2d');

    // 定義データ（提供JSONに準拠）
    this.presets = {
      calm: {
        N: 12,
        T_return: 8.0,
        amplitude: 30,
        speed: 0.5,
        periodPoints: { left: 9.0, center: 8.2, right: 7.4 },
      },
      classic: {
        N: 36,
        T_return: 6.0,
        amplitude: 50,
        speed: 1.0,
        periodPoints: { left: 6.0, center: 5.0, right: 4.0 },
      },
      dense: {
        N: 72,
        T_return: 4.0,
        amplitude: 60,
        speed: 1.5,
        periodPoints: { left: 4.5, center: 3.6, right: 2.8 },
      },
      async: {
        N: 36,
        T_return: 0,
        amplitude: 45,
        speed: 1.2,
        periodPoints: { left: 5.5, center: 3.0, right: 4.8 },
      },
    };

    this.layout = {
      pendulum_width: 0.42,
      strip_width: 0.08,
      wave_width: 0.5,
    };

    this.visual = {
      dot_radius: 3,
      line_width: 2,
      color_saturation: 70,
      color_lightness: 60,
    };

    this.buffers = {
      max_wave_samples: 150,
    };

    // 物理定数
    this.g = 9.81;

    // 状態
    this.isPlaying = true;
    this.time = 0;
    this.lastTime = 0;

    // パラメータ（初期値）
    this.N = 8;
    this.T_return = 6.0;
    this.amplitude = 100; // px
    this.speed = 1.0;
    this.periodSliderLimits = { min: 0.5, max: 12, step: 0.1 };
    this.periodPoints = { left: 6.0, center: 5.2, right: 4.4 };
    this.phasePreset = 'uniform';
    this.activePhasePreset = 'uniform';
    this.phaseValues = [];
    this.phasePresetDirty = false;

    // データ構造
    this.pendulums = []; // {x, omega, phi, period}
    this.waveBuffers = []; // 各振り子ごとの波形バッファ配列

    // レイアウト座標
    this.pendulumRegionWidth = this.layout.pendulum_width;
    this.stripRegionWidth = this.layout.strip_width;
    this.waveRegionWidth = this.layout.wave_width;

    this.setupCanvas();
    this.setupEventListeners();
    document.getElementById('returnTimeValue').textContent = `${this.T_return.toFixed(1)}s`;
    this.updatePeriodPointsFromReturnTime({ syncUI: true });
    this.calculatePendulums();
    this.applyPhasePreset({ force: true });
    this.initBuffers();
    this.startAnimation();
  }

  setupCanvas() {
    const resize = () => {
      const rect = this.canvas.parentElement.getBoundingClientRect();
      this.canvasWidth = rect.width;
      this.canvasHeight = rect.height;
      this.canvas.width = this.canvasWidth;
      this.canvas.height = this.canvasHeight;

      // 領域の境界X座標
      this.stripX = this.canvasWidth * this.pendulumRegionWidth; // 左→中央の境界
      this.stripWidth = this.canvasWidth * this.stripRegionWidth; // 中央の幅
      this.waveX = this.stripX + this.stripWidth; // 中央→右の境界

      // ペンデュラム中心Y
      this.pendulumY = this.canvasHeight * 0.5;

      // レイアウトに合わせてX座標を再計算
      this.calculatePendulums();
      // バッファはサンプル数固定のためクリアのみ
      this.initBuffers();
    };

    window.addEventListener('resize', resize);
    resize();
  }

  setupEventListeners() {
    const playPauseBtn = document.getElementById('playPauseBtn');
    const playPauseText = document.getElementById('playPauseText');

    playPauseBtn.addEventListener('click', () => {
      const wasPlaying = this.isPlaying;
      this.isPlaying = !this.isPlaying;
      playPauseText.textContent = this.isPlaying ? '一時停止' : '再生';
      playPauseBtn.className = this.isPlaying ? 'btn btn--primary' : 'btn btn--primary paused';
      if (!wasPlaying && this.isPlaying && this.phasePresetDirty) {
        this.time = 0;
        this.initBuffers();
        this.applyPhasePreset({ force: true });
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        playPauseBtn.click();
      }
    });

    document.getElementById('resetBtn').addEventListener('click', () => {
      this.time = 0;
      this.initBuffers();
      this.applyPhasePreset({ force: true });
    });

    // スライダー
    this.setupSlider('pendulumCount', 'pendulumCountValue', (v) => {
      this.N = parseInt(v, 10);
      this.calculatePendulums();
      this.applyPhasePreset({ force: true, preset: this.activePhasePreset, preserveDirty: true });
      this.initBuffers();
    });

    this.setupSlider(
      'returnTime',
      'returnTimeValue',
      (v) => {
        this.T_return = parseFloat(v);
        this.updatePeriodPointsFromReturnTime({ syncUI: true });
        this.calculatePendulums();
      },
      (v) => `${parseFloat(v).toFixed(1)}s`
    );

    this.setupSlider('amplitude', 'amplitudeValue', (v) => {
      this.amplitude = parseInt(v, 10);
    });

    this.setupSlider(
      'speed',
      'speedValue',
      (v) => {
        this.speed = parseFloat(v);
      },
      (v) => `${v}x`
    );

    this.setupSlider(
      'periodLeft',
      'periodLeftValue',
      (v) => {
        this.periodPoints.left = this.clampPeriodValue(parseFloat(v));
        this.calculatePendulums();
      },
      (v) => `${parseFloat(v).toFixed(2)}s`
    );

    this.setupSlider(
      'periodCenter',
      'periodCenterValue',
      (v) => {
        this.periodPoints.center = this.clampPeriodValue(parseFloat(v));
        this.calculatePendulums();
      },
      (v) => `${parseFloat(v).toFixed(2)}s`
    );

    this.setupSlider(
      'periodRight',
      'periodRightValue',
      (v) => {
        this.periodPoints.right = this.clampPeriodValue(parseFloat(v));
        this.calculatePendulums();
      },
      (v) => `${parseFloat(v).toFixed(2)}s`
    );

    // プリセット
    document.querySelectorAll('.preset-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const p = this.presets[btn.dataset.preset];
        this.applyPreset(p);
      });
    });

    const phasePresetSelect = document.getElementById('phasePreset');
    if (phasePresetSelect) {
      phasePresetSelect.addEventListener('change', (event) => {
        this.phasePreset = event.target.value;
        this.phasePresetDirty = true;
      });
    }
  }

  setupSlider(sliderId, valueId, onInput, formatter = (v) => v) {
    const el = document.getElementById(sliderId);
    const label = document.getElementById(valueId);
    el.addEventListener('input', () => {
      label.textContent = formatter(el.value);
      onInput(el.value);
    });
  }

  clampPeriodValue(value) {
    const { min, max, step } = this.periodSliderLimits;
    if (Number.isNaN(value)) return min;
    const clamped = Math.min(max, Math.max(min, value));
    const normalizedStep = step > 0 ? step : 0.1;
    const rounded = Math.round(clamped / normalizedStep) * normalizedStep;
    return parseFloat(rounded.toFixed(2));
  }

  formatPeriod(value) {
    return `${this.clampPeriodValue(value).toFixed(2)}s`;
  }

  syncPeriodSliderUI() {
    const mapping = [
      ['periodLeft', 'periodLeftValue', this.periodPoints.left],
      ['periodCenter', 'periodCenterValue', this.periodPoints.center],
      ['periodRight', 'periodRightValue', this.periodPoints.right],
    ];

    mapping.forEach(([sliderId, labelId, rawValue]) => {
      const slider = document.getElementById(sliderId);
      const label = document.getElementById(labelId);
      if (!slider || !label) return;
      const value = this.clampPeriodValue(rawValue);
      slider.value = value.toFixed(2);
      label.textContent = this.formatPeriod(value);
    });
  }

  setPeriodPoints(points, { syncUI = false } = {}) {
    this.periodPoints.left = this.clampPeriodValue(points.left ?? this.periodPoints.left);
    this.periodPoints.center = this.clampPeriodValue(points.center ?? this.periodPoints.center);
    this.periodPoints.right = this.clampPeriodValue(points.right ?? this.periodPoints.right);

    if (syncUI) {
      this.syncPeriodSliderUI();
    }
  }

  updatePeriodPointsFromReturnTime({ syncUI = false } = {}) {
    const count = Math.max(1, this.N);
    const getPeriod = (index) => {
      if (this.T_return > 0) {
        const m0 = 20;
        const m = m0 + index;
        return (this.T_return / m) * m0;
      }
      const T_min = 1.0;
      const deltaT = 0.1;
      return T_min + index * deltaT;
    };

    const lastIndex = Math.max(0, count - 1);
    const left = getPeriod(0);
    const right = getPeriod(lastIndex);

    let center;
    if (count <= 2) {
      center = (left + right) / 2;
    } else {
      const mid = (count - 1) / 2;
      const lower = Math.floor(mid);
      const upper = Math.ceil(mid);
      if (lower === upper) {
        center = getPeriod(lower);
      } else {
        center = (getPeriod(lower) + getPeriod(upper)) / 2;
      }
    }

    this.setPeriodPoints({ left, center, right }, { syncUI });
  }

  lerp(a, b, t) {
    return a + (b - a) * t;
  }

  getInterpolatedPeriod(index) {
    if (this.N <= 1) {
      return this.clampPeriodValue(this.periodPoints.left);
    }

    const position = index / (this.N - 1);
    if (position <= 0.5) {
      const ratio = position / 0.5;
      return this.clampPeriodValue(this.lerp(this.periodPoints.left, this.periodPoints.center, ratio));
    }
    const ratio = (position - 0.5) / 0.5;
    return this.clampPeriodValue(this.lerp(this.periodPoints.center, this.periodPoints.right, ratio));
  }

  generatePhaseValues(preset = this.activePhasePreset) {
    const phases = [];
    const total = this.N;
    switch (preset) {
      case 'linear': {
        const step = total > 1 ? (Math.PI * 2) / (total - 1) : 0;
        for (let i = 0; i < total; i++) {
          phases.push(i * step);
        }
        break;
      }
      case 'center-fan': {
        const mid = (total - 1) / 2;
        const maxPhase = Math.PI;
        for (let i = 0; i < total; i++) {
          if (total === 1) {
            phases.push(0);
            continue;
          }
          const distance = Math.abs(i - mid);
          const norm = mid === 0 ? 0 : distance / mid;
          const direction = i < mid ? -1 : 1;
          phases.push(direction * norm * maxPhase);
        }
        break;
      }
      case 'alternating': {
        for (let i = 0; i < total; i++) {
          phases.push(i % 2 === 0 ? 0 : Math.PI);
        }
        break;
      }
      case 'random': {
        for (let i = 0; i < total; i++) {
          phases.push(Math.random() * Math.PI * 2);
        }
        break;
      }
      case 'uniform':
      default: {
        for (let i = 0; i < total; i++) {
          phases.push(0);
        }
        break;
      }
    }
    return phases;
  }

  syncPendulumPhases() {
    for (let i = 0; i < this.N; i++) {
      if (!this.pendulums[i]) continue;
      this.pendulums[i].phi = this.phaseValues[i] ?? 0;
    }
  }

  applyPhasePreset({ force = false, preset = null, preserveDirty = false } = {}) {
    if (!force && !this.phasePresetDirty) {
      return;
    }

    const targetPreset = preset || (this.phasePresetDirty ? this.phasePreset : this.activePhasePreset);
    this.phaseValues = this.generatePhaseValues(targetPreset);
    this.activePhasePreset = targetPreset;
    this.syncPendulumPhases();

    if (!preserveDirty) {
      this.phasePresetDirty = false;
    }
  }

  applyPreset(preset) {
    this.N = preset.N;
    this.T_return = preset.T_return;
    this.amplitude = preset.amplitude;
    this.speed = preset.speed;

    // UI同期
    document.getElementById('pendulumCount').value = this.N;
    document.getElementById('pendulumCountValue').textContent = this.N;
    document.getElementById('returnTime').value = this.T_return;
    document.getElementById('returnTimeValue').textContent = `${this.T_return.toFixed(1)}s`;
    document.getElementById('amplitude').value = this.amplitude;
    document.getElementById('amplitudeValue').textContent = this.amplitude;
    document.getElementById('speed').value = this.speed;
    document.getElementById('speedValue').textContent = `${this.speed}x`;

    if (preset.periodPoints) {
      this.setPeriodPoints(preset.periodPoints, { syncUI: true });
    } else {
      this.updatePeriodPointsFromReturnTime({ syncUI: true });
    }

    this.calculatePendulums();
    this.applyPhasePreset({ force: true, preset: this.activePhasePreset, preserveDirty: true });
    this.time = 0;
    this.initBuffers();
  }

  calculatePendulums() {
    this.pendulums = [];
    const leftWidth = this.canvasWidth * this.pendulumRegionWidth;
    const margin = leftWidth * 0.08;
    const usable = Math.max(0, leftWidth - margin * 2);
    const spacing = this.N > 1 ? usable / (this.N - 1) : 0;

    for (let i = 0; i < this.N; i++) {
      const x = margin + i * spacing;
      const period = this.getInterpolatedPeriod(i);
      const omega = (2 * Math.PI) / Math.max(0.001, period);
      const phi = this.phaseValues[i] ?? 0;
      this.pendulums.push({ x, omega, phi, period });
    }

    if (this.pendulums.length === 0) {
      this.phaseValues = [];
      return;
    }

    if (this.phaseValues.length !== this.N) {
      const wasDirty = this.phasePresetDirty;
      this.applyPhasePreset({ force: true, preset: this.activePhasePreset, preserveDirty: true });
      this.phasePresetDirty = wasDirty;
    } else {
      this.syncPendulumPhases();
    }
  }

  initBuffers() {
    // 各振り子用の波形バッファを初期化
    this.waveBuffers = new Array(this.N)
      .fill(null)
      .map(() => []);
  }

  startAnimation() {
    const loop = (t) => {
      if (!this.lastTime) this.lastTime = t;
      const dt = Math.min((t - this.lastTime) / 1000, 0.1);
      this.lastTime = t;

      if (this.isPlaying) {
        this.time += dt * this.speed;
        this.updateWaveforms();
      }

      this.draw();
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  getColor(i) {
    const hue = (i * 360) / Math.max(1, this.N);
    return `hsl(${hue}, ${this.visual.color_saturation}%, ${this.visual.color_lightness}%)`;
  }

  // 中央エリア描画（1列集約）
  drawCenterStrip() {
    const centerX = this.stripX + this.stripWidth / 2;
    const centerY = this.canvasHeight / 2;

    for (let i = 0; i < this.N; i++) {
      const p = this.pendulums[i];
      const currentY = centerY + this.amplitude * Math.cos(p.omega * this.time + p.phi);
      this.ctx.fillStyle = this.getColor(i);
      this.ctx.beginPath();
      this.ctx.arc(centerX, currentY, this.visual.dot_radius, 0, Math.PI * 2);
      this.ctx.fill();
    }

    // 中央のガイド線
    this.ctx.strokeStyle = 'rgba(245,245,245,0.25)';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.moveTo(centerX, this.pendulumY - this.amplitude - 12);
    this.ctx.lineTo(centerX, this.pendulumY + this.amplitude + 12);
    this.ctx.stroke();
  }

  // 波形データを左から右に流す（最新が左、古いほど右へ）
  updateWaveforms() {
    const baseY = this.pendulumY;
    for (let i = 0; i < this.N; i++) {
      const p = this.pendulums[i];
      const currentY = baseY + this.amplitude * Math.cos(p.omega * this.time + p.phi);
      if (!this.waveBuffers[i]) this.waveBuffers[i] = [];
      // 先頭に追加 → 左端が最新
      this.waveBuffers[i].unshift(currentY);
      if (this.waveBuffers[i].length > this.buffers.max_wave_samples) {
        this.waveBuffers[i].pop();
      }
    }
  }

  // 右エリア：左→右へ流れる波形
  drawWaveforms() {
    const waveStartX = this.waveX;
    const waveWidth = this.canvasWidth * this.waveRegionWidth;
    const step = waveWidth / this.buffers.max_wave_samples;

    // 背景グリッド（右エリア）
    const centerY = this.canvasHeight / 2;
    this.ctx.strokeStyle = 'rgba(245,245,245,0.08)';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    for (let i = -2; i <= 2; i++) {
      const y = centerY + i * (this.amplitude * 0.8);
      this.ctx.moveTo(waveStartX, y);
      this.ctx.lineTo(waveStartX + waveWidth, y);
    }
    this.ctx.stroke();

    // 各振り子の個別波形
    for (let i = 0; i < this.N; i++) {
      const buffer = this.waveBuffers[i] || [];
      if (buffer.length === 0) continue;

      this.ctx.strokeStyle = this.getColor(i);
      this.ctx.lineWidth = this.visual.line_width;
      this.ctx.beginPath();
      for (let idx = 0; idx < buffer.length; idx++) {
        const x = waveStartX + idx * step;
        const y = buffer[idx]; // すでにキャンバス座標系のY
        if (idx === 0) this.ctx.moveTo(x, y);
        else this.ctx.lineTo(x, y);
      }
      this.ctx.stroke();
    }
  }

  drawPendulums() {
    if (this.N === 0) return;

    const baseY = this.pendulumY;

    // ガイド（振幅範囲）
    this.ctx.strokeStyle = 'rgba(245,245,245,0.2)';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    for (let i = 0; i < this.N; i++) {
      const x = this.pendulums[i].x;
      this.ctx.moveTo(x, baseY - this.amplitude);
      this.ctx.lineTo(x, baseY + this.amplitude);
    }
    this.ctx.stroke();

    // ボール
    for (let i = 0; i < this.N; i++) {
      const p = this.pendulums[i];
      const y = baseY + this.amplitude * Math.cos(p.omega * this.time + p.phi);
      // 色分けされたボールで識別
      this.ctx.fillStyle = this.getColor(i);
      this.ctx.beginPath();
      this.ctx.arc(p.x, y, 6, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }

  drawRegionSeparators() {
    this.ctx.strokeStyle = 'rgba(245,245,245,0.3)';
    this.ctx.lineWidth = 2;

    // ペンデュラム領域と中央領域の境界
    this.ctx.beginPath();
    this.ctx.moveTo(this.stripX, 0);
    this.ctx.lineTo(this.stripX, this.canvasHeight);
    this.ctx.stroke();

    // 中央領域と右領域の境界
    this.ctx.beginPath();
    this.ctx.moveTo(this.waveX, 0);
    this.ctx.lineTo(this.waveX, this.canvasHeight);
    this.ctx.stroke();
  }

  clear() {
    // 背景（キャンバス全体）
    this.ctx.fillStyle = '#262828';
    this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
  }

  draw() {
    this.clear();
    this.drawPendulums(); // 左
    this.drawCenterStrip(); // 中央（起点）
    this.drawWaveforms(); // 右（左→右）
    this.drawRegionSeparators();
  }
}

// 初期化
window.addEventListener('DOMContentLoaded', () => {
  new PendulumWaveSimulation();
});
