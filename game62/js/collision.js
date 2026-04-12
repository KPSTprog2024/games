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
    const cx = Math.floor(enemy.x / cellSize);
    const cy = Math.floor(enemy.y / cellSize);
    if (trail.has(cx, cy)) {
      return true;
    }
  }
  return false;
}
