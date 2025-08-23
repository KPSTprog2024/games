import { UIManager } from "./UIManager.js";
import { Effects } from "./Effects.js";

export class GameManager {
  constructor(uiManager, effects) {
    this.uiManager = uiManager;
    this.effects = effects;
    this.gameState = { selectedImage: null, rows: 3, cols: 4, gameInstance: null, remainingPieces: 0 };
    this.config = { gameWidth: 800, gameHeight: 600, snapDistance: 40 };

    document.getElementById("piece-count").addEventListener("change", (e) => {
      const [rows, cols] = e.target.value.split("x").map(Number);
      this.gameState.rows = rows;
      this.gameState.cols = cols;
    });

    document.getElementById("upload-image").addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        this.gameState.selectedImage = ev.target.result;
        this.uiManager.updateStartButton(true);
      };
      reader.readAsDataURL(file);
    });

    document.getElementById("start-button").addEventListener("click", () => this.startGame());
  }

  startGame() {
    if (!this.gameState.selectedImage) return;
    this.gameState.remainingPieces = this.gameState.rows * this.gameState.cols;
    this.uiManager.showScreen("game-screen");
    this.initPhaserGame();
  }

  initPhaserGame() {
    if (this.gameState.gameInstance) this.gameState.gameInstance.destroy(true);
    const config = {
      type: Phaser.AUTO,
      width: this.config.gameWidth,
      height: this.config.gameHeight,
      parent: "game-container",
      scene: { preload: () => this.preload(), create: () => this.create() }
    };
    this.gameState.gameInstance = new Phaser.Game(config);
  }

  preload() {
    const scene = this.gameState.gameInstance.scene.scenes[0];
    scene.load.image("puzzleImage", this.gameState.selectedImage);
    scene.load.audio("placeSound", "assets/sounds/place.mp3");
    scene.load.audio("clearSound", "assets/sounds/clear.mp3");
  }

  create() {
    const scene = this.gameState.gameInstance.scene.scenes[0];
    this.effects.loadSounds(scene);
    const img = scene.textures.get("puzzleImage").getSourceImage();
    const rows = this.gameState.rows, cols = this.gameState.cols;
    const pieceWidth = Math.floor(img.width / cols);
    const pieceHeight = Math.floor(img.height / rows);
    let id = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const key = `piece_${id}`;
        const canvasTexture = scene.textures.createCanvas(key, pieceWidth, pieceHeight);
        const ctx = canvasTexture.context;
        ctx.drawImage(img, c * pieceWidth, r * pieceHeight, pieceWidth, pieceHeight, 0, 0, pieceWidth, pieceHeight);
        canvasTexture.refresh();
        const piece = scene.add.image(
          Phaser.Math.Between(50, this.config.gameWidth - pieceWidth - 50),
          Phaser.Math.Between(this.config.gameHeight/2, this.config.gameHeight - pieceHeight - 50),
          key
        );
        piece.setOrigin(0);
        piece.setInteractive({ draggable: true });
        scene.input.setDraggable(piece);
        piece.correctX = (this.config.gameWidth - img.width) / 2 + c * pieceWidth;
        piece.correctY = 50 + r * pieceHeight;
        id++;
      }
    }
    scene.input.on("drag", (pointer, gameObject, dragX, dragY) => {
      gameObject.x = dragX; gameObject.y = dragY;
      this.effects.createDragTrail(scene, gameObject);
    });
    scene.input.on("dragend", (pointer, gameObject) => {
      const dist = Phaser.Math.Distance.Between(gameObject.x, gameObject.y, gameObject.correctX, gameObject.correctY);
      if (dist < this.config.snapDistance) {
        gameObject.x = gameObject.correctX;
        gameObject.y = gameObject.correctY;
        this.effects.playPlaceSound();
        this.uiManager.updateRemainingPieces(--this.gameState.remainingPieces);
        if (this.gameState.remainingPieces === 0) this.handleClear(scene);
      }
    });
  }

  handleClear(scene) {
    this.effects.createCompletionCelebration(scene);
    this.effects.playClearSound();
    this.uiManager.showNotification("🎉 クリア！", "success");
    this.uiManager.showScreen("game-clear-screen");
  }
}
