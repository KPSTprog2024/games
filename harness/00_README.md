# Codex Harness v2（グローバル実行ハーネス）

このハーネスは、**長い起動プロンプトを毎回書かなくてよい**状態を作るための実行基盤。

狙いは 2 つだけ。

1. ハーネス側に標準ポリシーを内包する
2. ユーザー入力を「一行コマンド」に縮約する

---


## 用語整理（Harness vs Project Management）

このフォルダは名前としては `harness` が適切。
理由は、実体が「プロジェクト管理ドキュメント単体」ではなく、**実行規律 + モード + 学習 + PM運用テンプレート**の複合基盤だから。

- 呼称（推奨）: **Codex Execution Harness**
- 補助説明: **with Project Management Kit**

> つまり「ハーネス」が主語で、「プロジェクトマネジメント」は内包機能として説明するのが一貫する。

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
5. `templates/30_PROJECT_PROGRESS_BOARD_TEMPLATE.md`（残件・進捗の見える化）
6. `templates/32_PROMPT_ACTIVITY_LOG_TEMPLATE.md`（プロンプト単位の活動ログ）
7. `templates/70_NEXT_PROMPT_TEMPLATE.md`（引き継ぎ）
8. `04_CONTINUITY_PROTOCOL.md`（連続プロンプト運用）
9. `templates/72_PROMPT_BRIDGE_WORKFLOW.md`（NEXT_PROMPTの保存/再注入手順）

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
  04_CONTINUITY_PROTOCOL.md
  templates/
    05_ONE_LINE_PROMPTS.md
    10_SESSION_BOOT_TEMPLATE.md
    30_PROJECT_PROGRESS_BOARD_TEMPLATE.md
    40_DESIGN_PROMPT_TEMPLATE.md
    50_SPRINT_REVIEW_TEMPLATE.md
    60_PROJECT_COMPLETION_GATE_TEMPLATE.md
    70_NEXT_PROMPT_TEMPLATE.md
    72_PROMPT_BRIDGE_WORKFLOW.md
    80_JOURNEY_LEARNING_ENTRY_TEMPLATE.md
  learning/
    90_AGENT_GROWTH_LEDGER.md
```

---

## 実行フロー（標準）

1. 一行コマンドで起動
2. 不足情報があればSESSION_BOOTを埋める
3. **開始前にアウトライン（Phase/Backlog）をPROGRESS_BOARDへ記載**
4. 実行・検証（進捗はBacklogの Status を更新）
5. SPRINT_REVIEW + NEXT_PROMPT更新
6. 学習ログ追記
7. Continuity Protocolで次ターンへの状態契約を固定
8. 次回実行時は `development/NEXT_PROMPT.md` を読み、ユーザー指示と統合して開始
9. `harness/00_README.md` 指示で起動した場合は、指定サブフォルダに `PROMPT_ACTIVITY_LOG.md` を作成/追記し、**プロンプト単位**でアウトライン・進捗・残タスクを残す

---

## 残件を迷子にしない運用ルール（追加）

- 毎セッションの最初に「残件あり/なし」を明示する
- 残件ありの場合、`30_PROJECT_PROGRESS_BOARD_TEMPLATE.md` の `Master Backlog` に必ずID付きで列挙する
- 最終報告では `✅完了` / `⏳残件` / `🧊保留` を分けて記載する
- `NEXT_PROMPT` には `⏳残件` のみを転記する（DONEは転記しない）

---

## `00_README` 指示時の活動ログ契約（新規）

ユーザーが次のような指示を出した場合を対象とする。

> 「`harness/00_README.md` を読み、そこに書かれている進め方・優先順位・安全重視のルールに従ってください。」

この場合、エージェントは**開始時に明示的に約束**し、指名された**対象プロジェクト配下のサブフォルダ**に活動ログを追記する。

### 必須ルール

1. 対象プロジェクトのルートを確定する（例: `game80/`）
2. 対象サブフォルダを確定する（例: `development/`）
3. `<project>/<対象サブフォルダ>/PROMPT_ACTIVITY_LOG.md` を作成（無ければ新規）
4. 各ユーザープロンプトごとに、以下の3項目を1エントリとして追記する
   - `Outline`（着手前の作業アウトライン）
   - `Progress`（実施中/実施後の進捗）
   - `Remaining`（次ターンに残るタスク）
5. エントリは時系列で識別可能にする（Date/Prompt-ID/Session-ID）
6. 最終報告の `⏳残件` とログの `Remaining` を一致させる

### 配置ルール（誤配置防止）

- ✅ 正: `game80/development/PROMPT_ACTIVITY_LOG.md`
- ❌ 誤: `harness/development/PROMPT_ACTIVITY_LOG.md`

### 追記フォーマット（最小）

```md
## Prompt Entry: <Prompt-ID> (<YYYY-MM-DD>)
- Prompt Summary:
- Mode:
- Scope Folder:

