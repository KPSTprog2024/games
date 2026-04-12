import { CELL } from './config.js';

export function resolveCapture(field, trail, enemies, cellSize) {
  const cols = field.cols;
  const rows = field.rows;
  const visited = new Uint8Array(cols * rows);
  const queue = [];

  const pushIfValid = (x, y) => {
    if (!field.inBounds(x, y)) return;
    if (field.getCell(x, y) !== CELL.UNCAPTURED) return;
    const idx = y * cols + x;
    if (visited[idx]) return;
    visited[idx] = 1;
    queue.push({ x, y });
  };

  for (const enemy of enemies) {
    const cx = Math.floor(enemy.x / cellSize);
    const cy = Math.floor(enemy.y / cellSize);
    pushIfValid(cx, cy);
  }

  for (let i = 0; i < queue.length; i++) {
    const { x, y } = queue[i];
    pushIfValid(x + 1, y);
    pushIfValid(x - 1, y);
    pushIfValid(x, y + 1);
    pushIfValid(x, y - 1);
  }

  let capturedCount = 0;
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (field.getCell(x, y) !== CELL.UNCAPTURED) continue;
      const idx = y * cols + x;
      if (!visited[idx]) {
        field.setCell(x, y, CELL.CAPTURED);
        capturedCount++;
      }
    }
  }

  capturedCount += trail.order.length;
  trail.commit(field);
  return capturedCount;
}
