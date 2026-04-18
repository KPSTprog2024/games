# 35_GAME_CONTENT_FILE_STRUCTURE_TEMPLATE.md

ゲームプロジェクト開始時に、以下の構造を基準として採用する。

## 1) 標準ディレクトリ構成（最小）

```text
<project-root>/
  README.md
  REQUIREMENTS.md
  GAME_ESSENCE.md
  PROJECT_MANAGER.md
  SESSION_BOOT.md
  SPRINT_REVIEW.md
  NEXT_PROMPT.md
  PM_OWNER_CHANNEL.md
  harnes/
    （グローバルハーネスをコピー）
  src/
    main.js
    core/
    features/
    ui/
    assets/
  tests/
    smoke/
    regression/
  docs/
    decisions/
    risks/
    metrics/
  outputs/
    screenshots/
    reports/
```

## 2) 単一HTML系の軽量構成（短期PoC向け）

```text
<project-root>/
  index.html
  style.css
  app.js
  README.md
  REQUIREMENTS.md
  SESSION_BOOT.md
  SPRINT_REVIEW.md
  NEXT_PROMPT.md
  harnes/
```

## 3) 必須文書ファイル（PM統制対象）

- `REQUIREMENTS.md`: Goal / Scope / Non-Scope / DoD
- `SESSION_BOOT.md`: 当該スプリントの起動条件
- `SPRINT_REVIEW.md`: 判定と根拠
- `NEXT_PROMPT.md`: 次回作業の引き継ぎ
- `PM_OWNER_CHANNEL.md`: 非同期意思決定ログ

## 4) ファイル命名規約

- 進行文書は大文字スネークケース（例: `SPRINT_REVIEW.md`）
- テンプレートは番号付き（例: `30_*.md`）
- 実行ログは日付付き（例: `2026-04-18_SPRINT_REVIEW.md`）
- 1ファイル1責務（レビューと次回指示は分離）

## 5) PM Personaの構造監査チェック

- [ ] 必須文書ファイルが存在する
- [ ] `harnes/` が配置されている
- [ ] ソースとドキュメントが分離されている
- [ ] outputsに検証成果（レポート/画像）が保存されている
- [ ] 命名規約違反がない

## 6) 逸脱時の対応

- 構造逸脱を発見したら `PROJECT_PROGRESS_BOARD` に `⏳ 構造修正` を起票
- `NEXT_PROMPT` の先頭3タスク以内に修正を入れる
- Completion GateのGO判定前に、必須文書欠落を0にする
