// 松尾芭蕉『奥の細道』の旅路マップアプリケーション

// 奥の細道の旅程データ
const BASHO_JOURNEY_DATA = {
    title: "松尾芭蕉『奥の細道』の旅路",
    period: "1689年5月16日 - 8月21日（98日間）",
    journeyData: [
        {
            name: "深川",
            date: "1689-05-16",
            lat: 35.6762,
            lng: 139.7969,
            haiku: "草の戸も住み替はる代ぞ雛の家",
            reading: "くさのとも すみかわるよぞ ひなのいえ",
            description: "芭蕉庵があった出発地。『奥の細道』の旅路の始まり。",
            context: "江戸深川は新開地で、多くの文人墨客が住んでいた地域。"
        },
        {
            name: "白河の関",
            date: "1689-06-06",
            lat: 37.1250,
            lng: 140.2167,
            haiku: "風流の初やおくの田植歌",
            reading: "ふうりゅうの はじめやおくの たうえうた",
            description: "奥州への入口となる重要な関所。本格的な旅の始まり。",
            context: "古来より歌枕として有名で、都から遠い「みちのく」への入口。"
        },
        {
            name: "平泉",
            date: "1689-06-29",
            lat: 39.0000,
            lng: 141.1167,
            haiku: "夏草や兵どもが夢の跡",
            reading: "なつくさや つわものどもが ゆめのあと",
            description: "奥州藤原氏の栄華の跡地。源義経の最期の地。",
            context: "平泉は奥州藤原氏三代の栄華の舞台で、芭蕉は栄枯盛衰の無常を感じた。"
        },
        {
            name: "立石寺（山寺）",
            date: "1689-07-13",
            lat: 38.3167,
            lng: 140.4333,
            haiku: "閑さや岩にしみ入る蝉の声",
            reading: "しずかさや いわにしみいる せみのこえ",
            description: "山形の名刹。1015段の石段を登り、静寂の中の蝉の声に感動。",
            context: "立石寺は慈覚大師円仁が開いた天台宗の古刹で、断崖絶壁に建つ。"
        },
        {
            name: "最上川",
            date: "1689-07-25",
            lat: 38.7500,
            lng: 140.1000,
            haiku: "五月雨をあつめて早し最上川",
            reading: "さみだれを あつめてはやし もがみがわ",
            description: "山形を流れる大河を舟で下る。梅雨の雨で増水した川の迫力。",
            context: "最上川は山形県を流れる一級河川で、当時は重要な交通路。"
        },
        {
            name: "象潟",
            date: "1689-08-01",
            lat: 39.2072,
            lng: 139.9089,
            haiku: "象潟や雨に西施がねぶの花",
            reading: "きさかたや あめにせいしが ねぶのはな",
            description: "旅の最北端。松島と並び称される景勝地。",
            context: "象潟は松島と並び称される景勝地で、芭蕉の時代は美しい潟湖だった。"
        },
        {
            name: "出雲崎",
            date: "1689-08-05",
            lat: 37.3500,
            lng: 138.7500,
            haiku: "荒海や佐渡によこたふ天河",
            reading: "あらうみや さどによこたう あまのがわ",
            description: "日本海に面した港町。佐渡島を望む海岸で天の川を詠む。",
            context: "出雲崎は佐渡金山の積出港として栄えた港町。"
        },
        {
            name: "大垣",
            date: "1689-08-21",
            lat: 35.3661,
            lng: 136.6183,
            haiku: "蛤のふたみにわかれ行秋ぞ",
            reading: "はまぐりの ふたみにわかれ ゆくあきぞ",
            description: "約2400キロの旅の終着点。約98日間の長旅の終わり。",
            context: "大垣は美濃国の城下町で、芭蕉の旅の終着点となった。"
        }
    ]
};

