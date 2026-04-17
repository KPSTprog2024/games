# SPRINT_001_SESSION_BOOT

## 1) Context
- 参照必須:
  - `game61/harnes/templates/SESSION_BOOT_TEMPLATE.md`
  - `game61/harnes/templates/SPRINT_REVIEW_TEMPLATE.md`
- 対象スプリント: SPRINT-001 (UX Baseline)
- 対象ファイル:
  - `game61/index.html`
  - `game61/play.html`
  - `game61/style.css`
  - `game61/script.js`
- 非対象ファイル:
  - 他ゲームディレクトリ配下

## 2) Project Invariants（必須）
- 2人対戦・先取3点というゲームルールは維持
- 「お題と異なる色かつ図形を選ぶ」コア体験は維持
- 1ラウンドの入力競争性（同時押下に対する公平性）を維持
- モバイル片手操作で誤タップしにくいUIを優先

## 3) Goal
- 初見ユーザーが迷わず開始・理解・継続できるUXに改善する

## 4) Scope
- 導線改善（開始〜プレイ）
- ラウンド中ステータス表示の視認性
- 誤タップ低減（ボタンレイアウト/余白/状態表示）

## 5) Non-Scope（必須）
- ゲームルール自体の変更
- 新しい勝敗ロジックの導入
- 外部ライブラリ導入

## 6) Constraints
- 既存のvanilla JS構成を維持
- 既存ファイル構成を大きく変えない

## 7) DoD
- スタート画面の説明でプレイ手順が理解できる
- プレイ画面で「いま押してよいか」が明確
- 勝敗結果が1秒以内に認知できる視認性を確保

## 8) Fail Fast（必須）
- ボタン押下不能/進行停止が発生したら即中断
- 公平性を損なう入力取りこぼしが検出されたら即中断
- モバイル表示崩れが主要画面幅で発生したら即中断

## 9) Metrics Plan（必須）
- 指標: 初回プレイ完走率（手動QAで5セッション）
- 閾値: 5/5でルール質問なしで完走
- 観測単位: QAセッション
- 判定: 閾値達成でAdopt、未達ならIterate

## 10) Deliverables
- UI改善実装
- 検証結果
- 次回Prompt草案
- 学習エントリ下書き

## 11) 検証コマンド
- `npm run lint`（存在する場合）
- `npm test`（存在する場合）
- ブラウザ手動確認

## 12) 出力フォーマット指定
- Summary（変更点）
- Testing（コマンドごとの成否）
- 判定（Adopt / Iterate / Revert）
- Learning Entry（Reusable Insight / Do / Don’t）
