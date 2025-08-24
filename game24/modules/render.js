// uses global PIXI
import { colorAt, toPixiColor, toAlphaOnly } from "./color.js";

export function createPixiApp(container) {
  const app = new PIXI.Application({
    antialias: true,
    autoDensity: true,
    resolution: Math.max(1, window.devicePixelRatio || 1),
    backgroundColor: 0x111111,
  });
  container.innerHTML = "";
  container.appendChild(app.view);
  function resize() {
    const w = container.clientWidth, h = container.clientHeight;
    const size = Math.min(w,h);
    app.renderer.resize(size, size);
  }
  const ro = new ResizeObserver(resize);
  ro.observe(container);
  window.addEventListener("orientationchange", () => setTimeout(resize, 50));
  resize();
  return {
    app,
    setBackground(cssHex) {
      const hex = Number(cssHex.replace("#","0x"));
      app.renderer.background.color = hex;
    }
  };
}

export function buildLayer(pins, seq, spec) {
  const g = new PIXI.Graphics();
  return { g, pins, seq, style: spec, tMax: 1 };
}

export function drawLayer(rt, animated) {
  const { g, pins, seq, style, tMax } = rt;
  g.clear();
  const width = style.width;
  const L = Math.min(tMax, seq.length - 1);
  if (L <= 0) return;
  for (let t = 0; t < L; t++) {
    const i0 = seq[t], i1 = seq[t+1];
    const p0 = pins[i0], p1 = pins[i1];
    const u = (seq.length <= 1) ? 0 : t / (seq.length - 1);
    const rgba = colorAt(style.color, u);
    const colorHex = toPixiColor(rgba);
    const alpha = Math.min(style.alpha, toAlphaOnly(rgba));
    g.stroke({ width, color: colorHex, alpha });
    g.moveTo(p0.x, p0.y).lineTo(p1.x, p1.y);
  }
  if (!animated) rt.tMax = seq.length - 1;
}

export function composeEnv(){ return { stageLayers: [], baked: undefined, bakedRT: undefined }; }

export function attachLayers(app, env, runtimes) {
  clearStage(app, env);
  env.stageLayers = runtimes;
  for (const rt of env.stageLayers) app.stage.addChild(rt.g);
}

export function renderLive(env, animated) {
  for (const rt of env.stageLayers) drawLayer(rt, animated);
}

export function bakeToTexture(app, env) {
  renderLive(env, false);
  if (env.baked) { env.baked.destroy({ children:true, texture:true, baseTexture:true }); env.baked = undefined; }
  if (env.bakedRT) { env.bakedRT.destroy(true); env.bakedRT = undefined; }
  const rt = PIXI.RenderTexture.create({ width: app.renderer.width, height: app.renderer.height });
  app.renderer.render(app.stage, { renderTexture: rt });
  const sprite = new PIXI.Sprite(rt);
  app.stage.removeChildren();
  app.stage.addChild(sprite);
  env.baked = sprite; env.bakedRT = rt;
}

export function unbakeToLive(app, env) {
  if (env.baked) { env.baked.destroy({ children:true, texture:true, baseTexture:false }); env.baked = undefined; }
  if (env.bakedRT) { env.bakedRT.destroy(true); env.bakedRT = undefined; }
  app.stage.removeChildren();
  for (const rt of env.stageLayers) app.stage.addChild(rt.g);
}

export function clearStage(app, env) {
  app.stage.removeChildren();
  if (env.stageLayers) for (const rt of env.stageLayers) rt.g.destroy({ children:true, texture:false, baseTexture:false });
  if (env.baked) { env.baked.destroy({ children:true, texture:true, baseTexture:true }); env.baked = undefined; }
  if (env.bakedRT) { env.bakedRT.destroy(true); env.bakedRT = undefined; }
  env.stageLayers = [];
}
