export function initPanel(container, store, handlers) {
  const pane = new Tweakpane.Pane({ container, title: "糸かけジェネレーター" });
  const s = store.getState();

  // 基本
  const fBasic = pane.addFolder({ title: "基本" });
  fBasic.addBlade({ view: "text", label: "形", value: "円（v1固定）" });
  const ctrlN = fBasic.addInput(s, "N", { label: "ピン数", min: 16, max: 256, step: 1 });
  const ctrlR = fBasic.addInput(s, "radius", { label: "半径", min: 0.1, max: 0.98, step: 0.01 });
  ctrlN.on("change", ev => {
    const st = store.getState();
    const N = ev.value;
    const layers = st.layers.map(l => ({ ...l, k: Math.max(1, Math.min(N-1, l.k)) }));
    store.replaceState({ ...st, N, layers });
  });
  ctrlR.on("change", ev => store.setState({ radius: ev.value }));

  // レイヤー
  const fLayers = pane.addFolder({ title: "レイヤー（最大3）" });
  function rebuild() {
    fLayers.children.forEach(c => fLayers.remove(c));
    const st = store.getState();
    st.layers.forEach((layer, idx) => {
      const fd = fLayers.addFolder({ title: `Layer ${idx+1}` });
      const ctrlK = fd.addInput(layer, "k", { label: "歩幅 k", min: 1, max: Math.max(1, st.N-1), step: 1 });
      const ctrlW = fd.addInput(layer, "width", { label: "線幅", min: 0.3, max: 6.0, step: 0.1 });
      const ctrlA = fd.addInput(layer, "alpha", { label: "透明度", min: 0.1, max: 1.0, step: 0.05 });
      // 色：簡易（単色/グラデ/パレットを直接JSON編集する代わりに3ボタン）
      const grp = fd.addFolder({ title: "色" });
      grp.addButton({ title: "単色: 白" }).on("click", ()=> patch(idx, { color: { type:"solid", value:"#F2F2F2" } }));
      grp.addButton({ title: "グラデ: Sunrise" }).on("click", ()=> patch(idx, { color: { type:"gradient", from:"#FFE08A", to:"#FF6D6D" } }));
      grp.addButton({ title: "パレット: Aurora" }).on("click", ()=> patch(idx, { color: { type:"palette", name:"aurora" } }));
      fd.addButton({ title: "削除" }).on("click", () => removeLayer(idx));

      ctrlK.on("change", ev => patch(idx, { k: ev.value }));
      ctrlW.on("change", ev => patch(idx, { width: ev.value }));
      ctrlA.on("change", ev => patch(idx, { alpha: ev.value }));
    });
    fLayers.addButton({ title: "＋ 追加" }).on("click", addLayer);
  }
  function patch(idx, patch) {
    const st = store.getState();
    const layers = st.layers.map((l,i)=> i===idx ? ({ ...l, ...patch }) : l);
    store.setState({ layers });
  }
  function addLayer() {
    const st = store.getState();
    if (st.layers.length >= 3) return;
    const base = st.layers[st.layers.length-1] ?? { k:17, width:1.2, alpha:1.0, color:{ type:"gradient", from:"#FFD76A", to:"#2F6BFF"} };
    const layer = { ...base, k: Math.min(st.N-1, base.k + 4) };
    store.setState({ layers: [...st.layers, layer] });
  }
  function removeLayer(idx) {
    const st = store.getState();
    if (st.layers.length <= 1) return;
    const layers = st.layers.filter((_,i)=>i!==idx);
    store.setState({ layers });
  }
  store.subscribe(() => rebuild());
  rebuild();

  // 表現と描画
  const fRender = pane.addFolder({ title: "表現と描画" });
  fRender.addInput(s, "bg", { label: "背景色" }).on("change", ev => store.setState({ bg: ev.value }));
  fRender.addInput(s, "animate", { label: "アニメ" }).on("change", ev => store.setState({ animate: ev.value }));
  fRender.addInput(s, "speed", { label: "速度", min: 0.2, max: 3.0, step: 0.1 }).on("change", ev => store.setState({ speed: ev.value }));
  fRender.addButton({ title: "ランダム（色）" }).on("click", handlers.onRandomColors);
  fRender.addButton({ title: "ランダム（全体）" }).on("click", handlers.onRandomAll);

  return pane;
}

export function mountPresetGallery(root, onApply) {
  root.innerHTML = "";
  const grid = document.createElement("div");
  grid.className = "preset-grid";
  root.appendChild(grid);
  import("./presets.js").then(m => {
    for (const name of Object.keys(m.presets)) {
      const card = document.createElement("button");
      card.className = "preset-card";
      card.innerHTML = `<div class="thumb"></div><div class="label">${name}</div>`;
      card.addEventListener("click", () => onApply(name));
      grid.appendChild(card);
    }
  });
}
