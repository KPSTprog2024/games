export class Enemy {
  constructor(field, speedPxPerSec, cellSize, spawn) {
    this.field = field;
    this.speed = speedPxPerSec;
    this.cellSize = cellSize;
    this.radius = Math.max(2, cellSize * 0.35);
    this.x = (spawn.x + 0.5) * cellSize;
    this.y = (spawn.y + 0.5) * cellSize;
    this.vx = this.speed * (Math.random() > 0.5 ? 1 : -1);
    this.vy = this.speed * (Math.random() > 0.5 ? 1 : -1);
  }

  getCell() {
    return {
      x: Math.floor(this.x / this.cellSize),
      y: Math.floor(this.y / this.cellSize),
    };
  }

  update(deltaSec) {
    const nextX = this.x + this.vx * deltaSec;
    const nextY = this.y + this.vy * deltaSec;

    if (this.willHitSolid(nextX, this.y)) {
      this.vx *= -1;
    } else {
      this.x = nextX;
    }

    if (this.willHitSolid(this.x, nextY)) {
      this.vy *= -1;
    } else {
      this.y = nextY;
    }
  }

  willHitSolid(px, py) {
    const cx = Math.floor(px / this.cellSize);
    const cy = Math.floor(py / this.cellSize);
    return this.field.isSolidForEnemy(cx, cy);
  }
}

export function createEnemySpawns(field, count) {
  const spawns = [];
  const margin = 6;
  for (let i = 0; i < count; i++) {
    spawns.push({
      x: Math.floor(field.cols / 2) + (i % 2 === 0 ? -margin : margin),
      y: Math.floor(field.rows / 2) + (i < 2 ? -margin : margin),
    });
  }
  return spawns;
}
