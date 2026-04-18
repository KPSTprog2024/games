# DESIGN_SPEC: String Art Web App (game69)

## 1. デザイン方針
- 目的は「作図の楽しさ」と「手順の理解」を同時に満たすこと。
- 40_DESIGN_PROMPT_TEMPLATEの原則に沿い、操作の因果関係が視覚で伝わるUIを優先する。
- 装飾よりも、線分の状態・選択・向き・進行中アニメーションの可視化を重視する。

## 2. 画面構成（Desktop First）

### A. Top Bar
- アプリ名
- Undo / Redo（将来）/ Clear
- Export PNG

### B. Left Panel（入力・制御）
1. Segment List
   - 作成済み線分をID付きで表示
   - クリックで選択トグル
2. Pair Settings
   - Segment A / Segment B の選択
   - Direction A（start→end / end→start）
   - Direction B（start→end / end→start）
   - Divisions（2〜300）
3. Render Settings
   - Mode（Instant / Sequential）
   - Interval ms（Sequential時のみ有効）
   - Line style（色、太さ、透明度）
4. Actions
   - Generate
   - Stop
   - Reset Render

### C. Main Canvas
- 線分描画領域（ドラッグで作成）。
- 選択中線分: 強調色。
- 端点ハンドル: start/endが識別できるラベル表示。
- 補間プレビュー: Generate前に薄色で仮表示可能（オプション）。

### D. Bottom Status Bar
- 現在のモード
- 線分本数
- 描画進捗（例: 23/101）
- エラーメッセージ

## 3. インタラクションフロー

### Flow-01: 作成〜生成（基本）
1. キャンバスをドラッグして線分を2本以上作成。
2. Left PanelでSegment A/Bを選択。
3. 各線分の向きと分割数Nを指定。
4. Generateで線群を描画。

### Flow-02: 順次描画
1. ModeをSequentialに変更。
2. interval msを指定。
3. Generateでアニメ開始。
4. 必要に応じてStop/Reset。

### Flow-03: 修正
1. 線分が誤っている場合はUndo。
2. 向きまたはNを調整して再生成。

## 4. 状態モデル（UI State）
```ts
state = {
  segments: Segment[],
  selectedSegmentIds: string[],
  job: {
    segmentAId: string | null,
    segmentBId: string | null,
    directionA: 'start_to_end' | 'end_to_start',
    directionB: 'start_to_end' | 'end_to_start',
    divisions: number,
    mode: 'instant' | 'sequential',
    intervalMs: number,
  },
  render: {
    lines: Line[],
    cursor: number,
    running: boolean,
  },
  history: HistoryStack,
  errorMessage: string | null,
}
```

## 5. アルゴリズム仕様（補間）
1. 線分A/Bそれぞれで、向きを反映した有向端点 `(P0, P1)`, `(Q0, Q1)` を確定。
2. `i = 0..N` について比率 `t = i / N` を計算。
3. 分割点 `PA(t) = P0 + t(P1-P0)`、`QB(t) = Q0 + t(Q1-Q0)` を求める。
4. 線 `L_i = (PA(t), QB(t))` を生成。
5. Instantは全`L_i`を一括描画、Sequentialは`requestAnimationFrame` + intervalで順次描画。

## 6. エッジケース対応
- 線分不足（<2本）: Generate無効化 + ガイド文。
- 同一線分をA/B両方に選択: 許可（ただし警告表示）。
- divisionsが範囲外: 入力補正（min/max clamp）またはエラー。
- 長さ0の線分: 作成時に弾く。

## 7. アクセシビリティ/可用性
- 主要ボタンにショートカット割当（例: G=Generate, U=Undo）。
- 色だけに依存しない状態提示（アイコン/ラベル併用）。
- 最低コントラスト比 4.5:1 を目標。

## 8. 実装前チェックリスト
- [ ] Segment A/Bと向き指定のUI文言が一貫している。
- [ ] 受け入れ基準AC-01〜AC-05に対応する画面要素が存在する。
- [ ] エラー表示位置が固定で視認できる。
- [ ] Sequential停止時の再開/リセット仕様が明確。