### Outline
- ...

### Progress
- ...

### Remaining
- [ ] ...
```

> これにより「どのプロンプトで何を約束し、どこまで進んだか」をサブフォルダ内で監査可能に保てる。

---


## NEXT_PROMPTの保存と再注入（Prompt Bridge）

連続実行の精度を上げるため、`templates/70_NEXT_PROMPT_TEMPLATE.md` で作成した内容は
**対象プロジェクトの開発フォルダ**に保存して次回起動時に再注入する。

- 保存先（推奨）: `<project>/development/NEXT_PROMPT.md`
- 次回起動時: ユーザープロンプト + `NEXT_PROMPT.md` を合わせて解釈
- 優先順位:
  1. ユーザーの今回指示
  2. AGENTS.md / リポジトリ制約
  3. NEXT_PROMPT の Carry-over / Risks / Next 1 Action

> これにより、ユーザー意図を優先しつつ、前回の文脈を低コストで継承できる。

---
## 使い分け

- 速く進める: `@pm @fast 目標: ...`
- 安全重視: `@pm @safe 目標: ...`
- 今日は計画だけ: `@pm @plan 目標: ...`

---

## v2.1 改善提案（提案1/2/3反映）

以下は、**短く階層化 / 優先順位明記 / チェックリスト化**の3点を即時に効かせるための変更提案。

### 提案1: 短く階層化（読む順番を固定）

セッション開始時に読む対象を次の2段階に固定する。

1. **Tier-1（必読・合計3分以内）**
   - `01_SOUL.md`
   - `02_RUN_MODES.md`
   - 本ファイルの「優先順位マトリクス」
2. **Tier-2（必要時のみ）**
   - `templates/10_*`（曖昧な要件を具体化するとき）
   - `templates/30_*`, `templates/70_*`（進捗管理/引き継ぎ時）
   - `04_CONTINUITY_PROTOCOL.md`（セッション跨ぎ時）

### 提案2: 優先順位を明記（衝突時の判断を固定）

以下を**ハーネス内の標準優先順位**とする。

1. ユーザーの今回指示
2. AGENTS.md / リポジトリ制約 / 安全要件
3. `01_SOUL.md`（不変規律）
4. `02_RUN_MODES.md`（モード制約）
5. `development/NEXT_PROMPT.md`（Carry-over）
6. その他テンプレート（補助情報）

### 提案3: チェックリスト化（開始/終了の漏れ防止）

#### セッション開始チェック（90秒）

- [ ] Goal を1行で確定
- [ ] Mode（`@pm/@fast/@safe/@plan`）を宣言
- [ ] 残件 `⏳` の有無を確認
- [ ] 今回の Non-Scope を1行で明記
- [ ] 最初の検証コマンドを1本決める

#### セッション終了チェック（90秒）

- [ ] 実施項目を `✅`、残件を `⏳`、保留を `🧊` に更新
- [ ] `NEXT_PROMPT` に `Carry-over IDs` を転記
- [ ] `Next 1 Action` を1つに絞る
- [ ] 学習ログに再利用可能な1点を記録
