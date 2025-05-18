import { getRandomInt } from './utils.js';
import { COLORS, shapeTypes } from './config.js';

// 図形オブジェクト生成
export function createShapeObject(parentW, parentH, type) {
  const size = getRandomInt(40,70);
  return {
    type,
    size,
    color: COLORS[getRandomInt(0, COLORS.length-1)],
    x: getRandomInt(0, parentW - size),
    y: getRandomInt(0, parentH - size)
  };
}
// 重なりチェック
export function checkOverlap(newShape, existing) {
  const threshold = 0.5;
  for (let s of existing) {
    const dx = (newShape.x + newShape.size/2) - (s.x + s.size/2);
    const dy = (newShape.y + newShape.size/2) - (s.y + s.size/2);
    const dist = Math.hypot(dx, dy);
    if (dist < (newShape.size/2 + s.size/2) * threshold) return true;
  }
  return false;
}
