# エコー（残像）イフェクト ミニアプリ 設計書

## 1. アーキテクチャ
- **UI レイヤー**: キャンバス、エコーボタン、パラメータパネル。
- **ロジック レイヤー**: 描画処理、エコー生成、色相変化、透明度制御。
- **データ レイヤー**: スライダー設定値やモード状態を管理。

## 2. 主要コンポーネント
| コンポーネント | 役割 | 依存先 |
|---------------|------|--------|
| `CanvasManager` | キャンバス描画制御、筆跡管理 | `Brush`, `EchoEngine`, `Settings` |
| `Brush` | ペン太さの保持 | なし |
| `EchoEngine` | スナップショットからエコー生成、位置・色・透明度を調整 | `Settings` |
| `Settings` | スライダー値やモードの状態管理 | なし |
| `UIPanel` | パラメータパネルの開閉とスライダー表示 | `Settings` |
| `UIControls` | エコーボタンやモード切替ボタン | `CanvasManager`, `EchoEngine`, `Settings` |
| `GifExporter` | GIFアニメーション出力 | `CanvasManager`, `EchoEngine` |

## 3. 依存関係マップ
```
UIControls ─┬─> CanvasManager ──> EchoEngine
            ├─> Settings          ^
            └─> UIPanel ──────────┘
                         |
                         └────────> Settings

GifExporter ────────> CanvasManager
              └─────> EchoEngine

Brush <─── CanvasManager
```

## 4. データフロー
1. **ユーザー描画**: `CanvasManager` が `Brush` 設定を参照し線を描画。
2. **エコー生成**: `UIControls` からの入力で `EchoEngine` が `Settings` を参照しスナップショットからエコーを生成。
3. **パラメータ変更**: `UIPanel` のスライダー操作で `Settings` が更新され、`CanvasManager` と `EchoEngine` に反映。
4. **GIFエクスポート**: `GifExporter` が各フレームを収集しGIFを生成。

## 5. 実装上の注意
- 透明度はZ軸に応じて減衰させ、遠いエコーほど薄く表示。
- PC/iPadを主対象としつつiPhoneでも操作できるレスポンシブUI。
- リアルタイムモードとワンショットモードの切替によりパフォーマンスを調整。
- 初期モードはリアルタイム。
- 背景色は黒 (#000) とし、線描画を際立たせる。
