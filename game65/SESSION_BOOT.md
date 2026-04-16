# SESSION_BOOT (game65)

## 1) Context
- 参照必須:
  - `/workspace/games/harnes/SOUL.md`
  - `/workspace/games/harnes/LEARNING_SYSTEM.md`
- 対象スプリント:
  - game65 新規作成（4人対戦 反射神経ゲーム）
- 対象ファイル:
  - `game65/index.html`
  - `game65/style.css`
  - `game65/app.js`
  - `game65/REQUIREMENTS.md`
  - `game65/SPRINT_REVIEW.md`
  - `game65/NEXT_PROMPT.md`
  - `harnes/learning/AGENT_GROWTH_LEDGER.md`（追記のみ）
- 非対象ファイル:
  - 既存 `game60/*`
  - 他ゲームディレクトリ

## 2) Project Invariants（必須）
- 反射神経の本質（ランダム待機→合図→最速入力）を守る。
- フライング（合図前入力）は不利になるルールを必ず入れる。
- 1画面で複数人が同時参加し、操作説明なしでも遊べる可視性を確保する。

## 3) Goal
- game60の「反射勝負の本質」を抽象化し、4人同時対戦版 `game65` を新規実装する。

## 4) Scope
- 4人分の入力ゾーン/スコア/履歴/ラウンド制御を実装。
- Start / Next Round / Reset の基本操作を提供。
- 履歴ログで勝敗要因（反応勝ち or フライング）を確認可能にする。

## 5) Non-Scope（必須）
- ネットワーク対戦化。
- 音声・振動・アニメーションの高度演出。
- game60のUIコピー（構図や文言をそのまま流用しない）。

## 6) Constraints
- HTML/CSS/Vanilla JSのみで実装。
- モバイル・デスクトップ双方で単一HTMLとして動作。

## 7) DoD
- 4人対戦が成立し、誰かが規定点を達成するとゲーム終了する。
- フライング時に違反者が明示され、他プレイヤーが有利になる。
- リセットで初期状態に戻る。

## 8) Fail Fast（必須）
- 条件1: 合図前タップで不利が発生しない場合は即停止。
- 条件2: 4人のうち一部が入力不可なら即停止。
- 条件3: ラウンド進行が止まる（次ラウンド不可）場合は即停止。

## 9) Metrics Plan（必須）
- 指標:
  - 4入力ゾーンが押下可能。
  - 反応勝利時に単独加点される。
  - フライング時に違反者以外へ加点される。
- 閾値:
  - 手動検証で各条件100%再現。
- 観測単位（例: セッション数）:
  - 1ローカルセッション（複数ラウンド）
- 判定:
  - 条件を満たせば Adopt。

## 10) Deliverables
- 変更内容（game65の新規実装）
- 検証結果
- 次回Prompt草案
- 学習エントリ（`AGENT_GROWTH_LEDGER.md` 追記）

## 11) 検証コマンド
- `node --check game65/app.js`
- `git diff --stat`
- 期待結果:
  - JS構文エラーなし、変更がgame65中心であること。

## 12) 出力フォーマット指定
- Summary（変更点）
- Testing（コマンドごとの成否）
- 判定（Adopt / Iterate / Revert）
- Learning Entry（Reusable Insight / Do / Don’t）
