(() => {
  const logic = window.Game71Logic;
  const generationModule = window.Game71Generation;
  const sessionModule = window.Game71Session;
  const uiModule = window.Game71UI;
  const view3dModule = window.Game71View3D;

  if (!logic || !generationModule || !sessionModule || !uiModule || !view3dModule) {
    throw new Error('Required modules are missing');
  }

  const DIRECTION_SYMBOLS = { front: '○', right: '△', left: '□', back: '×', top: '☆' };
  const LEVELS = [
    { cubes: [2, 4], maxHeight: 2, directions: ['front', 'right'], options: [2, 2], black: [1, 1] },
    { cubes: [4, 6], maxHeight: 3, directions: ['front', 'right', 'left'], options: [3, 4], black: [1, 2] },
    { cubes: [6, 9], maxHeight: 3, directions: ['front', 'right', 'left', 'back'], options: [4, 4], black: [2, 3] },
    { cubes: [7, 10], maxHeight: 4, directions: ['front', 'right', 'left', 'back', 'top'], options: [4, 5], black: [2, 3] },
    { cubes: [8, 12], maxHeight: 4, directions: ['front', 'right', 'left', 'back', 'top'], options: [5, 6], black: [2, 4] }
  ];

  const sceneEl = document.getElementById('scene');
  const ui = uiModule.bind();
  const view3d = view3dModule.create(sceneEl);
  const seedFromUrl = new URLSearchParams(window.location.search).get('seed');
  const generation = generationModule.create(LEVELS, logic, { seed: seedFromUrl });
  const state = sessionModule.create();

  function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function pickAnalysis(correct, mistakeType, direction) {
    if (correct) {
      if (direction === 'top') return 'いい観察！ 上から見た高さと黒の位置を正しく読めたね。';
      return 'いい観察！ 手前・高さ・黒の位置を正しく読めたね。';
    }
    const map = {
      mirror_lr: 'おしい！ 左右の向きが逆だったかも。',
      wrong_depth: 'おしい！ 手前と奥の読み取りをもう一度見よう。',
      wrong_height: 'おしい！ 高さ（上下の段）を見直してみよう。',
      wrong_color: 'おしい！ 黒ブロックの位置に注目しよう。',
      other_direction: 'おしい！ 記号の方向対応を確認してみよう。',
    };
    return map[mistakeType] || 'おしい！ 形と色の両方を見比べてみよう。';
  }

  function submitAnswer(optionId) {
    if (state.locked) return;
    state.locked = true;
    const elapsedMs = Math.max(200, performance.now() - state.questionStartAt);
    const selectedOption = state.options.find((o) => o.id === optionId);
    const isCorrect = optionId === state.correctOptionId;

    sessionModule.recordAnswer(state, isCorrect, selectedOption?.type, elapsedMs);
    ui.scoreLabel.textContent = `${state.score} / ${state.total}`;

    const reason = pickAnalysis(isCorrect, selectedOption?.type, state.targetDirection);
    ui.analysisEl.textContent = `${reason}（回答 ${Math.round(elapsedMs / 100) / 10}秒）`;
    ui.feedbackEl.textContent = isCorrect ? 'せいかい！ くるっと見るとこうなるよ' : 'おしい！ くるっと回して見てみよう';
    ui.feedbackEl.className = `feedback ${isCorrect ? 'ok' : 'bad'}`;

    uiModule.markAnswer(ui.choicesEl, optionId, state.correctOptionId);
    view3d.rotateToDirection(state.answerDirection, randInt(800, 1200));
    ui.nextBtn.disabled = false;
  }

  function newQuestion() {
    state.locked = false;
    state.cubes = generation.generateCubes(state.level);
    view3d.mountCubes(state.cubes);
    view3d.setInitialCamera();

    state.targetDirection = generation.pickDirection(state.level, state.weakDirection, state.reviewModeRounds);
    if (state.reviewModeRounds > 0 && state.weakDirection === state.targetDirection) {
      state.reviewModeRounds = Math.max(0, state.reviewModeRounds - 1);
    }

    state.answerDirection = state.targetDirection;
    state.options = generation.makeOptions(state.cubes, state.targetDirection, state.level);
    const correct = state.options.find((o) => o.correct);
    state.correctOptionId = correct.id;

    ui.promptEl.textContent = `${DIRECTION_SYMBOLS[state.targetDirection]}のほうから見るとどれかな？`;
    ui.symbolGuideEl.classList.toggle('hidden', state.level >= 4);
    ui.feedbackEl.textContent = 'テンポよくいこう！';
    ui.feedbackEl.className = 'feedback';
    ui.analysisEl.textContent = '';
    ui.nextBtn.disabled = true;
    state.questionStartAt = performance.now();

    uiModule.renderChoices(ui.choicesEl, state.options, submitAnswer);
  }

  ui.normalModeBtn.addEventListener('click', () => {
    state.hintMode = false;
    ui.normalModeBtn.classList.add('active');
    ui.hintModeBtn.classList.remove('active');
    ui.hintRotateBtn.disabled = true;
  });

  ui.hintModeBtn.addEventListener('click', () => {
    state.hintMode = true;
    ui.hintModeBtn.classList.add('active');
    ui.normalModeBtn.classList.remove('active');
    ui.hintRotateBtn.disabled = false;
  });

  ui.hintRotateBtn.addEventListener('click', () => {
    if (!state.hintMode || state.locked) return;
    view3d.rotateToDirection(state.targetDirection, 450);
    setTimeout(() => {
      view3d.rotateToDirection('init', 450);
      setTimeout(() => view3d.setInitialCamera(), 460);
    }, 500);
  });

  ui.nextBtn.addEventListener('click', () => {
    sessionModule.advanceLevel(state);
    ui.levelLabel.textContent = `Lv${state.level}`;
    newQuestion();
  });

  window.addEventListener('resize', view3d.resize);
  view3d.resize();
  ui.levelLabel.textContent = `Lv${state.level}`;
  ui.scoreLabel.textContent = `${state.score} / ${state.total}`;
  newQuestion();
  view3d.animate(performance.now());
})();
