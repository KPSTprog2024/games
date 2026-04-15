# game63 NEXT PROMPT LOG（追記専用）

## 運用ルール
- このファイルは**追記専用**。既存エントリの本文を書き換えない。
- 新しい指示は末尾に `PROMPT-XXXX` として追加する。
- 実行開始時は、必ず `LATEST_PROMPT_ID` が指すエントリから読む。
- 過去エントリは履歴として保持し、取り消しは「無効化追記」で表現する。

---

## LATEST POINTER
- `LATEST_PROMPT_ID: PROMPT-0004`
- `UPDATED_AT: 2026-04-15`
- `NOTE: 次回実行時は PROMPT-0004 を最初に読むこと。`

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



## PROMPT-0003
- Prompt-ID: PROMPT-0003
- Created-At: 2026-04-15
- Status: latest
- Goal:
  - Sprint 1（案1: チャンク化支援MVP）を実装し、最小計測込みで動作確認まで完了する。
- Scope:
  - `outputs/08_SPRINT1_TASK_BREAKDOWN.md` のP0をすべて実装
  - 可能ならP1（振り返り1タップ導線）まで着手
  - 計測イベントをローカル保存で検証可能にする
- Constraints:
  - 本質ループ（表示→非表示→再生）を変更しない
  - 5歳UI（ひらがな中心・短文）
  - 1プレイ1〜3分のテンポ維持
- DoD:
  - 1) 色チャンクハイライトが表示フェーズで機能
  - 2) 失敗時ヒントが常時表示
  - 3) 2連敗緩和/2連勝微増が発火
  - 4) 必須7イベントが記録される
  - 5) 受け入れ条件チェック結果を文書化
- Deliverables:
  - 実装差分（コード）
  - 検証メモ（簡易で可）
  - 必要に応じて `outputs/08_SPRINT1_TASK_BREAKDOWN.md` へ追記
- Next:
  - 実装完了後、PROMPT-0004 を追記し LATEST を更新する（計測結果と改善点を含める）。


## PROMPT-0004
- Prompt-ID: PROMPT-0004
- Created-At: 2026-04-15
- Status: latest
- Goal:
  - Sprint 1 MVP実装の検証結果を踏まえ、数値モードへのチャンク学習導線と継続率向上施策を追加する。
- Scope:
  - Sprint 1実装の受け入れ条件未達項目を補完する。
  - セッション計測ログを要約し、保護者向けの1行フィードバックを追加する。
  - P1「振り返り1タップ導線」を最小UIで導入する。
- Constraints:
  - 本質ループ（表示→非表示→再生）を変更しない。
  - 5歳UI（ひらがな中心・短文）を維持する。
  - 1プレイ1〜3分テンポを維持する。
- DoD:
  - 1) 受け入れ条件チェックで未達が0件になる。
  - 2) `session_end` で成功率要約が確認できる。
  - 3) 振り返り1タップ回答がイベント保存される。
- Deliverables:
  - 実装差分（コード）
  - 検証メモ更新（Sprint 1チェック結果）
  - 必要に応じて `outputs/08_SPRINT1_TASK_BREAKDOWN.md` へ追記
- Next:
  - Sprint 1完了報告として、Sprint 2（遅延再想起）着手用の PROMPT-0005 を追記する。
