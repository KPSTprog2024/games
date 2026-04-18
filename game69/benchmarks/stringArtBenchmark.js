const core = require('../stringArtCore');

const segmentA = { start: { x: 100, y: 100 }, end: { x: 900, y: 600 } };
const segmentB = { start: { x: 900, y: 100 }, end: { x: 100, y: 600 } };

function runCase(divisions, iterations = 2000) {
  const t0 = performance.now();
  let lines = null;

  for (let i = 0; i < iterations; i += 1) {
    lines = core.buildInterpolationLines(segmentA, segmentB, 'start_to_end', 'end_to_start', divisions);
  }

  const t1 = performance.now();
  return {
    divisions,
    iterations,
    lineCount: lines.length,
    totalMs: t1 - t0,
    avgMs: (t1 - t0) / iterations,
  };
}

function main() {
  const cases = [50, 100, 200].map((n) => runCase(n));
  console.log(JSON.stringify({
    executedAt: new Date().toISOString(),
    cases: cases.map((c) => ({
      ...c,
      totalMs: Number(c.totalMs.toFixed(3)),
      avgMs: Number(c.avgMs.toFixed(6)),
    })),
  }, null, 2));
}

main();
