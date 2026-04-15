# game63 Workspace Guide

## 目的
このディレクトリは、暗記ゲームの本質を維持しつつ、段階的に大幅アップデートを進めるための「設計・進行・引き継ぎ」の中枢です。

## ファイル構造
- `GAME_ESSENCE.md`
  - ゲーム本質定義（固定条件）
- `PROJECT_MANAGER.md`
  - PM運用ルール
- `NEXT_PROMPT_LOG.md`
  - 追記型プロンプトログ（LATEST付き）
- `outputs/`
  - 設計成果物とマスタープラン

## 実行前チェック（必須）
1. `NEXT_PROMPT_LOG.md` の `LATEST_PROMPT_ID` を確認
2. 該当 `PROMPT-XXXX` を読んでスコープ把握
3. `PROJECT_MANAGER.md` のチェックリストに従う

## 更新ルール
- 新しい次回指示は `NEXT_PROMPT_LOG.md` に**追記のみ**。
- 既存プロンプト本文は編集しない。
- 変更理由は `outputs/05_REASONING_LOG_DESIGN.md` の粒度で記録する。

