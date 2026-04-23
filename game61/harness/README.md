# game61 UX 改善ハーネス

`harness/templates` のグローバルテンプレートを `game61` 専用運用にコピーしたディレクトリです。

## 目的
- game61 の UX 改善をスプリント単位で継続実行する
- 改善の判断基準（DoD / Fail Fast / Metrics）を固定する
- 学習を `learning/AGENT_GROWTH_LEDGER.md` に蓄積し、次回に再利用する

## 初回セットアップ済み内容
- `templates/` にグローバルテンプレート4種をコピー
- `runs/SPRINT_001_SESSION_BOOT.md` に初回改善スプリントの叩き台を作成
- `runs/SPRINT_001_BACKLOG.md` に優先改善バックログを定義

## 運用手順（毎スプリント）
1. `runs/SPRINT_xxx_SESSION_BOOT.md` を作成し、対象・制約・評価指標を確定
2. 実装
3. `templates/SPRINT_REVIEW_TEMPLATE.md` でレビュー
4. `learning/AGENT_GROWTH_LEDGER.md` に学習エントリ追記
5. `templates/NEXT_PROMPT_TEMPLATE.md` を使い次スプリントに引き継ぎ
6. `runs/SPRINT_001_BACKLOG.md` の `✅ / ⏳` を更新し、残タスク所在を明示
