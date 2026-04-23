# 30_HARNESS_V2_RESTRUCTURE_2026-04-18.md

## CHANGE-20260418-01
- Why:
  - 起動プロンプトが長文化し、毎回の起動コストが高かったため。
  - 「ハーネス内に運用思想を取り込む」方針へ転換するため。
- Keep:
  - `01_SOUL.md` / `03_LEARNING_SYSTEM.md` / Review・Gate・Learning系テンプレート。
- Trim:
  - 毎回全テンプレートを読む前提。
  - 長文のPM Personaテンプレート。
- Add:
  - `02_RUN_MODES.md`（@pm/@fast/@safe/@plan）。
  - `templates/05_ONE_LINE_PROMPTS.md`（一行起動コマンド）。
  - SESSION_BOOT / NEXT_PROMPT / SPRINT_REVIEWの簡潔化。
- Affected Files:
  - `harness/00_README.md`
  - `harness/02_RUN_MODES.md`
  - `harness/templates/05_ONE_LINE_PROMPTS.md`
  - `harness/templates/10_SESSION_BOOT_TEMPLATE.md`
  - `harness/templates/50_SPRINT_REVIEW_TEMPLATE.md`
  - `harness/templates/70_NEXT_PROMPT_TEMPLATE.md`
  - `harness/templates/20_PROJECT_MANAGER_PERSONA_TEMPLATE.md`（削除）
  - `harness/03_LEARNING_SYSTEM.md`
- Migration Notes:
  - 既存運用は `@pm` モードに読み替えて継続可能。
  - PM Personaで管理していた運用レビューは `Mode Review` へ移管。
- Rollback Plan:
  - `git revert` で一括復旧可能。
- Owner Approval:
  - Pending

