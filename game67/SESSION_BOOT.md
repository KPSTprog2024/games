# game67 SESSION BOOT（Sprint 1）

## 1) Context
- 参照:
  - `game67/harnes/SOUL.md`
  - `game67/harnes/LEARNING_SYSTEM.md`
  - `game67/harnes/templates/PROJECT_MANAGER_PERSONA_TEMPLATE.md`
- 対象スプリント: Sprint 1
- 対象ファイル: `index.html`, `style.css`, `app.js`, `README.md`, `outputs/*`
- 非対象ファイル: 他gameディレクトリ

## 2) Project Invariants
- 4行3列グリッドで遊ぶ。
- 猫は表示→消える→別マス表示の流れで移動する。
- 問題進行で猫の表示時間が短くなる。
- 最後に見たマスをプレイヤーが回答する。

## 3) Goal
- game67の初期プレイアブル版を完成する。

## 4) Scope
- 単一プレイヤー向けWebゲーム実装。
- ラウンド進行、難易度上昇、正誤判定。
- オーナー向け進行ログの初回提出。

## 5) Non-Scope
- 音声演出。
- ランキングサーバー連携。
- 既存他ゲーム改修。

## 6) Constraints
- 外部ライブラリ不使用。
- 単一HTML/CSS/JSで動作。

## 7) PM Persona Activation
- Persona Name: PM-Lead Kairo
- 文書能力フォーカス: 要件構造化、進行可視化、Owner提案。
- Owner: game67オーナー
- PM Owner Channel運用頻度: スプリント内4件

## 8) DoD
- ブラウザで起動し、8ラウンド通して遊べる。
- 表示時間がラウンドごとに短縮される。
- 進行ログ（Comment/Recommendation/Diary/Insight）を残す。

## 9) Fail Fast
- 4x3構造が崩れたら中止。
- 最終位置判定が壊れたら中止。
- 表示時間短縮が働かない場合は中止。

## 10) Metrics Plan
- 指標: 1ラウンドの表示時間
- 閾値: round1 > round8
- 観測単位: 8ラウンド
- 判定: `display-ms` が段階的に減少すればPass

## 11) Deliverables
- プレイ可能実装
- 検証結果
- 次回Prompt草案
- 学習エントリ
- PM Owner Channelログ
