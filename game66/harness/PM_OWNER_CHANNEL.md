## PM-ENTRY-0001
- Date: 2026-04-17
- Type: Comment
- Topic: game66 初期計画と実行開始
- Fact: game11をベースに、ハーネス複製とメタ認知拡張を実施中。
- Interpretation: 既存学習ループは維持しつつ、自信度ログの追加が最短で効果的。
- Proposal / Ask: まず「自信度(1-3)→解説コーチング→ホーム集計表示」で初版を作成します。
- Impact (Scope / Schedule / Quality / Cost): Scope小、Schedule短、Qualityは学習振り返り向上。
- Owner Action Needed: No
- Deadline: 2026-04-17
- Status: Closed

## PM-ENTRY-0002
- Date: 2026-04-17
- Type: Recommendation
- Topic: 次スプリント候補
- Fact: 現版はprompt入力で自信度収集。操作性は最低限。
- Interpretation: 子ども向けにはボタン式UIにすると認知負荷が下がる。
- Proposal / Ask: 次指示で「自信度選択UIを画面内ボタン化」するか判断ください。
- Impact (Scope / Schedule / Quality / Cost): Scope中、Schedule中、Quality高。
- Owner Action Needed: Yes
- Deadline: 次回指示時
- Status: Open

## PM-ENTRY-0003
- Date: 2026-04-17
- Type: Comment
- Topic: 自信度ボタン化 + コンテンツ監査反映
- Fact: prompt入力を廃止し、3段階の自信度ボタンUIへ置換。語彙と絵文字の対応も再監査して差し替え。
- Interpretation: 小学生の操作負荷と誤読リスクを同時に下げられる。
- Proposal / Ask: 次は「せみ」「たけのこ」など絵文字限界語彙をイラスト素材化するか判断ください。
- Impact (Scope / Schedule / Quality / Cost): Scope中、Quality向上大、Cost中。
- Owner Action Needed: Yes
- Deadline: 次回指示時
- Status: Open

## PM-ENTRY-0004
- Date: 2026-04-17
- Type: Comment
- Topic: 4語彙のイラスト実装完了
- Fact: つくし、たけのこ、あさがお、かぶとむしにSVGイラストを新規作成し、クイズ表示/解説表示で優先使用するよう実装。
- Interpretation: 絵文字由来の誤認（意味ズレ）を低減し、語彙-視覚対応の精度を上げられる。
- Proposal / Ask: 次回はOwner素材を受領したら同じ仕組みで差し替え可能。
- Impact (Scope / Schedule / Quality / Cost): Scope小、Schedule小、Quality向上中、Cost小。
- Owner Action Needed: No
- Deadline: 2026-04-17
- Status: Closed

## PM-ENTRY-0005
- Date: 2026-04-18
- Type: Comment
- Topic: 現時点の完成判定と残課題一覧
- Fact: game66は、(1) 自信度ボタン、(2) メタ認知サマリ、(3) 4語彙の独自イラスト差し替えまで実装済み。
- Interpretation: 初期ゴール（game11改善版の独立実装）は達成。機能面は「完成」判定で良い。
- Proposal / Ask: 下記の残課題を次スプリント候補として扱いたい。
- Impact (Scope / Schedule / Quality / Cost): Scope小〜中、Quality向上余地あり。
- Owner Action Needed: Yes
- Deadline: 次回指示時
- Status: Open

### 残課題バックログ（2026-04-18 時点）
- ✅ 必須要件: game11非改変でgame66新設、ハーネス同梱、メタ認知導線追加
- ✅ 優先修正: つくし/たけのこ/あさがお/かぶとむしの視覚ズレ是正
- ⏳ 残1: Owner提供の正式素材がある場合の差し替え（現状は仮SVG）
- ⏳ 残2: E2Eテスト（画面遷移/回答/保存）自動化
- ⏳ 残3: 語彙監修ラウンド（お受験頻出セットの最終確定）
