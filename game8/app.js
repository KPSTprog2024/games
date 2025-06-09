const size = 4;
let board = [];
const boardEl = document.getElementById('board');
const statusEl = document.getElementById('status');
const restartBtn = document.getElementById('restart');

function init() {
    board = Array(size * size).fill(0);
    addRandomTile();
    addRandomTile();
    render();
    statusEl.textContent = '';
}

function addRandomTile() {
    const empty = board
        .map((v, i) => (v === 0 ? i : null))
        .filter(i => i !== null);
    if (empty.length === 0) return;
    const index = empty[Math.floor(Math.random() * empty.length)];
    board[index] = Math.random() < 0.9 ? 2 : 4;
}

function rotateBoard() {
    const newBoard = Array(size * size).fill(0);
    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            newBoard[c * size + (size - 1 - r)] = board[r * size + c];
        }
    }
    board = newBoard;
}

function rotate(times) {
    for (let i = 0; i < (times % 4 + 4) % 4; i++) {
        rotateBoard();
    }
}

function slideRow(row) {
    let arr = row.filter(v => v !== 0);
    for (let i = 0; i < arr.length - 1; i++) {
        if (arr[i] === arr[i + 1]) {
            arr[i] *= 2;
            arr[i + 1] = 0;
        }
    }
    arr = arr.filter(v => v !== 0);
    while (arr.length < size) arr.push(0);
    return arr;
}

function moveLeftBase() {
    let moved = false;
    for (let r = 0; r < size; r++) {
        const row = [];
        for (let c = 0; c < size; c++) row.push(board[r * size + c]);
        const newRow = slideRow(row);
        for (let c = 0; c < size; c++) {
            if (newRow[c] !== row[c]) moved = true;
            board[r * size + c] = newRow[c];
        }
    }
    return moved;
}

function move(direction) {
    // 0:left 1:up 2:right 3:down
    rotate(direction);
    const moved = moveLeftBase();
    rotate(4 - direction);
    if (moved) {
        addRandomTile();
        render();
        if (isGameOver()) statusEl.textContent = 'ゲームオーバー';
    }
}

function isGameOver() {
    if (board.some(v => v === 0)) return false;
    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            const current = board[r * size + c];
            if (c < size - 1 && current === board[r * size + c + 1]) return false;
            if (r < size - 1 && current === board[(r + 1) * size + c]) return false;
        }
    }
    return true;
}

function render() {
    boardEl.innerHTML = '';
    for (let i = 0; i < board.length; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        const value = board[i];
        if (value) {
            cell.classList.add('tile-' + value);
            cell.textContent = value;
        }
        boardEl.appendChild(cell);
    }
}

document.addEventListener('keydown', e => {
    switch (e.key) {
        case 'ArrowLeft':
            move(0);
            break;
        case 'ArrowUp':
            move(1);
            break;
        case 'ArrowRight':
            move(2);
            break;
        case 'ArrowDown':
            move(3);
            break;
    }
});

restartBtn.addEventListener('click', init);

init();
