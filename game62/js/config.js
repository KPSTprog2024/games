export const CELL = {
  UNCAPTURED: 0,
  CAPTURED: 1,
  BOUNDARY: 2,
  TRAIL: 3,
};

export const GAME_STATES = {
  BOOT: 'boot',
  TITLE: 'title',
  READY: 'ready',
  PLAYING: 'playing',
  PAUSED: 'paused',
  STAGE_CLEAR: 'stageClear',
  PLAYER_MISS: 'playerMiss',
  GAME_OVER: 'gameOver',
};

export const CONFIG = {
  grid: {
    cols: 40,
    rows: 60,
    cellSize: 8,
  },
  player: {
    moveIntervalMs: 85,
  },
  game: {
    targetFillRate: 0.75,
    initialLives: 3,
    missInvincibleMs: 800,
  },
  difficulty: {
    initialEnemies: 1,
    initialEnemySpeed: 52,
    speedUpPerOddClear: 10,
    enemyIncreasePerEvenClear: 1,
    maxEnemySpeed: 180,
  },
  scoring: {
    capturePerCell: 8,
    stageClearBonus: 1200,
    lifeBonus: 400,
  },
  colors: {
    uncaptured: '#0a1423',
    captured: '#1f7a6f',
    boundary: '#8de9cf',
    trail: '#f7c24b',
    player: '#e6f1ff',
    enemy: '#ff5c7a',
    debugText: '#ffffff',
  },
  debug: {
    enabled: false,
    showGrid: false,
  },
};

export const STORAGE_KEYS = {
  HIGH_SCORE: 'game62_high_score',
};
