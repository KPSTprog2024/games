(() => {
  class PuzzleGame {
    constructor() {
      this.selectedImage = null;
      this.rows = 3;
      this.cols = 4;
      this.pieceWidth = 0;
      this.pieceHeight = 0;
      this.piecesGroup = null;
      this.puzzleGroup = null;
      this.gameWidth = window.innerWidth;
      this.gameHeight = window.innerHeight - 200;
      this.imageKey = '';
      this.imageCounter = 0;
      this.completedImageURL = '';

      document.getElementById('piece-count').addEventListener('change', (e) => {
        const value = e.target.value;
        if (value === '3x4') {
          this.rows = 3;
          this.cols = 4;
        } else if (value === '4x5') {
          this.rows = 4;
          this.cols = 5;
        } else if (value === '6x8') {
          this.rows = 6;
          this.cols = 8;
        }
      });

      document.getElementById('upload-image').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file && file.size <= 5 * 1024 * 1024) {
          const reader = new FileReader();
          reader.onload = (event) => {
            this.selectedImage = event.target.result;
            document.getElementById('start-button').disabled = false;
          };
          reader.readAsDataURL(file);
        } else {
          alert('5MB以下のPNGまたはJPG画像を選択してください。');
          document.getElementById('start-button').disabled = true;
        }
      });

      document.getElementById('start-button').addEventListener('click', () => {
        if (this.selectedImage) {
          document.getElementById('start-screen').style.display = 'none';
          document.getElementById('game-screen').style.display = 'block';
          this.initGame();
        }
      });

      document.getElementById('retry-button').addEventListener('click', () => {
        location.reload();
      });

      document.getElementById('reset-button').addEventListener('click', () => {
        location.reload();
      });
    }

    initGame() {
      this.imageCounter++;
      this.imageKey = 'puzzleImage_' + this.imageCounter;

      const self = this;
      const config = {
        type: Phaser.AUTO,
        width: this.gameWidth,
        height: this.gameHeight * 2,
        parent: 'game-container',
        backgroundColor: '#8E24AA',
        scene: {
          preload: function () {
            self.preload(this);
          },
          create: function () {
            self.create(this);
          },
        },
      };

      new Phaser.Game(config);
    }

    preload(scene) {
      if (scene.textures.exists(this.imageKey)) {
        scene.textures.remove(this.imageKey);
      }
    }

    create(scene) {
      scene.cameras.main.setBackgroundColor('#8E24AA');

      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width + 8;
        canvas.height = img.height + 8;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 4, 4);
        scene.textures.addImage(this.imageKey, canvas);

        const texture = scene.textures.get(this.imageKey).getSourceImage();
        this.completedImageURL = canvas.toDataURL();

        const scaleX = (this.gameWidth * 0.8) / texture.width;
        const scaleY = (this.gameHeight * 0.4) / texture.height;
        const scale = Math.min(scaleX, scaleY);

        const imageWidth = texture.width * scale;
        const imageHeight = texture.height * scale;

        this.pieceWidth = Math.floor(imageWidth / this.cols);
        this.pieceHeight = Math.floor(imageHeight / this.rows);

        const frameWidth = this.pieceWidth * this.cols;
        const frameHeight = this.pieceHeight * this.rows;
        const frameX = (this.gameWidth - frameWidth) / 2;
        const frameY = 10;

        const graphics = scene.add.graphics();
        graphics.lineStyle(4, 0xffb74d);
        graphics.strokeRect(frameX, frameY, frameWidth, frameHeight);
        graphics.fillStyle(0x8e24aa, 1);
        graphics.fillRect(frameX, frameY, frameWidth, frameHeight);
        graphics.setDepth(0);

        graphics.lineStyle(1, 0xffffff, 0.5);
        for (let i = 1; i < this.cols; i++) {
          const x = frameX + i * this.pieceWidth;
          graphics.moveTo(x, frameY);
          graphics.lineTo(x, frameY + frameHeight);
        }
        for (let i = 1; i < this.rows; i++) {
          const y = frameY + i * this.pieceHeight;
          graphics.moveTo(frameX, y);
          graphics.lineTo(frameX + frameWidth, y);
        }
        graphics.strokePath();

        const previewX = (this.gameWidth - imageWidth) / 2;
        const previewY = frameY + frameHeight + 20;
        const previewImage = scene.add.image(previewX, previewY, this.imageKey);
        previewImage.setOrigin(0, 0);
        previewImage.setScale(scale);
        previewImage.setDepth(0);

        this.piecesGroup = scene.add.group();
        this.puzzleGroup = scene.add.group();

        let id = 0;
        for (let row = 0; row < this.rows; row++) {
          for (let col = 0; col < this.cols; col++) {
            const x = frameX + col * this.pieceWidth;
            const y = frameY + row * this.pieceHeight;

            const pieceTextureKey = this.imageKey + '_piece_' + id;
            const canvasTexture = scene.textures.createCanvas(
              pieceTextureKey,
              this.pieceWidth,
              this.pieceHeight
            );
            const ctxPiece = canvasTexture.context;
            ctxPiece.drawImage(
              texture,
              (col * this.pieceWidth) / scale,
              (row * this.pieceHeight) / scale,
              this.pieceWidth / scale,
              this.pieceHeight / scale,
              0,
              0,
              this.pieceWidth,
              this.pieceHeight
            );
            canvasTexture.refresh();

            const piece = scene.add.image(0, 0, pieceTextureKey);
            piece.setOrigin(0);
            piece.setInteractive({ draggable: true });
            scene.input.setDraggable(piece);

            piece.correctX = x;
            piece.correctY = y;

            const posX = Phaser.Math.Between(20, this.gameWidth - this.pieceWidth - 20);
            const posY =
              frameY + frameHeight + imageHeight + 40 + Phaser.Math.Between(0, 100);

            piece.x = posX;
            piece.y = posY;

            this.piecesGroup.add(piece);
            id++;
          }
        }

        scene.input.on('dragstart', (_pointer, gameObject) => {
          gameObject.setDepth(1);
        });

        scene.input.on('drag', (_pointer, gameObject, dragX, dragY) => {
          gameObject.x = dragX;
          gameObject.y = dragY;
        });

        scene.input.on('dragend', (_pointer, gameObject) => {
          const distance = Phaser.Math.Distance.Between(
            gameObject.x,
            gameObject.y,
            gameObject.correctX,
            gameObject.correctY
          );

          if (distance < 30) {
            gameObject.x = gameObject.correctX;
            gameObject.y = gameObject.correctY;
            gameObject.setDepth(0);
            this.puzzleGroup.add(gameObject);
            this.piecesGroup.remove(gameObject);

            if (this.piecesGroup.getChildren().length === 0) {
              scene.time.delayedCall(500, () => {
                document.getElementById('completed-image').src = this.completedImageURL;
                const messages = [
                  'クリア！ がんばったね！',
                  'すごい！ 完璧だよ！',
                  'やったね！ おめでとう！',
                  '素晴らしい！ よくできました！',
                  '最高！ 天才だね！',
                  'すごい集中力！',
                  '素敵なパズルが完成したね！',
                  '驚いた！ とても早かったよ！',
                  '大成功！ 楽しかったかな？',
                  'やった！ 次も挑戦してみよう！',
                ];
                const randomMessage =
                  messages[Math.floor(Math.random() * messages.length)];
                document.getElementById('clear-message').textContent = randomMessage;

                document.getElementById('game-screen').style.display = 'none';
                document.getElementById('game-clear-screen').style.display = 'block';
              });
            }
          }
        });
      };

      img.src = this.selectedImage;
    }
  }

  new PuzzleGame();
})();

