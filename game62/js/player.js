import { CELL } from './config.js';

const DIRS = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

export class Player {
  constructor(field, trail, config) {
    this.field = field;
    this.trail = trail;
    this.moveIntervalMs = config.moveIntervalMs;
    this.moveTimer = 0;
    this.direction = 'right';
    this.pendingDirection = 'right';
    this.x = Math.floor(field.cols / 2);
    this.y = 0;
    this.drawing = false;
  }

  resetPosition() {
    this.x = Math.floor(this.field.cols / 2);
    this.y = 0;
    this.direction = 'right';
    this.pendingDirection = 'right';
    this.moveTimer = 0;
    this.drawing = false;
    this.trail.clear(this.field);
  }

  setDirection(dir) {
    if (DIRS[dir]) this.pendingDirection = dir;
  }

  update(deltaMs) {
    this.moveTimer += deltaMs;
    let moved = false;

    while (this.moveTimer >= this.moveIntervalMs) {
      this.moveTimer -= this.moveIntervalMs;
      moved = this.step() || moved;
    }

    return moved;
  }

  step() {
    this.direction = this.pendingDirection;
    const v = DIRS[this.direction];
    const nx = this.x + v.x;
    const ny = this.y + v.y;

    if (!this.field.inBounds(nx, ny)) {
      return false;
    }

    const nextCell = this.field.getCell(nx, ny);
    const movingIntoUncaptured = nextCell === CELL.UNCAPTURED;

    if (movingIntoUncaptured && !this.drawing) {
      this.trail.start();
      this.drawing = true;
    }

    if (this.drawing) {
      if (this.trail.has(nx, ny)) {
        // TODO: 交差ルールをさらに厳密化できる余地あり（v1は自己踏みでミス扱い）。
        return { selfCollision: true };
      }
      if (!this.field.isSafe(nx, ny)) {
        this.trail.add(nx, ny, this.field);
      }
    }

    this.x = nx;
    this.y = ny;

    if (this.drawing && this.field.isSafe(this.x, this.y)) {
      return { closed: true };
    }

    return true;
  }
}
