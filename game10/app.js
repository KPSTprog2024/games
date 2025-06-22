// 松尾芭蕉『奥の細道』の旅路マップアプリケーション

// 旅程データは外部JSONから読み込む

class BashoJourneyMap {
    constructor(data) {
        this.journeyData = data;
        this.currentIndex = 0;
        this.map = null;
        this.tileLayer = null; // タイルレイヤーを保持する変数を追加
        this.markers = [];
        this.currentMarker = null;
        this.journeyPath = null;
        this.autoAdjustEnabled = true; // デフォルトは自動調整ON
        this.currentMapStyle = 'modern'; // デフォルトは現代地図
        this.modernInfoData = null; // 現代情報のキャッシュ
        
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
        this.tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
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
            // カスタムアイコンを作成
            const customIcon = L.divIcon({
                className: 'custom-marker',
                html: `<span>${index + 1}</span>`,
                iconSize: [24, 24]
            });
            
            // マーカーを作成
            const marker = L.marker([location.lat, location.lng], {
                icon: customIcon
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
        
        // 地図スタイルボタンの初期状態を設定
        const toggleMapBtn = document.getElementById('toggle-map-style');
        if (toggleMapBtn) {
            toggleMapBtn.textContent = '古地図風に変更';
        }
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
        const toggleMapBtn = document.getElementById('toggle-map-style');
        const readHaikuBtn = document.getElementById('read-haiku');
        
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
        
        if (toggleMapBtn) {
            toggleMapBtn.addEventListener('click', () => {
                this.toggleMapStyle();
            });
        }
        
        if (readHaikuBtn) {
            readHaikuBtn.addEventListener('click', () => {
                this.readHaikuAloud();
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
        
        // タブ切り替え
        const tabBtns = document.querySelectorAll('.tab-btn');
        if (tabBtns.length > 0) {
            tabBtns.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const tabId = e.target.dataset.tab;
                    this.switchTab(tabId);
                });
            });
        }
        
        // タッチジェスチャーサポート
        this.setupTouchGestures();
    }
    
    setupTouchGestures() {
        const infoPanel = document.querySelector('.info-panel');
        if (!infoPanel) return;
        
        let touchStartX = 0;
        let touchEndX = 0;
        
        infoPanel.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        });
        
