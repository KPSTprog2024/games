(() => {
  const canvas = document.getElementById('stage');
  const ctx = canvas.getContext('2d');
  const hud = document.getElementById('hud');
  const root = document.getElementById('layoutRoot');

  const ui = {
    colorMode: document.getElementById('colorMode'),
    monoHue: document.getElementById('monoHue'),
    lineVar: document.getElementById('lineVar'),
    lineBase: document.getElementById('lineBase'),
    laserCount: document.getElementById('laserCount'),
    speed: document.getElementById('speed'),
    fade: document.getElementById('fade'),
    monoHueValue: document.getElementById('monoHueValue'),
    lineVarValue: document.getElementById('lineVarValue'),
    lineBaseValue: document.getElementById('lineBaseValue'),
    laserCountValue: document.getElementById('laserCountValue'),
    speedValue: document.getElementById('speedValue'),
    fadeValue: document.getElementById('fadeValue'),
    toggle: document.getElementById('toggle'),
    reset: document.getElementById('reset'),
    snapshot: document.getElementById('snapshot'),
    fullscreen: document.getElementById('fullscreen'),
  };

  const state = {
    running: true,
    lasers: [],
    bounds: 1,
    speed: Number(ui.speed.value),
    fade: Number(ui.fade.value),
    colorMode: ui.colorMode.value,
    monoHue: Number(ui.monoHue.value),
    lineVar: Number(ui.lineVar.value),
    lineBase: Number(ui.lineBase.value),
    bounces: 0,
    trailLimit: 180,
    pseudoFullscreen: false,
    camera: {
      yaw: 0.82,
      pitch: 0.42,
      distance: 4.5,
      panX: 0,
      panY: 0,
      velYaw: 0,
      velPitch: 0,
    },
    mouse: { down: false, shift: false, x: 0, y: 0 },
  };

  const isIOSLike = () => /iP(ad|hone|od)|Macintosh/.test(navigator.userAgent) && 'ontouchend' in document;
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
    return [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]].map(([a, b2]) => [v[a], v[b2]]);
  })();

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.floor(rect.width * dpr);
    canvas.height = Math.floor(rect.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const buildLasers = () => {
    const n = Number(ui.laserCount.value);
    state.lasers = Array.from({ length: n }, (_, i) => {
      const t = i / Math.max(1, n - 1);
      const a = t * Math.PI * 2;
      const pos = { x: Math.cos(a) * 0.2, y: Math.sin(a) * 0.2, z: Math.sin(a * 1.4) * 0.2 };
      return {
        pos,
        vel: norm({ x: Math.cos(a), y: Math.sin(a), z: Math.sin(a * 0.7) }),
        hue: (i * 360) / Math.max(1, n),
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
    const s = 600 / r.z;
    return { x: width * 0.5 + r.x * s, y: height * 0.5 - r.y * s, depth: r.z };
  };

  const reflectAxis = (value, velocity, bound) => {
    let v = value;
    let vel = velocity;
    let hit = 0;
    while (v > bound || v < -bound) {
      if (v > bound) {
        v = bound - (v - bound);
      } else {
        v = -bound + (-bound - v);
      }
      vel *= -1;
      hit += 1;
    }
    return { value: v, velocity: vel, hit };
  };

  const strokeStyleFor = (laser, progress) => {
    if (state.colorMode === 'mono') {
      return `hsla(${state.monoHue}, 100%, 70%, ${0.08 + progress * 0.85})`;
    }
    if (state.colorMode === 'monoGradient') {
      const light = 35 + progress * 45;
      return `hsla(${state.monoHue}, 100%, ${light}%, ${0.08 + progress * 0.85})`;
    }
    return `hsla(${laser.hue + progress * 90}, 100%, 65%, ${0.08 + progress * 0.85})`;
  };

  const lineWidthFor = (laser, i, progress) => {
    const wave = Math.sin((i + performance.now() * 0.01 + laser.hue) * 0.16);
    return Math.max(0.2, state.lineBase + wave * state.lineVar + progress * 0.8);
  };

  const stepLaser = (laser, dt) => {
    const distance = dt * state.speed;
    const nx = reflectAxis(laser.pos.x + laser.vel.x * distance, laser.vel.x, state.bounds);
    const ny = reflectAxis(laser.pos.y + laser.vel.y * distance, laser.vel.y, state.bounds);
    const nz = reflectAxis(laser.pos.z + laser.vel.z * distance, laser.vel.z, state.bounds);

    const hits = nx.hit + ny.hit + nz.hit;
    if (hits > 0) {
      laser.hue = (laser.hue + hits * 18) % 360;
      state.bounces += hits;
    }

    laser.pos = { x: nx.value, y: ny.value, z: nz.value };
    laser.vel = norm({ x: nx.velocity, y: ny.velocity, z: nz.velocity });
    laser.trail.push({ ...laser.pos });
    if (laser.trail.length > state.trailLimit) laser.trail.shift();
  };

  const drawCube = (w, h) => {
    ctx.lineWidth = 1.1;
    for (const [a, b] of cubeEdges) {
      const pa = project(a, w, h);
      const pb = project(b, w, h);
      if (!pa || !pb) continue;
      const alpha = Math.max(0.16, 1.1 - Math.min(pa.depth, pb.depth) / 6);
      ctx.strokeStyle = `rgba(125, 211, 252, ${alpha.toFixed(3)})`;
      ctx.beginPath();
      ctx.moveTo(pa.x, pa.y);
      ctx.lineTo(pb.x, pb.y);
      ctx.stroke();
    }
  };

  const drawLasers = (w, h) => {
    for (const laser of state.lasers) {
      if (laser.trail.length < 2) continue;
      for (let i = 1; i < laser.trail.length; i++) {
        const p0 = project(laser.trail[i - 1], w, h);
        const p1 = project(laser.trail[i], w, h);
        if (!p0 || !p1) continue;

        const progress = i / laser.trail.length;
        ctx.strokeStyle = strokeStyleFor(laser, progress);
        ctx.lineWidth = lineWidthFor(laser, i, progress);
        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.lineTo(p1.x, p1.y);
        ctx.stroke();
      }
    }
  };

  const syncUiValues = () => {
    ui.monoHueValue.textContent = ui.monoHue.value;
    ui.lineVarValue.textContent = Number(ui.lineVar.value).toFixed(1);
    ui.lineBaseValue.textContent = Number(ui.lineBase.value).toFixed(1);
    ui.laserCountValue.textContent = ui.laserCount.value;
    ui.speedValue.textContent = Number(ui.speed.value).toFixed(2);
    ui.fadeValue.textContent = Number(ui.fade.value).toFixed(2);
  };

  const syncStateFromUi = () => {
    state.colorMode = ui.colorMode.value;
    state.monoHue = Number(ui.monoHue.value);
    state.lineVar = Number(ui.lineVar.value);
    state.lineBase = Number(ui.lineBase.value);
    state.speed = Number(ui.speed.value);
    state.fade = Number(ui.fade.value);
    syncUiValues();
  };

  const enterPseudoFullscreen = () => {
    state.pseudoFullscreen = true;
    document.body.classList.add('pseudo-fs');
    ui.fullscreen.textContent = 'Exit Fullscreen';
    resize();
  };

  const exitPseudoFullscreen = () => {
    state.pseudoFullscreen = false;
    document.body.classList.remove('pseudo-fs');
    ui.fullscreen.textContent = 'Fullscreen';
    resize();
  };

  const toggleFullscreen = async () => {
    const canUseNative = !!document.fullscreenEnabled && !isIOSLike();

    if (canUseNative) {
      if (!document.fullscreenElement) {
        await root.requestFullscreen?.();
      } else {
        await document.exitFullscreen?.();
      }
      return;
    }

    if (state.pseudoFullscreen) {
      exitPseudoFullscreen();
    } else {
      enterPseudoFullscreen();
    }
  };

  let prev = performance.now();
  const frame = (now) => {
    const dt = Math.min(2.8, (now - prev) * 0.035);
    prev = now;

    // inertia update for smoother touch rotate
    state.camera.yaw += state.camera.velYaw;
    state.camera.pitch += state.camera.velPitch;
    state.camera.pitch = Math.max(-1.45, Math.min(1.45, state.camera.pitch));
    state.camera.velYaw *= 0.93;
    state.camera.velPitch *= 0.93;

    const rect = canvas.getBoundingClientRect();
    ctx.fillStyle = `rgba(2, 6, 23, ${state.fade})`;
    ctx.fillRect(0, 0, rect.width, rect.height);

    drawCube(rect.width, rect.height);
    if (state.running) state.lasers.forEach((laser) => stepLaser(laser, dt));
    drawLasers(rect.width, rect.height);

    hud.textContent = `mode:${state.colorMode} lasers:${state.lasers.length} bounces:${state.bounces}`;
    requestAnimationFrame(frame);
  };

  const bind = () => {
    [ui.colorMode, ui.monoHue, ui.lineVar, ui.lineBase, ui.laserCount, ui.speed, ui.fade].forEach((el) => {
      el.addEventListener('input', () => {
        syncStateFromUi();
      });
    });

    ui.laserCount.addEventListener('change', buildLasers);
    ui.reset.addEventListener('click', buildLasers);
    ui.toggle.addEventListener('click', () => {
      state.running = !state.running;
      ui.toggle.textContent = state.running ? 'Pause' : 'Play';
    });
    ui.snapshot.addEventListener('click', () => {
      const stamp = new Date().toISOString().replace(/[:.]/g, '-');
      const a = document.createElement('a');
      a.href = canvas.toDataURL('image/png');
      a.download = `game70-new-${stamp}.png`;
      a.click();
    });
    ui.fullscreen.addEventListener('click', toggleFullscreen);

    canvas.addEventListener('pointerdown', (e) => {
      state.mouse.down = true;
      state.mouse.shift = e.shiftKey;
      state.mouse.x = e.clientX;
      state.mouse.y = e.clientY;
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
        const impulseYaw = dx * 0.00055;
        const impulsePitch = dy * 0.00055;
        state.camera.velYaw = state.camera.velYaw * 0.62 + impulseYaw;
        state.camera.velPitch = state.camera.velPitch * 0.62 + impulsePitch;
      }
    });

    canvas.addEventListener('pointerup', () => { state.mouse.down = false; });
    canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      state.camera.distance = Math.max(2.8, Math.min(7, state.camera.distance + e.deltaY * 0.002));
    }, { passive: false });

    document.addEventListener('fullscreenchange', () => {
      ui.fullscreen.textContent = document.fullscreenElement ? 'Exit Fullscreen' : 'Fullscreen';
      resize();
    });

    window.addEventListener('resize', resize);
  };

  resize();
  bind();
  syncStateFromUi();
  buildLasers();
  requestAnimationFrame(frame);
})();
