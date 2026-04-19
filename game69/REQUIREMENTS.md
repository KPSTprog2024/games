# REQUIREMENTS: String Art Web App (game69)

## 1. Goal
ユーザーが任意に描いた線分から2本ペアを複数指定し、または連鎖的に2本ペアを自動構成して、端点の対応関係と分割数を指定することで、ストリングアートを自動生成し、順次描画できるWebアプリを提供する。

## 2. Scope
- 2Dキャンバス上で線分を追加・選択・削除する。
- 選択した2線分に対し、分割数Nで補間線を生成する。
- 複数の2線分ペアをキュー登録して連続生成する。
- 複数線分から閉図形を検出し、正図形候補への入力補助を行う。
- 線を一括表示または順次アニメーション表示する。
- 生成結果をPNGでエクスポートする（MVPでは任意機能）。

## 3. Non-Scope
- 複数ユーザー同時編集。
- クラウド保存、SNS直接投稿。
- 3Dストリングアート。

## 4. Functional Requirements

### FR-01 線分作成
- MUST: ユーザーはキャンバス上でドラッグして線分を1本作成できる。
- MUST: 作成済み線分は一覧表示され、IDで識別できる。

### FR-02 線分選択
- MUST: 作成した線分から2本を選択できる。
- MUST: 各線分ごとに始点/終点の向きを選択できる（例: Aはstart→end、Bはend→start）。
- SHOULD: 選択中の線分は色や太さで強調表示される。

### FR-03 分割・補間生成
- MUST: 分割数N（2〜300）を指定できる。
- MUST: 2線分を同数Nで分割し、対応点同士を線で結んだN+1本を生成する。
- MUST: 同一入力で再実行した場合、同じ幾何結果を返す。

### FR-04 描画モード
- MUST: 「即時表示」と「順次描画」の2モードを提供する。
- MUST: 順次描画では描画間隔（ms）を指定できる。
- SHOULD: 再生/停止/リセットを操作できる。

### FR-05 編集操作
- MUST: Undo（1手以上）を提供する。
- SHOULD: 全クリア機能を提供する。

### FR-06 エクスポート
- SHOULD: キャンバスをPNG保存できる。

## 5. Non-Functional Requirements
- NFR-01 性能: 分割数200時でも、初回描画開始まで1秒以内（標準的ノートPC想定）。
- NFR-02 操作性: 主要フロー（線分作成→2本選択→生成開始）を3ステップ以内で実行できる。
- NFR-03 可読性: 生成線の色・太さをUIで調整可能にする（少なくともプリセット3種）。
- NFR-04 安定性: 入力不正（線分不足、N未設定）時は処理を実行せず、理由を明示する。

## 6. Data Model (Draft)
- Segment
  - `id: string`
  - `start: {x: number, y: number}`
  - `end: {x: number, y: number}`
- StringArtJob
  - `segmentAId: string`
  - `segmentBId: string`
  - `directionA: "start_to_end" | "end_to_start"`
  - `directionB: "start_to_end" | "end_to_start"`
  - `divisions: number`
  - `mode: "instant" | "sequential"`
  - `intervalMs: number`

## 7. Acceptance Criteria (Given / When / Then)

### AC-01 最小生成
- Given: 線分A/Bが各1本存在し、N=10が指定される。
- When: 生成ボタンを押す。
- Then: 対応点を結ぶ11本の線が描画される。

### AC-02 向き反転
- Given: 同一の線分A/Bで向き設定のみ変更する。
- When: 再生成する。
- Then: 模様の反り方向が変化し、プレビューと一致する。

### AC-03 順次描画
- Given: 順次描画モード、interval=50ms。
- When: 生成を開始する。
- Then: 線が時間順で1本ずつ追加される。

### AC-04 入力不足の保護
- Given: 線分が1本しかない。
- When: 生成を試行する。
- Then: 生成は行われず、2本必要である旨のエラーを表示する。

### AC-05 Undo
- Given: 直前に線分を追加した。
- When: Undoを押す。
- Then: 追加した線分が1手戻る。

## 8. Open Questions
1. 線分の本数上限をMVPで制限するか（提案: 100本）。
2. PNG保存時に背景透過をサポートするか。
3. モバイル向け操作（指描画）を初版で含めるか。
