# Codex Harness（汎用実行強化パッケージ）

このディレクトリは、特定プロジェクトに依存しない形で、
**毎回のCodex実行品質を揃えるためのハーネス**です。

## 目的

- 実行者ごとの差を減らす（品質平準化）
- 毎回同じ重要項目を最初に確認する（判断ドリフト防止）
- Promptをテンプレート化し、改善サイクルを高速化する
- 実行旅ごとの学習を蓄積し、次回精度を上げる
- プロマネ視点の文書運用を標準化し、Ownerとの意思決定速度を上げる

## 使い方（毎回固定）

1. `SOUL.md` を読む（原則・禁止・判定規律）
2. `templates/SESSION_BOOT_TEMPLATE.md` をコピーして、その回の実行用プロンプトを作る
   - デザイン関連タスクがある場合は、`templates/DESIGN_PROMPT_TEMPLATE.md` を各プロジェクト要件に注入する
3. `templates/PROJECT_MANAGER_PERSONA_TEMPLATE.md` を使って、プロマネ・ペルソナを定義する
   - Owner向けのコメント/提案/日記/気づき報告を `PM Owner Channel` に記録する
4. 実装後は `templates/SPRINT_REVIEW_TEMPLATE.md` で検証を出力する
5. `templates/JOURNEY_LEARNING_ENTRY_TEMPLATE.md` で学習エントリを作成し、`learning/AGENT_GROWTH_LEDGER.md` に追記する
6. 次回継続がある場合は `templates/NEXT_PROMPT_TEMPLATE.md` で次指示を作成する
7. 残タスクはバックログに `✅ / ⏳` で明示し、次回Promptへ carry-over する

## ディレクトリ構造

```text
harness/
  README.md
  SOUL.md
  LEARNING_SYSTEM.md
  templates/
    DESIGN_PROMPT_TEMPLATE.md
    SESSION_BOOT_TEMPLATE.md
    PROJECT_MANAGER_PERSONA_TEMPLATE.md
    NEXT_PROMPT_TEMPLATE.md
    SPRINT_REVIEW_TEMPLATE.md
    JOURNEY_LEARNING_ENTRY_TEMPLATE.md
  learning/
    AGENT_GROWTH_LEDGER.md
```

## 構造化アーキテクチャ

### 1) Execution Layer
- `SESSION_BOOT_TEMPLATE.md`
- `SPRINT_REVIEW_TEMPLATE.md`
- `NEXT_PROMPT_TEMPLATE.md`

### 2) PM Governance Layer
- `PROJECT_MANAGER_PERSONA_TEMPLATE.md`
- Ownerとの非同期コミュニケーション（Comment / Recommendation / Diary Note / Insight Report）

### 3) Learning Layer
- `JOURNEY_LEARNING_ENTRY_TEMPLATE.md`
- `learning/AGENT_GROWTH_LEDGER.md`

### 4) Principle Layer
- `SOUL.md`
- `LEARNING_SYSTEM.md`

## 設計方針

- 本ハーネスは「運用時に毎回使う薄い実行層」とする
- ドメイン固有ルールはテンプレート内の「Project Invariants」に注入する
- 最低限の必須項目（Fail Fast / Metrics Plan / Non-Scope）を全テンプレートで強制する
- プロマネ・ペルソナで意思決定ログとOwner通知を運用し、進行停滞を早期解消する
- 学習ログは追記専用で、次回Promptに再注入する
- 「テンプレートを使った/使わなかった理由」と「残タスクの所在」を毎スプリントで明文化する
