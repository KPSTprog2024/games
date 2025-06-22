# ゲーム仕様書: game10

## 概要
松尾芭蕉の『奥の細道』を巡る旅程を地図上で再現するウェブアプリです。Leaflet を用いて地点のマーカー表示やルート描画を行い、旅の各地点に関する俳句や背景情報を閲覧できます。

## 主な機能
- Leaflet を利用したインタラクティブな地図表示
- `config.json` で指定された JSON を読み込みマーカーとルートを生成
- 場所ごとの俳句・情景概要・背景情報を表示するタブ付きパネル

- 次／前ボタンとスライダーによる地点移動
- 自動調整のオン／オフや古地図風スタイルへの切り替え
- キーボード操作・タッチジェスチャー対応、俳句の読み上げ機能

## 必要アセット
- `index.html` ― メインページ。Leaflet の CSS/JS を CDN から読み込みます【F:game10/index.html†L7-L15】【F:game10/index.html†L91-L92】
- `style.css` ― 画面レイアウトとデザインを定義
- `app.js` ― `BashoJourneyMap` クラスにより地図機能を実装【F:game10/app.js†L1-L19】
- `config.json` ― 読み込む旅程データのパスを記述
- `journey-data.json` ― 旅程データ

## 実行手順
1. `game10` ディレクトリを含む場所で簡易サーバーを起動します。例：
   ```bash
   python3 -m http.server
   ```
2. ブラウザで `http://localhost:8000/game10/` を開きます。

## ビルド手順
スタイルを Sass で編集する場合は以下のようにコンパイルします。
```bash
sass style.scss style.css
```
(本リポジトリには Sass ファイルは含まれていませんが、カスタマイズ時の参考として記載します。)

## 外部ライブラリ・素材
- [Leaflet](https://leafletjs.com/) ― BSD 2-Clause License の地図ライブラリ
- [OpenStreetMap](https://www.openstreetmap.org/) ― 地図タイル提供元
