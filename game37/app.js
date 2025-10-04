class VideoEffectApp {
    constructor() {
        this.video = document.getElementById('video');
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.startBtn = document.getElementById('startBtn');
        this.recordIcon = document.getElementById('recordIcon');
        this.recordText = document.getElementById('recordText');
        this.downloadSection = document.getElementById('downloadSection');
        this.downloadLink = document.getElementById('downloadLink');
        this.errorMessage = document.getElementById('errorMessage');
        this.recordingIndicator = document.getElementById('recordingIndicator');
        this.recordingTime = document.getElementById('recordingTime');
        this.permissionModal = document.getElementById('permissionModal');
        this.requestPermissionBtn = document.getElementById('requestPermission');

        // 設定
        this.settings = {
            videoWidth: 640,
            videoHeight: 480,
            frameRate: 30,
            recordingMaxDuration: 30000,
            bufferSize: 60
        };

        // 状態管理
        this.currentEffect = 'none';
        this.isRecording = false;
        this.mediaRecorder = null;
        this.recordedChunks = [];
        this.frameBuffer = [];
        this.animationId = null;
        this.recordingStartTime = 0;
        this.recordingTimer = null;
        this.stream = null;
        
        this.init();
    }

    async init() {
        this.setupEventListeners();
        this.setupCanvas();
        this.showPermissionModal();
        
        // カメラが既に利用可能かチェック
        await this.checkCameraAvailability();
    }

    async checkCameraAvailability() {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const hasCamera = devices.some(device => device.kind === 'videoinput');
            
            if (!hasCamera) {
                this.showError('カメラデバイスが見つかりませんでした。');
                this.hidePermissionModal();
                return;
            }
        } catch (error) {
            console.log('デバイス列挙エラー:', error);
            // エラーでも続行（古いブラウザ対応）
        }
    }

    setupEventListeners() {
        // エフェクトボタン
        document.querySelectorAll('.effect-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.selectEffect(e.target.dataset.effect);
            });
        });

        // 録画ボタン
        this.startBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleRecording();
        });

        // 権限要求ボタン
        this.requestPermissionBtn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('カメラ権限ボタンがクリックされました');
            this.requestCameraPermission();
        });

        // モーダル外クリックで閉じる（テスト用）
        this.permissionModal.addEventListener('click', (e) => {
            if (e.target === this.permissionModal) {
                this.requestCameraPermission();
            }
        });
    }

    setupCanvas() {
        this.canvas.width = this.settings.videoWidth;
        this.canvas.height = this.settings.videoHeight;
        
        // キャンバスに初期メッセージを表示
        this.ctx.fillStyle = '#333';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '20px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('カメラの準備中...', this.canvas.width / 2, this.canvas.height / 2);
    }

    showPermissionModal() {
        this.permissionModal.classList.remove('hidden');
        console.log('許可モーダルを表示しました');
    }

    hidePermissionModal() {
        this.permissionModal.classList.add('hidden');
        console.log('許可モーダルを非表示にしました');
    }

    async requestCameraPermission() {
        console.log('カメラ権限要求を開始...');
        
        // ボタンを無効化して重複クリックを防止
        this.requestPermissionBtn.disabled = true;
        this.requestPermissionBtn.textContent = '接続中...';

        try {
            // MediaDevices APIの対応チェック
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error('このブラウザではカメラ機能がサポートされていません。');
            }

            console.log('getUserMediaを呼び出し中...');
            
            const constraints = {
                video: {
                    width: { ideal: this.settings.videoWidth },
                    height: { ideal: this.settings.videoHeight },
                    frameRate: { ideal: this.settings.frameRate },
                    facingMode: 'user'
                },
                audio: false
            };

            this.stream = await navigator.mediaDevices.getUserMedia(constraints);
            console.log('カメラストリームを取得しました:', this.stream);

            this.video.srcObject = this.stream;
            
            // ビデオが準備できるまで待つ
            await new Promise((resolve, reject) => {
                this.video.onloadedmetadata = () => {
                    console.log('ビデオメタデータが読み込まれました');
                    resolve();
                };
                this.video.onerror = (error) => {
                    console.error('ビデオエラー:', error);
                    reject(new Error('ビデオの読み込みに失敗しました'));
                };
                
                // タイムアウト設定
                setTimeout(() => {
                    reject(new Error('ビデオの読み込みがタイムアウトしました'));
                }, 10000);
            });

            // ビデオ再生開始
            await this.video.play();
            console.log('ビデオ再生を開始しました');

            // 映像処理開始
            this.startVideoProcessing();
            
            // モーダルを閉じる
            this.hidePermissionModal();
            this.hideError();
            
            console.log('カメラ初期化完了');

        } catch (error) {
            console.error('カメラアクセスエラー:', error);
            
            let errorMessage = 'カメラにアクセスできませんでした。';
            
            if (error.name === 'NotAllowedError') {
                errorMessage = 'カメラの使用が許可されていません。ブラウザの設定でカメラの使用を許可してください。';
            } else if (error.name === 'NotFoundError') {
                errorMessage = 'カメラデバイスが見つかりませんでした。';
            } else if (error.name === 'NotSupportedError') {
                errorMessage = 'このブラウザではカメラ機能がサポートされていません。';
            } else if (error.message) {
                errorMessage += ' エラー: ' + error.message;
            }
            
            this.showError(errorMessage);
            this.hidePermissionModal();
        } finally {
            // ボタンを元に戻す
            this.requestPermissionBtn.disabled = false;
            this.requestPermissionBtn.textContent = 'カメラを使用する';
        }
    }

    selectEffect(effectId) {
        // 前のボタンの active クラスを削除
        document.querySelectorAll('.effect-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        // 新しいボタンに active クラスを追加
        const selectedBtn = document.querySelector(`[data-effect="${effectId}"]`);
        if (selectedBtn) {
            selectedBtn.classList.add('active');
        }
        
        this.currentEffect = effectId;
        this.frameBuffer = []; // バッファをリセット
        console.log('エフェクトを変更しました:', effectId);
    }

    startVideoProcessing() {
        console.log('ビデオ処理を開始します');
        const processFrame = () => {
            if (this.video.readyState === this.video.HAVE_ENOUGH_DATA) {
                this.applyEffect();
            }
            this.animationId = requestAnimationFrame(processFrame);
        };
        processFrame();
    }

    applyEffect() {
        const ctx = this.ctx;
        const width = this.canvas.width;
        const height = this.canvas.height;

        // 現在のフレームをバッファに保存
        const currentFrame = document.createElement('canvas');
        currentFrame.width = width;
        currentFrame.height = height;
        const currentCtx = currentFrame.getContext('2d');
        currentCtx.drawImage(this.video, 0, 0, width, height);

        // バッファ管理
        this.frameBuffer.push(currentFrame);
        if (this.frameBuffer.length > this.settings.bufferSize) {
            this.frameBuffer.shift();
        }

        // キャンバスをクリア
        ctx.clearRect(0, 0, width, height);

        switch (this.currentEffect) {
            case 'none':
                this.applyNoneEffect();
                break;
            case 'delay-0.5':
                this.applyDelayEffect(0.5);
                break;
            case 'delay-1':
                this.applyDelayEffect(1);
                break;
            case 'delay-2':
                this.applyDelayEffect(2);
                break;
            case 'mirror':
                this.applyMirrorEffect();
                break;
            case 'half-mirror':
                this.applyHalfMirrorEffect();
                break;
            case 'timeslice':
                this.applyTimesliceEffect();
                break;
            case 'trail':
                this.applyTrailEffect();
                break;
            case 'rgb-delay':
                this.applyRGBDelayEffect();
                break;
        }
    }

    applyNoneEffect() {
        this.ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
    }

    applyDelayEffect(delaySec) {
        const frameIndex = Math.floor(this.settings.frameRate * delaySec);
        const delayedFrame = this.frameBuffer[this.frameBuffer.length - frameIndex - 1];
        
        // 現在のフレーム
        this.ctx.globalAlpha = 0.5;
        this.ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
        
        // 遅延フレーム
        if (delayedFrame) {
            this.ctx.globalAlpha = 0.5;
            this.ctx.drawImage(delayedFrame, 0, 0);
        }
        
        this.ctx.globalAlpha = 1.0;
    }

    applyMirrorEffect() {
        this.ctx.save();
        this.ctx.scale(-1, 1);
        this.ctx.drawImage(this.video, -this.canvas.width, 0, this.canvas.width, this.canvas.height);
        this.ctx.restore();
    }

    applyHalfMirrorEffect() {
        const halfWidth = this.canvas.width / 2;
        
        // 右半分（通常）
        this.ctx.drawImage(
            this.video, 
            halfWidth, 0, halfWidth, this.canvas.height,
            halfWidth, 0, halfWidth, this.canvas.height
        );
        
        // 左半分（ミラー）
        this.ctx.save();
        this.ctx.scale(-1, 1);
        this.ctx.drawImage(
            this.video,
            0, 0, halfWidth, this.canvas.height,
            -halfWidth, 0, halfWidth, this.canvas.height
        );
        this.ctx.restore();
    }

    applyTimesliceEffect() {
        const halfWidth = this.canvas.width / 2;
        const delayFrames = Math.floor(this.settings.frameRate * 0.5);
        const delayedFrame = this.frameBuffer[this.frameBuffer.length - delayFrames - 1];
        
        // 右半分（現在）
        this.ctx.drawImage(
            this.video,
            halfWidth, 0, halfWidth, this.canvas.height,
            halfWidth, 0, halfWidth, this.canvas.height
        );
        
        // 左半分（遅延）
        if (delayedFrame) {
            this.ctx.drawImage(
                delayedFrame,
                0, 0, halfWidth, this.canvas.height,
                0, 0, halfWidth, this.canvas.height
            );
        }
    }

    applyTrailEffect() {
        // 複数のフレームを透明度を変えて重ねる
        const trailFrames = Math.min(5, this.frameBuffer.length);
        
        for (let i = 0; i < trailFrames; i++) {
            const frame = this.frameBuffer[this.frameBuffer.length - 1 - i];
            const alpha = (trailFrames - i) / trailFrames * 0.3;
            this.ctx.globalAlpha = alpha;
            this.ctx.drawImage(frame, 0, 0);
        }
        
        // 現在のフレーム
        this.ctx.globalAlpha = 0.7;
        this.ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
        this.ctx.globalAlpha = 1.0;
    }

    applyRGBDelayEffect() {
        const redDelay = Math.floor(this.settings.frameRate * 0.2);
        const greenDelay = 0;
        const blueDelay = Math.floor(this.settings.frameRate * 0.4);

        // 現在のフレームのImageDataを取得
        this.ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
        const currentImageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const currentData = currentImageData.data;

        // 遅延フレームのImageDataを取得
        const redFrame = this.frameBuffer[this.frameBuffer.length - redDelay - 1];
        const blueFrame = this.frameBuffer[this.frameBuffer.length - blueDelay - 1];

        let redData = null, blueData = null;
        
        if (redFrame) {
            this.ctx.drawImage(redFrame, 0, 0);
            redData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height).data;
        }
        
        if (blueFrame) {
            this.ctx.drawImage(blueFrame, 0, 0);
            blueData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height).data;
        }

        // RGBチャンネルを合成
        const outputData = this.ctx.createImageData(this.canvas.width, this.canvas.height);
        
        for (let i = 0; i < currentData.length; i += 4) {
            outputData.data[i] = redData ? redData[i] : currentData[i];     // Red
            outputData.data[i + 1] = currentData[i + 1];                   // Green
            outputData.data[i + 2] = blueData ? blueData[i + 2] : currentData[i + 2]; // Blue
            outputData.data[i + 3] = 255;                                  // Alpha
        }

        this.ctx.putImageData(outputData, 0, 0);
    }

    async toggleRecording() {
        if (!this.stream) {
            this.showError('録画するにはまずカメラを有効にしてください。');
            return;
        }

        if (!this.isRecording) {
            await this.startRecording();
        } else {
            this.stopRecording();
        }
    }

    async startRecording() {
        try {
            // MediaRecorder対応チェック
            const supportedTypes = ['video/mp4', 'video/webm'];
            let selectedType = null;
            
            for (const type of supportedTypes) {
                if (MediaRecorder.isTypeSupported(type)) {
                    selectedType = type;
                    break;
                }
            }
            
            if (!selectedType) {
                throw new Error('録画機能がサポートされていません');
            }

            console.log('録画タイプ:', selectedType);

            // キャンバスからストリームを取得
            const canvasStream = this.canvas.captureStream(this.settings.frameRate);
            
            // MediaRecorderを初期化
            this.mediaRecorder = new MediaRecorder(canvasStream, {
                mimeType: selectedType,
                videoBitsPerSecond: 2500000
            });

            this.recordedChunks = [];

            this.mediaRecorder.ondataavailable = (event) => {
                console.log('録画データ受信:', event.data.size);
                if (event.data.size > 0) {
                    this.recordedChunks.push(event.data);
                }
            };

            this.mediaRecorder.onstop = () => {
                console.log('録画停止、ダウンロードリンク作成中...');
                this.createDownloadLink();
            };

            this.mediaRecorder.onerror = (event) => {
                console.error('MediaRecorder エラー:', event);
                this.showError('録画中にエラーが発生しました');
            };

            // 録画開始
            this.mediaRecorder.start(100); // 100msごとにデータを受信
            this.isRecording = true;
            this.updateRecordingUI();
            this.startRecordingTimer();

            console.log('録画開始');

            // 最大録画時間で自動停止
            setTimeout(() => {
                if (this.isRecording) {
                    console.log('最大録画時間に到達、自動停止');
                    this.stopRecording();
                }
            }, this.settings.recordingMaxDuration);

        } catch (error) {
            console.error('録画開始エラー:', error);
            this.showError('録画を開始できませんでした: ' + error.message);
        }
    }

    stopRecording() {
        if (this.mediaRecorder && this.isRecording) {
            this.mediaRecorder.stop();
            this.isRecording = false;
            this.updateRecordingUI();
            this.stopRecordingTimer();
            console.log('録画停止要求');
        }
    }

    updateRecordingUI() {
        if (this.isRecording) {
            this.startBtn.classList.add('recording');
            this.recordIcon.textContent = '■';
            this.recordText.textContent = '録画停止';
            this.recordingIndicator.style.display = 'flex';
            this.downloadSection.style.display = 'none';
        } else {
            this.startBtn.classList.remove('recording');
            this.recordIcon.textContent = '●';
            this.recordText.textContent = '録画開始';
            this.recordingIndicator.style.display = 'none';
        }
    }

    startRecordingTimer() {
        this.recordingStartTime = Date.now();
        this.recordingTimer = setInterval(() => {
            const elapsed = Date.now() - this.recordingStartTime;
            const minutes = Math.floor(elapsed / 60000);
            const seconds = Math.floor((elapsed % 60000) / 1000);
            this.recordingTime.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }, 1000);
    }

    stopRecordingTimer() {
        if (this.recordingTimer) {
            clearInterval(this.recordingTimer);
            this.recordingTimer = null;
        }
    }

    createDownloadLink() {
        if (this.recordedChunks.length > 0) {
            console.log('ダウンロードリンク作成:', this.recordedChunks.length, 'チャンク');
            
            const blob = new Blob(this.recordedChunks, { type: 'video/mp4' });
            const url = URL.createObjectURL(blob);
            
            this.downloadLink.href = url;
            this.downloadLink.download = `video-effect-${Date.now()}.mp4`;
            this.downloadSection.style.display = 'block';
            
            console.log('ダウンロードリンク準備完了');
            
            // メモリリークを防ぐため、クリック後にURLを解放
            this.downloadLink.addEventListener('click', () => {
                setTimeout(() => {
                    URL.revokeObjectURL(url);
                    console.log('URL解放完了');
                }, 1000);
            });
        } else {
            console.warn('録画データが空です');
            this.showError('録画データが空です。もう一度お試しください。');
        }
    }

    showError(message) {
        console.error('エラー表示:', message);
        this.errorMessage.textContent = message;
        this.errorMessage.style.display = 'block';
        
        // 5秒後に自動的にエラーを隠す
        setTimeout(() => {
            this.hideError();
        }, 5000);
    }

    hideError() {
        this.errorMessage.style.display = 'none';
    }
}

// アプリケーション初期化
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM読み込み完了、アプリ初期化中...');
    new VideoEffectApp();
});
