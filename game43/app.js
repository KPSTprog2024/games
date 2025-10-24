// 図形指示トレーニング

class ShapeTrainerApp {
    constructor() {
        // 動物データ
        this.animals = [
            {"id": 1, "name": "イルカ", "emoji": "🐬", "category": "sea"},
            {"id": 2, "name": "クジラ", "emoji": "🐋", "category": "sea"},
            {"id": 3, "name": "タコ", "emoji": "🐙", "category": "sea"},
            {"id": 4, "name": "イカ", "emoji": "🦑", "category": "sea"},
            {"id": 5, "name": "サメ", "emoji": "🦈", "category": "sea"},
            {"id": 6, "name": "カニ", "emoji": "🦀", "category": "sea"},
            {"id": 7, "name": "エビ", "emoji": "🦐", "category": "sea"},
            {"id": 8, "name": "カメ", "emoji": "🐢", "category": "sea"},
            {"id": 9, "name": "魚", "emoji": "🐟", "category": "sea"},
            {"id": 10, "name": "ライオン", "emoji": "🦁", "category": "land"},
            {"id": 11, "name": "ゾウ", "emoji": "🐘", "category": "land"},
            {"id": 12, "name": "キリン", "emoji": "🦒", "category": "land"},
            {"id": 13, "name": "ウサギ", "emoji": "🐰", "category": "land"},
            {"id": 14, "name": "ネコ", "emoji": "🐱", "category": "land"},
            {"id": 15, "name": "イヌ", "emoji": "🐶", "category": "land"},
            {"id": 16, "name": "ウマ", "emoji": "🐴", "category": "land"},
            {"id": 17, "name": "ウシ", "emoji": "🐄", "category": "land"},
            {"id": 18, "name": "ブタ", "emoji": "🐷", "category": "land"},
            {"id": 19, "name": "ヒツジ", "emoji": "🐑", "category": "land"},
            {"id": 20, "name": "ニワトリ", "emoji": "🐓", "category": "bird"},
            {"id": 21, "name": "ペンギン", "emoji": "🐧", "category": "bird"},
            {"id": 22, "name": "フクロウ", "emoji": "🦉", "category": "bird"},
            {"id": 23, "name": "ハト", "emoji": "🕊️", "category": "bird"},
            {"id": 24, "name": "カラス", "emoji": "🐦‍⬛", "category": "bird"},
            {"id": 25, "name": "カエル", "emoji": "🐸", "category": "other"},
            {"id": 26, "name": "ヘビ", "emoji": "🐍", "category": "other"},
            {"id": 27, "name": "コウモリ", "emoji": "🦇", "category": "other"},
            {"id": 28, "name": "リス", "emoji": "🐿️", "category": "other"}
        ];

        // 難易度設定
        this.difficulties = [
            {"level": 1, "name": "やさしい", "animalCount": 2, "blankRate": 0, "symbols": ["○", "△", "×"]},
            {"level": 2, "name": "ふつう", "animalCount": 3, "blankRate": 0, "symbols": ["○", "△", "×"]},
            {"level": 3, "name": "むずかしい", "animalCount": 4, "blankRate": 0, "symbols": ["○", "△", "×", "□"]},
            {"level": 4, "name": "とてもむずかしい", "animalCount": 5, "blankRate": 0, "symbols": ["○", "△", "×", "□", "⭐︎"]}
        ];

        // ゲーム状態
        this.gameState = {
            selectedAnimals: [],
            animalSymbolMap: {},
            problems: [],
            currentQuestionIndex: 0,
            gameStartTime: null
        };

        // 設定
        this.TOTAL_PROBLEMS = 20;
        this.FEEDBACK_TIME = 1000;
        this.MAX_RECORDS = 10;

        // 内部状態
        this.selectedDifficulty = null;
        this.gameTimer = null;
        this.blankTimer = null;
        this.isProcessingAnswer = false; // 重複処理防止

        this.init();
    }

    init() {
        this.bindEvents();
        this.showScreen('start');
    }

