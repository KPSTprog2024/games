// js/eventEmitter.js

/**
 * シンプルなイベントエミッタの実装。
 * イベントの購読 (on)、発行 (emit)、購読解除 (off) を提供します。
 */
export class EventEmitter {
    constructor() {
        this.listeners = {};
    }

    /**
     * イベントリスナーを登録します。
     * @param {string} eventName - イベントの名前。
     * @param {function} listener - イベント発生時に呼び出される関数。
     */
    on(eventName, listener) {
        if (!this.listeners[eventName]) {
            this.listeners[eventName] = [];
        }
        this.listeners[eventName].push(listener);
    }

    /**
     * イベントを発行し、登録されている全てのリスナーを呼び出します。
     * @param {string} eventName - 発行するイベントの名前。
     * @param {any[]} args - リスナー関数に渡す引数。
     */
    emit(eventName, ...args) {
        if (this.listeners[eventName]) {
            this.listeners[eventName].forEach(listener => {
                listener(...args);
            });
        }
    }

    /**
     * イベントリスナーを解除します。
     * @param {string} eventName - イベントの名前。
     * @param {function} listener - 解除するイベントリスナー関数。
     */
    off(eventName, listener) {
        if (this.listeners[eventName]) {
            this.listeners[eventName] = this.listeners[eventName].filter(
                (l) => l !== listener
            );
        }
    }
}

// ゲーム全体で共有するイベントエミッタのインスタンス
export const gameEventEmitter = new EventEmitter();
