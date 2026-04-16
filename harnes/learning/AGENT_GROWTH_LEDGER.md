# AGENT_GROWTH_LEDGER.md（追記専用）

> 目的: 各実行旅で得た再利用知見を蓄積し、次回以降の精度と速度を上げる。
> ルール: 追記専用。過去エントリの本文は編集しない。

---

## LATEST_ENTRY
- ENTRY_ID: ENTRY-0002
- UPDATED_AT: 2026-04-16

---

## ENTRY-0000
- Created-At: 2026-04-16
- Journey-ID: bootstrap
- Context: 学習ログ機構の初期化
- Reusable Insight:
  - 成長を起こすには、DoD達成だけでなく再利用可能な判断知の記録が必要
- Reasoning Pivot:
  - 「日報」ではなく「実行旅単位」で管理する方が次回Promptへ注入しやすい
- Do:
  - 1実行旅1エントリ以上を維持する
- Don’t:
  - 感想中心で終わらせる
- Evidence:
  - harnesのテンプレート群
- Reuse Plan:
  - 次回PromptのConstraints/Fail Fastへ抽出知見を反映
- Confidence:
  - medium

## ENTRY-0001
- Created-At: 2026-04-16
- Journey-ID: game64-rework-harnes
- Context: game64作成時にハーネス運用成果物を欠いたため再実装
- Reusable Insight:
  - 体験実装だけでなく、Session Boot/Review/LedgerをDoDに含めると、要求の取りこぼしを防げる
- Reasoning Pivot:
  - 「ゲームを作る」から「ハーネス準拠の開発サイクルを完了する」へ成功条件を変更
- Do:
  - 着手時にテンプレートを複製し、ScopeとFail Fastを先に固定する
- Don’t:
  - テンプレート参照だけで、成果物を残さない
- Evidence:
  - game64/HARNES_SESSION_BOOT.md
  - game64/HARNES_SPRINT_REVIEW.md
  - game64/index.html（メタ認知導線追加）
- Reuse Plan:
  - 次回以降のgame追加では、初回コミットにハーネス3点セットを含める
- Confidence:
  - high

## ENTRY-0002
- Created-At: 2026-04-16
- Journey-ID: harnes-core-upgrade
- Context: 「ハーネス本体改善」要求に対応し、テンプレート運用を強制するガードを追加
- Reusable Insight:
  - テンプレート配布だけでは運用品質は安定しない。成果物の存在チェックをテンプレに内包すると再現性が上がる
- Reasoning Pivot:
  - 各機能の実装修正より先に、ハーネス完了条件の方を強化する方が再発防止に効くと判断
- Do:
  - Session Boot/Review/Ledgerの3点セットを完了ゲートとして明文化する
- Don’t:
  - 「テンプレを読んだ」で準拠扱いにしない
- Evidence:
  - harnes/README.md
  - harnes/templates/SESSION_BOOT_TEMPLATE.md
  - harnes/templates/SPRINT_REVIEW_TEMPLATE.md
  - harnes/SOUL.md
- Reuse Plan:
  - 新規案件開始時、最初にテンプレへ保存先と成果物チェックを埋める
- Confidence:
  - high

