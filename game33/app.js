/**
 * 親子Canvas v3.2 - 双方向描画・UI最小化版
 * 重要機能: 双方向描画、重複防止、リアルタイム同期、イベント修正版
 */

class BidirectionalDrawingApp {
    constructor() {
        // デバイス・パフォーマンス設定
        this.deviceInfo = this.detectDevice();
        this.frameRate = this.deviceInfo.isIPhone ? 25 : 50; // v3.2: 双方向処理対応
        this.frameInterval = 1000 / this.frameRate;
        this.lastFrameTime = 0;
        
        // 描画状態
        this.drawingState = {
            isDrawingParent: false,
            isDrawingChild: false,
            tool: 'pen',
            color: '#000000',
            brushSize: 3,
            rotation: 180 // デフォルト180度
        };
        
        // Canvas要素とコンテキスト
        this.canvases = {};
        this.contexts = {};
        this.canvasInfo = {};
        
        // v3.2: 双方向描画管理
        this.strokeId = 0;
        this.drawnPoints = new Set(); // 重複防止
        this.currentStrokes = {
            parent: null,
            child: null
        };
        
        // 同期状態
        this.syncStatus = 'initializing';
        
        this.init();
    }
    
    /**
     * デバイス検出
     */
    detectDevice() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        const userAgent = navigator.userAgent;
        const dpr = window.devicePixelRatio || 1;
        
        const isIPhone = /iPhone/.test(userAgent);
        const isIPad = /iPad/.test(userAgent) || (/Macintosh/.test(userAgent) && 'ontouchend' in document);
        const isAndroid = /Android/.test(userAgent);
        const isMobile = width < 768 || isIPhone || isAndroid;
        const isLandscape = width > height;
        
