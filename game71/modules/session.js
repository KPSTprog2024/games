(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.Game71Session = factory();
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  function create() {
    return {
      level: 1,
      score: 0,
      total: 0,
      hintMode: false,
      locked: false,
      targetDirection: 'right',
      answerDirection: 'right',
      options: [],
      correctOptionId: '',
      questionStartAt: 0,
      recentResults: [],
      mistakeStats: { mirror_lr: 0, wrong_depth: 0, wrong_height: 0, wrong_color: 0, other_direction: 0 },
      directionMistakes: { front: 0, right: 0, left: 0, back: 0, top: 0 },
      reviewModeRounds: 0,
      weakDirection: null,
    };
  }

  function recordAnswer(state, isCorrect, mistakeType, elapsedMs) {
    state.total += 1;
    if (isCorrect) state.score += 1;
    if (!isCorrect && mistakeType && state.mistakeStats[mistakeType] !== undefined) {
      state.mistakeStats[mistakeType] += 1;
      state.directionMistakes[state.targetDirection] += 1;
    }
    state.recentResults.push({ correct: isCorrect, elapsedMs });
    if (state.recentResults.length > 5) state.recentResults.shift();
  }

  function inferWeakDirection(state) {
    const entries = Object.entries(state.directionMistakes).sort((a, b) => b[1] - a[1]);
    return entries[0] && entries[0][1] > 0 ? entries[0][0] : state.targetDirection;
  }

  function advanceLevel(state) {
    if (state.recentResults.length >= 5) {
      const wins = state.recentResults.filter((r) => r.correct).length;
      const accuracy = wins / state.recentResults.length;
      const avgMs = state.recentResults.reduce((sum, r) => sum + r.elapsedMs, 0) / state.recentResults.length;

      if (accuracy >= 0.8 && avgMs <= 14000 && state.level < 5) {
        state.level += 1;
        state.recentResults = [];
        state.reviewModeRounds = 0;
      } else if (accuracy <= 0.4) {
        state.reviewModeRounds = 3;
        state.weakDirection = inferWeakDirection(state);
        state.recentResults = [];
      }
    }
  }

  return { create, recordAnswer, advanceLevel };
});
