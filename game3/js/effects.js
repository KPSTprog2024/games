// サウンド再生
export function playSound(isCorrect, enabled) {
  if (!enabled) return;
  try {
    const ctx = new (window.AudioContext||window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    if (isCorrect) {
      osc.frequency.setValueAtTime(440,ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(880,ctx.currentTime+0.2);
    } else {
      osc.frequency.setValueAtTime(330,ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(220,ctx.currentTime+0.2);
    }
    gain.gain.setValueAtTime(0.2,ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0,ctx.currentTime+0.3);
    osc.start(); setTimeout(()=>{osc.stop();ctx.close();},300);
  } catch(e) { console.warn(e); }
}

// 紙吹雪エフェクト
export function createConfetti() {
  const body = document.body;
  const sheetExists = !!document.getElementById('confetti-style');
  if (!sheetExists) {
    const style = document.createElement('style');
    style.id = 'confetti-style';
    style.textContent = `
      @keyframes fall { to { transform: translateY(100vh) rotate(720deg); opacity:0; } }
    `;
    document.head.appendChild(style);
  }
  for (let i=0;i<50;i++) {
    const div = document.createElement('div');
    const size = Math.random()*10+5;
    div.className='confetti';
    div.style.cssText = `
      position:fixed; top:-10px; left:${Math.random()*100}vw;
      width:${size}px; height:${size}px;
      background:${['#ff9a9e','#a1c4fd','#f6d365','#96e6a1','#ffecd2'][Math.floor(Math.random()*5)]};
      opacity:1; transform:rotate(${Math.random()*360}deg);
      animation:fall ${1+Math.random()*2}s ease-in ${Math.random()*0.5}s forwards;
    `;
    body.appendChild(div);
    setTimeout(()=>body.removeChild(div),(3000));
  }
}
