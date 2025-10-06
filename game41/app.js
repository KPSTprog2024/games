// 数字記憶トレーニング - メインアプリケーション
class DigitSpanApp {
    constructor() {
        this.state = {
            screen: 'landing',
            audioEnabled: false,
            mode: 'forward',
            adaptive: true,
            currentSequence: [],
            userInput: [],
            currentDigits: 4,
            problemCount: 0,
            totalProblems: 10,
            score: {
                correct: 0,
                total: 0,
                maxDigits: 0,
                consecutive: 0,
                currentStreak: 0
            },
            sessionStartTime: null,
            isPlaying: false,
            presentationComplete: false
        };

        this.settings = this.loadSettings();
        this.speechSynth = window.speechSynthesis;
        this.voices = [];
        this.currentUtterance = null;

        this.init();
    }

    // 初期化
    init() {
        this.loadVoices();
        this.setupEventListeners();
        this.showScreen('landing');
        this.loadHistory();
    }

    // デフォルト設定
    getDefaultSettings() {
        return {
            mode: "forward",
            delivery: {
                digitsMin: 3,
                digitsMax: 8,
                startDigits: 4,
                adaptive: true,
                allowLeadingZero: true,
                maxRepeatRun: 2,
                beep: true,
                digitIntervalMs: 50,
                preDelayMs: 300,
                postDelayMs: 300
            },
            tts: {
                enabled: true,
                lang: "ja-JP",
                voiceName: "default",
                rate: 0.95,
                pitch: 1.0,
                volume: 1.0
            },
            ui: {
                haptic: true,
                contrastTheme: "dark",
                bigButtons: true,
                presentationMode: 'audio'
            },
            session: {
                fixedTrials: 10
            }
        };
    }

    // 設定の読み込み
    loadSettings() {
        try {
            const saved = localStorage.getItem('digitSpanSettings');
            const defaults = this.getDefaultSettings();

            if (!saved) {
                return defaults;
            }

            const parsed = JSON.parse(saved);
            const mergeSection = (key) => ({
                ...defaults[key],
                ...(parsed[key] || {})
            });

            const settings = {
                ...defaults,
                ...parsed,
                delivery: mergeSection('delivery'),
                tts: mergeSection('tts'),
                ui: mergeSection('ui'),
                session: mergeSection('session')
            };

            if (parsed.ui && parsed.ui.visualPresentation !== undefined && !parsed.ui.presentationMode) {
                settings.ui.presentationMode = parsed.ui.visualPresentation ? 'visual-step' : 'audio';
            }

            return settings;
        } catch (e) {
            console.error('設定の読み込みに失敗:', e);
            return this.getDefaultSettings();
        }
    }

    // 設定の保存
    saveSettings() {
        try {
            localStorage.setItem('digitSpanSettings', JSON.stringify(this.settings));
        } catch (e) {
            console.error('設定の保存に失敗:', e);
        }
    }

    // 音声の読み込み
    loadVoices() {
        this.voices = this.speechSynth.getVoices();
        if (this.voices.length === 0) {
            this.speechSynth.onvoiceschanged = () => {
                this.voices = this.speechSynth.getVoices();
            };
        }
    }

