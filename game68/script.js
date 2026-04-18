import * as THREE from 'https://unpkg.com/three@0.164.1/build/three.module.js?module';
import { OrbitControls } from 'https://unpkg.com/three@0.164.1/examples/jsm/controls/OrbitControls.js?module';

const sceneEl = document.getElementById('scene');
const ratioDisplay = document.getElementById('ratioDisplay');
const complexityEl = document.getElementById('complexity');
const closureScoreEl = document.getElementById('closureScore');
const insightSummary = document.getElementById('insightSummary');
const challengeEls = {
  target: document.getElementById('challengeTarget'),
  status: document.getElementById('challengeStatus'),
  score: document.getElementById('challengeScore'),
  time: document.getElementById('challengeTime'),
  delta: document.getElementById('challengeDelta'),
  tolerance: document.getElementById('challengeTolerance'),
  lastSessionScore: document.getElementById('lastSessionScore'),
  bestSessionScore: document.getElementById('bestSessionScore'),
  lastSessionAvgDelta: document.getElementById('lastSessionAvgDelta'),
  historyList: document.getElementById('sessionHistoryList'),
};

const inputs = {
  freqX: document.getElementById('freqX'),
  freqY: document.getElementById('freqY'),
  freqZ: document.getElementById('freqZ'),
  amplitude: document.getElementById('amplitude'),
  speed: document.getElementById('speed'),
  trail: document.getElementById('trail'),
};

const valueEls = {
  freqX: document.getElementById('freqXValue'),
  freqY: document.getElementById('freqYValue'),
  freqZ: document.getElementById('freqZValue'),
  amplitude: document.getElementById('amplitudeValue'),
  speed: document.getElementById('speedValue'),
  trail: document.getElementById('trailValue'),
};

const buttons = {
  reset: document.getElementById('reset'),
  toggle: document.getElementById('toggle'),
  clear: document.getElementById('clear'),
  unlimitedTrail: document.getElementById('unlimitedTrail'),
  saveMemo: document.getElementById('saveMemo'),
  challengeToggle: document.getElementById('challengeToggle'),
  challengeNext: document.getElementById('challengeNext'),
  undoParams: document.getElementById('undoParams'),
  redoParams: document.getElementById('redoParams'),
  undoParamsDock: document.getElementById('undoParamsDock'),
  redoParamsDock: document.getElementById('redoParamsDock'),
  openTutorial: document.getElementById('openTutorial'),
  tutorialSkip: document.getElementById('tutorialSkip'),
  tutorialNext: document.getElementById('tutorialNext'),
};

const memoFields = {
  hypothesis: document.getElementById('hypothesis'),
  observation: document.getElementById('observation'),
  nextAction: document.getElementById('nextAction'),
};

const metaPanel = document.getElementById('metaPanel');
const metaHint = document.getElementById('metaHint');
const presets = [...document.querySelectorAll('.preset')];
const difficultyButtons = [...document.querySelectorAll('.difficulty')];
const tutorialEls = {
  modal: document.getElementById('tutorialModal'),
  step: document.getElementById('tutorialStep'),
  title: document.getElementById('tutorialTitle'),
  body: document.getElementById('tutorialBody'),
};

let renderer, scene, camera, controls;
let line;
let points = [];
let trailLimit = Number(inputs.trail.value);
let pointerMesh;
let isUnlimitedTrail = false;
let isRunning = true;
let startTime = performance.now();
let challengeMode = false;
let challengeScore = 0;
let challengeStart = 0;
let challengeLockStart = null;
let activeChallenge = null;
let challengeLevel = 'normal';
let dynamicTolerance = 0.6;
let dynamicLockSeconds = 1.2;
let bestSessionScore = 0;
let sessionHistory = [];
let sessionDeltaSum = 0;
let sessionDeltaCount = 0;
let paramHistory = [];
let paramFuture = [];
let suppressHistoryTracking = false;
let historyTimer = null;
let tutorialStep = 0;
const challengeTargets = [
  [3, 4, 5],
  [2, 3, 2],
  [5, 7, 9],
  [4, 5, 6],
  [3, 5, 7],
];
const challengeConfig = {
  easy: { tolerance: 0.75, lockSeconds: 0.9 },
  normal: { tolerance: 0.6, lockSeconds: 1.2 },
  hard: { tolerance: 0.45, lockSeconds: 1.4 },
};
const maxHistoryItems = 5;
const tutorialPages = [
  {
    title: 'ようこそ',
    body: 'このラボでは周波数比を操作して立体軌跡を観察します。まずはX/Y/Z周波数を動かして形の変化を見てください。',
  },
  {
    title: '課題モード',
    body: 'Challenge Modeを開始すると、指定比率に近づける練習ができます。誤差が小さい状態を一定時間キープすると成功です。',
  },
  {
    title: '学習ログ',
    body: 'メモとセッション履歴はローカル保存されます。まず触って、仮説→観測→次アクションの順で記録しましょう。',
  },
];

