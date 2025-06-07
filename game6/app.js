class ReactionTimeGame {
    constructor() {
        this.gameData = {
            gameTitle: "反射神経測定ゲーム",
            instructions: "赤い画面が緑色に変わったら、できるだけ早くクリック！",
            rankings: [
                {level: "優秀", time: "200ms以下", message: "素晴らしい反射神経です！", className: "excellent", maxTime: 200},
                {level: "良好", time: "201-300ms", message: "良い反射神経を持っています", className: "good", maxTime: 300},
                {level: "平均", time: "301-400ms", message: "平均的な反射神経です", className: "average", maxTime: 400},
                {level: "要改善", time: "401ms以上", message: "練習で改善できます", className: "needs-improvement", maxTime: Infinity}
            ],
            messages: {
                waiting: "待機中...",
                ready: "クリック！",
                tooSoon: "早すぎます！",
                completed: "測定完了"
            },
            settings: {
                testCount: 5,
                minWaitTime: 2000,
                maxWaitTime: 6000
            }
        };

        this.gameState = {
            currentTest: 0,
            results: [],
            isWaiting: false,
            isReady: false,
            isGameActive: false,
            startTime: 0,
            waitTimeout: null,
            activeZoneIndex: null
        };

        // Default mode is reaction measurement
        this.mode = 'measure';

        this.initializeElements();
        this.bindEvents();
        this.updateModeButton();
        document.body.classList.add('mode-measure');
        this.updateUI();
    }

    initializeElements() {
        this.elements = {
            zonesContainer: document.getElementById('gameZones'),
            gameZones: document.querySelectorAll('.game-zone'),
            zone1: document.getElementById('zone1'),
            zone2: document.getElementById('zone2'),
            zone3: document.getElementById('zone3'),
            gameText: document.getElementById('gameText'),
            startBtn: document.getElementById('startBtn'),
            resetBtn: document.getElementById('resetBtn'),
            modeSwitch: document.getElementById('modeSwitch'),
            currentTest: document.getElementById('currentTest'),
            testStatus: document.getElementById('testStatus'),
            resultsGrid: document.getElementById('resultsGrid'),
            finalResults: document.getElementById('finalResults'),
            averageTime: document.getElementById('averageTime'),
            rankingLevel: document.getElementById('rankingLevel'),
            rankingMessage: document.getElementById('rankingMessage')
        };
    }

    bindEvents() {
        // Start button
        this.elements.startBtn.addEventListener('click', () => this.startGame());
        
        // Reset button
        this.elements.resetBtn.addEventListener('click', () => this.resetGame());
        
        // Game zone clicks (mouse and touch)
        this.elements.gameZones.forEach(zone => {
            zone.addEventListener('click', (e) => this.handleGameZoneClick(e));
            zone.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.handleGameZoneClick(e);
            });
            zone.addEventListener('contextmenu', (e) => e.preventDefault());
        });

        // Mode switch button
        this.elements.modeSwitch.addEventListener('click', () => this.toggleMode());
    }

    toggleMode() {
        this.mode = this.mode === 'measure' ? 'train' : 'measure';
        document.body.classList.toggle('mode-measure', this.mode === 'measure');
        document.body.classList.toggle('mode-train', this.mode === 'train');
        this.resetGame();
    }

    updateModeButton() {
        if (this.mode === 'measure') {
            this.elements.modeSwitch.textContent = 'トレーニングモードへ';
        } else {
            this.elements.modeSwitch.textContent = '測定モードへ';
        }
    }

    startGame() {
        this.gameState.isGameActive = true;
        this.gameState.currentTest = 0;
        this.gameState.results = [];
        
        this.elements.startBtn.classList.add('hidden');
        this.elements.resetBtn.classList.remove('hidden');
        this.elements.finalResults.classList.add('hidden');
        this.elements.resultsGrid.innerHTML = '';
        
        this.startNextTest();
    }

    startNextTest() {
        if (this.gameState.currentTest >= this.gameData.settings.testCount) {
            this.endGame();
            return;
        }

        this.gameState.currentTest++;
        this.updateUI();
        
        // Set to waiting state
        this.gameState.isWaiting = true;
        this.gameState.isReady = false;
        
        if (this.mode === 'measure') {
            this.elements.zone1.className = 'game-zone waiting';
        } else {
            this.elements.gameZones.forEach(zone => {
                zone.className = 'game-zone waiting';
            });
        }
        this.elements.gameText.textContent = this.gameData.messages.waiting;
        this.elements.testStatus.textContent = `第${this.gameState.currentTest}回目の測定中...`;
        
        // Random wait time
        const waitTime = Math.random() * (this.gameData.settings.maxWaitTime - this.gameData.settings.minWaitTime) + this.gameData.settings.minWaitTime;
        
        this.gameState.waitTimeout = setTimeout(() => {
            this.startMeasurement();
        }, waitTime);
    }

    startMeasurement() {
        if (!this.gameState.isGameActive) return;
        
        this.gameState.isWaiting = false;
        this.gameState.isReady = true;
        this.gameState.startTime = performance.now();
        
        let idx = 0;
        if (this.mode === 'train') {
            idx = Math.floor(Math.random() * this.elements.gameZones.length);
        }
        this.gameState.activeZoneIndex = idx;

        if (this.mode === 'measure') {
            this.elements.zone1.className = 'game-zone ready pulse';
        } else {
            this.elements.gameZones.forEach((zone, i) => {
                if (i === idx) {
                    zone.className = 'game-zone ready pulse';
                } else {
                    zone.className = 'game-zone waiting';
                }
            });
        }
        this.elements.gameText.textContent = this.gameData.messages.ready;
        this.elements.testStatus.textContent = '今すぐクリック！';
    }

    handleGameZoneClick(event) {
        if (!this.gameState.isGameActive) return;
        
        event.preventDefault();
        
        if (this.gameState.isWaiting) {
            // Flying - clicked too early
            this.handleFlying();
        } else if (this.gameState.isReady) {
            const targetZone = this.mode === 'measure' ? this.elements.zone1 : this.elements.gameZones[this.gameState.activeZoneIndex];
            if (event.currentTarget === targetZone) {
                // Valid click - measure reaction time
                this.measureReactionTime();
            } else {
                // Wrong zone clicked
                this.handleFlying();
            }
        }
    }

    handleFlying() {
        clearTimeout(this.gameState.waitTimeout);
        
        if (this.mode === 'measure') {
            this.elements.zone1.className = 'game-zone flying';
        } else {
            this.elements.gameZones.forEach(zone => {
                zone.className = 'game-zone flying';
            });
        }
        this.elements.gameText.textContent = this.gameData.messages.tooSoon;
        this.elements.testStatus.textContent = 'フライング！次の測定に進みます...';
        
        // Record flying result
        this.gameState.results.push({
            test: this.gameState.currentTest,
            time: null,
            flying: true
        });
        
        this.addResultToGrid(this.gameState.currentTest, null, true);

        this.gameState.isReady = false;
        this.gameState.activeZoneIndex = null;

        // Continue to next test after delay
        setTimeout(() => {
            this.startNextTest();
        }, 2000);
    }

    measureReactionTime() {
        const reactionTime = Math.round(performance.now() - this.gameState.startTime);
        
        if (this.mode === 'measure') {
            this.elements.zone1.className = 'game-zone neutral fade-in';
        } else {
            this.elements.gameZones.forEach(zone => {
                zone.className = 'game-zone neutral fade-in';
            });
        }
        this.elements.gameText.textContent = `${reactionTime}ms`;
        this.elements.testStatus.textContent = this.getRankingForTime(reactionTime).message;
        
        // Record result
        this.gameState.results.push({
            test: this.gameState.currentTest,
            time: reactionTime,
            flying: false
        });
        
        this.addResultToGrid(this.gameState.currentTest, reactionTime, false);

        this.gameState.isReady = false;
        this.gameState.activeZoneIndex = null;
        
        // Continue to next test after delay
        setTimeout(() => {
            this.startNextTest();
        }, 2000);
    }

    addResultToGrid(testNumber, time, flying) {
        const resultItem = document.createElement('div');
        resultItem.className = `result-item fade-in ${flying ? 'flying' : ''}`;
        
        const resultNumber = document.createElement('div');
        resultNumber.className = 'result-number';
        resultNumber.textContent = `第${testNumber}回`;
        
        const resultTime = document.createElement('div');
        resultTime.className = `result-time ${flying ? 'flying' : ''}`;
        resultTime.textContent = flying ? 'フライング' : `${time}ms`;
        
        resultItem.appendChild(resultNumber);
        resultItem.appendChild(resultTime);
        this.elements.resultsGrid.appendChild(resultItem);
    }

    endGame() {
        this.gameState.isGameActive = false;
        
        if (this.mode === 'measure') {
            this.elements.zone1.className = 'game-zone neutral';
        } else {
            this.elements.gameZones.forEach(zone => {
                zone.className = 'game-zone neutral';
            });
        }
        this.elements.gameText.textContent = this.gameData.messages.completed;
        this.elements.testStatus.textContent = '全ての測定が完了しました！';
        
        this.calculateAndDisplayResults();
    }

    calculateAndDisplayResults() {
        // Filter out flying results
        const validResults = this.gameState.results.filter(result => !result.flying);
        
        if (validResults.length === 0) {
            this.elements.averageTime.textContent = '-';
            this.elements.rankingLevel.textContent = '測定結果なし';
            this.elements.rankingMessage.textContent = 'フライングが多すぎました。再挑戦してみてください。';
        } else {
            const totalTime = validResults.reduce((sum, result) => sum + result.time, 0);
            const averageTime = Math.round(totalTime / validResults.length);
            
            this.elements.averageTime.textContent = averageTime;
            
            const ranking = this.getRankingForTime(averageTime);
            this.elements.rankingLevel.textContent = ranking.level;
            this.elements.rankingLevel.className = `ranking-level ${ranking.className}`;
            this.elements.rankingMessage.textContent = ranking.message;
        }
        
        this.elements.finalResults.classList.remove('hidden');
        this.elements.finalResults.classList.add('fade-in');
    }

    getRankingForTime(time) {
        for (const ranking of this.gameData.rankings) {
            if (time <= ranking.maxTime) {
                return ranking;
            }
        }
        return this.gameData.rankings[this.gameData.rankings.length - 1];
    }

    resetGame() {
        // Clear any pending timeouts
        if (this.gameState.waitTimeout) {
            clearTimeout(this.gameState.waitTimeout);
        }
        
        // Reset game state
        this.gameState = {
            currentTest: 0,
            results: [],
            isWaiting: false,
            isReady: false,
            isGameActive: false,
            startTime: 0,
            waitTimeout: null,
            activeZoneIndex: null
        };
        
        // Reset UI
        this.elements.startBtn.classList.remove('hidden');
        this.elements.resetBtn.classList.add('hidden');
        this.elements.finalResults.classList.add('hidden');
        this.elements.resultsGrid.innerHTML = '';
        
        if (this.mode === 'measure') {
            this.elements.zone1.className = 'game-zone neutral';
        } else {
            this.elements.gameZones.forEach(zone => {
                zone.className = 'game-zone neutral';
            });
        }
        this.elements.gameText.textContent = '準備はいいですか？';

        this.updateModeButton();
        
        this.updateUI();
    }

    updateUI() {
        this.elements.currentTest.textContent = this.gameState.currentTest;
        
        if (!this.gameState.isGameActive) {
            this.elements.testStatus.textContent = 'スタートボタンを押してください';
        }
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new ReactionTimeGame();
});

// Prevent zooming on double tap for mobile devices
document.addEventListener('touchstart', function(event) {
    if (event.touches.length > 1) {
        event.preventDefault();
    }
}, {passive: false});

let lastTouchEnd = 0;
document.addEventListener('touchend', function(event) {
    const now = (new Date()).getTime();
    if (now - lastTouchEnd <= 300) {
        event.preventDefault();
    }
    lastTouchEnd = now;
}, false);
