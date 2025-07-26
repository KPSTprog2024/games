// js/rankingManager.js

import { gameEventEmitter } from './eventEmitter.js';
import { GAME_MODES, DEFAULT_DIFFICULTY } from './constants.js';

const RANKING_STORAGE_KEY = 'memoryGame_ranking';
const MAX_RANKING_RECORDS = 10; // ランキングに保持する最大件数

export class RankingManager {
    constructor() {
        this.ranking = this.loadRanking();
        this.subscribeToEvents();
    }

    // イベントエミッタからのイベント購読
    subscribeToEvents() {
        // UIが初期化されたら現在のランキングを表示させるイベント
        gameEventEmitter.on('uiReady', () => this.publishCurrentRanking());
        // ランキングリセットボタンが押されたらリセットするイベント
        gameEventEmitter.on('resetRankingButtonClicked', () => this.resetRanking());
    }

    // ローカルストレージからランキングデータを読み込む
    loadRanking() {
        try {
            const data = localStorage.getItem(RANKING_STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error('Failed to load ranking from localStorage:', e);
            return [];
        }
    }

    // ランキングデータをローカルストレージに保存する
    saveRanking() {
        try {
            localStorage.setItem(RANKING_STORAGE_KEY, JSON.stringify(this.ranking));
        } catch (e) {
            console.error('Failed to save ranking to localStorage:', e);
        }
    }

    /**
     * 新しい記録をランキングに追加します。
     * @param {object} record - 記録オブジェクト（例: { stage: 5, mode: 'once', difficulty: 2 }）
     */
    addRecord(record) {
        // ランキングレコードのバリデーション
        if (typeof record.stage !== 'number' || record.stage < 1 ||
            !Object.values(GAME_MODES).includes(record.mode) ||
            typeof record.difficulty !== 'number' || record.difficulty < 1) {
            console.warn('Invalid ranking record:', record);
            return;
        }

        this.ranking.push(record);
        // ステージ数が多い順にソート
        this.ranking.sort((a, b) => b.stage - a.stage);
        // 上位N件のみ保持
        this.ranking = this.ranking.slice(0, MAX_RANKING_RECORDS);
        this.saveRanking();
        this.publishCurrentRanking(); // ランキング更新をUIに通知
    }

    // 現在のランキングデータを取得する
    getRanking() {
        return this.ranking;
    }

    // ランキングをリセットする
    resetRanking() {
        this.ranking = [];
        this.saveRanking();
        gameEventEmitter.emit('setMessage', 'らんきんぐをりせっとしたよ');
        this.publishCurrentRanking(); // ランキング更新をUIに通知
    }

    // 現在のランキングをUIに通知する
    publishCurrentRanking() {
        gameEventEmitter.emit('updateRankingList', this.ranking);
    }
}
