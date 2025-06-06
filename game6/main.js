class TitleScene extends Phaser.Scene {
  constructor() { super('title'); }
  create() {
    const { width, height } = this.scale;
    this.add.text(width/2, height*0.25, '反応トレーナー', {fontSize:'32px', color:'#000'}).setOrigin(0.5);
    this.add.text(width/2, height*0.35, '〜タッチで勝負！〜', {fontSize:'20px', color:'#000'}).setOrigin(0.5);

    const mode1 = this.add.text(width/2, height*0.55, 'スピード反応モード', {fontSize:'26px', backgroundColor:'#1976d2', color:'#fff', padding:10})
      .setOrigin(0.5).setInteractive();
    const mode2 = this.add.text(width/2, height*0.7, '判断反応モード', {fontSize:'26px', backgroundColor:'#388e3c', color:'#fff', padding:10})
      .setOrigin(0.5).setInteractive();

    mode1.on('pointerdown', () => this.scene.start('game', {mode:'speed'}));
    mode2.on('pointerdown', () => this.scene.start('game', {mode:'judge'}));
  }
}

class GameScene extends Phaser.Scene {
  constructor(){ super('game'); }
  init(data){
    this.mode = data.mode || 'speed';
    this.attempt = 0;
    this.results = [];
    this.measureCount = 0; // for judge mode
  }
  create(){
    const { width, height } = this.scale;
    this.statusText = this.add.text(width/2, height*0.1, '', {fontSize:'24px', color:'#000'}).setOrigin(0.5);

    this.buttons = [];
    const btnSize = Math.min(width, height) / 5;
    for(let r=0;r<3;r++){
      for(let c=0;c<3;c++){
        const x = width/2 + (c-1)*btnSize*1.2;
        const y = height/2 + (r-1)*btnSize*1.2;
        const g = this.add.graphics();
        g.fillStyle(0xcccccc,1);
        g.fillRoundedRect(-btnSize/2,-btnSize/2,btnSize,btnSize,20);
        const container = this.add.container(x,y,g);
        container.setSize(btnSize,btnSize);
        container.setInteractive();
        container.visible = false; // hidden until active
        container.on('pointerdown', () => this.handlePress(container));
        this.buttons.push(container);
      }
    }

    this.runAttempt();
  }

  showGuide(callback){
    const { width, height } = this.scale;
    this.statusText.setText('ここに1秒以上指を置いてね');
    const zoneY = height*0.85;
    const radius = 50;
    this.guideCircle = this.add.circle(width/2, zoneY, radius, 0xaaaaaa).setAlpha(0.5);
    this.guideCircle.setInteractive();
    let timer = null;
    const cancel = ()=>{ if(timer){ timer.remove(false); timer=null; } };
    this.guideCircle.on('pointerdown', ()=>{
      cancel();
      timer = this.time.delayedCall(1000, ()=>{
        this.guideCircle.destroy();
        this.statusText.setText('READY...');
        this.time.delayedCall(Phaser.Math.Between(1000,3000), ()=>{
          callback();
        });
      });
    });
    this.guideCircle.on('pointerup', ()=>{
      this.statusText.setText('もう一度置いてね');
      cancel();
    });
  }

  runAttempt(){
    this.showGuide(()=>this.activateButton());
  }

  activateButton(){
    const { width, height } = this.scale;
    this.buttons.forEach(b=>{b.visible=false;});
    const idx = Phaser.Math.Between(0,this.buttons.length-1);
    const btn = this.buttons[idx];
    btn.visible = true;

    let colorInfo;
    if(this.mode==='judge'){
      const colors = [
        {key:'blue', color:0x2196f3, mark:'◎'},
        {key:'red', color:0xf44336, mark:'▲'},
        {key:'green', color:0x4caf50, mark:'■'}
      ];
      colorInfo = Phaser.Utils.Array.GetRandom(colors);
      const g = btn.list[0];
      g.clear();
      g.fillStyle(colorInfo.color,1);
      g.fillRoundedRect(-btn.width/2,-btn.height/2,btn.width,btn.height,20);
      btn.removeAll(true);
      btn.add(g);
      const txt = this.add.text(0,0,colorInfo.mark,{fontSize:'32px',color:'#fff'}).setOrigin(0.5);
      btn.add(txt);
    }else{
      const g = btn.list[0];
      g.clear();
      g.fillStyle(0xffeb3b,1);
      g.fillRoundedRect(-btn.width/2,-btn.height/2,btn.width,btn.height,20);
    }

    this.activeButton = btn;
    this.activeColor = colorInfo ? colorInfo.key : 'yellow';
    btn.startTime = performance.now();

    if(this.mode==='judge' && this.activeColor!=='blue'){
      // non blue: wait and move on
      btn.missTimer = this.time.delayedCall(2000, ()=>{
        this.showCross(btn.x, btn.y);
        this.nextRound(false);
      });
    } else if(this.mode==='judge'){
      // blue - measure
      btn.missTimer = this.time.delayedCall(2000, ()=>{
        this.showCross(btn.x, btn.y);
        this.nextRound(false,true); // blue missed
      });
    }
  }

