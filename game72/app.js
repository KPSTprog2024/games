(() => {
  const stageEl = document.getElementById('stage');
  const bestStageEl = document.getElementById('bestStage');
  const statusEl = document.getElementById('status');
  const scoreEl = document.getElementById('score');
  const startBtn = document.getElementById('startBtn');
  const replayBtn = document.getElementById('replayBtn');
  const resetBtn = document.getElementById('resetBtn');
  const celebrateEl = document.getElementById('celebrate');
  const pads = [...document.querySelectorAll('.pad')];

  const freqs = [261.63, 329.63, 392.0, 523.25, 659.25];
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  const state = {
    sequence: [],
    inputIndex: 0,
    stage: 0,
    bestStage: 0,
    score: 0,
    playingBack: false,
    started: false,
    audioCtx: null,
  };

  function updateStatus(text) { statusEl.textContent = text; }

  function updateHud() {
    stageEl.textContent = String(state.stage);
    bestStageEl.textContent = String(state.bestStage);
    scoreEl.textContent = String(state.score);
  }

  function ensureAudio() {
    if (!state.audioCtx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      state.audioCtx = new AC();
    }
    if (state.audioCtx.state === 'suspended') state.audioCtx.resume();
  }

  function playTone(index, dur = 220, gainV = 0.08) {
    if (!state.audioCtx) return;
    const now = state.audioCtx.currentTime;
    const osc = state.audioCtx.createOscillator();
    const gain = state.audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freqs[index];
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(gainV, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + dur / 1000);
    osc.connect(gain).connect(state.audioCtx.destination);
    osc.start(now);
    osc.stop(now + dur / 1000 + 0.03);
  }

  function lightPad(index, ms = 280) {
    const pad = pads[index];
    pad.classList.add('active');
    playTone(index);
    setTimeout(() => pad.classList.remove('active'), ms);
  }

  async function playbackSequence() {
    if (!state.sequence.length) return;
    state.playingBack = true;
    updateStatus('再生中');
    for (const idx of state.sequence) {
      lightPad(idx);
      await wait(520);
    }
    state.playingBack = false;
    state.inputIndex = 0;
    updateStatus('入力してください');
  }

  async function onCorrectStage() {
    state.score += state.stage * 10;
    updateStatus('正解！');
    if (state.stage % 5 === 0) {
      celebrateEl.classList.add('show');
      playClap();
      updateStatus(`${state.stage}ステージクリア！`);
      setTimeout(() => celebrateEl.classList.remove('show'), 900);
      await wait(900);
    } else {
      await wait(420);
    }
    state.stage += 1;
    state.bestStage = Math.max(state.bestStage, state.stage - 1);
    state.sequence.push(Math.floor(Math.random() * 5));
    updateHud();
    playbackSequence();
  }

  function playClap() {
    if (!state.audioCtx) return;
    const noiseBuffer = state.audioCtx.createBuffer(1, state.audioCtx.sampleRate * 0.25, state.audioCtx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    const src = state.audioCtx.createBufferSource();
    const filter = state.audioCtx.createBiquadFilter();
    const gain = state.audioCtx.createGain();
    src.buffer = noiseBuffer;
    filter.type = 'highpass';
    filter.frequency.value = 900;
    gain.gain.value = 0.06;
    src.connect(filter).connect(gain).connect(state.audioCtx.destination);
    src.start();
  }

  function onMistake() {
    updateStatus('ミス！ もう一度再生できます');
    state.playingBack = true;
    setTimeout(() => { state.playingBack = false; }, 350);
  }

  async function handlePadPress(index) {
    if (!state.started || state.playingBack || state.stage === 0) return;
    lightPad(index, 180);
    const expected = state.sequence[state.inputIndex];
    if (index !== expected) {
      onMistake();
      return;
    }
    state.inputIndex += 1;
    if (state.inputIndex >= state.sequence.length) {
      await onCorrectStage();
    }
  }

  async function startGame() {
    ensureAudio();
    state.started = true;
    state.sequence = [Math.floor(Math.random() * 5)];
    state.inputIndex = 0;
    state.stage = 1;
    state.score = 0;
    updateHud();
    await playbackSequence();
  }

  function resetGame() {
    state.sequence = [];
    state.inputIndex = 0;
    state.stage = 0;
    state.score = 0;
    state.playingBack = false;
    state.started = false;
    pads.forEach((p) => p.classList.remove('active'));
    updateHud();
    updateStatus('スタートを押してください');
  }

  startBtn.addEventListener('click', startGame);
  replayBtn.addEventListener('click', () => {
    if (!state.started || state.playingBack || state.stage === 0) return;
    playbackSequence();
  });
  resetBtn.addEventListener('click', resetGame);
  pads.forEach((pad, i) => pad.addEventListener('click', () => handlePadPress(i)));

  updateHud();
})();
