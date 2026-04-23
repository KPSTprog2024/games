# 30_PROJECT_PROGRESS_BOARD_TEMPLATE.md

プロジェクト全体の「現在地」「残課題」「次アクション」を1枚で追跡する。

## 1) Project Snapshot
- Project:
- Owner:
- PM Persona:
- Last Updated:
- Overall Status: GREEN / YELLOW / RED
- Completion (%):

## 2) Phase Map（現在地は1つだけIN_PROGRESS）
| Phase | Objective | Status (TODO/IN_PROGRESS/DONE/BLOCKED) | Exit Criteria |
|---|---|---|---|
| Discovery |  |  |  |
| Planning |  |  |  |
| Build |  |  |  |
| Validate |  |  |  |
| Release/Close |  |  |  |

## 3) Current Position（迷子防止の中核）
- You are here:
- Why this phase:
- Next 1 action（24h以内）:
- ETA to next phase:

## 3.5) Session Outline（毎セッション開始時に更新）
| Step | Task | Status (TODO/IN_PROGRESS/DONE/BLOCKED) | Checkpoint |
|---|---|---|---|
| 1 |  |  |  |
| 2 |  |  |  |
| 3 |  |  |  |

> Checkpoint には「どの時点で進捗報告するか」を短く書く（例: 実装前 / UI後 / 検証後）。

## 4) Master Backlog（プロジェクト横断で一元管理）
| ID | Task | Status (✅/⏳/🧊) | Owner | Due | Dependency | Source File |
|---|---|---|---|---|---|---|

> Source File は `NEXT_PROMPT.md` や `SPRINT_REVIEW.md` など、元情報の所在を書く。

## 5) Blockers & Risks
| ID | Type (Blocker/Risk) | Description | Impact | Mitigation | Escalation Deadline | Owner |
|---|---|---|---|---|---|---|

## 6) Decision Log Lite
| Date | Topic | Decision | Rationale | Owner Approval |
|---|---|---|---|---|

## 7) Weekly Cadence Check
- [ ] Mon: フェーズと依存関係を更新
- [ ] Wed: Blocker/Riskを更新しRecommendation発行
- [ ] Fri: Completion条件の進捗確認

## 8) Carry-over Rule
- DONEのみ `✅`
- 未完了は必ず `⏳` で残し、次回Promptへ転記
- 保留は `🧊` とし、解除条件を併記

## 9) End-of-Session Report Rule（必須）
- `✅完了` / `⏳残件` / `🧊保留` を分けて報告する
- 「残件なし」で終了する場合は、その根拠（Backlogに`⏳`が無いこと）を明記する
