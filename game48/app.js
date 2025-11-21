let currentMode = null;
let currentDifficulty = 1;
let currentQuestion = 0;
let totalQuestions = 5;
let score = 0;
let selectedAnswer = null;
let correctAnswer = 0;
let currentBlocks = [];
let isRandomMode = false;
let currentGridSize = 4;

function checkOrientation() {
    const isPortrait = window.innerHeight > window.innerWidth;
    const guide = document.getElementById('orientationGuide');
    const app = document.getElementById('appContainer');

    if (isPortrait) {
        guide.classList.add('show');
        app.style.display = 'none';
    } else {
        guide.classList.remove('show');
        app.style.display = 'flex';
    }
}

function initialize() {
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);
    checkOrientation();
}

document.addEventListener('DOMContentLoaded', initialize);

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach((screen) => screen.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
}

function showStart() {
    showScreen('startScreen');
    currentMode = null;
    currentQuestion = 0;
    score = 0;
}

function showModeSelect() {
    isRandomMode = false;
    showScreen('modeSelectScreen');
}

function selectMode(mode) {
    currentMode = mode;
    showScreen('difficultyScreen');
}

function startRandom() {
    isRandomMode = true;
    currentDifficulty = Math.floor(Math.random() * 3) + 1;
    const modes = ['A1', 'A2', 'C1', 'C2', 'B1', 'D3'];
    currentMode = modes[Math.floor(Math.random() * modes.length)];
    startGame(currentDifficulty);
}

function startGame(difficulty) {
    currentDifficulty = difficulty;
    currentQuestion = 0;
    score = 0;
    loadQuestion();
}

function loadQuestion() {
    currentQuestion += 1;
    selectedAnswer = null;

    if (isRandomMode) {
        const modes = ['A1', 'A2', 'C1', 'C2', 'B1', 'D3'];
        currentMode = modes[Math.floor(Math.random() * modes.length)];
        currentDifficulty = Math.floor(Math.random() * 3) + 1;
    }

    document.getElementById('progressInfo').textContent = `${currentQuestion} / ${totalQuestions}`;

    generateQuestion();
    setupQuestionUI();

    showScreen('questionScreen');
}

function generateQuestion() {
    currentBlocks = [];
    const range = getDifficultyRange();

    if (currentMode === 'A1') {
        generateVisibleBlocks(range.min, range.max, false);
        correctAnswer = currentBlocks.length;
    } else if (currentMode === 'A2') {
        generateVisibleBlocks(range.min, range.max, true);
        correctAnswer = currentBlocks.length;
    } else if (currentMode === 'C1') {
        generateColoredBlocks(range.minWhite, range.maxWhite, range.minBlack, range.maxBlack);
        correctAnswer = currentBlocks.filter((block) => block.color === 'white').length;
    } else if (currentMode === 'C2') {
        generateColoredBlocks(range.minWhite, range.maxWhite, range.minBlack, range.maxBlack);
        correctAnswer = currentBlocks.filter((block) => block.color === 'black').length;
    } else if (currentMode === 'B1') {
        generateComparisonBlocks(range.min, range.max);
    } else if (currentMode === 'D3') {
        generateFromViews(range.min, range.max);
    }
}

function getDifficultyRange() {
    const ranges = {
        1: { min: 3, max: 5, minWhite: 2, maxWhite: 3, minBlack: 1, maxBlack: 2 },
        2: { min: 6, max: 8, minWhite: 4, maxWhite: 6, minBlack: 2, maxBlack: 3 },
        3: { min: 8, max: 10, minWhite: 6, maxWhite: 8, minBlack: 3, maxBlack: 5 },
    };
    return ranges[currentDifficulty];
}

function getColumnHeight(x, z) {
    const columnBlocks = currentBlocks.filter((block) => block.x === x && block.z === z);
    if (columnBlocks.length === 0) return 0;
    return Math.max(...columnBlocks.map((block) => block.y)) + 1;
}

function addSupportedBlock(gridSize, properties, maxHeight = 2, maxAttempts = 80) {
    let attempts = 0;
    while (attempts < maxAttempts) {
        attempts += 1;
        const x = Math.floor(Math.random() * gridSize);
        const z = Math.floor(Math.random() * gridSize);
        const currentHeight = getColumnHeight(x, z);

        if (currentHeight >= maxHeight) continue;

        const y = currentHeight;
        const exists = currentBlocks.some((block) => block.x === x && block.y === y && block.z === z);
        if (exists) continue;

        currentBlocks.push({ x, y, z, ...properties });
        return true;
    }
    return false;
}

