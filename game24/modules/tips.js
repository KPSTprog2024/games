import { gcd } from "./mapping.js";
export function buildTips(state){
  if (!state.tips) return [];
  const tips = [];
  const N = state.N;
  const ones = state.layers.map((l,i)=>({i,ok:gcd(N,l.k)===1})).filter(x=>x.ok);
  if (ones.length>0) tips.push("gcd(N,k)=1 のレイヤーは全ピンを一筆書きで巡回します。");
  const ratios = state.layers.map(l => l.k/N);
  if (ratios.some(r => Math.abs(r-0.5)<0.05)) tips.push("k/N ≈ 0.5 付近は強い対称性が出ます。");
  if (ratios.some(r => Math.abs(r-0.618)<0.03)) tips.push("黄金比近傍（k/N ≈ 0.618）は自然な回り方になります。");
  if (N%12===0) tips.push("N が 12 の倍数だと、花弁状の対称が得やすいです。");
  tips.push("負荷が高い場合はアニメをOFFにすると快適になります。");
  return tips;
}
