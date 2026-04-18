# SESSION_BOOT_SPRINT_001

## 1) Context
- 参照:
  - `game69/harnes/01_SOUL.md`
  - `game69/harnes/03_LEARNING_SYSTEM.md`
  - `game69/harnes/templates/20_PROJECT_MANAGER_PERSONA_TEMPLATE.md`
  - `game69/PROJECT_CONTEXT.md`
  - `game69/PROCESS_PLAYBOOK.md`
- 対象スプリント: Sprint 001（Discovery + Planning）
- 対象ファイル:
  - `game69/REQUIREMENTS.md`
  - `game69/DESIGN_SPEC.md`
  - `game69/PROJECT_PROGRESS_BOARD.md`
  - `game69/PM_OWNER_CHANNEL.md`
- 非対象ファイル:
  - 実装コード（`index.html`, `script.js`, `style.css`）

## 2) Project Invariants（必須）
- 線分はユーザーが自由に描画できる。
- 書いた線分のうち2本を選び、各線分の始点/終点側を指定して補間を生成できる。
- 生成された線群は「順番に」描画され、進行が視覚で追える。
- 数学的計算は再現性があり、同じ入力なら同じ出力になる。

## 3) Goal
- 実装着手可能な粒度で要件定義とデザイン仕様を完成させる。

## 4) Scope
- 機能要件、非機能要件、受け入れ基準の定義。
- 画面構成、主要コンポーネント、状態遷移、エッジケース設計。

## 5) Non-Scope（必須）
- UI実装・アルゴリズム実装。
- バックエンドAPI、ユーザー管理、共有機能。

## 6) Constraints
- 単一ページWebアプリ前提（PCブラウザ優先、モバイル考慮）。
- 初回リリースはローカル完結。
- デザイン関連要件は `40_DESIGN_PROMPT_TEMPLATE` の原則を参照して反映。

## 7) PM Persona Activation（必須）
- Persona Name: Aya Kisaragi（PM Documentation Lead）
- 文書能力フォーカス: 要件構造化 / 論点分離 / 意思決定記録
- Owner: game69依頼者
- Decision Boundary: ドキュメント構造・仕様明文化はPM判断、機能優先順位はOwner最終承認
- PM Owner Channel運用頻度: 1セッションで最低2エントリ

## 8) DoD
- `REQUIREMENTS.md` にMUST/SHOULD要件と受け入れ基準を定義。
- `DESIGN_SPEC.md` に画面・操作・データモデル・アニメーション方針を定義。
- `PROJECT_PROGRESS_BOARD.md` の現在地、バックログ、リスクを更新。
- `PM_OWNER_CHANNEL.md` にComment/Recommendationを記録。

## 9) Fail Fast（必須）
- 条件1: 「2線分選択時の始点/終点対応」が未定義なら着手停止。
- 条件2: 受け入れ基準が曖昧語のみなら差し戻し。
- 条件3: 非機能要件（性能・操作性）未定義なら計画を再作成。

## 10) Metrics Plan（必須）
- 指標: 主要ユースケースの受け入れ基準定義率
- 閾値: 必須ユースケース5件中5件でGiven/When/Thenを記載
- 観測単位: 仕様書レビュー1回
- 判定: 100%でAdopt、未達はIterate

## 11) Deliverables
- 要件定義書（`REQUIREMENTS.md`）
- デザイン仕様書（`DESIGN_SPEC.md`）
- Progress Board更新
- PM Owner Channel記録

## 12) 検証コマンド
- `markdownlint "game69/**/*.md"`（環境に存在する場合）
- `git status --short`
- 期待結果: Markdown構文エラーなし、対象ファイルのみ変更。

## 13) テンプレート適用方針（必須）
- `10_SESSION_BOOT_TEMPLATE`: Use（本ファイルで適用）
- `20_PROJECT_MANAGER_PERSONA_TEMPLATE`: Use（`PM_OWNER_CHANNEL.md`に反映）
- `40_DESIGN_PROMPT_TEMPLATE`: Use（`DESIGN_SPEC.md`のデザイン原則に反映）
- `50_SPRINT_REVIEW_TEMPLATE`: Skip（実装前のため）
- `30_PROJECT_PROGRESS_BOARD_TEMPLATE`: Use
- `60_PROJECT_COMPLETION_GATE_TEMPLATE`: Skip（完了判定フェーズ未到達）
- `70_NEXT_PROMPT_TEMPLATE`: Skip（次スプリント開始時に作成）
- `80_JOURNEY_LEARNING_ENTRY_TEMPLATE`: Skip（実装後に学習抽出）
- Skip代替: Progress BoardとPM Owner Channelで判断ログを補完。

## 14) 出力フォーマット指定
- Summary / Testing / 判定（Adopt or Iterate）
- PM Owner Channel の更新結果
