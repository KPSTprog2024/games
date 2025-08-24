export const defaultState = {
  shape: "circle",
  N: 64,
  radius: 0.90,
  layers: [
    { k: 17, width: 1.2, alpha: 1.0, color: { type: "gradient", from: "#FFD76A", to: "#2F6BFF" }, blend: "normal" }
  ],
  bg: "#111111",
  animate: true,
  speed: 1.0,
  tips: true
};

export const presets = {
  "やさしい虹": {
    ...defaultState,
    N: 48,
    layers: [ { k: 17, width: 1.2, alpha: 1.0, color: { type:"gradient", from:"#FFD76A", to:"#2F6BFF"}, blend:"normal" } ],
    bg: "#111111"
  },
  "光の花": {
    ...defaultState,
    N: 96,
    layers: [
      { k: 31, width: 0.8, alpha: 1.0, color: { type:"solid", value:"#FF66CC"}, blend:"normal" },
      { k: 25, width: 0.5, alpha: 0.9, color: { type:"solid", value:"#66FFCC"}, blend:"normal" }
    ],
    bg: "#0F0F12"
  },
  "夜の輪": {
    ...defaultState,
    N: 72,
    layers: [ { k: 29, width: 0.6, alpha: 1.0, color: { type:"gradient", from:"#88A2F8", to:"#0F1E5A"}, blend:"lighter" } ],
    bg: "#000814"
  },
  "幾何校章": {
    ...defaultState,
    N: 60,
    layers: [ { k: 12, width: 2.0, alpha: 1.0, color: { type:"solid", value:"#F2F2F2"}, blend:"normal" } ],
    bg: "#202020"
  },
  "深海ブルー": {
    ...defaultState,
    N: 64,
    layers: [ { k: 21, width: 1.0, alpha: 1.0, color: { type:"gradient", from:"#0AA9FF", to:"#022C43"}, blend:"normal" } ],
    bg: "#000000"
  }
};
