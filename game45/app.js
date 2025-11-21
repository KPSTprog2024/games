// ゲーム設定
const CONFIG = {
    numberRanges: {
        '3-5': { min: 3, max: 5, layouts: ['grid', 'spread'], size: 30, sizeVariation: false },
        '5-9': { min: 5, max: 9, layouts: ['spread', 'dense'], size: 30, sizeVariation: false },
        '9-12': { min: 9, max: 12, layouts: ['dense'], size: 30, sizeVariation: false },
        '12-18': { min: 12, max: 18, layouts: ['dense'], size: 30, sizeVariation: false }
    },
    differences: {
        '1': [1],
        '2': [2],
        '2-3': [2, 3]
    },
    symbols: ['○', '□', '△'],
    totalQuestions: 10,
    fadeInDuration: 300,
    fadeOutDuration: 300,
    feedbackDuration: 500
};

// ゲーム状態
let gameState = {
    selectedNumber: null,
    selectedDifference: null,
    currentQuestion: 0,
    questions: [],
    results: [],
    canAnswer: false,
    questionStartTime: 0
};

// DOM要素
const screens = {
    start: document.getElementById('startScreen'),
    play: document.getElementById('playScreen'),
    result: document.getElementById('resultScreen'),
    history: document.getElementById('historyScreen')
};

// 画面遷移
function showScreen(screenName) {
    Object.values(screens).forEach(screen => screen.classList.remove('active'));
    screens[screenName].classList.add('active');
}

// スタート画面の初期化
function initStartScreen() {
    const paramButtons = document.querySelectorAll('.param-btn');
    const startButton = document.getElementById('startButton');

    paramButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const paramType = btn.dataset.param;
            const paramValue = btn.dataset.value;
            
            // 同じパラメータグループの選択を解除
            document.querySelectorAll(`.param-btn[data-param="${paramType}"]`).forEach(b => {
                b.classList.remove('selected');
            });
            
            // 選択
            btn.classList.add('selected');
            
            if (paramType === 'number') {
                gameState.selectedNumber = paramValue;
            } else if (paramType === 'difference') {
                gameState.selectedDifference = paramValue;
            }
            
            // 両方選択されたらスタートボタンを有効化
            if (gameState.selectedNumber && gameState.selectedDifference) {
                startButton.disabled = false;
            } else {
                startButton.disabled = true;
            }
        });
    });

    startButton.addEventListener('click', () => {
        if (gameState.selectedNumber && gameState.selectedDifference) {
            startGame();
        }
    });
}

// ゲーム開始
function startGame() {
    gameState.currentQuestion = 0;
    gameState.questions = generateQuestions();
    gameState.results = [];
    showScreen('play');
    showQuestion(0);
}

// 問題生成
function generateQuestions() {
    const questions = [];
    const numberConfig = CONFIG.numberRanges[gameState.selectedNumber];
    const diffArray = CONFIG.differences[gameState.selectedDifference];

    for (let i = 0; i < CONFIG.totalQuestions; i++) {
        const symbol = CONFIG.symbols[Math.floor(Math.random() * CONFIG.symbols.length)];
        const diff = diffArray[Math.floor(Math.random() * diffArray.length)];
        
        // 個数範囲からランダム選択
        const minRange = numberConfig.min;
        const maxRange = numberConfig.max;
        const leftCount = Math.floor(Math.random() * (maxRange - minRange + 1)) + minRange;
        
        // 差を適用（範囲内に収まるように調整）
        let rightCount = leftCount + diff;
        if (rightCount > maxRange) {
            rightCount = leftCount - diff;
        }
        
        // 上下にランダムに配置
        const topCount = Math.random() < 0.5 ? leftCount : rightCount;
        const bottomCount = topCount === leftCount ? rightCount : leftCount;
        
        const layout = numberConfig.layouts[Math.floor(Math.random() * numberConfig.layouts.length)];

        questions.push({
            symbol,
            topCount,
            bottomCount,
            correctAnswer: topCount > bottomCount ? 'top' : 'bottom',
            layout,
            symbolSize: numberConfig.size,
            allowSizeVariation: numberConfig.sizeVariation
        });
    }

    return questions;
}

