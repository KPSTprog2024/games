# SPRINT 001 SESSION BOOT - game16

## 1) Context
- 参照:
  - `game16/index.html`
  - `game16/js/app.js`
  - `game16/assets/css/styles.css`
  - `game16/harness/templates/*.md`
- 対象スプリント: SPRINT_001
- 対象ファイル: `game16/` 一式
- 非対象ファイル: 他 gameXX ディレクトリ

## 2) Project Invariants（必須）
- 不変体験ループ: 「縄が足元を通る瞬間にジャンプ入力」→「成功時の気持ちよい連鎖」
- 対象ユーザー: 小学生〜大人まで、1タップで理解可能
- 1セッションの短さ: 30秒以内で上達感を得られる
- ミス時に理不尽さを感じない判定（見える化とフィードバック）

## 3) Goal
既存実装を解析してゲームの本質を再定義し、遊べる品質の縄跳びジャンプゲームへ全面刷新する。

## 4) Scope
- 既存コードからエッセンス抽出
- 高度から逆算した要件定義作成
- 本質再検討メモ作成
- ゲームの全面作り直し（UI/ルール/演出/テンポ制御）
- ハーネステンプレートを game16 へ配置

## 5) Non-Scope（必須）
- サーバー連携ランキング
- マルチプレイ
- 3D化

## 6) Constraints
- HTML/CSS/Vanilla JS のみで実装
- モバイル・デスクトップ両対応
- 依存ライブラリ追加なし

## 7) DoD
- 初回プレイでルールが理解できる
- 連続成功・ミス・回復のゲームループが成立
- スコア追跡とリトライ導線が機能

## 8) Fail Fast（必須）
- ジャンプ入力が受付けられない
- ロープの通過タイミングが視認不能
- 10秒以内に理不尽なミスが頻発

## 9) Metrics Plan（必須）
- 指標: 成功率、ベストコンボ、プレイ継続時間
- 閾値: 初見30秒で最低1回は5コンボ到達可能
- 観測単位: 1セッション
- 判定: 手動プレイ検証

## 10) Deliverables
- 変更内容
- 検証結果
- 次回Prompt草案
- 学習エントリ
- バックログ更新

## 11) 検証コマンド
- `node --check game16/js/app.js`
- 期待結果: 構文エラーなし

## 12) テンプレート適用方針（必須）
- `SESSION_BOOT_TEMPLATE`: Use
- `DESIGN_PROMPT_TEMPLATE`: Skip（UI刷新はするが、今回は機能再構築優先）
- `SPRINT_REVIEW_TEMPLATE`: Use
- `NEXT_PROMPT_TEMPLATE`: Use
- `JOURNEY_LEARNING_ENTRY_TEMPLATE`: Use

## 13) 出力フォーマット指定
- Summary / Testing / 判定 / Learning Entry
