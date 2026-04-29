# 05_ONE_LINE_PROMPTS.md

毎回の起動プロンプトを最短化するためのテンプレート集。

## 基本形

`@pm [mode] 目標: <goal> 制約: <constraint>`

- mode は任意（`@fast` / `@safe` / `@plan`）
- 省略時は `@pm` 標準モード

---

## 例

### 通常開発
`@pm 目標: ログイン導線の離脱率を下げる`

### 品質重視
`@pm @safe 目標: 決済エラー再発防止 制約: 既存API仕様は変更しない`

### 計画のみ
`@pm @plan 目標: v1.2の実行計画を確定`

### 速度重視
`@pm @fast 目標: 今日中に最小動作版を出す 制約: UI刷新は対象外`

---

## 追加オプション（必要時のみ）

- `対象:` 変更対象のフォルダ/ファイル
- `非対象:` 今回触らない範囲
- `期限:` YYYY-MM-DD
- `活動ログ先:` 対象プロジェクト配下でプロンプト単位ログを追記するサブフォルダ（例: `development`）

例:

`@pm @safe 目標: 検索精度改善 対象: app/search 制約: 期限 2026-04-20`

### `00_README`準拠 + 活動ログ強制の例

`@pm @safe 目標: checkout不具合の切り分け 対象: services/checkout 活動ログ先: development 指示: harness/00_README.md準拠`

> この形式で起動した場合、`<project>/development/PROMPT_ACTIVITY_LOG.md` へのプロンプト単位追記（Outline/Progress/Remaining）を必須にする。
