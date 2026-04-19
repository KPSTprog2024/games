# game69 String Art Studio

## 起動
`game69/index.html` をブラウザで開いてください。

## 使い方
1. キャンバスをドラッグして線分を2本以上作成。
2. Segment A/B と Direction A/B、Divisionsを設定。
3. 必要に応じて `Add Pair to Queue` で複数ペアを登録、または `連鎖モード` をONにする。
4. Generateでストリングアートを描画。
5. SequentialモードではIntervalで描画間隔を調整可能。

## 新機能（Sprint 4）
- **複数ペア連続生成**
  - Queue登録した複数の「2線分ペア」を連続でまとめて生成。
  - 連鎖モードをONにすると、`S01-S02, S02-S03...` を自動で並べて生成。
- **図形入力補助（@safe）**
  - 複数線分が閉じた図形（3角形/4角形/多角形）らしい場合に検出。
  - ON時は頂点を正図形に寄せて補正し、キャンバスに推奨図形（点線）を重ねて表示。

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