    // イベントリスナーの設定
    setupEventListeners() {
        // ランディング画面
        document.getElementById('enable-audio-btn').addEventListener('click', () => {
            this.enableAudio();
        });

        // ホーム画面
        document.getElementById('settings-btn').addEventListener('click', () => {
            this.showSettingsScreen();
        });

        document.getElementById('start-btn').addEventListener('click', () => {
            this.startSession();
        });

        // モード選択ボタン
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.selectMode(e.target);
            });
        });

        // 設定画面
        document.getElementById('settings-back-btn').addEventListener('click', () => {
            this.showScreen('home');
        });

        this.setupSettingsControls();

        // 出題画面
        document.getElementById('repeat-btn').addEventListener('click', () => {
            this.repeatSequence();
        });

        // 入力画面
        this.setupKeypad();

        // 結果画面
        document.getElementById('continue-btn').addEventListener('click', () => {
            this.nextProblem();
        });

        document.getElementById('home-btn').addEventListener('click', () => {
            this.endSession();
        });
    }

    // 設定コントロールの設定
    setupSettingsControls() {
        const controls = [
            { id: 'min-digits-slider', path: 'delivery.digitsMin', display: 'min-digits-value' },
            { id: 'max-digits-slider', path: 'delivery.digitsMax', display: 'max-digits-value' },
            { id: 'rate-slider', path: 'tts.rate', display: 'rate-value' },
            { id: 'volume-slider', path: 'tts.volume', display: 'volume-value' },
            { id: 'pitch-slider', path: 'tts.pitch', display: 'pitch-value' },
            { id: 'repeat-limit-slider', path: 'delivery.maxRepeatRun', display: 'repeat-limit-value' },
            {
                id: 'digit-interval-slider',
                path: 'delivery.digitIntervalMs',
                display: 'digit-interval-value',
                formatter: (value) => `${Math.round(value)}ms`
            }
        ];

        controls.forEach(({ id, path, display, formatter }) => {
            const slider = document.getElementById(id);
            const valueDisplay = document.getElementById(display);

            if (!slider || !valueDisplay) return;

            slider.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                this.setNestedProperty(this.settings, path, value);
                valueDisplay.textContent = formatter ? formatter(value) : value;
                this.saveSettings();
            });

            // 初期値設定
            const currentValue = this.getNestedProperty(this.settings, path);
            slider.value = currentValue;
            valueDisplay.textContent = formatter ? formatter(currentValue) : currentValue;
        });

        // チェックボックス
        const checkboxes = [
            { id: 'leading-zero-check', path: 'delivery.allowLeadingZero' },
            { id: 'beep-check', path: 'delivery.beep' }
        ];

        checkboxes.forEach(({ id, path }) => {
            const checkbox = document.getElementById(id);
            if (!checkbox) return;

            checkbox.addEventListener('change', (e) => {
                this.setNestedProperty(this.settings, path, e.target.checked);
                this.saveSettings();
            });

            checkbox.checked = this.getNestedProperty(this.settings, path);
        });

    }

    // キーパッドの設定
    setupKeypad() {
        document.querySelectorAll('[data-digit]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.inputDigit(e.target.dataset.digit);
            });
        });

        document.getElementById('delete-btn').addEventListener('click', () => {
            this.deleteDigit();
        });

        document.getElementById('clear-btn').addEventListener('click', () => {
            this.clearInput();
        });

        document.getElementById('submit-btn').addEventListener('click', () => {
            this.submitAnswer();
        });
    }

    // ネストされたオブジェクトプロパティのヘルパー
    getNestedProperty(obj, path) {
        return path.split('.').reduce((o, p) => o && o[p], obj);
    }

    setNestedProperty(obj, path, value) {
        const keys = path.split('.');
        const lastKey = keys.pop();
        const target = keys.reduce((o, k) => o[k], obj);
        target[lastKey] = value;
    }

    // 音声有効化
    async enableAudio() {
        try {
            // iOS Safari の自動再生制約を回避するためのダミー再生
            const utterance = new SpeechSynthesisUtterance('');
            utterance.volume = 0;
            this.speechSynth.speak(utterance);
            
            this.state.audioEnabled = true;
            this.showScreen('home');
        } catch (e) {
            console.error('音声有効化エラー:', e);
            // 音声が使えなくても続行
            this.state.audioEnabled = false;
            this.showScreen('home');
        }
    }

    // 画面表示
    showScreen(screenName) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        const targetScreen = document.getElementById(`${screenName}-screen`);
        if (targetScreen) {
            targetScreen.classList.add('active');
            this.state.screen = screenName;

            // 画面表示時の初期化処理
            if (screenName === 'home') {
                this.updateModeButtons();
            } else if (screenName === 'presentation') {
                this.resetPresentationScreen();
            } else if (screenName === 'input') {
                this.resetInputScreen();
            }
        }
    }

    // プレゼンテーション画面リセット
    resetPresentationScreen() {
        const countdownEl = document.getElementById('countdown-display');
        const sequenceEl = document.getElementById('digit-sequence');
        const repeatBtn = document.getElementById('repeat-btn');

        countdownEl.style.display = 'flex';
        countdownEl.textContent = '3';
        sequenceEl.innerHTML = `<div class="listening-message">${this.getPresentationInstruction()}</div>`;
        repeatBtn.style.display = 'none';

        this.state.presentationComplete = false;
    }

    getPresentationMode() {
        return this.settings.ui.presentationMode || 'audio';
    }

    isAudioPlaybackActive() {
        return this.getPresentationMode() === 'audio'
            && this.settings.tts.enabled
            && this.state.audioEnabled;
    }

    getPresentationInstruction() {
        const mode = this.getPresentationMode();
        if (mode === 'visual-step' || mode === 'visual-full') {
            return 'よく見てください';
        }
        return this.isAudioPlaybackActive()
            ? 'よく聞いてください'
            : 'よく見てください';
    }

    // 入力画面リセット
    resetInputScreen() {
        this.state.userInput = [];
        this.updateInputProgress();
        this.updateCurrentInput();
        this.updateSubmitButton();
    }

    // モード選択
    selectMode(button) {
        const parent = button.closest('.button-group');
        if (!parent) return;

        parent.querySelectorAll('.mode-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        button.classList.add('active');

        if (button.dataset.mode) {
            this.state.mode = button.dataset.mode;
            this.settings.mode = button.dataset.mode;
        }
        if (button.dataset.adaptive !== undefined) {
            this.state.adaptive = button.dataset.adaptive === 'true';
            this.settings.delivery.adaptive = this.state.adaptive;
        }
        if (button.dataset.presentation) {
            this.settings.ui.presentationMode = button.dataset.presentation;
        }

        this.saveSettings();

        if (button.dataset.presentation && this.state.screen === 'presentation') {
            this.resetPresentationScreen();
        }

        this.updateModeButtons();
    }

    // モードボタンの更新
    updateModeButtons() {
        // 記憶方向ボタン
        document.querySelectorAll('[data-mode]').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === this.settings.mode);
        });

        // 難易度調整ボタン
        document.querySelectorAll('[data-adaptive]').forEach(btn => {
            btn.classList.toggle('active',
                (btn.dataset.adaptive === 'true') === this.settings.delivery.adaptive);
        });

        // 出題方法ボタン
        const presentationMode = this.getPresentationMode();
        document.querySelectorAll('[data-presentation]').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.presentation === presentationMode);
        });

        this.state.mode = this.settings.mode;
        this.state.adaptive = this.settings.delivery.adaptive;
    }

    // 設定画面表示
    showSettingsScreen() {
        this.showScreen('settings');
        // 設定値を再反映
        this.setupSettingsControls();
    }

    // セッション開始
    startSession() {
        this.state.problemCount = 0;
        this.state.totalProblems = this.settings.session.fixedTrials;
        this.state.currentDigits = this.settings.delivery.startDigits;
        this.state.score = {
            correct: 0,
            total: 0,
            maxDigits: 0,
            consecutive: 0,
            currentStreak: 0
        };
        this.state.sessionStartTime = new Date();
        
        this.nextProblem();
    }

    // 次の問題
    nextProblem() {
        if (this.state.problemCount >= this.state.totalProblems) {
            this.endSession();
            return;
        }

        this.state.problemCount++;
        this.state.currentSequence = this.generateSequence(this.state.currentDigits);
        
        this.updateProblemInfo();
        this.showScreen('presentation');
        
        // プレゼンテーション開始
        setTimeout(() => {
            this.presentSequence();
        }, 500);
    }

    // 数字列生成
    generateSequence(length) {
        const sequence = [];
        const { allowLeadingZero, maxRepeatRun } = this.settings.delivery;

        for (let i = 0; i < length; i++) {
            let digit;
            let attempts = 0;
            
            do {
                digit = Math.floor(Math.random() * 10);
                
                // 先頭0制約
                if (i === 0 && !allowLeadingZero && digit === 0) {
                    digit = Math.floor(Math.random() * 9) + 1;
                }
                
                attempts++;
            } while (attempts < 10 && this.violatesRepeatConstraint(sequence, digit, maxRepeatRun));
            
            sequence.push(digit);
        }

        return sequence;
    }

    // 同一数字連続制限チェック
    violatesRepeatConstraint(sequence, newDigit, maxRepeatRun) {
        if (sequence.length < maxRepeatRun) return false;
        
        const recent = sequence.slice(-maxRepeatRun + 1);
        return recent.every(d => d === newDigit);
    }

    // 問題情報更新
    updateProblemInfo() {
        document.getElementById('current-problem').textContent = this.state.problemCount;
        document.getElementById('total-problems').textContent = this.state.totalProblems;
        document.getElementById('current-digits-display').textContent = this.state.currentDigits;
    }

    // 数字列提示
    async presentSequence() {
        console.log('プレゼンテーション開始:', this.state.currentSequence);

        const countdownEl = document.getElementById('countdown-display');
        const sequenceEl = document.getElementById('digit-sequence');
        const repeatBtn = document.getElementById('repeat-btn');
        const mode = this.getPresentationMode();
        const audioActive = this.isAudioPlaybackActive();
        const digits = this.state.currentSequence;
        const digitInterval = Math.max(0, this.settings.delivery.digitIntervalMs);
        const visualDisplayDuration = Math.max(800, digitInterval);
        const postDelay = Math.max(0, this.settings.delivery.postDelayMs);
        const instruction = this.getPresentationInstruction();

        try {
            repeatBtn.style.display = 'none';
            countdownEl.style.display = 'flex';
            sequenceEl.innerHTML = `<div class="listening-message">${instruction}</div>`;
            this.state.presentationComplete = false;

            // カウントダウン
            for (let i = 3; i > 0; i--) {
                countdownEl.textContent = i;
                await this.wait(1000);
            }

            countdownEl.style.display = 'none';

            await this.announceStartCue();

            if (mode === 'visual-full') {
                const digitsHtml = digits
                    .map(digit => `<span class="digit-item digit-pulse">${digit}</span>`)
                    .join('');
                sequenceEl.innerHTML = digitsHtml;
                await this.wait(visualDisplayDuration * Math.max(1, digits.length));
                sequenceEl.innerHTML = '';
            } else {
                for (let i = 0; i < digits.length; i++) {
                    const digit = digits[i];

                    if (audioActive) {
                        sequenceEl.innerHTML = `<div class="listening-message">${instruction}</div>`;
                        await this.speak(digit.toString());
                        if (i < digits.length - 1 && digitInterval > 0) {
                            await this.wait(digitInterval);
                        }
                    } else {
                        sequenceEl.innerHTML = `<span class="digit-item digit-pulse">${digit}</span>`;
                        await this.wait(visualDisplayDuration);
                        sequenceEl.innerHTML = '';
                        if (i < digits.length - 1 && digitInterval > 0) {
                            await this.wait(digitInterval);
                        }
                    }
                }
            }

            await this.wait(postDelay);

            // プレゼンテーション完了
            this.state.presentationComplete = true;

            // リピートボタン表示
            repeatBtn.style.display = 'block';

            // メッセージ更新
            sequenceEl.innerHTML = '<div class="listening-message">入力画面に進むには下のボタンを押してください</div>';
            
            // 自動で入力画面に進む
            setTimeout(() => {
                this.proceedToInput();
            }, 2000);
            
        } catch (error) {
            console.error('プレゼンテーションエラー:', error);
            // エラー時も入力画面に進む
            this.proceedToInput();
        }
    }

    // 開始合図の音声再生
    async announceStartCue() {
        const { beep, preDelayMs } = this.settings.delivery;
        const delay = Math.max(0, preDelayMs);

        if (!beep) {
            await this.wait(delay);
            return;
        }

        if (!this.state.audioEnabled || !this.settings.tts.enabled) {
            await this.wait(delay);
            return;
        }

        await this.speak('いきます');

        if (delay > 0) {
            await this.wait(delay);
        }
    }

    // 入力画面に進む
    proceedToInput() {
        console.log('入力画面に進みます');
        this.showInputScreen();
    }

    // 音声合成
    speak(text, options = {}) {
        return new Promise((resolve, reject) => {
            if (!this.state.audioEnabled || !this.settings.tts.enabled) {
                console.log('音声無効のため音声合成をスキップ');
                setTimeout(resolve, 500); // 音声の代わりに短い待機
                return;
            }

            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = this.settings.tts.lang;
            utterance.rate = options.rate || this.settings.tts.rate;
            utterance.pitch = options.pitch || this.settings.tts.pitch;
            utterance.volume = options.volume || this.settings.tts.volume;

            // 日本語音声を選択
            const japaneseVoice = this.voices.find(voice => 
                voice.lang.includes('ja') || voice.name.includes('Japanese')
            );
            if (japaneseVoice) {
                utterance.voice = japaneseVoice;
            }

            utterance.onend = () => {
                console.log('音声合成完了:', text);
                resolve();
            };
            utterance.onerror = (error) => {
                console.error('音声合成エラー:', error);
                resolve(); // エラーでも続行
            };

            this.currentUtterance = utterance;
            this.speechSynth.speak(utterance);
            
            // タイムアウト保護
            setTimeout(() => {
                resolve();
            }, 3000);
        });
    }

    // 待機
    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // 数字列再生
    async repeatSequence() {
        const repeatBtn = document.getElementById('repeat-btn');
        repeatBtn.style.display = 'none';
        await this.presentSequence();
    }

    // 入力画面表示
    showInputScreen() {
        console.log('入力画面表示');
        
        const instruction = document.getElementById('mode-instruction');
        instruction.textContent = this.state.mode === 'forward' 
            ? '聞いた順番通りに入力してください'
            : '聞いた順番と逆順で入力してください';
        
        this.showScreen('input');
    }

    // 数字入力
    inputDigit(digit) {
        if (this.state.userInput.length >= this.state.currentDigits) return;
        
        this.state.userInput.push(parseInt(digit));
        this.updateInputProgress();
        this.updateCurrentInput();
        this.updateSubmitButton();
    }

    // 削除
    deleteDigit() {
        if (this.state.userInput.length > 0) {
            this.state.userInput.pop();
            this.updateInputProgress();
            this.updateCurrentInput();
            this.updateSubmitButton();
        }
    }

    // クリア
    clearInput() {
        this.state.userInput = [];
        this.updateInputProgress();
        this.updateCurrentInput();
        this.updateSubmitButton();
    }

    // 入力進捗更新
    updateInputProgress() {
        const progressEl = document.getElementById('input-progress');
        if (!progressEl) return;
        
        progressEl.innerHTML = '';
        
        for (let i = 0; i < this.state.currentDigits; i++) {
            const dot = document.createElement('div');
            dot.className = 'progress-dot';
            if (i < this.state.userInput.length) {
                dot.classList.add('filled');
            }
            progressEl.appendChild(dot);
        }
    }

    // 現在入力更新
    updateCurrentInput() {
        const inputEl = document.getElementById('current-input');
        if (!inputEl) return;
        
        inputEl.textContent = this.state.userInput.length > 0 
            ? this.state.userInput.join('')
            : '-';
    }

    // 確定ボタン更新
    updateSubmitButton() {
        const submitBtn = document.getElementById('submit-btn');
        if (!submitBtn) return;
        
        submitBtn.disabled = this.state.userInput.length !== this.state.currentDigits;
    }

    // 回答確定
    submitAnswer() {
        if (this.state.userInput.length !== this.state.currentDigits) return;
        
        const correct = this.checkAnswer();
        this.updateScore(correct);
        this.showResult(correct);
    }

    // 回答チェック
    checkAnswer() {
        const target = this.state.mode === 'forward' 
            ? this.state.currentSequence 
            : [...this.state.currentSequence].reverse();
        
        if (this.state.userInput.length !== target.length) return false;
        
        return this.state.userInput.every((digit, index) => digit === target[index]);
    }

    // スコア更新
    updateScore(correct) {
        this.state.score.total++;
        
        if (correct) {
            this.state.score.correct++;
            this.state.score.currentStreak++;
            this.state.score.consecutive = Math.max(
                this.state.score.consecutive, 
                this.state.score.currentStreak
            );
            this.state.score.maxDigits = Math.max(
                this.state.score.maxDigits, 
                this.state.currentDigits
            );
            
            // 適応モード: 正答で桁数増加
            if (this.state.adaptive) {
                this.state.currentDigits = Math.min(
                    this.state.currentDigits + 1,
                    this.settings.delivery.digitsMax
                );
            }
        } else {
            this.state.score.currentStreak = 0;
            
            // 適応モード: 誤答で桁数減少
            if (this.state.adaptive) {
                this.state.currentDigits = Math.max(
                    this.state.currentDigits - 1,
                    this.settings.delivery.digitsMin
                );
            }
        }
    }

    // 結果表示
    showResult(correct) {
        const feedbackIcon = document.getElementById('feedback-icon');
        const feedbackText = document.getElementById('feedback-text');
        
        if (correct) {
            feedbackIcon.textContent = '✓';
            feedbackIcon.className = 'feedback-icon correct';
            feedbackText.textContent = '正解！';
            feedbackText.className = 'feedback-text correct';
        } else {
            feedbackIcon.textContent = '✗';
            feedbackIcon.className = 'feedback-icon incorrect';
            feedbackText.textContent = '不正解';
            feedbackText.className = 'feedback-text incorrect';
        }

        // 回答比較表示
        document.getElementById('presented-sequence').textContent = 
            this.state.currentSequence.join('');
        document.getElementById('user-answer').textContent = 
            this.state.userInput.join('');
        
        const correctAnswer = this.state.mode === 'forward' 
            ? this.state.currentSequence 
            : [...this.state.currentSequence].reverse();
        document.getElementById('correct-answer').textContent = 
            correctAnswer.join('');

        // セッション統計更新
        this.updateSessionStats();
        
        this.showScreen('result');
    }

    // セッション統計更新
    updateSessionStats() {
        document.getElementById('correct-count').textContent = this.state.score.correct;
        
        const accuracy = this.state.score.total > 0 
            ? Math.round((this.state.score.correct / this.state.score.total) * 100)
            : 0;
        document.getElementById('accuracy-rate').textContent = `${accuracy}%`;
        
        document.getElementById('max-digits-reached').textContent = this.state.score.maxDigits;
    }

    // セッション終了
    endSession() {
        this.saveSessionHistory();
        this.loadHistory();
        this.showScreen('home');
    }

    // セッション履歴保存
    saveSessionHistory() {
        if (this.state.score.total === 0) return;

        const sessionData = {
            timestamp: new Date().toISOString(),
            mode: this.state.mode,
            adaptive: this.state.adaptive,
            score: { ...this.state.score },
            maxDigits: this.state.score.maxDigits,
            accuracy: Math.round((this.state.score.correct / this.state.score.total) * 100),
            duration: Date.now() - this.state.sessionStartTime.getTime()
        };

        try {
            const sessions = JSON.parse(localStorage.getItem('digitSpanSessions') || '[]');
            sessions.unshift(sessionData);
            // 最新50件まで保持
            localStorage.setItem('digitSpanSessions', JSON.stringify(sessions.slice(0, 50)));
        } catch (e) {
            console.error('セッション履歴の保存に失敗:', e);
        }
    }

    // 履歴読み込み・表示
    loadHistory() {
        try {
            const sessions = JSON.parse(localStorage.getItem('digitSpanSessions') || '[]');
            const historyList = document.getElementById('history-list');
            
            if (sessions.length === 0) {
                historyList.innerHTML = '<p class="no-history">まだ記録がありません</p>';
                return;
            }

            historyList.innerHTML = sessions.slice(0, 5).map(session => {
                const date = new Date(session.timestamp);
                const dateStr = `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
                
                return `
                    <div class="history-item">
                        <div class="history-date">${dateStr}</div>
                        <div class="history-stats">
                            <div class="history-stat">
                                <span>最高:</span>
                                <span>${session.maxDigits}桁</span>
                            </div>
                            <div class="history-stat">
                                <span>正答率:</span>
                                <span>${session.accuracy}%</span>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        } catch (e) {
            console.error('履歴の読み込みに失敗:', e);
        }
    }
}

// アプリケーション初期化
document.addEventListener('DOMContentLoaded', () => {
    window.digitSpanApp = new DigitSpanApp();
});

// ページの可視性変更時の処理
document.addEventListener('visibilitychange', () => {
    if (document.hidden && window.digitSpanApp) {
        // 音声合成を停止
        if (window.digitSpanApp.currentUtterance) {
            window.speechSynthesis.cancel();
        }
    }
});

// ページアンロード時の処理
window.addEventListener('beforeunload', () => {
    if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
    }
});