        infoPanel.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe(touchStartX, touchEndX);
        });
    }
    
    handleSwipe(startX, endX) {
        const swipeThreshold = 50; // スワイプと判定する最小ピクセル数
        
        if (startX - endX > swipeThreshold) {
            // 左スワイプ -> 次へ
            this.nextLocation();
        } else if (endX - startX > swipeThreshold) {
            // 右スワイプ -> 前へ
            this.previousLocation();
        }
    }
    
    switchTab(tabId) {
        // タブボタンのアクティブ状態を切り替え
        const tabBtns = document.querySelectorAll('.tab-btn');
        tabBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabId);
        });
        
        // タブコンテンツの表示を切り替え
        const tabContents = document.querySelectorAll('.tab-content');
        tabContents.forEach(content => {
            content.classList.toggle('active', content.id === `${tabId}-content`);
        });
        
        // 現代タブが選択された場合、現代情報を読み込む
        if (tabId === 'modern') {
            // モダン情報は非同期で読み込む
            this.loadModernInfo();
        }
    }

    async loadModernInfo() {
        const location = this.journeyData.journeyData[this.currentIndex];
        const modernDescription = document.getElementById('modern-description');
        const modernImage = document.getElementById('modern-image');
        
        // modern-info.json を初回のみ取得
        try {
            if (!this.modernInfoData) {
                const response = await fetch('./modern-info.json');
                if (!response.ok) {
                    throw new Error('modern-info.json の読み込みに失敗しました');
                }

                const clone = response.clone();
                try {
                    this.modernInfoData = await response.json();
                } catch (err) {
                    const text = await clone.text();
                    throw new Error(`modern-info.json の JSON 解析に失敗しました: ${text}`);
                }
            }
        } catch (err) {
            console.error('現代情報取得エラー:', err);
            this.showError('現代情報の取得に失敗しました。');

            if (modernDescription) {
                modernDescription.textContent = '現代の詳細情報は取得できませんでした。';
            }

            if (modernImage) {
                modernImage.innerHTML = '<div class="no-image">画像はありません</div>';
            }
            return;
        }

        const info = this.modernInfoData[location.name];

        if (info) {
            if (modernDescription) {
                modernDescription.textContent = info.description;
            }

            if (modernImage) {
                if (info.imageUrl) {
                    modernImage.innerHTML = `<img src="${info.imageUrl}" alt="${location.name} の現代の様子">`;
                } else {
                    modernImage.innerHTML = '<div class="no-image">画像はありません</div>';
                }
            }
        } else {
            if (modernDescription) {
                modernDescription.textContent = '現代の詳細情報は準備中です。';
            }

            if (modernImage) {
                modernImage.innerHTML = '<div class="no-image">画像は準備中です</div>';
            }
        }
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
                autoAdjustBtn.setAttribute('aria-label', '自動調整ON');
            } else {
                autoAdjustBtn.textContent = '自動調整OFF';
                autoAdjustBtn.classList.add('disabled');
                autoAdjustBtn.setAttribute('aria-label', '自動調整OFF');
            }
        }
    }
    
    toggleMapStyle() {
        const toggleMapBtn = document.getElementById('toggle-map-style');
        
        // スタイルを切り替え
        if (this.currentMapStyle === 'modern') {
            // 古地図スタイルに変更
            this.map.removeLayer(this.tileLayer);
            
            // 古地図風のタイルレイヤー
            this.tileLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                className: 'map-tiles-sepia' // CSSで古い雰囲気を出す
            }).addTo(this.map);
            
            this.currentMapStyle = 'historical';
            if (toggleMapBtn) {
                toggleMapBtn.textContent = '現代地図に戻す';
                toggleMapBtn.classList.add('historical');
                toggleMapBtn.setAttribute('aria-label', '現代地図に戻す');
            }
        } else {
            // 現代地図スタイルに変更
            this.map.removeLayer(this.tileLayer);
            this.tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(this.map);
            
            this.currentMapStyle = 'modern';
            if (toggleMapBtn) {
                toggleMapBtn.textContent = '古地図風に変更';
                toggleMapBtn.classList.remove('historical');
                toggleMapBtn.setAttribute('aria-label', '古地図風に変更');
            }
        }
    }
    
    readHaikuAloud() {
        const location = this.journeyData.journeyData[this.currentIndex];
        const haiku = location.reading || location.haiku;
        
        if (haiku && window.speechSynthesis) {
            // 読み上げ中のボタンの状態を変更
            const readHaikuBtn = document.getElementById('read-haiku');
            if (readHaikuBtn) {
                readHaikuBtn.disabled = true;
                readHaikuBtn.innerHTML = '<span class="icon">🔊</span> 読み上げ中...';
            }
            
            const utterance = new SpeechSynthesisUtterance(haiku);
            utterance.lang = 'ja-JP';
            
            // 読み上げ完了時の処理
            utterance.onend = () => {
                if (readHaikuBtn) {
                    readHaikuBtn.disabled = false;
                    readHaikuBtn.innerHTML = '<span class="icon">🔊</span> 俳句を聞く';
                }
            };
            
            window.speechSynthesis.speak(utterance);
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
        const locationDetails = document.querySelector('.location-details');
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');
        const slider = document.getElementById('timeline-slider');

        if (prevBtn) {
            if (this.currentIndex > 0) {
                const prevName = this.journeyData.journeyData[this.currentIndex - 1].name;
                prevBtn.setAttribute('aria-label', `前へ: ${prevName}`);
            } else {
                prevBtn.setAttribute('aria-label', '前の地点はありません');
            }
        }

        if (nextBtn) {
            if (this.currentIndex < this.journeyData.journeyData.length - 1) {
                const nextName = this.journeyData.journeyData[this.currentIndex + 1].name;
                nextBtn.setAttribute('aria-label', `次へ: ${nextName}`);
            } else {
                nextBtn.setAttribute('aria-label', '次の地点はありません');
            }
        }

        if (slider) {
            slider.setAttribute('aria-valuenow', this.currentIndex);
            slider.setAttribute('aria-valuetext', location.name);
        }
        
        // フェードアウト
        if (locationDetails) {
            locationDetails.classList.add('fade-out');
            
            // アニメーション完了後に内容を更新してフェードイン
            setTimeout(() => {
                // 要素の存在確認をしてから更新
                const elements = {
                    'current-location': location.name,
                    'current-date': location.date,
                    'special-text': location.haiku || '特別な記録はありません',
                    'special-reading': location.reading || '',
                    'scene-summary-text': location.sceneSummary || '情報なし',
                    'background-info-text': location.backgroundInfo || '情報なし',
                    'location-counter': `${this.currentIndex + 1} / ${this.journeyData.journeyData.length}`,
                    'progress-indicator': this.currentIndex === this.journeyData.journeyData.length - 1 ? '旅程完了' : '旅程進行中...'
                };

                Object.entries(elements).forEach(([id, text]) => {
                    const element = document.getElementById(id);
                    if (element) {
                        element.textContent = text;
                    }
                });
                
                // 季節感を表現
                this.updateSeasonIndicator(location.date);
                
                // フェードイン
                locationDetails.classList.remove('fade-out');
                locationDetails.classList.add('fade-in');
                
                // アニメーション完了後にクラスを削除
                setTimeout(() => {
                    locationDetails.classList.remove('fade-in');
                }, 800);
            }, 300);
        }
    }
    
    updateSeasonIndicator(dateString) {
        const seasonElement = document.getElementById('season-indicator');
        if (!seasonElement || !dateString) return;
        
        const date = new Date(dateString);
        const month = date.getMonth() + 1;
        let season = '';
        let seasonIcon = '';
        let seasonClass = '';
        
        if (month >= 3 && month <= 5) {
            season = '春';
            seasonIcon = '🌸';
            seasonClass = 'season-spring';
        } else if (month >= 6 && month <= 8) {
            season = '夏';
            seasonIcon = '☀️';
            seasonClass = 'season-summer';
        } else if (month >= 9 && month <= 11) {
            season = '秋';
            seasonIcon = '🍁';
            seasonClass = 'season-autumn';
        } else {
            season = '冬';
            seasonIcon = '❄️';
            seasonClass = 'season-winter';
        }
        
        seasonElement.textContent = `${seasonIcon} ${season}の旅`;
        
        // クラスをリセットして新しいクラスを追加
        seasonElement.className = 'season-indicator';
        seasonElement.classList.add(seasonClass);
    }

    updateMap() {
        const location = this.journeyData.journeyData[this.currentIndex];
        
        // 現在位置マーカーを更新
        if (this.currentMarker) {
            this.map.removeLayer(this.currentMarker);
        }
        
        // 現在位置を示す特別なマーカーを作成
        const currentIcon = L.divIcon({
            className: 'custom-marker current-marker pulse',
            html: `<span>${this.currentIndex + 1}</span>`,
            iconSize: [32, 32]
        });
        
        this.currentMarker = L.marker([location.lat, location.lng], {
            icon: currentIcon
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
            slider.setAttribute('aria-valuenow', this.currentIndex);
            const location = this.journeyData.journeyData[this.currentIndex];
            if (location && location.name) {
                slider.setAttribute('aria-valuetext', location.name);
            }
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

async function loadJourneyData() {
    const response = await fetch('./journey-data.json');
    if (!response.ok) {
        throw new Error('journey-data.json の読み込みに失敗しました');
    }
    const clone = response.clone();
    try {
        return await response.json();
    } catch (err) {
        const text = await clone.text();
        throw new Error(`journey-data.json の JSON 解析に失敗しました: ${text}`);

    }
}

function showError(message) {
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

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const data = await loadJourneyData();
        new BashoJourneyMap(data);
    } catch (err) {
        console.error('旅程データの取得に失敗しました', err);
        showError(err.message);
        // ページを再読み込みして再試行することを推奨
    }
});