class BashoJourneyMap {
    constructor(data = BASHO_JOURNEY_DATA) {
        this.journeyData = data;
        this.currentIndex = 0;
        this.map = null;
        this.markers = [];
        this.currentMarker = null;
        this.journeyPath = null;
        this.autoAdjustEnabled = true; // デフォルトは自動調整ON
        
        this.init();
    }

    init() {
        try {
            this.validateData();
            this.initializeMap();
            this.setupUI();
            this.setupEventListeners();
            this.updateDisplay();
            console.log('松尾芭蕉『奥の細道』地図が正常に初期化されました');
        } catch (error) {
            console.error('初期化エラー:', error);
            this.showError('地図の初期化に失敗しました。');
        }
    }

    validateData() {
        if (!this.journeyData || !this.journeyData.journeyData || !Array.isArray(this.journeyData.journeyData)) {
            throw new Error('無効な旅行データです');
        }
        
        if (this.journeyData.journeyData.length === 0) {
            throw new Error('旅行地点が設定されていません');
        }

        // 各地点の必須データをチェック
        this.journeyData.journeyData.forEach((location, index) => {
            if (!location.name || typeof location.lat !== 'number' || typeof location.lng !== 'number') {
                throw new Error(`地点${index + 1}のデータが不完全です`);
            }
        });
    }

    initializeMap() {
        // 地図の初期化
        this.map = L.map('map').setView([37.5, 139.0], 6);

        // OpenStreetMapタイルレイヤーを追加
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.map);

        // マーカーを追加
        this.addMarkers();
        
        // 旅路を線で結ぶ
        this.drawJourneyPath();
        