        return {
            isIPhone, isIPad, isAndroid, isMobile, isLandscape,
            width, height, dpr,
            supportsPointerEvents: 'PointerEvent' in window,
            supportsTouchEvents: 'ontouchstart' in window
        };
    }
    
    /**
     * アプリケーション初期化
     */
    init() {
        console.log('親子Canvas v3.2 初期化開始 - 双方向描画版');
        
        this.setupCanvases();
        this.setupBidirectionalDrawing(); // v3.2: 双方向描画設定
        this.setupEventListeners();
        this.setupOrientationHandling();
        this.updateDebugInfo();
        
        this.syncStatus = 'ready';
        this.updateSyncStatus();
        
        console.log('v3.2 初期化完了 - 双方向描画対応');
    }
    
    /**
     * v3.2: HiDPI Canvas設定（共通関数）
     */
    setupHiDpiCanvas(canvas, targetWidth = null, targetHeight = null) {
        const dpr = window.devicePixelRatio || 1;
        const container = canvas.closest('.canvas-area');
        const rect = container.getBoundingClientRect();
        
        // コンテナの85%サイズを目標とする（ラベルとの余白確保）
        const cssWidth = targetWidth || Math.max(280, Math.floor(rect.width * 0.85));
        const cssHeight = targetHeight || Math.max(200, Math.floor(rect.height * 0.85));
        
        // 内部解像度（整数値）
        const bitmapWidth = Math.round(cssWidth * dpr);
        const bitmapHeight = Math.round(cssHeight * dpr);
        
        // サイズ更新（変更時のみ）
        if (canvas.width !== bitmapWidth || canvas.height !== bitmapHeight) {
            canvas.width = bitmapWidth;
            canvas.height = bitmapHeight;
        }
        
        canvas.style.width = `${cssWidth}px`;
        canvas.style.height = `${cssHeight}px`;
        
        // コンテキスト設定
        const ctx = canvas.getContext('2d');
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        // 背景塗りつぶし
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, cssWidth, cssHeight);
        
        const canvasInfo = { ctx, dpr, cssWidth, cssHeight, bitmapWidth, bitmapHeight };
        this.canvasInfo[canvas.id] = canvasInfo;
        this.contexts[canvas.id] = ctx;
        
        console.log(`Canvas設定完了 ${canvas.id}:`, `${cssWidth}×${cssHeight}@${dpr}x`);
        
        return canvasInfo;
    }
    
    /**
     * Canvas要素設定
     */
    setupCanvases() {
        const canvasIds = ['parent-canvas', 'child-canvas'];
        
        canvasIds.forEach(id => {
            const canvas = document.getElementById(id);
            if (canvas) {
                this.canvases[id] = canvas;
                this.setupHiDpiCanvas(canvas);
            }
        });
        
        // 親子同期
        this.synchronizeCanvasSizes();
    }
    
    /**
     * 親子Canvas同期
     */
    synchronizeCanvasSizes() {
        const parentInfo = this.canvasInfo['parent-canvas'];
        const childInfo = this.canvasInfo['child-canvas'];
        
        if (parentInfo && childInfo) {
            // より大きい方のサイズに統一
            const maxWidth = Math.max(parentInfo.cssWidth, childInfo.cssWidth);
            const maxHeight = Math.max(parentInfo.cssHeight, childInfo.cssHeight);
            
            this.setupHiDpiCanvas(this.canvases['parent-canvas'], maxWidth, maxHeight);
            this.setupHiDpiCanvas(this.canvases['child-canvas'], maxWidth, maxHeight);
            
            console.log('Canvas同期完了:', `${maxWidth}×${maxHeight}`);
        }
    }
    
    /**
     * v3.2: 双方向描画システム設定
     */
    setupBidirectionalDrawing() {
        const parentCanvas = this.canvases['parent-canvas'];
        const childCanvas = this.canvases['child-canvas'];
        
        if (!parentCanvas || !childCanvas) return;
        
        // 両方のCanvasに描画イベントを設定
        this.setupCanvasDrawing(parentCanvas, 'parent');
        this.setupCanvasDrawing(childCanvas, 'child');
        
        console.log('双方向描画システム設定完了');
    }
    
    /**
     * v3.2: Canvas描画イベント設定（修正版 - イベントバブリング防止）
     */
    setupCanvasDrawing(canvas, canvasRole) {
        // 重要: stopPropagation を追加してイベントバブリングを防止
        
        // Pointer Events対応
        if (this.deviceInfo.supportsPointerEvents) {
            canvas.addEventListener('pointerdown', (e) => {
                e.stopPropagation(); // バブリング防止
                this.handleDrawStart(e, canvasRole);
            });
            canvas.addEventListener('pointermove', (e) => {
                e.stopPropagation(); // バブリング防止
                this.handleDrawMove(e, canvasRole);
            });
            canvas.addEventListener('pointerup', (e) => {
                e.stopPropagation(); // バブリング防止
                this.handleDrawEnd(e, canvasRole);
            });
            canvas.addEventListener('pointercancel', (e) => {
                e.stopPropagation(); // バブリング防止
                this.handleDrawEnd(e, canvasRole);
            });
        }
        
        // Touch Events対応
        if (this.deviceInfo.supportsTouchEvents) {
            canvas.addEventListener('touchstart', (e) => {
                e.stopPropagation(); // バブリング防止
                this.handleTouchDraw(e, 'start', canvasRole);
            }, { passive: false });
            canvas.addEventListener('touchmove', (e) => {
                e.stopPropagation(); // バブリング防止
                this.handleTouchDraw(e, 'move', canvasRole);
            }, { passive: false });
            canvas.addEventListener('touchend', (e) => {
                e.stopPropagation(); // バブリング防止
                this.handleTouchDraw(e, 'end', canvasRole);
            });
        }
        
        // Mouse Events対応
        canvas.addEventListener('mousedown', (e) => {
            e.stopPropagation(); // バブリング防止
            this.handleDrawStart(e, canvasRole);
        });
        canvas.addEventListener('mousemove', (e) => {
            e.stopPropagation(); // バブリング防止
            this.handleDrawMove(e, canvasRole);
        });
        canvas.addEventListener('mouseup', (e) => {
            e.stopPropagation(); // バブリング防止
            this.handleDrawEnd(e, canvasRole);
        });
        canvas.addEventListener('mouseleave', (e) => {
            e.stopPropagation(); // バブリング防止
            this.handleDrawEnd(e, canvasRole);
        });
        
        canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            e.stopPropagation(); // バブリング防止
        });
        
        console.log(`Canvas描画イベント設定完了: ${canvasRole}`);
    }
    
    /**
     * v3.2: 描画開始（双方向対応）
     */
    handleDrawStart(e, sourceRole) {
        e.preventDefault();
        e.stopPropagation(); // 追加: バブリング防止
        
        // 描画状態設定
        if (sourceRole === 'parent') {
            this.drawingState.isDrawingParent = true;
        } else {
            this.drawingState.isDrawingChild = true;
        }
        
        // 新しいストロークID生成
        this.strokeId++;
        const strokeId = this.strokeId;
        
        const point = this.getCanvasPoint(e, sourceRole);
        const pressure = this.getInputPressure(e);
        
        this.startBidirectionalStroke(point, pressure, sourceRole, strokeId);
        
        // 視覚フィードバック
        this.updateCanvasAreaState(sourceRole, true);
        
        console.log(`描画開始 [${sourceRole}]:`, point, `stroke:${strokeId}`);
    }
    
    /**
     * v3.2: 描画継続（双方向対応）
     */
    handleDrawMove(e, sourceRole) {
        const isDrawing = sourceRole === 'parent' ? 
            this.drawingState.isDrawingParent : this.drawingState.isDrawingChild;
        
        if (!isDrawing) return;
        
        e.preventDefault();
        e.stopPropagation(); // 追加: バブリング防止
        
        // フレームレート制限
        const now = performance.now();
        if (now - this.lastFrameTime < this.frameInterval) return;
        
        const point = this.getCanvasPoint(e, sourceRole);
        const pressure = this.getInputPressure(e);
        
        this.continueBidirectionalStroke(point, pressure, sourceRole, this.strokeId);
        
        this.lastFrameTime = now;
    }
    
    /**
     * v3.2: 描画終了（双方向対応）
     */
    handleDrawEnd(e, sourceRole) {
        const isDrawing = sourceRole === 'parent' ? 
            this.drawingState.isDrawingParent : this.drawingState.isDrawingChild;
        
        if (!isDrawing) return;
        
        e.preventDefault();
        e.stopPropagation(); // 追加: バブリング防止
        
        // 描画状態リセット
        if (sourceRole === 'parent') {
            this.drawingState.isDrawingParent = false;
        } else {
            this.drawingState.isDrawingChild = false;
        }
        
        this.endBidirectionalStroke(sourceRole, this.strokeId);
        
        // 視覚フィードバック
        this.updateCanvasAreaState(sourceRole, false);
        
        console.log(`描画終了 [${sourceRole}]: stroke:${this.strokeId}`);
    }
    
    /**
     * v3.2: タッチ描画ハンドラ
     */
    handleTouchDraw(e, phase, sourceRole) {
        if (e.touches && e.touches.length !== 1) return;
        
        e.preventDefault();
        e.stopPropagation(); // 追加: バブリング防止
        
        const touch = e.touches ? e.touches[0] : e.changedTouches[0];
        
        const pointerEvent = {
            clientX: touch.clientX,
            clientY: touch.clientY,
            pointerType: 'touch',
            pressure: 0.5,
            preventDefault: () => e.preventDefault(),
            stopPropagation: () => e.stopPropagation()
        };
        
        switch (phase) {
            case 'start': this.handleDrawStart(pointerEvent, sourceRole); break;
            case 'move': this.handleDrawMove(pointerEvent, sourceRole); break;
            case 'end': this.handleDrawEnd(pointerEvent, sourceRole); break;
        }
    }
    
    /**
     * v3.2: 双方向ストローク開始
     */
    startBidirectionalStroke(point, pressure, sourceRole, strokeId) {
        // 発生元Canvas描画
        this.drawToCanvas(point, pressure, sourceRole, 'start');
        
        // 相手Canvas描画（座標変換）
        const targetRole = sourceRole === 'parent' ? 'child' : 'parent';
        const transformedPoint = this.transformCoordinate(point, this.drawingState.rotation, targetRole);
        
        if (this.preventDuplicateDrawing(strokeId, transformedPoint)) {
            this.drawToCanvas(transformedPoint, pressure, targetRole, 'start');
        }
        
        // 同期状態表示
        this.updateSyncStatus('updating');
        this.updateSyncIndicators(sourceRole, 'updating');
    }
    
    /**
     * v3.2: 双方向ストローク継続
     */
    continueBidirectionalStroke(point, pressure, sourceRole, strokeId) {
        // 発生元Canvas描画
        this.drawToCanvas(point, pressure, sourceRole, 'move');
        
        // 相手Canvas描画（座標変換）
        const targetRole = sourceRole === 'parent' ? 'child' : 'parent';
        const transformedPoint = this.transformCoordinate(point, this.drawingState.rotation, targetRole);
        
        if (this.preventDuplicateDrawing(strokeId, transformedPoint)) {
            this.drawToCanvas(transformedPoint, pressure, targetRole, 'move');
        }
    }
    
    /**
     * v3.2: 双方向ストローク終了
     */
    endBidirectionalStroke(sourceRole, strokeId) {
        // 重複防止データ削除（メモリリーク防止）
        setTimeout(() => {
            for (let key of this.drawnPoints) {
                if (key.startsWith(`${strokeId}-`)) {
                    this.drawnPoints.delete(key);
                }
            }
        }, 1000);
        
        // 同期完了
        this.updateSyncStatus('synchronized');
        this.updateSyncIndicators(sourceRole, 'synchronized');
    }
    
    /**
     * v3.2: Canvas描画実行
     */
    drawToCanvas(point, pressure, canvasRole, action) {
        const ctx = this.contexts[`${canvasRole}-canvas`];
        if (!ctx) return;
        
        this.setDrawingStyle(ctx, pressure);
        
        if (action === 'start') {
            ctx.beginPath();
            ctx.moveTo(point.x, point.y);
        } else if (action === 'move') {
            ctx.lineTo(point.x, point.y);
            ctx.stroke();
        }
    }
    
    /**
     * v3.2: 座標変換
     */
    transformCoordinate(point, rotationDegrees, targetRole) {
        const sourceInfo = this.canvasInfo[`${targetRole === 'parent' ? 'child' : 'parent'}-canvas`];
        const targetInfo = this.canvasInfo[`${targetRole}-canvas`];
        
        if (!sourceInfo || !targetInfo) return point;
        
        const { cssWidth, cssHeight } = sourceInfo;
        const centerX = cssWidth / 2;
        const centerY = cssHeight / 2;
        
        // 中心を原点とした座標
        let x = point.x - centerX;
        let y = point.y - centerY;
        
        // 回転変換
        const radian = (rotationDegrees * Math.PI) / 180;
        const cos = Math.cos(radian);
        const sin = Math.sin(radian);
        
        const rotatedX = x * cos - y * sin;
        const rotatedY = x * sin + y * cos;
        
        // 元の座標系に戻す
        return {
            x: Math.round(rotatedX + centerX),
            y: Math.round(rotatedY + centerY)
        };
    }
    
    /**
     * v3.2: 重複描画防止
     */
    preventDuplicateDrawing(strokeId, point) {
        const key = `${strokeId}-${Math.round(point.x)}-${Math.round(point.y)}`;
        
        if (this.drawnPoints.has(key)) {
            return false; // 重複
        }
        
        this.drawnPoints.add(key);
        return true; // 描画OK
    }
    
    /**
     * Canvas座標取得（修正版）
     */
    getCanvasPoint(e, canvasRole) {
        const canvas = this.canvases[`${canvasRole}-canvas`];
        if (!canvas) return { x: 0, y: 0 };
        
        const rect = canvas.getBoundingClientRect();
        const x = Math.round(e.clientX - rect.left);
        const y = Math.round(e.clientY - rect.top);
        
        return { x, y };
    }
    
    /**
     * 入力圧力取得
     */
    getInputPressure(e) {
        if (e.pointerType === 'pen' && e.pressure > 0) {
            return Math.max(0.1, Math.min(1.0, e.pressure));
        }
        
        if (e.pointerType === 'touch') {
            return 0.6;
        }
        
        return 0.5;
    }
    
    /**
     * 描画スタイル設定
     */
    setDrawingStyle(ctx, pressure) {
        if (this.drawingState.tool === 'eraser') {
            ctx.globalCompositeOperation = 'destination-out';
            ctx.lineWidth = this.drawingState.brushSize * 2.5;
            ctx.strokeStyle = 'rgba(0,0,0,1)';
        } else {
            ctx.globalCompositeOperation = 'source-over';
            ctx.strokeStyle = this.drawingState.color;
            
            const baseWidth = this.drawingState.brushSize;
            ctx.lineWidth = baseWidth * (0.3 + pressure * 0.7);
        }
    }
    
    /**
     * Canvas領域状態更新
     */
    updateCanvasAreaState(sourceRole, isDrawing) {
        const area = document.querySelector(`.${sourceRole}-area`);
        if (area) {
            area.classList.toggle('drawing', isDrawing);
        }
    }
    
    /**
     * 同期インジケーター更新
     */
    updateSyncIndicators(sourceRole, status) {
        const indicators = document.querySelectorAll('.sync-indicator');
        indicators.forEach(indicator => {
            indicator.classList.remove('updating', 'error');
            if (status === 'updating') {
                indicator.classList.add('updating');
            } else if (status === 'error') {
                indicator.classList.add('error');
            }
        });
    }
    
    /**
     * イベントリスナー設定
     */
    setupEventListeners() {
        // ペンツール
        const penTool = document.getElementById('pen-tool');
        if (penTool) {
            penTool.addEventListener('click', (e) => {
                e.stopPropagation();
                this.setTool('pen');
            });
        }
        
        // 消しゴムツール
        const eraserTool = document.getElementById('eraser-tool');
        if (eraserTool) {
            eraserTool.addEventListener('click', (e) => {
                e.stopPropagation();
                this.setTool('eraser');
            });
        }
        
        // 色選択
        const colorPicker = document.getElementById('color-picker');
        if (colorPicker) {
            colorPicker.addEventListener('change', (e) => {
                e.stopPropagation();
                this.setColor(e.target.value);
            });
        }
        
        // ブラシサイズ
        const brushSize = document.getElementById('brush-size');
        if (brushSize) {
            brushSize.addEventListener('input', (e) => {
                e.stopPropagation();
                this.setBrushSize(e.target.value);
            });
        }
        
        // 回転モード
        const rotationMode = document.getElementById('rotation-mode');
        if (rotationMode) {
            rotationMode.addEventListener('change', (e) => {
                e.stopPropagation();
                this.setRotation(parseInt(e.target.value));
            });
        }
        
        // 消去ボタン
        const clearBtn = document.getElementById('clear-btn');
        if (clearBtn) {
            clearBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.clearCanvas();
            });
        }
    }
    
    /**
     * 画面向き変更対応
     */
    setupOrientationHandling() {
        const handleOrientationChange = () => {
            setTimeout(() => {
                this.deviceInfo = this.detectDevice();
                this.updateDebugInfo();
                
                // Canvas再設定
                Object.values(this.canvases).forEach(canvas => {
                    this.setupHiDpiCanvas(canvas);
                });
                this.synchronizeCanvasSizes();
                
                console.log('画面向き変更対応完了 - v3.2');
            }, 150);
        };
        
        window.addEventListener('orientationchange', handleOrientationChange);
        window.addEventListener('resize', handleOrientationChange);
    }
    
    /**
     * ツール設定
     */
    setTool(tool) {
        this.drawingState.tool = tool;
        
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const activeBtn = document.getElementById(`${tool}-tool`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }
        
        console.log('ツール変更:', tool);
    }
    
    /**
     * 色設定
     */
    setColor(color) {
        this.drawingState.color = color;
        
        const colorPicker = document.getElementById('color-picker');
        if (colorPicker && colorPicker.value !== color) {
            colorPicker.value = color;
        }
        
        console.log('色変更:', color);
    }
    
    /**
     * ブラシサイズ設定
     */
    setBrushSize(size) {
        this.drawingState.brushSize = parseInt(size);
        
        const display = document.getElementById('brush-size-display');
        if (display) {
            display.textContent = size;
        }
        
        const slider = document.getElementById('brush-size');
        if (slider && slider.value != size) {
            slider.value = size;
        }
        
        console.log('ブラシサイズ変更:', size);
    }
    
    /**
     * 回転角度設定
     */
    setRotation(rotation) {
        this.drawingState.rotation = rotation;
        
        const select = document.getElementById('rotation-mode');
        if (select && select.value != rotation.toString()) {
            select.value = rotation.toString();
        }
        
        this.updateDebugInfo();
        
        console.log('回転角度変更:', rotation);
    }
    
    /**
     * Canvas消去
     */
    clearCanvas() {
        Object.entries(this.canvasInfo).forEach(([canvasId, info]) => {
            const ctx = info.ctx;
            
            ctx.clearRect(0, 0, info.cssWidth, info.cssHeight);
            
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, info.cssWidth, info.cssHeight);
        });
        
        // 重複防止データもクリア
        this.drawnPoints.clear();
        
        console.log('Canvas消去完了 - v3.2');
    }
    
    /**
     * 同期状態更新
     */
    updateSyncStatus(status = null) {
        if (status) {
            this.syncStatus = status;
        }
        
        const syncStatusEl = document.getElementById('sync-status');
        if (syncStatusEl) {
            const statusTexts = {
                'initializing': '準備中',
                'ready': '準備完了',
                'updating': '同期中',
                'synchronized': '双方向同期',
                'error': 'エラー'
            };
            syncStatusEl.textContent = statusTexts[this.syncStatus] || this.syncStatus;
        }
        
        // 視覚的状態表示
        const childArea = document.querySelector('.child-area');
        const parentArea = document.querySelector('.parent-area');
        
        if (childArea) {
            childArea.classList.toggle('syncing', this.syncStatus === 'updating');
        }
    }
    
    /**
     * デバッグ情報更新
     */
    updateDebugInfo() {
        const rotationDisplay = document.getElementById('rotation-display');
        if (rotationDisplay) {
            rotationDisplay.textContent = `${this.drawingState.rotation}°`;
        }
    }
}

// アプリケーション初期化
document.addEventListener('DOMContentLoaded', () => {
    try {
        const app = new BidirectionalDrawingApp();
        
        // グローバル参照（デバッグ用）
        window.drawingApp = app;
        
        console.log('親子Canvas v3.2 起動完了 - 双方向描画版（修正版）');
    } catch (error) {
        console.error('アプリケーション初期化エラー:', error);
        
        // エラー画面表示
        document.body.innerHTML = `
            <div style="display: flex; justify-content: center; align-items: center; height: 100vh; font-family: -apple-system, BlinkMacSystemFont, sans-serif;">
                <div style="text-align: center; padding: 32px; background: white; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                    <h2 style="color: #ef4444; margin: 0 0 16px 0;">アプリケーションエラー</h2>
                    <p style="margin: 0 0 8px 0;">v3.2の初期化に失敗しました。</p>
                    <p style="font-size: 14px; color: #666; margin: 0 0 16px 0;">ページを再読み込みしてお試しください。</p>
                    <button onclick="location.reload()" style="padding: 8px 16px; background: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px;">
                        再読み込み
                    </button>
                </div>
            </div>
        `;
    }
});