# 旅行地図テンプレート - データファイル

```javascript
// travel-data.js
// このファイルで旅行データを設定します

const TRAVEL_CONFIG = {
    // 旅行の基本情報
    title: "私の旅行記録",
    startDate: "2024年3月1日", 
    endDate: "2024年3月7日",
    
    // 旅程データ
    journey: [
        {
            name: "出発地",                    // 場所名（必須）
            date: "2024-03-01",               // 日付（YYYY-MM-DD形式、必須）
            lat: 35.6762,                     // 緯度（必須）
            lng: 139.6503,                    // 経度（必須）
            specialContent: "旅の始まり！",    // 特別な記録（俳句、コメント等）
            specialReading: "",               // 読み方（俳句の場合等）
            description: "東京駅から旅をスタート。天気は快晴で絶好の旅行日和でした。", // 説明文
            context: "東京の玄関口として多くの人が行き交う場所"  // 補足情報
        },
        {
            name: "富士山",
            date: "2024-03-02", 
            lat: 35.3606,
            lng: 138.7274,
            specialContent: "雲一つない富士山の絶景に感動",
            specialReading: "",
            description: "新幹線から見た富士山は本当に美しかった。写真をたくさん撮影。",
            context: "日本最高峰の山として古来より信仰の対象"
        },
        {
            name: "京都",
            date: "2024-03-03",
            lat: 35.0116,
            lng: 135.7681,
            specialContent: "",  // 特別な記録がない場合は空文字
            specialReading: "",
            description: "古都京都を散策。清水寺や金閣寺を訪問した。",
            context: "平安時代から続く日本の古都"
        },
        {
            name: "大阪",
            date: "2024-03-04",
            lat: 34.6937,
            lng: 135.5023,
            specialContent: "たこ焼きが絶品だった！",
            specialReading: "",
            description: "大阪城を見学後、道頓堀でグルメ三昧。関西の文化を満喫。",
            context: "天下の台所として栄えた商業都市"
        },
        {
            name: "広島",
            date: "2024-03-05",
            lat: 34.3853,
            lng: 132.4553,
            specialContent: "平和への願いを込めて",
            specialReading: "",
            description: "平和記念公園で平和について考える時間を持った。",
            context: "原爆被害を受けた平和都市として世界に知られる"
        },
        {
            name: "帰着地",
            date: "2024-03-07",
            lat: 35.6762,
            lng: 139.6503,
            specialContent: "無事に帰宅。素晴らしい旅だった",
            specialReading: "",
            description: "7日間の旅を終えて東京に戻る。たくさんの思い出ができました。",
            context: "旅の終わりは新たな始まり"
        }
    ]
};

// データの検証関数
function validateTravelData() {
    const errors = [];
    
    if (!TRAVEL_CONFIG.journey || TRAVEL_CONFIG.journey.length === 0) {
        errors.push("旅程データが空です");
        return errors;
    }
    
    TRAVEL_CONFIG.journey.forEach((location, index) => {
        if (!location.name) {
            errors.push(`地点${index + 1}: 場所名が必要です`);
        }
        if (!location.date) {
            errors.push(`地点${index + 1}: 日付が必要です`);
        }
        if (typeof location.lat !== 'number') {
            errors.push(`地点${index + 1}: 緯度が正しくありません`);
        }
        if (typeof location.lng !== 'number') {
            errors.push(`地点${index + 1}: 経度が正しくありません`);
        }
    });
    
    return errors;
}

// ページ読み込み時にデータを検証
document.addEventListener('DOMContentLoaded', function() {
    const errors = validateTravelData();
    if (errors.length > 0) {
        console.error('旅行データにエラーがあります:', errors);
        alert('旅行データにエラーがあります。コンソールを確認してください。');
    }
});
```