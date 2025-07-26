// js/main.js

import { UIManager } from './uiManager.js';
import { SoundManager } from './soundManager.js';
import { RankingManager } from './rankingManager.js';
import { gameEventEmitter } from './eventEmitter.js';
import { ReadyState, PlayingSequenceState, PlayerTurnState, StageClearedState, GameOverState } from './gameStates.js';
import {
    GAME_STATES, MESSAGES, DIFFICULTY_SETTINGS,
    SOUND_FREQUENCIES, SOUND_DURATIONS, COUNTDOWN_TIME,
    STAGE_CLEARED_DELAY, RESET_DELAY, DEFAULT_DIFFICULTY,
    GRID_SIZE, GAME_MODES
} from './constants.js';

class GameController {
    constructor() {
        this.uiManager = new UIManager();
        this.soundManager = new SoundManager();
        this.rankingManager = new RankingManager();

        this.currentState = null;
        this.currentSequence = [];
        this.gameLoopId = null;
        this.lastFrameTime = 0;
        this.countdownActive = false;
        this.countdownTimer = 0; // カウントダウンの残り時間（秒）

        // ゲーム状態の管理
        this.mode = localStorage.getItem('memoryGame_mode') || GAME_MODES.ONCE;
        this.stageOnce = parseInt(localStorage.getItem('memoryGame_stageOnce') || '1', 10);
        this.stageRepeat = parseInt(localStorage.getItem('memoryGame_stageRepeat') || '1', 10);
        this.currentDifficulty = parseInt(localStorage.getItem('memoryGame_difficulty') || DEFAULT_DIFFICULTY, 10);

        this.setupEventListeners();
        this.changeState(new ReadyState(this)); // 初期状態をセット
        this.gameLoop(); // ゲームループを開始
    }

    // ゲームループ
    gameLoop(currentTime = 0) {
        if (!this.lastFrameTime) {
            this.lastFrameTime = currentTime;
        }
        const deltaTime = currentTime - this.lastFrameTime;
        this.lastFrameTime = currentTime;

        // 現在の状態のupdateメソッドを呼び出す
        if (this.currentState && typeof this.currentState.update === 'function') {
            this.currentState.update(deltaTime);
        }

        this.gameLoopId = requestAnimationFrame(this.gameLoop.bind(this));
    }

    // イベントリスナーの設定
    setupEventListeners() {
        // UIからのイベント購読
        gameEventEmitter.on('startGameButtonClicked', () => this.startGame());
        gameEventEmitter.on('startButtonClicked', () => this.startGame()); // ゲーム画面からのスタート
        gameEventEmitter.on('modeButtonClicked', () => this.toggleMode());
        gameEventEmitter.on('replayButtonClicked', () => this.replaySequence());
        gameEventEmitter.on('resetButtonClicked', () => this.resetGame());
        gameEventEmitter.on('resetRankingButtonClicked', () => this.rankingManager.resetRanking());
        gameEventEmitter.on('difficultyChanged', (difficulty) => this.setDifficulty(difficulty));
        gameEventEmitter.on('gridCellClicked', (index) => {
            if (this.currentState && typeof this.currentState.handleInput === 'function') {
                this.currentState.handleInput(index);
            }
        });
        gameEventEmitter.on('countdownFinished', () => {
            this.countdownActive = false;
            // カウントダウン終了後、PlayingSequenceStateのupdateがシーケンス再生を開始
        });

        // 初期UI設定をイベントでトリガー
        gameEventEmitter.on('gameStateChanged', (state) => {
            this.updateDisplay(); // ステージ番号、モード表示などを更新
        });

        // UIマネージャーが完全に初期化されたらランキングを表示させる
        // DOMContentLoaded後にuiManagerが初期化されるので、少し遅延させる
        document.addEventListener('DOMContentLoaded', () => {
            this.uiManager.updateRankingList(this.rankingManager.getRanking());
            this.uiManager.setDifficultySelection(this.currentDifficulty); // 選択状態を反映
            gameEventEmitter.emit('uiReady'); // UIManagerに準備完了を通知
        });
    }

    // 状態を切り替える
    changeState(newState) {
        if (this.currentState && typeof this.currentState.exit === 'function') {
            this.currentState.exit();
        }
        this.currentState = newState;
        if (this.currentState && typeof this.currentState.enter === 'function') {
            this.currentState.enter();
        }
    }

    // ゲーム開始処理
    startGame() {
        if (this.currentState instanceof PlayingSequenceState || this.currentState instanceof PlayerTurnState) {
            return; // 既にゲーム中の場合は何もしない
        }
        this.countdownActive = true;
        this.countdownTimer = COUNTDOWN_TIME;
        gameEventEmitter.emit('clearSequenceNumbers');

        // 現在のステージに応じてシーケンスの長さを決定
        const currentStage = this.mode === GAME_MODES.ONCE ? this.stageOnce : this.stageRepeat;
        const length = currentStage + 1; // ステージ1なら2マス、ステージ2なら3マス

        this.currentSequence = this.generateSequence(length, this.mode);
        this.changeState(new PlayingSequenceState(this, this.currentSequence));
        gameEventEmitter.emit('setMessage', MESSAGES.START[Math.floor(Math.random() * MESSAGES.START.length)]);
    }

