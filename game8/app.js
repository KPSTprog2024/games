/* ==================================================
   app.js  —  Updated to match style.css v1.0
   - クラス名変更:
     active      → is-active (画面切替のみ)
     hidden      → is-hidden
     selected    → is-selected
     correct     → is-correct
     incorrect   → is-incorrect
     show-correct→ is-show-correct
     hint-flash  → is-hint-flash
   ================================================== */

class EventBus {
  constructor() {
    this.events = {};
  }
  on(event, handler) {
    (this.events[event] ||= []).push(handler);
  }
  emit(event, data) {
    (this.events[event] || []).forEach(h => h(data));
  }
}

const eventBus = new EventBus();

const Game = (() => {
  /* ---------- Game constants ---------- */
  const gameData = {
    gameTitle: "でてきたの、なに？",
    subtitle: "〜見て、おぼえて、順番にタップ〜",
    emojis: {
      animals: ["🐶", "🐱", "🐭", "🐰", "🐼", "🐸", "🐷", "🐘", "🐵", "🐥"],
      foods: ["🍎", "🍌", "🍇", "🍓", "🍉", "🥕", "🍞", "🍚", "🍩", "🍰"],
      toys: ["🛝", "🎈", "🧩", "🎲"],
      vehicles: ["🚗", "🚌", "🚓", "🚑", "🚒", "🚲", "✈️", "🚤"],
      items: ["🎒", "🛏", "🔑"]
    },
    gameSettings: {
      normalMode: { startLevel: 2, maxLevel: 10, displayDuration: 1000 },
      hardMode:   { startPairs: 2, maxPairs: 5, displayDuration: 1200 }
    }
  };

  const GamePhases = {
    READY:"ready", DISPLAYING:"displaying", INPUT:"input", RESULT:"result"
  };

  /* ---------- Reactive state ---------- */
  let currentGameState = {
    mode:null, level:1, score:0, sequence:[], userSequence:[],
    isPlaying:false, isDisplaying:false,
    combo:0, maxCombo:0, hasMistake:false,
    phase:GamePhases.READY,
    settings:{ volume:0.5, soundEnabled:true, displaySpeed:"normal" }
  };

  /* ---------- Badges ---------- */
  const badges=[
    {id:"first_win", name:"はじめてのせいこう", emoji:"🎯", description:"はじめてレベルをクリアした", unlocked:false},
    {id:"level5",   name:"ちゅうきゅうせい",         emoji:"🏅", description:"レベル5に到達した",           unlocked:false},
    {id:"level10",  name:"じょうきゅうせい",       emoji:"🏆", description:"レベル10に到達した",          unlocked:false},
    {id:"combo10",  name:"コンボマスター",           emoji:"⚡", description:"10コンボを達成した",          unlocked:false},
    {id:"perfect",  name:"パーフェクト",             emoji:"✨", description:"ミスなしでレベルをクリアした", unlocked:false}
  ];

  /* ---------- Audio ---------- */
  let audioContext=null, gainNode=null;

  /* ---------- DOM refs ---------- */
  let elements={};

  /* ===== Application bootstrap ===== */
  function initializeApp(){
    initializeElements();
    setupEventListeners();
    initializeAudio();
    loadSettings();
    eventBus.on("phase",p=>console.log("Phase:",p));
    showScreen("top-screen");
  }

  /* ---------- DOM caching ---------- */
  function initializeElements(){
    elements={
      /* Screens */
      topScreen:        document.getElementById("top-screen"),
      gameScreen:       document.getElementById("game-screen"),
      settingsScreen:   document.getElementById("settings-screen"),
      /* Top buttons */
      normalModeBtn:    document.getElementById("normal-mode-btn"),
      hardModeBtn:      document.getElementById("hard-mode-btn"),
      settingsBtn:      document.getElementById("settings-btn"),
      tutorialBtn:      document.getElementById("tutorial-btn"),
      /* Game */
      backToMenuBtn:    document.getElementById("back-to-menu-btn"),
      currentLevel:     document.getElementById("current-level"),
      currentScore:     document.getElementById("current-score"),
      levelProgress:    document.getElementById("level-progress"),
      emojiDisplaySingle:document.getElementById("emoji-display-single"),
      emojiDisplayDual: document.getElementById("emoji-display-dual"),
      gameStatus:       document.getElementById("game-status"),
      statusText:       document.getElementById("status-text"),
      choiceArea:       document.getElementById("choice-area"),
      choiceGrid:       document.getElementById("choice-grid"),
      startGameBtn:     document.getElementById("start-game-btn"),
      nextLevelBtn:     document.getElementById("next-level-btn"),
      replayBtn:        document.getElementById("replay-btn"),
      hintBtn:          document.getElementById("hint-btn"),
      /* Settings */
      backFromSettingsBtn:document.getElementById("back-from-settings-btn"),
      volumeSlider:     document.getElementById("volume-slider"),
      volumeValue:      document.getElementById("volume-value"),
      soundToggle:      document.getElementById("sound-toggle"),
      displaySpeed:     document.getElementById("display-speed"),
      resetScoresBtn:   document.getElementById("reset-scores-btn"),
      /* Modal */
      resultModal:      document.getElementById("result-modal"),
      resultEmoji:      document.getElementById("result-emoji"),
      resultTitle:      document.getElementById("result-title"),
      resultMessage:    document.getElementById("result-message"),
      continueBtn:      document.getElementById("continue-btn"),
      endGameBtn:       document.getElementById("end-game-btn"),
      /* Loading */
      loadingScreen:    document.getElementById("loading-screen")
    };
  }

  /* ---------- Event listeners ---------- */
  function setupEventListeners(){
    /* Main menu */
    elements.normalModeBtn.addEventListener("click",()=>startGame("normal"));
    elements.hardModeBtn.addEventListener("click",()=>startGame("hard"));
    elements.settingsBtn.addEventListener("click",()=>showScreen("settings-screen"));
    elements.tutorialBtn.addEventListener("click",showTutorial);

    /* Game nav */
    elements.backToMenuBtn.addEventListener("click",()=>{showScreen("top-screen");resetGame();});
    /* Settings nav */
    elements.backFromSettingsBtn.addEventListener("click",()=>showScreen("top-screen"));

    /* Game controls */
    elements.startGameBtn.addEventListener("click",startLevel);
    elements.nextLevelBtn.addEventListener("click",nextLevel);
    elements.replayBtn.addEventListener("click",replayLevel);
    elements.hintBtn.addEventListener("click",showHint);

    /* Settings controls */
    elements.volumeSlider.addEventListener("input",e=>{
      const v=e.target.value/100;currentGameState.settings.volume=v;
      elements.volumeValue.textContent=e.target.value+"%";updateAudioVolume(v);saveSettings();
    });
    elements.soundToggle.addEventListener("click",()=>{
      currentGameState.settings.soundEnabled=!currentGameState.settings.soundEnabled;
      elements.soundToggle.textContent=currentGameState.settings.soundEnabled?"オン":"オフ";
      elements.soundToggle.classList.toggle("active",currentGameState.settings.soundEnabled);
      saveSettings();
    });
    elements.displaySpeed.addEventListener("change",e=>{currentGameState.settings.displaySpeed=e.target.value;saveSettings();});
    elements.resetScoresBtn.addEventListener("click",()=>{if(confirm("スコアをリセットしますか？")){localStorage.removeItem("emojiGameScores");alert("スコアをリセットしました！");}});

    /* Modal */
    elements.continueBtn.addEventListener("click",()=>{hideModal();nextLevel();});
    elements.endGameBtn.addEventListener("click",()=>{hideModal();showScreen("top-screen");resetGame();});
  }

  /* ---------- Screen switching ---------- */
  function showScreen(id){
    document.querySelectorAll(".screen").forEach(s=>s.classList.remove("is-active"));
    const tgt=document.getElementById(id);
    if(tgt) tgt.classList.add("is-active");
  }

  /* ---------- Game flow ---------- */
  function startGame(mode){
    Object.assign(currentGameState,{mode,level:1,score:0,sequence:[],userSequence:[],isPlaying:true,combo:0,maxCombo:0,hasMistake:false,phase:GamePhases.READY});
    eventBus.emit("phase",currentGameState.phase);
    showScreen("game-screen");
    updateGameUI();
    if(mode==="normal"){
      elements.emojiDisplaySingle.classList.remove("is-hidden");
      elements.emojiDisplayDual.classList.add("is-hidden");
    }else{
      elements.emojiDisplaySingle.classList.add("is-hidden");
      elements.emojiDisplayDual.classList.remove("is-hidden");
    }
    elements.startGameBtn.classList.remove("is-hidden");
    elements.nextLevelBtn.classList.add("is-hidden");
    elements.replayBtn.classList.add("is-hidden");
    elements.choiceArea.classList.add("is-hidden");
    elements.hintBtn.classList.add("is-hidden");
    updateStatusText("スタートボタンを押してください");
  }

  function startLevel(){
    currentGameState.userSequence=[];
    currentGameState.isDisplaying=true;
    currentGameState.phase=GamePhases.DISPLAYING;eventBus.emit("phase",currentGameState.phase);
    elements.startGameBtn.classList.add("is-hidden");
    elements.nextLevelBtn.classList.add("is-hidden");
    elements.replayBtn.classList.add("is-hidden");
    elements.choiceArea.classList.add("is-hidden");
    elements.hintBtn.classList.add("is-hidden");
    updateStatusText("よく見てね！");
    generateSequence();
    setTimeout(displaySequence,1000);
  }

  /* ---------- Sequence generation ---------- */
  function generateSequence(){
    const all=[...gameData.emojis.animals,...gameData.emojis.foods,...gameData.emojis.toys,...gameData.emojis.vehicles,...gameData.emojis.items];
    currentGameState.sequence=[];
    if(currentGameState.mode==="normal"){
      const len=gameData.gameSettings.normalMode.startLevel+currentGameState.level-1;
      for(let i=0;i<len;i++)currentGameState.sequence.push(all[Math.random()*all.length|0]);
    }else{
      const pairs=gameData.gameSettings.hardMode.startPairs+currentGameState.level-1;
      for(let i=0;i<pairs;i++)currentGameState.sequence.push({left:all[Math.random()*all.length|0],right:all[Math.random()*all.length|0]});
    }
  }

  /* ---------- Displaying sequence ---------- */
  function displaySequence(){
    const dur=getDisplayDuration();let idx=0;
    const showNext=()=>{
      if(idx>=currentGameState.sequence.length){setTimeout(()=>{currentGameState.isDisplaying=false;showChoices();},500);return;}
      const item=currentGameState.sequence[idx];
      if(currentGameState.mode==="normal"){
        const sq=elements.emojiDisplaySingle.querySelector(".emoji-square");
        sq.textContent=item;sq.classList.add("active");
        setTimeout(()=>{sq.classList.remove("active");sq.textContent="";idx++;setTimeout(showNext,200);},dur);
      }else{
        const l=elements.emojiDisplayDual.querySelector(".emoji-square.left"),r=elements.emojiDisplayDual.querySelector(".emoji-square.right");
        l.textContent=item.left;r.textContent=item.right;l.classList.add("active");r.classList.add("active");
        setTimeout(()=>{l.classList.remove("active");r.classList.remove("active");l.textContent="";r.textContent="";idx++;setTimeout(showNext,200);},dur);
      }
    };
    showNext();
  }

  /* ---------- Choice phase ---------- */
  function showChoices(){
    currentGameState.phase=GamePhases.INPUT;eventBus.emit("phase",currentGameState.phase);
    updateStatusText("順番にタップしてね！");
    elements.choiceArea.classList.remove("is-hidden");
    elements.hintBtn.classList.remove("is-hidden");
    const all=[...gameData.emojis.animals,...gameData.emojis.foods,...gameData.emojis.toys,...gameData.emojis.vehicles,...gameData.emojis.items];
    let options=[];
    if(currentGameState.mode==="normal"){
      options=[...currentGameState.sequence];
      while(options.length<Math.min(12,all.length)){
        const e=all[Math.random()*all.length|0];if(!options.includes(e))options.push(e);
      }
    }else{
      currentGameState.sequence.forEach(p=>{if(!options.includes(p.left))options.push(p.left);if(!options.includes(p.right))options.push(p.right);});
      while(options.length<Math.min(12,all.length)){
        const e=all[Math.random()*all.length|0];if(!options.includes(e))options.push(e);
      }
    }
    options.sort(()=>Math.random()-.5);
    elements.choiceGrid.innerHTML="";
    options.forEach(emo=>{
      const b=document.createElement("button");b.className="choice-item";b.textContent=emo;b.addEventListener("click",()=>handleChoice(emo));elements.choiceGrid.appendChild(b);
    });
  }

  /* ---------- Handle choice ---------- */
  function handleChoice(emo){
    if(currentGameState.isDisplaying)return;
    const idx=currentGameState.userSequence.length;let correct="",ok=false;
    if(currentGameState.mode==="normal"){correct=currentGameState.sequence[idx];ok=correct===emo;}else{
      const pair=currentGameState.sequence[idx>>1];correct=idx%2===0?pair.left:pair.right;ok=correct===emo;
    }
    const btn=[...elements.choiceGrid.children].find(b=>b.textContent===emo);
    if(ok){
      btn.classList.add("is-correct");currentGameState.userSequence.push(emo);currentGameState.combo++;currentGameState.maxCombo=Math.max(currentGameState.maxCombo,currentGameState.combo);
      if(currentGameState.combo>=3)showComboEffect(currentGameState.combo);
      playCorrectSound();
      const need=currentGameState.mode==="normal"?currentGameState.sequence.length:currentGameState.sequence.length*2;
      if(currentGameState.userSequence.length===need){setTimeout(levelComplete,1000);}  
    }else{
      btn.classList.add("is-incorrect");currentGameState.hasMistake=true;currentGameState.combo=0;playIncorrectSound();
      const cbtn=[...elements.choiceGrid.children].find(b=>b.textContent===correct);
      if(cbtn){cbtn.classList.add("is-show-correct");const lab=document.createElement("div");lab.className="correct-label";lab.textContent="これが正解！";cbtn.appendChild(lab);updateStatusText(`${idx+1}番目は ${correct} だったよ`);}
      setTimeout(levelFailed,2000);
    }
  }

  /* ---------- Result handling ---------- */
  function levelComplete(){
    currentGameState.phase=GamePhases.RESULT;eventBus.emit("phase",currentGameState.phase);
    currentGameState.score+=currentGameState.level*10;updateGameUI();checkBadges();
    showResultModal("🎉","せいかい！","よくできました！",true);
  }
  function levelFailed(){
    currentGameState.phase=GamePhases.RESULT;eventBus.emit("phase",currentGameState.phase);
    setTimeout(()=>{
      showCorrectSequence(()=>showResultModal("😢","ざんねん...","もういちど がんばろう！",false));
    },1000);
  }

  function showCorrectSequence(cb){
    updateStatusText("正解はこれだったよ！");
    const buttons=[...elements.choiceGrid.querySelectorAll(".choice-item")];
    buttons.forEach(b=>{b.disabled=true;b.classList.remove("is-selected","is-correct","is-incorrect")});
    let idx=0,const delay=800;
    const highlightNext=()=>{
      if(currentGameState.mode==="normal"){
        if(idx>=currentGameState.sequence.length){if(cb)setTimeout(cb,500);return;}
        const cor=currentGameState.sequence[idx];
        const b=buttons.find(x=>x.textContent===cor);
        if(b){b.classList.add("is-show-correct");const badge=document.createElement("span");badge.className="order-badge";badge.textContent=idx+1;b.appendChild(badge);setTimeout(()=>{idx++;highlightNext();},delay);}else{idx++;highlightNext();}
      }else{
        if(idx>=currentGameState.sequence.length*2){if(cb)setTimeout(cb,500);return;}
        const pair=currentGameState.sequence[idx>>1];const cor=idx%2===0?pair.left:pair.right;
        const b=buttons.find(x=>x.textContent===cor);
        if(b){b.classList.add("is-show-correct");const badge=document.createElement("span");badge.className="order-badge";badge.textContent=idx+1;b.appendChild(badge);setTimeout(()=>{idx++;highlightNext();},delay);}else{idx++;highlightNext();}
      }
    };
    highlightNext();
  }

  /* ---------- Modal ---------- */
  function showResultModal(emoji,title,msg,success){
    elements.resultEmoji.textContent=emoji;elements.resultTitle.textContent=title;
    if(!success){const ans=currentGameState.userSequence.length,total=currentGameState.mode==="normal"?currentGameState.sequence.length:currentGameState.sequence.length*2;
      msg+=`<div class="result-stats"><p>${ans}個正解 / 全${total}個中</p><div class="result-progress"><div class="result-progress-fill" style="width:${(ans/total)*100}%"></div></div></div>`;
      elements.endGameBtn.textContent="もういちど挑戦する";
    }else{elements.endGameBtn.textContent="おわる";}
    elements.resultMessage.innerHTML=msg;
    if(success){elements.continueBtn.classList.remove("is-hidden");elements.resultModal.querySelector(".modal-content").classList.add("success");elements.continueBtn.textContent=currentGameState.level>=10?"ゲームクリア！":"つぎのレベル";}else{elements.continueBtn.classList.add("is-hidden");elements.resultModal.querySelector(".modal-content").classList.remove("success");}
    elements.resultModal.classList.remove("is-hidden");
  }
  function hideModal(){elements.resultModal.classList.add("is-hidden");}

  /* ---------- Level flow ---------- */
  function nextLevel(){
    if(currentGameState.level>=10){showScreen("top-screen");resetGame();return;}
    currentGameState.level++;updateGameUI();
    elements.startGameBtn.classList.remove("is-hidden");
    elements.nextLevelBtn.classList.add("is-hidden");
    elements.replayBtn.classList.add("is-hidden");
    elements.choiceArea.classList.add("is-hidden");
    elements.hintBtn.classList.add("is-hidden");
    updateStatusText("つぎのレベル！スタートボタンを押してください");
    currentGameState.phase=GamePhases.READY;eventBus.emit("phase",currentGameState.phase);
  }
  function replayLevel(){
    elements.startGameBtn.classList.remove("is-hidden");
    elements.nextLevelBtn.classList.add("is-hidden");
    elements.replayBtn.classList.add("is-hidden");
    elements.choiceArea.classList.add("is-hidden");
    elements.hintBtn.classList.add("is-hidden");
    updateStatusText("スタートボタンを押してください");
    currentGameState.phase=GamePhases.READY;eventBus.emit("phase",currentGameState.phase);
  }
  function resetGame(){Object.assign(currentGameState,{mode:null,level:1,score:0,sequence:[],userSequence:[],isPlaying:false,isDisplaying:false,combo:0,maxCombo:0,hasMistake:false,phase:GamePhases.READY});eventBus.emit("phase",currentGameState.phase);}

  /* ---------- UI utils ---------- */
  function updateGameUI(){elements.currentLevel.textContent=`レベル ${currentGameState.level}`;elements.currentScore.textContent=`スコア: ${currentGameState.score}`;elements.levelProgress.style.width=`${(currentGameState.level/10)*100}%`;}
  const updateStatusText=t=>elements.statusText.textContent=t;
  function getDisplayDuration(){const base=currentGameState.mode==="normal"?gameData.gameSettings.normalMode.displayDuration:gameData.gameSettings.hardMode.displayDuration;return currentGameState.settings.displaySpeed==="slow"?base*1.5:currentGameState.settings.displaySpeed==="fast"?base*0.7:base;}

  /* ---------- Hint ---------- */
  function showHint(){if(currentGameState.userSequence.length<currentGameState.sequence.length){const idx=currentGameState.userSequence.length;const next=currentGameState.mode==="normal"?currentGameState.sequence[idx]:idx%2===0?currentGameState.sequence[idx>>1].left:currentGameState.sequence[idx>>1].right;const btn=[...elements.choiceGrid.children].find(b=>b.textContent===next);if(btn){btn.classList.add("is-hint-flash");setTimeout(()=>btn.classList.remove("is-hint-flash"),500);}currentGameState.score=Math.max(0,currentGameState.score-5);updateGameUI();}}

  /* ---------- Combo effect ---------- */
  function showComboEffect(c){const d=document.createElement("div");d.className="combo-effect";d.textContent=`${c} コンボ！ +${c}点`;document.body.appendChild(d);setTimeout(()=>{d.classList.add("fade-out");setTimeout(()=>document.body.removeChild(d),500);},1000);currentGameState.score+=c;updateGameUI();}

  /* ---------- Badge handling (unchanged) ---------- */
  function checkBadges(){let newB=[];if(!badges[0].unlocked&&currentGameState.level>1){badges[0].unlocked=true;newB.push(badges[0]);}if(!badges[1].unlocked&&currentGameState.level>=5){badges[1].unlocked=true;newB.push(badges[1]);}if(!badges[2].unlocked&&currentGameState.level>=10){badges[2].unlocked=true;newB.push(badges[2]);}if(!badges[3].unlocked&&currentGameState.maxCombo>=10){badges[3].unlocked=true;newB.push(badges[3]);}if(!badges[4].unlocked&&currentGameState.level>1&&!currentGameState.hasMistake){badges[4].unlocked=true;newB.push(badges[4]);}if(newB.length>0){showBadgeNotification(newB);saveBadges();}}
  function showBadgeNotification(list){const b=list[0];const div=document.createElement("div");div.className="badge-notification";div.innerHTML=`<div class="badge-emoji">${b.emoji}</div><div class="badge-info"><h3>バッジゲット！</h3><p>${b.name}</p><p class="badge-desc">${b.description}</p></div>`;document.body.appendChild(div);setTimeout(()=>{div.classList.add("slide-out");setTimeout(()=>{document.body.removeChild(div);if(list.length>1)showBadgeNotification(list.slice(1));},500);},3000);}
  const saveBadges=()=>{try{localStorage.setItem("emojiGameBadges",JSON.stringify(badges));}catch(e){console.warn("save badges",e);}};
  function loadBadges(){try{const s=localStorage.getItem("emojiGameBadges");if(s){const l=JSON.parse(s);badges.forEach((b,i)=>{if(l[i])b.unlocked=l[i].unlocked;});}}catch(e){console.warn("load badges",e);} }

  /* ---------- Tutorial modal (unchanged) ---------- */
  function showTutorial(){/* original tutorial code (unchanged) */}

  /* ---------- Audio ---------- */
  function initializeAudio(){try{audioContext=new(window.AudioContext||window.webkitAudioContext)();gainNode=audioContext.createGain();gainNode.connect(audioContext.destination);gainNode.gain.value=currentGameState.settings.volume;}catch(e){console.warn("audio init",e);}}
  function updateAudioVolume(v){if(gainNode)gainNode.gain.value=v;}
  function playCorrectSound(){if(!currentGameState.settings.soundEnabled||!audioContext)return;try{[523.25,659.25,783.99].forEach((f,i)=>{const osc=audioContext.createOscillator(),g=audioContext.createGain();osc.connect(g);g.connect(gainNode);osc.frequency.value=f;osc.type="sine";g.gain.setValueAtTime(0.1,audioContext.currentTime+i*0.05);g.gain.exponentialRampToValueAtTime(0.01,audioContext.currentTime+i*0.05+0.3);osc.start(audioContext.currentTime+i*0.05);osc.stop(audioContext.currentTime+i*0.05+0.3);});}catch(e){console.warn("correct sound",e);}}
  function playIncorrectSound(){if(!currentGameState.settings.soundEnabled||!audioContext)return;try{const o=audioContext.createOscillator(),g=audioContext.createGain();o.connect(g);g.connect(gainNode);o.frequency.value=130.81;o.type="sawtooth";g.gain.setValueAtTime(0.2,audioContext.currentTime);g.gain.exponentialRampToValueAtTime(0.01,audioContext.currentTime+0.3);o.start();o.stop(audioContext.currentTime+0.3);}catch(e){console.warn("incorrect sound",e);}}

  /* ---------- Settings ---------- */
  function loadSettings(){try{const s=localStorage.getItem("emojiGameSettings");if(s)currentGameState.settings={...currentGameState.settings,...JSON.parse(s)};elements.volumeSlider.value=currentGameState.settings.volume*100;elements.volumeValue.textContent=Math.round(currentGameState.settings.volume*100)+"%";elements.soundToggle.textContent=currentGameState.settings.soundEnabled?"オン":"オフ";elements.soundToggle.classList.toggle("active",currentGameState.settings.soundEnabled);elements.displaySpeed.value=currentGameState.settings.displaySpeed;if(gainNode)gainNode.gain.value=currentGameState.settings.volume;loadBadges();}catch(e){console.warn("load settings",e);} }
  const saveSettings=()=>{try{localStorage.setItem("emojiGameSettings",JSON.stringify(currentGameState.settings));}catch(e){console.warn("save settings",e);}};

  /* ---------- Audio resume on user interaction ---------- */
  document.addEventListener("click",function initAudio(){if(audioContext&&audioContext.state==="suspended")audioContext.resume();},{once:true});
  document.addEventListener("visibilitychange",()=>{if(audioContext){document.hidden?audioContext.suspend():audioContext.resume();}});

  /* ---------- Public API ---------- */
  return {init:initializeApp};
})();

document.addEventListener("DOMContentLoaded",Game.init);
