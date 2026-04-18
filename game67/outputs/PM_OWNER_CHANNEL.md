# PM Owner Channel

## PM-ENTRY-0001
- Date: 2026-04-17
- Type: Comment
- Topic: 初期要件の分解
- Fact: 猫追跡ゲームの核要件は「4x3」「移動中は消える」「最終位置回答」。
- Interpretation: 状態管理を先に固めると仕様追加に強い。
- Proposal / Ask: Sprint1は単体プレイアブル完成に集中したい。
- Impact (Scope / Schedule / Quality / Cost): Scope固定で品質を担保、日内完了見込み。
- Owner Action Needed: No
- Deadline: 2026-04-17
- Status: Closed

## PM-ENTRY-0002
- Date: 2026-04-17
- Type: Recommendation
- Topic: 難易度上昇の設計
- Fact: ラウンド進行に応じて猫表示時間を前ラウンドの80%へ短縮する案へ更新。
- Interpretation: 等比減衰は終盤の緊張感を高めつつ、序盤の学習時間を確保できる。
- Proposal / Ask: 初期値1000ms、下限なし、計算時は小数第3位以下切り捨てで運用する。
- Impact (Scope / Schedule / Quality / Cost): 低コストで難易度の伸びを明確化できる。
- Owner Action Needed: No
- Deadline: 2026-04-17
- Status: Closed

## PM-ENTRY-0003
- Date: 2026-04-17
- Type: Diary Note
- Topic: 実装中の判断メモ
- Fact: 猫が同一マス連続になると追跡感が弱まる。
- Interpretation: 連続同一マス禁止で体験が明確になる。
- Proposal / Ask: 次マス選定で前回と同じindexを除外した。
- Impact (Scope / Schedule / Quality / Cost): コード増分は軽微、可読性と体験向上。
- Owner Action Needed: No
- Deadline: 2026-04-17
- Status: Closed

## PM-ENTRY-0004
- Date: 2026-04-17
- Type: Insight Report
- Topic: 最小実装での体験成立条件
- Fact: 「表示」「消去」「回答待ち」の3状態を分離するとバグが減る。
- Interpretation: フェーズ管理中心で進めると将来拡張しやすい。
- Proposal / Ask: Sprint2で演出追加する場合も状態機械維持を推奨。
- Impact (Scope / Schedule / Quality / Cost): 品質向上、将来の開発速度改善。
- Owner Action Needed: No
- Deadline: 2026-04-19
- Status: Open
