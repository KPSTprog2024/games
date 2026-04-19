# game69 String Art Studio

## 起動
`game69/index.html` をブラウザで開いてください。

## 使い方
1. キャンバスをドラッグして線分を2本以上作成。
2. Segment A/B と Direction A/B、Divisionsを設定。
3. 線分は描いた順に2本ずつ自動ペア化される（`S01-S02, S03-S04, ...`）。
4. Generateでストリングアートを描画。
5. SequentialモードではIntervalで描画間隔を調整可能。

## 新機能（Sprint 4）
- **複数ペア連続生成**
  - 手動Queue登録ボタン不要で、描画した線分を2本ずつ自動検知して連続生成。
  - 奇数本のときは末尾1本を保留し、次の線分が追加された時点で自動的にペア化。
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