function getSceneSize() {
  const rect = sceneEl.getBoundingClientRect();
  return {
    width: rect.width || window.innerWidth,
    height: rect.height || window.innerHeight * 0.7,
  };
}

function initThree() {
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  const { width, height } = getSceneSize();
  renderer.setSize(width, height);
  renderer.setPixelRatio(window.devicePixelRatio || 1);
  sceneEl.appendChild(renderer.domElement);

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 1000);
  camera.position.set(22, 15, 22);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.enablePan = true;

  scene.add(new THREE.HemisphereLight(0xffffff, 0x0b1120, 1.0));
  const dir = new THREE.DirectionalLight(0xffffff, 0.9);
  dir.position.set(10, 18, 5);
  scene.add(dir);

  const gridFloor = new THREE.GridHelper(34, 34, 0x22d3ee, 0x1e293b);
  gridFloor.material.opacity = 0.28;
  gridFloor.material.transparent = true;
  scene.add(gridFloor);

  const gridSide = new THREE.GridHelper(34, 34, 0x34d399, 0x1e293b);
  gridSide.rotation.x = Math.PI / 2;
  gridSide.position.y = 17;
  gridSide.position.z = -17;
  gridSide.material.opacity = 0.2;
  gridSide.material.transparent = true;
  scene.add(gridSide);

  scene.add(new THREE.AxesHelper(6));

  line = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]),
    new THREE.LineBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.92 })
  );
  scene.add(line);

  pointerMesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.26, 22, 22),
    new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0x34d399, emissiveIntensity: 1.0 })
  );
  scene.add(pointerMesh);

  window.addEventListener('resize', onResize);
  window.addEventListener('keydown', onKey);
}

function onResize() {
  const { width, height } = getSceneSize();
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
}

function onKey(e) {
  const key = e.key.toLowerCase();
  if (key === 'r') reset();
  if (key === 'm') metaPanel.classList.toggle('hidden');
  if (key === 'escape' && !tutorialEls.modal.classList.contains('hidden')) closeTutorial(true);
}

function currentParams() {
  return {
    freqX: Number(inputs.freqX.value),
    freqY: Number(inputs.freqY.value),
    freqZ: Number(inputs.freqZ.value),
    amplitude: Number(inputs.amplitude.value),
    speed: Number(inputs.speed.value),
    trail: Number(inputs.trail.value),
  };
}

function applyParams(params) {
  Object.entries(params).forEach(([key, value]) => {
    if (inputs[key]) inputs[key].value = String(value);
  });
  trailLimit = Number(inputs.trail.value);
  updateValueLabels();
  updateInsights(currentParams());
}

function snapshotParams() {
  return currentParams();
}

function updateHistoryButtons() {
  buttons.undoParams.disabled = paramHistory.length <= 1;
  buttons.redoParams.disabled = paramFuture.length === 0;
  if (buttons.undoParamsDock) buttons.undoParamsDock.disabled = paramHistory.length <= 1;
  if (buttons.redoParamsDock) buttons.redoParamsDock.disabled = paramFuture.length === 0;
}

function pushParamHistory() {
  if (suppressHistoryTracking) return;
  const latest = snapshotParams();
  const previous = paramHistory[paramHistory.length - 1];
  if (previous && JSON.stringify(previous) === JSON.stringify(latest)) return;
  paramHistory.push(latest);
  if (paramHistory.length > 60) paramHistory.shift();
  paramFuture = [];
  updateHistoryButtons();
}

