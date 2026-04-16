# game63 開発推進プロセス記録（game1エッセンス抽出 → マルチペルソナ討議 → PM主導実装）

- 作成日: 2026-04-16
- 対象期間: 2026-04-15 の一連ログ
- 目的: 後続の分析フェーズで「Codex活用プロンプト設計・進行方式・再利用可能ノウハウ」に抽象化できるよう、まずは実行事実を精密に記録する。

---

## 1. 取り進め方の全体像（要約）

game63 の推進は、以下の3層を連結する方式で運用された。

1. **不変コアの固定（Essence Lock）**
   - `GAME_ESSENCE.md` の本質ループ「表示→非表示→再生」を固定し、以降の議論・実装はこの境界条件を破らない前提で行う。
2. **マルチペルソナ討議による改善要件定義（Persona Synthesis）**
   - 5歳本人、保護者、担任、認知心理、実装リードの観点を統合し、改善論点を3系統（チャンク化 / 想起間隔 / 順序×リズム）へ整理。
3. **PM主導のスプリント実行（Prompt-Governed Delivery）**
   - `NEXT_PROMPT_LOG.md` を追記型の運用台帳として、Goal / Scope / Constraints / DoD を固定。
   - `PROJECT_MANAGER.md` の実行サイクル（方針→仕様→実装→検証→引継ぎ）に従い、Sprint 1〜3→最終QAまで進行。

---

## 2. 実行アーキテクチャ（文書群の役割分担）

### 2.1 ガバナンス層

- `PROJECT_MANAGER.md`
  - 最重要原則、参照優先順位、1スプリントの実行サイクル、毎回チェックリストを定義。
- `NEXT_PROMPT_LOG.md`
  - LATESTポインタで「次に読むべきプロンプト」を一意化。
  - 追記専用ルールにより、経緯の監査可能性を維持。

### 2.2 設計層

- `outputs/01_FACILITATION_FRAME.md`
  - 目的・評価軸・進行型・合意ルーブリックを定義。
- `outputs/02_PERSONA_PANEL_DISCUSSION.md`
  - マルチペルソナ討議を構造化ログとして保存。
- `outputs/03_THREE_GAME_CONCEPTS.md`
  - 3案（案1/案2/案3）を「狙い・ループ・難易度カーブ・失敗導線・実装フェーズ」で比較可能化。
- `outputs/07_SUPER_UPGRADE_MASTER_PLAN.md`
  - 導入順（案1→案3→案2）をSprint計画として統合。

### 2.3 実装・検証層

- `outputs/08`〜`15`
  - タスク分解、各Sprint実装チェック、移行判断、最終QAまでを段階的に固定。
  - 最終的に「機能追加スプリント終了、以後は保守モード」という運用状態まで明文化。

---

## 3. 時系列ログ（実行事実）

## 3.1 フェーズ0: 設計準備

- ファシリテーション枠組みを定義し、成功条件（保持・想起・転移・継続）を合意指標として設定。
- 進行ロールを分離（ディレクター / 学習デザイナー / 認知心理 / UX / 保護者 / 実装リード）し、議論の責務混線を回避。

## 3.2 フェーズ1: マルチペルソナ討議

- 5歳継続性・保護者運用・教育妥当性・実装現実性を同時評価。
- 合意:
  - 底上げは「対象数増加のみ」ではなく、**記憶方略の獲得**を伴うべき。
  - 追加要素は3系統（チャンク化 / リズム順序化 / 想起間隔）に整理。
  - 失敗時は罰ではなく、次の一手ヒントを返す。

## 3.3 フェーズ2: 3案設計と導入順決定

- 案1（チャンク化）を即効性・実装容易性の観点で先行。
- 案3（遅延再想起）を定着化フェーズに配置。
- 案2（順序×リズム）を上位強化として後段導入。
- これを `07_SUPER_UPGRADE_MASTER_PLAN.md` で Sprint 1〜3 に落とし込んだ。

## 3.4 フェーズ3: PM運用基盤化

- PM運用書で「毎回の参照順」「フェーズごとの実施項目」「禁止事項（本質破壊）」を固定。
- プロンプトログを追記専用化し、各エントリに Goal / Scope / DoD / Next を必須化。

