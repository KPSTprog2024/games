// js/uiManager.js

import { gameEventEmitter } from './eventEmitter.js';
import { GAME_STATES, GAME_MODES, COUNTDOWN_TIME, DIFFICULTY_SETTINGS } from './constants.js';

export class UIManager {
    constructor() {
        this.topPage = document.getElementById('topPage');
        this.gameScreen = document.getElementById('gameScreen');
        this.gameContainer = document.getElementById('gameContainer');
        this.gridContainer = document.getElementById('gridContainer');
        this.stageNumberSpan = document.getElementById('stageNumber');
        this.messageDiv = document.getElementById('message');
        this.startButton = document.getElementById('startButton');
        this.modeButton = document.getElementById('modeButton');
        this.replayButton = document.getElementById('replayButton');
        this.resetButton = document.getElementById('resetButton');
        this.startGameButton = document.getElementById('startGameButton');
        this.difficultyRadios = document.querySelectorAll('input[name="difficulty"]');
        this.countdownOverlay = document.getElementById('countdown');
        this.countdownNumberSpan = this.countdownOverlay.querySelector('.countdown-number');
        this.rankingList = document.getElementById('rankingList');
        this.resetRankingButton = document.getElementById('resetRankingButton');

        this.initGrid();
        this.setupEventListeners();
        this.subscribeToEvents();
    }

    // 9個のマスを生成
    initGrid() {
        this.gridContainer.innerHTML = ''; // 既存のマスをクリア
        for (let i = 0; i < 9; i++) {
            const cell = document.createElement('div');
            cell.classList.add('gridItem');
            cell.dataset.index = i.toString();
            this.gridContainer.appendChild(cell);
        }
    }

