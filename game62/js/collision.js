export function checkPlayerEnemyCollision(player, enemies, cellSize) {
  const px = (player.x + 0.5) * cellSize;
  const py = (player.y + 0.5) * cellSize;
  const hitRadius = cellSize * 0.45;

  for (const enemy of enemies) {
    const dx = enemy.x - px;
    const dy = enemy.y - py;
    const dist2 = dx * dx + dy * dy;
    const minDist = hitRadius + enemy.radius;
    if (dist2 <= minDist * minDist) {
      return true;
    }
  }
  return false;
}

export function checkTrailEnemyCollision(trail, enemies, cellSize) {
  if (!trail.active) return false;

  for (const enemy of enemies) {
    const minX = Math.floor((enemy.x - enemy.radius) / cellSize);
    const maxX = Math.floor((enemy.x + enemy.radius) / cellSize);
    const minY = Math.floor((enemy.y - enemy.radius) / cellSize);
    const maxY = Math.floor((enemy.y + enemy.radius) / cellSize);

    for (let cy = minY; cy <= maxY; cy++) {
      for (let cx = minX; cx <= maxX; cx++) {
        if (!trail.has(cx, cy)) continue;

        const nearestX = Math.max(cx * cellSize, Math.min(enemy.x, (cx + 1) * cellSize));
        const nearestY = Math.max(cy * cellSize, Math.min(enemy.y, (cy + 1) * cellSize));
        const dx = enemy.x - nearestX;
        const dy = enemy.y - nearestY;
        if (dx * dx + dy * dy <= enemy.radius * enemy.radius) {
          return true;
        }
      }
    }
  }
  return false;
}