function scheduleParamHistoryPush() {
  if (historyTimer) clearTimeout(historyTimer);
  historyTimer = setTimeout(pushParamHistory, 150);
}

function undoParams() {
  if (paramHistory.length <= 1) return;
  const current = paramHistory.pop();
  paramFuture.push(current);
  const back = paramHistory[paramHistory.length - 1];
  suppressHistoryTracking = true;
  applyParams(back);
  suppressHistoryTracking = false;
  updateHistoryButtons();
}

function redoParams() {
  if (!paramFuture.length) return;
  const next = paramFuture.pop();
  paramHistory.push(next);
  suppressHistoryTracking = true;
  applyParams(next);
  suppressHistoryTracking = false;
  updateHistoryButtons();
}

function renderTutorial() {
  const page = tutorialPages[tutorialStep];
  tutorialEls.step.textContent = `STEP ${tutorialStep + 1} / ${tutorialPages.length}`;
  tutorialEls.title.textContent = page.title;
  tutorialEls.body.textContent = page.body;
  buttons.tutorialNext.textContent = tutorialStep === tutorialPages.length - 1 ? '完了' : '次へ';
}

function openTutorial() {
  tutorialStep = 0;
  renderTutorial();
  tutorialEls.modal.classList.remove('hidden');
}

function closeTutorial(markSeen) {
  tutorialEls.modal.classList.add('hidden');
  if (markSeen) {
    localStorage.setItem('game68-tutorial-seen', '1');
  }
}

function nextTutorial() {
  if (tutorialStep >= tutorialPages.length - 1) {
    closeTutorial(true);
    return;
  }
  tutorialStep += 1;
  renderTutorial();
}

function maybeShowTutorialOnFirstVisit() {
  if (localStorage.getItem('game68-tutorial-seen') === '1') return;
  openTutorial();
}

function lissajous(t, params) {
  const { freqX, freqY, freqZ, amplitude } = params;
  const phaseXY = Math.PI / 2;
  const phaseZ = Math.PI / 3;
  return new THREE.Vector3(
    amplitude * Math.sin(freqX * t + phaseXY),
    amplitude * Math.sin(freqY * t),
    amplitude * Math.sin(freqZ * t + phaseZ)
  );
}

function updateValueLabels() {
  Object.entries(inputs).forEach(([key, input]) => {
    valueEls[key].textContent = key === 'trail' ? (isUnlimitedTrail ? '∞' : input.value) : Number(input.value).toFixed(1);
  });
}

function simplifyRatio(a, b, c) {
  const ax = Math.round(a * 10);
  const by = Math.round(b * 10);
  const cz = Math.round(c * 10);
  const gcd2 = (x, y) => (!y ? x : gcd2(y, x % y));
  const g = gcd2(gcd2(Math.abs(ax), Math.abs(by)), Math.abs(cz)) || 1;
  return [Math.round(ax / g), Math.round(by / g), Math.round(cz / g)];
}

function estimateClosure(params) {
  const values = [params.freqX, params.freqY, params.freqZ].map((v) => v * 10);
  const nearestInts = values.map((v) => Math.round(v));
  const deviation = values.reduce((sum, v, i) => sum + Math.abs(v - nearestInts[i]), 0) / values.length;
  const spread = Math.max(...values) - Math.min(...values);
  const ratioPenalty = Math.min(1, deviation / 0.5);
  const spreadPenalty = Math.min(1, spread / 60);
  const score = Math.max(0, Math.round((1 - (ratioPenalty * 0.7 + spreadPenalty * 0.3)) * 100));
  return score;
}

function ratioDelta(current, target) {
  const currentNorm = current.map((v) => Math.abs(v));
  const targetNorm = target.map((v) => Math.abs(v));
  const scaleCurrent = Math.max(...currentNorm) || 1;
  const scaleTarget = Math.max(...targetNorm) || 1;
  const currentScaled = currentNorm.map((v) => v / scaleCurrent);
  const targetScaled = targetNorm.map((v) => v / scaleTarget);
  return currentScaled.reduce((sum, v, i) => sum + Math.abs(v - targetScaled[i]), 0);
}

