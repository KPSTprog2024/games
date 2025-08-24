// uses global chroma
function parseColor(css) {
  const c = chroma(css);
  const [r,g,b] = c.rgb();
  return { r, g, b, a: c.alpha() };
}
function mixLRGB(a,b,t) {
  const ca = chroma(a.r,a.g,a.b,'rgb').alpha(a.a ?? 1);
  const cb = chroma(b.r,b.g,b.b,'rgb').alpha(b.a ?? 1);
  const m = chroma.mix(ca, cb, t, 'lrgb');
  const [r,g,b_] = m.rgb();
  return { r, g, b: b_, a: m.alpha() };
}
function toHex24(c){ return ((c.r&255)<<16)|((c.g&255)<<8)|(c.b&255); }
function toAlpha(c){ return c.a ?? 1; }

const PAL = {
  "rainbow-soft": ["#FFF066","#FF9966","#FF66CC","#A66BFF","#66CCFF","#66CC99"],
  "candy-pop": ["#FF6DAE","#FFD76A","#7CF0A9","#7DC8FF","#B58CFF"],
  "sky-ocean": ["#88CCFF","#0066AA"],
  "sunrise": ["#FFE08A","#FF6D6D"],
  "mint-soda": ["#66E3C4"],
  "nocturne": ["#88A2F8","#0F1E5A"],
  "aurora": ["#75FFC5","#2F6BFF"],
  "mono-pearl": ["#F2F2F2"],
  "grape-teal": ["#7A4FFF","#29D3C1"],
  "copper-glow": ["#FFAD66"]
};

export function colorAt(spec, t) {
  if (spec.type === "solid") return parseColor(spec.value);
  if (spec.type === "gradient") {
    const A = parseColor(spec.from), B = parseColor(spec.to);
    return mixLRGB(A,B, Math.max(0, Math.min(1, t)));
  }
  const stops = PAL[spec.name] ?? ["#ffffff"];
  if (stops.length === 1) return parseColor(stops[0]);
  const x = Math.max(0, Math.min(1, t));
  const seg = (stops.length - 1) * x;
  const i = Math.floor(seg), f = seg - i;
  const A = parseColor(stops[i]), B = parseColor(stops[i+1]);
  return mixLRGB(A,B,f);
}
export function toPixiColor(c){ return toHex24(c); }
export function toAlphaOnly(c){ return toAlpha(c); }
