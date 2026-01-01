const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const loadingEl = document.getElementById('loading');
const messageOverlay = document.getElementById('message-overlay');

const backgroundImage = new Image();
backgroundImage.src = 'background.jpg.jpeg';

let backgroundAvailable = false;

const state = {
  blocks: [],
  particles: [],
  ball: { x: 0, y: 0, radius: 12, speed: 360, vx: 0, vy: -1 },
  target: null,
  lastTime: 0,
  ready: false,
  started: false,
  triggered: false,
  completed: false,
  ballVisible: true,
  messageScheduled: false,
};

const palette = {
  gold: ['#f9e076', '#f7c948', '#d9a441'],
  red: ['#ff4f4f', '#e32727'],
  white: ['#fff7f0', '#f3e7d3'],
  particles: ['#f7d774', '#f5f5f5', '#ff6666'],
};

const layout = {
  rows: 5,
  cols: 9,
  gap: 0,
  marginTop: 110,
  marginSide: 60,
};

function resizeCanvas() {
  const ratio = window.devicePixelRatio || 1;
  canvas.width = Math.floor(window.innerWidth * ratio);
  canvas.height = Math.floor(window.innerHeight * ratio);
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  setupBlocks();
  resetBall();
}

function setupBlocks() {
  const availableWidth = window.innerWidth - layout.marginSide * 2;
  const blockWidth = (availableWidth - layout.gap * (layout.cols - 1)) / layout.cols;
  const blockHeight = 36;
  const blocks = [];

  for (let row = 0; row < layout.rows; row += 1) {
    for (let col = 0; col < layout.cols; col += 1) {
      const x = layout.marginSide + col * (blockWidth + layout.gap);
      const y = layout.marginTop + row * (blockHeight + layout.gap);
      const useGold = (row + col) % 2 === 0;
      blocks.push({
        x,
        y,
        width: blockWidth,
        height: blockHeight,
        hits: 1,
        colors: useGold ? palette.gold : [...palette.red, ...palette.white],
      });
    }
  }

  state.blocks = blocks;
  state.target = pickTarget();
}

function resetBall() {
  state.ball.x = window.innerWidth / 2;
  state.ball.y = window.innerHeight - 120;
  state.ball.vx = 0;
  state.ball.vy = -1;
  state.target = pickTarget();
  state.started = false;
  state.triggered = false;
  state.completed = false;
  state.ballVisible = true;
  state.messageScheduled = false;
  messageOverlay.classList.remove('is-visible');
  messageOverlay.setAttribute('aria-hidden', 'true');
}

function pickTarget() {
  if (!state.blocks.length) return null;
  let closest = state.blocks[0];
  let minDist = Infinity;
  for (const block of state.blocks) {
    const cx = block.x + block.width / 2;
    const cy = block.y + block.height / 2;
    const dx = cx - state.ball.x;
    const dy = cy - state.ball.y;
    const dist = dx * dx + dy * dy;
    if (dist < minDist) {
      minDist = dist;
      closest = block;
    }
  }
  return closest;
}

function spawnParticles(x, y) {
  const count = 18;
  for (let i = 0; i < count; i += 1) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 60 + Math.random() * 140;
    state.particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 0.9 + Math.random() * 0.6,
      radius: 2 + Math.random() * 3,
      color: palette.particles[Math.floor(Math.random() * palette.particles.length)],
    });
  }
}

function updateParticles(dt) {
  const gravity = 180;
  state.particles = state.particles.filter((p) => {
    p.life -= dt;
    p.vy += gravity * dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    return p.life > 0;
  });

  if (state.completed && !state.messageScheduled && state.particles.length === 0) {
    state.messageScheduled = true;
    setTimeout(() => {
      messageOverlay.classList.add('is-visible');
      messageOverlay.setAttribute('aria-hidden', 'false');
    }, 1000);
  }
}

function updateBall(dt) {
  if (!state.started || !state.target || !state.ballVisible) return;
  const targetX = state.target.x + state.target.width / 2;
  const targetY = state.target.y + state.target.height / 2;
  const dx = targetX - state.ball.x;
  const dy = targetY - state.ball.y;
  const distance = Math.hypot(dx, dy) || 1;
  const directionX = dx / distance;
  const directionY = dy / distance;

  const speed = state.ball.speed;
  state.ball.vx = directionX * speed;
  state.ball.vy = directionY * speed;

  state.ball.x += state.ball.vx * dt;
  state.ball.y += state.ball.vy * dt;

  if (distance < state.ball.radius + 8) {
    hitBlock(state.target);
  }
}

