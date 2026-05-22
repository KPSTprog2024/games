(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('../logic.js'));
  } else {
    root.Game71Generation = factory(root.Game71Logic);
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function (logic) {
  function create(levels, _logic, options = {}) {
    const seed = options.seed ?? null;
    const rng = createRng(seed);

    function randInt(min, max) {
      return Math.floor(rng.random() * (max - min + 1)) + min;
    }

    function shuffle(arr) {
      const a = [...arr];
      for (let i = a.length - 1; i > 0; i--) {
        const j = randInt(0, i);
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    }

    function generateCubes(level) {
      const cfg = levels[level - 1];
      const cubeTarget = randInt(cfg.cubes[0], cfg.cubes[1]);
      const gridRange = Math.max(2, Math.ceil(Math.sqrt(cubeTarget)));
      const occupied = new Map();

      function addCube(cube) { occupied.set(logic.keyOf(cube), cube); }

      addCube({ x: 0, y: 0, z: 0, color: 'white' });
      while (occupied.size < cubeTarget) {
        if (rng.random() < 0.45) {
          const x = randInt(-gridRange, gridRange);
          const z = randInt(-gridRange, gridRange);
          const y = 0;
          const k = logic.keyOf({ x, y, z });
          if (!occupied.has(k)) addCube({ x, y, z, color: 'white' });
        } else {
          const arr = [...occupied.values()];
          const base = arr[randInt(0, arr.length - 1)];
          const y = base.y + 1;
          if (y > cfg.maxHeight - 1) continue;
          const k = logic.keyOf({ x: base.x, y, z: base.z });
          if (!occupied.has(k)) addCube({ x: base.x, y, z: base.z, color: 'white' });
        }
      }

      const cubes = [...occupied.values()];
      const visible = logic.getVisibleFromInitial(cubes);
      const blackCount = Math.min(visible.length, randInt(cfg.black[0], cfg.black[1]));
      shuffle(visible).slice(0, blackCount).forEach((cube) => {
        const item = cubes.find((c) => c.x === cube.x && c.y === cube.y && c.z === cube.z);
        if (item) item.color = 'black';
      });
      logic.enforceVisibleBlackRule(cubes);
      return cubes;
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

    function mutateHeight(grid) {
      const out = cloneGrid(grid);
      const filled = [];
      out.data.forEach((row, y) => {
        row.forEach((cell, x) => {
          if (cell > 0) filled.push({ x, y, cell });
        });
      });
      if (!filled.length) return null;
      const pivot = filled[randInt(0, filled.length - 1)];
      const targetY = Math.max(0, Math.min(out.height - 1, pivot.y + (rng.random() < 0.5 ? -1 : 1)));
      if (targetY === pivot.y) return null;
      out.data[pivot.y][pivot.x] = 0;
      out.data[targetY][pivot.x] = pivot.cell;
      return out;
    }

    function addOption(pool, signatures, grid, type, correct = false) {
      if (!grid) return false;
      if (!correct && logic.isLowQualityDistractor(pool[0].grid, grid)) return false;
      const sig = logic.serializeGrid(grid);
      if (signatures.has(sig)) return false;
      signatures.add(sig);
      pool.push({ id: uid(), grid, correct, type });
      return true;
    }

    function makeOptions(cubes, direction, level) {
      const cfg = levels[level - 1];
      const optionCount = randInt(cfg.options[0], cfg.options[1]);
      const correct = logic.projection(cubes, direction);
      const pool = [{ id: uid(), grid: correct, correct: true, type: 'correct' }];
      const signatures = new Set([logic.serializeGrid(correct)]);

      const oppositeDirection = { front: 'back', back: 'front', right: 'left', left: 'right', top: 'front' };
      const typedSeeds = [
        { type: 'mirror_lr', grid: mirrorGrid(correct) },
        { type: 'wrong_color', grid: swapColors(correct) },
        { type: 'wrong_depth', grid: logic.projection(cubes, oppositeDirection[direction]) },
        { type: 'wrong_height', grid: mutateHeight(correct) },
      ];
      cfg.directions.forEach((d) => {
        if (d !== direction) typedSeeds.push({ type: 'other_direction', grid: logic.projection(cubes, d) });
      });

      while (pool.length < optionCount && typedSeeds.length > 0) {
        const seed = typedSeeds.shift();
        addOption(pool, signatures, seed.grid, seed.type, false);
      }

      let attempts = 0;
      while (pool.length < optionCount && attempts < 40) {
        attempts += 1;
        const fake = cloneGrid(correct);
        const y = randInt(0, fake.height - 1);
        const x = randInt(0, fake.width - 1);
        fake.data[y][x] = fake.data[y][x] === 2 ? 1 : 2;
        addOption(pool, signatures, fake, 'wrong_color', false);
      }

      return shuffle(pool).slice(0, optionCount);
    }

    function pickDirection(level, weakDirection, reviewModeRounds) {
      const dirs = levels[level - 1].directions;
      if (reviewModeRounds > 0 && weakDirection && dirs.includes(weakDirection)) return weakDirection;
      return dirs[randInt(0, dirs.length - 1)];
    }

    function uid() {
      if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
      const n = Math.floor(rng.random() * 1e9).toString(16);
      return `id_${n}_${Date.now().toString(16)}`;
    }

    return { generateCubes, makeOptions, pickDirection, seed };
  }

  function createRng(seed) {
    if (seed === null || seed === undefined || seed === '') {
      return { random: () => Math.random() };
    }
    let h = 1779033703 ^ String(seed).length;
    for (let i = 0; i < String(seed).length; i++) {
      h = Math.imul(h ^ String(seed).charCodeAt(i), 3432918353);
      h = (h << 13) | (h >>> 19);
    }
    let t = h >>> 0;
    return {
      random: () => {
        t += 0x6d2b79f5;
        let x = t;
        x = Math.imul(x ^ (x >>> 15), x | 1);
        x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
        return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
      },
    };
  }

  return { create };
});
