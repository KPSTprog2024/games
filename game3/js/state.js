import { TOTAL_QUESTIONS } from './config.js';

export const state = {
  currentQuestion: 0,
  correctCount: 0,
  consecutiveCorrect: 0,
  previousCircleCount: 0,
  currentShapes: [],
  questionMissed: false,
  settings: {
    difficulty: '初級',
    displayTime: 3.0,
    gameMode: 'normal',
    sound: true
  },
  reset() {
    this.currentQuestion = 0;
    this.correctCount = 0;
    this.consecutiveCorrect = 0;
    this.previousCircleCount = 0;
  },
  next() { this.currentQuestion++; }
};
export const getTotalQuestions = () => TOTAL_QUESTIONS;