    // シーケンスを生成
    generateSequence(length, mode) {
        const seq = [];
        if (mode === GAME_MODES.ONCE) {
            const available = Array.from({ length: GRID_SIZE }, (_, idx) => idx);
            for (let i = 0; i < length; i++) {
                const rand = Math.floor(Math.random() * available.length);
                seq.push(available[rand]);
                available.splice(rand, 1);
            }
        } else { // 'repeat' mode
            for (let i = 0; i < length; i++) {
                seq.push(Math.floor(Math.random() * GRID_SIZE));
            }
        }
        return seq;
    }

    // モード切り替え
    toggleMode() {
        if (this.currentState instanceof PlayingSequenceState || this.currentState instanceof PlayerTurnState) {
            return; // ゲーム中は切り替えられない
        }
        this.mode = this.mode === GAME_MODES.ONCE ? GAME_MODES.REPEAT : GAME_MODES.ONCE;
        localStorage.setItem('memoryGame_mode', this.mode);
        this.updateDisplay();
        gameEventEmitter.emit('setMessage', `もーどを「${this.mode === GAME_MODES.ONCE ? 'いちどだけ' : 'なんどもOK'}」にきりかえたよ`);
    }

    // 「もう一度」ボタンでシーケンスを再プレイ
    replaySequence() {
        if (this.currentSequence.length > 0) {
            this.changeState(new PlayingSequenceState(this, this.currentSequence));
            gameEventEmitter.emit('setMessage', MESSAGES.START[Math.floor(Math.random() * MESSAGES.START.length)]);
            gameEventEmitter.emit('setControlsEnabled', false); // 再生中はボタン無効化
        } else {
            gameEventEmitter.emit('setMessage', 'まずはげーむをすたーとしてね');
        }
    }

    // ゲームのリセット
    resetGame() {
        if (this.currentState instanceof PlayingSequenceState) {
            return; // ゲーム中はリセット不可
        }
        gameEventEmitter.emit('clearSequenceNumbers');
        this.stageOnce = 1;
        this.stageRepeat = 1;
        localStorage.setItem('memoryGame_stageOnce', this.stageOnce.toString());
        localStorage.setItem('memoryGame_stageRepeat', this.stageRepeat.toString());
        gameEventEmitter.emit('setMessage', 'げーむをりせっとしたよ');
        this.updateDisplay();
        this.changeState(new ReadyState(this)); // Ready状態に戻る
    }

    // ステージクリア処理
    stageCleared() {
        const currentStage = this.mode === GAME_MODES.ONCE ? this.stageOnce : this.stageRepeat;
        this.rankingManager.addRecord({
            stage: currentStage,
            mode: this.mode,
            difficulty: this.currentDifficulty
        });

        if (this.mode === GAME_MODES.ONCE) {
            this.stageOnce++;
            localStorage.setItem('memoryGame_stageOnce', this.stageOnce.toString());
        } else {
            this.stageRepeat++;
            localStorage.setItem('memoryGame_stageRepeat', this.stageRepeat.toString());
        }
        this.updateDisplay(); // ステージ数を更新
        gameEventEmitter.emit('stageClearedAnimation'); // クリア時のアニメーション
    }

    // ゲームオーバー処理
    gameOver() {
        // 必要に応じてゲームオーバー時のUIやデータの処理
        // ステージ数は更新しない (コンティニューしないため)
    }

    // 表示を更新
    updateDisplay() {
        const currentStage = this.mode === GAME_MODES.ONCE ? this.stageOnce : this.stageRepeat;
        this.uiManager.updateStageDisplay(currentStage);
        this.uiManager.updateModeButton(this.mode);
    }

    // 難易度を設定
    setDifficulty(difficulty) {
        this.currentDifficulty = difficulty;
        localStorage.setItem('memoryGame_difficulty', this.currentDifficulty.toString());
        this.uiManager.setDifficultySelection(this.currentDifficulty); // UIに選択状態を反映
        gameEventEmitter.emit('setMessage', `なんいどを「${DIFFICULTY_SETTINGS[difficulty].name}」にきりかえたよ`);
    }

    // 現在の難易度設定を取得
    getDifficultySetting() {
        return DIFFICULTY_SETTINGS[this.currentDifficulty] || DIFFICULTY_SETTINGS[DEFAULT_DIFFICULTY];
    }
}

// DOMが完全に読み込まれた後にゲームを開始
document.addEventListener('DOMContentLoaded', () => {
    new GameController();
});
