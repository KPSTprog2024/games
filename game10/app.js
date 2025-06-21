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
            context: "江戸深川は新開地で、多くの文人墨客が住んでいた地域。",
            disciples: "曽良",
            climate: "春から夏へ向かう温暖な気候",
            historicalEvents: "江戸町人文化が発展し始めた頃"
        },
        {
            name: "白河の関",
            date: "1689-06-06",
            lat: 37.1250,
            lng: 140.2167,
            haiku: "風流の初やおくの田植歌",
            reading: "ふうりゅうの はじめやおくの たうえうた",
            description: "奥州への入口となる重要な関所。本格的な旅の始まり。",
            context: "古来より歌枕として有名で、都から遠い\u300cみちのく\u300dへの入口。",
            disciples: "曽良",
            climate: "初夏の爽やかな気候",
            historicalEvents: "関所として古くから機能していた"
        },
        {
            name: "平泉",
            date: "1689-06-29",
            lat: 39.0000,
            lng: 141.1167,
            haiku: "夏草や兵どもが夢の跡",
            reading: "なつくさや つわものどもが ゆめのあと",
            description: "奥州藤原氏の栄華の跡地。源義経の最期の地。",
            context: "平泉は奥州藤原氏三代の栄華の舞台で、芭蕉は栄枯盛衰の無常を感じた。",
            disciples: "曽良",
            climate: "梅雨期で湿潤",
            historicalEvents: "藤原氏滅亡から約500年後の姿"
        },
        {
            name: "立石寺（山寺）",
            date: "1689-07-13",
            lat: 38.3167,
            lng: 140.4333,
            haiku: "閑さや岩にしみ入る蝉の声",
            reading: "しずかさや いわにしみいる せみのこえ",
            description: "山形の名刹。1015段の石段を登り、静寂の中の蝉の声に感動。",
            context: "立石寺は慈覚大師円仁が開いた天台宗の古刹で、断崖絶壁に建つ。",
            disciples: "曽良",
            climate: "夏の暑さの中でも山間は涼しい",
            historicalEvents: "開基から約800年を迎えていた"
        },
        {
            name: "最上川",
            date: "1689-07-25",
            lat: 38.7500,
            lng: 140.1000,
            haiku: "五月雨をあつめて早し最上川",
            reading: "さみだれを あつめてはやし もがみがわ",
            description: "山形を流れる大河を舟で下る。梅雨の雨で増水した川の迫力。",
            context: "最上川は山形県を流れる一級河川で、当時は重要な交通路。",
            disciples: "曽良",
            climate: "梅雨明け間近で水量が多い",
            historicalEvents: "水運による商業が盛んだった"
        },
        {
            name: "象潟",
            date: "1689-08-01",
            lat: 39.2072,
            lng: 139.9089,
            haiku: "象潟や雨に西施がねぶの花",
            reading: "きさかたや あめにせいしが ねぶのはな",
            description: "旅の最北端。松島と並び称される景勝地。",
            context: "象潟は松島と並び称される景勝地で、芭蕉の時代は美しい潟湖だった。",
            disciples: "曽良",
            climate: "夏でも涼しい海風が吹く",
            historicalEvents: "後に地震で潟湖が陸地化"
        },
        {
            name: "出雲崎",
            date: "1689-08-05",
            lat: 37.3500,
            lng: 138.7500,
            haiku: "荒海や佐渡によこたふ天河",
            reading: "あらうみや さどによこたう あまのがわ",
            description: "日本海に面した港町。佐渡島を望む海岸で天の川を詠む。",
            context: "出雲崎は佐渡金山の積出港として栄えた港町。",
            disciples: "曽良",
            climate: "潮風が強い夏の海岸",
            historicalEvents: "北前船交易で賑わっていた"
        },
        {
            name: "大垣",
            date: "1689-08-21",
            lat: 35.3661,
            lng: 136.6183,
            haiku: "蛤のふたみにわかれ行秋ぞ",
            reading: "はまぐりの ふたみにわかれ ゆくあきぞ",
            description: "約2400キロの旅の終着点。約98日間の長旅の終わり。",
            context: "大垣は美濃国の城下町で、芭蕉の旅の終着点となった。",
            disciples: "曽良",
            climate: "夏の終わりで朝晩は涼しい",
            historicalEvents: "西国への交通の要衝として発展"
        }
    ]
};

