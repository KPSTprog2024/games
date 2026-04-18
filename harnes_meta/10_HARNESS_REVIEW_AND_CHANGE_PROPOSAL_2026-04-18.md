# 10_HARNESS_REVIEW_AND_CHANGE_PROPOSAL_2026-04-18.md

> 本文書は `harnes_meta/` 配下で管理するメタコンテンツ（評価・改善提案）であり、ハーネス本体ではない。

## 0. 目的

本提案は、以下の課題を解消することを目的とする。

- 残課題（未完了タスク）が見えない
- 進行の全体像が見えない
- 今どこにいるか（フェーズ位置）がわからない
- いつ完了と言えるかが曖昧

---

## 1. 現状レビュー（結論）

現在のハーネスは、**品質規律・レビュー・学習**は強い。一方で、
**「プロジェクト全体の現在地」と「完了判定」を常時見える化する仕組み**が弱い。

### 強み（残すべき）

1. `01_SOUL.md` の実行規律（Fail Fast / 判定規律）
2. `10_SESSION_BOOT_TEMPLATE.md` の事前定義（Goal/Scope/Non-Scope/DoD）
3. `50_SPRINT_REVIEW_TEMPLATE.md` の振り返り構造
4. `70_NEXT_PROMPT_TEMPLATE.md` の継続運用フレーム
5. `20_PROJECT_MANAGER_PERSONA_TEMPLATE.md` の意思決定ログ文化
6. `03_LEARNING_SYSTEM.md` + `learning/90_AGENT_GROWTH_LEDGER.md` の学習再利用

### ボトルネック（改善対象）

1. スプリント単位の文書はあるが、**プロジェクト横断の1枚管理表**がない
2. `70_NEXT_PROMPT_TEMPLATE` の `Carry-over Backlog` はあるが、
   **プロジェクト全体での未完了集約**がない
3. 完了条件はDoDと判定に散っており、
   **「最終完了ゲート」文書**として独立していない
4. 運用手順が「毎回固定」寄りで、
   **軽量運用（最小セット）と拡張運用（フルセット）の切替基準**が弱い

---

## 2. 変更方針（Keep / Trim / Add）

## Keep（維持）

- `01_SOUL.md`
- `10_SESSION_BOOT_TEMPLATE.md`
- `50_SPRINT_REVIEW_TEMPLATE.md`
- `70_NEXT_PROMPT_TEMPLATE.md`
- `20_PROJECT_MANAGER_PERSONA_TEMPLATE.md`
- `03_LEARNING_SYSTEM.md`
- `80_JOURNEY_LEARNING_ENTRY_TEMPLATE.md`

理由: 品質と再現性の基盤はすでに成立しているため。

## Trim（簡素化）

- 「毎回全テンプレート必須」の運用思想を緩和し、
  **Core運用（最小4文書）**を明示する。

### Core運用（最小）

1. SESSION_BOOT
2. PROJECT_PROGRESS_BOARD（新規）
3. SPRINT_REVIEW
4. NEXT_PROMPT

## Add（追加）

1. `30_PROJECT_PROGRESS_BOARD_TEMPLATE.md`（新規）
   - フェーズ、残タスク、現在地、ブロッカー、ETA、完了率を1枚で管理
2. `60_PROJECT_COMPLETION_GATE_TEMPLATE.md`（新規）
   - 完了判定を単独文書化し、Done/Not Doneを明確化
3. `35_GAME_CONTENT_FILE_STRUCTURE_TEMPLATE.md`（新規）
   - ゲーム開発時の標準ファイル構造を規定し、毎回の再設計を削減

---

## 3. 追加テンプレートの狙い

## A. PROJECT_PROGRESS_BOARD（現在地の迷子対策）

- 「今どこ？」に即答できる
- 残課題と依存関係を可視化できる
- Owner報告時の認知負荷を下げる

## B. PROJECT_COMPLETION_GATE（完了不明対策）

- 完了条件を最終的に一箇所へ集約
- 「実装完了」と「プロジェクト完了」を分離
- 受け入れ判定の責任境界（誰がOKを出すか）を明確化

---

## 4. 推奨運用フロー（改訂）

1. SESSION_BOOTを作る（今回の目的・制約確定）
2. PROJECT_PROGRESS_BOARDを初期化する（フェーズ全体像確定）
3. 実装・検証を実施
4. SPRINT_REVIEWで評価する
5. Completion Gateに反映（完了ならClose、未完なら残課題をBoardへ戻す）
6. NEXT_PROMPTで次回へ引き継ぐ
7. ファイル構造テンプレート準拠をPM Personaが監査する

---

## 5. 演習プラン（定着用）

### Drill 1: 現在地特定ドリル（10分）

- 入力: 既存の SESSION_BOOT + SPRINT_REVIEW
- 出力: PROJECT_PROGRESS_BOARD を1枚作成
- 合格条件:
  - フェーズが1つだけ `IN_PROGRESS`
  - 残タスクに担当/期限/依存がある
  - 「次の1アクション」が1行で書かれている

### Drill 2: 残課題クリーンアップドリル（15分）

- 入力: 直近3回分の NEXT_PROMPT
- 出力: 重複タスクを統合した Carry-over Backlog
- 合格条件:
  - 重複が0件
  - 未着手/進行中/保留が区別されている

### Drill 3: 完了判定ドリル（15分）

- 入力: 最新 SPRINT_REVIEW
- 出力: PROJECT_COMPLETION_GATE
- 合格条件:
  - Go / No-Go が二択で明示
  - No-Go時に reopen 条件が定義

### Drill 4: 週次運用リハーサル（20分）

- 月: Board更新 + リスク棚卸し
- 水: Recommendation発行 + 依存調整
- 金: Completion Gate見直し + 次週計画

---

## 6. 成果指標（導入後2週間）

- 指標1: 「今どこ？」への回答時間（目標: 30秒以内）
- 指標2: Carry-over Backlogの重複件数（目標: 0件）
- 指標3: 完了判定の差し戻し率（目標: 20%以下）
- 指標4: Owner向け進捗報告の再質問回数（目標: 半減）

---

## 7. 導入時の注意

- 既存テンプレートを破棄しない（学習資産は維持）
- まずCore運用で2スプリント回し、その後フル運用に拡張
- Completion Gateは「最後だけ」ではなく毎レビューで更新する

---

## 8. 最終提案

- 既存ハーネスは**土台として維持**
- 迷子問題を解くために、
  - 進行全体像 = PROJECT_PROGRESS_BOARD
  - 完了定義 = PROJECT_COMPLETION_GATE
  を追加
- 運用を「最小セット」から始め、定着後に拡張

これにより、

- 残課題の見える化
- 現在地の即時把握
- 完了判定の明確化

を同時に改善できる。
