# PM Owner Channel

## PM-ENTRY-0001
- Date: 2026-04-17
- Type: Comment
- Topic: game68初期方針
- Fact: game54の核を維持しつつ、実験の再現性を高める設計で着手。
- Interpretation: 「見て終わり」から「仮説検証ループ」に拡張するのが改善インパクト最大。
- Proposal / Ask: まずは学習導線強化版を提示し、次に演出/ゲーム性を増やす二段階で進めたい。
- Impact (Scope / Schedule / Quality / Cost): Scopeは適正、Scheduleは短期、Quality向上見込み大、Cost増加なし。
- Owner Action Needed: Yes
- Deadline: 次レビュー時
- Status: Open

## PM-ENTRY-0002
- Date: 2026-04-17
- Type: Recommendation
- Topic: 次スプリントの優先順位
- Fact: 現版でメタメモ・プリセット・指標可視化まで実装済み。
- Interpretation: 次は「課題モード」か「録画/共有」のどちらか一点集中が望ましい。
- Proposal / Ask: 推奨は課題モード（目標比率に合わせるトレーニング）を先に追加。
- Impact (Scope / Schedule / Quality / Cost): Scope中、Schedule短、学習体験の質向上、Cost小。
- Owner Action Needed: Yes
- Deadline: 次指示時
- Status: Open

## PM-ENTRY-0003
- Date: 2026-04-17
- Type: Diary Note
- Topic: 運用メモ
- Fact: メタ認知パネルは情報量が増えるため、Mキーで表示切替を実装。
- Interpretation: 初見ユーザーの認知負荷を抑えつつ、深掘り用途を確保できる。
- Proposal / Ask: Ownerレビューで「常時表示」か「初期非表示」かを決めたい。
- Impact (Scope / Schedule / Quality / Cost): Scope小、Schedule影響軽微、UX品質に直接影響、Costなし。
- Owner Action Needed: Yes
- Deadline: 次レビュー時
- Status: Open

## PM-ENTRY-0004
- Date: 2026-04-18
- Type: Comment
- Topic: 課題モード着手とメタパネル初期非表示
- Fact: Owner指示に基づき、Challenge Modeを実装し、メタ認知パネルを初期`hidden`に変更。
- Interpretation: 初見導線を軽くしつつ、ゲーム性を先に検証できる構成になった。
- Proposal / Ask: 次は課題難易度（許容誤差・キープ秒数）のチューニング方針を決めたい。
- Impact (Scope / Schedule / Quality / Cost): Scope小〜中、Schedule影響小、体験品質向上、Cost増加なし。
- Owner Action Needed: Yes
- Deadline: 次指示時
- Status: Open

## PM-ENTRY-0005
- Date: 2026-04-18
- Type: Recommendation
- Topic: 課題モード許容度の仮説採用
- Fact: 許容誤差は難易度依存で調整可能にし、Easy→Normal→Hardの自動昇格を実装。
- Interpretation: 初見離脱を防ぎつつ、上達時の単調化を防ぐためには固定閾値より段階式が有効。
- Proposal / Ask: 現行値（0.75/0.60/0.45, lock 0.9/1.2/1.4秒）を暫定採用し、次回はセッションログで再調整する。
- Impact (Scope / Schedule / Quality / Cost): Scope小、Schedule影響ほぼなし、ゲーム体験品質向上、Costなし。
- Owner Action Needed: No
- Deadline: -
- Status: Closed

## PM-ENTRY-0006
- Date: 2026-04-18
- Type: Insight Report
- Topic: 残対応の判断（チャレンジ履歴）
- Fact: 残タスクとしてセッション結果の可視化が未実装だったため、Recent Sessions（最終/最高/直近5件）を追加。
- Interpretation: プレイヤーが上達を把握できると継続率が上がり、許容度チューニングの妥当性も観測しやすくなる。
- Proposal / Ask: 次スプリントでは履歴に日時と平均誤差を追加し、難易度調整をデータ駆動化する。
- Impact (Scope / Schedule / Quality / Cost): Scope小、Schedule影響小、品質向上、Costなし。
- Owner Action Needed: No
- Deadline: -
- Status: Closed

## PM-ENTRY-0007
- Date: 2026-04-18
- Type: Comment
- Topic: Sprint 2 開始（履歴のデータ駆動化）
- Fact: 前スプリントの提案どおり、履歴に日時と平均誤差を追加し、最終平均誤差をUIに表示。
- Interpretation: 難易度・許容度の妥当性をプレイログから評価できる状態に近づいた。
- Proposal / Ask: 次は「セッション統計CSV出力」か「難易度自動調整閾値の学習化」のどちらを先行するか決めたい。
- Impact (Scope / Schedule / Quality / Cost): Scope小、Schedule影響小、品質向上、Costなし。
- Owner Action Needed: Yes
- Deadline: 次レビュー時
- Status: Open

## PM-ENTRY-0008
- Date: 2026-04-18
- Type: Recommendation
- Topic: 次スプリントの別観点改善（操作の再現性）
- Fact: CSV/難易度学習化は見送り指示のため、別観点としてパラメータ操作のUndo/Redoを実装。
- Interpretation: 実験系UIでは「一手戻す」があるだけで探索速度と再現性が大きく改善する。
- Proposal / Ask: 既定ショートカットを `Ctrl+Z / Ctrl+Y` で運用し、将来は履歴保存件数を設定可能にする。
- Impact (Scope / Schedule / Quality / Cost): Scope小、Schedule影響小、実験品質向上、Costなし。
- Owner Action Needed: No
- Deadline: -
- Status: Closed

## PM-ENTRY-0009
- Date: 2026-04-18
- Type: Comment
- Topic: スマホ操作方針への調整 + 残開発アウトライン
- Fact: Ctrl+Z/Ctrl+Yショートカット依存を除去し、画面上の「一手戻す / 一手進める」ボタンを主導線化。さらにモバイル下部ドックにも同ボタンを配置。
- Interpretation: 親指到達性が上がり、キーボード非依存の要件に整合した。
- Proposal / Ask: `SPRINT_BACKLOG.md` を新設し、残開発（B5/B6/B7）を明文化。次はB5チュートリアル導線を推奨。
- Impact (Scope / Schedule / Quality / Cost): Scope小、Schedule影響小、モバイルUX向上、Costなし。
- Owner Action Needed: Yes
- Deadline: 次レビュー時
- Status: Open

## PM-ENTRY-0010
- Date: 2026-04-18
- Type: Insight Report
- Topic: B5完了（初回チュートリアル導線）
- Fact: 初回訪問時のみ表示する3ステップチュートリアルを実装。手動再表示ボタンとEscでの閉じる動線も追加。
- Interpretation: 初見ユーザーの迷子率を下げ、機能理解までの時間短縮が見込める。
- Proposal / Ask: 次スプリントはB6（達成演出）を優先し、成功時の気持ちよさを強化したい。
- Impact (Scope / Schedule / Quality / Cost): Scope小、Schedule影響小、品質向上、Costなし。
- Owner Action Needed: Yes
- Deadline: 次レビュー時
- Status: Open
