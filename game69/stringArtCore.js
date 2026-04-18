(function attachStringArtCore(global) {
  function lerpPoint(p0, p1, t) {
    return {
      x: p0.x + (p1.x - p0.x) * t,
      y: p0.y + (p1.y - p0.y) * t,
    };
  }

  function orientedEndpoints(segment, direction) {
    return direction === 'end_to_start'
      ? { from: segment.end, to: segment.start }
      : { from: segment.start, to: segment.end };
  }

  function buildInterpolationLines(segmentA, segmentB, directionA, directionB, divisions) {
    if (!segmentA || !segmentB) throw new Error('segmentA/segmentB は必須です。');
    if (!Number.isInteger(divisions) || divisions < 2) throw new Error('divisions は2以上の整数が必要です。');

    const { from: a0, to: a1 } = orientedEndpoints(segmentA, directionA);
    const { from: b0, to: b1 } = orientedEndpoints(segmentB, directionB);

    const lines = [];
    for (let i = 0; i <= divisions; i += 1) {
      const t = i / divisions;
      lines.push({
        p0: lerpPoint(a0, a1, t),
        p1: lerpPoint(b0, b1, t),
      });
    }
    return lines;
  }

  function validateDivisions(rawValue) {
    const divisions = Number(rawValue);
    if (!Number.isFinite(divisions) || divisions < 2 || divisions > 300) {
      throw new Error('Divisionsは2〜300で指定してください。');
    }
    return Math.trunc(divisions);
  }

  const api = {
    lerpPoint,
    orientedEndpoints,
    buildInterpolationLines,
    validateDivisions,
  };

  global.StringArtCore = api;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
})(typeof window !== 'undefined' ? window : globalThis);
