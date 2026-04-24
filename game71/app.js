(() => {
  const DIRECTION_SYMBOLS = { front: '○', right: '△', left: '□', back: '×', top: '☆' };
  const LEVELS = [
    { cubes: [2, 4], maxHeight: 2, directions: ['front', 'right'], options: [2, 2], black: [1, 1] },
    { cubes: [4, 6], maxHeight: 3, directions: ['front', 'right', 'left'], options: [3, 4], black: [1, 2] },
    { cubes: [6, 9], maxHeight: 3, directions: ['front', 'right', 'left', 'back'], options: [4, 4], black: [2, 3] },
    { cubes: [7, 10], maxHeight: 4, directions: ['front', 'right', 'left', 'back', 'top'], options: [4, 5], black: [2, 3] },
    { cubes: [8, 12], maxHeight: 4, directions: ['front', 'right', 'left', 'back', 'top'], options: [5, 6], black: [2, 4] }
  ];

  const sceneEl = document.getElementById('scene');
  const promptEl = document.getElementById('prompt');
  const feedbackEl = document.getElementById('feedback');
  const analysisEl = document.getElementById('analysis');
  const choicesEl = document.getElementById('choices');
  const nextBtn = document.getElementById('nextBtn');
  const levelLabel = document.getElementById('levelLabel');
  const scoreLabel = document.getElementById('scoreLabel');
  const normalModeBtn = document.getElementById('normalMode');
  const hintModeBtn = document.getElementById('hintMode');
  const hintRotateBtn = document.getElementById('hintRotate');

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-4.8, 4.8, 3.7, -3.7, 0.1, 100);
  const board = new THREE.Group();
  const raycaster = new THREE.Raycaster();
  const ambient = new THREE.AmbientLight(0xffffff, 0.7);
  const directional = new THREE.DirectionalLight(0xffffff, 0.8);
  directional.position.set(6, 10, 8);
  scene.add(ambient, directional, board);

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  sceneEl.appendChild(renderer.domElement);

  const state = {
    level: 1,
    score: 0,
    total: 0,
    hintMode: false,
    locked: false,
    cubes: [],
    targetDirection: 'right',
    options: [],
    correctOptionId: '',
    answerDirection: 'right',
    cameraTween: null,
  };

  const INITIAL_CAMERA = new THREE.Vector3(4.5, 3.2, 5.5);
  const LOOK_AT = new THREE.Vector3(0, 0.8, 0);

  function resize() {
    const w = sceneEl.clientWidth;
    const h = sceneEl.clientHeight;
    renderer.setSize(w, h);
    const aspect = w / h;
    const view = 4.5;
    camera.left = -view * aspect;
    camera.right = view * aspect;
    camera.top = view;
    camera.bottom = -view;
    camera.updateProjectionMatrix();
  }

  function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function keyOf({ x, y, z }) {
    return `${x},${y},${z}`;
  }

  function generateCubes(level) {
    const cfg = LEVELS[level - 1];
    const cubeTarget = randInt(cfg.cubes[0], cfg.cubes[1]);
    const gridRange = Math.max(2, Math.ceil(Math.sqrt(cubeTarget)));
    const occupied = new Map();

    function addCube(cube) { occupied.set(keyOf(cube), cube); }

    addCube({ x: 0, y: 0, z: 0, color: 'white' });
    while (occupied.size < cubeTarget) {
      if (Math.random() < 0.45) {
        const x = randInt(-gridRange, gridRange);
        const z = randInt(-gridRange, gridRange);
        const y = 0;
        const k = keyOf({ x, y, z });
        if (!occupied.has(k)) addCube({ x, y, z, color: 'white' });
      } else {
        const arr = [...occupied.values()];
        const base = arr[randInt(0, arr.length - 1)];
        const y = base.y + 1;
        if (y > cfg.maxHeight - 1) continue;
        const k = keyOf({ x: base.x, y, z: base.z });
        if (!occupied.has(k)) addCube({ x: base.x, y, z: base.z, color: 'white' });
      }
    }

    const cubes = [...occupied.values()];
    const visible = getVisibleFromInitial(cubes);
    const blackCount = Math.min(visible.length, randInt(cfg.black[0], cfg.black[1]));
    shuffle(visible).slice(0, blackCount).forEach((cube) => {
      const item = cubes.find((c) => c.x === cube.x && c.y === cube.y && c.z === cube.z);
      if (item) item.color = 'black';
    });

    return cubes;
  }

  function getVisibleFromInitial(cubes) {
    const front = new Map();
    const right = new Map();
    const top = new Map();

    cubes.forEach((c) => {
      const f = `${c.x},${c.y}`;
      const r = `${c.z},${c.y}`;
      const t = `${c.x},${c.z}`;
      if (!front.has(f) || c.z < front.get(f).z) front.set(f, c);
      if (!right.has(r) || c.x > right.get(r).x) right.set(r, c);
      if (!top.has(t) || c.y > top.get(t).y) top.set(t, c);
    });

    const merged = new Map();
    [...front.values(), ...right.values(), ...top.values()].forEach((c) => merged.set(keyOf(c), c));
    return [...merged.values()];
  }

  function projection(cubes, direction) {
    const picked = new Map();

    cubes.forEach((c) => {
      let key;
      if (direction === 'front' || direction === 'back') key = `${c.x},${c.y}`;
      else if (direction === 'right' || direction === 'left') key = `${c.z},${c.y}`;
      else key = `${c.x},${c.z}`;

      const curr = picked.get(key);
      if (!curr) return picked.set(key, c);

      if (direction === 'front' && c.z < curr.z) picked.set(key, c);
      if (direction === 'back' && c.z > curr.z) picked.set(key, c);
      if (direction === 'right' && c.x > curr.x) picked.set(key, c);
      if (direction === 'left' && c.x < curr.x) picked.set(key, c);
      if (direction === 'top' && c.y > curr.y) picked.set(key, c);
    });

    const coords = [];
    picked.forEach((cube) => {
      if (direction === 'front' || direction === 'back') coords.push({ u: cube.x, v: cube.y, color: cube.color });
      if (direction === 'right' || direction === 'left') coords.push({ u: cube.z, v: cube.y, color: cube.color });
      if (direction === 'top') coords.push({ u: cube.x, v: cube.z, color: cube.color });
    });

    let mapped = coords;
    if (direction === 'left' || direction === 'back') {
      mapped = coords.map((c) => ({ ...c, u: -c.u }));
    }

    const minU = Math.min(...mapped.map((c) => c.u));
    const maxU = Math.max(...mapped.map((c) => c.u));
    const minV = Math.min(...mapped.map((c) => c.v));
    const maxV = Math.max(...mapped.map((c) => c.v));
    const width = maxU - minU + 1;
    const height = maxV - minV + 1;
    const data = Array.from({ length: height }, () => Array(width).fill(0));

    mapped.forEach((c) => {
      const x = c.u - minU;
      const y = maxV - c.v;
      data[y][x] = c.color === 'black' ? 2 : 1;
    });

    return { width, height, data };
  }

  function serializeGrid(grid) {
    return grid.data.map((row) => row.join('')).join('|');
  }

  function cloneGrid(grid) {
    return { width: grid.width, height: grid.height, data: grid.data.map((r) => [...r]) };
  }

  function mirrorGrid(grid) {
    const out = cloneGrid(grid);
    out.data = out.data.map((row) => [...row].reverse());
    return out;
  }

  function swapColors(grid) {
    const out = cloneGrid(grid);
    out.data = out.data.map((row) => row.map((v) => (v === 2 ? 1 : v === 1 ? 2 : 0)));
    return out;
  }

  function makeOptions(cubes, direction, level) {
    const cfg = LEVELS[level - 1];
    const optionCount = randInt(cfg.options[0], cfg.options[1]);
    const correct = projection(cubes, direction);
    const pool = [{ id: crypto.randomUUID(), grid: correct, correct: true }];
    const signatures = new Set([serializeGrid(correct)]);

    const distractorSeeds = [];
    cfg.directions.forEach((d) => {
      if (d !== direction) distractorSeeds.push(projection(cubes, d));
    });
    distractorSeeds.push(mirrorGrid(correct));
    distractorSeeds.push(swapColors(correct));

    while (pool.length < optionCount && distractorSeeds.length > 0) {
      const seed = distractorSeeds.shift();
      const sig = serializeGrid(seed);
      if (signatures.has(sig)) continue;
      signatures.add(sig);
      pool.push({ id: crypto.randomUUID(), grid: seed, correct: false });
      if (pool.length < optionCount) {
        const mut = Math.random() < 0.5 ? mirrorGrid(seed) : swapColors(seed);
        const ms = serializeGrid(mut);
        if (!signatures.has(ms)) {
          signatures.add(ms);
          pool.push({ id: crypto.randomUUID(), grid: mut, correct: false });
        }
      }
    }

    while (pool.length < optionCount) {
      const fake = cloneGrid(correct);
      const y = randInt(0, fake.height - 1);
      const x = randInt(0, fake.width - 1);
      fake.data[y][x] = fake.data[y][x] === 2 ? 1 : 2;
      const sig = serializeGrid(fake);
      if (signatures.has(sig)) continue;
      signatures.add(sig);
      pool.push({ id: crypto.randomUUID(), grid: fake, correct: false });
    }

    return shuffle(pool).slice(0, optionCount);
  }

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = randInt(0, i);
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function renderChoices(options) {
    choicesEl.innerHTML = '';
    options.forEach((option, idx) => {
      const btn = document.createElement('button');
      btn.className = 'choice';
      btn.dataset.id = option.id;
      btn.setAttribute('aria-label', `選択肢${idx + 1}`);

      const grid = document.createElement('div');
      grid.className = 'option-grid';
      grid.style.gridTemplateColumns = `repeat(${option.grid.width}, 16px)`;

      option.grid.data.forEach((row) => {
        row.forEach((cellVal) => {
          const cell = document.createElement('span');
          cell.className = 'cell';
          if (cellVal === 2) cell.classList.add('black');
          if (cellVal === 0) cell.classList.add('empty');
          grid.appendChild(cell);
        });
      });

      btn.appendChild(grid);
      btn.addEventListener('click', () => submitAnswer(option.id));
      choicesEl.appendChild(btn);
    });
  }

  function mountCubes(cubes) {
    board.clear();
    const geo = new THREE.BoxGeometry(1, 1, 1);

    cubes.forEach((cube) => {
      const material = new THREE.MeshLambertMaterial({
        color: cube.color === 'black' ? 0x3d3d3d : 0xf8f8f8,
      });
      const mesh = new THREE.Mesh(geo, material);
      mesh.position.set(cube.x, cube.y + 0.5, cube.z);
      board.add(mesh);

      const line = new THREE.LineSegments(
        new THREE.EdgesGeometry(geo),
        new THREE.LineBasicMaterial({ color: 0x7a86a8 })
      );
      line.position.copy(mesh.position);
      board.add(line);
    });

    const box = new THREE.Box3().setFromObject(board);
    const center = box.getCenter(new THREE.Vector3());
    board.position.sub(center);
  }

  function setCameraInstant(direction) {
    const p = directionToPosition(direction);
    camera.position.copy(p);
    camera.lookAt(LOOK_AT);
  }

  function rotateToDirection(direction, duration = 1000) {
    state.cameraTween = {
      from: camera.position.clone(),
      to: directionToPosition(direction),
      start: performance.now(),
      duration,
    };
  }

  function directionToPosition(direction) {
    if (direction === 'init') return INITIAL_CAMERA.clone();
    if (direction === 'front') return new THREE.Vector3(0, 2.4, 6.8);
    if (direction === 'right') return new THREE.Vector3(6.8, 2.4, 0);
    if (direction === 'left') return new THREE.Vector3(-6.8, 2.4, 0);
    if (direction === 'back') return new THREE.Vector3(0, 2.4, -6.8);
    return new THREE.Vector3(0, 7.2, 0.001);
  }

  function submitAnswer(optionId) {
    if (state.locked) return;
    state.locked = true;
    state.total += 1;

    const isCorrect = optionId === state.correctOptionId;
    if (isCorrect) state.score += 1;
    scoreLabel.textContent = `${state.score} / ${state.total}`;

    const reason = pickAnalysis(isCorrect);
    analysisEl.textContent = reason;
    feedbackEl.textContent = isCorrect ? 'せいかい！ くるっと見るとこうなるよ' : 'おしい！ くるっと回して見てみよう';
    feedbackEl.className = `feedback ${isCorrect ? 'ok' : 'bad'}`;

    [...choicesEl.children].forEach((choice) => {
      const id = choice.dataset.id;
      choice.disabled = true;
      if (id === optionId) choice.classList.add('selected');
      if (id === state.correctOptionId) choice.classList.add('correct');
      if (id === optionId && !isCorrect) choice.classList.add('wrong');
    });

    rotateToDirection(state.answerDirection, randInt(800, 1200));
    nextBtn.disabled = false;
  }

  function pickAnalysis(correct) {
    if (correct) return 'いい観察！ 手前と高さを正しく読めたね。';
    const tips = ['左右逆だったかも', '高さを見間違えたかも', '黒の位置が違ったかも'];
    return tips[randInt(0, tips.length - 1)];
  }

  function newQuestion() {
    state.locked = false;
    const lvl = LEVELS[state.level - 1];

    state.cubes = generateCubes(state.level);
    mountCubes(state.cubes);
    camera.position.copy(INITIAL_CAMERA);
    camera.lookAt(LOOK_AT);

    state.targetDirection = lvl.directions[randInt(0, lvl.directions.length - 1)];
    state.answerDirection = state.targetDirection;
    state.options = makeOptions(state.cubes, state.targetDirection, state.level);
    const correct = state.options.find((o) => o.correct);
    state.correctOptionId = correct.id;

    promptEl.textContent = `${DIRECTION_SYMBOLS[state.targetDirection]}のほうから見るとどれかな？`;
    feedbackEl.textContent = 'テンポよくいこう！';
    feedbackEl.className = 'feedback';
    analysisEl.textContent = '';
    nextBtn.disabled = true;

    renderChoices(state.options);
  }

  function advanceLevel() {
    if (state.total > 0 && state.total % 5 === 0 && state.level < 5) {
      state.level += 1;
    }
    levelLabel.textContent = `Lv${state.level}`;
  }

  function animate(now) {
    if (state.cameraTween) {
      const t = Math.min(1, (now - state.cameraTween.start) / state.cameraTween.duration);
      camera.position.lerpVectors(state.cameraTween.from, state.cameraTween.to, t);
      camera.lookAt(LOOK_AT);
      if (t >= 1) state.cameraTween = null;
    }
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  normalModeBtn.addEventListener('click', () => {
    state.hintMode = false;
    normalModeBtn.classList.add('active');
    hintModeBtn.classList.remove('active');
    hintRotateBtn.disabled = true;
  });

  hintModeBtn.addEventListener('click', () => {
    state.hintMode = true;
    hintModeBtn.classList.add('active');
    normalModeBtn.classList.remove('active');
    hintRotateBtn.disabled = false;
  });

  hintRotateBtn.addEventListener('click', () => {
    if (!state.hintMode || state.locked) return;
    const dirs = ['front', 'right', 'left', 'back', 'top'];
    const d = dirs[randInt(0, dirs.length - 1)];
    rotateToDirection(d, 450);
    setTimeout(() => {
      rotateToDirection('init', 450);
      setTimeout(() => {
        camera.position.copy(INITIAL_CAMERA);
        camera.lookAt(LOOK_AT);
      }, 460);
    }, 500);
  });

  nextBtn.addEventListener('click', () => {
    advanceLevel();
    newQuestion();
  });

  sceneEl.addEventListener('pointermove', (event) => {
    if (!state.hintMode || state.locked || !event.buttons) return;
    const rect = renderer.domElement.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera({ x, y }, camera);
  });

  window.addEventListener('resize', resize);
  resize();
  newQuestion();
  animate(performance.now());
})();
