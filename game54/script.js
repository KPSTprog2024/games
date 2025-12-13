import * as THREE from 'https://unpkg.com/three@0.164.1/build/three.module.js?module';
import { OrbitControls } from 'https://unpkg.com/three@0.164.1/examples/jsm/controls/OrbitControls.js?module';

const sceneEl = document.getElementById('scene');
const ratioDisplay = document.getElementById('ratioDisplay');
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
};

let renderer, scene, camera, controls;
let line, points = [], trailLimit = parseInt(inputs.trail.value, 10);
let pointerMesh;
const componentLines = {};
const componentPoints = { x: [], y: [], z: [] };
const componentPointers = {};
const componentOffsets = {
  x: new THREE.Vector3(-16, 0, 0),
  y: new THREE.Vector3(16, 0, 0),
  z: new THREE.Vector3(0, 0, -16),
};
const freqLabels = {};
const labelTexts = { x: '', y: '', z: '' };
const labelColors = { x: '#ef4444', y: '#10b981', z: '#3b82f6' };
let isUnlimitedTrail = false;
let isRunning = true;
let startTime = performance.now();

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
  renderer.domElement.style.width = `${width}px`;
  renderer.domElement.style.height = `${height}px`;
  renderer.domElement.style.display = 'block';
  sceneEl.appendChild(renderer.domElement);

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 1000);
  camera.position.set(20, 16, 20);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.enablePan = true;
  controls.target.set(0, 0, 0);

  const hemi = new THREE.HemisphereLight(0xffffff, 0x080820, 1.1);
  scene.add(hemi);

  const dir = new THREE.DirectionalLight(0xffffff, 0.6);
  dir.position.set(5, 10, 7);
  scene.add(dir);

  const gridFloor = new THREE.GridHelper(30, 30, 0x22d3ee, 0x1f2937);
  gridFloor.material.opacity = 0.35;
  gridFloor.material.transparent = true;
  scene.add(gridFloor);

  const gridWall = new THREE.GridHelper(30, 30, 0x10b981, 0x1f2937);
  gridWall.rotation.x = Math.PI / 2;
  gridWall.position.y = 15;
  gridWall.position.z = -15;
  gridWall.material.opacity = 0.25;
  gridWall.material.transparent = true;
  scene.add(gridWall);

  const axes = new THREE.AxesHelper(6);
  scene.add(axes);

  const geometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
  const material = new THREE.LineBasicMaterial({ color: 0x22d3ee, linewidth: 2, transparent: true, opacity: 0.8 });
  line = new THREE.Line(geometry, material);
  scene.add(line);

  const sphereGeo = new THREE.SphereGeometry(0.25, 24, 24);
  const sphereMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0x10b981, emissiveIntensity: 0.9 });
  pointerMesh = new THREE.Mesh(sphereGeo, sphereMat);
  scene.add(pointerMesh);

  const componentColors = { x: 0xef4444, y: 0x10b981, z: 0x3b82f6 };
  const miniSphereGeo = new THREE.SphereGeometry(0.18, 20, 20);
  ['x', 'y', 'z'].forEach((axis) => {
    const compGeo = new THREE.BufferGeometry().setFromPoints([]);
    const compMat = new THREE.LineBasicMaterial({ color: componentColors[axis], transparent: true, opacity: 0.7 });
    componentLines[axis] = new THREE.Line(compGeo, compMat);
    scene.add(componentLines[axis]);

    const miniMat = new THREE.MeshStandardMaterial({ color: componentColors[axis], emissive: componentColors[axis], emissiveIntensity: 0.8 });
    const mini = new THREE.Mesh(miniSphereGeo, miniMat);
    componentPointers[axis] = mini;
    componentPointers[axis].position.copy(componentOffsets[axis]);
    scene.add(mini);
  });

  ['x', 'y', 'z'].forEach((axis) => {
    freqLabels[axis] = createLabelSprite('', labelColors[axis]);
    scene.add(freqLabels[axis]);
  });

  window.addEventListener('resize', onResize);
  window.addEventListener('keydown', onKey);
}

