# Codex Harness v2（グローバル実行ハーネス）

このハーネスは、**長い起動プロンプトを毎回書かなくてよい**状態を作るための実行基盤。

狙いは 2 つだけ。

1. ハーネス側に標準ポリシーを内包する
2. ユーザー入力を「一行コマンド」に縮約する

---

## v2の考え方（重要）

従来は、実行のたびに多くのテンプレートを都度注入する前提だった。
v2では逆に、次を標準化する。

- 固定ルールは `harness/` に保持（毎回書かない）
- 毎回変わる情報だけを prompt で渡す
  - 目標
  - モード（speed/safe/plan）
  - 制約（実装可否、期限など）

---

## 最小運用（これだけ使う）

1. `01_SOUL.md`（不変規律）
2. `02_RUN_MODES.md`（モード定義）
3. `templates/05_ONE_LINE_PROMPTS.md`（起動コマンド）
4. `templates/10_SESSION_BOOT_TEMPLATE.md`（必要時のみ詳細化）
5. `templates/70_NEXT_PROMPT_TEMPLATE.md`（引き継ぎ）

> 原則、最初は 1 行コマンドで開始し、情報不足時だけ SESSION_BOOT を展開する。

---

## 削除/縮退した運用思想

- 「毎回すべてのテンプレートを読む」運用を廃止
- PM Personaの長文定義を廃止し、モード化へ移行
- テンプレート選択判断の記述を削除（起動コスト削減）

---

## ディレクトリ構造（v2）

```text
harness/
  00_README.md
  01_SOUL.md
  02_RUN_MODES.md
  03_LEARNING_SYSTEM.md
  templates/
    05_ONE_LINE_PROMPTS.md
    10_SESSION_BOOT_TEMPLATE.md
    30_PROJECT_PROGRESS_BOARD_TEMPLATE.md
    40_DESIGN_PROMPT_TEMPLATE.md
    50_SPRINT_REVIEW_TEMPLATE.md
    60_PROJECT_COMPLETION_GATE_TEMPLATE.md
    70_NEXT_PROMPT_TEMPLATE.md
    80_JOURNEY_LEARNING_ENTRY_TEMPLATE.md
  learning/
    90_AGENT_GROWTH_LEDGER.md
```

---

## 実行フロー（標準）

1. 一行コマンドで起動
2. 不足情報があればSESSION_BOOTを埋める
3. 実行・検証
4. SPRINT_REVIEW + NEXT_PROMPT更新
5. 学習ログ追記

---

## 使い分け

- 速く進める: `@pm @fast 目標: ...`
- 安全重視: `@pm @safe 目標: ...`
- 今日は計画だけ: `@pm @plan 目標: ...`

