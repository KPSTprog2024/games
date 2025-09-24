const canvas = document.getElementById('swingCanvas');
const ctx = canvas.getContext('2d');
const pushButton = document.getElementById('pushButton');
const resetButton = document.getElementById('resetButton');
const amplitudeValue = document.getElementById('amplitudeValue');
const feedbackElem = document.getElementById('feedback');

function resizeCanvas() {
  const width = canvas.clientWidth || canvas.width;
  const height = canvas.clientHeight || canvas.height;
  if (width === 0 || height === 0) {
    return;
  }
  canvas.width = width;
  canvas.height = height;
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

let theta = 0; // current angle [rad]
let thetaVel = 0; // angular velocity [rad/s]
let pulse = 0; // external forcing term
let lastTime = null;
let amplitudeIndicator = 0; // smoothed amplitude for display
let feedbackTimer = 0;

const naturalFrequency = (2 * Math.PI) / 2.8; // fundamental frequency (rad/s)
const damping = 0.42; // damping coefficient
const maxAngle = Math.PI / 3; // saturation (60 degrees)
const goodWindow = Math.PI / 12; // ~15 degrees around the bottom
const minSpeedForGood = 0.35;
const pushAccel = 9; // impulse strength (rad/s^2)
const maxPulse = 16;
const feedbackFade = 0.35;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function setFeedback(message, isBad = false) {
  feedbackElem.textContent = message;
  feedbackElem.classList.toggle('bad', isBad);
  feedbackElem.style.opacity = '1';
  feedbackTimer = 1.35; // seconds
}

function applyPush() {
  const direction = Math.sign(thetaVel || Math.sin(theta) || 1);
  const nearBottom = Math.abs(theta) < goodWindow;
  const movingFast = Math.abs(thetaVel) > minSpeedForGood;

  if (nearBottom) {
    const boost = movingFast ? pushAccel : pushAccel * 0.65;
    pulse = clamp(pulse + boost * direction, -maxPulse, maxPulse);
    if (movingFast) {
      setFeedback('ナイスタイミング！', false);
    } else {
      setFeedback('ゆっくり押し出したよ', false);
    }
  } else {
    const penaltyDirection = direction || 1;
    pulse = clamp(pulse - pushAccel * 0.55 * penaltyDirection, -maxPulse, maxPulse);
    setFeedback('タイミングを合わせよう', true);
  }

  pushButton.classList.add('active');
  setTimeout(() => pushButton.classList.remove('active'), 140);
}

function resetSwing() {
  theta = 0;
  thetaVel = 0;
  pulse = 0;
  amplitudeIndicator = 0;
  feedbackTimer = 0;
  feedbackElem.textContent = '';
  feedbackElem.style.opacity = '0';
}

pushButton.addEventListener('click', applyPush);
resetButton.addEventListener('click', resetSwing);

function drawScene() {
  const { width, height } = canvas;
  ctx.clearRect(0, 0, width, height);

  const skyGradient = ctx.createLinearGradient(0, 0, 0, height);
  skyGradient.addColorStop(0, '#fafdff');
  skyGradient.addColorStop(1, '#dce7ff');
  ctx.fillStyle = skyGradient;
  ctx.fillRect(0, 0, width, height);

  const groundHeight = height * 0.16;
  const groundGradient = ctx.createLinearGradient(0, height - groundHeight, 0, height);
  groundGradient.addColorStop(0, '#bfe3c5');
  groundGradient.addColorStop(1, '#9dd39d');
  ctx.fillStyle = groundGradient;
  ctx.fillRect(0, height - groundHeight, width, groundHeight);

  const pivotX = width / 2;
  const pivotY = height * 0.16;
  const ropeLength = Math.min(width * 0.42, height * 0.65);
  const seatWidth = Math.min(140, width * 0.28);
  const seatHeight = seatWidth * 0.2;
  const headRadius = seatWidth * 0.15;
  const bodyLength = seatWidth * 0.45;

  // guide lines showing maximum amplitude range
  ctx.save();
  ctx.translate(pivotX, pivotY);
  ctx.strokeStyle = 'rgba(57, 87, 249, 0.2)';
  ctx.lineWidth = 3;
  ctx.setLineDash([10, 12]);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(Math.sin(maxAngle) * ropeLength, Math.cos(maxAngle) * ropeLength);
  ctx.moveTo(0, 0);
  ctx.lineTo(Math.sin(-maxAngle) * ropeLength, Math.cos(-maxAngle) * ropeLength);
  ctx.stroke();
  ctx.restore();

  // support beam
  ctx.strokeStyle = '#8294c9';
  ctx.lineWidth = Math.max(6, width * 0.01);
  ctx.beginPath();
  ctx.moveTo(width * 0.2, pivotY - height * 0.05);
  ctx.lineTo(width * 0.8, pivotY - height * 0.05);
  ctx.stroke();

  // swing position
  const seatX = pivotX + Math.sin(theta) * ropeLength;
  const seatY = pivotY + Math.cos(theta) * ropeLength;

  // rope
  ctx.strokeStyle = '#5d6f9f';
  ctx.lineWidth = Math.max(6, width * 0.012);
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(pivotX, pivotY);
  ctx.lineTo(seatX, seatY);
  ctx.stroke();

  // pivot joint
  ctx.fillStyle = '#4a62b1';
  ctx.beginPath();
  ctx.arc(pivotX, pivotY, Math.max(8, width * 0.015), 0, Math.PI * 2);
  ctx.fill();

  // seat and rider
  ctx.save();
  ctx.translate(seatX, seatY);
  ctx.rotate(theta);

  // seat
  ctx.fillStyle = '#ffb347';
  ctx.fillRect(-seatWidth / 2, -seatHeight / 2, seatWidth, seatHeight);
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
  ctx.lineWidth = 2;
  ctx.strokeRect(-seatWidth / 2, -seatHeight / 2, seatWidth, seatHeight);

  // rider body
  ctx.fillStyle = '#4f7cff';
  ctx.fillRect(-seatWidth * 0.14, -seatHeight / 2 - bodyLength, seatWidth * 0.28, bodyLength);

  // rider head
  ctx.beginPath();
  ctx.fillStyle = '#ffd8b1';
  ctx.arc(0, -seatHeight / 2 - bodyLength - headRadius, headRadius, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();

  // draw a subtle shadow under the seat
  const shadowY = seatY + Math.cos(theta) * seatHeight * 0.4 + Math.sin(theta) * seatWidth * 0.1;
  const shadowWidth = seatWidth * 0.9;
  const shadowHeight = seatHeight * 0.35;
  ctx.save();
  ctx.translate(seatX, shadowY);
  ctx.rotate(theta * 0.2);
  const shadowGradient = ctx.createRadialGradient(0, 0, 4, 0, 0, shadowWidth);
  shadowGradient.addColorStop(0, 'rgba(0, 0, 0, 0.2)');
  shadowGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = shadowGradient;
  ctx.beginPath();
  ctx.ellipse(0, 0, shadowWidth, shadowHeight, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function step(timestamp) {
  if (lastTime === null) {
    lastTime = timestamp;
    requestAnimationFrame(step);
    return;
  }

  let dt = (timestamp - lastTime) / 1000;
  dt = Math.min(dt, 0.05); // guard against large time steps
  lastTime = timestamp;

  // equation: theta'' + 2*damping*theta' + omega^2*sin(theta) = pulse
  const restoring = -Math.pow(naturalFrequency, 2) * Math.sin(theta);
  const dampingTerm = -2 * damping * thetaVel;
  const thetaAcc = restoring + dampingTerm + pulse;

  thetaVel += thetaAcc * dt;
  theta += thetaVel * dt;

  // saturate amplitude for safety
  if (Math.abs(theta) > maxAngle) {
    theta = Math.sign(theta) * maxAngle;
    thetaVel *= 0.45;
  }

  // decay the pulse (short impulse)
  const pulseDecayRate = 12;
  pulse *= Math.exp(-pulseDecayRate * dt);

  amplitudeIndicator = Math.max(Math.abs(theta), amplitudeIndicator * Math.exp(-dt * 1.6));
  amplitudeValue.textContent = `${(amplitudeIndicator * 180 / Math.PI).toFixed(1)}°`;

  if (feedbackTimer > 0) {
    feedbackTimer -= dt;
    if (feedbackTimer <= 0) {
      feedbackElem.style.opacity = '0';
      feedbackElem.textContent = '';
      feedbackElem.classList.remove('bad');
    } else if (feedbackTimer < feedbackFade) {
      const ratio = Math.max(feedbackTimer / feedbackFade, 0);
      feedbackElem.style.opacity = ratio.toString();
    }
  }

  drawScene();
  requestAnimationFrame(step);
}

requestAnimationFrame(step);
