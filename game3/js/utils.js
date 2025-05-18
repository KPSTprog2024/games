// min以上max以下の整数
export function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
// 配列をシャッフル
export function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
// DOM操作ヘルパー: 子要素一括削除
export function clearChildren(el) {
  while (el.firstChild) el.removeChild(el.firstChild);
}
// 要素作成
export function createElem(tag, attrs = {}) {
  const el = document.createElement(tag);
  Object.entries(attrs).forEach(([k,v]) => el.setAttribute(k,v));
  return el;
}
