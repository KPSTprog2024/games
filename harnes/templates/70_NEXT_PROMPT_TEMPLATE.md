# 70_NEXT_PROMPT_TEMPLATE.md

次回実行用プロンプトを追記する時の汎用雛形。

```md
## PROMPT-XXXX
- Prompt-ID: PROMPT-XXXX
- Created-At: YYYY-MM-DD
- Status: latest
- Project Invariants:
  -
- Prior Learning Import:
  - ENTRY-XXXX から再利用する知見
- PM Persona Carry-over:
  - Persona Name:
  - Open Recommendations:
  - Latest Insight Report:
- Goal:
  -
- Current Position:
  - Current phase:
  - Next 1 action:
- Scope:
  -
- Non-Scope:
  -
- Constraints:
  -
- DoD:
  -
- Fail Fast:
  -
- Metrics Plan:
  - 指標:
  - 閾値:
  - 観測:
- Deliverables:
  -
- PM Owner Channel Plan:
  - Comment:
  - Recommendation:
  - Diary Note:
  - Insight Report:
- Next:
  -
- Carry-over Backlog:
  - ✅ 完了:
  - ⏳ 継続:
  - 🧊 保留:
  - 残タスク所在:
```

## 追記時チェック

- [ ] 既存エントリ本文を編集していない
- [ ] latest ポインタ/状態を更新した
- [ ] Non-Scope / Fail Fast / Metrics Plan / Project Invariants を含めた
- [ ] PM Persona Carry-over を更新した
- [ ] デザイン関連タスクがある場合、`40_DESIGN_PROMPT_TEMPLATE.md` を注入した
- [ ] Learning Ledgerから再利用知見を1つ以上注入した
- [ ] `Carry-over Backlog` に `✅ / ⏳ / 🧊 / 残タスク所在` を記入した
- [ ] `30_PROJECT_PROGRESS_BOARD_TEMPLATE.md` と整合している