    // UI要素のイベントリスナーを設定
    setupEventListeners() {
        // マスのクリックイベント
        this.gridContainer.addEventListener('click', (e) => {
            const cell = e.target.closest('.gridItem');
            if (cell) {
                const index = parseInt(cell.dataset.index, 10);
                gameEventEmitter.emit('gridCellClicked', index);
            }
        });

        // ボタンのクリックイベント
        this.startButton.addEventListener('click', () => gameEventEmitter.emit('startButtonClicked'));
        this.modeButton.addEventListener('click', () => gameEventEmitter.emit('modeButtonClicked'));
        this.replayButton.addEventListener('click', () => gameEventEmitter.emit('replayButtonClicked'));
        this.resetButton.addEventListener('click', () => gameEventEmitter.emit('resetButtonClicked'));
        this.startGameButton.addEventListener('click', () => gameEventEmitter.emit('startGameButtonClicked'));
        this.resetRankingButton.addEventListener('click', () => gameEventEmitter.emit('resetRankingButtonClicked'));

        // 難易度ラジオボタンの変更イベント
        this.difficultyRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                gameEventEmitter.emit('difficultyChanged', parseInt(e.target.value, 10));
            });
        });
    }

    // イベントエミッタからのイベント購読
    subscribeToEvents() {
        gameEventEmitter.on('showTopPage', (message) => this.showTopPage(message));
        gameEventEmitter.on('hideTopPage', () => this.hideTopPage());
        gameEventEmitter.on('setMessage', (message) => this.setMessage(message));
        gameEventEmitter.on('updateStageDisplay', (stageNum) => this.updateStageDisplay(stageNum));
        gameEventEmitter.on('updateModeButton', (mode) => this.updateModeButton(mode));
        gameEventEmitter.on('highlightCell', (index, duration) => this.highlightCell(index, duration));
        gameEventEmitter.on('cellCorrect', (index) => this.animateCellCorrect(index));
        gameEventEmitter.on('cellIncorrect', (index) => this.animateCellIncorrect(index));
        gameEventEmitter.on('startCountdown', () => this.startCountdown());
        gameEventEmitter.on('stopCountdown', () => this.stopCountdown());
        gameEventEmitter.on('setControlsEnabled', (enabled, except = []) => this.setControlsEnabled(enabled, except));
        gameEventEmitter.on('setReplayButtonVisible', (visible) => this.setReplayButtonVisible(visible));
        gameEventEmitter.on('updateRankingList', (ranking) => this.updateRankingList(ranking));
        gameEventEmitter.on('setDifficultySelection', (difficulty) => this.setDifficultySelection(difficulty));
        gameEventEmitter.on('stageClearedAnimation', () => this.playStageClearedAnimation());
    }

    showTopPage(message) {
        this.topPage.classList.remove('hidden');
        this.gameScreen.classList.add('hidden');
        if (message) {
            this.setMessage(message); // トップページでメッセージを表示する場合
        }
    }

    hideTopPage() {
        this.topPage.classList.add('hidden');
        this.gameScreen.classList.remove('hidden');
    }

    setMessage(message) {
        this.messageDiv.textContent = message;
    }

    updateStageDisplay(stageNum) {
        this.stageNumberSpan.textContent = stageNum.toString();
    }

    updateModeButton(mode) {
        this.modeButton.textContent = mode === GAME_MODES.ONCE ? 'もーど：いちどだけ' : 'もーど：なんどもOK';
    }

    highlightCell(index, duration) {
        const cell = this.gridContainer.querySelector(`.gridItem[data-index="${index}"]`);
        if (!cell) return;
        cell.classList.add('active');
        setTimeout(() => {
            cell.classList.remove('active');
        }, duration);
    }

    animateCellCorrect(index) {
        const cell = this.gridContainer.querySelector(`.gridItem[data-index="${index}"]`);
        if (!cell) return;
        cell.classList.add('correct');
        // 短時間でクラスを削除し、次のアニメーションを可能にする
        setTimeout(() => {
            cell.classList.remove('correct');
        }, 300); // CSSアニメーションの時間に合わせる
    }

    animateCellIncorrect(index) {
        const cell = this.gridContainer.querySelector(`.gridItem[data-index="${index}"]`);
        if (!cell) return;
        cell.classList.add('incorrect');
        // 短時間でクラスを削除
        setTimeout(() => {
            cell.classList.remove('incorrect');
        }, 500); // CSSアニメーションの時間に合わせる
    }

    // カウントダウン表示の制御
    startCountdown() {
        this.countdownOverlay.classList.remove('hidden');
        let count = COUNTDOWN_TIME;
        this.countdownNumberSpan.textContent = count.toString();
        
        const countdownInterval = setInterval(() => {
            count--;
            if (count > 0) {
                this.countdownNumberSpan.textContent = count.toString();
            } else if (count === 0) {
                this.countdownNumberSpan.textContent = 'すたーと！';
            } else {
                clearInterval(countdownInterval);
                this.countdownOverlay.classList.add('hidden');
                gameEventEmitter.emit('countdownFinished'); // カウントダウン終了を通知
            }
        }, 1000);
    }

    stopCountdown() {
        // カウントダウンを強制的に非表示にする場合
        this.countdownOverlay.classList.add('hidden');
    }

    // コントロールボタンの有効/無効を切り替える
    setControlsEnabled(enabled, except = []) {
        const buttons = [this.startButton, this.modeButton, this.resetButton, this.startGameButton, this.resetRankingButton, this.replayButton];
        buttons.forEach(button => {
            if (button && !except.includes(button.id)) {
                button.disabled = !enabled;
            }
        });
    }

    // 「もう一度」ボタンの表示/非表示を切り替える
    setReplayButtonVisible(visible) {
        if (visible) {
            this.replayButton.classList.remove('hidden');
        } else {
            this.replayButton.classList.add('hidden');
        }
    }

    // ランキングリストを更新
    updateRankingList(ranking) {
        if (!this.rankingList) return;
        this.rankingList.innerHTML = ''; // 既存のリストをクリア

        if (ranking.length === 0) {
            const li = document.createElement('li');
            li.textContent = 'まだきろくがないよ';
            this.rankingList.appendChild(li);
            return;
        }

        ranking.forEach((record, index) => {
            const li = document.createElement('li');
            const modeName = DIFFICULTY_SETTINGS[record.difficulty] ? DIFFICULTY_SETTINGS[record.difficulty].name : '不明';
            const modeText = record.mode === GAME_MODES.ONCE ? 'いちどだけ' : 'なんどもOK';
            li.innerHTML = `
                <span>${index + 1}い：すてーじ ${record.stage}</span>
                <span class="text-sm text-gray-500">(${modeName} / ${modeText})</span>
            `;
            this.rankingList.appendChild(li);
        });
    }

    // 難易度選択ラジオボタンの状態を更新
    setDifficultySelection(difficulty) {
        this.difficultyRadios.forEach(radio => {
            if (parseInt(radio.value, 10) === difficulty) {
                radio.checked = true;
            } else {
                radio.checked = false;
            }
        });
    }

    // ステージクリア時のアニメーション演出
    playStageClearedAnimation() {
        // 例えば、グリッド全体を揺らす、背景色を変えるなど
        this.gameContainer.classList.add('animate__animated', 'animate__pulse'); // animate.css の例
        setTimeout(() => {
            this.gameContainer.classList.remove('animate__animated', 'animate__pulse');
        }, 1000); // アニメーション時間に合わせて調整
        
        // 紙吹雪やキラキラのエフェクトをCSSや別のライブラリで追加するのもあり
        // 例: document.body.classList.add('confetti-effect');
        // setTimeout(() => document.body.classList.remove('confetti-effect'), 2000);
    }
}
