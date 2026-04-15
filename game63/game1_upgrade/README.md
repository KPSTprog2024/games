# game63 / game1_upgrade

`game1` の Sprint 1（チャンク化支援MVP）実装を、`game63` 配下で独立運用するためのコピーです。

## 起動方法

1. リポジトリルートで静的サーバーを起動
   - 例: `npx serve .`
2. ブラウザで `http://localhost:3000/game63/game1_upgrade/` を開く

## 確認ポイント

- 表示フェーズで同色チャンクのリングが表示される
- 失敗時にヒント文（ひらがな）が表示される
- 2連敗で緩和 / 2連勝で微増が表示される
- 1〜3ラウンド後に「おもいだし ちゃれんじ」が再来する（遅延再想起）
- セッション終了後、設定画面に「きょうは x/y もん おもいだせたよ」が出る
- 設定画面でテンポ（ゆっくり / ふつう）を選べる
- 表示フェーズで「ぽん ぽん」のリズムガイドが順番に出る
- 色モードはリズムの順でタッチすると成功しやすい
- `localStorage` キー `game1_memory_sessions_v1` にセッションイベントが保存される

## Sprint 2（遅延再想起）メモ

- 通常ラウンドで成功した配置は、1〜3ラウンド遅延して再出題されます。
- 再出題ラウンドの `round_start` には `result: "review"` と `source_round_id` が入ります。
- セッション保存データに `reviewStats`（`total`, `success`）が追加されます。

## Sprint 3（順序記憶×リズム補助）メモ

- テンポ選択（`slow` / `normal`）をセッション保存し、`round_start` に `tempo` が記録されます。
- 表示フェーズでリズムガイド（`rhythm_guide_played`）を再生し、`rhythmStats.roundsWithGuide` を保存します。
- 色モードでは順序タッチを導入し、順番違いは `recall_fail.result = "wrong_order"` で記録されます。

## 注意

- 今後の改修は原則この `game63/game1_upgrade/` を基準に行い、`game1` 本体は変更しない。
