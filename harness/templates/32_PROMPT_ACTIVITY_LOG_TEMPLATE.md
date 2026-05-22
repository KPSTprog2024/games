# 32_PROMPT_ACTIVITY_LOG_TEMPLATE.md

`harness/00_README.md` 準拠で実行したときに、対象サブフォルダへ配置するログテンプレート。

- 推奨配置: `<project>/<scope-folder>/PROMPT_ACTIVITY_LOG.md`
- 目的: プロンプト単位で `Outline / Progress / Remaining` を追跡する

---

## Prompt Entry: <Prompt-ID> (<YYYY-MM-DD HH:mm UTC>)
- Session-ID:
- Prompt Summary:
- Mode: @pm / @fast / @safe / @plan
- Scope Folder:
- Reference Prompt: `harness/00_README.md` 準拠

### Outline
- [ ]
- [ ]

### Progress
- ✅
- ✅

### Remaining
- [ ]
- [ ]

### Link to Backlog IDs
- `BL-`
- `BL-`

---

## 運用ルール（最小）

1. 1プロンプトにつき1エントリを追加する
2. `Remaining` は `30_PROJECT_PROGRESS_BOARD_TEMPLATE.md` の `⏳` と一致させる
3. 次回開始時は最新エントリの `Remaining` から着手候補を選ぶ
4. 実ログは対象プロジェクト配下に保存し、`harness/` 配下には保存しない