  handlePress(btn){
    if(btn!==this.activeButton) {
      if(this.mode==='judge'){
        // wrong button press counts as miss
        this.showCross(btn.x, btn.y);
        if(this.activeButton && this.activeButton.missTimer){
          this.activeButton.missTimer.remove(false);
        }
        if(this.activeColor==='blue'){
          this.nextRound(false,true);
        }else{
          this.nextRound(false);
        }
      }
      return;
    }
    // correct button
    if(this.activeButton.missTimer){
      this.activeButton.missTimer.remove(false);
    }
    const reaction = performance.now() - this.activeButton.startTime;
    this.showTime(btn.x, btn.y, reaction);
    const isBlue = this.mode==='judge' && this.activeColor==='blue';
    this.nextRound(isBlue ? reaction : reaction, isBlue);
  }

  showTime(x,y,time){
    const txt = this.add.text(x, y, time.toFixed(3)+'ms', {fontSize:'20px', color:'#000'}).setOrigin(0.5);
    this.tweens.add({ targets: txt, y:y-40, alpha:0, duration:1000, onComplete:()=>txt.destroy()});
  }

  showCross(x,y){
    const txt = this.add.text(x, y, '✕', {fontSize:'40px', color:'#f00'}).setOrigin(0.5);
    this.tweens.add({ targets: txt, y:y-40, alpha:0, duration:800, onComplete:()=>txt.destroy()});
  }

  nextRound(reaction, blueAttempt=false){
    if(blueAttempt){
      this.measureCount++;
      if(typeof reaction === 'number') this.results.push(reaction);
    } else if(this.mode==='speed') {
      this.results.push(reaction);
      this.measureCount++;
    }

    if(this.measureCount>=5){
      this.scene.start('result', {results:this.results});
      return;
    }

    this.time.delayedCall(500, ()=>{
      this.runAttempt();
    });
  }
}

class ResultScene extends Phaser.Scene {
  constructor(){ super('result'); }
  init(data){ this.results = data.results; }
  create(){
    const {width,height}=this.scale;
    this.add.text(width/2,height*0.2,'結果',{fontSize:'32px',color:'#000'}).setOrigin(0.5);
    let y = height*0.35;
    let sum = 0;
    for(let i=0;i<this.results.length;i++){
      const t = this.results[i];
      this.add.text(width/2,y,`${i+1}回目: ${t.toFixed(3)}ms`,{fontSize:'24px',color:'#000'}).setOrigin(0.5);
      sum += t;
      y += 40;
    }
    const avg = sum/this.results.length || 0;
    this.add.text(width/2,y+20,`平均: ${avg.toFixed(3)}ms`,{fontSize:'28px',color:'#000'}).setOrigin(0.5);
    const btn = this.add.text(width/2,height*0.85,'タイトルへ',{fontSize:'26px',backgroundColor:'#1976d2',color:'#fff',padding:10}).setOrigin(0.5).setInteractive();
    btn.on('pointerdown',()=>this.scene.start('title'));
  }
}

const config = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: window.innerWidth,
  height: window.innerHeight,
  backgroundColor: '#ffffff',
  scene: [TitleScene, GameScene, ResultScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  resolution: window.devicePixelRatio
};

const game = new Phaser.Game(config);
window.addEventListener('resize',()=>{ game.scale.resize(window.innerWidth,window.innerHeight); });
