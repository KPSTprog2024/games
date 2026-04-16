# SESSION_BOOT_TEMPLATE.md（game64 実行版）

## 1) Context
- 参照必須:
  - `/workspace/games/harnes/SOUL.md`
  - `/workspace/games/harnes/LEARNING_SYSTEM.md`
- 対象スプリント: game64 rework sprint-2
- 対象ファイル:
  - `game64/index.html`
  - `game64/HARNES_SESSION_BOOT.md`
  - `game64/HARNES_SPRINT_REVIEW.md`
  - `harnes/learning/AGENT_GROWTH_LEDGER.md`
- 非対象ファイル:
  - 既存の他game配下

## 2) Project Invariants（必須）
- 幼児が短時間で遊べるUI（読む量が少ない）
- 学習目的は「数える力」と「数え方の認知（メタ認知）」
- 主要フローは「開始→観察→回答→ふりかえり→次へ」

## 3) Goal
- game64をハーネス準拠で再設計し、メタ認知を含む数認知トレーニングへ改善する。

## 4) Scope
- `game64/index.html` の再設計
- ハーネス運用ドキュメント（Session Boot / Sprint Review）追加
- Learning Ledger追記

## 5) Non-Scope（必須）
- game64以外のゲームロジック改修
- 外部ライブラリ導入

## 6) Constraints
- 単一HTMLで動作
- 10問以内で1セッション完了
- タップ主体UI

## 7) DoD
- メタ認知パネル（数え方の自己評価）を実装
- 適応難易度とヒントの導線を維持
- ハーネス成果物3点（boot/review/ledger）を反映

## 8) Fail Fast（必須）
- 条件1: 主要フローが1画面で完結しない
- 条件2: 回答後に次問題へ遷移できない
- 条件3: 学習ログ追記が漏れる

## 9) Metrics Plan（必須）
- 指標: 正答後のふりかえり実行導線の可用性
- 閾値: 回答後に毎回ふりかえりボタンが表示される
- 観測単位: 1ラウンド
- 判定: 10ラウンド中10回表示なら達成

## 10) Deliverables
- 変更内容
- 検証結果
- 次回Prompt草案
- 学習エントリ（`AGENT_GROWTH_LEDGER.md` 追記）

## 11) 検証コマンド
- `python -m json.tool metadata.json`
- `rg -n "meta-panel|data-strategy|five \+ のこり|showQuestion" game64/index.html`
- `rg -n "ENTRY-0001|LATEST_ENTRY|UPDATED_AT" harnes/learning/AGENT_GROWTH_LEDGER.md`
- 期待結果: すべて成功

## 12) 出力フォーマット指定
- Summary（変更点）
- Testing（コマンドごとの成否）
- 判定（Adopt / Iterate / Revert）
- Learning Entry（Reusable Insight / Do / Don’t）