function hitBlock(block) {
  if (state.triggered) return;
  state.triggered = true;
  const index = state.blocks.indexOf(block);
  if (index !== -1) {
    state.blocks.forEach((remainingBlock) => {
      const impactX = remainingBlock.x + remainingBlock.width / 2;
      const impactY = remainingBlock.y + remainingBlock.height / 2;
      spawnParticles(impactX, impactY);
    });
    state.blocks = [];
    state.ballVisible = false;
  }
  state.target = pickTarget();
  if (!state.completed && state.blocks.length === 0) {
    state.completed = true;
  }
}

function drawBackground() {
  const cw = window.innerWidth;
  const ch = window.innerHeight;
  if (backgroundAvailable) {
    const iw = backgroundImage.width;
    const ih = backgroundImage.height;
    const scale = Math.max(cw / iw, ch / ih);
    const drawWidth = iw * scale;
    const drawHeight = ih * scale;
    const dx = (cw - drawWidth) / 2;
    const dy = (ch - drawHeight) / 2;

    ctx.drawImage(backgroundImage, dx, dy, drawWidth, drawHeight);
  } else {
    const gradient = ctx.createLinearGradient(0, 0, cw, ch);
    gradient.addColorStop(0, '#1a1a24');
    gradient.addColorStop(0.5, '#2f1a1a');
    gradient.addColorStop(1, '#0b0b0f');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, cw, ch);
  }
  ctx.fillStyle = 'rgba(3, 3, 8, 0.45)';
  ctx.fillRect(0, 0, cw, ch);
}

function drawBlocks() {
  for (const block of state.blocks) {
    const gradient = ctx.createLinearGradient(block.x, block.y, block.x + block.width, block.y + block.height);
    const colors = block.colors;
    const step = 1 / (colors.length - 1);
    colors.forEach((color, index) => {
      gradient.addColorStop(index * step, color);
    });
    ctx.fillStyle = gradient;
    ctx.shadowColor = 'rgba(255, 215, 128, 0.8)';
    ctx.shadowBlur = 16;
    ctx.fillRect(block.x, block.y, block.width, block.height);
    ctx.shadowBlur = 0;
  }
}

function drawBall() {
  if (!state.ballVisible) return;
  ctx.beginPath();
  ctx.fillStyle = '#fff3b0';
  ctx.shadowColor = 'rgba(255, 235, 170, 0.9)';
  ctx.shadowBlur = 20;
  ctx.arc(state.ball.x, state.ball.y, state.ball.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
}

function drawParticles() {
  for (const particle of state.particles) {
    ctx.globalAlpha = Math.max(particle.life, 0);
    ctx.beginPath();
    ctx.fillStyle = particle.color;
    ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawCelebration() {
  if (!state.completed) return;
  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(255, 228, 120, 0.85)';
  ctx.shadowBlur = 28;
  const gradient = ctx.createLinearGradient(centerX - 180, centerY - 40, centerX + 180, centerY + 40);
  gradient.addColorStop(0, '#fff2b8');
  gradient.addColorStop(0.5, '#ffe08a');
  gradient.addColorStop(1, '#ffb3b3');
  ctx.fillStyle = gradient;
  ctx.font = '700 clamp(64px, 14vw, 140px) "BIZ UDPMincho", serif';
  ctx.fillText('2026', centerX, centerY);
  ctx.shadowBlur = 18;
  ctx.fillStyle = 'rgba(255, 245, 210, 0.9)';
  ctx.font = '600 clamp(18px, 4vw, 30px) "BIZ UDPMincho", serif';
  ctx.fillText('祝彩あふれる年へ', centerX, centerY + 70);
  ctx.restore();
}

function drawGuidance() {
  if (!state.target || !state.ballVisible) return;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
  ctx.setLineDash([6, 8]);
  ctx.beginPath();
  ctx.moveTo(state.ball.x, state.ball.y);
  ctx.lineTo(state.target.x + state.target.width / 2, state.target.y + state.target.height / 2);
  ctx.stroke();
  ctx.setLineDash([]);
}

function loop(timestamp) {
  if (!state.ready) return;
  const dt = Math.min((timestamp - state.lastTime) / 1000, 0.033);
  state.lastTime = timestamp;

  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  drawBackground();

  updateBall(dt);
  updateParticles(dt);

  drawBlocks();
  drawGuidance();
  drawBall();
  drawParticles();
  drawCelebration();

  requestAnimationFrame(loop);
}

function start() {
  state.ready = true;
  state.lastTime = performance.now();
  loadingEl.classList.add('hidden');
  requestAnimationFrame(loop);
}

backgroundImage.addEventListener('load', () => {
  backgroundAvailable = true;
  resizeCanvas();
  start();
});

backgroundImage.addEventListener('error', () => {
  backgroundAvailable = false;
  loadingEl.textContent = '背景画像が見つかりませんでした。仮背景で開始します。';
  resizeCanvas();
  start();
});

canvas.addEventListener('pointerdown', () => {
  if (!state.ready || state.started || state.completed) return;
  state.started = true;
});

window.addEventListener('resize', resizeCanvas);
