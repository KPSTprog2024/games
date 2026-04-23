# 20_HARNESS_UPDATE_POLICY.md

ハーネス更新の目的は、テンプレートを増やすことではなく、
**プロジェクト進行の判断コストを下げること**である。

## 1) 適用範囲

この方針は以下に適用する。

- `harness/` 配下の全ファイル
- `harness/templates/` の命名規約・参照規約
- 学習台帳の構造（`harness/learning/`）

## 2) 更新原則

1. **本体とメタを分離する**
   - 実行テンプレートは `harness/`
   - 改善検討・提案・評価は `harness_meta/`
2. **番号順で読める構造を維持する**
   - 新規追加時は既存番号体系に従う
3. **1変更1目的**
   - 変更理由を1行で説明できない追加はしない
4. **可逆性を担保する**
   - 既存運用を壊す変更は移行手順を必須化する
5. **PM Personaが統制可能であること**
   - Progress Board / Completion Gate / Next Promptに反映可能であること

## 3) 更新手順（標準）

1. 現状課題を `harness_meta/` に記述
2. Keep / Trim / Add を明示
3. 影響ファイル一覧を作成（本体・テンプレート・参照先）
4. `harness/` 側を更新
5. 参照リンク切れを確認
6. 最小運用（Core）で読み順検証
7. Full運用での整合検証
8. 変更サマリとロールバック方針を `harness_meta/` に記録

## 4) 受け入れ条件（DoD）

- [ ] `harness/` と `harness_meta/` が役割分離されている
- [ ] 追加ファイルは番号順で読み順が明確
- [ ] 本体テンプレートからメタ文書への依存がない
- [ ] 参照パスがすべて有効
- [ ] PM Personaの運用フロー（Boot→Board→Review→Gate→Next）に組み込める

## 5) 禁止事項

- メタ提案文書を `harness/templates/` に置く
- 実運用テンプレートに議論メモを混在させる
- 番号体系を壊す命名（例: 無番号ファイルの追加）

## 6) 変更記録テンプレート

```md
## CHANGE-YYYYMMDD-XX
- Why:
- Keep:
- Trim:
- Add:
- Affected Files:
- Migration Notes:
- Rollback Plan:
- Owner Approval:
```
