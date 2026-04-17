# SESSION_BOOT_TEMPLATE.md

以下を埋めてからCodexへ投入する。

## 1) Context
- 参照必須（必要に応じて置換）:
  - `<PROJECT>/harnes/SOUL.md`
  - `<PROJECT>/harnes/LEARNING_SYSTEM.md`
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
- デザイン関連タスクがある場合は `templates/DESIGN_PROMPT_TEMPLATE.md` をそのまま注入し、`[ここに具体的なプロジェクト要件を入れる]` のみ差し替える

## 7) DoD
-

## 8) Fail Fast（必須）
- 条件1:
- 条件2:
- 条件3:

## 9) Metrics Plan（必須）
- 指標:
- 指標（任意）: 多人数同時タップで全入力が到達可能
- 閾値:
- 観測単位（例: セッション数）:
- 判定:

## 10) Deliverables
- 変更内容
- 検証結果
- 次回Prompt草案
- 学習エントリ（`AGENT_GROWTH_LEDGER.md` 追記）
- バックログ更新（`✅/⏳` と残タスク所在）

## 11) 検証コマンド
- `...`
- 期待結果:

## 12) テンプレート適用方針（必須）
- 使用するテンプレート:
  - `SESSION_BOOT_TEMPLATE`: Use / Skip（理由）
  - `DESIGN_PROMPT_TEMPLATE`（デザイン対象時必須）: Use / Skip（理由）
  - `SPRINT_REVIEW_TEMPLATE`: Use / Skip（理由）
  - `NEXT_PROMPT_TEMPLATE`: Use / Skip（理由）
  - `JOURNEY_LEARNING_ENTRY_TEMPLATE`: Use / Skip（理由）
- Skipがある場合の代替手段:

## 13) 出力フォーマット指定
- Summary（変更点）
- Testing（コマンドごとの成否）
- 判定（Adopt / Iterate / Revert）
- Learning Entry（Reusable Insight / Do / Don’t）
