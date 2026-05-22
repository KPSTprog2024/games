(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.Game71UI = factory();
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  function bind() {
    return {
      promptEl: document.getElementById('prompt'),
      feedbackEl: document.getElementById('feedback'),
      analysisEl: document.getElementById('analysis'),
      choicesEl: document.getElementById('choices'),
      nextBtn: document.getElementById('nextBtn'),
      levelLabel: document.getElementById('levelLabel'),
      scoreLabel: document.getElementById('scoreLabel'),
      symbolGuideEl: document.getElementById('symbolGuide'),
      normalModeBtn: document.getElementById('normalMode'),
      hintModeBtn: document.getElementById('hintMode'),
      hintRotateBtn: document.getElementById('hintRotate'),
    };
  }

  function renderChoices(choicesEl, options, onPick) {
    choicesEl.innerHTML = '';
    options.forEach((option, idx) => {
      const btn = document.createElement('button');
      btn.className = 'choice';
      btn.dataset.id = option.id;
      btn.setAttribute('aria-label', `選択肢${idx + 1}`);

      const grid = document.createElement('div');
      grid.className = 'option-grid';
      grid.style.gridTemplateColumns = `repeat(${option.grid.width}, 16px)`;
      option.grid.data.forEach((row) => {
        row.forEach((cellVal) => {
          const cell = document.createElement('span');
          cell.className = 'cell';
          if (cellVal === 2) cell.classList.add('black');
          if (cellVal === 0) cell.classList.add('empty');
          grid.appendChild(cell);
        });
      });

      btn.appendChild(grid);
      btn.addEventListener('click', () => onPick(option.id));
      choicesEl.appendChild(btn);
    });
  }

  function markAnswer(choicesEl, selectedId, correctId) {
    [...choicesEl.children].forEach((choice) => {
      const id = choice.dataset.id;
      choice.disabled = true;
      if (id === selectedId) choice.classList.add('selected');
      if (id === correctId) choice.classList.add('correct');
      if (id === selectedId && id !== correctId) choice.classList.add('wrong');
    });
  }

  return { bind, renderChoices, markAnswer };
});
