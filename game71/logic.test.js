const assert = require('assert');
const logic = require('./logic.js');

(function testVisibleBlackRule() {
  const cubes = [
    { x: 0, y: 0, z: 1, color: 'black' }, // target
    { x: 0, y: 0, z: 0, color: 'white' },
    { x: 1, y: 0, z: 1, color: 'white' },
    { x: 0, y: 1, z: 1, color: 'white' },
  ];
  logic.enforceVisibleBlackRule(cubes);
  assert.strictEqual(cubes[0].color, 'white');
})();

(function testFrontProjectionHandPriority() {
  const cubes = [
    { x: 0, y: 0, z: 0, color: 'white' },
    { x: 0, y: 0, z: 1, color: 'black' },
  ];
  const front = logic.projection(cubes, 'front');
  assert.deepStrictEqual(front.data, [[1]]);
})();

(function testBackProjectionFlip() {
  const cubes = [
    { x: 0, y: 0, z: 0, color: 'white' },
    { x: 1, y: 0, z: 0, color: 'black' },
  ];
  const back = logic.projection(cubes, 'back');
  assert.strictEqual(back.width, 2);
  assert.deepStrictEqual(back.data[0], [2, 1]);
})();

(function testLowQualityDistractor() {
  const correct = { width: 2, height: 1, data: [[1, 2]] };
  const near = { width: 2, height: 1, data: [[1, 1]] };
  const far = { width: 2, height: 1, data: [[2, 1]] };
  assert.strictEqual(logic.isLowQualityDistractor(correct, near), true);
  assert.strictEqual(logic.isLowQualityDistractor(correct, far), false);
})();

console.log('game71 logic tests passed');