function classifyComplexity(params) {
  const [sx, sy, sz] = simplifyRatio(params.freqX, params.freqY, params.freqZ).map(Math.abs);
  const total = sx + sy + sz;
  if (total <= 10) return 'Low';
  if (total <= 24) return 'Medium';
  return 'High';
}

function updateInsights(params) {
  const [sx, sy, sz] = simplifyRatio(params.freqX, params.freqY, params.freqZ);
  ratioDisplay.textContent = `${sx} : ${sy} : ${sz}`;
  const complexity = classifyComplexity(params);
  complexityEl.textContent = complexity;

  const closure = estimateClosure(params);
  closureScoreEl.textContent = `${closure}%`;

  let msg = '整数比に近いほど閉じやすい軌跡になります。';
  if (complexity === 'High') msg = '比率が複雑で探索向きです。比較のため速度を下げるのがおすすめです。';
  if (closure < 45) msg = '閉曲線化しにくい設定です。周波数を0.5刻みで合わせると再現しやすくなります。';
  if (closure > 80) msg = '閉曲線化しやすい設定です。振幅だけ変えて形状差分を観察してください。';
  insightSummary.textContent = msg;
}

function trimTrail(limit) {
  while (points.length > limit) points.shift();
}

function reset() {
  points = [];
  line.geometry.setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
  startTime = performance.now();
}

function clearTrail() {
  points = [];
  line.geometry.setFromPoints([]);
}

function pickChallengeTarget() {
  const next = challengeTargets[Math.floor(Math.random() * challengeTargets.length)];
  activeChallenge = next;
  challengeLockStart = null;
  challengeEls.target.textContent = `${next[0]} : ${next[1]} : ${next[2]}`;
  challengeEls.status.textContent = '目標比率に近づくよう周波数を調整してください。';
}

function applyChallengeLevel(level) {
  if (!challengeConfig[level]) return;
  challengeLevel = level;
  dynamicTolerance = challengeConfig[level].tolerance;
  dynamicLockSeconds = challengeConfig[level].lockSeconds;
  challengeEls.tolerance.textContent = dynamicTolerance.toFixed(2);
  difficultyButtons.forEach((button) => {
    button.dataset.active = String(button.dataset.level === level);
  });
}

function startChallenge() {
  challengeMode = true;
  challengeScore = 0;
  sessionDeltaSum = 0;
  sessionDeltaCount = 0;
  challengeStart = performance.now();
  buttons.challengeToggle.dataset.active = 'true';
  buttons.challengeToggle.textContent = 'チャレンジ停止';
  challengeEls.score.textContent = '0';
  challengeEls.time.textContent = '0.0s';
  challengeEls.delta.textContent = '-';
  challengeEls.tolerance.textContent = dynamicTolerance.toFixed(2);
  pickChallengeTarget();
}

function loadChallengeHistory() {
  const raw = localStorage.getItem('game68-challenge-history');
  if (!raw) {
    renderChallengeHistory();
    return;
  }
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed?.history)) return;
    sessionHistory = parsed.history.slice(0, maxHistoryItems);
    bestSessionScore = Number(parsed.bestScore) || 0;
    challengeEls.bestSessionScore.textContent = String(bestSessionScore);
    if (sessionHistory[0]) {
      challengeEls.lastSessionScore.textContent = String(sessionHistory[0].score ?? '-');
      challengeEls.lastSessionAvgDelta.textContent = Number(sessionHistory[0].avgDelta ?? 0).toFixed(2);
    }
    renderChallengeHistory();
  } catch {
    renderChallengeHistory();
  }
}

function saveChallengeHistory() {
  localStorage.setItem('game68-challenge-history', JSON.stringify({
    bestScore: bestSessionScore,
    history: sessionHistory.slice(0, maxHistoryItems),
  }));
}

function renderChallengeHistory() {
  challengeEls.historyList.innerHTML = '';
  if (!sessionHistory.length) {
    const li = document.createElement('li');
    li.textContent = '履歴なし';
    challengeEls.historyList.append(li);
    return;
  }
  sessionHistory.forEach((entry) => {
    const li = document.createElement('li');
    const avgDelta = Number(entry.avgDelta ?? 0);
    const stamp = entry.at ? new Date(entry.at).toLocaleString('ja-JP') : '日時なし';
    li.textContent = `${entry.score}pt / ${entry.level.toUpperCase()} / 平均誤差 ${avgDelta.toFixed(2)} / ${entry.duration.toFixed(1)}s / ${stamp}`;
    challengeEls.historyList.append(li);
  });
}

