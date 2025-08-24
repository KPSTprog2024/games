export function gcd(a, b) {
  a = Math.abs(a|0); b = Math.abs(b|0);
  while (b !== 0) { const t = a % b; a = b; b = t; }
  return a;
}
export function cycleLength(N, k) { return N / gcd(N, k); }
export function sequence(N, k) {
  const L = cycleLength(N, k);
  const out = new Uint32Array(L + 1);
  for (let t = 0; t < L; t++) out[t] = (t * k) % N;
  out[L] = out[0];
  return out;
}
export function clamp(x, lo, hi) { return Math.min(hi, Math.max(lo, x)); }

export function estimateTotalEdges(state) {
  let total = 0;
  for (const layer of state.layers) {
    const k = clamp(layer.k, 1, Math.max(1, state.N - 1));
    total += cycleLength(state.N, k);
  }
  return total;
}
export function validateParams(state, budgetMobile, budgetDesktop, isMobile) {
  const issues = [];
  if (state.N < 16 || state.N > 256) issues.push({ code: "N_RANGE", message: "Nは16〜256にしてください。" });
  for (let i = 0; i < state.layers.length; i++) {
    const k = state.layers[i].k;
    if (k < 1 || k >= state.N) issues.push({ code: "K_RANGE", message: "kは1..N-1", layerIndex: i });
  }
  const est = estimateTotalEdges(state);
  const budget = isMobile ? budgetMobile : budgetDesktop;
  if (est > budget) issues.push({ code: "TOTAL_EDGES_OVER_BUDGET", message: "合計辺数が上限を超過", budget, estimated: est });
  return { ok: issues.length === 0, issues };
}
