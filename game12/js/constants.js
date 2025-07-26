// js/constants.js

export const GAME_STATES = {
    READY: 'ready',
    PLAYING_SEQUENCE: 'playing_sequence',
    PLAYER_TURN: 'player_turn',
    STAGE_CLEARED: 'stage_cleared',
    GAME_OVER: 'game_over'
};

export const MESSAGES = {
    START: ['じゅんばんにおぼえてね', 'みておぼえてね', 'よくみてね'],
    SUCCESS: ['すごいね！', 'やったね！', 'ばっちり！', 'かんぺき！'],
    FAIL: ['ざんねん', 'もういちどちょうせん！', 'おしい！'],
    YOUR_TURN: ['さあ、おしてね', 'じゅんばんにおしてね', 'おもいだしてね'],
    RESET_RANKING: 'らんきんぐをりせっとしたよ',
    WELCOME_TOP: 'げーむをすたーとしよう！',
    WELCOME_GAME: 'がんばってね'
};

// 難易度設定 (highlightDuration, intervalDuration は ms)
export const DIFFICULTY_SETTINGS = {
    1: { name: 'やさしい', highlightDuration: 800, intervalDuration: 1000 },
    2: { name: 'ふつう', highlightDuration: 600, intervalDuration: 800 },
    3: { name: 'ちょっとむずかしい', highlightDuration: 500, intervalDuration: 700 },
    4: { name: 'むずかしい', highlightDuration: 400, intervalDuration: 600 },
    5: { name: 'さいこう！', highlightDuration: 300, intervalDuration: 500 }
};

export const SOUND_FREQUENCIES = {
    SUCCESS_TONE1: 800,
    SUCCESS_TONE2: 1000,
    FAIL_TONE1: 200,
    FAIL_TONE2: 150,
    HIGHLIGHT_TONE: 440 // マスが光る時の音
};

export const SOUND_DURATIONS = {
    SHORT: 200,
    MEDIUM: 300
};

export const COUNTDOWN_TIME = 3; // カウントダウンの秒数
export const STAGE_CLEARED_DELAY = 800; // ステージクリア後の待機時間
export const RESET_DELAY = 800; // リセット後の待機時間
export const DEFAULT_DIFFICULTY = 1; // 初期難易度
export const GRID_SIZE = 9; // マスの総数
export const GAME_MODES = {
    ONCE: 'once',
    REPEAT: 'repeat'
};
