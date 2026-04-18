const assert = require('assert');
const core = require('./stringArtCore');

function testLerpPoint() {
  const p = core.lerpPoint({ x: 0, y: 0 }, { x: 10, y: 20 }, 0.5);
  assert.deepStrictEqual(p, { x: 5, y: 10 });
}

function testDirectionFlip() {
  const seg = { start: { x: 1, y: 2 }, end: { x: 9, y: 8 } };
  const normal = core.orientedEndpoints(seg, 'start_to_end');
  const flipped = core.orientedEndpoints(seg, 'end_to_start');
  assert.deepStrictEqual(normal.from, seg.start);
  assert.deepStrictEqual(flipped.from, seg.end);
}

function testInterpolationCountAndEndpoints() {
  const a = { start: { x: 0, y: 0 }, end: { x: 10, y: 0 } };
  const b = { start: { x: 0, y: 10 }, end: { x: 10, y: 10 } };
  const lines = core.buildInterpolationLines(a, b, 'start_to_end', 'start_to_end', 4);
  assert.strictEqual(lines.length, 5);
  assert.deepStrictEqual(lines[0], { p0: { x: 0, y: 0 }, p1: { x: 0, y: 10 } });
  assert.deepStrictEqual(lines[4], { p0: { x: 10, y: 0 }, p1: { x: 10, y: 10 } });
}

function testValidateDivisions() {
  assert.strictEqual(core.validateDivisions('20'), 20);
  assert.throws(() => core.validateDivisions('1'));
  assert.throws(() => core.validateDivisions('999'));
}

function run() {
  testLerpPoint();
  testDirectionFlip();
  testInterpolationCountAndEndpoints();
  testValidateDivisions();
  console.log('stringArtCore tests: pass');
}

run();
