# 72_PROMPT_BRIDGE_WORKFLOW.md

`70_NEXT_PROMPT_TEMPLATE.md` を実運用に落とし込むための最小ワークフロー。

## A. セッション終了時（NEXT_PROMPTを書き出す）

1. `70_NEXT_PROMPT_TEMPLATE.md` を埋める
2. 対象プロジェクトに `development/` が無ければ作成
3. `<project>/development/NEXT_PROMPT.md` の先頭に最新エントリを追記

### 推奨プロンプト（終了時）

```md
このセッションの結果を `harness/templates/70_NEXT_PROMPT_TEMPLATE.md` 形式で
`<project>/development/NEXT_PROMPT.md` の先頭に追記してください。
最後に `Loaded NEXT_PROMPT: yes` を次回用メモとして1行で出力してください。
```

---

## B. 次セッション開始時（NEXT_PROMPTを読み込む）

1. `<project>/development/NEXT_PROMPT.md` の最新エントリを読む
2. 今回のユーザープロンプトと統合
3. 優先順位（ユーザー指示 > 制約 > NEXT_PROMPT）で実行計画を確定

### 推奨プロンプト（開始時）

```md
開始前に `<project>/development/NEXT_PROMPT.md` の最新エントリを読み、
今回のユーザー指示と統合した実行計画を提示してください。
冒頭で `Loaded NEXT_PROMPT: yes/no` を明示してください。
```

---

## C. 競合時の宣言フォーマット

```md
- Conflict:
- Decision: Adopt / Partial / Discard
- Reason:
```

競合を曖昧にせず、毎回この形式で明示する。