        // 全ての地点を含む範囲を計算
        this.fitMapToBounds();
    }

    addMarkers() {
        this.journeyData.journeyData.forEach((location, index) => {
            // マーカーを作成
            const marker = L.circleMarker([location.lat, location.lng], {
                color: '#fff',
                fillColor: '#e74c3c',
                fillOpacity: 1,
                radius: 8,
                weight: 2
            })
            .addTo(this.map)
            .bindPopup(`<strong>${location.name}</strong><br>${location.date}`)
            .on('click', () => {
                this.selectLocation(index);
            });

            this.markers.push(marker);
        });
    }

    drawJourneyPath() {
        // 既存のパスがあれば削除
        if (this.journeyPath) {
            this.map.removeLayer(this.journeyPath);
        }
        
        // 旅路のポイントを収集
        const points = this.journeyData.journeyData.map(location => [location.lat, location.lng]);
        
        // 旅路を赤い線で結ぶ
        this.journeyPath = L.polyline(points, {
            color: '#e74c3c',
            weight: 3,
            opacity: 0.7,
            lineJoin: 'round'
        }).addTo(this.map);
    }

    fitMapToBounds() {
        const bounds = L.latLngBounds();
        this.journeyData.journeyData.forEach(location => {
            bounds.extend([location.lat, location.lng]);
        });
        this.map.fitBounds(bounds, { padding: [20, 20] });
    }

    setupUI() {
        // タイトルと期間を設定
        const titleElement = document.getElementById('journey-title');
        const periodElement = document.getElementById('journey-period');
        
        if (titleElement) titleElement.textContent = this.journeyData.title || '松尾芭蕉『奥の細道』の旅路';
        if (periodElement) {
            periodElement.textContent = this.journeyData.period || '1689年5月16日 - 8月21日（98日間）';
        }

        // タイムラインスライダーを設定
        const slider = document.getElementById('timeline-slider');
        if (slider) {
            slider.max = this.journeyData.journeyData.length - 1;
            slider.value = 0;
        }

        // 自動調整ボタンの初期状態を設定
        this.updateAutoAdjustButton();
    }

    setupEventListeners() {
        // タイムラインスライダー
        const slider = document.getElementById('timeline-slider');
        if (slider) {
            slider.addEventListener('input', (e) => {
                const index = parseInt(e.target.value);
                this.selectLocation(index);
            });
        }

        // コントロールボタン
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');
        const autoAdjustBtn = document.getElementById('auto-adjust-btn');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                this.previousLocation();
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                this.nextLocation();
            });
        }

        if (autoAdjustBtn) {
            autoAdjustBtn.addEventListener('click', () => {
                this.toggleAutoAdjust();
            });
        }

        // キーボードナビゲーション
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                this.previousLocation();
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                this.nextLocation();
            }
        });
    }

    toggleAutoAdjust() {
        this.autoAdjustEnabled = !this.autoAdjustEnabled;
        this.updateAutoAdjustButton();
    }

    updateAutoAdjustButton() {
        const autoAdjustBtn = document.getElementById('auto-adjust-btn');
        if (autoAdjustBtn) {
            if (this.autoAdjustEnabled) {
                autoAdjustBtn.textContent = '自動調整ON';
                autoAdjustBtn.classList.remove('disabled');
            } else {
                autoAdjustBtn.textContent = '自動調整OFF';
                autoAdjustBtn.classList.add('disabled');
            }
        }
    }

    selectLocation(index) {
        if (index < 0 || index >= this.journeyData.journeyData.length) {
            console.log(`無効なインデックス: ${index}`);
            return;
        }
        
        this.currentIndex = index;
        this.updateDisplay();
        this.updateMap();
        this.updateTimeline();
    }

    updateDisplay() {
        const location = this.journeyData.journeyData[this.currentIndex];
        
        // 要素の存在確認をしてから更新
        const elements = {
            'current-location': location.name,
            'current-date': location.date,
            'special-text': location.haiku || '特別な記録はありません',
            'special-reading': location.reading || '',
            'description-text': location.description || '詳細情報はありません',
            'context-text': location.context || '追加情報はありません',
            'location-counter': `${this.currentIndex + 1} / ${this.journeyData.journeyData.length}`,
            'progress-indicator': this.currentIndex === this.journeyData.journeyData.length - 1 ? '旅程完了' : '旅程進行中...'
        };

        Object.entries(elements).forEach(([id, text]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = text;
            }
        });
    }

    updateMap() {
        const location = this.journeyData.journeyData[this.currentIndex];
        
        // 現在位置マーカーを更新
        if (this.currentMarker) {
            this.map.removeLayer(this.currentMarker);
        }
        
        // 現在位置を示す特別なマーカーを作成
        this.currentMarker = L.circleMarker([location.lat, location.lng], {
            color: '#fff',
            fillColor: '#3498db',
            fillOpacity: 1,
            radius: 12,
            weight: 4
        }).addTo(this.map);
        
        // 自動調整が有効な場合、地図の中心と縮尺を移動
        if (this.autoAdjustEnabled) {
            this.map.setView([location.lat, location.lng], Math.max(this.map.getZoom(), 9), {
                animate: true,
                duration: 1
            });
        } else {
            // 自動調整が無効な場合は中心のみ移動し、縮尺は変更しない
            this.map.panTo([location.lat, location.lng], {
                animate: true,
                duration: 1
            });
        }
    }

    updateTimeline() {
        const slider = document.getElementById('timeline-slider');
        if (slider) {
            slider.value = this.currentIndex;
        }
    }

    previousLocation() {
        if (this.currentIndex > 0) {
            this.selectLocation(this.currentIndex - 1);
        }
    }

    nextLocation() {
        if (this.currentIndex < this.journeyData.journeyData.length - 1) {
            this.selectLocation(this.currentIndex + 1);
        }
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--color-error);
            color: white;
            padding: 16px;
            border-radius: 8px;
            z-index: 10000;
            max-width: 300px;
        `;
        errorDiv.textContent = message;
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            if (document.body.contains(errorDiv)) {
                document.body.removeChild(errorDiv);
            }
        }, 5000);
    }
}

// ページ読み込み完了時に初期化
document.addEventListener('DOMContentLoaded', () => {
    // グローバル変数として設定（外部から操作可能）
    window.bashoJourney = new BashoJourneyMap();
});