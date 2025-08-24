let selectedImage = null;
let rows = 3;
let cols = 4;
let pieceWidth;
let pieceHeight;
let piecesGroup;
let puzzleGroup;
let gameWidth = window.innerWidth;
let gameHeight = Math.max(600, window.innerHeight - 240); // ヘッダ分を考慮しつつ最低高さ
let imageKey = '';
let imageCounter = 0;
let completedImageURL = ''; // 完成画像
let totalPieces = 0;
let placedCount = 0;

const elStartBtn = document.getElementById('start-button');
const elPreviewWrap = document.getElementById('image-preview');
const elPreviewImg = document.getElementById('preview-img');
const elToast = document.getElementById('toast');
const elProgBar = document.getElementById('progress-bar');
const elProgText = document.getElementById('progress-text');
const elZoom = document.getElementById('zoom-slider');
const elPieceSelect = document.getElementById('piece-count');
const elPieceDisplay = document.getElementById('piece-count-display');
if (elPieceSelect) {
  if (elPieceDisplay) {
    elPieceDisplay.textContent = elPieceSelect.options[elPieceSelect.selectedIndex].textContent;
  }
  elPieceSelect.addEventListener('change', function (e) {
    const value = e.target.value;
    if (value === '3x4') { rows = 3; cols = 4; }
    else if (value === '4x5') { rows = 4; cols = 5; }
    else if (value === '6x8') { rows = 6; cols = 8; }
    // プログレス初期化
    totalPieces = rows * cols;
    placedCount = 0;
    updateProgress();
    if (elPieceDisplay) {
      elPieceDisplay.textContent = e.target.options[e.target.selectedIndex].textContent;
    }
  });
}

// 画像選択 → プレビュー＆開始ボタン有効化
document.getElementById('upload-image').addEventListener('change', function (e) {
  const file = e.target.files[0];
  if (file && file.size <= 5 * 1024 * 1024) {
    const reader = new FileReader();
    reader.onload = function (event) {
      selectedImage = event.target.result;
      elStartBtn.disabled = false;
      elStartBtn.setAttribute('aria-disabled', 'false');
      // プレビュー表示
      elPreviewImg.src = selectedImage;
      elPreviewWrap.style.display = 'block';
      elPreviewWrap.setAttribute('aria-hidden', 'false');
    };
    reader.readAsDataURL(file);
  } else {
    alert('5MB以下のPNGまたはJPG画像を選択してください。');
    elStartBtn.disabled = true;
    elStartBtn.setAttribute('aria-disabled', 'true');
    elPreviewWrap.style.display = 'none';
    elPreviewWrap.setAttribute('aria-hidden', 'true');
  }
});

document.getElementById('start-button').addEventListener('click', function () {
  if (selectedImage) {
    document.getElementById('start-screen').style.display = 'none';
    document.getElementById('game-screen').style.display = 'block';
    initGame();
  }
});

document.getElementById('retry-button').addEventListener('click', function () {
  location.reload();
});

document.getElementById('reset-button').addEventListener('click', function () {
  location.reload();
});

function initGame() {
  imageCounter++;
  imageKey = 'puzzleImage_' + imageCounter;
  totalPieces = rows * cols;
  placedCount = 0;
  updateProgress();

  const config = {
    type: Phaser.AUTO,
    width: gameWidth,
    height: gameHeight * 2, // スクロール可能
    parent: 'game-container',
    // 明るい背景色でCSSの --bg と調和させる
    backgroundColor: 0xf9fbff,
    scene: { preload, create }
  };
  new Phaser.Game(config);
}

function preload() {
  if (this.textures.exists(imageKey)) {
    this.textures.remove(imageKey);
  }
}

