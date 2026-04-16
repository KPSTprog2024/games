# AGENT_GROWTH_LEDGER.md（追記専用）

> 目的: 各実行旅で得た再利用知見を蓄積し、次回以降の精度と速度を上げる。
> ルール: 追記専用。過去エントリの本文は編集しない。

---

## LATEST_ENTRY
- ENTRY_ID: ENTRY-0001
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
- Journey-ID: game65-4player-reflex
- Context: game60の本質を抽出して4人対戦化
- Reusable Insight:
  - 多人数化ではUIの複製より、プレイヤー配列とフェーズ状態機械を先に一般化すると品質が安定する
- Reasoning Pivot:
  - 「上下2人」の位置依存ロジックを捨て、プレイヤーID駆動の判定へ切り替えた
- Do:
  - 先に勝敗ルールを抽象化し、その後UIに写像する
- Don’t:
  - 既存UIをそのまま増築して条件分岐を肥大化させる
- Evidence:
  - game65/app.js の PLAYERS 配列 / resolveReaction / resolveFoul
- Reuse Plan:
  - 次の多人数ゲーム実装でも phase + players 構造をテンプレ化する
- Confidence:
  - high
