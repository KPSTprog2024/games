# 90_AGENT_GROWTH_LEDGER.md（追記専用）

> 目的: 各実行旅で得た再利用知見を蓄積し、次回以降の精度と速度を上げる。
> ルール: 追記専用。過去エントリの本文は編集しない。

---

## LATEST_ENTRY
- ENTRY_ID: ENTRY-0003
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
  - harnessのテンプレート群
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


## ENTRY-0002
- Created-At: 2026-04-16
- Journey-ID: game65-mobile-corner-layout
- Context: 4人同時プレイのモバイル操作性改善
- Reusable Insight:
  - 多人数同時タップのスマホUIでは、2x2均等グリッドより四隅固定の方が役割分担が直感的になる
- Reasoning Pivot:
  - 「4分割表示で十分」から「4人が自然に端末を囲む前提」へ設計視点を変更
- Do:
  - モバイル時は端末保持姿勢（四隅）を優先してボタンを配置する
- Don’t:
  - 情報パネル都合で押下領域を中央寄せにしない
- Evidence:
  - game65/style.css のモバイル `.tap-zone.slot-*` 四隅配置
- Reuse Plan:
  - 次回以降のローカル4人ゲームUIの初期レイアウト規約として使う
- Confidence:
  - high


## ENTRY-0003
- Created-At: 2026-04-16
- Journey-ID: harness-globalize-corner-touch-insight
- Context: game65で得たモバイル4人同時操作の知見をハーネス全体へ反映
- Reusable Insight:
  - 1端末多人数操作では、入力責務を四隅へ固定すると初見でも役割分担が成立しやすい
- Reasoning Pivot:
  - 個別プロジェクト知見として留めず、テンプレート項目へ昇格させる方が再利用率が上がる
- Do:
  - 反復しそうな知見はテンプレートと運用文書に昇格させる
- Don’t:
  - 学習ログだけ追記してテンプレートに反映しない
- Evidence:
  - harness/03_LEARNING_SYSTEM.md の PATTERN-UI-MULTI-TOUCH-CORNERS 追記
  - harness/templates/* への到達性チェック項目追加
- Reuse Plan:
  - 今後の多人数スマホUI案件で、着手時から四隅到達性をDoD/回帰に組み込む
- Confidence:
  - high

## ENTRY-0004
- Created-At: 2026-04-18
- Journey-ID: game69-pm-persona-sprint-governance
- Context: PMペルソナを明示し、Session Boot→Progress Board→Sprint Review→Completion Gateを一連運用
- Reusable Insight:
  - 図形生成系の案件は「方向依存仕様」を要件・UI・実装で同時固定すると手戻りが減る
- Reasoning Pivot:
  - 実装を先行するより、PM文書の意思決定ログを先に埋める方が品質ゲート通過が速い
- Do:
  - Open RecommendationをNEXT_PROMPTへ必ず転記する
- Don’t:
  - Completion Gate前に性能指標を省略してGO判定しない
- Evidence:
  - game69/PROJECT_MANAGER_PERSONA.md
  - game69/SPRINT_REVIEW_SPRINT_002.md
  - game69/PROJECT_COMPLETION_GATE.md
- Reuse Plan:
  - 次の可視化アプリ案件でも、SprintごとにGate文書を更新して判断遅延を防ぐ
- Template Ops Insight:
  - 使ったテンプレート: 10/20/30/50/70/80
  - 使わなかったテンプレートと理由: 60は判定時のみ使用（今回はNO-GO判定で使用）
  - 次回改善提案: Metrics欄に計測ログ表の必須カラム（条件/結果/備考）を追加
- Confidence:
  - high

## ENTRY-0005
- Created-At: 2026-04-18
- Journey-ID: game69-validate-risk-reduction
- Context: ValidateフェーズでUI凡例、rAF化、Metrics導線を追加しGate証跡を強化
- Reusable Insight:
  - 検証遅延を防ぐには、計測手順を文書ではなくUI操作として同梱すると定着しやすい
- Reasoning Pivot:
  - 「後で手動計測」方針から「アプリ内で即時計測」方針へ変更
- Do:
  - Completion Gate前に、実測値の取得導線を製品内に組み込む
- Don’t:
  - 性能要件を文書だけで運用しない
- Evidence:
  - game69/script.js (`runMetrics`, `runSequentialAnimation`)
  - game69/index.html (`metricsBtn`, `metricsOutput`)
- Reuse Plan:
  - 次の可視化アプリで、Validateフェーズ開始時に計測ボタン実装を標準タスク化
- Confidence:
  - high

## ENTRY-0006
- Created-At: 2026-04-18
- Journey-ID: game69-core-testability
- Context: 補間ロジックをUIから分離し、Nodeで単体テスト可能な構造へ変更
- Reusable Insight:
  - Canvas案件でも、座標演算は純関数モジュール化すると検証速度が大きく上がる
- Reasoning Pivot:
  - 手動操作中心の検証から、純関数テスト中心へ検証軸を追加
- Do:
  - 幾何計算は `Core` モジュールへ抽出しテストを先に書く
- Don’t:
  - DOM依存コードに演算ロジックを閉じ込めない
- Evidence:
  - game69/stringArtCore.js
  - game69/stringArtCore.test.js
- Reuse Plan:
  - 次回の描画系MVPでも `*Core.js` + `*.test.js` の初期構成を標準化
- Confidence:
  - high

## ENTRY-0007
- Created-At: 2026-04-18
- Journey-ID: game69-release-close-evidence
- Context: Release/Close前に、UI計測に加えてNodeベンチ証跡を追加
- Reusable Insight:
  - Completion Gateは「機能完了」だけでなく、再実行可能な計測証跡があると承認が早い
- Reasoning Pivot:
  - 手動レビュー中心から、定量ログ中心の承認フローへ移行
- Do:
  - Gate前に `metrics/*.md` とベンチスクリプトをセットで残す
- Don’t:
  - レビュー所感だけで性能判定を終えない
- Evidence:
  - game69/benchmarks/stringArtBenchmark.js
  - game69/metrics/SPRINT_003_METRICS.md
- Reuse Plan:
  - 次案件でも Validate終盤で同形式のベンチ証跡を必須化
- Confidence:
  - high
