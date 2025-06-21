# 旅行地図テンプレート - 使い方ガイド

## 概要

このテンプレートは、松尾芭蕉の『奥の細道』アプリケーションをベースに作成された、汎用的な旅行計画・旅行記録用のインタラクティブ地図テンプレートです。

## 特徴

- **インタラクティブ地図**: OpenStreetMapを使用した詳細な地図表示
- **タイムライン機能**: スライダーで時系列に沿って旅程を追体験
- **レスポンシブデザイン**: PC・タブレット・スマートフォン対応
- **カスタマイズ可能**: データファイルを編集するだけで簡単にカスタマイズ
- **特別記録表示**: 各地点での思い出や印象的な出来事を記録・表示

## ファイル構成

```
travel-map/
├── index.html              # メインHTMLファイル
├── styles.css              # スタイルシート
├── travel-map.js          # メイン機能のJavaScript
├── travel-data.js         # 旅行データ設定ファイル
└── README.md              # このファイル
```

## セットアップ手順

### 1. ファイルの準備

1. `travel-map-template.html` を `index.html` にリネーム
2. `travel-map-styles.css` を `styles.css` にリネーム  
3. `travel-map-main.js` を `travel-map.js` にリネーム
4. `travel-data-template.js` を `travel-data.js` にリネーム

### 2. HTML ファイルの調整

`index.html` の `<head>` セクションで以下を確認：

```html
<title>旅行地図 - [あなたの旅行名]</title>
<link rel="stylesheet" href="styles.css">
```

`<body>` の最後で以下のスクリプト読み込みを確認：

```html
<script src="travel-data.js"></script>
<script src="travel-map.js"></script>
```

### 3. 旅行データの設定

`travel-data.js` ファイルを編集して、あなたの旅行データを設定します。

## データ設定ガイド

### 基本設定

```javascript
const TRAVEL_CONFIG = {
    title: "北海道一周の旅",           // 旅行のタイトル
    startDate: "2024年7月15日",       // 開始日
    endDate: "2024年7月22日",         // 終了日
    
    journey: [
        // 旅程データをここに記述
    ]
};
```

### 旅程データの形式

各地点は以下の形式で記述します：

```javascript
{
    name: "札幌",                     // 場所名（必須）
    date: "2024-07-15",               // 日付 YYYY-MM-DD形式（必須）
    lat: 43.0642,                     // 緯度（必須）
    lng: 141.3469,                    // 経度（必須）
    specialContent: "美味しいスープカレーを堪能！",  // 特別な記録（任意）
    specialReading: "",               // 読み方（俳句等の場合、任意）
    description: "北海道の玄関口札幌に到着。夜は薄野で海鮮料理を楽しんだ。", // 説明文（任意）
    context: "北海道最大の都市で人口約200万人"  // 補足情報（任意）
}
```

### 必須項目

- **name**: 場所名
- **date**: 訪問日（YYYY-MM-DD形式）
- **lat**: 緯度（数値）
- **lng**: 経度（数値）

### 任意項目

- **specialContent**: 特別な記録（印象的な出来事、俳句、感想等）
- **specialReading**: 読み方（俳句の読み等）
- **description**: その地点の詳細説明
- **context**: 歴史的背景や補足情報

## 座標の取得方法

地点の緯度・経度は以下の方法で取得できます：

### 1. Google Maps を使用

1. [Google Maps](https://maps.google.com) を開く
2. 目的地を検索
3. 地点を右クリック
4. 表示される座標をコピー

### 2. 座標検索サイトを使用

- [座標検索サイト](https://www.geocoding.jp/) 等を利用
- 住所から座標を変換

### 3. スマートフォンのGPS

- iPhoneの場合：「コンパス」アプリで現在地の座標を確認
- Androidの場合：GPS座標アプリを使用

## カスタマイズ

### テーマカラーの変更

`styles.css` の以下の部分を編集：

```css
:root {
    --color-primary: #e74c3c;      /* メインカラー */
    --color-secondary: #3498db;    /* サブカラー */
    --color-background: #f0f4f8;   /* 背景色 */
}
```

### マーカーの色変更

`travel-map.js` の `createMarkerIcon` メソッド内：

```javascript
const color = hasSpecialContent ? '#e74c3c' : '#7f8c8d';
```

## 使用例

### 家族旅行の記録

```javascript
const TRAVEL_CONFIG = {
    title: "家族で行く沖縄旅行",
    startDate: "2024年8月10日",
    endDate: "2024年8月14日",
    journey: [
        {
            name: "那覇空港",
            date: "2024-08-10",
            lat: 26.1958,
            lng: 127.6458,
            specialContent: "沖縄到着！青い海が見えた瞬間の感動",
            description: "羽田から2時間半のフライトで沖縄に到着。",
            context: "沖縄県の空の玄関口"
        }
        // ...他の地点
    ]
};
```

### ビジネス出張の記録

```javascript
const TRAVEL_CONFIG = {
    title: "関西出張記録",
    startDate: "2024年6月3日", 
    endDate: "2024年6月5日",
    journey: [
        {
            name: "大阪本社",
            date: "2024-06-03",
            lat: 34.6937,
            lng: 135.5023,
            specialContent: "プレゼンテーション成功！",
            description: "四半期の売上報告と来期の戦略について議論。",
            context: "関西エリアの拠点オフィス"
        }
        // ...他の地点
    ]
};
```

## トラブルシューティング

### 地図が表示されない

1. インターネット接続を確認
2. ブラウザのコンソールでエラーメッセージを確認
3. `travel-data.js` の構文エラーをチェック

### データが表示されない

1. `TRAVEL_CONFIG` オブジェクトの構文を確認
2. 必須項目（name, date, lat, lng）がすべて設定されているか確認
3. 座標が正しい数値形式か確認

### レイアウトが崩れる

1. `styles.css` が正しく読み込まれているか確認
2. ブラウザのキャッシュをクリア
3. 異なるブラウザで表示確認

## ライセンス

このテンプレートは自由に使用・改変していただけます。

- **地図データ**: © OpenStreetMap contributors
- **地図ライブラリ**: Leaflet.js (BSD 2-Clause License)

## サポート

不明な点やバグを発見した場合は：

1. ブラウザのコンソールでエラーメッセージを確認
2. データファイルの形式を再確認
3. サンプルデータで動作するか確認

## 更新履歴

- **v1.0** (2024年6月): 初回リリース
  - 基本的なインタラクティブ地図機能
  - タイムライン機能
  - レスポンシブデザイン対応