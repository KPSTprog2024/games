# game69 String Art Studio

## 起動
`game69/index.html` をブラウザで開いてください。

## 使い方
1. キャンバスをドラッグして線分を2本以上作成。
2. Segment A/B と Direction A/B、Divisionsを設定。
3. Generateでストリングアートを描画。
4. SequentialモードではIntervalで描画間隔を調整可能。

## Validate向け機能
- start/end点の凡例を左パネルに表示。
- `Run Metrics` で `N=50/100/200` の簡易計測結果を表示。

## ショートカット
- `G`: Generate
- `U`: Undo


## 開発者向けチェック
- `node game69/stringArtCore.test.js`
- `node --check game69/script.js`
- `node game69/benchmarks/stringArtBenchmark.js`
