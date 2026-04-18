# game68 Project Context

## Origin
- Source: `game54` の改善版。
- Constraint: `game54` の既存コードは変更しない。

## Meta Requirement Definition（エッセンス抽出）

### Goal
- 3Dリサージュの「操作して楽しい」を維持しつつ、
  実験の再現性と学習効率を高める。

### Essence from game54
1. リアルタイムな周波数・振幅・速度の操作。
2. 軌跡の視覚化とカメラ操作の気持ちよさ。
3. 比率表示で形状理解を支援する導線。

### Improvement Hypothesis
- 「観察」だけでなく「内省」を同一画面で回せると、
  反復実験の質が上がる。

### Scope
- game68を新規作成。
- global harnessを `game68/harnes` に複製して運用する。
- Insight Metrics（比率・複雑度・閉曲線予測）を追加する。
- メタ認知パネル（仮説/観測/次アクション）を追加する。
- プリセット導線で比較実験を高速化する。

### Non-Scope
- game54ファイルの変更。
- サーバー導入やクラウド保存。
- three.js依存バージョンの変更。

### Constraints
- 単体静的ファイル（HTML/CSS/JS）で完結させる。
- 操作負荷を増やしすぎない。

### DoD
- `game68/` で単独起動できる。
- UI上でInsight Metricsが変化する。
- メタメモ保存/復元が動作する。
- PM Owner向けログを残す。