function closeChallengeSession() {
  if (!challengeMode) return;
  const duration = (performance.now() - challengeStart) / 1000;
  const avgDelta = sessionDeltaCount ? sessionDeltaSum / sessionDeltaCount : 0;
  challengeEls.lastSessionScore.textContent = String(challengeScore);
  challengeEls.lastSessionAvgDelta.textContent = avgDelta.toFixed(2);
  if (challengeScore > bestSessionScore) {
    bestSessionScore = challengeScore;
    challengeEls.bestSessionScore.textContent = String(bestSessionScore);
  }
  sessionHistory.unshift({
    score: challengeScore,
    level: challengeLevel,
    duration,
    avgDelta,
    at: new Date().toISOString(),
  });
  sessionHistory = sessionHistory.slice(0, maxHistoryItems);
  renderChallengeHistory();
  saveChallengeHistory();
}

function stopChallenge() {
  closeChallengeSession();
  challengeMode = false;
  activeChallenge = null;
  challengeLockStart = null;
  buttons.challengeToggle.dataset.active = 'false';
  buttons.challengeToggle.textContent = 'チャレンジ開始';
  challengeEls.target.textContent = '-';
  challengeEls.status.textContent = '停止中です。再開で新しいお題を開始します。';
}

function toggleChallenge() {
  if (challengeMode) {
    stopChallenge();
  } else {
    startChallenge();
  }
}

function updateChallenge(params) {
  if (!challengeMode || !activeChallenge) return;
  const now = performance.now();
  const elapsed = (now - challengeStart) / 1000;
  challengeEls.time.textContent = `${elapsed.toFixed(1)}s`;
  const currentRatio = simplifyRatio(params.freqX, params.freqY, params.freqZ);
  const delta = ratioDelta(currentRatio, activeChallenge);
  challengeEls.delta.textContent = delta.toFixed(2);
  sessionDeltaSum += delta;
  sessionDeltaCount += 1;

  if (delta <= dynamicTolerance) {
    if (!challengeLockStart) challengeLockStart = now;
    const hold = (now - challengeLockStart) / 1000;
    challengeEls.status.textContent = `一致判定まで ${Math.max(0, dynamicLockSeconds - hold).toFixed(1)}s キープ`;
    if (hold >= dynamicLockSeconds) {
      challengeScore += 1;
      challengeEls.score.textContent = String(challengeScore);
      if (challengeScore === 3 && challengeLevel === 'easy') {
        applyChallengeLevel('normal');
        challengeEls.status.textContent = '成功！ Normalへ自動昇格。次のお題へ。';
      } else if (challengeScore === 6 && challengeLevel === 'normal') {
        applyChallengeLevel('hard');
        challengeEls.status.textContent = '成功！ Hardへ自動昇格。次のお題へ。';
      } else {
        challengeEls.status.textContent = `成功！ 次のお題へ（合計 ${challengeScore}）`;
      }
      pickChallengeTarget();
    }
    return;
  }

  challengeLockStart = null;
  challengeEls.status.textContent = `比率差を詰めてください（誤差を ${dynamicTolerance.toFixed(2)} 以下でキープ）。`;
}

function toggleRunning() {
  isRunning = !isRunning;
  buttons.toggle.dataset.running = String(isRunning);
  buttons.toggle.textContent = isRunning ? '一時停止' : '再生';
}

function toggleUnlimitedTrail() {
  isUnlimitedTrail = !isUnlimitedTrail;
  buttons.unlimitedTrail.dataset.active = String(isUnlimitedTrail);
  buttons.unlimitedTrail.textContent = isUnlimitedTrail ? '上限解除中' : '軌跡上限なし';
  inputs.trail.disabled = isUnlimitedTrail;
  if (!isUnlimitedTrail) trimTrail(trailLimit);
  updateValueLabels();
}

