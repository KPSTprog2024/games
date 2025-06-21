# 旅行地図テンプレート - JavaScript (メイン機能)

```javascript
// travel-map.js
class TravelMap {
    constructor() {
        this.map = null;
        this.markers = [];
        this.polyline = null;
        this.currentMarker = null;
        this.journeyData = [];
        
        this.init();
    }

    // 初期化
    init() {
        this.loadTravelData();
        this.initializeMap();
        this.setupEventListeners();
        this.updateDisplay(0);
    }

    // 旅行データの読み込み
    loadTravelData() {
        // travel-data.jsから読み込み
        if (typeof TRAVEL_CONFIG !== 'undefined') {
            this.journeyData = TRAVEL_CONFIG.journey;
            this.updatePageTitle();
        } else {
            console.error('旅行データが見つかりません。travel-data.jsを確認してください。');
        }
    }

    // ページタイトルの更新
    updatePageTitle() {
        const config = TRAVEL_CONFIG;
        document.getElementById('travelTitle').textContent = config.title;
        document.getElementById('timelineLabel').textContent = 
            `旅程タイムライン（${config.startDate} - ${config.endDate}）`;
        document.title = config.title;
    }

    // 地図の初期化
    initializeMap() {
        // 地図の作成
        this.map = L.map('map').setView([35.6762, 139.6503], 6);
        
        // タイルレイヤーの追加
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.map);

        if (this.journeyData.length > 0) {
            this.addMarkersAndRoute();
            this.addCurrentPositionMarker();
            this.fitMapToBounds();
        }
    }

    // マーカーと経路の追加
    addMarkersAndRoute() {
        // 経路線の描画
        const coordinates = this.journeyData.map(location => [location.lat, location.lng]);
        this.polyline = L.polyline(coordinates, {
            color: '#e74c3c',
            weight: 3,
            opacity: 0.8
        }).addTo(this.map);

        // マーカーの追加
        this.journeyData.forEach((location, index) => {
            const markerIcon = this.createMarkerIcon(location);
            const marker = L.marker([location.lat, location.lng], { icon: markerIcon })
                .bindPopup(`<strong>${location.name}</strong><br>${location.date}`)
                .addTo(this.map);
            
            marker.on('click', () => this.selectLocation(index));
            this.markers.push(marker);
        });
    }

    // マーカーアイコンの作成
    createMarkerIcon(location) {
        const hasSpecialContent = location.specialContent && location.specialContent.trim() !== '';
        const color = hasSpecialContent ? '#e74c3c' : '#7f8c8d';
        
        return L.icon({
            iconUrl: 'data:image/svg+xml;base64,' + btoa(`
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}">
                    <circle cx="12" cy="12" r="8"/>
                    ${hasSpecialContent ? '<circle cx="12" cy="12" r="4" fill="white"/>' : ''}
                </svg>
            `),
            iconSize: [24, 24],
            iconAnchor: [12, 12]
        });
    }

    // 現在位置マーカーの追加
    addCurrentPositionMarker() {
        if (this.journeyData.length > 0) {
            this.currentMarker = L.marker([this.journeyData[0].lat, this.journeyData[0].lng], {
                icon: L.icon({
                    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#3498db">
                            <circle cx="12" cy="12" r="8"/>
                            <circle cx="12" cy="12" r="4" fill="white"/>
                        </svg>
                    `),
                    iconSize: [24, 24],
                    iconAnchor: [12, 12]
                })
            }).addTo(this.map);
        }
    }

    // 地図の表示範囲を調整
    fitMapToBounds() {
        if (this.polyline) {
            this.map.fitBounds(this.polyline.getBounds(), {padding: [20, 20]});
        }
    }

    // イベントリスナーの設定
    setupEventListeners() {
        const slider = document.getElementById('timelineSlider');
        slider.max = Math.max(0, this.journeyData.length - 1);
        
        slider.addEventListener('input', (e) => {
            const index = parseInt(e.target.value);
            this.selectLocation(index);
        });
    }

    // 場所の選択
    selectLocation(index) {
        if (index < 0 || index >= this.journeyData.length) return;
        
        const location = this.journeyData[index];
        
        // 現在位置マーカーの更新
        if (this.currentMarker) {
            this.currentMarker.setLatLng([location.lat, location.lng]);
        }
        
        // 地図の中心を移動
        this.map.setView([location.lat, location.lng], 8);
        
        // スライダーの更新
        document.getElementById('timelineSlider').value = index;
        
        // 表示の更新
        this.updateDisplay(index);
    }

    // 表示内容の更新
    updateDisplay(index) {
        const location = this.journeyData[index];
        if (!location) return;

        // 日付の更新
        document.getElementById('currentDate').textContent = this.formatDate(location.date);
        
        // 情報パネルの更新
        this.updateInfoPanel(location);
    }

    // 日付のフォーマット
    formatDate(dateString) {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        return `${year}年${month}月${day}日`;
    }

    // 情報パネルの更新
    updateInfoPanel(location) {
        const panel = document.getElementById('infoPanel');
        
        const specialSection = location.specialContent ? `
            <div class="special-section">
                <div class="special-text">${location.specialContent}</div>
                ${location.specialReading ? `<div class="special-reading">${location.specialReading}</div>` : ''}
            </div>
        ` : '<div class="no-special">特別な記録はありません</div>';

        panel.innerHTML = `
            <div class="location-info">
                <div class="location-name">${location.name}</div>
                ${specialSection}
                <div class="description">${location.description || ''}</div>
                ${location.context ? `
                <div class="historical-context">
                    <strong>補足情報：</strong> ${location.context}
                </div>
                ` : ''}
            </div>
        `;
    }
}

// ページ読み込み完了時に初期化
document.addEventListener('DOMContentLoaded', function() {
    new TravelMap();
});
```