function onResize() {
  const { width, height } = getSceneSize();
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
  renderer.domElement.style.width = `${width}px`;
  renderer.domElement.style.height = `${height}px`;
}

function onKey(e) {
  if (e.key.toLowerCase() === 'r') {
    reset();
  }
}

function updateValueLabels() {
  Object.entries(inputs).forEach(([key, input]) => {
    if (key === 'trail') {
      valueEls[key].textContent = isUnlimitedTrail ? '∞' : input.value;
    } else {
      valueEls[key].textContent = Number(input.value).toFixed(1).replace(/\.0$/, '.0');
    }
  });
  updateRatioDisplay();
}

function updateRatioDisplay() {
  const fx = Number(inputs.freqX.value);
  const fy = Number(inputs.freqY.value);
  const fz = Number(inputs.freqZ.value);
  const simplify = (a, b, c) => {
    const gcd2 = (x, y) => (!y ? x : gcd2(y, x % y));
    const g = gcd2(gcd2(Math.round(a * 10), Math.round(b * 10)), Math.round(c * 10));
    return [a * 10 / g, b * 10 / g, c * 10 / g].map((n) => Math.round(n));
  };
  const [sx, sy, sz] = simplify(fx, fy, fz);
  ratioDisplay.textContent = `X:Y:Z = ${sx} : ${sy} : ${sz}`;
}

function currentParams() {
  return {
    freqX: Number(inputs.freqX.value),
    freqY: Number(inputs.freqY.value),
    freqZ: Number(inputs.freqZ.value),
    amplitude: Number(inputs.amplitude.value),
    speed: Number(inputs.speed.value),
    trail: parseInt(inputs.trail.value, 10),
  };
}

function lissajous(t, params) {
  const { freqX, freqY, freqZ, amplitude } = params;
  const phaseXY = Math.PI / 2;
  const phaseZ = Math.PI / 3;
  const x = amplitude * Math.sin(freqX * t + phaseXY);
  const y = amplitude * Math.sin(freqY * t);
  const z = amplitude * Math.sin(freqZ * t + phaseZ);
  return new THREE.Vector3(x, y, z);
}

function reset() {
  points = [];
  line.geometry.setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
  ['x', 'y', 'z'].forEach((axis) => {
    componentPoints[axis] = [];
    componentLines[axis].geometry.setFromPoints([]);
    componentPointers[axis].position.copy(componentOffsets[axis]);
  });
  startTime = performance.now();
}

function clearTrail() {
  points = [];
  line.geometry.setFromPoints([]);
  ['x', 'y', 'z'].forEach((axis) => {
    componentPoints[axis] = [];
    componentLines[axis].geometry.setFromPoints([]);
    componentPointers[axis].position.copy(componentOffsets[axis]);
  });
}

function toggleRunning() {
  isRunning = !isRunning;
  buttons.toggle.textContent = isRunning ? '一時停止' : '再生';
  buttons.toggle.dataset.running = isRunning;
}

function trimTrails(limit) {
  while (points.length > limit) {
    points.shift();
  }
  ['x', 'y', 'z'].forEach((axis) => {
    while (componentPoints[axis].length > limit) {
      componentPoints[axis].shift();
    }
    componentLines[axis].geometry.setFromPoints(componentPoints[axis]);
  });
}

function toggleUnlimitedTrail() {
  isUnlimitedTrail = !isUnlimitedTrail;
  buttons.unlimitedTrail.dataset.active = isUnlimitedTrail;
  buttons.unlimitedTrail.textContent = isUnlimitedTrail ? '上限解除中' : '軌跡上限なし';
  inputs.trail.disabled = isUnlimitedTrail;
  if (!isUnlimitedTrail) {
    trimTrails(trailLimit);
  }
  updateValueLabels();
}