function generateVisibleBlocks(min, max, includeHidden) {
    const targetCount = Math.floor(Math.random() * (max - min + 1)) + min;
    const gridSize = 4;
    currentGridSize = gridSize;

    while (currentBlocks.length < targetCount) {
        const visible = includeHidden ? Math.random() > 0.3 : true;
        if (!addSupportedBlock(gridSize, { color: 'white', visible })) break;
    }
}

function generateColoredBlocks(minWhite, maxWhite, minBlack, maxBlack) {
    const whiteTarget = Math.floor(Math.random() * (maxWhite - minWhite + 1)) + minWhite;
    const blackTarget = Math.floor(Math.random() * (maxBlack - minBlack + 1)) + minBlack;
    const gridSize = 4;
    currentGridSize = gridSize;

    let whiteCount = 0;
    while (whiteCount < whiteTarget) {
        if (addSupportedBlock(gridSize, { color: 'white', visible: true })) {
            whiteCount += 1;
        } else {
            break;
        }
    }

    let blackCount = 0;
    while (blackCount < blackTarget) {
        if (addSupportedBlock(gridSize, { color: 'black', visible: true })) {
            blackCount += 1;
        } else {
            break;
        }
    }
}

function generateComparisonBlocks(min, max) {
    currentBlocks = [];
    const leftCount = Math.floor(Math.random() * (max - min + 1)) + min;
    const diff = Math.floor(Math.random() * 3) + 1;
    const rightCount = Math.random() > 0.5 ? leftCount + diff : Math.max(min, leftCount - diff);
    const gridSize = 3;
    currentGridSize = gridSize;

    for (let i = 0; i < leftCount; i += 1) {
        addSupportedBlock(gridSize, { color: 'white', side: 'left', visible: true });
    }

    for (let i = 0; i < rightCount; i += 1) {
        addSupportedBlock(gridSize, { color: 'white', side: 'right', visible: true });
    }

    correctAnswer = leftCount > rightCount ? 'left' : 'right';
}

function generateFromViews(min, max) {
    const targetCount = Math.floor(Math.random() * (max - min + 1)) + min;
    const gridSize = 3;
    currentGridSize = gridSize;

    while (currentBlocks.length < targetCount) {
        if (!addSupportedBlock(gridSize, { color: 'white', visible: true })) {
            break;
        }
    }

    correctAnswer = currentBlocks.length;
}

function setupQuestionUI() {
    const questionText = document.getElementById('questionText');
    const questionBottom = document.getElementById('questionBottom');
    const questionMiddle = document.getElementById('questionMiddle');

    const texts = {
        A1: 'つみきは ぜんぶで なんこ かな？',
        A2: 'かくれてる つみきも いれて なんこ かな？',
        C1: 'しろい つみきは なんこ かな？',
        C2: 'くろい つみきは なんこ かな？',
        B1: 'つみきが おおいのは どっちかな？',
        D3: 'うえと よこから みたとき、つみきは なんこ かな？',
    };
    questionText.textContent = texts[currentMode];

    if (currentMode === 'B1') {
        questionBottom.innerHTML = `
            <div class="comparison-buttons">
                <button class="btn btn-primary comparison-btn" onclick="selectComparison('left')">ひだり が おおい</button>
                <button class="btn btn-primary comparison-btn" onclick="selectComparison('right')">みぎ が おおい</button>
            </div>
        `;
    } else {
        const maxNum = currentDifficulty === 1 ? 8 : currentDifficulty === 2 ? 12 : 15;
        let html = '<div class="number-grid">';
        for (let i = 1; i <= maxNum; i += 1) {
            html += `<button class="number-btn" onclick="selectNumber(${i})">${i}</button>`;
        }
        html += '</div><button class="btn btn-primary btn-large" onclick="submitAnswer()">こたえを きめる</button>';
        questionBottom.innerHTML = html;
    }

    if (currentMode === 'B1') {
        questionMiddle.innerHTML = `
            <div class="canvas-split">
                <div class="canvas-half"><canvas id="leftCanvas"></canvas></div>
                <div class="canvas-half"><canvas id="rightCanvas"></canvas></div>
            </div>
        `;
        drawComparisonBlocks();
    } else if (currentMode === 'D3') {
        questionMiddle.innerHTML = `
            <div class="canvas-split">
                <div class="canvas-half">
                    <canvas id="topCanvas"></canvas>
                    <div style="text-align:center;margin-top:10px;font-size:14px;">うえから</div>
                </div>
                <div class="canvas-half">
                    <canvas id="sideCanvas"></canvas>
                    <div style="text-align:center;margin-top:10px;font-size:14px;">よこから</div>
                </div>
            </div>
        `;
        drawTopAndSideViews();
    } else {
        questionMiddle.innerHTML = '<div class="canvas-container"><canvas id="mainCanvas"></canvas></div>';
        drawBlocks();
    }
}

