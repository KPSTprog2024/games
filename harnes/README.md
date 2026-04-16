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

## 最低成果物（ハーネス準拠の完了条件）

各実行旅で、最低でも次の3点を残す。

1. Session Boot（計画）
2. Sprint Review（検証と判定）
3. Learning Ledger追記（再利用知見）

> 目安: 対象機能ディレクトリ直下に `HARNES_SESSION_BOOT.md` / `HARNES_SPRINT_REVIEW.md` を配置し、
> `harnes/learning/AGENT_GROWTH_LEDGER.md` を追記する。

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
- テンプレートは「参照」で終わらせず、実行旅ごとに埋めた成果物を必ず残す


## コンフリクト最小化モード

他ブランチと衝突リスクが高い場合は、次を適用する。

- 変更対象を `harnes/**` に限定する
- 機能コード（`game*/` や `index.html`）は同一PRで触らない
- 学習反映はテンプレート・原則文書・Ledger追記で完結させる
