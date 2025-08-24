// High-res PNG export: redraw into offscreen RenderTexture
import { pinsCircle } from "./geometry.js";
import { sequence } from "./mapping.js";
import { colorAt, toPixiColor, toAlphaOnly } from "./color.js";

export async function exportPNG(app, state, scale=2, transparent=false) {
  const size = Math.max(app.renderer.width, app.renderer.height);
  const target = Math.round(size * scale);
  const rt = PIXI.RenderTexture.create({ width: target, height: target });
  const root = new PIXI.Container();

  if (!transparent) {
    const bg = new PIXI.Graphics();
    const hex = Number(state.bg.replace("#","0x"));
    bg.rect(0,0,target,target).fill(hex);
    root.addChild(bg);
  }

  const cx = target/2, cy = target/2;
  const R = Math.floor(target * state.radius * 0.5);
  const pins = pinsCircle(state.N, cx, cy, R);

  for (const layer of state.layers) {
    const seq = sequence(state.N, layer.k);
    const g = new PIXI.Graphics();
    for (let t = 0; t < seq.length - 1; t++) {
      const i0 = seq[t], i1 = seq[t+1];
      const p0 = pins[i0], p1 = pins[i1];
      const u = t / (seq.length - 1);
      const rgba = colorAt(layer.color, u);
      const colorHex = toPixiColor(rgba);
      const alpha = Math.min(layer.alpha, toAlphaOnly(rgba));
      g.stroke({ width: layer.width * scale, color: colorHex, alpha });
      g.moveTo(p0.x, p0.y).lineTo(p1.x, p1.y);
    }
    root.addChild(g);
  }

  app.renderer.render(root, { renderTexture: rt, clear: true });
  const cvs = app.renderer.extract.canvas(rt);
  const blob = await new Promise(res => cvs.toBlob(b => res(b), "image/png"));
  if (!blob) throw new Error("Canvas toBlob() returned null");
  rt.destroy(true);
  root.destroy({ children:true });
  return blob;
}