function applyPreset(name) {
  const map = {
    classic: { freqX: 3, freqY: 4, freqZ: 5, amplitude: 8, speed: 1.0 },
    woven: { freqX: 5, freqY: 7, freqZ: 9, amplitude: 7.5, speed: 0.9 },
    resonant: { freqX: 2, freqY: 3, freqZ: 2, amplitude: 9, speed: 1.2 },
  };
  const preset = map[name];
  if (!preset) return;
  Object.entries(preset).forEach(([k, v]) => {
    if (inputs[k]) inputs[k].value = String(v);
  });
  updateValueLabels();
  updateInsights(currentParams());
  clearTrail();
}

function saveMemo() {
  const payload = {
    ...Object.fromEntries(Object.entries(memoFields).map(([k, el]) => [k, el.value])),
    params: currentParams(),
    savedAt: new Date().toISOString(),
  };
  localStorage.setItem('game68-meta-memo', JSON.stringify(payload));
  metaHint.textContent = `保存しました (${new Date().toLocaleTimeString('ja-JP')})`;
}

function restoreMemo() {
  const raw = localStorage.getItem('game68-meta-memo');
  if (!raw) return;
  try {
    const parsed = JSON.parse(raw);
    Object.entries(memoFields).forEach(([k, el]) => {
      if (parsed[k]) el.value = parsed[k];
    });
  } catch {
    metaHint.textContent = '保存データの復元に失敗しました。再保存してください。';
  }
}

function animate() {
  requestAnimationFrame(animate);
  controls.update();

  const params = currentParams();
  updateInsights(params);
  updateChallenge(params);

  if (isRunning) {
    trailLimit = params.trail;
    const elapsed = (performance.now() - startTime) * 0.001 * params.speed;
    const pos = lissajous(elapsed, params);
    points.push(pos);

    const limit = isUnlimitedTrail ? Number.POSITIVE_INFINITY : trailLimit;
    if (points.length > limit) points.shift();

    line.geometry.setFromPoints(points);
    pointerMesh.position.copy(pos);
  }

  renderer.render(scene, camera);
}

function attachEvents() {
  Object.values(inputs).forEach((input) => {
    input.addEventListener('input', () => {
      if (input.id === 'trail') {
        trailLimit = Number(input.value);
        if (!isUnlimitedTrail) trimTrail(trailLimit);
      }
      updateValueLabels();
      updateInsights(currentParams());
      scheduleParamHistoryPush();
    });
  });

  presets.forEach((button) => {
    button.addEventListener('click', () => applyPreset(button.dataset.preset));
  });

  buttons.reset.addEventListener('click', reset);
  buttons.clear.addEventListener('click', clearTrail);
  buttons.toggle.addEventListener('click', toggleRunning);
  buttons.unlimitedTrail.addEventListener('click', toggleUnlimitedTrail);
  buttons.saveMemo.addEventListener('click', saveMemo);
  buttons.challengeToggle.addEventListener('click', toggleChallenge);
  buttons.challengeNext.addEventListener('click', () => {
    if (!challengeMode) {
      challengeEls.status.textContent = 'チャレンジ開始後にお題変更できます。';
      return;
    }
    pickChallengeTarget();
  });
  buttons.undoParams.addEventListener('click', undoParams);
  buttons.redoParams.addEventListener('click', redoParams);
  if (buttons.undoParamsDock) buttons.undoParamsDock.addEventListener('click', undoParams);
  if (buttons.redoParamsDock) buttons.redoParamsDock.addEventListener('click', redoParams);
  buttons.openTutorial.addEventListener('click', openTutorial);
  buttons.tutorialSkip.addEventListener('click', () => closeTutorial(true));
  buttons.tutorialNext.addEventListener('click', nextTutorial);

  difficultyButtons.forEach((button) => {
    button.addEventListener('click', () => {
      applyChallengeLevel(button.dataset.level);
      if (challengeMode) {
        challengeEls.status.textContent = `難易度を ${button.dataset.level.toUpperCase()} に変更しました。`;
      }
    });
  });
}

initThree();
restoreMemo();
loadChallengeHistory();
applyChallengeLevel(challengeLevel);
paramHistory = [snapshotParams()];
updateHistoryButtons();
updateValueLabels();
updateInsights(currentParams());
attachEvents();
maybeShowTutorialOnFirstVisit();
animate();
