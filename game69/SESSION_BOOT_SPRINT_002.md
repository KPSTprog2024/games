# SESSION_BOOT_SPRINT_002

## 1) Context
- 参照:
  - `game69/harness/01_SOUL.md`
  - `game69/harness/03_LEARNING_SYSTEM.md`
  - `game69/PROJECT_MANAGER_PERSONA.md`
  - `game69/REQUIREMENTS.md`
  - `game69/DESIGN_SPEC.md`
- 対象スプリント: Sprint 002（Build + Validate）
- 対象ファイル:
  - `game69/index.html`
  - `game69/script.js`
  - `game69/style.css`
  - `game69/SPRINT_REVIEW_SPRINT_002.md`
  - `game69/PROJECT_PROGRESS_BOARD.md`
  - `game69/NEXT_PROMPT.md`
- 非対象ファイル:
  - `game69/harness/templates/*`

## 2) Project Invariants
- 任意線分を2本選択し、各線分の向きを指定して補間生成できること。
- 生成線が順次描画され、進捗が視覚で確認できること。
- 同一入力に対し同一出力を返す再現性を維持すること。

## 3) Goal
- MVP実装を完了し、主要受け入れ基準の動作確認を行う。

## 4) Scope
- Canvas描画、A/B選択、方向指定、分割生成、Instant/Sequential描画。
- Undo / Clear / Export、入力バリデーション。
- スプリントレビューと次回Prompt更新。

## 5) Non-Scope
- クラウド保存、複数ユーザー編集、3D化。

## 6) Constraints
- 単一HTML/CSS/JSで動作させる。
- 依存ライブラリなし。

## 7) PM Persona Activation
- Persona Name: Aya Kisaragi
- Owner: game69依頼者
- Decision Boundary: 実装優先順位はOwner承認、品質ゲートはPM判定

## 8) DoD
- AC-01〜AC-05を手動テストで満たす。
- 操作方法をREADMEに明記。
- Progress Board と Sprint Review を更新。

## 9) Fail Fast
- 2線分未満で生成が走る場合は修正完了までリリース停止。
- 向き指定が補間へ反映されない場合は修正完了まで停止。
- Sequential描画停止不能の場合は修正完了まで停止。

## 10) Metrics Plan
- 指標1: AC-01〜AC-05の通過率
- 閾値: 5/5 pass
- 観測: 手動テスト1セット
- 判定: 100%でAdopt

## 11) Deliverables
- 実装コード
- スプリントレビュー
- Progress Board更新
- Next Prompt更新

## 12) 検証コマンド
- `node --check game69/script.js`
- `git status --short`

## 13) テンプレート適用方針
- 10_SESSION_BOOT_TEMPLATE: Use
- 20_PROJECT_MANAGER_PERSONA_TEMPLATE: Use
- 40_DESIGN_PROMPT_TEMPLATE: Use
- 50_SPRINT_REVIEW_TEMPLATE: Use
- 30_PROJECT_PROGRESS_BOARD_TEMPLATE: Use
- 60_PROJECT_COMPLETION_GATE_TEMPLATE: Skip（MVP完了判定前）
- 70_NEXT_PROMPT_TEMPLATE: Use
- 80_JOURNEY_LEARNING_ENTRY_TEMPLATE: Use

## 14) 判定
- Adopt