## 3.5 フェーズ4: スプリント実行

- **Sprint 1**: チャンク化支援MVP（色チャンク、失敗ヒント、難易度調整、必須イベント）
- **移行判断**: 実装基盤を `game1` 本体から `game63/game1_upgrade` へ移し、独立改修運用へ。
- **Sprint 2**: 遅延再想起（1〜3ラウンド遅延、`source_round_id` 計測、再来要約表示）
- **Sprint 3**: 順序×リズム（テンポ選択、リズムガイド、順序ミス追跡）
- **Sprint 3調整**: 順序ミスを段階ヒント化、テンポ提案、順序完遂率サマリ追加。
- **Final QA**: 主要導線と計測整合を確認し、完成判定。

## 3.6 フェーズ5: 運用モード遷移

- `PROMPT-0010` にて「完成済み / 以後は保守・微調整のみ」の方針へ移行。
- 変更可能範囲を「重大不具合修正・5歳UI文言改善・ログ欠損補修」に限定。

---

## 4. この進め方の構造的特徴（分析前の事実整理）

1. **コア固定 → 変化許容の境界明確化**
   - 創造的改修と本質破壊を切り分けた。
2. **ペルソナ統合 → 要件の偏り抑制**
   - 単一視点起因の過剰最適化を防止。
3. **Prompt駆動PM → 反復実装の再現性確保**
   - LATESTポインタと追記専用ログで、担当交代時も継続しやすい。
4. **MVP段階導入 → リスク分散**
   - 案1→案3→案2 の順で難易度と実装コストを制御。
5. **計測前提開発 → 検証可能性確保**
   - 各SprintのDoDにイベント整合を含め、改善の判断材料を残した。

---

## 5. 後続分析に引き渡すための観測ポイント

次フェーズ（Codexプロンプト評価・進め方評価・抽象化）で、特に以下を評価対象にすると再利用知見化しやすい。

- プロンプト記述品質
  - Goal/Scope/Constraints/DoD/Next の一貫性
- スプリント遷移品質
  - 未達項目の吸収、移行判断（game1→game63）の妥当性
- 計測設計品質
  - 機能追加ごとのイベント設計と検証粒度
- 保守移行品質
  - 完成判定後のスコープ制限の運用容易性

---

## 6. 再利用可能な運用テンプレート（ドラフト）

本件の実績から、他案件へ転用可能な最小テンプレートを以下とする。

1. **Essence Doc**（不変コア定義）
2. **Facilitation Frame**（役割・評価軸・進行）
3. **Persona Discussion Log**（多視点合意ログ）
4. **Concept Options**（3案程度の比較設計）
5. **Master Plan**（段階導入順 + KPI）
6. **Prompt Ledger**（追記専用、LATEST付き）
7. **Sprint Check Docs**（DoD実測記録）
8. **Final QA + Ops Mode**（完成判定と以後スコープ）

この8点セットを維持することで、
- 「思いつき開発」から
- 「境界が明確で、引き継ぎ可能な改善開発」
へ移行しやすい。

---

## 7. 参照元（本記録の根拠）

- `game63/README.md`
- `game63/PROJECT_MANAGER.md`
- `game63/NEXT_PROMPT_LOG.md`
- `game63/outputs/00_DELIVERY_MAP.md`
- `game63/outputs/01_FACILITATION_FRAME.md`
- `game63/outputs/02_PERSONA_PANEL_DISCUSSION.md`
- `game63/outputs/03_THREE_GAME_CONCEPTS.md`
- `game63/outputs/07_SUPER_UPGRADE_MASTER_PLAN.md`
- `game63/outputs/08_SPRINT1_TASK_BREAKDOWN.md`
- `game63/outputs/10_SPRINT1_IMPLEMENTATION_CHECK.md`
- `game63/outputs/11_MIGRATION_NOTE_GAME63_PATH.md`
- `game63/outputs/12_SPRINT2_IMPLEMENTATION_CHECK.md`
- `game63/outputs/13_SPRINT3_IMPLEMENTATION_CHECK.md`
- `game63/outputs/14_SPRINT3_TUNING_CHECK.md`
- `game63/outputs/15_FINAL_QA_COMPLETION.md`
