export class AudioManager {
  constructor() {
    this.ctx = null;
    this.enabled = false;
  }

  unlock() {
    if (this.enabled) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC();
    this.enabled = true;
  }

  beep(freq = 440, duration = 0.08, type = 'square', gain = 0.04) {
    if (!this.enabled || !this.ctx) return;
    const t0 = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const amp = this.ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    amp.gain.setValueAtTime(gain, t0);
    amp.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
    osc.connect(amp);
    amp.connect(this.ctx.destination);
    osc.start(t0);
    osc.stop(t0 + duration);
  }

  playCapture() {
    this.beep(660, 0.09, 'square', 0.045);
    this.beep(920, 0.07, 'triangle', 0.035);
  }

  playMiss() {
    this.beep(200, 0.15, 'sawtooth', 0.05);
  }

  playClear() {
    this.beep(520, 0.08, 'triangle', 0.045);
    this.beep(780, 0.1, 'triangle', 0.04);
  }

  playButton() {
    this.beep(400, 0.04, 'square', 0.03);
  }
}
