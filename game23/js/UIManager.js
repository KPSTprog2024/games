export class UIManager {
  constructor(effects) {
    this.effects = effects;
    this.screens = ["start-screen", "game-screen", "game-clear-screen"];
  }

  showScreen(screenId) {
    this.screens.forEach(id => {
      const el = document.getElementById(id);
      if (id === screenId) {
        el.classList.remove("hidden");
      } else {
        el.classList.add("hidden");
      }
    });
  }

  updateStartButton(isReady) {
    const btn = document.getElementById("start-button");
    if (btn) btn.disabled = !isReady;
  }

  updateRemainingPieces(count) {
    const el = document.getElementById("remaining-pieces");
    if (el) el.textContent = count;
  }

  showNotification(message, type = "info") {
    this.effects.createNotification(message, type);
  }
}