function selectNumber(num) {
    selectedAnswer = num;
    document.querySelectorAll('.number-btn').forEach((button) => {
        button.classList.toggle('selected', parseInt(button.textContent, 10) === num);
    });
}

function selectComparison(side) {
    selectedAnswer = side;
}

function submitAnswer() {
    if (selectedAnswer === null) {
        alert('こたえを えらんでね！');
        return;
    }

    const isCorrect = selectedAnswer === correctAnswer;
    if (isCorrect) score += 1;

    showResult(isCorrect);
}

function showResult(isCorrect) {
    const icon = document.getElementById('resultIcon');
    const text = document.getElementById('resultText');

    if (isCorrect) {
        icon.textContent = '🎉';
        text.textContent = 'せいかい！';
        text.style.color = 'var(--color-success)';
    } else {
        icon.textContent = '😢';
        text.textContent = `ざんねん！こたえは ${correctAnswer} だよ`;
        text.style.color = 'var(--color-error)';
    }

    showScreen('resultScreen');
}

function nextQuestion() {
    if (currentQuestion < totalQuestions) {
        loadQuestion();
    } else {
        alert(`ゲーム おわり！\n${score} / ${totalQuestions} せいかい！`);
        showStart();
    }
}

function drawBlocks() {
    const canvas = document.getElementById('mainCanvas');
    const ctx = canvas.getContext('2d');
    const size = Math.min(window.innerWidth * 0.5, window.innerHeight * 0.5);
    canvas.width = size;
    canvas.height = size;

    const blockSize = size / 8;
    const offsetX = size / 2;
    const offsetY = size / 2.5;

    ctx.clearRect(0, 0, size, size);

    drawGroundGrid(ctx, offsetX, offsetY, blockSize, currentGridSize);

    const sorted = [...currentBlocks].sort((a, b) => (b.z + b.y + b.x) - (a.z + a.y + a.x));

    sorted.forEach((block) => {
        if (block.visible === false) return;

        const isoX = (block.x - block.z) * blockSize * 0.866;
        const isoY = (block.x + block.z) * blockSize * 0.5 - block.y * blockSize;

        drawIsometricCube(ctx, offsetX + isoX, offsetY + isoY, blockSize, block.color);
    });
}

function drawComparisonBlocks() {
    ['left', 'right'].forEach((side) => {
        const canvas = document.getElementById(`${side}Canvas`);
        const ctx = canvas.getContext('2d');
        const size = Math.min(window.innerWidth * 0.25, window.innerHeight * 0.5);
        canvas.width = size;
        canvas.height = size;

        const blockSize = size / 6;
        const offsetX = size / 2;
        const offsetY = size / 2.5;

        ctx.clearRect(0, 0, size, size);

        const blocks = currentBlocks.filter((block) => block.side === side);
        const sorted = [...blocks].sort((a, b) => (b.z + b.y + b.x) - (a.z + a.y + a.x));

        drawGroundGrid(ctx, offsetX, offsetY, blockSize, currentGridSize);

        sorted.forEach((block) => {
            const isoX = (block.x - block.z) * blockSize * 0.866;
            const isoY = (block.x + block.z) * blockSize * 0.5 - block.y * blockSize;
            drawIsometricCube(ctx, offsetX + isoX, offsetY + isoY, blockSize, block.color);
        });
    });
}