function updateComponentTrails(pos) {
  const snapshots = {
    x: componentOffsets.x.clone().add(new THREE.Vector3(pos.x, 0, 0)),
    y: componentOffsets.y.clone().add(new THREE.Vector3(0, pos.y, 0)),
    z: componentOffsets.z.clone().add(new THREE.Vector3(0, 0, pos.z)),
  };
  ['x', 'y', 'z'].forEach((axis) => {
    componentPoints[axis].push(snapshots[axis]);
    const limit = isUnlimitedTrail ? Number.POSITIVE_INFINITY : trailLimit;
    if (componentPoints[axis].length > limit) {
      componentPoints[axis].shift();
    }
    componentLines[axis].geometry.setFromPoints(componentPoints[axis]);
    componentPointers[axis].position.copy(snapshots[axis]);
  });
}

function makeLabelCanvas(text, color) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const fontSize = 24;
  const padding = 12;
  ctx.font = `${fontSize}px Inter, 'Noto Sans JP', system-ui`;
  const textWidth = ctx.measureText(text).width;
  canvas.width = textWidth + padding * 2;
  canvas.height = fontSize + padding * 1.6;
  ctx.font = `${fontSize}px Inter, 'Noto Sans JP', system-ui`;
  ctx.textBaseline = 'middle';
  ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeRect(1, 1, canvas.width - 2, canvas.height - 2);
  ctx.fillStyle = '#e5e7eb';
  ctx.fillText(text, padding, canvas.height / 2);
  return canvas;
}

function createLabelSprite(text, color) {
  const canvas = makeLabelCanvas(text, color);
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false, depthWrite: false });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(canvas.width / 60, canvas.height / 60, 1);
  return sprite;
}

function updateLabelSprite(sprite, text, color) {
  const canvas = makeLabelCanvas(text, color);
  sprite.material.map.dispose();
  sprite.material.map = new THREE.CanvasTexture(canvas);
  sprite.material.needsUpdate = true;
  sprite.scale.set(canvas.width / 60, canvas.height / 60, 1);
}

function updateFrequencyLabels(params) {
  const labelDistance = params.amplitude + 2.2;
  const offset = Math.max(2.5, params.amplitude * 0.6);
  const labels = {
    x: `X: ${params.freqX.toFixed(1)}`,
    y: `Y: ${params.freqY.toFixed(1)}`,
    z: `Z: ${params.freqZ.toFixed(1)}`,
  };

  ['x', 'y', 'z'].forEach((axis) => {
    if (labels[axis] !== labelTexts[axis]) {
      updateLabelSprite(freqLabels[axis], labels[axis], labelColors[axis]);
      labelTexts[axis] = labels[axis];
    }
  });

  freqLabels.x.position.set(labelDistance + offset, offset * 0.3, -offset);
  freqLabels.y.position.set(-offset, labelDistance + offset, offset);
  freqLabels.z.position.set(offset, -offset * 0.4, labelDistance + offset);
}

function animate() {
  requestAnimationFrame(animate);
  controls.update();

  const params = currentParams();
  updateFrequencyLabels(params);

  if (isRunning) {
    trailLimit = params.trail;
    const elapsed = (performance.now() - startTime) * 0.001 * params.speed;
    const pos = lissajous(elapsed, params);
    points.push(pos);
    const limit = isUnlimitedTrail ? Number.POSITIVE_INFINITY : trailLimit;
    if (points.length > limit) {
      points.shift();
    }
    line.geometry.setFromPoints(points);
    pointerMesh.position.copy(pos);
    updateComponentTrails(pos);
  }

  renderer.render(scene, camera);
}

function attachEvents() {
  Object.values(inputs).forEach((input) => {
    input.addEventListener('input', () => {
      updateValueLabels();
      if (input.id === 'trail') {
        trailLimit = parseInt(input.value, 10);
        if (!isUnlimitedTrail) {
          trimTrails(trailLimit);
        }
      }
    });
  });

  buttons.reset.addEventListener('click', reset);
  buttons.toggle.addEventListener('click', toggleRunning);
  buttons.clear.addEventListener('click', clearTrail);
  buttons.unlimitedTrail.addEventListener('click', toggleUnlimitedTrail);
}

initThree();
updateValueLabels();
attachEvents();
animate();
