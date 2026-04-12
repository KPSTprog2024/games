import { CELL } from './config.js';

export class Trail {
  constructor() {
    this.active = false;
    this.order = [];
    this.set = new Set();
  }

  start() {
    this.active = true;
    this.order.length = 0;
    this.set.clear();
  }

  add(x, y, field) {
    const key = `${x},${y}`;
    if (this.set.has(key)) return false;
    this.set.add(key);
    this.order.push({ x, y });
    field.setCell(x, y, CELL.TRAIL);
    return true;
  }

  has(x, y) {
    return this.set.has(`${x},${y}`);
  }

  clear(field) {
    for (const p of this.order) {
      if (field.getCell(p.x, p.y) === CELL.TRAIL) {
        field.setCell(p.x, p.y, CELL.UNCAPTURED);
      }
    }
    this.active = false;
    this.order.length = 0;
    this.set.clear();
  }

  commit(field) {
    for (const p of this.order) {
      field.setCell(p.x, p.y, CELL.CAPTURED);
    }
    this.active = false;
    this.order.length = 0;
    this.set.clear();
  }
}
