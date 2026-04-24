# 90_AGENT_GROWTH_LEDGER.md（追記専用）

> 目的: 各実行旅で得た再利用知見を蓄積し、次回以降の精度と速度を上げる。
> ルール: 追記専用。過去エントリの本文は編集しない。

---

## LATEST_ENTRY
- ENTRY_ID: ENTRY-0007
- UPDATED_AT: 2026-04-24

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
- Created-At: 2026-04-23
- Journey-ID: game70-3d-laser-billiards-safe-retrospective
- Context: game24の本質を3Dへ拡張した実装後、@pm @safe観点で振り返りを構造化
- Reusable Insight:
  - 「本質抽出」タスクは、見た目要件より先に**由来機能の要件マップ（挙動・操作・表現）**を固定すると完成定義のズレを抑制できる
- Reasoning Pivot:
  - 「3Dとして成立していれば十分」から「game24由来の操作語彙を保持しつつ3D化する」に評価軸を変更
- Do:
  - 実装前に元作品の必須要素（例: 配置モード、プリセット、計測UI）をチェックリスト化する
- Don’t:
  - 先に新規表現へ寄せて、元作品の再現要素を暗黙のまま進めない
- Evidence:
  - game70/RETROSPECTIVE.md の Not Done / Carry-over に未導入要素を明記
- Reuse Plan:
  - 次回の「既存ゲーム本質抽出→別次元拡張」案件で、SESSION_BOOTに由来機能チェックリストを必須項目として注入
- Confidence:
  - high


## ENTRY-0005
- Created-At: 2026-04-23
- Journey-ID: game70-3d-presets-and-placement-modes
- Context: harnessのCarry-overに沿って、game24由来の操作語彙（配置モード/プリセット）を3D版へ追加
- Reusable Insight:
  - 「本質移植」では、まず操作語彙を揃えるとユーザーが“同系作品の進化版”として認識しやすい
- Reasoning Pivot:
  - 先にレンダリング高度化を進める方針から、先に操作モデル互換（配置モード/プリセット）を優先する方針へ変更
- Do:
  - Carry-over項目はUI操作に見える形で最初に回収する
- Don’t:
  - 技術的改善のみ先行して、ユーザーが触って違いを実感できる改善を後回しにしない
- Evidence:
  - game70/index.html の `preset` / `placement` / `maxBounce` コントロール追加
  - game70/app.js の `presets` / `getPlacementPos` / `getPlacementVel` / `reflectAxis` 追加
- Reuse Plan:
  - 今後の2D→3D拡張案件でも「操作語彙互換レイヤ」を実装チェックリストの先頭に置く
- Confidence:
  - high


## ENTRY-0006
- Created-At: 2026-04-23
- Journey-ID: harness-outline-and-remaining-visibility
- Context: 「残件があるのか分からない」課題に対応するため、harnessのREADME/テンプレートを進捗可視化中心へ更新
- Reusable Insight:
  - 実装品質より前に、**残件の可視化フォーマット**を固定するとレビューの齟齬が大きく減る
- Reasoning Pivot:
  - 口頭での進捗共有に頼る運用から、Session開始時アウトライン + 終了時3区分報告（✅/⏳/🧊）へ移行
- Do:
  - セッション開始時に「残件あり/なし」を宣言し、残件ありならBacklogへID登録する
- Don’t:
  - Done/Carry-overを同じ箇条書きで混在させない
- Evidence:
  - harness/00_README.md に残件可視化ルール追記
  - harness/templates/10_SESSION_BOOT_TEMPLATE.md に Execution Outline / Remaining Work Declaration 追記
  - harness/templates/30_PROJECT_PROGRESS_BOARD_TEMPLATE.md に Session Outline / End-of-Session Report Rule 追記
- Reuse Plan:
  - 次回以降の全案件で「残件なし」の根拠をBacklog状態で示す
- Confidence:
  - high


## ENTRY-0007
- Created-At: 2026-04-24
- Journey-ID: game70-new-branchless-filegroup
- Context: 競合回避のため old/new を分離しつつ、iPhoneフルスクリーン・線表現・カメラ慣性を改善
- Reusable Insight:
  - 競合回避を優先する局面では「同一ファイル改修」より「新ファイル群での段階移行」の方がレビュー・マージが安定する
- Reasoning Pivot:
  - 既存ファイル上書き方針から、`old/` を固定参照し `new/` で改善を積む方針へ変更
- Do:
  - iOS制約（Fullscreen API非対応）には疑似フルスクリーンを先に用意する
- Don’t:
  - Web標準APIだけで全端末を同一挙動にしようとして詰まらない
- Evidence:
  - `game70/new/app.js` の `toggleFullscreen` / `enterPseudoFullscreen`
  - `game70/new/app.js` の `colorMode` / `lineWidthFor` / 慣性更新
- Reuse Plan:
  - 次回以降のモバイルWeb可視化案件でも old/new 分離で改修ラインを作る
- Confidence:
  - high
