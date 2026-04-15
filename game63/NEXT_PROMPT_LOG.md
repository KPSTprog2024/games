# game63 NEXT PROMPT LOG（追記専用）

## 運用ルール
- このファイルは**追記専用**。既存エントリの本文を書き換えない。
- 新しい指示は末尾に `PROMPT-XXXX` として追加する。
- 実行開始時は、必ず `LATEST_PROMPT_ID` が指すエントリから読む。
- 過去エントリは履歴として保持し、取り消しは「無効化追記」で表現する。

---

## LATEST POINTER
- `LATEST_PROMPT_ID: PROMPT-0008`
- `UPDATED_AT: 2026-04-15`
- `NOTE: 次回実行時は PROMPT-0008 を最初に読むこと。`

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


## PROMPT-0005
- Prompt-ID: PROMPT-0005
- Created-At: 2026-04-15
- Status: latest
- Goal:
  - Sprint 1実装資産を `game63` 配下で独立運用できるようにし、以後の改修を game1 本体から分離する。
- Scope:
  - `game63/game1_upgrade/` を基準実装として運用開始する。
  - game63版で動作確認フロー（起動・イベント保存確認）を整備する。
  - game1本体との差分管理ルールを明文化する。
- Constraints:
  - game1本体へは追加改修を行わない。
  - 本質ループ（表示→非表示→再生）を維持する。
  - 5歳UI（ひらがな中心・短文）を維持する。
- DoD:
  - 1) game63配下だけでSprint 1機能が動作する。
  - 2) `GAME_METRICS_KEY` の保存確認手順が文書化される。
  - 3) 次回担当者が game63 だけ読めば継続改修できる。
- Deliverables:
  - `game63/game1_upgrade/` 実装一式
  - 必要に応じた検証メモ追記
- Next:
  - Sprint 2（遅延再想起）着手用の PROMPT-0006 を追記する。

---

## PROMPT-0006
- Prompt-ID: PROMPT-0006
- Created-At: 2026-04-15
- Status: latest
- Goal:
  - Sprint 2（遅延再想起）MVPを `game63/game1_upgrade` に導入し、通常ラウンド成功問題の再来出題と結果要約を確認できる状態にする。
- Scope:
  - 1〜3ラウンド遅延の再来問題をセッション内で発火させる。
  - 再来ラウンド識別（`round_start.result=review` と `source_round_id`）を計測イベントに残す。
  - セッション終了後に「今日思い出せたもの」を1行で表示する。
- Constraints:
  - game1本体は変更しない。
  - 本質ループ（表示→非表示→再生）を維持する。
  - 5歳UI（ひらがな中心・短文）を維持する。
- DoD:
  - 1) 通常ラウンド成功後、1〜3ラウンド遅延で同配置の再来問題が出る。
  - 2) 再来問題の成否がセッションデータで追跡できる。
  - 3) 設定画面で再来問題の成功数要約が表示される。
- Deliverables:
  - `game63/game1_upgrade/game.js` の実装更新
  - `game63/game1_upgrade/README.md` の確認手順更新
- Next:
  - Sprint 3（順序記憶×リズム補助）着手用の PROMPT-0007 を追記する。

---

## PROMPT-0007
- Prompt-ID: PROMPT-0007
- Created-At: 2026-04-15
- Status: archived
- Goal:
  - Sprint 3（順序記憶×リズム補助）MVPを `game63/game1_upgrade` に導入し、テンポ選択と順序ヒントの有効性を確認する。
- Scope:
  - 設定画面にテンポ選択（ゆっくり/ふつう）を追加する。
  - 表示フェーズでリズムガイドを再生し、イベント記録する。
  - 色モードに順序タッチ導線を導入し、順番ミス時ヒントを追加する。
- Constraints:
  - game1本体は変更しない。
  - 本質ループ（表示→非表示→再生）を維持する。
  - 5歳UI（ひらがな中心・短文）を維持する。
- DoD:
  - 1) テンポ選択が必須入力として機能する。
  - 2) `rhythm_guide_played` がイベント保存される。
  - 3) 色モード順番ミスが `recall_fail.result=wrong_order` で追跡できる。
- Deliverables:
  - `game63/game1_upgrade/game.js` の実装更新
  - `game63/game1_upgrade/README.md` の確認手順更新
- Next:
  - Sprint 3チューニング（過負荷緩和・順序UI改善）用の PROMPT-0008 を追記する。

---

## PROMPT-0008
- Prompt-ID: PROMPT-0008
- Created-At: 2026-04-15
- Status: latest
- Goal:
  - Sprint 3で導入した順序記憶×リズム補助の負荷を調整し、5歳継続率を落とさずに完遂率を高める。
- Scope:
  - 順番ミス時の再挑戦導線を「即失敗」から段階的ヒント方式へ緩和する。
  - テンポ自動提案（連敗時ゆっくり推奨）を最小UIで導入する。
  - セッション末に順序再生完遂率を1行表示する。
- Constraints:
  - game1本体は変更しない。
  - 本質ループ（表示→非表示→再生）を維持する。
  - 1プレイ1〜3分のテンポを維持する。
- DoD:
  - 1) 順序ミスでの離脱が軽減される（即失敗率低下をログで確認可能）。
  - 2) テンポ提案が `difficulty_adjusted` または専用イベントで追跡可能。
  - 3) 順序完遂率サマリが設定画面に表示される。
- Deliverables:
  - `game63/game1_upgrade/game.js` の実装更新
  - 必要に応じて `game63/outputs/` にSprint 3検証メモを追加
- Next:
  - Sprint 4（個別最適メニュー）検討用の PROMPT-0009 を追記する。
