# 70_NEXT_PROMPT_TEMPLATE.md（簡潔版）

次回用の引き継ぎは、以下の最小形式を追記する。

```md
## PROMPT-XXXX
- Date: YYYY-MM-DD
- Session-ID:
- Project Folder:
- Output Path: <project>/development/NEXT_PROMPT.md
- Mode: @pm | @pm @fast | @pm @safe | @pm @plan
- Goal:
- Current Position:
- Done:
- Carry-over IDs:
- Top Risks (max 3):
- Validation Command:
- Next 1 Action:
- Recommended One-liner:
  - `@pm ...`
```

## チェック

- [ ] Done と Carry-over が分離されている
- [ ] Carry-over は Backlog ID で参照されている
- [ ] 次の1アクションが1文で書かれている
- [ ] 次回起動用の一行コマンドがある
- [ ] Validation Command が1本定義されている
- [ ] 開始時に `Loaded NEXT_PROMPT: yes / no` を宣言する