class BashoJourneyMap {
    constructor(data = BASHO_JOURNEY_DATA) {
        this.journeyData = data;
        this.currentIndex = 0;
        this.map = null;
        this.tileLayer = null; // タイルレイヤーを保持する変数を追加
        this.markers = [];
        this.currentMarker = null;
        this.journeyPath = null;
        this.autoAdjustEnabled = true; // デフォルトは自動調整ON
        this.currentMapStyle = 'modern'; // デフォルトは現代地図
        
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
            this.loadModernInfo();
        }
    }
    
    loadModernInfo() {
        const location = this.journeyData.journeyData[this.currentIndex];
        const modernDescription = document.getElementById('modern-description');
        const modernImage = document.getElementById('modern-image');
        
        // 現代の情報（実際のアプリではAPIから取得するか、データを拡張する）
        const modernInfo = {
            '深川': {
                description: '現在の深川は東京都江東区に位置し、都市化が進んでいます。芭蕉の庵跡には記念碑が建てられています。',
                imageUrl: 'https://example.com/images/modern-fukagawa.jpg'
            },
            '白河の関': {
                description: '現在は福島県白河市にあり、関所跡が観光名所となっています。歴史公園として整備されています。',
                imageUrl: 'https://example.com/images/modern-shirakawa.jpg'
            },
            '平泉': {
                description: '現在の平泉は世界遺産に登録され、中尊寺金色堂など多くの文化財が保存されています。',
                imageUrl: 'https://example.com/images/modern-hiraizumi.jpg'
            },
            '立石寺（山寺）': {
                description: '現在も天台宗の寺院として機能し、山形県の主要な観光地となっています。芭蕉の句碑も建立されています。',
                imageUrl: 'https://example.com/images/modern-yamadera.jpg'
            },
            '最上川': {
                description: '現在も山形県の主要河川として流れ、観光船も運航しています。芭蕉の句碑が川沿いに建てられています。',
                imageUrl: 'https://example.com/images/modern-mogamigawa.jpg'
            },
            '象潟': {
                description: '1804年の地震で潟湖が陸地化しましたが、現在は芭蕉記念館があり、観光地となっています。',
                imageUrl: 'https://example.com/images/modern-kisakata.jpg'
            },
            '出雲崎': {
                description: '現在も日本海に面した町で、芭蕉の句碑が建てられています。夕日の名所としても知られています。',
                imageUrl: 'https://example.com/images/modern-izumozaki.jpg'
            },
            '大垣': {
                description: '現在の大垣市には芭蕉の句碑や記念館があり、奥の細道むすびの地として観光スポットになっています。',
                imageUrl: 'https://example.com/images/modern-ogaki.jpg'
            }
        };
        
        // 現代情報を表示（データがあれば）
        if (modernInfo[location.name]) {
            if (modernDescription) {
                modernDescription.textContent = modernInfo[location.name].description;
            }
            
            if (modernImage) {
                if (modernInfo[location.name].imageUrl) {
                    modernImage.innerHTML = ``;
                } else {
                    modernImage.innerHTML = '<div class="no-image">画像はありません</div>';
                }
            }
        } else {
            // データがない場合のデフォルトメッセージ
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
            } else {
                autoAdjustBtn.textContent = '自動調整OFF';
                autoAdjustBtn.classList.add('disabled');
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
                    'description-text': location.description || '詳細情報はありません',
                    'context-text': location.context || '追加情報はありません',
                    'disciples-text': location.disciples || '情報なし',
                    'climate-text': location.climate || '情報なし',
                    'historical-events-text': location.historicalEvents || '情報なし',
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
                
                // 進行状況バーを更新
                const progressBar = document.getElementById('journey-progress-bar');
                if (progressBar) {
                    const progress = ((this.currentIndex + 1) / this.journeyData.journeyData.length) * 100;
                    progressBar.style.width = `${progress}%`;
                }
                
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
