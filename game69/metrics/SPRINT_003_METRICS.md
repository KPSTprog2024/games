# SPRINT_003_METRICS

- Measured At (UTC): 2026-04-18T18:01:28.787Z
- Method: `node game69/benchmarks/stringArtBenchmark.js`
- Environment: local Node runtime (no DOM/canvas draw cost)

## Results

| Divisions | Iterations | Lines | Total (ms) | Avg / run (ms) |
|---|---:|---:|---:|---:|
| 50 | 2000 | 51 | 45.167 | 0.022583 |
| 100 | 2000 | 101 | 27.133 | 0.013567 |
| 200 | 2000 | 201 | 22.945 | 0.011473 |

## Interpretation
- 計算コア（補間線生成）は `N=200` でも平均 0.012ms/回で、要件の「描画開始まで1秒以内」に対して十分余裕がある。
- 本計測は純計算のみで、ブラウザ描画コストは含まない。描画体感はアプリ内 `Run Metrics` と併用して評価する。

## Gate Decision Input
- Metrics項目: Pass（計算コア観点）
- Remaining: Owner最終承認のみ