function create() {
  const scene = this;
  // ゲーム全体の背景色を統一
  scene.cameras.main.setBackgroundColor(0xf9fbff);

  if (elZoom) {
    elZoom.addEventListener('input', e => {
      scene.cameras.main.setZoom(parseFloat(e.target.value));
    });
  }

  const img = new Image();
  img.onload = function () {
    // 枠線付きキャンバスに描画（完成画像保存兼用）
    const canvas = document.createElement('canvas');
    canvas.width = img.width + 8;
    canvas.height = img.height + 8;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 4, 4);
    scene.textures.addImage(imageKey, canvas);

    const texture = scene.textures.get(imageKey).getSourceImage();
    completedImageURL = canvas.toDataURL();

    // 画像サイズをフィット
    const scaleX = (gameWidth * 0.8) / texture.width;
    const scaleY = (gameHeight * 0.4) / texture.height;
    const scale = Math.min(scaleX, scaleY);
    const imageWidth = texture.width * scale;
    const imageHeight = texture.height * scale;

    pieceWidth = Math.floor(imageWidth / cols);
    pieceHeight = Math.floor(imageHeight / rows);

    const frameX = (gameWidth - imageWidth) / 2;
    const frameY = 10;
    const frameWidth = pieceWidth * cols;
    const frameHeight = pieceHeight * rows;

    // パズル枠（淡色）
    const graphics = scene.add.graphics();
    graphics.lineStyle(4, 0xf5a623);
    graphics.strokeRect(frameX, frameY, frameWidth, frameHeight);
    graphics.fillStyle(0xffffff, .65);
    graphics.fillRect(frameX, frameY, frameWidth, frameHeight);
    graphics.setDepth(0);

    // ガイド格子（薄く）
    graphics.lineStyle(1, 0x5b7cff, 0.18);
    for (let i = 1; i < cols; i++) {
      const x = frameX + i * pieceWidth;
      graphics.moveTo(x, frameY); graphics.lineTo(x, frameY + frameHeight);
    }
    for (let i = 1; i < rows; i++) {
      const y = frameY + i * pieceHeight;
      graphics.moveTo(frameX, y); graphics.lineTo(frameX + frameWidth, y);
    }
    graphics.strokePath();

    // 完成形のプレビュー（淡く）
    const previewX = (gameWidth - imageWidth) / 2;
    const previewY = frameY + frameHeight + 20;
    const previewImage = scene.add.image(previewX, previewY, imageKey);
    previewImage.setOrigin(0, 0);
    previewImage.setScale(scale);
    previewImage.setDepth(0);
    previewImage.setAlpha(0.85);

    // ピース生成
    piecesGroup = scene.add.group();
    puzzleGroup = scene.add.group();

    let id = 0;
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = frameX + col * pieceWidth;
        const y = frameY + row * pieceHeight;

        const pieceTextureKey = imageKey + '_piece_' + id;
        const canvasTexture = scene.textures.createCanvas(pieceTextureKey, pieceWidth, pieceHeight);
        const cctx = canvasTexture.context;
        cctx.drawImage(
          texture,
          (col * pieceWidth) / scale, (row * pieceHeight) / scale,
          pieceWidth / scale, pieceHeight / scale,
          0, 0, pieceWidth, pieceHeight
        );
        cctx.strokeStyle = 'rgba(0,0,0,0.2)';
        cctx.lineWidth = 0.5;          // 極細ライン
        cctx.strokeRect(0, 0, pieceWidth, pieceHeight);
        canvasTexture.refresh();

        const piece = scene.add.image(0, 0, pieceTextureKey);
        piece.setOrigin(0);
        piece.setInteractive({ draggable: true });
        scene.input.setDraggable(piece);

        piece.correctX = x;
        piece.correctY = y;

        // ランダム配置（プレビュー下に帯で）
        const posX = Phaser.Math.Between(20, gameWidth - pieceWidth - 20);
        const posY = previewY + imageHeight + 40 + Phaser.Math.Between(0, 100);
        piece.x = posX;
        piece.y = posY;

        piecesGroup.add(piece);
        id++;
      }
    }

    // ドラッグ挙動
    scene.input.on('dragstart', function (pointer, gameObject) {
      gameObject.setDepth(2);
    });

    scene.input.on('drag', function (pointer, gameObject, dragX, dragY) {
      gameObject.x = dragX;
      gameObject.y = dragY;
    });

    scene.input.on('dragend', function (pointer, gameObject) {
      const distance = Phaser.Math.Distance.Between(
        gameObject.x, gameObject.y, gameObject.correctX, gameObject.correctY
      );

      if (distance < 30) {
        // スナップ
        gameObject.x = gameObject.correctX;
        gameObject.y = gameObject.correctY;
        gameObject.setDepth(1);
        puzzleGroup.add(gameObject);
        piecesGroup.remove(gameObject);

        placedCount++;
        updateProgress();
        toast('ぴったり！');
        sfxSnap();

        // クリア判定
        if (piecesGroup.getChildren().length === 0) {
          scene.time.delayedCall(500, () => {
            // 完成画像セット
            document.getElementById('completed-image').src = completedImageURL;
            // 祝福メッセージ
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
              'やった！ 次も挑戦してみよう！'
            ];
            const randomMessage = messages[Math.floor(Math.random() * messages.length)];
            document.getElementById('clear-message').textContent = randomMessage;

            // 画面遷移
            document.getElementById('game-screen').style.display = 'none';
            document.getElementById('game-clear-screen').style.display = 'block';

            // 紙吹雪
            celebrate();
          });
        }
      }
    });
  };
  img.src = selectedImage;
}

/* ====== UI ユーティリティ ====== */
function updateProgress(){
  const total = totalPieces || (rows * cols);
  const pct = total ? Math.round((placedCount / total) * 100) : 0;
  if(elProgBar) elProgBar.style.width = `${pct}%`;
  if(elProgText) elProgText.textContent = `${pct}%`;
}

function toast(msg){
  if(!elToast) return;
  elToast.textContent = msg;
  elToast.classList.add('show');
  setTimeout(()=> elToast.classList.remove('show'), 900);
}

// 軽量SFX（WebAudio）
let _ctx;
function sfxSnap(){
  _ctx = _ctx || new (window.AudioContext||window.webkitAudioContext)();
  const o = _ctx.createOscillator();
  const g = _ctx.createGain();
  o.type="sine";
  o.frequency.setValueAtTime(660,_ctx.currentTime);
  g.gain.setValueAtTime(0.0001,_ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.28,_ctx.currentTime+0.02);
  g.gain.exponentialRampToValueAtTime(0.0001,_ctx.currentTime+0.18);
  o.connect(g).connect(_ctx.destination); o.start(); o.stop(_ctx.currentTime+0.2);
}

function celebrate(){
  const layer = document.getElementById('confetti-layer');
  if(!layer) return;
  const N = 80;
  const colors = ['#5b7cff','#22c55e','#f97316','#eab308','#ef4444'];
  for(let i=0;i<N;i++){
    const c = document.createElement('div');
    c.className = 'confetti';
    c.style.left = (Math.random()*100) + '%';
    c.style.top = '-20px';
    c.style.background = colors[i % colors.length];
    layer.appendChild(c);
    const dur = 700 + Math.random()*800;
    const rot = Math.random()*360;
    c.animate(
      [{ transform:`translateY(0) rotate(0deg)`, opacity:1 },
       { transform:`translateY(110vh) rotate(${rot}deg)`, opacity:1 }],
      { duration: dur, easing: 'cubic-bezier(.3,.8,.2,1)' }
    ).onfinish = () => c.remove();
  }
}
