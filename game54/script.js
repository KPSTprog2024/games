import * as THREE from 'https://unpkg.com/three@0.164.1/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.164.1/examples/jsm/controls/OrbitControls.js';

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
};

let renderer, scene, camera, controls;
let line, points = [], trailLimit = parseInt(inputs.trail.value, 10);
let pointerMesh;
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
  renderer.domElement.style.width = '100%';
  renderer.domElement.style.height = '100%';
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
  if (e.key.toLowerCase() === 'r') {
    reset();
  }
}

function updateValueLabels() {
  Object.entries(inputs).forEach(([key, input]) => {
    valueEls[key].textContent = key === 'trail' ? input.value : Number(input.value).toFixed(1).replace(/\.0$/, '.0');
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
  startTime = performance.now();
}

function clearTrail() {
  points = [];
  line.geometry.setFromPoints([]);
}

function toggleRunning() {
  isRunning = !isRunning;
  buttons.toggle.textContent = isRunning ? '一時停止' : '再生';
  buttons.toggle.dataset.running = isRunning;
}

function animate() {
  requestAnimationFrame(animate);
  controls.update();

  if (isRunning) {
    const params = currentParams();
    trailLimit = params.trail;
    const elapsed = (performance.now() - startTime) * 0.001 * params.speed;
    const pos = lissajous(elapsed, params);
    points.push(pos);
    if (points.length > trailLimit) {
      points.shift();
    }
    line.geometry.setFromPoints(points);
    pointerMesh.position.copy(pos);
  }

  renderer.render(scene, camera);
}

function attachEvents() {
  Object.values(inputs).forEach((input) => {
    input.addEventListener('input', () => {
      updateValueLabels();
      if (input.id === 'trail') {
        trailLimit = parseInt(input.value, 10);
      }
    });
  });

  buttons.reset.addEventListener('click', reset);
  buttons.toggle.addEventListener('click', toggleRunning);
  buttons.clear.addEventListener('click', clearTrail);
}

initThree();
updateValueLabels();
attachEvents();
animate();