function drawTopAndSideViews() {
    const topCanvas = document.getElementById('topCanvas');
    const topCtx = topCanvas.getContext('2d');
    const size = Math.min(window.innerWidth * 0.25, window.innerHeight * 0.5);
    topCanvas.width = size;
    topCanvas.height = size;

    const gridSize = 3;
    const cellSize = size / (gridSize + 1);
    const offsetX = cellSize / 2;
    const offsetY = cellSize / 2;

    topCtx.clearRect(0, 0, size, size);

    for (let x = 0; x < gridSize; x += 1) {
        for (let z = 0; z < gridSize; z += 1) {
            const hasBlock = currentBlocks.some((block) => block.x === x && block.z === z);
            topCtx.fillStyle = hasBlock ? '#21808d' : '#f5f5f5';
            topCtx.fillRect(offsetX + x * cellSize, offsetY + z * cellSize, cellSize - 2, cellSize - 2);
            topCtx.strokeStyle = '#626c71';
            topCtx.strokeRect(offsetX + x * cellSize, offsetY + z * cellSize, cellSize - 2, cellSize - 2);
        }
    }

    const sideCanvas = document.getElementById('sideCanvas');
    const sideCtx = sideCanvas.getContext('2d');
    sideCanvas.width = size;
    sideCanvas.height = size;

    sideCtx.clearRect(0, 0, size, size);

    const maxY = Math.max(...currentBlocks.map((block) => block.y), 0) + 1;
    const cellHeight = size / (maxY + 2);

    for (let x = 0; x < gridSize; x += 1) {
        for (let y = 0; y < maxY + 1; y += 1) {
            const hasBlock = currentBlocks.some((block) => block.x === x && block.y === y);
            sideCtx.fillStyle = hasBlock ? '#21808d' : '#f5f5f5';
            sideCtx.fillRect(offsetX + x * cellSize, size - offsetY - (y + 1) * cellHeight, cellSize - 2, cellHeight - 2);
            sideCtx.strokeStyle = '#626c71';
            sideCtx.strokeRect(offsetX + x * cellSize, size - offsetY - (y + 1) * cellHeight, cellSize - 2, cellHeight - 2);
        }
    }
}

function drawIsometricCube(ctx, x, y, size, color) {
    const w = size * 0.866;
    const h = size * 0.5;

    const top = { x, y };
    const right = { x: x + w, y: y + h };
    const left = { x: x - w, y: y + h };
    const front = { x, y: y + h * 2 };
    const leftBottom = { x: x - w, y: y + h + size };
    const rightBottom = { x: x + w, y: y + h + size };
    const base = { x, y: y + h * 2 + size };

    ctx.save();
    ctx.lineJoin = 'round';
    ctx.lineWidth = 1.8;
    ctx.strokeStyle = '#3c4449';

    ctx.beginPath();
    ctx.moveTo(front.x, front.y);
    ctx.lineTo(left.x, left.y);
    ctx.lineTo(leftBottom.x, leftBottom.y);
    ctx.lineTo(base.x, base.y);
    ctx.closePath();
    ctx.fillStyle = color === 'black' ? '#0f1112' : '#d8d8d8';
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(front.x, front.y);
    ctx.lineTo(right.x, right.y);
    ctx.lineTo(rightBottom.x, rightBottom.y);
    ctx.lineTo(base.x, base.y);
    ctx.closePath();
    ctx.fillStyle = color === 'black' ? '#191b1c' : '#ededed';
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(top.x, top.y);
    ctx.lineTo(right.x, right.y);
    ctx.lineTo(front.x, front.y);
    ctx.lineTo(left.x, left.y);
    ctx.closePath();
    ctx.fillStyle = color === 'black' ? '#222526' : '#ffffff';
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(top.x, top.y);
    ctx.lineTo(right.x, right.y);
    ctx.lineTo(rightBottom.x, rightBottom.y);
    ctx.lineTo(base.x, base.y);
    ctx.lineTo(leftBottom.x, leftBottom.y);
    ctx.lineTo(left.x, left.y);
    ctx.closePath();
    ctx.strokeStyle = '#1f262a';
    ctx.stroke();
    ctx.restore();
}

function drawGroundGrid(ctx, offsetX, offsetY, blockSize, gridSize) {
    const w = blockSize * 0.866;
    const h = blockSize * 0.5;
    ctx.save();
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = '#b8c0c4';
    ctx.fillStyle = 'rgba(184, 192, 196, 0.15)';

    for (let x = 0; x < gridSize; x += 1) {
        for (let z = 0; z < gridSize; z += 1) {
            const isoX = (x - z) * w;
            const isoY = (x + z) * h + blockSize;
            const top = { x: offsetX + isoX, y: offsetY + isoY };
            const right = { x: top.x + w, y: top.y + h };
            const left = { x: top.x - w, y: top.y + h };
            const front = { x: top.x, y: top.y + h * 2 };

            ctx.beginPath();
            ctx.moveTo(top.x, top.y);
            ctx.lineTo(right.x, right.y);
            ctx.lineTo(front.x, front.y);
            ctx.lineTo(left.x, left.y);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        }
    }

    ctx.restore();
}

checkOrientation();
