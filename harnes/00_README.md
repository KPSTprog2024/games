# Codex Harness（汎用実行強化パッケージ）

このディレクトリは、特定プロジェクトに依存しない形で、
**毎回のCodex実行品質を揃えるためのハーネス**です。

## 目的

- 実行者ごとの差を減らす（品質平準化）
- 毎回同じ重要項目を最初に確認する（判断ドリフト防止）
- Promptをテンプレート化し、改善サイクルを高速化する
- 実行旅ごとの学習を蓄積し、次回精度を上げる
- プロマネ視点の文書運用を標準化し、Ownerとの意思決定速度を上げる

---

## 読む順番（番号順で固定）

1. `01_SOUL.md`（原則・禁止・判定規律）
2. `03_LEARNING_SYSTEM.md`（学習運用）
3. `templates/20_PROJECT_MANAGER_PERSONA_TEMPLATE.md`（進行管理の責任境界）
4. `templates/10_SESSION_BOOT_TEMPLATE.md`（今回スプリントの起動）
5. `templates/30_PROJECT_PROGRESS_BOARD_TEMPLATE.md`（現在地・残課題の一枚管理）
6. `templates/50_SPRINT_REVIEW_TEMPLATE.md`（実装後レビュー）
7. `templates/60_PROJECT_COMPLETION_GATE_TEMPLATE.md`（完了判定）
8. `templates/70_NEXT_PROMPT_TEMPLATE.md`（次回引き継ぎ）
9. `templates/80_JOURNEY_LEARNING_ENTRY_TEMPLATE.md`（学習抽出）
10. `learning/90_AGENT_GROWTH_LEDGER.md`（追記先）

> 迷ったら「小さい番号から読む」。生成AIもこの順で処理する。

---

## 運用モード

### Core運用（最小セット）
- `templates/10_SESSION_BOOT_TEMPLATE.md`
- `templates/30_PROJECT_PROGRESS_BOARD_TEMPLATE.md`
- `templates/50_SPRINT_REVIEW_TEMPLATE.md`
- `templates/70_NEXT_PROMPT_TEMPLATE.md`

### Full運用（推奨）
- Core運用 +
  - `templates/20_PROJECT_MANAGER_PERSONA_TEMPLATE.md`
  - `templates/40_DESIGN_PROMPT_TEMPLATE.md`（デザイン対象時）
  - `templates/60_PROJECT_COMPLETION_GATE_TEMPLATE.md`
  - `templates/80_JOURNEY_LEARNING_ENTRY_TEMPLATE.md`

---

## ゲーム開発向けファイル構造テンプレート

ゲームごとの毎回のファイル設計をゼロから考えないために、
`templates/35_GAME_CONTENT_FILE_STRUCTURE_TEMPLATE.md` を新設した。

- 目的: 各プロジェクトの初期フォルダ構造を標準化
- 適用タイミング: SESSION_BOOT作成時
- 管理責任: PM Persona（構造逸脱の検知・是正）

---


## メタコンテンツの配置

ハーネス改善の提案・評価・更新方針は `harnes_meta/` で管理する。
`harnes/` は実運用テンプレートのみを置く。

## ディレクトリ構造（番号で意味付け）

```text
harnes/
  00_README.md
  01_SOUL.md
  03_LEARNING_SYSTEM.md
  templates/
    10_SESSION_BOOT_TEMPLATE.md
    20_PROJECT_MANAGER_PERSONA_TEMPLATE.md
    30_PROJECT_PROGRESS_BOARD_TEMPLATE.md
    35_GAME_CONTENT_FILE_STRUCTURE_TEMPLATE.md
    40_DESIGN_PROMPT_TEMPLATE.md
    50_SPRINT_REVIEW_TEMPLATE.md
    60_PROJECT_COMPLETION_GATE_TEMPLATE.md
    70_NEXT_PROMPT_TEMPLATE.md
    80_JOURNEY_LEARNING_ENTRY_TEMPLATE.md
  learning/
    90_AGENT_GROWTH_LEDGER.md
```

---

## PM Personaが綱を持つための最小ルール

- Progress Boardの `You are here` は常に1つだけ
- Master Backlogは `✅ / ⏳ / 🧊` を強制
- Completion GateのGO/NO-GOをOwner承認付きで記録
- 構造テンプレート逸脱は、次回Promptで必ず是正タスク化
