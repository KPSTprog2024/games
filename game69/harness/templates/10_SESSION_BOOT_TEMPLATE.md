# 10_SESSION_BOOT_TEMPLATE.md

以下を埋めてからCodexへ投入する。

## 1) Context
- 参照必須（必要に応じて置換）:
  - `<PROJECT>/harness/01_SOUL.md`
  - `<PROJECT>/harness/03_LEARNING_SYSTEM.md`
  - `<PROJECT>/harness/templates/20_PROJECT_MANAGER_PERSONA_TEMPLATE.md`
  - `<PROJECT>/PROJECT_CONTEXT.md`（任意）
  - `<PROJECT>/PROCESS_PLAYBOOK.md`（任意）
- 対象スプリント:
- 対象ファイル:
- 非対象ファイル:

## 2) Project Invariants（必須）
- 例: 不変の体験ループ
- 例: 対象ユーザー制約
- 例: 多人数同時タップ時の到達性（四隅配置など）
- 例: パフォーマンス/運用制約

## 3) Goal
-

## 4) Scope
-

## 5) Non-Scope（必須）
-

## 6) Constraints
-
- デザイン関連タスクがある場合は `templates/40_DESIGN_PROMPT_TEMPLATE.md` を注入し、要件部分のみ差し替える

## 7) PM Persona Activation（必須）
- Persona Name:
- 文書能力フォーカス（例: 要件構造化 / 意思決定記録 / レビュー編集）:
- Owner:
- Decision Boundary:
- PM Owner Channel運用頻度（例: 週3件）:

## 8) DoD
-

## 9) Fail Fast（必須）
- 条件1:
- 条件2:
- 条件3:

## 10) Metrics Plan（必須）
- 指標:
- 指標（任意）: 多人数同時タップで全入力が到達可能
- 閾値:
- 観測単位（例: セッション数）:
- 判定:

## 11) Deliverables
- 変更内容
- 検証結果
- PROJECT_PROGRESS_BOARD更新（現在地/残課題/次アクション）
- 次回Prompt草案
- 学習エントリ（`90_AGENT_GROWTH_LEDGER.md` 追記）
- バックログ更新（`✅/⏳` と残タスク所在）
- PM Owner Channelログ（Comment / Recommendation / Diary Note / Insight Report）

## 12) 検証コマンド
- `...`
- 期待結果:

## 13) テンプレート適用方針（必須）
- 使用するテンプレート:
  - `10_SESSION_BOOT_TEMPLATE`: Use / Skip（理由）
  - `20_PROJECT_MANAGER_PERSONA_TEMPLATE`: Use / Skip（理由）
  - `40_DESIGN_PROMPT_TEMPLATE`（デザイン対象時必須）: Use / Skip（理由）
  - `50_SPRINT_REVIEW_TEMPLATE`: Use / Skip（理由）
  - `30_PROJECT_PROGRESS_BOARD_TEMPLATE`: Use / Skip（理由）
  - `60_PROJECT_COMPLETION_GATE_TEMPLATE`（完了判定時）: Use / Skip（理由）
  - `70_NEXT_PROMPT_TEMPLATE`: Use / Skip（理由）
  - `80_JOURNEY_LEARNING_ENTRY_TEMPLATE`: Use / Skip（理由）
- Skipがある場合の代替手段:

## 14) 出力フォーマット指定
- Summary（変更点）
- Testing（コマンドごとの成否）
- 判定（Adopt / Iterate / Revert）
- Learning Entry（Reusable Insight / Do / Don’t）
- PM Owner Channel（Comment / Recommendation / Diary Note / Insight Report）
