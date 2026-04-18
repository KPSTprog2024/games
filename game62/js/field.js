import { CELL } from './config.js';

export class Field {
  constructor(cols, rows) {
    this.cols = cols;
    this.rows = rows;
    this.cells = new Uint8Array(cols * rows);
  }

  reset() {
    this.cells.fill(CELL.UNCAPTURED);
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        if (x === 0 || y === 0 || x === this.cols - 1 || y === this.rows - 1) {
          this.setCell(x, y, CELL.BOUNDARY);
        }
      }
    }
  }

  inBounds(x, y) {
    return x >= 0 && y >= 0 && x < this.cols && y < this.rows;
  }

  index(x, y) {
    return y * this.cols + x;
  }

  getCell(x, y) {
    if (!this.inBounds(x, y)) return CELL.CAPTURED;
    return this.cells[this.index(x, y)];
  }

  setCell(x, y, state) {
    if (!this.inBounds(x, y)) return;
    this.cells[this.index(x, y)] = state;
  }

  isSafe(x, y) {
    const cell = this.getCell(x, y);
    if (cell === CELL.BOUNDARY) return true;
    if (cell !== CELL.CAPTURED) return false;
    return this.isCapturedEdge(x, y);
  }

  isCapturedEdge(x, y) {
    if (this.getCell(x, y) !== CELL.CAPTURED) return false;
    return (
      this.getCell(x + 1, y) === CELL.UNCAPTURED
      || this.getCell(x - 1, y) === CELL.UNCAPTURED
      || this.getCell(x, y + 1) === CELL.UNCAPTURED
      || this.getCell(x, y - 1) === CELL.UNCAPTURED
    );
  }

  isWalkableForPlayer(x, y, drawing = false) {
    const cell = this.getCell(x, y);
    if (cell === CELL.UNCAPTURED || cell === CELL.BOUNDARY) return true;
    if (cell !== CELL.CAPTURED) return false;
    if (drawing) return true;
    return this.isCapturedEdge(x, y);
  }

  isSolidForEnemy(x, y) {
    const cell = this.getCell(x, y);
    return cell === CELL.CAPTURED || cell === CELL.BOUNDARY;
  }

  getFillRate() {
    let filled = 0;
    const total = this.cols * this.rows;
    for (let i = 0; i < this.cells.length; i++) {
      const c = this.cells[i];
      if (c === CELL.CAPTURED || c === CELL.BOUNDARY) filled++;
    }
    return filled / total;
  }

  forEachCell(callback) {
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        callback(x, y, this.getCell(x, y));
      }
    }
  }
}
