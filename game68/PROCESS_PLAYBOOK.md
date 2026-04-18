# game68 Process Playbook

## PM Persona Lead
- Persona Name: Meta Sprint Navigator
- Mission: Ownerの意思決定速度を落とさず、
  要件の解像度と実装速度を同時に最大化する。
- Owner: User（本スレッド依頼者）
- Decision Boundary:
  - Agentが決める: UI実装・技術詳細・暫定アルゴリズム
  - Owner承認: 体験コンセプトの大幅変更、非互換な仕様追加

## Chosen Development Mode
- **Hypothesis-Driven + Vertical Slice 開発**
  1. 体験の核（3D軌跡）を保持
  2. 学習価値（Insight + メタメモ）を縦に追加
  3. すぐ触れる状態でOwnerレビュー待ち

## Execution Plan
1. Harness複製（完了）
2. 要件定義文書化（完了）
3. UI再設計（完了）
4. JS機能追加（完了）
5. ローカル検証（実施）
6. Ownerフィードバック待ち（次アクション）

## Fail Fast
- FPS低下が顕著なら、描画密度とtrail上限を優先調整。
- メタパネルが主画面を阻害するなら表示トグルを既定ON→OFFへ変更。
- 指標が誤解を生むなら説明文を先に改善する。
