// js/gameStates.js

import { GAME_STATES, MESSAGES } from './constants.js';
import { gameEventEmitter } from './eventEmitter.js';

/**
 * GameStateの抽象基底クラス。
 * 各ゲームの状態はこのクラスを継承します。
 */
export class GameState {
    constructor(game) {
        this.game = game; // GameControllerインスタンスへの参照
    }

    /**
     * この状態に入ったときに呼ばれます。
     */
    enter() {
        // デフォルトの実装では何もしない
    }

    /**
     * この状態を終了するときに呼ばれます。
     */
    exit() {
        // デフォルトの実装では何もしない
    }

    /**
     * ユーザー入力（マスのクリックなど）を処理します。
     * @param {number} index - クリックされたマスのインデックス。
     */
    handleInput(index) {
        // デフォルトの実装では何もしない
    }

    /**
     * 状態を更新します（時間の経過など）。
     * @param {number} deltaTime - 前回の更新からの経過時間。
     */
    update(deltaTime) {
        // デフォルトの実装では何もしない
    }
}

/**
 * ゲーム開始前の準備状態。トップページ表示。
 */
export class ReadyState extends GameState {
    enter() {
        console.log("Entering ReadyState");
        gameEventEmitter.emit('gameStateChanged', GAME_STATES.READY);
        gameEventEmitter.emit('showTopPage', MESSAGES.WELCOME_TOP);
        // 必要に応じて他の初期UI設定
    }

    exit() {
        console.log("Exiting ReadyState");
        gameEventEmitter.emit('hideTopPage');
    }

    // ReadyStateではマスのクリックなどのゲーム内入力は処理しない
    handleInput(index) {
        // 何もしない
    }
}

/**
 * シーケンス再生中の状態。
 */
export class PlayingSequenceState extends GameState {
    constructor(game, sequence) {
        super(game);
        this.sequence = sequence;
        this.currentHighlightIndex = 0;
        this.lastHighlightTime = 0;
        this.highlightingCell = false;
        this.countdownStarted = false;
    }

    enter() {
        console.log("Entering PlayingSequenceState");
        gameEventEmitter.emit('gameStateChanged', GAME_STATES.PLAYING_SEQUENCE);
        gameEventEmitter.emit('setMessage', MESSAGES.START[Math.floor(Math.random() * MESSAGES.START.length)]);
        gameEventEmitter.emit('setControlsEnabled', false); // ゲーム中はボタン無効化

        // カウントダウン開始
        gameEventEmitter.emit('startCountdown');
        this.countdownStarted = true;
    }

    exit() {
        console.log("Exiting PlayingSequenceState");
        gameEventEmitter.emit('stopCountdown');
    }

    update(deltaTime) {
        // カウントダウンが終了していない場合は、まだシーケンスを再生しない
        if (!this.countdownStarted || this.game.countdownActive) {
            return;
        }

        if (this.currentHighlightIndex < this.sequence.length) {
            this.lastHighlightTime += deltaTime;

            const highlightDuration = this.game.getDifficultySetting().highlightDuration;
            const intervalDuration = this.game.getDifficultySetting().intervalDuration;

            // マスを光らせるフェーズ
            if (!this.highlightingCell && this.lastHighlightTime >= 0) { // 最初のマスはすぐに光らせる
                const cellIndex = this.sequence[this.currentHighlightIndex];
                gameEventEmitter.emit('highlightCell', cellIndex, highlightDuration);
                gameEventEmitter.emit('playHighlightSound');
                this.highlightingCell = true;
                this.lastHighlightTime = 0; // ハイライト開始時間をリセット
            }
            // マスが光り終わって次のマスまでの待機フェーズ
            else if (this.highlightingCell && this.lastHighlightTime >= highlightDuration) {
                this.highlightingCell = false;
                this.currentHighlightIndex++;
                this.lastHighlightTime = -(intervalDuration - highlightDuration); // 次のマスまでの待機時間を設定
            }
        } else {
            // シーケンス再生終了
            this.game.changeState(new PlayerTurnState(this.game));
        }
    }
}

