import { clamp } from "./mapping.js";

function randInt(min, max){ return Math.floor(Math.random()*(max-min+1))+min; }
function pick(arr){ return arr[Math.floor(Math.random()*arr.length)]; }

const candidateN = [48, 60, 64, 72, 96];

const PALETTES = [
  { type:"palette", name:"rainbow-soft" },
  { type:"palette", name:"candy-pop" },
  { type:"palette", name:"nocturne" },
  { type:"palette", name:"aurora" },
  { type:"palette", name:"grape-teal" },
  { type:"palette", name:"sunrise" },
  { type:"solid", value:"#F2F2F2" }
];

export function randomColorsOnly(state){
  const s = JSON.parse(JSON.stringify(state));
  s.layers = s.layers.map(l => ({ ...l, color: pick(PALETTES) }));
  return s;
}

export function randomAll(state){
  const s = JSON.parse(JSON.stringify(state));
  s.N = pick(candidateN);
  s.layers = s.layers.map((l, i) => ({
    ...l,
    k: clamp(randInt(1, s.N-1), 1, s.N-1),
    width: Math.round((Math.random()*1.4 + 0.6)*10)/10,
    color: pick(PALETTES)
  }));
  return s;
}