// 問題表示
function showQuestion(index) {
    if (index >= CONFIG.totalQuestions) {
        showResults();
        return;
    }

    const question = gameState.questions[index];
    const progress = document.getElementById('progress');
    progress.textContent = `${index + 1} / ${CONFIG.totalQuestions}`;

    const topArea = document.getElementById('topArea');
    const bottomArea = document.getElementById('bottomArea');

    // エリアをクリア
    topArea.innerHTML = '';
    bottomArea.innerHTML = '';

    gameState.canAnswer = false;

    // 記号を配置
    placeSymbols(topArea, question.topCount, question);
    placeSymbols(bottomArea, question.bottomCount, question);

    // フェードイン
    setTimeout(() => {
        document.querySelectorAll('.symbol').forEach(s => s.classList.add('visible'));
        gameState.canAnswer = true;
        gameState.questionStartTime = Date.now();
    }, 50);
}

// 記号配置
function placeSymbols(container, count, question) {
    const rect = container.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const positions = [];

    if (question.layout === 'grid') {
        positions.push(...generateGridLayout(count, width, height, question.symbolSize));
    } else if (question.layout === 'spread') {
        positions.push(...generateSpreadLayout(count, width, height, question.symbolSize));
    } else if (question.layout === 'dense') {
        positions.push(...generateDenseLayout(count, width, height, question.symbolSize));
    }

    positions.forEach((pos, index) => {
        const symbolElement = document.createElement('div');
        symbolElement.className = 'symbol';
        symbolElement.textContent = question.symbol;
        symbolElement.style.left = pos.x + 'px';
        symbolElement.style.top = pos.y + 'px';
        
        // すべての記号を同じサイズで表示（統一サイズ）
        symbolElement.style.fontSize = question.symbolSize + 'px';
        
        container.appendChild(symbolElement);
    });
}

// グリッドレイアウト（重なりチェック付き）
function generateGridLayout(count, width, height, baseSize) {
    const positions = [];
    const minDistance = 45; // 記号サイズ30px × 2 の半径 + 15px マージン
    const cols = Math.ceil(Math.sqrt(count));
    const rows = Math.ceil(count / cols);
    
    // セル間隔を最小距離以上に設定
    const minCellWidth = minDistance + baseSize;
    const minCellHeight = minDistance + baseSize;
    
    // 実際のセル幅と高さを計算（エリアに収まるように調整）
    let cellWidth = width / (cols + 0.5);
    let cellHeight = height / (rows + 0.5);
    
    // 最小距離を確保できない場合は列数を減らす
    if (cellWidth < minCellWidth || cellHeight < minCellHeight) {
        const newCols = Math.max(2, Math.floor(width / minCellWidth));
        const newRows = Math.ceil(count / newCols);
        cellWidth = width / (newCols + 0.5);
        cellHeight = height / (newRows + 0.5);
    }

    for (let i = 0; i < count; i++) {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const x = cellWidth * (col + 0.75) - baseSize / 2;
        const y = cellHeight * (row + 0.75) - baseSize / 2;
        
        // エリア内に収まるように調整
        const clampedX = Math.max(baseSize / 2, Math.min(width - baseSize * 1.5, x));
        const clampedY = Math.max(baseSize / 2, Math.min(height - baseSize * 1.5, y));
        
        positions.push({
            x: clampedX,
            y: clampedY,
            size: baseSize
        });
    }

    return positions;
}

