const assert = require('assert');
const logic = require('../logic.js');
const generationModule = require('./generation.js');

const LEVELS = [
  { cubes: [2, 4], maxHeight: 2, directions: ['front', 'right'], options: [2, 2], black: [1, 1] },
  { cubes: [4, 6], maxHeight: 3, directions: ['front', 'right', 'left'], options: [3, 4], black: [1, 2] },
];

(function testSeededCubeGenerationDeterministic() {
  const g1 = generationModule.create(LEVELS, logic, { seed: 'abc123' });
  const g2 = generationModule.create(LEVELS, logic, { seed: 'abc123' });
  const c1 = g1.generateCubes(1);
  const c2 = g2.generateCubes(1);
  assert.deepStrictEqual(c1, c2);
})();

(function testSeededOptionsDeterministicBySignature() {
  const g1 = generationModule.create(LEVELS, logic, { seed: 'abc123' });
  const g2 = generationModule.create(LEVELS, logic, { seed: 'abc123' });
  const cubes = g1.generateCubes(2);
  const cubes2 = g2.generateCubes(2);
  const o1 = g1.makeOptions(cubes, 'front', 2).map((o) => ({ type: o.type, sig: logic.serializeGrid(o.grid), correct: o.correct }));
  const o2 = g2.makeOptions(cubes2, 'front', 2).map((o) => ({ type: o.type, sig: logic.serializeGrid(o.grid), correct: o.correct }));
  assert.deepStrictEqual(o1, o2);
})();

console.log('game71 generation tests passed');
