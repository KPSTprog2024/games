export function pinsCircle(N, cx, cy, R) {
  const out = new Array(N);
  const tau = Math.PI * 2;
  for (let i = 0; i < N; i++) {
    const th = tau * (i / N);
    out[i] = { x: cx + R * Math.cos(th), y: cy + R * Math.sin(th) };
  }
  return out;
}
