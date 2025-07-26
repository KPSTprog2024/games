// js/soundManager.js

import { gameEventEmitter } from './eventEmitter.js';
import { SOUND_FREQUENCIES, SOUND_DURATIONS } from './constants.js';

export class SoundManager {
    constructor() {
        this.audioContext = null;
        this.initAudioContext();
        this.subscribeToEvents();
    }

    // AudioContextの初期化（ユーザーインタラクションが必要な場合があるため遅延初期化）
    initAudioContext() {
        if (!this.audioContext) {
            try {
                // SafariなどWebKit系ブラウザ対応
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                // ユーザーインタラクションでresumeする
                document.body.addEventListener('click', this.resumeAudioContext.bind(this), { once: true });
                document.body.addEventListener('touchend', this.resumeAudioContext.bind(this), { once: true });
            } catch (e) {
                console.warn('Web Audio API is not supported in this browser.', e);
                this.audioContext = null; // サポートされない場合はnullに
            }
        }
    }

    // AudioContextをresumeする
    resumeAudioContext() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume().then(() => {
                console.log('AudioContext resumed successfully');
            }).catch(e => {
                console.error('Failed to resume AudioContext:', e);
            });
        }
    }

    // イベントエミッタからのイベント購読
    subscribeToEvents() {
        gameEventEmitter.on('playHighlightSound', () => this.playHighlightSound());
        gameEventEmitter.on('playSuccessSoundPart', () => this.playSuccessSoundPart());
        gameEventEmitter.on('playSuccessSound', () => this.playSuccessSound());
        gameEventEmitter.on('playFailSound', () => this.playFailSound());
    }

    /**
     * 指定された周波数と持続時間でビープ音を再生します。
     * @param {number} frequency - 音の周波数 (Hz)。
     * @param {number} duration - 音の持続時間 (ms)。
     * @param {number} volume - 音量 (0.0 から 1.0)。
     */
    playTone(frequency, duration, volume = 0.1) {
        if (!this.audioContext) {
            // AudioContextが利用できない場合は何もしない
            return;
        }

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.frequency.value = frequency;
        oscillator.type = 'square'; // 正方形波

        gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);

        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + duration / 1000); // 秒単位に変換
    }

    // マスが光る時の音
    playHighlightSound() {
        this.playTone(SOUND_FREQUENCIES.HIGHLIGHT_TONE, SOUND_DURATIONS.SHORT, 0.08);
    }

    // 正解時の音（一部）
    playSuccessSoundPart() {
        this.playTone(SOUND_FREQUENCIES.SUCCESS_TONE1, SOUND_DURATIONS.SHORT, 0.1);
    }

    // 正解時の音（全体）
    playSuccessSound() {
        this.playTone(SOUND_FREQUENCIES.SUCCESS_TONE1, SOUND_DURATIONS.SHORT, 0.15);
        setTimeout(() => this.playTone(SOUND_FREQUENCIES.SUCCESS_TONE2, SOUND_DURATIONS.SHORT, 0.15), SOUND_DURATIONS.SHORT + 50);
    }

    // 不正解時の音
    playFailSound() {
        this.playTone(SOUND_FREQUENCIES.FAIL_TONE1, SOUND_DURATIONS.MEDIUM, 0.2);
        setTimeout(() => this.playTone(SOUND_FREQUENCIES.FAIL_TONE2, SOUND_DURATIONS.MEDIUM, 0.2), SOUND_DURATIONS.MEDIUM + 50);
    }
}
