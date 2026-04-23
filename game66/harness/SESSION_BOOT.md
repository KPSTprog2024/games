## 1) Context
- 対象スプリント: game11改善版をgame66として新規作成
- 対象ファイル: `game66/index.html`, `game66/style.css`, `game66/app.js`, `game66/harness/*`
- 非対象ファイル: `game11/*`（変更禁止）

## 2) Project Invariants
- 幼児向けのやさしい語彙とシンプル操作を維持する。
- 1画面1目的で迷わせない。
- 学習の正誤だけでなく「自信度」を扱い、メタ認知を育てる。

## 3) Goal
- game11の体験エッセンス（季節学習×解説）を保ちつつ、メタ認知ループを追加する。

## 4) Scope
- game66を新規作成（game11は非変更）
- グローバルハーネスの複製
- PMペルソナ主導の計画とOwner向け運用ログの開始

## 5) Non-Scope
- 画像素材の追加
- 外部ライブラリ導入

## 6) Constraints
- 既存game11を変更しない。
- ローカルのみで完結すること。

## 7) PM Persona Activation
- Persona Name: Meta-Learning PM
- 文書能力フォーカス: 要件構造化 / 意思決定記録 / 進行可視化
- Owner: ユーザー
- Decision Boundary: UI微調整はPM裁量、仕様方針はOwner合意
- PM Owner Channel運用頻度: 指示の都度

## 8) DoD
- game66が独立動作する。
- 全クイズで自信度入力→解説に反映される。
- 進捗と自信ログが保存される。

## 9) Fail Fast
- game11に差分が出たら中断
- JS構文エラーが出たら中断
- 主要画面遷移が壊れたら中断

## 10) Metrics Plan
- 指標: 直近20問の正答率と平均自信度
- 閾値: ホーム画面で可視化される
- 観測単位: 回答1件

## 13) テンプレート適用方針
- SESSION_BOOT_TEMPLATE: Use
- PROJECT_MANAGER_PERSONA_TEMPLATE: Use
- DESIGN_PROMPT_TEMPLATE: Skip（大規模UI再設計なし）
- SPRINT_REVIEW_TEMPLATE: Use（最終報告で代替）
- NEXT_PROMPT_TEMPLATE: Use（Ownerの次指示待ち）
- JOURNEY_LEARNING_ENTRY_TEMPLATE: Skip（今回最小運用）
