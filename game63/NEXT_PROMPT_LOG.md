# game63 NEXT PROMPT LOG（追記専用）

## 運用ルール
- このファイルは**追記専用**。既存エントリの本文を書き換えない。
- 新しい指示は末尾に `PROMPT-XXXX` として追加する。
- 実行開始時は、必ず `LATEST_PROMPT_ID` が指すエントリから読む。
- 過去エントリは履歴として保持し、取り消しは「無効化追記」で表現する。

---

## LATEST POINTER
- `LATEST_PROMPT_ID: PROMPT-0002`
- `UPDATED_AT: 2026-04-15`
- `NOTE: 次回実行時は PROMPT-0002 を最初に読むこと。`

---

## PROMPT-0001
- Created-At: 2026-04-15
- Status: archived
- Goal:
  - game63 の既存成果物を踏まえて、圧倒的バージョンアップ計画を管理可能にする。
- Scope:
  - PM運用書の作成
  - 追記型プロンプトログの導入
  - マスタープラン文書の作成
- DoD:
  - PMが次アクションを迷わず選べる
  - 次回実行時に読むべきプロンプト位置が明示される
- Next:
  - 実装準備フェーズに入るため、機能バックログを分解する

---

## PROMPT-0002
- Created-At: 2026-04-15
- Status: latest
- Goal:
  - 「案1（チャンク化支援）」をMVPとして実装可能な粒度に分解し、最短で着手可能な開発プロンプトを生成する。
- Scope:
  - `outputs/07_SUPER_UPGRADE_MASTER_PLAN.md` の Sprint 1 を具体タスク化
  - UI・ロジック・計測イベントを最小セットで確定
  - 失敗時ヒントの仕様を明文化
- Constraints:
  - 本質ループ（表示→非表示→再生）を変更しない
  - 5歳UI（ひらがな中心・短文）
  - 1プレイ1〜3分のテンポ維持
- DoD:
  - 1) 実装タスク一覧（優先度つき）
  - 2) 受け入れ条件（テスト観点）
  - 3) 次スプリントへの引き継ぎメモ
- Deliverables:
  - `outputs/08_SPRINT1_TASK_BREAKDOWN.md`（新規）
  - 必要なら `outputs/04_UPDATE_BLUEPRINT_TEMPLATE.md` を埋めた版を新規作成
- Next:
  - Sprint 1実装後、PROMPT-0003 を追記し LATEST を更新する。