// 分散レイアウト
function generateSpreadLayout(count, width, height, baseSize) {
    const positions = [];
    const margin = baseSize;
    const minDistance = 45; // 記号サイズ30px × 2 の半径 + 15px マージン
    let attempts = 0;
    const maxAttempts = 100 * count; // 各記号に100回の試行を許可
    let resetCount = 0;
    const maxResets = 5;

    while (positions.length < count && resetCount < maxResets) {
        if (attempts >= maxAttempts) {
            // 配置全体をリセット
            positions.length = 0;
            attempts = 0;
            resetCount++;
            continue;
        }

        const x = Math.random() * (width - margin * 2) + margin;
        const y = Math.random() * (height - margin * 2) + margin;
        const size = baseSize;

        if (isValidPositionWithDistance(x, y, size, positions, minDistance)) {
            positions.push({ x, y, size });
        }
        attempts++;
    }

    // まだ足りない場合はグリッド配置にフォールバック
    if (positions.length < count) {
        return generateGridLayout(count, width, height, baseSize);
    }

    return positions;
}

// 密集レイアウト
function generateDenseLayout(count, width, height, baseSize) {
    const positions = [];
    const centerX = width / 2;
    const centerY = height / 2;
    const clusterRadius = Math.min(width, height) * 0.35;
    const minDistance = 45; // 記号サイズ30px × 2 の半径 + 15px マージン
    let attempts = 0;
    const maxAttempts = 100 * count; // 各記号に100回の試行を許可
    let resetCount = 0;
    const maxResets = 5;

    while (positions.length < count && resetCount < maxResets) {
        if (attempts >= maxAttempts) {
            // 配置全体をリセット
            positions.length = 0;
            attempts = 0;
            resetCount++;
            // リセット時はクラスター範囲を広げる
            const expandedRadius = clusterRadius * (1 + resetCount * 0.2);
            continue;
        }

        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * clusterRadius * (1 + resetCount * 0.2);
        const x = centerX + Math.cos(angle) * radius - baseSize / 2;
        const y = centerY + Math.sin(angle) * radius - baseSize / 2;
        const size = baseSize;

        if (x >= 0 && x <= width - baseSize && y >= 0 && y <= height - baseSize) {
            if (isValidPositionWithDistance(x, y, size, positions, minDistance)) {
                positions.push({ x, y, size });
            }
        }
        attempts++;
    }

    // まだ足りない場合はグリッド配置にフォールバック
    if (positions.length < count) {
        return generateGridLayout(count, width, height, baseSize);
    }

    return positions;
}



// 位置の有効性チェック（旧バージョン - 後方互換性のため残す）
function isValidPosition(x, y, size, existingPositions, minDistance = 5) {
    for (const pos of existingPositions) {
        const dx = x - pos.x;
        const dy = y - pos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < size + minDistance) {
            return false;
        }
    }
    return true;
}

// 改善された位置の有効性チェック（中心距離ベース）
function isValidPositionWithDistance(x, y, size, existingPositions, minDistance) {
    // 記号の中心座標を計算
    const centerX = x + size / 2;
    const centerY = y + size / 2;
    
    for (const pos of existingPositions) {
        // 既存記号の中心座標を計算
        const existingCenterX = pos.x + pos.size / 2;
        const existingCenterY = pos.y + pos.size / 2;
        
        // 中心間の距離を計算
        const dx = centerX - existingCenterX;
        const dy = centerY - existingCenterY;
        const centerDistance = Math.sqrt(dx * dx + dy * dy);
        
        // 最小距離（45px）より近い場合は無効
        if (centerDistance < minDistance) {
            return false;
        }
    }
    return true;
}

