# 04_CONTINUITY_PROTOCOL.md（連続プロンプト運用プロトコル）

目的は、複数ターン/複数セッションでもエージェントが**同じ判断基準で継続実行**できる状態を作ること。

---

## 1. 命名方針（推奨）

このフォルダの内容は、以下2層で捉えるのが最も誤解が少ない。

- **Harness（実行基盤）**
  - 役割: エージェントに毎回適用される共通規律・テンプレート・学習機構
  - 対象: `01_SOUL.md`, `02_RUN_MODES.md`, `03_LEARNING_SYSTEM.md`, 本ファイル
- **Project Management Kit（運用資産）**
  - 役割: プロジェクト進捗・残件・引き継ぎの実務運用
  - 対象: `templates/30_*`, `templates/50_*`, `templates/70_*`

> 結論: ディレクトリ名は `harness` のまま維持し、説明文で「PM運用を含むHarness」であると定義する。

---

## 1.5 クイックロード順（3分以内）

開始時に情報過多を防ぐため、読み込み順を固定する。

1. `01_SOUL.md`（原則）
2. `02_RUN_MODES.md`（今回の実行モード）
3. `development/NEXT_PROMPT.md` 最新エントリ（ある場合）
4. 本ファイルの「2. State Contract」だけ確認

> これ以外は必要時のみ開く（既定で全部は読まない）。

---

## 2. 連続プロンプトの最小データ契約（State Contract）

各ターンの終端で、次ターンに渡す最小情報を必ず固定フォーマットで残す。

### 必須フィールド

- `Session-ID`
- `Mode`（@pm/@fast/@safe/@plan）
- `Goal`
- `Current Position`（Phase + Step）
- `Top Risks`（最大3件）
- `Carry-over IDs`（`30_PROJECT_PROGRESS_BOARD_TEMPLATE.md` のID参照）
- `Next 1 Action`
- `Validation Command`（次ターン開始時に再実行する1本）

### ルール

- Carry-overは自然言語ではなく**Backlog IDで参照**する
- 「残件なし」は `Master Backlog` に `⏳` が無いことを根拠として宣言する
- 次ターン開始時は、まず `Validation Command` を再実行して状態ドリフトを検出する

---

## 3. セッション開始時プロトコル（3分）

1. `70_NEXT_PROMPT_TEMPLATE.md` の最新エントリを読む
2. `30_PROJECT_PROGRESS_BOARD_TEMPLATE.md` の `You are here` と `Master Backlog` を同期
3. `Carry-over IDs` から当ターンの作業集合を確定
4. 非対象タスクを `Non-Scope` に明記
5. `00_README` 指示で開始した場合は、対象サブフォルダの `PROMPT_ACTIVITY_LOG.md` を読んで最新エントリを確認

### 開始時ワンライン宣言（必須）

次の1行を開始時に必ず出す。

`Mode=<...> / Goal=<...> / Loaded NEXT_PROMPT=<yes|no> / Carry-over=<IDs|none>`

---

## 4. セッション終了時プロトコル（3分）

1. 実施項目を `✅` に更新
2. 未完了項目を `⏳` で維持（削除しない）
3. 保留項目を `🧊` に変更し解除条件を書く
4. `NEXT_PROMPT` を更新し、`Carry-over IDs` と `Next 1 Action` を1つに絞る
5. `learning/90_AGENT_GROWTH_LEDGER.md` に1エントリ追記
6. `PROMPT_ACTIVITY_LOG.md` の当該Promptエントリに `Progress` と `Remaining` を追記/更新

### 終了時ワンライン宣言（必須）

次の1行を終了時に必ず出す。

`Done=<IDs> / Carry-over=<IDs|none> / Blockers=<count> / Next1=<...>`

---

## 5. 典型的な破綻パターンと予防

- 破綻: DoneとCarry-overが混在して次ターンが迷子
  - 予防: 終了報告を `✅/⏳/🧊` の3区分に固定
- 破綻: 仕様変更が口頭合意で残らない
  - 予防: `Decision Log Lite` に1行で必ず記録
- 破綻: 学習ログが感想化して再利用不能
  - 予防: Reusable Insight + Evidence + Reuse Plan の3点セットを必須化

---

## 6. 評価指標（継続運用向け）

- 引き継ぎ直後の再計画時間（分）
- Carry-over取りこぼし件数（件/週）
- 同一Blockerの再発率（%）
- 「残件なし」宣言の誤判定件数（件）

この4指標が改善していれば、ハーネスは機能していると判断できる。


---

## 7. Prompt Bridge運用（開発フォルダ連携）

### 保存（セッション終了時）

- `templates/70_NEXT_PROMPT_TEMPLATE.md` を埋める
- 保存先は対象プロジェクトの `development/NEXT_PROMPT.md`（推奨）
- 追記ではなく「最新エントリを先頭に追加」して履歴を維持する

### 読み込み（次セッション開始時）

1. `development/NEXT_PROMPT.md` の最新エントリを読む
2. ユーザーの今回プロンプトとの差分を抽出
3. 優先順位に従って実行計画を確定する

### 解釈の優先順位

1. ユーザーの今回指示（最優先）
2. AGENTS.md / リポジトリ制約 / 安全要件
3. NEXT_PROMPTの Carry-over / Risks / Next 1 Action

### 最小実行ルール

- `development/NEXT_PROMPT.md` が無い場合は新規作成し、通常起動する
- NEXT_PROMPTの内容が今回Goalと衝突する場合は、衝突点を明示して採用/破棄を宣言する
- 実行開始時の出力に `Loaded NEXT_PROMPT: yes/no` を必ず含める

---

## 8. Prompt Activity Log運用（プロンプト単位の進捗契約）

`00_README` 準拠を明示するプロンプトで起動した場合、以下を必須とする。

1. ログ先は**対象プロジェクト配下**のユーザー指定サブフォルダ（未指定時は `<project>/development/`）
2. ファイル名は `PROMPT_ACTIVITY_LOG.md` に統一
3. 各ターンで `Outline -> Progress -> Remaining` を同一Prompt-IDで追記
4. `Remaining` は `Master Backlog` の `⏳` と整合させる
5. 次ターン開始時は最新 `Remaining` をCarry-over候補として評価する

### 例

- 対象プロジェクトが `game80` の場合、ログ先は `game80/development/PROMPT_ACTIVITY_LOG.md`
- `harness/` 配下にログを書かない（テンプレート置き場と実ログ置き場を分離）
