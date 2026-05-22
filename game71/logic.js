(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.Game71Logic = factory();
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  function keyOf(pos) {
    return `${pos.x},${pos.y},${pos.z}`;
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

  function enforceVisibleBlackRule(cubes) {
    const visibleKeys = new Set(getVisibleFromInitial(cubes).map((cube) => keyOf(cube)));
    cubes.forEach((cube) => {
      if (cube.color === 'black' && !visibleKeys.has(keyOf(cube))) cube.color = 'white';
    });
    return cubes;
  }

  function projection(cubes, direction) {
    const picked = new Map();

    cubes.forEach((c) => {
      let key;
      if (direction === 'front' || direction === 'back') key = `${c.x},${c.y}`;
      else if (direction === 'right' || direction === 'left') key = `${c.z},${c.y}`;
      else key = `${c.x},${c.z}`;

      const curr = picked.get(key);
      if (!curr) {
        picked.set(key, c);
        return;
      }

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

    const mapped = (direction === 'left' || direction === 'back')
      ? coords.map((c) => ({ ...c, u: -c.u }))
      : coords;

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

  function isLowQualityDistractor(correctGrid, candidate) {
    if (!candidate || correctGrid.width !== candidate.width || correctGrid.height !== candidate.height) return false;
    let diff = 0;
    for (let y = 0; y < correctGrid.height; y++) {
      for (let x = 0; x < correctGrid.width; x++) {
        if (correctGrid.data[y][x] !== candidate.data[y][x]) diff += 1;
      }
    }
    return diff < 2;
  }

  return {
    keyOf,
    getVisibleFromInitial,
    enforceVisibleBlackRule,
    projection,
    serializeGrid,
    isLowQualityDistractor,
  };
});