// 回答処理
function handleAnswer(position) {
    if (!gameState.canAnswer) return;

    gameState.canAnswer = false;

    const currentTime = Date.now();
    const reactionTime = (currentTime - gameState.questionStartTime) / 1000;
    const question = gameState.questions[gameState.currentQuestion];
    const isCorrect = position === question.correctAnswer;

    gameState.results.push({
        questionNumber: gameState.currentQuestion + 1,
        symbol: question.symbol,
        correct: isCorrect,
        reactionTime: reactionTime
    });

    // フェードアウト
    document.querySelectorAll('.symbol').forEach(s => s.classList.add('fade-out'));

    // フィードバック表示
    const feedback = document.getElementById('feedback');
    feedback.textContent = isCorrect ? '○' : '×';
    feedback.className = 'feedback show ' + (isCorrect ? 'correct' : 'incorrect');

    setTimeout(() => {
        feedback.classList.remove('show');
        gameState.currentQuestion++;
        showQuestion(gameState.currentQuestion);
    }, CONFIG.feedbackDuration);
}

// タップイベント
function initPlayScreen() {
    const topArea = document.getElementById('topArea');
    const bottomArea = document.getElementById('bottomArea');

    topArea.addEventListener('click', () => handleAnswer('top'));
    bottomArea.addEventListener('click', () => handleAnswer('bottom'));
}

