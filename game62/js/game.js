import { CONFIG, GAME_STATES, STORAGE_KEYS } from './config.js';
import { Field } from './field.js';
import { Trail } from './trail.js';
import { Player } from './player.js';
import { Enemy, createEnemySpawns } from './enemy.js';
import { checkPlayerEnemyCollision, checkTrailEnemyCollision } from './collision.js';
import { resolveCapture } from './capture.js';

export class Game {
  constructor(canvas, ui, audio) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.ui = ui;
    this.audio = audio;

    this.cols = CONFIG.grid.cols;
    this.rows = CONFIG.grid.rows;
    this.cellSize = CONFIG.grid.cellSize;
    this.canvas.width = this.cols * this.cellSize;
    this.canvas.height = this.rows * this.cellSize;

    this.field = new Field(this.cols, this.rows);
    this.trail = new Trail();
    this.player = new Player(this.field, this.trail, CONFIG.player);
    this.enemies = [];

    this.state = GAME_STATES.BOOT;
    this.lastTs = 0;
    this.stageIndex = 0;
    this.score = 0;
    this.highScore = Number(localStorage.getItem(STORAGE_KEYS.HIGH_SCORE) || 0);
    this.lives = CONFIG.game.initialLives;
    this.missLockUntil = 0;
  }

  init() {
    this.ui.bindDirectionButtons((dir) => this.player.setDirection(dir), () => this.audio.unlock());
    this.ui.bindPause(() => this.togglePause(), () => this.audio.unlock());
    this.showTitle();
    requestAnimationFrame((ts) => this.loop(ts));
  }

  loop(ts) {
    const deltaMs = Math.min(33, ts - (this.lastTs || ts));
    this.lastTs = ts;

    this.update(deltaMs, ts);
    this.render();

    requestAnimationFrame((next) => this.loop(next));
  }

  update(deltaMs, nowTs) {
    if (this.state !== GAME_STATES.PLAYING) return;

    const moveResult = this.player.update(deltaMs);

    if (moveResult && moveResult.selfCollision) {
      this.onPlayerMiss();
      return;
    }

    for (const enemy of this.enemies) {
      enemy.update(deltaMs / 1000);
    }

    if (nowTs > this.missLockUntil) {
      if (checkTrailEnemyCollision(this.trail, this.enemies, this.cellSize)) {
        this.onPlayerMiss();
        return;
      }
      if (checkPlayerEnemyCollision(this.player, this.enemies, this.cellSize)) {
        this.onPlayerMiss();
        return;
      }
    }

    if (moveResult && moveResult.closed) {
      const gainedCells = resolveCapture(this.field, this.trail, this.enemies, this.cellSize);
      this.score += gainedCells * CONFIG.scoring.capturePerCell;
      this.audio.playCapture();
      this.checkStageClear();
    }

    this.syncHud();
  }

  render() {
    const { ctx, cellSize } = this;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.field.forEachCell((x, y, cell) => {
      switch (cell) {
        case 0:
          ctx.fillStyle = CONFIG.colors.uncaptured;
          break;
        case 1:
          ctx.fillStyle = CONFIG.colors.captured;
          break;
        case 2:
          ctx.fillStyle = CONFIG.colors.boundary;
          break;
        case 3:
          ctx.fillStyle = CONFIG.colors.trail;
          break;
      }
      ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
    });

    ctx.fillStyle = CONFIG.colors.player;
    ctx.fillRect(this.player.x * cellSize + 1, this.player.y * cellSize + 1, cellSize - 2, cellSize - 2);

    ctx.fillStyle = CONFIG.colors.enemy;
    for (const enemy of this.enemies) {
      ctx.beginPath();
      ctx.arc(enemy.x, enemy.y, enemy.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    if (CONFIG.debug.enabled) {
      ctx.fillStyle = CONFIG.colors.debugText;
      ctx.font = '10px monospace';
      const fill = Math.floor(this.field.getFillRate() * 100);
      ctx.fillText(`state:${this.state}`, 4, 12);
      ctx.fillText(`player:${this.player.x},${this.player.y}`, 4, 24);
      ctx.fillText(`drawing:${this.player.drawing}`, 4, 36);
      ctx.fillText(`fill:${fill}%`, 4, 48);
      this.enemies.forEach((e, idx) => {
        const c = e.getCell();
        ctx.fillText(`e${idx}:${c.x},${c.y}`, 4, 60 + idx * 12);
      });
    }
  }

  showTitle() {
    this.state = GAME_STATES.TITLE;
    this.ui.showModal('Area Trace 62', `High Score: ${this.highScore}`, [
      { label: 'Start Game', onClick: () => this.startNewGame() },
    ]);
  }

  startNewGame() {
    this.stageIndex = 0;
    this.score = 0;
    this.lives = CONFIG.game.initialLives;
    this.startStage();
  }

  startStage() {
    this.field.reset();
    this.trail.clear(this.field);
    this.player.resetPosition();

    const stage = CONFIG.stages[this.stageIndex];
    const spawns = createEnemySpawns(this.field, stage.enemies);
    this.enemies = spawns.map((s) => new Enemy(this.field, stage.speed, this.cellSize, s));

    this.state = GAME_STATES.READY;
    this.syncHud();
    this.ui.showModal(`Stage ${this.stageIndex + 1}`, 'Ready?', [
      {
        label: 'Go',
        onClick: () => {
          this.ui.hideModal();
          this.state = GAME_STATES.PLAYING;
          this.missLockUntil = performance.now() + CONFIG.game.missInvincibleMs;
        },
      },
    ]);
  }

  togglePause() {
    if (this.state === GAME_STATES.PLAYING) {
      this.state = GAME_STATES.PAUSED;
      this.ui.showModal('Paused', 'ゲームを一時停止中', [
        { label: 'Resume', onClick: () => { this.ui.hideModal(); this.state = GAME_STATES.PLAYING; } },
        { label: 'Retry Stage', secondary: true, onClick: () => this.startStage() },
      ]);
      this.audio.playButton();
    }
  }

  onPlayerMiss() {
    this.audio.playMiss();
    this.state = GAME_STATES.PLAYER_MISS;
    this.lives -= 1;
    this.trail.clear(this.field);

    if (this.lives <= 0) {
      this.toGameOver();
      return;
    }

    this.player.resetPosition();
    this.syncHud();
    this.ui.showModal('Miss', `残り ${this.lives} 機`, [
      {
        label: 'Continue',
        onClick: () => {
          this.ui.hideModal();
          this.state = GAME_STATES.PLAYING;
          this.missLockUntil = performance.now() + CONFIG.game.missInvincibleMs;
        },
      },
    ]);
  }

  checkStageClear() {
    const stage = CONFIG.stages[this.stageIndex];
    const fill = this.field.getFillRate();
    const target = stage.targetFillRate ?? CONFIG.game.targetFillRate;

    if (fill >= target) {
      this.state = GAME_STATES.STAGE_CLEAR;
      this.score += CONFIG.scoring.stageClearBonus + this.lives * CONFIG.scoring.lifeBonus;
      this.audio.playClear();
      this.syncHud();

      if (this.stageIndex >= CONFIG.stages.length - 1) {
        this.ui.showModal('All Clear!', '全ステージクリア！', [
          { label: 'Title', onClick: () => this.showTitle() },
          { label: 'Replay', secondary: true, onClick: () => this.startNewGame() },
        ]);
      } else {
        this.ui.showModal('Stage Clear!', '次のステージへ進みます。', [
          { label: 'Next', onClick: () => { this.stageIndex += 1; this.startStage(); } },
        ]);
      }
    }
  }

  toGameOver() {
    this.state = GAME_STATES.GAME_OVER;
    if (this.score > this.highScore) {
      this.highScore = this.score;
      localStorage.setItem(STORAGE_KEYS.HIGH_SCORE, String(this.highScore));
    }

    this.syncHud();
    this.ui.showModal('Game Over', `Score: ${this.score} / High: ${this.highScore}`, [
      { label: 'Retry', onClick: () => this.startNewGame() },
      { label: 'Title', secondary: true, onClick: () => this.showTitle() },
    ]);
  }

  syncHud() {
    const stage = CONFIG.stages[this.stageIndex] ?? CONFIG.stages[CONFIG.stages.length - 1];
    this.ui.updateHud({
      stage: this.stageIndex + 1,
      score: this.score,
      lives: this.lives,
      filled: this.field.getFillRate(),
      target: stage.targetFillRate ?? CONFIG.game.targetFillRate,
    });
  }
}
