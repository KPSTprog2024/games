import { createStore } from "./modules/state.js";
import { defaultState } from "./modules/presets.js";
import { pinsCircle } from "./modules/geometry.js";
import { sequence, validateParams } from "./modules/mapping.js";
import { buildLayer, attachLayers, bakeToTexture, unbakeToLive, composeEnv, createPixiApp, renderLive } from "./modules/render.js";
import { exportPNG } from "./modules/export.js";
import { initPanel, mountPresetGallery } from "./modules/ui.js";
import { buildTips } from "./modules/tips.js";
import { writeHash, loadFromHash } from "./modules/hashShare.js";
import { randomAll, randomColorsOnly } from "./modules/random.js";
import { PERF_LIMITS, isMobile } from "./modules/perf.js";

// ----- boot -----
const initial = loadFromHash() ?? defaultState;
const store = createStore(initial);

const stageEl = document.getElementById("stage");
const tipsEl = document.getElementById("tips");
const badge = document.getElementById("badge-over");

const pixi = createPixiApp(stageEl);

let pins = [];
let layers = []; // runtime
const composer = composeEnv();

const animator = {
  running: false,
  start() {
    if (this.running) return;
    this.running = true;
    pixi.app.ticker.add(tick);
  },
  stop() {
    if (!this.running) return;
    this.running = false;
    pixi.app.ticker.remove(tick);
  }
};

function tick(delta) {
  const st = store.getState();
  const sp = Math.max(0.1, st.speed);
  const adv = Math.max(1, Math.round(delta * sp));
  let anyAdvanced = false;
  for (const rt of layers) {
    if (rt.tMax < rt.seq.length - 1) {
      rt.tMax = Math.min(rt.seq.length - 1, rt.tMax + adv);
      anyAdvanced = true;
    }
  }
  if (anyAdvanced) renderLive(composer, true);
}

function rebuildGeometry(state) {
  const size = Math.min(pixi.app.renderer.width, pixi.app.renderer.height);
  const cx = size / 2, cy = size / 2;
  const R = Math.floor(size * state.radius * 0.5);
  pins = pinsCircle(state.N, cx, cy, R);
}

function rebuildLayers(state) {
  // build/update runtime per layer
  const seqs = state.layers.map(l => sequence(state.N, l.k));
  // update or create
  const out = [];
  for (let i = 0; i < state.layers.length; i++) {
    const spec = state.layers[i];
    const seq = seqs[i];
    const prev = layers[i];
    if (prev) {
      prev.pins = pins;
      prev.seq = seq;
      prev.style = spec;
      prev.tMax = 1;
      out.push(prev);
    } else {
      out.push(buildLayer(pins, seq, spec));
    }
  }
  // destroy excess
  for (let i = state.layers.length; i < layers.length; i++) {
    layers[i].g.destroy();
  }
  layers = out;
  attachLayers(pixi.app, composer, layers);
}

function applyState(state) {
  pixi.setBackground(state.bg);

  const vr = validateParams(state, PERF_LIMITS.mobile, PERF_LIMITS.desktop, isMobile());
  const over = vr.issues.some(i => i.code === "TOTAL_EDGES_OVER_BUDGET");
  badge.classList.toggle("show", over);
  if (over && state.animate) store.setState({ animate: false });

  rebuildGeometry(state);
  rebuildLayers(state);

  if (state.animate) {
    unbakeToLive(pixi.app, composer);
    animator.start();
    renderLive(composer, true);
  } else {
    animator.stop();
    renderLive(composer, false);
    bakeToTexture(pixi.app, composer);
  }

  // tips
  const tips = buildTips(state);
  tipsEl.innerHTML = tips.map(t => `<div class="tip">💡 ${t}</div>`).join("");
}

// subscribe state
let hashTimer;
store.subscribe((state) => {
  applyState(state);
  clearTimeout(hashTimer);
  hashTimer = setTimeout(() => writeHash(state), 400);
});

// UI
initPanel(document.getElementById("controls"), store, {
  onRandomColors: () => store.replaceState(randomColorsOnly(store.getState())),
  onRandomAll: () => store.replaceState(randomAll(store.getState())),
  onPreset: (presetState) => store.replaceState(presetState),
});

mountPresetGallery(document.getElementById("preset-gallery"), (name) => {
  import("./modules/presets.js").then(m => store.replaceState(m.presets[name]));
});

// save/share buttons
document.getElementById("btn-save").addEventListener("click", async () => {
  const scale = Number(document.getElementById("save-scale").value || 2);
  const transparent = document.getElementById("save-transparent").checked;
  const blob = await exportPNG(pixi.app, store.getState(), scale, transparent);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "itokake.png"; a.click();
  URL.revokeObjectURL(url);
  toast("PNGを書き出しました");
});
document.getElementById("btn-share").addEventListener("click", async () => {
  try { await navigator.clipboard.writeText(location.href); toast("共有リンクをコピーしました"); }
  catch { alert("共有リンクのコピーに失敗しました"); }
});

function toast(msg) {
  const el = document.getElementById("toast");
  el.textContent = msg;
  el.classList.add("show");
  setTimeout(() => el.classList.remove("show"), 1400);
}

// first render
applyState(store.getState());
