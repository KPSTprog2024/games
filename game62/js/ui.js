export class UI {
  constructor(elements) {
    this.els = elements;
  }

  bindDirectionButtons(onDirection, onFirstInteraction) {
    const buttons = this.els.controls.querySelectorAll('.dir');
    buttons.forEach((btn) => {
      const handler = (e) => {
        e.preventDefault();
        onFirstInteraction();
        onDirection(btn.dataset.dir);
      };
      btn.addEventListener('pointerdown', handler, { passive: false });
      btn.addEventListener('click', handler);
    });
  }

  bindPause(onPause, onFirstInteraction) {
    this.els.pauseBtn.addEventListener('click', () => {
      onFirstInteraction();
      onPause();
    });
  }

  updateHud({ stage, score, lives, filled, target }) {
    this.els.stage.textContent = String(stage);
    this.els.score.textContent = String(score);
    this.els.lives.textContent = String(lives);
    this.els.filled.textContent = `${Math.floor(filled * 100)}%`;
    this.els.target.textContent = `${Math.floor(target * 100)}%`;
  }

  showModal(title, message, actions) {
    this.els.modalTitle.textContent = title;
    this.els.modalMessage.textContent = message;
    this.els.modalActions.textContent = '';

    actions.forEach((action) => {
      const btn = document.createElement('button');
      btn.textContent = action.label;
      if (action.secondary) btn.classList.add('secondary');
      btn.addEventListener('click', action.onClick);
      this.els.modalActions.appendChild(btn);
    });

    this.els.modal.classList.remove('hidden');
  }

  hideModal() {
    this.els.modal.classList.add('hidden');
  }
}