/**
 * プレイヤーがマスをクリックする状態。
 */
export class PlayerTurnState extends GameState {
    constructor(game) {
        super(game);
        this.playerSequence = [];
        this.expectedIndex = 0;
    }

    enter() {
        console.log("Entering PlayerTurnState");
        gameEventEmitter.emit('gameStateChanged', GAME_STATES.PLAYER_TURN);
        gameEventEmitter.emit('setMessage', MESSAGES.YOUR_TURN[Math.floor(Math.random() * MESSAGES.YOUR_TURN.length)]);
        gameEventEmitter.emit('setReplayButtonVisible', true); // もう一度ボタンを表示
        gameEventEmitter.emit('setControlsEnabled', true, ['modeButton', 'resetButton', 'replayButton']); // モード、リセット、リプレイボタンは有効
    }

    exit() {
        console.log("Exiting PlayerTurnState");
        gameEventEmitter.emit('setReplayButtonVisible', false); // もう一度ボタンを非表示
    }

    handleInput(index) {
        if (index === this.game.currentSequence[this.expectedIndex]) {
            // 正解
            gameEventEmitter.emit('cellCorrect', index);
            this.expectedIndex++;
            gameEventEmitter.emit('playSuccessSoundPart'); // 正解音の一部を再生

            if (this.expectedIndex === this.game.currentSequence.length) {
                // シーケンス全て正解、ステージクリア
                gameEventEmitter.emit('setMessage', MESSAGES.SUCCESS[Math.floor(Math.random() * MESSAGES.SUCCESS.length)]);
                gameEventEmitter.emit('playSuccessSound'); // 全ての正解音を再生
                this.game.stageCleared();
                // ステージクリア後の状態に遷移
                this.game.changeState(new StageClearedState(this.game));
            }
        } else {
            // 不正解
            gameEventEmitter.emit('cellIncorrect', index);
            gameEventEmitter.emit('setMessage', MESSAGES.FAIL[Math.floor(Math.random() * MESSAGES.FAIL.length)]);
            gameEventEmitter.emit('playFailSound'); // 失敗音を再生
            this.game.gameOver();
            // ゲームオーバー状態に遷移
            this.game.changeState(new GameOverState(this.game));
        }
    }
}

/**
 * ステージクリア後の状態。
 */
export class StageClearedState extends GameState {
    enter() {
        console.log("Entering StageClearedState");
        gameEventEmitter.emit('gameStateChanged', GAME_STATES.STAGE_CLEARED);
        gameEventEmitter.emit('showSequenceNumbers', this.game.currentSequence);
        // 「つぎへ」ボタンを表示し、操作はプレイヤーに任せる
        gameEventEmitter.emit('setNextButtonVisible', true);
        gameEventEmitter.emit('setBackButtonVisible', false);
        gameEventEmitter.emit('setControlsEnabled', false, ['nextButton']);
    }

    exit() {
        gameEventEmitter.emit('clearSequenceNumbers');
        gameEventEmitter.emit('setNextButtonVisible', false);
        gameEventEmitter.emit('setBackButtonVisible', false);
        gameEventEmitter.emit('setControlsEnabled', true);
    }
}

/**
 * ゲームオーバーの状態。
 */
export class GameOverState extends GameState {
    enter() {
        console.log("Entering GameOverState");
        gameEventEmitter.emit('gameStateChanged', GAME_STATES.GAME_OVER);
        gameEventEmitter.emit('showSequenceNumbers', this.game.currentSequence);
        // 「さいしょにもどる」ボタンを表示し、待機
        gameEventEmitter.emit('setBackButtonVisible', true);
        gameEventEmitter.emit('setNextButtonVisible', false);
        gameEventEmitter.emit('setControlsEnabled', false, ['backButton']);
    }

    exit() {
        gameEventEmitter.emit('clearSequenceNumbers');
        gameEventEmitter.emit('setNextButtonVisible', false);
        gameEventEmitter.emit('setBackButtonVisible', false);
        gameEventEmitter.emit('setControlsEnabled', true);
    }
}