    bindEvents() {
        // 難易度選択
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.selectDifficulty(e.target));
        });

        // スタート画面
        document.getElementById('start-game-btn').addEventListener('click', () => this.startGame());
        document.getElementById('show-records-btn').addEventListener('click', () => this.showRecords());

        // ゲーム画面
        document.querySelectorAll('.answer-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (!this.isProcessingAnswer) {
                    this.handleAnswer(e.target.dataset.answer);
                }
            });
        });

        // 結果画面
        document.getElementById('retry-btn').addEventListener('click', () => this.showScreen('start'));
        document.getElementById('view-records-btn').addEventListener('click', () => this.showRecords());
        document.getElementById('back-to-start-btn').addEventListener('click', () => this.showScreen('start'));

        // 記録画面
        document.getElementById('clear-records-btn').addEventListener('click', () => this.clearRecords());
        document.getElementById('back-from-records-btn').addEventListener('click', () => this.showScreen('start'));
    }

    // 難易度選択
    selectDifficulty(button) {
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.classList.remove('selected');
        });

        button.classList.add('selected');
        const level = parseInt(button.dataset.level);
        this.selectedDifficulty = this.difficulties.find(d => d.level === level);

        this.generateGame();
        this.showCorrespondencePreview();
        this.showStartButton();
    }

    // ゲーム生成
    generateGame() {
        this.selectRandomAnimals();
        this.assignSymbols();
        this.generateProblems();
    }

    // ランダム動物選択
    selectRandomAnimals() {
        const shuffled = [...this.animals].sort(() => Math.random() - 0.5);
        this.gameState.selectedAnimals = shuffled.slice(0, this.selectedDifficulty.animalCount);
    }

    // 記号割り当て
    assignSymbols() {
        this.gameState.animalSymbolMap = {};
        const symbolsForLevel = this.selectedDifficulty.symbols.slice(0, this.selectedDifficulty.animalCount);
        const shuffledSymbols = symbolsForLevel.sort(() => Math.random() - 0.5);

        this.gameState.selectedAnimals.forEach((animal, index) => {
            this.gameState.animalSymbolMap[animal.id] = shuffledSymbols[index];
        });
    }

    // 問題生成
    generateProblems() {
        this.gameState.problems = [];
        
        // ブランクの問題数を計算
        const blankCount = Math.floor(this.TOTAL_PROBLEMS * this.selectedDifficulty.blankRate);
        const blankAnimal = this.gameState.selectedAnimals.find(animal => 
            this.gameState.animalSymbolMap[animal.id] === 'ブランク'
        );

        // 通常問題用の動物リスト
        const normalAnimals = this.gameState.selectedAnimals.filter(animal => 
            this.gameState.animalSymbolMap[animal.id] !== 'ブランク'
        );

        // 問題を20問分作成
        for (let i = 0; i < this.TOTAL_PROBLEMS; i++) {
            let selectedAnimal;
            
            // ブランク問題を配置
            if (i < blankCount && blankAnimal) {
                selectedAnimal = blankAnimal;
            } else {
                // 通常問題をランダム選択
                selectedAnimal = normalAnimals[Math.floor(Math.random() * normalAnimals.length)];
            }

            const symbol = this.gameState.animalSymbolMap[selectedAnimal.id];
            this.gameState.problems.push({
                questionNumber: i + 1,
                animalId: selectedAnimal.id,
                animalEmoji: selectedAnimal.emoji,
                animalName: selectedAnimal.name,
                correctAnswer: symbol,
                isBlank: symbol === 'ブランク',
                userAnswer: null,
                isCorrect: null
            });
        }

        // シャッフル（連続制限付き）
        this.gameState.problems = this.shuffleWithConstraints(this.gameState.problems);
        
        // 問題番号を振り直し
        this.gameState.problems.forEach((problem, index) => {
            problem.questionNumber = index + 1;
        });
    }

    // 制約付きシャッフル
    shuffleWithConstraints(problems) {
        let attempts = 0;
        let shuffled;
        
        do {
            shuffled = [...problems].sort(() => Math.random() - 0.5);
            attempts++;
        } while (this.hasConsecutiveAnimals(shuffled) && attempts < 50);

        return shuffled;
    }

    hasConsecutiveAnimals(problems) {
        for (let i = 0; i < problems.length - 2; i++) {
            if (problems[i].animalId === problems[i + 1].animalId && 
                problems[i + 1].animalId === problems[i + 2].animalId) {
                return true;
            }
        }
        return false;
    }

    // 対応表プレビュー表示
    showCorrespondencePreview() {
        this.renderCorrespondenceTable('preview-animals', 'preview-symbols');
        document.getElementById('correspondence-preview').classList.remove('hidden');
    }

    // 対応表をテーブル形式で表示
    renderCorrespondenceTable(animalsRowId, symbolsRowId) {
        const animalsRow = document.getElementById(animalsRowId);
        const symbolsRow = document.getElementById(symbolsRowId);

        animalsRow.innerHTML = '';
        symbolsRow.innerHTML = '';

        const symbolOrder = this.selectedDifficulty ? this.selectedDifficulty.symbols : [];
        const sortedAnimals = [...this.gameState.selectedAnimals].sort((a, b) => {
            const symbolA = this.gameState.animalSymbolMap[a.id];
            const symbolB = this.gameState.animalSymbolMap[b.id];
            const indexA = symbolOrder.indexOf(symbolA);
            const indexB = symbolOrder.indexOf(symbolB);

            const safeIndexA = indexA === -1 ? Number.MAX_SAFE_INTEGER : indexA;
            const safeIndexB = indexB === -1 ? Number.MAX_SAFE_INTEGER : indexB;
            return safeIndexA - safeIndexB;
        });

        sortedAnimals.forEach(animal => {
            const symbol = this.gameState.animalSymbolMap[animal.id];

            const animalCell = document.createElement('td');
            animalCell.textContent = animal.emoji;
            animalCell.title = animal.name;
            animalsRow.appendChild(animalCell);

            const symbolCell = document.createElement('td');
            symbolCell.textContent = symbol === 'ブランク' ? '何もしない' : symbol;
            symbolCell.title = symbol;
            symbolsRow.appendChild(symbolCell);
        });
    }

    showStartButton() {
        document.getElementById('start-game-btn').classList.remove('hidden');
    }

    updateAnswerButtonsVisibility() {
        if (!this.selectedDifficulty) return;

        const availableSymbols = this.selectedDifficulty.symbols;
        document.querySelectorAll('.answer-btn').forEach(btn => {
            const symbol = btn.dataset.answer;
            if (availableSymbols.includes(symbol)) {
                btn.classList.remove('hidden');
            } else {
                btn.classList.add('hidden');
            }
        });
    }

    // ゲーム開始
    startGame() {
        if (!this.selectedDifficulty) {
            alert('難易度を選択してください');
            return;
        }

        this.gameState.currentQuestionIndex = 0;
        this.gameState.gameStartTime = Date.now();
        this.isProcessingAnswer = false;

        this.showScreen('game');
        this.updateAnswerButtonsVisibility();
        this.renderCorrespondenceTable('game-animals', 'game-symbols');
        this.startGameTimer();
        this.showNextQuestion();
    }

    startGameTimer() {
        this.gameTimer = setInterval(() => {
            const elapsed = Date.now() - this.gameState.gameStartTime;
            const minutes = Math.floor(elapsed / 60000);
            const seconds = Math.floor((elapsed % 60000) / 1000);
            document.getElementById('game-timer').textContent = 
                `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }, 1000);
    }

    // 次の問題表示
    showNextQuestion() {
        // ゲーム終了チェック
        if (this.gameState.currentQuestionIndex >= this.TOTAL_PROBLEMS) {
            this.endGame();
            return;
        }

        // 処理中フラグをリセット
        this.isProcessingAnswer = false;

        const currentProblem = this.gameState.problems[this.gameState.currentQuestionIndex];
        
        // ヘッダー更新
        document.getElementById('question-number').textContent = this.gameState.currentQuestionIndex + 1;
        
        // 動物表示
        document.getElementById('current-animal').textContent = currentProblem.animalEmoji;
        this.playQuestionSwipe();

        // UI リセット
        this.resetUI();

        // ブランク問題の場合は3秒タイマー開始
        if (currentProblem.isBlank) {
            this.startBlankTimer();
        }
    }

    playQuestionSwipe() {
        const card = document.querySelector('.question-card');
        if (!card) return;

        if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            card.classList.remove('question-card--swipe-in');
            return;
        }

        card.classList.remove('question-card--swipe-in');
        // Reflow to restart animation
        void card.offsetWidth;
        card.classList.add('question-card--swipe-in');
    }

    // UI リセット
    resetUI() {
        // ボタンリセット
        document.querySelectorAll('.answer-btn').forEach(btn => {
            btn.classList.remove('correct', 'incorrect');
        });
        
        // フィードバッククリア
        const feedback = document.getElementById('feedback');
        feedback.textContent = '';
        feedback.className = 'feedback';
        
        // ブランクタイマーリセット
        document.getElementById('blank-timer').classList.add('hidden');
        this.clearBlankTimer();
    }

    // ブランクタイマー開始
    startBlankTimer() {
        document.getElementById('blank-timer').classList.remove('hidden');
        let countdown = 3;
        document.getElementById('blank-countdown').textContent = countdown;

        this.blankTimer = setInterval(() => {
            countdown--;
            if (countdown > 0) {
                document.getElementById('blank-countdown').textContent = countdown;
            } else {
                this.clearBlankTimer();
                this.handleBlankTimeout();
            }
        }, 1000);
    }

    clearBlankTimer() {
        if (this.blankTimer) {
            clearInterval(this.blankTimer);
            this.blankTimer = null;
        }
    }

    // ブランクタイムアウト処理
    handleBlankTimeout() {
        if (this.isProcessingAnswer) return;
        this.isProcessingAnswer = true;

        const currentProblem = this.gameState.problems[this.gameState.currentQuestionIndex];
        currentProblem.userAnswer = null;
        currentProblem.isCorrect = true; // ブランク問題で待機は正解
        
        this.showFeedback(true, currentProblem.correctAnswer, currentProblem.animalName);
        document.getElementById('blank-timer').classList.add('hidden');
        
        setTimeout(() => {
            this.advanceToNextQuestion();
        }, this.FEEDBACK_TIME);
    }

    // 回答処理
    handleAnswer(userAnswer) {
        if (this.isProcessingAnswer) return;
        this.isProcessingAnswer = true;

        this.clearBlankTimer();
        document.getElementById('blank-timer').classList.add('hidden');
        
        const currentProblem = this.gameState.problems[this.gameState.currentQuestionIndex];
        currentProblem.userAnswer = userAnswer;
        currentProblem.isCorrect = this.checkAnswer(userAnswer);
        
        // ボタンフィードバック
        const clickedButton = document.querySelector(`[data-answer="${userAnswer}"]`);
        if (clickedButton) {
            clickedButton.classList.add(currentProblem.isCorrect ? 'correct' : 'incorrect');
        }
        
        this.showFeedback(currentProblem.isCorrect, currentProblem.correctAnswer, currentProblem.animalName);
        
        setTimeout(() => {
            this.advanceToNextQuestion();
        }, this.FEEDBACK_TIME);
    }

    // 次の問題に進む
    advanceToNextQuestion() {
        this.gameState.currentQuestionIndex++;
        this.showNextQuestion();
    }

    // 判定ロジック
    checkAnswer(userAnswer) {
        const currentProblem = this.gameState.problems[this.gameState.currentQuestionIndex];
        
        if (currentProblem.isBlank) {
            // ブランク問題：何もしないのが正解
            return userAnswer === null;
        } else {
            // 通常問題：文字列の完全一致
            return userAnswer === currentProblem.correctAnswer;
        }
    }

    // フィードバック表示
    showFeedback(isCorrect, correctAnswer, animalName) {
        const feedback = document.getElementById('feedback');
        
        if (isCorrect) {
            feedback.textContent = '✅ 正解！すばらしい！';
            feedback.className = 'feedback correct';
        } else {
            if (correctAnswer === 'ブランク') {
                feedback.textContent = `❌ 間違い！${animalName}は何もしないのが正解だよ！`;
            } else {
                feedback.textContent = `❌ 間違い！${animalName}は「${correctAnswer}」だよ！`;
            }
            feedback.className = 'feedback incorrect';
        }
    }

    // ゲーム終了
    endGame() {
        if (this.gameTimer) {
            clearInterval(this.gameTimer);
            this.gameTimer = null;
        }
        this.clearBlankTimer();
        
        this.saveRecord();
        this.showResults();
        this.showScreen('results');
    }

    // 結果表示
    showResults() {
        const correctCount = this.gameState.problems.filter(p => p.isCorrect).length;
        const accuracy = Math.round((correctCount / this.TOTAL_PROBLEMS) * 100);
        const totalTime = Date.now() - this.gameState.gameStartTime;
        const avgTime = Math.round(totalTime / this.TOTAL_PROBLEMS / 100) / 10;

        // スコア表示
        document.getElementById('score-percentage').textContent = `${accuracy}%`;
        
        // 統計表示
        const minutes = Math.floor(totalTime / 60000);
        const seconds = Math.floor((totalTime % 60000) / 1000);
        document.getElementById('total-time').textContent = 
            `${minutes}:${seconds.toString().padStart(2, '0')}`;
        document.getElementById('avg-time').textContent = `${avgTime}秒`;
        document.getElementById('correct-count').textContent = `${correctCount}/20`;

        // 問題別結果
        const problemResults = document.getElementById('problem-results');
        problemResults.innerHTML = '';
        
        this.gameState.problems.forEach((problem, index) => {
            const result = document.createElement('div');
            result.className = `problem-result ${problem.isCorrect ? 'correct' : 'incorrect'}`;
            result.textContent = problem.isCorrect ? '○' : '×';
            result.title = `問題${index + 1}: ${problem.animalName} → ${problem.correctAnswer} (${problem.isCorrect ? '正解' : '不正解'})`;
            problemResults.appendChild(result);
        });
    }

    // 記録保存
    saveRecord() {
        const totalTime = Date.now() - this.gameState.gameStartTime;
        const correctCount = this.gameState.problems.filter(p => p.isCorrect).length;
        const accuracy = Math.round((correctCount / this.TOTAL_PROBLEMS) * 100);

        const record = {
            date: new Date().toLocaleDateString('ja-JP'),
            timestamp: Date.now(),
            difficulty: this.selectedDifficulty.name,
            correctCount: correctCount,
            accuracy: accuracy,
            totalTime: totalTime,
            problems: this.gameState.problems.map(p => ({
                animalName: p.animalName,
                animalEmoji: p.animalEmoji,
                correctAnswer: p.correctAnswer,
                userAnswer: p.userAnswer,
                isCorrect: p.isCorrect
            }))
        };

        let records = this.loadRecords();
        records.unshift(record);
        
        if (records.length > this.MAX_RECORDS) {
            records = records.slice(0, this.MAX_RECORDS);
        }

        try {
            localStorage.setItem('shapeTrainerRecords', JSON.stringify(records));
        } catch (e) {
            // ローカルストレージが使用できない場合は無視
        }
    }

    // 記録読み込み
    loadRecords() {
        try {
            const stored = localStorage.getItem('shapeTrainerRecords');
            return stored ? JSON.parse(stored) : [];
        } catch (e) {
            return [];
        }
    }

    // 記録画面表示
    showRecords() {
        const records = this.loadRecords();
        const recordsList = document.getElementById('records-list');
        
        if (records.length === 0) {
            recordsList.innerHTML = '<div class="empty-records">まだ記録がありません</div>';
        } else {
            recordsList.innerHTML = '';
            
            records.forEach(record => {
                const minutes = Math.floor(record.totalTime / 60000);
                const seconds = Math.floor((record.totalTime % 60000) / 1000);
                const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;
                
                const item = document.createElement('div');
                item.className = 'record-item';
                item.innerHTML = `
                    <div class="record-date">${record.date}</div>
                    <div class="record-stats">
                        難易度: ${record.difficulty} | 
                        正答率: ${record.accuracy}% | 
                        時間: ${timeStr} | 
                        正解数: ${record.correctCount}/20
                    </div>
                `;
                recordsList.appendChild(item);
            });
        }
        
        this.showScreen('records');
    }

    // 記録クリア
    clearRecords() {
        if (confirm('すべての記録を削除しますか？')) {
            try {
                localStorage.removeItem('shapeTrainerRecords');
                this.showRecords();
            } catch (e) {
                // 無視
            }
        }
    }

    // 画面切り替え
    showScreen(screenName) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(`${screenName}-screen`).classList.add('active');
    }
}

// アプリケーション開始
document.addEventListener('DOMContentLoaded', () => {
    new ShapeTrainerApp();
});