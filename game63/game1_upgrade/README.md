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
- `localStorage` キー `game1_memory_sessions_v1` にセッションイベントが保存される

## 注意

- 今後の改修は原則この `game63/game1_upgrade/` を基準に行い、`game1` 本体は変更しない。
