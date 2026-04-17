# Codex Harness（汎用実行強化パッケージ）

このディレクトリは、特定プロジェクトに依存しない形で、
**毎回のCodex実行品質を揃えるためのハーネス**です。

## 目的

- 実行者ごとの差を減らす（品質平準化）
- 毎回同じ重要項目を最初に確認する（判断ドリフト防止）
- Promptをテンプレート化し、改善サイクルを高速化する
- 実行旅ごとの学習を蓄積し、次回精度を上げる

## 使い方（毎回固定）

1. `SOUL.md` を読む（原則・禁止・判定規律）
2. `templates/SESSION_BOOT_TEMPLATE.md` をコピーして、その回の実行用プロンプトを作る
3. 実装後は `templates/SPRINT_REVIEW_TEMPLATE.md` で検証を出力する
4. `templates/JOURNEY_LEARNING_ENTRY_TEMPLATE.md` で学習エントリを作成し、`learning/AGENT_GROWTH_LEDGER.md` に追記する
5. 次回継続がある場合は `templates/NEXT_PROMPT_TEMPLATE.md` で次指示を作成する
6. 残タスクはバックログに `✅ / ⏳` で明示し、次回Promptへ carry-over する

## ディレクトリ構造

```text
harnes/
  README.md
  SOUL.md
  LEARNING_SYSTEM.md
  templates/
    SESSION_BOOT_TEMPLATE.md
    NEXT_PROMPT_TEMPLATE.md
    SPRINT_REVIEW_TEMPLATE.md
    JOURNEY_LEARNING_ENTRY_TEMPLATE.md
  learning/
    AGENT_GROWTH_LEDGER.md
```

## 設計方針

- 本ハーネスは「運用時に毎回使う薄い実行層」とする
- ドメイン固有ルールはテンプレート内の「Project Invariants」に注入する
- 最低限の必須項目（Fail Fast / Metrics Plan / Non-Scope）を全テンプレートで強制する
- 学習ログは追記専用で、次回Promptに再注入する
- 「テンプレートを使った/使わなかった理由」と「残タスクの所在」を毎スプリントで明文化する