// 結果表示
function showResults() {
    showScreen('result');

    const correctCount = gameState.results.filter(r => r.correct).length;
    const accuracy = correctCount / CONFIG.totalQuestions;
    const validTimes = gameState.results.filter(r => r.reactionTime !== null).map(r => r.reactionTime);
    const avgTime = validTimes.length > 0 ? validTimes.reduce((a, b) => a + b, 0) / validTimes.length : 0;

    // 日付と難易度
    const date = new Date();
    const dateStr = `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
    document.getElementById('resultDate').textContent = dateStr;
    document.getElementById('resultDifficulty').textContent = `こすう：${gameState.selectedNumber}、さ：${gameState.selectedDifference}`;
    
    // 統計
    document.getElementById('accuracy').textContent = `${correctCount} / ${CONFIG.totalQuestions}`;
    const avgTimeText = avgTime > 0 ? avgTime.toFixed(2) + 'びょう' : '-';
    document.getElementById('avgTime').textContent = avgTimeText;

    // プレイヤータイプ
    const playerType = determinePlayerType(avgTime, accuracy);
    document.getElementById('playerType').textContent = playerType;

    // 結果テーブル
    const tableBody = document.getElementById('resultTableBody');
    tableBody.innerHTML = '';
    gameState.results.forEach(result => {
        const row = document.createElement('tr');
        const timeClass = result.reactionTime <= 1.0 ? 'time-fast' :
            result.reactionTime <= 2.0 ? 'time-medium' : 'time-slow';
        
        const timeText = result.reactionTime.toFixed(2) + 'びょう';

        row.innerHTML = `
            <td>${result.questionNumber}</td>
            <td style="font-size: 18px;">${result.correct ? '○' : '×'}</td>
            <td class="${timeClass}">${timeText}</td>
        `;
        tableBody.appendChild(row);
    });

    // 子どもコメント
    const childComment = generateChildComment(accuracy, avgTime);
    document.getElementById('childComment').textContent = childComment;

    // 親向けアドバイス
    const advice = generateParentAdvice(accuracy, avgTime, gameState.results);
    document.getElementById('mainAdvice').textContent = advice.main;
    document.getElementById('subAdvice').textContent = advice.sub;
    document.getElementById('nextRecommend').textContent = advice.next;
    document.getElementById('detailAnalysis').textContent = advice.detail;

    // データ保存
    saveGameData({
        date: dateStr,
        numberParam: gameState.selectedNumber,
        differenceParam: gameState.selectedDifference,
        difficultyName: `こすう：${gameState.selectedNumber}、さ：${gameState.selectedDifference}`,
        correctCount,
        totalQuestions: CONFIG.totalQuestions,
        accuracy,
        avgTime,
        playerType,
        results: gameState.results,
        childComment,
        advice
    });
}

// プレイヤータイプ判定
function determinePlayerType(avgTime, accuracy) {
    if (avgTime < 1.0 && accuracy >= 0.7) return '💨 しゅんぱつがた';
    if (avgTime >= 1.0 && avgTime <= 2.0 && accuracy >= 0.75) return '⚖ バランスがた';
    if (avgTime > 2.0 && accuracy >= 0.8) return '🐢 しんちょうがた';
    if (avgTime < 1.0 && accuracy < 0.6) return '⚡ あせりがた';
    if (accuracy < 0.6) return '🌱 れんしゅうがた';
    return '🎯 ニューチャレンジャー';
}

// 子どもコメント生成
function generateChildComment(accuracy, avgTime) {
    if (accuracy >= 0.9) return 'すごい！ ほとんど ぜんぶ せいかい だね！';
    if (accuracy >= 0.8) return 'とっても よく できたね！';
    if (accuracy >= 0.7) return 'おちついて よくみて、まちがい すくなかったね！';
    if (accuracy >= 0.6) return 'がんばったね！ つぎも ちょうせん しよう！';
    return 'れんしゅう すれば、もっと じょうずに なるよ！';
}

// 親向けアドバイス生成
function generateParentAdvice(accuracy, avgTime, results) {
    const advice = { main: '', sub: '', next: '', detail: '' };

    // 主な提案（反応時間に基づく）
    if (accuracy < 0.6) {
        advice.main = 'もう ひとつ やさしい レベルで、ゆっくり れんしゅう してみて ください。';
        advice.next = 'いまより やさしい なんいど が おすすめ です。';
    } else if (accuracy >= 0.6 && accuracy < 0.75 && avgTime < 1.0) {
        advice.main = 'すこし あせって いる かも しれません。おちついて、ていねいに かぞえる じかんを つくって みましょう。';
        advice.next = 'おなじ なんいど で、もう すこし ていねいに とりくみ ましょう。';
    } else if (accuracy >= 0.75 && avgTime < 1.0) {
        advice.main = 'はやくて せいかく！すばらしいです。つぎの なんいどに ちょうせん して みましょう！';
        advice.next = 'つぎの なんいど に すすむ ことを おすすめ します。';
    } else if (accuracy >= 0.75 && avgTime >= 1.0 && avgTime <= 2.0) {
        advice.main = 'とても バランスが いいです！じぶんの ペースで とりくめて います。';
        advice.next = 'おなじ なんいど で つづけるか、つぎの レベルに すすんで みましょう。';
    } else if (accuracy >= 0.75 && avgTime > 2.0) {
        advice.main = 'せいかくさは ばっちり！じしんが ついたら、すこし はやく こたえる れんしゅうを して みましょう。';
        advice.next = 'おなじ なんいど で、すこし はやめに こたえる れんしゅうを しましょう。';
    } else {
        advice.main = 'よく がんばりました！このちょうしで つづけて ください。';
        advice.next = 'おなじ なんいど で れんしゅうを つづけ ましょう。';
    }

    // 補助提案
    advice.sub = 'にちじょう せいかつで、ものの かずを くらべたり、かぞえたり する あそびを とりいれて みて ください。';

    // 詳細分析（記号別正答率）
    const symbolStats = {};
    results.forEach(r => {
        if (!symbolStats[r.symbol]) symbolStats[r.symbol] = { correct: 0, total: 0 };
        symbolStats[r.symbol].total++;
        if (r.correct) symbolStats[r.symbol].correct++;
    });

    const symbolAnalysis = [];
    Object.keys(symbolStats).forEach(symbol => {
        const stat = symbolStats[symbol];
        const rate = (stat.correct / stat.total * 100).toFixed(0);
        symbolAnalysis.push(`${symbol}：${rate}％（${stat.correct}/${stat.total}）`);
    });

    advice.detail = 'きごう べつ せいかいりつ：' + symbolAnalysis.join('、');

    // 特定記号で低正答率の場合
    Object.keys(symbolStats).forEach(symbol => {
        const stat = symbolStats[symbol];
        const rate = stat.correct / stat.total;
        if (rate < 0.6 && stat.total >= 3) {
            advice.sub += ` ${symbol}は すこし にがて の ようです。${symbol}の もんだいに とくに ちょうせん して みよう。`;
        }
    });

    return advice;
}

// データ保存
function saveGameData(data) {
    try {
        const history = getGameHistory();
        history.unshift(data);
        if (history.length > 5) history.pop();
        const historyData = JSON.stringify(history);
        // LocalStorage使用の代わりにメモリに保存
        window.gameHistory = historyData;
    } catch (e) {
        console.error('データ保存エラー:', e);
    }
}

// データ取得
function getGameHistory() {
    try {
        const data = window.gameHistory || '[]';
        return JSON.parse(data);
    } catch (e) {
        return [];
    }
}

// 結果画面ボタン
function initResultScreen() {
    document.getElementById('restartBtn').addEventListener('click', () => {
        showScreen('start');
    });

    document.getElementById('historyBtn').addEventListener('click', () => {
        showHistoryScreen();
    });

    document.getElementById('backBtn').addEventListener('click', () => {
        showScreen('start');
    });
}

// 履歴画面表示
function showHistoryScreen() {
    showScreen('history');
    const history = getGameHistory();
    const historyList = document.getElementById('historyList');
    const historyDetail = document.getElementById('historyDetail');

    historyDetail.classList.add('hidden');
    historyList.innerHTML = '';

    if (history.length === 0) {
        historyList.innerHTML = '<p style="text-align: center; color: #999; padding: 40px;">まだ きろくが ありません</p>';
        return;
    }

    history.forEach((data, index) => {
        const item = document.createElement('div');
        item.className = 'history-item';
        item.innerHTML = `
            <div class="history-item-header">
                <span class="history-date">${data.date}</span>
                <span class="history-difficulty">${data.difficultyName}</span>
            </div>
            <div class="history-stats">
                <span>せいかいりつ：${data.correctCount}/${data.totalQuestions}</span>
                <span>へいきん：${data.avgTime > 0 ? data.avgTime.toFixed(2) + 'びょう' : '-'}</span>
            </div>
            <div class="history-comment">${data.playerType}</div>
        `;

        item.addEventListener('click', () => showHistoryDetail(data));
        historyList.appendChild(item);
    });
}

// 履歴詳細表示
function showHistoryDetail(data) {
    const historyList = document.getElementById('historyList');
    const historyDetail = document.getElementById('historyDetail');

    historyList.classList.add('hidden');
    historyDetail.classList.remove('hidden');

    historyDetail.innerHTML = `
        <h3>${data.date} - ${data.difficultyName}</h3>
        <div style="margin-bottom: 16px;">
            <p><strong>せいかいりつ：</strong>${data.correctCount}/${data.totalQuestions}</p>
            <p><strong>へいきん じかん：</strong>${data.avgTime > 0 ? data.avgTime.toFixed(2) + 'びょう' : '-'}</p>
            <p><strong>タイプ：</strong>${data.playerType}</p>
        </div>
        <div class="history-detail-advice">
            <h4>おやごさん への アドバイス</h4>
            <p style="margin-top: 8px;"><strong>しゅな ていあん：</strong>${data.advice.main}</p>
            <p style="margin-top: 8px;"><strong>ほじょ ていあん：</strong>${data.advice.sub}</p>
            <p style="margin-top: 8px;"><strong>つぎの おすすめ：</strong>${data.advice.next}</p>
            <p style="margin-top: 8px;"><strong>くわしい ぶんせき：</strong>${data.advice.detail}</p>
        </div>
        <button class="btn" onclick="showHistoryScreen()" style="margin-top: 20px;">もどる</button>
    `;
}

// 履歴画面ボタン
function initHistoryScreen() {
    document.getElementById('backFromHistoryBtn').addEventListener('click', () => {
        showScreen('start');
    });
}

// 初期化
function init() {
    initStartScreen();
    initPlayScreen();
    initResultScreen();
    initHistoryScreen();
}

// アプリケーション起動
init();