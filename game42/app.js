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

    this.regionConstraints = {
      minPendulum: 0.2,
      minStrip: 0.05,
      minWave: 0.2,
    };
    this.regionResizeThreshold = 12;

    this.visual = {
      dot_radius: 3,
      line_width: 2,
      color_saturation: 70,
      color_lightness: 60,
    };

    this.buffers = {
      max_wave_samples: 150,
      sample_rate: 60,
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
    this.waveFlowSpeed = 1.0;
    this.waveFlowAccumulator = 0;
    this.periodSliderLimits = { min: 0.5, max: 12, step: 0.1 };
    this.periodPoints = { left: 6.0, center: 5.2, right: 4.4 };
    this.periodProfile = [];
    this.phasePreset = 'uniform';
    this.activePhasePreset = 'uniform';
    this.phaseValues = [];
    this.phasePresetDirty = false;
    this.waveSampleTimer = 0;

    // データ構造
    this.pendulums = []; // {x, omega, phi, period}
    this.waveBuffers = []; // 各振り子ごとの波形バッファ配列

    // レイアウト座標
    this.pendulumRegionWidth = this.layout.pendulum_width;
    this.stripRegionWidth = this.layout.strip_width;
    this.waveRegionWidth = this.layout.wave_width;

    this.dragState = {
      active: false,
      boundary: null,
      pointerId: null,
      startClientX: 0,
      initial: null,
    };
    this.hoveredBoundary = null;

    this.setupCanvas();
    this.setupEventListeners();
    this.setupRegionResizing();
    document.getElementById('returnTimeValue').textContent = `${this.T_return.toFixed(1)}s`;
    this.updatePeriodPointsFromReturnTime();
    this.calculatePendulums();
    this.applyPhasePreset({ force: true });
    this.initBuffers();
    this.startAnimation();
  }

  updateLayoutMetrics() {
    if (!Number.isFinite(this.canvasWidth) || !Number.isFinite(this.canvasHeight)) {
      return;
    }

    const sum = this.pendulumRegionWidth + this.stripRegionWidth + this.waveRegionWidth;
    if (sum > 0 && Math.abs(sum - 1) > 1e-6) {
      this.pendulumRegionWidth /= sum;
      this.stripRegionWidth /= sum;
      this.waveRegionWidth /= sum;
    }

    this.stripX = this.canvasWidth * this.pendulumRegionWidth;
    this.stripWidth = this.canvasWidth * this.stripRegionWidth;
    this.waveX = this.stripX + this.stripWidth;

    this.calculatePendulums();
  }

  setupRegionResizing() {
    if (!this.canvas) return;

    const pointerDown = (event) => {
      if (event.button !== undefined && event.button !== 0) {
        return;
      }

      const rect = this.canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const boundary = this.getBoundaryAtPosition(x);
      if (!boundary) {
        return;
      }

      event.preventDefault();

      this.dragState.active = true;
      this.dragState.boundary = boundary;
      this.dragState.pointerId = event.pointerId ?? null;
      this.dragState.startClientX = event.clientX;
      this.dragState.initial = {
        pendulum: this.pendulumRegionWidth,
        strip: this.stripRegionWidth,
        wave: this.waveRegionWidth,
      };
      this.hoveredBoundary = boundary;

      if (typeof this.canvas.setPointerCapture === 'function' && this.dragState.pointerId !== null) {
        this.canvas.setPointerCapture(this.dragState.pointerId);
      }

      this.canvas.style.cursor = 'col-resize';
    };

    const pointerMove = (event) => {
      if (this.dragState.active) {
        event.preventDefault();
        const deltaPixels = event.clientX - this.dragState.startClientX;
        const normalizedDelta = deltaPixels / Math.max(1, this.canvasWidth);
        this.updateRegionWidthsForDrag(normalizedDelta);
        this.hoveredBoundary = this.dragState.boundary;
        this.canvas.style.cursor = 'col-resize';
        return;
      }

      this.updateCursorForPosition(event.clientX);
    };

    const endDrag = () => {
      if (!this.dragState.active) {
        return;
      }

      if (typeof this.canvas.releasePointerCapture === 'function' && this.dragState.pointerId !== null) {
        try {
          this.canvas.releasePointerCapture(this.dragState.pointerId);
        } catch (e) {
          // ignore release errors
        }
      }

      this.dragState.active = false;
      this.dragState.boundary = null;
      this.dragState.pointerId = null;
      this.dragState.initial = null;
      this.hoveredBoundary = null;
      this.canvas.style.cursor = '';
    };

    this.canvas.addEventListener('pointerdown', pointerDown);
    this.canvas.addEventListener('pointermove', pointerMove);
    this.canvas.addEventListener('pointerleave', () => {
      if (!this.dragState.active) {
        this.hoveredBoundary = null;
        this.canvas.style.cursor = '';
      }
    });

    window.addEventListener('pointerup', endDrag);
    window.addEventListener('pointercancel', endDrag);
  }

  updateCursorForPosition(clientX) {
    if (!this.canvas) return;
    const rect = this.canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const boundary = this.getBoundaryAtPosition(x);
    this.hoveredBoundary = boundary;
    this.canvas.style.cursor = boundary ? 'col-resize' : '';
  }

  getBoundaryAtPosition(x) {
    if (!Number.isFinite(x)) return null;
    const boundaries = [
      { key: 'pendulumStrip', position: this.stripX },
      { key: 'stripWave', position: this.waveX },
    ];

    for (const boundary of boundaries) {
      if (Math.abs(x - boundary.position) <= this.regionResizeThreshold) {
        return boundary.key;
      }
    }

    return null;
  }

  clampLayoutRatio(value, min, max) {
    if (!Number.isFinite(value)) return min;
    if (!Number.isFinite(min)) min = 0;
    if (!Number.isFinite(max)) max = 1;
    if (min > max) return min;
    return Math.min(max, Math.max(min, value));
  }

  updateRegionWidthsForDrag(delta) {
    if (!this.dragState.active || !this.dragState.initial) {
      return;
    }

    const { boundary, initial } = this.dragState;

    if (boundary === 'pendulumStrip') {
      const minDelta = this.regionConstraints.minPendulum - initial.pendulum;
      const maxDelta = initial.strip - this.regionConstraints.minStrip;
      const clampedDelta = this.clampLayoutRatio(delta, minDelta, maxDelta);
      const newPendulum = initial.pendulum + clampedDelta;
      const newStrip = initial.strip - clampedDelta;
      this.setRegionWidths(newPendulum, newStrip, initial.wave);
      return;
    }

    if (boundary === 'stripWave') {
      const minDelta = this.regionConstraints.minStrip - initial.strip;
      const maxDelta = initial.wave - this.regionConstraints.minWave;
      const clampedDelta = this.clampLayoutRatio(delta, minDelta, maxDelta);
      const newStrip = initial.strip + clampedDelta;
      const newWave = initial.wave - clampedDelta;
      this.setRegionWidths(initial.pendulum, newStrip, newWave);
    }
  }

  setRegionWidths(pendulum, strip, wave) {
    this.pendulumRegionWidth = pendulum;
    this.stripRegionWidth = strip;
    this.waveRegionWidth = wave;
    this.updateLayoutMetrics();
  }

  setupCanvas() {
    const resize = () => {
      const rect = this.canvas.parentElement.getBoundingClientRect();
      this.canvasWidth = rect.width;
      this.canvasHeight = rect.height;
      this.canvas.width = this.canvasWidth;
      this.canvas.height = this.canvasHeight;

      // 領域の境界X座標
      this.pendulumY = this.canvasHeight * 0.5;

      this.updateLayoutMetrics();
      // バッファはサンプル数固定のためクリアのみ
      this.initBuffers();
    };

    window.addEventListener('resize', resize);
    resize();
  }

  setupEventListeners() {
    const playPauseBtn = document.getElementById('playPauseBtn');
    const playPauseIcon = playPauseBtn?.querySelector('.btn-icon');

    playPauseBtn.addEventListener('click', () => {
      const wasPlaying = this.isPlaying;
      this.isPlaying = !this.isPlaying;
      playPauseBtn.classList.toggle('paused', !this.isPlaying);
      const label = this.isPlaying ? '一時停止' : '再生';
      playPauseBtn.setAttribute('aria-label', label);
      playPauseBtn.setAttribute('title', label);
      if (playPauseIcon) {
        playPauseIcon.textContent = '⏸';
      }
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
      if (this.T_return > 0) {
        this.updatePeriodPointsFromReturnTime();
      }
      this.calculatePendulums();
      this.applyPhasePreset({ force: true, preset: this.activePhasePreset, preserveDirty: true });
      this.initBuffers();
    });

    this.setupSlider(
      'returnTime',
      'returnTimeValue',
      (v) => {
        this.T_return = parseFloat(v);
        this.updatePeriodPointsFromReturnTime();
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
      (v) => this.formatRateValue(v)
    );

    this.setupSlider(
      'waveSpeed',
      'waveSpeedValue',
      (v) => {
        this.waveFlowSpeed = parseFloat(v);
        this.waveFlowAccumulator = 0;
      },
      (v) => this.formatRateValue(v)
    );

    this.setupSlider(
      'waveSpeed',
      'waveSpeedValue',
      (v) => {
        this.waveFlowSpeed = parseFloat(v);
      },
      (v) => `${parseFloat(v).toFixed(2)}x`
    );

    // プリセット
    const presetSelect = document.getElementById('presetSelect');
    if (presetSelect) {
      presetSelect.addEventListener('change', (event) => {
        const value = event.target.value;
        if (value === 'custom') {
          return;
        }
        this.applyPreset(value);
      });
    }

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
    if (!el || !label) return;
    el.addEventListener('input', () => {
      label.textContent = formatter(el.value);
      onInput(el.value);
      this.markPresetCustom();
    });
  }

  markPresetCustom() {
    const presetSelect = document.getElementById('presetSelect');
    if (!presetSelect) return;
    if (presetSelect.value !== 'custom') {
      presetSelect.value = 'custom';
    }
  }

  clampPeriodValue(value, options = {}) {
    const { round = true } = options;
    const { min, max, step } = this.periodSliderLimits;
    if (Number.isNaN(value)) return min;
    const clamped = Math.min(max, Math.max(min, value));
    if (!round) {
      return clamped;
    }
    const normalizedStep = step > 0 ? step : 0.1;
    const rounded = Math.round(clamped / normalizedStep) * normalizedStep;
    return parseFloat(rounded.toFixed(4));
  }

  formatRateValue(value) {
    const numeric = parseFloat(value);
    if (!Number.isFinite(numeric)) {
      return '0.00';
    }
    return numeric.toFixed(2);
  }

  setPeriodPoints(points = {}) {
    this.periodPoints.left = this.clampPeriodValue(points.left ?? this.periodPoints.left);
    this.periodPoints.center = this.clampPeriodValue(points.center ?? this.periodPoints.center);
    this.periodPoints.right = this.clampPeriodValue(points.right ?? this.periodPoints.right);
  }

  updatePeriodPointsFromReturnTime() {
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

    this.setPeriodPoints({ left, center, right });
  }

  lerp(a, b, t) {
    return a + (b - a) * t;
  }

  getSmoothPeriod(position) {
    const anchors = [
      { pos: 0, value: this.periodPoints.left },
      { pos: 0.5, value: this.periodPoints.center },
      { pos: 1, value: this.periodPoints.right },
    ];

    // 2点のみの時は単純線形で十分
    if (this.N <= 2) {
      return this.lerp(anchors[0].value, anchors[2].value, position);
    }

    const epsilon = 1e-4;
    const power = 2.5;

    let numerator = 0;
    let denominator = 0;

    for (const anchor of anchors) {
      const distance = Math.abs(position - anchor.pos);
      if (distance < epsilon) {
        return anchor.value;
      }
      const weight = 1 / Math.pow(distance + epsilon, power);
      numerator += anchor.value * weight;
      denominator += weight;
    }

    if (denominator === 0) {
      return anchors[1].value;
    }

    return numerator / denominator;

  }

  getInterpolatedPeriod(index) {
    if (this.N <= 1) {
      return this.clampPeriodValue(this.periodPoints.left, { round: false });
    }

    const denominator = Math.max(1, this.N - 1);
    const position = index / denominator;
    const smoothPeriod = this.getSmoothPeriod(position);
    const basePeriod = this.clampPeriodValue(smoothPeriod, { round: false });
    const range = Math.abs(this.periodPoints.right - this.periodPoints.left);
    const minSpacing = Math.max(range / Math.max(1, this.N * 50), 0.0002);
    const descending = this.periodPoints.left >= this.periodPoints.right;
    const centeredIndex = index - (this.N - 1) / 2;
    // `slopeBias` nudges each pendulum away from its neighbours so that
    // symmetric pairs do not collapse to identical periods while keeping the
    // overall interpolation close to the anchor-driven curve.
    const slopeBias = centeredIndex * minSpacing * (descending ? -1 : 1);
    return this.clampPeriodValue(basePeriod + slopeBias, { round: false });
  }

  getReturnTimePeriod(index) {
    const baseOrder = 20;
    const order = baseOrder + index;
    const normalizedOrder = Math.max(1e-3, order);
    const period = (this.T_return * baseOrder) / normalizedOrder;
    return this.clampPeriodValue(period, { round: false });
  }

  getPendulumPeriod(index) {
    if (this.T_return > 0) {
      return this.getReturnTimePeriod(index);
    }
    return this.getInterpolatedPeriod(index);
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

  applyPreset(presetKey) {
    const preset = this.presets[presetKey];
    if (!preset) return;

    const presetSelect = document.getElementById('presetSelect');
    if (presetSelect) {
      presetSelect.value = presetKey;
    }

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
    document.getElementById('speedValue').textContent = this.formatRateValue(this.speed);
    const waveSpeedSlider = document.getElementById('waveSpeed');
    const waveSpeedLabel = document.getElementById('waveSpeedValue');
    if (waveSpeedSlider && waveSpeedLabel) {
      waveSpeedSlider.value = this.waveFlowSpeed;
      waveSpeedLabel.textContent = this.formatRateValue(this.waveFlowSpeed);
    }

    if (preset.T_return > 0) {
      this.updatePeriodPointsFromReturnTime();
    } else if (preset.periodPoints) {
      this.setPeriodPoints(preset.periodPoints);
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

    this.periodProfile = new Array(this.N).fill(0);

    for (let i = 0; i < this.N; i++) {
      const x = margin + i * spacing;
      const period = this.getPendulumPeriod(i);
      const omega = (2 * Math.PI) / Math.max(0.001, period);
      const phi = this.phaseValues[i] ?? 0;
      this.periodProfile[i] = period;
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
      .map(() => this.createWaveBuffer());
    this.waveFlowAccumulator = 0;
  }

  createWaveBuffer() {
    const capacity = this.buffers.max_wave_samples;
    return {
      samples: new Float32Array(capacity),
      capacity,
      length: 0,
      offset: 0,
    };
  }

  pushWaveSample(buffer, value) {
    if (!buffer) {
      return;
    }

    const { capacity } = buffer;
    buffer.offset = (buffer.offset - 1 + capacity) % capacity;
    buffer.samples[buffer.offset] = value;
    if (buffer.length < capacity) {
      buffer.length += 1;
    }
  }

  startAnimation() {
    const loop = (t) => {
      if (!this.lastTime) this.lastTime = t;
      const dt = Math.min((t - this.lastTime) / 1000, 0.1);
      this.lastTime = t;

      if (this.isPlaying) {
        const simDt = dt * this.speed;
        this.time += simDt;
        this.updateWaveforms(simDt);
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
  updateWaveforms(simDt) {
    if (!Number.isFinite(simDt) || simDt <= 0) {
      return;
    }

    if (this.pendulums.length === 0) {
      return;
    }

    const baseY = this.pendulumY;
    const sampleRate = this.buffers.sample_rate || 60;
    const flowSpeed = Math.max(0.05, this.waveFlowSpeed || 0);
    const effectiveRate = sampleRate * flowSpeed;

    if (!Number.isFinite(effectiveRate) || effectiveRate <= 0) {
      return;
    }

    this.waveFlowAccumulator += simDt * effectiveRate;

    const samplesToEmit = Math.floor(this.waveFlowAccumulator);
    if (samplesToEmit <= 0) {
      return;
    }

    this.waveFlowAccumulator -= samplesToEmit;

    const sampleSpacing = 1 / effectiveRate;
    const sampleTimes = [];
    for (let remaining = samplesToEmit; remaining > 0; remaining--) {
      sampleTimes.push(this.time - (remaining - 1) * sampleSpacing);
    }

    for (let i = 0; i < this.N; i++) {
      const p = this.pendulums[i];
      if (!p) continue;

      if (!this.waveBuffers[i]) {
        this.waveBuffers[i] = this.createWaveBuffer();
      }
      const buffer = this.waveBuffers[i];

      for (const sampleTime of sampleTimes) {
        const currentY = baseY + this.amplitude * Math.cos(p.omega * sampleTime + p.phi);
        this.pushWaveSample(buffer, currentY);
      }
    }
  }

  drawSmoothWave(buffer, startX, step) {
    if (!buffer) {
      return;
    }

    const { samples, length, capacity, offset } = buffer;
    if (length < 2) {
      return;
    }

    const points = new Array(length);
    for (let i = 0; i < length; i++) {
      const sampleIndex = (offset + i) % capacity;
      points[i] = { x: startX + i * step, y: samples[sampleIndex] };
    }

    this.ctx.beginPath();
    this.ctx.moveTo(points[0].x, points[0].y);

    if (length === 2) {
      this.ctx.lineTo(points[1].x, points[1].y);
      this.ctx.stroke();
      return;
    }

    for (let i = 0; i < length - 1; i++) {
      const p0 = points[i - 1] ?? points[i];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2] ?? p2;

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      this.ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
    }

    this.ctx.stroke();
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
      const buffer = this.waveBuffers[i];
      if (!buffer || buffer.length === 0) continue;

      this.ctx.strokeStyle = this.getColor(i);
      this.ctx.lineWidth = this.visual.line_width;
      this.ctx.lineJoin = 'round';
      this.ctx.lineCap = 'round';
      this.drawSmoothWave(buffer, waveStartX, step);
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
    const highlightKey = this.dragState.active ? this.dragState.boundary : this.hoveredBoundary;
    const drawLine = (x, isHighlighted) => {
      this.ctx.strokeStyle = isHighlighted ? 'rgba(245,245,245,0.6)' : 'rgba(245,245,245,0.3)';
      this.ctx.lineWidth = isHighlighted ? 3 : 2;
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.canvasHeight);
      this.ctx.stroke();
    };

    drawLine(this.stripX, highlightKey === 'pendulumStrip');
    drawLine(this.waveX, highlightKey === 'stripWave');
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
