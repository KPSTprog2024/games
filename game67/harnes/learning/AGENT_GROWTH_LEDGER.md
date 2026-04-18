# AGENT_GROWTH_LEDGER.md（追記専用）

> 目的: 各実行旅で得た再利用知見を蓄積し、次回以降の精度と速度を上げる。
> ルール: 追記専用。過去エントリの本文は編集しない。

---

## LATEST_ENTRY
- ENTRY_ID: ENTRY-0005
- UPDATED_AT: 2026-04-17

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
  - harnes/LEARNING_SYSTEM.md の PATTERN-UI-MULTI-TOUCH-CORNERS 追記
  - harnes/templates/* への到達性チェック項目追加
- Reuse Plan:
  - 今後の多人数スマホUI案件で、着手時から四隅到達性をDoD/回帰に組み込む
- Confidence:
  - high

## ENTRY-0004
- Created-At: 2026-04-17
- Journey-ID: game67-cat-tracker-bootstrap
- Context: 4x3の猫追跡ゲームを新規実装
- Reusable Insight:
  - 追跡系ミニゲームは「表示中」「移動中(非表示)」「回答待ち」を明示分離すると不具合を抑えやすい
- Reasoning Pivot:
  - 先にアニメ演出から作る案をやめ、状態遷移を先に固定した
- Do:
  - ラウンド進行とUI有効/無効の制御を状態フラグに集約する
- Don’t:
  - ボタン活性条件を各イベントに分散して重複管理しない
- Evidence:
  - game67/app.js の `state.isAnimating` / `state.isAnswering` / `updateButtonStates`
- Reuse Plan:
  - 次回の反射神経・記憶系ゲームでも3状態分離を初期設計テンプレにする
- Confidence:
  - high


## ENTRY-0005
- Created-At: 2026-04-17
- Journey-ID: game67-difficulty-geometric-tuning
- Context: オーナー指示に基づき表示時間カーブを等差から等比へ変更
- Reusable Insight:
  - 反復ラウンド型ゲームは「等比減衰」の方が後半難易度の伸びを作りやすい
- Reasoning Pivot:
  - 固定減算は終盤の変化量が弱く、80%減衰で緊張感を出す方針へ転換
- Do:
  - 難易度パラメータは算式（ratio）として実装し、係数で調整可能にする
- Don’t:
  - 下限値を早期に固定し、終盤難易度の余地を狭めない
- Evidence:
  - game67/app.js の `DISPLAY_RATIO` と `truncateToTwoDecimals`
- Reuse Plan:
  - 次回の段階難易度ゲームでも等比減衰をデフォルト候補にする
- Confidence:
  - high
