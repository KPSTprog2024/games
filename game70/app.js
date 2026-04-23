(() => {
  const canvas = document.getElementById('stage');
  const ctx = canvas.getContext('2d');
  const hud = document.getElementById('hud');

  const ui = {
    preset: document.getElementById('preset'),
    placement: document.getElementById('placement'),
    laserCount: document.getElementById('laserCount'),
    fan: document.getElementById('fan'),
    speed: document.getElementById('speed'),
    fade: document.getElementById('fade'),
    distance: document.getElementById('distance'),
    maxBounce: document.getElementById('maxBounce'),
    laserCountValue: document.getElementById('laserCountValue'),
    fanValue: document.getElementById('fanValue'),
    speedValue: document.getElementById('speedValue'),
    fadeValue: document.getElementById('fadeValue'),
    distanceValue: document.getElementById('distanceValue'),
    maxBounceValue: document.getElementById('maxBounceValue'),
    toggle: document.getElementById('toggle'),
    reset: document.getElementById('reset'),
    snapshot: document.getElementById('snapshot'),
    fullscreen: document.getElementById('fullscreen'),
  };

  const presets = {
    custom: null,
    core5: { count: 5, placement: 'radial', fan: 120, speed: 0.95, fade: 0.12 },
    symmetric8: { count: 8, placement: 'ring', fan: 180, speed: 0.82, fade: 0.1 },
    orbit12: { count: 12, placement: 'grid', fan: 240, speed: 1.2, fade: 0.08 },
    chaos16: { count: 16, placement: 'random', fan: 360, speed: 1.6, fade: 0.15 },
  };

  const state = {
    running: true,
    lasers: [],
    bounds: 1,
    speed: Number(ui.speed.value),
    fade: Number(ui.fade.value),
    placement: ui.placement.value,
    fan: Number(ui.fan.value),
    maxBounces: Number(ui.maxBounce.value),
    bounces: 0,
    trailLimit: 160,
    camera: {
      yaw: 0.85,
      pitch: 0.45,
      distance: Number(ui.distance.value),
      panX: 0,
      panY: 0,
    },
    mouse: { down: false, x: 0, y: 0, shift: false },
  };

  const rand = (a, b) => a + Math.random() * (b - a);
  const norm = (v) => {
    const m = Math.hypot(v.x, v.y, v.z) || 1;
    return { x: v.x / m, y: v.y / m, z: v.z / m };
  };

  const cubeEdges = (() => {
    const b = state.bounds;
    const v = [
      [-b, -b, -b], [b, -b, -b], [b, b, -b], [-b, b, -b],
      [-b, -b, b], [b, -b, b], [b, b, b], [-b, b, b],
    ].map(([x, y, z]) => ({ x, y, z }));
    return [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]]
      .map(([a, b2]) => [v[a], v[b2]]);
  })();

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.floor(rect.width * dpr);
    canvas.height = Math.floor(rect.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const getPlacementPos = (index, n) => {
    switch (state.placement) {
      case 'radial':
        return { x: 0, y: 0, z: 0 };
      case 'grid': {
        const axis = Math.ceil(Math.cbrt(n));
        const gx = index % axis;
        const gy = Math.floor(index / axis) % axis;
        const gz = Math.floor(index / (axis * axis));
        const span = 1.6;
        return {
          x: -0.8 + (gx / Math.max(1, axis - 1)) * span,
          y: -0.8 + (gy / Math.max(1, axis - 1)) * span,
          z: -0.8 + (gz / Math.max(1, axis - 1)) * span,
        };
      }
      case 'ring': {
        const angle = (index / Math.max(1, n)) * Math.PI * 2;
        return { x: Math.cos(angle) * 0.72, y: Math.sin(angle) * 0.72, z: Math.sin(angle * 1.5) * 0.2 };
      }
      case 'random':
      default:
        return { x: rand(-0.85, 0.85), y: rand(-0.85, 0.85), z: rand(-0.85, 0.85) };
    }
  };

  const getPlacementVel = (index, n, pos) => {
    if (state.placement === 'radial') {
      const fan = state.fan * (Math.PI / 180);
      const start = -fan / 2;
      const t = n <= 1 ? 0.5 : index / (n - 1);
      const a = start + fan * t;
      return norm({ x: Math.cos(a), y: Math.sin(a), z: Math.sin(a * 0.7) * 0.8 });
    }

    if (state.placement === 'ring') {
      return norm({ x: -pos.y, y: pos.x, z: 0.35 + Math.sin(index * 0.7) * 0.45 });
    }

    if (state.placement === 'grid') {
      const yaw = ((index * 137.5) % 360) * (Math.PI / 180);
      const pitch = (((index * 73) % 120) - 60) * (Math.PI / 180);
      return norm({ x: Math.cos(yaw) * Math.cos(pitch), y: Math.sin(yaw) * Math.cos(pitch), z: Math.sin(pitch) });
    }

    return norm({ x: rand(-1, 1), y: rand(-1, 1), z: rand(-1, 1) });
  };

  const buildLasers = () => {
    const n = Number(ui.laserCount.value);
    state.lasers = Array.from({ length: n }, (_, i) => {
      const pos = getPlacementPos(i, n);
      return {
        pos,
        vel: getPlacementVel(i, n, pos),
        hue: (i * 320) / Math.max(1, n),
        trail: [pos],
      };
    });
    state.bounces = 0;
  };

  const rotateToCamera = (p) => {
    const { yaw, pitch, distance, panX, panY } = state.camera;
    const cx = Math.cos(yaw), sx = Math.sin(yaw);
    const cy = Math.cos(pitch), sy = Math.sin(pitch);

    const x = p.x + panX;
    const y = p.y + panY;
    const z = p.z;

    const x1 = cx * x - sx * z;
    const z1 = sx * x + cx * z;

    const y2 = cy * y - sy * z1;
    const z2 = sy * y + cy * z1 + distance;

    return { x: x1, y: y2, z: z2 };
  };

  const project = (p, width, height) => {
    const r = rotateToCamera(p);
    if (r.z <= 0.15) return null;
    const fov = 600;
    const s = fov / r.z;
    return { x: width * 0.5 + r.x * s, y: height * 0.5 - r.y * s, depth: r.z };
  };

  const reflectAxis = (value, velocity, bound) => {
    let v = value;
    let vel = velocity;
    let hit = 0;

    while (v > bound || v < -bound) {
      if (v > bound) {
        v = bound - (v - bound);
        vel *= -1;
        hit += 1;
      } else if (v < -bound) {
        v = -bound + (-bound - v);
        vel *= -1;
        hit += 1;
      }
    }
    return { value: v, velocity: vel, hit };
  };

  const stepLaser = (laser, dt) => {
    if (state.bounces >= state.maxBounces) return;

    const bound = state.bounds;
    const dist = dt * state.speed;

    const nextX = reflectAxis(laser.pos.x + laser.vel.x * dist, laser.vel.x, bound);
    const nextY = reflectAxis(laser.pos.y + laser.vel.y * dist, laser.vel.y, bound);
    const nextZ = reflectAxis(laser.pos.z + laser.vel.z * dist, laser.vel.z, bound);

    const hits = nextX.hit + nextY.hit + nextZ.hit;
    if (hits > 0) {
      laser.hue = (laser.hue + hits * 24) % 360;
      state.bounces += hits;
    }

    laser.pos = { x: nextX.value, y: nextY.value, z: nextZ.value };
    laser.vel = norm({ x: nextX.velocity, y: nextY.velocity, z: nextZ.velocity });
    laser.trail.push({ ...laser.pos });
    if (laser.trail.length > state.trailLimit) laser.trail.shift();
  };

  const drawCube = (width, height) => {
    ctx.lineWidth = 1.1;
    for (const [a, b] of cubeEdges) {
      const pa = project(a, width, height);
      const pb = project(b, width, height);
      if (!pa || !pb) continue;
      const alpha = Math.max(0.17, 1.1 - Math.min(pa.depth, pb.depth) / 6);
      ctx.strokeStyle = `rgba(125, 211, 252, ${alpha.toFixed(3)})`;
      ctx.beginPath();
      ctx.moveTo(pa.x, pa.y);
      ctx.lineTo(pb.x, pb.y);
      ctx.stroke();
    }
  };

  const drawLasers = (width, height) => {
    for (const laser of state.lasers) {
      if (laser.trail.length < 2) continue;
      for (let i = 1; i < laser.trail.length; i++) {
        const p0 = project(laser.trail[i - 1], width, height);
        const p1 = project(laser.trail[i], width, height);
        if (!p0 || !p1) continue;

        const t = i / laser.trail.length;
        ctx.strokeStyle = `hsla(${laser.hue + i * 0.4}, 100%, 66%, ${0.07 + t * 0.9})`;
        ctx.lineWidth = 0.6 + t * 2;
        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.lineTo(p1.x, p1.y);
        ctx.stroke();
      }
    }
  };

  const syncUiValues = () => {
    ui.laserCountValue.textContent = ui.laserCount.value;
    ui.fanValue.textContent = ui.fan.value;
    ui.speedValue.textContent = Number(ui.speed.value).toFixed(2);
    ui.fadeValue.textContent = Number(ui.fade.value).toFixed(2);
    ui.distanceValue.textContent = Number(ui.distance.value).toFixed(1);
    ui.maxBounceValue.textContent = ui.maxBounce.value;
  };

  const syncStateFromUi = () => {
    state.speed = Number(ui.speed.value);
    state.fade = Number(ui.fade.value);
    state.fan = Number(ui.fan.value);
    state.placement = ui.placement.value;
    state.maxBounces = Number(ui.maxBounce.value);
    state.camera.distance = Number(ui.distance.value);
    syncUiValues();
  };

  const applyPreset = () => {
    const preset = presets[ui.preset.value];
    if (!preset) return;

    ui.laserCount.value = String(preset.count);
    ui.placement.value = preset.placement;
    ui.fan.value = String(preset.fan);
    ui.speed.value = String(preset.speed);
    ui.fade.value = String(preset.fade);

    syncStateFromUi();
    buildLasers();
  };

  let prev = performance.now();
  const frame = (now) => {
    const dt = Math.min(2.6, (now - prev) * 0.035);
    prev = now;

    const rect = canvas.getBoundingClientRect();
    ctx.fillStyle = `rgba(2, 6, 23, ${state.fade})`;
    ctx.fillRect(0, 0, rect.width, rect.height);

    drawCube(rect.width, rect.height);
    if (state.running && state.bounces < state.maxBounces) {
      state.lasers.forEach((laser) => stepLaser(laser, dt));
    }
    drawLasers(rect.width, rect.height);

    const cap = state.bounces >= state.maxBounces ? ' [cap reached]' : '';
    hud.textContent = `lasers:${state.lasers.length}  bounces:${state.bounces}/${state.maxBounces}${cap}  mode:${state.placement}`;
    requestAnimationFrame(frame);
  };

  const bind = () => {
    [ui.laserCount, ui.fan, ui.speed, ui.fade, ui.distance, ui.maxBounce].forEach((el) => {
      el.addEventListener('input', () => {
        ui.preset.value = 'custom';
        syncStateFromUi();
      });
    });

    ui.placement.addEventListener('change', () => {
      ui.preset.value = 'custom';
      syncStateFromUi();
      buildLasers();
    });

    ui.preset.addEventListener('change', applyPreset);
    ui.laserCount.addEventListener('change', buildLasers);
    ui.fan.addEventListener('change', buildLasers);

    ui.toggle.addEventListener('click', () => {
      state.running = !state.running;
      ui.toggle.textContent = state.running ? 'Pause' : 'Play';
    });
    ui.reset.addEventListener('click', buildLasers);
    ui.snapshot.addEventListener('click', () => {
      const stamp = new Date().toISOString().replace(/[:.]/g, '-');
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = `game70-snapshot-${stamp}.png`;
      link.click();
    });
    ui.fullscreen.addEventListener('click', async () => {
      if (!document.fullscreenElement) {
        await canvas.requestFullscreen?.();
        ui.fullscreen.textContent = 'Exit Fullscreen';
      } else {
        await document.exitFullscreen?.();
        ui.fullscreen.textContent = 'Fullscreen';
      }
    });

    canvas.addEventListener('pointerdown', (e) => {
      state.mouse.down = true;
      state.mouse.x = e.clientX;
      state.mouse.y = e.clientY;
      state.mouse.shift = e.shiftKey;
      canvas.setPointerCapture(e.pointerId);
    });

    canvas.addEventListener('pointermove', (e) => {
      if (!state.mouse.down) return;
      const dx = e.clientX - state.mouse.x;
      const dy = e.clientY - state.mouse.y;
      state.mouse.x = e.clientX;
      state.mouse.y = e.clientY;

      if (state.mouse.shift) {
        state.camera.panX += dx * 0.004;
        state.camera.panY -= dy * 0.004;
      } else {
        state.camera.yaw += dx * 0.01;
        state.camera.pitch = Math.max(-1.45, Math.min(1.45, state.camera.pitch + dy * 0.01));
      }
    });

    canvas.addEventListener('pointerup', () => { state.mouse.down = false; });
    canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      state.camera.distance = Math.max(2.8, Math.min(7, state.camera.distance + e.deltaY * 0.002));
      ui.distance.value = state.camera.distance.toFixed(1);
      syncUiValues();
    }, { passive: false });

    window.addEventListener('resize', resize);
    document.addEventListener('fullscreenchange', () => {
      ui.fullscreen.textContent = document.fullscreenElement ? 'Exit Fullscreen' : 'Fullscreen';
      resize();
    });
  };

  resize();
  bind();
  syncStateFromUi();
  applyPreset();
  buildLasers();

  requestAnimationFrame(frame);
})();
